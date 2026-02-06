"use node";
import { v } from "convex/values";
import { action, internalMutation } from "./_generated/server";
import { api, internal } from "./_generated/api";

// ============================================================================
// AI LOGGING UTILITIES
// ============================================================================

type LogLevel = "INFO" | "DEBUG" | "WARN" | "ERROR";

interface AILogContext {
    operation: string;
    dreamId?: string;
    model?: string;
    startTime?: number;
}

const aiLog = (level: LogLevel, context: AILogContext, message: string, data?: Record<string, any>) => {
    const timestamp = new Date().toISOString();
    const prefix = `[AI:${context.operation}]`;
    const logData = {
        timestamp,
        level,
        operation: context.operation,
        dreamId: context.dreamId,
        model: context.model,
        elapsedMs: context.startTime ? Date.now() - context.startTime : undefined,
        ...data
    };

    // Remove undefined values for cleaner logs
    Object.keys(logData).forEach(key => {
        if (logData[key as keyof typeof logData] === undefined) {
            delete logData[key as keyof typeof logData];
        }
    });

    const logMessage = `${prefix} ${message}`;

    switch (level) {
        case "ERROR":
            console.error(logMessage, JSON.stringify(logData, null, 2));
            break;
        case "WARN":
            console.warn(logMessage, JSON.stringify(logData, null, 2));
            break;
        case "DEBUG":
            console.log(logMessage, JSON.stringify(logData, null, 2));
            break;
        default:
            console.log(logMessage, JSON.stringify(logData, null, 2));
    }
};

const logRequest = (context: AILogContext, requestDetails: Record<string, any>) => {
    aiLog("INFO", context, "Starting AI request", {
        phase: "REQUEST",
        ...requestDetails
    });
};

const logResponse = (context: AILogContext, responseDetails: Record<string, any>) => {
    aiLog("INFO", context, "AI response received", {
        phase: "RESPONSE",
        ...responseDetails
    });
};

const logError = (context: AILogContext, error: any, additionalInfo?: Record<string, any>) => {
    aiLog("ERROR", context, "AI operation failed", {
        phase: "ERROR",
        errorType: error?.name || "Unknown",
        errorMessage: error?.message || String(error),
        errorStack: error?.stack?.substring(0, 500),
        ...additionalInfo
    });
};

const logParsing = (context: AILogContext, success: boolean, details?: Record<string, any>) => {
    aiLog(success ? "DEBUG" : "WARN", context, success ? "Response parsed successfully" : "Response parsing issue", {
        phase: "PARSING",
        success,
        ...details
    });
};

// ============================================================================
// STANDARDIZED AI OUTPUT SCHEMA
// ============================================================================

// ============================================================================
// STANDARDIZED AI OUTPUT SCHEMA (The Master Truth Mirror)
// ============================================================================

const SENTIMENT_CATEGORIES = {
    NEGATIVE: ["Anxiety", "Fear", "Grief", "Confusion", "Frustration", "Guilt", "Shame", "Anger", "Isolation", "Vulnerability"],
    POSITIVE: ["Joy", "Euphoria", "Peace", "Empowerment", "Awe", "Love", "Hope", "Relief", "Clarity", "Freedom", "Play"],
    COMPLEX: ["Mystery", "Nostalgia", "Longing", "Transformation", "Surrender", "Neutral", "Ambivalence", "Lucidity"]
} as const;

const ALL_SENTIMENTS = [
    ...SENTIMENT_CATEGORIES.NEGATIVE,
    ...SENTIMENT_CATEGORIES.POSITIVE,
    ...SENTIMENT_CATEGORIES.COMPLEX
] as const;

const ARCHETYPES = [
    // The Core Self
    "The Self", "The Persona", "The Shadow", "The Anima/Animus",
    // The Journey
    "The Hero", "The Explorer", "The Innocent", "The Orphan",
    // The Guidance / Chaos
    "The Wise Old Man", "The Great Mother", "The Trickster", "The Magician",
    // Social / Power
    "The Ruler", "The Caregiver", "The Lover", "The Rebel", "The Creator", "The Jester"
] as const;

