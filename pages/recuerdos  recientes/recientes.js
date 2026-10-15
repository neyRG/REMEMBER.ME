const storageKey = "remember-me-memories";
const editRequestKey = "remember-me-edit-request";
const notesGrid = document.querySelector("#notes-grid");
const notesCount = document.querySelector("#notes-count");
const emptyNotes = document.querySelector("#empty-notes");
const filterFrom = document.querySelector("#filter-from");
const filterTo = document.querySelector("#filter-to");
const filterCategory = document.querySelector("#filter-category");
const clearFilters = document.querySelector("#clear-filters");
const filterResults = document.querySelector("#filter-results");
const selectionToolbar = document.querySelector("#selection-toolbar");
const selectionCount = document.querySelector("#selection-count");
const editSelected = document.querySelector("#edit-selected");
const selectionMenu = document.querySelector("#selection-menu");
const renameSelected = document.querySelector("#rename-selected");
const deleteSelected = document.querySelector("#delete-selected");
const noteDialog = document.querySelector("#note-dialog");
const dialogMeta = document.querySelector("#dialog-meta");
const dialogTitle = document.querySelector("#dialog-title");
const dialogContent = document.querySelector("#dialog-content");
const dialogImage = document.querySelector("#dialog-image");
const dialogLocation = document.querySelector("#dialog-location");
const renameDialog = document.querySelector("#rename-dialog");
const renameForm = document.querySelector("#rename-form");
const renameInput = document.querySelector("#rename-input");
const cancelRename = document.querySelector("#cancel-rename");
const deleteDialog = document.querySelector("#delete-dialog");
const deleteMessage = document.querySelector("#delete-message");
const cancelDelete = document.querySelector("#cancel-delete");
const confirmDelete = document.querySelector("#confirm-delete");
let selectedIndices = new Set();
let renameIndex = null;
let pendingDeleteIndices = [];

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

function getLocationUrl(location) {
	const latitude = Number(location?.latitude);
	const longitude = Number(location?.longitude);
	if (!Number.isFinite(latitude) || !Number.isFinite(longitude) || Math.abs(latitude) > 90 || Math.abs(longitude) > 180) return "";
	return `https://www.google.com/maps?q=${latitude},${longitude}`;
}

function openNote(note) {
	dialogMeta.textContent = `${note.category || "Personal"} · ${formatDate(note.createdAt)}`;
	dialogTitle.textContent = note.title || "Recuerdo sin título";
	dialogContent.textContent = note.content || "Sin detalles adicionales.";
	const imageUrl = typeof note.image === "string" && note.image.startsWith("data:image/") ? note.image : "";
	dialogImage.hidden = !imageUrl;
	if (imageUrl) {
		dialogImage.src = imageUrl;
		dialogImage.alt = `Imagen adjunta a ${note.title || "este recuerdo"}`;
	} else {
		dialogImage.removeAttribute("src");
	}
	const mapUrl = getLocationUrl(note.location);
	dialogLocation.hidden = !mapUrl;
	if (mapUrl) dialogLocation.href = mapUrl;
	else dialogLocation.removeAttribute("href");
	noteDialog.showModal();
}

function updateSelectionToolbar() {
	const count = selectedIndices.size;
	selectionToolbar.hidden = count === 0;
	selectionCount.textContent = `${count} ${count === 1 ? "nota seleccionada" : "notas seleccionadas"}`;
	editSelected.hidden = count !== 1;
	renameSelected.hidden = count !== 1;
	deleteSelected.hidden = count === 0;
	deleteSelected.textContent = count === 1 ? "Eliminar nota" : "Eliminar seleccionadas";
	if (count !== 1) selectionMenu.open = false;
}

