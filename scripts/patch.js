#!/usr/bin/env node
/**
 * Antigravity Swarm Cosmetics Patcher
 * Injects custom procedural pixel-art hats for Swarm bees into hive.js
 * and configures cache-busting in index.html.
 *
 * Repository: https://github.com/MihailBezukladnikovISiP201/antigravity-swarm-cosmetics
 * License: MIT
 */

const fs = require('fs');
const path = require('path');
const os = require('os');

// Parse flags and arguments
const rawArgs = process.argv.slice(2);
const isSilent = rawArgs.includes('--silent');
const isHook = rawArgs.includes('--hook') || isSilent;
const args = rawArgs.filter(a => !a.startsWith('--'));

function log(msg) {
  if (isSilent) {
    process.stderr.write(msg + '\n');
  } else {
    console.log(msg);
  }
}

// Config resolution paths
const PLUGIN_CONFIG_PATH = path.resolve(__dirname, '..', 'cosmetics.config.json');
const USER_CONFIG_PATH = path.join(os.homedir(), '.gemini', 'config', 'cosmetics.config.json');

function resolveConfigPath() {
  if (fs.existsSync(PLUGIN_CONFIG_PATH)) {
    return PLUGIN_CONFIG_PATH;
  }
  if (fs.existsSync(USER_CONFIG_PATH)) {
    return USER_CONFIG_PATH;
  }
  return null;
}

function getWritableConfigPath() {
  const existing = resolveConfigPath();
  if (existing) return existing;
  return PLUGIN_CONFIG_PATH;
}

function loadConfig() {
  const cfgPath = resolveConfigPath();
  if (!cfgPath) {
    return { config: { overrides: {} }, path: null };
  }
  try {
    const raw = fs.readFileSync(cfgPath, 'utf8');
    const parsed = JSON.parse(raw);
    if (parsed && typeof parsed.overrides === 'object' && parsed.overrides !== null) {
      return { config: parsed, path: cfgPath };
    }
    return { config: { overrides: {} }, path: cfgPath };
  } catch (err) {
    log(`[!] Warning: Failed to parse config at ${cfgPath}: ${err.message}`);
    return { config: { overrides: {} }, path: cfgPath };
  }
}

const REGEX_SPECIAL_CHARS = /[*+?^${}()|[\]\\]/;

function isRegexKey(key) {
  if (typeof key !== 'string') return false;
  return REGEX_SPECIAL_CHARS.test(key) || (key.startsWith('/') && key.endsWith('/'));
}

function generateHatFunction(overrides = {}) {
  const exact = {};
  const regexes = [];

  for (const [key, val] of Object.entries(overrides)) {
    const k = String(key).trim();
    const v = String(val).trim();
    if (!k || !v) continue;

    if (isRegexKey(k)) {
      let pat = k;
      if (pat.startsWith('/') && pat.lastIndexOf('/') > 0) {
        pat = pat.slice(1, pat.lastIndexOf('/'));
      }
      regexes.push({ pattern: pat, hat: v });
    } else {
      exact[k.toLowerCase()] = v;
    }
  }

  const lines = [];
  lines.push(`    const hat = (typeof hatOverride !== 'undefined' && hatOverride) ? hatOverride : (function(n){`);
  lines.push(`      n = String(n).toLowerCase();`);
  lines.push(`      if(queen || n==='coordinator') return 'crown';`);

  const exactKeys = Object.keys(exact);
  if (exactKeys.length > 0) {
    lines.push(`      // Custom config overrides: exact matches first`);
    for (const k of exactKeys) {
      lines.push(`      if(n === ${JSON.stringify(k)}) return ${JSON.stringify(exact[k])};`);
    }
  }

  if (regexes.length > 0) {
    lines.push(`      // Custom config overrides: regex pattern matches`);
    for (const r of regexes) {
      lines.push(`      try { if(new RegExp(${JSON.stringify(r.pattern)}).test(n)) return ${JSON.stringify(r.hat)}; } catch(e){}`);
    }
  }

  lines.push(`      // Default role-based headgear (fall back to defaults)`);
  lines.push(`      if(/verifier|review|qa|test|audit|lint|check/.test(n)) return 'mortarboard';`);
  lines.push(`      if(/builder|author|dev|code|parser|impl|fix|patch|engineer/.test(n)) return 'hardhat';`);
  lines.push(`      if(/research|scout|investig|search|doc|read|explore|analyst/.test(n)) return 'tophat';`);
  lines.push(`      if(/narrator|story|scribe|log|write|history/.test(n)) return 'beret';`);
  lines.push(`      if(/monitor|guard|watch|stall|dispatch|ping/.test(n)) return 'police';`);
  lines.push(`      if(/wizard|magic|ai|model|prompt|llm|synth|brain/.test(n)) return 'wizard';`);
  lines.push(`      if(/pirate|sec|security|hack|pentest|redteam|exploit/.test(n)) return 'pirate';`);
  lines.push(`      if(/chef|cook|data|pipeline|etl|feed|clean|prep/.test(n)) return 'chef';`);
  lines.push(`      if(/viking|stress|bench|perf|load|speed|opt|heavy/.test(n)) return 'viking';`);
  lines.push(`      if(/headphones|listen|audio|music|sound/.test(n)) return 'headphones';`);
  lines.push(`      if(/goggles|visor|scanner|telemetry|trace|debug|inspect/.test(n)) return 'goggles';`);
  lines.push(`      if(/ninja|stealth|shadow|silent|crypto|mask|bandana/.test(n)) return 'bandana';`);
  lines.push(`      return 'default';`);
  lines.push(`    })(name);`);

  return lines.join('\n');
}

const SWARM_DIR = path.join(
  os.homedir(),
  '.gemini',
  'antigravity',
  'builtin',
  'plugins',
  'swarm',
  'sidecars',
  'swarm_board'
);

const HIVE_PATH = path.join(SWARM_DIR, 'hive.js');
const INDEX_PATH = path.join(SWARM_DIR, 'index.html');
const BACKUP_HIVE = HIVE_PATH + '.original.bak';
const BACKUP_INDEX = INDEX_PATH + '.original.bak';
const HIVE_CSS_PATH = path.join(SWARM_DIR, 'hive.css');
const BACKUP_HIVE_CSS = HIVE_CSS_PATH + '.original.bak';

