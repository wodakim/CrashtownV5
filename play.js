import { createFrameBudgetTracker, initPagePerf, reportNavigationArrival, runExitTransition } from "./perf-tools.js";
const lanes = [0.27, 0.43, 0.59, 0.75];
const ENEMY_SPAWN_INTERVAL_MS = 980;
const MAX_ENEMIES = 6;
const BOT_BASE_SPEED = 0.18;
const BOT_MAX_SPEED = 0.45;
const BOT_MIN_SPEED = 0.12;
const BOT_SAFE_GAP = 0.12;
const BOT_PLAYER_SPEED_MARGIN = 0.03;
const PLAYER_HITBOX_HALF_WIDTH = 0.046;
const BOT_HITBOX_HALF_WIDTH = 0.046;
const FRONTAL_CONTACT_X_THRESHOLD = 0.032;
const SIDE_TAKEDOWN_X_MIN = 0.036;
const TAKEDOWN_STEER_WINDOW_MS = 520;
const PLAYER_Y = 0.79;
const HITBOX_FRONT_OFFSET = 0.048;
const HITBOX_BACK_OFFSET = 0.05;
const TAKEDOWN_OVERLAP_BUFFER = 0.006;
const START_GRACE_MS = 2600;
const LANE_CHANGE_COOLDOWN_MS = 120;
const LANE_SHIELD_MS = 210;
const BASE_DIFFICULTY_SCORE_STEP = 1800;
const MIN_SPAWN_PROGRESS_GAP = 0.22;
const MAX_RECENT_EVENTS = 12;
const DEV_HITBOX_QUERY = new URLSearchParams(window.location.search).get("devHitbox") === "1";
const PLAYER_WALLET_KEY = "ct_wallet_credits_v1";
const GIFT_REWARD_CREDITS = 50;
const GIFT_SPAWN_MIN_MS = 120000;
const GIFT_SPAWN_MAX_MS = 300000;
const RADIO_TRACK_PREF_KEY = "ct_radio_track_idx_v1";

const PAGE_NAME = "play.html";
initPagePerf(PAGE_NAME);
reportNavigationArrival(PAGE_NAME);
const frameBudgetTracker = createFrameBudgetTracker("play.frame");

const road = document.getElementById("road");
const carsLayer = document.getElementById("carsLayer");
const playerCar = document.getElementById("playerCar");
const scoreValue = document.getElementById("scoreValue");
const speedValue = document.getElementById("speedValue");
const pauseBtn = document.getElementById("pauseBtn");
const settingsBtn = document.getElementById("settingsBtn");
const overlay = document.getElementById("overlay");
const settingsPopup = document.getElementById("settingsPopup");
const confirmExitPopup = document.getElementById("confirmExitPopup");
const pausePopup = document.getElementById("pausePopup");
const gameOverPanel = document.getElementById("gameOverPanel");
const closeSettingsBtn = document.querySelector('[data-close="settingsPopup"]');
const menuBtnInSettings = document.getElementById("menuBtnInSettings");
const confirmYes = document.getElementById("confirmYes");
const confirmNo = document.getElementById("confirmNo");
const resumeBtn = document.getElementById("resumeBtn");
const menuBtnInPause = document.getElementById("menuBtnInPause");
const retryBtn = document.getElementById("retryBtn");
const menuBtnGameOver = document.getElementById("menuBtnGameOver");
const crashSound = document.getElementById("crashSound");
const takedownSound = document.getElementById("takedownSound");
const playApp = document.querySelector(".play-app");
const radioPlayer = document.getElementById("radioPlayer");
const radioSelect = document.getElementById("radioSelect");

const vehicleAssets = {
  PORSHE: {
    hd: "./Assets/Vehicles/Player/HD/Vehicles_porshe_HD_base_v01.png",
    pixel: "./Assets/Vehicles/Player/Pixel/Vehicles_porshe_pixel_base_v01.png",
  },
  BMW: {
    hd: "./Assets/Vehicles/Player/HD/Vehicles_bmw_HD_base_v01.png",
    pixel: "./Assets/Vehicles/Player/Pixel/Vehicles_bmw_pixel_base_v01.png",
  },
  GALLARDO: {
    hd: "./Assets/Vehicles/Player/HD/Vehicles_gallardo_HD_base_v01.png",
    pixel: "./Assets/Vehicles/Player/Pixel/Vehicles_gallardo_pixel_base_v01.png",
  },
  RX7: {
    hd: "./Assets/Vehicles/Player/HD/Vehicles_rx7_HD_base_v01.png",
    pixel: "./Assets/Vehicles/Player/Pixel/Vehicles_rx7_pixel_base_v01.png",
  },
  CHIRON: {
    hd: "./Assets/Vehicles/Player/HD/Vehicles_chiron_HD_base_v01.png",
    pixel: "./Assets/Vehicles/Player/Pixel/Vehicles_chiron_pixel_base_v01.png",
  },
  CAMARO: {
    hd: "./Assets/Vehicles/Player/HD/Vehicles_camaro_pixel_base_v01.png",
    pixel: "./Assets/Vehicles/Player/Pixel/Vehicles_camaro_pixel_base_v01.png",
  },
};


