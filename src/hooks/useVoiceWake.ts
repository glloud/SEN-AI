import { useState, useEffect, useRef, useCallback } from 'react';

interface VoiceWakeOptions {
  onWake: (detectedQuery?: string) => void;
  enabled?: boolean;
}

export function useVoiceWake({ onWake, enabled = true }: VoiceWakeOptions) {
  const [isSupported, setIsSupported] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [wakeDetected, setWakeDetected] = useState(false);
  const [voiceFeedbackEnabled, setVoiceFeedbackEnabled] = useState(false);

  const recognitionRef = useRef<any>(null);
  const isManuallyStoppedRef = useRef(false);

  useEffect(() => {
    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    if (SpeechRecognition) {
      setIsSupported(true);
      const recognition = new SpeechRecognition();
      recognition.continuous = true;
      recognition.interimResults = true;
      recognition.lang = 'en-US';

      // Request microphone permission immediately on mount so mic is always active
      if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
        navigator.mediaDevices
          .getUserMedia({ audio: true })
          .then(() => {
            try {
              recognition.start();
              setIsListening(true);
            } catch (e) {}
          })
          .catch((err) => {
            console.warn('Microphone permission request:', err);
          });
      }

      recognition.onstart = () => {
        setIsListening(true);
      };

      recognition.onresult = (event: any) => {
        let currentTranscript = '';
        for (let i = event.resultIndex; i < event.results.length; i++) {
          const text = event.results[i][0].transcript.toLowerCase().trim();
          currentTranscript += text;

          // Check for wake words: "hey sen", "hello sen", "hi sen", "sen"
          const wakeMatch = text.match(/\b(hey\s+sen|hello\s+sen|hi\s+sen|sen)\b(.*)/i);
          if (wakeMatch) {
            setWakeDetected(true);
            setTimeout(() => setWakeDetected(false), 3000);

            // Extract prompt following the wake word
            const trailing = (wakeMatch[2] || '')
              .replace(/^[,.!?\s]+/, '')
              .trim();

            onWake(trailing || undefined);
          }
        }
        setTranscript(currentTranscript);
      };

      recognition.onerror = (event: any) => {
        // Suppress benign no-speech errors
        if (event.error !== 'no-speech') {
          console.warn('Speech recognition warning:', event.error);
        }
      };

      recognition.onend = () => {
        setIsListening(false);
        // Automatically restart if still enabled
        if (!isManuallyStoppedRef.current && enabled) {
          try {
            recognition.start();
          } catch (e) {
            // Already started or restarting
          }
        }
      };

      recognitionRef.current = recognition;

      if (enabled) {
        try {
          recognition.start();
        } catch (e) {
          // Ignore
        }
      }

      return () => {
        isManuallyStoppedRef.current = true;
        try {
          recognition.stop();
        } catch (e) {}
      };
    } else {
      setIsSupported(false);
    }
  }, [enabled, onWake]);

  const toggleListening = useCallback(() => {
    if (!recognitionRef.current) return;
    if (isListening) {
      isManuallyStoppedRef.current = true;
      recognitionRef.current.stop();
      setIsListening(false);
    } else {
      isManuallyStoppedRef.current = false;
      try {
        recognitionRef.current.start();
        setIsListening(true);
      } catch (e) {
        console.warn('Could not start recognition:', e);
      }
    }
  }, [isListening]);

  // Voice output function for SEN
  const speak = useCallback(
    (text: string) => {
      if (!voiceFeedbackEnabled || !('speechSynthesis' in window)) return;
      window.speechSynthesis.cancel();
      // Clean markdown tags for natural speech
      const cleanText = text
        .replace(/[*#`_\[\]()]/g, '')
        .replace(/https?:\/\/\S+/g, '')
        .slice(0, 250);

      const utterance = new SpeechSynthesisUtterance(cleanText);
      utterance.rate = 1.05;
      utterance.pitch = 1.0;
      window.speechSynthesis.speak(utterance);
    },
    [voiceFeedbackEnabled]
  );

  return {
    isSupported,
    isListening,
    transcript,
    wakeDetected,
    voiceFeedbackEnabled,
    setVoiceFeedbackEnabled,
    toggleListening,
    speak,
  };
}
