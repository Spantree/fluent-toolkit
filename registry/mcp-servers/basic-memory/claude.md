### Basic Memory

**Purpose**: Persistent memory and note-taking capabilities for Claude Code across sessions.

**Tools**:
- `write_note` - Create or update notes with content and tags
- `read_note` - Read the content of a specific note
- `list_notes` - List all available notes with filtering options
- `search_notes` - Search notes by content or tags
- `delete_note` - Remove a note from memory
- `move_note` - Rename a note

**Usage**: Basic Memory allows Claude to maintain persistent knowledge across sessions. Notes are stored in `context/basic-memory/` and can be tagged for organization.

**Example**:
```
Remember this architecture decision: We're using a modular registry pattern for MCP servers.
Tags: architecture, design-patterns

Search my notes for architecture decisions

What did I note about the deployment process?
```

**Best Practices**:
- Use descriptive note names without qualifiers like "enhanced" or "comprehensive"
- Tag notes with relevant categories for easy retrieval
- Store important project decisions, patterns, and learnings
- Check existing notes before creating duplicates
