const storageKey = "remember-me-memories";
const notesGrid = document.querySelector("#notes-grid");
const notesCount = document.querySelector("#notes-count");
const emptyNotes = document.querySelector("#empty-notes");
const noteDialog = document.querySelector("#note-dialog");
const dialogMeta = document.querySelector("#dialog-meta");
const dialogTitle = document.querySelector("#dialog-title");
const dialogContent = document.querySelector("#dialog-content");

function getSavedNotes() {
	try {
		const notes = JSON.parse(localStorage.getItem(storageKey) || "[]");
		return Array.isArray(notes) ? notes : [];
	} catch {
		return [];
	}
}

function formatDate(value) {
	const date = new Date(value);
	if (Number.isNaN(date.getTime())) return "Fecha desconocida";
	return new Intl.DateTimeFormat("es", {
		day: "numeric",
		month: "short",
		year: "numeric",
		hour: "2-digit",
		minute: "2-digit",
	}).format(date);
}

function openNote(note) {
	dialogMeta.textContent = `${note.category || "Personal"} · ${formatDate(note.createdAt)}`;
	dialogTitle.textContent = note.title || "Recuerdo sin título";
	dialogContent.textContent = note.content || "Sin detalles adicionales.";
	noteDialog.showModal();
}

function renderNotes() {
	const notes = getSavedNotes();
	notesGrid.replaceChildren();
	notesCount.textContent = `${notes.length} ${notes.length === 1 ? "nota" : "notas"}`;
	emptyNotes.hidden = notes.length > 0;

	notes.forEach((note) => {
		const card = document.createElement("button");
		card.type = "button";
		card.className = "note-card";

		const meta = document.createElement("span");
		meta.className = "note-card-top";

		const category = document.createElement("span");
		category.className = "note-card-category";
		category.textContent = note.category || "Personal";

		const date = document.createElement("time");
		date.dateTime = note.createdAt || "";
		date.textContent = formatDate(note.createdAt);

		const title = document.createElement("h3");
		title.textContent = note.title || "Recuerdo sin título";

		const excerpt = document.createElement("span");
		excerpt.className = "note-card-excerpt";
		excerpt.textContent = note.content || "Sin detalles adicionales.";

		meta.append(category, date);
		card.append(meta, title, excerpt);
		card.addEventListener("click", () => openNote(note));
		notesGrid.append(card);
	});
}

renderNotes();
