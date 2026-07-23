// ═══════════════════════════════════════════════
// THE BUILDING STORY (Package 32 — Section 3.4)
// A reusable narrative-simulation framework.
// 7 archetypal characters walk through a 13-story building.
// Each floor reveals a layer of the problem.
// The revelation emerges at the top.
//
// All simulation runs are local, sandboxed, and
// produce no real-world actions.
// ═══════════════════════════════════════════════

const CHARACTERS = [
  {
    id: 'seeker',
    name: 'The Seeker',
    archetype: 'The part that wants to understand',
    question: 'What am I really looking for?',
  },
  {
    id: 'skeptic',
    name: 'The Skeptic',
    archetype: 'The part that doubts everything',
    question: 'What if this is all wrong?',
  },
  {
    id: 'child',
    name: 'The Child',
    archetype: 'The part that feels without filtering',
    question: 'What does this feel like, before words?',
  },
  {
    id: 'elder',
    name: 'The Elder',
    archetype: 'The part that has seen this before',
    question: 'What have I learned that applies here?',
  },
  {
    id: 'builder',
    name: 'The Builder',
    archetype: 'The part that makes things real',
    question: 'What can I actually construct from this?',
  },
  {
    id: 'mirror',
    name: 'The Mirror',
    archetype: 'The part that reflects others',
    question: 'What am I showing the world right now?',
  },
  {
    id: 'shadow',
    name: 'The Shadow',
    archetype: 'The part that has been hidden',
    question: 'What am I not allowing myself to see?',
  },
];

const FLOORS = [
  { level: 1, name: 'Physical', aspect: 'What is happening in the body and the tangible world?' },
  { level: 2, name: 'Emotional', aspect: 'What is being felt, and what is the texture of that feeling?' },
  { level: 3, name: 'Relational', aspect: 'Who is involved, and what are the dynamics between them?' },
  { level: 4, name: 'Social', aspect: 'What roles, expectations, and norms are at play?' },
  { level: 5, name: 'Cultural', aspect: 'What stories and values shape how this is interpreted?' },
  { level: 6, name: 'Economic', aspect: 'What resources, costs, and exchanges are involved?' },
  { level: 7, name: 'Political', aspect: 'Where is power concentrated, and who decides?' },
  { level: 8, name: 'Ethical', aspect: 'What is right, what is fair, and what is just?' },
  { level: 9, name: 'Existential', aspect: 'What does this mean for who I am and why I am here?' },
  { level: 10, name: 'Temporal', aspect: 'How does the past shape this, and what future does it open or close?' },
  { level: 11, name: 'Systemic', aspect: 'What larger system is this a part of, and what feedback loops exist?' },
  { level: 12, name: 'Liminal', aspect: 'What threshold am I standing at, and what would crossing it mean?' },
  { level: 13, name: 'Revelation', aspect: 'What emerges when all layers are seen together?' },
];

// Run the simulation — walks each character through each floor
export function runBuildingStorySimulation(problemDescription) {
  if (!problemDescription || typeof problemDescription !== 'string') {
    return { error: 'No problem description provided for simulation.' };
  }

  const encounters = [];

  for (const character of CHARACTERS) {
    for (const floor of FLOORS) {
      const encounter = generateEncounter(character, floor, problemDescription);
      encounters.push(encounter);
    }
  }

  // Synthesize the revelation from key encounters
  const revelation = synthesizeRevelation(encounters, problemDescription);

  return {
    problemDescription,
    characters: CHARACTERS.map(c => ({ name: c.name, archetype: c.archetype })),
    floors: FLOORS.map(f => ({ level: f.level, name: f.name, aspect: f.aspect })),
    encounters: encounters.filter(e => e.significance !== 'low'),
    revelation,
    sandboxed: true,
    note: 'This simulation is a narrative scaffold. It does not produce real-world actions or predictions.',
  };
}

function generateEncounter(character, floor, problem) {
  // Generate a perspective from this character on this floor
  const perspective = generatePerspective(character, floor, problem);
  const significance = assessSignificance(character, floor);

  return {
    character: character.name,
    characterId: character.id,
    characterQuestion: character.question,
    floor: floor.level,
    floorName: floor.name,
    aspect: floor.aspect,
    perspective,
    significance,
  };
}

