<p align="center">
  <img src="assets/banner.png?v=4" alt="Swarm Cosmetics for Google Antigravity" width="100%">
</p>

<p align="center">
  <a href="https://github.com/MihailBezukladnikovISiP201/antigravity-swarm-cosmetics/releases"><img src="https://img.shields.io/badge/version-1.2.0-blue.svg?style=flat-square" alt="Version"></a>
  <a href="LICENSE"><img src="https://img.shields.io/badge/license-MIT-green.svg?style=flat-square" alt="License"></a>
  <a href="https://antigravity.google"><img src="https://img.shields.io/badge/Antigravity-Plugin-orange.svg?style=flat-square" alt="Antigravity"></a>
  <img src="https://img.shields.io/badge/pixel--art-22x18%20sprites-yellow.svg?style=flat-square" alt="Pixel Art">
  <img src="https://img.shields.io/badge/roles-13%2B%20headgear-purple.svg?style=flat-square" alt="Roles">
  <img src="https://img.shields.io/badge/UI-Wardrobe%20Tab-emerald.svg?style=flat-square" alt="Wardrobe Tab">
</p>

<p align="center">
  <img src="assets/demo.gif?v=4" alt="Animated Pixel Headgear Preview" width="680">
</p>

---

## ⚡ Quick Start (1-Minute Test Drive)

Want to see custom pixel headgear in your Swarm Board right away? Clone and apply in a single command:

```bash
git clone https://github.com/MihailBezukladnikovISiP201/antigravity-swarm-cosmetics.git && cd antigravity-swarm-cosmetics && node scripts/patch.js apply
```

Open or reload your Antigravity Swarm Board auxiliary pane — your bees are now dressed!

---

## Overview

In **Google Antigravity's** native Swarm mode, agents collaborate on a shared message board and are represented visually as procedural 22×18 pixel-art bees buzzing between hexagonal task cells. Standard bees differentiate primarily by body hue.

**Swarm Cosmetics** transforms the Swarm Board by equipping each agent with distinct, hand-crafted pixel headgear and matching accessories tailored to its assigned role. Coordinators wear regal golden crowns, builders wear protective hard hats, verifiers wear academic mortarboards, researchers wear elegant top hats, listeners wear studio headsets, and stealth agents wear crimson ninja masks.

Headgear is rendered deterministically directly inside the HTML5 canvas pipeline of the Swarm board (`hive.js`) with zero external sprite sheet dependencies and zero runtime overhead.

---

## 👗 The Wardrobe UI Tab

Milestone v1.2 introduces the **Wardrobe** tab directly embedded into the native Swarm Board auxiliary pane:

<p align="center">
  <img src="assets/swarm-preview.png?v=4" alt="Antigravity Swarm Board UI with Wardrobe Tab" width="100%">
</p>

### Key Wardrobe Features:
- **8x Zoomed Live Bee Canvas:** An interactive preview canvas (`176×144 px`) displaying your chosen bee in pixel-perfect magnification.
- **Flight & Posture Controls:** Toggle between **Flight** (animated 2-frame wing flapping loop), **Landed**, and **Asleep** ($Zzz$) states in real time.
- **Interactive Hat Fitting Grid:** Click any card in the 14-item headgear catalog to instantly preview and fit that hat on the bee.
- **Active Swarm Bee Dresser:** A live dropdown selector synchronized with `window.SwarmSnapshot.members`, allowing you to inspect and dress active agents currently working in your swarm.

---

## Role Headgear Catalog

<p align="center">
  <img src="assets/roles-showcase.png?v=4" alt="Role Headgear Catalog" width="100%">
</p>

| Role | Name Pattern Matchers | Headgear | Purpose & Responsibilities |
|---|---|---|---|
| **Coordinator** | `coordinator` | 👑 Golden Crown with Ruby | Queen bee / lead agent coordinating parallel execution |
| **Builder / Dev** | `builder`, `author`, `dev`, `code`, `parser`, `impl`, `fix`, `patch`, `engineer` | ⛑️ Yellow Hard Hat | Authors writing code, implementing patches & features |
| **Verifier / QA** | `verifier`, `review`, `qa`, `test`, `audit`, `lint`, `check` | 🎓 Academic Mortarboard | Test runners, diff review, code verification |
| **Researcher** | `research`, `scout`, `investig`, `search`, `doc`, `read`, `explore`, `analyst` | 🎩 Top Hat with Red Ribbon | Repository mapping, reading documentation, dependency analysis |
| **Narrator** | `narrator`, `story`, `scribe`, `log`, `write`, `history` | ✒️ Plum Beret with Quill | System agent documenting high-level timeline & overview |
| **Monitor** | `monitor`, `guard`, `watch`, `stall`, `dispatch`, `ping` | 👮 Officer Peaked Cap | Anti-stall watchdog and swarm activity monitor |
| **Wizard / AI** | `wizard`, `magic`, `ai`, `model`, `prompt`, `llm`, `synth`, `brain` | 🧙 Pointed Wizard Hat | Prompt engineering, model tuning, LLM synthesis |
| **Pirate / Security** | `pirate`, `sec`, `security`, `hack`, `pentest`, `redteam`, `exploit` | 🏴‍☠️ Pirate Tricorn & Eyepatch | Security audits, vulnerability checks, penetration testing |
| **Chef / Data** | `chef`, `cook`, `data`, `pipeline`, `etl`, `feed`, `clean`, `prep` | 🧑‍🍳 Puffed Chef Toque | Data engineering, ETL pipelines, dataset curation |
| **Viking / Stress** | `viking`, `stress`, `bench`, `perf`, `load`, `speed`, `opt`, `heavy` | 🛡️ Horned Viking Helmet | Stress testing, benchmarking, load testing & profiling |
| **Audio / Listener** *(New in v1.2)* | `headphones`, `listen`, `audio`, `music`, `sound` | 🎧 Studio Headset | Audio review, voice input stream, acoustic inspection |
| **Telemetry / Debug** *(New in v1.2)* | `goggles`, `visor`, `scanner`, `telemetry`, `trace`, `debug`, `inspect` | 🥽 Cyber Visor | Telemetry metrics, trace analyzers, real-time log scanners |
| **Stealth / Security** *(New in v1.2)* | `ninja`, `stealth`, `shadow`, `silent`, `crypto`, `mask`, `bandana` | 🥷 Crimson Ninja Mask | Confidential computing, zero-knowledge proofs, crypto audits |
| *(Default)* | Any other unassigned name | 📡 Natural Antennae | Standard general-purpose parallel workers |

