using System.Diagnostics;

namespace XspImageManager;

internal sealed class MainForm : Form
{
    private readonly string projectDir = @"C:\Users\30272\Desktop\skills\local-image-webui\gpt-image-playground";
    private readonly string envPath = @"C:\Users\30272\Desktop\skills\local-image-webui\gpt-image-playground\.env.local";
    private readonly string nextCmdPath = @"C:\Users\30272\Desktop\skills\local-image-webui\gpt-image-playground\node_modules\.bin\next.cmd";
    private readonly string cloudflaredPath = @"C:\Users\30272\AppData\Local\Microsoft\WinGet\Packages\Cloudflare.cloudflared_Microsoft.Winget.Source_8wekyb3d8bbwe\cloudflared.exe";
    private readonly string tunnelConfigPath = @"C:\Users\30272\.cloudflared\config-img.yml";
    private const string TunnelName = "xsp-image";
    private const string TunnelId = "0e6f2745-2a55-467e-af2f-4d47642e0040";
    private const string LocalUrl = "http://127.0.0.1:3000";
    private const string PublicUrl = "https://img.xsp2api.top";

    private readonly TextBox apiKeyTextBox = new();
    private readonly TextBox apiBaseTextBox = new();
    private readonly TextBox publicBaseTextBox = new();
    private readonly TextBox adminPasswordTextBox = new();
    private readonly ComboBox storageModeComboBox = new();
    private readonly TextBox logTextBox = new();
    private readonly Label webStatusLabel = new();
    private readonly Label tunnelStatusLabel = new();
    private readonly Label localStatusLabel = new();
    private readonly Label domainStatusLabel = new();
    private readonly List<Process> attachedProcesses = [];

    private enum StatusTone
    {
        Neutral,
        Success,
        Error
    }

    private Button startButton = null!;
    private Button stopButton = null!;
    private Button restartButton = null!;
    private Button checkButton = null!;
    private Button saveButton = null!;
    private Button buildButton = null!;
    private Button openDomainButton = null!;

    public MainForm()
    {
        Text = "XSP Image Manager";
        var iconPath = Path.Combine(AppContext.BaseDirectory, "xsp-logo.ico");
        if (File.Exists(iconPath))
        {
            Icon = new Icon(iconPath);
        }
        Width = 1080;
        Height = 760;
        MinimumSize = new Size(960, 660);
        StartPosition = FormStartPosition.CenterScreen;
        Font = new Font("Microsoft YaHei UI", 9F);
        var appIcon = Icon.ExtractAssociatedIcon(Application.ExecutablePath);
        if (appIcon is not null)
        {
            Icon = appIcon;
        }

        BuildUi();
        LoadConfigIntoUi();
        _ = CheckStatusAsync();
    }

