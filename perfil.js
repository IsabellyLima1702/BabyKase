(() => {
  "use strict";

  const STORAGE_KEY = "babykare_perfil_demo_v1";

  // DADOS FICTÍCIOS INICIAIS

  const dadosIniciais = {
    perfil: {
      nome: "Mariana Martins Oliveira",
      nascimento: "1998-05-14",
      email: "mariana@email.com",
      senha: "demo1234"
    },

    responsaveis: [],

    criancas: [
      {
        id: "crianca-helena",
        nome: "Helena Martins Oliveira",
        nascimento: "2026-01-27",
        sexo: "Feminino",
        peso: "8.2",
        altura: "68",
        observacoes: "Cadastro fictício para demonstração.",
        comorbidades: "Nenhuma informada."
      }
    ]
  };

  // CARREGAR E SALVAR DADOS

  function carregarDados() {
    try {
      const salvo = localStorage.getItem(STORAGE_KEY);

      if (salvo) {
        return JSON.parse(salvo);
      }

    } catch (erro) {
      console.warn(
        "Não foi possível ler os dados demonstrativos.",
        erro
      );
    }

    return structuredClone(dadosIniciais);
  }

  let dados = carregarDados();
  let senhaVisivel = false;

  function salvarDados() {
    try {
      localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify(dados)
      );

    } catch (erro) {
      console.warn(
        "Não foi possível salvar os dados neste navegador.",
        erro
      );
    }
  }

  const $ = (id) => document.getElementById(id);

  // PROTEÇÃO DE TEXTO EXIBIDO NA TELA

  function escaparHTML(valor = "") {

    return String(valor).replace(/[&<>"']/g, (caractere) => ({
      "&": "&amp;",
      "<": "&lt;",
      ">": "&gt;",
      '"': "&quot;",
      "'": "&#039;"
    })[caractere]);

  }

  // FORMATAR DATA

  function formatarData(data) {

    if (!data) {
      return "Não informado";
    }

    const partes = data.split("-");

    if (partes.length !== 3) {
      return "Não informado";
    }

    return new Date(
      Number(partes[0]),
      Number(partes[1]) - 1,
      Number(partes[2])
    ).toLocaleDateString("pt-BR");

  }

  // CALCULAR IDADE DA CRIANÇA

  function calcularIdade(data) {

    if (!data) {
      return "Idade não informada";
    }

    const nascimento = new Date(`${data}T00:00:00`);

    if (Number.isNaN(nascimento.getTime())) {
      return "Idade não informada";
    }

    const hoje = new Date();

    if (nascimento > hoje) {
      return "Nascimento futuro";
    }

    let anos =
      hoje.getFullYear() - nascimento.getFullYear();

    let meses =
      hoje.getMonth() - nascimento.getMonth();

    let dias =
      hoje.getDate() - nascimento.getDate();

    if (dias < 0) {

      meses--;

      const ultimoDiaMesAnterior = new Date(
        hoje.getFullYear(),
        hoje.getMonth(),
        0
      ).getDate();

      dias += ultimoDiaMesAnterior;
    }

    if (meses < 0) {

      anos--;
      meses += 12;

    }

    if (anos > 0) {

      return `${anos} ano${anos > 1 ? "s" : ""} e ${meses} mês${meses !== 1 ? "es" : ""}`;

    }

    if (meses > 0) {

      return `${meses} mês${meses !== 1 ? "es" : ""} e ${dias} dia${dias !== 1 ? "s" : ""}`;

    }

    return `${dias} dia${dias !== 1 ? "s" : ""}`;

  }

  // PERFIL DO RESPONSÁVEL

  function renderizarPerfil() {

    const p = dados.perfil;

    $("nomePerfil").textContent = p.nome;
    $("emailPerfil").textContent = p.email;

    $("dadoNome").textContent = p.nome;

    $("dadoNascimento").textContent =
      formatarData(p.nascimento);

    $("dadoEmail").textContent = p.email;

    $("dadoSenha").textContent = senhaVisivel
      ? p.senha
      : "•".repeat(Math.max(8, p.senha.length));

    const olho = $("alternarSenha");

    olho.innerHTML = senhaVisivel
      ? '<i class="fa-regular fa-eye-slash"></i>'
      : '<i class="fa-regular fa-eye"></i>';

    olho.setAttribute(
      "aria-label",
      senhaVisivel ? "Ocultar senha" : "Mostrar senha"
    );

  }

  // PREENCHER FORMULÁRIO DE EDIÇÃO

  function preencherFormularioPerfil() {

    $("perfilNome").value = dados.perfil.nome;

    $("perfilNascimento").value =
      dados.perfil.nascimento;

    $("perfilEmail").value =
      dados.perfil.email;

    $("perfilSenha").value =
      dados.perfil.senha;

    $("mensagemPerfil").textContent = "";

  }

  // ABRIR E FECHAR EDIÇÃO DO PERFIL

  function abrirEdicaoPerfil() {

    preencherFormularioPerfil();

    $("formularioPerfilCard").hidden = false;

    $("formularioPerfilCard").scrollIntoView({
      behavior: "smooth",
      block: "center"
    });

    $("perfilNome").focus();

  }

  function fecharEdicaoPerfil() {

    $("formularioPerfilCard").hidden = true;

  }

  $("abrirEdicaoPerfil").addEventListener(
    "click",
    abrirEdicaoPerfil
  );

  $("fecharEdicaoPerfil").addEventListener(
    "click",
    fecharEdicaoPerfil
  );

  $("cancelarEdicaoPerfil").addEventListener(
    "click",
    fecharEdicaoPerfil
  );

  // SALVAR ALTERAÇÕES DO RESPONSÁVEL

  $("formPerfil").addEventListener("submit", (event) => {

    event.preventDefault();

    const nome = $("perfilNome").value.trim();

    const nascimento =
      $("perfilNascimento").value;

    const email =
      $("perfilEmail").value.trim().toLowerCase();

    const senha =
      $("perfilSenha").value;

    if (!nome || !nascimento || !email || senha.length < 6) {

      $("mensagemPerfil").textContent =
        "Confira os campos. A senha deve ter pelo menos 6 caracteres.";

      return;
    }

    dados.perfil = {
      nome,
      nascimento,
      email,
      senha
    };

    salvarDados();

    renderizarPerfil();

    fecharEdicaoPerfil();

  });

  // MOSTRAR OU OCULTAR SENHA

  $("alternarSenha").addEventListener("click", () => {

    senhaVisivel = !senhaVisivel;

    renderizarPerfil();

  });

  // ALTERAR FOTO DO RESPONSÁVEL

  $("uploadFotoResponsavel").addEventListener(
    "change",
    (event) => {

      const arquivo =
        event.target.files && event.target.files[0];

      if (!arquivo) return;

      if (!arquivo.type.startsWith("image/")) return;

      const leitor = new FileReader();

      leitor.onload = () => {

        $("fotoResponsavel").src = leitor.result;

      };

      leitor.readAsDataURL(arquivo);

    }
  );

  // RESPONSÁVEIS

  const modal = $("modalConvite");

  const botaoAdicionar =
    $("adicionarResponsavel");

  const emailInput =
    $("emailResponsavel");

  const mensagemConvite =
    $("mensagemConvite");

  // ABRIR MODAL

  function abrirModalConvite() {

    modal.hidden = false;

    mensagemConvite.textContent = "";

    mensagemConvite.className = "";

    $("formConvite").reset();

    emailInput.focus();

  }

  // FECHAR MODAL

  function fecharModalConvite() {

    modal.hidden = true;

    botaoAdicionar.focus();

  }

  botaoAdicionar.addEventListener(
    "click",
    abrirModalConvite
  );

  $("fecharModal").addEventListener(
    "click",
    fecharModalConvite
  );

  $("cancelarConvite").addEventListener(
    "click",
    fecharModalConvite
  );

  modal.addEventListener("click", (event) => {

    if (event.target === modal) {
      fecharModalConvite();
    }

  });

  // ADICIONAR RESPONSÁVEL

  $("formConvite").addEventListener(
    "submit",
    (event) => {

      event.preventDefault();

      const email =
        emailInput.value.trim().toLowerCase();

      if (!emailInput.validity.valid || !email) {

        mensagemConvite.textContent =
          "Informe um e-mail válido.";

        mensagemConvite.className = "erro";

        emailInput.focus();

        return;
      }

      const jaExiste =
        dados.responsaveis.some(
          (item) => item.email === email
        );

      if (
        email === dados.perfil.email ||
        jaExiste
      ) {

        mensagemConvite.textContent =
          "Este e-mail já está vinculado à conta.";

        mensagemConvite.className = "erro";

        return;
      }

      dados.responsaveis.push({

        id: `resp-${Date.now()}`,

        email

      });

      salvarDados();

      renderizarResponsaveis();

      mensagemConvite.textContent =
        "Responsável adicionado nesta demonstração!";

      mensagemConvite.className = "sucesso";

      $("formConvite").reset();

    }
  );

  // MOSTRAR RESPONSÁVEIS CADASTRADOS

  function renderizarResponsaveis() {

    const lista = $("listaResponsaveis");

    lista.innerHTML = "";

    if (dados.responsaveis.length === 0) {

      const vazio = document.createElement("p");

      vazio.className = "estado-vazio";

      vazio.innerHTML =
        '<i class="fa-solid fa-user-plus"></i>Nenhum responsável adicional cadastrado ainda.';

      lista.appendChild(vazio);

      return;

    }

    dados.responsaveis.forEach((responsavel) => {

      const item = document.createElement("div");

      item.className = "responsavel-item";

      item.innerHTML = `
        <span class="responsavel-email">
          <i class="fa-regular fa-envelope"></i>
          ${escaparHTML(responsavel.email)}
        </span>

        <span class="responsavel-status">
          Adicionado
        </span>

        <button
          type="button"
          class="botao-remover"
          aria-label="Remover responsável"
          title="Remover"
        >
          <i class="fa-solid fa-trash"></i>
        </button>
      `;

      item.querySelector(".botao-remover")
        .addEventListener("click", () => {

          if (
            !confirm(
              `Remover ${responsavel.email} da lista de responsáveis?`
            )
          ) {
            return;
          }

          dados.responsaveis =
            dados.responsaveis.filter(
              (r) => r.id !== responsavel.id
            );

          salvarDados();

          renderizarResponsaveis();

        });

      lista.appendChild(item);

    });

  }

  // CRIANÇAS

  const formularioCriancaCard =
    $("formularioCriancaCard");

  const formCrianca =
    $("formCrianca");

  // LIMPAR FORMULÁRIO

  function limparFormularioCrianca() {

    formCrianca.reset();

    $("criancaId").value = "";

    $("mensagemCrianca").textContent = "";

    $("tituloFormularioCrianca").innerHTML =
      '<i class="fa-solid fa-baby"></i> Nova criança';

    $("salvarCrianca").innerHTML =
      '<i class="fa-solid fa-check"></i> Salvar criança';

  }

  // ABRIR FORMULÁRIO DE CRIANÇA

  function abrirFormularioCrianca(crianca = null) {

    limparFormularioCrianca();

    if (crianca) {

      $("tituloFormularioCrianca").innerHTML =
        '<i class="fa-solid fa-pen"></i> Editar criança';

      $("salvarCrianca").innerHTML =
        '<i class="fa-solid fa-check"></i> Salvar alterações';

      $("criancaId").value = crianca.id;

      $("criancaNome").value =
        crianca.nome || "";

      $("criancaNascimento").value =
        crianca.nascimento || "";

      $("criancaSexo").value =
        crianca.sexo || "";

      $("criancaPeso").value =
        crianca.peso || "";

      $("criancaAltura").value =
        crianca.altura || "";

      $("criancaObservacoes").value =
        crianca.observacoes || "";

      $("criancaComorbidades").value =
        crianca.comorbidades || "";

    }

    formularioCriancaCard.hidden = false;

    formularioCriancaCard.scrollIntoView({
      behavior: "smooth",
      block: "center"
    });

    $("criancaNome").focus();

  }

  // FECHAR FORMULÁRIO DE CRIANÇA

  function fecharFormularioCrianca() {

    formularioCriancaCard.hidden = true;

    limparFormularioCrianca();

  }

  $("abrirFormularioCrianca").addEventListener(
    "click",
    () => abrirFormularioCrianca()
  );

  $("fecharFormularioCrianca").addEventListener(
    "click",
    fecharFormularioCrianca
  );

  $("cancelarCrianca").addEventListener(
    "click",
    fecharFormularioCrianca
  );

  // SALVAR CRIANÇA

  formCrianca.addEventListener("submit", (event) => {

    event.preventDefault();

    const crianca = {

      id:
        $("criancaId").value ||
        `crianca-${Date.now()}`,

      nome:
        $("criancaNome").value.trim(),

      nascimento:
        $("criancaNascimento").value,

      sexo:
        $("criancaSexo").value,

      peso:
        $("criancaPeso").value,

      altura:
        $("criancaAltura").value,

      observacoes:
        $("criancaObservacoes").value.trim(),

      comorbidades:
        $("criancaComorbidades").value.trim()

    };

    if (
      !crianca.nome ||
      !crianca.nascimento ||
      !crianca.sexo
    ) {

      $("mensagemCrianca").textContent =
        "Preencha o nome, a data de nascimento e o sexo.";

      return;
    }

    if (
      new Date(`${crianca.nascimento}T00:00:00`) >
      new Date()
    ) {

      $("mensagemCrianca").textContent =
        "A data de nascimento não pode ser futura.";

      return;
    }

    const indice =
      dados.criancas.findIndex(
        (item) => item.id === crianca.id
      );

    if (indice >= 0) {

      dados.criancas[indice] = crianca;

    } else {

      dados.criancas.push(crianca);

    }

    salvarDados();

    renderizarCriancas();

    fecharFormularioCrianca();

  });

  // EXIBIR CARDS DAS CRIANÇAS

  function renderizarCriancas() {

    const lista = $("listaCriancas");

    lista.innerHTML = "";

    if (dados.criancas.length === 0) {

      const vazio = document.createElement("div");

      vazio.className = "estado-vazio";

      vazio.innerHTML =
        '<i class="fa-solid fa-baby"></i>Você ainda não cadastrou nenhuma criança.<br>Clique em “Adicionar criança” para começar.';

      lista.appendChild(vazio);

      return;

    }

    dados.criancas.forEach((crianca) => {

      const card = document.createElement("article");

      card.className = "card crianca-card";

      const peso = crianca.peso
        ? `${String(crianca.peso).replace(".", ",")} kg`
        : "Não informado";

      const altura = crianca.altura
        ? `${String(crianca.altura).replace(".", ",")} cm`
        : "Não informada";

      card.innerHTML = `

        <div class="crianca-card-topo">

          <div class="crianca-avatar">
            <i class="fa-solid fa-baby"></i>
          </div>

          <div>
            <h3>${escaparHTML(crianca.nome)}</h3>

            <p class="crianca-idade">
              ${escaparHTML(calcularIdade(crianca.nascimento))}
            </p>
          </div>

        </div>

        <div class="crianca-detalhes">

          <div class="crianca-detalhe">
            <span>Nascimento</span>
            <strong>
              ${escaparHTML(formatarData(crianca.nascimento))}
            </strong>
          </div>

          <div class="crianca-detalhe">
            <span>Sexo</span>
            <strong>
              ${escaparHTML(crianca.sexo || "Não informado")}
            </strong>
          </div>

          <div class="crianca-detalhe">
            <span>Peso atual</span>
            <strong>
              ${escaparHTML(peso)}
            </strong>
          </div>

          <div class="crianca-detalhe">
            <span>Altura atual</span>
            <strong>
              ${escaparHTML(altura)}
            </strong>
          </div>

        </div>

        <p class="crianca-observacao">
          <strong>Observações:</strong>
          ${escaparHTML(crianca.observacoes || "Nenhuma observação.")}
        </p>

        <p class="crianca-observacao">
          <strong>Comorbidades:</strong>
          ${escaparHTML(crianca.comorbidades || "Não informado.")}
        </p>

        <div class="crianca-acoes">

          <button
            type="button"
            class="botao-acao editar"
          >
            <i class="fa-solid fa-pen"></i>
            Editar
          </button>

          <button
            type="button"
            class="botao-acao excluir"
          >
            <i class="fa-solid fa-trash"></i>
            Excluir
          </button>

        </div>

      `;

      // EDITAR CRIANÇA

      card.querySelector(".editar")
        .addEventListener("click", () => {

          abrirFormularioCrianca(crianca);

        });

      // EXCLUIR CRIANÇA

      card.querySelector(".excluir")
        .addEventListener("click", () => {

          if (
            !confirm(
              `Deseja excluir o perfil de ${crianca.nome}?`
            )
          ) {
            return;
          }

          dados.criancas =
            dados.criancas.filter(
              (item) => item.id !== crianca.id
            );

          salvarDados();

          renderizarCriancas();

        });

      lista.appendChild(card);

    });

  }

  // FECHAR JANELAS COM ESC

  document.addEventListener("keydown", (event) => {

    if (
      event.key === "Escape" &&
      !modal.hidden
    ) {
      fecharModalConvite();
    }

    if (
      event.key === "Escape" &&
      !formularioCriancaCard.hidden
    ) {
      fecharFormularioCrianca();
    }

    if (
      event.key === "Escape" &&
      !$("formularioPerfilCard").hidden
    ) {
      fecharEdicaoPerfil();
    }

  });

  // PRIMEIRA RENDERIZAÇÃO

  renderizarPerfil();

  renderizarResponsaveis();

  renderizarCriancas();

})();