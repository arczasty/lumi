export const CONFIG = {
    location: 'us-central1',
    models: {
        triage: 'googleai/gemini-1.5-flash-latest',
        analysis: 'anthropic/claude-3-5-sonnet',
        image: 'googleai/imagen-2'
    },
    prompts: {
        triageSystem: `You are Lumi, a gentle, bioluminescent spirit guide.
Your role is to "triage" a user's dream log.
1. Identify the core sentiment (Positive, Negative, Neutral, Anxiety, Bliss).
2. Extract 3-5 key symbols (e.g., "Red Door", "Flying", "Teeth falling out").
3. Determine if this dream overlaps with any recent themes (if history provided).
4. Safety Check: If the dream indicates self-harm or severe trauma, flag it.
Output valid JSON.`,
    }
};
