const { createCanvas, loadImage } = require("canvas");
const fs = require("fs");
const path = require("path");

const outputDir = path.join(__dirname, "public/images");
if (!fs.existsSync(outputDir)) fs.mkdirSync(outputDir, { recursive: true });

// ====== Fondo azul profesional ======
const width = 1920;
const height = 1080;
const canvasBg = createCanvas(width, height);
const ctxBg = canvasBg.getContext("2d");

// Degradado azul
const gradient = ctxBg.createLinearGradient(0, 0, 0, height);
gradient.addColorStop(0, "#0077b6");
gradient.addColorStop(1, "#00b4d8");
ctxBg.fillStyle = gradient;
ctxBg.fillRect(0, 0, width, height);

const bgPath = path.join(outputDir, "fondo-login.jpg");
const outBg = fs.createWriteStream(bgPath);
const streamBg = canvasBg.createJPEGStream({ quality: 0.9 });
streamBg.pipe(outBg);
outBg.on("finish", () => console.log("Fondo generado:", bgPath));

// ====== Billetes PNG simples ======
const billColors = ["#1abc9c", "#16a085", "#2ecc71"];
billColors.forEach((color, index) => {
  const billWidth = 80;
  const billHeight = 40;
  const canvasBill = createCanvas(billWidth, billHeight);
  const ctxBill = canvasBill.getContext("2d");

  // Fondo transparente
  ctxBill.clearRect(0, 0, billWidth, billHeight);

  // Rectángulo de billete
  ctxBill.fillStyle = color;
  ctxBill.fillRect(0, 0, billWidth, billHeight);

  // Texto $ para simular billete
  ctxBill.fillStyle = "#fff";
  ctxBill.font = "bold 24px Arial";
  ctxBill.textAlign = "center";
  ctxBill.textBaseline = "middle";
  ctxBill.fillText("$", billWidth / 2, billHeight / 2);

  const billPath = path.join(outputDir, `billete${index + 1}.png`);
  const outBill = fs.createWriteStream(billPath);
  const streamBill = canvasBill.createPNGStream();
  streamBill.pipe(outBill);
  outBill.on("finish", () => console.log("Billete generado:", billPath));
});