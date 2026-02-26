import { initPagePerf, markNavigationStart, reportNavigationArrival, runExitTransition } from "./perf-tools.js";
import { navigateWithPreload as sharedNavigateWithPreload, preloadAsset } from "./src/core/navigation.js";
const overlay = document.getElementById("overlay");
const popups = {
  settingsPopup: document.getElementById("settingsPopup"),
  profilePopup: document.getElementById("profilePopup"),
  shopPopup: document.getElementById("shopPopup"),
  constructionPopup: document.getElementById("constructionPopup"),
};

const bootScreen = document.getElementById("bootScreen");
const introVideo = document.getElementById("introVideo");
const bootStatus = document.getElementById("bootStatus");
const skipIntroBtn = document.getElementById("skipIntroBtn");
const appRoot = document.querySelector(".app");
const navLoading = document.getElementById("navLoading");
const menuRoad = document.getElementById("menuRoad");
const menuTraffic = document.getElementById("menuTraffic");
const menuTrees = document.getElementById("menuTrees");
const roadImg1 = document.getElementById("roadImg1");
const roadImg2 = document.getElementById("roadImg2");
const constructionText = document.getElementById("constructionText");

const music = document.getElementById("mainMenuMusic");
let introAudioUnlocked = false;
const volumeSlider = document.getElementById("volumeSlider");
const qualityButtons = Array.from(document.querySelectorAll(".toggle"));

const cars = {
  hd: [
    ["PORSHE HD", "/Assets/Vehicles/Player/HD/Vehicles_porshe_HD_base_v01.png"],
    ["BMW HD", "/Assets/Vehicles/Player/HD/Vehicles_bmw_HD_base_v01.png"],
    ["GALLARDO HD", "/Assets/Vehicles/Player/HD/Vehicles_gallardo_HD_base_v01.png"],
    ["RX7 HD", "/Assets/Vehicles/Player/HD/Vehicles_rx7_HD_base_v01.png"],
    ["CHIRON HD", "/Assets/Vehicles/Player/HD/Vehicles_chiron_HD_base_v01.png"],
    ["CAMARO HD", "/Assets/Vehicles/Player/HD/Vehicles_camaro_pixel_base_v01.png"],
  ],
  pixel: [
    ["PORSHE PIXEL", "/Assets/Vehicles/Player/Pixel/Vehicles_porshe_pixel_base_v01.png"],
    ["BMW PIXEL", "/Assets/Vehicles/Player/Pixel/Vehicles_bmw_pixel_base_v01.png"],
    ["GALLARDO PIXEL", "/Assets/Vehicles/Player/Pixel/Vehicles_gallardo_pixel_base_v01.png"],
    ["RX7 PIXEL", "/Assets/Vehicles/Player/Pixel/Vehicles_rx7_pixel_base_v01.png"],
    ["CHIRON PIXEL", "/Assets/Vehicles/Player/Pixel/Vehicles_chiron_pixel_base_v01.png"],
    ["CAMARO PIXEL", "/Assets/Vehicles/Player/Pixel/Vehicles_camaro_pixel_base_v01.png"],
  ],
};

const INTRO_VIDEO_SRC = "/Assets/Video/Intro.mp4";
const INTRO_SEEN_SESSION_KEY = "ct_intro_seen_session_v1";
const preloadAssets = [
  "/Assets/Road/Background_mainmenu_nature_base_v01.svg",
  "/Assets/UI/Decor/tree_complete.svg",
  "/Assets/Branding/Logo/Brand_crashtown_logo_main_v02.svg",
  "/Assets/UI/Screens/MainMenu/ui_garage_menu_bg_v01.svg",
  "/Assets/Vehicles/Player/HD/Vehicles_porshe_HD_base_v01.png",
  "/Assets/Vehicles/Player/HD/Vehicles_bmw_HD_base_v01.png",
  "/Assets/Vehicles/Player/HD/Vehicles_gallardo_HD_base_v01.png",
  "/Assets/Vehicles/Player/HD/Vehicles_rx7_HD_base_v01.png",
  "/Assets/Vehicles/Player/HD/Vehicles_chiron_HD_base_v01.png",
  "/Assets/Vehicles/Player/HD/Vehicles_camaro_pixel_base_v01.png",
  "/Assets/Sounds/Mainmenu/Song_mainmenu_base_v01.mp3",
  "/Assets/Sounds/Garage/Music/Sound_music_garage_playsong1_sample_v01.mp3",
  INTRO_VIDEO_SRC,
];

