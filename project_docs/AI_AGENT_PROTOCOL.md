# 🤖 AI_AGENT_PROTOCOL: Rules of Engagement

This protocol defines how AI agents (like Antigravity) must interact with the **Lumi** codebase to ensure stability and documentation accuracy.

## 1. Documentation Mandatory Check

- Before starting any task, the agent **MUST** read `project_docs/MASTER_PLAN.md` to understand the business intent.
- Before modifying technical infrastructure, the agent **MUST** read `project_docs/DEVELOPMENT.md`.

## 2. Automatic Synchronization Rules

- **Schema Changes**: If a database schema or shared type is modified, the agent must immediately update the relevant section in `MASTER_PLAN.md`.
- **New Components**: New shared packages or apps must be added to the Directory Map in `DEVELOPMENT.md`.
- **Env Vars**: Any new environment variable must be added to the Zod schema in the respective `env.js` and documented.

## 3. Task Completion Workflow

After completing a significant feature or structural change, the agent **MUST** run the following:

1.  **Verification**: Execute `npm run check-all` and fix all errors.
2.  **Documentation**: Run the `.agent/workflows/documentation-update.md` sequence.
3.  **Sync**: `git add .` to stage updates.

## 4. Tone & Standards

- Agents should provide concise, technical summaries.
- Code should follow the established ESLint/Prettier rules (Husky will enforce this).
