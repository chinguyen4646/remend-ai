import { api } from "./client";
import type { AIAdvice } from "../types/aiAdvice";

/**
 * Request AI-generated rehabilitation advice
 * @param programId - The rehab program to get advice for
 * @returns AI advice with summary, actions, and optional caution
 * @throws Error if API call fails or AI service is unavailable
 */
export async function getRehabAdvice(programId: number): Promise<AIAdvice> {
  try {
    const response = await api.post<AIAdvice>("/api/sessions/rehab-summary", {
      programId,
    });

    return response.data;
  } catch (error: any) {
    // Extract error message from API response
    const errorMessage = error.response?.data?.errors?.[0]?.message || "Failed to get AI advice";

    // Map API errors to user-friendly messages
    if (error.response?.status === 503) {
      throw new Error("AI feedback is temporarily unavailable. Please try again later.");
    }

    if (error.response?.status === 400) {
      if (errorMessage.includes("Log at least once")) {
        throw new Error("You need at least one log entry to get AI feedback.");
      }
    }

    if (error.response?.status === 429) {
      throw new Error("Too many requests. Please wait a moment and try again.");
    }

    if (error.response?.status === 404) {
      throw new Error("Program not found.");
    }

    // Generic error fallback
    throw new Error(errorMessage);
  }
}
