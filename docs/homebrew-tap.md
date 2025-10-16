# Homebrew Tap Guide

Understanding Homebrew taps and how to use them with this project.

## What is a Homebrew Tap?

A "tap" is Homebrew's term for a repository of formulae (package definitions). It's just:

1. **A GitHub repository** (can be your project repo or a separate one)
2. **A `Formula/` directory** containing `.rb` formula files
3. **Optional naming convention**: `homebrew-<name>` (but not required)

When you run `brew tap user/repo`, Homebrew clones that repository to:
```
$(brew --prefix)/Library/Taps/user/homebrew-repo
```

## Two Approaches for fluent-toolkit

### Approach 1: Formula in Main Repo (✅ Recommended)

**What we've set up:**
- `Formula/fluent-toolkit.rb` lives in **this repository**
- No separate `homebrew-tap` repository needed
- Formula updates alongside code changes

**Installation for colleagues:**

```bash
# Tap the main repository
brew tap spantree/fluent-toolkit git@github.com:spantree/fluent-toolkit.git

# Install
brew install fluent-toolkit

# Or combine into one command:
brew install spantree/fluent-toolkit/fluent-toolkit
```

**Advantages:**
- ✅ Single repository to maintain
- ✅ Formula stays in sync with code
- ✅ Simpler for single-tool projects
- ✅ Version control is unified

**Disadvantages:**
- ⚠️ Users clone entire repo when tapping (but Homebrew uses shallow clones, so minimal impact)
- ⚠️ Less separation if you plan to host multiple tools

### Approach 2: Separate homebrew-tap Repo

Create a dedicated `homebrew-tap` repository with just formulae.

**Installation for colleagues:**

```bash
brew tap spantree/tap git@github.com:spantree/homebrew-tap.git
brew install fluent-toolkit
```

**When to use:**
- You plan to distribute multiple tools from one tap
- You want cleaner separation between source and distribution
- You're following "official" Homebrew conventions strictly

## Repository Structure (Current Setup)

```
fluent-toolkit/
├── Formula/
│   └── fluent-toolkit.rb    # Homebrew formula
├── src/                      # Source code
├── dist/                     # Compiled binaries (gitignored)
├── scripts/
│   └── release.sh           # Release automation
└── ...
```

## How Tapping Works

When someone runs:
```bash
brew tap spantree/fluent-toolkit
```

Homebrew:
1. Looks for a repo at `github.com/spantree/homebrew-fluent-toolkit` **OR** `github.com/spantree/fluent-toolkit`
2. Clones it to `$(brew --prefix)/Library/Taps/spantree/homebrew-fluent-toolkit`
3. Looks for formulae in the `Formula/` directory
4. Makes those formulae available via `brew install`

## Naming Conventions

**Tap name:** `user/repo` (the part after `brew tap`)

Maps to repositories in this order:
1. `github.com/user/homebrew-repo` (preferred convention)
2. `github.com/user/repo` (works fine, what we're using)

**Formula name:** Filename in `Formula/` directory (without `.rb`)

Example:
- File: `Formula/fluent-toolkit.rb`
- Install with: `brew install fluent-toolkit`

## Formula Anatomy

```ruby
class FluentToolkit < Formula
  desc "Short description"           # Shows in brew search
  homepage "https://..."              # Project homepage
  version "0.1.0"                     # Version number

  # Platform-specific binaries
  on_macos do
    if Hardware::CPU.arm?
      url "https://.../binary-arm64"  # Download URL
      sha256 "abc123..."               # Checksum
    else
      url "https://.../binary-x86_64"
      sha256 "def456..."
    end
  end

  # Installation logic
  def install
    bin.install "binary" => "ftk"     # Install to /usr/local/bin/ftk
  end

  # Optional: test
  test do
    system "#{bin}/ftk", "--version"
  end
end
```

## Installation Patterns

### Pattern 1: Tap then Install
```bash
brew tap spantree/fluent-toolkit
brew install fluent-toolkit
```

### Pattern 2: Direct Install (Combines both)
```bash
brew install spantree/fluent-toolkit/fluent-toolkit
#            └──────┬──────┘ └────────┬────────┘
#              tap name           formula name
```

### Pattern 3: Direct Formula URL (No tap)
```bash
brew install https://raw.githubusercontent.com/spantree/fluent-toolkit/main/Formula/fluent-toolkit.rb
```

Pattern 2 is cleanest for one-liners!

## Private Repository Access

Since the repo is private, colleagues need access via:

**SSH (Recommended - no token needed):**
```bash
brew tap spantree/fluent-toolkit git@github.com:spantree/fluent-toolkit.git
```

**HTTPS with Token (Fallback):**
```bash
export HOMEBREW_GITHUB_API_TOKEN=ghp_xxxx
brew tap spantree/fluent-toolkit https://github.com/spantree/fluent-toolkit
```

## Updating the Formula

When you release a new version:

1. **Update `Formula/fluent-toolkit.rb`:**
   - Change `version "0.1.0"` to `version "0.2.0"`
   - Update download URLs (change version number)
   - Update SHA256 checksums (from `shasum -a 256 dist/...`)

2. **Commit and push:**
   ```bash
   git add Formula/fluent-toolkit.rb
   git commit -m "Update formula to v0.2.0"
   git push origin main
   ```

3. **Colleagues update:**
   ```bash
   brew update           # Fetches latest formulae
   brew upgrade fluent-toolkit
   ```

## Going Public

When ready to make the tool public:

1. **Change repository visibility** to Public on GitHub
2. **No formula changes needed!** URLs stay the same
3. **Optionally rename repository** to `homebrew-fluent` for convention
4. **Later: Submit to homebrew/core** (when stable and ready for world)

## FAQ

**Q: Why not use the `homebrew-tap` naming convention?**
A: It's optional! `homebrew-` is just a convention. Using the project name directly works fine and is clearer.

**Q: Can I have multiple formulae in one repo?**
A: Yes! Just add more `.rb` files to `Formula/`. Each becomes a separate package.

**Q: Does the entire source code get downloaded when tapping?**
A: Homebrew uses shallow clones (`--depth=1`), so only recent commits are fetched. Impact is minimal.

**Q: What if I want to separate the tap later?**
A: Easy:
1. Create new `homebrew-tap` repo
2. Copy `Formula/` directory to it
3. Update tap instructions for colleagues
4. Keep or remove `Formula/` from main repo

**Q: Can I test the formula locally before pushing?**
A: Yes!
```bash
# Install from local file
brew install --build-from-source Formula/fluent-toolkit.rb

# Or test in a tap
brew tap spantree/fluent-toolkit /path/to/fluent-toolkit
brew install fluent-toolkit
```

## Resources

- [Homebrew Taps Documentation](https://docs.brew.sh/Taps)
- [Formula Cookbook](https://docs.brew.sh/Formula-Cookbook)
- [Acceptable Formulae](https://docs.brew.sh/Acceptable-Formulae)
