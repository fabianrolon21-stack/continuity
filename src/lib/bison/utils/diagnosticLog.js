// utils/diagnosticLog.js
// Internal stage tags go here — never into user-facing output.

export function diagnosticLog(tag, message) {
  if (import.meta.env.DEV) {
    console.log(`[${tag}]`, message);
  }
}