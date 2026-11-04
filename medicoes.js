
document.addEventListener("DOMContentLoaded", () => {

  
// =====================================
// OBSERVAÇÕES MATERNAS
// =====================================

const textoObservacoes = document.getElementById("textoObservacoes");

const salvarObservacoes = document.getElementById("salvarObservacoes");

const mensagemSalvo = document.getElementById("mensagemSalvo");

// Recuperar observações salvas
textoObservacoes.value =
    localStorage.getItem("observacoesMaternas") || "";

// Salvar observações
salvarObservacoes.addEventListener("click", () => {

    localStorage.setItem(
        "observacoesMaternas",
        textoObservacoes.value
    );

    mensagemSalvo.textContent = "✓ Observações salvas com sucesso!";

});


    // =====================================
    // DADOS DAS MEDIÇÕES
    // =====================================

    const maternas = [
        {
            icone: "⚖️",
            nome: "Peso",
            valor: "68 kg",
            data: "20/08/2025"
        },
        {
            icone: "📏",
            nome: "Altura",
            valor: "1,65 m",
            data: "20/08/2025"
        },
        {
            icone: "💓",
            nome: "Pressão Arterial",
            valor: "120/80 mmHg",
            data: "20/08/2025"
        },
        {
            icone: "🩸",
            nome: "Glicemia",
            valor: "85 mg/dL",
            data: "20/08/2025"
        }
    ];

    const criancas = {

        laura: [
            {
                icone: "⚖️",
                nome: "Peso",
                valor: "7,2 kg",
                data: "18/08/2025"
            },
            {
                icone: "📏",
                nome: "Altura",
                valor: "67 cm",
                data: "18/08/2025"
            },
            {
                icone: "👶",
                nome: "Perímetro Cefálico",
                valor: "43 cm",
                data: "18/08/2025"
            },
            {
                icone: "🧮",
                nome: "IMC",
                valor: "16,0 kg/m²",
                data: "18/08/2025"
}
        ],

        pedro: [
            {
                icone: "⚖️",
                nome: "Peso",
                valor: "9,1 kg",
                data: "18/08/2025"
            },
            {
                icone: "📏",
                nome: "Altura",
                valor: "72 cm",
                data: "18/08/2025"
            },
            {
                icone: "👶",
                nome: "Perímetro Cefálico",
                valor: "45 cm",
                data: "18/08/2025"
            },
            {
                icone: "🧮",
                nome: "IMC",
                valor: "16,0 kg/m²",
                data: "18/08/2025"
}
        ]

    };


    // =====================================
    // ELEMENTOS HTML
    // =====================================

    const abas = document.querySelectorAll(".aba");

    const telaMaterna = document.getElementById("maternas");

    const telaCrianca = document.getElementById("crianca");

    const titulo = document.getElementById("tituloPagina");

    const gradeMaternas = document.getElementById("gradeMaternas");

    const gradeCrianca = document.getElementById("gradeCrianca");

    const selecionarCrianca = document.getElementById("selecionarCrianca");


    // =====================================
    // CRIAR CARDS
    // =====================================

    function mostrarMedicoes(lista, grade) {

        grade.innerHTML = "";

        lista.forEach(medicao => {

            const card = document.createElement("div");

            card.className = "card-medicao";

            const icone = document.createElement("div");
            icone.className = "icone-medicao";
            icone.textContent = medicao.icone;

            const dados = document.createElement("div");
            dados.className = "dados-medicao";

            const nome = document.createElement("p");
            nome.textContent = medicao.nome;

            const valor = document.createElement("h3");
            valor.textContent = medicao.valor;

            const data = document.createElement("small");
            data.textContent = medicao.data;

            dados.append(nome, valor, data);

            card.append(icone, dados);

            grade.appendChild(card);

        });

    }

    //SETA
    const botaoVoltar = document.querySelector(".voltar");
    botaoVoltar.addEventListener("click", () => {
    window.location.href = "frutas.html";
    });


    // =====================================
    // MOSTRAR MEDIÇÕES MATERNAS
    // =====================================

    function mostrarMaternas() {

        mostrarMedicoes(maternas, gradeMaternas);

    }


    // =====================================
    // MOSTRAR MEDIÇÕES DA CRIANÇA
    // =====================================

    function mostrarCrianca() {

        const criancaSelecionada = selecionarCrianca.value;

        mostrarMedicoes(
            criancas[criancaSelecionada],
            gradeCrianca
        );

    }


    // =====================================
    // TROCAR ENTRE AS ABAS
    // =====================================

    abas.forEach(aba => {

        aba.addEventListener("click", () => {

            const tipo = aba.dataset.tipo;

            abas.forEach(item => {
                item.classList.remove("ativa");
            });

            aba.classList.add("ativa");

            if (tipo === "maternas") {

                telaMaterna.hidden = false;

                telaCrianca.hidden = true;

                titulo.textContent = "Minhas Medições";

            } else {

                telaMaterna.hidden = true;

                telaCrianca.hidden = false;

                titulo.textContent = "Medições da Criança";

                mostrarCrianca();

            }

        });

    });


    // =====================================
    // TROCAR CRIANÇA SELECIONADA
    // =====================================

    selecionarCrianca.addEventListener("change", () => {

        mostrarCrianca();

    });


    // =====================================
    // ADICIONAR MEDIÇÃO
    // =====================================

    document.querySelectorAll(".adicionar").forEach(botao => {

        botao.addEventListener("click", () => {

            const tipo = botao.dataset.adicionar;

            const nome = prompt("Qual medição deseja adicionar?");

            if (!nome || !nome.trim()) return;

            const valor = prompt("Informe o valor da medição:");

            if (!valor || !valor.trim()) return;

            const novaMedicao = {
                icone: "📋",
                nome: nome.trim(),
                valor: valor.trim(),
                data: new Date().toLocaleDateString("pt-BR")
            };

            if (tipo === "maternas") {

                maternas.unshift(novaMedicao);

                mostrarMaternas();

            } else {

                const criancaSelecionada = selecionarCrianca.value;

                criancas[criancaSelecionada].unshift(novaMedicao);

                mostrarCrianca();

            }

        });

    });


    // =====================================
    // INICIALIZAÇÃO
    // =====================================

    mostrarMaternas();

    mostrarCrianca();

    lucide.createIcons();

});
