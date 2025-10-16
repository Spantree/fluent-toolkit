# Feature #009: GitHub MCP Server Authentication Setup

## Overview

Add authentication setup for GitHub MCP server to enable repository operations, issue management, and pull request workflows.

## Implementation Plan

### Phase 1: Registry Updates
- [ ] Update `registry/mcp-servers/github/index.ts`
- [ ] Add `configure()` lifecycle method
- [ ] Implement personal access token prompt and validation

### Phase 2: Authentication Flow
- [ ] Add interactive prompt for GitHub fine-grained personal access token
- [ ] Display required permissions during setup
- [ ] Validate token format (starts with `github_pat_`)
- [ ] Store token in `.env.mcp.secrets` as `GITHUB_PERSONAL_ACCESS_TOKEN`
- [ ] Update MCP config to use environment variable

### Phase 3: Documentation
- [ ] Update `registry/mcp-servers/github/claude.md`
- [ ] Document token creation process
- [ ] List all required permissions
- [ ] Add troubleshooting guide for auth issues
- [ ] Include example workflows

### Phase 4: CLAUDE.md Integration
- [ ] Ensure CLAUDE.md gets updated during init
- [ ] Include GitHub MCP capabilities
- [ ] Document common use cases
- [ ] Add security best practices

## Technical Approach

```typescript
export const githubServer: MCPServer = {
  name: "github",
  displayName: "GitHub",
  description: "Repository operations, issues, and pull requests",

  async configure(ctx: SetupContext): Promise<void> {
    // Display required permissions
    ctx.info(`
GitHub MCP Server requires a fine-grained personal access token with these permissions:

REQUIRED (read + write):
- contents: Repository files and commits
- issues: Create and manage issues
- pull_requests: Create and manage PRs
- actions: View workflow runs
- discussions: Participate in discussions
- workflows: Manage workflow files

REQUIRED (read):
- metadata: Repository metadata
- notifications: Access notifications

Get your token at: https://github.com/settings/tokens?type=beta
    `);

    const token = await ctx.prompt({
      type: "input",
      name: "GITHUB_PERSONAL_ACCESS_TOKEN",
      message: "Enter your GitHub fine-grained personal access token:",
      validate: (value: string) => {
        if (!value.startsWith("github_pat_")) {
          return "GitHub fine-grained tokens should start with 'github_pat_'";
        }
        return true;
      }
    });

    await ctx.saveSecret("GITHUB_PERSONAL_ACCESS_TOKEN", token);
  },

  install(ctx: SetupContext): MCPConfig {
    return {
      type: "stdio",
      command: "npx",
      args: [
        "-y",
        "dotenv-cli",
        "-e",
        ".env.mcp.secrets",
        "--",
        "npx",
        "-y",
        "@modelcontextprotocol/server-github"
      ],
      env: {}
    };
  }
};
```

## Testing Plan

- Test with valid GitHub fine-grained token
- Test with invalid token format
- Test with insufficient permissions
- Verify repository operations work
- Test issue creation and management
- Test pull request workflows
- Verify CLAUDE.md instructions are clear

## Areas for Feedback

1. Should we test the token during setup (requires network call)?
2. How should we handle permission errors during usage?
3. Should we support multiple GitHub accounts/tokens?
4. What example workflows should we prioritize in documentation?

## Related Issues

- Issue #9: https://github.com/cedric/spantree-fluent/fluent-toolkit/issues/9

## References

- GitHub Personal Access Tokens: https://github.com/settings/tokens?type=beta
- MCP GitHub Server: https://github.com/github/github-mcp-server
- GitHub REST API: https://docs.github.com/rest

## Required Permissions

### Minimum Required (read + write):
- **contents**: Read/write repository files, commits, branches
- **issues**: Create, update, close issues, add comments
- **pull_requests**: Create, update, merge PRs, add reviews
- **actions**: View and re-run workflow runs
- **discussions**: Participate in repository discussions
- **workflows**: View and update workflow files

### Minimum Required (read):
- **metadata**: Repository metadata (always included)
- **notifications**: Access notifications (read + write for marking as read)

### Optional Enhanced (read + write):
- **administration**: Repository settings management
- **security_events**: Code scanning and secret scanning
- **vulnerability_alerts**: Dependabot alerts
- **deployments**: Deployment status tracking

## GitHub MCP Capabilities to Document

### Repository Operations
- Create/read/update files
- Branch management
- Commit operations
- Repository search

### Issue Management
- Create and update issues
- Add comments and labels
- Assign users
- Search and filter

### Pull Request Workflows
- Create PRs
- Review and comment
- Merge operations
- Status checks

### Advanced Features
- Workflow management
- Discussion participation
- Notification handling