const WARDROBE_TAB_BUTTON = '        <button type="button" role="tab" id="tabbtn-wardrobe" aria-controls="tab-wardrobe" class="tab" data-tab="wardrobe">Wardrobe</button>';

const WARDROBE_SECTION_HEADER = '<!-- SWARM_WARDROBE_SECTION_START -->';
const WARDROBE_SECTION_FOOTER = '<!-- SWARM_WARDROBE_SECTION_END -->';

const WARDROBE_SECTION_CODE = `      ${WARDROBE_SECTION_HEADER}
      <!-- Wardrobe -->
      <section id="tab-wardrobe" class="tab-body hidden" role="tabpanel" aria-labelledby="tabbtn-wardrobe" data-testid="swarm-wardrobe">
        <div class="wardrobe-wrap">
          <div class="wardrobe-toolbar">
            <div class="wardrobe-title-group">
              <h2 class="wardrobe-title">Bee Wardrobe &amp; Fitting Room</h2>
              <span class="wardrobe-desc">Live preview and custom headgear for swarm agents</span>
            </div>
            <div class="wardrobe-dresser">
              <label for="wardrobe-bee-select" class="wardrobe-select-label">Active Bee:</label>
              <div class="select">
                <select id="wardrobe-bee-select" aria-label="Select bee to dress">
                  <option value="coordinator">coordinator (Queen)</option>
                </select>
              </div>
            </div>
          </div>

          <div class="wardrobe-grid-layout">
            <div class="wardrobe-preview-col">
              <div class="wardrobe-card wardrobe-preview-box">
                <div class="wardrobe-card-header">
                  <span id="wardrobe-badge-bee" class="wardrobe-chip bee-chip">coordinator</span>
                  <span id="wardrobe-badge-hat" class="wardrobe-chip hat-chip">Crown</span>
                </div>
                <div class="wardrobe-canvas-container">
                  <canvas id="wardrobe-preview-canvas" width="176" height="144" aria-label="Wardrobe preview bee"></canvas>
                </div>
                <div class="wardrobe-state-toggles" role="group" aria-label="Bee animation state">
                  <button type="button" class="wardrobe-state-btn active" data-state="flight" title="Flight animation">
                    <span class="state-dot" aria-hidden="true"></span>Flight
                  </button>
                  <button type="button" class="wardrobe-state-btn" data-state="landed" title="Landed still bee">
                    <span class="state-dot" aria-hidden="true"></span>Landed
                  </button>
                  <button type="button" class="wardrobe-state-btn" data-state="asleep" title="Asleep bee with Zzz">
                    <span class="state-dot" aria-hidden="true"></span>Asleep
                  </button>
                </div>
              </div>
            </div>

            <div class="wardrobe-catalog-col">
              <div class="wardrobe-card wardrobe-catalog-box">
                <div class="wardrobe-card-header">
                  <h3 class="wardrobe-subtitle">Headgear Catalog</h3>
                  <span class="wardrobe-count-pill" id="wardrobe-hat-count">14 Styles</span>
                </div>
                <div id="wardrobe-hat-grid" class="wardrobe-hat-grid" role="listbox" aria-label="Available hats">
                  <!-- Generated by Wardrobe Controller -->
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
      ${WARDROBE_SECTION_FOOTER}`;

const WARDROBE_CSS_HEADER = '/* SWARM_WARDROBE_CSS_START */';
const WARDROBE_CSS_FOOTER = '/* SWARM_WARDROBE_CSS_END */';

