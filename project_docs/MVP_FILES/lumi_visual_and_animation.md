Lumi Visual & Animation Guide (2026 MVP)
This guide provides the technical prompts for image generation (Imagen 4.0 / Midjourney) and state definitions for Rive animations to ensure Lumi remains consistent across all app screens.
1. The Core Visual Identity
Mascot Species: Bioluminescent Spirit Guide (Owl-Wisp Hybrid).
Key Features: Soft glowing core, lantern-carrying, large expressive eyes, painterly textures.
Art Style: Studio Ghibli (Hand-painted, soft lighting, watercolor-ink hybrid).
2. Image Generation Prompts (Static Assets)
Use these prompts for App Store assets, onboarding screens, and the "Splash" view.
A. The Master Character Sheet
"A character sheet for 'Lumi', a small bioluminescent spirit guide that looks like a tiny owl made of soft glowing light. Soft edges, whimsical Ghibli style. Three poses: 1. Floating peacefully holding a small paper lantern. 2. Tilting head curiously. 3. Sleeping curled into a ball. Soft indigo and bioluminescent teal color palette. Hand-painted watercolor texture, high-quality anime concept art, no text, clean white background."
B. Onboarding / Hero Image
"Lumi the spirit guide floating in a dark, magical forest at twilight. The background is deep indigo with glowing teal flora. Lumi is holding a lantern that casts a warm candlelight glow (#F4E04D) on a leather-bound journal floating in the air. Studio Ghibli style, cinematic lighting, ethereal atmosphere, 8k resolution, painterly brushstrokes."
3. Rive Animation States (Dynamic UI)
To implement the "Living UI" mentioned in the blueprint, Antigravity needs to map code inputs to these specific animation states.
State
Description
Trigger
Animation Style
idle_float
Slow vertical bobbing with a subtle glow pulse.
Default State
Sinusoidal, 2-second loop.
listening
Lumi leans forward, eyes widen slightly, glow syncs with mic decibels.
Microphone Active
Reactive scaling (1.0x to 1.1x).
thinking
Lumi taps chin with a wing/wisp, lantern swings gently.
AI API onLoading
Slow rotation, "twinkle" effect.
insight_found
A bright flare of light, Lumi performs a small flip.
API Success
Burst of particles (#BAF2BB).
empathy_sad
Lumi's glow turns deep blue, wings droop, slow pulses.
Sentiment == "Sad"
Low-frequency opacity fade.

4. Technical Integration for Antigravity
Add this to your "Vibe Coding" instruction set so the AI knows how to handle the assets:
Antigravity Implementation Command:
"Create a LumiWidget using the rive package. Load lumi_v1.riv. Implement a StateMachineController that listens to the DreamState (Riverpod).
If isRecording, set state = 'listening'.
If isAnalyzing, set state = 'thinking'.
If the sentimentResult is 'positive', trigger a happy_pulse animation."
5. Visual Palette Check
To ensure color accuracy during image generation, steer the models with these hex-equivalent keywords:
Primary Glow: Bioluminescent Teal / Seafoam (#BAF2BB)
Shadows: Twilight Indigo / Midnight Purple (#1A1B41)
Highlights: Candlelight / Warm Amber (#F4E04D)
