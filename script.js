document.addEventListener('DOMContentLoaded', () => {
    const osrFrame = document.getElementById('draggable-osr-frame');
    const outputContent = document.getElementById('output-content');
    const resizers = document.querySelectorAll('.resizer');
    // const scannableElements = document.querySelectorAll('.scannable-text'); // Эту строку удаляем

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
            // Исправляем, чтобы начальные координаты были относительно элемента, а не документа
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
            // Убедитесь, что новые координаты правильно рассчитываются относительно видимой области
            let newLeft = clientX - startLeft;
            let newTop = clientY - startTop;

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
        // readAndDisplayInformation(); // Эту строку больше не вызываем, так как нет элементов для считывания
    }

    function handleMouseUp() {
        isDragging = false;
        isResizing = false;
        currentResizer = null;
        osrFrame.style.cursor = 'grab';
        readAndDisplayInformation(); // Обновим информацию в конце действия
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

    // Функция для "считывания" информации теперь просто сообщает, что рамка готова
    function readAndDisplayInformation() {
        outputContent.textContent = "Рамка готова к перемещению.";
    }

    readAndDisplayInformation();
});