    private void BuildUi()
    {
        var root = new TableLayoutPanel
        {
            Dock = DockStyle.Fill,
            ColumnCount = 1,
            RowCount = 5,
            Padding = new Padding(14)
        };
        root.RowStyles.Add(new RowStyle(SizeType.AutoSize));
        root.RowStyles.Add(new RowStyle(SizeType.AutoSize));
        root.RowStyles.Add(new RowStyle(SizeType.AutoSize));
        root.RowStyles.Add(new RowStyle(SizeType.Percent, 100));
        root.RowStyles.Add(new RowStyle(SizeType.AutoSize));
        Controls.Add(root);

        var header = new TableLayoutPanel
        {
            Dock = DockStyle.Fill,
            ColumnCount = 2,
            AutoSize = true
        };
        header.ColumnStyles.Add(new ColumnStyle(SizeType.Percent, 100));
        header.ColumnStyles.Add(new ColumnStyle(SizeType.AutoSize));

        var title = new Label
        {
            Text = "XSP Image Playground 本地管理平台",
            Font = new Font(Font, FontStyle.Bold),
            AutoSize = true,
            Padding = new Padding(0, 0, 0, 4)
        };
        var subtitle = new Label
        {
            Text = "管理本地 WebUI、Cloudflare Tunnel、默认 API 配置和管理员密码。",
            AutoSize = true,
            ForeColor = Color.DimGray
        };
        var titleStack = new FlowLayoutPanel { FlowDirection = FlowDirection.TopDown, AutoSize = true, Dock = DockStyle.Fill };
        titleStack.Controls.Add(title);
        titleStack.Controls.Add(subtitle);
        header.Controls.Add(titleStack, 0, 0);

        openDomainButton = new Button { Text = "打开域名", AutoSize = true, Height = 34 };
        openDomainButton.Click += (_, _) => OpenUrl(PublicUrl);
        header.Controls.Add(openDomainButton, 1, 0);
        root.Controls.Add(header);

        var controlGroup = CreateGroupBox("服务控制");
        var controlPanel = new TableLayoutPanel { Dock = DockStyle.Fill, ColumnCount = 2, AutoSize = true };
        controlPanel.ColumnStyles.Add(new ColumnStyle(SizeType.AutoSize));
        controlPanel.ColumnStyles.Add(new ColumnStyle(SizeType.Percent, 100));

        var buttonsPanel = new FlowLayoutPanel { Dock = DockStyle.Fill, AutoSize = true };
        startButton = CreateButton("启动服务", async (_, _) => await StartAllAsync());
        stopButton = CreateButton("停止服务", async (_, _) => await StopAllAsync());
        restartButton = CreateButton("重启服务", async (_, _) => await RestartAllAsync());
        checkButton = CreateButton("检测状态", async (_, _) => await CheckStatusAsync());
        buildButton = CreateButton("重新构建", async (_, _) => await BuildWebUiAsync());
        buttonsPanel.Controls.AddRange(new Control[] { startButton, stopButton, restartButton, checkButton, buildButton });
        controlPanel.Controls.Add(buttonsPanel, 0, 0);

        var statusPanel = new FlowLayoutPanel { Dock = DockStyle.Fill, AutoSize = true, FlowDirection = FlowDirection.LeftToRight, WrapContents = true };
        statusPanel.Controls.AddRange(new Control[]
        {
            CreateStatusBlock("WebUI", webStatusLabel),
            CreateStatusBlock("Tunnel", tunnelStatusLabel),
            CreateStatusBlock("Local", localStatusLabel),
            CreateStatusBlock("Domain", domainStatusLabel)
        });
        controlPanel.Controls.Add(statusPanel, 1, 0);
        controlGroup.Controls.Add(controlPanel);
        root.Controls.Add(controlGroup);

        var configGroup = CreateGroupBox("默认配置");
        var configGrid = new TableLayoutPanel { Dock = DockStyle.Fill, ColumnCount = 2, RowCount = 6, AutoSize = true, Padding = new Padding(8) };
        configGrid.ColumnStyles.Add(new ColumnStyle(SizeType.Absolute, 170));
        configGrid.ColumnStyles.Add(new ColumnStyle(SizeType.Percent, 100));

        AddConfigRow(configGrid, 0, "默认 API 地址", apiBaseTextBox);
        AddConfigRow(configGrid, 1, "前端默认 API 地址", publicBaseTextBox);
        AddConfigRow(configGrid, 2, "默认 API Key", apiKeyTextBox);
        AddConfigRow(configGrid, 3, "管理员密码", adminPasswordTextBox);

        storageModeComboBox.DropDownStyle = ComboBoxStyle.DropDownList;
        storageModeComboBox.Items.AddRange(new object[] { "fs", "indexeddb" });
        AddConfigRow(configGrid, 4, "图片存储模式", storageModeComboBox);

        var savePanel = new FlowLayoutPanel { Dock = DockStyle.Fill, AutoSize = true };
        saveButton = CreateButton("保存配置", async (_, _) => await SaveConfigAsync());
        var reloadButton = CreateButton("重新读取", (_, _) => LoadConfigIntoUi());
        savePanel.Controls.AddRange(new Control[] { saveButton, reloadButton });
        configGrid.Controls.Add(new Label(), 0, 5);
        configGrid.Controls.Add(savePanel, 1, 5);

        configGroup.Controls.Add(configGrid);
        root.Controls.Add(configGroup);

        var logGroup = new GroupBox
        {
            Text = "过程调试输出",
            Dock = DockStyle.Fill,
            Padding = new Padding(10),
            MinimumSize = new Size(0, 260)
        };

        var logLayout = new TableLayoutPanel
        {
            Dock = DockStyle.Fill,
            ColumnCount = 1,
            RowCount = 2
        };
        logLayout.RowStyles.Add(new RowStyle(SizeType.AutoSize));
        logLayout.RowStyles.Add(new RowStyle(SizeType.Percent, 100));

        var logToolbar = new FlowLayoutPanel
        {
            Dock = DockStyle.Fill,
            FlowDirection = FlowDirection.LeftToRight,
            AutoSize = true
        };
        var clearLogButton = new Button
        {
            Text = "清空日志",
            Height = 28,
            AutoSize = true,
            Margin = new Padding(0, 0, 8, 6)
        };
        clearLogButton.Click += (_, _) => logTextBox.Clear();
        logToolbar.Controls.Add(clearLogButton);

        logTextBox.Multiline = true;
        logTextBox.ReadOnly = true;
        logTextBox.ScrollBars = ScrollBars.Both;
        logTextBox.WordWrap = false;
        logTextBox.Dock = DockStyle.Fill;
        logTextBox.BackColor = Color.FromArgb(20, 20, 20);
        logTextBox.ForeColor = Color.FromArgb(230, 230, 230);
        logTextBox.Font = new Font("Consolas", 9F);
        logTextBox.MinimumSize = new Size(0, 220);
        logLayout.Controls.Add(logToolbar, 0, 0);
        logLayout.Controls.Add(logTextBox, 0, 1);
        logGroup.Controls.Add(logLayout);
        root.Controls.Add(logGroup, 0, 3);

        var footer = new Label
        {
            Text = $"Local: {LocalUrl}    Domain: {PublicUrl}",
            AutoSize = true,
            ForeColor = Color.DimGray,
            Padding = new Padding(0, 8, 0, 0)
        };
        root.Controls.Add(footer, 0, 4);
    }

