/** 
* @name Hide Channels 
* @author GentlePuppet 
* @authorId 199263542833053696 
* @version 1.0 
* @description A plugin that lets you hide channels. 
*/

const { Data } = BdApi;

module.exports = class {

    constructor() {
        this.hidden = true;
        this.observer = null;
        this.pluginName = "HideChannels";

        this.settings = BdApi.Data.load(this.pluginName, "settings") ?? {};

        if (!this.settings.channelsByGuild) {
            this.settings.channelsByGuild = {};
        }
    }

    start() {
        this.injectButtons();
        this.refresh();

        let timeout;

        this.observer = new MutationObserver(() => {
            clearTimeout(timeout);
            timeout = setTimeout(() => { this.injectButtons(); this.refresh() }, 50);
        });

        this.observer.observe(document.body, {
            childList: true,
            subtree: true
        });

        const styleSheet = document.createElement("style");
        styleSheet.classList.add("hc-style");
        styleSheet.textContent = `[aria-label="Channels"] {margin-top: 20px}`;
        document.body.after(styleSheet);
    }

    stop() {

        document.querySelector("#hc-toggle")?.remove();
        document.querySelector("#hc-config")?.remove();
        document.querySelector("#hc-editor")?.remove();
        document.querySelector(".hc-style")?.remove();

        this.observer?.disconnect();

        this.showEverything();
    }

    save() {
        BdApi.Data.save(this.pluginName, "settings", this.settings);
    }

    refresh() {
        const container = document.querySelector('[aria-label="Channels"]');
        if (!container) return;

        container.querySelectorAll('a[href*="/channels/"]').forEach(link => {

            const href = link.getAttribute("href");

            const match = href.match(/^\/channels\/(\d+)\/(\d+)$/);
            if (!match) return;

            const guildID = match[1];
            const channelID = match[2];

            const row = link.closest('li[class*="container"]');
            if (!row) return;

            const shouldHide = this.hidden && this.settings.channelsByGuild[guildID]?.includes(channelID);
            const shouldShow = !this.hidden && this.settings.channelsByGuild[guildID]?.includes(channelID);

            row.style.display = shouldHide ? "none" : "";
            row.querySelector('a').style.background = shouldShow ? "black" : "";
        });
    }

    showEverything() {
        document
            .querySelectorAll('a[href*="/channels/"]')
            .forEach(link => {
                const row = link.closest('li[class*="container"]');
                if (row) {
                    row.style.display = "";
                    row.querySelector('a').style.background = "";
                }
            });
    }

    injectButtons() {
        if (document.querySelector("#hc-toggle")) return;

        const header = document.querySelector('[aria-label="Channels"]');
        if (!header) return;

        const toggle = document.createElement("button");
        toggle.id = "hc-toggle";
        toggle.textContent = "Show";
        Object.assign(toggle.style, {
            width: "50%",
            background: "#016337",
            color: "#ffffff",
            textShadow: "0px 0px 4px black",
            position: "fixed",
            left: "0",
            zIndex: "100"
        })
        toggle.onclick = () => {
            this.hidden = !this.hidden;
            toggle.textContent = this.hidden ? "Show" : "Hide";
            toggle.style.background = this.hidden ? "#016337" : "#630101";
            this.refresh();
        };
        header.before(toggle);

        const config = document.createElement("button");
        config.id = "hc-config";
        config.textContent = "Settings";
        Object.assign(config.style, {
            width: "50%",
            background: "#00496b",
            color: "#ffffff",
            textShadow: "0px 0px 4px black",
            position: "fixed",
            zIndex: "100",
            left: "50%"
        })
        config.onclick = () => this.openEditor();
        header.before(config);
    }

    parseLinks(text) {
        const result = {};

        text.split(/[\n,]+/)
            .map(s => s.trim())
            .filter(Boolean)
            .forEach(link => {
                const match = link.match(/discord\.com\/channels\/(\d+)\/(\d+)/);
                if (!match) return;

                const guild = match[1];
                const channel = match[2];

                if (!result[guild]) result[guild] = [];
                result[guild].push(channel);
            });

        return result;
    }

    getCurrentGuildID() {
        const link = document.querySelector('[aria-label="Channels"] a[href*="/channels/"]');
        if (!link) return null;

        const match = link.getAttribute("href")?.match(/^\/channels\/(\d+)\/(\d+)$/);
        return match ? match[1] : null;
    }

    openEditor() {
        document.querySelector("#hc-editor")?.remove();

        const pop = document.createElement("div");
        pop.id = "hc-editor";

        Object.assign(pop.style, {
            position: "fixed",
            top: "80px",
            left: "120px",
            width: "500px",
            background: "#2b2d31",
            border: "1px solid #555",
            padding: "10px 15px 10px 10px",
            zIndex: 999999
        });

        const box = document.createElement("textarea");

        box.style.width = "100%";
        box.style.height = "150px";

        const currentGuild = this.getCurrentGuildID();

        const channels = currentGuild
            ? (this.settings.channelsByGuild[currentGuild] ?? [])
            : Object.values(this.settings.channelsByGuild).flat();

        box.value = channels
            .map(id => `https://discord.com/channels/${currentGuild}/${id}`)
            .join("\n");

        pop.append(box);

        const save = document.createElement("button");
        save.textContent = "Save";

        save.onclick = () => {

            const parsed = this.parseLinks(box.value);

            for (const guild in parsed) {
                if (!this.settings.channelsByGuild[guild]) {
                    this.settings.channelsByGuild[guild] = [];
                }

                const existing = new Set(this.settings.channelsByGuild[guild]);

                for (const channel of parsed[guild]) {
                    existing.add(channel);
                }

                this.settings.channelsByGuild[guild] = [...existing];
            }

            this.save();
            this.refresh();
            pop.remove();
        };

        pop.append(save);

        document.body.append(pop);
    }
}