type ValidSentiment = typeof ALL_SENTIMENTS[number];
type ValidArchetype = typeof ARCHETYPES[number];

/**
 * Normalize sentiment to valid value (fallback to Mystery if invalid)
 */
const normalizeSentiment = (sentiment: string): ValidSentiment => {
    const normalized = ALL_SENTIMENTS.find(
        s => s.toLowerCase() === sentiment?.toLowerCase()
    );
    return normalized || "Mystery";
};

/**
 * Generate the standard prompt for dream analysis
 */
const getAnalysisSystemPrompt = (userIntent?: string): string => {
    const intentContext = userIntent
        ? getIntentDescription(userIntent)
        : "exploring their subconscious";

    return `You are Lumi, a wise, poetic, and deep Jungian Dream Guide. 
Your voice is warm, empathetic, and slightly mystical (think Studio Ghibli meets Carl Jung).

THE USER'S GOAL: ${intentContext}

TASK:
Analyze the user's dream with deep psychological insight. Avoid generic specific interpretations; look for the "soul" of the dream.

OUTPUT REQUIREMENTS:
Return a JSON object with EXACTLY this structure:
{
    "interpretation": "A deep, 3-4 sentence Jungian interpretation. Focus on the 'why' and the inner conflict or growth.",
    "sentiment": "ONE value from: ${ALL_SENTIMENTS.join(', ')}",
    "secondary_sentiments": ["Optional: 1-2 other sentiments from the list"],
    "symbols": ["3-5 specific symbols found in the dream"],
    "archetypes": ["Optional: 1-2 Jungian archetypes if clearly present from: ${ARCHETYPES.join(', ')}"],
    "lumi_quote": "A single, beautiful, poetic sentence acknowledging the dreamer's journey.",
    "guidance": "A short, actionable reflection prompt (e.g., 'Ask yourself where in life you feel...')"
}

STRICT RULES:
1. 'sentiment' MUST be one of the provided list.
2. Be sensitive but honest about negative emotions (Anxiety, Grief, Shadow).
3. Do not be overly clinical; be human and soulful.
4. JSON only.
`;
};

const getIntentDescription = (intent: string): string => {
    switch (intent?.toLowerCase()) {
        case 'shadow': return 'confronting repressed fears and shadow self';
        case 'mirror': return 'seeking deep self-reflection and truth';
        case 'fog': return 'finding clarity in confusion';
        case 'control': return 'mastering the dream state (lucidity)';
        default: return 'understanding the deeper self';
    }
};

// ============================================================================
// AI ACTIONS
// ============================================================================

// ============================================================================
// AI ACTIONS
// ============================================================================

