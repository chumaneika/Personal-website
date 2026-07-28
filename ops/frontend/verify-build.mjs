import { readdir, readFile, stat } from 'node:fs/promises';
import path from 'node:path';

const supportedWorkspaces = new Set(['frontend-public', 'frontend-admin']);
const workspace = process.argv[2];

if (!supportedWorkspaces.has(workspace)) {
  throw new Error(`Expected one of: ${[...supportedWorkspaces].join(', ')}`);
}

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

async function verifyFilesDoNotContainSourceMaps(directory) {
  const files = await listFiles(directory);
  const relativeFiles = files.map((file) => path.relative(directory, file));
  const sourceMaps = relativeFiles.filter((file) => file.endsWith('.map'));

  if (sourceMaps.length > 0) {
    throw new Error(`${workspace} contains production source maps: ${sourceMaps.join(', ')}`);
  }

  return { files, relativeFiles };
}

async function verifyPublicSsrBuild() {
  const buildDirectory = path.resolve(workspace, 'build');
  const clientDirectory = path.join(buildDirectory, 'client');
  const serverEntryPath = path.join(buildDirectory, 'server', 'index.js');
  const { files, relativeFiles } = await verifyFilesDoNotContainSourceMaps(buildDirectory);
  const serverEntry = await readFile(serverEntryPath, 'utf8');
  const clientAssets = files.filter(
    (file) => file.startsWith(`${clientDirectory}${path.sep}`) && /\.(?:css|js)$/.test(file),
  );

  if (serverEntry.includes('PUBLIC_BACKEND_INTERNAL_URL="')) {
    throw new Error('frontend-public server bundle contains an embedded backend URL');
  }

  if (!clientAssets.some((asset) => asset.endsWith('.js'))) {
    throw new Error('frontend-public build/client does not contain a JavaScript bundle');
  }

  if (!clientAssets.some((asset) => asset.endsWith('.css'))) {
    throw new Error('frontend-public build/client does not contain a stylesheet');
  }

  await Promise.all(
    [serverEntryPath, ...clientAssets].map(async (file) => {
      const metadata = await stat(file);

      if (!metadata.isFile() || metadata.size === 0) {
        throw new Error(`${path.relative(buildDirectory, file)} is missing or empty`);
      }
    }),
  );

  console.log(
    `${workspace}: verified ${relativeFiles.length} SSR production files, the server entry, and ${clientAssets.length} client assets`,
  );
}

async function verifyAdminSpaBuild() {
  const distDirectory = path.resolve(workspace, 'dist');
  const indexPath = path.join(distDirectory, 'index.html');
  const indexHtml = await readFile(indexPath, 'utf8');
  const { relativeFiles } = await verifyFilesDoNotContainSourceMaps(distDirectory);

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
    `${workspace}: verified ${relativeFiles.length} SPA production files and ${assetReferences.length} entry assets`,
  );
}

if (workspace === 'frontend-public') {
  await verifyPublicSsrBuild();
} else {
  await verifyAdminSpaBuild();
}
