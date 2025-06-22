document.addEventListener('DOMContentLoaded', () => {
    const osrFrame = document.getElementById('draggable-osr-frame');
    const outputContent = document.getElementById('output-content');
    const resizers = document.querySelectorAll('.resizer');
    const scannableElements = document.querySelectorAll('.scannable-text');

    let isDragging = false;
    let isResizing = false;
    let currentResizer = null;
    let startX, startY;
    let startWidth, startHeight;
    let startLeft, startTop;

    // --- Функции для обработки событий мыши/тача ---

    function handleMouseDown(e) {
        e.preventDefault(); // Предотвращаем стандартное поведение (напр., выделение текста)
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

        // Если это перетаскивание рамки, сохраняем смещение
        if (isDragging) {
            startLeft = clientX - (rect.left - window.scrollX); // Отступ от левого края документа
            startTop = clientY - (rect.top - window.scrollY);   // Отступ от верхнего края документа
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
            let newLeft = clientX - (startLeft - window.scrollX);
            let newTop = clientY - (startTop - window.scrollY);

            // Ограничиваем перемещение в пределах окна
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

            const minSize = 50; // Минимальный размер рамки

            switch (direction) {
                case 'n': // Сверху
                    newHeight = startHeight - dy;
                    newTop = startTop + dy;
                    if (newHeight < minSize) { newHeight = minSize; newTop = startTop + startHeight - minSize; }
                    break;
                case 's': // Снизу
                    newHeight = startHeight + dy;
                    if (newHeight < minSize) newHeight = minSize;
                    break;
                case 'w': // Слева
                    newWidth = startWidth - dx;
                    newLeft = startLeft + dx;
                    if (newWidth < minSize) { newWidth = minSize; newLeft = startLeft + startWidth - minSize; }
                    break;
                case 'e': // Справа
                    newWidth = startWidth + dx;
                    if (newWidth < minSize) newWidth = minSize;
                    break;
                case 'nw': // Северо-запад
                    newWidth = startWidth - dx;
                    newLeft = startLeft + dx;
                    newHeight = startHeight - dy;
                    newTop = startTop + dy;
                    if (newWidth < minSize) { newWidth = minSize; newLeft = startLeft + startWidth - minSize; }
                    if (newHeight < minSize) { newHeight = minSize; newTop = startTop + startHeight - minSize; }
                    break;
                case 'ne': // Северо-восток
                    newWidth = startWidth + dx;
                    newHeight = startHeight - dy;
                    newTop = startTop + dy;
                    if (newWidth < minSize) newWidth = minSize;
                    if (newHeight < minSize) { newHeight = minSize; newTop = startTop + startHeight - minSize; }
                    break;
                case 'sw': // Юго-запад
                    newWidth = startWidth - dx;
                    newLeft = startLeft + dx;
                    newHeight = startHeight + dy;
                    if (newWidth < minSize) { newWidth = minSize; newLeft = startLeft + startWidth - minSize; }
                    if (newHeight < minSize) newHeight = minSize;
                    break;
                case 'se': // Юго-восток
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
        osrFrame.style.cursor = 'grab'; // Возвращаем обычный курсор для перетаскивания
    }

    // --- Назначаем обработчики событий ---

    // Для перетаскивания рамки (кликаем по самой рамке, кроме ручек)
    osrFrame.addEventListener('mousedown', handleMouseDown);
    osrFrame.addEventListener('touchstart', handleMouseDown);

    // Для изменения размера (кликаем по ручкам)
    resizers.forEach(resizer => {
        resizer.addEventListener('mousedown', handleMouseDown);
        resizer.addEventListener('touchstart', handleMouseDown);
    });

    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('touchmove', handleMouseMove);

    document.addEventListener('mouseup', handleMouseUp);
    document.addEventListener('touchend', handleMouseUp);
    document.addEventListener('touchcancel', handleMouseUp); // На случай отмены касания

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
            outputContent.textContent = "Считано:\n" + collectedText.join('\n');
        } else {
            outputContent.textContent = "Переместите рамку или измените её размер, чтобы считать информацию.";
        }
    }

    // Инициализация: считаем информацию при загрузке страницы
    readAndDisplayInformation();
});