export const transcribeAndAnalyze = action({
    args: {
        dreamId: v.id("dreams"),
        storageId: v.string(), // Convex storage ID for the audio file
    },
    handler: async (ctx, args) => {
        const MODEL = "google/gemini-flash-1.5";
        const startTime = Date.now();
        const logCtx: AILogContext = {
            operation: "transcribeAndAnalyze",
            dreamId: args.dreamId,
            model: MODEL,
            startTime
        };

        logRequest(logCtx, {
            storageId: args.storageId,
            endpoint: "openrouter.ai/chat/completions"
        });

        const api_key = process.env.OPENROUTER_API_KEY;
        if (!api_key) {
            logError(logCtx, new Error("OPENROUTER_API_KEY is not set"), { phase: "CONFIG" });
            throw new Error("OPENROUTER_API_KEY is not set");
        }

        // 1. Get the audio blob from Convex storage
        const audioBlob = await ctx.storage.get(args.storageId);
        if (!audioBlob) {
            logError(logCtx, new Error("Audio file not found in storage"), { storageId: args.storageId });
            throw new Error("Audio file not found in storage");
        }

        // 2. Convert to base64
        const audioBuffer = await audioBlob.arrayBuffer();
        const base64Audio = Buffer.from(audioBuffer).toString("base64");
        const audioSizeKB = Math.round(base64Audio.length / 1024);

        aiLog("DEBUG", logCtx, "Audio prepared for API", {
            phase: "PREPARATION",
            audioSizeKB,
            audioFormat: "m4a"
        });

        // 3. Call OpenRouter with Gemini 1.5 Flash
        try {
            const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
                method: "POST",
                headers: {
                    Authorization: `Bearer ${api_key} `,
                    "Content-Type": "application/json",
                    "X-Title": "Lumi App",
                },
                body: JSON.stringify({
                    model: MODEL,
                    messages: [
                        {
                            role: "system",
                            content: `You are Lumi, a Jungian Dream Guide.Your tone is warm and poetic.
    First, transcribe the user's dream recording perfectly.
Then, provide a deep Jungian analysis.

Return a JSON object with EXACTLY this structure:
{
    "transcription": "The full text of the dream recording",
        "interpretation": "A deep, empathetic Jungian insight (3-4 sentences)",
            "sentiment": "EXACTLY ONE of: ${ALL_SENTIMENTS.join(', ')}",
                "symbols": ["3-5 core symbols as short phrases"],
                    "lumi_quote": "A short 1-sentence poetic acknowledgement"
}

IMPORTANT: sentiment MUST be EXACTLY one of: ${ALL_SENTIMENTS.join(', ')} `
                        },
                        {
                            role: "user",
                            content: [
                                {
                                    type: "text",
                                    text: "Transcribe and analyze this dream recording."
                                },
                                {
                                    type: "image_url",
                                    url: `data:audio/m4a;base64,${base64Audio}`
                                }
                            ]
                        }
                    ],
                    response_format: { type: "json_object" }
                })
            });

            const data = await response.json() as any;

            // Log raw response metadata
            logResponse(logCtx, {
                httpStatus: response.status,
                hasError: !!data.error,
                hasChoices: !!data.choices?.length,
                usage: data.usage,
                responseId: data.id
            });

            if (data.error) {
                logError(logCtx, new Error(data.error.message || "Unknown API error"), {
                    apiErrorCode: data.error.code,
                    apiErrorType: data.error.type,
                    rawError: JSON.stringify(data.error).substring(0, 500)
                });
                throw new Error(`AI analysis failed: ${data.error.message || "Unknown error"} `);
            }

            const content = data.choices?.[0]?.message?.content;
            if (!content) {
                logError(logCtx, new Error("Empty response from AI"), {
                    choicesCount: data.choices?.length,
                    finishReason: data.choices?.[0]?.finish_reason
                });
                throw new Error("Empty response from AI");
            }

            // Parse the response
            let result;
            try {
                const rawResult = JSON.parse(content);

                // Normalize result to ensure strict adherence to schema
                result = {
                    transcription: rawResult.transcription || "",
                    interpretation: rawResult.interpretation || "No interpretation provided.",
                    sentiment: normalizeSentiment(rawResult.sentiment),
                    secondary_sentiments: Array.isArray(rawResult.secondary_sentiments) ? rawResult.secondary_sentiments.map((s: any) => normalizeSentiment(s)).slice(0, 3) : [],
                    symbols: Array.isArray(rawResult.symbols) ? rawResult.symbols.slice(0, 5) : [],
                    archetypes: Array.isArray(rawResult.archetypes) ? rawResult.archetypes.slice(0, 3) : [],
                    lumi_quote: rawResult.lumi_quote || "Dreams reflect the hidden self.",
                    guidance: rawResult.guidance || ""
                };

                logParsing(logCtx, true, {
                    hasTranscription: !!result.transcription,
                    transcriptionLength: result.transcription?.length,
                    hasInterpretation: !!result.interpretation,
                    sentiment: result.sentiment,
                    symbolsCount: result.symbols?.length,
                    hasLumiQuote: !!result.lumi_quote
                });
            } catch (parseError) {
                logParsing(logCtx, false, {
                    contentPreview: content.substring(0, 200),
                    parseError: String(parseError)
                });
                throw new Error("Failed to parse AI response as JSON");
            }

            // 4. Update the dream record with both transcription and analysis
            await ctx.runMutation(internal.ai.updateDreamResults, {
                id: args.dreamId,
                text: result.transcription,
                interpretation: result.interpretation,
                sentiment: result.sentiment,
                secondary_sentiments: result.secondary_sentiments,
                symbols: result.symbols,
                archetypes: result.archetypes,
                lumi_quote: result.lumi_quote,
                guidance: result.guidance,
            });

            aiLog("INFO", logCtx, "Transcription and analysis complete", {
                phase: "COMPLETE",
                totalDurationMs: Date.now() - startTime,
                transcriptionLength: result.transcription?.length,
                sentiment: result.sentiment,
                symbolsCount: result.symbols?.length
            });

            return result;
        } catch (error) {
            logError(logCtx, error, { phase: "API_CALL" });
            throw error;
        }
    },
});

