import axios from 'axios';
import path from 'path';
import fs, { writeFileSync } from 'fs';

export async function downloadMinecraftServerJar(outputDir: string = __dirname): Promise<string> {
  const url = 'https://piston-data.mojang.com/v1/objects/6bce4ef400e4efaa63a13d5e6f6b500be969ef81/server.jar';
  if (!fs.existsSync(outputDir)) fs.mkdirSync(outputDir, { recursive: true });
  const outputPath = path.join(outputDir, 'server.jar');

  try {
    const response = await axios({
      method: 'GET',
      url,
      responseType: 'stream',
    });

    const writer = fs.createWriteStream(outputPath);
    response.data.pipe(writer);

    await new Promise<void>((resolve, reject) => {
      writer.on('finish', resolve);
      writer.on('error', reject);
    });
    writeFileSync(
      path.join(outputDir, 'eula.txt'),
      `#By changing the setting below to TRUE you are indicating your agreement to our EULA (https://aka.ms/MinecraftEULA).
#Sun Jul 20 21:40:10 GMT-03:00 2025
eula=true
`,
    );
    console.log(`✅ Arquivo server.jar salvo em: ${outputPath}`);
    return outputPath;
  } catch (error) {
    console.error('❌ Erro ao baixar o server.jar:', error);
    throw error;
  }
}

async function hasServerFile() {
  const serverFilePath = path.join(__dirname, '..', 'server', 'server.jar');
  return fs.existsSync(serverFilePath);
}

export async function getPublicIp() {
  try {
    const { data } = await axios.get('https://api.ipify.org?format=json');
    return data.ip;
  } catch (error) {
    if (error instanceof Error) console.error('❌ Erro ao obter o IP público:', error.message);
    return 'Falha ao obter IP';
  }
}
