<p align="center">
  <img src="assets/banner.png?v=3" alt="Swarm Cosmetics for Google Antigravity" width="100%">
</p>

<p align="center">
  <a href="https://github.com/MihailBezukladnikovISiP201/antigravity-swarm-cosmetics/releases"><img src="https://img.shields.io/badge/version-1.1.0-blue.svg?style=flat-square" alt="Version"></a>
  <a href="LICENSE"><img src="https://img.shields.io/badge/license-MIT-green.svg?style=flat-square" alt="License"></a>
  <a href="https://antigravity.google"><img src="https://img.shields.io/badge/Antigravity-Plugin-orange.svg?style=flat-square" alt="Antigravity"></a>
  <img src="https://img.shields.io/badge/pixel--art-22x18%20sprites-yellow.svg?style=flat-square" alt="Pixel Art">
  <img src="https://img.shields.io/badge/roles-10%2B%20headgear-purple.svg?style=flat-square" alt="Roles">
</p>

<p align="center">
  <img src="assets/demo.gif?v=3" alt="Animated Pixel Headgear Preview" width="640">
</p>

---

## Overview

In **Google Antigravity's** native Swarm mode, agents collaborate on a shared message board and are represented visually as procedural 22×18 pixel-art bees buzzing between hexagonal task cells. Standard bees differentiate primarily by body hue.

**Swarm Cosmetics** transforms the Swarm Board by giving each agent role distinct, hand-crafted pixel headgear and matching accessories. Coordinators wear regal crowns, builders wear protective hard hats, verifiers wear academic mortarboards, researchers wear elegant top hats, and wizards wear star-studded pointed hats.

Headgear is rendered deterministically directly inside the HTML5 canvas pipeline of the Swarm board with zero performance impact.

---

## Swarm UI in Action

<p align="center">
  <img src="assets/swarm-preview.png?v=3" alt="Antigravity Swarm Board UI with Custom Headgear" width="100%">
</p>

---

## Role Headgear Catalog

<p align="center">
  <img src="assets/roles-showcase.png?v=3" alt="Role Headgear Catalog" width="100%">
</p>

| Role | Name Pattern Matchers | Headgear | Purpose & Responsibilities |
|---|---|---|---|
| **Coordinator** | `coordinator` | 👑 Golden Crown with Ruby | Queen bee / lead agent coordinating parallel execution |
| **Builder / Dev** | `builder`, `author`, `dev`, `code`, `parser`, `impl`, `fix`, `patch`, `engineer` | ⛑️ Yellow Hard Hat | Authors writing code, implementing patches & features |
| **Verifier / QA** | `verifier`, `review`, `qa`, `test`, `audit`, `lint`, `check` | 🎓 Academic Mortarboard | Test runners, diff review, code verification |
| **Researcher** | `research`, `scout`, `investig`, `search`, `doc`, `read`, `explore`, `analyst` | 🎩 Top Hat with Red Ribbon | Repository mapping, reading documentation, dependency analysis |
| **Narrator** | `narrator`, `story`, `scribe`, `log`, `write`, `history` | 🪶 Plum Beret with Quill | System agent documenting high-level timeline & overview |
| **Monitor** | `monitor`, `guard`, `watch`, `stall`, `dispatch`, `ping` | 👮 Officer Peaked Cap | Anti-stall watchdog and swarm activity monitor |
| **Wizard / AI** | `wizard`, `magic`, `ai`, `model`, `prompt`, `llm`, `synth`, `brain` | 🧙 Pointed Wizard Hat | Prompt engineering, model tuning, LLM synthesis |
| **Pirate / Security** | `pirate`, `sec`, `security`, `hack`, `pentest`, `redteam`, `exploit` | 🏴‍☠️ Pirate Tricorn & Eyepatch | Security audits, vulnerability checks, penetration testing |
| **Chef / Data** | `chef`, `cook`, `data`, `pipeline`, `etl`, `feed`, `clean`, `prep` | 🧑‍🍳 Puffed Chef Toque | Data engineering, ETL pipelines, dataset curation |
| **Viking / Stress** | `viking`, `stress`, `bench`, `perf`, `load`, `speed`, `opt`, `heavy` | 🛡️ Horned Viking Helmet | Stress testing, benchmarking, load testing & profiling |
| *(Default)* | Any other unassigned name | 📡 Natural Antennae | Standard worker bees |

---

## Key Features

- 🎨 **Authentic Pixel Art:** Every hat is modeled directly in the 22×18 sprite matrix to match the native Antigravity aesthetic.
- ⚡ **Zero Performance Overhead:** Injected into `drawBee` in `hive.js` as procedural pixel operations, avoiding external sprite sheet loading.
- 🌓 **Theme-Aware Lighting:** Integrated into the sprite's dynamic lighting calculations ($L = [-0.42, -0.62, 0.66]$), blending naturally in both dark and light modes.
- 🔄 **Hook Persistence:** Automatically hooks into Antigravity session startup (`hooks.json`) so your hats persist across IDE restarts and updates.
- 🛡️ **Safe & Reversible:** Creates `.original.bak` backups before modifying files and supports full restoration with one command.

---

## Installation

### Option 1: As an Antigravity Plugin (Recommended)

Clone this repository directly into your Antigravity plugins directory:

```bash
# Windows PowerShell
git clone https://github.com/MihailBezukladnikovISiP201/antigravity-swarm-cosmetics.git "$HOME\.gemini\config\plugins\swarm-cosmetics"
```

The plugin automatically registers with Antigravity and applies the hats on startup via `hooks.json`.

### Option 2: Standalone CLI Usage

You can also run the patcher script directly using Node.js:

```bash
# Check current patch status
node scripts/patch.js status

# Apply / update headgear
node scripts/patch.js apply

# Restore original unpatched files
node scripts/patch.js restore
```

---

## Repository Structure

```text
antigravity-swarm-cosmetics/
├── assets/
│   ├── banner.png           # Hero banner for GitHub
│   ├── demo.gif             # Animated flight preview
│   ├── logo.svg             # Plugin icon
│   ├── roles-showcase.png   # Full visual role & headgear catalog
│   └── swarm-preview.png    # Simulated Swarm UI screenshot
├── scripts/
│   ├── generate_all_assets.py # Asset generator script (Pillow)
│   └── patch.js             # Core patcher CLI
├── skills/
│   └── swarm-cosmetics/
│       └── SKILL.md         # Customization skill for Antigravity agents
├── hooks.json               # Startup lifecycle hooks
├── plugin.json              # Antigravity plugin manifest
└── README.md
```

---

## License

Released under the [MIT License](LICENSE).
