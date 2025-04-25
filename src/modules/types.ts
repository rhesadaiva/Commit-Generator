/**
 * Type definitions for the Git Commit Message Generator
 */

export interface CommitType {
  value: string;
  name: string;
  description: string;
  emoji?: string;
}

export interface LanguageOption {
  value: string;
  name: string;
  flag: string;
}

export interface CommitMessage {
  type: string;
  scope?: string;
  subject: string;
  body?: string;
  footer?: string;
}

export interface GeneratedCommit {
  message: string;
  description: string;
}
