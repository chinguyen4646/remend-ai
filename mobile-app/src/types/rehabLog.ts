export interface RehabLog {
  id: number;
  userId: number;
  programId: number;
  date: string; // YYYY-MM-DD
  pain: number; // 0-10
  stiffness: number; // 0-10
  swelling: number; // 0-10
  activityLevel: "rest" | "light" | "moderate" | "heavy" | null;
  notes: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface CreateRehabLogData {
  programId: number;
  pain: number;
  stiffness: number;
  swelling: number;
  activityLevel?: "rest" | "light" | "moderate" | "heavy";
  notes?: string;
}

export interface GetRehabLogsParams {
  programId?: string | number; // Can be 'active' or a number
  range?: "last_7" | "last_14" | "last_30";
}
