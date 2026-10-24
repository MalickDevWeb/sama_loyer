// tests/zip.test.js
import assert from 'node:assert';
import { createZipArchive, crc32 } from '../utils/helpers/zip.js';

export async function runZipTests() {
  console.log('\n--- Test Suite 4: PKZIP Builder ---');
  let passed = 0;

  // Test 1: CRC32 computation
  const testData = new TextEncoder().encode('hello');
  assert.strictEqual(crc32(testData), 0x3610a686, 'CRC32 de "hello" doit valoir 0x3610a686');
  console.log('  ✓ CRC32 computation matches PKZIP standard');
  passed++;

  // Test 2: Archive creation with multiple files
  const file1 = { name: 'affiche-1.txt', data: new TextEncoder().encode('Contenu affiche 1') };
  const file2 = { name: 'affiche-2.txt', data: new TextEncoder().encode('Contenu affiche 2') };
  const zipBuffer = createZipArchive([file1, file2]);

  assert(zipBuffer instanceof ArrayBuffer, 'createZipArchive doit retourner un ArrayBuffer');
  assert(zipBuffer.byteLength > 100, 'L’archive doit contenir les headers locaux, le répertoire central et EOCD');

  const view = new DataView(zipBuffer);
  // Check local header 1 signature 0x04034b50
  assert.strictEqual(view.getUint32(0, true), 0x04034b50, 'Premier fichier doit débuter par le header local standard PKZIP');
  console.log('  ✓ Multi-file ZIP archive generated with standard PKZIP headers');
  passed++;

  return passed;
}

