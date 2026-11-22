#!/usr/bin/env node

/**
 * 🩺 SKILL DOCTOR — WeChat PMT
 * Outil de validation automatique de conformité et de santé du skill.
 *
 * Vérifie :
 * 1. Zéro BOM UTF-8 (\uFEFF)
 * 2. Validité des fichiers JSON
 * 3. Absence de nesting SCSS interdit en WXSS
 * 4. Cohérence des 14 déclencheurs maîtres dans SKILL.md
 * 5. Détection des liens Markdown orphelins
 */

const fs = require('fs');
const path = require('path');

const SKILL_DIR = path.resolve(__dirname, '..');
let hasError = false;

console.log('====================================================');
console.log('🩺 SKILL DOCTOR — VÉRIFICATION DU RÉFÉRENTIEL WECHAT');
console.log('====================================================\n');

function getAllFiles(dir, extensions) {
  let results = [];
  const list = fs.readdirSync(dir);
  list.forEach((file) => {
    if (file === '.git' || file === 'node_modules') return;
    const fullPath = path.join(dir, file);
    const stat = fs.statSync(fullPath);
    if (stat && stat.isDirectory()) {
      results = results.concat(getAllFiles(fullPath, extensions));
    } else {
      const ext = path.extname(file).toLowerCase();
      if (!extensions || extensions.includes(ext)) {
        results.push(fullPath);
      }
    }
  });
  return results;
}

// -----------------------------------------------------------------------------
// TEST 1 : DÉTECTION DU BOM UTF-8 (\uFEFF)
// -----------------------------------------------------------------------------
console.log('🔍 Test 1 : Détection du BOM UTF-8...');
const allFiles = getAllFiles(SKILL_DIR, ['.md', '.js', '.json', '.wxss', '.wxml', '.cursorrules', '.code-snippets']);
let bomCount = 0;

allFiles.forEach((file) => {
  const buf = Buffer.alloc(3);
  const fd = fs.openSync(file, 'r');
  fs.readSync(fd, buf, 0, 3, 0);
  fs.closeSync(fd);

  if (buf[0] === 0xEF && buf[1] === 0xBB && buf[2] === 0xBF) {
    console.error(`  ❌ BOM Détecté : ${path.relative(SKILL_DIR, file)}`);
    bomCount++;
    hasError = true;
  }
});

if (bomCount === 0) {
  console.log(`  ✅ 100% des fichiers (${allFiles.length}) sont sans BOM UTF-8.\n`);
} else {
  console.error(`  ❌ ${bomCount} fichier(s) contiennent un BOM UTF-8 interdit.\n`);
}

// -----------------------------------------------------------------------------
// TEST 2 : VALIDITÉ DES JSON
// -----------------------------------------------------------------------------
console.log('🔍 Test 2 : Validité de la syntaxe JSON...');
const jsonFiles = getAllFiles(SKILL_DIR, ['.json', '.code-snippets']);
let jsonErrorCount = 0;

jsonFiles.forEach((file) => {
  try {
    const raw = fs.readFileSync(file, 'utf8');
    JSON.parse(raw);
  } catch (err) {
    console.error(`  ❌ JSON Invalide : ${path.relative(SKILL_DIR, file)} -> ${err.message}`);
    jsonErrorCount++;
    hasError = true;
  }
});

if (jsonErrorCount === 0) {
  console.log(`  ✅ Tous les fichiers JSON (${jsonFiles.length}) sont syntaxiquement valides.\n`);
}

// -----------------------------------------------------------------------------
// TEST 3 : DÉTECTION DU NESTING CSS INTERDIT EN WXSS
// -----------------------------------------------------------------------------
console.log('🔍 Test 3 : Détection du Nesting SCSS dans les WXSS...');
const wxssFiles = getAllFiles(SKILL_DIR, ['.wxss']);
let nestingCount = 0;

