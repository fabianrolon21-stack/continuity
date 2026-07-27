// ═══════════════════════════════════════════════
// NATURALNESS SCORER (Package 44.5)
// Evaluates every response on 11 metrics.
// Output: 0-100 score. Target: 90+.
// ═══════════════════════════════════════════════

const AI_PHRASES = [
  'i hear you', 'i hear that', 'i hear what',
  'i see what', 'i see that', 'i see how',
  'i understand your', 'i understand how', 'i understand what', 'i understand that',
  'i recognize that', 'i recognize your',
  'i sense that', 'i sense your',
  'i feel that', 'i feel your',
  'i appreciate that', 'i appreciate your',
  "it sounds like", 'it seems like',
  "it's important to note", "it's important to mention",
  "it's worth noting", "it's worth mentioning",
  'you are asking', 'you are noticing', 'you are observing', 'you are experiencing',
  'you are wondering', 'you are thinking', 'you are feeling', 'you are sharing',
  'you are expressing', 'you are reflecting', 'you are exploring', 'you are seeking',
  'what do you think', 'does that resonate', 'would you like to',
  'let me help', 'i am here', 'i want you to know',
  "that's a great question", 'that is a great question',
  'in conclusion', 'to summarize', 'furthermore', 'moreover', 'additionally',
  'as an ai', 'as the bison',
];

const EMPATHY_PHRASES = [
  'i hear you', 'i hear that', 'i see', 'i understand',
  'i recognize', 'i sense', 'i feel', 'i appreciate',
];

const METAPHOR_KEYWORDS = [
  'mirror', 'forest', 'canopy', 'foundation', 'architecture',
  'garden', 'grove', 'river', 'journey', 'path',
  'tapestry', 'symphony', 'weave', 'threads',
  'quiet space', 'soul', 'essence', 'spirit', 'liminal',
];

function countSyllables(word) {
  word = word.toLowerCase().replace(/[^a-z]/g, '');
  if (word.length <= 3) return 1;
  word = word.replace(/(?:[^laeiouy]es|ed|[^laeiouy]e)$/, '');
  word = word.replace(/^y/, '');
  const matches = word.match(/[aeiouy]{1,2}/g);
  return matches ? matches.length : 1;
}

function countPhraseOccurrences(text, phrases) {
  const lower = text.toLowerCase();
  let count = 0;
  for (const phrase of phrases) {
    const regex = new RegExp(phrase.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'gi');
    const matches = lower.match(regex);
    if (matches) count += matches.length;
  }
  return count;
}

export function scoreNaturalness(text) {
  if (!text || typeof text !== 'string') return { score: 100, metrics: {} };

  const sentences = text.split(/[.!?]+/).filter(s => s.trim().length > 0);
  const words = text.split(/\s+/).filter(w => w.length > 0);
  const sentenceCount = sentences.length || 1;
  const wordCount = words.length || 1;

  const dashCount = (text.match(/[—–]/g) || []).length;
  const aiPhraseCount = countPhraseOccurrences(text, AI_PHRASES);
  const headerCount = (text.match(/^#{1,6}\s/gm) || []).length + (text.match(/^\*\*[^*]+\*\*\s*$/gm) || []).length;
  const bulletCount = (text.match(/^\s*[-•*]\s/gm) || []).length;
  const metaphorCount = countPhraseOccurrences(text, METAPHOR_KEYWORDS);
  const empathyCount = countPhraseOccurrences(text, EMPATHY_PHRASES);
  const questionCount = (text.match(/\?/g) || []).length;

  const avgSentenceLength = wordCount / sentenceCount;
  const lengths = sentences.map(s => s.trim().split(/\s+/).filter(Boolean).length);
  const avgLen = lengths.reduce((a, b) => a + b, 0) / (lengths.length || 1);
  const variance = lengths.reduce((sum, l) => sum + Math.pow(l - avgLen, 2), 0) / (lengths.length || 1);
  const sentenceLengthStdDev = Math.sqrt(variance);

  const syllables = words.reduce((sum, w) => sum + countSyllables(w), 0);
  const readingEase = Math.max(0, Math.min(100, 206.835 - 1.015 * avgSentenceLength - 84.6 * (syllables / wordCount)));

  const wordFreq = {};
  for (const w of words) {
    const lw = w.toLowerCase();
    if (lw.length > 3) wordFreq[lw] = (wordFreq[lw] || 0) + 1;
  }
  const repeatedWords = Object.values(wordFreq).filter(c => c > 3).length;
  const redundancyScore = Math.min(100, repeatedWords * 15);

  const aiPhraseDensity = (aiPhraseCount / sentenceCount) * 100;
  const questionDensity = (questionCount / sentenceCount) * 100;
  const empathyDensity = (empathyCount / sentenceCount) * 100;
  const metaphorDensity = (metaphorCount / Math.max(1, wordCount / 100));

  const metrics = {
    dashCount,
    aiPhraseDensity: Math.round(aiPhraseDensity * 10) / 10,
    headerCount,
    bulletCount,
    metaphorDensity: Math.round(metaphorDensity * 10) / 10,
    avgSentenceLength: Math.round(avgSentenceLength * 10) / 10,
    questionDensity: Math.round(questionDensity * 10) / 10,
    empathyDensity: Math.round(empathyDensity * 10) / 10,
    readingEase: Math.round(readingEase),
    redundancyScore,
    sentenceVariety: Math.round(sentenceLengthStdDev * 10) / 10,
  };

  let score = 100;
  score -= dashCount * 5;
  score -= aiPhraseCount * 8;
  score -= headerCount * 3;
  score -= bulletCount * 2;
  score -= metaphorCount * 4;
  score -= empathyCount * 5;
  if (avgSentenceLength > 25) score -= 5;
  if (avgSentenceLength > 35) score -= 5;
  if (sentenceLengthStdDev < 2 && sentenceCount > 3) score -= 10;
  if (redundancyScore > 30) score -= 10;
  if (questionCount > 2) score -= 3;

  score = Math.max(0, Math.min(100, Math.round(score)));

  return { score, metrics };
}