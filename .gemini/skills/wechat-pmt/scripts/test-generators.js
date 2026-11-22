#!/usr/bin/env node

/**
 * 🧪 TEST-GENERATORS — WeChat PMT
 * Teste automatiquement les générateurs create-page.js, create-component.js et create-api.js
 */

const fs = require('fs');
const path = require('path');
const os = require('os');
const { execSync } = require('child_process');

const TEMP_DIR = path.join(os.tmpdir(), 'wechat-pmt-test-scaffold');

console.log('====================================================');
console.log('🧪 TEST DES GÉNÉRATEURS CLI — WECHAT PMT');
console.log('====================================================\n');

try {
  // Nettoyage préalable
  if (fs.existsSync(TEMP_DIR)) {
    fs.rmSync(TEMP_DIR, { recursive: true, force: true });
  }

  // 1. Test create-page.js (Paquet Principal)
  console.log('🔍 Test 1 : Génération de page racine (create-page.js)...');
  const pageTarget = path.join(TEMP_DIR, 'pages', 'test-order');
  execSync(`node "${path.join(__dirname, 'create-page.js')}" "${pageTarget}" --with-api`, {
    stdio: 'pipe',
  });

  ['index.js', 'index.wxml', 'index.wxss', 'index.json'].forEach((file) => {
    const filePath = path.join(pageTarget, file);
    if (!fs.existsSync(filePath)) {
      throw new Error(`Fichier de page manquant : ${file}`);
    }
    const stat = fs.statSync(filePath);
    if (stat.size === 0) {
      throw new Error(`Fichier de page vide : ${file}`);
    }
  });

  // Valider index.json
  const pageJson = JSON.parse(fs.readFileSync(path.join(pageTarget, 'index.json'), 'utf8'));
  if (!pageJson.usingComponents) {
    throw new Error('index.json de la page ne contient pas usingComponents');
  }
  console.log('  ✅ create-page.js (root) fonctionne avec succès (4 fichiers valides).\n');

  // 1b. Test create-page.js avec sous-paquet (--subpackage)
  console.log('🔍 Test 1b : Génération de page en sous-paquet (create-page.js --subpackage)...');
  execSync(`node "${path.join(__dirname, 'create-page.js')}" detail --subpackage booking --with-api`, {
    cwd: TEMP_DIR,
    stdio: 'pipe',
  });

  const subPageTarget = path.join(TEMP_DIR, 'subpackages', 'booking', 'pages', 'detail');
  ['index.js', 'index.wxml', 'index.wxss', 'index.json'].forEach((file) => {
    const filePath = path.join(subPageTarget, file);
    if (!fs.existsSync(filePath)) {
      throw new Error(`Fichier sous-paquet manquant : ${file}`);
    }
  });

  const subJs = fs.readFileSync(path.join(subPageTarget, 'index.js'), 'utf8');
  if (!subJs.includes('../../../../utils/')) {
    throw new Error('Les chemins relatifs vers utils/ dans le sous-paquet sont incorrects');
  }
  console.log('  ✅ create-page.js (--subpackage) fonctionne avec succès (chemins relatifs ../../../../ corrects).\n');

  // 2. Test create-component.js (Mode UI)
  console.log('🔍 Test 2 : Génération de composant UI (create-component.js)...');
  const compTarget = path.join(TEMP_DIR, 'components', 'ui', 'user-card');
  execSync(`node "${path.join(__dirname, 'create-component.js')}" "${compTarget}"`, {
    stdio: 'pipe',
  });

  ['index.js', 'index.wxml', 'index.wxss', 'index.json'].forEach((file) => {
    const filePath = path.join(compTarget, file);
    if (!fs.existsSync(filePath)) {
      throw new Error(`Fichier composant UI manquant : ${file}`);
    }
  });

  const compJson = JSON.parse(fs.readFileSync(path.join(compTarget, 'index.json'), 'utf8'));
  if (compJson.component !== true) {
    throw new Error('index.json du composant ne contient pas "component": true');
  }
  console.log('  ✅ create-component.js (UI) fonctionne avec succès (4 fichiers valides).\n');

  // 3. Test create-component.js (Mode UX)
  console.log('🔍 Test 3 : Génération de composant UX (create-component.js --ux)...');
  const uxTarget = path.join(TEMP_DIR, 'components', 'ux', 'card-skeleton');
  execSync(`node "${path.join(__dirname, 'create-component.js')}" "${uxTarget}" --ux`, {
    stdio: 'pipe',
  });

  ['index.js', 'index.wxml', 'index.wxss', 'index.json'].forEach((file) => {
    const filePath = path.join(uxTarget, file);
    if (!fs.existsSync(filePath)) {
      throw new Error(`Fichier composant UX manquant : ${file}`);
    }
  });
  console.log('  ✅ create-component.js (--ux) fonctionne avec succès (4 fichiers valides).\n');

  // 4. Test create-api.js
  console.log('🔍 Test 4 : Génération de module API & Mapper (create-api.js)...');
  execSync(`node "${path.join(__dirname, 'create-api.js')}" testorder --base-dir "${TEMP_DIR}"`, {
    stdio: 'pipe',
  });

  const apiFile = path.join(TEMP_DIR, 'utils', 'apis', 'testorder.api.js');
  const mapperFile = path.join(TEMP_DIR, 'utils', 'mappers', 'testorder.js');

  if (!fs.existsSync(apiFile)) {
    throw new Error('Fichier API manquant : utils/apis/testorder.api.js');
  }
  if (!fs.existsSync(mapperFile)) {
    throw new Error('Fichier Mapper manquant : utils/mappers/testorder.js');
  }
  console.log('  ✅ create-api.js fonctionne avec succès (API service + json-sculpt mapper).\n');

  console.log('====================================================');
  console.log('✨ TOUS LES GÉNÉRATEURS SONT OPÉRATIONNELS ET VALIDES !');
  console.log('====================================================\n');
} catch (err) {
  console.error(`\n❌ Échec du test des générateurs : ${err.message}`);
  process.exit(1);
} finally {
  // Nettoyage
  if (fs.existsSync(TEMP_DIR)) {
    fs.rmSync(TEMP_DIR, { recursive: true, force: true });
  }
}
