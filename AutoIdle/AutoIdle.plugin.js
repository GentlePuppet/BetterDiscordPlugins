/**
 * @name AutoIdle
 * @author Gentle Puppet
 * @authorId 199263542833053696
 * @description Sets status to online when actively using discord and back to idle after clicking off. If you are in a voice call it will not change to idle. It will also not change your status if you have Invisible or DND enabled.
 * @version 0.8.2
 * @website https://github.com/GentlePuppet/BetterDiscordPlugins
 * @source https://raw.githubusercontent.com/GentlePuppet/BetterDiscordPlugins/main/AutoIdle/AutoIdle.plugin.js
**/


const version = "0.8.2"
const changelog = {
    "0.8.2": [
        "Added a changelog!"
    ],
    "0.8.1": [
        "Made the Update Notification Prettier~"
    ],
    "0.8.0": [
        "Re-Added an Update Checker. (I fixed it.)"
    ],
    "0.7.0": [
        "Rolled back the Update Checker (It didn't work, woops)."
    ],
    "0.6.0": [
        "Added an Update Checker."
    ],
    "0.5.0": [
        "Plugin Released on my Github!",
        "Added lots of additional options to the settings for more fine tuned control.",
        "Pre-release use to only switch between Online and Idle with a 5 second delay."
    ]
};

const { Webpack, UI, Data, Logger } = BdApi;
const UserSettingsProtoStore = Webpack.getStore("UserSettingsProtoStore");
const UserSettingsProtoUtils = Webpack.getModule(m => m.ProtoClass && m.ProtoClass.typeName.endsWith(".PreloadedUserSettings"), { first: true, searchExports: true });

const config = {
    main: "AutoIdle.plugin.js",
    info: {
        name: "AutoIdle",
        author: "Gentle Puppet",
        version: version,
        description: "Automatically change you status between Idle and Online when switching from and to Discord.",
        source: "https://raw.githubusercontent.com/GentlePuppet/BetterDiscordPlugins/main/AutoIdle/AutoIdle.plugin.js"
    },
    settingsPanel: [
        {
            type: "dropdown",
            id: "ActiveStatusChoice",
            name: "Active Status",
            note: "Select the status to switch to when Discord is focused.",
            value: "online",
            options: [
                { label: "Idle", value: "idle" },
                { label: "Online", value: "online" },
                { label: "Do Not Disturb (Enable Ignore DND)", value: "dnd" },
                { label: "Invisible(Enable Ignore Invisible)", value: "invisible" }
            ]
        },
        {
            type: "dropdown",
            id: "AwayStatusChoice",
            name: "Away Status",
            note: "Select the status to switch to when Discord is unfocused.",
            value: "idle",
            options: [
                { label: "Idle", value: "idle" },
                { label: "Online", value: "online" },
                { label: "Do Not Disturb (Enable Ignore DND)", value: "dnd" },
                { label: "Invisible (Enable Ignore Invisible)", value: "invisible" }
            ]
        },
        {
            type: "slider",
            name: "Online Status Switch Delay:",
            note: "How long the delay should be before switching your status to Online.",
            id: "statusDelay",
            min: 1,
            max: 120,
            units: "s",
            value: 5,
            markers: [
                5,
                15,
                30,
                45,
                60,
                75,
                90,
                105,
                120
            ]
        },
        {
            type: "slider",
            name: "Idle Status Switch Delay:",
            note: "How long the delay should be before switching your status to Idle.",
            id: "statusDelay2",
            min: 1,
            max: 120,
            units: "s",
            value: 5,
            markers: [
                5,
                15,
                30,
                45,
                60,
                75,
                90,
                105,
                120
            ]
        },
        {
            type: "switch",
            id: "EnableUpdateCheck",
            name: "Enable Update Check",
            note: "Allow the plugin to check for updates directly from github when started.",
            value: true
        },
        {
            type: "switch",
            id: "EnableSilentUpdates",
            name: "Enable Silent Updates",
            note: "Allow the plugin to automatically update without asking (Disabled by Default).",
            value: false
        },
        {
            type: "switch",
            id: "IgnoreVoice",
            name: "Ignore Voice Calls",
            note: "Allow the plugin to change status while in a call. (By default you will remain in your Active status while in a call.)",
            value: false
        },
        {
            type: "switch",
            id: "IgnoreDND",
            name: "Ignore Do Not Disturb",
            note: "Change status while Do Not Disturb is enabled. (Enable if you set the active or away status to Do Not Disturb.)",
            value: false
        },
        {
            type: "switch",
            id: "IgnoreInvisible",
            name: "Ignore Invisible",
            note: "Change status while Invisible is enabled. (Enable if you set the active or away status to Invisible.)",
            value: false
        }
    ]
};

