/**
 * @name FullResAvatars
 * @author GentlePuppet
 * @authorId 199263542833053696
 * @version 5.1.3
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
const version = "5.1.3"
const changelog = {
    "5.1.3": [
        "Added a changelog! (It's not perfect, but it works.)",
        "Removed the Save button and made the Done button Save when it closes the settings panel."
    ],
    "5.1.2": [
        "Slightly adjusted the Avatar Decoration display on the popout."
    ],
    "5.1.1": [
        "Added the option to display Nitro avatar decorations on the popup avatars."
    ],
    "5.1.0": [
        "Added support for Avatars in the Chat (Compact and Default)."
    ],
    "5.0.5": [
        "Restylized the Update Notification."
    ],
    "5.0.4": [
        "Moved the plugin source file to https://github.com/GentlePuppet/BetterDiscordPlugins/tree/main/FullResAvatarHover"
    ],
    "5.0.2": [
        "Officially uploaded to github."
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
        //---- Create Popout Image Panel
        if (document.querySelector(".IPH")) { document.querySelector(".IPH").remove(); }
        if (document.querySelector(".DPH")) { document.querySelector(".DPH").remove(); }   
        // Image Panel
        const ip = document.createElement("img");  
        // Decore Panel
        const dp = document.createElement("img");

        ip.setAttribute("id", "IPH");
        ip.setAttribute("class", "IPH");
        ip.setAttribute("style", "display:none;height:" + Number(config.panelsize + 5) + "px;width:" + Number(config.panelsize + 5) + "px;padding:5px;z-index:999999;position:absolute;pointer-events:none;transition: top 0.1s ease;");

        dp.setAttribute("id", "IPH");
        dp.setAttribute("class", "DPH");
        dp.setAttribute("style", "display:none;height:" + Number(config.panelsize + 65) + "px;width:" + Number(config.panelsize + 65) + "px;margin: 0px 0px -15px -15px;padding:5px;z-index:9999999;position:absolute;pointer-events:none;transition: top 0.1s ease;");

        document.body.after(dp);
        dp.after(ip);

        //---- Create Track Mouse Event
        document.addEventListener("mousemove", this.mmhfunc)

        this.CheckifUpdate();

        if ((BdApi.Data.load(defaultConfig.info.name, "shownVersion") != defaultConfig.info.version)) this.showChangelog();
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
    
        const imageSizeInput = makeNumber(config.imagesize);
        const panelSizeInput = makeNumber(config.panelsize);
    
        addSetting("Enable Updates", enableUpdatesInput);
        addSetting("Silent Updates", silentUpdatesInput);
        addSetting("Display Avatar Decorations", enableDecorationsInput);
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
            changelogButton.classList.add("bd-button-color-brand")
            changelogButton.classList.add("bd-button-medium")
            changelogButton.classList.add("bd-button-grow")
            changelogButton.style.cssText = `
                margin-right: 10px;
            `;

            changelogButton.addEventListener("click", () => {
                this.showChangelog()
            });

            if (modalFooter && !modalFooter.contains(changelogButton))
                modalFooter.appendChild(changelogButton);
    
            observer.disconnect();

            const doneButton = document.querySelector('.bd-button[type="submit"]');
            doneButton.addEventListener("click", (event) => {
                // Update config values
                config.EnableUpdates = enableUpdatesInput.checked ? 1 : 0;
                config.SilentUpdates = silentUpdatesInput.checked ? 1 : 0;
                config.decoration   = enableDecorationsInput.checked ? 1 : 0;
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
                    dp.style.height = `${config.panelsize + 5}px`;
                    dp.style.width  = `${config.panelsize + 5}px`;
                }
    
                this.saveConfigToFile();
    
                // Toast
                const toast = document.createElement("div");
                toast.textContent = "Settings saved!";
                toast.style.cssText = `
                    position: absolute;
                    left: ${event.clientX - 10}px;
                    top: ${event.clientY - 30}px;
                    background: rgba(0, 0, 0, 1);
                    color: white;
                    padding: 8px 12px;
                    border-radius: 5px;
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
    mmhfunc = (e) => this.fmm(e);

    stop() {
        document.removeEventListener('mousemove', this.mmhfunc);
        if (document.querySelector(".IPH")) { document.querySelector(".IPH").remove(); }
        if (document.querySelector(".DPH")) { document.querySelector(".DPH").remove(); }   
        if (document.getElementById("FSAUpdateNotif")) { document.getElementById("FSAUpdateNotif").remove(); }
    }

    //---- Track Mouse Event and Check If Hovering Over Avatars
    fmm(e) {
        let container = document.querySelector("#app-mount")
        // Server Mmembers List
        let mah = container.querySelector('[class^="memberInner"] > [class^="avatar"]:hover')
        // Avatar decoration overlay
        let avatarDecoration = container.querySelector('[class^="avatar"]:hover > div > [class^="avatarDecoration"] > foreignObject > div > img')
        // Friends List
        let fah = container.querySelector('[class^="link"] > [class^="layout"] > [class^="avatar"]:hover')
        // Friends DM List
        let fadmh = container.querySelector('[class^="listItemContents"] > [class^="userInfo"] > [class*="avatar"]:hover')
        // Avatar next to Compact Messages
        let ccah = container.querySelector('h3[aria-labelledby*="message-username"] > img[class*="avatar"]:hover')
        // Avatar next to Default Messages
        let dcah = container.querySelector('[class*="message"] > [class*="contents"] > img[class*="avatar"]:hover')
        // Larger Avatar Popup
        let ipm = document.querySelectorAll("#IPH")
        let ipmc = document.querySelector("img#IPH.IPH")
        let dpm = document.querySelector("img#IPH.DPH")
        let dih = (e.pageY / (container.offsetHeight) * 100);
        let diw = (e.pageX / (container.offsetWidth) * 100);
        
        // Try all selectors in priority order and pick the first match
        const selectors = [
            "div:hover > div > svg > rect",
            "div:hover > div > svg > svg > rect",
            "div:hover > div > svg > g > svg > rect"
        ];

        let statusElm = null;

        for (const selector of selectors) {
            const element = container.querySelector(selector);
            if (element) {
                statusElm = element;
                break;
            }
        }
        if (statusElm) {
            var status = statusElm.getAttribute('fill');
        } else {
            statusElm = null
        }

        if (!mah && !fah && !fadmh && !ccah && !dcah) {
            ipm.forEach(panel => {
                panel.style.display = "none";
            });
        } else {
            if (ccah || dcah) {
                var ais = container.querySelector('img[class*="avatar"]:hover').src.replace(/\?size=\d+/g, '?size=' + config.imagesize);
            } else {
                var ais = container.querySelector("div:hover > div > svg > foreignObject > div > img").src.replace(/\?size=\d+/g, '?size=' + config.imagesize);
            }

            ipm.forEach(panel => {panel.style.display = "block";});
            if (ipmc.src != ais) ipmc.src = ais;
            if (config.decoration == 0) {dpm.src = ""}
            else if (config.decoration == 1 && avatarDecoration) { if (dpm.src !== avatarDecoration.src) dpm.src = avatarDecoration.src } 
            else { dpm.src = "" }

            if (dih >= 75 && dih < 88) { 
                ipmc.style.top = e.pageY - (config.panelsize / 2) - 10 + 'px'
                dpm.style.top = e.pageY - (config.panelsize / 2) - 10 - 30 + 'px'
            }
            else if (dih >= 88) { 
                ipmc.style.top = e.pageY - config.panelsize - 10 + 'px'
                dpm.style.top = e.pageY - config.panelsize - 10 - 30 + 'px'
            }
            else { 
                ipmc.style.top = e.pageY - 10 + 'px'
                dpm.style.top = e.pageY - 10 - 30 + 'px'
            }

            if (diw >= 50) { 
                ipmc.style.left = e.pageX - config.panelsize - 30 + 'px'
                dpm.style.left = e.pageX - config.panelsize - 30 - 15 + 'px'
            }
            else { 
                ipmc.style.left = e.pageX + 30 + 'px'
                dpm.style.left = e.pageX + 30 - 15 + 'px'
            }
            if (ccah || dcah) {
				ipmc.style.background = "transparent";
				ipm.forEach(panel => {
					panel.style.filter = "opacity(1)";
				})
            } else if (!statusElm) {
				ipmc.style.background = "transparent";
				ipm.forEach(panel => {
					panel.style.filter = "opacity(0.4)";
				})
            } else if (status == "transparent") {
                var statusfix = container.querySelector("div:hover > div > svg > svg > rect").getAttribute('fill');
				ipmc.style.background = statusfix;
				ipm.forEach(panel => {
					panel.style.filter = "opacity(1)";
				})
            } else {
				ipmc.style.background = status;
				ipm.forEach(panel => {
					panel.style.filter = "opacity(1)";
				})
            }
        }
    }

    showChangelog() {

        const modalContent = [];

        modalContent.push(`[View Source on GitHub](${defaultConfig.info.source})`);
        modalContent.push("━━━━━━━━━━━━━━━━━━━━");
        modalContent.push("");

        const versions = Object.keys(changelog);
        versions.forEach((version, i) => {
            if (i !== 0) {
                modalContent.push("");
                modalContent.push("━━━━━━━━━━━━━━━━━━━━");
                modalContent.push("");
            }
        
            const isLatest = version === defaultConfig.info.version
            const versionLabel = isLatest ? `**Latest Version: ${version}**` : `*${version}*`;
            modalContent.push(versionLabel);
            
            changelog[version].forEach(change => {
                modalContent.push(isLatest ? `- ${change}` : `*– ${change}*`); // dim each line too
            });
        });

        BdApi.UI.showConfirmationModal(
            `What Changed in ${defaultConfig.info.name} v${defaultConfig.info.version}`,
            modalContent,
            {
                confirmText: "Got it!",
                cancelText: null
            }
        );

        BdApi.Data.save(config.info.name, "shownVersion", config.info.version);
    }

    CheckifUpdate() {
        if (!config.EnableUpdates) {
            console.log('FullSizeAvatars: Updates are disabled.');
            return;
        }
    
        console.log('FullSizeAvatars: Updates are Enabled');
    
        BdApi.Net.fetch(defaultConfig.info.updateUrl)
            .then(response => {
                if (!response.ok) throw new Error(`HTTP error! Status: ${response.status}`);
                return response.text();
            })
            .then(updatedPluginContent => {
                // Extract the version from the plugin content
                const match = updatedPluginContent.match(/version:\s*["'](\d+\.\d+\.\d+)["']/);
                const updatedVersion = match ? match[1] : null;
    
                if (defaultConfig.info.version !== updatedVersion) {
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
                } else {
                    console.log("FullSizeAvatars: Plugin is Up-to-date");
                }
            })
            .catch(error => {
                console.error('FullSizeAvatars: Error downloading update:', error);
            });
    }
}