    private async Task StartAllAsync()
    {
        SetBusy(true);
        try
        {
            Log("Starting services...");
            await StartWebUiAsync();
            await StartTunnelAsync();
            await CheckStatusAsync();
            Log("Start complete.");
        }
        finally
        {
            SetBusy(false);
        }
    }

    private async Task StopAllAsync()
    {
        SetBusy(true);
        try
        {
            Log("Stopping services...");
            var webPid = ProcessHelper.FindPortOwner(3000);
            if (webPid.HasValue)
            {
                ProcessHelper.StopProcessTree(webPid.Value, Log);
            }
            else
            {
                Log("WebUI is not listening on port 3000.");
            }

            foreach (var process in ProcessHelper.FindCloudflaredTunnel(TunnelId, tunnelConfigPath))
            {
                ProcessHelper.StopProcessTree(process.Id, Log);
            }

            await Task.Delay(800);
            await CheckStatusAsync(probeEndpoints: false);
            Log("Stop complete.");
        }
        finally
        {
            SetBusy(false);
        }
    }

    private async Task RestartAllAsync()
    {
        await StopAllAsync();
        await StartAllAsync();
    }

    private async Task StartWebUiAsync()
    {
        var webPid = ProcessHelper.FindPortOwner(3000);
        if (webPid.HasValue)
        {
            Log($"WebUI already running on port 3000. PID {webPid.Value}");
            return;
        }

        if (!File.Exists(nextCmdPath))
        {
            Log($"next.cmd not found: {nextCmdPath}");
            return;
        }

        Log("Starting WebUI with next.cmd start...");
        var startInfo = new ProcessStartInfo
        {
            FileName = "cmd.exe",
            Arguments = $"/d /c \"\"{nextCmdPath}\" start\"",
            WorkingDirectory = projectDir,
            UseShellExecute = false,
            CreateNoWindow = true,
            RedirectStandardOutput = true,
            RedirectStandardError = true
        };

        var process = new Process { StartInfo = startInfo, EnableRaisingEvents = true };
        process.OutputDataReceived += (_, e) => { if (!string.IsNullOrWhiteSpace(e.Data)) Log("[web] " + e.Data); };
        process.ErrorDataReceived += (_, e) => { if (!string.IsNullOrWhiteSpace(e.Data)) Log("[web] " + e.Data); };
        process.Exited += (_, _) => Log($"[web] process exited with code {process.ExitCode}");
        attachedProcesses.Add(process);
        process.Start();
        process.BeginOutputReadLine();
        process.BeginErrorReadLine();

        for (var i = 0; i < 30; i++)
        {
            var (ok, _, _) = await ProcessHelper.CheckHttpAsync(LocalUrl);
            if (ok)
            {
                Log("WebUI is ready.");
                return;
            }
            await Task.Delay(1000);
        }

        Log("WebUI start timeout. Check log output above.");
    }