const WARDROBE_CSS_CODE = `${WARDROBE_CSS_HEADER}
/* Antigravity Swarm Cosmetics - Wardrobe UI Dual Theme (Light & Dark) */
:root {
  --wb-card: var(--sw-card, #ffffff);
  --wb-card-border: var(--sw-card-border, rgba(0, 0, 0, 0.08));
  --wb-inner: var(--sw-field, #f4f5f8);
  --wb-inner-border: var(--sw-border, rgba(0, 0, 0, 0.08));
  --wb-fg: var(--sw-fg, #1d1f21);
  --wb-fg-muted: var(--sw-fg-muted, #5d676f);
  --wb-hover-bg: color-mix(in srgb, var(--sw-fg, #000) 4%, var(--wb-card, #fff));
  --wb-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
  --wb-canvas-bg: var(--sw-muted, #eff1f5);
  --wb-canvas-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  --wb-accent: #B45309;
  --wb-accent-active: #D97706;
  --wb-accent-bg: rgba(217, 119, 6, 0.12);
  --wb-accent-border: rgba(217, 119, 6, 0.35);
}

:root[data-theme="dark"],
body[data-theme="dark"],
.theme-dark {
  --wb-card: #161822;
  --wb-card-border: #25293A;
  --wb-inner: #0E1017;
  --wb-inner-border: #25293A;
  --wb-fg: #FFFFFF;
  --wb-fg-muted: #8C90A6;
  --wb-hover-bg: #181B28;
  --wb-shadow: 0 4px 12px rgba(0, 0, 0, 0.25);
  --wb-canvas-bg: #0E1017;
  --wb-canvas-shadow: 0 6px 14px rgba(0, 0, 0, 0.5);
  --wb-accent: #FFC72C;
  --wb-accent-active: #FFC72C;
  --wb-accent-bg: rgba(255, 199, 44, 0.15);
  --wb-accent-border: rgba(255, 199, 44, 0.4);
}

@media (prefers-color-scheme: dark) {
  :root:not([data-theme="light"]):not(.theme-light) {
    --wb-card: #161822;
    --wb-card-border: #25293A;
    --wb-inner: #0E1017;
    --wb-inner-border: #25293A;
    --wb-fg: #FFFFFF;
    --wb-fg-muted: #8C90A6;
    --wb-hover-bg: #181B28;
    --wb-shadow: 0 4px 12px rgba(0, 0, 0, 0.25);
    --wb-canvas-bg: #0E1017;
    --wb-canvas-shadow: 0 6px 14px rgba(0, 0, 0, 0.5);
    --wb-accent: #FFC72C;
    --wb-accent-active: #FFC72C;
    --wb-accent-bg: rgba(255, 199, 44, 0.15);
    --wb-accent-border: rgba(255, 199, 44, 0.4);
  }
}

#tab-wardrobe.active {
  display: block !important;
  animation: fade-in 0.16s ease-out;
}
.wardrobe-wrap {
  display: flex;
  flex-direction: column;
  gap: 16px;
  max-width: 960px;
  margin: 0 auto;
}
.wardrobe-toolbar {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  padding: 14px 18px;
  background: var(--wb-card);
  border: 1px solid var(--wb-card-border);
  border-radius: 10px;
  box-shadow: var(--wb-shadow);
  transition: background 0.15s ease, border-color 0.15s ease;
}
.wardrobe-title-group {
  display: flex;
  flex-direction: column;
  gap: 2px;
}
.wardrobe-title {
  margin: 0;
  font-size: 16px;
  font-weight: 600;
  color: var(--wb-fg);
  letter-spacing: -0.01em;
}
.wardrobe-desc {
  font-size: 12px;
  color: var(--wb-fg-muted);
}
.wardrobe-dresser {
  display: flex;
  align-items: center;
  gap: 10px;
}
.wardrobe-select-label {
  font-size: 13px;
  font-weight: 500;
  color: var(--wb-fg-muted);
}
.wardrobe-dresser select {
  background: var(--wb-inner);
  color: var(--wb-fg);
  border: 1px solid var(--wb-inner-border);
  border-radius: 6px;
  padding: 6px 28px 6px 10px;
  font-size: 13px;
  font-weight: 500;
  cursor: pointer;
  outline: none;
  transition: border-color 0.15s ease, background 0.15s ease;
}
.wardrobe-dresser select:hover,
.wardrobe-dresser select:focus {
  border-color: var(--wb-accent);
}
.wardrobe-grid-layout {
  display: flex;
  flex-wrap: wrap;
  gap: 16px;
}
.wardrobe-preview-col {
  flex: 0 0 280px;
  min-width: 260px;
}
.wardrobe-catalog-col {
  flex: 1 1 480px;
  min-width: 300px;
}
.wardrobe-card {
  background: var(--wb-card);
  border: 1px solid var(--wb-card-border);
  border-radius: 10px;
  padding: 16px;
  display: flex;
  flex-direction: column;
  box-shadow: var(--wb-shadow);
  transition: background 0.15s ease, border-color 0.15s ease;
}
.wardrobe-card-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 14px;
  min-height: 26px;
}
.wardrobe-subtitle {
  margin: 0;
  font-size: 14px;
  font-weight: 600;
  color: var(--wb-fg);
}
.wardrobe-chip {
  display: inline-flex;
  align-items: center;
  padding: 3px 8px;
  border-radius: 999px;
  font-size: 11px;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.04em;
}
.wardrobe-chip.bee-chip {
  background: var(--wb-accent-bg);
  color: var(--wb-accent);
  border: 1px solid var(--wb-accent-border);
}
.wardrobe-chip.hat-chip {
  background: var(--wb-inner);
  color: var(--wb-fg);
  border: 1px solid var(--wb-inner-border);
}
.wardrobe-count-pill {
  font-size: 11px;
  font-weight: 600;
  color: var(--wb-accent);
  background: var(--wb-accent-bg);
  padding: 2px 8px;
  border-radius: 999px;
  border: 1px solid var(--wb-accent-border);
}
.wardrobe-canvas-container {
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--wb-canvas-bg);
  border: 1px solid var(--wb-inner-border);
  border-radius: 8px;
  padding: 20px 10px;
  margin-bottom: 14px;
  transition: background 0.15s ease;
}
#wardrobe-preview-canvas {
  width: 176px;
  height: 144px;
  image-rendering: pixelated;
  image-rendering: crisp-edges;
  filter: drop-shadow(var(--wb-canvas-shadow));
}
.wardrobe-state-toggles {
  display: flex;
  gap: 8px;
  justify-content: center;
}
.wardrobe-state-btn {
  all: unset;
  box-sizing: border-box;
  flex: 1;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  height: 32px;
  padding: 0 10px;
  border-radius: 6px;
  font-size: 12px;
  font-weight: 500;
  color: var(--wb-fg-muted);
  background: var(--wb-inner);
  border: 1px solid var(--wb-inner-border);
  cursor: pointer;
  transition: all 0.15s ease;
}
.wardrobe-state-btn .state-dot {
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: color-mix(in srgb, var(--wb-fg-muted) 60%, transparent);
  transition: background-color 0.15s ease;
}
.wardrobe-state-btn:hover {
  color: var(--wb-fg);
  border-color: var(--wb-card-border);
  background: var(--wb-hover-bg);
}
.wardrobe-state-btn.active {
  color: var(--wb-accent);
  background: var(--wb-accent-bg);
  border-color: var(--wb-accent);
  box-shadow: 0 0 8px var(--wb-accent-bg);
}
.wardrobe-state-btn.active .state-dot {
  background: var(--wb-accent);
  box-shadow: 0 0 6px var(--wb-accent);
}
.wardrobe-hat-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(130px, 1fr));
  gap: 10px;
  max-height: 440px;
  overflow-y: auto;
  padding-right: 4px;
}
.wardrobe-hat-card {
  all: unset;
  box-sizing: border-box;
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  background: var(--wb-inner);
  border: 1px solid var(--wb-inner-border);
  border-radius: 8px;
  padding: 10px 8px;
  cursor: pointer;
  transition: all 0.15s ease;
  position: relative;
}
.wardrobe-hat-card:hover {
  background: var(--wb-hover-bg);
  border-color: var(--wb-card-border);
  transform: translateY(-1px);
}
.wardrobe-hat-card.active {
  background: var(--wb-accent-bg);
  border-color: var(--wb-accent);
  box-shadow: 0 0 0 1px var(--wb-accent), 0 3px 8px var(--wb-accent-bg);
}
.wardrobe-card-canvas-wrap {
  width: 44px;
  height: 36px;
  margin-bottom: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
}
.wardrobe-hat-card canvas {
  width: 44px;
  height: 36px;
  image-rendering: pixelated;
  image-rendering: crisp-edges;
}
.wardrobe-hat-name {
  font-size: 12px;
  font-weight: 600;
  color: var(--wb-fg);
  margin-bottom: 2px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  max-width: 100%;
}
.wardrobe-hat-role {
  font-size: 10px;
  color: var(--wb-fg-muted);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  max-width: 100%;
}
.wardrobe-hat-card.active .wardrobe-hat-name {
  color: var(--wb-accent);
}
${WARDROBE_CSS_FOOTER}`;

