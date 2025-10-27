/**
 * NativeVoiceProvider - OS-based voice transcription using @react-native-voice/voice
 *
 * Uses the device's native speech recognition APIs (iOS Speech Framework, Android Speech Recognizer).
 * Provides fast, lightweight transcription that may require internet depending on OS settings.
 */

import Voice, { SpeechResultsEvent, SpeechErrorEvent } from "@react-native-voice/voice";
import type { VoiceProvider } from "./types";

export class NativeVoiceProvider implements VoiceProvider {
  private _isRecording = false;
  private _isInitializing = false;
  private _error: string | null = null;
  private _currentTranscript = "";
  private _initialized = false;
  private _transcriptCallback?: (transcript: string) => void;

  get isRecording(): boolean {
    return this._isRecording;
  }

  get isInitializing(): boolean {
    return this._isInitializing;
  }

  get error(): string | null {
    return this._error;
  }

  setTranscriptCallback(callback: (transcript: string) => void): void {
    this._transcriptCallback = callback;
  }

  async initialize(): Promise<void> {
    if (this._initialized) {
      console.log("[NativeVoiceProvider] Already initialized");
      return;
    }

    try {
      this._isInitializing = true;
      this._error = null;

      console.log("[NativeVoiceProvider] Initializing native voice recognition");

      // Set up event handlers
      Voice.onSpeechStart = this.handleSpeechStart;
      Voice.onSpeechEnd = this.handleSpeechEnd;
      Voice.onSpeechResults = this.handleSpeechResults;
      Voice.onSpeechError = this.handleSpeechError;

      this._initialized = true;
      console.log("[NativeVoiceProvider] Native voice initialized successfully");
    } catch (error: any) {
      this._error = `Failed to initialize native voice: ${error.message || error}`;
      console.error("[NativeVoiceProvider] Initialization error:", error);
      throw error;
    } finally {
      this._isInitializing = false;
    }
  }

  async startRecording(): Promise<void> {
    try {
      this._isRecording = true;
      this._error = null;
      this._currentTranscript = "";

      console.log("[NativeVoiceProvider] Starting speech recognition");

      await Voice.start("en-US");
    } catch (error: any) {
      this._isRecording = false;
      this._error = `Failed to start recording: ${error.message || error}`;
      console.error("[NativeVoiceProvider] Start recording error:", error);
      throw error;
    }
  }

  async stopRecording(): Promise<string> {
    try {
      console.log("[NativeVoiceProvider] Stopping speech recognition");

      await Voice.stop();
      this._isRecording = false;

      const finalTranscript = this._currentTranscript.trim();
      console.log(
        "[NativeVoiceProvider] Recording stopped. Transcript length:",
        finalTranscript.length,
      );

      return finalTranscript;
    } catch (error: any) {
      this._error = `Failed to stop recording: ${error.message || error}`;
      console.error("[NativeVoiceProvider] Stop recording error:", error);
      return this._currentTranscript.trim(); // Return what we have anyway
    }
  }

  cleanup(): void {
    if (this._initialized) {
      Voice.destroy()
        .then(() => {
          Voice.removeAllListeners();
          console.log("[NativeVoiceProvider] Cleaned up");
        })
        .catch((error) => {
          console.error("[NativeVoiceProvider] Cleanup error:", error);
        });
    }

    this._initialized = false;
    this._isRecording = false;
    this._currentTranscript = "";
  }

  // Event handlers
  private handleSpeechStart = () => {
    console.log("[NativeVoiceProvider] Speech started");
    this._isRecording = true;
  };

  private handleSpeechEnd = () => {
    console.log("[NativeVoiceProvider] Speech ended");
    // Don't set isRecording to false here - wait for stopRecording()
    // This is just the end of the speech segment, not the recording session
  };

  private handleSpeechResults = (event: SpeechResultsEvent) => {
    if (event.value && event.value[0]) {
      const transcription = event.value[0];
      this._currentTranscript = transcription;

      // Notify callback with live transcript updates
      if (this._transcriptCallback) {
        this._transcriptCallback(transcription);
      }
    }
  };

  private handleSpeechError = (event: SpeechErrorEvent) => {
    console.error("[NativeVoiceProvider] Speech error:", event);
    this._isRecording = false;
    this._error = event.error?.message || "Speech recognition error";
  };
}
