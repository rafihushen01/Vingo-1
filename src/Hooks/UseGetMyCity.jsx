import { useEffect } from "react";
import { useDispatch } from "react-redux";
import axios from "axios";
import {
  setCurrentAddress,
  setCurrentCity,
  setCurrentState,
} from "../pages/redux/UserSlice";
import { setLocation } from "../pages/redux/MapSlice";

const CITY_STORAGE_KEY = "vingo_current_city";
const STATE_STORAGE_KEY = "vingo_current_state";
const ADDRESS_STORAGE_KEY = "vingo_current_address";
const LOCATION_STORAGE_KEY = "vingo_current_location";

const useGetCurrentCity = () => {
  const dispatch = useDispatch();

  useEffect(() => {
    const apiKey = import.meta.env.VITE_GEO_API;

    const applyResolvedLocation = ({ city, state, address, lat, lon }) => {
      if (city) {
        dispatch(setCurrentCity(city));
        localStorage.setItem(CITY_STORAGE_KEY, city);
      }

      if (state) {
        dispatch(setCurrentState(state));
        localStorage.setItem(STATE_STORAGE_KEY, state);
      }

      if (address) {
        dispatch(setCurrentAddress(address));
        localStorage.setItem(ADDRESS_STORAGE_KEY, address);
      }

      if (typeof lat === "number" && typeof lon === "number") {
        const locationPayload = { lat, lon };
        dispatch(setLocation(locationPayload));
        localStorage.setItem(LOCATION_STORAGE_KEY, JSON.stringify(locationPayload));
      }
    };

    const hydrateFromCache = () => {
      const cachedCity = localStorage.getItem(CITY_STORAGE_KEY);
      const cachedState = localStorage.getItem(STATE_STORAGE_KEY);
      const cachedAddress = localStorage.getItem(ADDRESS_STORAGE_KEY);
      const cachedLocationRaw = localStorage.getItem(LOCATION_STORAGE_KEY);

      if (cachedCity) {
        dispatch(setCurrentCity(cachedCity));
      }
      if (cachedState) {
        dispatch(setCurrentState(cachedState));
      }
      if (cachedAddress) {
        dispatch(setCurrentAddress(cachedAddress));
      }

      if (cachedLocationRaw) {
        try {
          const cachedLocation = JSON.parse(cachedLocationRaw);
          if (
            typeof cachedLocation?.lat === "number" &&
            typeof cachedLocation?.lon === "number"
          ) {
            dispatch(setLocation(cachedLocation));
          }
        } catch (error) {
          void error;
        }
      }
    };

    const reverseLookupByLatLon = async (latitude, longitude) => {
      if (!apiKey) return false;

      try {
        const url = `https://api.geoapify.com/v1/geocode/reverse?lat=${latitude}&lon=${longitude}&format=json&apiKey=${apiKey}`;
        const { data } = await axios.get(url);
        const info = data?.results?.[0];
        if (!info) return false;

        const city = info.city || info.county || info.state || null;
        const state = info.state || null;
        const address = info.formatted || null;

        applyResolvedLocation({
          city,
          state,
          address,
          lat: latitude,
          lon: longitude,
        });

        return true;
      } catch (error) {
        console.error("Reverse geocode failed:", error?.message || error);
        return false;
      }
    };

    const fallbackByPublicIp = async () => {
      try {
        const { data } = await axios.get("https://ipapi.co/json/");

        const city = data?.city || data?.region || null;
        const state = data?.region || null;
        const lat = Number(data?.latitude);
        const lon = Number(data?.longitude);
        const addressParts = [data?.city, data?.region, data?.country_name].filter(Boolean);
        const address = addressParts.length ? addressParts.join(", ") : null;

        applyResolvedLocation({
          city,
          state,
          address,
          lat: Number.isFinite(lat) ? lat : undefined,
          lon: Number.isFinite(lon) ? lon : undefined,
        });

        return Boolean(city || state || address);
      } catch (error) {
        console.error("Public IP fallback failed:", error?.message || error);
        return false;
      }
    };

    const fallbackByIp = async () => {
      if (!apiKey) {
        return fallbackByPublicIp();
      }

      try {
        const { data } = await axios.get(
          `https://api.geoapify.com/v1/ipinfo?apiKey=${apiKey}`
        );

        const city = data?.city?.name || data?.state?.name || null;
        const state = data?.state?.name || null;
        const lat = Number(data?.location?.latitude);
        const lon = Number(data?.location?.longitude);
        const addressParts = [data?.city?.name, data?.state?.name, data?.country?.name].filter(
          Boolean
        );
        const address = addressParts.length ? addressParts.join(", ") : null;

        applyResolvedLocation({
          city,
          state,
          address,
          lat: Number.isFinite(lat) ? lat : undefined,
          lon: Number.isFinite(lon) ? lon : undefined,
        });

        return Boolean(city || state || address);
      } catch (error) {
        console.error("IP location fallback failed:", error?.message || error);
        return fallbackByPublicIp();
      }
    };

    hydrateFromCache();

    const resolveCity = async () => {
      if (!("geolocation" in navigator)) {
        await fallbackByIp();
        return;
      }

      navigator.geolocation.getCurrentPosition(
        async (pos) => {
          const { latitude, longitude } = pos.coords;
          const resolved = await reverseLookupByLatLon(latitude, longitude);
          if (!resolved) {
            const ipResolved = await fallbackByIp();
            if (!ipResolved) {
              await fallbackByPublicIp();
            }
          }
        },
        async () => {
          await fallbackByIp();
        },
        { enableHighAccuracy: true, timeout: 10000, maximumAge: 60000 }
      );
    };

    resolveCity();
  }, [dispatch]);
};

export default useGetCurrentCity;
