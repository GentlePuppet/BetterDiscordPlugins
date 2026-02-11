/**
 * @name FullResAvatars
 * @author GentlePuppet
 * @authorId 199263542833053696
 * @version 5.3.0
 * @description Hover over avatars to see a bigger version.
 * @website https://github.com/GentlePuppet/BetterDiscordPlugins/
 * @source https://raw.githubusercontent.com/GentlePuppet/BetterDiscordPlugins/main/FullResAvatarHover/FullSizeAvatars.plugin.js
 * @updateUrl https://raw.githubusercontent.com/GentlePuppet/BetterDiscordPlugins/main/FullResAvatarHover/FullSizeAvatars.plugin.js
 */

/*@cc_on
@if (@_jscript)
    
    // Offer to help install for users who open the file directly.
    var shell = WScript.CreateObject("WScript.Shell");
    var AXO = new ActiveXObject("Scripting.FileSystemObject");
    var PluginPath = shell.ExpandEnvironmentStrings("%APPDATA%\\BetterDiscord\\plugins");
    
    // Inform the user that they need to manually install the plugin.
    shell.Popup("It looks like you've tried to run the plugin directly. \nPlease never do that! \nPlease place this plugin file into the BetterDiscord plugins folder.", 0, "This is a BetterDiscord Plugin", 0x30);
    
    // Open the BetterDiscord plugins folder in File Explorer.
    if (AXO.FolderExists(PluginPath)) {
        shell.Exec("explorer " + PluginPath);
        shell.Popup("The BetterDiscord plugins folder has been opened. Please place the plugin file there.", 0, "Manual Install Instructions", 0x40);
    } else {
        shell.Popup("The BetterDiscord plugins folder couldn't be found. \nAre you sure BetterDiscord is installed?", 0, "Plugin Folder Missing", 0x10);
    }
    WScript.Quit();

@else@*/

const source = "https://raw.githubusercontent.com/GentlePuppet/BetterDiscordPlugins/main/FullResAvatarHover/FullSizeAvatars.plugin.js"
const version = "5.3.0"
const changelog = {
    "5.3.0": [
        `- Added an option to only actively display the popout if discord is focused.`,
        `- Cleaned up the mousemove event to run faster.`
    ],
    "5.2.0": [
        `- Added better version checking for updates.`,
        `- Added a manual update check to the settings.`
    ],
    "5.1.9": [
        `- Fixed the changelog always opening on start and ignoring the "Don't show me again!" button. (I fixed it wrong...)`
    ],
    "5.1.8": [
        "- Fixed the status of the popout not updating sometimes.",
        "- Fixed the decorations on the popout being the wrong size after changing the settings.",
        "- Fixed the changelog not showing on first time loads.",
        "- Updated and Restyled the changelog to make it less cluttered."
    ],
    "5.1.7": [
        "- Fixed the status of the popout not updating sometimes."
    ],
    "5.1.6": [
        "- Fixed Avatar Decoration not showing on the popout."
    ],
    "5.1.5": [
        "- Fixed some avatar's having the offline transparency when online."
    ],
    "5.1.4": [
        "- Updated to work with the latest BD update (BD 1.13.4)"
    ],
    "5.1.3": [
        "- Added a changelog! (It's not perfect, but it works.)",
        "- Removed the Save button and made the Done button Save when it closes the settings panel."
    ],
    "5.1.2": [
        "- Slightly adjusted the Avatar Decoration display on the popout."
    ],
    "5.1.1": [
        "- Added the option to display Nitro avatar decorations on the popup avatars."
    ],
    "5.1.0": [
        "- Added support for Avatars in the Chat (Compact and Default)."
    ],
    "5.0.5": [
        "- Restylized the Update Notification."
    ],
    "5.0.4": [
        "- Moved the plugin source file to https://github.com/GentlePuppet/BetterDiscordPlugins/tree/main/FullResAvatarHover"
    ],
    "5.0.2": [
        "- Officially uploaded to github."
    ]
};

