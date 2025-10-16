/**
 * Command utilities for checking and running system commands
 */

export async function commandExists(command: string): Promise<boolean> {
  try {
    const process = new Deno.Command("which", {
      args: [command],
      stdout: "null",
      stderr: "null",
    });
    const { success } = await process.output();
    return success;
  } catch {
    return false;
  }
}

export async function getCommandVersion(
  command: string,
  versionArg = "--version"
): Promise<string | null> {
  try {
    const process = new Deno.Command(command, {
      args: [versionArg],
      stdout: "piped",
      stderr: "piped",
    });

    const { stdout, stderr } = await process.output();
    const output = new TextDecoder().decode(stdout || stderr);

    // Extract version number (e.g., "v18.0.0" or "18.0.0" or "Python 3.10.0")
    const versionMatch = output.match(/(\d+\.\d+\.\d+)/);
    return versionMatch ? versionMatch[1] : null;
  } catch {
    return null;
  }
}

export async function runCommand(
  command: string,
  args: string[]
): Promise<{ success: boolean; output: string }> {
  try {
    const process = new Deno.Command(command, {
      args,
      stdout: "piped",
      stderr: "piped",
    });

    const { success, stdout, stderr } = await process.output();
    const output = new TextDecoder().decode(success ? stdout : stderr);

    return { success, output };
  } catch (error) {
    return {
      success: false,
      output: error instanceof Error ? error.message : String(error),
    };
  }
}

export function compareVersions(v1: string, v2: string): number {
  const parts1 = v1.split(".").map(Number);
  const parts2 = v2.split(".").map(Number);

  for (let i = 0; i < Math.max(parts1.length, parts2.length); i++) {
    const num1 = parts1[i] || 0;
    const num2 = parts2[i] || 0;

    if (num1 > num2) return 1;
    if (num1 < num2) return -1;
  }

  return 0;
}

export function getInstallCommand(runtime: string): string {
  switch (runtime) {
    case "node":
      return "brew install node";
    case "python":
    case "python3":
      return "brew install python";
    case "uv":
      return "brew install uv";
    case "docker":
      return "brew install --cask docker";
    default:
      return `# Install ${runtime} manually`;
  }
}