const botVehicleAssets = {
  hd: [
    "./Assets/Vehicles/Bot/HD/Vehicles_Bluecar_HD_base_v01.png",
    "./Assets/Vehicles/Bot/HD/Vehicles_greencar_HD_base_v01.png",
    "./Assets/Vehicles/Bot/HD/Vehicles_greycar_HD_base_v01.png",
    "./Assets/Vehicles/Bot/HD/Vehicles_redcar_HD_base_v01.png",
    "./Assets/Vehicles/Bot/HD/Vehicles_yellowcar_HD_base_v01.png",
  ],
  pixel: [
    "./Assets/Vehicles/Bot/Pixel/Vehicles_Bluecar_pixel_base_v01.png",
    "./Assets/Vehicles/Bot/Pixel/Vehicles_greencar_pixel_base_v01.png",
    "./Assets/Vehicles/Bot/Pixel/Vehicles_greycar_pixel_base_v01.png",
    "./Assets/Vehicles/Bot/Pixel/Vehicles_redcar_pixel_base_v01.png",
    "./Assets/Vehicles/Bot/Pixel/Vehicles_yellowcar_pixel_base_v01.png",
  ],
};


const radioTracks = [
  "./Assets/Sounds/Onroad/radio/Sound_music_onroad_playsong1_sample_v01.mp3",
  "./Assets/Sounds/Onroad/radio/Sound_music_onroad_playsong2_sample_v01.mp3",
  "./Assets/Sounds/Onroad/radio/Sound_music_onroad_playsong3_loopX3_sample_v01.mp3",
];

const state = {
  running: true,
  gameOver: false,
  lane: 1,
  playerLanePosition: 1,
  score: 0,
  speed: 280,
  roadOffset: 0,
  enemies: [],
  keys: {
    left: false,
    right: false,
    accel: false,
    brake: false,
  },
  lastFrame: performance.now(),
  enemySpawnClock: 0,
  laneChangeBlockedUntil: 0,
  startedAt: performance.now(),
  takedowns: 0,
  overtakes: 0,
  collisions: 0,
  currentModal: null,
  shieldUntil: 0,
  eventLog: [],
  devHitboxVisible: DEV_HITBOX_QUERY,
  touchModeDetected: false,
  tutorialSeen: false,
  tutorialVisibleUntil: 0,
  speedProgressBoost: 0,
  tutorialDismissFn: null,
  lastLaneChangeAt: 0,
  lastLaneChangeDir: 0,
  giftDrops: [],
  giftSpawnClock: 0,
  giftSpawnTarget: GIFT_SPAWN_MIN_MS + Math.random() * (GIFT_SPAWN_MAX_MS - GIFT_SPAWN_MIN_MS),
};

const feedbackLayer = document.createElement("div");
feedbackLayer.className = "feedback-layer";
playApp?.appendChild(feedbackLayer);

function selectedVehicleSrc() {
  const selected = localStorage.getItem("selectedVehicle") || "PORSHE";
  const quality = localStorage.getItem("selectedVehicleQuality") || "hd";
  return vehicleAssets[selected]?.[quality] || vehicleAssets.PORSHE.hd;
}

function playSfx(audio) {
  if (!audio) return;
  audio.currentTime = 0;
  audio.play().catch(() => {});
}

function award(points) {
  state.score += points;
}
function getWalletCredits() {
  const raw = Number(localStorage.getItem(PLAYER_WALLET_KEY));
  if (Number.isFinite(raw) && raw >= 0) return Math.floor(raw);
  localStorage.setItem(PLAYER_WALLET_KEY, "2500");
  return 2500;
}

function addWalletCredits(amount) {
  const next = getWalletCredits() + amount;
  localStorage.setItem(PLAYER_WALLET_KEY, String(next));
  return next;
}

function getSavedRadioTrackIndex() {
  const raw = Number(localStorage.getItem(RADIO_TRACK_PREF_KEY));
  if (Number.isInteger(raw) && raw >= 0 && raw < radioTracks.length) return raw;
  return 0;
}

function saveRadioTrackIndex(index) {
  const safe = Number.isInteger(index) && index >= 0 && index < radioTracks.length ? index : 0;
  localStorage.setItem(RADIO_TRACK_PREF_KEY, String(safe));
}

