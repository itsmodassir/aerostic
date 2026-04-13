import fs from 'node:fs';
import path from 'node:path';
import { spawnSync } from 'node:child_process';

const appName = process.argv[2] || path.basename(process.cwd());

const repoRoot = path.resolve(process.cwd(), '..', '..');
const frontendRoot = path.join(repoRoot, 'frontend');
const standaloneStaticDir = path.join(process.cwd(), '.next', 'standalone', '.next', 'static');

const defaultTargets = {
  'app-dashboard': [
    path.join(frontendRoot, 'app-dashboard', 'static_runtime'),
    standaloneStaticDir,
  ],
  'admin-panel': [
    path.join(frontendRoot, 'admin-panel', 'static_runtime'),
    standaloneStaticDir,
  ],
  'reseller-panel': [
    path.join(frontendRoot, 'reseller-panel', 'static_runtime'),
    standaloneStaticDir,
  ],
};

const sourceDir = path.join(process.cwd(), '.next', 'static');
const configuredTargets = process.env.NEXT_STATIC_RUNTIME_TARGET
  ? process.env.NEXT_STATIC_RUNTIME_TARGET.split(',').map((value) => value.trim()).filter(Boolean)
  : defaultTargets[appName];
const targetDirs = Array.isArray(configuredTargets)
  ? configuredTargets
  : configuredTargets
    ? [configuredTargets]
    : [];
const containerName = process.env.NEXT_STATIC_RUNTIME_CONTAINER || 'aimstors-nginx';

function syncViaSudo(targetDir) {
  const mkdirResult = spawnSync('sudo', ['mkdir', '-p', targetDir], { stdio: 'pipe', encoding: 'utf8' });
  if (mkdirResult.status !== 0) {
    throw new Error(mkdirResult.stderr.trim() || mkdirResult.stdout.trim() || `sudo mkdir failed for ${targetDir}`);
  }

  const rsyncResult = spawnSync('sudo', ['rsync', '-a', '--delete', `${sourceDir}/`, `${targetDir}/`], {
    stdio: 'pipe',
    encoding: 'utf8',
  });
  if (rsyncResult.status !== 0) {
    throw new Error(rsyncResult.stderr.trim() || rsyncResult.stdout.trim() || `sudo rsync failed for ${targetDir}`);
  }
}

if (targetDirs.length === 0) {
  console.log(`[sync-static-runtime] No runtime target configured for ${appName}; skipping.`);
  process.exit(0);
}

if (!fs.existsSync(sourceDir)) {
  console.warn(`[sync-static-runtime] Source directory missing: ${sourceDir}`);
  process.exit(0);
}

function syncViaDocker(targetDir) {
  const mkdirResult = spawnSync('docker', ['exec', containerName, 'mkdir', '-p', targetDir], {
    stdio: 'pipe',
    encoding: 'utf8',
  });

  if (mkdirResult.status !== 0) {
    throw new Error(mkdirResult.stderr.trim() || mkdirResult.stdout.trim() || `docker exec mkdir failed for ${targetDir}`);
  }

  const cpResult = spawnSync('docker', ['cp', `${sourceDir}/.`, `${containerName}:${targetDir}`], {
    stdio: 'pipe',
    encoding: 'utf8',
  });

  if (cpResult.status !== 0) {
    throw new Error(cpResult.stderr.trim() || cpResult.stdout.trim() || `docker cp failed for ${targetDir}`);
  }
}

for (const targetDir of targetDirs) {
  try {
    fs.mkdirSync(targetDir, { recursive: true });
    fs.cpSync(sourceDir, targetDir, { recursive: true, force: true });
    console.log(`[sync-static-runtime] Synced ${sourceDir} -> ${targetDir}`);
  } catch (error) {
    try {
      syncViaSudo(targetDir);
      console.log(`[sync-static-runtime] Synced ${sourceDir} -> ${targetDir} via sudo`);
    } catch (sudoError) {
      const sudoMessage = sudoError instanceof Error ? sudoError.message : String(sudoError);
      console.warn(`[sync-static-runtime] sudo sync failed: ${sudoMessage}`);
      try {
        syncViaDocker(targetDir);
        console.log(`[sync-static-runtime] Synced ${sourceDir} -> ${targetDir} via ${containerName}`);
      } catch (dockerError) {
        const message = dockerError instanceof Error ? dockerError.message : String(dockerError);
        console.warn(`[sync-static-runtime] Failed to sync static assets to ${targetDir}: ${message}`);
      }
    }
  }
}
