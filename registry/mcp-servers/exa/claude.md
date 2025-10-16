### Exa Research

**Purpose**: AI-powered semantic search, deep research, and comprehensive intelligence gathering.

**When to Use**:
- **Semantic web search**: Technical and business topics with intent understanding
- **Company research**: Business intelligence and organizational profiles
- **Deep research**: Comprehensive multi-source synthesis with AI analysis
- **Professional research**: LinkedIn profiles and organizational intelligence
- **Code discovery**: Technical implementation examples and patterns
- **Content extraction**: Analyze specific web pages with semantic processing

**When NOT to Use**:
- Official documentation available in Context7 (use Context7 first for authority)
- Simple factual lookups
- Exact documentation URL known (use Context7 or Firecrawl if available)

**Tool Selection** (competing tools only):
- **Context7** (if available): Official docs, API refs - use FIRST for technical specs
- **Exa**: Semantic research, business intelligence, comprehensive analysis when Context7 lacks coverage
- **Firecrawl** (if available): Simple page fetching when semantic analysis not needed; Exa for semantic understanding vs Firecrawl for structured scraping

**Available Tools**:
- `web_search_exa` - Semantic web search (understands intent and context)
- `company_research_exa` - Comprehensive business intelligence
- `linkedin_search_exa` - Professional profiles and company pages
- `crawling_exa` - Extract and analyze specific URLs with semantic processing
- `deep_researcher_start` - Start comprehensive AI-powered research (15-45s standard, 45s-2min pro)
- `deep_researcher_check` - Monitor research progress and retrieve results (poll until complete)
- `get_code_context_exa` - Search for code examples and technical patterns

**Examples**:
```
Search for microservices architecture patterns in production systems

Research company: Acme Corp - get business intelligence and market positioning

Find LinkedIn profiles for CTOs in healthcare technology companies

Use deep research to analyze the competitive landscape for API gateway solutions

Look up code examples for OAuth 2.0 implementation with Express.js
```

**Note**: Requires an API key from https://exa.ai

**Integration with Other MCPs**:
- Context7 (if available): Check FIRST for official docs, then use Exa for broader research
- Firecrawl (if available): For simple page fetching when semantic analysis not needed
- Sequential: Synthesize Exa research findings systematically
- Basic Memory: Document research with source attribution