function pushEvent(type, payload = {}) {
  state.eventLog.push({ type, at: performance.now(), ...payload });
  if (state.eventLog.length > MAX_RECENT_EVENTS) {
    state.eventLog.shift();
  }
}

function laneNearestGap(lane, progress) {
  let nearest = Infinity;
  state.enemies.forEach((enemy) => {
    if (!enemy.alive || enemy.lane != lane) return;
    nearest = Math.min(nearest, Math.abs(enemy.progress - progress));
  });
  return nearest;
}


function difficultyLevel() {
  return Math.min(5, Math.floor(state.score / BASE_DIFFICULTY_SCORE_STEP));
}

function addFloatingFeedback(text, type = "neutral") {
  if (!feedbackLayer) return;
  const feedback = document.createElement("div");
  feedback.className = `floating-feedback floating-feedback-${type}`;
  feedback.textContent = text;
  feedbackLayer.appendChild(feedback);
  setTimeout(() => feedback.remove(), 820);
}

function flashScreen(type = "neutral") {
  if (!playApp) return;
  playApp.classList.remove("flash-hit", "flash-takedown");
  if (type === "hit") playApp.classList.add("flash-hit");
  if (type === "takedown") playApp.classList.add("flash-takedown");
  setTimeout(() => {
    playApp.classList.remove("flash-hit", "flash-takedown");
  }, 260);
}

function playerLeftCss() {
  const laneFloor = Math.floor(state.playerLanePosition);
  const laneNext = Math.min(lanes.length - 1, laneFloor + 1);
  const blend = Math.max(0, Math.min(1, state.playerLanePosition - laneFloor));
  const playerX = lanes[laneFloor] + (lanes[laneNext] - lanes[laneFloor]) * blend;
  return laneToLeftCss(playerX);
}

function laneToLeftCss(laneValue) {
  return `calc(${Math.round(laneValue * 1000) / 10}% - 5.5%)`;
}

function hitboxAt(centerY) {
  return {
    front: centerY + HITBOX_FRONT_OFFSET,
    back: centerY - HITBOX_BACK_OFFSET,
  };
}

function hitboxOverlap(a, b, buffer = 0) {
  return Math.min(a.front, b.front) - Math.max(a.back, b.back) > -buffer;
}

function overlapFromRects(a, b) {
  const x = Math.min(a.right, b.right) - Math.max(a.left, b.left);
  const y = Math.min(a.bottom, b.bottom) - Math.max(a.top, b.top);
  return {
    x,
    y,
    intersects: x > 0 && y > 0,
    centerDx: (b.left + b.right) / 2 - (a.left + a.right) / 2,
  };
}

function playerHitboxX() {
  const laneFloor = Math.floor(state.playerLanePosition);
  const laneNext = Math.min(lanes.length - 1, laneFloor + 1);
  const blend = Math.max(0, Math.min(1, state.playerLanePosition - laneFloor));
  const x = lanes[laneFloor] + (lanes[laneNext] - lanes[laneFloor]) * blend;
  return {
    left: x - PLAYER_HITBOX_HALF_WIDTH,
    right: x + PLAYER_HITBOX_HALF_WIDTH,
    center: x,
  };
}

function enemyHitboxX(enemy) {
  const laneX = enemy.laneX ?? lanes[Math.round(enemy.lanePosition)] ?? lanes[enemy.lane] ?? lanes[1];
  return {
    left: laneX - BOT_HITBOX_HALF_WIDTH,
    right: laneX + BOT_HITBOX_HALF_WIDTH,
    center: laneX,
  };
}

function laneHasSpace(targetLane, progress, minGap = 0.14, ignoreEnemy = null) {
  return !state.enemies.some((enemy) => {
    if (!enemy.alive || enemy === ignoreEnemy) return false;
    if (Math.round(enemy.lanePosition) !== targetLane) return false;
    return Math.abs(enemy.progress - progress) < minGap;
  });
}

function syncHitboxVisibility() {
  if (!playApp) return;
  playApp.classList.toggle("dev-hitbox-visible", state.devHitboxVisible);
}

function placePlayer(animated = true) {
  if (!animated) playerCar.style.transition = "none";
  playerCar.style.left = playerLeftCss();
}

