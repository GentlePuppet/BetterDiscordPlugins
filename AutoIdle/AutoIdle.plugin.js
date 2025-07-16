/**
 * @name AutoIdle
 * @author GentlePuppet
 * @authorId 199263542833053696
 * @description Sets status to online when actively using discord and back to idle after clicking off. If you are in a voice call it will not change to idle. It will also not change your status if you have Invisible or DND enabled.
 * @version 0.6.0
 * @website https://github.com/GentlePuppet/BetterDiscordPlugins
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
        version: "0.6",
        description: "Automatically change you status between Idle and Online when switching from and to Discord.",
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
        }
    ]
};

let defaultSettings = {
    statusDelay: 5,
    statusDelay2: 5
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
    }

    stop() {
        window.removeEventListener("focus", this.boundOnFocus);
        window.removeEventListener("blur", this.boundOnBlur);
        clearTimeout(this.timeout);
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
};
