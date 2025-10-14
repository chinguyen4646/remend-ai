import { api } from "./client";
import type {
  WellnessLog,
  CreateWellnessLogData,
  GetWellnessLogsParams,
} from "../types/wellnessLog";

export const wellnessLogsApi = {
  /**
   * Create a new wellness log
   * @param data - The wellness log data
   * @returns The created wellness log
   * @throws 400 if timezone header missing
   * @throws 409 if log already exists for this mode and date
   * @throws 422 if date format invalid
   */
  createLog: async (data: CreateWellnessLogData): Promise<WellnessLog> => {
    const response = await api.post<{ log: WellnessLog }>("/api/wellness-logs", data);
    return response.data.log;
  },

  /**
   * Get wellness logs for the authenticated user
   * @param params - Filter parameters (mode, range)
   * @returns Array of wellness logs
   */
  getLogs: async (params: GetWellnessLogsParams): Promise<WellnessLog[]> => {
    const response = await api.get<{ logs: WellnessLog[] }>("/api/wellness-logs", {
      params,
    });
    return response.data.logs;
  },
};
