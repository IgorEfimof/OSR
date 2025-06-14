const frame = document.getElementById("frame");
const resizer = frame.querySelector(".resizer");
let startX, startY, startWidth, startHeight;
let isDragging = false;
let dragOffsetX, dragOffsetY;

// Для перетаскивания
function startDrag(e) {
  isDragging = true;
  const touch = e.touches ? e.touches[0] : e;
  dragOffsetX = touch.clientX - frame.offsetLeft;
  dragOffsetY = touch.clientY - frame.offsetTop;
}
function doDrag(e) {
  if (!isDragging) return;
  const touch = e.touches ? e.touches[0] : e;
  frame.style.left = `${touch.clientX - dragOffsetX}px`;
  frame.style.top = `${touch.clientY - dragOffsetY}px`;
}
function stopDrag() {
  isDragging = false;
}

// Для масштабирования
function startResize(e) {
  e.stopPropagation();
  const touch = e.touches ? e.touches[0] : e;
  startX = touch.clientX;
  startY = touch.clientY;
  startWidth = frame.offsetWidth;
  startHeight = frame.offsetHeight;
  document.addEventListener("touchmove", doResize, { passive: false });
  document.addEventListener("touchend", stopResize);
}
function doResize(e) {
  e.preventDefault();
  const touch = e.touches[0];
  frame.style.width = `${startWidth + (touch.clientX - startX)}px`;
  frame.style.height = `${startHeight + (touch.clientY - startY)}px`;
}
function stopResize() {
  document.removeEventListener("touchmove", doResize);
  document.removeEventListener("touchend", stopResize);
}

// Обработчики
frame.addEventListener("touchstart", startDrag);
frame.addEventListener("touchmove", doDrag);
frame.addEventListener("touchend", stopDrag);
resizer.addEventListener("touchstart", startResize);

// Загрузка изображения
document.getElementById("imgInput").addEventListener("change", (e) => {
  const file = e.target.files[0];
  if (file) {
    const reader = new FileReader();
    reader.onload = () => {
      document.getElementById("sourceImage").src = reader.result;
    };
    reader.readAsDataURL(file);
  }
});

// Распознавание
document.getElementById("recognizeBtn").addEventListener("click", () => {
  const img = document.getElementById("sourceImage");
  const frameRect = frame.getBoundingClientRect();
  const imgRect = img.getBoundingClientRect();

  const canvas = document.createElement("canvas");
  const ctx = canvas.getContext("2d");

  const scaleX = img.naturalWidth / imgRect.width;
  const scaleY = img.naturalHeight / imgRect.height;

  const sx = (frameRect.left - imgRect.left) * scaleX;
  const sy = (frameRect.top - imgRect.top) * scaleY;
  const sw = frame.offsetWidth * scaleX;
  const sh = frame.offsetHeight * scaleY;

  canvas.width = sw;
  canvas.height = sh;
  ctx.drawImage(img, sx, sy, sw, sh, 0, 0, sw, sh);

  Tesseract.recognize(canvas, 'eng', {
    logger: m => console.log(m),
  }).then(({ data: { text } }) => {
    const numbers = text.match(/\d+/g);
    document.getElementById("num1").value = numbers?.[0] || "";
    document.getElementById("num2").value = numbers?.[1] || "";
  });
});


