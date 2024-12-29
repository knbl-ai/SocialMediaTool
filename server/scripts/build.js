import { exec } from 'child_process';
import fs from 'fs-extra';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const rootDir = path.join(__dirname, '../..');
const clientDir = path.join(rootDir, 'client');
const serverDir = path.join(rootDir, 'server');

async function buildClient() {
  console.log('Building client...');
  return new Promise((resolve, reject) => {
    exec('npm run build', {
      cwd: clientDir
    }, (error, stdout, stderr) => {
      if (error) {
        console.error('Error building client:', error);
        return reject(error);
      }
      console.log(stdout);
      resolve();
    });
  });
}

async function copyClientBuild() {
  const sourceDir = path.join(clientDir, 'dist');
  const targetDir = path.join(serverDir, 'public');

  console.log('Copying client build to server...');
  try {
    await fs.remove(targetDir);
    await fs.copy(sourceDir, targetDir);
    console.log('Successfully copied client build to server');
  } catch (error) {
    console.error('Error copying client build:', error);
    throw error;
  }
}

async function build() {
  try {
    await buildClient();
    await copyClientBuild();
    console.log('Build process completed successfully!');
  } catch (error) {
    console.error('Build process failed:', error);
    process.exit(1);
  }
}

build(); 