function createEnemy(prewarm = false) {
  const laneLoad = lanes.map(() => 0);
  state.enemies.forEach((enemy) => {
    laneLoad[enemy.lane] += 1;
  });

  const laneCandidates = lanes.map((_, index) => index).sort((a, b) => laneLoad[a] - laneLoad[b]);
  let chosenLane = laneCandidates[0];
  if (!prewarm && Math.random() < 0.7 && chosenLane === state.lane) {
    chosenLane = laneCandidates.find((lane) => lane !== state.lane) ?? chosenLane;
  }

  const enemy = document.createElement("img");
  enemy.className = "car enemy";
  const quality = Math.random() > 0.5 ? "hd" : "pixel";
  const pack = botVehicleAssets[quality];
  enemy.src = pack[Math.floor(Math.random() * pack.length)];

  const startProgress = prewarm ? 0.22 + Math.random() * 0.34 : -0.18 + Math.random() * 0.3;
  const nearestGap = laneNearestGap(chosenLane, startProgress);
  if (!prewarm && (nearestGap < MIN_SPAWN_PROGRESS_GAP || !laneHasSpace(chosenLane, startProgress, 0.2))) {
    return;
  }
  enemy.style.left = `calc(${Math.round(lanes[chosenLane] * 1000) / 10}% - 5.5%)`;
  enemy.style.top = `${startProgress * 100}%`;

  const model = {
    element: enemy,
    lane: chosenLane,
    progress: startProgress,
    speed: BOT_BASE_SPEED + Math.random() * 0.04,
    desiredSpeed: BOT_BASE_SPEED + Math.random() * 0.04,
    cruiseSpeed: BOT_BASE_SPEED + Math.random() * 0.05,
    alive: true,
    countedOvertake: false,
    targetLane: chosenLane,
    lanePosition: chosenLane,
    laneShiftClock: 0,
    steeringDir: 0,
    laneX: lanes[chosenLane],
  };

  enemy.style.transform = "rotate(0deg)";

  carsLayer.appendChild(enemy);
  state.enemies.push(model);
}

function removeEnemy(model) {
  model.alive = false;
  model.element.remove();
  state.enemies = state.enemies.filter((enemy) => enemy !== model);
}

function doTakedown(model, direction = 1) {
  if (!model.alive) return;
  model.alive = false;
  model.element.style.transition = "transform 460ms ease-out, opacity 460ms ease-out, top 460ms linear";
  model.element.style.transform = `translateX(${direction > 0 ? 52 : -52}px) rotate(${direction > 0 ? 210 : -210}deg) scale(0.95)`;
  model.element.style.opacity = "0";
  model.element.style.top = `${(model.progress + 0.18) * 100}%`;
  award(750);
  state.takedowns += 1;
  pushEvent("takedown", { lane: model.lane, score: state.score });
  addFloatingFeedback("TAKEDOWN +750", "takedown");
  flashScreen("takedown");
  playSfx(takedownSound);
  setTimeout(() => removeEnemy(model), 470);
}

function endGame() {
  if (state.gameOver) return;
  state.gameOver = true;
  state.running = false;
  state.collisions += 1;
  pushEvent("collision", { lane: state.lane, score: state.score });
  gameOverPanel.classList.remove("hidden");
  overlay.classList.add("hidden");
  settingsPopup.classList.add("hidden");
  confirmExitPopup.classList.add("hidden");
  pausePopup.classList.add("hidden");
  state.currentModal = "gameover";
  flashScreen("hit");
  playSfx(crashSound);
}

function syncOverlay() {
  const shouldShow = Boolean(state.currentModal);
  overlay.classList.toggle("hidden", !shouldShow);
}

function setModal(modalName) {
  state.currentModal = modalName;
  settingsPopup.classList.toggle("hidden", modalName !== "settings");
  confirmExitPopup.classList.toggle("hidden", modalName !== "confirmExit");
  pausePopup.classList.toggle("hidden", modalName !== "pause");
  gameOverPanel.classList.toggle("hidden", modalName !== "gameover");
  syncOverlay();
}


function attemptLaneTakedownOnLaneChange(previousLane, nextLane) {
  const now = performance.now();
  if (now - state.startedAt < START_GRACE_MS) return;
  if (nextLane === previousLane) return;
  // The actual takedown is resolved in handlePlayerBotBump using strict rect overlap.
}

function moveLane(direction) {
  const now = performance.now();
  if (now < state.laneChangeBlockedUntil) return;

  const previousLane = state.lane;
  const next = Math.max(0, Math.min(lanes.length - 1, state.lane + direction));
  if (next === state.lane) return;

  state.lane = next;
  state.laneChangeBlockedUntil = now + LANE_CHANGE_COOLDOWN_MS;
  state.shieldUntil = now + LANE_SHIELD_MS;
  dismissTutorialOverlay(true);
  attemptLaneTakedownOnLaneChange(previousLane, next);
  state.lastLaneChangeAt = now;
  state.lastLaneChangeDir = Math.sign(next - previousLane);
}


