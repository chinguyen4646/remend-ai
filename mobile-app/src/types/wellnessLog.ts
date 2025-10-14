export interface WellnessLog {
  id: number;
  userId: number;
  mode: "maintenance" | "general";
  date: string; // YYYY-MM-DD format
  pain: number | null; // 1-10 scale
  stiffness: number | null; // 1-10 scale
  tension: number | null; // 1-10 scale
  energy: number | null; // 1-10 scale
  areaTag: string | null; // e.g., "Lower Back", "Shoulders"
  notes: string | null;
  createdAt: string; // ISO timestamp
  updatedAt: string; // ISO timestamp
}

export interface CreateWellnessLogData {
  mode: "maintenance" | "general";
  date?: string; // Optional, defaults to today in user's timezone
  pain?: number | null;
  stiffness?: number | null;
  tension?: number | null;
  energy?: number | null;
  areaTag?: string | null;
  notes?: string | null;
}

export interface GetWellnessLogsParams {
  mode: "maintenance" | "general";
  range?: "last_7" | "last_30";
}
