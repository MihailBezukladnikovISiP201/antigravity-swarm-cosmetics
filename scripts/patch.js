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

const PATCH_HEADER = '/* SWARM_HATS_PATCH_START */';
const PATCH_FOOTER = '/* SWARM_HATS_PATCH_END */';

const PATCH_CODE = `${PATCH_HEADER}
    // Custom role-based hats (Antigravity Swarm Cosmetics)
    const hat = (function(n){
      n = String(n).toLowerCase();
      if(queen || n==='coordinator') return 'crown';
      if(/verifier|review|qa|test|audit|lint|check/.test(n)) return 'mortarboard';
      if(/builder|author|dev|code|parser|impl|fix|patch|engineer/.test(n)) return 'hardhat';
      if(/research|scout|investig|search|doc|read|explore|analyst/.test(n)) return 'tophat';
      if(/narrator|story|scribe|log|write|history/.test(n)) return 'beret';
      if(/monitor|guard|watch|stall|dispatch|ping/.test(n)) return 'police';
      if(/wizard|magic|ai|model|prompt|llm|synth|brain/.test(n)) return 'wizard';
      if(/pirate|sec|security|hack|pentest|redteam|exploit/.test(n)) return 'pirate';
      if(/chef|cook|data|pipeline|etl|feed|clean|prep/.test(n)) return 'chef';
      if(/viking|stress|bench|perf|load|speed|opt|heavy/.test(n)) return 'viking';
      return 'default';
    })(name);

    if(hat==='crown'){
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
    } else {
      [[7,5],[6,4],[5,3]].forEach(([x,y])=>P(x,y,R.ol)); P(4,3,R.sk); [[9,5],[9,4],[9,3]].forEach(([x,y])=>P(x,y,R.ol)); P(8,2,R.sk);
    }
    ${PATCH_FOOTER}`;

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
  const indexContent = fs.existsSync(INDEX_PATH) ? fs.readFileSync(INDEX_PATH, 'utf8') : '';
  const hasCacheBust = indexContent.includes('hive.js?v=');

  console.log('Antigravity Swarm Cosmetics Status:');
  console.log(`  - hive.js patched:       ${hasPatch ? '✓ YES' : '✗ NO'}`);
  console.log(`  - index.html cache-bust: ${hasCacheBust ? '✓ ACTIVE' : '✗ INACTIVE'}`);
  console.log(`  - hive.js backup:        ${fs.existsSync(BACKUP_HIVE) ? '✓ EXISTS' : '✗ NONE'}`);
  console.log(`  - index.html backup:     ${fs.existsSync(BACKUP_INDEX) ? '✓ EXISTS' : '✗ NONE'}`);
}

function apply() {
  if (!checkFilesExist()) process.exit(1);

  // Backup original files before modifying
  if (!fs.existsSync(BACKUP_HIVE)) {
    fs.copyFileSync(HIVE_PATH, BACKUP_HIVE);
    console.log('[+] Created original backup of hive.js');
  }
  if (fs.existsSync(INDEX_PATH) && !fs.existsSync(BACKUP_INDEX)) {
    fs.copyFileSync(INDEX_PATH, BACKUP_INDEX);
    console.log('[+] Created original backup of index.html');
  }

  // Patch hive.js
  let content = fs.readFileSync(HIVE_PATH, 'utf8');
  if (content.includes(PATCH_HEADER)) {
    // Replace existing patch with newer version
    const replaceExisting = new RegExp(
      `${PATCH_HEADER.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}[\\s\\S]*?${PATCH_FOOTER.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}`
    );
    content = content.replace(replaceExisting, PATCH_CODE.trim());
    fs.writeFileSync(HIVE_PATH, content, 'utf8');
    console.log('[✓] Updated existing Swarm Cosmetics patch in hive.js');
  } else {
    // Fresh injection
    const targetPattern = /\/\/ antennae or crown[\s\S]*?else \{ \[\[7,5\][\s\S]*?P\(8,2,R\.sk\); \}/;
    if (!targetPattern.test(content)) {
      console.error('[!] Target "antennae or crown" block not found in hive.js');
      process.exit(1);
    }
    content = content.replace(targetPattern, PATCH_CODE.trim());
    fs.writeFileSync(HIVE_PATH, content, 'utf8');
    console.log('[✓] Successfully applied Swarm Cosmetics patch to hive.js');
  }

  // Patch index.html with cache-buster
  if (fs.existsSync(INDEX_PATH)) {
    let idx = fs.readFileSync(INDEX_PATH, 'utf8');
    if (!idx.includes('hive.js?v=')) {
      idx = idx.replace('/hive.js', `/hive.js?v=cosmetics_${Date.now()}`);
      fs.writeFileSync(INDEX_PATH, idx, 'utf8');
      console.log('[✓] Configured cache-busting in index.html');
    }
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
  if (!restored) {
    console.log('[!] No backup files found to restore.');
  }
}

const cmd = (process.argv[2] || 'status').replace(/^--?/, '');
switch (cmd) {
  case 'apply':
  case 'install':
    apply();
    break;
  case 'restore':
  case 'uninstall':
    restore();
    break;
  case 'status':
  case 'check':
    status();
    break;
  default:
    console.log('Antigravity Swarm Cosmetics CLI');
    console.log('Usage: node patch.js [status|apply|restore]');
}