export const analyzeDream = action({
    args: {
        dreamId: v.id("dreams"),
        text: v.string(),
    },
    handler: async (ctx, args) => {
        const MODEL = "anthropic/claude-3.5-sonnet";
        const startTime = Date.now();
        const logCtx: AILogContext = {
            operation: "analyzeDream",
            dreamId: args.dreamId,
            model: MODEL,
            startTime
        };

        logRequest(logCtx, {
            textLength: args.text.length,
            textPreview: args.text.substring(0, 100),
            endpoint: "openrouter.ai/chat/completions"
        });

        const api_key = process.env.OPENROUTER_API_KEY;
        if (!api_key) {
            logError(logCtx, new Error("OPENROUTER_API_KEY is not set"), { phase: "CONFIG" });
            throw new Error("OPENROUTER_API_KEY is not set");
        }

        try {
            const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
                method: "POST",
                headers: {
                    Authorization: `Bearer ${api_key} `,
                    "Content-Type": "application/json",
                    "X-Title": "Lumi App",
                },
                body: JSON.stringify({
                    model: MODEL,
                    messages: [
                        {
                            role: "system",
                            content: getAnalysisSystemPrompt() // Use standardized prompt (no intent context here for now)
                        },
                        {
                            role: "user",
                            content: args.text
                        }
                    ],
                    response_format: { type: "json_object" }
                })
            });

            const data = await response.json() as any;

            // Log raw response metadata
            logResponse(logCtx, {
                httpStatus: response.status,
                hasError: !!data.error,
                hasChoices: !!data.choices?.length,
                usage: data.usage,
                responseId: data.id,
                promptTokens: data.usage?.prompt_tokens,
                completionTokens: data.usage?.completion_tokens,
                totalTokens: data.usage?.total_tokens
            });

            if (data.error) {
                logError(logCtx, new Error(data.error.message || "Unknown API error"), {
                    apiErrorCode: data.error.code,
                    apiErrorType: data.error.type,
                    rawError: JSON.stringify(data.error).substring(0, 500)
                });
                throw new Error(`AI analysis failed: ${data.error.message || "Unknown error"} `);
            }

            const content = data.choices?.[0]?.message?.content;
            if (!content) {
                logError(logCtx, new Error("Empty response from AI"), {
                    choicesCount: data.choices?.length,
                    finishReason: data.choices?.[0]?.finish_reason
                });
                throw new Error("Empty response from AI");
            }

            // Parse the response
            let result;
            try {
                const rawResult = JSON.parse(content);

                // Normalize result to ensure strict adherence to schema
                result = {
                    interpretation: rawResult.interpretation || "No interpretation provided.",
                    sentiment: normalizeSentiment(rawResult.sentiment),
                    secondary_sentiments: Array.isArray(rawResult.secondary_sentiments) ? rawResult.secondary_sentiments.map((s: any) => normalizeSentiment(s)).slice(0, 3) : [],
                    symbols: Array.isArray(rawResult.symbols) ? rawResult.symbols.slice(0, 5) : [],
                    archetypes: Array.isArray(rawResult.archetypes) ? rawResult.archetypes.slice(0, 3) : [],
                    lumi_quote: rawResult.lumi_quote || "Dreams reflect the hidden self.",
                    guidance: rawResult.guidance || ""
                };

                logParsing(logCtx, true, {
                    hasInterpretation: !!result.interpretation,
                    interpretationLength: result.interpretation?.length,
                    sentiment: result.sentiment,
                    symbolsCount: result.symbols?.length,
                    symbols: result.symbols,
                    hasLumiQuote: !!result.lumi_quote
                });
            } catch (parseError) {
                logParsing(logCtx, false, {
                    contentPreview: content.substring(0, 300),
                    parseError: String(parseError)
                });
                throw new Error("Failed to parse AI response as JSON");
            }

            await ctx.runMutation(internal.ai.updateDreamResults, {
                id: args.dreamId,
                interpretation: result.interpretation,
                sentiment: result.sentiment,
                secondary_sentiments: result.secondary_sentiments,
                symbols: result.symbols,
                archetypes: result.archetypes,
                lumi_quote: result.lumi_quote,
                guidance: result.guidance,
            });

            aiLog("INFO", logCtx, "Dream analysis complete", {
                phase: "COMPLETE",
                totalDurationMs: Date.now() - startTime,
                sentiment: result.sentiment,
                symbolsCount: result.symbols?.length,
                interpretationLength: result.interpretation?.length
            });

            return result;
        } catch (error) {
            logError(logCtx, error, { phase: "API_CALL" });
            throw error;
        }
    },
});