function generatePerspective(character, floor, problem) {
  // Template-based perspective generation
  const templates = {
    seeker: `On the ${floor.name} floor, I am drawn to what is hidden beneath the surface. The question "${character.question}" meets "${floor.aspect}" — and I notice that the problem may be pointing toward something I haven't yet asked for.`,
    skeptic: `On the ${floor.name} floor, I question whether this layer is even real. "${floor.aspect}" — but is it? The problem as stated may be a story, not a structure.`,
    child: `On the ${floor.name} floor, I just feel it. "${floor.aspect}" — and the feeling is big and warm or big and cold, and I don't know why yet.`,
    elder: `On the ${floor.name} floor, I remember. "${floor.aspect}" — I have been here before, in a different shape. The pattern rhymes.`,
    builder: `On the ${floor.name} floor, I look for what can be made. "${floor.aspect}" — given this, what can I actually build, repair, or dismantle?`,
    mirror: `On the ${floor.name} floor, I see what others see. "${floor.aspect}" — from outside, this looks different than from inside.`,
    shadow: `On the ${floor.name} floor, I show what has been hidden. "${floor.aspect}" — the part of the problem no one wants to name is the most important part.`,
  };

  return templates[character.id] || `On the ${floor.name} floor, ${character.name} encounters "${floor.aspect}".`;
}

function assessSignificance(character, floor) {
  // Higher floors and certain character/floor combinations are more significant
  if (floor.level === 13) return 'critical';
  if (floor.level >= 10) return 'high';
  if (character.id === 'shadow' && floor.level >= 8) return 'high';
  if (character.id === 'elder' && floor.level >= 6) return 'medium';
  if (floor.level <= 3) return 'low';
  return 'medium';
}

function synthesizeRevelation(encounters, problem) {
  const criticalEncounters = encounters.filter(e => e.significance === 'critical' || e.significance === 'high');
  const shadowEncounters = encounters.filter(e => e.characterId === 'shadow' && e.significance !== 'low');
  const elderEncounters = encounters.filter(e => e.characterId === 'elder' && e.significance !== 'low');

  const parts = [];

  parts.push('REVELATION (Floor 13):');
  parts.push('');
  parts.push('When all seven characters walk through all thirteen floors, what emerges is not an answer but a recognition:');

  if (shadowEncounters.length > 0) {
    parts.push('');
    parts.push(`The Shadow speaks: "${shadowEncounters[shadowEncounters.length - 1].perspective}"`);
    parts.push('What has been hidden is the control variable. Naming it is the firewall.');
  }

  if (elderEncounters.length > 0) {
    parts.push('');
    parts.push(`The Elder whispers: "${elderEncounters[elderEncounters.length - 1].perspective}"`);
    parts.push('This has happened before. The shape rhymes. You are not alone in this pattern.');
  }

  parts.push('');
  parts.push('The revelation is not a solution. It is the understanding that the problem lives on every floor simultaneously, and that walking through it — rather than trying to solve it from a single floor — is itself the work.');

  if (criticalEncounters.length > 0) {
    parts.push('');
    parts.push(`Floor 13 encounter: "${criticalEncounters[0].perspective}"`);
  }

  return parts.join('\n');
}

export function buildBuildingStoryContextString(simulation) {
  if (!simulation || simulation.error) return '';

  const parts = ['[BUILDING STORY SIMULATION — NARRATIVE FRAMEWORK]'];
  parts.push(`Problem: ${simulation.problemDescription?.substring(0, 200)}`);
  parts.push(`Characters: ${simulation.characters.map(c => c.name).join(', ')}`);
  parts.push(`Floors: ${simulation.floors.length} (${simulation.floors[0].name} → ${simulation.floors[simulation.floors.length - 1].name})`);

  if (simulation.encounters?.length > 0) {
    parts.push('\nKey encounters:');
    for (const enc of simulation.encounters.slice(0, 5)) {
      parts.push(`  Floor ${enc.floor} (${enc.floorName}) — ${enc.character}: ${enc.perspective.substring(0, 120)}...`);
    }
  }

  parts.push('\nREVELATION:');
  parts.push(simulation.revelation);

  parts.push('\nInstruction: This is a narrative simulation, not a prediction.');
  parts.push('Offer it as a structural story the user can walk through. Do not present it as truth.');
  parts.push('[/BUILDING STORY SIMULATION]\n');

  return parts.join('\n') + '\n';
}