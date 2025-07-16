/**
 * @name AutoIdle
 * @author GentlePuppet
 * @authorId 199263542833053696
 * @description Sets status to online when actively using discord and back to idle after clicking off. If you are in a voice call it will not change to idle. It will also not change your status if you have Invisible or DND enabled.
 * @version 0.7.0
 * @website https://github.com/GentlePuppet/BetterDiscordPlugins
 * @source https://raw.githubusercontent.com/GentlePuppet/BetterDiscordPlugins/main/AutoIdle/AutoIdle.plugin.js
**/

const { Webpack, UI, Data, Logger } = BdApi;
const UserSettingsProtoStore = Webpack.getStore("UserSettingsProtoStore");
const UserSettingsProtoUtils = Webpack.getModule(m => m.ProtoClass && m.ProtoClass.typeName.endsWith(".PreloadedUserSettings"), { first: true, searchExports: true });

const config = {
    main: "AutoIdle.plugin.js",
    info: {
        name: "AutoIdle",
        authors: [
            {
                name: "Gentle Puppet",
            }
        ],
        version: "0.7.0",
        description: "Automatically change you status between Idle and Online when switching from and to Discord.",
        source: "https://raw.githubusercontent.com/GentlePuppet/BetterDiscordPlugins/main/AutoIdle/AutoIdle.plugin.js"
    },
    settingsPanel: [
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
            note: "Allow the plugin to check for updates when started.",
            value: true
        },
        {
            type: "switch",
            id: "EnableSilentUpdates",
            name: "Enable Silent Updates",
            note: "Allow the plugin to automatically update without asking (Disabled by Default).",
            value: false
        }
    ]
};

let defaultSettings = {
    statusDelay: 5,
    statusDelay2: 5,
    EnableUpdateCheck: true,
    EnableSilentUpdates: false
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
        this.settings = Data.load(this._config.info.name, "settings") || defaultSettings;
        window.addEventListener("focus", this.boundOnFocus);
        window.addEventListener("blur", this.boundOnBlur);

        this.CheckifUpdate();
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
    }

    onFocus() {
        clearTimeout(this.timeout);
        this.timeout = setTimeout(() => this.setStatus("online"), this.settings.statusDelay * 1000);
    }

    onBlur() {
        clearTimeout(this.timeout);
        this.timeout = setTimeout(() => this.setStatus("idle"), this.settings.statusDelay2 * 1000);
    }

    setStatus(status) {
        const isConnected = BdApi.Webpack.getStore("SelectedChannelStore")?.getVoiceChannelId() != null;
        const currentStatus = UserSettingsProtoStore?.settings?.status?.status?.value;
        if (currentStatus == "dnd" || currentStatus == "invisible") {
            Logger.info("AutoIdle: " + status + " Enabled. Skipping Status Change");
            return;
        } else if (currentStatus == "online" && isConnected) {
            Logger.info("AutoIdle: In Voice Call. Skipping Status Change");
            return;
        }

        UserSettingsProtoUtils.updateAsync("status", s => {
            s.status.value = status;
            Logger.info("AutoIdle: Setting Status to " + status);
        });
    }

    CheckifUpdate() {
        if (!this.settings.EnableUpdateCheck) {
            console.log(this._config.info.name + ': Updates are disabled.');
            return;
        }
        if (this.settings.EnableUpdateCheck) {
            console.log(this._config.info.name + ': Updates are Enabled')
            require("request").get(this._config.info.source, function (error, response, body) {
                if (!error && response.statusCode === 200) {
                    const updatedPluginContent = body;

                    // Extract the version from the plugin content
                    const match = updatedPluginContent.match(/version:\s*["'](\d+\.\d+\.\d+)["']/);
                    const updatedVersion = match ? match[1] : null;

                    // Check if the versions match
                    if (this._config.info.version !== updatedVersion) {
                        if (this.settings.EnableSilentUpdates) {
                            console.log(this._config.info.name + ': Silent Updates are enabled.');
                            require("fs").writeFile(require("path").join(BdApi.Plugins.folder, this._config.main), updatedPluginContent, (err) => {
                                if (err) {
                                    console.error(this._config.info.name + ': Error writing updated file:', err);
                                } else {
                                    console.log(this._config.info.name + ': Updated successfully.');
                                }
                            })
                        }
                        else {
                            console.log(this._config.info.name + ': Silent Updates are disabled.');
                            const UpdateDivStr = this._config.info.name + 'UpdateNotif'
                            if (document.getElementById(UpdateDivStr)) { document.getElementById(UpdateDivStr).remove(); }
                            const UpdateNotif = document.createElement("div");
                            const UpdateText = document.createElement("a");
                            const CloseUpdate = document.createElement("a");
                            const title = document.querySelector("#app-mount")
                            title.before(UpdateNotif); UpdateNotif.append(UpdateText); UpdateNotif.append(CloseUpdate);
                            UpdateNotif.setAttribute("id", UpdateDivStr);
                            UpdateNotif.setAttribute("style", "text-align: center; background: var(--brand-experiment); padding: 5px;");
                            UpdateText.setAttribute("style", "color: white; text-decoration: underline;");
                            CloseUpdate.setAttribute("style", "color: white; padding-left: 1%");
                            UpdateText.textContent = "Click to update - " + this._config.info.name + " " + match + " by " + this._config.info.authors.name;
                            CloseUpdate.textContent = "X";
                            UpdateText.addEventListener("click", () => {
                                require("fs").writeFile(require("path").join(BdApi.Plugins.folder, this._config.main), updatedPluginContent, (err) => {
                                    if (err) {
                                        console.error(this._config.info.name + ': Error writing updated file:', err);
                                    } else {
                                        console.log(this._config.info.name + ': Updated successfully.');
                                    }
                                })
                                UpdateNotif.remove()
                            });
                            CloseUpdate.addEventListener("click", () => {
                                UpdateNotif.remove()
                            });
                            return;
                        }
                    } else { console.log(this._config.info.name + ': Plugin is Up-to-date') }
                } else { console.error(this._config.info.name + ': Error downloading update:', error) }
            })
        }
    }
};
