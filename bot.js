const express = require('express');
const { Client, LocalAuth } = require('whatsapp-web.js');
const qrcode = require('qrcode-terminal');

const app = express();
const PORT = process.env.PORT || 3000;

// ===== SERVIDOR PARA RAILWAY =====
app.get('/', (req, res) => {
    res.send('Bot WhatsApp rodando 🚀');
});

app.listen(PORT, () => {
    console.log('Servidor rodando na porta', PORT);
});

// ================= CONFIG BOT =================
const client = new Client({
    authStrategy: new LocalAuth({
        dataPath: './session'
    }),
    puppeteer: {
        headless: true,
        args: [
            '--no-sandbox',
            '--disable-setuid-sandbox',
            '--disable-dev-shm-usage'
        ]
    }
});

let sessoes = {};
const TEMPO_RESET = 30 * 60 * 1000; // 30 minutos

// ================= FUNÇÕES =================
function menuPrincipal() {
    return `Olá! Agradecemos seu contato.
Digite o número confirme a opção desejada para seguirmos com seu atendimento:

1 - Solicitar um orçamento
2 - Suporte imediato
3 - Outros

Digite:
0 - Voltar ao menu principal
9 - Encerrar atendimento`;
}

function menuFinal() {
    return `

Digite:
0 - Voltar ao menu principal
9 - Encerrar atendimento`;
}

// Delay inteligente
function delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

function tempoHumano(texto) {
    const base = 2000;
    const variavel = Math.random() * 3000;
    const tamanho = texto.length * 20;
    return base + variavel + tamanho;
}

async function enviar(message, texto) {
    await message.getChat().then(chat => chat.sendStateTyping());
    await delay(tempoHumano(texto));
    await message.reply(texto + menuFinal());
}

// ================= EVENTOS =================
client.on('qr', (qr) => {
    console.log('\n🔵 Escaneie o QR Code abaixo:\n');
    qrcode.generate(qr, { small: true });
});

client.on('ready', () => {
    console.log('✅ Bot conectado com sucesso!');
});

client.on('disconnected', (reason) => {
    console.log('❌ Bot desconectado:', reason);
});

client.on('message', async (message) => {

    if (message.from.includes('@g.us')) return;
    if (message.fromMe) return;

    const numero = message.from;
    const agora = Date.now();
    const texto = message.body.trim();

    if (!sessoes[numero] || (agora - sessoes[numero].ultimaInteracao) > TEMPO_RESET) {
        sessoes[numero] = { etapa: "menu", ultimaInteracao: agora };

        await message.getChat().then(chat => chat.sendStateTyping());
        await delay(tempoHumano(menuPrincipal()));
        return message.reply(menuPrincipal());
    }

    sessoes[numero].ultimaInteracao = agora;

    // ================= MENU =================
    if (sessoes[numero].etapa === "menu") {

        if (texto === "1") {
            sessoes[numero].etapa = "orcamento";
            return enviar(message, `📌 *Orçamento*
Selecione uma opção:
1 - Notebook (Hardware)
2 - Programa (Software)
3 - Desenvolvimento de Portfólio`);
        }

        if (texto === "2") {
            sessoes[numero].etapa = "suporte";
            return enviar(message, `⚡ *Suporte imediato*
Selecione uma opção:
1 - Problema com notebook ou programa
2 - Colaborador Hausen`);
        }

        if (texto === "3") {
            sessoes[numero].etapa = "outros";
            return enviar(message, `✏️ *Outros*
Escreva detalhadamente o que você precisa para analisarmos.`);
        }

        return message.reply("Opção inválida.\n\n" + menuPrincipal());
    }

    // ================= ORÇAMENTO =================
    if (sessoes[numero].etapa === "orcamento") {

        if (texto === "1") {
            sessoes[numero].etapa = "final";
            return enviar(message, `💻 Você selecionou *Notebook (Hardware)*.
Escreva detalhadamente quais peças você precisa para orçamento.
Informe também seu nome e email.

Obs: Caso não tenhamos em estoque, a compra será feita exclusivamente pelo cliente.`);
        }

        if (texto === "2") {
            sessoes[numero].etapa = "final";
            return enviar(message, `🖥️ Você selecionou *Programa (Software)*.
Descreva quais programas você precisa para orçamento.
Informe também seu nome e email.`);
        }

        if (texto === "3") {
            sessoes[numero].etapa = "final";
            return enviar(message, `🌐 Você selecionou *Desenvolvimento de Portfólio*.
Descreva detalhadamente seu projeto.
Informe também seu nome e email.`);
        }

        return message.reply("Digite uma opção válida.");
    }

    // ================= SUPORTE =================
    if (sessoes[numero].etapa === "suporte") {

        if (texto === "1") {
            sessoes[numero].etapa = "final";
            return enviar(message, `🛠️ Você selecionou *Problema com notebook ou programa*.
Descreva detalhadamente o ocorrido.
Informe também seu nome e email.`);
        }

        if (texto === "2") {
            sessoes[numero].etapa = "final";
            return enviar(message, `📞 Você selecionou *Colaborador Hausen*.

Prezado(a),
Atendimentos relacionados à empresa Hausen devem ser feitos através do departamento TI:

📱 (31) 8454-5644
📧 departamentoti@hausen.eng.br`);
        }

        return message.reply("Digite uma opção válida.");
    }

    // ================= OUTROS =================
    if (sessoes[numero].etapa === "outros") {
        sessoes[numero].etapa = "final";
        return enviar(message, "Recebemos sua mensagem. Nossa equipe irá analisar e entrar em contato.");
    }

    // ================= MENU FINAL =================
    if (texto === "0") {
        sessoes[numero].etapa = "menu";
        return message.reply(menuPrincipal());
    }

    if (texto === "9") {
        delete sessoes[numero];
        return message.reply("Atendimento encerrado. Caso precise, estamos à disposição.");
    }

});

client.initialize();
