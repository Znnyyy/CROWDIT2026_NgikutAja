document.addEventListener("DOMContentLoaded", () => {
  const hoursDisplay = document.getElementById("hours-display");
  const minutesDisplay = document.getElementById("minutes-display");
  const secondsDisplay = document.getElementById("seconds-display");

  const hrUp = document.getElementById("hr-up");
  const hrDown = document.getElementById("hr-down");
  const minUp = document.getElementById("min-up");
  const minDown = document.getElementById("min-down");
  const secUp = document.getElementById("sec-up");
  const secDown = document.getElementById("sec-down");

  const startBtn = document.getElementById("start-btn");
  const startIcon = document.getElementById("start-icon");
  const startText = document.getElementById("start-text");
  const resetBtn = document.getElementById("reset-btn");
  const timerCard = document.getElementById("timer-card");

  const menuToggle = document.getElementById("menu-toggle");
  const mobileMenu = document.getElementById("mobile-menu");

  // Elemen UI Modal Istirahat
  const breakModal = document.getElementById("break-modal");
  const closeModalBtn = document.getElementById("close-modal-btn");
  const accordionItems = document.querySelectorAll(".accordion-item");

  // --- Status Timer ---
  let hours = 0;
  let minutes = 1;
  let seconds = 0;

  // Lacak konfigurasi waktu yang diatur oleh pengguna agar kita bisa meresetnya
  let setHours = 0;
  let setMinutes = 1;
  let setSeconds = 0;

  // Lacak sisa waktu hitung mundur aktif dalam satuan detik
  let currentSecondsRemaining = 0;

  let timerInterval = null;
  let isRunning = false;
  
  // Status Modal Waktu Istirahat
  let breakShown = false;
  let breakAutoCloseTimeout = null;
  let breakShowCloseBtnTimeout = null;

  // --- Fungsi Pembantu ---

  // Perbarui nilai tampilan
  function updateDisplay() {
    hoursDisplay.textContent = String(hours).padStart(2, "0");
    minutesDisplay.textContent = String(minutes).padStart(2, "0");
    secondsDisplay.textContent = String(seconds).padStart(2, "0");
  }

  // Alihkan ketersediaan tombol kontrol
  function setControlsEnabled(enabled) {
    const controls = [hrUp, hrDown, minUp, minDown, secUp, secDown];
    controls.forEach((btn) => {
      btn.disabled = !enabled;
    });

    // Aktifkan/nonaktifkan pointer kursor dan efek hover pada digit
    const digits = [hoursDisplay, minutesDisplay, secondsDisplay];
    digits.forEach((el) => {
      if (enabled) {
        el.classList.add("cursor-pointer", "hover:text-[#587966]");
        el.title = "Klik untuk mengubah";
      } else {
        el.classList.remove("cursor-pointer", "hover:text-[#587966]");
        el.removeAttribute("title");
      }
    });
  }

  // Mainkan urutan nada synthesizer premium menggunakan Web Audio API
  function playCompletionChime() {
    try {
      const AudioContext = window.AudioContext || window.webkitAudioContext;
      if (!AudioContext) return;
      const ctx = new AudioContext();

      // Mainkan 3 nada: G5 (783.99 Hz), B5 (987.77 Hz), D6 (1174.66 Hz)
      const notes = [783.99, 987.77, 1174.66];
      const now = ctx.currentTime;

      notes.forEach((freq, index) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();

        osc.type = "sine";
        osc.frequency.setValueAtTime(freq, now + index * 0.15);

        // Amplop volume (envelope)
        gain.gain.setValueAtTime(0.3, now + index * 0.15);
        gain.gain.exponentialRampToValueAtTime(0.01, now + index * 0.15 + 0.4);

        osc.connect(gain);
        gain.connect(ctx.destination);

        osc.start(now + index * 0.15);
        osc.stop(now + index * 0.15 + 0.55);
      });
    } catch (e) {
      console.warn("Audio Context diblokir atau tidak didukung: ", e);
    }
  }

  // Buat toast overlay visual dalam kartu yang memukau saat timer berakhir
  function showCompletionToast() {
    // Hapus toast yang sudah ada jika ada
    const existing = document.getElementById("timer-completion-toast");
    if (existing) existing.remove();

    // Buat kontainer toast
    const toast = document.createElement("div");
    toast.id = "timer-completion-toast";
    toast.className =
      "absolute inset-0 bg-[#3B5B4E]/90 rounded-[20px] flex flex-col items-center justify-center text-white z-40 transition-opacity duration-500 p-6 text-center animate-fade-in";
    toast.innerHTML = `
      <i class="fa-solid fa-circle-check text-6xl sm:text-8xl text-[#D4D4C4] mb-4 animate-bounce"></i>
      <h2 class="font-titan text-3xl sm:text-5xl mb-2 text-[#F4F0EA]">Selesai!</h2>
      <p class="text-lg sm:text-xl font-medium text-[#D4D4C4] mb-6">Waktu belajar Anda telah selesai. Kerja bagus!</p>
      <button id="close-toast-btn" class="px-6 py-2 bg-[#F4F0EA] text-[#3B5B4E] rounded-full font-bold hover:scale-105 active:scale-95 transition-transform cursor-pointer shadow-md">
        Kembali
      </button>
    `;

    // Tambahkan ke pembungkus kartu bagian dalam (yang merupakan induk dari tata letak bagian dalam)
    const innerCard = timerCard.firstElementChild;
    innerCard.classList.add("relative"); // Pastikan pemosisian relatif
    innerCard.appendChild(toast);

    // Dengarkan penutupan tombol
    document.getElementById("close-toast-btn").addEventListener("click", () => {
      toast.style.opacity = "0";
      setTimeout(() => {
        toast.remove();
      }, 500);
    });

    // Hapus otomatis setelah 8 detik
    setTimeout(() => {
      if (toast.parentNode) {
        toast.style.opacity = "0";
        setTimeout(() => toast.remove(), 500);
      }
    }, 8000);
  }

  // Buat digit dapat diedit melalui kolom input inline
  function makeEditable(element, type) {
    if (isRunning) return;

    // Periksa apakah sudah ada input yang aktif
    if (
      element.nextElementSibling &&
      element.nextElementSibling.tagName === "INPUT"
    )
      return;

    const currentValue = parseInt(element.textContent, 10);
    const input = document.createElement("input");
    input.type = "number";
    input.value = currentValue;

    // Gaya desain yang tepat: font-titan, ukuran, pemusatan, latar belakang bersih
    input.className =
      "font-titan text-[12vw] sm:text-[10vw] md:text-[125px] leading-none text-[#3B5B4E] bg-transparent text-center focus:outline-none border-none p-0 m-0 focus:ring-0 focus:border-none";
    input.style.width = "2.2ch";

    // Atur batasan min/max absolut ke 59 untuk semua kolom input
    input.min = 0;
    input.max = 59;

    // Batasi input tepat 2 digit
    input.addEventListener("input", () => {
      if (input.value.length > 2) {
        input.value = input.value.slice(0, 2);
      }
    });

    // Tukar tampilan
    element.style.display = "none";
    element.parentNode.insertBefore(input, element);

    input.focus();
    input.select();

    let finished = false;

    function finishEditing() {
      if (finished) return;
      finished = true;

      let newValue = parseInt(input.value, 10);
      if (isNaN(newValue)) {
        newValue = currentValue;
      } else {
        // Terapkan nilai maksimum 59 untuk semua kolom
        newValue = Math.max(0, Math.min(59, newValue));
        if (type === "hours") {
          hours = newValue;
          setHours = newValue;
        } else if (type === "minutes") {
          minutes = newValue;
          setMinutes = newValue;
        } else if (type === "seconds") {
          seconds = newValue;
          setSeconds = newValue;
        }
      }

      element.textContent = String(newValue).padStart(2, "0");
      element.style.display = "inline-block";
      input.remove();
    }

    input.addEventListener("blur", finishEditing);
    input.addEventListener("keydown", (e) => {
      if (e.key === "Enter") {
        input.blur();
      } else if (e.key === "Escape") {
        input.value = currentValue;
        input.blur();
      }
    });
  }

  // --- Tindakan Timer ---

  // Mulai/lanjutkan timer (selalu diganti ke hitung mundur 1 menit untuk keperluan demo)
  function startTimer() {
    // Periksa apakah timer yang dikonfigurasi lebih besar dari nol
    const totalConfiguredSeconds =
      setHours * 3600 + setMinutes * 60 + setSeconds;
    if (totalConfiguredSeconds <= 0) return;

    isRunning = true;
    startText.textContent = "Jeda";

    // Ganti ikon putar ke ikon jeda secara dinamis
    startIcon.style.display = "none";
    let pauseIcon = document.getElementById("temp-pause-icon");
    if (!pauseIcon) {
      pauseIcon = document.createElement("i");
      pauseIcon.id = "temp-pause-icon";
      pauseIcon.className =
        "fa-solid fa-pause text-2xl sm:text-3xl md:text-4xl mr-2 sm:mr-4";
      startBtn.insertBefore(pauseIcon, startText);
    } else {
      pauseIcon.style.display = "inline-block";
    }

    setControlsEnabled(false);
    timerCard.classList.add("timer-card-active");

    // Tulis ulang waktu yang berjalan tepat 1 menit (60 detik) untuk presentasi desain web ini
    if (currentSecondsRemaining <= 0) {
      currentSecondsRemaining = 60;
      hours = 0;
      minutes = 1;
      seconds = 0;
      updateDisplay();
    }

    timerInterval = setInterval(() => {
      currentSecondsRemaining--;

      // PEMICU MODAL ISTIRAHAT:
      // Jika 25 detik telah berlalu (60 - 25 = 35) dan waktu istirahat belum ditampilkan
      if (currentSecondsRemaining === 57 && !breakShown) {
        breakShown = true;
        showBreakModal();
        return; // hentikan eksekusi sisa detik ini
      }

      if (currentSecondsRemaining <= 0) {
        clearInterval(timerInterval);
        currentSecondsRemaining = 0;
        breakShown = false; // Atur ulang status modal istirahat

        // Kembalikan waktu khusus yang dikonfigurasi pengguna
        hours = setHours;
        minutes = setMinutes;
        seconds = setSeconds;
        updateDisplay();

        playCompletionChime();
        showCompletionToast();
        pauseTimer(); // atur ulang status tombol
        return;
      }

      hours = Math.floor(currentSecondsRemaining / 3600);
      minutes = Math.floor((currentSecondsRemaining % 3600) / 60);
      seconds = currentSecondsRemaining % 60;
      updateDisplay();
    }, 1000);
  }

  function pauseTimer() {
    isRunning = false;
    startText.textContent = "Mulai";
    startIcon.style.display = "inline-block";

    const pauseIcon = document.getElementById("temp-pause-icon");
    if (pauseIcon) pauseIcon.style.display = "none";

    clearInterval(timerInterval);
    setControlsEnabled(true);
    timerCard.classList.remove("timer-card-active");
  }

  function resetTimer() {
    pauseTimer();
    currentSecondsRemaining = 0;
    breakShown = false; // Atur ulang status modal istirahat
    hours = setHours;
    minutes = setMinutes;
    seconds = setSeconds;
    updateDisplay();
  }

  // --- Fungsi Modal Istirahat ---
  function showBreakModal() {
    // Jeda interval timer yang aktif tetapi biarkan UI "Jeda" tetap aktif di kartu utama
    clearInterval(timerInterval);
    
    // Tampilkan modal
    if (breakModal) breakModal.classList.remove("hidden");
    
    // Sembunyikan tombol tutup di awal
    if (closeModalBtn) {
      closeModalBtn.classList.add("hidden", "opacity-0");
    }
    
    // Tunggu 10 detik sebelum menampilkan tombol tutup
    breakShowCloseBtnTimeout = setTimeout(() => {
      if (closeModalBtn) {
        closeModalBtn.classList.remove("hidden");
        // sedikit keterlambatan untuk membiarkan display:block diterapkan sebelum transisi opacity
        setTimeout(() => {
          closeModalBtn.classList.remove("opacity-0");
        }, 50);
      }

      // Tunggu 5 detik untuk menutup otomatis setelah tombol muncul
      breakAutoCloseTimeout = setTimeout(() => {
        closeBreakModal();
      }, 5000);
      
    }, 10000);
  }

  function closeBreakModal() {
    clearTimeout(breakShowCloseBtnTimeout);
    clearTimeout(breakAutoCloseTimeout);
    
    if (breakModal) breakModal.classList.add("hidden");
    
    // Lanjutkan logika timer
    startTimer();
  }

  if (closeModalBtn) {
    closeModalBtn.addEventListener("click", closeBreakModal);
  }

  // Logika Akordeon Modal Istirahat dengan Animasi
  accordionItems.forEach(item => {
    item.addEventListener("click", () => {
      const isOpen = item.classList.contains("active");
      
      // Tutup semua item terlebih dahulu untuk membuat efek akordeon tunggal yang rapi
      accordionItems.forEach(otherItem => {
        otherItem.classList.remove("active");
        const otherIcon = otherItem.querySelector(".accordion-icon");
        if (otherIcon) {
          otherIcon.classList.remove("fa-chevron-up");
          otherIcon.classList.add("fa-chevron-down");
        }
      });
      
      // Jika item yang diklik sebelumnya tidak aktif, aktifkan sekarang
      if (!isOpen) {
        item.classList.add("active");
        const icon = item.querySelector(".accordion-icon");
        if (icon) {
          icon.classList.remove("fa-chevron-down");
          icon.classList.add("fa-chevron-up");
        }
      }
    });
  });

  // --- Pendengar Acara Klik (Click Event Listeners) ---

  // Pemicu edit tampilan digit
  hoursDisplay.addEventListener("click", () =>
    makeEditable(hoursDisplay, "hours"),
  );
  minutesDisplay.addEventListener("click", () =>
    makeEditable(minutesDisplay, "minutes"),
  );
  secondsDisplay.addEventListener("click", () =>
    makeEditable(secondsDisplay, "seconds"),
  );

  // Alihkan tombol Play/Pause
  startBtn.addEventListener("click", () => {
    if (isRunning) {
      pauseTimer();
    } else {
      startTimer();
    }
  });

  // Tombol reset
  resetBtn.addEventListener("click", () => {
    resetTimer();
  });

  // Penyesuaian jam (sekarang dibatasi di 59 dan kembali ke 0)
  hrUp.addEventListener("click", () => {
    hours = (hours + 1) % 60;
    setHours = hours;
    updateDisplay();
  });
  hrDown.addEventListener("click", () => {
    hours = (hours - 1 + 60) % 60;
    setHours = hours;
    updateDisplay();
  });

  // Penyesuaian menit (dibatasi di 59 dan kembali ke 0)
  minUp.addEventListener("click", () => {
    minutes = (minutes + 1) % 60;
    setMinutes = minutes;
    updateDisplay();
  });
  minDown.addEventListener("click", () => {
    minutes = (minutes - 1 + 60) % 60;
    setMinutes = minutes;
    updateDisplay();
  });

  // Penyesuaian detik (dibatasi di 59 dan kembali ke 0)
  secUp.addEventListener("click", () => {
    seconds = (seconds + 1) % 60;
    setSeconds = seconds;
    updateDisplay();
  });
  secDown.addEventListener("click", () => {
    seconds = (seconds - 1 + 60) % 60;
    setSeconds = seconds;
    updateDisplay();
  });

  // --- Alihkan Menu Seluler ---
  if (menuToggle && mobileMenu) {
    menuToggle.addEventListener("click", () => {
      mobileMenu.classList.toggle("hidden");
      const icon = menuToggle.querySelector("i");
      if (icon) {
        if (mobileMenu.classList.contains("hidden")) {
          icon.className = "fa-solid fa-bars fa-xl";
        } else {
          icon.className = "fa-solid fa-xmark fa-xl";
        }
      }
    });

    // Tutup menu saat mengklik di luar navbar
    document.addEventListener("click", (e) => {
      if (!menuToggle.contains(e.target) && !mobileMenu.contains(e.target)) {
        mobileMenu.classList.add("hidden");
        const icon = menuToggle.querySelector("i");
        if (icon) icon.className = "fa-solid fa-bars fa-xl";
      }
    });
  }

  // Inisialisasi status visual hover/pointer
  setControlsEnabled(true);

  // --- Render Awal ---
  updateDisplay();
});
