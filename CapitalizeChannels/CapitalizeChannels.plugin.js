/**
 * @name Capitalize Channel Names
 * @author GentlePuppet
 * @version 1.0.0
 * @description Replaces underscores and dashes with spaces and capitalizes channel names.
 */

module.exports = class {
    start() {
        this.processedChannels = new WeakMap();
        this.pending = false;
        this.queue = new Set();

        this.observer = new MutationObserver(mutations => {
            for (const m of mutations) {
                for (const node of m.addedNodes) {
                    if (node.nodeType !== 1) continue;

                    if (node.matches?.('a[href^="/channels/"]')) {
                        this.queue.add(node);
                    }

                    const found = node.querySelectorAll?.('a[href^="/channels/"]') || [];
                    if (found.length) {
                    }

                    const foundHeaders = node.querySelectorAll?.('[class*="overflow"]') || [];
                    foundHeaders.forEach(h => this.queue.add(h));

                    found.forEach(c => {
                        this.queue.add(c);
                    });
                }
            }

            if (this.pending) {
                return;
            }

            this.pending = true;

            requestAnimationFrame(() => {
                for (const node of this.queue) {
                    this.processNode(node);
                }
                this.queue.clear();
                this.pending = false;
            });
        });

        const channelContainer =
            document.querySelector('[class*="sidebarList"]') ||
            document.body;

        this.observer.observe(channelContainer, {
            childList: true,
            subtree: true,
            characterData: true
        });

    }

    stop() {
        if (this.observer) {
            this.observer.disconnect();
            this.observer = null;
        }

        this.processedChannels = null;
        this.queue = null;
    }

    processNode(node) {
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

        const current = nameNode.textContent?.trim();
        if (!current) return;

        const last = this.processedChannels.get(nameNode);
        if (last === current) return;

        const formatted = this.formatChannelName(current);
        if (formatted !== current) {
            nameNode.textContent = formatted;
        }

        this.processedChannels.set(nameNode, formatted);
    }

    formatChannelName(name) {
        return name
            .replace(/[_-]+/g, " ")
            .replace(/\s+/g, " ")
            .trim()
            .replace(/\b\w/g, char => char.toUpperCase());
    }
};
