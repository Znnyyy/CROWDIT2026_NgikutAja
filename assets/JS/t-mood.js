

const moods = [
    {
        name: "Senang",
        img: "../assets/images/character/Happy.png",
        color: "#FFB703",
    },
    {
        name: "Sedih",
        img: "../assets/images/character/Sad.png",
        color: "#5B8DD9",
    },
    {
        name: "Marah",
        img: "../assets/images/character/Angry.png",
        color: "#E05A5A",
    },
    {
        name: "Cemas",
        img: "../assets/images/character/Worry.png",
        color: "#9234F5",
    },
    {
        name: "Malas",
        img: "../assets/images/character/Lazy.png",
        color: "#4CAF8A",
    },
    {
        name: "Normal",
        img: "../assets/images/character/Normal.png",
        color: "#F9A8D4",
    },
    {
        name: "Iri",
        img: "../assets/images/character/Jealous.png",
        color: "#0DB257",
    },
];

let currentMoodIndex = 0;

function updateDynamicLabels() {
    const history = JSON.parse(localStorage.getItem("history")) || {};
    let slot = "pagi";
    if (history.pagi && !history.siang) slot = "siang";
    else if (history.pagi && history.siang && !history.malam) slot = "malam";
    
    const timeText = {
        pagi: "Pagi Ini",
        siang: "Siang Ini",
        malam: "Malam Ini"
    }[slot];

    // Perbarui label header
    const titleLabel = document.getElementById("mood-title-label");
    if (titleLabel) {
        titleLabel.textContent = `Mood Kamu ${timeText} :`;
    }

    // Perbarui mood dalam baris pertanyaan
    const mood = moods[currentMoodIndex];
    const moodInline = document.getElementById("mood-inline");
    if (moodInline && mood) {
        moodInline.textContent = mood.name;
        moodInline.style.color = mood.color;
    }

    // Perbarui label waktu pada pertanyaan
    const moodLabelTime = document.getElementById("mood-label-time");
    if (moodLabelTime) {
        moodLabelTime.textContent = timeText;
    }
}

// Render kartu pilihan mood
function renderMoodCards() {
    const container = document.getElementById("mood-scroll-container");
    if (!container) return;
    container.innerHTML = "";

    moods.forEach((mood, index) => {
        const card = document.createElement("div");
        card.className = `mood-card shrink-0 flex flex-col items-center gap-1.5 border-2 border-transparent bg-white/60 rounded-2xl px-6 pt-1 pb-2 cursor-pointer transition-all duration-200 hover:border-gray-300`;
        card.setAttribute("data-index", index);
        card.onclick = () => selectMood(index);

        card.innerHTML = `
                    <img src="${mood.img}" alt="${mood.name}" class="w-15 h-15 object-contain" />
                    <span class="mood-label text-xs font-semibold text-gray-500">${mood.name}</span>
                `;
        container.appendChild(card);
    });
}

// Fungsi untuk memilih mood
function selectMood(index) {
    currentMoodIndex = index;
    const mood = moods[index];

    const charImg = document.getElementById("char-img");
    if (charImg) {
        charImg.src = mood.img;
        charImg.alt = `${mood.name} Character`;
    }

    const charGlow = document.getElementById("char-glow");
    if (charGlow) {
        charGlow.style.background = `radial-gradient(circle, ${mood.color}88 0%, ${mood.color}22 45%)`;
    }

    document.documentElement.style.setProperty("--mood-color", mood.color);

    const moodLabel = document.getElementById("mood-label");
    if (moodLabel) {
        moodLabel.textContent = mood.name;
        moodLabel.style.color = mood.color;
    }

    updateDynamicLabels();

    document.querySelectorAll(".mood-card").forEach((card, i) => {
        const label = card.querySelector(".mood-label");
        if (i === index) {
            card.classList.add("active");
            card.classList.remove("bg-white/60");
            card.classList.add("bg-white");
            card.style.borderColor = mood.color;
            if (label) {
                label.style.color = mood.color;
                label.style.fontWeight = "700";
                label.classList.remove("font-semibold", "text-gray-500");
                label.classList.add("font-bold");
            }
        } else {
            card.classList.remove("active");
            card.classList.remove("bg-white");
            card.classList.add("bg-white/60");
            card.style.borderColor = "transparent";
            if (label) {
                label.style.color = "";
                label.style.fontWeight = "";
                label.classList.remove("font-bold");
                label.classList.add("font-semibold", "text-gray-500");
            }
        }
    });

    const activeCard = document.querySelector(
        `.mood-card[data-index="${index}"]`,
    );
    if (activeCard) {
        activeCard.scrollIntoView({
            behavior: "smooth",
            block: "nearest",
            inline: "center",
        });
    }
}

