const dropZone = document.getElementById("drop-zone");
const fileInput = document.getElementById("file-input");

dropZone.addEventListener("dragover", (e) => {
  e.preventDefault();
  dropZone.style.borderColor = "green";
});

dropZone.addEventListener("dragleave", () => {
  dropZone.style.borderColor = "#888";
});

dropZone.addEventListener("drop", (e) => {
  e.preventDefault();
  dropZone.style.borderColor = "#888";
  const file = e.dataTransfer.files[0];
  if (file) {
    recognizeText(file);
  }
});

fileInput.addEventListener("change", () => {
  const file = fileInput.files[0];
  if (file) {
    recognizeText(file);
  }
});

function recognizeText(file) {
  Tesseract.recognize(file, 'eng', {
    logger: m => console.log(m)
  }).then(({ data: { text } }) => {
    const numbers = text.match(/\d+/g);
    if (numbers) {
      document.getElementById("num1").value = numbers[0] || "";
      document.getElementById("num2").value = numbers[1] || "";
      document.getElementById("num3").value = numbers[2] || "";
    } else {
      alert("Числа не найдены.");
    }
  });
}
