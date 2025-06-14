const frame = document.getElementById("frame");
let isDragging = false;
let offset = { x: 0, y: 0 };

frame.addEventListener("mousedown", (e) => {
  isDragging = true;
  offset.x = e.offsetX;
  offset.y = e.offsetY;
});
document.addEventListener("mousemove", (e) => {
  if (isDragging) {
    frame.style.left = `${e.pageX - offset.x}px`;
    frame.style.top = `${e.pageY - offset.y}px`;
  }
});
document.addEventListener("mouseup", () => {
  isDragging = false;
});

document.getElementById("imgInput").addEventListener("change", (e) => {
  const file = e.target.files[0];
  if (file) {
    const reader = new FileReader();
    reader.onload = function () {
      document.getElementById("sourceImage").src = reader.result;
    };
    reader.readAsDataURL(file);
  }
});

document.getElementById("recognizeBtn").addEventListener("click", () => {
  const img = document.getElementById("sourceImage");
  const frameRect = frame.getBoundingClientRect();
  const imgRect = img.getBoundingClientRect();

  // Создание временного canvas
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
    logger: m => console.log(m)
  }).then(({ data: { text } }) => {
    const numbers = text.match(/\d+/g);
    if (numbers) {
      document.getElementById("num1").value = numbers[0] || "";
      document.getElementById("num2").value = numbers[1] || "";
    } else {
      alert("Числа не найдены.");
    }
  });
});