function handlePlayerBotBump(enemy, now) {
  if (!enemy.alive || state.gameOver) return;
  if (now - state.startedAt < START_GRACE_MS) return;

  const playerRect = playerCar.getBoundingClientRect();
  const enemyRect = enemy.element.getBoundingClientRect();
  const overlap = overlapFromRects(playerRect, enemyRect);
  if (!overlap.intersects) return;

  const isSteeringWindow = now - state.lastLaneChangeAt <= TAKEDOWN_STEER_WINDOW_MS;
  const steeringTowardEnemy = Math.sign(overlap.centerDx) === state.lastLaneChangeDir;

  if (isSteeringWindow && steeringTowardEnemy) {
    doTakedown(enemy, state.lastLaneChangeDir || (overlap.centerDx > 0 ? 1 : -1));
    state.shieldUntil = now + 140;
    return;
  }

  if (now >= state.shieldUntil) endGame();
}

function updateEnemy(enemy, dt, now) {
  if (!enemy.alive) return;

  enemy.laneShiftClock -= dt;
  if (enemy.laneShiftClock <= 0) {
    enemy.laneShiftClock = 0.6 + Math.random() * 1.6;
    const laneChoices = [enemy.lane - 1, enemy.lane, enemy.lane + 1].filter((lane) => lane >= 0 && lane < lanes.length);
    enemy.targetLane = laneChoices[Math.floor(Math.random() * laneChoices.length)];
  }

  if (enemy.targetLane !== enemy.lane) {
    const dir = enemy.targetLane > enemy.lane ? 1 : -1;
    enemy.steeringDir = dir;
    enemy.lanePosition += dir * dt * 1.35;
    if ((dir > 0 && enemy.lanePosition >= enemy.targetLane) || (dir < 0 && enemy.lanePosition <= enemy.targetLane)) {
      enemy.lanePosition = enemy.targetLane;
      enemy.lane = enemy.targetLane;
      enemy.steeringDir = 0;
    }
  } else {
    enemy.lanePosition += (enemy.lane - enemy.lanePosition) * dt * 8;
    enemy.steeringDir = 0;
  }

  const laneFloor = Math.floor(enemy.lanePosition);
  const laneNext = Math.min(lanes.length - 1, laneFloor + 1);
  const blend = Math.max(0, Math.min(1, enemy.lanePosition - laneFloor));
  const laneX = lanes[laneFloor] + (lanes[laneNext] - lanes[laneFloor]) * blend;
  enemy.laneX = laneX;
  enemy.element.style.left = laneToLeftCss(laneX);

  enemy.element.style.transform = `rotate(${enemy.steeringDir * 9}deg)`;

  enemy.speed += (enemy.desiredSpeed - enemy.speed) * dt * 2.2;
  const playerRelativeSpeed = Math.max(BOT_MIN_SPEED + 0.01, state.speed / 1420 - BOT_PLAYER_SPEED_MARGIN);
  enemy.speed = Math.max(BOT_MIN_SPEED, Math.min(BOT_MAX_SPEED, playerRelativeSpeed, enemy.speed));
  enemy.progress += (state.speed / 1240 - enemy.speed) * dt;
  enemy.element.style.top = `${enemy.progress * 100}%`;

  if (!enemy.countedOvertake && enemy.progress > 1.02) {
    enemy.countedOvertake = true;
    state.overtakes += 1;
    award(180);
    pushEvent("overtake", { lane: enemy.lane, score: state.score });
    addFloatingFeedback("OVERTAKE +180", "overtake");
  }

  if (enemy.progress > 1.18 || enemy.progress < -0.25) {
    removeEnemy(enemy);
    return;
  }

  if (now - state.startedAt < START_GRACE_MS) return;

  handlePlayerBotBump(enemy, now);
}

function hasUnfairLaneBlock() {
  const blockWindowTop = 0.66;
  const blockWindowBottom = 0.9;
  return lanes.every((_, lane) => {
    return state.enemies.some((enemy) => {
      if (!enemy.alive || enemy.lane !== lane) return false;
      return enemy.progress > blockWindowTop && enemy.progress < blockWindowBottom;
    });
  });
}

function rebalanceUnfairBlock() {
  if (!hasUnfairLaneBlock()) return;
  const candidate = state.enemies.find((enemy) => {
    if (!enemy.alive) return false;
    return enemy.progress > 0.66 && enemy.progress < 0.9;
  });
  if (!candidate) return;
  candidate.progress = 0.22;
  candidate.element.style.top = `${candidate.progress * 100}%`;
}


function maybeAssignLaneChange(enemy) {
  const laneChoices = [enemy.lane - 1, enemy.lane + 1]
    .filter((lane) => lane >= 0 && lane < lanes.length)
    .filter((lane) => laneHasSpace(lane, enemy.progress, 0.16, enemy));
  if (!laneChoices.length) return;
  enemy.targetLane = laneChoices[Math.floor(Math.random() * laneChoices.length)];
}

