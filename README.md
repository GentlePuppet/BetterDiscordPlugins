# $$\color{#80aaff}{\text{BetterDiscordPlugins}}$$
This is where I store the plugins I make for BetterDiscord.\
I mainly make these for my own use, but you are welcome to use them too.\
<br>Click the `▶ Description` in each section for details about each plugin.

<!-- ==================================================================== -->
<!-- ||                                                                || -->
<!-- ==================================================================== -->

# $$\color{#fff900}{\text{Capitalize Channels}}$$
<details>
  <summary>A simple BetterDiscord plugin that reformats the names of channels.</summary>
<br>
This is my own version that is less excessively built and won't make you crash when discord updates.
<br><br>
<img width="131" height="190" alt="image" src="https://github.com/user-attachments/assets/1b01669d-c7e0-4f6b-955e-b4caf9777dd1" />



### $$\color{#00ff45}{\text{📁 Installation}}$$

1. Download the [CapitalizeChannels.plugin.js](https://raw.githubusercontent.com/GentlePuppet/BetterDiscordPlugins/refs/heads/main/CapitalizeChannels/CapitalizeChannels.plugin.js) file.
2. Place it in your BetterDiscord plugins folder.
3. Enable the plugin in BetterDiscord’s plugin settings.
<hr>
</details>

<!-- ==================================================================== -->
<!-- ||                                                                || -->
<!-- ==================================================================== -->

# $$\color{#fff900}{\text{Hide Channels}}$$
<details>
  <summary>A simple BetterDiscord plugin that lets you hide channels, per server.</summary>
<br>
You can separate the channel urls with a comma or a new line.
  
When you show the hidden channels they will have a black background to mark them as `Hidden`.

Right-click a channel and select `Copy Link` then paste the link the settings text box then `Save & Close`.

<br>
<img height="400" src="https://github.com/user-attachments/assets/bb3977d4-4445-4caa-913c-f53428ae56ac" />
<img height="400" alt="image" src="https://github.com/user-attachments/assets/db935d04-16dd-44d4-8065-17654a4d4213" />
<img height="400" alt="image" src="https://github.com/user-attachments/assets/fb4f4a0b-4ab9-41e5-b7e8-81bbc37f6ba0" />



### $$\color{#00ff45}{\text{📁 Installation}}$$

1. Download the [HideChannels.plugin.js](https://raw.githubusercontent.com/GentlePuppet/BetterDiscordPlugins/refs/heads/main/Hide%20Channels/HideChannels.plugin.js) file.
2. Place it in your BetterDiscord plugins folder.
3. Enable the plugin in BetterDiscord’s plugin settings.
<hr>
</details>

<!-- ==================================================================== -->
<!-- ||                                                                || -->
<!-- ==================================================================== -->

# $$\color{#fff900}{\text{Auto Idle}}$$
<details>
  <summary>A BetterDiscord plugin that automatically changes your status based on your Discord activity.</summary>
<br>
  
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

### $$\color{#00ff45}{\text{📁 Installation}}$$

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

<hr>
</details>

<!-- ==================================================================== -->
<!-- ||                                                                || -->
<!-- ==================================================================== -->

# $$\color{#fff900}{\text{Full Res Avatar Hover}}$$
<details>
  <summary>A BetterDiscord plugin that lets you hover over user avatars to see a higher-resolution version in a floating panel.</summary>
<br>

  # Full Res Hover Avatars 
<img align="left" width="202" alt="image" src="https://user-images.githubusercontent.com/43224790/190882375-d12af1b8-637f-4d15-a2bd-79e7d2a63d53.png" /><img align="right" width="202" alt="image" src="https://github.com/user-attachments/assets/db7cc559-3bc6-434f-9b6d-4aa73a3320a7" />
A simple BetterDiscord plugin that lets you <b>hover over avatars</b> to see a higher-resolution version in a floating panel, with the border around the avatar being their current status.\
<br>Perfect for getting a clearer look at profile pictures without needing to open the profile popup.\
<br>Includes an option to display Avatar Decorations →


## Preview
<img src="https://user-images.githubusercontent.com/43224790/193963127-166ce3ca-d411-4cea-aeb6-208affc993e4.gif">

<br>

## Supports The Following Avatars
- Server Members List
- Friends List
- DM Messages List
- Chat Messages (Both default and compact if avatars are shown)

<br>

## Settings


| Setting               | Description                                                                | Default   |
|-----------------------|----------------------------------------------------------------------------|-----------|
| Enable Update Check   | Check for updates when plugin starts.                                      | Enabled   |
| Enable Silent Updates | Allow the plugin to update itself automatically without prompts.           | Disabled  |
| Avatar Decorations    | Display nitro decorations on the popup avatar.                             | Enabled   |
| Require Focus         | Require Discord Focus To Display Popout.                                   | Enabled   |
| Avatar Resolution     | Resolution size of the expanded avatars, in pixels.                        | 512       |
| Avatar Panel Size     | The size of the popout avatar box, in pixels.                              | 256       |
<img align="middle" width="500" height="auto" alt="image" src="https://github.com/user-attachments/assets/bffd2431-c460-4fc4-bd20-a9e902192a10" />

<br><br>

Settings are manually saved in a JSON file (`FullResAvatars.Config.json`) inside the plugin folder.
> When I first made this plugin I didn't know how to use the BD settings panel,\
> so I created my own and inserted it onto the BD panel that opens.<br><br>
> I don't want to change it now and break compatibility for anyone using it currently, it works fine anyways.

<br>

### $$\color{#00ff45}{\text{📁 Installation}}$$

1. Download the [FullSizeAvatars.plugin.js](https://raw.githubusercontent.com/GentlePuppet/BetterDiscordPlugins/main/FullResAvatarHover/FullSizeAvatars.plugin.js) file.
2. Place it in your BetterDiscord plugins folder.
3. Enable the plugin in BetterDiscord’s plugin settings.
<hr>
</details>

<!-- ==================================================================== -->
<!-- ||                                                                || -->
<!-- ==================================================================== -->

# $$\color{#fff900}{\text{Loop Videos}}$$
<details>
  <summary>A BetterDiscord plugin that makes that any video you watch automatically loop, instead of ending.</summary>
  <br>
  A super simple BetterDiscord plugin that makes that any video you watch automatically loop. <br><br>Perfect for those short Discord videos (like memes or clips), to make them play continuously without needing to click "replay." <br><br>It just works.
  
### $$\color{#00ff45}{\text{📁 Installation}}$$
  
  1. Download the [LoopVideo.plugin.js](https://raw.githubusercontent.com/GentlePuppet/BetterDiscordPlugins/main/Loop%20Videos/LoopVideo.plugin.js) file.
  2. Place it in your BetterDiscord plugins folder.
  3. Enable the plugin in BetterDiscord’s plugin settings.
<hr>
</details>

<!-- ==================================================================== -->
<!-- ||                                                                || -->
<!-- ==================================================================== -->

# $$\color{#fff900}{\text{Quick Join Voice Channel}}$$
<details>
  <summary>A BetterDiscord plugin that creates a little floating moveable button that lets you instantly connect to a changeable voice channel.</summary>
<br>

  A super simple BetterDiscord plugin that creates a little floating button that lets you instantly connect to a voice channel.<br>
The button is hidden while connected to the channel.<br>
A number will be displayed on the button to show how many users are connected to the defined channel.<br>

<img width="245" height="117" alt="image" align="left" src="https://github.com/user-attachments/assets/8d1ea8af-0ea1-4ef4-b54a-b3eb58556c2a" />
<img width="151" height="69" alt="image" align="center" src="https://github.com/user-attachments/assets/042ad892-01c8-427a-9222-0410aaebf1c7" />
<br><br><br><br>
Left-Click to Join the Defined Channel<br>
Right-Click to Change the Defined Channel<br>
Hold to drag the button around<br><br>

<img width="352" height="207" alt="image" src="https://github.com/user-attachments/assets/5e8ef28f-2945-4faa-addf-6843691bc86c" />




### $$\color{#00ff45}{\text{📁 Installation}}$$

1. Download the [QuickJoinVoice.plugin.js](https://raw.githubusercontent.com/GentlePuppet/BetterDiscordPlugins/refs/heads/main/QuickJoinVoiceChannel/QuickJoinVoice.plugin.js) file.
2. Place it in your BetterDiscord plugins folder.
3. Enable the plugin in BetterDiscord’s plugin settings.
<hr>
</details>
