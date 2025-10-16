# Homebrew Formula for fluent-toolkit
# This file lives in the same repo as the project source code

class FluentToolkit < Formula
  desc "MCP server setup toolkit for Claude Code"
  homepage "https://github.com/spantree/fluent-toolkit"
  version "0.1.0"

  on_macos do
    if Hardware::CPU.arm?
      url "https://github.com/spantree/fluent-toolkit/releases/download/v0.1.0/ftk-darwin-arm64"
      sha256 "871b23a5da241e5e955584f7ed76fd1a83ed499c3aa18711f17b2b8d2662e4d2"
    else
      url "https://github.com/spantree/fluent-toolkit/releases/download/v0.1.0/ftk-darwin-x86_64"
      sha256 "7d3fb6150b90e79ed042c7293d50a5591fe85e36c2e49600f9f07b1edd70cab8"
    end
  end

  on_linux do
    url "https://github.com/spantree/fluent-toolkit/releases/download/v0.1.0/ftk-linux-x86_64"
    sha256 "ff706fc1e28a63c5fac94c3c51c82f3026ea1fec00dfcbc55883b78d3ef1deea"
  end

  # Install from main branch for testing (use --HEAD flag)
  head "https://github.com/spantree/fluent-toolkit.git", branch: "main"

  depends_on "deno" => :build  # Only needed for HEAD builds

  def install
    if build.head?
      # Build from source for HEAD installs
      system "deno", "task", "compile"
      bin.install "bin/ftk"
    else
      # Install pre-compiled binary for stable release
      if OS.mac?
        if Hardware::CPU.arm?
          bin.install "ftk-darwin-arm64" => "ftk"
        else
          bin.install "ftk-darwin-x86_64" => "ftk"
        end
      else
        bin.install "ftk-linux-x86_64" => "ftk"
      end
    end
  end

  test do
    system "#{bin}/ftk", "--version"
  end
end
