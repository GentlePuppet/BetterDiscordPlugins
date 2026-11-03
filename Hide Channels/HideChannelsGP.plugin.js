/** 
* @name Hide Channels 
* @author GentlePuppet 
* @authorId 199263542833053696 
* @version 1.1.1
* @description A plugin that lets you hide individual channels.
* @website https://github.com/GentlePuppet/BetterDiscordPlugins/
* @source https://raw.githubusercontent.com/GentlePuppet/BetterDiscordPlugins/refs/heads/main/Hide%20Channels/HideChannelsGP.plugin.js
* @updateUrl https://raw.githubusercontent.com/GentlePuppet/BetterDiscordPlugins/refs/heads/main/Hide%20Channels/HideChannelsGP.plugin.js
*/

const { Data } = BdApi;

module.exports = class {

    start() {
        this.hidden = true;
        this.pluginName = "HideChannelsGP";
        this.isRefreshing = false;

        this.settings = BdApi.Data.load(this.pluginName, "settings") ?? {};
        if (!this.settings.channelsByGuild) this.settings.channelsByGuild = {};

        this.GuildChannelStore = BdApi.Webpack.getStore("GuildChannelStore");
        this.ChannelStore = BdApi.Webpack.getStore("ChannelStore");
        this.SelectedGuildStore = BdApi.Webpack.getStore("SelectedGuildStore");
        this.SelectedChannelStore = BdApi.Webpack.getStore("SelectedChannelStore");

        this.injectButtons();
        this.refresh();
    }

    stop() {
        document.querySelector(".hc-editor")?.remove();
        document.querySelector(".hc-root")?.remove();
        document.querySelector(".hc-style")?.remove();

        this.showEverything();
    }

    showEverything() {
        const container = document.querySelector('[aria-label="Channels"]');
        if (!container) return;

        container.querySelectorAll('li[class*="container"]').forEach(row => {
            row.style.display = "";
            const target = row.querySelector('a') || row.querySelector('[role="button"]') || row;
            if (target) target.style.background = "";
        });
    }

    save() {
        BdApi.Data.save(this.pluginName, "settings", this.settings);
    }

    getChannelIdFromRow(row) {
        if (!row) return null;

        const link = row.querySelector('a[href*="/channels/"]');
        if (link) {
            const match = link.getAttribute("href")?.match(/^\/channels\/(\d+)\/(\d+)$/);
            if (match) return match[2];
        }

        const listItemId = row.getAttribute("data-list-item-id") || 
                           row.querySelector("[data-list-item-id]")?.getAttribute("data-list-item-id");
        if (listItemId) {
            const idMatch = listItemId.match(/(\d{17,20})/);
            if (idMatch) return idMatch[1];
        }

        const dataEl = row.querySelector("[data-channel-id], [data-id]");
        if (dataEl) {
            const id = dataEl.getAttribute("data-channel-id") || dataEl.getAttribute("data-id");
            if (id && /^\d{17,20}$/.test(id)) return id;
        }

        return null;
    }

    observer() {
        let timeout;
        clearTimeout(timeout);
        timeout = setTimeout(() => {
            this.injectButtons();
            this.refresh()
        }, 1);
    }

    refresh() {
        if (this.isRefreshing) return;
        this.isRefreshing = true;

        try {
            const container = document.querySelector('[aria-label="Channels"]');
            if (!container) return;

            const guildID = this.getCurrentGuildID();
            if (!guildID) return;

            const hiddenIds = this.settings.channelsByGuild[guildID] ?? [];

            container.querySelectorAll('li[class*="container"]').forEach(row => {
                const channelID = this.getChannelIdFromRow(row);
                if (!channelID) return;

                const shouldHide = this.hidden && hiddenIds.includes(channelID);
                const shouldHighlight = !this.hidden && hiddenIds.includes(channelID);

                row.style.display = shouldHide ? "none" : "";

                const target = row.querySelector('a') || row.querySelector('[role="button"]') || row;
                if (target) {
                    target.style.background = shouldHighlight ? "black" : "";
                }
            })
            this.syncToggleButton();
        } finally {
            this.isRefreshing = false;
        }
    }

    syncToggleButton() {
        const toggle = document.querySelector(".hc-toggle");
        if (!toggle) return;
        toggle.textContent = this.hidden ? "Show" : "Hide";
        toggle.style.background = this.hidden ? "#016337" : "#630101";
    }

    injectButtons() {
        const header = document.querySelector('[aria-label="Channels"]');
        if (!header) {
            document.querySelector(".hc-root")?.remove();
            return;
        }

        if (!document.querySelector('.hc-style')) {
            const styleSheet = document.createElement("style");
            styleSheet.className = "hc-style";
            styleSheet.textContent = `
                [aria-label="Channels"] {margin-top: 20px}
                .hc-root {margin-top: -20px; position: absolute; z-index: 3; width: 100%}
                .hc-button {width: 50%; color: #ffffff; text-shadow: 0px 0px 4px black;}
                .hc-list {max-height: 70vh; overflow-y: auto; padding-right: 4px;}
                .hc-section {margin: 4px 0; border-radius: 4px; background: #1e1f22; color: #6495ed;}
                .hc-section summary {padding: 6px 8px; cursor: pointer; font-weight: 600; user-select: none; list-style: none;}
                .hc-section summary::-webkit-details-marker {display: none;}
                .hc-section summary:before {content: "▶ "; font-size: 10px; margin-right: 4px;}
                .hc-section[open] summary:before {content: "▼ ";}
                .hc-channel {display: flex; align-items: center; padding: 3px 8px 3px 20px; gap: 8px; color: #fff;}
                .hc-channel label {flex: 1; cursor: pointer; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;}
                .hc-channel input {cursor: pointer;}
            `;
            document.body.append(styleSheet);
        }

        if (!document.querySelector(".hc-root")) {
            const root = document.createElement("div");
            root.className = "hc-root";
            header.prepend(root);

            const toggle = document.createElement("button");
            toggle.className = "hc-toggle hc-button";
            toggle.onclick = () => {
                this.hidden = !this.hidden;
                this.refresh();
            };
            root.append(toggle);

            const config = document.createElement("button");
            config.className = "hc-config hc-button";
            config.textContent = "Settings";
            config.style.background = "#00496b";
            config.onclick = () => this.openEditor();
            root.append(config);
        }
    }


    // ==============
    // Settings Panel
    //===============
    getCurrentGuildID() {
        if (this.SelectedGuildStore?.getGuildId) {
            const id = this.SelectedGuildStore.getGuildId();
            if (id) return id;
        }

        const link = document.querySelector('[aria-label="Channels"] a[href*="/channels/"]');
        if (!link) return null;

        const match = link.getAttribute("href")?.match(/^\/channels\/(\d+)\/(\d+)$/);
        return match ? match[1] : null;
    }

    getOrganizedChannels(guildID) {
        if (!guildID || !this.GuildChannelStore) return { categories: [], uncategorized: [] };

        const data = this.GuildChannelStore.getChannels(guildID);
        if (!data) return { categories: [], uncategorized: [] };

        const selectable = (data.SELECTABLE || []).map(c => c.channel || c);
        const vocal = (data.VOCAL || []).map(c => c.channel || c);
        const allChannels = [...selectable, ...vocal].filter(c => c && c.type !== 4);

        const categoryData = data[4] || data.GUILD_CATEGORY || [];
        const categories = categoryData
            .map(c => c.channel || c)
            .filter(c => c && c.id !== "Uncategorized" && c.name !== "Uncategorized")
            .sort((a, b) => (a.position ?? 0) - (b.position ?? 0));

        const byParent = {};
        allChannels.forEach(ch => {
            const parent = ch.parent_id || null;
            if (!byParent[parent]) byParent[parent] = [];
            byParent[parent].push(ch);
        });

        Object.values(byParent).forEach(list => {
            list.sort((a, b) => (a.position ?? 0) - (b.position ?? 0));
        });

        return {
            categories: categories.map(cat => ({
                category: cat,
                channels: byParent[cat.id] || []
            })).filter(group => group.channels.length > 0),
            uncategorized: byParent[null] || []
        };
    }

    openEditor() {
        document.querySelector("#hc-editor")?.remove();

        const pop = document.createElement("div");
        pop.id = "hc-editor";
        Object.assign(pop.style, {
            position: "fixed",
            top: "80px",
            left: "120px",
            width: "420px",
            background: "#2b2d31",
            border: "1px solid #555",
            borderRadius: "6px",
            overflow: "hidden",
            boxShadow: "0 8px 24px rgba(0,0,0,.45)",
            zIndex: 999999
        });

        const titleBar = document.createElement("div");
        titleBar.textContent = "Hide Channels Settings";
        Object.assign(titleBar.style, {
            height: "32px",
            background: "#1e1f22",
            color: "#ffffff",
            borderBottom: "1px solid #555",
            display: "flex",
            alignItems: "center",
            padding: "0 10px",
            cursor: "move",
            userSelect: "none",
            fontWeight: "600"
        });
        pop.append(titleBar);

        const close = document.createElement("button");
        close.textContent = "✕";
        Object.assign(close.style, {
            marginLeft: "auto",
            background: "transparent",
            border: "none",
            color: "#fff",
            cursor: "pointer",
            fontSize: "16px",
            zIndex: "9999"
        });
        close.onclick = () => pop.remove();
        close.addEventListener("pointerdown", e => e.stopPropagation());
        titleBar.append(close);

        const content = document.createElement("div");
        Object.assign(content.style, {
            padding: "10px",
            maxHeight: "75vh",
            overflow: "hidden",
            display: "flex",
            flexDirection: "column"
        });
        pop.append(content);

        const currentGuild = this.getCurrentGuildID();
        if (!currentGuild) {
            content.textContent = "No guild selected. Open a server first.";
            document.body.append(pop);
            return;
        }

        const hiddenSet = new Set(this.settings.channelsByGuild[currentGuild] ?? []);
        const { categories, uncategorized } = this.getOrganizedChannels(currentGuild);

        const list = document.createElement("div");
        list.className = "hc-list";
        content.append(list);

        const createChannelRow = (channel) => {
            const row = document.createElement("div");
            row.className = "hc-channel";

            const checkbox = document.createElement("input");
            checkbox.type = "checkbox";
            checkbox.checked = hiddenSet.has(channel.id);
            checkbox.onchange = () => {
                if (checkbox.checked) {
                    hiddenSet.add(channel.id);
                } else {
                    hiddenSet.delete(channel.id);
                }
                this.settings.channelsByGuild[currentGuild] = [...hiddenSet];
                this.save();
                this.refresh();
            };

            const label = document.createElement("label");
            label.textContent = channel.name || "Unnamed";
            label.onclick = () => checkbox.click();

            row.append(checkbox, label);
            return row;
        };

        if (uncategorized.length) {
            const details = document.createElement("details");
            details.className = "hc-section";
            const summary = document.createElement("summary");
            summary.textContent = "Uncategorized";
            details.append(summary);
            uncategorized.forEach(ch => details.append(createChannelRow(ch)));
            list.append(details);
        }

        categories.forEach(({ category, channels }) => {
            const details = document.createElement("details");
            details.className = "hc-section";
            const summary = document.createElement("summary");
            summary.textContent = category.name || "Category";
            details.append(summary);
            channels.forEach(ch => details.append(createChannelRow(ch)));
            list.append(details);
        });

        if (!list.children.length) {
            list.textContent = "No channels found.";
        }

        const note = document.createElement("div");
        note.style.cssText = "margin-top: 10px; font-size: 12px; color: #aaa; text-align: center;";
        note.textContent = "Checked = hidden";
        content.append(note);

        let dragging = false;
        let offsetX = 0;
        let offsetY = 0;
        titleBar.addEventListener("pointerdown", e => {
            dragging = true;
            offsetX = e.clientX - pop.offsetLeft;
            offsetY = e.clientY - pop.offsetTop;
            titleBar.setPointerCapture(e.pointerId);
        });
        titleBar.addEventListener("pointermove", e => {
            if (!dragging) return;
            pop.style.left = `${e.clientX - offsetX}px`;
            pop.style.top = `${e.clientY - offsetY}px`;
        });
        titleBar.addEventListener("pointerup", e => {
            dragging = false;
            titleBar.releasePointerCapture(e.pointerId);
        });

        document.body.append(pop);
    }
}
