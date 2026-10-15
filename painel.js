
const botaoAdicionar = document.getElementById("adicionarResponsavel");
const modal = document.getElementById("modalConvite");
const fecharModal = document.getElementById("fecharModal");
const cancelarConvite = document.getElementById("cancelarConvite");
const formConvite = document.getElementById("formConvite");
const emailInput = document.getElementById("emailResponsavel");
const mensagem = document.getElementById("mensagemConvite");
const botaoEnviar = document.getElementById("botaoEnviar");
const listaResponsaveis = document.getElementById("listaResponsaveis");

function abrirModal() {
  modal.hidden = false;
  mensagem.textContent = "";
  mensagem.className = "";
  emailInput.value = "";
  emailInput.focus();
}

function fecharFormulario() {
  modal.hidden = true;
  botaoAdicionar.focus();
}

botaoAdicionar.addEventListener("click", abrirModal);
fecharModal.addEventListener("click", fecharFormulario);
cancelarConvite.addEventListener("click", fecharFormulario);

// Fecha ao clicar fora da caixa
modal.addEventListener("click", (event) => {
  if (event.target === modal) {
    fecharFormulario();
  }
});

// Fecha com a tecla Escape
document.addEventListener("keydown", (event) => {
  if (event.key === "Escape" && !modal.hidden) {
    fecharFormulario();
  }
});

formConvite.addEventListener("submit", async (event) => {
  event.preventDefault();

  const email = emailInput.value.trim().toLowerCase();

  if (!emailInput.validity.valid || !email) {
    mensagem.textContent = "Informe um e-mail válido.";
    mensagem.className = "erro";
    emailInput.focus();
    return;
  }

  botaoEnviar.disabled = true;
  botaoEnviar.innerHTML =
    '<i class="fa-solid fa-spinner fa-spin"></i> Enviando...';

  mensagem.textContent = "";
  mensagem.className = "";

  try {
    // Endpoint que deverá ser implementado no backend
    const resposta = await fetch("/api/convites", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ email })
    });

    const dados = await resposta.json().catch(() => ({}));

    if (!resposta.ok) {
      throw new Error(
        dados.message || "Não foi possível enviar o convite."
      );
    }

    mensagem.textContent =
      dados.message || "Convite enviado com sucesso!";
    mensagem.className = "sucesso";

    // Atualiza a lista após a confirmação do servidor
    const item = document.createElement("div");
    item.className = "responsavel-item";

    const texto = document.createElement("span");
    texto.textContent = email;

    const status = document.createElement("span");
    status.textContent = "Convidado";
    status.style.color = "#347653";
    status.style.fontSize = "12px";

    item.append(texto, status);
    listaResponsaveis.appendChild(item);

    formConvite.reset();
  } catch (erro) {
    mensagem.textContent =
      erro.message === "Failed to fetch"
        ? "Não foi possível conectar ao servidor. Tente novamente."
        : erro.message;

    mensagem.className = "erro";
  } finally {
    botaoEnviar.disabled = false;
    botaoEnviar.innerHTML =
      '<i class="fa-solid fa-paper-plane"></i> Enviar acesso';
  }
});
