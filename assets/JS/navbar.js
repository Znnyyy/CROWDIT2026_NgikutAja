document.addEventListener("DOMContentLoaded", () => {
    // Toggle menu seluler
    const btn = document.getElementById("menu-btn");
    const menu = document.getElementById("mobile-menu");
    if (btn && menu) {
        btn.addEventListener("click", () => {
            btn.classList.toggle("active");
            menu.classList.toggle("open");
        });
    }

    // Toggle menu dropdown bahasa
    const languageBtn = document.getElementById("language-btn");
    const languageMenu = document.getElementById("language-menu");
    if (languageBtn && languageMenu) {
        languageBtn.addEventListener("click", (e) => {
            e.stopPropagation();
            languageMenu.classList.toggle("hidden");
        });
        document.addEventListener("click", () => {
            languageMenu.classList.add("hidden");
        });
    }

    // Gerbang akses login
    const accessLoginElements = document.querySelectorAll(".access-login");
    accessLoginElements.forEach((element) => {
        element.addEventListener("click", (e) => {
            const token = localStorage.getItem("token");
            if (token) return;
            e.preventDefault();
            const isInPages = window.location.pathname.includes("/pages/");
            window.location.href = isInPages ? "../login.html" : "./pages/login.html";
        });
    });
});
