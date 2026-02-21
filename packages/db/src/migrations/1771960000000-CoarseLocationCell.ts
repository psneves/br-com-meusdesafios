import { MigrationInterface, QueryRunner } from "typeorm";

const GEOHASH_BASE32 = "0123456789bcdefghjkmnpqrstuvwxyz";

function normalizeLongitude(value: number): number {
  let lon = value;
  while (lon < -180) lon += 360;
  while (lon >= 180) lon -= 360;
  return lon;
}

function clampLatitude(value: number): number {
  return Math.max(-90, Math.min(90, value));
}

function encodeGeohash(latitude: number, longitude: number, precision = 5): string {
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

export class CoarseLocationCell1771960000000 implements MigrationInterface {
  name = "CoarseLocationCell1771960000000";

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "users" ADD "location_cell" character varying(12)`
    );

    const rows: Array<{ id: string; latitude: number | null; longitude: number | null }> =
      await queryRunner.query(
        `SELECT id, latitude, longitude
         FROM users
         WHERE latitude IS NOT NULL AND longitude IS NOT NULL`
      );

    for (const row of rows) {
      if (row.latitude == null || row.longitude == null) continue;
      const cellId = encodeGeohash(Number(row.latitude), Number(row.longitude), 5);
      await queryRunner.query(
        `UPDATE users
         SET location_cell = $1
         WHERE id = $2`,
        [cellId, row.id]
      );
    }

    await queryRunner.query(
      `CREATE INDEX "IDX_users_location_cell_active"
       ON "users" ("location_cell", "is_active")
       WHERE "location_cell" IS NOT NULL`
    );

    await queryRunner.query(`ALTER TABLE "users" DROP COLUMN "longitude"`);
    await queryRunner.query(`ALTER TABLE "users" DROP COLUMN "latitude"`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "users" ADD "latitude" double precision`
    );
    await queryRunner.query(
      `ALTER TABLE "users" ADD "longitude" double precision`
    );
    await queryRunner.query(`DROP INDEX "public"."IDX_users_location_cell_active"`);
    await queryRunner.query(`ALTER TABLE "users" DROP COLUMN "location_cell"`);
  }
}
