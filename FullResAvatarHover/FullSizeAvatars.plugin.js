/**
 * @name FullResAvatars
 * @author GentlePuppet
 * @authorId 199263542833053696
 * @version 5.1.1
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
        version: "5.1.1",
        author: "Gentle Puppet",
        updateUrl: "https://raw.githubusercontent.com/GentlePuppet/BetterDiscordPlugins/main/FullResAvatarHover/FullSizeAvatars.plugin.js",
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
        ip.setAttribute("style", "height:" + Number(config.panelsize + 5) + "px;width:" + Number(config.panelsize + 5) + "px;padding:5px;display:none;z-index:999999;position:absolute;transition: top 0.1s ease;");

        dp.setAttribute("id", "IPH");
        dp.setAttribute("class", "DPH");
        dp.setAttribute("style", "height:" + Number(config.panelsize + 5) + "px;width:" + Number(config.panelsize + 5) + "px;padding:5px;display:none;z-index:9999999;position:absolute;transition: top 0.1s ease;");

        document.body.after(dp);
        dp.after(ip);

        //---- Create Track Mouse Event
        document.addEventListener("mousemove", this.mmhfunc)

        this.CheckifUpdate();
    }

    getSettingsPanel() {
        const configFileData = fs.readFileSync(configFile, "utf-8");
        const savedConfig = JSON.parse(configFileData);
        config = { ...defaultConfig, ...savedConfig };

        // Create the settings panel container
        this.settingsPanel = document.createElement("div");
        this.settingsPanel.setAttribute("id", "settings-panel");
        this.settingsPanel.setAttribute("style", "display:grid; padding: 20px; z-index: 1000;");

        // Grid container for the settings
        const gridContainer = document.createElement("div");
        gridContainer.setAttribute("style", "color: var(--header-primary); display: grid; grid-template-columns: 1fr 1fr; gap: 10px;");

        // Create input fields and labels
        const enableUpdatesLabel = document.createElement("label");
        enableUpdatesLabel.textContent = "Enable Updates";
        const enableUpdatesInput = document.createElement("input");
        enableUpdatesInput.setAttribute("type", "checkbox");
        enableUpdatesInput.checked = config.EnableUpdates === 1;

        const silentUpdatesLabel = document.createElement("label");
        silentUpdatesLabel.textContent = "Silent Updates";
        const silentUpdatesInput = document.createElement("input");
        silentUpdatesInput.setAttribute("type", "checkbox");
        silentUpdatesInput.checked = config.SilentUpdates === 1;

        const enableDecorationsLabel = document.createElement("label");
        enableDecorationsLabel.textContent = "Display Avatar Decorations";
        const enableDecorationsInput = document.createElement("input");
        enableDecorationsInput.setAttribute("type", "checkbox");
        enableDecorationsInput.checked = config.decoration === 1;

        const imageSizeLabel = document.createElement("label");
        imageSizeLabel.textContent = "Avatar Resolution";
        const imageSizeInput = document.createElement("input");
        imageSizeInput.setAttribute("type", "number");
        imageSizeInput.value = config.imagesize;

        const panelSizeLabel = document.createElement("label");
        panelSizeLabel.textContent = "Avatar Panel Size";
        const panelSizeInput = document.createElement("input");
        panelSizeInput.setAttribute("type", "number");
        panelSizeInput.value = config.panelsize;

        // Append elements to grid container
        gridContainer.appendChild(enableUpdatesLabel);
        gridContainer.appendChild(enableUpdatesInput);
        gridContainer.appendChild(silentUpdatesLabel);
        gridContainer.appendChild(silentUpdatesInput);
        gridContainer.appendChild(enableDecorationsLabel);
        gridContainer.appendChild(enableDecorationsInput);
        gridContainer.appendChild(imageSizeLabel);
        gridContainer.appendChild(imageSizeInput);
        gridContainer.appendChild(panelSizeLabel);
        gridContainer.appendChild(panelSizeInput);

        // Append grid container to settings panel
        this.settingsPanel.appendChild(gridContainer);

        // Wait for the .bd-modal-content to exist and insert our settings panel
        const observer = new MutationObserver((mutationsList) => {
            for (const mutation of mutationsList) {
                if (mutation.type === "childList" && mutation.addedNodes.length > 0) {
                    const modalContent = document.querySelector(".bd-modal-content");
                    if (modalContent) {
                        // Insert the settings panel inside the modal content
                        modalContent.appendChild(this.settingsPanel);

                        // Remove backdrop click event to prevent accidental closing
                        const backdrop = document.querySelector('[class*="backdrop"]');
                        if (backdrop) backdrop.removeEventListener("click");

                        // Manually create a save button in the footer
                        const modalFooter = document.querySelector('.bd-addon-modal > [class*="footer-"]') || document.createElement("div");
                        modalFooter.setAttribute("style", "display: flex; justify-content: flex-end; padding: 10px;");

                        const saveButton = document.createElement("button");
                        saveButton.textContent = "Save";
                        saveButton.setAttribute("style", "padding: 5px 15px; background: #3e82e5; color: white; border: none; cursor: pointer; border-radius: 4px;");

                        saveButton.addEventListener("click", (event) => {
                            // Update config settings with input values
                            config.EnableUpdates = enableUpdatesInput.checked ? 1 : 0;
                            config.SilentUpdates = silentUpdatesInput.checked ? 1 : 0;
                            config.decoration = enableDecorationsInput.checked ? 1 : 0;
                            config.imagesize = parseInt(imageSizeInput.value);
                            config.panelsize = parseInt(panelSizeInput.value);
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

                            // Save the updated config to the JSON file
                            this.saveConfigToFile();

                            // Get mouse position
                            const mouseX = event.clientX;
                            const mouseY = event.clientY;

                            // Create a small popup notification
                            const toast = document.createElement("div");
                            toast.textContent = "Settings saved!";
                            toast.setAttribute("style", `
                                position: absolute;
                                left: ${mouseX + 10}px;
                                top: ${mouseY - 30}px;
                                background: rgba(0, 0, 0, 0.8);
                                color: white;
                                padding: 8px 12px;
                                border-radius: 5px;
                                font-size: 14px;
                                z-index: 9999;
                                opacity: 1;
                                pointer-events: none;
                                transition: opacity 0.5s ease-out, transform 0.3s ease-out;
                            `);

                            document.body.appendChild(toast);

                            // Animate the toast moving slightly upward and fading out
                            setTimeout(() => {
                                toast.style.transform = "translateY(-10px)";
                                toast.style.opacity = "0";
                                setTimeout(() => toast.remove(), 500);
                            }, 1500);
                        });


                        // Append save button if not already present
                        if (!modalFooter.contains(saveButton)) {
                            modalFooter.appendChild(saveButton);
                            modalContent.appendChild(modalFooter);
                        }

                        observer.disconnect();
                        break;
                    }
                }
            }
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
        let dpm = document.querySelector(".DPH")
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
            ipmc.src = ais;
            if (config.decoration == 0) {dpm.src = ""}
            else if (config.decoration == 1 && avatarDecoration) { dpm.src = avatarDecoration.src } 
            else { dpm.src = "" }

            if (dih >= 75 && dih < 88) { ipm.forEach(panel => {panel.style.top = e.pageY - (config.panelsize / 2) - 10 + 'px'}) }
            else if (dih >= 88) { ipm.forEach(panel => {panel.style.top = e.pageY - config.panelsize - 10 + 'px'}) }
            else { ipm.forEach(panel => {panel.style.top = e.pageY - 10 + 'px'}) }

            if (diw >= 50) { ipm.forEach(panel => {panel.style.left = e.pageX - config.panelsize - 30 + 'px'}) }
            else { ipm.forEach(panel => {panel.style.left = e.pageX + 30 + 'px'}) }
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
