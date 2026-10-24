/* ==========================================================
   Nova Blaster: Quiz Edition - script.js
   ========================================================== */
(() => {
  'use strict';

  /* ---------- Util ---------- */
  const $ = (id) => document.getElementById(id);
  const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
  const rand = (a, b) => a + Math.random() * (b - a);
  const shuffle = (arr) => {
    const a = arr.slice();
    for (let i = a.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [a[i], a[j]] = [a[j], a[i]];
    }
    return a;
  };

  /* ---------- Elemen ---------- */
  const canvas = $('arena');
  const ctx = canvas.getContext('2d');
  const gameEl = $('game');
  canvas.style.touchAction = 'none';

  const el = {
    hud: $('hud'),
    score: $('hud-score'),
    stage: $('hud-stage'),
    lives: $('hud-lives'),
    combo: $('hud-combo'),
    powerBar: $('powerup-bar'),
    progress: $('stage-progress'),
    progressFill: $('stage-progress-fill'),
    banner: $('stage-banner'),
    bannerText: $('stage-banner-text'),
    touch: $('touch-controls'),
    toolbar: $('toolbar'),
    menuHigh: $('menu-highscore'),
    quizStage: $('quiz-stage'),
    quizTime: $('quiz-time'),
    timerFill: $('timer-fill'),
    quizQuestion: $('quiz-question'),
    quizFeedback: $('quiz-feedback'),
    options: Array.from(document.querySelectorAll('#quiz-options .option')),
    powerStreak: $('powerup-streak'),
    powerChoices: Array.from(document.querySelectorAll('#powerup-choices .powerup')),
    resScore: $('result-score'),
    resStage: $('result-stage'),
    resCorrect: $('result-correct'),
    resHigh: $('result-highscore'),
    resNew: $('result-newrecord'),
    btnSound: $('btn-sound')
  };

  const screens = {
    menu: $('screen-menu'),
    howto: $('screen-howto'),
    quiz: $('screen-quiz'),
    powerup: $('screen-powerup'),
    pause: $('screen-pause'),
    gameover: $('screen-gameover')
  };

  /* ---------- Konstanta ---------- */
  const QUIZ_TIME = 15;
  const START_LIVES = 3;
  const MAX_LIVES = 5;
  const STORAGE_KEY = 'novaBlasterQuizHighScore';

  /* ---------- Bank soal: [pertanyaan, [opsi], indeks benar, level] ---------- */
  const QUESTIONS = [
    // Level 1
    ['Planet apa yang paling dekat dengan Matahari?', ['Merkurius', 'Venus', 'Bumi', 'Mars'], 0, 1],
    ['Hewan darat apa yang paling cepat larinya?', ['Singa', 'Cheetah', 'Kuda', 'Macan tutul'], 1, 1],
    ['Apa ibu kota Jepang?', ['Osaka', 'Kyoto', 'Tokyo', 'Nagoya'], 2, 1],
    ['Berapa jumlah warna pada pelangi?', ['5', '6', '7', '8'], 2, 1],
    ['Gas apa yang kita hirup untuk bernapas?', ['Oksigen', 'Nitrogen', 'Hidrogen', 'Helium'], 0, 1],
    ['Benua apa yang paling luas?', ['Afrika', 'Amerika', 'Eropa', 'Asia'], 3, 1],
    ['Samudra apa yang paling luas?', ['Atlantik', 'Hindia', 'Pasifik', 'Arktik'], 2, 1],
    ['Siapa proklamator kemerdekaan Indonesia bersama Mohammad Hatta?', ['Soekarno', 'Soeharto', 'Sutan Sjahrir', 'Ki Hajar Dewantara'], 0, 1],
    ['Apa rumus kimia air?', ['CO2', 'H2O', 'O2', 'NaCl'], 1, 1],
    ['Apa bahasa resmi Brasil?', ['Spanyol', 'Inggris', 'Portugis', 'Prancis'], 2, 1],
    ['Hewan apa yang dijuluki raja hutan?', ['Harimau', 'Gajah', 'Beruang', 'Singa'], 3, 1],
    ['Alat musik bambu tradisional dari Jawa Barat adalah?', ['Angklung', 'Sasando', 'Gamelan', 'Tifa'], 0, 1],

    // Level 2
    ['Gunung tertinggi di dunia adalah?', ['K2', 'Everest', 'Kilimanjaro', 'Elbrus'], 1, 2],
    ['Pada tahun berapa Indonesia memproklamasikan kemerdekaan?', ['1942', '1945', '1949', '1950'], 1, 2],
    ['Siapa yang mempopulerkan bola lampu pijar?', ['Nikola Tesla', 'Isaac Newton', 'Thomas Edison', 'Alexander Bell'], 2, 2],
    ['Unsur kimia dengan simbol Fe adalah?', ['Fosfor', 'Besi', 'Fluorin', 'Perak'], 1, 2],
    ['Apa mata uang Jepang?', ['Won', 'Yuan', 'Ringgit', 'Yen'], 3, 2],
    ['Candi Buddha terbesar di dunia yang berada di Magelang adalah?', ['Prambanan', 'Mendut', 'Borobudur', 'Sewu'], 2, 2],
    ['Organ apa yang menghasilkan insulin?', ['Hati', 'Pankreas', 'Ginjal', 'Lambung'], 1, 2],
    ['Siapa pelukis Mona Lisa?', ['Leonardo da Vinci', 'Pablo Picasso', 'Vincent van Gogh', 'Michelangelo'], 0, 2],
    ['Apa ibu kota Australia?', ['Sydney', 'Melbourne', 'Canberra', 'Perth'], 2, 2],
    ['Planet mana yang dijuluki Planet Merah?', ['Jupiter', 'Mars', 'Saturnus', 'Merkurius'], 1, 2],
    ['Siapa penulis novel Laskar Pelangi?', ['Tere Liye', 'Pramoedya Ananta Toer', 'Andrea Hirata', 'Habiburrahman El Shirazy'], 2, 2],
    ['Selat apa yang memisahkan Pulau Jawa dan Pulau Sumatra?', ['Selat Sunda', 'Selat Bali', 'Selat Malaka', 'Selat Makassar'], 0, 2],

    // Level 3
    ['Pada tahun berapa Perang Dunia II berakhir?', ['1943', '1944', '1945', '1946'], 2, 3],
    ['Kecepatan cahaya dalam ruang hampa sekitar berapa?', ['3.000 km/detik', '30.000 km/detik', '300.000 km/detik', '3.000.000 km/detik'], 2, 3],
    ['Siapa pencipta World Wide Web?', ['Bill Gates', 'Tim Berners-Lee', 'Steve Jobs', 'Linus Torvalds'], 1, 3],
    ['Negara terkecil di dunia berdasarkan luas wilayah adalah?', ['Monako', 'San Marino', 'Vatikan', 'Liechtenstein'], 2, 3],
    ['Bagian sel yang berfungsi sebagai pembangkit energi adalah?', ['Ribosom', 'Mitokondria', 'Nukleus', 'Lisosom'], 1, 3],
    ['Konferensi Asia Afrika tahun 1955 diadakan di kota?', ['Jakarta', 'Surabaya', 'Yogyakarta', 'Bandung'], 3, 3],
    ['Siapa yang mengemukakan teori relativitas?', ['Albert Einstein', 'Niels Bohr', 'Galileo Galilei', 'Stephen Hawking'], 0, 3],
    ['Bilangan prima terkecil adalah?', ['0', '1', '2', '3'], 2, 3],
    ['Apa ibu kota Turki?', ['Istanbul', 'Ankara', 'Izmir', 'Bursa'], 1, 3],
    ['Gas apa yang paling banyak terdapat di atmosfer Bumi?', ['Oksigen', 'Karbon dioksida', 'Argon', 'Nitrogen'], 3, 3],
    ['Siapa yang memimpin ekspedisi pelayaran pertama mengelilingi dunia?', ['Christopher Columbus', 'Ferdinand Magellan', 'Vasco da Gama', 'James Cook'], 1, 3],
    ['Apa satuan tekanan dalam Sistem Internasional (SI)?', ['Joule', 'Newton', 'Pascal', 'Watt'], 2, 3]
  ];

  /* ---------- Status global ---------- */
  let W = 0;
  let H = 0;
  let state = 'menu'; // menu | playing | paused | quiz | powerup | gameover
  let g = null;       // data permainan aktif
  let lastTime = 0;
  let highScore = loadHighScore();
  let stars = [];
  let usedQuestions = new Set();
  let quiz = { q: null, timer: null, endAt: 0, lastSec: 0, locked: false, correctIndex: 0 };
  let bannerTimeout = null;
  let audioCtx = null;
  let soundOn = true;
  let hudCache = {};
  let barKey = '';

  const keys = { left: false, right: false, fire: false };
  const touch = { left: false, right: false, fire: false };

  /* ---------- Penyimpanan ---------- */
  function loadHighScore() {
    try {
      return parseInt(localStorage.getItem(STORAGE_KEY), 10) || 0;
    } catch (e) {
      return 0;
    }
  }

  function saveHighScore(v) {
    try {
      localStorage.setItem(STORAGE_KEY, String(v));
    } catch (e) { /* abaikan */ }
  }

  /* ---------- Audio ---------- */
  function ensureAudio() {
    if (audioCtx) return;
    try {
      const AC = window.AudioContext || window.webkitAudioContext;
      if (AC) audioCtx = new AC();
    } catch (e) {
      audioCtx = null;
    }
    if (audioCtx && audioCtx.state === 'suspended') audioCtx.resume();
  }

  function beep(freq, dur = 0.08, type = 'square', vol = 0.04, slide = 0) {
    if (!soundOn || !audioCtx) return;
    const t = audioCtx.currentTime;
    const osc = audioCtx.createOscillator();
    const gain = audioCtx.createGain();
    osc.type = type;
    osc.frequency.setValueAtTime(freq, t);
    if (slide) osc.frequency.exponentialRampToValueAtTime(Math.max(20, freq + slide), t + dur);
    gain.gain.setValueAtTime(vol, t);
    gain.gain.exponentialRampToValueAtTime(0.0001, t + dur);
    osc.connect(gain);
    gain.connect(audioCtx.destination);
    osc.start(t);
    osc.stop(t + dur + 0.02);
  }

  const sfx = {
    shoot: () => beep(880, 0.05, 'square', 0.015, -400),
    boom: () => beep(160, 0.18, 'sawtooth', 0.05, -110),
    hit: () => beep(120, 0.3, 'sawtooth', 0.07, -80),
    tick: () => beep(1000, 0.05, 'square', 0.04),
    correct: () => {
      beep(523, 0.1, 'triangle', 0.06);
      setTimeout(() => beep(659, 0.1, 'triangle', 0.06), 100);
      setTimeout(() => beep(784, 0.18, 'triangle', 0.06), 200);
    },
    wrong: () => {
      beep(300, 0.15, 'sawtooth', 0.06, -100);
      setTimeout(() => beep(200, 0.25, 'sawtooth', 0.06, -80), 150);
    },
    nova: () => beep(90, 0.6, 'sawtooth', 0.09, 600),
    pick: () => beep(740, 0.1, 'triangle', 0.05, 200)
  };

  /* ---------- Layar & UI ---------- */
  function showScreen(name) {
    Object.keys(screens).forEach((k) => {
      screens[k].classList.toggle('hidden', k !== name);
    });
  }

  function setPlayingUI(on) {
    [el.hud, el.powerBar, el.progress, el.toolbar, el.touch].forEach((node) => {
      node.classList.toggle('hidden', !on);
    });
  }

  function releaseInputs() {
    keys.left = keys.right = keys.fire = false;
    touch.left = touch.right = touch.fire = false;
    if (g) g.dragX = null;
  }

  function setText(node, key, val) {
    if (hudCache[key] !== val) {
      hudCache[key] = val;
      node.textContent = val;
    }
  }

  function comboMult() {
    return 1 + Math.min(4, Math.floor(g.combo / 5));
  }

  function updateHud() {
    setText(el.score, 'score', String(g.score));
    setText(el.stage, 'stage', String(g.stage));
    setText(el.lives, 'lives', '\u2665 ' + g.lives);
    setText(el.combo, 'combo', 'x' + comboMult());

    // Power-up aktif
    const items = [];
    if (g.shield > 0) items.push('Perisai x' + g.shield);
    if (g.tripleTime > 0) items.push('Triple Shot ' + Math.ceil(g.tripleTime) + ' dtk');
    if (g.slowTime > 0) items.push('Slow Motion ' + Math.ceil(g.slowTime) + ' dtk');
    if (g.novaCharges > 0) items.push('Bom Nova x' + g.novaCharges + ' (tekan B)');
    const key = items.join('|');
    if (key !== barKey) {
      barKey = key;
      el.powerBar.innerHTML = items.map((t) => '<li>' + t + '</li>').join('');
    }

    // Progres stage
    let pct;
    if (g.phase === 'wave') {
      pct = (g.done / g.target) * 100;
    } else if (g.phase === 'boss' && g.boss) {
      pct = (g.boss.hp / g.boss.maxHp) * 100;
    } else {
      pct = 0;
    }
    pct = clamp(Math.round(pct), 0, 100);
    if (hudCache.pct !== pct) {
      hudCache.pct = pct;
      el.progressFill.style.width = pct + '%';
      el.progress.setAttribute('aria-valuenow', String(pct));
    }
  }

  function showBanner(text) {
    el.bannerText.textContent = text;
    el.banner.classList.add('hidden');
    void el.banner.offsetWidth;
    el.banner.classList.remove('hidden');
    clearTimeout(bannerTimeout);
    bannerTimeout = setTimeout(() => el.banner.classList.add('hidden'), 1800);
  }

  function shake() {
    gameEl.classList.remove('shake');
    void gameEl.offsetWidth;
    gameEl.classList.add('shake');
    setTimeout(() => gameEl.classList.remove('shake'), 300);
  }

  function flash() {
    gameEl.classList.remove('flash');
    void gameEl.offsetWidth;
    gameEl.classList.add('flash');
    setTimeout(() => gameEl.classList.remove('flash'), 400);
  }

  /* ---------- Ukuran canvas & bintang ---------- */
  function resize() {
    const dpr = window.devicePixelRatio || 1;
    W = gameEl.clientWidth;
    H = gameEl.clientHeight;
    canvas.width = Math.floor(W * dpr);
    canvas.height = Math.floor(H * dpr);
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

    stars = [];
    const count = Math.round((W * H) / 9000) + 30;
    for (let i = 0; i < count; i++) {
      stars.push({
        x: Math.random() * W,
        y: Math.random() * H,
        s: rand(0.6, 2.2),
        v: rand(14, 70)
      });
    }

    if (g) {
      g.player.y = H - 120;
      g.player.x = clamp(g.player.x, g.player.r + 8, W - g.player.r - 8);
    }
  }

  function updateStars(dt) {
    const boost = g && state === 'playing' ? 1 + g.stage * 0.06 : 1;
    for (const s of stars) {
      s.y += s.v * boost * dt;
      if (s.y > H) {
        s.y = -2;
        s.x = Math.random() * W;
      }
    }
  }

  /* ---------- Inisialisasi permainan ---------- */
  function newGame() {
    g = {
      stage: 1,
      score: 0,
      lives: START_LIVES,
      combo: 0,
      correct: 0,
      streak: 0,
      time: 0,
      phase: 'wave', // wave | boss | clear
      kills: 0,
      done: 0,
      spawned: 0,
      target: 0,
      spawnCd: 1,
      meteorCd: 4,
      clearTimer: 0,
      boss: null,
      dragX: null,
      shield: 0,
      tripleTime: 0,
      tripleWide: false,
      slowTime: 0,
      novaCharges: 0,
      novaPower: 0.2,
      bullets: [],
      enemyBullets: [],
      enemies: [],
      particles: [],
      player: { x: W / 2, y: H - 120, r: 16, speed: 360, cd: 0, invuln: 0 }
    };
    usedQuestions = new Set();
    hudCache = {};
    barKey = '';
    beginStage();
  }

  function beginStage() {
    g.phase = 'wave';
    g.kills = 0;
    g.done = 0;
    g.spawned = 0;
    g.target = 8 + g.stage * 3;
    g.spawnCd = 1.2;
    g.meteorCd = rand(3, 6);
    g.boss = null;
    g.enemies = [];
    g.enemyBullets = [];
    g.bullets = [];
    showBanner('Stage ' + g.stage);
  }

  function startGame() {
    ensureAudio();
    releaseInputs();
    newGame();
    state = 'playing';
    showScreen(null);
    setPlayingUI(true);
    updateHud();
  }

  function goMenu() {
    state = 'menu';
    releaseInputs();
    clearInterval(quiz.timer);
    setPlayingUI(false);
    el.banner.classList.add('hidden');
    el.menuHigh.textContent = String(highScore);
    showScreen('menu');
  }

  /* ---------- Spawn ---------- */
  function enemyPool() {
    const s = g.stage;
    const pool = ['drone', 'drone'];
    if (s >= 2) pool.push('zigzag');
    if (s >= 3) pool.push('shooter', 'zigzag');
    if (s >= 5) pool.push('homing', 'shooter');
    if (s >= 7) pool.push('elite', 'homing');
    return pool;
  }

  function spawnEnemy() {
    const type = enemyPool()[Math.floor(Math.random() * enemyPool().length)];
    const s = g.stage;
    const margin = 40;
    const x = rand(margin, W - margin);
    const e = {
      type, x, baseX: clamp(x, margin + 55, W - margin - 55), y: -30,
      r: 15, hp: 1, vy: 70 + s * 11, vx: 0, t: Math.random() * 6,
      shoots: false, cd: 0, rate: 2, counted: true, rot: 0, dead: false
    };

    if (type === 'zigzag') {
      e.vy = 80 + s * 10;
    } else if (type === 'shooter') {
      e.hp = 2;
      e.r = 17;
      e.vy = 48 + s * 4;
      e.shoots = true;
      e.rate = Math.max(0.9, 2.1 - s * 0.1);
      e.cd = rand(0.6, 1.4);
    } else if (type === 'homing') {
      e.hp = 2;
      e.r = 17;
      e.vy = 45 + s * 4;
      e.shoots = true;
      e.rate = Math.max(1, 2.4 - s * 0.1);
      e.cd = rand(0.8, 1.6);
    } else if (type === 'elite') {
      e.hp = 5;
      e.r = 22;
      e.vy = 40 + s * 3;
      e.shoots = true;
      e.rate = Math.max(1.1, 2.6 - s * 0.1);
      e.cd = 1;
    }
    g.enemies.push(e);
    g.spawned++;
  }

  function spawnMeteor() {
    g.enemies.push({
      type: 'meteor', x: rand(20, W - 20), baseX: 0, y: -30,
      r: rand(16, 26), hp: 3, vy: rand(110, 170) + g.stage * 6, vx: rand(-40, 40),
      t: 0, shoots: false, cd: 0, rate: 0, counted: false, rot: 0, dead: false
    });
  }

  function spawnBoss() {
    const hp = 20 + g.stage * 10;
    g.boss = {
      x: W / 2, y: -70, r: 44, hp, maxHp: hp,
      t: 0, cd: 1.4, ringCd: 3, flash: 0
    };
    g.phase = 'boss';
    showBanner('Boss!');
  }

  /* ---------- Tembakan ---------- */
  function playerShoot() {
    const p = g.player;
    const angles = g.tripleTime > 0
      ? (g.tripleWide ? [-0.28, -0.14, 0, 0.14, 0.28] : [-0.18, 0, 0.18])
      : [0];
    p.cd = 0.2;
    angles.forEach((a) => {
      g.bullets.push({
        x: p.x, y: p.y - p.r,
        vx: Math.sin(a) * 540, vy: -Math.cos(a) * 540, r: 4
      });
    });
    sfx.shoot();
  }

  function enemyBullet(x, y, angle, speed) {
    const sp = speed * (1 + g.stage * 0.03);
    g.enemyBullets.push({ x, y, vx: Math.cos(angle) * sp, vy: Math.sin(angle) * sp, r: 5 });
  }

  function enemyFire(e) {
    const p = g.player;
    const aim = Math.atan2(p.y - e.y, p.x - e.x);
    if (e.type === 'shooter') {
      enemyBullet(e.x, e.y + e.r, Math.PI / 2, 200);
    } else if (e.type === 'homing') {
      enemyBullet(e.x, e.y + e.r, aim, 175);
    } else if (e.type === 'elite') {
      [-0.25, 0, 0.25].forEach((o) => enemyBullet(e.x, e.y + e.r, aim + o, 185));
    }
  }

  function bossFire(b) {
    const p = g.player;
    const aim = Math.atan2(p.y - b.y, p.x - b.x);
    const count = Math.min(9, 3 + Math.floor(g.stage / 2));
    const arc = 0.9;
    for (let i = 0; i < count; i++) {
      const off = count === 1 ? 0 : -arc / 2 + (arc * i) / (count - 1);
      enemyBullet(b.x, b.y + b.r * 0.6, aim + off, 190 + g.stage * 6);
    }
  }

  function bossRing(b) {
    const n = 12 +
