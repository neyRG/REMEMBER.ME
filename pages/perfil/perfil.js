const profileStorageKey = "remember-me-profile";
const profileForm = document.querySelector("#personal-form");
const emailForm = document.querySelector("#email-form");
const avatarFile = document.querySelector("#avatar-file");
const avatarImage = document.querySelector("#avatar-image");
const avatarFallback = document.querySelector("#avatar-fallback");
const removeAvatarButton = document.querySelector("#remove-avatar");
const avatarStatus = document.querySelector("#avatar-status");
const profileNamePreview = document.querySelector("#profile-name-preview");
const profileEmailPreview = document.querySelector("#profile-email-preview");
const currentEmail = document.querySelector("#current-email");
const newEmail = document.querySelector("#new-email");
const confirmEmail = document.querySelector("#confirm-email");
const personalStatus = document.querySelector("#personal-status");
const emailStatus = document.querySelector("#email-status");
const profileStorageDefaults = {
	name: "",
	bio: "",
	birthday: "",
	city: "",
	email: "",
	avatar: "",
};

function loadProfile() {
	try {
		const savedProfile = JSON.parse(localStorage.getItem(profileStorageKey) || "{}");
		return { ...profileStorageDefaults, ...savedProfile };
	} catch {
		return { ...profileStorageDefaults };
	}
}

const profile = loadProfile();

function saveProfile(statusElement, successMessage) {
	try {
		localStorage.setItem(profileStorageKey, JSON.stringify(profile));
		statusElement.textContent = successMessage;
		return true;
	} catch {
		statusElement.textContent = "No se pudo guardar. Comprueba el espacio disponible del navegador.";
		return false;
	}
}

function renderProfile() {
	profileForm.elements.name.value = profile.name || "";
	profileForm.elements.bio.value = profile.bio || "";
	profileForm.elements.birthday.value = profile.birthday || "";
	profileForm.elements.city.value = profile.city || "";
	currentEmail.value = profile.email || "";
	profileNamePreview.textContent = profile.name || "Tu nombre";
	profileEmailPreview.textContent = profile.email || "Añade tu correo electrónico";
	avatarImage.hidden = !profile.avatar;
	avatarFallback.hidden = Boolean(profile.avatar);
	removeAvatarButton.hidden = !profile.avatar;
	if (profile.avatar) avatarImage.src = profile.avatar;
	else avatarImage.removeAttribute("src");
	avatarFallback.textContent = (profile.name || "N").trim().charAt(0).toUpperCase() || "N";
}

profileForm.addEventListener("submit", (event) => {
	event.preventDefault();
	profile.name = profileForm.elements.name.value.trim();
	profile.bio = profileForm.elements.bio.value.trim();
	profile.birthday = profileForm.elements.birthday.value;
	profile.city = profileForm.elements.city.value.trim();
	if (saveProfile(personalStatus, "Información personal guardada en este navegador.")) renderProfile();
});

emailForm.addEventListener("submit", (event) => {
	event.preventDefault();
	const address = newEmail.value.trim().toLowerCase();
	const confirmation = confirmEmail.value.trim().toLowerCase();
	if (address !== confirmation) {
		confirmEmail.setCustomValidity("Los correos no coinciden.");
		confirmEmail.reportValidity();
		return;
	}

	confirmEmail.setCustomValidity("");
	profile.email = address;
	if (saveProfile(emailStatus, "Correo actualizado en este navegador. No cambia una cuenta externa.")) {
		renderProfile();
		emailForm.reset();
	}
});

confirmEmail.addEventListener("input", () => confirmEmail.setCustomValidity(""));

avatarFile.addEventListener("change", () => {
	const file = avatarFile.files?.[0];
	if (!file) return;
	if (!file.type.startsWith("image/")) {
		avatarStatus.textContent = "Selecciona un archivo de imagen.";
		avatarFile.value = "";
		return;
	}
	if (file.size > 8 * 1024 * 1024) {
		avatarStatus.textContent = "La imagen supera el límite de 8 MB.";
		avatarFile.value = "";
		return;
	}

	avatarStatus.textContent = "Preparando foto...";
	const reader = new FileReader();
	reader.addEventListener("error", () => {
		avatarStatus.textContent = "No se pudo leer la foto.";
	});
	reader.addEventListener("load", () => {
		const image = new Image();
		image.addEventListener("error", () => {
			avatarStatus.textContent = "No se pudo procesar la foto.";
		});
		image.addEventListener("load", () => {
			const size = 640;
			const scale = Math.min(size / image.naturalWidth, size / image.naturalHeight, 1);
			const canvas = document.createElement("canvas");
			canvas.width = Math.max(1, Math.round(image.naturalWidth * scale));
			canvas.height = Math.max(1, Math.round(image.naturalHeight * scale));
			const context = canvas.getContext("2d");
			if (!context) {
				avatarStatus.textContent = "No se pudo preparar la foto.";
				return;
			}
			context.fillStyle = "#ffffff";
			context.fillRect(0, 0, canvas.width, canvas.height);
			context.drawImage(image, 0, 0, canvas.width, canvas.height);
			profile.avatar = canvas.toDataURL("image/jpeg", 0.82);
			if (saveProfile(avatarStatus, "Foto de perfil actualizada.")) renderProfile();
		});
		image.src = String(reader.result);
	});
	reader.readAsDataURL(file);
});

removeAvatarButton.addEventListener("click", () => {
	profile.avatar = "";
	avatarFile.value = "";
	if (saveProfile(avatarStatus, "Foto de perfil eliminada.")) renderProfile();
});

renderProfile();