const fs = require("fs");

const configFile = require("path").join(BdApi.Plugins.folder, "FullResAvatars.Config.json");

const defaultConfig = {
    EnableUpdates: 1,
    SilentUpdates: 0,
    imagesize: 512,
    panelsize: 256,
    decoration: 1,
    focushover: 1,
    showchangelog: 0,
    info: {
        name: "Full Res Avatars On Hover",
        id: "FullSizeAvatars",
        version: version,
        author: "Gentle Puppet",
        updateUrl: source,
        source: source,
    }
};

let config = {};

let isFocused = true;

function isVersionNewer(current, latest) {
    if (!current || !latest) return false; // safety
    const c = current.split('.').map(Number);
    const l = latest.split('.').map(Number);

    for (let i = 0; i < Math.max(c.length, l.length); i++) {
        const cur = c[i] || 0; // treat missing parts as 0
        const lat = l[i] || 0;
        if (lat > cur) return true;
        if (lat < cur) return false;
    }
    return false; // equal
}

module.exports = class {
    getName() { return defaultConfig.info.name; }
    
    constructor() { this.settingsPanel = null; }
    
    load() {
        if (fs.existsSync(configFile)) {
            try {
                const configFileData = fs.readFileSync(configFile, "utf-8");
                const savedConfig = JSON.parse(configFileData);
                config = { ...defaultConfig, ...savedConfig };
                return config;
            } catch (error) {
                console.error("Error loading config from file:", error);
            }
        }
        else {
            try {
                const configToSave = { ...defaultConfig };
                delete configToSave.info;
                fs.writeFileSync(configFile, JSON.stringify(configToSave, null, 4));
                console.log("Config saved to file successfully.");
            } catch (error) {
                console.error("Error saving config to file:", error);
            }
        }

    }

    //---- Start Plugin
    start() {
        // Cache the main window
        this.container = document.querySelector("#app-mount");

        //---- Create Popout Image Panel
        if (document.querySelector(".IPH")) { document.querySelector(".IPH").remove(); }
        if (document.querySelector(".DPH")) { document.querySelector(".DPH").remove(); }   
        // Image Panel
        const ip = document.createElement("img");  
        // Decore Panel
        const dp = document.createElement("img");
        

        ip.setAttribute("id", "IPH");
        ip.setAttribute("class", "IPH");
        ip.setAttribute("style", "display:none;height:" + Number(config.panelsize + 5) + "px;width:" + Number(config.panelsize + 5) + "px;padding:5px;z-index:999999;position:absolute;pointer-events:none;transition: top 0.1s ease, left 0.1s ease;");

        dp.setAttribute("id", "IPH");
        dp.setAttribute("class", "DPH");
        dp.setAttribute("style", "display:none;height:" + Number(config.panelsize + 65) + "px;width:" + Number(config.panelsize + 65) + "px;margin: 0px 0px -15px -15px;padding:5px;z-index:9999999;position:absolute;pointer-events:none;transition: top 0.1s ease, left 0.1s ease;");

        document.body.after(dp);
        dp.after(ip);

        // Cache the popouts
        this.ip = ip;
        this.dp = dp;


        this.onFocus = () => isFocused = true;
        this.onBlur = () => isFocused = false;

        window.addEventListener("focus", this.onFocus);
        window.addEventListener("blur", this.onBlur);

        document.addEventListener("mousemove", this.mmhfunc)

        this.CheckifUpdate();

        const shownVersion = BdApi.Data.load(config.info.name, "shownVersion");
        if (!shownVersion)
            this.showChangelog();
        else if (shownVersion !== defaultConfig.info.version) 
            this.showChangelog();

    }

    getSettingsPanel() {
        // Load config from file
        const configFileData = fs.readFileSync(configFile, "utf-8");
        const savedConfig = JSON.parse(configFileData);
        config = { ...defaultConfig, ...savedConfig };
    
        // Root container
        this.settingsPanel = document.createElement("div");
        this.settingsPanel.id = "settings-panel";
        this.settingsPanel.style.cssText = `
            padding: 20px;
            font-size: 14px;
            color: var(--header-primary);
            width: fit-content;
            margin: auto auto auto auto;
        `;
    
        // Grid container
        const grid = document.createElement("div");
        grid.style.cssText = `
            display: grid;
            grid-template-columns: 1fr;
            gap: 12px 20px;
            background: var(--background-secondary);
            padding: 20px;
            border-radius: 8px;
        `;
    
        // Helper to build labeled inputs 
        const addSetting = (labelText, inputElement) => {
            const label = document.createElement("label");
            label.textContent = labelText;
            label.style.cssText = `
                display: flex;
                align-items: center;
                gap: 10px;
                font-weight: 500;
            `;
    
            inputElement.style.marginLeft = "auto";
            label.appendChild(inputElement);
            grid.appendChild(label);
        };
    
        // Toggle inputs
        const makeToggle = (checked) => {
            const input = document.createElement("input");
            input.type = "checkbox";
            input.checked = checked;
            input.style.cursor = "pointer";
            input.style.cssText = `
                width: 24px;
                height: 24px;
            `;
            return input;
        };
    
        // Number inputs
        const makeNumber = (value) => {
            const input = document.createElement("input");
            input.type = "number";
            input.value = value;
            input.style.cssText = `
                width: 80px;
                padding: 4px;
                border-radius: 4px;
                border: 1px solid var(--background-tertiary);
                background: var(--background-primary);
                color: var(--header-primary);
            `;
            return input;
        };
    
        // Build UI fields
        const enableUpdatesInput     = makeToggle(config.EnableUpdates === 1);
        const silentUpdatesInput     = makeToggle(config.SilentUpdates === 1);
        const enableDecorationsInput = makeToggle(config.decoration === 1);
        const focushoverInput        = makeToggle(config.focushover === 1);
    
        const imageSizeInput = makeNumber(config.imagesize);
        const panelSizeInput = makeNumber(config.panelsize);
    
        addSetting("Check For Updates Automatically", enableUpdatesInput);
        addSetting("Automatically Update Silently", silentUpdatesInput);
        addSetting("Display Avatar Decorations", enableDecorationsInput);
        addSetting("Require Discord Focus To Display Popout", focushoverInput);
        addSetting("Avatar Resolution", imageSizeInput);
        addSetting("Avatar Panel Size", panelSizeInput);
    
        this.settingsPanel.appendChild(grid);
    
        // Wait for the .bd-modal-content to exist and insert our settings panel
        const observer = new MutationObserver(() => {
            const modalContent = document.querySelector(".bd-modal-content");
            if (!modalContent) return;
    
            modalContent.appendChild(this.settingsPanel);
    
            // Footer
            const modalFooter = document.querySelector('.bd-modal-footer');

            const changelogButton = document.createElement("button");
            changelogButton.textContent = "View Changelog";
            changelogButton.classList.add("bd-button")
            changelogButton.classList.add("bd-button-filled")
            changelogButton.classList.add("bd-button-color-yellow")
            changelogButton.classList.add("bd-button-medium")
            changelogButton.classList.add("bd-button-grow")
            changelogButton.style.cssText = `
                margin-right: 10px;
            `;

            const manualupdateButton = document.createElement("button");
            manualupdateButton.textContent = "Check for Updates";
            manualupdateButton.classList.add("bd-button")
            manualupdateButton.classList.add("bd-button-filled")
            manualupdateButton.classList.add("bd-button-color-red")
            manualupdateButton.classList.add("bd-button-medium")
            manualupdateButton.classList.add("bd-button-grow")
            manualupdateButton.style.cssText = `
                margin-right: 10px;
            `;

            changelogButton.addEventListener("click", () => {
                this.showChangelog()
            });
            manualupdateButton.addEventListener("click", (event) => {
                this.CheckifUpdate(true).then(upToDate => {
                    if (upToDate) {
                        // Toast
                        const toast = document.createElement("div");
                        toast.textContent = "Plugin is Up-to-date";
                        toast.style.cssText = `
                        position: absolute;
                        left: ${event.clientX - 80}px;
                        top: ${event.clientY - 40}px;
                        background: rgba(0, 0, 0, 1);
                        color: white;
                        padding: 8px 12px;
                        border-radius: 5px;
                        border: 1px solid var(--background-brand);
                        font-size: 15px;
                        z-index: 9999;
                        pointer-events: none;
                        transition: opacity 0.4s ease-out, transform 0.3s ease-out;
                    `;
                        document.body.appendChild(toast);

                        setTimeout(() => {
                            toast.style.opacity = "0";
                            toast.style.transform = "translateY(-8px)";
                            setTimeout(() => toast.remove(), 300);
                        }, 1300);
                    }
                });
            })

            if (modalFooter && !modalFooter.contains(changelogButton))
                modalFooter.appendChild(changelogButton);
            if (modalFooter && !modalFooter.contains(manualupdateButton))
                modalFooter.appendChild(manualupdateButton);
    
            observer.disconnect();

            const doneButton = document.querySelector('.bd-button[type="submit"]');
            doneButton.addEventListener("click", (event) => {
                // Update config values
                config.EnableUpdates = enableUpdatesInput.checked ? 1 : 0;
                config.SilentUpdates = silentUpdatesInput.checked ? 1 : 0;
                config.decoration   = enableDecorationsInput.checked ? 1 : 0;
                config.focushover   = focushoverInput.checked ? 1 : 0;
                config.imagesize    = parseInt(imageSizeInput.value);
                config.panelsize    = parseInt(panelSizeInput.value);
    
                // Update panel sizes instantly
                const ip = document.querySelector("img.IPH");
                const dp = document.querySelector("img.DPH");
    
                if (ip) {
                    ip.style.height = `${config.panelsize + 5}px`;
                    ip.style.width  = `${config.panelsize + 5}px`;
                }
                if (dp) {
                    dp.style.height = `${config.panelsize + 65}px`;
                    dp.style.width  = `${config.panelsize + 65}px`;
                }
    
                this.saveConfigToFile();
    
                // Toast
                const toast = document.createElement("div");
                toast.textContent = "Settings saved!";
                toast.style.cssText = `
                    position: absolute;
                    left: ${event.clientX - 60}px;
                    top: ${event.clientY - 40}px;
                    background: rgba(0, 0, 0, 1);
                    color: white;
                    padding: 8px 12px;
                    border-radius: 5px;
                    border: 1px solid var(--background-brand);
                    font-size: 14px;
                    z-index: 9999;
                    pointer-events: none;
                    transition: opacity 0.4s ease-out, transform 0.3s ease-out;
                `;
                document.body.appendChild(toast);
    
                setTimeout(() => {
                    toast.style.opacity = "0";
                    toast.style.transform = "translateY(-8px)";
                    setTimeout(() => toast.remove(), 300);
                }, 1300);
            });
        });
    
        observer.observe(document.body, { childList: true, subtree: true });
    }
    
    saveConfigToFile() {
        try {
            const configToSave = { ...config };
            // Exclude config.info from the saved configuration
            delete configToSave.info;
            fs.writeFileSync(configFile, JSON.stringify(configToSave, null, 4));
            console.log("Config saved to file successfully.");
        } catch (error) {
            console.error("Error saving config to file:", error);
        }
    }

    //---- Track Mouse Event Handler
    mmhfunc = (e) => {
        this.lastMouseEvent = e;
        if (!this.rafPending) {
            this.rafPending = true;
            requestAnimationFrame(() => {
                this.rafPending = false;
                this.fmm(this.lastMouseEvent);
            });
        }
    };

    stop() {
        window.removeEventListener("focus", this.onFocus);
        window.removeEventListener("blur", this.onBlur);
        document.removeEventListener('mousemove', this.mmhfunc);
        if (document.querySelector(".IPH")) { document.querySelector(".IPH").remove(); }
        if (document.querySelector(".DPH")) { document.querySelector(".DPH").remove(); }   
        if (document.getElementById("FSAUpdateNotif")) { document.getElementById("FSAUpdateNotif").remove(); }
    }

    //---- Track Mouse Event and Check If Hovering Over Avatars
    fmm(e) {
        if (config.focushover === 1)
            if (!isFocused) 
                return;

        const container = this.container;
        const ipmc = this.ip;
        const dpm = this.dp;

        const hovered = document.elementFromPoint(e.clientX, e.clientY);
        if (!hovered) {
            ipmc.style.display = "none";
            dpm.style.display = "none";
            return;
        }

        const directImg = hovered.closest('img[class*="avatar"]');
        const avatarContainer = hovered.closest('[class*="avatar"]');

        let avatarImg = null;
        let isChatAvatar = false;

        if (directImg) {
            avatarImg = directImg;
            isChatAvatar = true;
        } else if (avatarContainer) {
            avatarImg = avatarContainer.querySelector('img');
        }

        if (!avatarImg) {
            ipmc.style.display = "none";
            dpm.style.display = "none";
            this.lastAvatar = null;
            return;
        }

        if (this.lastAvatar !== avatarContainer) {
            this.lastAvatar = avatarContainer;
            const ais = avatarImg.src.replace(/\?size=\d+/g, '?size=' + config.imagesize);
            if (ipmc.src !== ais) ipmc.src = ais;

            // Decorations
            if (config.decoration === 1 && isFocused) {
                const decorationImg =
                    avatarContainer?.querySelector('[class*="avatarDecoration"] img') ||
                    avatarContainer?.parentElement?.querySelector('[class*="avatarDecoration"] img');

                dpm.src = decorationImg ? decorationImg.src : "";
            } else {
                dpm.src = "";
            }

            // Status
            if (isChatAvatar) {
                ipmc.style.background = "transparent";
                ipmc.style.filter = "opacity(1)";
                dpm.style.filter = "opacity(1)";
                return;
            }
            let status = null;
            if (!isChatAvatar && avatarContainer) {
                const prioritySelectors = [
                    ":scope > div > svg > rect",
                    ":scope > div > svg > svg > rect",
                    ":scope > div > svg > g > svg > rect",
                    ":scope > div > svg > g > rect"
                ];
                for (const selector of prioritySelectors) {
                    const rect = avatarContainer.querySelector(selector);
                    if (!rect) continue;

                    const fill = rect.getAttribute("fill");
                    if (!fill) continue;

                    status = fill;
                    break;
                }
            }

            if (!status || status === "#84858d") {
                ipmc.style.background = "transparent";
                ipmc.style.filter = "opacity(0.6)";
                dpm.style.filter = "opacity(0.6)";
            }
            else if (status === "transparent") {
                ipmc.style.background = "transparent";
                ipmc.style.filter = "opacity(1)";
                dpm.style.filter = "opacity(1)";
            }
            else {
                ipmc.style.background = status;
                ipmc.style.filter = "opacity(1)";
                dpm.style.filter = "opacity(1)";
            }
        }

        const wasHidden = ipmc.style.display === "none";

        if (wasHidden) {
            ipmc.style.transition = "none";
            dpm.style.transition = "none";
        }

        ipmc.style.display = "block";
        dpm.style.display = "block";

        // Positioning
        const dih = (e.pageY / container.offsetHeight) * 100;
        const diw = (e.pageX / container.offsetWidth) * 100;

        let top, left;

        if (dih >= 75 && dih < 88) {
            top = e.pageY - (config.panelsize / 2) - 10;
        }
        else if (dih >= 88) {
            top = e.pageY - config.panelsize - 10;
        }
        else {
            top = e.pageY - 10;
        }

        if (diw >= 50) {
            left = e.pageX - config.panelsize - 30;
        }
        else {
            left = e.pageX + 30;
        }

        ipmc.style.top = top + 'px';
        ipmc.style.left = left + 'px';

        dpm.style.top = (top - 30) + 'px';
        dpm.style.left = (left - 15) + 'px';

        if (wasHidden) {
            // Force layout so position applies instantly
            void ipmc.offsetHeight;

            ipmc.style.transition = "top 0.1s ease, left 0.1s ease";
            dpm.style.transition = "top 0.1s ease, left 0.1s ease";
        }
    }

    showChangelog() {
        const React = BdApi.React;

        const versions = Object.keys(changelog);
        const latestVersion = defaultConfig.info.version;

        const latestChanges = changelog[latestVersion] ?? [];
        const previousVersions = versions.filter(v => v !== latestVersion);

        const changeItemStyle = {
            whiteSpace: "normal",
            wordBreak: "break-word",
            overflowWrap: "anywhere",
            lineHeight: "1.4",
            marginBottom: "5px",
            borderBottom: "1px solid var(--border-normal)"
        };

        const content = React.createElement(
            "div",
            { style: { display: "flex", flexDirection: "column", gap: "14px" } },

            React.createElement(
                "a",
                {
                    href: defaultConfig.info.source,
                    target: "_blank",
                    rel: "noreferrer",
                    style: { 
                        fontWeight: "bold", 
                        background: "var(--background-secondary)",
                        border: "1px solid var(--border-normal)", 
                        padding: "10px", 
                        borderRadius: "6px"
                    }
                },
                "View Source on GitHub"
            ),

            // Latest version (always open)
            React.createElement(
                "div",
                {
                    style: {
                        background: "var(--background-secondary)",
                        border: "1px solid var(--border-normal)", 
                        padding: "12px",
                        borderRadius: "6px"
                    }
                },
                React.createElement(
                    "div",
                    { style: { fontWeight: "bold", marginBottom: "6px", fontSize: "20px" } },
                    `Latest Version: ${latestVersion}`
                ),
                React.createElement(
                    "ul",
                    { style: { marginLeft: "18px" } },
                    latestChanges.map((entry, i) =>
                        React.createElement("li", { key: i, style: changeItemStyle }, entry)
                    )
                )
            ),

            // Previous versions (collapsed)
            previousVersions.length > 0 &&
            React.createElement(
                "details",
                {
                    style: {
                        background: "var(--background-secondary)",
                        border: "1px solid var(--border-normal)", 
                        padding: "12px",
                        borderRadius: "6px",
                        marginBottom: "10px"
                    }
                },
                React.createElement(
                    "summary",
                    {
                        style: {
                            cursor: "pointer",
                            fontWeight: "bold"
                        }
                    },
                    "Previous Versions"
                ),
                previousVersions.map(version =>
                    React.createElement(
                        "div",
                        { key: version, style: { marginTop: "10px" } },
                        React.createElement(
                            "div",
                            {
                                style: {
                                    fontStyle: "italic",
                                    fontSize: "20px",
                                    marginBottom: "4px"
                                }
                            },
                            version
                        ),
                        React.createElement(
                            "ul",
                            { style: { marginLeft: "18px" } },
                            changelog[version].map((entry, i) =>
                                React.createElement("li", { key: i, style: changeItemStyle }, entry)
                            )
                        )
                    )
                )
            )
        );

        BdApi.UI.showConfirmationModal(
            BdApi.React.createElement(
                BdApi.React.Fragment,
                null,
                `${defaultConfig.info.name} - v${latestVersion}`,
                BdApi.React.createElement("br"),
                "What Changed?",
            ),
            content,
            {
                confirmText: "Don't show me this again until I update!",
                cancelText: null,
                onConfirm: () => {BdApi.Data.save(config.info.name, "shownVersion", config.info.version)}
            }
        );
    }
    
    CheckifUpdate(manualCheck = false) {
        if (!manualCheck && !config.EnableUpdates) {
                console.log('FullSizeAvatars: Updates are disabled.');
                return;
            }
    
        console.log('FullSizeAvatars: Updates are Enabled');
    
        return BdApi.Net.fetch(defaultConfig.info.updateUrl)
            .then(response => {
                if (!response.ok) throw new Error(`HTTP error! Status: ${response.status}`);
                return response.text();
            })
            .then(updatedPluginContent => {
                // Extract the version from the plugin content
                const match = updatedPluginContent.match(/version = \s*["'](\d+\.\d+\.\d+)["']/);
                const updatedVersion = match ? match[1] : null;
    
                if (updatedVersion && isVersionNewer(defaultConfig.info.version, updatedVersion)) {
                    if (config.SilentUpdates) {
                        console.log('FullSizeAvatars: Silent Updates are enabled.');
                        require('fs').writeFile(require('path').join(BdApi.Plugins.folder, "FullSizeAvatars.plugin.js"), updatedPluginContent, (err) => {
                            if (err) {
                                console.error('FullSizeAvatars: Error writing updated file:', err);
                            } else {
                                console.log('FullSizeAvatars: Updated successfully.');
                            }
                        });
                    } else {
                        console.log('FullSizeAvatars: Silent Updates are disabled.');
                        if (document.getElementById("FSAUpdateNotif")) {
                            document.getElementById("FSAUpdateNotif").remove();
                        }
                        const UpdateNotif = document.createElement("div");
                        const UpdateText = document.createElement("a");
                        const SeperatorText = document.createElement("span");
                        const CloseUpdate = document.createElement("a");
                        const title = document.querySelector('body');
    
                        title.before(UpdateNotif);
                        UpdateNotif.append(UpdateText);
                        UpdateNotif.append(SeperatorText);
                        UpdateNotif.append(CloseUpdate);
    
                        UpdateNotif.setAttribute("id", "FSAUpdateNotif");
                        
                        UpdateNotif.setAttribute("style", `position: fixed; top: 20px; left: 50%;
                                                           transform: translateX(-50%); background: var(--brand-500);
                                                           color: var(--white); padding: 10px 20px; border-radius: 8px;
                                                           box-shadow: var(--elevation-low); z-index: 99999;
                                                           display: flex; align-items: center; gap: 15px;
                                                `);
                        
                        UpdateText.setAttribute("style", `cursor: pointer; color: var(--white) !important;
                                                          font-family: inherit; font-size: 100%;
                                                          font-style: inherit; font-weight: inherit;
                                                          text-shadow: 1px 1px 2px black !important;
                                                `);
                        
                        SeperatorText.setAttribute("style", "color: var(--white) !important;");

                        CloseUpdate.setAttribute("style", `cursor: pointer; font-family: inherit; 
                                                           font-size: 100%; font-style: inherit;
                                                           font-weight: bold; color: var(--white) !important;
                                                           text-shadow: 1px 1px 2px black !important;
                                                `);
    
                        UpdateText.textContent = `Click to update - ${defaultConfig.info.name} ${updatedVersion} by ${defaultConfig.info.author}`;
                        SeperatorText.textContent = " | ";
                        CloseUpdate.textContent = `Don't Update - ${defaultConfig.info.version}`;

    
                        UpdateText.addEventListener("click", () => {
                            require('fs').writeFile(require('path').join(BdApi.Plugins.folder, "FullSizeAvatars.plugin.js"), updatedPluginContent, (err) => {
                                if (err) {
                                    console.error('FullSizeAvatars: Error writing updated file:', err);
                                } else {
                                    console.log('FullSizeAvatars: Updated successfully.');
                                }
                            });
                            UpdateNotif.remove();
                        });
    
                        CloseUpdate.addEventListener("click", () => {
                            UpdateNotif.remove();
                        });
    
                        return;
                    }
                    return false;
                } else {
                    console.log("FullSizeAvatars: Plugin is Up-to-date");
                    return true
                }
            })
            .catch(error => {
                console.error('FullSizeAvatars: Error downloading update:', error);
                return false;
            });
    }
}
