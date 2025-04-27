/**
 * Git operations module
 */
import { exists } from "jsr:@std/fs@0.216.0";
import { resolve } from "jsr:@std/path@0.216.0";
import { Logger } from "./logger.ts";

export class GitService {
    /**
     * Check if a directory is a git repository
     * @param repoPath Path to the repository (defaults to current directory)
     */
    static async isGitRepository(
        repoPath: string = Deno.cwd(),
    ): Promise<boolean> {
        const gitDir = resolve(repoPath, ".git");
        console.log(gitDir);
        return await exists(gitDir);
    }

    /**
     * Execute a git command and return its output
     * @param args Git command arguments
     * @param repoPath Path to the repository (defaults to current directory)
     */
    static async runGitCommand(
        args: string[],
        repoPath: string = Deno.cwd(),
    ): Promise<string> {
        const cmd = new Deno.Command("git", {
            args,
            cwd: repoPath,
        });
        const { stdout, stderr, success } = await cmd.output();

        if (!success) {
            throw new Error(
                `Git command failed: ${new TextDecoder().decode(stderr)}`,
            );
        }

        return new TextDecoder().decode(stdout);
    }

    /**
     * Get diff of staged changes
     * @param repoPath Path to the repository (defaults to current directory)
     */
    static async getStagedDiff(repoPath: string = Deno.cwd()): Promise<string> {
        try {
            return await GitService.runGitCommand(["diff", "--staged"], repoPath);
        } catch (error) {
            Logger.error("Failed to get git diff", error);
            throw error;
        }
    }

    /**
     * Get list of staged files
     * @param repoPath Path to the repository (defaults to current directory)
     */
    static async getStagedFiles(
        repoPath: string = Deno.cwd(),
    ): Promise<string[]> {
        try {
            const output = await GitService.runGitCommand([
                "diff",
                "--staged",
                "--name-only",
            ], repoPath);
            return output.trim().split("\n").filter(Boolean);
        } catch (error) {
            Logger.error("Failed to get staged files", error);
            throw error;
        }
    }

    /**
     * Get contents of a specific file
     */
    static async getFileContents(filePath: string): Promise<string> {
        try {
            const output = await GitService.runGitCommand(["show", `:${filePath}`]);
            return output;
        } catch (error) {
            Logger.error(`Failed to get contents of file ${filePath}`, error);
            return "";
        }
    }

    /**
     * Create a commit with message and description
     * @param message Commit message
     * @param description Commit description (optional)
     * @param repoPath Path to the repository (defaults to current directory)
     */
    static async createCommit(
        message: string,
        description?: string,
        repoPath: string = Deno.cwd(),
    ): Promise<void> {
        try {
            if (description) {
                // Use the commit command with separate -m flags for title and description
                await GitService.runGitCommand([
                    "commit",
                    "-m",
                    message,
                    "-m",
                    description,
                ], repoPath);
            } else {
                // Just use the message if no description
                await GitService.runGitCommand(["commit", "-m", message], repoPath);
            }

            Logger.success("Commit successfully created!");
        } catch (error) {
            Logger.error("Failed to create commit", error);
            throw error;
        }
    }

    /**
     * Create a temporary file with commit message content
     */
    static async createCommitMessageFile(
        message: string,
        description?: string,
    ): Promise<string> {
        try {
            // Create content for commit message file
            let content = message;
            if (description) {
                content += `\n\n${description}`;
            }

            // Create a temporary file
            const tempFile = await Deno.makeTempFile({
                prefix: "commit-msg-",
                suffix: ".txt",
            });
            await Deno.writeTextFile(tempFile, content);

            return tempFile;
        } catch (error) {
            Logger.error("Failed to create commit message file", error);
            throw error;
        }
    }

    /**
     * Read content from a file
     */
    static async readCommitMessageFile(
        filePath: string,
    ): Promise<{ message: string; description: string }> {
        try {
            const content = await Deno.readTextFile(filePath);
            const lines = content.split("\n");

            // First line is the commit message
            const message = lines[0].trim();

            // Rest is the description (skip empty line after message)
            const description = lines.slice(2).join("\n").trim();

            return { message, description };
        } catch (error) {
            Logger.error("Failed to read commit message file", error);
            throw error;
        }
    }

    /**
     * Get statistics (files changed, insertions, deletions) from staged diff
     * @param repoPath Path to the repository (defaults to current directory)
     */
    static async getDiffStatistics(repoPath: string = Deno.cwd()): Promise<{
        filesChanged: number;
        insertions: number;
        deletions: number;
    }> {
        try {
            const output = await GitService.runGitCommand([
                "diff",
                "--staged",
                "--numstat",
            ], repoPath);

            const lines = output.trim().split("\n").filter(Boolean);
            let insertions = 0;
            let deletions = 0;

            lines.forEach((line) => {
                const [additions, removals] = line.split("\t").slice(0, 2);
                insertions += parseInt(additions, 10) || 0;
                deletions += parseInt(removals, 10) || 0;
            });

            return {
                filesChanged: lines.length,
                insertions,
                deletions,
            };
        } catch (error) {
            Logger.error("Failed to get diff statistics", error);
            throw error;
        }
    }

    /**
     * Create a commit using the content of a file for the message
     * @param filePath Path to the file containing the commit message
     * @param repoPath Path to the repository (defaults to current directory)
     */
    static async commitWithMessageFile(
        filePath: string,
        repoPath: string = Deno.cwd(),
    ): Promise<void> {
        try {
            await GitService.runGitCommand(["commit", "-F", filePath], repoPath);
            Logger.success("Commit successfully created!");
        } catch (error) {
            Logger.error("Failed to create commit from file", error);
            throw error;
        }
    }
}