let selectedQuality = localStorage.getItem("selectedVehicleQuality") || "hd";
let carIndex = 0;
const variantOrder = ["hd", "pixel"];
const shopVariantLabel = document.getElementById("shopVariantLabel");
const profileNicknameInput = document.getElementById("profileNickname");
const profileLevel = document.getElementById("profileLevel");
const profileRank = document.getElementById("profileRank");
const walletAmount = document.getElementById("walletAmount");
const menuMessageBox = document.getElementById("menuMessageBox");

const PLAYER_PROFILE_KEY = "ct_player_profile_v1";
const PLAYER_WALLET_KEY = "ct_wallet_credits_v1";
const DAILY_REWARD_KEY = "ct_daily_reward_last_claim_v1";
const MENU_BROADCAST_TEXT = "V0.03, mise à jour du menu principal, avec un petit décor animé en background et une nouvelle voiture jouable (merci à vous mes bro <3) ! Prochainement: boutique, classement, et plus encore...";

const PAGE_NAME = "index.html";
initPagePerf(PAGE_NAME);
reportNavigationArrival(PAGE_NAME);


function getPlayerProfile() {
  const fallback = { nickname: "CrashPilot", level: 1, rank: "Rookie" };
  try {
    const raw = localStorage.getItem(PLAYER_PROFILE_KEY);
    if (!raw) return fallback;
    const parsed = JSON.parse(raw);
    return {
      nickname: String(parsed.nickname || fallback.nickname).slice(0, 20),
      level: Number(parsed.level) > 0 ? Number(parsed.level) : fallback.level,
      rank: parsed.rank || fallback.rank,
    };
  } catch {
    return fallback;
  }
}

function savePlayerProfile(profile) {
  localStorage.setItem(PLAYER_PROFILE_KEY, JSON.stringify(profile));
}

function getWalletCredits() {
  const raw = Number(localStorage.getItem(PLAYER_WALLET_KEY));
  if (Number.isFinite(raw) && raw >= 0) return Math.floor(raw);
  localStorage.setItem(PLAYER_WALLET_KEY, "2500");
  return 2500;
}

function renderProfile() {
  const profile = getPlayerProfile();
  if (profileNicknameInput) profileNicknameInput.value = profile.nickname;
  if (profileLevel) profileLevel.textContent = `Niveau: ${profile.level}`;
  if (profileRank) profileRank.textContent = `Classement: ${profile.rank}`;
}


function renderMenuBroadcast() {
  if (!menuMessageBox) return;
  const configured = localStorage.getItem("ct_admin_broadcast_text_v1");
  menuMessageBox.textContent = configured || MENU_BROADCAST_TEXT;
}

function renderWallet() {
  if (!walletAmount) return;
  walletAmount.textContent = `Crédits: ${getWalletCredits()}`;
}

function saveProfileFromForm() {
  const base = getPlayerProfile();
  const nextNickname = (profileNicknameInput?.value || "").trim();
  const profile = {
    ...base,
    nickname: nextNickname.length > 0 ? nextNickname : base.nickname,
  };
  savePlayerProfile(profile);
  renderProfile();
  showFxNotice("Profil sauvegardé");
}

function claimDailyReward() {
  const now = Date.now();
  const last = Number(localStorage.getItem(DAILY_REWARD_KEY) || 0);
  const oneDay = 24 * 60 * 60 * 1000;
  if (now - last < oneDay) {
    const remainingH = Math.ceil((oneDay - (now - last)) / (60 * 60 * 1000));
    showFxNotice(`Daily déjà pris · ${remainingH}h restantes`);
    return;
  }

  const gain = 300;
  const credits = getWalletCredits() + gain;
  localStorage.setItem(PLAYER_WALLET_KEY, String(credits));
  localStorage.setItem(DAILY_REWARD_KEY, String(now));
  renderWallet();
  showFxNotice(`Daily +${gain} crédits`);
}

function showFxNotice(text) {
  const banner = document.createElement("div");
  banner.className = "menu-fx-banner";
  banner.textContent = text;
  document.body.appendChild(banner);
  window.setTimeout(() => banner.remove(), 1200);
}

function equipCurrentFromShop() {
  const [name] = cars[selectedQuality][carIndex];
  const vehicleId = name.split(" ")[0].toUpperCase();
  localStorage.setItem("selectedVehicle", vehicleId);
  localStorage.setItem("selectedVehicleQuality", selectedQuality);
  showFxNotice(`${vehicleId} équipé (${selectedQuality.toUpperCase()})`);
}

