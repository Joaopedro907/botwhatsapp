const express = require('express');
const { Client, LocalAuth } = require('whatsapp-web.js');
const qrcode = require('qrcode-terminal');

const app = express();
const PORT = process.env.PORT || 3000;

app.get('/', (req, res) => {
  res.send('Bot WhatsApp rodando 🚀');
});

app.listen(PORT, () => {
  console.log('Servidor rodando na porta', PORT);
});

// ===== CONTROLE DE ESTADO =====
const estados = {};

// ===== CLIENTE WHATSAPP =====
const client = new Client({
  authStrategy: new LocalAuth({
    dataPath: './session'
  }),
  puppeteer: {
    headless: true,
    args: [
      '--no-sandbox',
      '--disable-setuid-sandbox',
      '--disable-dev-shm-usage',
      '--disable-gpu'
    ]
  }
});

// QR CODE
client.on('qr', (qr) => {
  console.log('\n🔵 ESCANEIE O QR CODE:\n');
  qrcode.generate(qr, { small: true });
});

client.on('ready', () => {
  console.log('✅ BOT CONECTADO COM SUCESSO!');
});

client.on('disconnected', () => {
  console.log('❌ Bot desconectado');
});

// ===== MENU PRINCIPAL =====
function menuPrincipal() {
  return `
📋 *MENU PRINCIPAL*

1️⃣ - Orçamento
2️⃣ - Suporte
3️⃣ - Informações

0️⃣ - Voltar ao menu
9️⃣ - Encerrar atendimento
`;
}

// ===== SUBMENU ORÇAMENTO =====
function submenuOrcamento() {
  return `
💰 *ORÇAMENTO*

1️⃣ - Notebook
2️⃣ - Programas
3️⃣ - Portfólio

0️⃣ - Voltar
9️⃣ - Encerrar
`;
}

// ===== RECEBER MENSAGENS =====
client.on('message_create', async (msg) => {

  if (msg.fromMe) return;

  const numero = msg.from;
  const texto = msg.body.trim();

  console.log('Mensagem recebida:', texto);

  if (!estados[numero]) {
    estados[numero] = { etapa: 'menu' };
    return msg.reply(menuPrincipal());
  }

  if (texto === '9') {
    delete estados[numero];
    return msg.reply('❌ Atendimento encerrado. Envie qualquer mensagem para iniciar novamente.');
  }

  if (texto === '0') {
    estados[numero].etapa = 'menu';
    return msg.reply(menuPrincipal());
  }

  if (estados[numero].etapa === 'menu') {

    if (texto === '1') {
      estados[numero].etapa = 'orcamento';
      return msg.reply(submenuOrcamento());
    }

    if (texto === '2') {
      return msg.reply('🛠️ Descreva seu problema.');
    }

    if (texto === '3') {
      return msg.reply('ℹ️ Envie sua dúvida.');
    }

    return msg.reply(menuPrincipal());
  }

  if (estados[numero].etapa === 'orcamento') {

    if (texto === '1') {
      return msg.reply('💻 Orçamento Notebook. Envie nome e email.');
    }

    if (texto === '2') {
      return msg.reply('🖥️ Orçamento Programas. Envie nome e email.');
    }

    if (texto === '3') {
      return msg.reply('🌐 Orçamento Portfólio. Envie nome e email.');
    }

    return msg.reply(submenuOrcamento());
  }

});

client.initialize();
