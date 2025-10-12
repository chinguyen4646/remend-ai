import { api } from "./client";
import type { RehabLog, CreateRehabLogData, GetRehabLogsParams } from "../types/rehabLog";

export const rehabLogsApi = {
  /**
   * Create a new rehab log entry
   * Date defaults to today in user's timezone on the server
   */
  createLog: async (data: CreateRehabLogData): Promise<{ log: RehabLog }> => {
    const response = await api.post<{ log: RehabLog }>("/api/rehab-logs", data);
    return response.data;
  },

  /**
   * Get rehab logs with optional filters
   * @param params.programId - Can be 'active' or a specific program ID
   * @param params.range - Date range filter (last_7, last_14, last_30)
   */
  getLogs: async (params?: GetRehabLogsParams): Promise<{ logs: RehabLog[] }> => {
    const response = await api.get<{ logs: RehabLog[] }>("/api/rehab-logs", { params });
    return response.data;
  },
};
