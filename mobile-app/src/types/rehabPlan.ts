export interface DosageJson {
  sets?: number;
  reps?: number;
  hold_seconds?: number;
  time_seconds?: number;
  rest_seconds?: number;
  notes?: string;
}

export interface ShortlistExercise {
  id: number;
  name: string;
  bucket: string;
  dosage_json: DosageJson;
  dosage_text: string;
  safety_notes?: string;
}

export interface UserContextJson {
  notes: string;
  aggravators: string[];
  trend_summary: string;
}

export interface AIPlanBullet {
  exercise_id: number;
  exercise_name: string;
  dosage_text: string;
  coaching: string;
}

export interface AIOutputJson {
  summary: string;
  bullets: AIPlanBullet[];
  caution?: string;
}

export interface ShortlistJson {
  exercises: ShortlistExercise[];
}

export type PlanType = "ai" | "fallback" | "manual";
export type AiStatus = "pending" | "success" | "failed" | "skipped";

export interface RehabPlan {
  id: number;
  rehabLogId: number;
  planType: PlanType;
  shortlistJson: ShortlistJson;
  aiOutputJson: AIOutputJson | null;
  aiStatus: AiStatus;
  aiError: string | null;
  userContextJson: UserContextJson;
  generatedAt: string;
  createdAt: string;
  updatedAt: string;
}
