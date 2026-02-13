const { Client, LocalAuth } = require('whatsapp-web.js');
const qrcodeTerminal = require('qrcode-terminal');
const QRCode = require('qrcode');
const express = require('express');

const app = express();
let qrCodeData = null;

// ================== SERVIDOR WEB ==================
app.get('/', (req, res) => {
    if (qrCodeData) {
        res.send(`
            <h2>Escaneie o QR Code abaixo:</h2>
            <img src="${qrCodeData}" />
        `);
    } else {
        res.send('QR ainda não gerado ou já conectado.');
    }
});

const PORT = process.env.PORT || 8080;
app.listen(PORT, () => {
    console.log(`Servidor rodando na porta ${PORT}`);
});

// ================== WHATSAPP ==================
const client = new Client({
    authStrategy: new LocalAuth(),
    puppeteer: {
        args: ['--no-sandbox', '--disable-setuid-sandbox']
    }
});

let sessoes = {};
const TEMPO_RESET = 30 * 60 * 1000;

// ================== MENUS ==================
function menuPrincipal() {
    return `Olá! Agradecemos seu contato.
Digite o número da opção desejada:

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
0 - Voltar ao menu anterior
9 - Encerrar atendimento`;
}

// ================== FUNÇÕES AUXILIARES ==================
function delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

function tempoHumano(texto) {
    const base = 2000;
    const variavel = Math.random() * 2000;
    const tamanho = texto.length * 15;
    return base + variavel + tamanho;
}

// ================== EVENTOS ==================
client.on('qr', async (qr) => {
    qrcodeTerminal.generate(qr, { small: true });
    qrCodeData = await QRCode.toDataURL(qr);
    console.log('QR gerado!');
});

client.on('ready', () => {
    console.log('Bot conectado com sucesso!');
    qrCodeData = null;
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
        await message.reply(menuPrincipal());
        return;
    }

    sessoes[numero].ultimaInteracao = agora;

    // ================= MENU PRINCIPAL =================
    if (sessoes[numero].etapa === "menu") {

        let resposta = "";

        switch (texto) {

            case "1":
                sessoes[numero].etapa = "orcamento";
                resposta = `Orçamento
Selecione uma opção:

1 - Notebook (Hardware)
2 - Programa (Software)
3 - Desenvolvimento de Portfólio`;
                break;

            case "2":
                sessoes[numero].etapa = "suporte";
                resposta = `Suporte imediato
Selecione uma opção:

1 - Problema com notebook ou programa
2 - Colaborador Hausen`;
                break;

            case "3":
                sessoes[numero].etapa = "outros";
                resposta = `Outros
Escreva detalhadamente o que você precisa para analisarmos.`;
                break;

            case "9":
                delete sessoes[numero];
                await message.reply("Atendimento encerrado.");
                return;

            default:
                resposta = "Opção inválida.\n\n" + menuPrincipal();
                break;
        }

        resposta += menuFinal();

        await message.getChat().then(chat => chat.sendStateTyping());
        await delay(tempoHumano(resposta));
        await message.reply(resposta);
        return;
    }

    // ================= SUBMENU ORÇAMENTO =================
    if (sessoes[numero].etapa === "orcamento") {

        let resposta = "";

        switch (texto) {

            case "1":
                resposta = `Você selecionou Notebook (Hardware).
Escreva detalhadamente quais peças precisa para orçamento.
Informe também seu nome e email.

Obs: caso não tenhamos em estoque, a compra será feita pelo cliente.`;
                break;

            case "2":
                resposta = `Você selecionou Programa (Software).
Escreva detalhadamente quais programas precisa.
Informe também seu nome e email.`;
                break;

            case "3":
                resposta = `Você selecionou Desenvolvimento de Portfólio.
Descreva seu projeto detalhadamente.
Informe também seu nome e email.`;
                break;

            case "0":
                sessoes[numero].etapa = "menu";
                await message.reply(menuPrincipal());
                return;

            case "9":
                delete sessoes[numero];
                await message.reply("Atendimento encerrado.");
                return;

            default:
                resposta = "Opção inválida.";
        }

        resposta += menuFinal();
        await message.reply(resposta);
        return;
    }

    // ================= SUBMENU SUPORTE =================
    if (sessoes[numero].etapa === "suporte") {

        let resposta = "";

        switch (texto) {

            case "1":
                resposta = `Você selecionou Problema com notebook ou programa.
Descreva detalhadamente o ocorrido.
Informe também seu nome e email.`;
                break;

            case "2":
                resposta = `Atendimentos relacionados à empresa Hausen devem ser feitos pelo número:
(31) 8454-5644
ou pelo email:
departamentoti@hausen.eng.br`;
                break;

            case "0":
                sessoes[numero].etapa = "menu";
                await message.reply(menuPrincipal());
                return;

            case "9":
                delete sessoes[numero];
                await message.reply("Atendimento encerrado.");
                return;

            default:
                resposta = "Opção inválida.";
        }

        resposta += menuFinal();
        await message.reply(resposta);
        return;
    }

    // ================= OUTROS =================
    if (sessoes[numero].etapa === "outros") {

        if (texto === "0") {
            sessoes[numero].etapa = "menu";
            await message.reply(menuPrincipal());
            return;
        }

        if (texto === "9") {
            delete sessoes[numero];
            await message.reply("Atendimento encerrado.");
            return;
        }

        await message.reply("Mensagem recebida! Em breve retornaremos.\n" + menuFinal());
    }

});

client.initialize();
