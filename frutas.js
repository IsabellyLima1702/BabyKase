const semanas = {

    4: {
        fruta: "uva",
        nomeFruta: "uva",
        tamanho: "Aproximadamente ~0,2 cm",
        imagem: "img/uva.png",

        informacoes: [
            {
                icone: "🫧",
                texto: "Seu bebê está apenas começando a se formar. Tudo ainda é muito pequenininho!"
            }
        ]
    },


    8: {
        fruta: "framboesa",
        nomeFruta: "framboesa",
        tamanho: "Aproximadamente ~1,6 cm",
        imagem: "img/framboesa.png",

        informacoes: [
            {
                icone: "💗",
                texto: "Os principais órgãos começam a se formar. O coraçãozinho já está batendo!"
            }
        ]
    },


    12: {
        fruta: "limão",
        nomeFruta: "limão",
        tamanho: "Aproximadamente ~5,4 cm",
        imagem: "img/limao.png",

        informacoes: [
            {
                icone: "✋",
                texto: "Ele já começa a mexer os bracinhos e perninhas e os dedinhos começam a se separar."
            }
        ]
    },


    16: {
        fruta: "abacate",
        nomeFruta: "abacate",
        tamanho: "Aproximadamente ~11,6 cm",
        imagem: "img/abacate.png",

        informacoes: [
            {
                icone: "👂",
                texto: "Os sentidos começam a se desenvolver. Ele já pode começar a perceber sons externos!"
            }
        ]
    },


    20: {
        fruta: "banana",
        nomeFruta: "banana",
        tamanho: "Aproximadamente ~16,5 cm",
        imagem: "img/banana.png",

        informacoes: [
            {
                icone: "👣",
                texto: "Os movimentos ficam mais fortes e você pode começar a sentir os primeiros chutinhos!"
            },

            {
                icone: "🧠",
                texto: "O cérebro continua se desenvolvendo rapidamente."
            }
        ]
    },


    24: {
        fruta: "manga",
        nomeFruta: "manga",
        tamanho: "Aproximadamente ~21,5 cm",
        imagem: "img/manga.png",

        informacoes: [
            {
                icone: "🫁",
                texto: "Os pulmões continuam se desenvolvendo e ele começa a responder a estímulos."
            }
        ]
    },


    28: {
        fruta: "beringela",
        nomeFruta: "beringela",
        tamanho: "Aproximadamente ~37,6 cm",
        imagem: "img/beringela.png",

        informacoes: [
            {
                icone: "🧠",
                texto: "O cérebro está em pleno desenvolvimento e os ciclos de sono e vigília ficam mais definidos."
            }
        ]
    },


    32: {
        fruta: "abacaxi",
        nomeFruta: "abacaxi",
        tamanho: "Aproximadamente ~42,4 cm",
        imagem: "img/abacaxi.png",

        informacoes: [
            {
                icone: "💧",
                texto: "Ele continua ganhando peso e se preparando para a chegada."
            }
        ]
    },


    36: {
        fruta: "melão",
        nomeFruta: "melão",
        tamanho: "Aproximadamente ~47 cm",
        imagem: "img/melao.png",

        informacoes: [
            {
                icone: "👶",
                texto: "Já está quase pronto! Faltam poucos detalhes para conhecê-lo."
            }
        ]
    },


    40: {
        fruta: "melancia",
        nomeFruta: "melancia",
        tamanho: "Aproximadamente ~50 cm",
        imagem: "img/melancia.png",

        informacoes: [
            {
                icone: "💗",
                texto: "Seu bebê está pronto para nascer! Que esse encontro seja lindo!"
            }
        ]
    }

};


// ==========================================
// ELEMENTOS DA PÁGINA
// ==========================================

const select = document.getElementById("semanas");

const botoesSemana = document.querySelectorAll(".semana");

const imagemFruta = document.getElementById("imagemFruta");

const nomeFruta = document.getElementById("nomeFruta");

const tamanho = document.getElementById("tamanho");

const informacoes = document.getElementById("informacoes");


// ==========================================
// FUNÇÃO PRINCIPAL
// ==========================================

function mostrarSemana(numeroSemana) {

    const dados = semanas[numeroSemana];

    if (!dados) {
        return;
    }


    // --------------------------------------
    // ALTERA A FRUTA
    // --------------------------------------

    imagemFruta.src = dados.imagem;

    imagemFruta.alt = `Fruta: ${dados.nomeFruta}`;


    // --------------------------------------
    // ALTERA O NOME
    // --------------------------------------

    nomeFruta.textContent = dados.nomeFruta;


    // --------------------------------------
    // ALTERA O TAMANHO
    // --------------------------------------

    tamanho.textContent = dados.tamanho;


    // --------------------------------------
    // ALTERA O SELECT
    // --------------------------------------

    select.value = numeroSemana;


    // --------------------------------------
    // ALTERA A SEMANA ATIVA
    // --------------------------------------

    botoesSemana.forEach(botao => {

        botao.classList.remove("ativo");

    });


    const botaoAtual = document.querySelector(
        `.semana[data-semana="${numeroSemana}"]`
    );


    if (botaoAtual) {

        botaoAtual.classList.add("ativo");

    }


    // --------------------------------------
    // ALTERA AS INFORMAÇÕES
    // --------------------------------------

    informacoes.innerHTML = "";


    dados.informacoes.forEach(info => {

        const card = document.createElement("div");

        card.classList.add("info-card");


        card.innerHTML = `
            <div class="info-icone">
                ${info.icone}
            </div>

            <div class="info-texto">
                ${info.texto}
            </div>
        `;


        informacoes.appendChild(card);

    });

}


// ==========================================
// QUANDO CLICAR NO SELECT
// ==========================================

select.addEventListener("change", function () {

    const semanaSelecionada = Number(this.value);

    mostrarSemana(semanaSelecionada);

});


// ==========================================
// QUANDO CLICAR NOS CÍRCULOS
// ==========================================

botoesSemana.forEach(botao => {

    botao.addEventListener("click", function () {

        const semanaSelecionada =
            Number(this.dataset.semana);

        mostrarSemana(semanaSelecionada);

    });

});


// ==========================================
// SEMANA INICIAL
// ==========================================

mostrarSemana(20);