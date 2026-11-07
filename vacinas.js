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

// Botões dos atalhos
$$('.quick-actions button').forEach(button => {
  button.addEventListener('click', () => scrollToSection(button.dataset.target));
});

document.addEventListener('click', (event) => {
  const button = event.target.closest('.nav-item[data-target]');

  if (!button) return;

  event.preventDefault();

  const app = document.querySelector('.app');
  const target = document.getElementById(button.dataset.target);

  if (!app || !target) return;

  document.querySelectorAll('.nav-item').forEach(item => {
    item.classList.remove('active');
  });

  button.classList.add('active');

  app.classList.add('nav-screen-mode');

  document.querySelectorAll('.app > section, .app > header').forEach(item => {
    item.classList.remove('nav-active-screen');
  });

  target.hidden = false;
  target.classList.add('nav-active-screen');

  window.scrollTo({ top: 0, behavior: 'smooth' });
});
// Conteúdos e Perfil serão implementados em etapas futuras.
$$('.nav-item[data-future]').forEach(button => {
  button.addEventListener('click', () => {
    $$('.nav-item').forEach(item => item.classList.remove('active'));
    button.classList.add('active');
    showToast('A área ' + button.dataset.future + ' será desenvolvida em breve.');
  });
});

// Voltar
$("#backBtn").addEventListener("click", () => {
  if (history.length > 1) history.back();
  else showToast("Você já está na página inicial.");
});

// Notificações
$("#notificationBtn").addEventListener("click", () => showToast("Você tem 3 vacinas pendentes."));

// Modal
const modal = $("#modal");
const modalBox = $("#modalBox");
const modalContent = $("#modalContent");
const originalChildForm = modalContent.innerHTML;

function openModal(title, text = "", contentHTML = null) {
  if (contentHTML !== null) {
    modalContent.innerHTML = contentHTML;
  } else {
    modalContent.innerHTML = `
      <h2 id="modalTitle">${title}</h2>
      <p id="modalText">${text}</p>
    `;
  }
  modalBox.classList.remove("growth-modal");
  modal.classList.add("open");
}

function closeModal() {
  modal.classList.remove("open");
  modalBox.classList.remove("growth-modal");
}

$("#addChildBtn").addEventListener("click", () => {
  openModal("Adicionar criança", "Preencha os dados abaixo para cadastrar uma criança.", originalChildForm);
});

$("#modalClose").addEventListener("click", closeModal);

