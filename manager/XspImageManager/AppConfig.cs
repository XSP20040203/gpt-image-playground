using System.Text;

namespace XspImageManager;

internal sealed class AppConfig
{
    public string OpenAiApiKey { get; set; } = "replace_with_your_openai_or_relay_key";
    public string OpenAiBaseUrl { get; set; } = "https://api.xsp2api.top/v1";
    public string PublicDefaultBaseUrl { get; set; } = "https://api.xsp2api.top/v1";
    public string ImageStorageMode { get; set; } = "fs";
    public string AdminPassword { get; set; } = "xsp-admin-change-me";

    public static AppConfig Load(string path)
    {
        var config = new AppConfig();
        if (!File.Exists(path))
        {
            return config;
        }

        foreach (var rawLine in File.ReadAllLines(path, Encoding.UTF8))
        {
            var line = rawLine.Trim();
            if (line.Length == 0 || line.StartsWith("#", StringComparison.Ordinal))
            {
                continue;
            }

            var splitAt = line.IndexOf('=');
            if (splitAt <= 0)
            {
                continue;
            }

            var key = line[..splitAt].Trim();
            var value = line[(splitAt + 1)..].Trim();

            switch (key)
            {
                case "OPENAI_API_KEY":
                    config.OpenAiApiKey = value;
                    break;
                case "OPENAI_API_BASE_URL":
                    config.OpenAiBaseUrl = value;
                    break;
                case "NEXT_PUBLIC_DEFAULT_API_BASE_URL":
                    config.PublicDefaultBaseUrl = value;
                    break;
                case "NEXT_PUBLIC_IMAGE_STORAGE_MODE":
                    config.ImageStorageMode = value;
                    break;
                case "ADMIN_PASSWORD":
                    config.AdminPassword = value;
                    break;
            }
        }

        return config;
    }

    public void Save(string path)
    {
        var lines = new[]
        {
            $"OPENAI_API_KEY={OpenAiApiKey}",
            $"OPENAI_API_BASE_URL={OpenAiBaseUrl}",
            $"NEXT_PUBLIC_DEFAULT_API_BASE_URL={PublicDefaultBaseUrl}",
            $"NEXT_PUBLIC_IMAGE_STORAGE_MODE={ImageStorageMode}",
            $"ADMIN_PASSWORD={AdminPassword}"
        };

        File.WriteAllLines(path, lines, Encoding.UTF8);
    }
}
