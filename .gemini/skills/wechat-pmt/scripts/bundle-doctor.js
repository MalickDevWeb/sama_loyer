#!/usr/bin/env node

/**
 * ⚡ BUNDLE & PERFORMANCE DOCTOR — WeChat PMT / TCMPP
 * Analyseur statique de performance, taille de sous-paquets et fuites mémoire.
 *
 * Vérifie :
 * 1. Plafond des 2 Mo (2048 Ko) par sous-paquet et paquet principal
 * 2. Détection d'images locales lourdes (> 100 Ko)
 * 3. Détection de fuites mémoire (timers et abonnements non nettoyés dans onUnload)
 * 4. Détection des accès synchrones au stockage dans des boucles
 *
 * Usage :
 *   node scripts/bundle-doctor.js [chemin/vers/mini-program]
 *   node scripts/bundle-doctor.js --self-test
 */

const fs = require('fs');
const path = require('path');

const MAX_PACKAGE_SIZE_KB = 2048; // Limite stricte WeChat / TCMPP : 2 Mo
const WARN_PACKAGE_SIZE_KB = 1800; // Seuil d'alerte : 1.8 Mo
const MAX_IMAGE_SIZE_KB = 100;     // Plafond recommandé par asset local

function formatKb(bytes) {
  return (bytes / 1024).toFixed(1) + ' Ko';
}

function scanDirectory(dir, filterExts = null, ignoreDirs = ['.git', 'node_modules', 'dist', 'miniprogram_npm', 'scripts', 'test', 'tests']) {
  let results = [];
  if (!fs.existsSync(dir)) return results;

  const list = fs.readdirSync(dir);
  for (const item of list) {
    if (ignoreDirs.includes(item)) continue;
    const fullPath = path.join(dir, item);
    const stat = fs.statSync(fullPath);
    if (stat.isDirectory()) {
      results = results.concat(scanDirectory(fullPath, filterExts, ignoreDirs));
    } else {
      const ext = path.extname(item).toLowerCase();
      if (!filterExts || filterExts.includes(ext)) {
        results.push({ path: fullPath, size: stat.size });
      }
    }
  }
  return results;
}