modal.addEventListener("click", (event) => {
  if (event.target === modal) closeModal();
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

// =============================
// STATUS DAS VACINAS POR CRIANÇA
// Cada criança tem seu próprio registro, salvo neste navegador.
// =============================
const BABY_VACCINE_CALENDAR = [
{age:"Ao nascer",vaccines:[
{id:"hepatite-b-dose1",name:"Vacina contra hepatite B",dose:"1ª dose",prevents:"Hepatite B",when:"Ao nascer."},
{id:"bcg-dose-unica",name:"BCG-ID",dose:"Dose única",prevents:"Formas graves de tuberculose",when:"Ao nascer."}]},
{age:"2 meses",vaccines:[
{id:"pentavalente-dose1",name:"Pentavalente (DTP + Hib + HB)",dose:"1ª dose",prevents:"Difteria, tétano, coqueluche, infecções por Haemophilus influenzae tipo b e hepatite B",when:"Aos 2 meses."},
{id:"rotavirus-dose1",name:"VORH — Rotavírus humano",dose:"1ª dose",prevents:"Diarreia e gastroenterite por rotavírus",when:"Aos 2 meses. Há limites de idade para aplicação; confirme com a UBS."},
{id:"vip-dose1",name:"VIP — Poliomielite inativada",dose:"1ª dose",prevents:"Poliomielite (paralisia infantil)",when:"Aos 2 meses."},
{id:"pneumococica-dose1",name:"Pneumocócica conjugada",dose:"1ª dose",prevents:"Doenças pneumocócicas invasivas",when:"Aos 2 meses; confirme na UBS a formulação indicada no calendário local vigente."}]},
{age:"3 meses",vaccines:[{id:"meningococica-dose1",name:"Meningocócica C conjugada",dose:"1ª dose",prevents:"Doenças meningocócicas causadas pelo sorogrupo C, incluindo meningite e outras infecções invasivas",when:"Aos 3 meses."}]},
{age:"4 meses",vaccines:[
{id:"pentavalente-dose2",name:"Pentavalente (DTP + Hib + HB)",dose:"2ª dose",prevents:"Difteria, tétano, coqueluche, infecções por Haemophilus influenzae tipo b e hepatite B",when:"Aos 4 meses."},
{id:"rotavirus-dose2",name:"VORH — Rotavírus humano",dose:"2ª dose",prevents:"Diarreia e gastroenterite por rotavírus",when:"Aos 4 meses. Há limites de idade para aplicação; confirme com a UBS."},
{id:"vip-dose2",name:"VIP — Poliomielite inativada",dose:"2ª dose",prevents:"Poliomielite (paralisia infantil)",when:"Aos 4 meses."},
{id:"pneumococica-dose2",name:"Pneumocócica conjugada",dose:"2ª dose",prevents:"Doenças pneumocócicas invasivas",when:"Aos 4 meses; a formulação pode variar durante a transição do calendário. Confirme com a UBS."}]},
{age:"5 meses",vaccines:[{id:"meningococica-dose2",name:"Meningocócica C conjugada",dose:"2ª dose",prevents:"Doenças meningocócicas causadas pelo sorogrupo C, incluindo meningite e outras infecções invasivas",when:"Aos 5 meses."}]},
{age:"6 meses",vaccines:[
{id:"pentavalente-dose3",name:"Pentavalente (DTP + Hib + HB)",dose:"3ª dose",prevents:"Difteria, tétano, coqueluche, infecções por Haemophilus influenzae tipo b e hepatite B",when:"Aos 6 meses."},
{id:"vip-dose3",name:"VIP — Poliomielite inativada",dose:"3ª dose",prevents:"Poliomielite (paralisia infantil)",when:"Aos 6 meses."},
{id:"influenza-dose1",name:"Influenza trivalente",dose:"1ª dose",prevents:"Influenza (gripe)",when:"A partir dos 6 meses. Na primeira vacinação contra influenza, a criança pode precisar de 2 doses com intervalo recomendado pela UBS; depois, a vacinação é anual."},
{id:"covid-dose1",name:"Covid-19",dose:"1ª dose",prevents:"Formas graves de Covid-19 causadas pelo SARS-CoV-2",when:"Aos 6 meses; o esquema depende do imunizante e da orientação do serviço de saúde."}]},
{age:"6 a 8 meses",vaccines:[{id:"febre-amarela-excepcional",name:"Febre amarela",dose:"1 dose em casos excepcionais",prevents:"Febre amarela e suas complicações",when:"Somente em situações excepcionais, como residência ou viagem para área de transmissão ativa, após avaliação de risco-benefício por profissional de saúde."}]},
{age:"7 meses",vaccines:[{id:"covid-dose2",name:"Covid-19",dose:"2ª dose",prevents:"Formas graves de Covid-19 causadas pelo SARS-CoV-2",when:"Aos 7 meses no esquema de 3 doses com Comirnaty; pode variar conforme o imunizante e a orientação da UBS."}]},
{age:"9 meses",vaccines:[
{id:"covid-dose3",name:"Covid-19",dose:"3ª dose",prevents:"Formas graves de Covid-19 causadas pelo SARS-CoV-2",when:"Aos 9 meses no esquema de 3 doses com Comirnaty; pode variar conforme o imunizante e a orientação da UBS."},
{id:"febre-amarela-dose1",name:"Febre amarela",dose:"1ª dose",prevents:"Febre amarela e suas complicações",when:"Aos 9 meses, conforme calendário nacional e histórico vacinal."}]},
{age:"12 meses",vaccines:[
{id:"pneumococica-reforco12m",name:"Pneumocócica conjugada",dose:"Reforço",prevents:"Doenças pneumocócicas invasivas",when:"Aos 12 meses; confirme a formulação prevista no calendário vigente."},
{id:"meningo-acwy-dose1",name:"Meningocócica ACWY",dose:"1 dose",prevents:"Doenças meningocócicas causadas pelos sorogrupos A, C, W-135 e Y",when:"Aos 12 meses."},
{id:"triplice-viral-dose1",name:"Tríplice viral (SCR)",dose:"1ª dose",prevents:"Sarampo, caxumba e rubéola",when:"Aos 12 meses."}]},
{age:"15 meses",vaccines:[
{id:"vip-reforco15m",name:"VIP — Poliomielite inativada",dose:"Reforço",prevents:"Poliomielite (paralisia infantil)",when:"Aos 15 meses, conforme o calendário vigente."},
{id:"dtp-reforco1",name:"DTP — Tríplice bacteriana",dose:"1º reforço",prevents:"Difteria, tétano e coqueluche",when:"Aos 15 meses."},
{id:"triplice-viral-dose2",name:"Tríplice viral (SCR)",dose:"2ª dose",prevents:"Sarampo, caxumba e rubéola",when:"Aos 15 meses."},
{id:"varicela-dose1",name:"Varicela",dose:"1ª dose",prevents:"Varicela (catapora)",when:"Aos 15 meses."},
{id:"hepatite-a-dose1",name:"Hepatite A",dose:"1 dose",prevents:"Hepatite A",when:"Aos 15 meses."}]},
{age:"4 anos",vaccines:[
{id:"dtp-reforco2",name:"DTP — Tríplice bacteriana",dose:"2º reforço",prevents:"Difteria, tétano e coqueluche",when:"Aos 4 anos."},
{id:"vip-reforco2",name:"VIP — Poliomielite inativada",dose:"Reforço",prevents:"Poliomielite (paralisia infantil)",when:"Aos 4 anos, conforme calendário vigente."},
{id:"varicela-dose2",name:"Varicela",dose:"2ª dose",prevents:"Varicela (catapora)",when:"Aos 4 anos."},
{id:"febre-amarela-reforco4a",name:"Febre amarela",dose:"Reforço",prevents:"Febre amarela e suas complicações",when:"Aos 4 anos, conforme calendário nacional e histórico vacinal."}]},
{age:"5 anos",vaccines:[{id:"pneumococica-dose5a",name:"Pneumocócica 20-valente",dose:"1 dose — indicação específica",prevents:"Doenças pneumocócicas invasivas pelos sorogrupos contidos na vacina",when:"A indicação aos 5 anos é específica para alguns grupos, como crianças indígenas sem histórico de vacina pneumocócica conjugada, segundo o calendário nacional consultado. Confirme com a UBS."}]}
];

function renderBabyVaccineCalendar() {
 const container=$("#babyVaccineCalendar"); if(!container) return;
 container.innerHTML=BABY_VACCINE_CALENDAR.map((group,i)=>{
  const cards=group.vaccines.map(v=>`<article class="baby-vaccine-card" data-vaccine-id="${v.id}"><div class="baby-vaccine-card-top"><div class="vaccine-icon" aria-hidden="true">💉</div><div class="baby-vaccine-heading"><h4>${v.name}</h4><p class="baby-vaccine-dose">${v.dose}</p><span class="vaccine-status">Pendente</span></div><label class="vaccine-check-wrap" title="Marcar vacina como concluída"><input class="vaccine-check" type="checkbox" aria-label="Marcar ${v.name} ${v.dose} como concluída"><span class="custom-check"></span></label></div><div class="baby-vaccine-details"><p><strong>🛡️ O que previne</strong></p><p>${v.prevents}</p><p><strong>📅 Quando tomar</strong></p><p>${v.when}</p></div></article>`).join("");
  return `<details class="baby-age-group" ${i<2?"open":""}><summary><span class="baby-age-title">${group.age}</span><span class="baby-age-count">${group.vaccines.length} ${group.vaccines.length===1?"vacina":"vacinas"}</span><span class="baby-age-chevron" aria-hidden="true">⌄</span></summary><div class="baby-age-vaccines">${cards}</div></details>`;
 }).join("");
 renderVaccineStates();
 createVaccineJustificationFields();
}
function updateBabyVaccineProgress(){
 const ids=BABY_VACCINE_CALENDAR.flatMap(g=>g.vaccines.map(v=>v.id));
 const status=vaccineStatusByChild[getSelectedChild()?.id]||{}; const done=ids.filter(id=>status[id]===true).length;
 const bar=$("#babyVaccineProgressBar"), label=$("#babyVaccineProgressLabel");
 if(bar) bar.style.width=`${ids.length?done/ids.length*100:0}%`;
 if(label) label.textContent=`${done} de ${ids.length} doses concluídas`;
}

const VACCINE_STORAGE_KEY = "babyKaseVaccineStatus";
let vaccineStatusByChild = JSON.parse(localStorage.getItem(VACCINE_STORAGE_KEY) || "{}");

function saveVaccineStatus() {
  localStorage.setItem(VACCINE_STORAGE_KEY, JSON.stringify(vaccineStatusByChild));
}

function renderVaccineStates() {
  const childId = getSelectedChild()?.id;
  if (childId) {
    const childStatuses = vaccineStatusByChild[childId] || {};
    $$("#babyVaccines .baby-vaccine-card[data-vaccine-id]").forEach(row => {
      const taken = childStatuses[row.dataset.vaccineId] === true;
      const checkbox = row.querySelector(".vaccine-check");
      const status = row.querySelector(".vaccine-status");
      if (checkbox) checkbox.checked = taken;
      if (status) {
        status.textContent = taken ? "Concluída" : "Pendente";
        status.classList.toggle("taken", taken);
      }
      row.classList.toggle("vaccine-taken", taken);
    });
  }
  updateBabyVaccineProgress();

  const motherStatuses = vaccineStatusByChild.mother || {};
  $$("#motherVaccines .mother-vaccine-card[data-vaccine-id]").forEach(card => {
    const taken = motherStatuses[card.dataset.vaccineId] === true;
    const checkbox = card.querySelector(".vaccine-check");
    const status = card.querySelector(".vaccine-status");
    if (checkbox) checkbox.checked = taken;
    if (status) {
      status.textContent = taken ? "Concluída" : "Pendente";
      status.classList.toggle("taken", taken);
    }
    card.classList.toggle("vaccine-taken", taken);
  });
    updateVaccineJustificationFields();
}

// ==========================================
// JUSTIFICATIVA E OBSERVAÇÕES DAS VACINAS
// ==========================================

const VACCINE_JUSTIFICATION_KEY = "babyKaseVaccineJustifications";

let vaccineJustifications = {};

try {
  vaccineJustifications = JSON.parse(
    localStorage.getItem(VACCINE_JUSTIFICATION_KEY) || "{}"
  ) || {};
} catch {
  vaccineJustifications = {};
}

// Salvar justificativas no navegador
function saveVaccineJustifications() {
  localStorage.setItem(
    VACCINE_JUSTIFICATION_KEY,
    JSON.stringify(vaccineJustifications)
  );
}

// Identificar se o registro pertence à mãe ou à criança
function getVaccineOwner(card) {
  return card.closest("#motherVaccines")
    ? "mother"
    : getSelectedChild()?.id;
}

// Criar os campos de justificativa em cada vacina
function createVaccineJustificationFields() {

  const cards = document.querySelectorAll(
    "#babyVaccines .baby-vaccine-card, #motherVaccines .mother-vaccine-card"
  );

  cards.forEach(card => {

    if (card.querySelector(".vaccine-justification")) return;

    const vaccineId = card.dataset.vaccineId;

    if (!vaccineId) return;

    const fields = document.createElement("div");

    fields.className = "vaccine-justification";

    fields.innerHTML = `
      <div class="justification-divider"></div>

      <div class="justification-heading">
        <span>📝</span>
        <div>
          <h5>Justificativa da vacina</h5>
          <p>Se a vacina ainda não foi tomada, informe o motivo.</p>
        </div>
      </div>

      <label class="justification-label">
        Por que a vacina não foi tomada?
        <textarea
          class="vaccine-justification-input"
          data-vaccine-field="justification"
          data-vaccine-id="${vaccineId}"
          rows="3"
          placeholder="Ex.: Aguardando orientação médica, criança estava doente, dificuldade de comparecer à UBS..."
        ></textarea>
      </label>

      <label class="justification-label">
        Observações
        <textarea
          class="vaccine-observations-input"
          data-vaccine-field="observations"
          data-vaccine-id="${vaccineId}"
          rows="3"
          placeholder="Adicione outras informações importantes..."
        ></textarea>
      </label>

      <span class="justification-saved">
        ✓ Informações salvas automaticamente
      </span>
    `;

    const details = card.querySelector(
      ".baby-vaccine-details, .mother-vaccine-details"
    );

    if (details) {
      details.after(fields);
    } else {
      card.appendChild(fields);
    }

  });

  updateVaccineJustificationFields();
}

// Atualizar campos conforme o status da vacina
function updateVaccineJustificationFields() {

  document.querySelectorAll(
    "#babyVaccines .baby-vaccine-card, #motherVaccines .mother-vaccine-card"
  ).forEach(card => {

    const owner = getVaccineOwner(card);
    const vaccineId = card.dataset.vaccineId;

    if (!owner || !vaccineId) return;

    const taken =
      vaccineStatusByChild[owner]?.[vaccineId] === true;

    const fields = card.querySelector(".vaccine-justification");

    if (!fields) return;

    // Esconde os campos quando a vacina está concluída
    fields.hidden = taken;

    const saved =
      vaccineJustifications[owner]?.[vaccineId] || {};

    const justification = fields.querySelector(
      '[data-vaccine-field="justification"]'
    );

    const observations = fields.querySelector(
      '[data-vaccine-field="observations"]'
    );

    if (justification && document.activeElement !== justification) {
      justification.value = saved.justification || "";
    }

    if (observations && document.activeElement !== observations) {
      observations.value = saved.observations || "";
    }

  });
}

// Salvar automaticamente ao preencher os campos
function handleVaccineJustification(event) {

  const input = event.target.closest(
    "[data-vaccine-field]"
  );

  if (!input) return;

  const vaccineId = input.dataset.vaccineId;
  const field = input.dataset.vaccineField;

  const card = input.closest("[data-vaccine-id]");
  const owner = getVaccineOwner(card);

  if (!owner || !vaccineId) return;

  if (!vaccineJustifications[owner]) {
    vaccineJustifications[owner] = {};
  }

  if (!vaccineJustifications[owner][vaccineId]) {
    vaccineJustifications[owner][vaccineId] = {
      justification: "",
      observations: ""
    };
  }

  vaccineJustifications[owner][vaccineId][field] = input.value;

  saveVaccineJustifications();
}

// Eventos para as vacinas da criança
$("#babyVaccines").addEventListener(
  "input",
  handleVaccineJustification
);

// Eventos para as vacinas da mãe
$("#motherVaccines").addEventListener(
  "input",
  handleVaccineJustification
);

function handleVaccineCheck(event, ownerId) {
  if (!event.target.matches(".vaccine-check")) return;
  const row = event.target.closest("[data-vaccine-id]");
  if (!row) return;
  if (ownerId === "baby" && !getSelectedChild()) return;
  const storageId = ownerId === "mother" ? "mother" : getSelectedChild().id;
  if (!vaccineStatusByChild[storageId]) vaccineStatusByChild[storageId] = {};
  vaccineStatusByChild[storageId][row.dataset.vaccineId] = event.target.checked;
  saveVaccineStatus();
  renderVaccineStates();
  const vaccineName = row.querySelector("h4, .vaccine-name strong")?.textContent.trim() || "Vacina";
  showToast(event.target.checked ? `${vaccineName}: marcada como concluída.` : `${vaccineName}: voltou para pendente.`);
}

$("#babyVaccines").addEventListener("change", event => handleVaccineCheck(event, "baby"));
$("#motherVaccines").addEventListener("change", event => handleVaccineCheck(event, "mother"));
renderBabyVaccineCalendar();

// Cadastro da criança
modalContent.addEventListener("submit", (event) => {
  if (event.target.id !== "childForm") return;
  event.preventDefault();

  const name = $("#childName").value.trim();
  const birth = $("#childBirth").value;
  const gender = $("#childGender").value;

  const newChild = {
    id: `child-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    name,
    birth,
    gender
  };

  children.push(newChild);
  selectedChildId = newChild.id;

  localStorage.setItem("babyKaseChildren", JSON.stringify(children));
  localStorage.setItem("babyKaseSelectedChild", selectedChildId);

  renderChildren();
  updateChildDependentUI();
  renderVaccineStates();

  closeModal();
  event.target.reset();
  showToast(`${name} foi cadastrado(a) com sucesso!`);
});

renderChildren();
updateChildDependentUI();
renderVaccineStates();

// Abas Bebê / Mãe
$$('.tab').forEach(tab => {
  tab.addEventListener('click', () => {
    $$('.tab').forEach(item => item.classList.remove('active'));
    tab.classList.add('active');
    const isBaby = tab.dataset.tab === 'baby';
    $("#babyVaccines").classList.toggle('hidden', !isBaby);
    $("#motherVaccines").classList.toggle('hidden', isBaby);
  });
});


// Lembretes
$("#reminderToggle")?.addEventListener("change", (event) => {
  showToast(event.target.checked ? "Lembretes de vacinas ativados!" : "Lembretes de vacinas desativados.");
});

// =============================
// GRÁFICO DE CRESCIMENTO
// =============================

const demoGrowth = [
  { age: 0, weight: 3.4, height: 50 },
  { age: 2, weight: 5.3, height: 57 },
  { age: 4, weight: 6.6, height: 63 },
  { age: 6, weight: 7.6, height: 67 },
  { age: 9, weight: 8.8, height: 72 },
  { age: 12, weight: 9.8, height: 76 }
];

let growthMeasurements = JSON.parse(localStorage.getItem("babyKaseGrowth") || "[]");
let growthChartMode = "weight";

function getCurrentChildName() {
  return getSelectedChild()?.name || "Maria Eduarda";
}

function getGrowthData() {
  const child = getSelectedChild();
  const actual = growthMeasurements
    .filter(item =>
      (item.childId && item.childId === child?.id) ||
      (!item.childId && item.name === getCurrentChildName())
    )
    .sort((a, b) => a.age - b.age);

  return actual.length ? actual : demoGrowth;
}

function calculateAgeMonths(birth, date) {
  const b = new Date(`${birth}T00:00:00`);
  const d = new Date(`${date}T00:00:00`);
  return Math.max(0, (d.getFullYear() - b.getFullYear()) * 12 + (d.getMonth() - b.getMonth()));
}

function renderGrowthChart() {
  const data = getGrowthData();
  const isWeight = growthChartMode === "weight";
  const values = data.map(item => isWeight ? item.weight : item.height);
  const maxValue = isWeight ? 12 : 85;
  const minValue = isWeight ? 0 : 45;
  const width = 680;
  const height = 300;
  const pad = { left: 55, right: 20, top: 25, bottom: 45 };
  const plotW = width - pad.left - pad.right;
  const plotH = height - pad.top - pad.bottom;
  const maxAge = Math.max(12, ...data.map(item => item.age));

  const points = data.map(item => {
    const x = pad.left + (item.age / maxAge) * plotW;
    const value = isWeight ? item.weight : item.height;
    const y = pad.top + (1 - (value - minValue) / (maxValue - minValue)) * plotH;
    return { ...item, x, y, value };
  });

  const path = points.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x.toFixed(1)} ${p.y.toFixed(1)}`).join(' ');
  const yTicks = isWeight ? [0, 3, 6, 9, 12] : [45, 55, 65, 75, 85];
  const xTicks = [0, 3, 6, 9, 12].filter(age => age <= maxAge);

  const grid = yTicks.map(v => {
    const y = pad.top + (1 - (v - minValue) / (maxValue - minValue)) * plotH;
    return `<line x1="${pad.left}" y1="${y}" x2="${width - pad.right}" y2="${y}" class="chart-grid" />
            <text x="${pad.left - 10}" y="${y + 4}" text-anchor="end" class="chart-label">${v}</text>`;
  }).join('');

  const xLabels = xTicks.map(age => {
    const x = pad.left + (age / maxAge) * plotW;
    return `<text x="${x}" y="${height - 15}" text-anchor="middle" class="chart-label">${age}m</text>`;
  }).join('');

  const dots = points.map(p => `<circle cx="${p.x}" cy="${p.y}" r="5" class="chart-dot"><title>${p.age} meses — ${p.value}${isWeight ? ' kg' : ' cm'}</title></circle>`).join('');

  const note = data === demoGrowth
    ? `<div class="chart-demo-note">Dados de exemplo para demonstração do protótipo. Adicione medições reais para substituir estes valores.</div>`
    : `<div class="chart-demo-note">Medições cadastradas para ${getCurrentChildName()}.</div>`;

  return `
    <div class="growth-summary">
      <div><span>Criança</span><strong>${getCurrentChildName()}</strong></div>
      <div><span>Visualização</span><strong>${isWeight ? 'Peso' : 'Altura'}</strong></div>
    </div>

    <div class="chart-tabs">
      <button class="chart-tab ${isWeight ? 'active' : ''}" data-chart="weight">Peso (kg)</button>
      <button class="chart-tab ${!isWeight ? 'active' : ''}" data-chart="height">Altura (cm)</button>
    </div>

    <div class="growth-chart-wrap">
      <svg class="growth-chart" viewBox="0 0 ${width} ${height}" role="img" aria-label="Gráfico de crescimento">
        ${grid}
        <line x1="${pad.left}" y1="${height - pad.bottom}" x2="${width - pad.right}" y2="${height - pad.bottom}" class="chart-axis" />
        <line x1="${pad.left}" y1="${pad.top}" x2="${pad.left}" y2="${height - pad.bottom}" class="chart-axis" />
        <path d="${path}" class="chart-line" />
        ${dots}
        ${xLabels}
        <text x="${width / 2}" y="${height - 2}" text-anchor="middle" class="chart-axis-title">Idade (meses)</text>
      </svg>
    </div>

    ${note}

    <div class="growth-actions">
      <button class="outline-btn" id="newGrowthBtn">＋ Adicionar medição</button>
      <button class="primary-btn" id="growthCloseBtn">Fechar</button>
    </div>
  `;
}

function showGrowthChart() {
  modalBox.classList.add("growth-modal");
  modalContent.innerHTML = `
    <h2>Gráfico de crescimento</h2>
    <p>Acompanhe peso e altura ao longo dos meses.</p>
    ${renderGrowthChart()}
  `;
  modal.classList.add("open");
}

function showGrowthForm() {
  modalBox.classList.add("growth-modal");
  modalContent.innerHTML = `
    <h2>Registrar crescimento</h2>
    <p>Cadastre uma medição para acompanhar a evolução da criança.</p>
    <form id="growthForm" class="growth-form">
      <input id="growthName" type="text" placeholder="Nome da criança" value="${getCurrentChildName()}" required>
      <input id="growthBirth" type="date" value="${getSelectedChild()?.birth || "2024-03-12"}" required>
      <input id="growthDate" type="date" required>
      <div class="growth-fields">
        <label> Peso (kg)
          <input id="growthWeight" type="number" step="0.1" min="0" placeholder="Ex.: 8,5" required>
        </label>
        <label> Altura (cm)
          <input id="growthHeight" type="number" step="0.1" min="0" placeholder="Ex.: 70" required>
        </label>
      </div>
      <button class="primary-btn" type="submit">Salvar medição</button>
    </form>
    <button class="text-btn" id="backToGrowthBtn">← Voltar para o gráfico</button>
  `;

  const today = new Date().toISOString().slice(0, 10);
  $("#growthDate").value = today;
}

$("#growthBtn")?.addEventListener("click", showGrowthChart);

modalContent.addEventListener("click", (event) => {
  if (event.target.matches(".chart-tab")) {
    growthChartMode = event.target.dataset.chart;
    showGrowthChart();
  }

  if (event.target.id === "newGrowthBtn") showGrowthForm();
  if (event.target.id === "growthCloseBtn") closeModal();
  if (event.target.id === "backToGrowthBtn") showGrowthChart();
});

modalContent.addEventListener("submit", (event) => {
  if (event.target.id !== "growthForm") return;
  event.preventDefault();

  const name = $("#growthName").value.trim();
  const birth = $("#growthBirth").value;
  const date = $("#growthDate").value;
  const weight = Number($("#growthWeight").value);
  const height = Number($("#growthHeight").value);
  const age = calculateAgeMonths(birth, date);

  growthMeasurements.push({
    childId: selectedChildId,
    name,
    date,
    age,
    weight,
    height
  });
  localStorage.setItem("babyKaseGrowth", JSON.stringify(growthMeasurements));

  // O histórico de crescimento fica ligado à criança selecionada.
  // Registrar uma medição não substitui nenhuma outra criança.
  growthChartMode = "weight";
  showGrowthChart();
  showToast("Medição de crescimento salva!");
});

// Agenda
$("#scheduleBtn")?.addEventListener("click", () => {
  openModal("Agendar consulta", "Aqui entrará o formulário de data, horário e profissional.");
});

// Histórico de vacinação: nova apresentação, sem substituir os registros originais.
const VAX_DATE_KEY = 'babyKaseVaccineDates';
let vaxDates = {};
try { vaxDates = JSON.parse(localStorage.getItem(VAX_DATE_KEY) || '{}') || {}; } catch { vaxDates = {}; }
const vaxHtml = value => String(value ?? '').replace(/[&<>"']/g, x => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[x]));
const vaxType = () => document.querySelector('.vax-tabs .tab.active')?.dataset.tab || 'baby';
function vaxRenderHistory() {
  const mother = vaxType() === 'mother';
  $('#vaxHistoryTitle').textContent = mother ? 'Vacinas da mãe' : 'Vacinas da criança';
  const key = mother ? 'mother' : selectedChildId;
  const states = vaccineStatusByChild[key] || {};
  const entries = mother
    ? [...document.querySelectorAll('#motherVaccines .mother-vaccine-card')].map(card => ({
      id:card.dataset.vaccineId,
      name:card.querySelector('h4')?.textContent.trim() || 'Vacina',
      dose:'Conforme calendário',
      when:card.querySelector('.mother-vaccine-when')?.textContent.trim() || ''
    }))
    : BABY_VACCINE_CALENDAR.flatMap(group => group.vaccines.map(v => ({...v, age:group.age})));
  $('#vaxHistoryRows').innerHTML = entries.map(entry => {
    const done = states[entry.id] === true;
    const dateKey = `${key}:${entry.id}`;
    const date = vaxDates[dateKey] || '';
    return `<tr class="${done ? 'vax-row-done' : ''}" data-vax-row="${vaxHtml(entry.id)}">
      <td><span class="vax-row-icon" aria-hidden="true">💉</span><span class="vax-row-name">${vaxHtml(entry.name)}</span></td>
      <td>${vaxHtml(entry.dose)}</td>
      <td><input type="date" class="vax-date-input" data-vax-date="${vaxHtml(entry.id)}" value="${vaxHtml(date)}" aria-label="Data de aplicação: ${vaxHtml(entry.name)}"></td>
      <td class="vax-next">${done ? 'Consultar calendário' : 'Pendente'}</td>
      <td><label class="vax-done-label"><input type="checkbox" data-vax-check="${vaxHtml(entry.id)}" ${done ? 'checked' : ''}><span>${done ? '✓' : '○'}</span></label></td>
    </tr>`;
  }).join('');
}
$('#vaxHistoryRows').addEventListener('change', e => {
  const input = e.target;
  const key = vaxType() === 'mother' ? 'mother' : selectedChildId;
  if (input.matches('[data-vax-date]')) {
    vaxDates[`${key}:${input.dataset.vaxDate}`] = input.value;
    localStorage.setItem(VAX_DATE_KEY, JSON.stringify(vaxDates));
  }
  if (input.matches('[data-vax-check]')) {
    if (!vaccineStatusByChild[key]) vaccineStatusByChild[key] = {};
    vaccineStatusByChild[key][input.dataset.vaxCheck] = input.checked;
    saveVaccineStatus();
    renderVaccineStates();
    vaxRenderHistory();
  }
});
document.querySelectorAll('.vax-tabs .tab').forEach(tab => tab.addEventListener('click', () => {
  $('#vaxCalendarDetails').hidden = true;
  vaxRenderHistory();
}));
function vaxShowCalendar(pending) {
  const panel = $('#vaxCalendarDetails');
  panel.hidden = false;
  $('#vaxCalendarTitle').textContent = pending ? 'Vacinas pendentes e calendário' : 'Calendário completo';
  panel.scrollIntoView({behavior:'smooth',block:'start'});
}
$('#calendarBtn').addEventListener('click', () => vaxShowCalendar(false));
$('#vaxPendingBtn').addEventListener('click', () => vaxShowCalendar(true));
$('#vaxCloseCalendar').addEventListener('click', () => { $('#vaxCalendarDetails').hidden = true; });
document.querySelectorAll('.nav-item[data-target="vacinas"], .quick-actions [data-target="vacinas"]').forEach(button => {
  button.addEventListener('click', () => vaxRenderHistory());
});
$('#childrenList').addEventListener('click', () => setTimeout(vaxRenderHistory, 0));
vaxRenderHistory();

function openBabyScreen(id) {
 const app=document.querySelector('.app'), target=document.getElementById(id);
 if(!app||!target)return;
 app.classList.add('nav-screen-mode');
 $$('.app > section, .app > header').forEach(el=>el.classList.remove('nav-active-screen'));
 target.hidden=false;
 if(id==='vacinas'||id==='diario'){
  document.querySelector('.app > .hero')?.classList.add('nav-active-screen');
  document.querySelector('.app > .children-section')?.classList.add('nav-active-screen');
 }
 target.classList.add('nav-active-screen');
 window.scrollTo({top:0,behavior:'smooth'});
 if(id==='vacinas')vaxRenderHistory();
}


// =============================
// SAÚDE E DIÁRIO DE CONSULTAS
// =============================
$$('[data-health-open]').forEach(button => {
  button.addEventListener('click', () => {
    openBabyScreen(button.dataset.healthOpen);
    if (button.dataset.healthOpen === 'diario') renderDiary();
  });
});

if (window.location.hash === '#saude') {
  openBabyScreen('saude');
}

$('#diaryBack').addEventListener('click', () => openBabyScreen('saude'));

const DIARY_KEY = 'babyKaseConsultationDiary';
function getDiaryNotes() {
  try {
    const notes = JSON.parse(localStorage.getItem(DIARY_KEY) || '[]');
    return Array.isArray(notes) ? notes : [];
  } catch { return []; }
}
let diaryNotes = getDiaryNotes();
function saveDiaryNotes() {
  localStorage.setItem(DIARY_KEY, JSON.stringify(diaryNotes));
}
function diaryEscape(value) {
  return String(value ?? '').replace(/[&<>"']/g, char =>
    ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[char]));
}
function diaryDateBR(value) {
  if (!value) return '';
  const [year, month, day] = value.split('-');
  return `${day}/${month}/${year}`;
}
function resetDiaryForm() {
  $('#diaryForm').reset();
  $('#diaryEditId').value = '';
  $('#diaryDate').value = `${new Date().getFullYear()}-${String(new Date().getMonth()+1).padStart(2,'0')}-${String(new Date().getDate()).padStart(2,'0')}`;
  $('#diarySave').textContent = 'Salvar anotação';
  $('#diaryCancel').hidden = true;
}
function renderDiary() {
  const child = getSelectedChild();
  $('#diaryChildName').textContent = child ? `Anotações de ${child.name}` : 'Selecione uma criança';
  const notes = diaryNotes.filter(note => note.childId === selectedChildId)
    .sort((a,b) => b.date.localeCompare(a.date));
  $('#diaryEntries').innerHTML = notes.length ? notes.map(note => `
    <article class="diary-entry">
      <h4>${diaryEscape(note.specialty || 'Consulta')} · ${diaryDateBR(note.date)}</h4>
      ${note.doctor ? `<p><strong>Profissional:</strong> ${diaryEscape(note.doctor)}</p>` : ''}
      ${note.guidance ? `<p><strong>Orientações:</strong> ${diaryEscape(note.guidance)}</p>` : ''}
      ${note.medicines ? `<p><strong>Medicamentos:</strong> ${diaryEscape(note.medicines)}</p>` : ''}
      ${note.care ? `<p><strong>Cuidados:</strong> ${diaryEscape(note.care)}</p>` : ''}
      ${note.pniSus ? `<p><strong>PNI/SUS:</strong> ${diaryEscape(note.pniSus)}</p>` : ''}
      ${note.location ? `<p><strong>Local:</strong> ${diaryEscape(note.location)}</p>` : ''}
      ${note.batch ? `<p><strong>Lote:</strong> ${diaryEscape(note.batch)}</p>` : ''}
      ${note.returnDate ? `<p><strong>Retorno:</strong> ${diaryDateBR(note.returnDate)}</p>` : ''}
      <div class="diary-actions">
        <button class="outline-btn" type="button" data-diary-edit="${diaryEscape(note.id)}">Editar</button>
        <button class="outline-btn" type="button" data-diary-delete="${diaryEscape(note.id)}">Excluir</button>
      </div>
    </article>`).join('') : '<p class="diary-empty">Nenhuma anotação para esta criança ainda. 💗</p>';
}
$('#diaryForm').addEventListener('submit', event => {
  event.preventDefault();
  const fields = {
    date: $('#diaryDate').value, specialty: $('#diarySpecialty').value.trim(),
    doctor: $('#diaryDoctor').value.trim(), guidance: $('#diaryGuidance').value.trim(),
    medicines: $('#diaryMedicines').value.trim(), care: $('#diaryCare').value.trim(),
    pniSus: $('#diaryPniSus').value.trim(), location: $('#diaryLocation').value.trim(),
    batch: $('#diaryBatch').value.trim(),
    returnDate: $('#diaryReturn').value
  };
  if (!fields.guidance && !fields.medicines && !fields.care && !fields.pniSus && !fields.location && !fields.batch) {
    showToast('Escreva pelo menos uma orientação, medicamento ou cuidado.');
    return;
  }
  const editId = $('#diaryEditId').value;
  if (editId) {
    const index = diaryNotes.findIndex(note => note.id === editId && note.childId === selectedChildId);
    if (index < 0) return;
    diaryNotes[index] = {...diaryNotes[index], ...fields};
  } else {
    diaryNotes.push({...fields, id: `note-${Date.now()}-${Math.random().toString(36).slice(2)}`, childId: selectedChildId});
  }
  saveDiaryNotes();
  resetDiaryForm();
  renderDiary();
  showToast('Anotação salva! 💗');
});
$('#diaryCancel').addEventListener('click', resetDiaryForm);
$('#diaryEntries').addEventListener('click', event => {
  const edit = event.target.closest('[data-diary-edit]');
  const remove = event.target.closest('[data-diary-delete]');
  if (!edit && !remove) return;
  const id = (edit || remove).dataset[edit ? 'diaryEdit' : 'diaryDelete'];
  const note = diaryNotes.find(item => item.id === id && item.childId === selectedChildId);
  if (!note) return;
  if (remove) {
    if (!confirm('Excluir esta anotação?')) return;
    diaryNotes = diaryNotes.filter(item => item.id !== id);
    saveDiaryNotes();
    renderDiary();
    return;
  }
  $('#diaryEditId').value = note.id;
  $('#diaryDate').value = note.date;
  $('#diarySpecialty').value = note.specialty;
  $('#diaryDoctor').value = note.doctor;
  $('#diaryGuidance').value = note.guidance;
  $('#diaryMedicines').value = note.medicines;
  $('#diaryCare').value = note.care;
  $('#diaryPniSus').value = note.pniSus || '';
  $('#diaryLocation').value = note.location || '';
  $('#diaryBatch').value = note.batch || '';
  $('#diaryReturn').value = note.returnDate;
  $('#diarySave').textContent = 'Salvar alterações';
  $('#diaryCancel').hidden = false;
  $('#diaryForm').scrollIntoView({behavior:'smooth',block:'start'});
});
$('#childrenList').addEventListener('click', () => {
  resetDiaryForm();
  renderDiary();
});
resetDiaryForm();
renderDiary();

// Exclusão do cadastro selecionado nas telas de Vacinas e Diário.
function removeSelectedChildFromHealth() {
  const button = [...document.querySelectorAll('#childrenList .child-delete-btn')]
    .find(el => el.dataset.deleteChildId === selectedChildId);
  if (button) button.click();
}

function updateHealthRemoveLabels() {
  const child = getSelectedChild();

}
$('#childrenList')?.addEventListener('click', () => setTimeout(updateHealthRemoveLabels, 0));
updateHealthRemoveLabels();