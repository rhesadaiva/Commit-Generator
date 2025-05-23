/**
 * AI integration using OpenAI API
 */
import { OpenAI } from "jsr:@openai/openai";
import { AI_CONFIG } from "./config.ts";
import { Logger } from "./logger.ts";
import { GeneratedCommit } from "./types.ts";

export class AIService {
    private static client: OpenAI;

    /**
     * Initialize the OpenAI client with API key
     */
    static initialize(): void {
        const apiKey = Deno.env.get("DEEPSEEK_API_KEY");
        const baseURL = AI_CONFIG.BASE_URL;
        if (!apiKey) {
            throw new Error("DEEPSEEK_API_KEY environment variable is not set");
        }

        AIService.client = new OpenAI({
            baseURL,
            apiKey,
        });
    }

    /**
     * Generate commit message and description using OpenAI
     */
    static async generateCommit(
        diff: string,
        type: string,
        language: string,
    ): Promise<GeneratedCommit> {
        try {
            // Initialize client if not already done
            if (!AIService.client) {
                AIService.initialize();
            }

            // Truncate diff if too large
            const truncatedDiff = diff.length > AI_CONFIG.MAX_DIFF_LENGTH
                ? diff.substring(0, AI_CONFIG.MAX_DIFF_LENGTH) + "... [truncated]"
                : diff;

            // Create language-specific prompts
            const systemContent = language === "indonesian"
                ? `Kamu adalah generator pesan commit Git yang mengikuti spesifikasi conventional commits.
           Hasilkan pesan commit yang jelas dan ringkas berdasarkan git diff yang diberikan.
           Tipe commit akan berupa '${type}'.
           Ikuti pedoman berikut:
           1. Mulai dengan SATU baris judul singkat (maksimum 72 karakter), ini adalah pesan commit
           2. Sertakan deskripsi terpisah dengan dua bagian:
              - Perubahan: Jelaskan perubahan yang dilakukan
              - Alasan Perubahan: Jelaskan alasan perubahan
           3. Fokus pada tujuan dan dampak perubahan
           4. Format respons sebagai:
              ${type}: pesan commit
              Deskripsi:
                Perubahan:
                Alasan Perubahan:
           5. Jaga agar pesan tetap profesional dan teknis`
                : `You are a Git commit message generator that follows conventional commits specification.
           Generate a concise, clear commit message based on the git diff provided.
           The commit type will be '${type}'.
           Follow these guidelines:
           1. Start with ONE brief subject line (max 72 chars), this is the commit message
           2. Include a separate description with two sections:
              - What: Describe the changes made
              - Why: Explain the reason for the changes
           3. Focus on the purpose and impact of the changes
           4. Format the response as:
              ${type}: commit message
              Description:
                What:
                Why:
           6. Keep the message professional and technical`;

            const userContent = language === "indonesian"
                ? `Ini adalah git diff untuk perubahan yang di-staged:\n\n${truncatedDiff}\n\nHasilkan pesan commit konvensional dengan tipe '${type}'. Pisahkan dengan jelas antara pesan commit (satu baris) dan deskripsi (format markdown).`
                : `Here's the git diff for my staged changes:\n\n${truncatedDiff}\n\nGenerate a conventional commit message with type '${type}'. Clearly separate the commit message (one line) and description .`;

            // Call OpenAI API
            const response = await AIService.client.chat.completions.create({
                model: AI_CONFIG.MODEL,
                messages: [
                    {
                        role: "system",
                        content: systemContent,
                    },
                    {
                        role: "user",
                        content: userContent,
                    },
                ],
                max_tokens: AI_CONFIG.MAX_TOKENS,
                temperature: AI_CONFIG.TEMPERATURE,
            });

            // Extract content from response
            const content = response.choices[0].message.content?.trim() || "";

            // Parse the content to separate message and description
            const parts = content.split(/\n+/, 2);
            const message = parts[0].trim();
            const description = parts.length > 1
                ? content.substring(parts[0].length).trim()
                : "";
            // Ensure the message has the type prefix

            console.log(message);
            console.log(description);

            return { message, description };
        } catch (error: any) {
            Logger.error("Failed to generate commit message", error);
            throw error;
        }
    }
}
