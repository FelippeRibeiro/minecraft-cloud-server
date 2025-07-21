# 🎮 Servidor Compartilhado de Minecraft – Setup Automático

Este projeto foi criado para um **grupo fechado de amigos do Discord** que compartilham um **servidor personalizado de Minecraft**. Ele automatiza o processo de **atualização e inicialização do servidor local**, integrando com o **Google Drive** para manter os arquivos sincronizados e enviando notificações para um **webhook no Discord**.

## 📦 Funcionalidades

- 🔒 **Validação de variáveis de ambiente** obrigatórias para o funcionamento:
  - `SERVICE_ACCOUNT_KEY_FILE`
  - `FOLDER_ID`
  - `DISCORD_WEBHOOK_URL`

- ☁️ **Download automático** do `server.zip` hospedado no Google Drive, contendo os arquivos mais recentes do servidor.

- 🧹 **Limpador de diretório local:** remove a pasta antiga do servidor antes de baixar e extrair a nova versão.

- 🧩 **Descompactação automática** do arquivo ZIP na pasta correta do projeto.

- 🚀 **Inicialização automatizada do servidor local** com configuração de memória customizada.

- 🛑 **Interceptação do `Ctrl+C`** (SIGINT) para salvar automaticamente o estado do servidor antes de fechar.

- 💾 **Compactação e upload** do estado salvo para o Google Drive.

- 🔔 **Notificações no Discord** via webhook, informando eventos como:
  - Início do servidor
  - Salvar automático completo
  - Erros no salvamento

---

## ⚙️ Requisitos

- Node.js 18+
- Conta de serviço do Google configurada com acesso à pasta no Drive
- Variáveis de ambiente configuradas:

```
SERVICE_ACCOUNT_KEY_FILE=./service-account.json
FOLDER_ID=xxxxxxxxxxxxxxxxxxx
DISCORD_WEBHOOK_URL=https://discord.com/api/webhooks/xxxxxxxxx
```

---

## 🚀 Como usar

1. Instale as dependências:

   ```bash
   npm install
   ```

2. Configure suas variáveis de ambiente (arquivo `.env` ou direto no sistema).

3. Rode o projeto:
   ```bash
   node src/index.ts
   ```

---

## ✅ Melhorias sugeridas

- [ ] 🔐 Suporte para múltiplas versões do servidor com histórico no Drive
- [ ] 🌐 Painel web para gerenciamento do servidor (start/stop/status)
- [ ] 📜 Logs persistentes e exportáveis
- [ ] 🔄 Backup automático programado por cron
- [ ] 💬 Comandos diretamente no Discord para interagir com o servidor
- [ ] 🧵 Sistema de permissões por usuário ao salvar ou iniciar o servidor

---

## 👥 Sobre

Esse projeto foi desenvolvido exclusivamente para um grupo privado de amigos no Discord, com o objetivo de facilitar o compartilhamento e manutenção de um servidor de Minecraft de forma colaborativa e segura. Mas caso queira participar, abra uma PR :)

---

## 🛠️ Arquitetura

- **Node.js** para scripts e controle de processos
- **Google Drive API** para armazenamento dos arquivos do servidor
- **Discord Webhook** para notificações automatizadas
- **`child_process`** para execução do servidor
- **`AdmZip`** para manipulação de arquivos ZIP

---

## ⚠️ Aviso

> Este projeto **não é um serviço público ou comercial**. Seu uso está restrito ao grupo privado original, e não há garantias de suporte ou continuidade.

---
