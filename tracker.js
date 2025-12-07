document.addEventListener("DOMContentLoaded", () => {
  const form = document.getElementById("session-form");
  const body = document.getElementById("sessions-body");
  const clearBtn = document.getElementById("clear-sessions");

  const statCount = document.getElementById("stat-count");
  const statMinutes = document.getElementById("stat-minutes");
  const statLoad = document.getElementById("stat-load");
  const loadHint = document.getElementById("load-hint");

  if (!form || !body || !statCount || !statMinutes || !statLoad) return;

  const STORAGE_KEY = "streetballers-sessions";

  function loadSessions() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return [];
      const parsed = JSON.parse(raw);
      if (!Array.isArray(parsed)) return [];
      return parsed;
    } catch {
      return [];
    }
  }

  function saveSessions(data) {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    } catch {
    }
  }

  let sessions = loadSessions();


  function formatDate(isoStr) {
    const date = new Date(isoStr);
    if (Number.isNaN(date.getTime())) return isoStr;
    return date.toLocaleDateString("hu-HU", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
    });
  }

  function updateStats() {
    const count = sessions.length;
    const totalMinutes = sessions.reduce((sum, s) => sum + s.minutes, 0);
    const totalLoad = sessions.reduce((sum, s) => sum + s.load, 0);

    statCount.textContent = count;
    statMinutes.textContent = totalMinutes;
    statLoad.textContent = totalLoad;

    if (!loadHint) return;

    if (totalLoad === 0) {
      loadHint.textContent =
        "Még nincs rögzített esemény. Adj hozzá egy meccset vagy edzést, és nézd meg a terhelést.";
    } else if (totalLoad <= 800) {
      loadHint.textContent =
        "Nyugodt hét, ez még simán vállalható szint. Figyelj azért a pihenésre is.";
    } else if (totalLoad <= 1200) {
      loadHint.textContent =
        "Elég combos terhelés. Ha érzed a fáradtságot, iktass be egy könnyebb napot.";
    } else {
      loadHint.textContent =
        "Brutál hét. Ilyenkor a szervezeted kb. könyörög egy pihenő- vagy regenerációs napért.";
    }
  }

  function renderTable() {
    body.innerHTML = "";

    sessions.forEach((s, index) => {
      const tr = document.createElement("tr");

      const dateTd = document.createElement("td");
      dateTd.textContent = formatDate(s.date);

      const typeTd = document.createElement("td");
      typeTd.textContent = s.typeLabel;

      const minTd = document.createElement("td");
      minTd.textContent = s.minutes;

      const rpeTd = document.createElement("td");
      rpeTd.textContent = s.rpe;

      const loadTd = document.createElement("td");
      loadTd.textContent = s.load;

      const actionTd = document.createElement("td");
      const removeBtn = document.createElement("button");
      removeBtn.type = "button";
      removeBtn.className = "btn ghost";
      removeBtn.textContent = "Törlés";

      removeBtn.addEventListener("click", () => {
        sessions.splice(index, 1);
        saveSessions(sessions);
        updateStats();
        renderTable();
      });

      actionTd.appendChild(removeBtn);

      tr.appendChild(dateTd);
      tr.appendChild(typeTd);
      tr.appendChild(minTd);
      tr.appendChild(rpeTd);
      tr.appendChild(loadTd);
      tr.appendChild(actionTd);

      body.appendChild(tr);
    });
  }


  form.addEventListener("submit", (e) => {
    e.preventDefault();

    const dateInput = document.getElementById("session-date");
    const typeSelect = document.getElementById("session-type");
    const minutesInput = document.getElementById("session-minutes");
    const rpeInput = document.getElementById("session-rpe");
    const positionSelect = document.getElementById("session-position");
    const notesInput = document.getElementById("session-notes");

    const dateVal = dateInput.value;
    const typeVal = typeSelect.value;
    const minutesVal = Number(minutesInput.value);
    const rpeVal = Number(rpeInput.value);

    if (!dateVal || !minutesVal || !rpeVal) {
      minutesInput.focus();
      return;
    }

    const typeLabels = {
      match: "Meccs",
      training: "Edzés",
      "small-sided": "Kispályás",
    };

    const loadVal = minutesVal * rpeVal;

    const newSession = {
      date: dateVal,
      type: typeVal,
      typeLabel: typeLabels[typeVal] ?? typeVal,
      minutes: minutesVal,
      rpe: rpeVal,
      position: positionSelect.value,
      notes: notesInput.value.trim(),
      load: loadVal,
    };

    sessions.push(newSession);
    saveSessions(sessions);
    updateStats();
    renderTable();

    minutesInput.value = 60;
    rpeInput.value = 6;
    notesInput.value = "";
  });


  clearBtn.addEventListener("click", () => {
    sessions = [];
    saveSessions(sessions);
    updateStats();
    renderTable();
  });


  const dateInput = document.getElementById("session-date");
  if (dateInput && !dateInput.value) {
    const today = new Date();
    const iso = today.toISOString().slice(0, 10);
    dateInput.value = iso;
  }

  updateStats();
  renderTable();
});