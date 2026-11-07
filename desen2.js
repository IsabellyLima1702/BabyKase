const $ = (selector) => document.querySelector(selector);
const $$ = (selector) => document.querySelectorAll(selector);

function showToast(message) {
  const toast = $("#toast");
  toast.textContent = message;
  toast.classList.add("show");
  setTimeout(() => toast.classList.remove("show"), 2200);
}

function scrollToSection(id) {
  if (id === "top") {
    window.scrollTo({ top: 0, behavior: "smooth" });
    return;
  }
  const element = document.getElementById(id);
  if (element) element.scrollIntoView({ behavior: "smooth", block: "start" });
}

// Navegação principal: cada ícone abre uma tela independente.
$$('.nav-item[data-target]').forEach(button => {
  button.addEventListener('click', () => {
    const app = document.querySelector('.app');
    const target = document.getElementById(button.dataset.target);
    $$('.nav-item').forEach(item => item.classList.remove('active'));
    button.classList.add('active');
    if (!app || !target) return;
    app.classList.add('nav-screen-mode');
    $$('.app > section, .app > header').forEach(item => item.classList.remove('nav-active-screen'));
    target.hidden = false;

    target.classList.add('nav-active-screen');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  });
});

// Voltar
$("#backBtn").addEventListener("click", () => {
  if (history.length > 1) history.back();
  else showToast("Você já está na página inicial.");
});

// =============================
// CADASTRO E SELEÇÃO DE CRIANÇAS
// =============================

const defaultChildren = [
  {
    id: "maria-eduarda",
    name: "Maria Eduarda",
    birth: "2024-03-12",
    gender: "Feminino"
  }
];

let children = JSON.parse(localStorage.getItem("babyKaseChildren") || "null");
if (!Array.isArray(children) || children.length === 0) {
  children = defaultChildren;
  localStorage.setItem("babyKaseChildren", JSON.stringify(children));
}

let selectedChildId = localStorage.getItem("babyKaseSelectedChild") || children[0].id;
if (!children.some(child => child.id === selectedChildId)) {
  selectedChildId = children[0].id;
}

function getSelectedChild() {
  return children.find(child => child.id === selectedChildId) || children[0];
}

function formatDateBR(value) {
  if (!value) return "";
  return new Date(`${value}T00:00:00`).toLocaleDateString("pt-BR");
}

function avatarForGender(gender) {
  return gender === "Feminino" ? "👧🏻" : "👦🏻";
}

function renderChildren() {
  const list = $("#childrenList");
  if (!list) return;

  list.innerHTML = children.map(child => `
    <div class="child-card-row">
      <button type="button" class="child-card ${child.id === selectedChildId ? "selected" : ""}" data-child-id="${child.id}">
        <div class="avatar">${avatarForGender(child.gender)}</div>
        <div class="child-info">
          <strong>${child.name}</strong>
          <span>Nasc.: ${formatDateBR(child.birth)} • ${child.gender}</span>
        </div>
        <span class="arrow">›</span>
      </button>
      <button type="button" class="child-delete-btn" data-delete-child-id="${child.id}" aria-label="Remover cadastro de ${child.name}" title="Remover cadastro">Remover</button>
    </div>
  `).join("");

  $$("#childrenList .child-card").forEach(card => {
    card.addEventListener("click", () => {
      selectedChildId = card.dataset.childId;
      localStorage.setItem("babyKaseSelectedChild", selectedChildId);
      renderChildren();
      updateChildDependentUI();
      renderVaccineStates();
      if (typeof vaxRenderHistory === "function") vaxRenderHistory();
      if (typeof renderDiary === "function") renderDiary();
      showToast(`${getSelectedChild().name} selecionado(a).`);
    });
  });

  $$("#childrenList .child-delete-btn").forEach(button => {
    button.addEventListener("click", () => {
      const child = children.find(item => item.id === button.dataset.deleteChildId);
      if (!child) return;
      if (children.length === 1) {
        showToast("Cadastre outra criança antes de remover a última.");
        return;
      }
      if (!window.confirm(`Remover o cadastro de ${child.name}? As anotações do Diário e os registros de vacinas desta criança também serão excluídos deste navegador. Essa ação não pode ser desfeita.`)) return;

      children = children.filter(item => item.id !== child.id);
      localStorage.setItem("babyKaseChildren", JSON.stringify(children));
      if (selectedChildId === child.id) selectedChildId = children[0].id;
      localStorage.setItem("babyKaseSelectedChild", selectedChildId);

      delete vaccineStatusByChild[child.id];
      saveVaccineStatus();
      diaryNotes = diaryNotes.filter(note => note.childId !== child.id);
      saveDiaryNotes();
      Object.keys(vaxDates).filter(key => key.startsWith(`${child.id}:`)).forEach(key => delete vaxDates[key]);
      localStorage.setItem(VAX_DATE_KEY, JSON.stringify(vaxDates));

      renderChildren();
      updateChildDependentUI();
      renderVaccineStates();
      vaxRenderHistory();
      resetDiaryForm();
      renderDiary();
      showToast(`Cadastro de ${child.name} removido.`);
    });
  });
}

function updateChildDependentUI() {
  const child = getSelectedChild();
  if (!child) return;

  const babyTab = $('.tab[data-tab="baby"]');
  if (babyTab) babyTab.textContent = `Bebê (${child.name})`;
}