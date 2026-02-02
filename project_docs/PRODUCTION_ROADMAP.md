# 🚀 PRODUCTION ROADMAP: LUMI
    
    This document outlines the steps required to move the "Lumi" application from concept to production.
    
    ## 1. 🛡 Security & Authentication
    
    **Current Status:**
    Pending implementation.
    
    **Action Plan:**
    
    - [ ] **Setup Project**: Initialize Firebase Project (Console).
    - [ ] **Database Schema**:
      - Enable Firestore (Document DB) for Dream Logs.
      - Enable Firebase Data Connect (Cloud SQL) for Vector Search.
    - [ ] **Guest Onboarding**:
      - Implement Firebase Anonymous Auth.
      - Build `linkWithCredential` flow for permanent account conversion.
    - [ ] **Privacy**: Configure Firestore Security Rules.
    
    ## 2. 🧩 Core Logic (Firebase Genkit)
    
    **Current Status:**
    Pending implementation.
    
    **Action Plan:**
    
    - [ ] **AI Orchestration (Genkit)**:
      - Initialize Genkit in Firebase Functions (TypeScript).
      - Configure Vertex AI Model Garden (Gemini 1.5 Flash + Claude 3.5 Sonnet).
    - [ ] **Vector Search (RAG)**:
      - Define `Dream` schema in `schema.gql` (Firebase Data Connect).
      - Implement standard similarity search for "Memory" feature.
    - [ ] **Voice Processing**:
      - Integrate Deepgram/Whisper for "Whisper Mode" transcription.
      - (Premium) Integrate ElevenLabs for audio playback.
    - [ ] **Image Generation**:
      - Create `generate-dream-art` function (Imagen/Midjourney API) with "Studio Ghibli" system prompts.
    
    ## 3. 📱 Mobile Application (Flutter)
    
    **Current Status:**
    Ready for development.
    
    **Action Plan:**
    
    - [ ] **Initialize App**: `flutter create apps/lumi_mobile` (using Antigravity approach).
    - [ ] **Dependencies**: Add `flutter_riverpod`, `firebase_core`, `rive`.
    - [ ] **Design System**: Apply "Twilight Garden" palette (`#1A1B41`, `#BAF2BB`, `#F4E04D`).
    - [ ] **Lumi Mascot**:
      - Load `lumi.riv` asset.
      - Map StateMachine inputs to Riverpod providers.
    - [ ] **Core Flows**:
      - **Onboarding**: Guest entry -> First Dream -> Teaser -> Signup.
      - **Journaling**: "Tap to Record" full-screen gesture (Whisper Mode).
    
    ## 4. ⚙️ Operations & Infrastructure
    
    **Current Status:**
    Pending setup.
    
    **Action Plan:**
    
    - [ ] **CI/CD**: Set up EAS Build and GitHub Actions.
    - [ ] **Backups**: Configure Point-in-Time Recovery.
    - [ ] **Subscription**: Integrate RevenueCat for "Inner Circle" tier management.
