// Topic and Category Types
// These are the allowed values for the type field in topics and categories tables
export const TOPIC_CATEGORY_TYPES = [
  "Deities",
  "Practices",
  "Core Teachings",
  "Texts",
  "Historical Figures",
] as const;

export type TopicCategoryType = typeof TOPIC_CATEGORY_TYPES[number];
