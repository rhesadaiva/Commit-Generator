/**
 * Configuration settings and constants
 */
import { CommitType, LanguageOption } from "./types.ts";

// App configuration
export const VERSION = "1.0.0";

// Commit types based on conventional commits specification
export const COMMIT_TYPES: CommitType[] = [
  { value: "feat", name: "feat", description: "A new feature", emoji: "✨" },
  { value: "fix", name: "fix", description: "A bug fix", emoji: "🐛" },
  {
    value: "docs",
    name: "docs",
    description: "Documentation only changes",
    emoji: "📚",
  },
  {
    value: "style",
    name: "style",
    description: "Changes that do not affect the meaning of the code",
    emoji: "💎",
  },
  {
    value: "refactor",
    name: "refactor",
    description: "A code change that neither fixes a bug nor adds a feature",
    emoji: "📦",
  },
  {
    value: "perf",
    name: "perf",
    description: "A code change that improves performance",
    emoji: "🚀",
  },
  {
    value: "test",
    name: "test",
    description: "Adding missing tests or correcting existing tests",
    emoji: "🧪",
  },
  {
    value: "build",
    name: "build",
    description:
      "Changes that affect the build system or external dependencies",
    emoji: "🔧",
  },
  {
    value: "ci",
    name: "ci",
    description: "Changes to our CI configuration files and scripts",
    emoji: "🔄",
  },
  {
    value: "chore",
    name: "chore",
    description: "Other changes that don't modify src or test files",
    emoji: "🧹",
  },
  {
    value: "revert",
    name: "revert",
    description: "Reverts a previous commit",
    emoji: "⏪",
  },
];

// Language options
export const LANGUAGE_OPTIONS: LanguageOption[] = [
  { value: "english", name: "English", flag: "🇺🇸" },
  { value: "indonesian", name: "Bahasa Indonesia", flag: "🇮🇩" },
];

// AI model configuration
export const AI_CONFIG = {
  // Maximum length of diff to send to AI service
  MAX_DIFF_LENGTH: 10000,
  // Token limit for AI response
  MAX_TOKENS: 1000,
  // Temperature setting for AI response (0.0 to 1.0)
  TEMPERATURE: 0.5,
  // Model to use for OpenAI API
  MODEL: "deepseek-coder", // Use appropriate model name

  BASE_URL: "https://api.deepseek.com",

  API_KEY: Deno.env.get("DEEPSEEK_API_KEY"),
};
