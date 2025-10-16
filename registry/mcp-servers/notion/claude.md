### Notion

**Purpose**: Interact with Notion databases, pages, blocks, and workspaces for knowledge management and content creation.

**When to Use**:

- **Database Operations**: Query, filter, and update Notion databases
- **Page Management**: Create, read, update, and archive pages
- **Content Creation**: Add blocks, comments, and structured content
- **Knowledge Retrieval**: Search across Notion workspaces for information
- **Project Management**: Access and update project tracking databases
- **Documentation**: Maintain and update technical documentation in Notion

**When NOT to Use**:

- Complex formatting or rich media (Notion's block structure has limitations)
- Real-time collaborative editing (use Notion's web interface)
- Large-scale data exports (use Notion's export feature)
- Version control for code (use Git-based systems)

**Available Operations**:

- **Databases**: Query, filter, create entries, update properties
- **Pages**: Create, read, update, archive, restore
- **Blocks**: Append content, retrieve block trees
- **Search**: Full-text search across workspace
- **Users**: Retrieve user information

**Examples**:

```
Query the "Tasks" database for items assigned to me that are due this week

Create a new page in the "Meeting Notes" database with today's standup notes

Search my Notion workspace for information about API authentication

Update the status of task "Implement login" to "In Progress"

Retrieve the content from the "Architecture Overview" page
```

**Setup Requirements**:

1. Create a Notion integration at https://www.notion.so/my-integrations
2. Copy the integration token (starts with `secret_`)
3. Share relevant databases/pages with your integration
4. Provide the integration token when running `ftk init`

**Important Notes**:

- Integrations require explicit page/database sharing
- API has rate limits (3 requests/second average)
- Block content has size limitations
- Some operations require specific permission scopes

**Integration Capabilities**:

- **Read**: Pages, databases, blocks, comments, users
- **Write**: Create pages, update properties, append blocks
- **Search**: Full-text across shared content
- **Metadata**: Access timestamps, authors, and relations

**Troubleshooting**:

- **"Object not found"**: Ensure page/database is shared with integration
- **Rate limit errors**: Space out requests, implement exponential backoff
- **Permission errors**: Check integration capabilities in Notion settings
- **Invalid token**: Regenerate token at https://www.notion.so/my-integrations

**Resources**:

- Notion API Documentation: https://developers.notion.com
- Integration Setup: https://www.notion.so/my-integrations
- API Reference: https://developers.notion.com/reference
- MCP Notion Server: https://github.com/modelcontextprotocol/servers/tree/main/src/notion