function openPopup(popupId) {
  overlay.classList.remove("hidden");
  popups[popupId].classList.remove("hidden");
}

function closePopup(popupId) {
  popups[popupId].classList.add("hidden");
  const hasVisiblePopup = Object.values(popups).some((popup) => !popup.classList.contains("hidden"));
  if (!hasVisiblePopup) {
    overlay.classList.add("hidden");
  }
}

function openConstruction(featureName) {
  constructionText.textContent = `${featureName} est en construction.`;
  openPopup("constructionPopup");
}

function renderCar() {
  const [name, src] = cars[selectedQuality][carIndex];
  const carImage = document.getElementById("carImage");
  const carName = document.getElementById("carName");

  carImage.src = src;
  carImage.alt = name;
  carName.textContent = `${name} · Couleurs dispo: 5 (à brancher)`;
  if (shopVariantLabel) shopVariantLabel.textContent = selectedQuality.toUpperCase();
}


function unlockIntroAudio() {
  if (introAudioUnlocked) return;
  introAudioUnlocked = true;
  introVideo.muted = false;
  introVideo.volume = 1;
  introVideo.play();
}

function hideBootScreen() {
  bootScreen.classList.add("fade-out");
  appRoot.classList.remove("app-hidden");
  setTimeout(() => {
    introVideo.pause();
    introVideo.removeAttribute("src");
    introVideo.load();
    bootScreen.classList.add("hidden");
  }, 220);
}

function handleAppVisibility() {
  if (document.hidden) {
    music.pause();
    sceneState.running = false;
    if (sceneState.rafId) cancelAnimationFrame(sceneState.rafId);
    sceneState.rafId = null;
  } else if (!sceneState.running) {
    sceneState.running = true;
    sceneState.lastTs = 0;
    sceneState.rafId = requestAnimationFrame(sceneLoop);
  }
}

function cycleShopVariant(direction) {
  const idx = variantOrder.indexOf(selectedQuality);
  const next = (idx + direction + variantOrder.length) % variantOrder.length;
  selectedQuality = variantOrder[next];
  localStorage.setItem("selectedVehicleQuality", selectedQuality);

  qualityButtons.forEach((btn) => {
    btn.classList.toggle("active", btn.dataset.quality === selectedQuality);
  });

  renderCar();
}

function setupAssetFallbacks() {
  document.querySelectorAll("img[data-asset-name]").forEach((img) => {
    img.addEventListener("error", () => {
      const placeholder = document.createElement("div");
      placeholder.className = "placeholder";
      placeholder.style.width = `${img.clientWidth || 120}px`;
      placeholder.style.height = `${img.clientHeight || 48}px`;
      placeholder.textContent = `Placeholder: ${img.dataset.assetName}`;
      img.replaceWith(placeholder);
    });
  });
}

const sceneState = {
  running: true,
  rafId: null,
  lastTs: 0,
  lastShadowUpdate: 0,
  roadOffset: 0,
  cars: [],
  trees: [],
  lanes: [29, 41.5, 53.5, 66],
  collisionTimer: 0,
};

const ROAD_SCROLL_PX_PER_SEC = 290;
const TREE_SCROLL_PERCENT_PER_SEC = 24;

const raceCarAssets = [
  "/Assets/Vehicles/Player/HD/Vehicles_porshe_HD_base_v01.png",
  "/Assets/Vehicles/Player/HD/Vehicles_bmw_HD_base_v01.png",
  "/Assets/Vehicles/Player/HD/Vehicles_gallardo_HD_base_v01.png",
  "/Assets/Vehicles/Player/HD/Vehicles_rx7_HD_base_v01.png",
  "/Assets/Vehicles/Player/HD/Vehicles_chiron_HD_base_v01.png",
  "/Assets/Vehicles/Player/HD/Vehicles_camaro_pixel_base_v01.png",
];

function createRaceCar() {
  if (!menuTraffic) return null;
  const el = document.createElement("img");
  el.className = "menu-race-car";
  el.alt = "";
  el.setAttribute("aria-hidden", "true");
  menuTraffic.appendChild(el);

  const car = {
    el,
    lane: sceneState.lanes[Math.floor(Math.random() * sceneState.lanes.length)],
    xJitter: (Math.random() * 2 - 1) * 0.7,
    speed: 26 + Math.random() * 18,
    y: 112 + Math.random() * 38,
    phase: Math.random() * Math.PI * 2,
    crashUntil: 0,
  };

  resetRaceCar(car);
  sceneState.cars.push(car);
  return car;
}

