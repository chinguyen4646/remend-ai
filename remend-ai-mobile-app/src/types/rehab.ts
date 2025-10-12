export interface RehabProgram {
  id: number;
  userId: number;
  area: string;
  areaOtherLabel: string | null;
  side: "left" | "right" | "both" | "na";
  startDate: string; // YYYY-MM-DD
  status: "active" | "paused" | "completed";
  createdAt: string;
  updatedAt: string;
}

export interface CreateProgramData {
  area: string;
  side: "left" | "right" | "both" | "na";
  startDate?: string; // YYYY-MM-DD, defaults to today
}
