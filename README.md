# Swarm Cosmetics (Bee Hats) for Google Antigravity

Procedural pixel-art headgear for agent bees in Google Antigravity Swarm mode.

## Overview

In Google Antigravity's native Swarm mode, agent bees are procedural 22x18 pixel-art sprites that differentiate primarily by hue. This plugin enhances the Swarm UI by rendering custom role-tailored pixel hats onto worker bees.

It includes automated lifecycle hooks (`hooks.json`) so modifications persist across application updates and restarts.

## Role Headgear Catalog

| Role | Name Matchers | Headgear | Purpose |
|---|---|---|---|
| **Coordinator** | `coordinator` | 👑 Golden Crown with Ruby | Queen bee / lead agent |
| **Builder / Dev** | `builder`, `author`, `dev`, `code`, `parser`, `impl`, `fix`, `patch`, `engineer` | ⛑️ Yellow Hard Hat | Authors writing code and implementations |
| **Verifier / QA** | `verifier`, `review`, `qa`, `test`, `audit`, `lint`, `check` | 🎓 Academic Mortarboard | Test runners, diff review, code verification |
| **Researcher** | `research`, `scout`, `investig`, `search`, `doc`, `read`, `explore`, `analyst` | 🎩 Top Hat with Red Ribbon | Repository mapping, reading documentation |
| **Narrator** | `narrator`, `story`, `scribe`, `log`, `write`, `history` | 🪶 Plum Beret with Quill | System overview and timeline narrator |
| **Monitor** | `monitor`, `guard`, `watch`, `stall`, `dispatch`, `ping` | 👮 Officer Peaked Cap | Stall monitor and stall breaker |
| **Wizard / AI** | `wizard`, `magic`, `ai`, `model`, `prompt`, `llm`, `synth`, `brain` | 🧙 Pointed Wizard Hat | Prompt engineering, model tuning |
| **Pirate / Security** | `pirate`, `sec`, `security`, `hack`, `pentest`, `redteam`, `exploit` | 🏴‍☠️ Pirate Tricorn & Eyepatch | Security audits, vulnerability checks |
| **Chef / Data** | `chef`, `cook`, `data`, `pipeline`, `etl`, `feed`, `clean`, `prep` | 🧑‍🍳 Puffed Chef Toque | Data engineering, ETL, dataset curation |
| **Viking / Stress** | `viking`, `stress`, `bench`, `perf`, `load`, `speed`, `opt`, `heavy` | 🛡️ Horned Viking Helmet | Stress testing, benchmarking, profiling |
| *(Default)* | Any other name | 📡 Natural Antennae | Standard worker bees |

## Installation

### Option 1: As an Antigravity Plugin

Clone or copy this directory into your Antigravity plugins directory:

```bash
# Windows PowerShell
git clone https://github.com/MihailBezukladnikovISiP201/antigravity-swarm-cosmetics.git "$HOME\.gemini\config\plugins\swarm-cosmetics"
```

### Option 2: Standalone Script Usage

You can also run the CLI script directly using Node.js:

```bash
# Check status
node scripts/patch.js status

# Apply / update hats
node scripts/patch.js apply

# Restore original unpatched files
node scripts/patch.js restore
```