    private async Task StartTunnelAsync()
    {
        if (ProcessHelper.FindCloudflaredTunnel(TunnelId, tunnelConfigPath).Count > 0)
        {
            Log("Cloudflare tunnel already running.");
            return;
        }

        if (!File.Exists(cloudflaredPath))
        {
            Log($"cloudflared not found: {cloudflaredPath}");
            return;
        }

        Log("Starting Cloudflare tunnel...");
        var startInfo = new ProcessStartInfo
        {
            FileName = cloudflaredPath,
            Arguments = $"tunnel --config \"{tunnelConfigPath}\" run {TunnelId}",
            WorkingDirectory = projectDir,
            UseShellExecute = false,
            CreateNoWindow = true,
            RedirectStandardOutput = true,
            RedirectStandardError = true
        };

        var process = new Process { StartInfo = startInfo, EnableRaisingEvents = true };
        process.OutputDataReceived += (_, e) => { if (!string.IsNullOrWhiteSpace(e.Data)) Log("[tunnel] " + e.Data); };
        process.ErrorDataReceived += (_, e) => { if (!string.IsNullOrWhiteSpace(e.Data)) Log("[tunnel] " + e.Data); };
        process.Exited += (_, _) => Log($"[tunnel] process exited with code {process.ExitCode}");
        attachedProcesses.Add(process);
        process.Start();
        process.BeginOutputReadLine();
        process.BeginErrorReadLine();

        for (var i = 0; i < 30; i++)
        {
            var (ok, _, _) = await ProcessHelper.CheckHttpAsync(PublicUrl);
            if (ok)
            {
                Log("Cloudflare tunnel is ready.");
                return;
            }

            await Task.Delay(1000);
        }

        Log("Cloudflare tunnel start timeout. Check log output above.");
    }

    private async Task BuildWebUiAsync()
    {
        SetBusy(true);
        try
        {
            Log("Building WebUI. This is required after changing public default API URL.");
            if (!File.Exists(nextCmdPath))
            {
                Log($"next.cmd not found: {nextCmdPath}");
                return;
            }

            var exitCode = await ProcessHelper.RunProcessAsync("cmd.exe", $"/d /c \"\"{nextCmdPath}\" build\"", projectDir, Log);
            Log(exitCode == 0 ? "Build succeeded." : "Build failed.");
        }
        finally
        {
            SetBusy(false);
        }
    }

    private async Task CheckStatusAsync(bool probeEndpoints = true)
    {
        var webPid = ProcessHelper.FindPortOwner(3000);
        if (webPid.HasValue)
        {
            SetStatus(webStatusLabel, $"运行中 PID {webPid}", StatusTone.Success);
        }
        else
        {
            SetStatus(webStatusLabel, "已停止", StatusTone.Neutral);
        }

        var tunnelProcesses = ProcessHelper.FindCloudflaredTunnel(TunnelId, tunnelConfigPath);
        if (tunnelProcesses.Count > 0)
        {
            SetStatus(tunnelStatusLabel, $"运行中 PID {tunnelProcesses[0].Id}", StatusTone.Success);
        }
        else
        {
            SetStatus(tunnelStatusLabel, "已停止", StatusTone.Neutral);
        }

        if (probeEndpoints && webPid.HasValue)
        {
            var local = await ProcessHelper.CheckHttpAsync(LocalUrl);
            SetStatus(localStatusLabel, local.ok ? $"HTTP {local.statusCode}" : "失败", local.ok ? StatusTone.Success : StatusTone.Error);
        }
        else
        {
            SetStatus(localStatusLabel, webPid.HasValue ? "等待启动" : "已停止", StatusTone.Neutral);
        }

        if (probeEndpoints && tunnelProcesses.Count > 0)
        {
            var domain = await ProcessHelper.CheckHttpAsync(PublicUrl);
            SetStatus(domainStatusLabel, domain.ok ? $"HTTP {domain.statusCode}" : "失败", domain.ok ? StatusTone.Success : StatusTone.Error);
        }
        else
        {
            SetStatus(domainStatusLabel, tunnelProcesses.Count > 0 ? "等待连接" : "已停止", StatusTone.Neutral);
        }

        Log($"Status: WebUI={(webPid.HasValue ? "running" : "stopped")}, Tunnel={(tunnelProcesses.Count > 0 ? "running" : "stopped")}, Local={(probeEndpoints && webPid.HasValue ? "probed" : "stopped")}, Domain={(probeEndpoints && tunnelProcesses.Count > 0 ? "probed" : "stopped")}");
    }

