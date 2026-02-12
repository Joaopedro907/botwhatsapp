const { Client, LocalAuth } = require('whatsapp-web.js');
const qrcode = require('qrcode-terminal');

const client = new Client({
    authStrategy: new LocalAuth(),
    puppeteer: {
        headless: true,
        args: [
            '--no-sandbox',
            '--disable-setuid-sandbox'
        ]
    }
});


let sessoes = {};
const TEMPO_RESET = 30 * 60 * 1000; // 30 minutos

function menuPrincipal() {
    return `Olá! Agradecemos seu contato.
Digite o número conforme a opção desejada:

1 - Solicitar um orçamento
2 - Suporte imediato
3 - Outros

Digite:
9 - Encerrar atendimento`;
}

function menuSub() {
    return `

Digite:
8 - Voltar para o menu anterior
0 - Menu principal
9 - Encerrar atendimento`;
}

function delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

function tempoHumano(texto) {
    const base = 2000;
    const variavel = Math.random() * 3000;
    const tamanho = texto.length * 20;
    return base + variavel + tamanho;
}

client.on('qr', (qr) => {
    console.log('\nEscaneie o QR Code abaixo:\n');
    qrcode.generate(qr, { small: true });
});

client.on('ready', () => {
    console.log('✅ Bot conectado com sucesso!');
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

    const enviar = async (resposta, tipo = "principal") => {
        await message.getChat().then(chat => chat.sendStateTyping());
        await delay(tempoHumano(resposta));

        if (tipo === "submenu") {
            await message.reply(resposta + menuSub());
        } else {
            await message.reply(resposta);
        }
    };

    // ================= CONTROLES GERAIS =================

    if (texto === "9") {
        delete sessoes[numero];
        return message.reply("Atendimento encerrado. Caso precise, estamos à disposição.");
    }

    if (texto === "0") {
        sessoes[numero].etapa = "menu";
        return enviar(menuPrincipal());
    }

    if (texto === "8") {
        if (["orcamento", "suporte", "outros"].includes(sessoes[numero].etapa)) {
            sessoes[numero].etapa = "menu";
            return enviar(menuPrincipal());
        }

        if (["orcamento_notebook", "orcamento_programa", "orcamento_portfolio"].includes(sessoes[numero].etapa)) {
            sessoes[numero].etapa = "orcamento";
            return enviar(`📌 *Orçamento*
Selecione uma opção:
1 - Notebook (Hardware)
2 - Programa (Software)
3 - Desenvolvimento de Portfólio`, "submenu");
        }

        if (["suporte_problema", "suporte_hausen"].includes(sessoes[numero].etapa)) {
            sessoes[numero].etapa = "suporte";
            return enviar(`⚡ *Suporte imediato*
Selecione uma opção:
1 - Problema com notebook ou programa
2 - Colaborador Hausen`, "submenu");
        }
    }

    // ================= MENU PRINCIPAL =================

    if (sessoes[numero].etapa === "menu") {

        if (texto === "1") {
            sessoes[numero].etapa = "orcamento";
            return enviar(`📌 *Orçamento*
Selecione uma opção:
1 - Notebook (Hardware)
2 - Programa (Software)
3 - Desenvolvimento de Portfólio`, "submenu");
        }

        if (texto === "2") {
            sessoes[numero].etapa = "suporte";
            return enviar(`⚡ *Suporte imediato*
Selecione uma opção:
1 - Problema com notebook ou programa
2 - Colaborador Hausen`, "submenu");
        }

        if (texto === "3") {
            sessoes[numero].etapa = "outros";
            return enviar(`✏️ *Outros*
Escreva detalhadamente o que você precisa para analisarmos.`, "submenu");
        }

        return message.reply("Opção inválida.\n\n" + menuPrincipal());
    }

    // ================= ORÇAMENTO =================

    if (sessoes[numero].etapa === "orcamento") {

        if (texto === "1") {
            sessoes[numero].etapa = "orcamento_notebook";
            return enviar(`💻 Você selecionou *Notebook (Hardware)*.
Escreva detalhadamente quais peças você precisa.
Informe também seu nome e email.

Obs: Caso não tenhamos em estoque, a compra será feita pelo cliente.`, "submenu");
        }

        if (texto === "2") {
            sessoes[numero].etapa = "orcamento_programa";
            return enviar(`🖥️ Você selecionou *Programa (Software)*.
Descreva quais programas você precisa.
Informe também seu nome e email.`, "submenu");
        }

        if (texto === "3") {
            sessoes[numero].etapa = "orcamento_portfolio";
            return enviar(`🌐 Você selecionou *Desenvolvimento de Portfólio*.
Descreva seu projeto detalhadamente.
Informe também seu nome e email.`, "submenu");
        }

        return message.reply("Digite uma opção válida.");
    }

    // ================= SUPORTE =================

    if (sessoes[numero].etapa === "suporte") {

        if (texto === "1") {
            sessoes[numero].etapa = "suporte_problema";
            return enviar(`🛠️ Você selecionou *Problema com notebook ou programa*.
Descreva detalhadamente o ocorrido.
Informe também seu nome e email.`, "submenu");
        }

        if (texto === "2") {
            sessoes[numero].etapa = "suporte_hausen";
            return enviar(`📞 Você selecionou *Colaborador Hausen*.

Atendimentos relacionados à empresa Hausen devem ser feitos através do departamento TI:

📱 (31) 8454-5644
📧 departamentoti@hausen.eng.br`, "submenu");
        }

        return message.reply("Digite uma opção válida.");
    }

    // ================= OUTROS =================

    if (sessoes[numero].etapa === "outros") {
        sessoes[numero].etapa = "finalizado";
        return enviar("Recebemos sua mensagem. Nossa equipe irá analisar e entrar em contato.", "submenu");
    }

});
const express = require('express');
const app = express();

app.get('/', (req, res) => {
    res.send('Bot está rodando 🚀');
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Servidor rodando na porta ${PORT}`);
});


client.initialize();