function nextMood() {
    let nextIndex = currentMoodIndex + 1;
    if (nextIndex >= moods.length) {
        nextIndex = 0;
    }
    selectMood(nextIndex);
}

function showCustomAlert(title, message, redirectUrl) {
    const overlay = document.createElement("div");
    overlay.className = "fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-[1000] opacity-0 transition-opacity duration-300";
    
    const card = document.createElement("div");
    card.className = "bg-white rounded-3xl p-8 max-w-sm w-full mx-4 shadow-2xl border border-[#E4E2DC] flex flex-col items-center text-center gap-5 transform scale-90 transition-all duration-300";

    card.innerHTML = `
        <div class="w-16 h-16 bg-[#F5C842]/10 text-[#C9732A] rounded-full flex items-center justify-center">
            <i data-lucide="info" class="w-8 h-8 text-[#C9732A]"></i>
        </div>
        <div>
            <h3 class="font-titan text-xl text-gray-800 mb-2">${title}</h3>
            <p class="text-sm text-gray-500 leading-relaxed">${message}</p>
        </div>
        <div class="flex flex-col gap-2 w-full mt-2">
            <button id="alert-primary-btn" class="w-full font-titan bg-[#F5C842] hover:bg-[#e6b830] text-white py-3 rounded-2xl text-sm tracking-wide shadow-md shadow-yellow-300/30 transition-all duration-200 cursor-pointer">
                Lihat riwayat mood kamu
            </button>
            <button id="alert-close-btn" class="text-gray-400 hover:text-gray-600 text-xs font-semibold py-2 transition-colors cursor-pointer">
                Tutup
            </button>
        </div>
    `;

    overlay.appendChild(card);
    document.body.appendChild(overlay);

    if (window.lucide) {
        window.lucide.createIcons();
    }

    setTimeout(() => {
        overlay.classList.remove("opacity-0");
        card.classList.remove("scale-90");
    }, 50);

    const closeAlert = () => {
        overlay.classList.add("opacity-0");
        card.classList.add("scale-90");
        setTimeout(() => {
            overlay.remove();
        }, 300);
    };

    overlay.querySelector("#alert-close-btn").addEventListener("click", closeAlert);
    
    overlay.querySelector("#alert-primary-btn").addEventListener("click", () => {
        closeAlert();
        if (redirectUrl) {
            window.location.href = redirectUrl;
        }
    });

    overlay.addEventListener("click", (e) => {
        if (e.target === overlay) {
            closeAlert();
        }
    });
}