function resetRaceCar(car) {
  car.lane = sceneState.lanes[Math.floor(Math.random() * sceneState.lanes.length)];
  car.xJitter = (Math.random() * 2 - 1) * 0.8;
  car.speed = 26 + Math.random() * 18;
  car.y = 108 + Math.random() * 44;
  car.phase = Math.random() * Math.PI * 2;
  car.crashUntil = 0;
  car.el.classList.remove("crash");
  car.el.src = raceCarAssets[Math.floor(Math.random() * raceCarAssets.length)];
}

function createTree(side) {
  if (!menuTrees) return null;
  const el = document.createElement("img");
  el.className = "menu-tree";
  el.src = "/Assets/UI/Decor/tree_complete.svg";
  el.alt = "";
  el.setAttribute("aria-hidden", "true");
  menuTrees.appendChild(el);

  const tree = {
    el,
    side,
    width: 24,
    y: -40,
    speed: 24,
    scale: 1,
    x: 0,
  };

  resetTree(tree, true);
  sceneState.trees.push(tree);
  return tree;
}

function resetTree(tree, initial = false) {
  const sameSideTrees = sceneState.trees
    .filter((t) => t !== tree && t.side === tree.side)
    .sort((a, b) => a.y - b.y);
  const topY = sameSideTrees.length > 0 ? sameSideTrees[0].y : -20;
  const highest = Math.min(topY, -20); 
  const spacing = 22 + Math.random() * 16;
  tree.y = initial ? (Math.random() * 130) - 20 : highest - spacing;
  tree.width = 24 + Math.random() * 8;
  const dynamicTreeSpeed = (ROAD_SCROLL_PX_PER_SEC / window.innerHeight) * 100;
  tree.speed = dynamicTreeSpeed;
  tree.scale = 0.84 + Math.random() * 0.32;
  tree.x = tree.side === "left"
    ? (-22 + Math.random() * 10)
    : (82 + Math.random() * 10);
}

function applyTreeDepthVisual(tree, yPercent, baseScale, phase = 0, updateShadow = false) {
  const progress = Math.max(0, Math.min(1, (yPercent + 24) / 160));
  const depthScale = baseScale + Math.max(0, Math.min(0.14, (yPercent + 20) / 450));
  const sway = Math.sin(phase) * 0.45;

  tree.el.style.top = `${yPercent}%`;
  tree.el.style.left = `${tree.x + sway}%`;
  tree.el.style.width = `${tree.width}%`;
  tree.el.style.transform = `scale(${depthScale})`;
  if (!updateShadow) return;

  const shadowX = tree.side === "left" ? 9 : -9;
  const shadowY = 14 - 24 * progress;
  const shadowAlpha = 0.18 + (1 - progress) * 0.08;
  tree.el.style.filter = `drop-shadow(${shadowX}px ${shadowY}px 7px rgba(0, 0, 0, ${shadowAlpha.toFixed(3)}))`;
}

function enforceLaneSpacing() {
  const minGap = 14;
  for (const lane of sceneState.lanes) {
    const laneCars = sceneState.cars
      .filter((car) => car.lane === lane)
      .sort((a, b) => b.y - a.y);

    for (let i = 1; i < laneCars.length; i += 1) {
      const front = laneCars[i - 1];
      const back = laneCars[i];
      if (front.y - back.y < minGap) {
        back.y = front.y - minGap;
        back.speed = Math.min(back.speed, front.speed - 1);
      }
    }
  }
}

function maybeTriggerCrash(nowMs) {
  if (sceneState.collisionTimer > nowMs) return;
  const pairs = [];
  for (let i = 0; i < sceneState.cars.length; i += 1) {
    for (let j = i + 1; j < sceneState.cars.length; j += 1) {
      const a = sceneState.cars[i];
      const b = sceneState.cars[j];
      const laneDistance = Math.abs(sceneState.lanes.indexOf(a.lane) - sceneState.lanes.indexOf(b.lane));
      if (laneDistance !== 1) continue;
      if (Math.abs(a.y - b.y) > 3.2) continue;
      if (Math.random() > 0.004) continue;
      pairs.push([a, b]);
    }
  }

  if (pairs.length === 0) return;
  const [a, b] = pairs[Math.floor(Math.random() * pairs.length)];
  const crashEnd = nowMs + 340;
  a.crashUntil = crashEnd;
  b.crashUntil = crashEnd;
  a.el.classList.add("crash");
  b.el.classList.add("crash");

  window.setTimeout(() => {
    resetRaceCar(a);
    resetRaceCar(b);
  }, 320);

  sceneState.collisionTimer = nowMs + 2200 + Math.random() * 3000;
}

