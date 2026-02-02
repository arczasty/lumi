Technical Implementation Blueprint: Dream Interpreter AI (MVP)
1. Core Tech Stack (Antigravity 2026 Standard)
To ensure high-fidelity "Vibe Coding," use these specific dependencies:
Frontend: Flutter 4.0+
State Management: flutter_riverpod, riverpod_generator
Database & Auth: Firebase (Firestore, Auth, Data Connect)
Vector Database: pgvector on Cloud SQL via Firebase Data Connect
AI Orchestration: firebase_genkit (Dart Client)
Audio: elevenlabs_dart (Turbo v2.5), record (for high-fidelity mumble/whisper capture)
Animations: rive (for Lumi's interactive character states)
Styling: google_fonts (Recoleta/Gambetta), flex_color_scheme (Twilight Garden custom theme)
2. Onboarding Flow (Technical Logic)
Implementation of the Guest Mode Migration Pattern to maximize conversion.
Entry Point (SplashView):
onInit: Call AuthService.signInAnonymously().
State: AuthState.unauthenticatedGuest.
First Capture (CaptureView):
Enable full-screen gesture recording.
Store audio/text in a temporary PendingDream state object.
Teaser Generation:
Trigger genkit.triageDream using Gemini 1.5 Flash.
Display TeaserModal with 3 core symbols and a "Hook" sentence.
Conversion Point (AuthBridge):
When user taps "Save Insight", trigger linkWithCredential logic.
Antigravity Command: "Implement a migration service that links anonymous Firebase credentials to a permanent Google/Apple account without losing the current PendingDream data."
3. Screen Map & Technical Logic
A. The Capture Screen (Whisper Mode)
Logic: GestureDetector covering the full screen.
Visuals: Rive animation lumi_idle.riv reacting to mic_stream amplitude.
Haptics: HapticFeedback.heavyImpact() on record start; lightImpact() every 2 seconds of active speech.
B. The Threshold (Processing)
Logic: Parallel execution of genkit.triageDream (Flash) and imagen.generateThumbnail (Ghibli style).
UI: LumiProcessingWidget using canvas_confetti for a bioluminescent particle glow.
C. The Dream Grimoire (Journal Feed)
Pattern: StreamProvider listening to Firestore dreams collection.
Component: Glassmorphic cards with BackdropFilter(sigmaX: 10, sigmaY: 10).
Antigravity Command: "Build a scrollable feed of dream cards. Use the Ghibli-style thumbnail as the background of the card with a gradient overlay of #1A1B41."
D. The Mind Map (Vector Analysis)
Logic: DataConnect.query('findRelatedDreams') using pgvector.
Visual: Node-graph built using graphview.
Antigravity Command: "Create a force-directed graph where each node is a dream symbol. Tapping a node should highlight connections to other dreams in the user's history."
4. Data Schema (Firebase Data Connect / SQL)
# schema.gql for Firebase Data Connect

type User @table {
  id: String! @primaryKey
  email: String
  isPremium: Boolean @default(value: false)
}

type Dream @table {
  id: UUID! @default(expr: "uuid_generate_v4()")
  userId: String!
  rawText: String!
  interpretation: String
  sentiment: String
  embedding: Vector(1536) # pgvector for Mind Map
  imageUrl: String
  createdAt: Timestamp! @default(expr: "request.time")
}


5. The "Lumi" Character Logic (System Prompt)
Lumi’s personality is the core "Vibe" of the app. Use this prompt in the genkit configuration:
System Prompt: "You are Lumi, a Jungian Dream Guide. Your tone is 'Cozy Ghibli'—warm, mystical, and observant. You do not define symbols clinically. Instead, you ask: 'In your dream, the water was dark and cold. How did that coldness feel in your body?' Always look for compensatory patterns. If the user is stressed in life, look for 'relief' symbols in their dreams. Never use medical jargon. Use serif-style storytelling language."
6. Antigravity "Vibe Coding" Style Guide
Palette: Indigo_900 (#1A1B41), Teal_Biolume (#BAF2BB), Candle_Gold (#F4E04D).
Border Radius: 24.0 for all containers.
Transitions: PageTransitionsTheme set to FadeThroughPageTransitionsBuilder.
Typography:
Display: GoogleFonts.recoleta(fontSize: 32, fontWeight: Bold, color: Candle_Gold)
Body: GoogleFonts.inter(fontSize: 16, height: 1.5, color: Colors.white70)
