/**
 * VoxLingo — PDF to Audio Converter, AI Summarizer & Multilingual Translator
 * Complete Frontend Application Logic
 */

(function () {
  'use strict';

  // Application State
  const state = {
    sourceText: '',
    translatedText: '',
    sourceLang: 'auto',
    targetLang: 'es',
    totalPages: 1,
    pagesData: [],
    currentPageFilter: 'all',
    filename: '',
    fileSize: 0,
    editorFontSize: 15, // in pixels
    
    // Playback State
    playbackEngine: 'browser', // 'browser' | 'server'
    activeAudioSource: 'translated', // 'source' | 'translated'
    isPlaying: false,
    isPaused: false,
    playbackRate: 1.0,
    voicePitch: 1.0,
    volume: 1.0,
    selectedVoiceURI: '',
    availableVoices: [],
    isLoopingSentence: false,
    
    // Sleep Timer
    sleepTimerId: null,
    sleepTimerSecondsLeft: 0,
    sleepTimerInterval: null,
    
    // Karaoke Tracker State
    sentences: [],
    currentSentenceIndex: 0,
    utterance: null,
    
    // Voice Recognition (Dictation)
    recognition: null,
    isDictating: false,
    
    // AI Summary State
    summaryData: null,
    
    // Server MP3 Audio Element
    nativeAudio: null,
  };

  // DOM Elements Cache
  const elements = {
    // Navigation & Global Controls
    btnThemeToggle: document.getElementById('btn-theme-toggle'),
    btnSamplePdf: document.getElementById('btn-sample-pdf'),
    btnHistoryToggle: document.getElementById('btn-history-toggle'),
    btnZenMode: document.getElementById('btn-zen-mode'),
    btnInfoModal: document.getElementById('btn-info-modal'),
    step1Badge: document.getElementById('step-1-badge'),
    step2Badge: document.getElementById('step-2-badge'),
    step3Badge: document.getElementById('step-3-badge'),
    stepLine1: document.getElementById('step-line-1'),
    stepLine2: document.getElementById('step-line-2'),

    // Ingestion Tabs & Dropzone
    tabUploadPdf: document.getElementById('tab-upload-pdf'),
    tabDirectText: document.getElementById('tab-direct-text'),
    tabContentPdf: document.getElementById('tab-content-pdf'),
    tabContentText: document.getElementById('tab-content-text'),
    pdfDropzone: document.getElementById('pdf-dropzone'),
    pdfFileInput: document.getElementById('pdf-file-input'),
    btnBrowseTrigger: document.getElementById('btn-browse-trigger'),
    uploadProgressOverlay: document.getElementById('upload-progress-overlay'),
    progressText: document.getElementById('progress-text'),
    progressBarFill: document.getElementById('progress-bar-fill'),
    directTextInput: document.getElementById('direct-text-input'),
    btnLoadText: document.getElementById('btn-load-text'),
    btnDictateMic: document.getElementById('btn-dictate-mic'),
    dictateBtnLabel: document.getElementById('dictate-btn-label'),
    dictationBanner: document.getElementById('dictation-banner'),
    dictationStatusText: document.getElementById('dictation-status-text'),
    btnStopDictation: document.getElementById('btn-stop-dictation'),
    fileStatusChip: document.getElementById('file-status-chip'),
    fileStatusText: document.getElementById('file-status-text'),

    // File Info Badge
    fileInfoBadge: document.getElementById('file-info-badge'),
    badgeFilename: document.getElementById('badge-filename'),
    badgeFilesize: document.getElementById('badge-filesize'),
    badgePages: document.getElementById('badge-pages'),
    badgeWords: document.getElementById('badge-words'),
    badgeChars: document.getElementById('badge-chars'),
    badgeTime: document.getElementById('badge-time'),

    // Source Editor Panel
    sourceTextBox: document.getElementById('source-text-box'),
    sourceLangLabel: document.getElementById('source-lang-label'),
    sourcePageFilter: document.getElementById('source-page-filter'),
    btnSummarizeDoc: document.getElementById('btn-summarize-doc'),
    btnToggleSearchSource: document.getElementById('btn-toggle-search-source'),
    sourceSearchBar: document.getElementById('source-search-bar'),
    sourceSearchInput: document.getElementById('source-search-input'),
    sourceSearchCount: document.getElementById('source-search-count'),
    btnCloseSearchSource: document.getElementById('btn-close-search-source'),
    btnFontSmaller: document.getElementById('btn-font-smaller'),
    btnFontLarger: document.getElementById('btn-font-larger'),
    btnCopySource: document.getElementById('btn-copy-source'),
    btnClearSource: document.getElementById('btn-clear-source'),
    btnPlaySource: document.getElementById('btn-play-source'),
    sourceCounter: document.getElementById('source-counter'),

    // Center Action Pillar
    targetLangSelect: document.getElementById('target-lang-select'),
    targetFlag: document.getElementById('target-flag'),
    btnTranslateTrigger: document.getElementById('btn-translate-trigger'),
    translateBtnText: document.getElementById('translate-btn-text'),
    translateSpinner: document.getElementById('translate-spinner'),
    popularChips: document.querySelectorAll('.lang-chip'),

    // Translated Editor Panel
    translatedTextBox: document.getElementById('translated-text-box'),
    targetLangSub: document.getElementById('target-lang-sub'),
    btnToggleSearchTarget: document.getElementById('btn-toggle-search-target'),
    targetSearchBar: document.getElementById('target-search-bar'),
    targetSearchInput: document.getElementById('target-search-input'),
    targetSearchCount: document.getElementById('target-search-count'),
    btnCloseSearchTarget: document.getElementById('btn-close-search-target'),
    btnCopyTranslated: document.getElementById('btn-copy-translated'),
    btnExportDropdown: document.getElementById('btn-export-dropdown'),
    exportDropdownMenu: document.getElementById('export-dropdown-menu'),
    btnDownloadTxt: document.getElementById('btn-download-txt'),
    btnDownloadSrt: document.getElementById('btn-download-srt'),
    btnDownloadBilingual: document.getElementById('btn-download-bilingual'),
    btnPlayTranslated: document.getElementById('btn-play-translated'),
    targetCounter: document.getElementById('target-counter'),

    // AI Summary Card / Drawer
    summaryCard: document.getElementById('summary-card'),
    summaryReductionBadge: document.getElementById('summary-reduction-badge'),
    summaryExecText: document.getElementById('summary-exec-text'),
    summaryPointsList: document.getElementById('summary-points-list'),
    summaryKeywordsContainer: document.getElementById('summary-keywords-container'),
    btnSpeakSummary: document.getElementById('btn-speak-summary'),
    btnTranslateSummary: document.getElementById('btn-translate-summary'),
    btnCloseSummary: document.getElementById('btn-close-summary'),

    // Audio Studio
    audioStudioSection: document.getElementById('audio-studio-section'),
    equalizerIcon: document.getElementById('equalizer-icon'),
    nowPlayingLabel: document.getElementById('now-playing-label'),
    modeBrowserSpeech: document.getElementById('mode-browser-speech'),
    modeServerMp3: document.getElementById('mode-server-mp3'),
    waveformCanvas: document.getElementById('waveform-canvas'),
    currentSpokenText: document.getElementById('current-spoken-text'),
    timeCurrent: document.getElementById('time-current'),
    timeDuration: document.getElementById('time-duration'),
    scrubBarProgress: document.getElementById('scrub-bar-progress'),
    audioProgressSlider: document.getElementById('audio-progress-slider'),
    voiceSelect: document.getElementById('voice-select'),
    btnPlayPause: document.getElementById('btn-play-pause'),
    btnStop: document.getElementById('btn-stop'),
    btnSkipPrev: document.getElementById('btn-skip-prev'),
    btnSkipNext: document.getElementById('btn-skip-next'),
    btnLoopSentence: document.getElementById('btn-loop-sentence'),
    rateSlider: document.getElementById('rate-slider'),
    speedVal: document.getElementById('speed-val'),
    speedChips: document.querySelectorAll('.speed-chip'),
    pitchSlider: document.getElementById('pitch-slider'),
    pitchVal: document.getElementById('pitch-val'),
    volumeSlider: document.getElementById('volume-slider'),
    volumeVal: document.getElementById('volume-val'),
    btnMuteToggle: document.getElementById('btn-mute-toggle'),
    sleepTimerSelect: document.getElementById('sleep-timer-select'),
    sleepTimerBadge: document.getElementById('sleep-timer-badge'),
    btnDownloadMp3: document.getElementById('btn-download-mp3'),
    nativeAudioPlayer: document.getElementById('native-audio-player'),

    // History Modal
    historyModalOverlay: document.getElementById('history-modal-overlay'),
    historyItemsContainer: document.getElementById('history-items-container'),
    btnCloseHistory: document.getElementById('btn-close-history'),
    btnClearHistory: document.getElementById('btn-clear-history'),

    // Toast Container
    toastContainer: document.getElementById('toast-container'),
  };

  // -------------------------------------------------------------
  // INITIALIZATION
  // -------------------------------------------------------------
  async function init() {
    loadThemePreference();
    setupEventListeners();
    await loadLanguagesList();
    initSpeechSynthesisVoices();
    initWaveformCanvas();
    initSpeechRecognition();
    updateUIState();
  }

  // -------------------------------------------------------------
  // THEME & VIEWPORT MANAGEMENT
  // -------------------------------------------------------------
  function loadThemePreference() {
    const savedTheme = localStorage.getItem('voxlingo_theme');
    if (savedTheme === 'light') {
      document.body.classList.remove('dark-theme');
      document.body.classList.add('light-theme');
    } else {
      document.body.classList.add('dark-theme');
      document.body.classList.remove('light-theme');
    }
  }

  function toggleTheme() {
    const isDark = document.body.classList.contains('dark-theme');
    if (isDark) {
      document.body.classList.remove('dark-theme');
      document.body.classList.add('light-theme');
      localStorage.setItem('voxlingo_theme', 'light');
      showToast('Switched to daylight theme', 'info');
    } else {
      document.body.classList.add('dark-theme');
      document.body.classList.remove('light-theme');
      localStorage.setItem('voxlingo_theme', 'dark');
      showToast('Switched to cyber dark theme', 'info');
    }
  }

  function toggleZenMode() {
    const isZen = document.body.classList.toggle('zen-mode');
    if (isZen) {
      showToast('Entered Zen Focus Reader mode (Press Esc to exit)', 'info');
    } else {
      showToast('Exited Zen Focus mode', 'info');
    }
  }

  // -------------------------------------------------------------
  // LANGUAGES LIST & DROPDOWN
  // -------------------------------------------------------------
  let languagesList = [];

  async function loadLanguagesList() {
    try {
      const response = await fetch('/api/languages');
      const data = await response.json();
      if (data.success && Array.isArray(data.languages)) {
        languagesList = data.languages;
        populateLanguageDropdown(data.languages);
      }
    } catch (err) {
      console.warn('Failed to load languages from backend, using fallback list:', err);
      languagesList = [
        { code: 'en', name: 'English', native: 'English', flag: '🇺🇸' },
        { code: 'es', name: 'Spanish', native: 'Español', flag: '🇪🇸' },
        { code: 'fr', name: 'French', native: 'Français', flag: '🇫🇷' },
        { code: 'de', name: 'German', native: 'Deutsch', flag: '🇩🇪' },
        { code: 'hi', name: 'Hindi', native: 'हिन्दी', flag: '🇮🇳' },
        { code: 'zh-CN', name: 'Chinese (Simplified)', native: '简体中文', flag: '🇨🇳' },
        { code: 'ja', name: 'Japanese', native: '日本語', flag: '🇯🇵' },
        { code: 'ko', name: 'Korean', native: '한국어', flag: '🇰🇷' },
        { code: 'it', name: 'Italian', native: 'Italiano', flag: '🇮🇹' },
        { code: 'pt', name: 'Portuguese', native: 'Português', flag: '🇵🇹' },
        { code: 'ru', name: 'Russian', native: 'Русский', flag: '🇷🇺' },
        { code: 'ar', name: 'Arabic', native: 'العربية', flag: '🇸🇦' },
        { code: 'bn', name: 'Bengali', native: 'বাংলা', flag: '🇧🇩' },
        { code: 'te', name: 'Telugu', native: 'తెలుగు', flag: '🇮🇳' },
        { code: 'ta', name: 'Tamil', native: 'தமிழ்', flag: '🇮🇳' },
        { code: 'id', name: 'Indonesian', native: 'Bahasa Indonesia', flag: '🇮🇩' },
        { code: 'tr', name: 'Turkish', native: 'Türkçe', flag: '🇹🇷' },
        { code: 'vi', name: 'Vietnamese', native: 'Tiếng Việt', flag: '🇻🇳' },
        { code: 'tl', name: 'Filipino (Tagalog)', native: 'Tagalog', flag: '🇵🇭' },
        { code: 'nl', name: 'Dutch', native: 'Nederlands', flag: '🇳🇱' },
        { code: 'pl', name: 'Polish', native: 'Polski', flag: '🇵🇱' },
      ];
      populateLanguageDropdown(languagesList);
    }
  }

  function populateLanguageDropdown(langs) {
    elements.targetLangSelect.innerHTML = '';
    langs.forEach(lang => {
      const opt = document.createElement('option');
      opt.value = lang.code;
      opt.textContent = `${lang.flag || '🌐'} ${lang.name} (${lang.native || lang.name})`;
      if (lang.code === state.targetLang) {
        opt.selected = true;
      }
      elements.targetLangSelect.appendChild(opt);
    });
    updateLanguageFlag();
  }

  function updateLanguageFlag() {
    const selected = languagesList.find(l => l.code === state.targetLang);
    if (selected) {
      elements.targetFlag.textContent = selected.flag || '🌐';
      elements.targetLangSub.textContent = `Target: ${selected.name} (${selected.native || selected.name})`;
    }
  }

  // -------------------------------------------------------------
  // SPEECH RECOGNITION (VOICE DICTATION)
  // -------------------------------------------------------------
  function initSpeechRecognition() {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      if (elements.btnDictateMic) {
        elements.btnDictateMic.title = 'Voice dictation is not supported in this browser.';
        elements.btnDictateMic.style.opacity = '0.6';
      }
      return;
    }

    state.recognition = new SpeechRecognition();
    state.recognition.continuous = true;
    state.recognition.interimResults = true;
    state.recognition.lang = state.sourceLang !== 'auto' ? state.sourceLang : 'en-US';

    state.recognition.onstart = () => {
      state.isDictating = true;
      elements.dictateBtnLabel.textContent = 'Recording...';
      elements.dictationBanner.style.display = 'flex';
      elements.btnDictateMic.classList.add('btn-primary');
      showToast('Microphone active. Start speaking...', 'info');
    };

    state.recognition.onresult = (event) => {
      let finalTranscript = '';
      for (let i = event.resultIndex; i < event.results.length; ++i) {
        if (event.results[i].isFinal) {
          finalTranscript += event.results[i][0].transcript + ' ';
        }
      }

      if (finalTranscript) {
        const currentVal = elements.directTextInput.value;
        elements.directTextInput.value = (currentVal ? currentVal + ' ' : '') + finalTranscript.trim();
        elements.sourceTextBox.innerText = elements.directTextInput.value;
        state.sourceText = elements.sourceTextBox.innerText;
        updateTextCounters();
      }
    };

    state.recognition.onerror = (e) => {
      console.warn('Speech recognition error:', e.error);
      stopDictation();
      showToast('Microphone error: ' + (e.error || 'Check browser permissions'), 'error');
    };

    state.recognition.onend = () => {
      stopDictation();
    };
  }

  function toggleDictation() {
    if (!state.recognition) {
      showToast('Speech Recognition API is not supported in this browser (Chrome / Edge recommended).', 'info');
      return;
    }

    if (state.isDictating) {
      state.recognition.stop();
      stopDictation();
    } else {
      switchIngestionTab('text');
      try {
        state.recognition.start();
      } catch (err) {
        console.warn('Recognition start error:', err);
      }
    }
  }

  function stopDictation() {
    state.isDictating = false;
    elements.dictateBtnLabel.textContent = 'Voice Dictation';
    elements.dictationBanner.style.display = 'none';
    elements.btnDictateMic.classList.remove('btn-primary');
  }

  // -------------------------------------------------------------
  // SPEECH SYNTHESIS & VOICES
  // -------------------------------------------------------------
  function initSpeechSynthesisVoices() {
    if (!('speechSynthesis' in window)) {
      showToast('Web Speech API is not supported in this browser. MP3 server mode will be used.', 'info');
      setPlaybackEngine('server');
      return;
    }

    const loadVoices = () => {
      state.availableVoices = window.speechSynthesis.getVoices();
      filterVoicesForTargetLanguage();
    };

    loadVoices();
    if (window.speechSynthesis.onvoiceschanged !== undefined) {
      window.speechSynthesis.onvoiceschanged = loadVoices;
    }
  }

  function filterVoicesForTargetLanguage() {
    elements.voiceSelect.innerHTML = '';
    const targetCode = state.activeAudioSource === 'source' ? (state.sourceLang || 'en') : state.targetLang;
    const baseCode = (targetCode || 'en').split('-')[0].toLowerCase();

    if (!state.availableVoices || state.availableVoices.length === 0) {
      const opt = document.createElement('option');
      opt.value = '';
      opt.textContent = 'Default System Voice';
      elements.voiceSelect.appendChild(opt);
      return;
    }

    const matchingVoices = state.availableVoices.filter(v => {
      const lang = (v.lang || '').toLowerCase();
      return lang.startsWith(baseCode) || lang.replace('_', '-').startsWith(targetCode.toLowerCase());
    });

    const otherVoices = state.availableVoices.filter(v => !matchingVoices.includes(v));
    let selectedFound = false;

    const createVoiceOption = (voice, isDefaultTarget = false) => {
      const opt = document.createElement('option');
      opt.value = voice.voiceURI;
      opt.textContent = `${voice.name} (${voice.lang})${voice.default ? ' — System Default' : ''}`;
      if (voice.voiceURI === state.selectedVoiceURI) {
        opt.selected = true;
        selectedFound = true;
      } else if (!state.selectedVoiceURI && isDefaultTarget) {
        opt.selected = true;
        state.selectedVoiceURI = voice.voiceURI;
        selectedFound = true;
      }
      return opt;
    };

    if (matchingVoices.length > 0) {
      const matchGroup = document.createElement('optgroup');
      matchGroup.label = `✨ Recommended for ${targetCode.toUpperCase()} (${matchingVoices.length} voices)`;
      matchingVoices.forEach((voice, index) => {
        matchGroup.appendChild(createVoiceOption(voice, index === 0));
      });
      elements.voiceSelect.appendChild(matchGroup);

      if (otherVoices.length > 0) {
        const otherGroup = document.createElement('optgroup');
        otherGroup.label = `🌐 Other Available Voices (${otherVoices.length})`;
        otherVoices.forEach(voice => {
          otherGroup.appendChild(createVoiceOption(voice, false));
        });
        elements.voiceSelect.appendChild(otherGroup);
      }
    } else {
      const allGroup = document.createElement('optgroup');
      allGroup.label = `🌐 All Available System Voices (${state.availableVoices.length})`;
      state.availableVoices.forEach((voice, index) => {
        allGroup.appendChild(createVoiceOption(voice, index === 0));
      });
      elements.voiceSelect.appendChild(allGroup);
    }

    if (!selectedFound && elements.voiceSelect.options.length > 0) {
      elements.voiceSelect.selectedIndex = 0;
      state.selectedVoiceURI = elements.voiceSelect.value;
    }
  }

  // -------------------------------------------------------------
  // EVENT LISTENERS SETUP
  // -------------------------------------------------------------
  function setupEventListeners() {
    // Theme & Navigation
    elements.btnThemeToggle.addEventListener('click', toggleTheme);
    elements.btnZenMode.addEventListener('click', toggleZenMode);
    elements.btnHistoryToggle.addEventListener('click', openHistoryModal);
    elements.btnCloseHistory.addEventListener('click', closeHistoryModal);
    elements.btnClearHistory.addEventListener('click', clearSessionHistory);
    elements.historyModalOverlay.addEventListener('click', (e) => {
      if (e.target === elements.historyModalOverlay) closeHistoryModal();
    });

    // Tab switching
    elements.tabUploadPdf.addEventListener('click', () => switchIngestionTab('pdf'));
    elements.tabDirectText.addEventListener('click', () => switchIngestionTab('text'));

    // Dropzone events
    elements.btnBrowseTrigger.addEventListener('click', e => {
      e.stopPropagation();
      elements.pdfFileInput.click();
    });

    elements.pdfDropzone.addEventListener('click', () => {
      elements.pdfFileInput.click();
    });

    elements.pdfFileInput.addEventListener('change', handleFileInputChange);

    // Drag and Drop
    ['dragenter', 'dragover'].forEach(eventName => {
      elements.pdfDropzone.addEventListener(eventName, e => {
        e.preventDefault();
        e.stopPropagation();
        elements.pdfDropzone.classList.add('dragover');
      });
    });

    ['dragleave', 'drop'].forEach(eventName => {
      elements.pdfDropzone.addEventListener(eventName, e => {
        e.preventDefault();
        e.stopPropagation();
        elements.pdfDropzone.classList.remove('dragover');
      });
    });

    elements.pdfDropzone.addEventListener('drop', handleFileDrop);

    // Direct text load & Dictation
    elements.btnLoadText.addEventListener('click', handleDirectTextLoad);
    elements.btnDictateMic.addEventListener('click', toggleDictation);
    elements.btnStopDictation.addEventListener('click', () => {
      if (state.recognition) state.recognition.stop();
      stopDictation();
    });

    // Sample PDF
    elements.btnSamplePdf.addEventListener('click', loadSamplePdf);

    // Text editors live typing
    elements.sourceTextBox.addEventListener('input', () => {
      state.sourceText = elements.sourceTextBox.innerText;
      updateTextCounters();
    });

    elements.translatedTextBox.addEventListener('input', () => {
      state.translatedText = elements.translatedTextBox.innerText;
      updateTextCounters();
    });

    // Page filter
    elements.sourcePageFilter.addEventListener('change', handlePageFilterChange);

    // Copy & Clear
    elements.btnCopySource.addEventListener('click', () => copyToClipboard(elements.sourceTextBox.innerText, 'Original text copied!'));
    elements.btnCopyTranslated.addEventListener('click', () => copyToClipboard(elements.translatedTextBox.innerText, 'Translated text copied!'));
    elements.btnClearSource.addEventListener('click', clearSourceText);

    // AI Summarizer actions
    elements.btnSummarizeDoc.addEventListener('click', handleSummarizeDocument);
    elements.btnSpeakSummary.addEventListener('click', handleSpeakSummary);
    elements.btnTranslateSummary.addEventListener('click', handleTranslateSummary);
    elements.btnCloseSummary.addEventListener('click', () => {
      elements.summaryCard.style.display = 'none';
    });

    // In-Text Search Source & Target
    elements.btnToggleSearchSource.addEventListener('click', () => toggleSearchBar('source'));
    elements.btnCloseSearchSource.addEventListener('click', () => closeSearchBar('source'));
    elements.sourceSearchInput.addEventListener('input', (e) => executeSearch('source', e.target.value));

    elements.btnToggleSearchTarget.addEventListener('click', () => toggleSearchBar('target'));
    elements.btnCloseSearchTarget.addEventListener('click', () => closeSearchBar('target'));
    elements.targetSearchInput.addEventListener('input', (e) => executeSearch('target', e.target.value));

    // Font size controls
    elements.btnFontSmaller.addEventListener('click', () => adjustFontSize(-1.5));
    elements.btnFontLarger.addEventListener('click', () => adjustFontSize(1.5));

    // Export Dropdown menu
    elements.btnExportDropdown.addEventListener('click', (e) => {
      e.stopPropagation();
      elements.exportDropdownMenu.classList.toggle('show');
    });

    document.addEventListener('click', () => {
      elements.exportDropdownMenu.classList.remove('show');
    });

    elements.btnDownloadTxt.addEventListener('click', downloadTranslatedText);
    elements.btnDownloadSrt.addEventListener('click', downloadSubtitlesSrt);
    elements.btnDownloadBilingual.addEventListener('click', downloadBilingualDocument);

    // Popular Language Chips
    elements.popularChips.forEach(chip => {
      chip.addEventListener('click', () => {
        const code = chip.dataset.code;
        state.targetLang = code;
        elements.targetLangSelect.value = code;
        updateLanguageFlag();
        filterVoicesForTargetLanguage();
        showToast(`Target set to ${getLanguageName(code)}`, 'info');
      });
    });

    // Translation controls
    elements.targetLangSelect.addEventListener('change', e => {
      state.targetLang = e.target.value;
      updateLanguageFlag();
      filterVoicesForTargetLanguage();
    });

    elements.btnTranslateTrigger.addEventListener('click', triggerTranslation);

    // Audio Playback Triggers from editors
    elements.btnPlaySource.addEventListener('click', () => {
      state.activeAudioSource = 'source';
      filterVoicesForTargetLanguage();
      startPlayback();
    });

    elements.btnPlayTranslated.addEventListener('click', () => {
      state.activeAudioSource = 'translated';
      filterVoicesForTargetLanguage();
      startPlayback();
    });

    // Player Deck controls
    elements.btnPlayPause.addEventListener('click', togglePlayPause);
    elements.btnStop.addEventListener('click', stopPlayback);
    elements.btnSkipPrev.addEventListener('click', skipSentenceBackward);
    elements.btnSkipNext.addEventListener('click', skipSentenceForward);
    elements.btnLoopSentence.addEventListener('click', toggleLoopSentence);

    // Voice Selector
    elements.voiceSelect.addEventListener('change', e => {
      state.selectedVoiceURI = e.target.value;
      if (state.isPlaying) {
        stopPlayback();
        startPlayback();
      }
    });

    // Speed Slider & Quick Speed Chips
    elements.rateSlider.addEventListener('input', e => {
      setPlaybackSpeed(parseFloat(e.target.value));
    });

    elements.speedChips.forEach(chip => {
      chip.addEventListener('click', () => {
        const spd = parseFloat(chip.dataset.speed);
        setPlaybackSpeed(spd);
      });
    });

    // Pitch Slider
    elements.pitchSlider.addEventListener('input', e => {
      const val = parseFloat(e.target.value);
      state.voicePitch = val;
      elements.pitchVal.textContent = val.toFixed(1);
    });

    // Volume Slider
    elements.volumeSlider.addEventListener('input', e => {
      const val = parseFloat(e.target.value);
      state.volume = val;
      elements.volumeVal.textContent = `${Math.round(val * 100)}%`;
      if (state.nativeAudio) {
        state.nativeAudio.volume = val;
      }
    });

    elements.btnMuteToggle.addEventListener('click', toggleMute);

    // Sleep Timer
    elements.sleepTimerSelect.addEventListener('change', (e) => {
      setupSleepTimer(parseInt(e.target.value, 10));
    });

    // Download MP3 button
    elements.btnDownloadMp3.addEventListener('click', handleDownloadMp3);

    // Engine mode toggle
    elements.modeBrowserSpeech.addEventListener('click', () => setPlaybackEngine('browser'));
    elements.modeServerMp3.addEventListener('click', () => setPlaybackEngine('server'));

    // Audio Progress Slider
    elements.audioProgressSlider.addEventListener('input', handleTimelineScrub);

    // Keyboard shortcuts
    document.addEventListener('keydown', e => {
      if (e.target.tagName === 'TEXTAREA' || e.target.isContentEditable) return;
      if (e.code === 'Space') {
        e.preventDefault();
        togglePlayPause();
      } else if (e.code === 'Escape') {
        if (document.body.classList.contains('zen-mode')) {
          toggleZenMode();
        } else {
          stopPlayback();
        }
      }
    });
  }

  function switchIngestionTab(tab) {
    if (tab === 'pdf') {
      elements.tabUploadPdf.classList.add('active');
      elements.tabDirectText.classList.remove('active');
      elements.tabContentPdf.style.display = 'block';
      elements.tabContentText.style.display = 'none';
    } else {
      elements.tabDirectText.classList.add('active');
      elements.tabUploadPdf.classList.remove('active');
      elements.tabContentText.style.display = 'block';
      elements.tabContentPdf.style.display = 'none';
    }
  }

  // -------------------------------------------------------------
  // PDF PARSING & EXTRACT
  // -------------------------------------------------------------
  function handleFileInputChange(e) {
    const file = e.target.files && e.target.files[0];
    if (file) uploadAndParsePdf(file);
  }

  function handleFileDrop(e) {
    const file = e.dataTransfer.files && e.dataTransfer.files[0];
    if (file) {
      if (!file.name.toLowerCase().endsWith('.pdf') && file.type !== 'application/pdf') {
        showToast('Please drop a valid .PDF document', 'error');
        return;
      }
      uploadAndParsePdf(file);
    }
  }

  async function uploadAndParsePdf(file) {
    setExtractionLoading(true, `Reading and extracting ${file.name}...`);
    elements.fileStatusChip.querySelector('.status-dot').classList.add('busy');
    elements.fileStatusText.textContent = 'Parsing PDF...';

    const formData = new FormData();
    formData.append('pdf', file);

    try {
      const response = await fetch('/api/extract-pdf', {
        method: 'POST',
        body: formData,
      });

      const data = await response.json();
      if (!response.ok || !data.success) {
        throw new Error(data.error || 'Failed to parse PDF.');
      }

      // Update state
      state.filename = data.filename;
      state.fileSize = data.fileSize;
      state.sourceText = data.extractedText;
      state.totalPages = data.totalPages || 1;
      state.pagesData = data.pages || [];
      state.currentPageFilter = 'all';

      // Update UI elements
      elements.sourceTextBox.innerText = data.extractedText;
      displayFileInfo(data);
      populatePageFilter(data.pages);
      updateTextCounters();

      // Step indicator
      setStepActive(2);

      // Save to recent session history
      saveToSessionHistory({
        title: data.filename,
        sourceText: data.extractedText,
        wordCount: data.wordCount,
        totalPages: data.totalPages,
        date: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      });

      showToast(`Extracted ${data.wordCount.toLocaleString()} words across ${data.totalPages} page(s)`, 'success');
      elements.fileStatusChip.querySelector('.status-dot').classList.remove('busy');
      elements.fileStatusText.textContent = `Loaded: ${file.name}`;
    } catch (err) {
      console.error('Upload error:', err);
      showToast(err.message, 'error');
      elements.fileStatusChip.querySelector('.status-dot').classList.remove('busy');
      elements.fileStatusText.textContent = 'Extraction failed';
    } finally {
      setExtractionLoading(false);
      elements.pdfFileInput.value = '';
    }
  }

  function handleDirectTextLoad() {
    const text = elements.directTextInput.value.trim();
    if (!text) {
      showToast('Please type or dictate some text first', 'info');
      return;
    }

    state.filename = 'Manual Input';
    state.fileSize = text.length;
    state.sourceText = text;
    state.totalPages = 1;
    state.pagesData = [{ pageNumber: 1, text: text, wordCount: text.split(/\s+/).length }];
    state.currentPageFilter = 'all';

    elements.sourceTextBox.innerText = text;
    elements.sourcePageFilter.innerHTML = '<option value="all">Full Document</option>';

    const words = text.split(/\s+/).length;
    displayFileInfo({
      filename: 'Manual Input Note',
      fileSize: text.length,
      totalPages: 1,
      wordCount: words,
      charCount: text.length,
      estimatedReadingTime: `${Math.max(1, Math.ceil(words / 200))} min`,
    });

    updateTextCounters();
    setStepActive(2);

    saveToSessionHistory({
      title: 'Dictated / Notes Note',
      sourceText: text,
      wordCount: words,
      totalPages: 1,
      date: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    });

    showToast(`Loaded ${words} words into studio`, 'success');
  }

  async function loadSamplePdf() {
    setExtractionLoading(true, 'Fetching and loading Deep Space Exploration sample PDF...');
    elements.fileStatusChip.querySelector('.status-dot').classList.add('busy');
    elements.fileStatusText.textContent = 'Loading sample...';

    try {
      const sampleRes = await fetch('/api/sample-pdf');
      if (!sampleRes.ok) throw new Error('Could not fetch sample PDF');
      const blob = await sampleRes.blob();
      const sampleFile = new File([blob], 'Cosmic_Exploration_Sample.pdf', { type: 'application/pdf' });
      await uploadAndParsePdf(sampleFile);
    } catch (err) {
      console.error('Sample load error:', err);
      showToast('Could not load sample PDF: ' + err.message, 'error');
      setExtractionLoading(false);
    }
  }

  function setExtractionLoading(isLoading, message = 'Extracting...') {
    if (isLoading) {
      elements.uploadProgressOverlay.style.display = 'flex';
      elements.progressText.textContent = message;
    } else {
      elements.uploadProgressOverlay.style.display = 'none';
    }
  }

  function displayFileInfo(data) {
    elements.fileInfoBadge.style.display = 'flex';
    elements.badgeFilename.textContent = data.filename || 'Document';
    elements.badgeFilesize.textContent = formatBytes(data.fileSize || 0);
    elements.badgePages.textContent = data.totalPages || 1;
    elements.badgeWords.textContent = (data.wordCount || 0).toLocaleString();
    elements.badgeChars.textContent = (data.charCount || 0).toLocaleString();
    elements.badgeTime.textContent = data.estimatedReadingTime || '~1 min';
  }

  function populatePageFilter(pages) {
    elements.sourcePageFilter.innerHTML = '<option value="all">All Pages</option>';
    if (pages && pages.length > 1) {
      pages.forEach(p => {
        const opt = document.createElement('option');
        opt.value = p.pageNumber;
        opt.textContent = `Page ${p.pageNumber} (${p.wordCount} words)`;
        elements.sourcePageFilter.appendChild(opt);
      });
      elements.sourcePageFilter.style.display = 'inline-block';
    } else {
      elements.sourcePageFilter.style.display = 'none';
    }
  }

  function handlePageFilterChange(e) {
    const val = e.target.value;
    state.currentPageFilter = val;
    if (val === 'all') {
      elements.sourceTextBox.innerText = state.sourceText;
    } else {
      const pageNum = parseInt(val, 10);
      const targetPage = state.pagesData.find(p => p.pageNumber === pageNum);
      if (targetPage) {
        elements.sourceTextBox.innerText = targetPage.text;
      }
    }
    updateTextCounters();
  }

  function clearSourceText() {
    state.sourceText = '';
    elements.sourceTextBox.innerText = '';
    elements.fileInfoBadge.style.display = 'none';
    elements.summaryCard.style.display = 'none';
    updateTextCounters();
    showToast('Source text cleared', 'info');
  }

  function updateTextCounters() {
    const sourceTxt = elements.sourceTextBox.innerText.trim();
    const sourceWords = sourceTxt ? sourceTxt.split(/\s+/).length : 0;
    elements.sourceCounter.textContent = `${sourceWords.toLocaleString()} words | ${sourceTxt.length.toLocaleString()} characters`;

    const transTxt = elements.translatedTextBox.innerText.trim();
    const transWords = transTxt ? transTxt.split(/\s+/).length : 0;
    elements.targetCounter.textContent = `${transWords.toLocaleString()} words | ${transTxt.length.toLocaleString()} characters`;
  }

  function adjustFontSize(delta) {
    state.editorFontSize = Math.min(24, Math.max(12, state.editorFontSize + delta));
    elements.sourceTextBox.style.fontSize = `${state.editorFontSize}px`;
    elements.translatedTextBox.style.fontSize = `${state.editorFontSize}px`;
    showToast(`Font size set to ${state.editorFontSize}px`, 'info');
  }

  // -------------------------------------------------------------
  // AI DOCUMENT SUMMARIZER
  // -------------------------------------------------------------
  async function handleSummarizeDocument() {
    const text = elements.sourceTextBox.innerText.trim();
    if (!text) {
      showToast('Please load or paste document text to summarize.', 'info');
      return;
    }

    elements.btnSummarizeDoc.disabled = true;
    showToast('Generating AI executive summary & key takeaways...', 'info');

    try {
      const response = await fetch('/api/summarize', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text }),
      });

      const data = await response.json();
      if (!response.ok || !data.success) {
        throw new Error(data.error || 'Failed to summarize document');
      }

      state.summaryData = data;
      elements.summaryCard.style.display = 'block';
      elements.summaryCard.scrollIntoView({ behavior: 'smooth', block: 'nearest' });

      elements.summaryReductionBadge.textContent = `${data.reduction} condensed (${data.summaryWordCount} words)`;
      elements.summaryExecText.textContent = data.summary;

      elements.summaryPointsList.innerHTML = '';
      (data.keyPoints || []).forEach(pt => {
        const li = document.createElement('li');
        li.textContent = pt;
        elements.summaryPointsList.appendChild(li);
      });

      elements.summaryKeywordsContainer.innerHTML = '';
      (data.keywords || []).forEach(kw => {
        const span = document.createElement('span');
        span.className = 'keyword-chip';
        span.textContent = `#${kw}`;
        elements.summaryKeywordsContainer.appendChild(span);
      });

      showToast(`AI Summary ready (${data.reduction} reduction)`, 'success');
    } catch (err) {
      console.error('Summarize error:', err);
      showToast('Summarization failed: ' + err.message, 'error');
    } finally {
      elements.btnSummarizeDoc.disabled = false;
    }
  }

  function handleSpeakSummary() {
    if (!state.summaryData || !state.summaryData.summary) return;
    elements.translatedTextBox.innerText = state.summaryData.summary;
    state.activeAudioSource = 'translated';
    state.translatedText = state.summaryData.summary;
    updateTextCounters();
    startPlayback();
  }

  async function handleTranslateSummary() {
    if (!state.summaryData || !state.summaryData.summary) return;
    elements.sourceTextBox.innerText = state.summaryData.summary;
    state.sourceText = state.summaryData.summary;
    updateTextCounters();
    await triggerTranslation();
  }

  // -------------------------------------------------------------
  // IN-TEXT SEARCH ENGINE
  // -------------------------------------------------------------
  function toggleSearchBar(target) {
    if (target === 'source') {
      const bar = elements.sourceSearchBar;
      const isVisible = bar.style.display !== 'none';
      bar.style.display = isVisible ? 'none' : 'flex';
      if (!isVisible) elements.sourceSearchInput.focus();
    } else {
      const bar = elements.targetSearchBar;
      const isVisible = bar.style.display !== 'none';
      bar.style.display = isVisible ? 'none' : 'flex';
      if (!isVisible) elements.targetSearchInput.focus();
    }
  }

  function closeSearchBar(target) {
    if (target === 'source') {
      elements.sourceSearchBar.style.display = 'none';
      elements.sourceSearchInput.value = '';
      elements.sourceTextBox.innerHTML = escapeHtml(state.sourceText);
      elements.sourceSearchCount.textContent = '0 matches';
    } else {
      elements.targetSearchBar.style.display = 'none';
      elements.targetSearchInput.value = '';
      elements.translatedTextBox.innerHTML = escapeHtml(state.translatedText);
      elements.targetSearchCount.textContent = '0 matches';
    }
  }

  function executeSearch(target, query) {
    const rawText = target === 'source' ? state.sourceText : state.translatedText;
    const container = target === 'source' ? elements.sourceTextBox : elements.translatedTextBox;
    const countEl = target === 'source' ? elements.sourceSearchCount : elements.targetSearchCount;

    if (!query || !query.trim()) {
      container.innerHTML = escapeHtml(rawText);
      countEl.textContent = '0 matches';
      return;
    }

    const escapedQuery = query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const regex = new RegExp(`(${escapedQuery})`, 'gi');
    const matches = rawText.match(regex);
    const count = matches ? matches.length : 0;
    countEl.textContent = `${count} match${count === 1 ? '' : 'es'}`;

    if (count > 0) {
      const highlighted = rawText.replace(regex, '<mark class="search-matched-text">$1</mark>');
      container.innerHTML = highlighted;
    } else {
      container.innerHTML = escapeHtml(rawText);
    }
  }

  // -------------------------------------------------------------
  // TRANSLATION ENGINE
  // -------------------------------------------------------------
  async function triggerTranslation() {
    const textToTranslate = elements.sourceTextBox.innerText.trim();
    if (!textToTranslate) {
      showToast('No text available to translate. Please upload a PDF or enter text.', 'info');
      return;
    }

    setTranslating(true);

    try {
      const response = await fetch('/api/translate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          text: textToTranslate,
          targetLang: state.targetLang,
          sourceLang: state.sourceLang,
        }),
      });

      const data = await response.json();
      if (!response.ok || !data.success) {
        throw new Error(data.error || 'Translation request failed.');
      }

      state.translatedText = data.translatedText;
      elements.translatedTextBox.innerText = data.translatedText;
      if (data.detectedSourceLang) {
        state.sourceLang = data.detectedSourceLang;
        elements.sourceLangLabel.textContent = `Detected: ${getLanguageName(data.detectedSourceLang)}`;
      }

      updateTextCounters();
      setStepActive(3);
      filterVoicesForTargetLanguage();

      // Update Session History with translation
      saveToSessionHistory({
        title: state.filename || 'Translated Document',
        sourceText: textToTranslate,
        translatedText: data.translatedText,
        sourceLang: state.sourceLang,
        targetLang: state.targetLang,
        wordCount: data.wordCount,
        date: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      });

      showToast(`Translation completed: ${data.wordCount.toLocaleString()} words in ${getLanguageName(state.targetLang)}`, 'success');
    } catch (err) {
      console.error('Translation error:', err);
      showToast('Translation error: ' + err.message, 'error');
    } finally {
      setTranslating(false);
    }
  }

  function setTranslating(isTranslating) {
    if (isTranslating) {
      elements.btnTranslateTrigger.disabled = true;
      elements.translateSpinner.style.display = 'block';
      elements.translateBtnText.textContent = 'Translating...';
    } else {
      elements.btnTranslateTrigger.disabled = false;
      elements.translateSpinner.style.display = 'none';
      elements.translateBtnText.textContent = 'Translate Now';
    }
  }

  // -------------------------------------------------------------
  // MULTI-FORMAT EXPORT (TXT, SRT, BILINGUAL)
  // -------------------------------------------------------------
  function downloadTranslatedText() {
    const text = elements.translatedTextBox.innerText;
    if (!text || !text.trim()) {
      showToast('No translated text to download', 'info');
      return;
    }

    const blob = new Blob([text], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `translated-${state.targetLang}-${Date.now()}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    showToast('Downloaded translated text file', 'success');
  }

  async function downloadSubtitlesSrt() {
    const text = state.activeAudioSource === 'source'
      ? elements.sourceTextBox.innerText.trim()
      : elements.translatedTextBox.innerText.trim();

    if (!text) {
      showToast('No text available to generate subtitles for.', 'info');
      return;
    }

    showToast('Generating synchronized .SRT subtitle file...', 'info');

    try {
      const res = await fetch('/api/export-srt', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          text,
          speed: state.playbackRate,
        }),
      });

      if (!res.ok) throw new Error('Failed to generate SRT');
      const srtText = await res.text();
      const blob = new Blob([srtText], { type: 'text/plain;charset=utf-8' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `subtitles-${state.targetLang}-${Date.now()}.srt`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      showToast('Downloaded .SRT subtitle file!', 'success');
    } catch (err) {
      console.error('SRT export error:', err);
      showToast('SRT export error: ' + err.message, 'error');
    }
  }

  async function downloadBilingualDocument() {
    const orig = elements.sourceTextBox.innerText.trim();
    const trans = elements.translatedTextBox.innerText.trim();

    if (!orig || !trans) {
      showToast('Both original and translated text are required for bilingual export.', 'info');
      return;
    }

    showToast('Generating side-by-side bilingual document...', 'info');

    try {
      const res = await fetch('/api/export-bilingual', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          originalText: orig,
          translatedText: trans,
          sourceLang: getLanguageName(state.sourceLang),
          targetLang: getLanguageName(state.targetLang),
        }),
      });

      if (!res.ok) throw new Error('Failed to generate bilingual document');
      const output = await res.text();
      const blob = new Blob([output], { type: 'text/plain;charset=utf-8' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `bilingual-transcript-${Date.now()}.txt`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      showToast('Downloaded bilingual transcript document!', 'success');
    } catch (err) {
      console.error('Bilingual export error:', err);
      showToast('Bilingual export error: ' + err.message, 'error');
    }
  }

  // -------------------------------------------------------------
  // AUDIO STUDIO & PLAYBACK CONTROLLER
  // -------------------------------------------------------------
  function setPlaybackEngine(engine) {
    state.playbackEngine = engine;
    if (engine === 'browser') {
      elements.modeBrowserSpeech.classList.add('active');
      elements.modeServerMp3.classList.remove('active');
      const voiceGroup = document.querySelector('.voice-picker-group');
      if (voiceGroup) voiceGroup.style.display = 'flex';
      showToast('Switched to Interactive Karaoke Player', 'info');
    } else {
      elements.modeServerMp3.classList.add('active');
      elements.modeBrowserSpeech.classList.remove('active');
      const voiceGroup = document.querySelector('.voice-picker-group');
      if (voiceGroup) voiceGroup.style.display = 'none';
      showToast('Switched to Server MP3 Speech Engine', 'info');
    }
  }

  function setPlaybackSpeed(val) {
    state.playbackRate = val;
    elements.rateSlider.value = val;
    elements.speedVal.textContent = `${val.toFixed(2)}x`;

    elements.speedChips.forEach(chip => {
      chip.classList.toggle('active', parseFloat(chip.dataset.speed) === val);
    });

    if (state.nativeAudio) {
      state.nativeAudio.playbackRate = val;
    }
  }

  function toggleLoopSentence() {
    state.isLoopingSentence = !state.isLoopingSentence;
    elements.btnLoopSentence.classList.toggle('active', state.isLoopingSentence);
    showToast(state.isLoopingSentence ? 'Sentence loop enabled' : 'Sentence loop disabled', 'info');
  }

  function setupSleepTimer(minutes) {
    if (state.sleepTimerInterval) {
      clearInterval(state.sleepTimerInterval);
      state.sleepTimerInterval = null;
    }

    if (minutes === 0) {
      elements.sleepTimerBadge.textContent = 'Off';
      showToast('Sleep timer disabled', 'info');
      return;
    }

    state.sleepTimerSecondsLeft = minutes * 60;
    elements.sleepTimerBadge.textContent = `${minutes}m`;
    showToast(`Sleep timer set to ${minutes} minutes`, 'info');

    state.sleepTimerInterval = setInterval(() => {
      state.sleepTimerSecondsLeft--;
      const m = Math.floor(state.sleepTimerSecondsLeft / 60);
      const s = state.sleepTimerSecondsLeft % 60;
      elements.sleepTimerBadge.textContent = `${m}:${String(s).padStart(2, '0')}`;

      if (state.sleepTimerSecondsLeft <= 0) {
        clearInterval(state.sleepTimerInterval);
        state.sleepTimerInterval = null;
        elements.sleepTimerBadge.textContent = 'Off';
        elements.sleepTimerSelect.value = '0';
        stopPlayback();
        showToast('Sleep timer elapsed. Audio stopped.', 'info');
      }
    }, 1000);
  }

  function togglePlayPause() {
    if (state.isPlaying) {
      if (state.isPaused) {
        resumePlayback();
      } else {
        pausePlayback();
      }
    } else {
      startPlayback();
    }
  }

  function startPlayback() {
    const activeText = state.activeAudioSource === 'source'
      ? elements.sourceTextBox.innerText.trim()
      : elements.translatedTextBox.innerText.trim();

    if (!activeText) {
      showToast(`No ${state.activeAudioSource === 'source' ? 'original' : 'translated'} text to read!`, 'info');
      return;
    }

    elements.audioStudioSection.scrollIntoView({ behavior: 'smooth', block: 'nearest' });

    if (state.playbackEngine === 'server') {
      startServerMp3Playback(activeText);
    } else {
      startBrowserSpeechSynthesis(activeText);
    }
  }

  // --- Browser SpeechSynthesis with Karaoke Tracking ---
  function startBrowserSpeechSynthesis(fullText) {
    if (!('speechSynthesis' in window)) {
      showToast('Browser speech synthesis is not supported. Using server MP3 engine instead.', 'info');
      setPlaybackEngine('server');
      startServerMp3Playback(fullText);
      return;
    }

    window.speechSynthesis.cancel();

    state.sentences = splitIntoSentences(fullText);
    if (state.sentences.length === 0) {
      showToast('No readable sentences found.', 'info');
      return;
    }

    state.currentSentenceIndex = 0;
    state.isPlaying = true;
    state.isPaused = false;
    updatePlayPauseButtonUI(true);
    elements.equalizerIcon.classList.add('playing');
    elements.nowPlayingLabel.textContent = `Reading ${state.activeAudioSource === 'source' ? 'Original Document' : 'Translation'} (${state.sentences.length} sentences)`;

    playNextSentence();
  }

  function playNextSentence() {
    if (!state.isPlaying || state.isPaused) return;

    if (state.currentSentenceIndex >= state.sentences.length) {
      stopPlayback();
      showToast('Finished reading entire document', 'success');
      return;
    }

    const sentence = state.sentences[state.currentSentenceIndex];
    highlightSentenceInEditor(state.currentSentenceIndex, sentence);
    updateKaraokeTracker(sentence, state.currentSentenceIndex, state.sentences.length);

    const utterance = new SpeechSynthesisUtterance(sentence);
    utterance.rate = state.playbackRate;
    utterance.pitch = state.voicePitch;
    utterance.volume = state.volume;

    if (state.selectedVoiceURI) {
      const voice = state.availableVoices.find(v => v.voiceURI === state.selectedVoiceURI);
      if (voice) utterance.voice = voice;
    }

    utterance.onend = () => {
      if (state.isPlaying && !state.isPaused) {
        if (!state.isLoopingSentence) {
          state.currentSentenceIndex++;
        }
        updateTimelineProgress();
        playNextSentence();
      }
    };

    utterance.onerror = (e) => {
      console.warn('SpeechSynthesis error:', e);
      if (state.isPlaying && !state.isPaused) {
        state.currentSentenceIndex++;
        playNextSentence();
      }
    };

    state.utterance = utterance;
    window.speechSynthesis.speak(utterance);
  }

  function pausePlayback() {
    if (state.playbackEngine === 'server') {
      if (elements.nativeAudioPlayer) elements.nativeAudioPlayer.pause();
    } else {
      window.speechSynthesis.pause();
    }
    state.isPaused = true;
    updatePlayPauseButtonUI(false);
    elements.equalizerIcon.classList.remove('playing');
    elements.nowPlayingLabel.textContent = 'Paused';
  }

  function resumePlayback() {
    if (state.playbackEngine === 'server') {
      if (elements.nativeAudioPlayer) elements.nativeAudioPlayer.play();
    } else {
      window.speechSynthesis.resume();
    }
    state.isPaused = false;
    updatePlayPauseButtonUI(true);
    elements.equalizerIcon.classList.add('playing');
    elements.nowPlayingLabel.textContent = `Reading ${state.activeAudioSource === 'source' ? 'Original Document' : 'Translation'}`;
  }

  function stopPlayback() {
    state.isPlaying = false;
    state.isPaused = false;

    if (window.speechSynthesis) {
      window.speechSynthesis.cancel();
    }
    if (elements.nativeAudioPlayer) {
      elements.nativeAudioPlayer.pause();
      elements.nativeAudioPlayer.currentTime = 0;
    }

    updatePlayPauseButtonUI(false);
    elements.equalizerIcon.classList.remove('playing');
    elements.nowPlayingLabel.textContent = 'Idle • Ready to synthesize audio';
    elements.currentSpokenText.textContent = 'Press play to listen with synced sentence highlighting';

    clearKaraokeHighlights();
    elements.scrubBarProgress.style.width = '0%';
    elements.audioProgressSlider.value = 0;
    elements.timeCurrent.textContent = '00:00';
  }

  function skipSentenceForward() {
    if (!state.isPlaying) return;
    if (state.playbackEngine === 'server') {
      if (elements.nativeAudioPlayer) elements.nativeAudioPlayer.currentTime += 10;
      return;
    }
    if (state.currentSentenceIndex < state.sentences.length - 1) {
      window.speechSynthesis.cancel();
      state.currentSentenceIndex++;
      playNextSentence();
    }
  }

  function skipSentenceBackward() {
    if (!state.isPlaying) return;
    if (state.playbackEngine === 'server') {
      if (elements.nativeAudioPlayer) elements.nativeAudioPlayer.currentTime = Math.max(0, elements.nativeAudioPlayer.currentTime - 10);
      return;
    }
    if (state.currentSentenceIndex > 0) {
      window.speechSynthesis.cancel();
      state.currentSentenceIndex--;
      playNextSentence();
    }
  }

  function toggleMute() {
    if (state.volume > 0) {
      state.previousVolume = state.volume;
      state.volume = 0;
      elements.volumeSlider.value = 0;
      elements.volumeVal.textContent = '0%';
    } else {
      state.volume = state.previousVolume || 1.0;
      elements.volumeSlider.value = state.volume;
      elements.volumeVal.textContent = `${Math.round(state.volume * 100)}%`;
    }
    if (elements.nativeAudioPlayer) elements.nativeAudioPlayer.volume = state.volume;
  }

  function updatePlayPauseButtonUI(playing) {
    const playIcon = elements.btnPlayPause.querySelector('.icon-play');
    const pauseIcon = elements.btnPlayPause.querySelector('.icon-pause');
    if (playing) {
      playIcon.style.display = 'none';
      pauseIcon.style.display = 'block';
    } else {
      playIcon.style.display = 'block';
      pauseIcon.style.display = 'none';
    }
  }

  // --- Server MP3 Audio Engine ---
  async function startServerMp3Playback(text) {
    elements.nowPlayingLabel.textContent = 'Synthesizing MP3 audio on server...';
    elements.equalizerIcon.classList.add('playing');

    try {
      const lang = state.activeAudioSource === 'source' ? (state.sourceLang || 'en') : state.targetLang;
      const response = await fetch('/api/synthesize', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          text,
          lang,
          speed: state.playbackRate,
          returnFormat: 'json',
        }),
      });

      const data = await response.json();
      if (!response.ok || !data.success) {
        throw new Error(data.error || 'Server audio synthesis failed.');
      }

      const audio = elements.nativeAudioPlayer;
      audio.src = data.audioUrl;
      audio.volume = state.volume;
      audio.playbackRate = state.playbackRate;

      audio.onloadedmetadata = () => {
        elements.timeDuration.textContent = formatTime(audio.duration);
      };

      audio.ontimeupdate = () => {
        if (audio.duration) {
          const percent = (audio.currentTime / audio.duration) * 100;
          elements.scrubBarProgress.style.width = `${percent}%`;
          elements.audioProgressSlider.value = percent;
          elements.timeCurrent.textContent = formatTime(audio.currentTime);
        }
      };

      audio.onended = () => {
        stopPlayback();
        showToast('MP3 playback completed', 'success');
      };

      await audio.play();
      state.isPlaying = true;
      state.isPaused = false;
      updatePlayPauseButtonUI(true);
      elements.nowPlayingLabel.textContent = `Playing MP3: ${getLanguageName(lang)}`;
      elements.currentSpokenText.textContent = `Streaming high-definition synthesized audio in ${getLanguageName(lang)}`;
    } catch (err) {
      console.error('Server audio synthesis error:', err);
      showToast('Synthesis failed: ' + err.message, 'error');
      stopPlayback();
    }
  }

  async function handleDownloadMp3() {
    const activeText = state.activeAudioSource === 'source'
      ? elements.sourceTextBox.innerText.trim()
      : elements.translatedTextBox.innerText.trim();

    if (!activeText) {
      showToast('No text available to convert to MP3. Please translate or upload a document first.', 'info');
      return;
    }

    const lang = state.activeAudioSource === 'source' ? (state.sourceLang || 'en') : state.targetLang;
    showToast(`Generating MP3 audio for download (${getLanguageName(lang)})...`, 'info');
    elements.btnDownloadMp3.disabled = true;

    try {
      const response = await fetch('/api/synthesize', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          text: activeText,
          lang,
          speed: state.playbackRate,
          returnFormat: 'mp3',
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to generate audio file on server');
      }

      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `audio-${lang}-${Date.now()}.mp3`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      showToast('MP3 audio file downloaded successfully!', 'success');
    } catch (err) {
      console.error('MP3 download error:', err);
      showToast('Failed to download MP3: ' + err.message, 'error');
    } finally {
      elements.btnDownloadMp3.disabled = false;
    }
  }

  // -------------------------------------------------------------
  // KARAOKE TRACKER & HIGHLIGHTING
  // -------------------------------------------------------------
  function splitIntoSentences(text) {
    const rawSentences = text.match(/[^.!?\n]+[.!?\n]+|[^.!?\n]+$/g) || [text];
    return rawSentences
      .map(s => s.trim())
      .filter(s => s.length > 0);
  }

  function updateKaraokeTracker(sentence, index, total) {
    elements.currentSpokenText.textContent = sentence;
    const progressPercent = ((index + 1) / total) * 100;
    elements.scrubBarProgress.style.width = `${progressPercent}%`;
    elements.audioProgressSlider.value = progressPercent;
    elements.timeCurrent.textContent = `${index + 1} / ${total}`;
    elements.timeDuration.textContent = `${total} sent`;
  }

  function highlightSentenceInEditor(sentenceIndex, targetSentenceText) {
    const activeEditor = state.activeAudioSource === 'source'
      ? elements.sourceTextBox
      : elements.translatedTextBox;

    const fullRawText = state.activeAudioSource === 'source'
      ? state.sourceText
      : state.translatedText;

    if (!fullRawText) return;

    const sentences = state.sentences;
    let html = '';
    sentences.forEach((s, idx) => {
      const escaped = escapeHtml(s);
      if (idx === sentenceIndex) {
        html += `<span class="spoken-sentence-highlight" id="active-spoken-sentence">${escaped} </span> `;
      } else {
        html += `<span>${escaped} </span> `;
      }
    });

    activeEditor.innerHTML = html;

    const highlightedEl = document.getElementById('active-spoken-sentence');
    if (highlightedEl) {
      highlightedEl.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  }

  function clearKaraokeHighlights() {
    const rawSource = elements.sourceTextBox.innerText;
    elements.sourceTextBox.innerHTML = escapeHtml(rawSource);

    const rawTrans = elements.translatedTextBox.innerText;
    elements.translatedTextBox.innerHTML = escapeHtml(rawTrans);
  }

  function updateTimelineProgress() {
    if (state.sentences.length > 0) {
      const pct = (state.currentSentenceIndex / state.sentences.length) * 100;
      elements.scrubBarProgress.style.width = `${pct}%`;
      elements.audioProgressSlider.value = pct;
    }
  }

  function handleTimelineScrub(e) {
    const percent = parseFloat(e.target.value);
    elements.scrubBarProgress.style.width = `${percent}%`;

    if (state.playbackEngine === 'server' && elements.nativeAudioPlayer && elements.nativeAudioPlayer.duration) {
      elements.nativeAudioPlayer.currentTime = (percent / 100) * elements.nativeAudioPlayer.duration;
    } else if (state.sentences.length > 0) {
      const targetIndex = Math.min(
        state.sentences.length - 1,
        Math.floor((percent / 100) * state.sentences.length)
      );
      state.currentSentenceIndex = targetIndex;
      if (state.isPlaying) {
        window.speechSynthesis.cancel();
        playNextSentence();
      }
    }
  }

  // -------------------------------------------------------------
  // DYNAMIC AUDIO WAVEFORM CANVAS VISUALIZER
  // -------------------------------------------------------------
  let canvasCtx = null;
  let wavePhase = 0;

  function initWaveformCanvas() {
    const canvas = elements.waveformCanvas;
    if (!canvas) return;

    const dpr = window.devicePixelRatio || 1;
    const rect = canvas.getBoundingClientRect();
    canvas.width = (rect.width || 900) * dpr;
    canvas.height = 80 * dpr;
    canvasCtx = canvas.getContext('2d');
    canvasCtx.scale(dpr, dpr);

    animateWaveform();
  }

  function animateWaveform() {
    requestAnimationFrame(animateWaveform);
    if (!canvasCtx) return;

    const width = elements.waveformCanvas.width / (window.devicePixelRatio || 1);
    const height = 80;

    canvasCtx.clearRect(0, 0, width, height);

    const isAudioActive = state.isPlaying && !state.isPaused;
    const speed = isAudioActive ? 0.08 * state.playbackRate : 0.015;
    wavePhase += speed;

    const centerY = height / 2;
    const baseAmp = isAudioActive ? 22 : 4;

    drawSinWave(width, centerY, baseAmp, 0.018, wavePhase, 'rgba(99, 102, 241, 0.6)', 3);
    drawSinWave(width, centerY, baseAmp * 0.8, 0.024, wavePhase + 1.2, 'rgba(6, 182, 212, 0.7)', 2.5);
    drawSinWave(width, centerY, baseAmp * 0.5, 0.012, wavePhase + 2.4, 'rgba(139, 92, 246, 0.5)', 2);

    if (isAudioActive) {
      drawEqualizerBars(width, height);
    }
  }

  function drawSinWave(width, centerY, amplitude, frequency, phase, strokeStyle, lineWidth) {
    canvasCtx.beginPath();
    canvasCtx.lineWidth = lineWidth;
    canvasCtx.strokeStyle = strokeStyle;

    for (let x = 0; x < width; x += 4) {
      const envelope = Math.sin((x / width) * Math.PI);
      const y = centerY + Math.sin(x * frequency + phase) * amplitude * envelope;
      if (x === 0) canvasCtx.moveTo(x, y);
      else canvasCtx.lineTo(x, y);
    }
    canvasCtx.stroke();
  }

  function drawEqualizerBars(width, height) {
    const numBars = 36;
    const barWidth = 4;
    const spacing = width / numBars;

    for (let i = 0; i < numBars; i++) {
      const x = i * spacing + spacing / 2;
      const t = wavePhase * 3 + i * 0.4;
      const barHeight = Math.abs(Math.sin(t)) * 38 + 6;
      const y = (height - barHeight) / 2;

      const grad = canvasCtx.createLinearGradient(0, y, 0, y + barHeight);
      grad.addColorStop(0, 'rgba(6, 182, 212, 0.45)');
      grad.addColorStop(1, 'rgba(99, 102, 241, 0.45)');

      canvasCtx.fillStyle = grad;
      canvasCtx.fillRect(x - barWidth / 2, y, barWidth, barHeight);
    }
  }

  // -------------------------------------------------------------
  // RECENT SESSIONS HISTORY
  // -------------------------------------------------------------
  function getSessionHistory() {
    try {
      const raw = localStorage.getItem('voxlingo_history');
      return raw ? JSON.parse(raw) : [];
    } catch {
      return [];
    }
  }

  function saveToSessionHistory(item) {
    try {
      const history = getSessionHistory();
      // Avoid duplicate titles in top 3
      const filtered = history.filter(h => h.title !== item.title || h.date !== item.date);
      filtered.unshift(item);
      localStorage.setItem('voxlingo_history', JSON.stringify(filtered.slice(0, 10)));
    } catch (e) {
      console.warn('Failed to save session history:', e);
    }
  }

  function openHistoryModal() {
    elements.historyModalOverlay.style.display = 'flex';
    renderHistoryModal();
  }

  function closeHistoryModal() {
    elements.historyModalOverlay.style.display = 'none';
  }

  function clearSessionHistory() {
    localStorage.removeItem('voxlingo_history');
    renderHistoryModal();
    showToast('Session history cleared', 'info');
  }

  function renderHistoryModal() {
    const history = getSessionHistory();
    const container = elements.historyItemsContainer;
    container.innerHTML = '';

    if (history.length === 0) {
      container.innerHTML = '<p class="history-empty-text">No saved sessions yet. Upload a PDF or translate text to save a session!</p>';
      return;
    }

    history.forEach((item, index) => {
      const div = document.createElement('div');
      div.className = 'history-item';
      div.innerHTML = `
        <div class="history-meta">
          <span class="history-title">${escapeHtml(item.title || 'Untitled Document')}</span>
          <span class="history-details">${item.date || ''} • ${item.wordCount || 0} words • ${item.targetLang ? 'To: ' + item.targetLang : 'Extracted'}</span>
        </div>
        <div class="history-actions">
          <button class="btn btn-primary btn-xs btn-restore-history" data-index="${index}">Restore</button>
        </div>
      `;
      container.appendChild(div);
    });

    container.querySelectorAll('.btn-restore-history').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const idx = parseInt(e.target.dataset.index, 10);
        restoreSession(history[idx]);
        closeHistoryModal();
      });
    });
  }

  function restoreSession(item) {
    if (!item) return;
    state.filename = item.title;
    state.sourceText = item.sourceText || '';
    state.translatedText = item.translatedText || '';
    if (item.targetLang) state.targetLang = item.targetLang;

    elements.sourceTextBox.innerText = state.sourceText;
    elements.translatedTextBox.innerText = state.translatedText;
    elements.targetLangSelect.value = state.targetLang;
    updateLanguageFlag();
    updateTextCounters();

    displayFileInfo({
      filename: item.title,
      fileSize: state.sourceText.length,
      totalPages: item.totalPages || 1,
      wordCount: item.wordCount || state.sourceText.split(/\s+/).length,
      charCount: state.sourceText.length,
      estimatedReadingTime: `${Math.max(1, Math.ceil((item.wordCount || 100) / 200))} min`,
    });

    setStepActive(item.translatedText ? 3 : 2);
    showToast(`Restored "${item.title}" into studio`, 'success');
  }

  // -------------------------------------------------------------
  // HELPER UTILITIES
  // -------------------------------------------------------------
  function setStepActive(stepNum) {
    [elements.step1Badge, elements.step2Badge, elements.step3Badge].forEach((badge, idx) => {
      if (idx + 1 === stepNum) {
        badge.classList.add('active');
      } else if (idx + 1 < stepNum) {
        badge.classList.add('completed');
        badge.classList.remove('active');
      } else {
        badge.classList.remove('active', 'completed');
      }
    });

    if (stepNum >= 2) elements.stepLine1.classList.add('completed');
    if (stepNum >= 3) elements.stepLine2.classList.add('completed');
  }

  function updateUIState() {
    updateTextCounters();
    updateLanguageFlag();
  }

  function copyToClipboard(text, successMsg = 'Copied to clipboard!') {
    if (!text || !text.trim()) {
      showToast('Nothing to copy', 'info');
      return;
    }
    navigator.clipboard.writeText(text).then(() => {
      showToast(successMsg, 'success');
    }).catch(err => {
      console.warn('Clipboard write failed:', err);
      showToast('Failed to copy', 'error');
    });
  }

  function showToast(message, type = 'info') {
    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;
    
    let iconSvg = '';
    if (type === 'success') {
      iconSvg = '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#10b981" stroke-width="2"><polyline points="20 6 9 17 4 12"/></svg>';
    } else if (type === 'error') {
      iconSvg = '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#ef4444" stroke-width="2"><circle cx="12" cy="12" r="10"/><line x1="15" y1="9" x2="9" y2="15"/><line x1="9" y1="9" x2="15" y2="15"/></svg>';
    } else {
      iconSvg = '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#06b6d4" stroke-width="2"><circle cx="12" cy="12" r="10"/><line x1="12" y1="16" x2="12" y2="12"/><line x1="12" y1="8" x2="12.01" y2="8"/></svg>';
    }

    toast.innerHTML = `${iconSvg}<span>${escapeHtml(message)}</span>`;
    elements.toastContainer.appendChild(toast);

    requestAnimationFrame(() => toast.classList.add('show'));

    setTimeout(() => {
      toast.classList.remove('show');
      setTimeout(() => toast.remove(), 300);
    }, 4000);
  }

  function formatBytes(bytes) {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
  }

  function formatTime(seconds) {
    if (isNaN(seconds) || seconds < 0) return '00:00';
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  }

  function getLanguageName(code) {
    const found = languagesList.find(l => l.code === code || l.code.split('-')[0] === code);
    return found ? found.name : code;
  }

  function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  }

  // Run on page load
  window.addEventListener('DOMContentLoaded', init);
})();
