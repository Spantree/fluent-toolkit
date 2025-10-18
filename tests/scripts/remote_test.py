#!/usr/bin/env -S uv run
# /// script
# requires-python = ">=3.12"
# dependencies = [
#     "rich>=13.9.4",
# ]
# ///

"""
Remote ftk installation validation script.

Tests ftk installation on a remote host via SSH, validating:
- Homebrew installation
- ftk package installation
- ftk command functionality
- Version verification

Usage:
    uv run tests/scripts/remote_test.py [hostname]

Example:
    uv run tests/scripts/remote_test.py cedrics-mac-mini.local
"""

import subprocess
import sys
from pathlib import Path
from typing import Optional

from rich.console import Console
from rich.panel import Panel
from rich.progress import Progress, SpinnerColumn, TextColumn

console = Console()


class SSHCommandError(Exception):
    """Raised when an SSH command fails."""

    pass


class RemoteValidator:
    """Validates ftk installation on a remote host."""

    # Common Homebrew installation locations
    BREW_PATHS = [
        "/opt/homebrew/bin/brew",  # Apple Silicon
        "/usr/local/bin/brew",      # Intel Mac
    ]

    def __init__(self, hostname: str):
        self.hostname = hostname
        self.console = console
        self.brew_path: Optional[str] = None

    def run_ssh(
        self, command: str, check: bool = True, capture_output: bool = True
    ) -> subprocess.CompletedProcess:
        """Execute a command on the remote host via SSH."""
        # Set up PATH to include common Homebrew locations
        path_setup = f"export PATH=/opt/homebrew/bin:/usr/local/bin:$PATH; {command}"

        ssh_cmd = [
            "ssh",
            "-o",
            "StrictHostKeyChecking=accept-new",
            "-o",
            "ConnectTimeout=10",
            self.hostname,
            path_setup,
        ]

        self.console.print(f"[dim]$ ssh {self.hostname} {command!r}[/dim]")

        result = subprocess.run(
            ssh_cmd, capture_output=capture_output, text=True, check=False
        )

        if check and result.returncode != 0:
            raise SSHCommandError(
                f"Command failed with exit code {result.returncode}\n"
                f"stdout: {result.stdout}\nstderr: {result.stderr}"
            )

        return result

    def check_connectivity(self) -> bool:
        """Verify SSH connectivity to remote host."""
        self.console.print(f"\n[bold]Testing SSH connection to {self.hostname}...[/bold]")
        try:
            result = self.run_ssh("hostname", check=True)
            remote_hostname = result.stdout.strip()
            self.console.print(f"[green]✓[/green] Connected to {remote_hostname}")
            return True
        except SSHCommandError as e:
            self.console.print(f"[red]✗[/red] Connection failed: {e}")
            return False

    def check_homebrew(self) -> bool:
        """Check if Homebrew is installed."""
        self.console.print("\n[bold]Checking Homebrew installation...[/bold]")

        # First try which brew (should work now with PATH setup)
        result = self.run_ssh("which brew", check=False)

        if result.returncode == 0:
            self.brew_path = result.stdout.strip()
            version_result = self.run_ssh("brew --version", check=True)
            version = version_result.stdout.strip().split("\n")[0]
            self.console.print(f"[green]✓[/green] Homebrew installed at {self.brew_path}")
            self.console.print(f"  {version}")
            return True

        # If which failed, try checking common locations directly
        for brew_path in self.BREW_PATHS:
            result = self.run_ssh(f"test -x {brew_path} && echo found", check=False)
            if result.returncode == 0 and "found" in result.stdout:
                self.brew_path = brew_path
                version_result = self.run_ssh(f"{brew_path} --version", check=False)
                if version_result.returncode == 0:
                    version = version_result.stdout.strip().split("\n")[0]
                    self.console.print(f"[green]✓[/green] Homebrew installed at {self.brew_path}")
                    self.console.print(f"  {version}")
                    return True

        self.console.print("[yellow]![/yellow] Homebrew not found in PATH or common locations")
        return False

    def install_homebrew(self) -> bool:
        """Install Homebrew on the remote host."""
        self.console.print("\n[bold]Installing Homebrew...[/bold]")
        self.console.print(
            "[yellow]Note:[/yellow] This requires user interaction on the remote host"
        )

        install_cmd = (
            '/bin/bash -c "$(curl -fsSL '
            'https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"'
        )

        try:
            self.run_ssh(install_cmd, capture_output=False)
            self.console.print("[green]✓[/green] Homebrew installation completed")
            return True
        except SSHCommandError as e:
            self.console.print(f"[red]✗[/red] Homebrew installation failed: {e}")
            return False

    def check_ftk(self) -> Optional[str]:
        """Check if ftk is installed and return version."""
        self.console.print("\n[bold]Checking ftk installation...[/bold]")
        result = self.run_ssh("which ftk", check=False)

        if result.returncode == 0:
            ftk_path = result.stdout.strip()
            version_result = self.run_ssh("ftk --version", check=True)
            version = version_result.stdout.strip()
            self.console.print(f"[green]✓[/green] ftk installed at {ftk_path}")
            self.console.print(f"  Version: {version}")
            return version
        else:
            self.console.print("[yellow]![/yellow] ftk not found")
            return None

    def install_ftk(self, use_head: bool = False) -> bool:
        """Install ftk via Homebrew."""
        install_type = "HEAD" if use_head else "stable"
        self.console.print(f"\n[bold]Installing ftk ({install_type})...[/bold]")

        # First, tap the repository
        tap_cmd = "brew tap spantree/fluent"
        try:
            self.run_ssh(tap_cmd, check=True)
            self.console.print("[green]✓[/green] Tapped spantree/fluent")
        except SSHCommandError as e:
            self.console.print(f"[red]✗[/red] Failed to tap repository: {e}")
            return False

        # Install ftk
        install_cmd = "brew install fluent-toolkit --HEAD" if use_head else "brew install fluent-toolkit"
        try:
            self.run_ssh(install_cmd, check=True)
            self.console.print(f"[green]✓[/green] ftk installed successfully")
            return True
        except SSHCommandError as e:
            self.console.print(f"[red]✗[/red] ftk installation failed: {e}")
            return False

    def test_ftk_commands(self) -> bool:
        """Test basic ftk commands."""
        self.console.print("\n[bold]Testing ftk commands...[/bold]")

        tests = [
            ("ftk --version", "Version check"),
            ("ftk --help", "Help command"),
        ]

        all_passed = True
        for cmd, description in tests:
            try:
                result = self.run_ssh(cmd, check=True)
                self.console.print(f"[green]✓[/green] {description}")
                if cmd == "ftk --version":
                    self.console.print(f"  {result.stdout.strip()}")
            except SSHCommandError as e:
                self.console.print(f"[red]✗[/red] {description} failed: {e}")
                all_passed = False

        return all_passed

    def cleanup_ftk(self) -> bool:
        """Uninstall ftk (for testing)."""
        self.console.print("\n[bold]Cleaning up ftk installation...[/bold]")
        try:
            self.run_ssh("brew uninstall fluent-toolkit", check=True)
            self.run_ssh("brew untap spantree/fluent", check=True)
            self.console.print("[green]✓[/green] ftk uninstalled successfully")
            return True
        except SSHCommandError as e:
            self.console.print(f"[yellow]![/yellow] Cleanup failed: {e}")
            return False

    def validate(
        self, install_homebrew: bool = True, install_ftk_flag: bool = True, cleanup: bool = False
    ) -> bool:
        """Run full validation workflow."""
        self.console.print(
            Panel.fit(
                f"[bold cyan]ftk Remote Installation Validator[/bold cyan]\n"
                f"Target: {self.hostname}",
                border_style="cyan",
            )
        )

        # Check connectivity
        if not self.check_connectivity():
            return False

        # Check/install Homebrew
        has_brew = self.check_homebrew()
        if not has_brew:
            if install_homebrew:
                if not self.install_homebrew():
                    return False
            else:
                self.console.print(
                    "[red]✗[/red] Homebrew required but installation not enabled"
                )
                return False

        # Check/install ftk
        ftk_version = self.check_ftk()
        if ftk_version is None:
            if install_ftk_flag:
                if not self.install_ftk():
                    return False
            else:
                self.console.print(
                    "[red]✗[/red] ftk required but installation not enabled"
                )
                return False

        # Test commands
        if not self.test_ftk_commands():
            return False

        # Optional cleanup
        if cleanup:
            self.cleanup_ftk()

        self.console.print(
            "\n[bold green]✓ Validation completed successfully![/bold green]"
        )
        return True


def main():
    """Main entry point."""
    import argparse

    parser = argparse.ArgumentParser(
        description="Validate ftk installation on a remote host"
    )
    parser.add_argument(
        "hostname",
        nargs="?",
        default="cedrics-mac-mini.local",
        help="Remote hostname (default: cedrics-mac-mini.local)",
    )
    parser.add_argument(
        "--no-install-homebrew",
        action="store_true",
        help="Skip Homebrew installation if not found",
    )
    parser.add_argument(
        "--no-install-ftk",
        action="store_true",
        help="Skip ftk installation if not found",
    )
    parser.add_argument(
        "--cleanup",
        action="store_true",
        help="Uninstall ftk after testing",
    )

    args = parser.parse_args()

    validator = RemoteValidator(args.hostname)

    try:
        success = validator.validate(
            install_homebrew=not args.no_install_homebrew,
            install_ftk_flag=not args.no_install_ftk,
            cleanup=args.cleanup,
        )
        sys.exit(0 if success else 1)
    except KeyboardInterrupt:
        console.print("\n[yellow]Interrupted by user[/yellow]")
        sys.exit(130)
    except Exception as e:
        console.print(f"\n[red]Error: {e}[/red]")
        sys.exit(1)


if __name__ == "__main__":
    main()
