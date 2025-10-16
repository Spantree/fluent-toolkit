# Homebrew Formula for fluent-toolkit
# This file lives in the same repo as the project source code

class FluentToolkit < Formula
  desc "MCP server setup toolkit for Claude Code"
  homepage "https://github.com/spantree/fluent-toolkit"
  version "0.2.0"

  on_macos do
    if Hardware::CPU.arm?
      url "https://github.com/spantree/fluent-toolkit/releases/download/v0.2.0/ftk-darwin-arm64"
      sha256 "6b9d712dfbe9df79ff1725e63cfd6f959bea44e262736b37c8246725069aca71"
    else
      url "https://github.com/spantree/fluent-toolkit/releases/download/v0.2.0/ftk-darwin-x86_64"
      sha256 "7d3fb6150b90e79ed042c7293d50a5591fe85e36c2e49600f9f07b1edd70cab8"
    end
  end

  on_linux do
    url "https://github.com/spantree/fluent-toolkit/releases/download/v0.2.0/ftk-linux-x86_64"
    sha256 "5f271c0884d48245fa6396a9af891d5c8fe828bfd146a7bf16a835c41305b082"
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