const WARDROBE_CONTROLLER_HEADER = '/* SWARM_WARDROBE_CONTROLLER_START */';
const WARDROBE_CONTROLLER_FOOTER = '/* SWARM_WARDROBE_CONTROLLER_END */';

const WARDROBE_CONTROLLER_CODE = `${WARDROBE_CONTROLLER_HEADER}
  // Wardrobe UI Controller (Antigravity Swarm Cosmetics)
  const HAT_CATALOG = [
    { id: 'crown', name: 'Crown', role: 'Queen / Coordinator' },
    { id: 'hardhat', name: 'Hardhat', role: 'Builder / Engineer' },
    { id: 'mortarboard', name: 'Mortarboard', role: 'Verifier / QA / Lint' },
    { id: 'tophat', name: 'Tophat', role: 'Research / Scout' },
    { id: 'beret', name: 'Beret', role: 'Narrator / Scribe' },
    { id: 'police', name: 'Police', role: 'Monitor / Guard' },
    { id: 'wizard', name: 'Wizard', role: 'AI / Model / Prompt' },
    { id: 'pirate', name: 'Pirate', role: 'Security / Redteam' },
    { id: 'chef', name: 'Chef', role: 'Pipeline / ETL / Prep' },
    { id: 'viking', name: 'Viking', role: 'Stress / Perf / Opt' },
    { id: 'headphones', name: 'Headphones', role: 'Studio Headset / Audio' },
    { id: 'goggles', name: 'Goggles', role: 'Cyber Visor / Debug' },
    { id: 'bandana', name: 'Bandana', role: 'Ninja / Stealth' },
    { id: 'default', name: 'Default', role: 'Classic Antennae' }
  ];

  const wardrobe = {
    activeBee: 'coordinator',
    activeHat: 'crown',
    animState: 'flight',
    frame: 0,
    timer: null,
    initialized: false
  };

  function updateWardrobePreview() {
    const canvas = document.getElementById('wardrobe-preview-canvas');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    ctx.imageSmoothingEnabled = false;

    const off = document.createElement('canvas');
    off.width = 22;
    off.height = 18;

    let st = 'working';
    if (wardrobe.animState === 'landed') st = 'landed';
    else if (wardrobe.animState === 'asleep') st = 'parked';

    drawBee(off, wardrobe.activeBee, st, wardrobe.frame, wardrobe.activeHat);

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.drawImage(off, 0, 0, canvas.width, canvas.height);

    const badgeBee = document.getElementById('wardrobe-badge-bee');
    if (badgeBee) badgeBee.textContent = wardrobe.activeBee;

    const badgeHat = document.getElementById('wardrobe-badge-hat');
    if (badgeHat) {
      const found = HAT_CATALOG.find(h => h.id === wardrobe.activeHat);
      badgeHat.textContent = found ? found.name : wardrobe.activeHat;
    }
  }

  function startWardrobeAnim() {
    if (wardrobe.timer) {
      clearInterval(wardrobe.timer);
      wardrobe.timer = null;
    }
    if (wardrobe.animState === 'flight') {
      wardrobe.timer = setInterval(() => {
        wardrobe.frame = wardrobe.frame === 0 ? 1 : 0;
        updateWardrobePreview();
      }, 180);
    }
  }

  function syncWardrobeMembers() {
    const sel = document.getElementById('wardrobe-bee-select');
    if (!sel) return;

    const snap = window.SwarmSnapshot || (window.SwarmHive && window.SwarmHive.lastSnapshot);
    let members = [];
    if (snap && snap.members) {
      if (Array.isArray(snap.members)) {
        members = snap.members.map(m => m.name || m);
      } else {
        members = Object.keys(snap.members).filter(k => !k.startsWith('~'));
      }
    }
    if (!members.length) {
      members = ['coordinator', 'builder-ui', 'builder-hats', 'builder-config', 'verifier', 'monitor'];
    }

    const curVal = sel.value || wardrobe.activeBee;
    sel.innerHTML = '';
    members.forEach(name => {
      const opt = document.createElement('option');
      opt.value = name;
      opt.textContent = name === 'coordinator' ? 'coordinator (Queen)' : name + ' (Worker)';
      if (name === curVal) opt.selected = true;
      sel.appendChild(opt);
    });
    wardrobe.activeBee = sel.value || 'coordinator';
    renderWardrobeCards();
  }

  function renderWardrobeCards() {
    const grid = document.getElementById('wardrobe-hat-grid');
    if (!grid) return;
    grid.innerHTML = '';

    HAT_CATALOG.forEach(item => {
      const card = document.createElement('button');
      card.type = 'button';
      card.className = 'wardrobe-hat-card' + (item.id === wardrobe.activeHat ? ' active' : '');
      card.dataset.hat = item.id;
      card.setAttribute('role', 'option');
      card.setAttribute('aria-selected', item.id === wardrobe.activeHat ? 'true' : 'false');
      card.title = item.name + ' - ' + item.role;

      const cvWrap = document.createElement('div');
      cvWrap.className = 'wardrobe-card-canvas-wrap';
      const cv = document.createElement('canvas');
      cv.width = 44;
      cv.height = 36;
      cvWrap.appendChild(cv);

      const miniOff = document.createElement('canvas');
      miniOff.width = 22;
      miniOff.height = 18;
      drawBee(miniOff, wardrobe.activeBee, 'landed', 0, item.id);
      const mctx = cv.getContext('2d');
      mctx.imageSmoothingEnabled = false;
      mctx.drawImage(miniOff, 0, 0, 44, 36);

      const nameEl = document.createElement('span');
      nameEl.className = 'wardrobe-hat-name';
      nameEl.textContent = item.name;

      const roleEl = document.createElement('span');
      roleEl.className = 'wardrobe-hat-role';
      roleEl.textContent = item.role;

      card.appendChild(cvWrap);
      card.appendChild(nameEl);
      card.appendChild(roleEl);

      card.addEventListener('click', () => {
        wardrobe.activeHat = item.id;
        grid.querySelectorAll('.wardrobe-hat-card').forEach(c => {
          const isSel = c.dataset.hat === item.id;
          c.classList.toggle('active', isSel);
          c.setAttribute('aria-selected', String(isSel));
        });
        updateWardrobePreview();
      });

      grid.appendChild(card);
    });
  }

  function initWardrobeUI() {
    const panel = document.getElementById('tab-wardrobe');
    if (!panel) return;

    syncWardrobeMembers();

    const sel = document.getElementById('wardrobe-bee-select');
    if (sel && !sel.__bound) {
      sel.__bound = true;
      sel.addEventListener('change', () => {
        wardrobe.activeBee = sel.value;
        renderWardrobeCards();
        updateWardrobePreview();
      });
    }

    const toggleBtns = panel.querySelectorAll('.wardrobe-state-btn');
    toggleBtns.forEach(btn => {
      if (!btn.__bound) {
        btn.__bound = true;
        btn.addEventListener('click', () => {
          toggleBtns.forEach(b => b.classList.remove('active'));
          btn.classList.add('active');
          wardrobe.animState = btn.dataset.state;
          wardrobe.frame = 0;
          updateWardrobePreview();
          startWardrobeAnim();
        });
      }
    });

    const tabBtn = document.getElementById('tabbtn-wardrobe');
    if (tabBtn && !tabBtn.__bound) {
      tabBtn.__bound = true;
      tabBtn.addEventListener('click', () => {
        panel.classList.remove('hidden');
        document.querySelectorAll('.tab-body').forEach(el => {
          if (el !== panel) el.classList.remove('active');
        });
        panel.classList.add('active');
        syncWardrobeMembers();
        updateWardrobePreview();
        startWardrobeAnim();
      });
    }

    wardrobe.initialized = true;
    updateWardrobePreview();
    startWardrobeAnim();
  }

  // Hook into SwarmHive to update members dynamically on snapshots
  window.SwarmWardrobe = {
    update: updateWardrobePreview,
    syncMembers: syncWardrobeMembers,
    state: wardrobe,
    init: initWardrobeUI
  };

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initWardrobeUI);
  } else {
    setTimeout(initWardrobeUI, 50);
  }
${WARDROBE_CONTROLLER_FOOTER}`;

