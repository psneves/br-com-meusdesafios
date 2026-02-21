const GEOHASH_BASE32 = "0123456789bcdefghjkmnpqrstuvwxyz";
const GEOHASH_MAP = new Map(GEOHASH_BASE32.split("").map((char, idx) => [char, idx]));

export const LOCATION_CELL_PRECISION = 5;
export const LOCATION_CELL_APPROX_KM = 5;

interface GeohashBounds {
  minLat: number;
  maxLat: number;
  minLon: number;
  maxLon: number;
}

export interface DecodedGeohash {
  latitude: number;
  longitude: number;
  latError: number;
  lonError: number;
  bounds: GeohashBounds;
}

function normalizeLongitude(value: number): number {
  let lon = value;
  while (lon < -180) lon += 360;
  while (lon >= 180) lon -= 360;
  return lon;
}

function clampLatitude(value: number): number {
  return Math.max(-90, Math.min(90, value));
}

function earthDistanceKm(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  const toRad = (deg: number) => (deg * Math.PI) / 180;
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) *
      Math.sin(dLon / 2) * Math.sin(dLon / 2);

  return 6371 * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

export function isValidGeohash(value: string, precision?: number): boolean {
  const candidate = value.trim().toLowerCase();
  if (!candidate) return false;
  if (precision != null && candidate.length !== precision) return false;
  return [...candidate].every((char) => GEOHASH_MAP.has(char));
}

export function normalizeCellId(
  value: string,
  precision = LOCATION_CELL_PRECISION
): string | null {
  const candidate = value.trim().toLowerCase();
  if (!isValidGeohash(candidate, precision)) return null;
  return candidate;
}

export function encodeGeohash(
  latitude: number,
  longitude: number,
  precision = LOCATION_CELL_PRECISION
): string {
  let latMin = -90;
  let latMax = 90;
  let lonMin = -180;
  let lonMax = 180;

  const lat = clampLatitude(latitude);
  const lon = normalizeLongitude(longitude);

  let hash = "";
  let bit = 0;
  let ch = 0;
  let even = true;

  while (hash.length < precision) {
    if (even) {
      const mid = (lonMin + lonMax) / 2;
      if (lon >= mid) {
        ch = (ch << 1) | 1;
        lonMin = mid;
      } else {
        ch <<= 1;
        lonMax = mid;
      }
    } else {
      const mid = (latMin + latMax) / 2;
      if (lat >= mid) {
        ch = (ch << 1) | 1;
        latMin = mid;
      } else {
        ch <<= 1;
        latMax = mid;
      }
    }

    even = !even;
    bit += 1;

    if (bit === 5) {
      hash += GEOHASH_BASE32[ch];
      bit = 0;
      ch = 0;
    }
  }

  return hash;
}

export function decodeGeohash(hash: string): DecodedGeohash {
  if (!isValidGeohash(hash)) {
    throw new Error("Invalid geohash");
  }

  let latMin = -90;
  let latMax = 90;
  let lonMin = -180;
  let lonMax = 180;
  let even = true;

  for (const char of hash.toLowerCase()) {
    const value = GEOHASH_MAP.get(char);
    if (value == null) {
      throw new Error("Invalid geohash character");
    }

    for (let mask = 16; mask > 0; mask >>= 1) {
      const bit = (value & mask) !== 0;
      if (even) {
        const mid = (lonMin + lonMax) / 2;
        if (bit) {
          lonMin = mid;
        } else {
          lonMax = mid;
        }
      } else {
        const mid = (latMin + latMax) / 2;
        if (bit) {
          latMin = mid;
        } else {
          latMax = mid;
        }
      }
      even = !even;
    }
  }

  return {
    latitude: (latMin + latMax) / 2,
    longitude: (lonMin + lonMax) / 2,
    latError: (latMax - latMin) / 2,
    lonError: (lonMax - lonMin) / 2,
    bounds: {
      minLat: latMin,
      maxLat: latMax,
      minLon: lonMin,
      maxLon: lonMax,
    },
  };
}

function approximateCellKm(cellId: string): { latKm: number; lonKm: number; diagonalKm: number } {
  const decoded = decodeGeohash(cellId);
  const latDelta = decoded.bounds.maxLat - decoded.bounds.minLat;
  const lonDelta = decoded.bounds.maxLon - decoded.bounds.minLon;
  const latKm = latDelta * 111.32;
  const lonKm = lonDelta * 111.32 * Math.max(0.01, Math.cos((decoded.latitude * Math.PI) / 180));
  const diagonalKm = Math.sqrt(latKm * latKm + lonKm * lonKm);
  return { latKm, lonKm, diagonalKm };
}

export function getCellsWithinRadius(
  centerCellId: string,
  radiusKm: number,
  precision = LOCATION_CELL_PRECISION
): string[] {
  const normalized = normalizeCellId(centerCellId, precision);
  if (!normalized) {
    throw new Error("Invalid center cell id");
  }

  if (radiusKm <= 0) {
    return [normalized];
  }

  const center = decodeGeohash(normalized);
  const latStep = center.bounds.maxLat - center.bounds.minLat;
  const lonStep = center.bounds.maxLon - center.bounds.minLon;

  const { latKm, lonKm, diagonalKm } = approximateCellKm(normalized);
  const latCells = Math.max(1, Math.ceil(radiusKm / Math.max(0.5, latKm)) + 1);
  const lonCells = Math.max(1, Math.ceil(radiusKm / Math.max(0.5, lonKm)) + 1);

  const bufferKm = diagonalKm / 2;
  const cells = new Set<string>([normalized]);

  for (let latIdx = -latCells; latIdx <= latCells; latIdx += 1) {
    const lat = center.latitude + latIdx * latStep;
    if (lat < -90 || lat > 90) continue;

    for (let lonIdx = -lonCells; lonIdx <= lonCells; lonIdx += 1) {
      const lon = normalizeLongitude(center.longitude + lonIdx * lonStep);
      const candidate = encodeGeohash(lat, lon, precision);
      if (cells.has(candidate)) continue;

      const candidateCenter = decodeGeohash(candidate);
      const distanceKm = earthDistanceKm(
        center.latitude,
        center.longitude,
        candidateCenter.latitude,
        candidateCenter.longitude
      );

      if (distanceKm <= radiusKm + bufferKm) {
        cells.add(candidate);
      }
    }
  }

  return [...cells];
}
