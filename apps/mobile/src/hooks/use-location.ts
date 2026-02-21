import { useState, useCallback } from "react";
import * as Location from "expo-location";
import { encodeGeohash, LOCATION_CELL_PRECISION } from "@meusdesafios/shared";
import { api } from "../api/client";

export interface UseLocationResult {
  hasPermission: boolean | null;
  isRequesting: boolean;
  error: string | null;
  requestAndSendLocation: () => Promise<boolean>;
}

export function useLocation(): UseLocationResult {
  const [hasPermission, setHasPermission] = useState<boolean | null>(null);
  const [isRequesting, setIsRequesting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const requestAndSendLocation = useCallback(async (): Promise<boolean> => {
    setIsRequesting(true);
    setError(null);
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      const granted = status === "granted";
      setHasPermission(granted);

      if (!granted) {
        setError("Permissão de localização negada");
        return false;
      }

      const pos = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.Balanced,
      });

      const cellId = encodeGeohash(
        pos.coords.latitude,
        pos.coords.longitude,
        LOCATION_CELL_PRECISION
      );

      await api.put("/api/profile/location", { cellId });
      return true;
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Erro ao obter localização"
      );
      return false;
    } finally {
      setIsRequesting(false);
    }
  }, []);

  return { hasPermission, isRequesting, error, requestAndSendLocation };
}
