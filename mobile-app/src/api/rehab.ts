import { api } from "./client";
import type { RehabProgram, CreateProgramData } from "../types/rehab";

export const rehabApi = {
  createProgram: async (data: CreateProgramData): Promise<{ program: RehabProgram }> => {
    const { data: response } = await api.post<{ program: RehabProgram }>(
      "/api/rehab-programs",
      data,
    );
    return response;
  },

  getPrograms: async (): Promise<{ programs: RehabProgram[] }> => {
    const { data } = await api.get<{ programs: RehabProgram[] }>("/api/rehab-programs");
    return data;
  },

  getProgram: async (
    id: number,
    options?: { include?: string },
  ): Promise<{ program: RehabProgram; latestPlan?: any }> => {
    const params = options?.include ? `?include=${options.include}` : "";
    const { data } = await api.get<{ program: RehabProgram; latestPlan?: any }>(
      `/api/rehab-programs/${id}${params}`,
    );
    return data;
  },

  getActiveProgram: async (): Promise<RehabProgram | null> => {
    const { programs } = await rehabApi.getPrograms();
    return programs.find((p) => p.status === "active") || null;
  },
};
