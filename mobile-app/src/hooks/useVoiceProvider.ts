import { useEffect, useState, useCallback, useRef } from "react";
import type { VoiceProvider } from "../services/voice/types";

export function useVoiceProvider() {
  const [provider, setProvider] = useState<VoiceProvider | null>(null);
  const [isInitializing, setIsInitializing] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isRecordingState, setIsRecordingState] = useState(false);
  const [liveTranscript, setLiveTranscript] = useState("");
  const providerRef = useRef<VoiceProvider | null>(null);

  // Initialize provider on mount
  useEffect(() => {
    let mounted = true;

    const initializeProvider = async () => {
      setIsInitializing(true);
      setError(null);

      try {
        console.log("[useVoiceProvider] Initializing NativeVoiceProvider");

        const { NativeVoiceProvider } = await import("../services/voice/NativeVoiceProvider");
        const nativeProvider = new NativeVoiceProvider();
        await nativeProvider.initialize();

        if (!mounted) return;

        setProvider(nativeProvider);
        providerRef.current = nativeProvider;
        console.log("[useVoiceProvider] NativeVoiceProvider initialized successfully");
      } catch (error) {
        console.error("[useVoiceProvider] Failed to initialize voice provider:", error);

        if (!mounted) return;

        setError("Failed to initialize voice recognition. Please check your permissions.");
      } finally {
        if (mounted) {
          setIsInitializing(false);
        }
      }
    };

    initializeProvider();

    return () => {
      mounted = false;
      if (providerRef.current) {
        providerRef.current.cleanup();
        providerRef.current = null;
      }
    };
  }, []);

  // Set up transcript callback when provider is ready
  useEffect(() => {
    if (provider?.setTranscriptCallback) {
      provider.setTranscriptCallback((transcript) => {
        setLiveTranscript(transcript);
      });
    }
  }, [provider]);

  const startRecording = useCallback(async () => {
    if (!provider) {
      throw new Error("Voice provider not initialized");
    }

    try {
      setLiveTranscript(""); // Clear previous transcript
      await provider.startRecording();
      setIsRecordingState(true);
    } catch (error: any) {
      setIsRecordingState(false);
      setError(error.message || "Failed to start recording");
      throw error;
    }
  }, [provider]);

  const stopRecording = useCallback(async (): Promise<string> => {
    if (!provider) {
      throw new Error("Voice provider not initialized");
    }

    try {
      const transcript = await provider.stopRecording();
      setIsRecordingState(false);
      return transcript;
    } catch (error: any) {
      setIsRecordingState(false);
      setError(error.message || "Failed to stop recording");
      throw error;
    }
  }, [provider]);

  return {
    // Methods
    startRecording,
    stopRecording,

    // State
    isRecording: isRecordingState,
    isInitializing: isInitializing || (provider?.isInitializing ?? false),
    error: error || (provider?.error ?? null),
    liveTranscript,
  };
}
