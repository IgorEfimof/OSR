document.addEventListener('DOMContentLoaded', () => {
    const osrFrame = document.getElementById('draggable-osr-frame');
    const outputContent = document.getElementById('output-content');
    const resizers = document.querySelectorAll('.resizer');
    // Добавляем ссылку на элементы, которые будут "сканироваться"
    const scannableElements = document.querySelectorAll('.scannable-text');
    const updateScoresBtn = document.getElementById('update-scores-btn');
    const player1Score = document.getElementById('player1-score');
    const player2Score = document.getElementById('player2-score');
    const currentGame = document.getElementById('current-game');
    const player1Odds = document.getElementById('player1-odds');
    const player2Odds = document.getElementById('player2-odds');


    let isDragging = false;
    let isResizing = false;
    let currentResizer = null;
    let startX, startY;
    let startWidth, startHeight;
    let startLeft, startTop;

    function handleMouseDown(e) {
        e.preventDefault();
        if (e.target.classList.contains('resizer')) {
            isResizing = true;
            currentResizer = e.target;
        } else {
            isDragging = true;
        }

        const clientX = e.type.includes('touch') ? e.touches[0].clientX : e.clientX;
        const clientY = e.type.includes('touch') ? e.touches[0].clientY : e.clientY;

        startX = clientX;
        startY = clientY;

        const rect = osrFrame.getBoundingClientRect();
        startWidth = rect.width;
        startHeight = rect.height;
        startLeft = rect.left;
        startTop = rect.top;

        if (isDragging) {
            startLeft = clientX - rect.left;
            startTop = clientY - rect.top;
        }

        osrFrame.style.cursor = 'grabbing';
    }

    function handleMouseMove(e) {
        if (!isDragging && !isResizing) return;

        const clientX = e.type.includes('touch') ? e.touches[0].clientX : e.clientX;
        const clientY = e.type.includes('touch') ? e.touches[0].clientY : e.clientY;

        const dx = clientX - startX;
        const dy = clientY - startY;

        if (isDragging) {
            let newLeft = clientX - startLeft;
            let newTop = clientY - startTop;

            newLeft = Math.max(0, Math.min(newLeft, window.innerWidth - osrFrame.offsetWidth));
            newTop = Math.max(0, Math.min(newTop, window.innerHeight - osrFrame.offsetHeight));

            osrFrame.style.left = `${newLeft}px`;
            osrFrame.style.top = `${newTop}px`;

        } else if (isResizing) {
            const direction = currentResizer.dataset.direction;
            let newWidth = startWidth;
            let newHeight = startHeight;
            let newLeft = startLeft;
            let newTop = startTop;

            const minSize = 50;

            switch (direction) {
                case 'n':
                    newHeight = startHeight - dy;
                    newTop = startTop + dy;
                    if (newHeight < minSize) { newHeight = minSize; newTop = startTop + startHeight - minSize; }
                    break;
                case 's':
                    newHeight = startHeight + dy;
                    if (newHeight < minSize) newHeight = minSize;
                    break;
                case 'w':
                    newWidth = startWidth - dx;
                    newLeft = startLeft + dx;
                    if (newWidth < minSize) { newWidth = minSize; newLeft = startLeft + startWidth - minSize; }
                    break;
                case 'e':
                    newWidth = startWidth + dx;
                    if (newWidth < minSize) newWidth = minSize;
                    break;
                case 'nw':
                    newWidth = startWidth - dx;
                    newLeft = startLeft + dx;
                    newHeight = startHeight - dy;
                    newTop = startTop + dy;
                    if (newWidth < minSize) { newWidth = minSize; newLeft = startLeft + startWidth - minSize; }
                    if (newHeight < minSize) { newHeight = minSize; newTop = startTop + startHeight - minSize; }
                    break;
                case 'ne':
                    newWidth = startWidth + dx;
                    newHeight = startHeight - dy;
                    newTop = startTop + dy;
                    if (newWidth < minSize) newWidth = minSize;
                    if (newHeight < minSize) { newHeight = minSize; newTop = startTop + startHeight - minSize; }
                    break;
                case 'sw':
                    newWidth = startWidth - dx;
                    newLeft = startLeft + dx;
                    newHeight = startHeight + dy;
                    if (newWidth < minSize) { newWidth = minSize; newLeft = startLeft + startWidth - minSize; }
                    if (newHeight < minSize) newHeight = minSize;
                    break;
                case 'se':
                    newWidth = startWidth + dx;
                    newHeight = startHeight + dy;
                    if (newWidth < minSize) newWidth = minSize;
                    if (newHeight < minSize) newHeight = minSize;
                    break;
            }

            osrFrame.style.width = `${newWidth}px`;
            osrFrame.style.height = `${newHeight}px`;
            osrFrame.style.left = `${newLeft}px`;
            osrFrame.style.top = `${newTop}px`;
        }
        readAndDisplayInformation(); // Обновляем информацию при движении/изменении размера
    }

    function handleMouseUp() {
        isDragging = false;
        isResizing = false;
        currentResizer = null;
        osrFrame.style.cursor = 'grab';
        readAndDisplayInformation();
    }

    osrFrame.addEventListener('mousedown', handleMouseDown);
    osrFrame.addEventListener('touchstart', handleMouseDown);

    resizers.forEach(resizer => {
        resizer.addEventListener('mousedown', handleMouseDown);
        resizer.addEventListener('touchstart', handleMouseDown);
    });

    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('touchmove', handleMouseMove);

    document.addEventListener('mouseup', handleMouseUp);
    document.addEventListener('touchend', handleMouseUp);
    document.addEventListener('touchcancel', handleMouseUp);

    // --- Функция для "считывания" информации внутри рамки ---
    function readAndDisplayInformation() {
        const frameRect = osrFrame.getBoundingClientRect();
        let collectedText = [];

        scannableElements.forEach(element => {
            const elementRect = element.getBoundingClientRect();

            // Проверяем, находится ли элемент полностью внутри рамки
            const isInside = (
                elementRect.left >= frameRect.left &&
                elementRect.right <= frameRect.right &&
                elementRect.top >= frameRect.top &&
                elementRect.bottom <= frameRect.bottom
            );

            if (isInside) {
                // Если элемент внутри рамки, добавляем его текстовое содержимое
                collectedText.push(element.textContent.trim());
            }
        });

        if (collectedText.length > 0) {
            outputContent.innerHTML = "Считано:\n" + collectedText.join('<br>'); // Используем <br> для переноса строк
        } else {
            outputContent.textContent = "Переместите рамку или измените её размер, чтобы считать данные.";
        }
    }

    // --- Логика для имитации обновления счёта и КФ ---
    let currentP1Score = 2;
    let currentP2Score = 3;
    let currentOddsP1 = 1.85;
    let currentOddsP2 = 1.95;

    function updateGameScores() {
        // Имитируем изменения счета и КФ
        if (currentP1Score === 2 && currentP2Score === 3) {
            currentP1Score = 3;
            currentP2Score = 3;
            currentOddsP1 = 1.90;
            currentOddsP2 = 1.90;
        } else if (currentP1Score === 3 && currentP2Score === 3) {
            currentP1Score = 3;
            currentP2Score = 4;
            currentOddsP1 = 2.10;
            currentOddsP2 = 1.75;
        } else {
            currentP1Score = 2; // Сброс для следующего цикла
            currentP2Score = 3;
            currentOddsP1 = 1.85;
            currentOddsP2 = 1.95;
        }

        // Обновляем текст в HTML-элементах
        player1Score.textContent = currentP1Score;
        player2Score.textContent = currentP2Score;
        currentGame.textContent = currentP1Score + currentP2Score + 1; // Номер гейма
        player1Odds.textContent = currentOddsP1.toFixed(2);
        player2Odds.textContent = currentOddsP2.toFixed(2);

        // После обновления данных, пересчитываем информацию в рамке
        readAndDisplayInformation();
    }

    updateScoresBtn.addEventListener('click', updateGameScores);

    // Инициализация: считаем информацию при загрузке страницы
    readAndDisplayInformation();
});


