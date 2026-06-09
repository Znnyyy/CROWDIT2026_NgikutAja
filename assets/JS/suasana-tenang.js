document.addEventListener("DOMContentLoaded", () => {
  const audio = document.getElementById("audio-player");
  const playButtons = document.querySelectorAll(".play-btn");
  const mainPlayBtn = document.getElementById("main-play-btn");
  const progressBar = document.getElementById("progress-bar");

  const playerTitle = document.getElementById("player-title");
  const playerDescription = document.getElementById("player-description");
  const playerCover = document.getElementById("player-cover");
  const playerBar = document.getElementById("player-bar");

  const currentTimeEl = document.getElementById("current-time");
  const durationEl = document.getElementById("duration");

  const volumeSlider = document.getElementById("volume-slider");
  const volumeIcon = document.getElementById("volume-icon");

  const timerBtn = document.getElementById("timer-btn");
  const timerDropdown = document.getElementById("timer-dropdown");
  const timerDisplay = document.getElementById("timer-display");
  const timerOptions = document.querySelectorAll(".timer-option");

  const menuToggle = document.getElementById("menu-toggle");
  const mobileMenu = document.getElementById("mobile-menu");

  let currentTrack = null;
  let currentTrackTitle = null;
  let lastVolume = 0.7;
  let sleepTimerInterval = null;
  let sleepTimeRemaining = 0; // dalam satuan detik

  // --- Fungsi Pembantu ---

  // Format waktu (mm:ss)
  function formatTime(seconds) {
    if (isNaN(seconds)) return "0:00";
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs < 10 ? "0" : ""}${secs}`;
  }

  // Sinkronisasi ikon status putar
  function syncPlayState() {
    const isPaused = audio.paused;

    // Perbarui tombol play/pause player bawah
    if (isPaused) {
      mainPlayBtn.innerHTML = '<i class="fa-solid fa-play text-xl md:text-2xl ml-0.5"></i>';
    } else {
      mainPlayBtn.innerHTML = '<i class="fa-solid fa-pause text-xl md:text-2xl"></i>';
    }

    // Perbarui ikon putar aktif pada kartu suara
    playButtons.forEach((btn) => {
      const title = btn.getAttribute("data-title");
      const icon = btn.querySelector("i");
      if (icon) {
        if (currentTrackTitle === title && !isPaused) {
          icon.className = "fa-solid fa-pause";
        } else {
          icon.className = "fa-solid fa-play ml-0.5";
        }
      }
    });

    // Perbarui tampilan visual player bawah (tinggi + cover)
    if (playerBar) {
      if (!isPaused) {
        playerBar.classList.add("playing");
        document.body.classList.add('player-open');
      } else {
        playerBar.classList.remove("playing");
        document.body.classList.remove('player-open');
      }
    }
  }

  // Mengecilkan volume (fade out) dan menjeda audio dengan halus
  function fadeOutAndPause() {
    const startVol = audio.volume;
    const fadeInterval = setInterval(() => {
      if (audio.volume > 0.05) {
        audio.volume = Math.max(0, audio.volume - 0.05);
        if (volumeSlider) {
          const val = audio.volume * 100;
          volumeSlider.value = val;
          volumeSlider.style.background = `linear-gradient(to right, #7F9A90 0%, #7F9A90 ${val}%, #395448 ${val}%, #395448 100%)`;
        }
      } else {
        clearInterval(fadeInterval);
        audio.pause();
        audio.volume = startVol; // Kembalikan volume asli
        if (volumeSlider) {
          const val = startVol * 100;
          volumeSlider.value = val;
          volumeSlider.style.background = `linear-gradient(to right, #7F9A90 0%, #7F9A90 ${val}%, #395448 ${val}%, #395448 100%)`;
        }
        syncPlayState();
      }
    }, 100);
  }

  // Atur detail trek aktif
  function setTrack(audioSrc, title, description, cover) {
    const isNewTrack = (currentTrackTitle !== title);

    if (isNewTrack) {
      if (currentTrack !== audioSrc) {
        audio.src = audioSrc;
        currentTrack = audioSrc;
      } else {
        // Atur ulang waktu saat ini ke 0 karena kita mengklik kartu yang berbeda
        // yang menggunakan file audio yang sama di latar belakang.
        audio.currentTime = 0;
      }
      currentTrackTitle = title;
      progressBar.value = 0;
      progressBar.style.background = `linear-gradient(to right, #7F9A90 0%, #7F9A90 0%, #395448 0%, #395448 100%)`;
    }

    playerTitle.textContent = title;
    playerDescription.textContent = description;
    playerCover.src = cover;
  }

  // --- Pendengar Acara (Event Listeners) ---

  // Tangani Tombol Putar Kartu
  playButtons.forEach((button) => {
    // Kami menempelkannya ke tombol itu sendiri
    button.addEventListener("click", (e) => {
      e.stopPropagation(); // Hindari pemicu klik pembungkus kartu
      const audioSrc = button.getAttribute("data-audio");
      const title = button.getAttribute("data-title");
      const description = button.getAttribute("data-description");
      const cover = button.getAttribute("data-cover");

      if (currentTrackTitle === title) {
        // Alihkan play/pause
        if (audio.paused) {
          audio.play().then(() => syncPlayState());
        } else {
          audio.pause();
          syncPlayState();
        }
      } else {
        // Putar trek baru
        setTrack(audioSrc, title, description, cover);
        audio.play().then(() => syncPlayState());
      }
    });

    // Dukung klik pembungkus kartu itu sendiri untuk pengalaman modern
    const card = button.closest(".sound-card");
    if (card) {
      card.addEventListener("click", () => {
        button.click();
      });
    }
  });

  // Tangani Tombol Play/Pause Utama
  mainPlayBtn.addEventListener("click", () => {
    if (!audio.src) return;

    if (audio.paused) {
      audio.play().then(() => syncPlayState());
    } else {
      audio.pause();
      syncPlayState();
    }
  });

  // Ketika metadata audio siap
  audio.addEventListener("loadedmetadata", () => {
    durationEl.textContent = formatTime(audio.duration);
  });

  // Tangani pembaruan waktu untuk progress bar dan teks timer
  audio.addEventListener("timeupdate", () => {
    if (audio.duration) {
      currentTimeEl.textContent = formatTime(audio.currentTime);
      durationEl.textContent = formatTime(audio.duration);

      const progress = (audio.currentTime / audio.duration) * 100;
      progressBar.value = progress;
      progressBar.style.background = `
        linear-gradient(
          to right,
          #7F9A90 0%,
          #7F9A90 ${progress}%,
          #395448 ${progress}%,
          #395448 100%
        )
      `;
    }
  });

  // Tangani pergeseran slider progress bar
  progressBar.addEventListener("input", () => {
    if (audio.duration) {
      const seekTime = (progressBar.value / 100) * audio.duration;
      audio.currentTime = seekTime;
    }
  });

  // Trek audio selesai
  audio.addEventListener("ended", () => {
    progressBar.value = 0;
    progressBar.style.background = `linear-gradient(to right, #7F9A90 0%, #7F9A90 0%, #395448 0%, #395448 100%)`;
    syncPlayState();
  });

  // --- Logika Slider & Ikon Volume ---

  function updateVolumeIcon(value) {
    if (!volumeIcon) return;
    if (value === 0) {
      volumeIcon.className = "fa-solid fa-volume-xmark text-white text-sm opacity-70";
    } else if (value < 40) {
      volumeIcon.className = "fa-solid fa-volume-low text-white text-sm opacity-70";
    } else {
      volumeIcon.className = "fa-solid fa-volume-high text-white text-sm opacity-70";
    }
  }

  if (volumeSlider) {
    // Atur status volume awal
    audio.volume = volumeSlider.value / 100;
    lastVolume = audio.volume;

    volumeSlider.addEventListener("input", () => {
      const val = parseInt(volumeSlider.value, 10);
      audio.volume = val / 100;
      if (audio.volume > 0) {
        lastVolume = audio.volume;
      }
      updateVolumeIcon(val);

      volumeSlider.style.background = `
        linear-gradient(
          to right,
          #7F9A90 0%,
          #7F9A90 ${val}%,
          #395448 ${val}%,
          #395448 100%
        )
      `;
    });

    // Inisialisasi visual latar belakang slider volume
    volumeSlider.style.background = `
      linear-gradient(
        to right,
        #7F9A90 0%,
        #7F9A90 ${volumeSlider.value}%,
        #395448 ${volumeSlider.value}%,
        #395448 100%
      )
    `;
  }

  if (volumeIcon) {
    // Klik ikon untuk membisukan/mengaktifkan suara
    volumeIcon.addEventListener("click", () => {
      if (audio.volume > 0) {
        lastVolume = audio.volume;
        audio.volume = 0;
        volumeSlider.value = 0;
        updateVolumeIcon(0);
        volumeSlider.style.background = `linear-gradient(to right, #7F9A90 0%, #7F9A90 0%, #395448 0%, #395448 100%)`;
      } else {
        audio.volume = lastVolume;
        const val = lastVolume * 100;
        volumeSlider.value = val;
        updateVolumeIcon(val);
        volumeSlider.style.background = `linear-gradient(to right, #7F9A90 0%, #7F9A90 ${val}%, #395448 ${val}%, #395448 100%)`;
      }
    });
  }

  // --- Logika Timer Tidur ---

  if (timerBtn && timerDropdown) {
    timerBtn.addEventListener("click", (e) => {
      e.stopPropagation();
      timerDropdown.classList.toggle("hidden");
    });

    document.addEventListener("click", () => {
      timerDropdown.classList.add("hidden");
    });
  }

  timerOptions.forEach((option) => {
    option.addEventListener("click", (e) => {
      e.stopPropagation();
      const minutes = parseInt(option.getAttribute("data-minutes"), 10);

      clearInterval(sleepTimerInterval);
      sleepTimerInterval = null;

      if (minutes > 0) {
        sleepTimeRemaining = minutes * 60;
        timerDisplay.textContent = `${minutes} Menit`;

        sleepTimerInterval = setInterval(() => {
          sleepTimeRemaining--;

          if (sleepTimeRemaining <= 0) {
            clearInterval(sleepTimerInterval);
            sleepTimerInterval = null;
            timerDisplay.textContent = "Matikan";
            fadeOutAndPause();
          } else {
            const minsLeft = Math.ceil(sleepTimeRemaining / 60);
            timerDisplay.textContent = `${minsLeft} Menit`;
          }
        }, 1000);
      } else {
        timerDisplay.textContent = "Matikan";
      }

      timerDropdown.classList.add("hidden");
    });
  });

  // --- Navigasi Hamburger Seluler ---

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

    // Tutup menu saat mengklik di luar
    document.addEventListener("click", (e) => {
      if (!menuToggle.contains(e.target) && !mobileMenu.contains(e.target)) {
        mobileMenu.classList.add("hidden");
        const icon = menuToggle.querySelector("i");
        if (icon) icon.className = "fa-solid fa-bars fa-xl";
      }
    });
  }

  // --- Pengaturan Awal Saat Halaman Dimuat ---
  if (playButtons.length > 0) {
    const firstBtn = playButtons[0];
    const initialAudio = firstBtn.getAttribute("data-audio");
    const initialTitle = firstBtn.getAttribute("data-title");
    const initialDesc = firstBtn.getAttribute("data-description");
    const initialCover = firstBtn.getAttribute("data-cover");

    setTrack(initialAudio, initialTitle, initialDesc, initialCover);
    // Atur ulang status sinkronisasi UI secara eksplisit (menampilkan ikon putar karena sudah dimuat tetapi belum diputar)
    syncPlayState();
  }
});