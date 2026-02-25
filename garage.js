import { initPagePerf, markNavigationStart, reportNavigationArrival, runExitTransition } from "./perf-tools.js";
import { navigateWithPreload as sharedNavigateWithPreload } from "./src/core/navigation.js";
const vehicles = [
  {
    id: "PORSHE",
    name: "PORSHE",
    variants: {
      hd: "./Assets/Vehicles/Player/HD/Vehicles_porshe_HD_base_v01.png",
      pixel: "./Assets/Vehicles/Player/Pixel/Vehicles_porshe_pixel_base_v01.png",
    },
    sound: "./Assets/Sounds/Garage/Car/Sound_effect_car_porsche_sample_v01.mp3",
  },
  {
    id: "BMW",
    name: "BMW",
    variants: {
      hd: "./Assets/Vehicles/Player/HD/Vehicles_bmw_HD_base_v01.png",
      pixel: "./Assets/Vehicles/Player/Pixel/Vehicles_bmw_pixel_base_v01.png",
    },
    sound: "./Assets/Sounds/Garage/Car/Sound_effect_car_bmw_sample_v01.mp3",
  },
  {
    id: "GALLARDO",
    name: "GALLARDO",
    variants: {
      hd: "./Assets/Vehicles/Player/HD/Vehicles_gallardo_HD_base_v01.png",
      pixel: "./Assets/Vehicles/Player/Pixel/Vehicles_gallardo_pixel_base_v01.png",
    },
    sound: "./Assets/Sounds/Garage/Car/Sound_effect_car_gallardo_sample_v01.mp3",
  },
  {
    id: "RX7",
    name: "RX7",
    variants: {
      hd: "./Assets/Vehicles/Player/HD/Vehicles_rx7_HD_base_v01.png",
      pixel: "./Assets/Vehicles/Player/Pixel/Vehicles_rx7_pixel_base_v01.png",
    },
    sound: "",
  },
  {
    id: "CHIRON",
    name: "CHIRON",
    variants: {
      hd: "./Assets/Vehicles/Player/HD/Vehicles_chiron_HD_base_v01.png",
      pixel: "./Assets/Vehicles/Player/Pixel/Vehicles_chiron_pixel_base_v01.png",
    },
    sound: "",
  },
  {
    id: "CAMARO",
    name: "CAMARO",
    variants: {
      hd: "./Assets/Vehicles/Player/HD/Vehicles_camaro_pixel_base_v01.png",
      pixel: "./Assets/Vehicles/Player/Pixel/Vehicles_camaro_pixel_base_v01.png",
    },
    sound: "",
  },
];

const qualityOrder = ["hd", "pixel"];
let currentQuality = localStorage.getItem("selectedVehicleQuality") || "hd";
let currentIndex = 0;

const carImage = document.getElementById("carImage");
const carName = document.getElementById("carName");
const variantLabel = document.getElementById("variantLabel");
const garageMusic = document.getElementById("garageMusic");
const carSound = document.getElementById("carSound");
const selectionSound = document.getElementById("selectionSound");
const overlay = document.getElementById("overlay");
const garageSettingsPopup = document.getElementById("garageSettingsPopup");
const garageMusicVolume = document.getElementById("garageMusicVolume");
const garageAutoPlayToggle = document.getElementById("garageAutoPlayToggle");
const navLoading = document.getElementById("navLoading");
let garageMusicWanted = true;
const GARAGE_SETTINGS_KEY = "ct_garage_settings_v1";

const PAGE_NAME = "garage.html";
initPagePerf(PAGE_NAME);
reportNavigationArrival(PAGE_NAME);


function getGarageSettings() {
  const fallback = { musicVolume: 60, autoPlayMusic: true };
  try {
    const raw = localStorage.getItem(GARAGE_SETTINGS_KEY);
    if (!raw) return fallback;
    const parsed = JSON.parse(raw);
    return {
      musicVolume: Number.isFinite(Number(parsed.musicVolume)) ? Math.max(0, Math.min(100, Number(parsed.musicVolume))) : fallback.musicVolume,
      autoPlayMusic: parsed.autoPlayMusic !== false,
    };
  } catch {
    return fallback;
  }
}

