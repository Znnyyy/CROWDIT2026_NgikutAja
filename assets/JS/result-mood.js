const moodsData = [
  { name: "Senang", img: "../assets/images/character/Happy.png", color: "#FFB703" },
  { name: "Sedih", img: "../assets/images/character/Sad.png", color: "#5B8DD9" },
  { name: "Marah", img: "../assets/images/character/Angry.png", color: "#E05A5A" },
  { name: "Cemas", img: "../assets/images/character/Worry.png", color: "#9234F5" },
  { name: "Malas", img: "../assets/images/character/Lazy.png", color: "#4CAF8A" },
  { name: "Normal", img: "../assets/images/character/Normal.png", color: "#F9A8D4" },
  { name: "Iri", img: "../assets/images/character/Jealous.png", color: "#0DB257" }
];

function renderResultPage() {
  const history = JSON.parse(localStorage.getItem("history")) || {};
  
  // Cari entri terakhir yang dicatat (entri terakhir dari pagi, siang, malam yang memiliki data)
  let latestSlot = null;
  if (history.malam) latestSlot = { slot: "malam", data: history.malam };
  else if (history.siang) latestSlot = { slot: "siang", data: history.siang };
  else if (history.pagi) latestSlot = { slot: "pagi", data: history.pagi };

  const topCharImg = document.getElementById("top-char-img");
  const cardTopImg = document.getElementById("card-char-top");
  const resultMoodLabel = document.getElementById("result-mood-label");
  const resultReason = document.getElementById("result-reason");
  const latestWaktuBadge = document.getElementById("latest-waktu-badge");
  const resultGlow = document.getElementById("result-glow");

  // Buat daftar slot terisi secara kronologis
  const filledSlots = [];
  if (history.pagi) filledSlots.push({ slot: "pagi", data: history.pagi });
  if (history.siang) filledSlots.push({ slot: "siang", data: history.siang });
  if (history.malam) filledSlots.push({ slot: "malam", data: history.malam });

  if (latestSlot) {
    const moodObj = moodsData.find(m => m.name === latestSlot.data.mood) || moodsData[5];

    if (topCharImg) {
      topCharImg.src = moodObj.img;
      topCharImg.alt = `${moodObj.name} Character`;
    }
    
    resultMoodLabel.textContent = moodObj.name;
    resultMoodLabel.style.color = moodObj.color;
    resultReason.textContent = latestSlot.data.reason || "Tidak ada cerita tertulis.";
    
    const slotLabel = {
      pagi: "Catatan Pagi",
      siang: "Catatan Siang",
      malam: "Catatan Malam"
    }[latestSlot.slot];

    latestWaktuBadge.textContent = slotLabel;
    latestWaktuBadge.style.color = moodObj.color;
    latestWaktuBadge.style.backgroundColor = `${moodObj.color}15`;
    resultGlow.style.backgroundColor = moodObj.color;
  } else {
    // Cadangan jika belum ada riwayat
    if (topCharImg) {
      topCharImg.src = moodsData[5].img;
      topCharImg.alt = "Default Character";
      topCharImg.style.display = "block";
    }
    resultMoodLabel.textContent = moodsData[5].name;
    resultReason.textContent = "Kamu belum mencatat emosi hari ini!";
    latestWaktuBadge.textContent = "Kosong";
  }

  // Sesuaikan posisi top karakter berdasarkan jumlah data di local storage (filledSlots)
  if (cardTopImg) {
    // Hapus class top bawaan jika ada
    cardTopImg.classList.remove("-top-1", "top-10", "top-20", "-top-12");
    
    if (filledSlots.length === 1) {
      cardTopImg.style.top = "130px"; // Menyesuaikan agar berada di atas cairan 30%
      cardTopImg.classList.add("top-20");
    } else if (filledSlots.length === 2) {
      cardTopImg.style.top = "55px";  // Menyesuaikan agar berada di atas cairan 60%
      cardTopImg.classList.add("top-10");
    } else if (filledSlots.length === 3) {
      cardTopImg.style.top = "-4px";  // Menyesuaikan agar berada di atas cairan 90% (paling tinggi)
      cardTopImg.classList.add("-top-1");
    } else {
      cardTopImg.style.top = "208px"; // Berada di dasar gelas jika kosong
      cardTopImg.classList.add("top-20");
    }
  }

  // Render lapisan gelas kaca
  const liquidContainer = document.getElementById("liquid-container");
  const liquidLayers = document.getElementById("liquid-layers");
  const waveSvg = document.getElementById("wave-svg");

  if (liquidContainer && liquidLayers && waveSvg) {
    const liquidHeight = (filledSlots.length / 3) * 90;
    liquidContainer.style.height = `${liquidHeight}%`;
    liquidLayers.innerHTML = "";

    if (filledSlots.length > 0) {
      const latestMoodObj = moodsData.find(m => m.name === latestSlot.data.mood) || moodsData[5];
      waveSvg.style.color = latestMoodObj.color;
      waveSvg.style.display = "block";

      filledSlots.forEach(slot => {
        const moodObj = moodsData.find(m => m.name === slot.data.mood) || moodsData[5];
        const block = document.createElement("div");
        block.style.height = `${100 / filledSlots.length}%`;
        block.style.backgroundColor = moodObj.color;
        block.className = "w-full transition-all duration-500 ease-out";
        liquidLayers.appendChild(block);
      });
    } else {
      waveSvg.style.color = "transparent";
      waveSvg.style.display = "none";
    }
  }

  // Render card history 
  const timelineContainer = document.getElementById("timeline-container");
  timelineContainer.innerHTML = "";

  const slots = [
    { key: "pagi", fallback: "Pagi" },
    { key: "siang", fallback: "Siang" },
    { key: "malam", fallback: "Malam" }
  ];

  slots.forEach(slot => {
    const slotData = history[slot.key];
    const card = document.createElement("div");
    card.className = "flex items-center gap-4 bg-white rounded-2xl p-4 shadow-sm border border-[#E4E2DC] transition-all duration-200";

    const slotLabel = slot.fallback;

    if (slotData) {
      const moodObj = moodsData.find(m => m.name === slotData.mood) || moodsData[5];

      card.innerHTML = `
        <div class="w-12 h-12 rounded-xl flex items-center justify-center shrink-0" style="background-color: ${moodObj.color}15">
          <img src="${moodObj.img}" alt="${moodObj.name}" class="w-9 h-9 object-contain" />
        </div>
        <div class="flex-1 min-w-0">
          <div class="flex justify-between items-baseline mb-0.5">
            <span class="text-sm font-bold text-gray-800">${moodObj.name}</span>
            <span class="text-xxs font-bold uppercase tracking-wider text-gray-400">${slotLabel}</span>
          </div>
          <p class="text-xs text-gray-500 truncate">${slotData.reason || "Tanpa cerita."}</p>
        </div>
      `;
    } else {
      card.classList.add("opacity-60", "border-dashed");
      card.innerHTML = `
        <a href="../../pages/t-mood.html" class="w-12 h-12 rounded-xl bg-gray-100 flex items-center justify-center shrink-0">
          <i data-lucide="plus" class="w-5 h-5 text-gray-400"></i>
        </a>=
        <div class="flex-1">
          <div class="flex justify-between items-baseline">
            <span class="text-sm font-medium text-gray-400">Belum Diisi</span>
            <span class="text-xxs font-bold uppercase tracking-wider text-gray-400">${slotLabel}</span>
          </div>
        </div>
      `;
    }
    timelineContainer.appendChild(card);
  });

  // Sembunyikan tombol 'Catat Mood Lagi' jika semua slot hari ini sudah lengkap
  const againBtn = document.getElementById("again-btn");
  if (againBtn) {
    if (history.pagi && history.siang && history.malam) {
      againBtn.style.display = "none";
    } else {
      againBtn.style.display = "inline-block";
    }
  }

  // Inisialisasi ikon Lucide yang baru dibuat
  lucide.createIcons();
}

document.addEventListener("DOMContentLoaded", () => {
  renderResultPage();
  
  // Otomatis cek token untuk pengalihan jika belum login
  const token = localStorage.getItem('token');
  if (!token) {
    window.location.href = "login.html";
  }
});
