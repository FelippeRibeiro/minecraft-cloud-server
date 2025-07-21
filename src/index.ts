import 'dotenv/config';

if (!process.env.SERVICE_ACCOUNT_KEY_FILE) throw new Error('SERVICE_ACCOUNT_KEY_FILE environment variable is not set.');
if (!process.env.FOLDER_ID) throw new Error('FOLDER_ID environment variable is not set.');
if (!process.env.DISCORD_WEBHOOK_URL) throw new Error('DISCORD_WEBHOOK_URL environment variable is not set.');

import fs from 'fs';
import path from 'path';

import AdmZip from 'adm-zip';
import { downloadFile, getFileList, uploadZipFile } from './drive-functions';

import { spawn } from 'child_process';
import { hookDiscord } from './hook-discord';
import axios from 'axios';
import { userInfo } from 'os';

const SERVER_ZIP_FILENAME = 'server.zip';

const SERVER_DIR = path.join(__dirname, '..', 'server');
const SERVER_ZIP_PATH = path.join(__dirname, '..', SERVER_ZIP_FILENAME);

async function main() {
  console.log('Starting server setup...');
  console.log('Deleting local server directory if it exists...');
  deleteLocalServer();

  console.log('Fetching latest server updates from Google Drive...');
  const files = await getFileList();
  if (files.length === 0) {
    console.log('No files found in Google Drive. Exiting setup.');
    return;
  }
  const serverFile = files.find((file) => file.name === SERVER_ZIP_FILENAME);
  if (!serverFile) {
    console.log(`No server file found with name ${SERVER_ZIP_FILENAME}. Exiting setup.`);
    return;
  }

  console.log(`Found server file: ${serverFile.name} (ID: ${serverFile.id})`);
  const fileStream = await downloadFile(serverFile.id!);

  const writeStream = fs.createWriteStream(SERVER_ZIP_PATH);
  fileStream.pipe(writeStream);
  await new Promise((resolve, reject) => {
    writeStream.on('finish', () => resolve(''));
    writeStream.on('error', reject);
  });

  console.log('Server file downloaded successfully.');

  console.log('Setting up local server directory...');

  const fileZip = new AdmZip(SERVER_ZIP_PATH);
  fileZip.extractAllTo(path.join(__dirname, '..'), true);
  console.log('Server files extracted successfully.');
  if (fs.existsSync(SERVER_ZIP_PATH)) {
    fs.unlinkSync(SERVER_ZIP_PATH);
    console.log('Temporary server zip file deleted.');
  }

  console.log('Local server setup completed successfully.');

  console.log('Starting local server...');

  await startServer();
}

function deleteLocalServer() {
  console.log('Deleting local server directory:', SERVER_DIR);
  if (fs.existsSync(SERVER_DIR)) fs.rmSync(SERVER_DIR, { recursive: true, force: true });
  console.log('Local server directory deleted:', SERVER_DIR);
}

async function startServer() {
  const {
    data: { ip },
  } = await axios.get<{ ip: string }>('https://api.ipify.org?format=json');

  const server = spawn('java', ['-Xmx6G', '-Xms4G', '-jar', 'server.jar', 'nogui'], {
    cwd: SERVER_DIR,
    stdio: ['pipe', 'pipe', 'pipe'], // stdin, stdout, stderr = pipes (valor padrão)
  });

  server.stdout.on('data', (chunk) => process.stdout.write(chunk));
  server.stderr.on('data', (chunk) => process.stderr.write(chunk));

  process.stdin.pipe(server.stdin);

  process.on('SIGINT', () => {
    console.log('\nEnviando comando "stop" ao servidor…');
    server.stdin.write('stop\n');

    server.once('close', () => () => saveServerAndExit());
    setTimeout(
      () => {
        console.log('Servidor não respondeu ao comando "stop". Forçando a saída.');
        hookDiscord(
          'Ocorreu um erro ao salvar o servidor. Por favor, envie as alterações manualmente.\nO usuário ' +
            userInfo().username +
            ' tentou salvar alterações mas ocorreu um erro. Envie as alterações manualmente.',
          'Erro ao Salvar Servidor',
        );
        process.exit(1);
      },
      4 * 60 * 1000,
    );
  });

  console.log(`Servidor iniciado (IP público: ${ip}). Digite comandos abaixo:`);
}

async function saveServerAndExit() {
  try {
    const zip = new AdmZip();
    zip.addLocalFolder(SERVER_DIR);
    zip.writeZip(SERVER_ZIP_FILENAME);
    console.log('Server files zipped successfully.');
    await uploadZipFile(SERVER_ZIP_FILENAME, fs.createReadStream(SERVER_ZIP_FILENAME));
    console.log('Server zip file uploaded successfully.');
    await hookDiscord(
      'O servidor foi salvo com sucesso e atualizado no Google Drive.\nO usuário ' + userInfo().username + ' Salvou novas alterações.',
      'Servidor Salvo',
    );
  } catch (error) {
    console.error('Erro ao salvar alteração do servudir, envie as alteraçõe manualmente:');
    await hookDiscord(
      'Ocorreu um erro ao salvar o servidor. Por favor, envie as alterações manualmente.\nO usuário ' +
        userInfo().username +
        ' tentou salvar alterações mas ocorreu um erro. Envie as alterações manualmente.',
      'Erro ao Salvar Servidor',
    );
  }
}
main();