---

## ⚙️ Custom Configuration System (`cosmetics.config.json`)

Want custom role mappings without renaming your agents? Swarm Cosmetics supports configuration overrides via `cosmetics.config.json` in the plugin root or `~/.gemini/config/cosmetics.config.json`.

### Config Format:
```json
{
  "overrides": {
    "lead": "crown",
    "infra-.*": "hardhat",
    "security-.*": "pirate",
    "telemetry-agent": "goggles"
  }
}
```

### Precedence Order:
1. **Queen / Coordinator:** Always wears the crown.
2. **Exact Matches:** Evaluated first (`n === "lead"`).
3. **Regex Patterns:** Evaluated second (`new RegExp("^infra-.*").test(n)`).
4. **Default Role Matchers:** Fall back to the built-in catalog regexes.

### CLI Config Management:
Manage overrides directly from your terminal:

```bash
# Display active configuration overrides
node scripts/patch.js config show

# Add or update an override rule (automatically re-applies patch)
node scripts/patch.js config set "infra-.*" "hardhat"
node scripts/patch.js config set "my-bot" "headphones"
```

---

## 💻 Cross-Platform Installation

### Option 1: As an Antigravity Plugin (Recommended)

Clone this repository into your Antigravity plugins directory:

#### Windows (PowerShell):
```powershell
git clone https://github.com/MihailBezukladnikovISiP201/antigravity-swarm-cosmetics.git "$HOME\.gemini\config\plugins\swarm-cosmetics"
node "$HOME\.gemini\config\plugins\swarm-cosmetics\scripts\patch.js" apply
```

#### macOS / Linux (Bash):
```bash
git clone https://github.com/MihailBezukladnikovISiP201/antigravity-swarm-cosmetics.git "$HOME/.gemini/config/plugins/swarm-cosmetics"
node "$HOME/.gemini/config/plugins/swarm-cosmetics/scripts/patch.js" apply
```

The plugin automatically registers with Antigravity and persists across sessions via `hooks.json`.

---

### Option 2: Standalone CLI Usage

Run the patcher script directly in any terminal:

```bash
# Check current patch status
node scripts/patch.js status

# Apply / update headgear and wardrobe UI
node scripts/patch.js apply

# Restore original unpatched files from backup
node scripts/patch.js restore
```

---

## 🛠️ Troubleshooting

### 1. Hats or Wardrobe tab not appearing after `patch.js apply`
- **Cache Invalidation:** The patcher automatically injects timestamped cache-busters (`/hive.js?v=cosmetics_...` and `/hive.css?v=cosmetics_...`). If your IDE sidecar pane still shows the old version, reload the pane using `Ctrl+R` (Windows/Linux) or `Cmd+R` (macOS).
- **Verify Status:** Run `node scripts/patch.js status`. Ensure all checkmarks (`hive.js patched`, `wardrobe tab`, `wardrobe controller`, `wardrobe styles`) report `✓ YES`.

### 2. How to restore original unmodified files?
Run:
```bash
node scripts/patch.js restore
```
This restores `hive.js`, `index.html`, and `hive.css` from the automated `.original.bak` backups created during initial installation.

### 3. Hook execution & protojson compatibility
- Swarm Cosmetics includes `scripts/hook.js` conforming to the Google Antigravity hook protocol.
- It returns valid protojson (`{}` for `SessionStart`, `{"decision": "allow"}` for `PreToolUse`) to stdout while redirecting internal patcher logs to stderr, avoiding protojson unmarshal errors.

---

## Repository Structure

```text
antigravity-swarm-cosmetics/
├── assets/
│   ├── banner.png           # Hero banner with v1.2 headgear
│   ├── demo.gif             # 6-frame animated flight preview loop
│   ├── logo.svg             # Plugin icon
│   ├── roles-showcase.png   # Full 14-card visual headgear catalog
│   └── swarm-preview.png    # Simulated Swarm UI screenshot with Wardrobe tab
├── scripts/
│   ├── generate_all_assets.py # Asset generator script (Pillow)
│   ├── hook.js              # Hook protocol adapter (silent protojson)
│   └── patch.js             # Core patcher CLI & Wardrobe injector
├── skills/
│   └── swarm-cosmetics/
│       └── SKILL.md         # Customization skill for Antigravity agents
├── cosmetics.config.json    # User & plugin override configuration
├── hooks.json               # Startup & PreToolUse lifecycle hooks
├── plugin.json              # Antigravity plugin manifest (v1.2.0)
└── README.md
```

---

## License

Released under the [MIT License](LICENSE).