const PATCH_HEADER = '/* SWARM_HATS_PATCH_START */';
const PATCH_FOOTER = '/* SWARM_HATS_PATCH_END */';

const HAT_RENDERERS_CODE = `    if(hat==='crown'){
      const g1='#F7CE5B', g2='#FFE9A6', g3='#C98A2B'; [[5,5],[6,5],[7,5],[8,5],[9,5]].forEach(([x,y])=>P(x,y,g1)); P(5,4,g2); P(7,4,g2); P(9,4,g2); P(7,3,g2); P(5,5,g3); P(9,5,g3); P(7,5,'#E4566A');
    } else if(hat==='hardhat'){
      const hy='#FFC72C', hyl='#FFE082', hyd='#C69200', hyol='#8C6500';
      [3,4,5,6,7,8,9,10].forEach(x=>P(x,5,hyd)); P(3,5,hyol); P(10,5,hyol);
      [4,5,6,7,8,9].forEach(x=>P(x,4,hy)); [5,6,7,8].forEach(x=>P(x,3,hy)); [6,7].forEach(x=>P(x,2,hyl));
      P(6,3,hyl); P(6,4,hyl); P(9,4,hyd); P(8,3,hyd);
    } else if(hat==='mortarboard'){
      const mb='#1E1E24', mbh='#42424D', mbt='#F59E0B';
      [6,7,8,9].forEach(x=>P(x,5,mb)); [3,4,5,6,7,8,9,10,11].forEach(x=>P(x,4,mb));
      [4,5,6,7,8,9,10].forEach(x=>P(x,3,mbh)); P(7,2,mbt);
      P(6,3,mbt); P(5,4,mbt); P(4,5,mbt); P(4,6,mbt);
    } else if(hat==='tophat'){
      const th='#27272A', thh='#52525B', thb='#DC2626';
      [4,5,6,7,8,9,10].forEach(x=>P(x,5,th)); [5,6,7,8,9].forEach(x=>P(x,4,thb));
      [5,6,7,8,9].forEach(x=>{ P(x,3,th); P(x,2,th); P(x,1,th); });
      P(5,1,thh); P(5,2,thh); P(5,3,thh);
    } else if(hat==='beret'){
      const br='#7C3AED', brl='#A78BFA', ft='#FFFFFF', ftb='#38BDF8';
      [5,6,7,8,9].forEach(x=>P(x,5,br)); [4,5,6,7,8,9,10].forEach(x=>P(x,4,br)); [5,6,7,8,9].forEach(x=>P(x,3,brl));
      P(6,2,brl); P(9,3,ftb); P(10,2,ft); P(11,1,ft); P(12,0,ft);
    } else if(hat==='police'){
      const pc='#1E3A8A', pcl='#3B82F6', pcv='#09090B', gd='#FBBF24';
      [4,5,6,7].forEach(x=>P(x,5,pcv)); [5,6,7,8,9].forEach(x=>P(x,4,pc)); P(6,4,gd);
      [4,5,6,7,8,9,10].forEach(x=>P(x,3,pcl)); [5,6,7,8,9].forEach(x=>P(x,2,pc));
    } else if(hat==='wizard'){
      const wz='#312E81', wzl='#6366F1', st='#FBBF24';
      [3,4,5,6,7,8,9,10].forEach(x=>P(x,5,wz));
      [5,6,7,8,9].forEach(x=>P(x,4,wz)); [6,7,8].forEach(x=>P(x,3,wz)); [7,8].forEach(x=>P(x,2,wzl)); P(8,1,wzl); P(9,0,st);
      P(6,4,st);
    } else if(hat==='pirate'){
      const pt='#18181B', ptl='#3F3F46', skull='#F4F4F5', eye='#000000';
      [3,4,5,6,7,8,9,10].forEach(x=>P(x,5,pt));
      [4,5,6,7,8,9].forEach(x=>P(x,4,pt)); [5,6,7,8].forEach(x=>P(x,3,ptl));
      P(7,4,skull); P(6,9,eye); P(5,8,pt); P(7,10,pt);
    } else if(hat==='chef'){
      const cf='#FFFFFF', cfs='#CBD5E1', cfd='#94A3B8';
      [5,6,7,8,9].forEach(x=>P(x,5,cfs));
      [5,6,7,8,9].forEach(x=>P(x,4,cf));
      [4,5,6,7,8,9,10].forEach(x=>P(x,3,cf));
      [4,5,6,7,8,9,10].forEach(x=>P(x,2,cf));
      [5,6,7,8,9].forEach(x=>P(x,1,cfd));
      P(4,2,cfs); P(10,2,cfs);
    } else if(hat==='viking'){
      const vk='#52525B', vkl='#A1A1AA', hr='#FEF08A', hrt='#FDE047';
      [5,6,7,8,9].forEach(x=>P(x,5,vk)); [5,6,7,8,9].forEach(x=>P(x,4,vk)); [6,7,8].forEach(x=>P(x,3,vkl));
      P(4,4,hr); P(3,3,hr); P(2,2,hrt);
      P(10,4,hr); P(11,3,hr); P(12,2,hrt);
    } else if(hat==='headphones'){
      const hpd='#1E293B', hpl='#64748B', hpcl='#14B8A6', hpg='#5EEAD4';
      [4,5,6,7,8,9,10].forEach(x=>P(x,2,hpd)); [6,7,8].forEach(x=>P(x,2,hpl));
      P(3,3,hpd); P(11,3,hpd);
      [4,5,6,7].forEach(y=>P(3,y,hpd)); P(2,5,hpd); P(2,6,hpd); P(3,5,hpg); P(3,6,hpcl);
      [4,5,6,7].forEach(y=>P(11,y,hpd)); P(12,5,hpd); P(12,6,hpd); P(11,5,hpg); P(11,6,hpcl);
    } else if(hat==='goggles'){
      const gst='#0F172A', gsh='#334155', gc='#06B6D4', gcl='#22D3EE', gch='#E0F2FE', gled='#10B981';
      [3,4].forEach(x=>P(x,9,gst)); [10,11,12].forEach(x=>P(x,9,gst)); P(10,9,gsh);
      [5,6,7,8,9].forEach(x=>P(x,8,gst)); P(7,8,gled);
      P(5,9,gc); P(6,9,gch); P(7,9,gcl); P(8,9,gc); P(9,9,gc);
      [5,6,7,8].forEach(x=>P(x,10,gc)); P(6,10,gcl); P(7,10,gcl);
    } else if(hat==='bandana'){
      const bd1='#DC2626', bd2='#EF4444', bd3='#991B1B', bmp='#E2E8F0', bmpd='#64748B';
      [5,6,7,8,9].forEach(x=>P(x,4,bd2));
      [4,5,6,7,8,9,10].forEach(x=>P(x,5,bd1)); P(4,5,bd3); P(10,5,bd3);
      P(6,5,bmp); P(7,5,bmp); P(8,5,bmpd);
      P(11,5,bd3); P(11,6,bd1);
      P(12,5,bd1); P(13,6,bd2); P(14,6,bd1); P(12,7,bd3); P(13,7,bd1);
    } else {
      [[7,5],[6,4],[5,3]].forEach(([x,y])=>P(x,y,R.ol)); P(4,3,R.sk); [[9,5],[9,4],[9,3]].forEach(([x,y])=>P(x,y,R.ol)); P(8,2,R.sk);
    }`;

