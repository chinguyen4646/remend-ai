import { api } from "./client";
import type { AuthResponse, LoginCredentials, RegisterCredentials, User } from "../types/auth";
import * as Localization from "expo-localization";

export const authApi = {
  register: async (credentials: RegisterCredentials): Promise<AuthResponse> => {
    const timezone = Localization.getCalendars()[0]?.timeZone || "UTC";
    const { data } = await api.post<AuthResponse>("/api/auth/register", credentials, {
      headers: { "X-Timezone": timezone },
    });
    return data;
  },

  login: async (credentials: LoginCredentials): Promise<AuthResponse> => {
    const timezone = Localization.getCalendars()[0]?.timeZone || "UTC";
    const { data } = await api.post<AuthResponse>("/api/auth/login", credentials, {
      headers: { "X-Timezone": timezone },
    });
    return data;
  },

  logout: async (): Promise<void> => {
    await api.post("/api/auth/logout");
  },

  me: async (): Promise<{ user: User }> => {
    const { data } = await api.get<{ user: User }>("/api/auth/me");
    return data;
  },

  updateMode: async (
    mode: "rehab" | "maintenance" | "general",
    injuryType?: string,
  ): Promise<{ user: User; message?: string }> => {
    const { data } = await api.patch<{ user: User; message?: string }>("/api/users/mode", {
      mode,
      injuryType,
    });
    return data;
  },
};
