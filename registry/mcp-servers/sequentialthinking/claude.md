### Sequential Thinking

**Purpose**: Structured multi-step reasoning for complex problem-solving and systematic analysis.

**When to Use**:
- Multi-step research planning and synthesis
- Complex architectural analysis requiring systematic breakdown
- Strategic decisions with trade-offs to evaluate
- Synthesis of findings from multiple sources
- Breaking down complex problems into manageable components

**When NOT to Use**:
- Simple, straightforward questions
- Quick information lookups (use Context7 or Exa if available)
- Information already documented in Basic Memory

**Usage**: Claude Code automatically uses Sequential when problems require multi-step reasoning. You can explicitly request it:

**Examples**:
```
Using sequential thinking, analyze the trade-offs between microservices and monolithic architecture for this project.

Break down the implementation approach for this authentication system step-by-step.

Systematically synthesize findings from these research notes into a coherent analysis.
```

**Integration with Other MCPs**:
- Context7 (if available): Use official docs first, then Sequential for architectural analysis
- Exa (if available): Gather information first, then Sequential to synthesize findings
- Basic Memory: Document Sequential's analysis for future reference
  - Create plan files in `plans/` folder to track multi-phase work
  - Break down objectives into phased tasks with status tracking
- Firecrawl: Fetch content, then Sequential to analyze patterns
