import { parse } from "jsr:@std/flags@0.218.2";
import { Select } from "@cliffy/prompt";
import { blue, bold, yellow } from "jsr:@std/fmt/colors";

import { COMMIT_TYPES, LANGUAGE_OPTIONS, VERSION } from "./modules/config.ts";
import { Logger } from "./modules/logger.ts";
import { GitService } from "./modules/git.ts";
import { AIService } from "./modules/ai.ts";
import { EditorService } from "./modules/editor.ts";
import {
    formatCommitTypeOptions,
    formatLanguageOptions,
} from "./utils/format.ts";

function showHelp(): void {
    console.log(`
${bold(blue("Git Commit Message Generator"))} ${yellow(`v${VERSION}`)}

${bold("USAGE:")}
  git cm [options]

${bold("OPTIONS:")}
  -h, --help     Show this help message
  -v, --version  Show version information
  --path Path to the git repository
  `);
}

/**
 * Main application function: parses args, checks git status,
 * prompts user, generates commit message via AI, allows editing,
 * and performs git commit. Handles errors and user cancellation.
 */
export async function main() {
    const args = parse(Deno.args, {
        boolean: ["help", "version"],
        string: ["path"],
        alias: { h: "help", v: "version", p: "path" },
    });

    if (args.help) {
        showHelp();
        return;
    }

    if (args.version) {
        console.log(`Git Commit Message Generator v${VERSION}`);
        return;
    }

    Logger.header("📝 Git Commit Message Generator");

    try {
        const repoPath = args.path ?? Deno.cwd();
        if (!await GitService.isGitRepository(repoPath)) {
            Logger.error("Not a git repository");
            Deno.exit(1);
        }

        const stagedFiles = await GitService.getStagedFiles(repoPath);
        if (stagedFiles.length === 0) {
            Logger.warning(
                "No staged changes found. Use 'git add' to stage your changes first.",
            );
            Deno.exit(1);
        }

        Logger.success(`Found ${stagedFiles.length} staged file(s)`);

        const type = await Select.prompt({
            message: "Select commit type:",
            options: formatCommitTypeOptions(COMMIT_TYPES),
        });

        const language = await Select.prompt({
            message: "Select language for commit message:",
            options: formatLanguageOptions(LANGUAGE_OPTIONS),
        });

        Logger.info("Analyzing changes...");
        const diff = await GitService.getStagedDiff(repoPath);

        Logger.info(
            `Generating commit message in ${language === "indonesian" ? "Bahasa Indonesia" : "English"
            }...`,
        );

        const { message, description } = await AIService.generateCommit(
            diff,
            type,
            language,
        );

        Logger.success("Generated commit:");
        Logger.delimiter();

        // Box for Generated Commit Message
        const commitMessageBoxContent = `${message}\n\n${description}`;
        Logger.box("Generated Commit Message ✨", commitMessageBoxContent);

        // Get commit statistics
        const diffStats = await GitService.getDiffStatistics(repoPath);
        const statsContent = [
            `Files changed: ${diffStats.filesChanged}`,
            `Insertions: ${diffStats.insertions}`,
            `Deletions: ${diffStats.deletions}`,
        ].join("\n");

        // Box for Commit Statistics
        Logger.box("Commit Statistic 📊", statsContent, blue);

        Logger.delimiter();

        const confirmOption = await Select.prompt({
            message: "What would you like to do with this commit message?",
            options: [
                {
                    name: "Use as is - commit with this message and description",
                    value: "use",
                },
                {
                    name: "Edit - open in editor to modify before committing",
                    value: "edit",
                },
                {
                    name: "Cancel - I'll craft my own message manually",
                    value: "cancel",
                },
            ],
        });

        switch (confirmOption) {
            case "use":
                await GitService.createCommit(message, description, repoPath);
                Logger.success("Commit created successfully!");
                break;

            case "edit": {
                const tempFile = await GitService.createCommitMessageFile(
                    message,
                    description,
                );

                try {
                    Logger.info("Opening editor to modify commit message...");
                    Logger.info("- First line: Commit message (title)");
                    Logger.info("- Leave one blank line");
                    Logger.info("- Rest: Commit description (markdown format)");

                    const editor = await EditorService.findAvailableEditor();
                    await EditorService.openEditor(tempFile, editor);

                    Logger.info(
                        "Editor closed. Proceeding with edited commit message...",
                    );

                    await GitService.commitWithMessageFile(tempFile, repoPath);
                    Logger.success("Commit created successfully with edited message!");
                } finally {
                    try {
                        await Deno.remove(tempFile);
                    } catch {
                        // Ignore cleanup errors
                    }
                }
                break;
            }

            case "cancel":
                Logger.warning(
                    "Commit cancelled. You can create your own commit message with 'git commit'.",
                );
                break;
        }
    } catch (error) {
        // Use the error message expected by the tests
        Logger.error("Failed to generate commit", error);
        Deno.exit(1);
    }
}

if (import.meta.main) {
    try {
        await main();
    } catch (error) {
        // This catch block might not be reached if main() already called Deno.exit()
        // but it's good practice to keep it for truly unexpected errors before/after main's try/catch.
        Logger.error("An unexpected error occurred", error);
        Deno.exit(1);
    }
}