export const updateDreamResults = internalMutation({
    args: {
        id: v.id("dreams"),
        text: v.optional(v.string()),
        interpretation: v.optional(v.string()),
        sentiment: v.optional(v.string()),
        secondary_sentiments: v.optional(v.array(v.string())),
        symbols: v.optional(v.array(v.string())),
        archetypes: v.optional(v.array(v.string())),
        lumi_quote: v.optional(v.string()),
        guidance: v.optional(v.string()),
    },
    handler: async (ctx, args) => {
        const { id, ...results } = args;
        await ctx.db.patch(id, results);
    },
});

export const generateDreamImage = action({
    args: {
        dreamId: v.id("dreams"),
        dreamText: v.string(),
    },
    handler: async (ctx, args) => {
        const MODEL = "black-forest-labs/flux-1-schnell"; // Flux is fast & high quality on OpenRouter
        const startTime = Date.now();
        const logCtx: AILogContext = {
            operation: "generateDreamImage",
            dreamId: args.dreamId,
            model: MODEL,
            startTime
        };

        // Create Studio Ghibli style prompt
        const imagePrompt = `Studio Ghibli style illustration, soft pastel watercolor painting, whimsical dreamy atmosphere, gentle lighting, hand - drawn animation aesthetic, magical realism: ${args.dreamText.slice(0, 200)} `;

        logRequest(logCtx, {
            dreamTextLength: args.dreamText.length,
            promptLength: imagePrompt.length,
            promptPreview: imagePrompt.substring(0, 100),
            endpoint: "openrouter.ai/chat/completions"
        });

        const api_key = process.env.OPENROUTER_API_KEY;
        if (!api_key) {
            logError(logCtx, new Error("OPENROUTER_API_KEY is not set"), { phase: "CONFIG" });
            throw new Error("OPENROUTER_API_KEY is not set");
        }

        try {
            const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
                method: "POST",
                headers: {
                    Authorization: `Bearer ${api_key} `,
                    "Content-Type": "application/json",
                    "X-Title": "Lumi App",
                },
                body: JSON.stringify({
                    model: MODEL,
                    messages: [
                        {
                            role: "user",
                            content: imagePrompt
                        }
                    ],
                    modalities: ["image", "text"]
                })
            });

            const data = await response.json() as any;

            // Log raw response metadata
            logResponse(logCtx, {
                httpStatus: response.status,
                hasError: !!data.error,
                hasChoices: !!data.choices?.length,
                usage: data.usage,
                responseId: data.id,
                contentType: typeof data.choices?.[0]?.message?.content
            });

            if (data.error) {
                logError(logCtx, new Error(data.error.message || "Unknown API error"), {
                    apiErrorCode: data.error.code,
                    apiErrorType: data.error.type,
                    rawError: JSON.stringify(data.error).substring(0, 500)
                });
                throw new Error(`Image generation failed: ${data.error.message || "Unknown error"} `);
            }

            // Extract image URL from response
            const messageContent = data.choices?.[0]?.message?.content;

            if (!messageContent) {
                logError(logCtx, new Error("No image content in response"), {
                    choicesCount: data.choices?.length,
                    finishReason: data.choices?.[0]?.finish_reason
                });
                throw new Error("No image content in response");
            }

            // Parse the content - OpenRouter may return image as base64 or URL
            let imageUrl = "";
            let extractionMethod = "unknown";

            // If content is a string, it might be a URL or base64
            if (typeof messageContent === "string") {
                imageUrl = messageContent;
                extractionMethod = "string_direct";
            } else if (Array.isArray(messageContent)) {
                // Content might be an array of parts
                const imagePart = messageContent.find((part: any) => part.type === "image_url");
                if (imagePart?.image_url?.url) {
                    imageUrl = imagePart.image_url.url;
                    extractionMethod = "array_image_url";
                }
            } else if (messageContent.image_url?.url) {
                imageUrl = messageContent.image_url.url;
                extractionMethod = "object_image_url";
            }

            if (!imageUrl) {
                logError(logCtx, new Error("Failed to extract image URL from response"), {
                    contentType: typeof messageContent,
                    isArray: Array.isArray(messageContent),
                    contentKeys: typeof messageContent === "object" ? Object.keys(messageContent) : [],
                    contentPreview: JSON.stringify(messageContent).substring(0, 300)
                });
                throw new Error("Failed to extract image URL from response");
            }

            // Log successful extraction
            aiLog("DEBUG", logCtx, "Image URL extracted successfully", {
                phase: "EXTRACTION",
                extractionMethod,
                imageUrlLength: imageUrl.length,
                isBase64: imageUrl.startsWith("data:"),
                isHttpUrl: imageUrl.startsWith("http")
            });

            // Update dream record with image URL
            await ctx.runMutation(internal.ai.updateDreamImage, {
                id: args.dreamId,
                imageUrl: imageUrl
            });

            aiLog("INFO", logCtx, "Dream image generation complete", {
                phase: "COMPLETE",
                totalDurationMs: Date.now() - startTime,
                extractionMethod,
                imageUrlLength: imageUrl.length
            });

            return { imageUrl };

        } catch (error) {
            logError(logCtx, error, {
                phase: "API_CALL",
                willReturnNull: true
            });
            // Don't fail the whole dream if image generation fails
            // Just log the error and continue
            return { imageUrl: null, error: String(error) };
        }
    },
});

export const updateDreamImage = internalMutation({
    args: {
        id: v.id("dreams"),
        imageUrl: v.string(),
    },
    handler: async (ctx, args) => {
        await ctx.db.patch(args.id, { imageUrl: args.imageUrl });
    },
});