function renderNotes() {
	const notes = getSavedNotes();
	selectedIndices = new Set([...selectedIndices].filter((index) => index < notes.length));
	const fromTime = filterFrom.value ? new Date(`${filterFrom.value}T00:00:00`).getTime() : null;
	const toTime = filterTo.value ? new Date(`${filterTo.value}T23:59:59.999`).getTime() : null;
	const categoryFilter = filterCategory.value;
	const filteredNotes = notes
		.map((note, index) => ({ note, index }))
		.filter(({ note }) => {
			if (categoryFilter && (note.category || "Personal") !== categoryFilter) return false;
			if (fromTime !== null || toTime !== null) {
				const createdAt = new Date(note.createdAt).getTime();
				if (!Number.isFinite(createdAt)) return false;
				if (fromTime !== null && createdAt < fromTime) return false;
				if (toTime !== null && createdAt > toTime) return false;
			}
			return true;
		});
	notesGrid.replaceChildren();
	notesCount.textContent = `${notes.length} ${notes.length === 1 ? "nota" : "notas"}`;
	filterResults.textContent = `${filteredNotes.length} de ${notes.length} ${notes.length === 1 ? "nota" : "notas"}`;
	clearFilters.disabled = !filterFrom.value && !filterTo.value && !categoryFilter;
	emptyNotes.hidden = filteredNotes.length > 0;
	emptyNotes.textContent = notes.length === 0
		? "Aún no has guardado recuerdos."
		: "No hay recuerdos que coincidan con estos filtros.";
	updateSelectionToolbar();

	filteredNotes.forEach(({ note, index }) => {
		const card = document.createElement("article");
		card.className = "note-card";
		card.classList.toggle("is-selected", selectedIndices.has(index));

		const meta = document.createElement("span");
		meta.className = "note-card-top";

		const category = document.createElement("span");
		category.className = "note-card-category";
		category.textContent = note.category || "Personal";

		const date = document.createElement("time");
		date.dateTime = note.createdAt || "";
		date.textContent = formatDate(note.createdAt);

		const selectLabel = document.createElement("label");
		selectLabel.className = "note-select";
		const checkbox = document.createElement("input");
		checkbox.type = "checkbox";
		checkbox.checked = selectedIndices.has(index);
		checkbox.setAttribute("aria-label", `Seleccionar ${note.title || "recuerdo sin título"}`);
		checkbox.addEventListener("change", () => {
			if (checkbox.checked) selectedIndices.add(index);
			else selectedIndices.delete(index);
			card.classList.toggle("is-selected", checkbox.checked);
			updateSelectionToolbar();
		});
		selectLabel.append(checkbox);

		const openButton = document.createElement("button");
		openButton.type = "button";
		openButton.className = "note-card-open";
		openButton.setAttribute("aria-label", `Ver ${note.title || "recuerdo sin título"}`);

		const title = document.createElement("h3");
		title.textContent = note.title || "Recuerdo sin título";

		const excerpt = document.createElement("span");
		excerpt.className = "note-card-excerpt";
		excerpt.textContent = note.content || "Sin detalles adicionales.";

		meta.append(category, date);
		openButton.append(title, excerpt);
		const imageUrl = typeof note.image === "string" && note.image.startsWith("data:image/") ? note.image : "";
		if (imageUrl) {
			const image = document.createElement("img");
			image.className = "note-card-image";
			image.src = imageUrl;
			image.alt = `Imagen adjunta a ${note.title || "este recuerdo"}`;
			openButton.append(image);
		}
		card.append(meta, selectLabel, openButton);
		const mapUrl = getLocationUrl(note.location);
		if (mapUrl) {
			const location = document.createElement("a");
			location.className = "note-card-location";
			location.href = mapUrl;
			location.target = "_blank";
			location.rel = "noopener noreferrer";
			location.textContent = "Ver ubicación en el mapa";
			card.append(location);
		}
		openButton.addEventListener("click", () => openNote(note));
		notesGrid.append(card);
	});
}

[filterFrom, filterTo, filterCategory].forEach((filter) => {
	filter.addEventListener("change", () => {
		selectedIndices.clear();
		renderNotes();
	});
});

clearFilters.addEventListener("click", () => {
	filterFrom.value = "";
	filterTo.value = "";
	filterCategory.value = "";
	selectedIndices.clear();
	renderNotes();
	filterFrom.focus();
});

editSelected.addEventListener("click", () => {
	if (selectedIndices.size !== 1) return;
	const index = [...selectedIndices][0];
	const note = getSavedNotes()[index];
	if (!note) return;

	try {
		sessionStorage.setItem(editRequestKey, JSON.stringify({ index, note }));
		window.location.href = `../escritorio/escritorio.html?editar=1`;
	} catch {
		window.alert("No se pudo preparar la nota para editarla en esta pestaña.");
	}
});

renameSelected.addEventListener("click", () => {
	if (selectedIndices.size !== 1) return;
	renameIndex = [...selectedIndices][0];
	const note = getSavedNotes()[renameIndex];
	if (!note) return;

	renameInput.value = note.title || "";
	selectionMenu.open = false;
	renameDialog.showModal();
	renameInput.focus();
});

renameForm.addEventListener("submit", (event) => {
	event.preventDefault();
	const title = renameInput.value.trim();
	if (!title || renameIndex === null) return;

	const notes = getSavedNotes();
	if (!notes[renameIndex]) return;
	notes[renameIndex].title = title;
	localStorage.setItem(storageKey, JSON.stringify(notes));
	renameDialog.close();
	renderNotes();
});

cancelRename.addEventListener("click", () => renameDialog.close());

deleteSelected.addEventListener("click", () => {
	const count = selectedIndices.size;
	if (count === 0) return;

	pendingDeleteIndices = [...selectedIndices];
	deleteMessage.textContent = count === 1
		? "¿Deseas eliminar esta nota? Esta acción no se puede deshacer."
		: `¿Deseas eliminar las ${count} notas seleccionadas? Esta acción no se puede deshacer.`;
	selectionMenu.open = false;
	deleteDialog.showModal();
	confirmDelete.focus();
});


confirmDelete.addEventListener("click", () => {
	const deletedIndices = new Set(pendingDeleteIndices);
	if (deletedIndices.size === 0) return;

	const notes = getSavedNotes().filter((note, index) => !deletedIndices.has(index));
	localStorage.setItem(storageKey, JSON.stringify(notes));
	selectedIndices.clear();
	pendingDeleteIndices = [];
	deleteDialog.close();
	renderNotes();
});

cancelDelete.addEventListener("click", () => deleteDialog.close());
deleteDialog.addEventListener("close", () => {
	pendingDeleteIndices = [];
});

renderNotes();