function regulateBotTraffic(dt) {
  const alive = state.enemies.filter((enemy) => enemy.alive);
  const byLane = lanes.map(() => []);
  alive.forEach((enemy) => {
    byLane[Math.round(enemy.lanePosition)]?.push(enemy);
  });

  byLane.forEach((laneEnemies) => {
    laneEnemies.sort((a, b) => a.progress - b.progress);
    laneEnemies.forEach((enemy, index) => {
      const trafficDrift = (Math.random() - 0.5) * 0.012;
      const playerRelativeSpeed = Math.max(BOT_MIN_SPEED + 0.01, state.speed / 1420 - BOT_PLAYER_SPEED_MARGIN);
      const baseCruise = enemy.cruiseSpeed + difficultyLevel() * 0.006 + trafficDrift;
      const base = Math.min(baseCruise, playerRelativeSpeed);
      enemy.desiredSpeed = Math.max(BOT_MIN_SPEED, Math.min(BOT_MAX_SPEED, base));
      if (index === 0) return;
      const front = laneEnemies[index - 1];
      const gap = enemy.progress - front.progress;
      if (gap < BOT_SAFE_GAP) {
        enemy.desiredSpeed = Math.max(BOT_MIN_SPEED, front.speed - 0.06);
        if (gap < BOT_SAFE_GAP * 0.7) {
          maybeAssignLaneChange(enemy);
        }
      }
    });
  });

  for (let i = 0; i < alive.length; i += 1) {
    for (let j = i + 1; j < alive.length; j += 1) {
      const a = alive[i];
      const b = alive[j];
      if (Math.abs(a.lanePosition - b.lanePosition) > 0.45) continue;
      if (!hitboxOverlap(hitboxAt(a.progress), hitboxAt(b.progress))) continue;
      const rear = a.progress > b.progress ? a : b;
      const front = rear === a ? b : a;
      rear.speed = Math.max(BOT_MIN_SPEED, rear.speed - 0.08);
      front.speed = Math.min(BOT_MAX_SPEED, front.speed + 0.05);
      maybeAssignLaneChange(rear);
    }
  }
}


function spawnGiftDrop() {
  const lane = Math.floor(Math.random() * lanes.length);
  if (!laneHasSpace(lane, -0.22, 0.22)) return;
  const gift = document.createElement("img");
  gift.className = "gift-drop";
  gift.src = "./Assets/UI/Icons/ui_icon_gift_v01.svg";
  gift.style.left = laneToLeftCss(lanes[lane]);
  gift.style.top = "-22%";
  carsLayer.appendChild(gift);

  state.giftDrops.push({
    element: gift,
    lane,
    progress: -0.22,
    collected: false,
  });
}

function updateGiftDrops(dt) {
  const playerYBox = hitboxAt(PLAYER_Y);
  const playerX = playerHitboxX();
  state.giftDrops = state.giftDrops.filter((gift) => {
    gift.progress += (state.speed / 1240) * dt;
    gift.element.style.top = `${gift.progress * 100}%`;

    if (!gift.collected) {
      const giftY = hitboxAt(gift.progress);
      const yOverlap = Math.min(playerYBox.front, giftY.front) - Math.max(playerYBox.back, giftY.back);
      const giftXCenter = lanes[gift.lane];
      const giftLeft = giftXCenter - BOT_HITBOX_HALF_WIDTH;
      const giftRight = giftXCenter + BOT_HITBOX_HALF_WIDTH;
      const xOverlap = Math.min(playerX.right, giftRight) - Math.max(playerX.left, giftLeft);
      if (yOverlap > 0 && xOverlap > 0) {
        gift.collected = true;
        addWalletCredits(GIFT_REWARD_CREDITS);
        award(120);
        addFloatingFeedback(`CADEAU +${GIFT_REWARD_CREDITS} CR`, "neutral");
      }
    }

    if (gift.collected || gift.progress > 1.2) {
      gift.element.remove();
      return false;
    }
    return true;
  });
}

function giftSpawnTick(dt) {
  state.giftSpawnClock += dt * 1000;
  if (state.giftSpawnClock < state.giftSpawnTarget) return;
  state.giftSpawnClock = 0;
  state.giftSpawnTarget = GIFT_SPAWN_MIN_MS + Math.random() * (GIFT_SPAWN_MAX_MS - GIFT_SPAWN_MIN_MS);
  spawnGiftDrop();
}

