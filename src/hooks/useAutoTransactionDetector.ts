import { useState, useEffect, useCallback, useRef } from 'react';
import {
  DetectedTransaction,
  parseTransactionLocally,
  parseTransactionWithOpenSourceLLM,
} from '../services/aiParserService';

const PROCESSED_HASHES_KEY = 'ft_processed_tx_hashes_v1';
const AUTO_DETECT_ENABLED_KEY = 'ft_auto_detect_enabled';
const OPEN_SOURCE_API_KEY_STORAGE = 'ft_os_llm_api_key';
const OPEN_SOURCE_PROVIDER_STORAGE = 'ft_os_llm_provider';

export function useAutoTransactionDetector(onTransactionAccepted: (tx: DetectedTransaction) => Promise<void>) {
  const [pendingTransaction, setPendingTransaction] = useState<DetectedTransaction | null>(null);
  const [isAutoDetectEnabled, setIsAutoDetectEnabled] = useState<boolean>(() => {
    const saved = localStorage.getItem(AUTO_DETECT_ENABLED_KEY);
    return saved !== null ? JSON.parse(saved) : true;
  });

  const lastProcessedTextRef = useRef<string>('');

  // Load processed hashes
  const getProcessedHashes = (): string[] => {
    try {
      const raw = localStorage.getItem(PROCESSED_HASHES_KEY);
      return raw ? JSON.parse(raw) : [];
    } catch {
      return [];
    }
  };

  const markHashAsProcessed = (hash: string) => {
    try {
      const hashes = getProcessedHashes();
      if (!hashes.includes(hash)) {
        hashes.push(hash);
        // Keep at most last 100 hashes to save space
        if (hashes.length > 100) hashes.shift();
        localStorage.setItem(PROCESSED_HASHES_KEY, JSON.stringify(hashes));
      }
    } catch (e) {
      console.error('Failed to save processed hash:', e);
    }
  };

  // Simple string hash
  const hashString = (str: string): string => {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i);
      hash = (hash << 5) - hash + char;
      hash |= 0;
    }
    return hash.toString();
  };

  // Add clipboard scan rate limiting
  const lastScanRef = useRef(0);
  const MIN_SCAN_INTERVAL = 3000; // 3 seconds between scans

  // Main evaluation logic
  const evaluateTextForTransaction = useCallback(
    async (text: string) => {
      // Increased minimum length and early exit
      if (!text || text.trim().length < 15) return;
      if (text === lastProcessedTextRef.current) return;

      const hash = hashString(text.trim());
      const processed = getProcessedHashes();
      if (processed.includes(hash)) return;

      // SINGLE local parse call - store result
      const localTx = parseTransactionLocally(text);
      if (!localTx) return;

      lastProcessedTextRef.current = text;

      // Check if user has open-source LLM key configured
      const apiKey = localStorage.getItem(OPEN_SOURCE_API_KEY_STORAGE);
      if (!apiKey) {
        // No LLM key - use local result directly
        setPendingTransaction(localTx);
        return;
      }

      const provider = (localStorage.getItem(OPEN_SOURCE_PROVIDER_STORAGE) as 'groq' | 'openrouter') || 'groq';

      try {
        const aiResult = await parseTransactionWithOpenSourceLLM(text, apiKey, provider);
        // Only update if LLM returned valid result
        if (aiResult) {
          setPendingTransaction(aiResult);
        } else {
          // Fallback to local result
          setPendingTransaction(localTx);
        }
      } catch (error) {
        console.warn('LLM parsing failed, using local result:', error);
        setPendingTransaction(localTx);
      }
    },
    []
  );

  // Scan clipboard with rate limiting
  const scanClipboard = useCallback(async () => {
    if (!isAutoDetectEnabled) return;

    const now = Date.now();
    if (now - lastScanRef.current < MIN_SCAN_INTERVAL) return;

    if (typeof navigator === 'undefined' || !navigator.clipboard || !navigator.clipboard.readText) {
      return;
    }

    try {
      const text = await navigator.clipboard.readText();
      await evaluateTextForTransaction(text);
    } catch {
      // Browser permissions or unfocused clipboard - quietly ignore
    }

    lastScanRef.current = now;
  }, [isAutoDetectEnabled, evaluateTextForTransaction]);

  
  // Monitor app focus and visibility
  useEffect(() => {
    if (!isAutoDetectEnabled) return;

    // Scan on initial mount
    scanClipboard();

    const handleFocus = () => scanClipboard();
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        scanClipboard();
      }
    };

    window.addEventListener('focus', handleFocus);
    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      window.removeEventListener('focus', handleFocus);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [isAutoDetectEnabled, scanClipboard]);

  // Accept handler
  const acceptPending = async (modifiedTx?: DetectedTransaction) => {
    const tx = modifiedTx || pendingTransaction;
    if (!tx) return;

    if (tx.rawText) {
      markHashAsProcessed(hashString(tx.rawText.trim()));
    }
    setPendingTransaction(null);
    await onTransactionAccepted(tx);
  };

  // Dismiss handler
  const dismissPending = () => {
    if (pendingTransaction?.rawText) {
      markHashAsProcessed(hashString(pendingTransaction.rawText.trim()));
    }
    setPendingTransaction(null);
  };

  // Trigger manual or simulated text evaluation
  const triggerManualDetection = async (text: string) => {
    // Reset reference so manual test will always trigger
    lastProcessedTextRef.current = '';
    const hash = hashString(text.trim());
    // Temporarily un-blacklist if testing
    const hashes = getProcessedHashes().filter((h) => h !== hash);
    localStorage.setItem(PROCESSED_HASHES_KEY, JSON.stringify(hashes));

    await evaluateTextForTransaction(text);
  };

  const toggleAutoDetect = () => {
    setIsAutoDetectEnabled((prev) => {
      const next = !prev;
      localStorage.setItem(AUTO_DETECT_ENABLED_KEY, JSON.stringify(next));
      return next;
    });
  };

  return {
    pendingTransaction,
    acceptPending,
    dismissPending,
    triggerManualDetection,
    isAutoDetectEnabled,
    toggleAutoDetect,
  };
}
