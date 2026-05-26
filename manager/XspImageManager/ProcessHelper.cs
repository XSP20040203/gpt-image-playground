using System.Diagnostics;
using System.Net.Http;
using System.Net.NetworkInformation;

namespace XspImageManager;

internal static class ProcessHelper
{
    public static async Task<int> RunProcessAsync(
        string fileName,
        string arguments,
        string workingDirectory,
        Action<string> log,
        CancellationToken cancellationToken = default)
    {
        var startInfo = new ProcessStartInfo
        {
            FileName = fileName,
            Arguments = arguments,
            WorkingDirectory = workingDirectory,
            UseShellExecute = false,
            CreateNoWindow = true,
            RedirectStandardOutput = true,
            RedirectStandardError = true
        };

        using var process = new Process { StartInfo = startInfo, EnableRaisingEvents = true };
        process.OutputDataReceived += (_, e) => { if (!string.IsNullOrWhiteSpace(e.Data)) log(e.Data); };
        process.ErrorDataReceived += (_, e) => { if (!string.IsNullOrWhiteSpace(e.Data)) log(e.Data); };

        log($"> {fileName} {arguments}");
        process.Start();
        process.BeginOutputReadLine();
        process.BeginErrorReadLine();

        await process.WaitForExitAsync(cancellationToken);
        log($"Process exited with code {process.ExitCode}");
        return process.ExitCode;
    }

    public static int? FindPortOwner(int port)
    {
        var properties = IPGlobalProperties.GetIPGlobalProperties();
        var listener = properties.GetActiveTcpListeners().FirstOrDefault(endpoint => endpoint.Port == port);
        if (listener == null)
        {
            return null;
        }

        var netstat = RunHidden("netstat.exe", "-ano -p tcp");
        foreach (var line in netstat.Split(Environment.NewLine, StringSplitOptions.RemoveEmptyEntries))
        {
            var parts = line.Split(' ', StringSplitOptions.RemoveEmptyEntries);
            if (parts.Length >= 5 && parts[1].EndsWith($":{port}", StringComparison.Ordinal))
            {
                return int.TryParse(parts[^1], out var pid) ? pid : null;
            }
        }

        return null;
    }

    public static IReadOnlyList<Process> FindCloudflaredTunnel(string tunnelIdentifier, string configPath)
    {
        var normalizedConfigPath = configPath.Replace('/', '\\');

        return Process.GetProcessesByName("cloudflared")
            .Where(process =>
            {
                try
                {
                    var commandLine = RunHidden(
                        "powershell.exe",
                        $"-NoProfile -Command \"(Get-CimInstance Win32_Process -Filter \\\"ProcessId = {process.Id}\\\").CommandLine\"");
                    return commandLine.Contains(tunnelIdentifier, StringComparison.OrdinalIgnoreCase)
                        || commandLine.Replace('/', '\\').Contains(normalizedConfigPath, StringComparison.OrdinalIgnoreCase);
                }
                catch
                {
                    return false;
                }
            })
            .ToList();
    }

    public static void StopProcessTree(int pid, Action<string> log)
    {
        log($"Stopping process tree PID {pid} ...");
        RunHidden("taskkill.exe", $"/PID {pid} /T /F");
    }

    public static async Task<(bool ok, int? statusCode, string message)> CheckHttpAsync(string url)
    {
        try
        {
            using var client = new HttpClient { Timeout = TimeSpan.FromSeconds(12) };
            using var response = await client.GetAsync(url);
            return ((int)response.StatusCode is >= 200 and < 500, (int)response.StatusCode, response.ReasonPhrase ?? "OK");
        }
        catch (Exception ex)
        {
            return (false, null, ex.Message);
        }
    }

    private static string RunHidden(string fileName, string arguments)
    {
        var startInfo = new ProcessStartInfo
        {
            FileName = fileName,
            Arguments = arguments,
            UseShellExecute = false,
            CreateNoWindow = true,
            RedirectStandardOutput = true,
            RedirectStandardError = true
        };

        using var process = Process.Start(startInfo) ?? throw new InvalidOperationException($"Could not start {fileName}");
        var output = process.StandardOutput.ReadToEnd();
        var error = process.StandardError.ReadToEnd();
        process.WaitForExit();
        return output + error;
    }
}