function spawnTick() {
  state.enemySpawnClock += performance.now() - state.lastFrame;
  const level = difficultyLevel();
  const spawnInterval = Math.max(520, ENEMY_SPAWN_INTERVAL_MS - level * 90);
  const maxEnemies = Math.min(9, MAX_ENEMIES + Math.floor(level / 2));
  if (state.enemySpawnClock < spawnInterval || state.enemies.length >= maxEnemies) return;
  state.enemySpawnClock = 0;

  const blockedNearPlayerLane = state.enemies.some((enemy) => enemy.alive && Math.round(enemy.lanePosition) === state.lane && enemy.progress > 0.62 && enemy.progress < 0.95);
  if (blockedNearPlayerLane) {
    // Try spawning but avoid player's lane in unfair window.
    createEnemy(false);
    const last = state.enemies[state.enemies.length - 1];
    if (last.lane === state.lane) {
      last.lane = (last.lane + 1 + Math.floor(Math.random() * 2)) % lanes.length;
      last.targetLane = last.lane;
      last.lanePosition = last.lane;
      last.element.style.left = laneToLeftCss(lanes[last.lane]);
    }
    return;
  }

  createEnemy(false);
  rebalanceUnfairBlock();
}

function updateDifficultyUiHint() {
  const level = difficultyLevel();
  if (level >= 4 && state.score % 500 < 12) {
    addFloatingFeedback("INTENSITÉ MAX", "neutral");
  }
}

function togglePause(force = null) {
  if (state.gameOver) return;
  state.running = force === null ? !state.running : force;
  if (state.running) {
    setModal(null);
    return;
  }
  setModal("pause");
}

function showSettings(show) {
  if (state.gameOver) return;
  if (show) {
    state.running = false;
    setModal("settings");
  } else {
    setModal(null);
    state.running = true;
  }
}

function mainLoop(now) {
  const rawFrameMs = now - state.lastFrame;
  frameBudgetTracker.tick(rawFrameMs);
  const dt = Math.min(rawFrameMs / 1000, 0.04);

  if (state.running) {
    state.speedProgressBoost = Math.min(220, state.speedProgressBoost + dt * (8 + difficultyLevel() * 1.2));
    const dynamicCruise = 300 + state.speedProgressBoost;

    if (state.keys.accel) state.speed = Math.min(520, state.speed + 250 * dt);
    else if (state.keys.brake) state.speed = Math.max(190, state.speed - 260 * dt);
    else state.speed += (dynamicCruise - state.speed) * dt * 1.55;

    state.playerLanePosition += (state.lane - state.playerLanePosition) * Math.min(1, dt * 12);
    placePlayer();

    state.roadOffset += (state.speed * 1.35) * dt;
    road.style.backgroundPosition = `center ${state.roadOffset}px`;
    road.style.backgroundSize = `${160 + (state.speed - 200) * 0.11}% auto`;
    playerCar.style.transform = `scale(${1 + Math.max(0, (state.speed - 260)) / 2200})`;

    award(Math.floor(state.speed * dt * 0.75));
    giftSpawnTick(dt);
    spawnTick();
    updateDifficultyUiHint();

    const nowTime = performance.now();
    regulateBotTraffic(dt);
    [...state.enemies].forEach((enemy) => updateEnemy(enemy, dt, nowTime));
    updateGiftDrops(dt);
  }

  scoreValue.textContent = String(state.score).padStart(10, "0");
  speedValue.textContent = String(Math.floor(state.speed)).padStart(4, "0");

  state.lastFrame = now;
  requestAnimationFrame(mainLoop);
}


function ensureRadioPlayback() {
  if (!radioPlayer) return;
  const pick = Number(radioSelect?.value ?? getSavedRadioTrackIndex());
  saveRadioTrackIndex(pick);
  const next = radioTracks[pick] || radioTracks[0];
  if (radioPlayer.src.endsWith(next)) return;
  radioPlayer.src = next;
  radioPlayer.loop = true;
  radioPlayer.volume = 0.62;
  radioPlayer.play().catch(() => {});
}


function pauseAllRuntimeAudio() {
  radioPlayer?.pause();
  crashSound?.pause();
  takedownSound?.pause();
}

function onAppBackground() {
  if (!state.gameOver) {
    state.running = false;
    setModal("pause");
  }
  pauseAllRuntimeAudio();
}

async function navigateAway(targetHref) {
  state.running = false;
  pauseAllRuntimeAudio();
  await runExitTransition({ appRoot: playApp });
  window.location.href = targetHref;
}

function dismissTutorialOverlay(force = false) {
  if (state.tutorialSeen || !state.tutorialDismissFn) return;
  if (!force && performance.now() < state.tutorialVisibleUntil) return;
  state.tutorialSeen = true;
  state.tutorialDismissFn();
  state.tutorialDismissFn = null;
}

function setupTutorialOverlay() {
  const overlayEl = document.createElement("div");
  overlayEl.className = "tutorial-overlay";
  overlayEl.id = "tutorialOverlay";
  overlayEl.innerHTML = '<div class="tutorial-card"><div class="tutorial-hand">🖐️</div><div>Swipe ou tap gauche/droite pour changer de voie</div></div>';
  playApp?.appendChild(overlayEl);

  state.tutorialVisibleUntil = performance.now() + 900;
  state.tutorialDismissFn = () => overlayEl.remove();

  const keyDismiss = () => dismissTutorialOverlay();
  window.addEventListener("keydown", keyDismiss, { once: true });
}

