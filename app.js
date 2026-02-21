const canvas = document.getElementById("qrCanvas");
const ctx = canvas.getContext("2d");

const inputs = {
  targetUrl: document.getElementById("targetUrl"),
  language: document.getElementById("language"),
  topText: document.getElementById("topText"),
  ctaText: document.getElementById("ctaText"),
  qrColor: document.getElementById("qrColor"),
  bgColor: document.getElementById("bgColor"),
  logoFile: document.getElementById("logoFile"),
  patternFile: document.getElementById("patternFile"),
  cornerFile: document.getElementById("cornerFile"),
};

const ctaByLang = {
  fr: "REJOINS NOUS",
  en: "JOIN US",
  it: "UNISCITI A ME",
};

const assetMap = {
  pattern: null,
  logo: null,
  corner: null,
};

const ASSET_POSITIONS = {
  frame: { x: 90, y: 90, size: 1020 },
  qr: { x: 150, y: 150, size: 900 },
  centerBadge: { x: 315, y: 315, size: 570 },
  corners: [
    { x: 105, y: 105 },
    { x: 960, y: 105 },
    { x: 105, y: 960 },
  ],
};

function readImage(file) {
  if (!file) return Promise.resolve(null);
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const img = new Image();
      img.onload = () => resolve(img);
      img.onerror = reject;
      img.src = reader.result;
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

async function refreshAssets() {
  assetMap.logo = await readImage(inputs.logoFile.files[0]);
  assetMap.pattern = await readImage(inputs.patternFile.files[0]);
  assetMap.corner = await readImage(inputs.cornerFile.files[0]);
}

function createQrMatrix(url) {
  const qr = qrcode(0, "H");
  qr.addData(url);
  qr.make();
  return qr;
}

function drawBackground(bgColor) {
  ctx.fillStyle = bgColor;
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  if (assetMap.pattern) {
    const pattern = ctx.createPattern(assetMap.pattern, "repeat");
    ctx.globalAlpha = 0.24;
    ctx.fillStyle = pattern;
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.globalAlpha = 1;
    return;
  }

  // fallback motif style "grains"
  ctx.fillStyle = "rgba(132, 78, 43, 0.20)";
  for (let i = 0; i < 450; i += 1) {
    const x = Math.random() * canvas.width;
    const y = Math.random() * canvas.height;
    const r1 = 4 + Math.random() * 6;
    const r2 = 3 + Math.random() * 5;
    ctx.beginPath();
    ctx.ellipse(x, y, r1, r2, Math.random() * Math.PI, 0, Math.PI * 2);
    ctx.fill();
  }
}

function drawRoundedFinderBackground() {
  const { x, y, size } = ASSET_POSITIONS.frame;
  ctx.fillStyle = "#fff";
  ctx.fillRect(x, y, size, size);
  ctx.strokeStyle = "#e7d7c5";
  ctx.lineWidth = 3;
  ctx.strokeRect(x, y, size, size);
}

function drawQrModules(qr, qrColor) {
  const count = qr.getModuleCount();
  const { x, y, size } = ASSET_POSITIONS.qr;
  const cell = size / count;

  ctx.fillStyle = qrColor;
  for (let row = 0; row < count; row += 1) {
    for (let col = 0; col < count; col += 1) {
      if (!qr.isDark(row, col)) continue;
      const px = x + col * cell;
      const py = y + row * cell;
      ctx.beginPath();
      ctx.roundRect(px + 0.75, py + 0.75, cell - 1.5, cell - 1.5, Math.max(1.5, cell * 0.25));
      ctx.fill();
    }
  }
}

function drawCornerDecorations(qrColor) {
  if (assetMap.corner) {
    for (const corner of ASSET_POSITIONS.corners) {
      ctx.drawImage(assetMap.corner, corner.x, corner.y, 140, 140);
    }
    return;
  }

  ctx.strokeStyle = qrColor;
  ctx.lineWidth = 18;
  for (const corner of ASSET_POSITIONS.corners) {
    ctx.strokeRect(corner.x, corner.y, 140, 140);
    ctx.strokeStyle = "#8b4f2d";
    ctx.lineWidth = 8;
    ctx.strokeRect(corner.x + 27, corner.y + 27, 86, 86);
    ctx.strokeStyle = qrColor;
    ctx.lineWidth = 18;
  }
}

function drawCenterBadge(topText, ctaText) {
  const { x, y, size } = ASSET_POSITIONS.centerBadge;
  const centerX = x + size / 2;
  const centerY = y + size / 2;

  ctx.fillStyle = "#fff";
  ctx.beginPath();
  ctx.arc(centerX, centerY, size / 2, 0, Math.PI * 2);
  ctx.fill();

  ctx.lineWidth = 8;
  ctx.strokeStyle = "#e2be69";
  ctx.stroke();

  if (assetMap.logo) {
    ctx.drawImage(assetMap.logo, centerX - 150, centerY - 170, 300, 250);
  } else {
    ctx.fillStyle = "#6b3a1f";
    ctx.font = "bold 52px Georgia";
    ctx.textAlign = "center";
    ctx.fillText("Logo", centerX, centerY - 40);
  }

  ctx.fillStyle = "#5a3118";
  ctx.font = "bold 64px 'Arial Black', sans-serif";
  ctx.fillText(topText, centerX, y + size - 125);

  ctx.font = "bold 56px 'Arial Black', sans-serif";
  ctx.fillText(ctaText, centerX, y + size - 50);

  ctx.font = "700 68px 'Trebuchet MS', sans-serif";
  ctx.fillText("SCAN ME", centerX - 185, centerY - 130);
}

async function generate() {
  await refreshAssets();

  const url = inputs.targetUrl.value.trim();
  if (!url) return;

  if (!inputs.ctaText.value.trim()) {
    inputs.ctaText.value = ctaByLang[inputs.language.value] ?? ctaByLang.fr;
  }

  const qr = createQrMatrix(url);
  drawBackground(inputs.bgColor.value);
  drawRoundedFinderBackground();
  drawQrModules(qr, inputs.qrColor.value);
  drawCornerDecorations(inputs.qrColor.value);
  drawCenterBadge(inputs.topText.value.trim() || "HUNGRY?", inputs.ctaText.value.trim());
}

function download(type) {
  const link = document.createElement("a");
  link.download = `qr-brand.${type === "image/jpeg" ? "jpg" : "png"}`;
  link.href = canvas.toDataURL(type, 0.92);
  link.click();
}

document.getElementById("generateBtn").addEventListener("click", generate);
document.getElementById("downloadPngBtn").addEventListener("click", () => download("image/png"));
document.getElementById("downloadJpegBtn").addEventListener("click", () => download("image/jpeg"));

inputs.language.addEventListener("change", () => {
  inputs.ctaText.value = ctaByLang[inputs.language.value] ?? ctaByLang.fr;
});

generate();
