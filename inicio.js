const loginTab = document.querySelector("#login-tab");
const registerTab = document.querySelector("#register-tab");
const loginPanel = document.querySelector("#login-panel");
const registerPanel = document.querySelector("#register-panel");
const formMessage = document.querySelector("#form-message");
const loginSubmit = loginPanel.querySelector(".submit-button");

function softenBackground() {
	document.body.classList.add("is-background-softened");
}

function restoreBackground() {
	document.body.classList.remove("is-background-softened");
}

function selectPanel(activeTab, activePanel, inactiveTab, inactivePanel) {
	activeTab.classList.add("is-active");
	activeTab.setAttribute("aria-selected", "true");
	activePanel.hidden = false;
	inactiveTab.classList.remove("is-active");
	inactiveTab.setAttribute("aria-selected", "false");
	inactivePanel.hidden = true;
	formMessage.textContent = "";
}

loginTab.addEventListener("click", () => {
	selectPanel(loginTab, loginPanel, registerTab, registerPanel);
	softenBackground();
});
registerTab.addEventListener("click", () => {
	selectPanel(registerTab, registerPanel, loginTab, loginPanel);
	restoreBackground();
});

loginSubmit.addEventListener("click", softenBackground);

const hoverTargets = ".site-title, .site-nav a, .welcome-copy > *, .account-form h2, .welcome-content > div:last-child > *";

window.addEventListener("pointermove", (event) => {
	restoreBackground();
	const target = event.target instanceof Element ? event.target.closest(hoverTargets) : null;
	document.body.classList.toggle("is-background-hovered", Boolean(target));
}, { passive: true });

document.querySelectorAll(".account-form").forEach((form) => {
	form.addEventListener("submit", (event) => {
		event.preventDefault();
		formMessage.textContent = "La cuenta todavía no está conectada. Puedes continuar al cuaderno mientras tanto.";
	});
});
