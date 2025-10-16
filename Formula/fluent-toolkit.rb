# Homebrew Formula for fluent-toolkit
# This file lives in the same repo as the project source code

class FluentToolkit < Formula
  desc "MCP server setup toolkit for Claude Code"
  homepage "https://github.com/spantree/fluent-toolkit"
  version "0.1.0"

  on_macos do
    if Hardware::CPU.arm?
      url "https://github.com/spantree/fluent-toolkit/releases/download/v0.1.0/ftk-darwin-arm64"
      sha256 "REPLACE_WITH_ACTUAL_SHA256_ARM64"
    else
      url "https://github.com/spantree/fluent-toolkit/releases/download/v0.1.0/ftk-darwin-x86_64"
      sha256 "REPLACE_WITH_ACTUAL_SHA256_X86_64"
    end
  end

  on_linux do
    url "https://github.com/spantree/fluent-toolkit/releases/download/v0.1.0/ftk-linux-x86_64"
    sha256 "REPLACE_WITH_ACTUAL_SHA256_LINUX"
  end

  def install
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

  test do
    system "#{bin}/ftk", "--version"
  end
end