function setupTapSwipeControls() {
  if (!playApp) return () => {};
  let pointerStartX = null;
  let pointerStartY = null;
  const SWIPE_MIN = 30;

  const onDown = (event) => {
    pointerStartX = event.clientX;
    pointerStartY = event.clientY;
    state.touchModeDetected = true;
    playApp.classList.add("touch-ui-mode");
  };

  const onUp = (event) => {
    if (pointerStartX === null || pointerStartY === null) return;
    const dx = event.clientX - pointerStartX;
    const dy = event.clientY - pointerStartY;
    const absX = Math.abs(dx);
    const absY = Math.abs(dy);

    if (absX >= SWIPE_MIN && absX > absY) {
      moveLane(dx > 0 ? 1 : -1);
    } else {
      const bounds = playApp.getBoundingClientRect();
      const localX = event.clientX - bounds.left;
      moveLane(localX < bounds.width / 2 ? -1 : 1);
    }

    pointerStartX = null;
    pointerStartY = null;
  };

  playApp.addEventListener("pointerdown", onDown, { passive: true });
  playApp.addEventListener("pointerup", onUp, { passive: true });

  return () => {
    playApp.removeEventListener("pointerdown", onDown);
    playApp.removeEventListener("pointerup", onUp);
  };
}

function bindControls() {
  const onKey = (pressed) => (event) => {
    const key = event.key.toLowerCase();

    if (["arrowleft", "a"].includes(key)) {
      if (pressed && !state.keys.left) moveLane(-1);
      state.keys.left = pressed;
      event.preventDefault();
    }

    if (["arrowright", "d"].includes(key)) {
      if (pressed && !state.keys.right) moveLane(1);
      state.keys.right = pressed;
      event.preventDefault();
    }

    if (["arrowup", "w"].includes(key)) {
      state.keys.accel = pressed;
      event.preventDefault();
    }

    if (["arrowdown", "s"].includes(key)) {
      state.keys.brake = pressed;
      event.preventDefault();
    }

    if (pressed && key === "escape") {
      togglePause();
    }
  };

  window.addEventListener("keydown", onKey(true));
  window.addEventListener("keyup", onKey(false));


  setupTutorialOverlay();
  setupTapSwipeControls();

  pauseBtn.addEventListener("click", () => togglePause());
  settingsBtn.addEventListener("click", () => showSettings(true));
  closeSettingsBtn.addEventListener("click", () => showSettings(false));

  menuBtnInSettings.addEventListener("click", () => {
    setModal("confirmExit");
  });

  confirmNo.addEventListener("click", () => {
    setModal("settings");
  });

  confirmYes.addEventListener("click", () => {
    navigateAway("index.html");
  });

  overlay.addEventListener("click", () => {
    if (state.currentModal === "confirmExit") {
      setModal("settings");
      return;
    }
    if (state.currentModal === "settings") {
      showSettings(false);
      return;
    }
    if (state.currentModal === "pause") {
      togglePause(true);
    }
  });

  resumeBtn.addEventListener("click", () => togglePause(true));
  menuBtnInPause?.addEventListener("click", () => {
    navigateAway("index.html");
  });
  retryBtn.addEventListener("click", () => window.location.reload());
  menuBtnGameOver.addEventListener("click", () => {
    navigateAway("index.html");
  });

  radioSelect?.addEventListener("change", () => {
    saveRadioTrackIndex(Number(radioSelect.value));
    ensureRadioPlayback();
  });
  const onFirstTouch = () => {
    ensureRadioPlayback();
    dismissTutorialOverlay();
    if (state.tutorialSeen) window.removeEventListener("pointerdown", onFirstTouch);
  };
  window.addEventListener("pointerdown", onFirstTouch);

  document.addEventListener("visibilitychange", () => {
    if (document.hidden) onAppBackground();
  });
  window.addEventListener("blur", onAppBackground);
  window.addEventListener("pagehide", onAppBackground);
}

function init() {
  playerCar.src = selectedVehicleSrc();
  if (radioSelect) radioSelect.value = String(getSavedRadioTrackIndex());
  state.playerLanePosition = state.lane;
  placePlayer(false);
  bindControls();
  ensureRadioPlayback();

  for (let i = 0; i < 3; i += 1) {
    createEnemy(true);
  }

  state.lastFrame = performance.now();
  requestAnimationFrame(mainLoop);
}

window.__ctGameState = state;
window.__ctGameDebug = {
  difficultyLevel,
  laneNearestGap,
};

init();
