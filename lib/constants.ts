// Topic Types
export const TOPIC_TYPES = [
  "Deities",
  "Practices",
  "Core Teachings",
  "Texts",
  "Historical Figures",
] as const;

export type TopicType = typeof TOPIC_TYPES[number];

// Category Types
export const CATEGORY_TYPES = [
  "Empowerments",
  "General Advice",
  "Mantras",
  "Mudras",
  "Practices",
  "Teachings",
  "Transmissions"
] as const;

export type CategoryType = typeof CATEGORY_TYPES[number];
