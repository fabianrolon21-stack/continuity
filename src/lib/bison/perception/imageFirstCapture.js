// "An image we can analyse." Classify the form of data the user is reasoning about.
// Images hold a privileged position in human analysis, but are not always highest-fidelity.

export const CAPTURE_FORM = {
  IMAGE: 'image',
  TEXT: 'text',
  SOUND: 'sound',
  MEASUREMENT: 'measurement',
  NARRATIVE: 'narrative',
  FEELING: 'feeling'
};

export function classifyCaptureForm(userInput) {
  const t = (userInput || '').toLowerCase();
  if (/\b(picture|photo|image|screenshot|video)\b/.test(t)) return CAPTURE_FORM.IMAGE;
  if (/\b(wrote|text|message|note|said)\b/.test(t)) return CAPTURE_FORM.TEXT;
  if (/\b(sound|heard|noise|voice)\b/.test(t)) return CAPTURE_FORM.SOUND;
  if (/\b(number|data|measured|reading|metric)\b/.test(t)) return CAPTURE_FORM.MEASUREMENT;
  if (/\b(happened|story|then|after)\b/.test(t)) return CAPTURE_FORM.NARRATIVE;
  if (/\b(felt|feeling|sense)\b/.test(t)) return CAPTURE_FORM.FEELING;
  return null;
}

// Note asymmetry: images are treated as evidence more readily than feelings, but feelings
// are often higher-signal for the person experiencing them.
export function buildCaptureFormPromptBlock(userInput) {
  const form = classifyCaptureForm(userInput);
  if (!form) return '';
  return `\n[CAPTURE FORM: ${form}]
If the user is treating this form as more authoritative than others, you may note that each form captures something different.
Images capture appearance. Feelings capture experience. Measurements capture magnitude. None captures the whole.
Do not rank them. Name the difference.
`;
}