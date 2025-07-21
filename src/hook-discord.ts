import axios from 'axios';

export async function hookDiscord(message: string, titulo: string, profilePic?: string) {
  try {
    await axios({
      method: 'post',
      url: process.env.DISCORD_WEBHOOK_URL!,
      data: {
        embeds: [
          {
            title: titulo,
            description: message,
            color: 16776960,
          },
        ],
      },
    });
  } catch (error: any) {
    console.log(error.message);
  }
}