function saveGarageSettings(settings) {
  localStorage.setItem(GARAGE_SETTINGS_KEY, JSON.stringify(settings));
}

function applyGarageSettings() {
  const settings = getGarageSettings();
  garageMusic.volume = settings.musicVolume / 100;
  garageMusicWanted = settings.autoPlayMusic;
  if (garageMusicVolume) garageMusicVolume.value = String(settings.musicVolume);
  if (garageAutoPlayToggle) garageAutoPlayToggle.checked = settings.autoPlayMusic;
}

function findInitialVehicle() {
  const selected = localStorage.getItem("selectedVehicle") || "PORSHE";
  const index = vehicles.findIndex((vehicle) => vehicle.id === selected || vehicle.name === selected);
  currentIndex = index >= 0 ? index : 0;
  if (!qualityOrder.includes(currentQuality)) currentQuality = "hd";
}

function selectedVehicle() {
  return vehicles[currentIndex];
}

function renderVehicle() {
  const vehicle = selectedVehicle();
  const image = vehicle.variants[currentQuality] || vehicle.variants.hd;
  carImage.src = image;
  carImage.alt = `${vehicle.name} ${currentQuality.toUpperCase()}`;
  carName.textContent = `${vehicle.name}`;
  variantLabel.textContent = currentQuality.toUpperCase();
}

function saveSelectedVehicle() {
  const vehicle = selectedVehicle();
  localStorage.setItem("selectedVehicle", vehicle.id);
  localStorage.setItem("selectedVehicleQuality", currentQuality);
}

function playVehicleSound() {
  const vehicle = selectedVehicle();
  if (!vehicle.sound) return;
  carSound.src = vehicle.sound;
  carSound.currentTime = 0;
  carSound.play().catch(() => {});
}

function openGarageSettings() {
  overlay.classList.remove("hidden");
  garageSettingsPopup.classList.remove("hidden");
}

function closeGarageSettings() {
  overlay.classList.add("hidden");
  garageSettingsPopup.classList.add("hidden");
}

async function startMusic() {
  applyGarageSettings();
  garageMusic.playbackRate = 1;
  garageMusic.loop = false;
  try {
    await garageMusic.play();
  } catch {
    const unlock = async () => {
      await garageMusic.play();
    };
    window.addEventListener("click", unlock, { once: true });
    window.addEventListener("keydown", unlock, { once: true });
    window.addEventListener("touchstart", unlock, { once: true });
  }
}

function restartGarageMusic() {
  garageMusic.currentTime = 0;
  garageMusic.play().catch(() => {});
}

garageMusic.addEventListener("ended", () => {
  if (!garageMusicWanted) return;
  restartGarageMusic();
});

