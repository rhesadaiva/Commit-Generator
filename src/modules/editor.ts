/**
 * Editor integration for editing commit messages
 */
import { Logger } from "./logger.ts";

export class EditorService {
  /**
   * Open a file in the system's default editor (or specified editor)
   * @param filePath Path to the file to edit
   * @param editor Editor to use (defaults to environment variable or vim)
   * @returns Promise that resolves when editing is complete
   */
  static async openEditor(filePath: string, editor?: string): Promise<void> {
    try {
      // Get editor from parameter, environment variable, or default to vim
      const editorToUse = editor || Deno.env.get("EDITOR") ||
        Deno.env.get("VISUAL") || "vim";

      Logger.info(`Opening ${editorToUse} to edit commit message...`);

      // Create command with editor and file path
      const cmd = new Deno.Command(editorToUse, {
        args: [filePath],
        stdin: "inherit",
        stdout: "inherit",
        stderr: "inherit",
      });

      const { success, code } = await cmd.output();

      if (!success) {
        throw new Error(`Editor exited with code ${code}`);
      }
    } catch (error) {
      Logger.error("Failed to open editor", error);
      throw error;
    }
  }

  /**
   * Check if vim is available on the system
   */
  static async isVimAvailable(): Promise<boolean> {
    try {
      const cmd = new Deno.Command("which", { args: ["vim"] });
      const { success } = await cmd.output();
      return success;
    } catch (_error) {
      return false;
    }
  }

  /**
   * Check if nano is available on the system
   */
  static async isNanoAvailable(): Promise<boolean> {
    try {
      const cmd = new Deno.Command("which", { args: ["nano"] });
      const { success } = await cmd.output();
      return success;
    } catch (_error) {
      return false;
    }
  }

  /**
   * Find available editor on the system
   */
  static async findAvailableEditor(): Promise<string> {
    // Check environment variables first
    const envEditor = Deno.env.get("EDITOR") || Deno.env.get("VISUAL");
    if (envEditor) {
      return envEditor;
    }

    // Check for common editors
    if (await EditorService.isVimAvailable()) {
      return "vim";
    }

    if (await EditorService.isNanoAvailable()) {
      return "nano";
    }

    throw new Error(
      "No suitable text editor found. Please set EDITOR environment variable.",
    );
  }
}
