/**
 * Formatting utilities for the application
 */

import { CommitType, LanguageOption } from "../modules/types.ts";

export function formatCommitTypeOptions(
  types: CommitType[],
): Array<{ name: string; value: string }> {
  return types.map((type) => ({
    name: `${type.emoji} ${type.value.padEnd(8)} - ${type.description}`,
    value: type.value,
  }));
}

export function formatLanguageOptions(
  languages: LanguageOption[],
): Array<{ name: string; value: string }> {
  return languages.map((lang) => ({
    name: `${lang.flag} ${lang.name}`,
    value: lang.value,
  }));
}

export function formatCommitOutput(
  message: string,
  description: string,
): string {
  return `Commit message:\n${message}\n\nCommit description:\n${description}`;
}