function getPatchCode() {
  const { config } = loadConfig();
  const hatFunctionCode = generateHatFunction(config.overrides);
  return `${PATCH_HEADER}
    // Custom role-based hats (Antigravity Swarm Cosmetics)
${hatFunctionCode}

${HAT_RENDERERS_CODE}
    ${PATCH_FOOTER}`;
}

function checkFilesExist() {
  if (!fs.existsSync(SWARM_DIR)) {
    console.error('[!] Swarm sidecar directory not found:', SWARM_DIR);
    return false;
  }
  if (!fs.existsSync(HIVE_PATH)) {
    console.error('[!] hive.js not found at:', HIVE_PATH);
    return false;
  }
  return true;
}

function status() {
  if (!checkFilesExist()) return;

  const content = fs.readFileSync(HIVE_PATH, 'utf8');
  const hasPatch = content.includes(PATCH_HEADER);
  const hasWardrobeCtrl = content.includes(WARDROBE_CONTROLLER_HEADER);
  const indexContent = fs.existsSync(INDEX_PATH) ? fs.readFileSync(INDEX_PATH, 'utf8') : '';
  const hasCacheBust = indexContent.includes('hive.js?v=');
  const hasWardrobeTab = indexContent.includes('id="tabbtn-wardrobe"');
  const hasWardrobeSection = indexContent.includes('id="tab-wardrobe"');
  const hiveCssContent = fs.existsSync(HIVE_CSS_PATH) ? fs.readFileSync(HIVE_CSS_PATH, 'utf8') : '';
  const hasWardrobeCss = hiveCssContent.includes(WARDROBE_CSS_HEADER);
  const { config, path: cfgPath } = loadConfig();
  const overrideCount = Object.keys(config.overrides || {}).length;

  console.log('Antigravity Swarm Cosmetics Status:');
  console.log(`  - hive.js patched:       ${hasPatch ? '✓ YES' : '✗ NO'}`);
  console.log(`  - wardrobe tab (HTML):   ${(hasWardrobeTab && hasWardrobeSection) ? '✓ YES' : '✗ NO'}`);
  console.log(`  - wardrobe controller:   ${hasWardrobeCtrl ? '✓ YES' : '✗ NO'}`);
  console.log(`  - wardrobe styles (CSS): ${hasWardrobeCss ? '✓ YES' : '✗ NO'}`);
  console.log(`  - index.html cache-bust: ${hasCacheBust ? '✓ ACTIVE' : '✗ INACTIVE'}`);
  console.log(`  - hive.js backup:        ${fs.existsSync(BACKUP_HIVE) ? '✓ EXISTS' : '✗ NONE'}`);
  console.log(`  - index.html backup:     ${fs.existsSync(BACKUP_INDEX) ? '✓ EXISTS' : '✗ NONE'}`);
  console.log(`  - hive.css backup:       ${fs.existsSync(BACKUP_HIVE_CSS) ? '✓ EXISTS' : '✗ NONE'}`);
  console.log(`  - config file:           ${cfgPath ? `✓ ${cfgPath}` : '✗ NONE (using defaults)'}`);
  console.log(`  - active overrides:      ${overrideCount}`);
}

