import { v } from "convex/values";
import { action, internalMutation } from "./_generated/server";

export const transcribeAndAnalyze = action({
    args: {
        dreamId: v.id("dreams"),
        storageId: v.string(), // Convex storage ID for the audio file
    },
    handler: async (ctx, args) => {
        const api_key = process.env.OPENROUTER_API_KEY;
        if (!api_key) {
            throw new Error("OPENROUTER_API_KEY is not set");
        }

        // 1. Get the audio blob from Convex storage
        const audioBlob = await ctx.storage.get(args.storageId);
        if (!audioBlob) {
            throw new Error("Audio file not found in storage");
        }

        // 2. Convert to base64
        const audioBuffer = await audioBlob.arrayBuffer();
        const base64Audio = Buffer.from(audioBuffer).toString("base64");

        // 3. Call OpenRouter with Gemini 1.5 Flash
        const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
            method: "POST",
            headers: {
                Authorization: `Bearer ${api_key}`,
                "Content-Type": "application/json",
                "X-Title": "Lumi App",
            },
            body: JSON.stringify({
                model: "google/gemini-flash-1.5",
                messages: [
                    {
                        role: "system",
                        content: `You are Lumi, a Jungian Dream Guide. 
            First, transcribe the user's dream recording perfectly.
            Then, provide a deep Jungian analysis.
            Return a JSON object with:
            - transcription: The full text of the dream recording.
            - interpretation: A deep, empathetic Jungian insight (3-4 sentences).
            - sentiment: One of 'Positive', 'Negative', 'Neutral', 'Anxiety', 'Bliss'.
            - symbols: An array of 3-5 core symbols.
            - lumi_quote: A short 1-sentence poetic acknowledgement.`
                    },
                    {
                        role: "user",
                        content: [
                            {
                                type: "text",
                                text: "Transcribe and analyze this dream recording."
                            },
                            {
                                type: "image_url", // OpenRouter multimodal often uses image_url even for audio for some reason, 
                                // but actually "input_audio" or "file" is better. Let's use the standard base64 format.
                                url: `data:audio/m4a;base64,${base64Audio}`
                            }
                        ]
                    }
                ],
                response_format: { type: "json_object" }
            })
        });

        const data = await response.json();
        if (data.error) {
            console.error("OpenRouter Error:", data.error);
            throw new Error(`AI analysis failed: ${data.error.message || "Unknown error"}`);
        }

        const content = data.choices?.[0]?.message?.content;
        if (!content) {
            throw new Error("Empty response from AI");
        }

        const result = JSON.parse(content);

        // 4. Update the dream record with both transcription and analysis
        await ctx.runMutation(api.ai.updateDreamResults, {
            id: args.dreamId,
            text: result.transcription,
            interpretation: result.interpretation,
            sentiment: result.sentiment,
            symbols: result.symbols,
            lumi_quote: result.lumi_quote,
        });

        return result;
    },
});

export const analyzeDream = action({
    args: {
        dreamId: v.id("dreams"),
        text: v.string(),
    },
    handler: async (ctx, args) => {
        const api_key = process.env.OPENROUTER_API_KEY;
        if (!api_key) {
            throw new Error("OPENROUTER_API_KEY is not set");
        }

        const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
            method: "POST",
            headers: {
                Authorization: `Bearer ${api_key}`,
                "Content-Type": "application/json",
                "X-Title": "Lumi App",
            },
            body: JSON.stringify({
                model: "anthropic/claude-3.5-sonnet",
                messages: [
                    {
                        role: "system",
                        content: `You are Lumi, a Jungian Dream Guide. Your tone is 'Cozy Ghibli'. 
            Analyze the dream and return JSON: interpretation, sentiment, symbols, lumi_quote.`
                    },
                    {
                        role: "user",
                        content: args.text
                    }
                ],
                response_format: { type: "json_object" }
            })
        });

        const data = await response.json();
        const result = JSON.parse(data.choices[0].message.content);

        await ctx.runMutation(api.ai.updateDreamResults, {
            id: args.dreamId,
            interpretation: result.interpretation,
            sentiment: result.sentiment,
            symbols: result.symbols,
            lumi_quote: result.lumi_quote,
        });

        return result;
    },
});

export const updateDreamResults = internalMutation({
    args: {
        id: v.id("dreams"),
        text: v.optional(v.string()),
        interpretation: v.optional(v.string()),
        sentiment: v.optional(v.string()),
        symbols: v.optional(v.array(v.string())),
        lumi_quote: v.optional(v.string()),
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
        const api_key = process.env.OPENROUTER_API_KEY;
        if (!api_key) {
            throw new Error("OPENROUTER_API_KEY is not set");
        }

        // Create Studio Ghibli style prompt
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
                    model: "google/gemini-2.5-flash-image-preview", // Nano Banana - good balance of quality and speed
                    messages: [
                        {
                            role: "user",
                            content: imagePrompt
                        }
                    ],
                    modalities: ["image", "text"]
                })
            });

            const data = await response.json();

            if (data.error) {
                console.error("OpenRouter Image Generation Error:", data.error);
                throw new Error(`Image generation failed: ${data.error.message || "Unknown error"}`);
            }

            // Extract image URL from response
            // The image should be in the message content
            const messageContent = data.choices?.[0]?.message?.content;

            if (!messageContent) {
                throw new Error("No image content in response");
            }

            // Parse the content - OpenRouter may return image as base64 or URL
            let imageUrl = "";

            // If content is a string, it might be a URL or base64
            if (typeof messageContent === "string") {
                imageUrl = messageContent;
            } else if (Array.isArray(messageContent)) {
                // Content might be an array of parts
                const imagePart = messageContent.find((part: any) => part.type === "image_url");
                if (imagePart?.image_url?.url) {
                    imageUrl = imagePart.image_url.url;
                }
            } else if (messageContent.image_url?.url) {
                imageUrl = messageContent.image_url.url;
            }

            if (!imageUrl) {
                console.error("Could not extract image URL from response:", data);
                throw new Error("Failed to extract image URL from response");
            }

            // Update dream record with image URL
            await ctx.runMutation(api.ai.updateDreamImage, {
                id: args.dreamId,
                imageUrl: imageUrl
            });

            return { imageUrl };

        } catch (error) {
            console.error("Image generation error:", error);
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
