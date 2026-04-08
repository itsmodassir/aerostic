import fs from 'node:fs';
import path from 'node:path';
import { spawnSync } from 'node:child_process';

const appName = process.argv[2] || path.basename(process.cwd());

const repoRoot = path.resolve(process.cwd(), '..', '..');
const frontendRoot = path.join(repoRoot, 'frontend');

const defaultTargets = {
  'app-dashboard': path.join(frontendRoot, 'app-dashboard', 'static_runtime'),
  'admin-panel': path.join(frontendRoot, 'admin-panel', 'static_runtime'),
  'reseller-panel': path.join(frontendRoot, 'reseller-panel', 'static_runtime'),
};

const sourceDir = path.join(process.cwd(), '.next', 'static');
const targetDir = process.env.NEXT_STATIC_RUNTIME_TARGET || defaultTargets[appName];
const containerName = process.env.NEXT_STATIC_RUNTIME_CONTAINER || 'aimstors-nginx';

function syncViaSudo() {
  const mkdirResult = spawnSync('sudo', ['mkdir', '-p', targetDir], {
    stdio: 'pipe',
    encoding: 'utf8',
  });

  if (mkdirResult.status !== 0) {
    throw new Error(mkdirResult.stderr.trim() || mkdirResult.stdout.trim() || 'sudo mkdir failed');
  }

  const rsyncResult = spawnSync('sudo', ['rsync', '-a', '--delete', `${sourceDir}/`, `${targetDir}/`], {
    stdio: 'pipe',
    encoding: 'utf8',
  });

  if (rsyncResult.status !== 0) {
    throw new Error(rsyncResult.stderr.trim() || rsyncResult.stdout.trim() || 'sudo rsync failed');
  }
}

if (!targetDir) {
  console.log(`[sync-static-runtime] No runtime target configured for ${appName}; skipping.`);
  process.exit(0);
}

if (!fs.existsSync(sourceDir)) {
  console.warn(`[sync-static-runtime] Source directory missing: ${sourceDir}`);
  process.exit(0);
}

function syncViaDocker() {
  const mkdirResult = spawnSync('docker', ['exec', containerName, 'mkdir', '-p', targetDir], {
    stdio: 'pipe',
    encoding: 'utf8',
  });

  if (mkdirResult.status !== 0) {
    throw new Error(mkdirResult.stderr.trim() || mkdirResult.stdout.trim() || 'docker exec mkdir failed');
  }

  const cpResult = spawnSync('docker', ['cp', `${sourceDir}/.`, `${containerName}:${targetDir}`], {
    stdio: 'pipe',
    encoding: 'utf8',
  });

  if (cpResult.status !== 0) {
    throw new Error(cpResult.stderr.trim() || cpResult.stdout.trim() || 'docker cp failed');
  }
}

try {
  fs.mkdirSync(targetDir, { recursive: true });
  fs.cpSync(sourceDir, targetDir, { recursive: true, force: true });
  console.log(`[sync-static-runtime] Synced ${sourceDir} -> ${targetDir}`);
} catch (error) {
  try {
    syncViaSudo();
    console.log(`[sync-static-runtime] Synced ${sourceDir} -> ${targetDir} via sudo`);
  } catch (sudoError) {
    const sudoMessage = sudoError instanceof Error ? sudoError.message : String(sudoError);
    console.warn(`[sync-static-runtime] sudo sync failed: ${sudoMessage}`);
    try {
      syncViaDocker();
      console.log(`[sync-static-runtime] Synced ${sourceDir} -> ${targetDir} via ${containerName}`);
    } catch (dockerError) {
      const message = dockerError instanceof Error ? dockerError.message : String(dockerError);
      console.warn(`[sync-static-runtime] Failed to sync static assets: ${message}`);
    }
  }
}
