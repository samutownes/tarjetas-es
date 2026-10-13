/* Spanish Flashcards — Intermediate Podcast E1–E100
   Default deck: frequent multi-word phrases; type English to check. */
(function () {
  'use strict';

  const STORAGE_KEY = 'es-flashcards-srs-v2';
  const PREFS_KEY = 'es-flashcards-prefs-v2';
  const AUTO_ADVANCE_MS = 900;

  const I18N = {
    es: {
      title: 'Tarjetas de vocabulario',
      subtitle: 'Podcast Intermedio E1–E100',
      remaining: 'Pendientes',
      known: 'Dominadas',
      streak: 'Racha',
      shuffled: 'Barajar',
      dueFirst: 'Repasar primero',
      dirEsEn: 'ES → EN',
      dirEnEs: 'EN → ES',
      showPrompt: 'Frase / palabra',
      showAnswer: 'Traducción',
      typeHintEsEn: 'Escribe la traducción en inglés',
      typeHintEnEs: 'Escribe la palabra o frase en español',
      placeholderEsEn: 'Traducción en inglés…',
      placeholderEnEs: 'Español…',
      submit: 'Comprobar',
      showAnswerBtn: 'Ver respuesta',
      feedbackCorrect: '¡Correcto!',
      feedbackClose: 'Casi — mira la respuesta',
      feedbackWrong: 'Incorrecto',
      feedbackRevealed: 'Respuesta mostrada',
      again: 'Otra vez',
      knownBtn: 'La sé',
      overrideBtn: 'Tenía razón',
      emptyTitle: '¡Sesión completa!',
      emptyBody: 'No hay más tarjetas en este filtro. Cambia el mazo o reinicia el progreso.',
      emptyReset: 'Reiniciar pendientes de este filtro',
      settings: 'Ajustes',
      help: 'Ayuda',
      lang: 'EN',
      resetAll: 'Borrar todo el progreso',
      resetConfirm: '¿Borrar todo el progreso guardado? No se puede deshacer.',
      settingsBlurb:
        'Escribe la traducción y pulsa Comprobar. El progreso (SM-2 simplificado) se guarda en este navegador (localStorage).',
      helpTitle: 'Cómo usar',
      helpIntro:
        'Prioriza frases hechas y expresiones frecuentes del podcast (E1–E100). Escribe la traducción en inglés (no solo revelar). El diccionario de palabras sueltas está disponible como mazo opcional.',
      footer: 'Datos embebidos · sin servidor · offline',
      spainNote: 'Nota (España)',
      deckPhrasesHot: '★ Frases frecuentes',
      deckPhrasesAll: 'Todas las frases',
      deckPhrasesMid: 'Frases intermedias',
      deckPhrasesRare: 'Frases menos frecuentes',
      deckPhrasesSpain: 'Frases con nota España',
      deckWordsHot: 'Palabras muy frecuentes',
      deckWordsAll: 'Todas las palabras',
      deckWordsMid: 'Palabras intermedias',
      deckWordsRare: 'Palabras raras',
      deckWordsSpain: 'Palabras con nota España',
    },
    en: {
      title: 'Vocabulary flashcards',
      subtitle: 'Intermediate Podcast E1–E100',
      remaining: 'Remaining',
      known: 'Known',
      streak: 'Streak',
      shuffled: 'Shuffle',
      dueFirst: 'Due first',
      dirEsEn: 'ES → EN',
      dirEnEs: 'EN → ES',
      showPrompt: 'Phrase / word',
      showAnswer: 'Translation',
      typeHintEsEn: 'Type the English translation',
      typeHintEnEs: 'Type the Spanish word or phrase',
      placeholderEsEn: 'English translation…',
      placeholderEnEs: 'Spanish…',
      submit: 'Check',
      showAnswerBtn: 'Show answer',
      feedbackCorrect: 'Correct!',
      feedbackClose: 'Close — check the answer',
      feedbackWrong: 'Incorrect',
      feedbackRevealed: 'Answer revealed',
      again: 'Again',
      knownBtn: 'Got it',
      overrideBtn: 'I was right',
      emptyTitle: 'Session clear!',
      emptyBody: 'No more cards in this filter. Change the deck or reset progress.',
      emptyReset: 'Reset pending in this filter',
      settings: 'Settings',
      help: 'Help',
      lang: 'ES',
      resetAll: 'Clear all progress',
      resetConfirm: 'Clear all saved progress? This cannot be undone.',
      settingsBlurb:
        'Type the translation and tap Check. Progress (simplified SM-2) is stored in this browser (localStorage).',
      helpTitle: 'How to use',
      helpIntro:
        'Focus on high-frequency multi-word phrases from the podcast (E1–E100). Type the English translation to check (not only reveal). The single-word dictionary is available as an optional deck.',
      footer: 'Embedded data · no server · offline',
      spainNote: 'Spain note',
      deckPhrasesHot: '★ Frequent phrases',
      deckPhrasesAll: 'All phrases',
      deckPhrasesMid: 'Mid-frequency phrases',
      deckPhrasesRare: 'Less frequent phrases',
      deckPhrasesSpain: 'Phrases with Spain note',
      deckWordsHot: 'Very common words',
      deckWordsAll: 'All words',
      deckWordsMid: 'Mid-frequency words',
      deckWordsRare: 'Rare words',
      deckWordsSpain: 'Words with Spain note',
    },
  };

  const DATA = window.FLASHCARD_DATA;
  if (!DATA || (!DATA.phrases && !DATA.entries)) {
    document.body.innerHTML =
      '<p style="padding:2rem;font-family:sans-serif">Error: dictionary.js no cargó.</p>';
    return;
  }

  const PHRASES = (DATA.phrases || []).map((e, i) => ({
    id: 'p' + i,
    word: e.w,
    translation: e.t,
    pos: e.p || 'expr.',
    freq: e.f || 0,
    note: e.n || null,
    kind: 'phrase',
  }));

  const WORDS = (DATA.entries || []).map((e, i) => ({
    id: 'w' + i,
    word: e.w,
    translation: e.t,
    pos: e.p || '',
    freq: e.f || 0,
    note: e.n || null,
    kind: 'word',
  }));

  const DECKS = {
    phrases_hot: {
      pool: 'phrases',
      test: (e) => e.freq >= 8,
      labelKey: 'deckPhrasesHot',
    },
    phrases_all: {
      pool: 'phrases',
      test: () => true,
      labelKey: 'deckPhrasesAll',
    },
    phrases_mid: {
      pool: 'phrases',
      test: (e) => e.freq >= 3 && e.freq < 8,
      labelKey: 'deckPhrasesMid',
    },
    phrases_rare: {
      pool: 'phrases',
      test: (e) => e.freq < 3,
      labelKey: 'deckPhrasesRare',
    },
    phrases_spain: {
      pool: 'phrases',
      test: (e) => !!e.note,
      labelKey: 'deckPhrasesSpain',
    },
    words_hot: {
      pool: 'words',
      test: (e) => e.freq >= 45,
      labelKey: 'deckWordsHot',
    },
    words_all: {
      pool: 'words',
      test: () => true,
      labelKey: 'deckWordsAll',
    },
    words_mid: {
      pool: 'words',
      test: (e) => e.freq >= 7 && e.freq < 45,
      labelKey: 'deckWordsMid',
    },
    words_rare: {
      pool: 'words',
      test: (e) => e.freq < 7,
      labelKey: 'deckWordsRare',
    },
    words_spain: {
      pool: 'words',
      test: (e) => !!e.note,
      labelKey: 'deckWordsSpain',
    },
  };

  const DECK_ORDER = [
    'phrases_hot',
    'phrases_all',
    'phrases_mid',
    'phrases_rare',
    'phrases_spain',
    'words_hot',
    'words_all',
    'words_mid',
    'words_rare',
    'words_spain',
  ];

  const state = {
    prefs: loadPrefs(),
    srs: loadSrs(),
    queue: [],
    index: 0,
    checked: false,
    grade: null, // 'correct' | 'close' | 'incorrect' | 'revealed'
    sessionSeen: 0,
    sessionStreak: 0,
    autoTimer: null,
  };

  const el = {
    title: document.getElementById('ui-title'),
    subtitle: document.getElementById('ui-subtitle'),
    remaining: document.getElementById('stat-remaining'),
    known: document.getElementById('stat-known'),
    streak: document.getElementById('stat-streak'),
    labelRemaining: document.getElementById('label-remaining'),
    labelKnown: document.getElementById('label-known'),
    labelStreak: document.getElementById('label-streak'),
    tier: document.getElementById('tier-select'),
    shuffle: document.getElementById('btn-shuffle'),
    due: document.getElementById('btn-due'),
    dir: document.getElementById('btn-dir'),
    progress: document.getElementById('deck-progress-fill'),
    card: document.getElementById('flashcard'),
    badgePos: document.getElementById('badge-pos'),
    badgeSpain: document.getElementById('badge-spain'),
    badgeDir: document.getElementById('badge-dir'),
    promptLabel: document.getElementById('prompt-label'),
    promptWord: document.getElementById('prompt-word'),
    answerForm: document.getElementById('answer-form'),
    answerLabel: document.getElementById('answer-label'),
    answerInput: document.getElementById('answer-input'),
    btnSubmit: document.getElementById('btn-submit'),
    answerFeedback: document.getElementById('answer-feedback'),
    btnShow: document.getElementById('btn-show'),
    answerBlock: document.getElementById('answer-block'),
    answerWord: document.getElementById('answer-word'),
    answerNote: document.getElementById('answer-note'),
    btnAgain: document.getElementById('btn-again'),
    btnKnown: document.getElementById('btn-known'),
    empty: document.getElementById('empty-state'),
    emptyTitle: document.getElementById('empty-title'),
    emptyBody: document.getElementById('empty-body'),
    emptyReset: document.getElementById('empty-reset'),
    footer: document.getElementById('app-footer'),
    btnHelp: document.getElementById('btn-help'),
    btnSettings: document.getElementById('btn-settings'),
    btnLang: document.getElementById('btn-lang'),
    overlayHelp: document.getElementById('overlay-help'),
    overlaySettings: document.getElementById('overlay-settings'),
  };

  function t(key) {
    return (I18N[state.prefs.lang] || I18N.es)[key] || key;
  }

  function defaultPrefs() {
    return {
      lang: 'es',
      tier: 'phrases_hot',
      shuffle: false,
      dueFirst: true,
      direction: 'es-en',
    };
  }

  function loadPrefs() {
    try {
      const raw = localStorage.getItem(PREFS_KEY);
      if (raw) {
        const p = Object.assign(defaultPrefs(), JSON.parse(raw));
        if (!DECKS[p.tier]) p.tier = 'phrases_hot';
        return p;
      }
      const old = localStorage.getItem('es-flashcards-prefs-v1');
      if (old) {
        const o = JSON.parse(old);
        const map = {
          all: 'words_all',
          t1: 'words_hot',
          t2: 'words_mid',
          t3: 'words_mid',
          t4: 'words_rare',
          rare: 'words_rare',
          spain: 'words_spain',
        };
        return Object.assign(defaultPrefs(), {
          lang: o.lang || 'es',
          tier: map[o.tier] || 'phrases_hot',
          shuffle: !!o.shuffle,
          dueFirst: o.dueFirst !== false,
          direction: o.direction || 'es-en',
        });
      }
    } catch (_) {}
    return defaultPrefs();
  }

  function savePrefs() {
    localStorage.setItem(PREFS_KEY, JSON.stringify(state.prefs));
  }

  function loadSrs() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) return JSON.parse(raw).cards || {};
      const old = localStorage.getItem('es-flashcards-srs-v1');
      if (old) {
        const cards = JSON.parse(old).cards || {};
        const migrated = {};
        Object.keys(cards).forEach((k) => {
          migrated['w' + k] = cards[k];
        });
        return migrated;
      }
    } catch (_) {}
    return {};
  }

  function saveSrs() {
    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({ version: 2, updated: Date.now(), cards: state.srs })
    );
  }

  function todayStr() {
    return new Date().toISOString().slice(0, 10);
  }

  function getCard(id) {
    if (!state.srs[id]) {
      state.srs[id] = {
        ease: 2.5,
        interval: 0,
        reps: 0,
        due: todayStr(),
        lapses: 0,
        known: false,
      };
    }
    return state.srs[id];
  }

  function review(id, grade) {
    const c = getCard(id);
    const now = todayStr();
    if (grade === 0) {
      c.reps = 0;
      c.interval = 0;
      c.due = now;
      c.lapses = (c.lapses || 0) + 1;
      c.known = false;
      c.ease = Math.max(1.3, c.ease - 0.2);
    } else {
      if (c.reps === 0) c.interval = 1;
      else if (c.reps === 1) c.interval = 3;
      else c.interval = Math.round(c.interval * c.ease);
      c.reps += 1;
      c.ease = Math.min(2.8, c.ease + 0.05);
      c.known = c.reps >= 2 && c.interval >= 3;
      const due = new Date();
      due.setDate(due.getDate() + c.interval);
      c.due = due.toISOString().slice(0, 10);
    }
    saveSrs();
  }

  function poolFor(deckId) {
    const deck = DECKS[deckId] || DECKS.phrases_hot;
    const src = deck.pool === 'phrases' ? PHRASES : WORDS;
    return src.filter(deck.test);
  }

  function isDue(card) {
    return !card.due || card.due <= todayStr();
  }

  function buildQueue() {
    const list = poolFor(state.prefs.tier);
    const due = [];
    const later = [];
    for (const e of list) {
      const c = getCard(e.id);
      if (isDue(c) || !c.known) due.push(e);
      else later.push(e);
    }
    let queue = state.prefs.dueFirst ? (due.length ? due : later) : list.slice();
    if (state.prefs.shuffle) {
      for (let i = queue.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [queue[i], queue[j]] = [queue[j], queue[i]];
      }
    } else {
      queue.sort((a, b) => b.freq - a.freq || a.word.localeCompare(b.word, 'es'));
    }
    state.queue = queue;
    state.index = 0;
    state.checked = false;
    state.grade = null;
  }

  function current() {
    return state.queue[state.index] || null;
  }

  function countKnownInFilter() {
    let n = 0;
    for (const e of poolFor(state.prefs.tier)) {
      const c = state.srs[e.id];
      if (c && c.known) n++;
    }
    return n;
  }

  function countInFilter() {
    return poolFor(state.prefs.tier).length;
  }

  function fillDeckSelect() {
    el.tier.innerHTML = '';
    DECK_ORDER.forEach((id) => {
      const opt = document.createElement('option');
      opt.value = id;
      opt.textContent = t(DECKS[id].labelKey);
      el.tier.appendChild(opt);
    });
    el.tier.value = state.prefs.tier;
  }

  /* ——— Soft answer matching ———
     Rules:
     - trim + collapse whitespace
     - case-insensitive
     - strip diacritics (accents on English/Spanish do not matter)
     - ignore simple punctuation (. , ; : ! ? ¡ ¿ " ' ’ “ ” ( ) [ ] / … — –)
     - strip parenthetical asides before comparing
     - accept any alternative split by / or ; (and comma lists of short synonyms)
     - also accept left side of "x = y" gloss fragments
     - "close": small Levenshtein distance vs any candidate (typos)
  */
  function stripDiacritics(s) {
    return String(s)
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '');
  }

  function normalizeAnswer(s) {
    return stripDiacritics(s)
      .toLowerCase()
      .replace(/[\u2018\u2019\u2032`´]/g, "'")
      .replace(/[\u201c\u201d]/g, '"')
      .replace(/[\u2014\u2013\u2212]/g, '-')
      .replace(/&/g, ' and ')
      .replace(/\+/g, ' ')
      .replace(/[^\w\s'-]/g, ' ')
      .replace(/_/g, ' ')
      .replace(/\s+/g, ' ')
      .trim();
  }

  function stripParens(s) {
    return String(s)
      .replace(/\([^)]*\)/g, ' ')
      .replace(/\[[^\]]*\]/g, ' ')
      .replace(/\s+/g, ' ')
      .trim();
  }

  function stripArticles(n) {
    return n.replace(/^(to|the|a|an) /, '').replace(/ (the|a|an) /g, ' ').replace(/\s+/g, ' ').trim();
  }

  function addCandidate(set, raw) {
    const n0 = normalizeAnswer(raw);
    if (n0) set.add(n0);
    const n = stripArticles(n0);
    if (n) set.add(n);
    const compact = n.replace(/[-']/g, '').replace(/\s+/g, ' ').trim();
    if (compact) set.add(compact);
  }

  function candidateAnswers(stored) {
    const set = new Set();
    const full = String(stored || '');
    addCandidate(set, full);
    addCandidate(set, stripParens(full));

    const base = stripParens(full);
    base.split(/\s*(?:[/;]|\bor\b)\s*/).forEach((part) => {
      let p = part.trim();
      if (!p) return;
      // drop leading Spanish example before "=" in mixed glosses
      if (/=/.test(p)) {
        const sides = p.split('=');
        sides.forEach((side) => addCandidate(set, side));
        // prefer English-looking right side too
        addCandidate(set, sides[sides.length - 1]);
      } else {
        addCandidate(set, p);
      }
    });

    // Short synonym lists: "however, nevertheless"
    base.split(/\s*(?:[/;,]|\bor\b)\s*/).forEach((p) => {
      if (p.trim()) addCandidate(set, p);
    });

    return Array.from(set);
  }

  function levenshtein(a, b) {
    if (a === b) return 0;
    const m = a.length;
    const n = b.length;
    if (!m) return n;
    if (!n) return m;
    const prev = new Array(n + 1);
    const cur = new Array(n + 1);
    for (let j = 0; j <= n; j++) prev[j] = j;
    for (let i = 1; i <= m; i++) {
      cur[0] = i;
      const ca = a.charCodeAt(i - 1);
      for (let j = 1; j <= n; j++) {
        const cost = ca === b.charCodeAt(j - 1) ? 0 : 1;
        cur[j] = Math.min(cur[j - 1] + 1, prev[j] + 1, prev[j - 1] + cost);
      }
      for (let j = 0; j <= n; j++) prev[j] = cur[j];
    }
    return prev[n];
  }

  function closeThreshold(len) {
    if (len <= 4) return 1;
    if (len <= 12) return 2;
    return Math.max(2, Math.floor(len * 0.15));
  }

  function gradeTyped(userRaw, expectedRaw) {
    const user0 = normalizeAnswer(userRaw);
    if (!user0) return 'empty';
    const user = stripArticles(user0) || user0;
    const userCompact = user.replace(/[-']/g, '');
    const cands = candidateAnswers(expectedRaw);
    for (let i = 0; i < cands.length; i++) {
      const c = cands[i];
      if (user === c || userCompact === c.replace(/[-']/g, '')) return 'correct';
    }
    for (let i = 0; i < cands.length; i++) {
      const c = cands[i];
      const d = levenshtein(user, c);
      const allowed = closeThreshold(Math.max(user.length, c.length));
      if (d > 0 && d <= allowed) return 'close';
      const d2 = levenshtein(userCompact, c.replace(/[-']/g, ''));
      if (d2 > 0 && d2 <= allowed) return 'close';
    }
    return 'incorrect';
  }

  function expectedAnswer(entry) {
    const esFirst = state.prefs.direction === 'es-en';
    return esFirst ? entry.translation : entry.word;
  }

  function clearAutoTimer() {
    if (state.autoTimer) {
      clearTimeout(state.autoTimer);
      state.autoTimer = null;
    }
  }

  function applyI18n() {
    el.title.textContent = t('title');
    el.subtitle.textContent = t('subtitle');
    el.labelRemaining.textContent = t('remaining');
    el.labelKnown.textContent = t('known');
    el.labelStreak.textContent = t('streak');
    el.shuffle.textContent = t('shuffled');
    el.due.textContent = t('dueFirst');
    el.dir.textContent = state.prefs.direction === 'es-en' ? t('dirEsEn') : t('dirEnEs');
    el.btnAgain.textContent = '↩ ' + t('again');
    el.btnKnown.textContent = '✓ ' + t('knownBtn');
    el.btnSubmit.textContent = t('submit');
    el.btnShow.textContent = t('showAnswerBtn');
    el.emptyTitle.textContent = t('emptyTitle');
    el.emptyBody.textContent = t('emptyBody');
    el.emptyReset.textContent = t('emptyReset');
    const pc = DATA.meta.phraseCount || PHRASES.length;
    const wc = DATA.meta.wordCount || WORDS.length;
    el.footer.textContent =
      t('footer') +
      ' · ' +
      pc.toLocaleString() +
      ' frases · ' +
      wc.toLocaleString() +
      ' palabras';
    el.btnLang.textContent = t('lang');
    el.btnHelp.title = t('help');
    el.btnSettings.title = t('settings');
    fillDeckSelect();
    updateTypeHints();

    const help = document.getElementById('help-content');
    if (help) {
      help.innerHTML =
        '<h2>' +
        t('helpTitle') +
        '</h2><p>' +
        t('helpIntro') +
        '</p><div class="help-keys">' +
        '<div><span>' +
        t('submit') +
        '</span><kbd>Enter</kbd></div>' +
        '<div><span>' +
        t('knownBtn') +
        '</span><kbd>1</kbd> / <kbd>→</kbd></div>' +
        '<div><span>' +
        t('again') +
        '</span><kbd>2</kbd> / <kbd>←</kbd></div>' +
        '<div><span>' +
        t('dirEsEn') +
        ' / ' +
        t('dirEnEs') +
        '</span><kbd>D</kbd></div>' +
        '</div>';
    }
    const settings = document.getElementById('settings-content');
    if (settings) {
      settings.querySelector('[data-i18n="settings"]').textContent = t('settings');
      settings.querySelector('[data-i18n="blurb"]').textContent = t('settingsBlurb');
      settings.querySelector('[data-i18n="reset"]').textContent = t('resetAll');
    }
  }

  function updateTypeHints() {
    const esFirst = state.prefs.direction === 'es-en';
    el.answerLabel.textContent = esFirst ? t('typeHintEsEn') : t('typeHintEnEs');
    el.answerInput.placeholder = esFirst ? t('placeholderEsEn') : t('placeholderEnEs');
    el.answerInput.lang = esFirst ? 'en' : 'es';
    el.answerInput.autocapitalize = 'off';
  }

  function updateStats() {
    const total = countInFilter();
    const known = countKnownInFilter();
    const remaining = Math.max(0, total - known);
    el.remaining.textContent = String(remaining);
    el.known.textContent = String(known);
    el.streak.textContent = String(state.sessionStreak);
    const pct = total ? Math.round((known / total) * 100) : 0;
    el.progress.style.width = pct + '%';
  }

  function escapeHtml(s) {
    return String(s)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;');
  }

  function setFeedback(kind, message) {
    el.answerFeedback.classList.remove('hidden', 'ok', 'close', 'bad');
    if (!kind) {
      el.answerFeedback.classList.add('hidden');
      el.answerFeedback.textContent = '';
      return;
    }
    const cls = kind === 'correct' ? 'ok' : kind === 'close' ? 'close' : 'bad';
    el.answerFeedback.classList.add(cls);
    el.answerFeedback.textContent = message;
  }

  function resetInputStyle() {
    el.answerInput.classList.remove('ok', 'close', 'bad');
  }

  function setCheckedUI(on, grade) {
    state.checked = on;
    state.grade = on ? grade : null;
    el.answerBlock.classList.toggle('hidden', !on);
    el.btnAgain.disabled = !on;
    el.btnKnown.disabled = !on;
    el.btnSubmit.disabled = on;
    el.answerInput.readOnly = on;
    el.btnShow.hidden = on;
    if (!on) {
      el.btnKnown.textContent = '✓ ' + t('knownBtn');
      setFeedback(null);
      resetInputStyle();
      el.answerInput.value = '';
    }
  }

  function focusInput() {
    // Defer so iOS keyboard opens reliably after render
    setTimeout(function () {
      try {
        el.answerInput.focus({ preventScroll: true });
      } catch (_) {
        el.answerInput.focus();
      }
    }, 50);
  }

  function renderCard() {
    clearAutoTimer();
    const entry = current();
    const showEmpty = !entry;
    el.empty.classList.toggle('visible', showEmpty);
    el.card.style.display = showEmpty ? 'none' : 'block';
    el.answerForm.classList.toggle('hidden', showEmpty);
    el.btnShow.hidden = showEmpty || state.checked;
    el.btnAgain.disabled = showEmpty || !state.checked;
    el.btnKnown.disabled = showEmpty || !state.checked;
    if (showEmpty) {
      setFeedback(null);
      updateStats();
      return;
    }
    const esFirst = state.prefs.direction === 'es-en';
    el.badgePos.textContent =
      entry.kind === 'phrase'
        ? entry.pos === 'frase'
          ? 'frase'
          : 'expr.'
        : entry.pos || '—';
    el.badgeSpain.hidden = !entry.note;
    el.badgeSpain.textContent = state.prefs.lang === 'es' ? 'España' : 'Spain';
    el.badgeDir.textContent = esFirst ? 'ES → EN' : 'EN → ES';
    el.promptLabel.textContent = t('showPrompt');
    el.promptWord.textContent = esFirst ? entry.word : entry.translation;
    el.answerWord.textContent = esFirst ? entry.translation : entry.word;
    if (entry.note) {
      el.answerNote.hidden = false;
      el.answerNote.innerHTML =
        '<strong>' + t('spainNote') + ':</strong> ' + escapeHtml(entry.note);
    } else {
      el.answerNote.hidden = true;
      el.answerNote.textContent = '';
    }
    el.promptWord.style.fontSize = entry.word.length > 42 ? 'clamp(1.25rem, 4.5vw, 1.75rem)' : '';
    updateTypeHints();
    if (!state.checked) {
      setCheckedUI(false);
      focusInput();
    }
    updateStats();
  }

  function showAnswerAndEnable(grade, feedbackMsg, inputClass) {
    setCheckedUI(true, grade);
    resetInputStyle();
    if (inputClass) el.answerInput.classList.add(inputClass);
    setFeedback(grade === 'correct' ? 'correct' : grade === 'close' ? 'close' : 'incorrect', feedbackMsg);
    el.answerBlock.classList.remove('hidden');
    el.btnKnown.textContent = '✓ ' + (grade === 'correct' ? t('knownBtn') : t('overrideBtn'));
  }

  function submitAnswer() {
    const entry = current();
    if (!entry || state.checked) return;
    const raw = el.answerInput.value;
    const result = gradeTyped(raw, expectedAnswer(entry));
    if (result === 'empty') {
      focusInput();
      return;
    }
    if (result === 'correct') {
      showAnswerAndEnable('correct', t('feedbackCorrect'), 'ok');
      state.autoTimer = setTimeout(function () {
        markKnown();
      }, AUTO_ADVANCE_MS);
      return;
    }
    if (result === 'close') {
      showAnswerAndEnable('close', t('feedbackClose'), 'close');
      return;
    }
    showAnswerAndEnable('incorrect', t('feedbackWrong'), 'bad');
  }

  function revealWithoutTyping() {
    const entry = current();
    if (!entry || state.checked) return;
    showAnswerAndEnable('revealed', t('feedbackRevealed'), 'bad');
  }

  function advance() {
    clearAutoTimer();
    state.index += 1;
    state.checked = false;
    state.grade = null;
    if (state.index >= state.queue.length) buildQueue();
    renderCard();
  }

  function markAgain() {
    const entry = current();
    if (!entry || !state.checked) return;
    clearAutoTimer();
    review(entry.id, 0);
    state.sessionStreak = 0;
    state.sessionSeen += 1;
    const rest = state.queue.slice(state.index + 1);
    rest.splice(Math.min(3, rest.length), 0, entry);
    state.queue = state.queue.slice(0, state.index).concat(rest);
    advance();
  }

  function markKnown() {
    const entry = current();
    if (!entry || !state.checked) return;
    clearAutoTimer();
    review(entry.id, 3);
    state.sessionStreak += 1;
    state.sessionSeen += 1;
    advance();
  }

  function syncControls() {
    el.tier.value = state.prefs.tier;
    el.shuffle.classList.toggle('active', state.prefs.shuffle);
    el.due.classList.toggle('active', state.prefs.dueFirst);
    el.dir.textContent =
      state.prefs.direction === 'es-en' ? t('dirEsEn') : t('dirEnEs');
  }

  function rebuild() {
    clearAutoTimer();
    buildQueue();
    applyI18n();
    syncControls();
    renderCard();
  }

  el.answerForm.addEventListener('submit', function (e) {
    e.preventDefault();
    submitAnswer();
  });
  el.btnShow.addEventListener('click', function (e) {
    e.preventDefault();
    revealWithoutTyping();
  });
  el.btnAgain.addEventListener('click', function (e) {
    e.stopPropagation();
    markAgain();
  });
  el.btnKnown.addEventListener('click', function (e) {
    e.stopPropagation();
    markKnown();
  });
  el.tier.addEventListener('change', function () {
    state.prefs.tier = el.tier.value;
    savePrefs();
    rebuild();
  });
  el.shuffle.addEventListener('click', function () {
    state.prefs.shuffle = !state.prefs.shuffle;
    savePrefs();
    rebuild();
  });
  el.due.addEventListener('click', function () {
    state.prefs.dueFirst = !state.prefs.dueFirst;
    savePrefs();
    rebuild();
  });
  el.dir.addEventListener('click', function () {
    state.prefs.direction =
      state.prefs.direction === 'es-en' ? 'en-es' : 'es-en';
    savePrefs();
    state.checked = false;
    state.grade = null;
    applyI18n();
    syncControls();
    renderCard();
  });
  el.btnLang.addEventListener('click', function () {
    state.prefs.lang = state.prefs.lang === 'es' ? 'en' : 'es';
    savePrefs();
    applyI18n();
    syncControls();
    renderCard();
  });
  el.emptyReset.addEventListener('click', function () {
    for (const e of poolFor(state.prefs.tier)) {
      if (state.srs[e.id]) {
        state.srs[e.id].known = false;
        state.srs[e.id].reps = 0;
        state.srs[e.id].interval = 0;
        state.srs[e.id].due = todayStr();
      }
    }
    saveSrs();
    rebuild();
  });

  function openOverlay(node) {
    node.classList.add('open');
  }
  function closeOverlay(node) {
    node.classList.remove('open');
  }
  el.btnHelp.addEventListener('click', function () {
    openOverlay(el.overlayHelp);
  });
  el.btnSettings.addEventListener('click', function () {
    openOverlay(el.overlaySettings);
  });
  document.querySelectorAll('[data-close]').forEach(function (btn) {
    btn.addEventListener('click', function () {
      closeOverlay(document.getElementById(btn.getAttribute('data-close')));
    });
  });
  document.querySelectorAll('.overlay').forEach(function (ov) {
    ov.addEventListener('click', function (e) {
      if (e.target === ov) closeOverlay(ov);
    });
  });
  document.getElementById('btn-reset-all').addEventListener('click', function () {
    if (confirm(t('resetConfirm'))) {
      state.srs = {};
      saveSrs();
      state.sessionStreak = 0;
      rebuild();
      closeOverlay(el.overlaySettings);
    }
  });

  document.addEventListener('keydown', function (e) {
    if (
      el.overlayHelp.classList.contains('open') ||
      el.overlaySettings.classList.contains('open')
    ) {
      if (e.key === 'Escape') {
        closeOverlay(el.overlayHelp);
        closeOverlay(el.overlaySettings);
      }
      return;
    }
    // While typing, Enter is handled by the form; allow grade shortcuts only after check
    if (e.target === el.answerInput) {
      if (state.checked && (e.key === '1' || e.key === 'ArrowRight')) {
        e.preventDefault();
        markKnown();
      } else if (state.checked && (e.key === '2' || e.key === 'ArrowLeft')) {
        e.preventDefault();
        markAgain();
      }
      return;
    }
    if (e.target.matches('input, select, textarea')) return;
    if (e.key === '1' || e.key === 'ArrowRight') {
      e.preventDefault();
      markKnown();
      return;
    }
    if (e.key === '2' || e.key === 'ArrowLeft') {
      e.preventDefault();
      markAgain();
      return;
    }
    if (e.key === 'd' || e.key === 'D') el.dir.click();
  });

  /* Swipe grading after a check (touch) — no more swipe-to-reveal */
  (function setupSwipe() {
    let startX = 0;
    let startY = 0;
    let tracking = false;
    let moved = false;
    const THRESH = 56;
    const card = el.card;

    function onStart(e) {
      if (!current() || !state.checked || e.touches.length !== 1) return;
      if (e.target.closest('input, button, a, label')) return;
      const touch = e.touches[0];
      startX = touch.clientX;
      startY = touch.clientY;
      tracking = true;
      moved = false;
      card.classList.add('swiping');
    }

    function onMove(e) {
      if (!tracking) return;
      const touch = e.touches[0];
      const dx = touch.clientX - startX;
      const dy = touch.clientY - startY;
      if (Math.abs(dx) > 10 && Math.abs(dx) > Math.abs(dy)) {
        moved = true;
        e.preventDefault();
        const rot = Math.max(-8, Math.min(8, dx / 24));
        card.querySelector('.flashcard-inner').style.transform =
          'translateX(' + dx * 0.35 + 'px) rotate(' + rot + 'deg)';
      }
    }

    function onEnd(e) {
      if (!tracking) return;
      tracking = false;
      card.classList.remove('swiping');
      const inner = card.querySelector('.flashcard-inner');
      const touch = (e.changedTouches && e.changedTouches[0]) || null;
      const dx = touch ? touch.clientX - startX : 0;
      const dy = touch ? touch.clientY - startY : 0;
      inner.style.transform = '';

      if (!moved || Math.abs(dx) < THRESH || Math.abs(dx) < Math.abs(dy)) {
        return;
      }
      if (dx > 0) markKnown();
      else markAgain();
    }

    card.addEventListener('touchstart', onStart, { passive: true });
    card.addEventListener('touchmove', onMove, { passive: false });
    card.addEventListener('touchend', onEnd, { passive: true });
    card.addEventListener('touchcancel', function () {
      tracking = false;
      card.classList.remove('swiping');
      const inner = card.querySelector('.flashcard-inner');
      if (inner) inner.style.transform = '';
    });
  })();

  rebuild();
})();
