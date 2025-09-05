## Overview

**AutoIdle** is a simple plugin I made to replace a complex outdate one I use to use.
This plugin automatically manages your Discord status by switching between chosen statuses based on your Discord activity:

- When you are actively using Discord (window focused), your status is set to **(Default: Online)** after a configurable delay (Default: 5s).
- When you switch away from Discord (window unfocused), your status changes to **(Default: Idle)** after a configurable delay (Default: 5s).
- If you are in a voice call, your status will **not** be changed automatically, so your status reflects your call presence.
- The plugin respects manual **Do Not Disturb (DND)** and **Invisible** statuses, leaving them unchanged unless configured otherwise.

---

## Settings

| Setting               | Description                                                                | Default   |
|-----------------------|----------------------------------------------------------------------------|-----------|
| Active Status Choice  | Status to switch to when Discord is focused (Online/Idle/DND/Invisible).   | Online    |
| Away Status Choice    | Status to switch to when Discord is unfocused (Online/Idle/DND/Invisible). | Idle      |
| Online Status Delay   | Delay before switching to Online after Discord gains focus.                | 5 seconds |
| Idle Status Delay     | Delay before switching to Idle after Discord loses focus.                  | 5 seconds |
| Enable Update Check   | Check for updates when plugin starts.                                      | Enabled   |
| Enable Silent Updates | Allow the plugin to update itself automatically without prompts.           | Disabled  |
| Ignore Voice Calls    | Change status even if you are in a voice call.                             | Disabled  |
| Ignore DND            | Change status even if Do Not Disturb is enabled.                           | Disabled  |
| Ignore Invisible      | Change status even if Invisible is enabled.                                | Disabled  |

---

## Features

- **Automatic status switching** between chosen statuses based on Discord window focus.
- Ability to **choose custom statuses** for active and away states via dropdown settings (Online, Idle, DND, Invisible).
- Configurable **delays** for switching to Online and Idle statuses.
- Option to **ignore voice calls, allowing the plugin to change status during a call**.
- Options to **allow status changes even if DND or Invisible are active**.
- Built-in **update checker** with silent update support. (Silent Updates are Disabled by Default)
- User-friendly settings panel with sliders, switches, and dropdowns.

---

## Installation

1. Download the [AutoIdle.plugin.js](https://raw.githubusercontent.com/GentlePuppet/BetterDiscordPlugins/main/AutoIdle/AutoIdle.plugin.js) file.
2. Place it in your BetterDiscord plugins folder.
3. Enable the plugin in BetterDiscord’s plugin settings.

---

## Usage

Once enabled, the plugin will automatically:

- Switch your status to your chosen **active status** (default: Online) when Discord gains focus.
- Switch your status to your chosen **away status** (default: Idle) when Discord loses focus.
- Respect your settings for voice calls and manual statuses.
- Optionally update itself silently if a new version is detected (disabled by default but included for ease of use).

Adjust the behavior using the plugin’s settings panel to suit your preferences.

---