function updateScene(dt) {
  if (roadImg1 && roadImg2) {
    const roadHeight = roadImg1.clientHeight;
    if (roadHeight > 0) {
      sceneState.roadOffset += ROAD_SCROLL_PX_PER_SEC * dt;
      if (sceneState.roadOffset >= roadHeight) {
        sceneState.roadOffset -= roadHeight;
      }
      const overlap = 2;
      roadImg1.style.transform = `translateY(${sceneState.roadOffset}px)`;
      roadImg2.style.transform = `translateY(${sceneState.roadOffset - roadHeight + overlap}px)`;
    }
  }

  const nowMs = performance.now();
  const shouldUpdateTreeShadows = nowMs - sceneState.lastShadowUpdate > 120;
  if (shouldUpdateTreeShadows) sceneState.lastShadowUpdate = nowMs;

  for (const car of sceneState.cars) {
    if (car.crashUntil > nowMs) continue;
    car.y -= car.speed * dt;
    if (car.y < -35) resetRaceCar(car);
    car.phase += dt * 2.1;
  }

  enforceLaneSpacing();
  maybeTriggerCrash(nowMs);

  for (const car of sceneState.cars) {
    if (car.crashUntil > nowMs) continue;
    const organicOffset = Math.sin(car.phase) * 0.35;
    car.el.style.left = `${car.lane + car.xJitter + organicOffset}%`;
    car.el.style.top = `${car.y}%`;
    car.el.style.transform = "translateZ(0)";
  }

  for (const tree of sceneState.trees) {
    tree.y += tree.speed * dt;
    if (tree.y > 132) resetTree(tree);
    tree.phase = (tree.phase || Math.random() * Math.PI * 2) + dt * 0.7;
    applyTreeDepthVisual(tree, tree.y, tree.scale, tree.phase, shouldUpdateTreeShadows);
  }

}

function sceneLoop(ts) {
  if (!sceneState.running) return;
  if (!sceneState.lastTs) sceneState.lastTs = ts;
  const dt = Math.min((ts - sceneState.lastTs) / 1000, 0.05);
  sceneState.lastTs = ts;
  updateScene(dt);
  sceneState.rafId = requestAnimationFrame(sceneLoop);
}

function initMenuScene() {
  if (!menuRoad || !menuTraffic || !menuTrees) return;
  for (let i = 0; i < 7; i += 1) createRaceCar();
  const minTrees = 8;
  const maxTrees = 14;
  const totalTrees = Math.floor(Math.random() * (maxTrees - minTrees + 1)) + minTrees;
  for (let i = 0; i < totalTrees; i += 1) {
    const side = Math.random() > 0.5 ? "left" : "right";
    createTree(side); 
  }

  sceneState.running = true;
  sceneState.lastTs = 0;
  sceneState.rafId = requestAnimationFrame(sceneLoop);
}
async function ensureMusic() {
  music.volume = volumeSlider.value / 100;
  try {
    await music.play();
  } catch {
    const unlock = async () => {
      await music.play();
      window.removeEventListener("click", unlock);
      window.removeEventListener("keydown", unlock);
    };
    window.addEventListener("click", unlock, { once: true });
    window.addEventListener("keydown", unlock, { once: true });
  }
}

function hasSeenIntroThisSession() {
  return sessionStorage.getItem(INTRO_SEEN_SESSION_KEY) === "1";
}

function markIntroSeenThisSession() {
  sessionStorage.setItem(INTRO_SEEN_SESSION_KEY, "1");
}


async function navigateWithPreload(targetHref, assets = []) {
  return sharedNavigateWithPreload({
    targetHref,
    assets,
    appRoot,
    navLoading,
    runExitTransition,
    markNavigationStart,
    pageName: PAGE_NAME,
  });
}

async function checkIntroAssetAvailability() {
  try {
    const response = await fetch(INTRO_VIDEO_SRC, { method: "HEAD", cache: "no-store" });
    return response.ok;
  } catch {
    return false;
  }
}

