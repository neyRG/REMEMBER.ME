const storageKey = "remember-me-memories";
const draftStorageKey = "remember-me-draft";
const editRequestKey = "remember-me-edit-request";
const memoryForm = document.querySelector("#memory-form");
const memoryList = document.querySelector("#memory-list");
const emptyState = document.querySelector("#empty-state");
const memoryCount = document.querySelector("#memory-count");
const today = document.querySelector("#today");
const saveStatus = document.querySelector("#save-status");
const submitButton = memoryForm.querySelector("[type='submit']");
const addImageButton = document.querySelector("#add-image");
const imageFileInput = document.querySelector("#memory-image-file");
const imagePreview = document.querySelector("#image-preview");
const memoryImagePreview = document.querySelector("#memory-image-preview");
const removeImageButton = document.querySelector("#remove-image");
const addLocationButton = document.querySelector("#add-location");
const locationPreview = document.querySelector("#location-preview");
const locationLabel = document.querySelector("#location-label");
const locationLink = document.querySelector("#location-link");
const removeLocationButton = document.querySelector("#remove-location");
let draftTimeout;
let editingIndex = null;
let attachedImage = "";
let attachedLocation = null;

function loadMemories() {
	try {
		const storedMemories = JSON.parse(localStorage.getItem(storageKey) || "[]");
		return Array.isArray(storedMemories) ? storedMemories : [];
	} catch {
		return [];
	}
}

const memories = loadMemories();

function getLocationUrl(location) {
	const latitude = Number(location?.latitude);
	const longitude = Number(location?.longitude);
	if (!Number.isFinite(latitude) || !Number.isFinite(longitude) || Math.abs(latitude) > 90 || Math.abs(longitude) > 180) return "";
	return `https://www.google.com/maps?q=${latitude},${longitude}`;
}

function renderAttachments() {
	imagePreview.hidden = !attachedImage;
	if (attachedImage) memoryImagePreview.src = attachedImage;
	else memoryImagePreview.removeAttribute("src");

	const mapUrl = getLocationUrl(attachedLocation);
	locationPreview.hidden = !mapUrl;
	if (mapUrl) {
		locationLabel.textContent = `${Number(attachedLocation.latitude).toFixed(5)}, ${Number(attachedLocation.longitude).toFixed(5)}`;
		locationLink.href = mapUrl;
	} else {
		locationLink.removeAttribute("href");
	}
}

function restoreAttachments(memory = {}) {
	attachedImage = typeof memory.image === "string" ? memory.image : "";
	attachedLocation = getLocationUrl(memory.location) ? memory.location : null;
	renderAttachments();
}

