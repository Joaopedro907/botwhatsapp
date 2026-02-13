// ================= MENU PRINCIPAL =================
if (!sessoes[numero]) {
    sessoes[numero] = { etapa: "menu" };
    return message.reply(menuPrincipal());
}

if (sessoes[numero].etapa === "menu") {

    if (texto === "1") {
        sessoes[numero].etapa = "orcamento";
        return enviar(`📌 *Orçamento*
Selecione uma opção:
1 - Notebook (Hardware)
2 - Programa (Software)
3 - Desenvolvimento de Portfólio

Digite:
0 - Voltar ao menu principal
9 - Encerrar atendimento`);
    }

    if (texto === "2") {
        sessoes[numero].etapa = "suporte";
        return enviar(`⚡ *Suporte imediato*
Selecione uma opção:
1 - Problema com notebook ou programa
2 - Colaborador Hausen

Digite:
0 - Voltar ao menu principal
9 - Encerrar atendimento`);
    }

    if (texto === "3") {
        sessoes[numero].etapa = "outros";
        return enviar(`✏️ *Outros*
Escreva detalhadamente o que você precisa para analisarmos.

Digite:
0 - Voltar ao menu principal
9 - Encerrar atendimento`);
    }

    return message.reply("Opção inválida.\n\n" + menuPrincipal());
}


// ================= ORÇAMENTO =================
if (sessoes[numero].etapa === "orcamento") {

    if (texto === "1") {
        sessoes[numero].etapa = "final";
        return enviar(`💻 Você selecionou *Notebook (Hardware)*.
Escreva detalhadamente quais peças você precisa para orçamento.
Informe também seu nome e email.

Obs: Caso não tenhamos em estoque, a compra será feita exclusivamente pelo cliente.`);
    }

    if (texto === "2") {
        sessoes[numero].etapa = "final";
        return enviar(`🖥️ Você selecionou *Programa (Software)*.
Descreva quais programas você precisa para orçamento.
Informe também seu nome e email.`);
    }

    if (texto === "3") {
        sessoes[numero].etapa = "final";
        return enviar(`🌐 Você selecionou *Desenvolvimento de Portfólio*.
Descreva detalhadamente seu projeto.
Informe também seu nome e email.`);
    }

    if (texto === "0") {
        sessoes[numero].etapa = "menu";
        return message.reply(menuPrincipal());
    }

    if (texto === "9") {
        delete sessoes[numero];
        return message.reply("Atendimento encerrado. Caso precise, estamos à disposição.");
    }

    return message.reply("Digite uma opção válida.");
}


// ================= SUPORTE =================
if (sessoes[numero].etapa === "suporte") {

    if (texto === "1") {
        sessoes[numero].etapa = "final";
        return enviar(`🛠️ Você selecionou *Problema com notebook ou programa*.
Descreva detalhadamente o ocorrido.
Informe também seu nome e email.`);
    }

    if (texto === "2") {
        sessoes[numero].etapa = "final";
        return enviar(`📞 Você selecionou *Colaborador Hausen*.

Prezado(a),
Atendimentos relacionados à empresa Hausen devem ser feitos através do departamento TI:

📱 (31) 8454-5644
📧 departamentoti@hausen.eng.br`);
    }

    if (texto === "0") {
        sessoes[numero].etapa = "menu";
        return message.reply(menuPrincipal());
    }

    if (texto === "9") {
        delete sessoes[numero];
        return message.reply("Atendimento encerrado. Caso precise, estamos à disposição.");
    }

    return message.reply("Digite uma opção válida.");
}


// ================= OUTROS =================
if (sessoes[numero].etapa === "outros") {

    if (texto === "0") {
        sessoes[numero].etapa = "menu";
        return message.reply(menuPrincipal());
    }

    if (texto === "9") {
        delete sessoes[numero];
        return message.reply("Atendimento encerrado. Caso precise, estamos à disposição.");
    }

    sessoes[numero].etapa = "final";
    return enviar("Recebemos sua mensagem. Nossa equipe irá analisar e entrar em contato.");
}


// ================= FINAL =================
if (sessoes[numero].etapa === "final") {

    if (texto === "0") {
        sessoes[numero].etapa = "menu";
        return message.reply(menuPrincipal());
    }

    if (texto === "9") {
        delete sessoes[numero];
        return message.reply("Atendimento encerrado. Caso precise, estamos à disposição.");
    }

    return message.reply("Digite 0 para voltar ao menu principal ou 9 para encerrar.");
}
