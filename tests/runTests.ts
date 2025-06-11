import fs from 'node:fs/promises';
import path from 'node:path';
import { run } from 'node:test';

const TEST_DIR = import.meta.dirname;
const TEST_FILE_PATTERN = /\.test\.ts$/;

async function findTestFiles(dir: string) {
  const files = await fs.readdir(dir, { withFileTypes: true });
  const testFiles: Array<string> = [];

  for (const file of files) {
    const fullPath = path.join(dir, file.name);

    if (file.isDirectory()) {
      testFiles.push(...(await findTestFiles(fullPath)));
    } else if (TEST_FILE_PATTERN.test(file.name)) {
      testFiles.push(fullPath);
    }
  }

  return testFiles;
}

async function runAllTests() {
  const testFiles = await findTestFiles(TEST_DIR);

  for (const file of testFiles) {
    await import(file);
  }

  run({
    forceExit: true,
  });
}

runAllTests().catch((err) => {
  console.error(err);
  process.exit(1);
});