function restoreDraft() {
	try {
		const draft = JSON.parse(localStorage.getItem(draftStorageKey) || "null");
		if (!draft) return;
		memoryForm.elements.title.value = draft.title || "";
		memoryForm.elements.content.value = draft.content || "";
		memoryForm.elements.category.value = draft.category || "Personal";
		memoryForm.elements.mood.value = draft.mood || "";
		restoreAttachments(draft);
		if (draft.title || draft.content || draft.mood || draft.image || draft.location) {
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
			mood: memoryForm.elements.mood.value,
			image: attachedImage,
			location: attachedLocation,
		};
		try {
			if (draft.title || draft.content || draft.mood || draft.image || draft.location) {
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

function restoreEditRequest() {
	if (new URLSearchParams(window.location.search).get("editar") !== "1") return false;

	try {
		const request = JSON.parse(sessionStorage.getItem(editRequestKey) || "null");
		const savedMemory = Number.isInteger(request?.index) ? memories[request.index] : null;
		if (!savedMemory || !request.note || savedMemory.createdAt !== request.note.createdAt || savedMemory.title !== request.note.title) {
			saveStatus.textContent = "No se encontró la nota seleccionada. Puedes crear una nota nueva.";
			return false;
		}

		editingIndex = request.index;
		memoryForm.elements.title.value = savedMemory.title || "";
		memoryForm.elements.content.value = savedMemory.content || "";
		memoryForm.elements.category.value = savedMemory.category || "Personal";
		memoryForm.elements.mood.value = savedMemory.mood || "";
		restoreAttachments(savedMemory);
		submitButton.textContent = "Guardar cambios";
		saveStatus.textContent = "Editando este recuerdo. Guarda los cambios para actualizarlo.";
		sessionStorage.removeItem(editRequestKey);
		return true;
	} catch {
		saveStatus.textContent = "No se pudo abrir la nota para editarla.";
		return false;
	}
}

memoryForm.addEventListener("input", scheduleDraftSave);
memoryForm.addEventListener("change", scheduleDraftSave);

addImageButton.addEventListener("click", () => imageFileInput.click());
imageFileInput.addEventListener("change", () => {
	const file = imageFileInput.files?.[0];
	if (!file) return;
	if (!file.type.startsWith("image/")) {
		saveStatus.textContent = "Selecciona un archivo de imagen.";
		imageFileInput.value = "";
		return;
	}
	if (file.size > 8 * 1024 * 1024) {
		saveStatus.textContent = "La imagen supera el límite de 8 MB.";
		imageFileInput.value = "";
		return;
	}

	saveStatus.textContent = "Preparando imagen...";
	const reader = new FileReader();
	reader.addEventListener("error", () => {
		saveStatus.textContent = "No se pudo leer la imagen.";
	});
	reader.addEventListener("load", () => {
		const image = new Image();
		image.addEventListener("error", () => {
			saveStatus.textContent = "No se pudo procesar la imagen.";
		});
		image.addEventListener("load", () => {
			const maxDimension = 1440;
			const scale = Math.min(1, maxDimension / Math.max(image.naturalWidth, image.naturalHeight));
			const canvas = document.createElement("canvas");
			canvas.width = Math.max(1, Math.round(image.naturalWidth * scale));
			canvas.height = Math.max(1, Math.round(image.naturalHeight * scale));
			const context = canvas.getContext("2d");
			if (!context) {
				saveStatus.textContent = "No se pudo preparar la imagen.";
				return;
			}
			context.fillStyle = "#ffffff";
			context.fillRect(0, 0, canvas.width, canvas.height);
			context.drawImage(image, 0, 0, canvas.width, canvas.height);
			attachedImage = canvas.toDataURL("image/jpeg", 0.8);
			renderAttachments();
			scheduleDraftSave();
		});
		image.src = String(reader.result);
	});
	reader.readAsDataURL(file);
});

removeImageButton.addEventListener("click", () => {
	attachedImage = "";
	imageFileInput.value = "";
	renderAttachments();
	scheduleDraftSave();
});

addLocationButton.addEventListener("click", () => {
	if (!navigator.geolocation) {
		saveStatus.textContent = "Este navegador no permite obtener la ubicación.";
		return;
	}

	addLocationButton.disabled = true;
	saveStatus.textContent = "Solicitando permiso para obtener tu ubicación...";
	navigator.geolocation.getCurrentPosition((position) => {
		attachedLocation = {
			latitude: position.coords.latitude,
			longitude: position.coords.longitude,
		};
		renderAttachments();
		addLocationButton.disabled = false;
		scheduleDraftSave();
	}, () => {
		addLocationButton.disabled = false;
		saveStatus.textContent = "No se pudo obtener la ubicación. Revisa el permiso del navegador.";
	}, { enableHighAccuracy: false, maximumAge: 60000, timeout: 10000 });
});

removeLocationButton.addEventListener("click", () => {
	attachedLocation = null;
	renderAttachments();
	scheduleDraftSave();
});

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
		category.textContent = memory.category || "Personal";

		const labels = document.createElement("div");
		labels.className = "memory-labels";
		labels.append(category);
		if (memory.mood) {
			const mood = document.createElement("span");
			mood.className = "memory-mood";
			mood.textContent = memory.mood;
			labels.append(mood);
		}

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
		meta.append(labels, date);
		article.append(meta, title);

		if (memory.content) {
			const content = document.createElement("p");
			content.textContent = memory.content;
			article.append(content);
		}
		if (memory.image) {
			const image = document.createElement("img");
			image.className = "memory-item-image";
			image.src = memory.image;
			image.alt = `Imagen adjunta a ${memory.title || "este recuerdo"}`;
			article.append(image);
		}
		const mapUrl = getLocationUrl(memory.location);
		if (mapUrl) {
			const location = document.createElement("a");
			location.className = "memory-item-location";
			location.href = mapUrl;
			location.target = "_blank";
			location.rel = "noopener noreferrer";
			location.textContent = "Ver ubicación en el mapa";
			article.append(location);
		}

		memoryList.append(article);
	});
}

memoryForm.addEventListener("submit", (event) => {
	event.preventDefault();
	clearTimeout(draftTimeout);
	const formData = new FormData(memoryForm);
	const updatedFields = {
		title: formData.get("title").trim(),
		content: formData.get("content").trim(),
		category: formData.get("category"),
		mood: formData.get("mood"),
		image: attachedImage,
		location: attachedLocation,
	};
	const wasEditing = editingIndex !== null && Boolean(memories[editingIndex]);
	if (wasEditing) {
		memories[editingIndex] = { ...memories[editingIndex], ...updatedFields };
	} else {
		memories.unshift({ ...updatedFields, createdAt: new Date().toISOString() });
	}

	localStorage.setItem(storageKey, JSON.stringify(memories));
	localStorage.removeItem(draftStorageKey);
	editingIndex = null;
	memoryForm.reset();
	imageFileInput.value = "";
	restoreAttachments();
	submitButton.textContent = "＋ Guardar nota";
	renderMemories();
	saveStatus.textContent = wasEditing ? "Cambios guardados en tu colección." : "Recuerdo guardado en tu colección.";
	document.querySelector("#memory-title").focus();
});

if (!restoreEditRequest()) restoreDraft();
renderMemories();
