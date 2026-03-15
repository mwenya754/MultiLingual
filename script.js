/* =============================================================
   MultiLingual Translation App – script.js
   ============================================================= */

(function () {
  "use strict";

  /* ----------------------------------------------------------
     DOM references
     ---------------------------------------------------------- */
  const sourceLangSelect = document.getElementById("sourceLang");
  const targetLangSelect = document.getElementById("targetLang");
  const switchBtn        = document.getElementById("switchBtn");
  const sourceTextArea   = document.getElementById("sourceText");
  const translatedDiv    = document.getElementById("translatedText");
  const charCountEl      = document.getElementById("charCount");
  const translateBtn     = document.getElementById("translateBtn");
  const listenSourceBtn  = document.getElementById("listenSource");
  const copySourceBtn    = document.getElementById("copySource");
  const listenTransBtn   = document.getElementById("listenTranslated");
  const copyTransBtn     = document.getElementById("copyTranslated");
  const loadingEl        = document.getElementById("loadingIndicator");
  const errorEl          = document.getElementById("errorMessage");
  const detectedLangEl   = document.getElementById("detectedLang");
  const darkModeToggle   = document.getElementById("darkModeToggle");

  const API_URL    = "https://api.mymemory.translated.net/get";
  const MAX_CHARS  = 500;
  const DEBOUNCE_MS = 600;

  let currentTranslation = "";
  let debounceTimer      = null;
  let isSpeaking         = false;

  /* ----------------------------------------------------------
     Language display names
     ---------------------------------------------------------- */
  const LANG_NAMES = {
    auto: "Detected",
    en: "English",
    fr: "French",
    es: "Spanish",
    de: "German",
    it: "Italian",
    pt: "Portuguese",
    zh: "Chinese",
    ja: "Japanese",
    ar: "Arabic",
    ru: "Russian",
  };

  /* ----------------------------------------------------------
     Dark mode
     ---------------------------------------------------------- */
  function applyDarkMode(isDark) {
    document.body.classList.toggle("dark", isDark);
    darkModeToggle.innerHTML = isDark
      ? '<i class="fa-solid fa-sun"></i>'
      : '<i class="fa-solid fa-moon"></i>';
    darkModeToggle.title = isDark ? "Switch to light mode" : "Switch to dark mode";
  }

  const savedTheme = localStorage.getItem("theme");
  if (savedTheme === "dark" || (!savedTheme && window.matchMedia("(prefers-color-scheme: dark)").matches)) {
    applyDarkMode(true);
  }

  darkModeToggle.addEventListener("click", () => {
    const isDark = !document.body.classList.contains("dark");
    applyDarkMode(isDark);
    localStorage.setItem("theme", isDark ? "dark" : "light");
  });

  /* ----------------------------------------------------------
     Character counter
     ---------------------------------------------------------- */
  function updateCharCount() {
    const len = sourceTextArea.value.length;
    charCountEl.textContent = len;
    charCountEl.parentElement.classList.toggle("over-limit", len > MAX_CHARS);
  }

  /* ----------------------------------------------------------
     Show / hide helpers
     ---------------------------------------------------------- */
  function showLoading(visible) {
    loadingEl.hidden = !visible;
    if (visible) {
      translatedDiv.style.opacity = "0.3";
      errorEl.hidden = true;
    } else {
      translatedDiv.style.opacity = "1";
    }
  }

  function showError(msg) {
    errorEl.textContent = msg;
    errorEl.hidden = false;
  }

  function clearError() {
    errorEl.hidden = true;
  }

  /* ----------------------------------------------------------
     Core translation function
     ---------------------------------------------------------- */
  async function translate() {
    const text = sourceTextArea.value.trim();
    if (!text) {
      translatedDiv.innerHTML = '<span class="placeholder-text">Translation will appear here…</span>';
      currentTranslation = "";
      detectedLangEl.textContent = "";
      return;
    }

    const srcLang = sourceLangSelect.value;
    const tgtLang = targetLangSelect.value;

    if (srcLang !== "auto" && srcLang === tgtLang) {
      currentTranslation = text;
      translatedDiv.textContent = text;
      detectedLangEl.textContent = "";
      return;
    }

    const langpair = srcLang === "auto" ? `autodetect|${tgtLang}` : `${srcLang}|${tgtLang}`;

    showLoading(true);
    clearError();
    translateBtn.disabled = true;

    try {
      const response = await fetch(
        `${API_URL}?q=${encodeURIComponent(text)}&langpair=${encodeURIComponent(langpair)}`
      );

      if (!response.ok) {
        throw new Error(`HTTP error: ${response.status}`);
      }

      const data = await response.json();

      if (data.responseStatus === 200 || data.responseStatus === "200") {
        currentTranslation = data.responseData.translatedText;
        translatedDiv.textContent = currentTranslation;

        // Show detected language
        if (srcLang === "auto" && data.matches && data.matches.length > 0) {
          const detected = data.matches[0].from || "";
          if (detected) {
            const detectedName = LANG_NAMES[detected.toLowerCase()] || detected.toUpperCase();
            detectedLangEl.textContent = `Detected: ${detectedName}`;
          }
        } else {
          detectedLangEl.textContent = "";
        }
      } else {
        throw new Error(data.responseDetails || "Translation failed. Please try again.");
      }
    } catch (err) {
      showError(err.message || "An error occurred. Please check your connection and try again.");
      currentTranslation = "";
    } finally {
      showLoading(false);
      translateBtn.disabled = false;
    }
  }

  /* ----------------------------------------------------------
     Debounced auto-translate
     ---------------------------------------------------------- */
  function scheduleTranslation() {
    clearTimeout(debounceTimer);
    debounceTimer = setTimeout(translate, DEBOUNCE_MS);
  }

  /* ----------------------------------------------------------
     Switch languages
     ---------------------------------------------------------- */
  switchBtn.addEventListener("click", () => {
    const srcVal = sourceLangSelect.value;
    const tgtVal = targetLangSelect.value;

    // Cannot swap "auto detect" to target
    if (srcVal === "auto") {
      sourceLangSelect.value = tgtVal;
      targetLangSelect.value = "en";
    } else {
      sourceLangSelect.value = tgtVal;
      targetLangSelect.value = srcVal;
    }

    // Swap displayed text
    const srcText = sourceTextArea.value;
    sourceTextArea.value = currentTranslation;
    currentTranslation = srcText;
    translatedDiv.textContent = currentTranslation || "";
    if (!currentTranslation) {
      translatedDiv.innerHTML = '<span class="placeholder-text">Translation will appear here…</span>';
    }

    updateCharCount();
    scheduleTranslation();
  });

  /* ----------------------------------------------------------
     Text-to-Speech
     ---------------------------------------------------------- */
  function speak(text, lang) {
    if (!window.speechSynthesis) {
      alert("Text-to-Speech is not supported in your browser.");
      return;
    }
    if (isSpeaking) {
      window.speechSynthesis.cancel();
      isSpeaking = false;
      return;
    }
    if (!text || !text.trim()) return;

    const utterance = new SpeechSynthesisUtterance(text);
    // Map language codes to BCP-47 tags
    const bcp47 = {
      en: "en-US", fr: "fr-FR", es: "es-ES", de: "de-DE",
      it: "it-IT", pt: "pt-PT", zh: "zh-CN", ja: "ja-JP",
      ar: "ar-SA", ru: "ru-RU",
    };
    utterance.lang = bcp47[lang] || lang;
    utterance.rate = 0.95;
    utterance.onend = () => { isSpeaking = false; };
    utterance.onerror = () => { isSpeaking = false; };
    isSpeaking = true;
    window.speechSynthesis.speak(utterance);
  }

  listenSourceBtn.addEventListener("click", () => {
    speak(sourceTextArea.value, sourceLangSelect.value === "auto" ? "en" : sourceLangSelect.value);
  });

  listenTransBtn.addEventListener("click", () => {
    speak(currentTranslation, targetLangSelect.value);
  });

  /* ----------------------------------------------------------
     Copy to clipboard
     ---------------------------------------------------------- */
  function copyText(text, btn) {
    if (!text || !text.trim()) return;
    navigator.clipboard.writeText(text).then(() => {
      btn.classList.add("copied");
      btn.innerHTML = '<i class="fa-solid fa-check"></i>';
      setTimeout(() => {
        btn.classList.remove("copied");
        btn.innerHTML = '<i class="fa-regular fa-copy"></i>';
      }, 1800);
    }).catch(() => {
      // Fallback for older browsers
      const ta = document.createElement("textarea");
      ta.value = text;
      ta.style.position = "fixed";
      ta.style.opacity = "0";
      document.body.appendChild(ta);
      ta.select();
      document.execCommand("copy");
      document.body.removeChild(ta);
      btn.classList.add("copied");
      btn.innerHTML = '<i class="fa-solid fa-check"></i>';
      setTimeout(() => {
        btn.classList.remove("copied");
        btn.innerHTML = '<i class="fa-regular fa-copy"></i>';
      }, 1800);
    });
  }

  copySourceBtn.addEventListener("click", () => copyText(sourceTextArea.value, copySourceBtn));
  copyTransBtn.addEventListener("click", () => copyText(currentTranslation, copyTransBtn));

  /* ----------------------------------------------------------
     Event listeners
     ---------------------------------------------------------- */
  sourceTextArea.addEventListener("input", () => {
    updateCharCount();
    scheduleTranslation();
  });

  translateBtn.addEventListener("click", () => {
    clearTimeout(debounceTimer);
    translate();
  });

  sourceLangSelect.addEventListener("change", scheduleTranslation);
  targetLangSelect.addEventListener("change", scheduleTranslation);

  /* ----------------------------------------------------------
     Initial page load translation
     ---------------------------------------------------------- */
  updateCharCount();
  translate();
})();
