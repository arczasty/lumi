# Guide: Adding Skills & Agents to Lumi Development Studio

You can extend the capabilities of your AI assistant (Antigravity) by adding Workflows and Skills.

## 1. Workflows
Workflows are defined as `.md` files in the `.agent/workflows/` directory. They allow you to define standardized procedures that the agent can follow.
- **Path:** `.agent/workflows/[name].md`
- **Usage:** Call via slash command (e.g., `/documentation-update`).

## 2. Skills
Skills are folders containing instructions, scripts, and resources. They extend the assistant's knowledge and toolset for specialized tasks.
- **Path:** Create a folder (e.g., `skills/my-specialty/`) containing a `SKILL.md` file.
- **Structure:**
  - `skills/my-specialty/SKILL.md` (Required instructions)
  - `skills/my-specialty/scripts/` (Optional helper scripts)
  - `skills/my-specialty/resources/` (Optional documentation or assets)

## 3. Specialized Agents
By combining Workflows and Skills, you can create "Agents" with specific personas or domain expertise. The agent's identity and behavior will adapt based on the documentation provided in these folders.

## 4. MCP Servers
For deeper system integrations (like the Supabase MCP server), you can add servers at the Antigravity platform level.

> [!TIP]
> If you'd like me to help you create a specific skill or workflow, just describe the task and I'll generate the necessary files for you!