function apply() {
  if (!checkFilesExist()) process.exit(1);

  // Backup original files before modifying
  if (!fs.existsSync(BACKUP_HIVE)) {
    fs.copyFileSync(HIVE_PATH, BACKUP_HIVE);
    log('[+] Created original backup of hive.js');
  }
  if (fs.existsSync(INDEX_PATH) && !fs.existsSync(BACKUP_INDEX)) {
    fs.copyFileSync(INDEX_PATH, BACKUP_INDEX);
    log('[+] Created original backup of index.html');
  }
  if (fs.existsSync(HIVE_CSS_PATH) && !fs.existsSync(BACKUP_HIVE_CSS)) {
    fs.copyFileSync(HIVE_CSS_PATH, BACKUP_HIVE_CSS);
    log('[+] Created original backup of hive.css');
  }

  const patchCode = getPatchCode();

  // 1. Patch hive.js: hats & wardrobe controller
  let content = fs.readFileSync(HIVE_PATH, 'utf8');

  // Ensure drawBee signature accepts hatOverride
  if (content.includes('function drawBee(cv, name, state, frame){')) {
    content = content.replace('function drawBee(cv, name, state, frame){', 'function drawBee(cv, name, state, frame, hatOverride){');
  }

  // Ensure snapshot is captured in update
  if (!content.includes('window.SwarmSnapshot = snap;')) {
    content = content.replace(
      'update(snap, el, opts) {\n      if (!snap || !el) return;',
      'update(snap, el, opts) {\n      if (!snap || !el) return;\n      window.SwarmSnapshot = snap;\n      if (window.SwarmWardrobe && window.SwarmWardrobe.syncMembers) window.SwarmWardrobe.syncMembers();'
    );
  }

  // Inject or update hat renderers
  if (content.includes(PATCH_HEADER)) {
    const replaceExisting = new RegExp(
      `${PATCH_HEADER.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}[\\s\\S]*?${PATCH_FOOTER.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}`
    );
    content = content.replace(replaceExisting, patchCode.trim());
    log('[✓] Updated existing Swarm Cosmetics patch in hive.js');
  } else {
    const targetPattern = /\/\/ antennae or crown[\s\S]*?else \{ \[\[7,5\][\s\S]*?P\(8,2,R\.sk\); \}/;
    if (!targetPattern.test(content)) {
      log('[!] Target "antennae or crown" block not found in hive.js');
      process.exit(1);
    }
    content = content.replace(targetPattern, patchCode.trim());
    log('[✓] Successfully applied Swarm Cosmetics patch to hive.js');
  }

  // Inject or update wardrobe controller
  if (content.includes(WARDROBE_CONTROLLER_HEADER)) {
    const replaceCtrl = new RegExp(
      `${WARDROBE_CONTROLLER_HEADER.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}[\\s\\S]*?${WARDROBE_CONTROLLER_FOOTER.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}`
    );
    content = content.replace(replaceCtrl, WARDROBE_CONTROLLER_CODE.trim());
    log('[✓] Updated Wardrobe controller in hive.js');
  } else {
    // Inject right before window.SwarmHive = Object.assign
    const hiveTarget = 'window.SwarmHive = Object.assign(';
    if (content.includes(hiveTarget)) {
      content = content.replace(hiveTarget, `${WARDROBE_CONTROLLER_CODE.trim()}\n\n  ${hiveTarget}`);
      log('[✓] Injected Wardrobe controller into hive.js');
    } else {
      // Fallback: inject before closing of IIFE
      const iifeEnd = '})();';
      const lastIdx = content.lastIndexOf(iifeEnd);
      if (lastIdx !== -1) {
        content = content.slice(0, lastIdx) + `\n${WARDROBE_CONTROLLER_CODE.trim()}\n` + content.slice(lastIdx);
        log('[✓] Injected Wardrobe controller into hive.js');
      }
    }
  }

  fs.writeFileSync(HIVE_PATH, content, 'utf8');

  // 2. Patch index.html: inject tab button, wardrobe section, and cache-buster
  if (fs.existsSync(INDEX_PATH)) {
    let idx = fs.readFileSync(INDEX_PATH, 'utf8');

    // Inject tab button in <nav class="tabs">
    if (!idx.includes('id="tabbtn-wardrobe"')) {
      const navClose = '</nav>';
      if (idx.includes(navClose)) {
        idx = idx.replace(navClose, `${WARDROBE_TAB_BUTTON}\n      ${navClose}`);
        log('[✓] Injected Wardrobe tab button into index.html');
      }
    }

    // Inject or update wardrobe panel section before </main>
    if (idx.includes(WARDROBE_SECTION_HEADER)) {
      const replaceSec = new RegExp(
        `\\s*${WARDROBE_SECTION_HEADER.replace(/[.*+?^${}()|[\\]\\]/g, '\\$&')}[\\s\\S]*?${WARDROBE_SECTION_FOOTER.replace(/[.*+?^${}()|[\\]\\]/g, '\\$&')}`,
        'g'
      );
      idx = idx.replace(replaceSec, '');
      const mainClose = '</main>';
      idx = idx.replace(mainClose, `${WARDROBE_SECTION_CODE}\n    ${mainClose}`);
      log('[✓] Updated Wardrobe section in index.html');
    } else {
      const mainClose = '</main>';
      if (idx.includes(mainClose)) {
        idx = idx.replace(mainClose, `${WARDROBE_SECTION_CODE.trim()}\n    ${mainClose}`);
        log('[✓] Injected Wardrobe section into index.html');
      }
    }

    // Cache buster for hive.js and hive.css
    const newTag = `/hive.js?v=cosmetics_${Date.now()}`;
    if (idx.includes('/hive.js?v=')) {
      idx = idx.replace(/\/hive\.js\?v=[^"'\s>]+/, newTag);
    } else if (idx.includes('/hive.js')) {
      idx = idx.replace('/hive.js', newTag);
    }

    const cssTag = `/hive.css?v=cosmetics_${Date.now()}`;
    if (idx.includes('/hive.css?v=')) {
      idx = idx.replace(/\/hive\.css\?v=[^"'\s>]+/, cssTag);
    } else if (idx.includes('/hive.css')) {
      idx = idx.replace('/hive.css', cssTag);
    }

    fs.writeFileSync(INDEX_PATH, idx, 'utf8');
    log('[✓] Configured cache-busting in index.html');
  }

  // 3. Patch hive.css: wardrobe styling
  if (fs.existsSync(HIVE_CSS_PATH)) {
    let css = fs.readFileSync(HIVE_CSS_PATH, 'utf8');
    if (css.includes(WARDROBE_CSS_HEADER)) {
      const replaceCss = new RegExp(
        `${WARDROBE_CSS_HEADER.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}[\\s\\S]*?${WARDROBE_CSS_FOOTER.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}`
      );
      css = css.replace(replaceCss, WARDROBE_CSS_CODE.trim());
      log('[✓] Updated Wardrobe styles in hive.css');
    } else {
      css = css.trimEnd() + '\n\n' + WARDROBE_CSS_CODE.trim() + '\n';
      log('[✓] Injected Wardrobe styles into hive.css');
    }
    fs.writeFileSync(HIVE_CSS_PATH, css, 'utf8');
  }
}

function restore() {
  let restored = false;
  if (fs.existsSync(BACKUP_HIVE)) {
    fs.copyFileSync(BACKUP_HIVE, HIVE_PATH);
    console.log('[✓] Restored hive.js from original backup');
    restored = true;
  }
  if (fs.existsSync(BACKUP_INDEX)) {
    fs.copyFileSync(BACKUP_INDEX, INDEX_PATH);
    console.log('[✓] Restored index.html from original backup');
    restored = true;
  }
  if (fs.existsSync(BACKUP_HIVE_CSS)) {
    fs.copyFileSync(BACKUP_HIVE_CSS, HIVE_CSS_PATH);
    console.log('[✓] Restored hive.css from original backup');
    restored = true;
  }
  if (!restored) {
    console.log('[!] No backup files found to restore.');
  }
}

function configShow() {
  const { config } = loadConfig();
  if (isSilent) {
    process.stdout.write(JSON.stringify(config));
  } else {
    console.log(JSON.stringify(config, null, 2));
  }
}

function configSet(nameOrPattern, hatName) {
  if (!nameOrPattern || !hatName) {
    console.error('Usage: node scripts/patch.js config set <nameOrPattern> <hatName>');
    process.exit(1);
  }

  const { config } = loadConfig();
  if (!config.overrides || typeof config.overrides !== 'object') {
    config.overrides = {};
  }

  config.overrides[nameOrPattern] = hatName;
  const targetPath = getWritableConfigPath();

  const parentDir = path.dirname(targetPath);
  if (!fs.existsSync(parentDir)) {
    fs.mkdirSync(parentDir, { recursive: true });
  }

  fs.writeFileSync(targetPath, JSON.stringify(config, null, 2) + '\n', 'utf8');
  log(`[✓] Saved override "${nameOrPattern}" -> "${hatName}" in ${targetPath}`);

  // Re-apply patch
  apply();
}

function handleHookResponse() {
  if (isHook) {
    process.stdout.write(JSON.stringify({ decision: 'allow' }));
  }
}

const cmd = (args[0] || 'status').toLowerCase();
switch (cmd) {
  case 'config': {
    const subCmd = (args[1] || 'show').toLowerCase();
    if (subCmd === 'show' || subCmd === 'get' || subCmd === 'list') {
      configShow();
    } else if (subCmd === 'set' || subCmd === 'add') {
      const nameOrPattern = args[2];
      const hatName = args[3];
      configSet(nameOrPattern, hatName);
      if (isHook) handleHookResponse();
    } else {
      console.log('Antigravity Swarm Cosmetics - Config CLI');
      console.log('Usage:');
      console.log('  node scripts/patch.js config show');
      console.log('  node scripts/patch.js config set <nameOrPattern> <hatName>');
      process.exit(1);
    }
    break;
  }
  case 'apply':
  case 'install':
    apply();
    if (isHook) handleHookResponse();
    break;
  case 'restore':
  case 'uninstall':
    restore();
    if (isHook) handleHookResponse();
    break;
  case 'status':
  case 'check':
    status();
    if (isHook) handleHookResponse();
    break;
  default:
    console.log('Antigravity Swarm Cosmetics CLI');
    console.log('Usage: node scripts/patch.js [status|apply|restore|config]');
    console.log('  node scripts/patch.js status');
    console.log('  node scripts/patch.js apply [--silent]');
    console.log('  node scripts/patch.js restore');
    console.log('  node scripts/patch.js config show');
    console.log('  node scripts/patch.js config set <nameOrPattern> <hatName>');
    if (isHook) handleHookResponse();
}
