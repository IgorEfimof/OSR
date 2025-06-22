document.addEventListener('DOMContentLoaded', () => {
    const osrFrame = document.getElementById('draggable-osr-frame');
    const outputContent = document.getElementById('output-content');

    let isDragging = false;
    let offsetX, offsetY; // Смещение курсора относительно верхнего левого угла рамки

    // --- Обработчики событий для перетаскивания (для мыши и тач-событий) ---

    // События для мыши
    osrFrame.addEventListener('mousedown', (e) => {
        isDragging = true;
        offsetX = e.clientX - osrFrame.getBoundingClientRect().left;
        offsetY = e.clientY - osrFrame.getBoundingClientRect().top;
        osrFrame.style.cursor = 'grabbing';
    });

    document.addEventListener('mousemove', (e) => {
        if (!isDragging) return;

        let newX = e.clientX - offsetX;
        let newY = e.clientY - offsetY;

        // Ограничиваем перемещение рамки в пределах видимой области (или документа)
        newX = Math.max(0, Math.min(newX, window.innerWidth - osrFrame.offsetWidth));
        newY = Math.max(0, Math.min(newY, window.innerHeight - osrFrame.offsetHeight));

        osrFrame.style.left = `${newX}px`;
        osrFrame.style.top = `${newY}px`;
        readAndDisplayInformation(); // Вызываем функцию считывания при перемещении
    });

    document.addEventListener('mouseup', () => {
        isDragging = false;
        osrFrame.style.cursor = 'grab';
    });

    // События для тач-скрина (iPad)
    osrFrame.addEventListener('touchstart', (e) => {
        isDragging = true;
        const touch = e.touches[0]; // Получаем первый палец
        offsetX = touch.clientX - osrFrame.getBoundingClientRect().left;
        offsetY = touch.clientY - osrFrame.getBoundingClientRect().top;
        osrFrame.style.cursor = 'grabbing';
        e.preventDefault(); // Предотвращаем прокрутку страницы при перетаскивании
    });

    document.addEventListener('touchmove', (e) => {
        if (!isDragging) return;

        const touch = e.touches[0];
        let newX = touch.clientX - offsetX;
        let newY = touch.clientY - offsetY;

        // Ограничиваем перемещение рамки
        newX = Math.max(0, Math.min(newX, window.innerWidth - osrFrame.offsetWidth));
        newY = Math.max(0, Math.min(newY, window.innerHeight - osrFrame.offsetHeight));

        osrFrame.style.left = `${newX}px`;
        osrFrame.style.top = `${newY}px`;
        readAndDisplayInformation();
        e.preventDefault(); // Предотвращаем прокрутку
    });

    document.addEventListener('touchend', () => {
        isDragging = false;
        osrFrame.style.cursor = 'grab';
    });

    // --- Функция для "считывания" информации ---

    function readAndDisplayInformation() {
        // Здесь самое интересное и самое зависящее от ваших нужд место.
        // Что именно вы хотите "считывать"?

        // Вариант 1: Просто выводить координаты рамки
        const rect = osrFrame.getBoundingClientRect();
        outputContent.textContent = `
            Рамка находится:
            X: ${Math.round(rect.left)}px,
            Y: ${Math.round(rect.top)}px,
            Ширина: ${Math.round(rect.width)}px,
            Высота: ${Math.round(rect.height)}px
        `;

        // Вариант 2: Считывание текста из другого элемента, если он попадает в рамку
        // Допустим, у вас есть <p class="some-text-element">Некий текст</p>
        /*
        const someTextElement = document.querySelector('.some-text-element');
        if (someTextElement) {
            const textRect = someTextElement.getBoundingClientRect();
            if (
                rect.left < textRect.right &&
                rect.right > textRect.left &&
                rect.top < textRect.bottom &&
                rect.bottom > textRect.top
            ) {
                outputContent.textContent = `Рамка пересекается с текстом: "${someTextElement.textContent}"`;
            } else {
                outputContent.textContent = "Рамка не пересекается с текстом.";
            }
        }
        */

        // Вариант 3: Более сложное "считывание" - например, OCR (Optical Character Recognition)
        // Для OCR вам понадобится библиотека JavaScript, такая как Tesseract.js.
        // Это выходит за рамки простого HTML/CSS/JS и требует дополнительных шагов:
        // 1. Подключение Tesseract.js
        // 2. Создание Canvas из области рамки (с использованием html2canvas, например)
        // 3. Передача Canvas в Tesseract.js для распознавания текста.
        // Пример (псевдокод с Tesseract.js):
        /*
        (async () => {
            const { createWorker } = Tesseract; // Предполагается, что Tesseract подключен
            const worker = await createWorker('eng'); // Язык для распознавания

            // Получаем изображение из области рамки (это сложно, нужен html2canvas или аналоги)
            // const screenshotCanvas = await html2canvas(osrFrame);
            // const imageData = screenshotCanvas.toDataURL();

            // const { data: { text } } = await worker.recognize(imageData);
            // outputContent.textContent = `Распознанный текст: ${text}`;
            // await worker.terminate();
        })();
        */

        // Вариант 4: Считывание значения из input-поля, если оно попадает в рамку
        /*
        const inputField = document.querySelector('input[type="text"]');
        if (inputField) {
            const inputRect = inputField.getBoundingClientRect();
            if (
                rect.left < inputRect.right &&
                rect.right > inputRect.left &&
                rect.top < inputRect.bottom &&
                rect.bottom > inputRect.top
            ) {
                outputContent.textContent = `Значение поля ввода: "${inputField.value}"`;
            } else {
                outputContent.textContent = "Рамка не пересекается с полем ввода.";
            }
        }
        */
    }

    // Вызываем функцию считывания при загрузке страницы, чтобы отобразить начальную информацию
    readAndDisplayInformation();
});