let defaultSettings = {
    ActiveStatusChoice: "online",
    AwayStatusChoice: "idle",
    statusDelay: 5,
    statusDelay2: 5,
    EnableUpdateCheck: true,
    EnableSilentUpdates: false,
    IgnoreVoice: false,
    IgnoreDND: false,
    IgnoreInvisible: false
}

module.exports = class SimpleStatusOnFocus {
    constructor() {
        this._config = config;
        this.timeout = null;
        this.settings = Data.load(this._config.info.name, "settings");
        if (Data.load(this._config.info.name, "settings") == null) this.saveAndUpdate();
        this.boundOnFocus = this.onFocus.bind(this);
        this.boundOnBlur = this.onBlur.bind(this);
    }

    start() {
        this.saveAndUpdate();

        window.addEventListener("focus", this.boundOnFocus);
        window.addEventListener("blur", this.boundOnBlur);

        this.CheckifUpdate();

        if ((BdApi.loadData(this._config.info.name, "shownVersion") != this._config.info.version)) this.showChangelog();
    }

    stop() {
        window.removeEventListener("focus", this.boundOnFocus);
        window.removeEventListener("blur", this.boundOnBlur);
        clearTimeout(this.timeout);

        if (document.getElementById("AutoIdleUpdateNotif")) { document.getElementById("AutoIdleUpdateNotif").remove(); }
    }

    getSettingsPanel() {
        for (const setting of this._config.settingsPanel) {
            if (this.settings[setting.id] !== undefined) {
                setting.value = this.settings[setting.id];
            }
        }
        this._config.settingsPanel.unshift({
            type: "button",
            id: "showChangelogButton",
            name: "View Changelog",
            children: "View Changelog",
            onClick: () => this.showChangelog()
        });
        return UI.buildSettingsPanel({
            settings: this._config.settingsPanel,
            onChange: (category, id, value) => {
                this.settings[id] = value;
                this.saveAndUpdate();
            },
        });
    }

    saveAndUpdate() {
        Data.save(this._config.info.name, "settings", this.settings);
        this.settings = Data.load(this._config.info.name, "settings") || defaultSettings;
        this.setStatus(this.settings.ActiveStatusChoice)
    }

    onFocus() {
        clearTimeout(this.timeout);
        this.timeout = setTimeout(() => this.setStatus(this.settings.ActiveStatusChoice, "active"), this.settings.statusDelay * 1000);
    }

    onBlur() {
        clearTimeout(this.timeout);
        this.timeout = setTimeout(() => this.setStatus(this.settings.AwayStatusChoice, "away"), this.settings.statusDelay2 * 1000);
    }

    setStatus(status) {
        const isConnected = BdApi.Webpack.getStore("SelectedChannelStore")?.getVoiceChannelId() != null;
        const currentStatus = UserSettingsProtoStore?.settings?.status?.status?.value;
    
        // Respect "IgnoreDND" setting
        if (!this.settings.IgnoreDND && currentStatus === "dnd") {
            Logger.info("AutoIdle: Status is DND. Skipping Status Change");
            return;
        }
    
        // Respect "IgnoreInvisible" setting
        if (!this.settings.IgnoreInvisible && currentStatus === "invisible") {
            Logger.info("AutoIdle: Status is Invisible. Skipping Status Change");
            return;
        }

        // Respect "IgnoreVoice" setting
        if (!this.settings.IgnoreVoice && isConnected && currentStatus === this.settings.ActiveStatusChoice) {
            Logger.info("AutoIdle: In Voice Call. Skipping Status Change");
            return;
        }
    
        UserSettingsProtoUtils.updateAsync("status", s => {
            s.status.value = status;
            Logger.info("AutoIdle: Setting Status to " + status);
        });
    }
    
    showChangelog() {

        const modalContent = [];

        modalContent.push(`[View Source on GitHub](${this._config.info.source})`);
        modalContent.push("━━━━━━━━━━━━━━━━━━━━");
        modalContent.push("");

        const versions = Object.keys(changelog);
        versions.forEach((version, i) => {
            if (i !== 0) {
                modalContent.push("");
                modalContent.push("━━━━━━━━━━━━━━━━━━━━");
                modalContent.push("");
            }
        
            const isLatest = version === this._config.info.version
            const versionLabel = isLatest ? `**Latest Version: ${version}**` : `*${version}*`;
            modalContent.push(versionLabel);
            
            changelog[version].forEach(change => {
                modalContent.push(isLatest ? `- ${change}` : `*– ${change}*`); // dim each line too
            });
        });

        BdApi.showConfirmationModal(
            `What Changed in ${this._config.info.name} v${this._config.info.version}`,
            modalContent,
            {
                confirmText: "Got it!",
                cancelText: null
            }
        );

        BdApi.saveData(this._config.info.name, "shownVersion", this._config.info.version);
    }

    CheckifUpdate() {
        if (!this.settings.EnableUpdateCheck) {
            Logger.info(this._config.info.name + ': Updates are disabled.');
            return;
        }
    
        Logger.info(this._config.info.name + ': Updates are Enabled');
    
        BdApi.Net.fetch(this._config.info.source)
            .then(response => {
                if (!response.ok) throw new Error(`HTTP error! Status: ${response.status}`);
                return response.text();
            })
            .then(updatedPluginContent => {
                // Extract version from the downloaded plugin content
                const match = updatedPluginContent.match(/version:\s*["'](\d+\.\d+\.\d+)["']/);
                const updatedVersion = match ? match[1] : null;
    
                function isVersionNewer(current, updated) {
                    const currentParts = current.split('.').map(Number);
                    const updatedParts = updated.split('.').map(Number);
    
                    for (let i = 0; i < 3; i++) {
                        if ((updatedParts[i] || 0) > (currentParts[i] || 0)) return true;
                        if ((updatedParts[i] || 0) < (currentParts[i] || 0)) return false;
                    }
                    return false; // versions are equal
                }
    
                if (isVersionNewer(this._config.info.version, updatedVersion)) {
                    if (this.settings.EnableSilentUpdates) {
                        Logger.info(this._config.info.name + ': Silent Updates are enabled.');
    
                        require("fs").writeFile(require("path").join(BdApi.Plugins.folder, this._config.main), updatedPluginContent, (err) => {
                            if (err) {
                                console.error(this._config.info.name + ': Error writing updated file:', err);
                            } else {
                                Logger.info(this._config.info.name + ': Updated successfully.');
                            }
                        });
                    } else {
                        Logger.info(this._config.info.name + ': Silent Updates are disabled.');
    
                        const UpdateDivStr = this._config.info.name + 'UpdateNotif';
    
                        if (document.getElementById(UpdateDivStr)) {
                            document.getElementById(UpdateDivStr).remove();
                        }
    
                        const UpdateNotif = document.createElement("div");
                        const UpdateText = document.createElement("a");
                        const SeperatorText = document.createElement("span");
                        const CloseUpdate = document.createElement("a");
                        const title = document.querySelector("body");
    
                        title.before(UpdateNotif);
                        UpdateNotif.append(UpdateText);
                        UpdateNotif.append(SeperatorText);
                        UpdateNotif.append(CloseUpdate);
    
                        UpdateNotif.setAttribute("id", UpdateDivStr);
                        
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
    
                        UpdateText.textContent = `Click to update - ${this._config.info.name} ${updatedVersion} by ${this._config.info.author}`;
                        SeperatorText.textContent = " | ";
                        CloseUpdate.textContent = `Don't Update - ${this._config.info.version}`;
    
                        UpdateText.addEventListener("click", () => {
                            require("fs").writeFile(require("path").join(BdApi.Plugins.folder, this._config.main), updatedPluginContent, (err) => {
                                if (err) {
                                    console.error(this._config.info.name + ': Error writing updated file:', err);
                                } else {
                                    Logger.info(this._config.info.name + ': Updated successfully.');
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
                    Logger.info(this._config.info.name + ': Plugin is Up-to-date');
                }
            })
            .catch(error => {
                console.error(this._config.info.name + ': Error downloading update:', error);
            });
    }
    
};
