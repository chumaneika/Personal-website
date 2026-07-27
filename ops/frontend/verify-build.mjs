import { readdir, readFile, stat } from 'node:fs/promises';
import path from 'node:path';

const supportedWorkspaces = new Set(['frontend-public', 'frontend-admin']);
const workspace = process.argv[2];

if (!supportedWorkspaces.has(workspace)) {
  throw new Error(`Expected one of: ${[...supportedWorkspaces].join(', ')}`);
}

const distDirectory = path.resolve(workspace, 'dist');
const indexPath = path.join(distDirectory, 'index.html');

async function listFiles(directory) {
  const entries = await readdir(directory, { withFileTypes: true });
  const files = await Promise.all(
    entries.map((entry) => {
      const entryPath = path.join(directory, entry.name);
      return entry.isDirectory() ? listFiles(entryPath) : entryPath;
    }),
  );

  return files.flat();
}

const indexHtml = await readFile(indexPath, 'utf8');
const files = await listFiles(distDirectory);
const relativeFiles = files.map((file) => path.relative(distDirectory, file));
const sourceMaps = relativeFiles.filter((file) => file.endsWith('.map'));

if (sourceMaps.length > 0) {
  throw new Error(`${workspace} contains production source maps: ${sourceMaps.join(', ')}`);
}

if (indexHtml.includes('/src/') || indexHtml.includes('localhost')) {
  throw new Error(`${workspace}/dist/index.html contains a development reference`);
}

const assetReferences = [
  ...indexHtml.matchAll(/(?:src|href)="(\/assets\/[^"]+\.(?:css|js))"/g),
].map((match) => match[1]);

if (!assetReferences.some((asset) => asset.endsWith('.js'))) {
  throw new Error(`${workspace}/dist/index.html does not reference a JavaScript bundle`);
}

if (!assetReferences.some((asset) => asset.endsWith('.css'))) {
  throw new Error(`${workspace}/dist/index.html does not reference a stylesheet`);
}

await Promise.all(
  assetReferences.map(async (asset) => {
    const assetPath = path.join(distDirectory, asset.replace(/^\//, ''));
    const metadata = await stat(assetPath);

    if (!metadata.isFile() || metadata.size === 0) {
      throw new Error(`${asset} is missing or empty`);
    }
  }),
);

console.log(
  `${workspace}: verified ${relativeFiles.length} production files and ${assetReferences.length} entry assets`,
);
