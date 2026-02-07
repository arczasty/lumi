/**
 * Centralized Model Configuration for AI
 *
 * This file serves as the single source of truth for all AI models used in the application.
 * It handles:
 * 1. Model selection for different tasks (Dream Analysis, Image Generation, etc.)
 * 2. Environment variable loading for API keys and model overrides
 * 3. Fallback logic ensuring stability
 *
 * Usage:
 * import { MODELS } from "./lib/models";
 * const model = MODELS.dreamAnalysis;
 */

const getEnvModel = (key: string, defaultModel: string): string => {
    // In Convex, process.env gives access to environment variables set in the dashboard
    return process.env[key] || defaultModel;
};

export const MODELS = {
    // Dream Analysis (Text)
    // Default: Claude 3.5 Sonnet (Best balance of reasoning and creativity)
    dreamAnalysis: getEnvModel("AI_MODEL_DREAM_ANALYSIS", "anthropic/claude-3.5-sonnet"),

    // Dream Analysis (Audio Transcription + Vision)
    // Default: Gemini 1.5 Flash (Fast, multimodal, huge context)
    audioAnalysis: getEnvModel("AI_MODEL_AUDIO_ANALYSIS", "google/gemini-flash-1.5"),

    // Image Generation
    // Default: Flux 1.1 Pro (High quality, artistic)
    imageGeneration: getEnvModel("AI_MODEL_IMAGE_GENERATION", "black-forest-labs/flux.2-klein-4b"),
} as const;

export type AITask = keyof typeof MODELS;

export const getDescription = (task: AITask): string => {
    switch (task) {
        case "dreamAnalysis": return "Dream Analysis (Text)";
        case "audioAnalysis": return "Audio Transcription & Analysis";
        case "imageGeneration": return "Image Generation";
        default: return "Unknown Task";
    }
};