    private async Task SaveConfigAsync()
    {
        var config = new AppConfig
        {
            OpenAiApiKey = apiKeyTextBox.Text.Trim(),
            OpenAiBaseUrl = apiBaseTextBox.Text.Trim(),
            PublicDefaultBaseUrl = publicBaseTextBox.Text.Trim(),
            AdminPassword = adminPasswordTextBox.Text,
            ImageStorageMode = storageModeComboBox.SelectedItem?.ToString() ?? "fs"
        };

        config.Save(envPath);
        Log($"Saved configuration to {envPath}");
        Log("If you changed the front-end default API URL, click Rebuild and then Restart Service.");
        await Task.CompletedTask;
    }

    private void LoadConfigIntoUi()
    {
        var config = AppConfig.Load(envPath);
        apiKeyTextBox.Text = config.OpenAiApiKey;
        apiBaseTextBox.Text = config.OpenAiBaseUrl;
        publicBaseTextBox.Text = config.PublicDefaultBaseUrl;
        adminPasswordTextBox.Text = config.AdminPassword;
        storageModeComboBox.SelectedItem = config.ImageStorageMode;
        if (storageModeComboBox.SelectedIndex < 0)
        {
            storageModeComboBox.SelectedIndex = 0;
        }
        Log("Configuration loaded.");
    }

    private GroupBox CreateGroupBox(string text)
    {
        return new GroupBox
        {
            Text = text,
            Dock = DockStyle.Fill,
            AutoSize = true,
            Padding = new Padding(10)
        };
    }

    private Button CreateButton(string text, EventHandler onClick)
    {
        var button = new Button
        {
            Text = text,
            Height = 34,
            AutoSize = true,
            Margin = new Padding(0, 0, 8, 8)
        };
        button.Click += onClick;
        return button;
    }

    private Control CreateStatusBlock(string title, Label valueLabel)
    {
        var panel = new FlowLayoutPanel
        {
            FlowDirection = FlowDirection.LeftToRight,
            AutoSize = true,
            Margin = new Padding(12, 4, 0, 4)
        };
        panel.Controls.Add(new Label { Text = title + ":", AutoSize = true, ForeColor = Color.DimGray, Padding = new Padding(0, 5, 4, 0) });
        valueLabel.AutoSize = true;
        valueLabel.Padding = new Padding(8, 5, 8, 5);
        valueLabel.BackColor = Color.Gainsboro;
        valueLabel.Text = "检测中";
        panel.Controls.Add(valueLabel);
        return panel;
    }

    private void AddConfigRow(TableLayoutPanel grid, int row, string label, Control control)
    {
        var labelControl = new Label
        {
            Text = label,
            AutoSize = true,
            Anchor = AnchorStyles.Left,
            Padding = new Padding(0, 8, 8, 0)
        };
        control.Dock = DockStyle.Fill;
        control.Margin = new Padding(0, 3, 0, 7);
        grid.Controls.Add(labelControl, 0, row);
        grid.Controls.Add(control, 1, row);
    }

    private void SetBusy(bool busy)
    {
        foreach (var button in new[] { startButton, stopButton, restartButton, checkButton, saveButton, buildButton, openDomainButton })
        {
            button.Enabled = !busy;
        }
    }

    private void SetStatus(Label label, string text, StatusTone tone)
    {
        label.Text = text;
        if (tone == StatusTone.Success)
        {
            label.BackColor = Color.FromArgb(220, 245, 225);
            label.ForeColor = Color.FromArgb(20, 105, 45);
        }
        else if (tone == StatusTone.Error)
        {
            label.BackColor = Color.FromArgb(255, 226, 226);
            label.ForeColor = Color.FromArgb(145, 25, 25);
        }
        else
        {
            label.BackColor = Color.FromArgb(235, 235, 235);
            label.ForeColor = Color.FromArgb(90, 90, 90);
        }
    }

    private void OpenUrl(string url)
    {
        try
        {
            Process.Start(new ProcessStartInfo { FileName = url, UseShellExecute = true });
        }
        catch (Exception ex)
        {
            Log("Open URL failed: " + ex.Message);
        }
    }

    private void Log(string message)
    {
        if (InvokeRequired)
        {
            BeginInvoke(() => Log(message));
            return;
        }

        logTextBox.AppendText($"[{DateTime.Now:HH:mm:ss}] {message}{Environment.NewLine}");
    }
}
