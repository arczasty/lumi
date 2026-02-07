"use node";
import { v } from "convex/values";
import { action, internalAction } from "./_generated/server";
import { api, internal } from "./_generated/api";
import { MODELS } from "./lib/models";
import { ALL_SENTIMENTS, normalizeSentiment } from "./lib/constants";
import { getTranscriptionAnalysisPrompt, getAnalysisSystemPrompt, getImageGenerationPrompt } from "./lib/prompts";

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
        const MODEL = MODELS.audioAnalysis;
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
                            content: getTranscriptionAnalysisPrompt()
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
            let dreamSymbols: any[] = [];
            let dreamArchetypes: any[] = [];
            let dreamEmotions: any[] = [];

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
                    emotions: Array.isArray(rawResult.emotions) ? rawResult.emotions.slice(0, 3) : [],
                    lumi_quote: rawResult.lumi_quote || "Dreams reflect the hidden self.",
                    guidance: rawResult.guidance || ""
                };

                // Helper to process entities with potential definition generation
                const processEntities = async (entities: any[], type: "symbols" | "archetypes" | "emotions") => {
                    const processed = [];
                    for (const entity of entities) {
                        const name = typeof entity === 'string' ? entity : entity.name;
                        const context = typeof entity === 'object' ? entity.context : "";

                        // Check if exists
                        const existing = await ctx.runQuery(
                            type === "symbols" ? api.dreams.getSymbolByName :
                                type === "archetypes" ? api.dreams.getArchetypeByName :
                                    api.dreams.getEmotionByName,
                            { name }
                        );

                        let definition = undefined;
                        let category = undefined;

                        if (!existing) {
                            // Generate definition for new discovery
                            const defResult = await ctx.runAction(internal.ai.generateDefinition, {
                                name,
                                type
                            });
                            definition = defResult.description;
                            category = defResult.category;
                        }

                        processed.push({ name, context, description: definition, category });
                    }
                    return processed;
                };

                // Process structured items
                if (result.symbols.length > 0) {
                    const symbolsWithDefs = await processEntities(rawResult.symbols, "symbols");
                    dreamSymbols = await ctx.runMutation(internal.ai_mutations.processDreamSymbols, {
                        symbols: symbolsWithDefs
                    });
                }

                if (result.archetypes.length > 0) {
                    const archetypesWithDefs = await processEntities(rawResult.archetypes, "archetypes");
                    dreamArchetypes = await ctx.runMutation(internal.ai_mutations.processDreamArchetypes, {
                        archetypes: archetypesWithDefs
                    });
                }

                if (result.emotions.length > 0) {
                    const emotionsWithDefs = await processEntities(rawResult.emotions, "emotions");
                    dreamEmotions = await ctx.runMutation(internal.ai_mutations.processDreamEmotions, {
                        emotions: emotionsWithDefs
                    });
                }

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
            await ctx.runMutation(internal.ai_mutations.updateDreamResults, {
                id: args.dreamId,
                text: result.transcription,
                interpretation: result.interpretation,
                sentiment: result.sentiment,
                secondary_sentiments: result.secondary_sentiments,
                symbols: result.symbols.map((s: any) => typeof s === 'string' ? s : s.name),
                archetypes: result.archetypes.map((a: any) => typeof a === 'string' ? a : a.name),
                lumi_quote: result.lumi_quote,
                guidance: result.guidance,
                dreamSymbols: dreamSymbols,
                dreamArchetypes: dreamArchetypes,
                dreamEmotions: dreamEmotions,
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
        const MODEL = MODELS.dreamAnalysis;
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
            let dreamSymbols: any[] = [];
            let dreamArchetypes: any[] = [];
            let dreamEmotions: any[] = [];

            try {
                const rawResult = JSON.parse(content);

                // Normalize result to ensure strict adherence to schema
                result = {
                    interpretation: rawResult.interpretation || "No interpretation provided.",
                    sentiment: normalizeSentiment(rawResult.sentiment),
                    secondary_sentiments: Array.isArray(rawResult.secondary_sentiments) ? rawResult.secondary_sentiments.map((s: any) => normalizeSentiment(s)).slice(0, 3) : [],
                    symbols: Array.isArray(rawResult.symbols) ? rawResult.symbols.slice(0, 5) : [],
                    archetypes: Array.isArray(rawResult.archetypes) ? rawResult.archetypes.slice(0, 3) : [],
                    emotions: Array.isArray(rawResult.emotions) ? rawResult.emotions.slice(0, 3) : [],
                    lumi_quote: rawResult.lumi_quote || "Dreams reflect the hidden self.",
                    guidance: rawResult.guidance || ""
                };

                // Helper to process entities with potential definition generation
                const processEntities = async (entities: any[], type: "symbols" | "archetypes" | "emotions") => {
                    const processed = [];
                    for (const entity of entities) {
                        const name = typeof entity === 'string' ? entity : entity.name;
                        const context = typeof entity === 'object' ? entity.context : "";

                        // Check if exists
                        const existing = await ctx.runQuery(
                            type === "symbols" ? api.dreams.getSymbolByName :
                                type === "archetypes" ? api.dreams.getArchetypeByName :
                                    api.dreams.getEmotionByName,
                            { name }
                        );

                        let definition = undefined;
                        let category = undefined;

                        if (!existing) {
                            // Generate definition for new discovery
                            const defResult = await ctx.runAction(internal.ai.generateDefinition, {
                                name,
                                type
                            });
                            definition = defResult.description;
                            category = defResult.category;
                        }

                        processed.push({ name, context, description: definition, category });
                    }
                    return processed;
                };

                // Process structured items
                if (result.symbols.length > 0) {
                    const symbolsWithDefs = await processEntities(rawResult.symbols, "symbols");
                    dreamSymbols = await ctx.runMutation(internal.ai_mutations.processDreamSymbols, {
                        symbols: symbolsWithDefs
                    });
                }

                if (result.archetypes.length > 0) {
                    const archetypesWithDefs = await processEntities(rawResult.archetypes, "archetypes");
                    dreamArchetypes = await ctx.runMutation(internal.ai_mutations.processDreamArchetypes, {
                        archetypes: archetypesWithDefs
                    });
                }

                if (result.emotions.length > 0) {
                    const emotionsWithDefs = await processEntities(rawResult.emotions, "emotions");
                    dreamEmotions = await ctx.runMutation(internal.ai_mutations.processDreamEmotions, {
                        emotions: emotionsWithDefs
                    });
                }

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

            await ctx.runMutation(internal.ai_mutations.updateDreamResults, {
                id: args.dreamId,
                interpretation: result.interpretation,
                sentiment: result.sentiment,
                secondary_sentiments: result.secondary_sentiments,
                symbols: result.symbols.map((s: any) => typeof s === 'string' ? s : s.name),
                archetypes: result.archetypes.map((a: any) => typeof a === 'string' ? a : a.name),
                lumi_quote: result.lumi_quote,
                guidance: result.guidance,
                dreamSymbols: dreamSymbols,
                dreamArchetypes: dreamArchetypes,
                dreamEmotions: dreamEmotions,
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

export const generateDefinition = internalAction({
    args: {
        name: v.string(),
        type: v.union(v.literal("symbols"), v.literal("archetypes"), v.literal("emotions")),
    },
    handler: async (ctx, args) => {
        const MODEL = MODELS.dreamAnalysis; // Reuse the analysis model for definitions
        const api_key = process.env.OPENROUTER_API_KEY;

        const systemPrompt = `You are Lumi, a Jungian Dream Guide. 
Your task is to provide a deep, poetic, and psychologically insightful definition for a dream element.
The element is a ${args.type.slice(0, -1)} named "${args.name}".

Return a JSON object with:
{
    "description": "A 2-3 sentence deep Jungian definition.",
    "category": "A single word category (e.g. 'Animals', 'Nature', 'Mental', 'Figure')"
}`;

        try {
            const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
                method: "POST",
                headers: {
                    Authorization: `Bearer ${api_key}`,
                    "Content-Type": "application/json",
                    "X-Title": "Lumi App",
                },
                body: JSON.stringify({
                    model: MODEL,
                    messages: [
                        { role: "system", content: systemPrompt },
                        { role: "user", content: `Define the ${args.type.slice(0, -1)}: ${args.name}` }
                    ],
                    response_format: { type: "json_object" }
                })
            });

            const data = await response.json() as any;
            const content = JSON.parse(data.choices?.[0]?.message?.content || "{}");

            return {
                description: content.description || "A mysterious presence in the dreamscape.",
                category: content.category || "General"
            };
        } catch (error) {
            console.error("Failed to generate definition:", error);
            return {
                description: "A mysterious presence in the dreamscape.",
                category: "General"
            };
        }
    }
});

export const generateDreamImage = action({
    args: {
        dreamId: v.id("dreams"),
        dreamText: v.string(),
    },
    handler: async (ctx, args) => {
        // Use Flux 1.1 Pro - Latest stable high-quality model
        const MODEL = MODELS.imageGeneration;
        const startTime = Date.now();
        const logCtx: AILogContext = {
            operation: "generateDreamImage",
            dreamId: args.dreamId,
            model: MODEL,
            startTime
        };

        // Create Studio Ghibli style prompt
        const imagePrompt = getImageGenerationPrompt(args.dreamText);

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
            // Mark as generating
            await ctx.runMutation(internal.ai_mutations.updateImageStatus, {
                id: args.dreamId,
                status: "generating",
            });

            const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
                method: "POST",
                headers: {
                    Authorization: `Bearer ${api_key}`,
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
                    modalities: ["image"]
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
            const message = data.choices?.[0]?.message;
            const messageContent = message?.content;

            // Detailed logging of the message structure to debug "No image content"
            aiLog("DEBUG", logCtx, "Inspecting message structure", {
                hasMessage: !!message,
                messageKeys: message ? Object.keys(message) : [],
                contentType: typeof messageContent,
                contentIsArray: Array.isArray(messageContent),
                hasToolCalls: !!message?.tool_calls,
                rawMessagePreview: JSON.stringify(message).substring(0, 500)
            });

            // Parse the content - OpenRouter may return image as base64 or URL
            let imageUrl = "";
            let extractionMethod = "unknown";

            // 1. Direct content string
            if (typeof messageContent === "string" && messageContent.length > 10) {
                imageUrl = messageContent;
                extractionMethod = "string_direct";
            }
            // 2. Multimodal array content
            else if (Array.isArray(messageContent)) {
                const imagePart = messageContent.find((part: any) => part.type === "image_url" || part.image_url);
                if (imagePart?.image_url?.url) {
                    imageUrl = imagePart.image_url.url;
                    extractionMethod = "array_image_url";
                } else if (imagePart?.url) {
                    imageUrl = imagePart.url;
                    extractionMethod = "array_direct_url";
                }
            }
            // 3. Choice-level URL (some providers)
            else if (data.choices?.[0]?.url) {
                imageUrl = data.choices[0].url;
                extractionMethod = "choice_url";
            }
            // 4. Message-level image_url (non-standard)
            else if (message?.image_url?.url) {
                imageUrl = message.image_url.url;
                extractionMethod = "message_image_url_object";
            } else if (message?.image_url && typeof message.image_url === "string") {
                imageUrl = message.image_url;
                extractionMethod = "message_image_url_string";
            }
            // 5. Message-level images array (Flux/OpenRouter specific)
            else if (message?.images && Array.isArray(message.images) && message.images.length > 0) {
                const imgObj = message.images[0];
                if (imgObj.url) {
                    imageUrl = imgObj.url;
                    extractionMethod = "message_images_array_url";
                } else if (imgObj.image_url?.url) {
                    imageUrl = imgObj.image_url.url;
                    extractionMethod = "message_images_array_image_url";
                }
            }

            if (!imageUrl) {
                logError(logCtx, new Error("Failed to extract image URL from response"), {
                    choicesCount: data.choices?.length,
                    finishReason: data.choices?.[0]?.finish_reason,
                    messageKeys: message ? Object.keys(message) : [],
                    contentPreview: JSON.stringify(messageContent).substring(0, 300)
                });
                throw new Error("No image content in response");
            }

            // Log successful extraction
            aiLog("DEBUG", logCtx, "Image URL extracted successfully", {
                phase: "EXTRACTION",
                extractionMethod,
                imageUrlLength: imageUrl.length,
                isBase64: imageUrl.startsWith("data:"),
                isHttpUrl: imageUrl.startsWith("http")
            });

            // Download and store the image in Convex Storage
            let storageId: string | undefined;
            try {
                const imageResponse = await fetch(imageUrl);
                if (!imageResponse.ok) {
                    throw new Error(`Failed to download image: ${imageResponse.statusText}`);
                }
                const imageBlob = await imageResponse.blob();
                storageId = await ctx.storage.store(imageBlob);

                aiLog("INFO", logCtx, "Image stored in Convex", {
                    phase: "STORAGE",
                    storageId,
                    size: imageBlob.size,
                    type: imageBlob.type
                });
            } catch (storageError: any) {
                logError(logCtx, storageError, {
                    phase: "STORAGE_FAILED",
                    imageUrl: imageUrl.substring(0, 50) + "..."
                });
                // Fallback: If storage fails, we still have the external URL
            }

            // Update dream record with image URL and Storage ID
            const shouldStoreUrl = !imageUrl.startsWith("data:") || !storageId;

            await ctx.runMutation(internal.ai_mutations.updateDreamImage, {
                id: args.dreamId,
                imageUrl: shouldStoreUrl ? imageUrl : undefined,
                storageId: storageId as any
            });

            aiLog("INFO", logCtx, "Dream image generation complete", {
                phase: "COMPLETE",
                totalDurationMs: Date.now() - startTime,
                extractionMethod,
                imageUrlLength: imageUrl.length,
                storedInDb: shouldStoreUrl
            });

            return { imageUrl };

        } catch (error) {
            logError(logCtx, error, {
                phase: "API_CALL",
                willReturnNull: true
            });
            // Mark as failed and increment retry count
            await ctx.runMutation(internal.ai_mutations.updateImageStatus, {
                id: args.dreamId,
                status: "failed",
                incrementRetry: true,
            });
            return { imageUrl: null, error: String(error) };
        }
    },
});

// Cron job to retry failed image generations
export const retryFailedImages = internalAction({
    args: {},
    handler: async (ctx) => {
        console.log("[CRON] Starting retryFailedImages job");

        // Get failed dreams that can be retried
        const failedDreams = await ctx.runQuery(
            internal.ai_mutations.getFailedDreamImages,
            {}
        );

        console.log(`[CRON] Found ${failedDreams.length} failed images to retry`);

        // Retry each one
        for (const dream of failedDreams) {
            console.log(`[CRON] Retrying image for dream ${dream.id}`);
            try {
                await ctx.runAction(internal.ai.generateDreamImageInternal, {
                    dreamId: dream.id,
                    dreamText: dream.text,
                });
            } catch (error) {
                console.error(`[CRON] Failed to retry dream ${dream.id}:`, error);
            }
        }

        console.log("[CRON] Completed retryFailedImages job");
    },
});

// Internal version of generateDreamImage for cron job
export const generateDreamImageInternal = internalAction({
    args: {
        dreamId: v.id("dreams"),
        dreamText: v.string(),
    },
    handler: async (ctx, args) => {
        const MODEL = "black-forest-labs/flux.2-klein-4b";
        const startTime = Date.now();

        console.log(`[RETRY] Generating image for dream ${args.dreamId}`);

        // Mark as generating
        await ctx.runMutation(internal.ai_mutations.updateImageStatus, {
            id: args.dreamId,
            status: "generating",
        });

        const api_key = process.env.OPENROUTER_API_KEY;
        if (!api_key) {
            await ctx.runMutation(internal.ai_mutations.updateImageStatus, {
                id: args.dreamId,
                status: "failed",
                incrementRetry: true,
            });
            throw new Error("OPENROUTER_API_KEY is not set");
        }

        const imagePrompt = `Studio Ghibli style illustration, soft pastel watercolor painting, whimsical dreamy atmosphere, gentle lighting, hand-drawn animation aesthetic, magical realism: ${args.dreamText.slice(0, 200)}`;

        try {
            const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
                method: "POST",
                headers: {
                    Authorization: `Bearer ${api_key}`,
                    "Content-Type": "application/json",
                    "X-Title": "Lumi App",
                },
                body: JSON.stringify({
                    model: MODEL,
                    messages: [{ role: "user", content: imagePrompt }],
                    modalities: ["image"],
                }),
            });

            const data = (await response.json()) as any;

            if (data.error) {
                throw new Error(data.error.message || "Image generation failed");
            }

            const message = data.choices?.[0]?.message;
            const messageContent = message?.content;

            // Detailed logging of the message structure to debug "No image content"
            // Note: logCtx is not available here, using console.log for internal actions
            console.log("DEBUG: Inspecting internal message structure", {
                hasMessage: !!message,
                messageKeys: message ? Object.keys(message) : [],
                contentType: typeof messageContent,
                contentIsArray: Array.isArray(messageContent),
                rawMessagePreview: JSON.stringify(message).substring(0, 500)
            });

            let imageUrl = "";
            let extractionMethod = "unknown";

            // 1. Direct content string
            if (typeof messageContent === "string" && messageContent.length > 10) {
                imageUrl = messageContent;
                extractionMethod = "string_direct";
            }
            // 2. Multimodal array content
            else if (Array.isArray(messageContent)) {
                const imagePart = messageContent.find((part: any) => part.type === "image_url" || part.image_url);
                if (imagePart?.image_url?.url) {
                    imageUrl = imagePart.image_url.url;
                    extractionMethod = "array_image_url";
                } else if (imagePart?.url) {
                    imageUrl = imagePart.url;
                    extractionMethod = "array_direct_url";
                }
            }
            // 3. Choice-level URL (some providers)
            else if (data.choices?.[0]?.url) {
                imageUrl = data.choices[0].url;
                extractionMethod = "choice_url";
            }
            // 4. Message-level image_url (non-standard)
            else if (message?.image_url?.url) {
                imageUrl = message.image_url.url;
                extractionMethod = "message_image_url_object";
            } else if (message?.image_url && typeof message.image_url === "string") {
                imageUrl = message.image_url;
                extractionMethod = "message_image_url_string";
            }
            // 5. Message-level images array (Flux/OpenRouter specific)
            else if (message?.images && Array.isArray(message.images) && message.images.length > 0) {
                const imgObj = message.images[0];
                if (imgObj.url) {
                    imageUrl = imgObj.url;
                    extractionMethod = "message_images_array_url";
                } else if (imgObj.image_url?.url) {
                    imageUrl = imgObj.image_url.url;
                    extractionMethod = "message_images_array_image_url";
                }
            }

            if (!imageUrl) {
                // Note: logError is not available here, using console.error for internal actions
                console.error("Failed to extract image URL from internal response", {
                    choicesCount: data.choices?.length,
                    finishReason: data.choices?.[0]?.finish_reason,
                    messageKeys: message ? Object.keys(message) : [],
                    contentPreview: JSON.stringify(messageContent).substring(0, 300)
                });
                throw new Error("Failed to extract image URL from internal response");
            }

            // Log successful extraction
            console.log("DEBUG: Image URL extracted successfully (internal)", {
                phase: "EXTRACTION",
                extractionMethod,
                imageUrlLength: imageUrl.length,
                isBase64: imageUrl.startsWith("data:"),
                isHttpUrl: imageUrl.startsWith("http")
            });

            // Download and store
            let storageId: string | undefined;
            try {
                const imageResponse = await fetch(imageUrl);
                if (imageResponse.ok) {
                    const imageBlob = await imageResponse.blob();
                    storageId = await ctx.storage.store(imageBlob);
                }
            } catch (e) {
                console.error("Failed to store image internally", e);
            }

            await ctx.runMutation(internal.ai_mutations.updateDreamImage, {
                id: args.dreamId,
                imageUrl,
                storageId: storageId as any,
            });

            console.log(`[RETRY] Successfully generated image for dream ${args.dreamId} in ${Date.now() - startTime}ms`);
            return { success: true, imageUrl };
        } catch (error) {
            await ctx.runMutation(internal.ai_mutations.updateImageStatus, {
                id: args.dreamId,
                status: "failed",
                incrementRetry: true,
            });
            console.error(`[RETRY] Failed to generate image for dream ${args.dreamId}:`, error);
            return { success: false, error: String(error) };
        }
    },
});
