// The mirror analogy: self-observation as the earliest form of data capture.
// Not literal history. A lens for classifying how the user came to know something.

export const CAPTURE_SOURCE = {
  DIRECT_SELF_OBSERVATION: 'self_observed',      // "I noticed I was..."
  EXTERNAL_REPORT: 'externally_reported',        // "someone told me..."
  INFERENCE: 'inferred',                          // "it seems like..."
  DEVICE_MEDIATED: 'device_mediated',             // "my watch said..."
  UNKNOWN: 'unknown'
};

export function classifyCapture(userInput) {
  const t = (userInput || '').toLowerCase();
  if (/\bi (noticed|felt|saw|realized|caught myself)\b/.test(t)) {
    return { source: CAPTURE_SOURCE.DIRECT_SELF_OBSERVATION, confidence: 0.8 };
  }
  if (/\b(someone|they|he|she) (said|told|mentioned)\b/.test(t)) {
    return { source: CAPTURE_SOURCE.EXTERNAL_REPORT, confidence: 0.7 };
  }
  if (/\b(seems|probably|must be|likely|i guess)\b/.test(t)) {
    return { source: CAPTURE_SOURCE.INFERENCE, confidence: 0.4 };
  }
  if (/\b(app|device|watch|phone|tracker) (said|showed|told)\b/.test(t)) {
    return { source: CAPTURE_SOURCE.DEVICE_MEDIATED, confidence: 0.7 };
  }
  return { source: CAPTURE_SOURCE.UNKNOWN, confidence: 0.2 };
}

// Epistemic weight: self-observation ranks above inference. Device data ranks above self-report for metrics only.
export function epistemicWeight(source) {
  switch (source) {
    case CAPTURE_SOURCE.DIRECT_SELF_OBSERVATION: return 0.7;
    case CAPTURE_SOURCE.EXTERNAL_REPORT: return 0.5;
    case CAPTURE_SOURCE.DEVICE_MEDIATED: return 0.6;
    case CAPTURE_SOURCE.INFERENCE: return 0.3;
    default: return 0.1;
  }
}