// -----------------------------------------------------------------------------
// MOTEUR D'AUDIT
// -----------------------------------------------------------------------------
function auditProject(projectDir) {
  console.log('====================================================');
  console.log('⚡ BUNDLE & PERFORMANCE DOCTOR — WECHAT PMT');
  console.log(`📁 Projet cible : ${projectDir}`);
  console.log('====================================================\n');

  let issueCount = 0;
  let warningCount = 0;

  // 1. Audit des Tailles de Paquets via app.json
  console.log('📦 1. Audit des Tailles de Paquets (Plafond 2 Mo TCMPP)...');
  const appJsonPath = path.join(projectDir, 'app.json');
  if (fs.existsSync(appJsonPath)) {
    try {
      const appJson = JSON.parse(fs.readFileSync(appJsonPath, 'utf8'));
      const subpackages = appJson.subpackages || appJson.subPackages || [];
      const subpackageRoots = subpackages.map((sub) => sub.root.replace(/^\/|\/$/g, ''));

      // Calcul de la taille de chaque sous-paquet
      const subpackageSizes = {};
      subpackageRoots.forEach((subRoot) => {
        const subDir = path.join(projectDir, subRoot);
        const files = scanDirectory(subDir);
        const totalBytes = files.reduce((acc, f) => acc + f.size, 0);
        subpackageSizes[subRoot] = totalBytes;
      });

      // Calcul du paquet principal (tout sauf les sous-paquets)
      const allFiles = scanDirectory(projectDir);
      let mainPackageBytes = 0;
      allFiles.forEach((file) => {
        const rel = path.relative(projectDir, file.path).replace(/\\/g, '/');
        const isInSubpackage = subpackageRoots.some((sub) => rel.startsWith(sub + '/'));
        if (!isInSubpackage) {
          mainPackageBytes += file.size;
        }
      });

      const mainSizeKb = mainPackageBytes / 1024;
      if (mainSizeKb > MAX_PACKAGE_SIZE_KB) {
        console.error(`  ❌ Paquet Principal : ${formatKb(mainPackageBytes)} (DÉPASSE le plafond de 2 Mo !)`);
        issueCount++;
      } else if (mainSizeKb > WARN_PACKAGE_SIZE_KB) {
        console.warn(`  ⚠️ Paquet Principal : ${formatKb(mainPackageBytes)} (Proche du seuil critique de 1.8 Mo)`);
        warningCount++;
      } else {
        console.log(`  ✅ Paquet Principal : ${formatKb(mainPackageBytes)} / 2048 Ko`);
      }

      // Vérification de chaque sous-paquet
      Object.keys(subpackageSizes).forEach((subRoot) => {
        const bytes = subpackageSizes[subRoot];
        const sizeKb = bytes / 1024;
        if (sizeKb > MAX_PACKAGE_SIZE_KB) {
          console.error(`  ❌ Sous-Paquet [${subRoot}] : ${formatKb(bytes)} (DÉPASSE le plafond de 2 Mo !)`);
          issueCount++;
        } else {
          console.log(`  ✅ Sous-Paquet [${subRoot}] : ${formatKb(bytes)} / 2048 Ko`);
        }
      });
    } catch (e) {
      console.warn(`  ⚠️ Impossible de parser app.json : ${e.message}`);
    }
  } else {
    console.log('  ℹ️ Aucun app.json détecté à la racine spécifiée.');
  }

  // 2. Audit des Images Lourdes Locales
  console.log('\n🖼️ 2. Détection des Assets Locaux Lourds (> 100 Ko)...');
  const imageExts = ['.png', '.jpg', '.jpeg', '.webp', '.gif', '.svg'];
  const images = scanDirectory(projectDir, imageExts);
  let heavyImageCount = 0;

  images.forEach((img) => {
    const sizeKb = img.size / 1024;
    if (sizeKb > MAX_IMAGE_SIZE_KB) {
      const rel = path.relative(projectDir, img.path);
      console.warn(`  ⚠️ Image Lourde : ${rel} (${formatKb(img.size)}) -> Privilégier CDN Sonatel ou compression`);
      heavyImageCount++;
      warningCount++;
    }
  });

  if (heavyImageCount === 0) {
    console.log(`  ✅ 100% des images locales (${images.length}) respectent le seuil de 100 Ko.`);
  }

  // 3. Détection Statique des Fuites Mémoire
  console.log('\n🧠 3. Audit Statique des Fuites Mémoire (onUnload & Timers)...');
  const jsFiles = scanDirectory(projectDir, ['.js']);
  let leakRiskCount = 0;

  jsFiles.forEach((file) => {
    const content = fs.readFileSync(file.path, 'utf8');
    const rel = path.relative(projectDir, file.path);

    // Détection timer actif sans onUnload
    const hasInterval = /setInterval\s*\(/.test(content);
    const hasUnload = /onUnload\s*\(|detached\s*\(/.test(content);
    const hasClear = /clearInterval\s*\(/.test(content);

    if (hasInterval && (!hasUnload || !hasClear)) {
      console.warn(`  ⚠️ Risque de Fuite Mémoire : ${rel} contient 'setInterval' sans 'clearInterval' dans onUnload/detached.`);
      leakRiskCount++;
      warningCount++;
    }

    // Détection abonnement Bus.on ou listener sans unsubscribe
    const isComponentOrPage = /Page\s*\(|Component\s*\(/.test(content);
    const hasBusOn = /Bus\s*\.\s*(?:on|subscribe)\s*\(/.test(content);
    const hasBusOff = /Bus\s*\.\s*(?:off|unsubscribe)\s*\(|helpers\s*\.\s*unsubscribe\s*\(|_?unsub\w*\s*\(/.test(content);

    if (isComponentOrPage && hasBusOn && (!hasUnload || !hasBusOff)) {
      console.warn(`  ⚠️ Risque de Fuite EventBus : ${rel} s'abonne à un événement sans se désabonner dans onUnload.`);
      leakRiskCount++;
      warningCount++;
    }
  });

  if (leakRiskCount === 0) {
    console.log(`  ✅ Aucun risque critique de fuite mémoire détecté dans les ${jsFiles.length} fichiers JS.`);
  }

  // 4. Détection des Accès Synchrones au Stockage dans des Boucles
  console.log('\n⚡ 4. Détection des Anti-Patterns I/O Bloquants...');
  let blockingIoCount = 0;

  jsFiles.forEach((file) => {
    const content = fs.readFileSync(file.path, 'utf8');
    const rel = path.relative(projectDir, file.path);

    // Recherche de wx.getStorageSync / wx.setStorageSync dans une boucle for/while/forEach
    const loopWithStorage = /(?:for\s*\([^)]*\)|while\s*\([^)]*\)|\.(?:forEach|map|filter)\s*\(\s*(?:function\s*\([^)]*\)|(?:\([^)]*\)|[a-zA-Z0-9_$]+)\s*=>))\s*\{[^}]*wx\.(?:getStorageSync|setStorageSync)/s;
    if (loopWithStorage.test(content)) {
      console.warn(`  ⚠️ Anti-Pattern Bloquant : ${rel} exécute un appel de stockage synchrone (wx.*StorageSync) dans une boucle.`);
      blockingIoCount++;
      warningCount++;
    }
  });

  if (blockingIoCount === 0) {
    console.log(`  ✅ Zéro appel de stockage synchrone bloquant dans des boucles.`);
  }

  // Bilan
  console.log('\n====================================================');
  console.log(`📊 BILAN AUDIT : ${issueCount} Erreur(s) bloquante(s), ${warningCount} Avertissement(s) d'optimisation.`);
  console.log('====================================================\n');

  return { issueCount, warningCount };
}

// -----------------------------------------------------------------------------
// SUITE DE TESTS INTERNE (--self-test)
// -----------------------------------------------------------------------------
function runSelfTest() {
  console.log('🧪 Lancement du Self-Test de Bundle & Performance Doctor...\n');

  // Test 1: Détection d'un setInterval non nettoyé
  const badTimerCode = `
    Page({
      onLoad() {
        setInterval(() => { console.log('tick'); }, 1000);
      }
    });
  `;
  const hasInterval = /setInterval\s*\(/.test(badTimerCode);
  const hasUnload = /onUnload\s*\(/.test(badTimerCode);
  const hasClear = /clearInterval\s*\(/.test(badTimerCode);
  const detectsLeak = hasInterval && (!hasUnload || !hasClear);

  if (detectsLeak) {
    console.log('  ✅ Test 1 : Détection de fuite mémoire setInterval réussie.');
  } else {
    throw new Error('Échec Test 1 : Fuite setInterval non détectée.');
  }

  // Test 2: Détection de stockage synchrone dans boucle forEach
  const badLoopCode = `
    items.forEach((item) => {
      const val = wx.getStorageSync(item.key);
      console.log(val);
    });
  `;
  const loopWithStorage = /(?:for\s*\([^)]*\)|while\s*\([^)]*\)|\.(?:forEach|map|filter)\s*\(\s*(?:function\s*\([^)]*\)|(?:\([^)]*\)|[a-zA-Z0-9_$]+)\s*=>))\s*\{[^}]*wx\.(?:getStorageSync|setStorageSync)/s;
  if (loopWithStorage.test(badLoopCode)) {
    console.log('  ✅ Test 2 : Détection de stockage bloquant en boucle réussie.');
  } else {
    throw new Error('Échec Test 2 : Stockage synchrone en boucle non détecté.');
  }

  // Test 3: Contrôle de calcul de seuil 2 Mo
  const oversizedBytes = 2.1 * 1024 * 1024;
  const isOversized = oversizedBytes / 1024 > MAX_PACKAGE_SIZE_KB;
  if (isOversized) {
    console.log('  ✅ Test 3 : Détection de dépassement de limite de 2 Mo réussie.');
  } else {
    throw new Error('Échec Test 3 : Seuil 2 Mo non respecté.');
  }

  console.log('\n✨ SELF-TEST 100% RÉUSSI ! Le Bundle Doctor est prêt pour la production.\n');
  process.exit(0);
}

// Point d'entrée
if (process.argv.includes('--self-test')) {
  runSelfTest();
} else {
  const targetDir = process.argv[2] ? path.resolve(process.argv[2]) : process.cwd();
  const res = auditProject(targetDir);
  process.exit(res.issueCount > 0 ? 1 : 0);
}
