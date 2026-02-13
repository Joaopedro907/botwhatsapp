const express = require('express');
const { Client, LocalAuth } = require('whatsapp-web.js');
const qrcode = require('qrcode-terminal');

const app = express();
const PORT = process.env.PORT || 8000;

/*
=========================
SERVIDOR EXPRESS
=========================
*/

app.get('/', (req, res) => {
    res.send('Bot WhatsApp está rodando 🚀');
});

app.listen(PORT, () => {
    console.log(`Servidor rodando na porta ${PORT}`);
});

/*
=========================
WHATSAPP CLIENT
=========================
*/

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
            '--disable-accelerated-2d-canvas',
            '--no-first-run',
            '--no-zygote',
            '--single-process',
            '--disable-gpu'
        ]
    }
});

/*
=========================
EVENTOS
=========================
*/

client.on('qr', (qr) => {
    console.log('\nEscaneie o QR Code abaixo:\n');
    qrcode.generate(qr, { small: true });
});

client.on('ready', () => {
    console.log('✅ Bot está pronto!');
});

client.on('authenticated', () => {
    console.log('🔐 Autenticado com sucesso!');
});

client.on('auth_failure', msg => {
    console.error('❌ Falha na autenticação', msg);
});

client.on('disconnected', (reason) => {
    console.log('⚠️ Bot desconectado:', reason);
});

/*
=========================
RESPOSTA AUTOMÁTICA
=========================
*/

client.on('message', async msg => {
    if (msg.body.toLowerCase() === 'oi') {
        msg.reply('Olá! 👋 Como posso te ajudar?');
    }
});

/*
=========================
INICIALIZAÇÃO
=========================
*/

client.initialize();
