/**
 * Logging utilities for consistent terminal output
 */
import { blue, bold, cyan, green, red, yellow } from "jsr:@std/fmt/colors";
import boxen from "npm:boxen";

export class Logger {
    /**
     * Log a success message
     */
    static success(message: string): void {
        console.log(green(`✅ ${message}`));
    }

    /**
     * Log an error message
     */
    static error(message: string, error?: Error): void {
        console.error(red(`❌ ${message}`), error ? error.message : "");
    }

    /**
     * Log a warning message
     */
    static warning(message: string): void {
        console.log(yellow(`⚠️  ${message}`));
    }

    /**
     * Log an info message
     */
    static info(message: string): void {
        console.log(blue(`ℹ️  ${message}`));
    }

    /**
     * Log app header
     */
    static header(text: string): void {
        console.log(bold(blue(`\n${text}`)));
    }

    /**
     * Log a message with a delimiter
     */
    static section(title: string, content: string): void {
        console.log(yellow(`${title}:`));
        console.log(content);
    }

    /**
     * Create a boxed delimiter
     */
    static delimiter(): void {
        console.log(cyan("----------"));
    }

    /**
     * Create a boxed section with a title and content
     * @param title Box title
     * @param content Box content
     * @param color Color for the box (default: green)
     */
    static box(
        title: string,
        content: string,
        color: string,
    ): void {
        console.log(
            boxen(content, {
                padding: 1,
                title,
                titleAlignment: "center",
                borderColor: color,
                width: 100,
            }),
        );
    }
}
