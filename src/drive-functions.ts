import * as fs from 'fs';
import { google } from 'googleapis';
import path from 'path';

const SERVICE_ACCOUNT_KEY_FILE = process.env.SERVICE_ACCOUNT_KEY_FILE!;
const folderId = process.env.FOLDER_ID!;

export async function getFileList() {
  const auth = new google.auth.GoogleAuth({
    keyFile: SERVICE_ACCOUNT_KEY_FILE,
    scopes: ['https://www.googleapis.com/auth/drive'],
  });

  const drive = google.drive({ version: 'v3', auth });

  const response = await drive.files.list({
    q: `'${folderId}' in parents and trashed=false`,
    fields: 'files(id, name)',
  });

  return response.data.files || [];
}

export async function downloadFile(fileId: string) {
  const auth = new google.auth.GoogleAuth({
    keyFile: SERVICE_ACCOUNT_KEY_FILE,
    scopes: ['https://www.googleapis.com/auth/drive'],
  });
  const drive = google.drive({ version: 'v3', auth });
  const response = await drive.files.get(
    {
      fileId: fileId,
      alt: 'media',
    },
    { responseType: 'stream' },
  );
  return response.data;
}

export async function uploadZipFile(filename: string, file?: fs.ReadStream) {
  if (!filename.endsWith('.zip')) throw new Error('O arquivo deve ter extensão .zip');

  const auth = new google.auth.GoogleAuth({
    keyFile: SERVICE_ACCOUNT_KEY_FILE,
    scopes: ['https://www.googleapis.com/auth/drive'],
  });

  const drive = google.drive({ version: 'v3', auth });

  const filePath = path.join(filename);
  const fileMetadata = {
    name: path.basename(filename), // apenas o nome do arquivo
    parents: [folderId],
  };

  const media = {
    mimeType: 'application/zip',
    body: file || fs.createReadStream(filePath),
  };

  const existingFiles = await drive.files.list({
    q: `'${folderId}' in parents and name='${fileMetadata.name}' and trashed=false`,
    fields: 'files(id, name)',
  });

  if (existingFiles.data.files?.length) {
    const existingFileId = existingFiles.data.files[0].id;
    await drive.files.delete({ fileId: existingFileId! });
  }

  const response = await drive.files.create({
    requestBody: fileMetadata,
    media,
    fields: 'id',
  });

  return response;
}

export async function updateFile(fileId: string, filename: string) {
  if (!filename.endsWith('.zip')) throw new Error('O arquivo deve ter extensão .zip');

  const auth = new google.auth.GoogleAuth({
    keyFile: SERVICE_ACCOUNT_KEY_FILE,
    scopes: ['https://www.googleapis.com/auth/drive'],
  });

  const drive = google.drive({ version: 'v3', auth });

  const filePath = path.join(filename);
  const media = {
    mimeType: 'application/zip',
    body: fs.createReadStream(filePath),
  };

  const response = await drive.files.update({
    fileId,
    media,
    fields: 'id',
  });

  return response;
}
