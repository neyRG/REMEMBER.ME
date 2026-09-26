const loginTab = document.querySelector("#login-tab");
const registerTab = document.querySelector("#register-tab");
const loginPanel = document.querySelector("#login-panel");
const registerPanel = document.querySelector("#register-panel");
const formMessage = document.querySelector("#form-message");

function selectPanel(activeTab, activePanel, inactiveTab, inactivePanel) {
	activeTab.classList.add("is-active");
	activeTab.setAttribute("aria-selected", "true");
	activePanel.hidden = false;
	inactiveTab.classList.remove("is-active");
	inactiveTab.setAttribute("aria-selected", "false");
	inactivePanel.hidden = true;
	formMessage.textContent = "";
}

loginTab.addEventListener("click", () => selectPanel(loginTab, loginPanel, registerTab, registerPanel));
registerTab.addEventListener("click", () => selectPanel(registerTab, registerPanel, loginTab, loginPanel));

document.querySelectorAll(".account-form").forEach((form) => {
	form.addEventListener("submit", (event) => {
		event.preventDefault();
		formMessage.textContent = "La cuenta todavía no está conectada. Puedes continuar al cuaderno mientras tanto.";
	});
});
