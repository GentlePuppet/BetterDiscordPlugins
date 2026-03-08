/**
* @name QuickJoinVoice
* @author GentlePuppet
* @authorId 199263542833053696
* @description Floating draggable button to quickly join a voice channel.
* @version 1.0.0
**/

const { Webpack, Webpack: { Filters }, Data } = BdApi;

let GuildId = null;
let ChannelId = null;

module.exports = class SimpleJoinVoiceButton {
    constructor() {
        this.button = null;
        this.dragging = false;
        this.counts = null;
    }

    start() {
        const saved = Data.load("QuickJoinVoice", "channel");

        if (saved) {
            GuildId = saved.guildId;
            ChannelId = saved.channelId;
        } else {
            GuildId = "null";
            ChannelId = "null";
        }

        if (document.querySelector(".QuickJoinContainer_plugin")) {
            document.querySelector(".QuickJoinContainer_plugin").remove();
        }

        this.createButton();
        this.startVoiceCountUpdater();
    }

    stop() {
        if (document.querySelector(".QuickJoinContainer_plugin")) { document.querySelector(".QuickJoinContainer_plugin").remove(); }
        const VoiceStateStore = Webpack.getStore("VoiceStateStore");
        if (VoiceStateStore && this.updateButton) {
            VoiceStateStore.removeChangeListener(this.updateButton);
        }
    }

    createButton() {
        const savedPosition = Data.load("QuickJoinVoice", "position") || { x: 100, y: 100 };

        this.button = document.createElement("div");
        this.button.className = "QuickJoinVoice_plugin";
        this.button.innerText = "Join VC";
        this.button.title = "Left-Click: Join voice channel\nRight-Click: Change channel\nHold: Move the button";
        this.button.style.position = "fixed";
        this.button.style.left = savedPosition.x + "px";
        this.button.style.top = savedPosition.y + "px";
        this.button.style.padding = "5px 10px";
        this.button.style.background = "#5865F2";
        this.button.style.color = "#fff";
        this.button.style.borderRadius = "8px";
        this.button.style.cursor = "pointer";
        this.button.style.zIndex = "9999";
        this.button.style.userSelect = "none";
        this.button.style.fontWeight = "600";

        let container = document.querySelector("QuickJoinContainer_plugin");

        if (!container) {
            container = document.createElement("div");
            container.className = "QuickJoinContainer_plugin";
            container.style.position = "fixed";
            container.style.top = "0";
            container.style.left = "0";
            container.style.width = "100%";
            container.style.height = "100%";
            container.style.pointerEvents = "none";
            container.style.zIndex = "9999";
            document.body.after(container);
        }

        this.button.style.pointerEvents = "auto";
        container.appendChild(this.button);

        this.makeDraggable();
        this.addClickHandler();
        this.addContextMenu();
    }

    addClickHandler() {
        const ChannelActions = BdApi.Webpack.getModule(
            m => m?.selectVoiceChannel,
            { searchExports: true }
        );

        this.button.addEventListener("click", () => {
            if (this.dragging) return;

            if (!ChannelActions?.selectVoiceChannel) {
                console.error("selectVoiceChannel not found");
                return;
            }

            try {
                ChannelActions.selectVoiceChannel(ChannelId);
            } catch (err) {
                console.error("Voice join failed:", err);
            }
        });
    }

    openChannelInput() {
        if (document.querySelector(".QuickJoinInput_plugin")) return;
    
        const container = document.querySelector(".QuickJoinContainer_plugin");
        if (!container) return;
    
        const overlay = document.createElement("div");
        overlay.className = "QuickJoinInput_plugin";
        overlay.style.position = "fixed";
        overlay.style.top = "0";
        overlay.style.left = "0";
        overlay.style.width = "100%";
        overlay.style.height = "100%";
        overlay.style.display = "flex";
        overlay.style.alignItems = "center";
        overlay.style.justifyContent = "center";
        overlay.style.pointerEvents = "auto";
        overlay.style.background = "rgba(0,0,0,0.4)";
        overlay.style.zIndex = "10000";
    
        const box = document.createElement("div");
        box.style.background = "var(--modal-background)";
        box.style.padding = "20px";
        box.style.borderRadius = "10px";
        box.style.display = "flex";
        box.style.flexDirection = "column";
        box.style.gap = "10px";
        box.style.minWidth = "320px";
    
        const label = document.createElement("div");
        label.innerText = "Enter Voice Channel Link or ID";
        label.style.color = "white";
        label.style.fontWeight = "600";
    
        const input = document.createElement("input");
        input.type = "text";
        input.placeholder = "https://discord.com/channels/... or channel ID";
        input.style.padding = "8px";
        input.style.borderRadius = "6px";
        input.style.border = "none";
    
        const accept = document.createElement("button");
        accept.innerText = "Accept";
        accept.style.padding = "8px";
        accept.style.border = "none";
        accept.style.borderRadius = "6px";
        accept.style.background = "#5865F2";
        accept.style.color = "white";
        accept.style.cursor = "pointer";
    
        const cancel = document.createElement("button");
        cancel.innerText = "Cancel";
        cancel.style.padding = "8px";
        cancel.style.border = "none";
        cancel.style.borderRadius = "6px";
        cancel.style.background = "#4f545c";
        cancel.style.color = "white";
        cancel.style.cursor = "pointer";
    
        box.appendChild(label);
        box.appendChild(input);
        box.appendChild(accept);
        box.appendChild(cancel);
        overlay.appendChild(box);
        container.appendChild(overlay);
    
        input.focus();

        input.addEventListener("keydown", (e) => {
            if (e.key === "Enter") accept.click();
        });
    
        const close = () => overlay.remove();
    
        cancel.onclick = close;
    
        accept.onclick = () => {
            const value = input.value.trim();
            if (!value) return;
    
            let guild = null;
            let channel = null;
    
            const match = value.match(/channels\/(\d+)\/(\d+)/);
    
            if (match) {
                guild = match[1];
                channel = match[2];
            } else if (/^\d+$/.test(value)) {
                channel = value;
            }
    
            if (!channel) return;
    
            GuildId = guild || GuildId;
            ChannelId = channel;
    
            Data.save("QuickJoinVoice", "channel", {
                guildId: GuildId,
                channelId: ChannelId
            });
    
            this.counts = null;
            this.updateButton?.();
    
            close();
        };
    }

    addContextMenu() {
        this.button.addEventListener("contextmenu", (e) => {
            e.preventDefault();
            this.openChannelInput();
        });
    }

    makeDraggable() {
        let offsetX, offsetY;

        this.button.addEventListener("mousedown", (e) => {
            this.dragging = false;
            offsetX = e.clientX - this.button.offsetLeft;
            offsetY = e.clientY - this.button.offsetTop;

            const onMouseMove = (e) => {
                this.dragging = true;

                const rawX = e.clientX - offsetX;
                const rawY = e.clientY - offsetY;

                const minTop = 32;
                const minLeft = 0;

                const maxLeft = window.innerWidth - this.button.offsetWidth;
                const maxTop = window.innerHeight - this.button.offsetHeight;

                const clampedX = Math.min(Math.max(minLeft, rawX), maxLeft);
                const clampedY = Math.min(Math.max(minTop, rawY), maxTop);

                this.button.style.left = clampedX + "px";
                this.button.style.top = clampedY + "px";
            };

            const onMouseUp = () => {
                document.removeEventListener("mousemove", onMouseMove);
                document.removeEventListener("mouseup", onMouseUp);

                Data.save("QuickJoinVoice", "position", {
                    x: parseInt(this.button.style.left),
                    y: parseInt(this.button.style.top)
                });
            };

            document.addEventListener("mousemove", onMouseMove);
            document.addEventListener("mouseup", onMouseUp);
        });
    }

    startVoiceCountUpdater() {
        const VoiceStateStore = Webpack.getStore("VoiceStateStore");
        const UserStore = Webpack.getStore("UserStore");

        if (!VoiceStateStore || !UserStore) return;

        this.updateButton = () => {
            const currentUser = UserStore.getCurrentUser();
            if (!currentUser) return;

            const myState = VoiceStateStore.getVoiceStateForUser(currentUser.id);
            const amInTargetChannel = myState?.channelId === ChannelId;

            // Hide if we're already in the channel
            if (amInTargetChannel) {
                this.button.style.display = "none";
                return;
            } else {
                this.button.style.display = "block";
            }

            // Count users in target channel
            const states = VoiceStateStore.getVoiceStatesForChannel(ChannelId);
            const count = states ? Object.keys(states).length : 0;

            if (this.counts === count) return;

            this.counts = count;
            this.button.innerText = count > 0 ? `Join VC - ${count}` : "Join VC";
            this.button.style.background = count > 0 ? "green" : "#5865F2";
        };

        // Subscribe to voice state updates
        VoiceStateStore.addChangeListener(this.updateButton);

        // Run once immediately
        this.updateButton();
    }
};
