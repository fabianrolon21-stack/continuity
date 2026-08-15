export const CAPABILITY_CATEGORIES = ['PRODUCTIVITY', 'RESEARCH', 'CONTENT', 'COMPUTATION', 'AUTOMATION', 'DEVELOPMENT', 'DATA'];
export const RISK_LEVELS = ['LOW', 'MEDIUM', 'HIGH'];

export const isCapability = value => Boolean(value?.id && CAPABILITY_CATEGORIES.includes(value.category) && RISK_LEVELS.includes(value.riskLevel));