import axios from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage";
import * as Localization from "expo-localization";

const API_URL = process.env.EXPO_PUBLIC_API_URL || "http://localhost:3333";

export const api = axios.create({
  baseURL: API_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

// Add auth token and timezone to all requests
api.interceptors.request.use(async (config) => {
  const token = await AsyncStorage.getItem("auth_token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  // Always add device timezone
  const timezone = Localization.getCalendars()[0]?.timeZone || "UTC";
  config.headers["X-Timezone"] = timezone;

  return config;
});

// Handle 401 errors
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 401) {
      await AsyncStorage.removeItem("auth_token");
      await AsyncStorage.removeItem("user");
    }
    return Promise.reject(error);
  },
);