// Regex simple pour détecter une accolade ouvrante dans un bloc CSS
const nestingRegex = /\{[^{}]*\{[^{}]*\}/s;

wxssFiles.forEach((file) => {
  let content = fs.readFileSync(file, 'utf8');
  // Ignorer les blocs @keyframes légaux en CSS
  const cleanedContent = content.replace(/@keyframes[\s\S]*?\}\s*\}/g, '');
  if (nestingRegex.test(cleanedContent)) {
    console.warn(`  ⚠️ Risque de Nesting CSS détecté dans : ${path.relative(SKILL_DIR, file)}`);
    nestingCount++;
  }
});

if (nestingCount === 0) {
  console.log('  ✅ Aucun nesting SCSS illégal détecté dans les WXSS.\n');
}

// -----------------------------------------------------------------------------
// TEST 4 : COHÉRENCE DES DÉCLENCHEURS DANS SKILL.MD
// -----------------------------------------------------------------------------
console.log('🔍 Test 4 : Cohérence des déclencheurs dans SKILL.md...');
const skillMdPath = path.join(SKILL_DIR, 'SKILL.md');
if (fs.existsSync(skillMdPath)) {
  const skillContent = fs.readFileSync(skillMdPath, 'utf8');
  const triggers = [
    '@UI-MOCK',
    '@SKELETON-UX',
    '@RESPONSIVE-UI',
    '@INTERACTIVE-UI',
    '@IMAGE-MEDIA',
    '@STATE-ENGINE',
    '@SAFE-STORAGE',
    '@SAFE-NAV',
    '@API-CONNECT',
    '@NATIVE-PAY',
    '@MAXIT-SDK',
    '@ANALYTICS-TRACK',
    '@DARK-MODE',
    '@COMPILER-SAFE',
    '@TUNNEL-COMPLEXE',
    '@SUPPORT-WHATSAPP',
  ];

  let missingTriggers = 0;
  triggers.forEach((trg) => {
    if (!skillContent.includes(trg)) {
      console.error(`  ❌ Déclencheur manquant dans SKILL.md : ${trg}`);
      missingTriggers++;
      hasError = true;
    }
  });

  if (missingTriggers === 0) {
    console.log(`  ✅ Tous les ${triggers.length} déclencheurs maîtres sont documentés dans SKILL.md.\n`);
  }
}

// -----------------------------------------------------------------------------
// TEST 5 : VALIDITÉ DES LIENS INTERNES MARKDOWN
// -----------------------------------------------------------------------------
console.log('🔍 Test 5 : Détection des liens Markdown orphelins...');
const mdFiles = getAllFiles(SKILL_DIR, ['.md']);
const linkRegex = /\[([^\]]+)\]\(([^)]+)\)/g;
let brokenLinksCount = 0;

mdFiles.forEach((file) => {
  let content = fs.readFileSync(file, 'utf8');
  content = content.replace(/```[\s\S]*?```/g, ''); // Ignorer les blocs de code

  let match;
  while ((match = linkRegex.exec(content)) !== null) {
    const rawTarget = match[2].trim();
    if (
      rawTarget.startsWith('http://') ||
      rawTarget.startsWith('https://') ||
      rawTarget.startsWith('#') ||
      rawTarget.startsWith('mailto:')
    ) {
      continue;
    }
    const targetFile = rawTarget.split('#')[0];
    if (!targetFile) continue;

    const resolved = path.resolve(path.dirname(file), targetFile);
    if (!fs.existsSync(resolved)) {
      console.error(`  ❌ Lien brisé dans ${path.relative(SKILL_DIR, file)} -> ${rawTarget}`);
      brokenLinksCount++;
      hasError = true;
    }
  }
});

if (brokenLinksCount === 0) {
  console.log(`  ✅ Tous les liens Markdown internes (${mdFiles.length} docs) sont valides.\n`);
}

// -----------------------------------------------------------------------------
// BILAN FINAL
// -----------------------------------------------------------------------------
console.log('====================================================');
if (hasError) {
  console.error('❌ RÉSULTAT : DES ERREURS ONT ÉTÉ DÉTECTÉES DANS LE SKILL.');
  process.exit(1);
} else {
  console.log('✨ RÉSULTAT : LE SKILL EST 100% VALIDE ET SAIN !');
  process.exit(0);
}
