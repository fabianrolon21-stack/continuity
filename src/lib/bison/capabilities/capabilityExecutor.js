const sentences = text => text.match(/[^.!?]+[.!?]+|[^.!?]+$/g)?.map(s => s.trim()).filter(Boolean) || [];
const checklist = text => text.split(/\n|\.|;/).map(item => item.trim()).filter(Boolean).map(item => `- [ ] ${item}`).join('\n');

export async function executeCapability(capability, input) {
  if (capability.id === 'CALCULATE') {
    if (!/^[0-9+\-*/().\s]+$/.test(input)) throw new Error('Calculation accepts basic arithmetic only.');
    return `Result: ${Function(`"use strict"; return (${input})`)()}`;
  }
  if (capability.id === 'CREATE_CHECKLIST') return checklist(input);
  if (['SUMMARIZE_USER_PROVIDED_TEXT', 'SUMMARIZE_SOURCES'].includes(capability.id)) return sentences(input).slice(0, 3).join(' ');
  if (capability.id === 'EXTRACT_FACTS') return sentences(input).map((sentence, index) => `${index + 1}. ${sentence}`).join('\n');
  if (capability.id === 'CREATE_OUTLINE') return sentences(input).map((sentence, index) => `${index + 1}. ${sentence}`).join('\n');
  if (capability.riskLevel !== 'LOW') throw new Error('This task needs an approved service connection or explicit review.');
  return `${capability.name}\n\n${input.trim()}`;
}