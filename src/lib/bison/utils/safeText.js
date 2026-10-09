// utils/safeText.js
// Never call .toLowerCase() on external input without passing it through here.

export function safeText(input) {
  return typeof input === 'string' ? input.toLowerCase() : '';
}