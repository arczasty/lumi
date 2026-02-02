import * as z from 'zod';
import { genkit } from 'genkit';
import { googleAI, gemini15Flash } from '@genkit-ai/googleai';
import { onFlow, noAuth } from '@genkit-ai/firebase/functions';
import { CONFIG } from './config';

// Initialize Genkit 0.9.0
const ai = genkit({
    plugins: [googleAI()],
    model: gemini15Flash, // Default model
});

// Define the Input/Output Schemas for Triage
const TriageInputSchema = z.object({
    dreamText: z.string(),
    userId: z.string(), // For future context retrieval
});

const TriageOutputSchema = z.object({
    sentiment: z.enum(['Positive', 'Negative', 'Neutral', 'Anxiety', 'Bliss']),
    symbols: z.array(z.string()),
    safetyFlag: z.boolean(),
    lumiResponse: z.string(), // A short, empathetic 1-sentence acknowledgement
});

/**
 * TRIAGE DREAM FLOW
 * Lightweight, fast analysis using Gemini Flash.
 * Triggered immediately after a dream is logged.
 */
export const triageDream = onFlow(
    ai,
    {
        name: 'triageDream',
        inputSchema: TriageInputSchema,
        outputSchema: TriageOutputSchema,
        authPolicy: noAuth(),
    },
    async (input) => {
        const { dreamText } = input;

        // Call the AI Model
        const llmResponse = await ai.generate({
            prompt: `${CONFIG.prompts.triageSystem}\n\nUser Dream: "${dreamText}"`,
            config: {
                temperature: 0.4, // Balanced for consistency but natural language
            },
            output: {
                schema: TriageOutputSchema
            }
        });

        if (!llmResponse || !llmResponse.output) {
            throw new Error("AI Generation failed");
        }

        // Return the structured output directly
        return llmResponse.output;
    }
);

/**
 * AUDIO PIPELINE (STUB)
 * Triggered when a file is uploaded to gs://users/{userId}/audio/...
 * 1. Transcribes via Deepgram/Whisper
 * 2. Calls triageDream flow with text
 */
// export const processAudio = onObjectFinalized( ... );