function updateScrollIndicators() {
    const slider = document.getElementById("mood-scroll-container");
    const leftIndicator = document.getElementById("scroll-indicator-left");
    const rightIndicator = document.getElementById("scroll-indicator-right");
    const progressWrapper = document.getElementById("scroll-progress-wrapper");
    const progressBar = document.getElementById("scroll-progress-bar");

    if (!slider) return;

    const scrollLeft = slider.scrollLeft;
    const scrollWidth = slider.scrollWidth;
    const clientWidth = slider.clientWidth;
    const maxScroll = scrollWidth - clientWidth;

    if (scrollWidth > clientWidth) {
        // Show left indicator if scrolled from the start
        if (leftIndicator) {
            if (scrollLeft > 5) {
                leftIndicator.classList.remove("opacity-0");
                leftIndicator.classList.add("opacity-100");
            } else {
                leftIndicator.classList.remove("opacity-100");
                leftIndicator.classList.add("opacity-0");
            }
        }

        // Show right indicator if we can scroll more
        if (rightIndicator) {
            if (scrollLeft < maxScroll - 5) {
                rightIndicator.classList.remove("opacity-0");
                rightIndicator.classList.add("opacity-100");
            } else {
                rightIndicator.classList.remove("opacity-100");
                rightIndicator.classList.add("opacity-0");
            }
        }

        // Update progress bar
        if (progressWrapper) {
            progressWrapper.classList.remove("opacity-0");
            progressWrapper.classList.add("opacity-100");
        }
        if (progressBar) {
            const percentage = maxScroll > 0 ? (scrollLeft / maxScroll) * 100 : 0;
            progressBar.style.width = `${percentage}%`;
        }
    } else {
        if (leftIndicator) {
            leftIndicator.classList.remove("opacity-100");
            leftIndicator.classList.add("opacity-0");
        }
        if (rightIndicator) {
            rightIndicator.classList.remove("opacity-100");
            rightIndicator.classList.add("opacity-0");
        }
        if (progressWrapper) {
            progressWrapper.classList.remove("opacity-100");
            progressWrapper.classList.add("opacity-0");
        }
    }
}

function initDragScroll() {
    const slider = document.getElementById("mood-scroll-container");
    if (!slider) return;

    let isDown = false;
    let startX;
    let scrollLeft;
    let dragThreshold = 5; // pixels to distinguish click vs drag
    let startXClient, startYClient;

    slider.addEventListener("mousedown", (e) => {
        isDown = true;
        slider.style.cursor = "grabbing";
        startX = e.pageX - slider.offsetLeft;
        scrollLeft = slider.scrollLeft;
        startXClient = e.clientX;
        startYClient = e.clientY;
    });

    slider.addEventListener("mouseleave", () => {
        isDown = false;
        slider.style.cursor = "grab";
    });

    slider.addEventListener("mouseup", () => {
        isDown = false;
        slider.style.cursor = "grab";
    });

    slider.addEventListener("mousemove", (e) => {
        if (!isDown) return;
        e.preventDefault();
        const x = e.pageX - slider.offsetLeft;
        const walk = (x - startX) * 1.5; // scroll speed multiplier
        slider.scrollLeft = scrollLeft - walk;
    });

    // Prevent clicking cards if we dragged
    slider.addEventListener("click", (e) => {
        if (startXClient !== undefined && startYClient !== undefined) {
            const deltaX = Math.abs(e.clientX - startXClient);
            const deltaY = Math.abs(e.clientY - startYClient);
            if (deltaX > dragThreshold || deltaY > dragThreshold) {
                e.preventDefault();
                e.stopPropagation();
            }
        }
    }, true); // Use capture phase to intercept card clicks

    // Bind scroll events to update indicators and progress bar
    slider.addEventListener("scroll", updateScrollIndicators);
    window.addEventListener("resize", updateScrollIndicators);

    // Initial check
    setTimeout(updateScrollIndicators, 100);

    // Chevron button clicks
    const btnLeft = document.getElementById("btn-scroll-left");
    const btnRight = document.getElementById("btn-scroll-right");

    if (btnLeft) {
        btnLeft.onclick = (e) => {
            e.preventDefault();
            e.stopPropagation();
            slider.scrollBy({ left: -200, behavior: "smooth" });
        };
    }

    if (btnRight) {
        btnRight.onclick = (e) => {
            e.preventDefault();
            e.stopPropagation();
            slider.scrollBy({ left: 200, behavior: "smooth" });
        };
    }
}

