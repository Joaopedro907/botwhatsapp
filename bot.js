const express = require('express');
const { Client, LocalAuth } = require('whatsapp-web.js');
const qrcode = require('qrcode-terminal');

const app = express();
const PORT = process.env.PORT || 8000;

// ===== SERVIDOR WEB =====
app.get('/', (req, res) => {
  res.send('Bot WhatsApp rodando 🚀');
});

app.listen(PORT, () => {
  console.log(`Servidor rodando na porta ${PORT}`);
});

// ===== CONTROLE DE ESTADO =====
const userState = {};

// ===== WHATSAPP CLIENT =====
const client = new Client({
  authStrategy: new LocalAuth({
    dataPath: '/app/session'
  }),
  puppeteer: {
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  }
});

// ===== QR =====
client.on('qr', (qr) => {
  console.log('\n🔵 Escaneie o QR Code:\n');
  qrcode.generate(qr, { small: true });
});

client.on('ready', () => {
  console.log('✅ Bot conectado com sucesso!');
});

// ===== MENU PRINCIPAL =====
function menuPrincipal() {
  return `
📋 *MENU PRINCIPAL*

1️⃣ - Solicitar Orçamento
2️⃣ - Suporte Imediato
3️⃣ - Outros

0️⃣ - Voltar ao menu principal
9️⃣ - Encerrar atendimento
`;
}

// ===== SUBMENU ORÇAMENTO =====
function submenuOrcamento() {
  return `
💰 *ORÇAMENTO*

1️⃣ - Notebook (Hardware)
2️⃣ - Programa (Software)
3️⃣ - Desenvolvimento de Portfólio

0️⃣ - Voltar ao menu anterior
9️⃣ - Encerrar atendimento
`;
}

// ===== RECEBER MENSAGENS =====
client.on('message', async (message) => {
  const userId = message.from;
  const msg = message.body.trim();

  if (!userState[userId]) {
    userState[userId] = { etapa: 'menu' };
    return message.reply(menuPrincipal());
  }

  const etapa = userState[userId].etapa;

  // ENCERRAR
  if (msg === '9') {
    delete userState[userId];
    return message.reply('❌ Atendimento encerrado. Digite qualquer mensagem para iniciar novamente.');
  }

  // VOLTAR AO MENU PRINCIPAL
  if (msg === '0' && etapa === 'menu') {
    return message.reply(menuPrincipal());
  }

  // ===== MENU PRINCIPAL =====
  if (etapa === 'menu') {

    if (msg === '1') {
      userState[userId].etapa = 'orcamento';
      return message.reply(submenuOrcamento());
    }

    if (msg === '2') {
      return message.reply('🛠️ Suporte imediato selecionado. Descreva seu problema.');
    }

    if (msg === '3') {
      return message.reply('📌 Digite sua dúvida ou solicitação.');
    }

    return message.reply(menuPrincipal());
  }

  // ===== SUBMENU ORÇAMENTO =====
  if (etapa === 'orcamento') {

    if (msg === '0') {
      userState[userId].etapa = 'menu';
      return message.reply(menuPrincipal());
    }

    if (msg === '1') {
      return message.reply('💻 Notebook selecionado.\nDescreva as peças desejadas e informe seu nome e email.');
    }

    if (msg === '2') {
      return message.reply('🖥️ Programa selecionado.\nInforme quais programas deseja instalar e seu nome + email.');
    }

    if (msg === '3') {
      return message.reply('🌐 Desenvolvimento de Portfólio.\nDescreva o tipo de site que deseja e envie seu nome + email.');
    }

    return message.reply(submenuOrcamento());
  }

});

client.initialize();
