import type { RehabPlan } from "./rehabPlan";

export interface RehabLog {
  id: number;
  userId: number;
  programId: number;
  date: string; // YYYY-MM-DD
  pain: number; // 0-10
  stiffness: number; // 0-10
  swelling: number; // 0-10
  activityLevel: "rest" | "light" | "moderate" | "heavy" | null;
  notes: string; // Required: min 10, max 1000 chars
  aggravators: string[];
  plan?: RehabPlan; // Optional: Associated exercise plan
  createdAt: string;
  updatedAt: string;
}

export interface CreateRehabLogData {
  programId: number;
  pain: number;
  stiffness: number;
  swelling: number;
  activityLevel?: "rest" | "light" | "moderate" | "heavy";
  notes: string; // Required: min 10, max 1000 chars
  aggravators?: string[];
}

export interface GetRehabLogsParams {
  programId?: string | number; // Can be 'active' or a number
  range?: "last_7" | "last_14" | "last_30";
}
