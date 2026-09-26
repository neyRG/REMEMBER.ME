const storageKey = "remember-me-memories";
const draftStorageKey = "remember-me-draft";
const memoryForm = document.querySelector("#memory-form");
const memoryList = document.querySelector("#memory-list");
const emptyState = document.querySelector("#empty-state");
const memoryCount = document.querySelector("#memory-count");
const today = document.querySelector("#today");
const saveStatus = document.querySelector("#save-status");
let draftTimeout;

function loadMemories() {
	try {
		const storedMemories = JSON.parse(localStorage.getItem(storageKey) || "[]");
		return Array.isArray(storedMemories) ? storedMemories : [];
	} catch {
		return [];
	}
}

const memories = loadMemories();

function restoreDraft() {
	try {
		const draft = JSON.parse(localStorage.getItem(draftStorageKey) || "null");
		if (!draft) return;
		memoryForm.elements.title.value = draft.title || "";
		memoryForm.elements.content.value = draft.content || "";
		memoryForm.elements.category.value = draft.category || "Personal";
		if (draft.title || draft.content) {
			saveStatus.textContent = "Borrador recuperado; se guarda automáticamente en este navegador.";
		}
	} catch {
		saveStatus.textContent = "No se pudo recuperar el borrador.";
	}
}

function scheduleDraftSave() {
	clearTimeout(draftTimeout);
	saveStatus.textContent = "Guardando borrador...";
	draftTimeout = setTimeout(() => {
		const draft = {
			title: memoryForm.elements.title.value.trim(),
			content: memoryForm.elements.content.value,
			category: memoryForm.elements.category.value,
		};
		try {
			if (draft.title || draft.content) {
				localStorage.setItem(draftStorageKey, JSON.stringify(draft));
			} else {
				localStorage.removeItem(draftStorageKey);
			}
			saveStatus.textContent = "Borrador guardado automáticamente.";
		} catch {
			saveStatus.textContent = "No se pudo guardar el borrador en este navegador.";
		}
	}, 350);
}

memoryForm.addEventListener("input", scheduleDraftSave);
memoryForm.addEventListener("change", scheduleDraftSave);

today.textContent = new Intl.DateTimeFormat("es", {
	weekday: "long",
	day: "numeric",
	month: "long",
}).format(new Date());

function renderMemories() {
	memoryList.replaceChildren();
	emptyState.hidden = memories.length > 0;
	memoryCount.textContent = Math.min(memories.length, 3);

	memories
		.slice()
		.sort((first, second) => (Date.parse(second.createdAt) || 0) - (Date.parse(first.createdAt) || 0))
		.slice(0, 3)
		.forEach((memory) => {
		const article = document.createElement("article");
		article.className = "memory-item";

		const meta = document.createElement("div");
		meta.className = "memory-meta";

		const category = document.createElement("span");
		category.className = "memory-category";
		category.textContent = memory.category;

		const date = document.createElement("time");
		date.dateTime = memory.createdAt || "";
		date.textContent = new Intl.DateTimeFormat("es", {
			day: "numeric",
			month: "short",
			hour: "2-digit",
			minute: "2-digit",
		}).format(new Date(memory.createdAt));

		const title = document.createElement("h3");
		title.textContent = memory.title;
		meta.append(category, date);
		article.append(meta, title);

		if (memory.content) {
			const content = document.createElement("p");
			content.textContent = memory.content;
			article.append(content);
		}

		memoryList.append(article);
	});
}

memoryForm.addEventListener("submit", (event) => {
	event.preventDefault();
	clearTimeout(draftTimeout);
	const formData = new FormData(memoryForm);
	memories.unshift({
		title: formData.get("title").trim(),
		content: formData.get("content").trim(),
		category: formData.get("category"),
		createdAt: new Date().toISOString(),
	});

	localStorage.setItem(storageKey, JSON.stringify(memories));
	localStorage.removeItem(draftStorageKey);
	memoryForm.reset();
	renderMemories();
	saveStatus.textContent = "Recuerdo guardado en tu colección.";
	document.querySelector("#memory-title").focus();
});

restoreDraft();
renderMemories();
