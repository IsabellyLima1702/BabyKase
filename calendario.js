(() => {
  "use strict";

  const STORAGE_KEY = "meu-calendario:eventos:v1";

  const $ = (selector) => document.querySelector(selector);

  const el = {
    monthTitle: $("#month-title"),
    calendarDays: $("#calendar-days"),
    selectedDateTitle: $("#selected-date-title"),
    eventList: $("#event-list"),
    dialog: $("#event-dialog"),
    form: $("#event-form"),
    eventId: $("#event-id"),
    title: $("#event-title"),
    date: $("#event-date"),
    time: $("#event-time"),
    category: $("#event-category"),
    notes: $("#event-notes"),
    dialogTitle: $("#dialog-title"),
    dialogEyebrow: $("#dialog-eyebrow"),
    formError: $("#form-error"),
    toast: $("#toast"),
  };

  const today = new Date();

  let currentMonth = new Date(
    today.getFullYear(),
    today.getMonth(),
    1
  );

  let selectedDate = toDateKey(today);
  let events = loadEvents();
  let toastTimeout;

  // Formata a data como AAAA-MM-DD.
  function toDateKey(date) {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");

    return `${year}-${month}-${day}`;
  }

  // Cria uma data local sem problemas de fuso horário.
  function parseDateKey(key) {
    const [year, month, day] = key.split("-").map(Number);

    return new Date(year, month - 1, day);
  }

  // Exibe uma data em português.
  function formatDate(key) {
    return parseDateKey(key).toLocaleDateString("pt-BR", {
      weekday: "long",
      day: "numeric",
      month: "long",
      year: "numeric"
    });
  }

  // Carrega os eventos do localStorage.
  function loadEvents() {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);

      if (!stored) return [];

      const parsed = JSON.parse(stored);

      if (!Array.isArray(parsed)) return [];

      return parsed
        .filter(isValidEvent)
        .map(normalizeEvent);

    } catch (error) {
      console.error("Erro ao carregar eventos:", error);
      return [];
    }
  }

  // Verifica se um evento possui os campos básicos.
  function isValidEvent(event) {
    return event &&
      typeof event === "object" &&
      typeof event.id === "string" &&
      typeof event.title === "string" &&
      typeof event.date === "string" &&
      /^\d{4}-\d{2}-\d{2}$/.test(event.date);
  }

  // Normaliza os dados recebidos.
  function normalizeEvent(event) {
    const categories = [
      "Pessoal",
      "Trabalho",
      "Saúde",
      "Estudos",
      "Outro"
    ];

    return {
      id: event.id,
      title: String(event.title).slice(0, 100),
      date: event.date,
      time: typeof event.time === "string"
        ? event.time
        : "",
      category: categories.includes(event.category)
        ? event.category
        : "Outro",
      notes: typeof event.notes === "string"
        ? event.notes.slice(0, 1000)
        : ""
    };
  }

  // Salva todos os eventos.
  function saveEvents() {
    try {
      localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify(events)
      );

      return true;

    } catch (error) {
      console.error("Erro ao salvar eventos:", error);

      showToast(
        "Não foi possível salvar. Verifique o armazenamento."
      );

      return false;
    }
  }

  // Organiza os eventos por horário.
  function sortedEvents(items) {
    return [...items].sort((a, b) => {
      if (!a.time && b.time) return 1;
      if (a.time && !b.time) return -1;

      return a.time.localeCompare(b.time) ||
        a.title.localeCompare(b.title, "pt-BR");
    });
  }

  // Define a cor de cada categoria.
  function categoryClass(category) {
    const classes = {
      "Trabalho": "work",
      "Saúde": "health",
      "Estudos": "study"
    };

    return classes[category] || "";
  }

  // Desenha os dias do calendário.
  function renderCalendar() {
    el.monthTitle.textContent =
      currentMonth.toLocaleDateString("pt-BR", {
        month: "long",
        year: "numeric"
      });

    el.calendarDays.replaceChildren();

    const firstDay = new Date(
      currentMonth.getFullYear(),
      currentMonth.getMonth(),
      1
    );

    const start = new Date(firstDay);

    start.setDate(
      firstDay.getDate() - firstDay.getDay()
    );

    const todayKey = toDateKey(new Date());

    // Seis semanas permitem mostrar todos os meses.
    for (let i = 0; i < 42; i++) {
      const date = new Date(start);

      date.setDate(start.getDate() + i);

      const key = toDateKey(date);

      const dayEvents = sortedEvents(
        events.filter(event => event.date === key)
      );

      const button = document.createElement("button");

      button.type = "button";
      button.className = "day-cell";

      button.setAttribute(
        "aria-label",
        `${formatDate(key)}, ${dayEvents.length} evento(s)`
      );

      if (date.getMonth() !== currentMonth.getMonth()) {
        button.classList.add("outside-month");
      }

      if (key === todayKey) {
        button.classList.add("is-today");
      }

      if (key === selectedDate) {
        button.classList.add("is-selected");
      }

      const number = document.createElement("span");

      number.className = "day-number";
      number.textContent = String(date.getDate());

      button.append(number);

      // Mostra até dois eventos dentro do dia.
      if (dayEvents.length > 0) {
        const pills = document.createElement("span");

        pills.className = "day-events";

        dayEvents.slice(0, 2).forEach(event => {
          const pill = document.createElement("span");

          pill.className =
            `day-event-pill ${categoryClass(event.category)}`;

          pill.textContent =
            `${event.time ? event.time + " " : ""}${event.title}`;

          pills.append(pill);
        });

        if (dayEvents.length > 2) {
          const more = document.createElement("span");

          more.className = "more-events";
          more.textContent = `+${dayEvents.length - 2}`;

          pills.append(more);
        }

        button.append(pills);
      }

      // Seleciona um dia.
      button.addEventListener("click", () => {
        selectedDate = key;

        if (date.getMonth() !== currentMonth.getMonth()) {
          currentMonth = new Date(
            date.getFullYear(),
            date.getMonth(),
            1
          );
        }

        renderAll();
      });

      el.calendarDays.append(button);
    }
  }

  // Mostra os eventos do dia selecionado.
  function renderEvents() {
    el.selectedDateTitle.textContent = formatDate(selectedDate);

    el.eventList.replaceChildren();

    const dayEvents = sortedEvents(
      events.filter(event => event.date === selectedDate)
    );

    if (dayEvents.length === 0) {
      const empty = document.createElement("div");

      empty.className = "empty-state";

      const title = document.createElement("strong");

      title.textContent = "Nenhum compromisso por aqui";

      const message = document.createElement("span");

      message.textContent =
        "Adicione um evento para organizar seu dia.";

      empty.append(title, message);

      el.eventList.append(empty);

      return;
    }

    dayEvents.forEach(event => {
      const item = document.createElement("article");

      item.className = "event-item";

      const time = document.createElement("div");

      time.className = "event-time";
      time.textContent = event.time || "Dia todo";

      const color = document.createElement("span");

      color.className =
        `event-color ${categoryClass(event.category)}`;

      const main = document.createElement("div");

      main.className = "event-main";

      const title = document.createElement("h3");

      title.textContent = event.title;

      const meta = document.createElement("p");

      meta.className = "event-meta";
      meta.textContent = event.category;

      main.append(title, meta);

      if (event.notes) {
        const notes = document.createElement("p");

        notes.className = "event-notes";
        notes.textContent = event.notes;

        main.append(notes);
      }

      const actions = document.createElement("div");

      actions.className = "event-actions";

      const edit = document.createElement("button");

      edit.type = "button";
      edit.className = "small-action";
      edit.textContent = "Editar";

      edit.addEventListener("click", () => {
        openEventDialog(event);
      });

      const remove = document.createElement("button");

      remove.type = "button";
      remove.className = "small-action";
      remove.textContent = "Excluir";

      remove.addEventListener("click", () => {
        deleteEvent(event.id);
      });

      actions.append(edit, remove);

      item.append(time, color, main, actions);

      el.eventList.append(item);
    });
  }

  function renderAll() {
    renderCalendar();
    renderEvents();
  }

  // Abre o formulário para criar ou editar.
  function openEventDialog(event = null) {
    el.form.reset();
    el.formError.textContent = "";

    el.eventId.value = event ? event.id : "";
    el.title.value = event ? event.title : "";
    el.date.value = event ? event.date : selectedDate;
    el.time.value = event ? event.time : "";
    el.category.value = event ? event.category : "Pessoal";
    el.notes.value = event ? event.notes : "";

    el.dialogTitle.textContent = event
      ? "Editar evento"
      : "Adicionar evento";

    el.dialogEyebrow.textContent = event
      ? "ATUALIZAR COMPROMISSO"
      : "NOVO COMPROMISSO";

    el.dialog.showModal();
    el.title.focus();
  }

  function closeDialog() {
    el.dialog.close();
    el.formError.textContent = "";
  }

  // Exibe mensagens temporárias.
  function showToast(message) {
    el.toast.textContent = message;
    el.toast.classList.add("visible");

    clearTimeout(toastTimeout);

    toastTimeout = setTimeout(() => {
      el.toast.classList.remove("visible");
    }, 3000);
  }

  // Exclui um evento.
  function deleteEvent(id) {
    const event = events.find(item => item.id === id);

    if (!event) return;

    const confirmed = confirm(
      `Deseja excluir o evento "${event.title}"?`
    );

    if (!confirmed) return;

    const previous = events;

    events = events.filter(item => item.id !== id);

    if (saveEvents()) {
      renderAll();
      showToast("Evento excluído.");
    } else {
      events = previous;
      renderAll();
    }
  }

  // Salva o formulário.
  el.form.addEventListener("submit", (event) => {
    event.preventDefault();

    el.formError.textContent = "";

    const title = el.title.value.trim();
    const date = el.date.value;

    if (!title || !date) {
      el.formError.textContent =
        "Preencha o título e a data do evento.";

      return;
    }

    const id = el.eventId.value ||
      (crypto.randomUUID
        ? crypto.randomUUID()
        : `${Date.now()}-${Math.random()}`);

    const record = {
      id,
      title,
      date,
      time: el.time.value,
      category: el.category.value,
      notes: el.notes.value.trim()
    };

    const previous = events;

    const existingIndex = events.findIndex(
      item => item.id === id
    );

    if (existingIndex >= 0) {
      events = events.map(item =>
        item.id === id ? record : item
      );
    } else {
      events = [...events, record];
    }

    if (!saveEvents()) {
      events = previous;
      return;
    }

    selectedDate = date;

    const [year, month] = date.split("-").map(Number);

    currentMonth = new Date(year, month - 1, 1);

    closeDialog();
    renderAll();

    showToast(
      existingIndex >= 0
        ? "Evento atualizado!"
        : "Evento salvo!"
    );
  });

  // Navegação entre meses.
  $("#prev-month").addEventListener("click", () => {
    currentMonth = new Date(
      currentMonth.getFullYear(),
      currentMonth.getMonth() - 1,
      1
    );

    renderCalendar();
  });

  $("#next-month").addEventListener("click", () => {
    currentMonth = new Date(
      currentMonth.getFullYear(),
      currentMonth.getMonth() + 1,
      1
    );

    renderCalendar();
  });

  // Volta para a data de hoje.
  $("#today-button").addEventListener("click", () => {
    const now = new Date();

    currentMonth = new Date(
      now.getFullYear(),
      now.getMonth(),
      1
    );

    selectedDate = toDateKey(now);

    renderAll();
  });

  // Botões para criar eventos.
  $("#new-event-top").addEventListener("click", () => {
    openEventDialog();
  });

  $("#new-event-day").addEventListener("click", () => {
    openEventDialog();
  });

  $("#close-dialog").addEventListener("click", closeDialog);
  $("#cancel-dialog").addEventListener("click", closeDialog);

  // Exporta um backup JSON.
  $("#export-button").addEventListener("click", () => {
    const backup = {
      app: "meu-calendario",
      version: 1,
      exportedAt: new Date().toISOString(),
      events
    };

    const blob = new Blob(
      [JSON.stringify(backup, null, 2)],
      { type: "application/json" }
    );

    const url = URL.createObjectURL(blob);

    const link = document.createElement("a");

    link.href = url;
    link.download =
      `meu-calendario-backup-${toDateKey(new Date())}.json`;

    document.body.append(link);
    link.click();
    link.remove();

    URL.revokeObjectURL(url);

    showToast("Backup exportado.");
  }); 

  // Inicializa a aplicação.
  renderAll();
})();