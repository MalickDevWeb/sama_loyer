#!/usr/bin/env node

/**
 * ⚡ CREATE-API — WeChat PMT
 * Générateur de service API et de mappeur de données json-sculpt conformes.
 * 
 * Usage :
 *   node create-api.js <nom-domaine> [--base-dir <dossier>]
 * 
 * Exemples :
 *   node create-api.js commande
 *   node create-api.js flight
 *   node create-api.js ticket --base-dir .
 */

const fs = require('fs');
const path = require('path');

const args = process.argv.slice(2);
let domainName = null;
let baseDir = process.cwd();

for (let i = 0; i < args.length; i++) {
  if (args[i] === '--base-dir' && args[i + 1]) {
    baseDir = path.resolve(process.cwd(), args[i + 1]);
    i++;
  } else if (!args[i].startsWith('--')) {
    domainName = args[i].toLowerCase().replace(/[^a-z0-9_-]/g, '');
  }
}

if (!domainName) {
  console.log('Usage: node create-api.js <nom-domaine> [--base-dir <dossier>]');
  console.log('Exemples:');
  console.log('  node create-api.js commande');
  console.log('  node create-api.js user');
  process.exit(1);
}

// Convertisseurs de casse
function toCamelCase(str) {
  return str.replace(/[-_]([a-z])/g, g => g[1].toUpperCase());
}

function toPascalCase(str) {
  const camel = toCamelCase(str);
  return camel.charAt(0).toUpperCase() + camel.slice(1);
}

const camel = toCamelCase(domainName);
const pascal = toPascalCase(domainName);
const upper = domainName.toUpperCase().replace(/-/g, '_');

// Chemins cibles
const apisDir = path.join(baseDir, 'utils', 'apis');
const mappersDir = path.join(baseDir, 'utils', 'mappers');

if (!fs.existsSync(apisDir)) fs.mkdirSync(apisDir, { recursive: true });
if (!fs.existsSync(mappersDir)) fs.mkdirSync(mappersDir, { recursive: true });

// -----------------------------------------------------------------------------
// 1. MAPPEUR (utils/mappers/<domaine>.js)
// -----------------------------------------------------------------------------
const mapperContent = `// ============================================================================
// ${upper} SCHEMA — Mappeur de données json-sculpt
// Nettoie et formate la donnée brute envoyée par le serveur
// ============================================================================

export const ${camel}Schema = {
  id: "@link.id",
  title: "@link.title",
  createdAt: "@link.created_at",
  isActive: "@link.is_active::boolean",
  amount: "@link.amount::number",
};

export const ${camel}ListSchema = {
  items: {
    "@link": "data",
    "@schema": ${camel}Schema,
  },
  total: "@link.total::number",
};
`;

// -----------------------------------------------------------------------------
// 2. SERVICE API (utils/apis/<domaine>.api.js)
// -----------------------------------------------------------------------------
const apiContent = `// ============================================================================
// ${upper} API SERVICE — WeChat PMT
// Standard : Auth OAuth2 avec buffer de 60s, json-sculpt, httpClient
// ============================================================================

import { httpClient } from '../http/index.js';
import { authenticate } from '../auth/index.js';
import { sculpt } from '../mappers/index.js';
import { ${camel}Schema, ${camel}ListSchema } from '../mappers/${domainName}.js';

const ENDPOINTS = {
  LIST: '/api/v1/${domainName}s',
  DETAIL: '/api/v1/${domainName}s/:id',
};

class ${pascal}API {
  /**
   * Récupère la liste paginée
   */
  async getList(query = {}) {
    await authenticate();
    const res = await httpClient.get(ENDPOINTS.LIST, { query });
    if (!res.success) {
      throw new Error(res.error?.message || 'Impossible de récupérer la liste.');
    }
    return sculpt.data({ data: res.data, to: ${camel}ListSchema });
  }

  /**
   * Récupère le détail par ID
   */
  async getById(id) {
    if (!id) throw new Error('ID requis pour charger le détail.');
    await authenticate();
    const endpoint = ENDPOINTS.DETAIL.replace(':id', encodeURIComponent(id));
    const res = await httpClient.get(endpoint);
    if (!res.success) {
      throw new Error(res.error?.message || 'Élément introuvable.');
    }
    return sculpt.data({ data: res.data, to: ${camel}Schema });
  }
}

export const ${camel}API = new ${pascal}API();
`;

// Écriture en UTF-8 sans BOM
const mapperFile = path.join(mappersDir, `${domainName}.js`);
const apiFile = path.join(apisDir, `${domainName}.api.js`);

fs.writeFileSync(mapperFile, mapperContent, { encoding: 'utf8' });
console.log(`  ✅ Créé : ${path.relative(process.cwd(), mapperFile)}`);

fs.writeFileSync(apiFile, apiContent, { encoding: 'utf8' });
console.log(`  ✅ Créé : ${path.relative(process.cwd(), apiFile)}`);

console.log(`\n🎉 Module API [${domainName}] créé avec succès !`);
console.log(`👉 N'oubliez pas d'enregistrer le service dans utils/apis/index.js :`);
console.log(`   export { ${camel}API } from './${domainName}.api.js';\n`);

