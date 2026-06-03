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

  // Break Modal UI Elements
  const breakModal = document.getElementById("break-modal");
  const closeModalBtn = document.getElementById("close-modal-btn");
  const accordionItems = document.querySelectorAll(".accordion-item");

  // --- Timer State ---
  let hours = 1;
  let minutes = 0;
  let seconds = 0;

  // Track the configuration time set by the user so we can reset to it
  let setHours = 1;
  let setMinutes = 0;
  let setSeconds = 0;

  // Keep track of the active countdown time in seconds
  let currentSecondsRemaining = 0;

  let timerInterval = null;
  let isRunning = false;
  
  // Break Time Modal State
  let breakShown = false;
  let breakAutoCloseTimeout = null;
  let breakShowCloseBtnTimeout = null;

  // --- Helper Functions ---

  // Update display values
  function updateDisplay() {
    hoursDisplay.textContent = String(hours).padStart(2, "0");
    minutesDisplay.textContent = String(minutes).padStart(2, "0");
    secondsDisplay.textContent = String(seconds).padStart(2, "0");
  }

  // Toggle control buttons availability
  function setControlsEnabled(enabled) {
    const controls = [hrUp, hrDown, minUp, minDown, secUp, secDown];
    controls.forEach((btn) => {
      btn.disabled = !enabled;
    });

    // Enable/disable cursor pointer and hover effects on digits
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

  // Play a premium synthesizer chime sequence using the Web Audio API
  function playCompletionChime() {
    try {
      const AudioContext = window.AudioContext || window.webkitAudioContext;
      if (!AudioContext) return;
      const ctx = new AudioContext();

      // Play 3 notes: G5 (783.99 Hz), B5 (987.77 Hz), D6 (1174.66 Hz)
      const notes = [783.99, 987.77, 1174.66];
      const now = ctx.currentTime;

      notes.forEach((freq, index) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();

        osc.type = "sine";
        osc.frequency.setValueAtTime(freq, now + index * 0.15);

        // Volume envelope
        gain.gain.setValueAtTime(0.3, now + index * 0.15);
        gain.gain.exponentialRampToValueAtTime(0.01, now + index * 0.15 + 0.4);

        osc.connect(gain);
        gain.connect(ctx.destination);

        osc.start(now + index * 0.15);
        osc.stop(now + index * 0.15 + 0.55);
      });
    } catch (e) {
      console.warn("Audio Context is blocked or not supported: ", e);
    }
  }

  // Create a stunning in-card visual overlay toast when the timer ends
  function showCompletionToast() {
    // Remove existing toast if any
    const existing = document.getElementById("timer-completion-toast");
    if (existing) existing.remove();

    // Create toast container
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

    // Append to the inner card wrapper (which is the parent of the inner layout)
    const innerCard = timerCard.firstElementChild;
    innerCard.classList.add("relative"); // Ensure relative positioning
    innerCard.appendChild(toast);

    // Listen to button close
    document.getElementById("close-toast-btn").addEventListener("click", () => {
      toast.style.opacity = "0";
      setTimeout(() => {
        toast.remove();
      }, 500);
    });

    // Auto-remove after 8 seconds
    setTimeout(() => {
      if (toast.parentNode) {
        toast.style.opacity = "0";
        setTimeout(() => toast.remove(), 500);
      }
    }, 8000);
  }

  // Make digits editable via inline input field
  function makeEditable(element, type) {
    if (isRunning) return;

    // Check if there is already an active input
    if (
      element.nextElementSibling &&
      element.nextElementSibling.tagName === "INPUT"
    )
      return;

    const currentValue = parseInt(element.textContent, 10);
    const input = document.createElement("input");
    input.type = "number";
    input.value = currentValue;

    // Exact styling matches: font-titan, sizing, centering, clean background
    input.className =
      "font-titan text-[12vw] sm:text-[10vw] md:text-[215px] leading-none text-[#3B5B4E] bg-transparent text-center focus:outline-none border-none p-0 m-0 focus:ring-0 focus:border-none";
    input.style.width = "2.2ch";

    // Set absolute min/max constraints to 59 for all input fields
    input.min = 0;
    input.max = 59;

    // Restrict inputs to exactly 2 digits
    input.addEventListener("input", () => {
      if (input.value.length > 2) {
        input.value = input.value.slice(0, 2);
      }
    });

    // Swap displays
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
        // Enforce maximum value of 59 for all fields
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

  // --- Timer Actions ---

  // Start/resume the timer (always overridden to a 1-minute countdown for demo purposes)
  function startTimer() {
    // Check if the configured timer is greater than zero
    const totalConfiguredSeconds =
      setHours * 3600 + setMinutes * 60 + setSeconds;
    if (totalConfiguredSeconds <= 0) return;

    isRunning = true;
    startText.textContent = "Jeda";

    // Switch play icon to a pause icon dynamically
    startIcon.style.display = "none";
    let pauseIcon = document.getElementById("temp-pause-icon");
    if (!pauseIcon) {
      pauseIcon = document.createElement("i");
      pauseIcon.id = "temp-pause-icon";
      pauseIcon.className =
        "fa-solid fa-pause text-2xl sm:text-4xl md:text-5xl mr-2 sm:mr-4";
      startBtn.insertBefore(pauseIcon, startText);
    } else {
      pauseIcon.style.display = "inline-block";
    }

    setControlsEnabled(false);
    timerCard.classList.add("timer-card-active");

    // Overwrite the ticking time to exactly 1 minute (60 seconds) for this web design presentation
    if (currentSecondsRemaining <= 0) {
      currentSecondsRemaining = 60;
      hours = 0;
      minutes = 1;
      seconds = 0;
      updateDisplay();
    }

    timerInterval = setInterval(() => {
      currentSecondsRemaining--;

      // TRIGGER BREAK MODAL:
      // If 25 seconds have passed (60 - 25 = 35) and break hasn't been shown yet
      if (currentSecondsRemaining === 35 && !breakShown) {
        breakShown = true;
        showBreakModal();
        return; // stop executing the rest of this tick
      }

      if (currentSecondsRemaining <= 0) {
        clearInterval(timerInterval);
        currentSecondsRemaining = 0;
        breakShown = false; // Reset for next run

        // Restore user's configured custom time
        hours = setHours;
        minutes = setMinutes;
        seconds = setSeconds;
        updateDisplay();

        playCompletionChime();
        showCompletionToast();
        pauseTimer(); // resets button states
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
    breakShown = false; // Reset break modal state
    hours = setHours;
    minutes = setMinutes;
    seconds = setSeconds;
    updateDisplay();
  }

  // --- Break Modal Functions ---
  function showBreakModal() {
    // Pause the active timer interval but keep the "Jeda" UI active on the main card
    clearInterval(timerInterval);
    
    // Show modal
    if (breakModal) breakModal.classList.remove("hidden");
    
    // Hide close button initially
    if (closeModalBtn) {
      closeModalBtn.classList.add("hidden", "opacity-0");
    }
    
    // 10-second wait before showing the close button
    breakShowCloseBtnTimeout = setTimeout(() => {
      if (closeModalBtn) {
        closeModalBtn.classList.remove("hidden");
        // small delay to let display:block apply before transitioning opacity
        setTimeout(() => {
          closeModalBtn.classList.remove("opacity-0");
        }, 50);
      }

      // 5-second wait to auto-close after button appears
      breakAutoCloseTimeout = setTimeout(() => {
        closeBreakModal();
      }, 5000);
      
    }, 10000);
  }

  function closeBreakModal() {
    clearTimeout(breakShowCloseBtnTimeout);
    clearTimeout(breakAutoCloseTimeout);
    
    if (breakModal) breakModal.classList.add("hidden");
    
    // Resume timer logic
    startTimer();
  }

  if (closeModalBtn) {
    closeModalBtn.addEventListener("click", closeBreakModal);
  }

  // Break Modal Accordion Logic
  accordionItems.forEach(item => {
    item.addEventListener("click", () => {
      const content = item.querySelector(".accordion-content");
      const icon = item.querySelector(".accordion-icon");
      
      if (content.classList.contains("hidden")) {
        // Open
        content.classList.remove("hidden");
        content.classList.add("flex");
        if (icon) {
          icon.classList.remove("fa-chevron-down");
          icon.classList.add("fa-chevron-up");
        }
      } else {
        // Close
        content.classList.add("hidden");
        content.classList.remove("flex");
        if (icon) {
          icon.classList.add("fa-chevron-down");
          icon.classList.remove("fa-chevron-up");
        }
      }
    });
  });

  // --- Click Event Listeners ---

  // Digit displays edit triggers
  hoursDisplay.addEventListener("click", () =>
    makeEditable(hoursDisplay, "hours"),
  );
  minutesDisplay.addEventListener("click", () =>
    makeEditable(minutesDisplay, "minutes"),
  );
  secondsDisplay.addEventListener("click", () =>
    makeEditable(secondsDisplay, "seconds"),
  );

  // Play/Pause button toggle
  startBtn.addEventListener("click", () => {
    if (isRunning) {
      pauseTimer();
    } else {
      startTimer();
    }
  });

  // Reset button
  resetBtn.addEventListener("click", () => {
    resetTimer();
  });

  // Hours adjustment (now caps at 59 and wraps to 0)
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

  // Minutes adjustment (caps at 59 and wraps to 0)
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

  // Seconds adjustment (caps at 59 and wraps to 0)
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

  // --- Mobile Menu Toggle ---
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

    // Close menu when clicking outside of navbar
    document.addEventListener("click", (e) => {
      if (!menuToggle.contains(e.target) && !mobileMenu.contains(e.target)) {
        mobileMenu.classList.add("hidden");
        const icon = menuToggle.querySelector("i");
        if (icon) icon.className = "fa-solid fa-bars fa-xl";
      }
    });
  }

  // Initialize hover/pointer visual states
  setControlsEnabled(true);

  // --- Initial Render ---
  updateDisplay();
});