function handleAppVisibility() {
  if (document.hidden) {
    garageMusicWanted = !garageMusic.paused;
    garageMusic.pause();
    return;
  }

  if (garageMusicWanted) {
    garageMusic.play().catch(() => {});
  }
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


async function navigateWithPreload(targetHref, assets) {
  return sharedNavigateWithPreload({
    targetHref,
    assets,
    appRoot: document.querySelector(".garage-app"),
    navLoading,
    runExitTransition,
    markNavigationStart,
    pageName: PAGE_NAME,
  });
}

function cycleVehicle(direction) {
  currentIndex = (currentIndex + direction + vehicles.length) % vehicles.length;
  saveSelectedVehicle();
  renderVehicle();
  playVehicleSound();
}

function cycleVariant(direction) {
  const idx = qualityOrder.indexOf(currentQuality);
  const next = (idx + direction + qualityOrder.length) % qualityOrder.length;
  currentQuality = qualityOrder[next];
  saveSelectedVehicle();
  renderVehicle();
}

document.getElementById("prevCar").addEventListener("click", () => {
  cycleVehicle(-1);
});

document.getElementById("nextCar").addEventListener("click", () => {
  cycleVehicle(1);
});

document.getElementById("variantPrev").addEventListener("click", () => cycleVariant(-1));
document.getElementById("variantNext").addEventListener("click", () => cycleVariant(1));

document.querySelectorAll(".color-btn").forEach((btn) => {
  btn.style.backgroundColor = btn.dataset.color;
  btn.addEventListener("click", () => {
    document.querySelectorAll(".color-btn").forEach((b) => b.classList.remove("active"));
    btn.classList.add("active");
    carImage.style.filter = "drop-shadow(0 2px 2px rgba(0, 0, 0, 0.5)) saturate(1.1) hue-rotate(0deg)";
  });
});

document.getElementById("startRaceBtn").addEventListener("click", async () => {
  try {
    selectionSound.currentTime = 0;
    await selectionSound.play();
  } catch {
    // no-op
  }
  saveSelectedVehicle();
  const selected = selectedVehicle();
  const qualityImage = selected.variants[currentQuality] || selected.variants.hd;
  navigateWithPreload("play.html", [
    qualityImage,
    "./Assets/Road/Road_street_baseloop_v01.png",
    "./Assets/Sounds/Onroad/radio/Sound_music_onroad_playsong1_sample_v01.mp3",
  ]);
});

document.getElementById("garageSettingsBtn").addEventListener("click", () => {
  openGarageSettings();
});

document.getElementById("returnMainBtn").addEventListener("click", () => {
  garageMusicWanted = false;
  garageMusic.pause();
  garageMusic.currentTime = 0;
  navigateWithPreload("index.html", [
    "./Assets/UI/Screens/MainMenu/ui_mainmenu_bg_v02.svg",
    "./Assets/Sounds/Mainmenu/Song_mainmenu_base_v01.mp3",
  ]);
});

document.getElementById("closeGarageSettings").addEventListener("click", closeGarageSettings);
overlay.addEventListener("click", closeGarageSettings);

garageMusicVolume?.addEventListener("input", () => {
  const current = getGarageSettings();
  const next = { ...current, musicVolume: Number(garageMusicVolume.value) };
  saveGarageSettings(next);
  garageMusic.volume = next.musicVolume / 100;
});

garageAutoPlayToggle?.addEventListener("change", () => {
  const current = getGarageSettings();
  const next = { ...current, autoPlayMusic: garageAutoPlayToggle.checked };
  saveGarageSettings(next);
  garageMusicWanted = next.autoPlayMusic;
  if (!next.autoPlayMusic) garageMusic.pause();
});

findInitialVehicle();
setupAssetFallbacks();
saveSelectedVehicle();
renderVehicle();
startMusic();

window.addEventListener("pagehide", () => {
  garageMusicWanted = false;
  garageMusic.pause();
  garageMusic.currentTime = 0;
  carSound.pause();
  carSound.currentTime = 0;
});

document.addEventListener("visibilitychange", handleAppVisibility);
window.addEventListener("blur", handleAppVisibility);


async function runGarageBootSequence() {
  navLoading.classList.remove("hidden");
  navLoading.classList.remove("fade-out");
  const selected = selectedVehicle();
  const carImgSrc = selected.variants[currentQuality] || selected.variants.hd;
  const criticalAssets = [
    "./Assets/UI/Screens/MainMenu/ui_garage_menu_bg_v01.svg",
    "./Assets/Branding/Logo/Brand_crashtown_logo_main_v01.svg",
    carImgSrc
  ];
  await Promise.all(criticalAssets.map(src => preloadAsset(src)));
  await new Promise(resolve => setTimeout(resolve, 300));
  navLoading.classList.add("fade-out");
  setTimeout(() => {
    navLoading.classList.add("hidden");
  }, 600);
}

runGarageBootSequence();