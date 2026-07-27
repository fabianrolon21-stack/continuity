// ═══════════════════════════════════════════════
// STYLE SANITIZER (Package 44.5)
// Deterministic post-processor that enforces natural
// writing style on LLM output. Runs after empathy loop.
// ═══════════════════════════════════════════════

const EMPATHY_OPENERS = [
  /^I hear you[,.]?\s*/i,
  /^I hear (your|that|what)[^.]*[.!?]?\s*/i,
  /^I see (what|that|how)[^.]*[.!?]?\s*/i,
  /^I understand (your|how|what|that)[^.]*[.!?]?\s*/i,
  /^I recognize (that|your|what)[^.]*[.!?]?\s*/i,
  /^I sense (that|your)[^.]*[.!?]?\s*/i,
  /^I appreciate (that|your|you)[^.]*[.!?]?\s*/i,
  /^It sounds like /i,
  /^It seems like /i,
];

const REDUNDANT_FRAMES = [
  /It'?s important to (note|mention|remember|consider|understand) that\s*/gi,
  /It'?s worth (noting|mentioning|considering) that\s*/gi,
  /It should be (noted|mentioned) that\s*/gi,
  /As an AI,?\s*/gi,
  /As (a|the) Bison,?\s*/gi,
];

const TRAILING_QUESTION_PATTERNS = [
  /\s*(What do you think\??|Does that resonate\??|Would you like to .*\??|How does that sound\??|What are your thoughts\??|Does that make sense\??)\s*$/i,
];

function capitalize(text) {
  if (!text) return text;
  return text.charAt(0).toUpperCase() + text.slice(1);
}

function replaceDashes(text) {
  text = text.replace(/(\w)[—–](\w)/g, '$1, $2');
  text = text.replace(/\s*[—–]\s*/g, '. ');
  text = text.replace(/\. ([a-z])/g, (m, c) => '. ' + c.toUpperCase());
  return text;
}

function stripArtificialEmpathy(text) {
  let result = text;
  for (const pattern of EMPATHY_OPENERS) {
    result = result.replace(pattern, '');
  }
  return capitalize(result);
}

function stripRedundantFraming(text) {
  let result = text;
  for (const pattern of REDUNDANT_FRAMES) {
    result = result.replace(pattern, '');
  }
  return capitalize(result);
}

function mergeTinyParagraphs(text) {
  const paragraphs = text.split(/\n\n+/);
  const merged = [];
  for (const para of paragraphs) {
    if (para.trim().length < 30 && merged.length > 0) {
      merged[merged.length - 1] += ' ' + para.trim();
    } else {
      merged.push(para.trim());
    }
  }
  return merged.join('\n\n');
}

function removeHeaders(text) {
  text = text.replace(/^#{1,6}\s+.*$/gm, '');
  text = text.replace(/^\*\*[^*]+\*\*\s*$/gm, '');
  text = text.replace(/\n{3,}/g, '\n\n');
  return text.trim();
}

function bulletsToParagraphs(text) {
  const lines = text.split('\n');
  const result = [];
  let bulletGroup = [];
  for (const line of lines) {
    if (/^\s*[-•*]\s+/.test(line)) {
      bulletGroup.push(line.replace(/^\s*[-•*]\s+/, ''));
    } else {
      if (bulletGroup.length > 0) {
        result.push(bulletGroup.join('. ') + '.');
        bulletGroup = [];
      }
      result.push(line);
    }
  }
  if (bulletGroup.length > 0) {
    result.push(bulletGroup.join('. ') + '.');
  }
  return result.join('\n');
}

function throttleTrailingQuestions(text) {
  let result = text;
  for (const pattern of TRAILING_QUESTION_PATTERNS) {
    result = result.replace(pattern, '');
  }
  return result.trim();
}

export function sanitizeStyle(text, conversationMode, options = {}) {
  if (!text || typeof text !== 'string') return text || '';
  const style = conversationMode?.styleParams || {};
  const isEmotional = options.isEmotional || false;

  let result = text;

  result = replaceDashes(result);

  if (!isEmotional) {
    result = stripArtificialEmpathy(result);
  }

  result = stripRedundantFraming(result);
  result = mergeTinyParagraphs(result);

  if (style.allowHeaders === false) {
    result = removeHeaders(result);
  }
  if (style.allowBullets === false) {
    result = bulletsToParagraphs(result);
  }
  if (style.allowQuestions === false) {
    result = throttleTrailingQuestions(result);
  }

  return result.trim();
}