document.addEventListener("DOMContentLoaded", () => {
    renderMoodCards();
    selectMood(0);
    initDragScroll();

    const token = localStorage.getItem('token');
    if (!token) {
        window.location.href = "login.html";
    }

    const nextBtn = document.getElementById("next-btn");
    if (nextBtn) nextBtn.onclick = nextMood;

    lucide.createIcons();

    // Tampilkan alert jika catatan hari ini sudah lengkap saat mendarat di halaman ini
    const historyData = JSON.parse(localStorage.getItem("history")) || {};
    if (historyData.pagi && historyData.siang && historyData.malam) {
        showCustomAlert(
            "Catatan Lengkap!",
            "Kamu sudah mencatat mood pagi, siang, dan malam untuk hari ini. Ayo lihat riwayat mood kamu.",
            "./result-mood.html"
        );
    }
});

document.getElementById("send-mood-btn").addEventListener("click", () => {
    const mood = moods[currentMoodIndex];
    const reason = document.getElementById("mood-textarea").value;

    let history = JSON.parse(localStorage.getItem("history")) || {};

    if (!history.pagi) {
        history.pagi = {
            mood: mood.name,
            reason,
        };
    } else if (!history.siang) {
        history.siang = {
            mood: mood.name,
            reason,
        };
    } else if (!history.malam) {
        history.malam = {
            mood: mood.name,
            reason,
        };
    } else {
        showCustomAlert(
            "Catatan Lengkap!",
            "Kamu sudah mencatat mood pagi, siang, dan malam untuk hari ini. Ayo lihat riwayat mood kamu.",
            "./result-mood.html"
        );
        return;
    }

    localStorage.setItem("history", JSON.stringify(history));

    window.location.href = "./result-mood.html";
});

const historyList = document.getElementById("history-list");
const history = JSON.parse(localStorage.getItem("history")) || {};
let hasHistory = false;

if (historyList) {
    ["pagi", "siang", "malam"].forEach((waktu) => {
        if (!history[waktu]) return;

        const moodData = moods.find(m => m.name === history[waktu].mood);

        if (moodData) {
            hasHistory = true;
            const historyCard = document.createElement("div");

            historyCard.className = "flex flex-col lg:flex-row items-center text-center lg:text-left gap-1 lg:gap-2";

            historyCard.innerHTML = `
                <img src="${moodData.img}" alt="${moodData.name}" class="w-15 lg:w-10 h-15 lg:h-10 object-contain" />
                <div class="flex flex-col">
                    <div class="text-sm font-bold text-gray-800">${moodData.name}</div>
                    <div class="text-xs text-gray-500 capitalize hidden lg:block">${waktu}</div>
                </div>
            `;

            historyList.appendChild(historyCard);
        }
    });

    if (!hasHistory) {
        const emptyMsg = document.createElement("div");
        emptyMsg.className = "text-xs text-gray-400 italic py-1 text-center";
        emptyMsg.textContent = "Belum ada riwayat mood hari ini.";
        historyList.appendChild(emptyMsg);
    }
}

// Redirect ke halaman result saat tombol diklik
const btnGoResult = document.getElementById("btn-go-result");
if (btnGoResult) {
    btnGoResult.addEventListener("click", () => {
        window.location.href = "./result-mood.html";
    });
}

// cardHistory.innerHTML = `
//     <div class="flex items-center gap-2"></div>
//         <img src="../assets/images/character/Happy.png" alt="Happy Character" class="w-10 h-10 object-contain" />
//         <div>
//             <div class="text-sm font-bold text-gray-800">Senang</div>
//             <div class="text-xs text-gray-500">2 hari lalu</div>
//         </div>
//     </div>
//     <div class="flex items-center gap-2">
//         <img src="../assets/images/character/Sad.png" alt="Sad Character" class="w-10 h-10 object-contain" />
//         <div>
//             <div class="text-sm font-bold text-gray-800">Sedih</div>
//             <div class="text-xs text-gray-500">5 hari lalu</div>
//         </div>
//     </div>
// `;