async function runBootSequence() {
  const introAvailable = await checkIntroAssetAvailability();
  let loaded = 0;
  const total = preloadAssets.length;

  const preloadPromise = Promise.all(
    preloadAssets.map((src) =>
      preloadAsset(src, () => {
        loaded += 1;
        bootStatus.textContent = `Chargement ${loaded}/${total}`;
      }),
    ),
  );

  if (!introAvailable || hasSeenIntroThisSession()) {
    markIntroSeenThisSession();
    hideBootScreen();
    ensureMusic();
    await preloadPromise;
    return;
  }

  const introPromise = new Promise((resolve) => {
    let done = false;

    const finishIntro = () => {
      if (done) return;
      done = true;
      markIntroSeenThisSession();
      resolve();
    };

    skipIntroBtn.addEventListener("click", finishIntro, { once: true });
    introVideo.src = INTRO_VIDEO_SRC;
    introVideo.muted = true;
    introVideo.volume = 1;
    introVideo.addEventListener("ended", finishIntro, { once: true });
    introVideo.addEventListener("error", () => {
      bootStatus.textContent = "Intro indisponible, lancement du menu...";
      finishIntro();
    }, { once: true });

    const unlockHandler = () => unlockIntroAudio();
    window.addEventListener("pointerdown", unlockHandler, { once: true });
    window.addEventListener("keydown", unlockHandler, { once: true });

    introVideo.play().catch(() => {
      bootStatus.textContent = "Touchez pour lancer l'intro...";
    });

    window.setTimeout(() => {
      bootStatus.textContent = "Timeout intro, lancement...";
      finishIntro();
    }, 9000);
  });

  await Promise.all([preloadPromise, introPromise]);
  hideBootScreen();
  ensureMusic();
}

document.getElementById("settingsBtn").addEventListener("click", () => openPopup("settingsPopup"));
document.getElementById("profileBtn").addEventListener("click", () => {
  renderProfile();
  openPopup("profilePopup");
});
document.getElementById("shopBtn").addEventListener("click", () => {
  renderWallet();
  openPopup("shopPopup");
});

document.querySelectorAll("[data-close-popup]").forEach((closeBtn) => {
  closeBtn.addEventListener("click", (event) => closePopup(event.currentTarget.dataset.closePopup));
});

overlay.addEventListener("click", () => {
  Object.keys(popups).forEach(closePopup);
});

document.getElementById("dailyGiftBtn").addEventListener("click", claimDailyReward);

document.getElementById("playBtn").addEventListener("click", () => {
  navigateWithPreload("garage.html", [
    "/Assets/UI/Screens/MainMenu/ui_garage_menu_bg_v01.svg",
    "/Assets/Vehicles/Player/HD/Vehicles_porshe_HD_base_v01.png",
    "/Assets/Sounds/Garage/Music/Sound_music_garage_playsong1_sample_v01.mp3",
  ]);
});

volumeSlider.addEventListener("input", () => {
  music.volume = volumeSlider.value / 100;
});

qualityButtons.forEach((button) => {
  button.addEventListener("click", () => {
    qualityButtons.forEach((btn) => btn.classList.remove("active"));
    button.classList.add("active");
    selectedQuality = button.dataset.quality;
    localStorage.setItem("selectedVehicleQuality", selectedQuality);
    carIndex = 0;
    renderCar();
  });
});

document.getElementById("prevCar").addEventListener("click", () => {
  const list = cars[selectedQuality];
  carIndex = (carIndex - 1 + list.length) % list.length;
  renderCar();
});

document.getElementById("nextCar").addEventListener("click", () => {
  const list = cars[selectedQuality];
  carIndex = (carIndex + 1) % list.length;
  renderCar();
});

document.getElementById("shopVariantPrev")?.addEventListener("click", () => cycleShopVariant(-1));
document.getElementById("shopVariantNext")?.addEventListener("click", () => cycleShopVariant(1));
document.getElementById("saveProfileBtn")?.addEventListener("click", saveProfileFromForm);
document.getElementById("equipFromShopBtn")?.addEventListener("click", equipCurrentFromShop);

setupAssetFallbacks();
initMenuScene();
renderCar();
renderProfile();
renderWallet();
renderMenuBroadcast();
runBootSequence();

window.addEventListener("pagehide", () => {
  music.pause();
  music.currentTime = 0;
  sceneState.running = false;
  if (sceneState.rafId) cancelAnimationFrame(sceneState.rafId);
});

document.addEventListener("visibilitychange", handleAppVisibility);
window.addEventListener("blur", handleAppVisibility);
