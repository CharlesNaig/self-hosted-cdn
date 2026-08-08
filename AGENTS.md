# Agent Instructions

This file is the root operating guide for agent work in this repository.

## Priority Order

When instructions conflict, follow this order:

1. `.github/agents/*.agent.md` for the task-specific agent role
2. `.github/instructions/*.instructions.md`
3. `.github/copilot-instructions.md`
4. `CLAUDE.md`
5. Existing code patterns in `src/`

If a GitHub agent file gives a task-specific rule, it overrides this file.

## Routing Rule

Use the GitHub agent files as the source of truth for specialist behavior:

- `@delegator` routes work
- `@architect` handles design
- `@analyzer` handles read-only code mapping
- `@debugger` handles bug fixing
- `@test-gen` handles tests
- `@refactor` handles structure and cleanup
- `@security` handles auth and validation
- `@database` handles schemas and data modeling
- `@api-builder` handles API contracts
- `@decomposer` handles large task breakdowns

Do not bypass a specialist agent rule when one exists in `.github/agents/`.

## Repository Profiles

The active project is Charles Naig's personal portfolio website.

- Use `/.agents/skills/portfolio-website/SKILL.md` for portfolio work.
- Use the website and UI/UX instruction sources for `app/`, `components/`, `lib/`, `pages/`, `public/`, and web TypeScript, JavaScript, CSS, and content files.
- Prefer strict TypeScript, semantic HTML, accessible responsive design, accurate SEO metadata, optimized media, and minimal client-side JavaScript.

## Project-Local Codex Skills

The following skills are installed for this portfolio only under `/.agents/skills/`. They extend Codex but do not override `/.agents/` or user instructions:

- `frontend-design` - Use while building or polishing distinctive portfolio pages and components.
- `web-design-guidelines` - Use after implementation to audit interface quality, usability, and accessibility.
- `vercel-react-best-practices` - Use when implementing or reviewing React and Next.js code for performance and rendering quality.
- `vercel-composition-patterns` - Use when a shared component API becomes complex or needs to scale beyond simple props.
- `supabase` - Use only when implementing a persistent, moderated client-comment or guestbook feature with database and authentication requirements.

Use only the smallest applicable set. If a project-local skill is unavailable, fall back to `portfolio-website`, `website-making`, and `ui-ux-design` in `/.agents/skills/`.

Curated testimonials, certification records, and portfolio content remain static project data by default; they do not require Supabase.

Discord.js v14 remains a conditional compatibility profile for bot code and `.github/discord-bot-template/`:

- JavaScript ES modules only in bot `src/` files.
- Commands, events, and components use class-based loaders.
- Prefer `ctx.sendTypedMessage()` and the triple output format: `embed`, `componentsv2`, and `message`.
- Use `this.client.embed()` for embeds and `resolveColor()` for V2 accent colors.
- Use `this.client.logger` instead of `console.log` or `console.error`.

## Instruction Sources

Prefer the repo-specific GitHub instruction files over memory:

- Code quality rules: `.github/instructions/code-quality.instructions.md`
- Environment/config rules: `.github/instructions/environment-config.instructions.md`
- Embed/UI rules: `.github/instructions/embed-design.instructions.md`
- Context tracking: `.github/instructions/context-tracking.instructions.md`
- Portfolio websites: `/.agents/skills/portfolio-website/SKILL.md`
- General websites: `.github/instructions/website.instructions.md`

# Universal Agent Entry

This repository uses the universal agent system. Any coding agent working here must treat these files as the source of truth before editing:

1. Read `/.agents/base/GLOBAL-RULES.md`
2. Read `/.agents/base/BASE-SKILLS.md`
3. Read `/.agents/base/CONTEXT-PROTOCOL.md`
4. Read `/.agents/base/OBSIDIAN-BRAIN-PROTOCOL.md`
5. For code work, also read `/.agents/base/CODE-QUALITY.md`
6. Read the relevant skill file from `/.agents/skills/`
7. For portfolio UI work, also check relevant project-local skills in `/.agents/skills/`

Before editing, check `CONTEXT.md` and any relevant `.context/` snapshots for project state.

After any file changes, the final action must update:

- `CONTEXT.md`
- `.context/YYYY-MM-DD-HHMM-short-session-title.md`
- The Obsidian Brain entry and `Project Index.md` under `C:\Users\Charles\Documents\Obsidian Vault\My Brain`

If the Obsidian vault is unavailable, create the pending brain entry in `.context/obsidian-brain-pending/` and state where it must be copied.


## Conflict Handling

If two repo instructions conflict, use the more specific file or the one under `.github/agents/` that directly matches the task.
If no repo instruction covers the case, follow the existing codebase pattern and keep the implementation minimal.

## Brain-First Workflow

Before starting any file-changing task, the agent must:

1. Identify the project name and type.
2. Locate the matching Obsidian Brain project folder.
3. Read that folder's `Project Index.md` if it exists.
4. Read the latest 3 to 5 files inside `Brain Changes/` when available.
5. Use those notes together with local `CONTEXT.md` and `.context/` snapshots before planning or editing.

After completing file changes, the agent must:

1. Update `CONTEXT.md`.
2. Create a `.context/` session snapshot.
3. Create a new Obsidian Brain change entry.
4. Update the matching Obsidian `Project Index.md`.
5. If the vault is unavailable, create a fallback entry in `.context/obsidian-brain-pending/`.
