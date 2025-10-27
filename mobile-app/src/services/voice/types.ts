/**
 * Voice Provider Interface
 *
 * Defines a common interface for voice transcription providers.
 */

export interface VoiceProvider {
  /**
   * Initialize the voice provider (download models, set up permissions, etc.)
   */
  initialize(): Promise<void>;

  /**
   * Start recording audio
   */
  startRecording(): Promise<void>;

  /**
   * Stop recording and return the transcribed text
   * @returns The transcribed text from the recording session
   */
  stopRecording(): Promise<string>;

  /**
   * Clean up resources (remove event listeners, release contexts, etc.)
   */
  cleanup(): void;

  /**
   * Whether the provider is currently recording
   */
  readonly isRecording: boolean;

  /**
   * Whether the provider is initializing (downloading models, etc.)
   */
  readonly isInitializing: boolean;

  /**
   * Current error message, or null if no error
   */
  readonly error: string | null;

  /**
   * Optional: Set a callback to receive real-time transcript updates
   * @param callback Function that receives the current transcript as it's being transcribed
   */
  setTranscriptCallback?: (callback: (transcript: string) => void) => void;
}
