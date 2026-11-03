/**
 * @name Capitalize Channel Names
 * @author GentlePuppet
 * @authorId 199263542833053696 
 * @version 1.1.0
 * @description Replaces underscores and dashes with spaces and capitalizes channel names.
 * @website https://github.com/GentlePuppet/BetterDiscordPlugins
 * @source https://raw.githubusercontent.com/GentlePuppet/BetterDiscordPlugins/main/CapitalizeChannels/CapitalizeChannels.plugin.js
 */

module.exports = class {
    start() {
        this.processedChannels = new WeakMap();
        this.pending = false;
        this.queue = new Set();

        document.querySelectorAll('a[href^="/channels/"]').forEach(node => this.processNode(node));
        document.querySelectorAll('[class*="overflow"]').forEach(node => this.processNode(node));
    }

    stop() {
        this.processedChannels = null;
        this.queue = null;
    }

    observer() {
        document.querySelectorAll(
            'a[href^="/channels/"], [class*="overflow"]'
        ).forEach(node => this.processNode(node));
    }

    processNode(node) {
        if (!this.processedChannels) return;

        let nameNode = null;

        if (node.matches?.('a[href^="/channels/"]')) {
            nameNode = node.querySelector('[class*="linkTop"] [class*="name"]');
        }

        if (!nameNode) {
            nameNode = node.matches?.('[class*="overflow"]')
                ? node
                : node.querySelector?.('[class*="overflow"]');
        }

        if (!nameNode) return;

        // Replacement already exists, nothing else to do.
        const existingReplacement = nameNode.nextElementSibling;
        if (existingReplacement?.classList.contains("capitalized-channel-name")) {
            return;
        }

        const current = nameNode.textContent?.trim();
        if (!current) return;

        const formatted = this.formatChannelName(current);

        // No formatting change needed.
        if (formatted === current) return;

        // Hide the original React-owned node.
        nameNode.style.display = "none";

        // Create replacement.
        const replacement = document.createElement("span");
        replacement.classList.add(...nameNode.classList);
        replacement.classList.add("capitalized-channel-name");
        replacement.textContent = formatted;

        nameNode.after(replacement);

        this.processedChannels.set(nameNode, current);
    }

    formatChannelName(name) {
        return name
            .replace(/[_-]+/g, " ")
            .replace(/\s+/g, " ")
            .trim()
            .replace(/\b\w/g, char => char.toUpperCase());
    }
};
