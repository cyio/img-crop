const cropperContainer = document.getElementById('cropperContainer');
const cropBox = document.getElementById('cropBox');
const dragArea = document.getElementById('dragArea');
const image = document.getElementById('image');
let isResizing = false;
let isDragging = false;
let currentHandle = null;
let startX, startY, startWidth, startHeight, startLeft, startTop;

// 初始化裁剪框
cropBox.style.width = '200px';
cropBox.style.height = '200px';
cropBox.style.left = '150px';
cropBox.style.top = '150px';

// 为所有调整手柄添加事件监听器
document.querySelectorAll('.resize-handle').forEach(handle => {
    handle.addEventListener('mousedown', startResize);
});

// 为拖动区域添加事件监听器
dragArea.addEventListener('mousedown', startDrag);
// 缩放
document.addEventListener('mousemove', handleMouseMove);
document.addEventListener('mouseup', stopInteraction);

function startResize(e) {
    isResizing = true;
    currentHandle = e.target;
    startInteraction(e);
}

function startDrag(e) {
    isDragging = true;
    startInteraction(e);
}

function startInteraction(e) {
    startX = e.clientX;
    startY = e.clientY;
    startWidth = parseInt(cropBox.style.width);
    startHeight = parseInt(cropBox.style.height);
    startLeft = parseInt(cropBox.style.left);
    startTop = parseInt(cropBox.style.top);
    e.preventDefault();
}

function handleMouseMove(e) {
    if (isResizing) {
        resize(e);
    } else if (isDragging) {
        drag(e);
    }
}

function resize(e) {
    if (!isResizing) return;

    let newWidth, newHeight, newLeft, newTop;
    const containerRect = cropperContainer.getBoundingClientRect();
    const aspectRatio = startWidth / startHeight;
    const isShiftPressed = e.shiftKey;
    const isAltPressed = e.altKey;

    const deltaX = e.clientX - startX;
    const deltaY = e.clientY - startY;

    function applyAltResize(widthChange, heightChange) {
        const centerX = startLeft + startWidth / 2;
        const centerY = startTop + startHeight / 2;
        newWidth = Math.min(Math.max(startWidth + widthChange, 0), containerRect.width);
        newHeight = Math.min(Math.max(startHeight + heightChange, 0), containerRect.height);
        newLeft = Math.max(0, Math.min(centerX - newWidth / 2, containerRect.width - newWidth));
        newTop = Math.max(0, Math.min(centerY - newHeight / 2, containerRect.height - newHeight));
    }

    // 右下角
    if (currentHandle.classList.contains('right-bottom')) {
        if (isAltPressed) {
            applyAltResize(deltaX * 2, deltaY * 2);
        } else {
            newWidth = Math.min(Math.max(startWidth + deltaX, 10), containerRect.width - startLeft);
            newHeight = Math.min(Math.max(startHeight + deltaY, 10), containerRect.height - startTop);
            newLeft = startLeft;
            newTop = startTop;
        }
    // 左下角
    } else if (currentHandle.classList.contains('left-bottom')) {
        if (isAltPressed) {
            applyAltResize(-deltaX * 2, deltaY * 2);
        } else {
            newWidth = Math.min(Math.max(startWidth - deltaX, 10), startLeft + startWidth);
            newHeight = Math.min(Math.max(startHeight + deltaY, 10), containerRect.height - startTop);
            newLeft = Math.max(0, Math.min(startLeft + deltaX, startLeft + startWidth - 10));
            newTop = startTop;
        }
    // 右上角
    } else if (currentHandle.classList.contains('right-top')) {
        if (isAltPressed) {
            applyAltResize(deltaX * 2, -deltaY * 2);
        } else {
            newWidth = Math.min(Math.max(startWidth + deltaX, 10), containerRect.width - startLeft);
            newHeight = Math.min(Math.max(startHeight - deltaY, 10), startTop + startHeight);
            newLeft = startLeft;
            newTop = Math.max(0, Math.min(startTop + deltaY, startTop + startHeight - 10));
        }
    // 左上角
    } else if (currentHandle.classList.contains('left-top')) {
        if (isAltPressed) {
            applyAltResize(-deltaX * 2, -deltaY * 2);
        } else {
            newWidth = Math.min(Math.max(startWidth - deltaX, 10), startLeft + startWidth);
            newHeight = Math.min(Math.max(startHeight - deltaY, 10), startTop + startHeight);
            newLeft = Math.max(0, Math.min(startLeft + deltaX, startLeft + startWidth - 10));
            newTop = Math.max(0, Math.min(startTop + deltaY, startTop + startHeight - 10));
        }
    // 上或下
    } else if (currentHandle.classList.contains('top') || currentHandle.classList.contains('bottom')) {
        if (isAltPressed) {
            applyAltResize(0, currentHandle.classList.contains('top') ? -deltaY * 2 : deltaY * 2);
        } else {
            newWidth = startWidth;
            newHeight = Math.min(Math.max(startHeight + (currentHandle.classList.contains('top') ? -deltaY : deltaY), 10), currentHandle.classList.contains('top') ? startTop + startHeight : containerRect.height - startTop);
            newLeft = startLeft;
            newTop = currentHandle.classList.contains('top') ? Math.max(0, Math.min(startTop + deltaY, startTop + startHeight - 10)) : startTop;
        }
    // 左或右
    } else if (currentHandle.classList.contains('right') || currentHandle.classList.contains('left')) {
        if (isAltPressed) {
            applyAltResize(currentHandle.classList.contains('left') ? -deltaX * 2 : deltaX * 2, 0);
        } else {
            newWidth = Math.min(Math.max(startWidth + (currentHandle.classList.contains('left') ? -deltaX : deltaX), 10), currentHandle.classList.contains('left') ? startLeft + startWidth : containerRect.width - startLeft);
            newHeight = startHeight;
            newLeft = currentHandle.classList.contains('left') ? Math.max(0, Math.min(startLeft + deltaX, startLeft + startWidth - 10)) : startLeft;
            newTop = startTop;
        }
    }

    if (isShiftPressed) {
        let adjustedWidth, adjustedHeight;
        if (currentHandle.classList.contains('top') || currentHandle.classList.contains('bottom')) {
            adjustedHeight = newHeight;
            adjustedWidth = newHeight * aspectRatio;
        } else if (currentHandle.classList.contains('left') || currentHandle.classList.contains('right')) {
            adjustedWidth = newWidth;
            adjustedHeight = newWidth / aspectRatio;
        } else {
            if (newWidth / aspectRatio <= newHeight) {
                adjustedWidth = newWidth;
                adjustedHeight = newWidth / aspectRatio;
            } else {
                adjustedHeight = newHeight;
                adjustedWidth = newHeight * aspectRatio;
            }
        }

        if (!isAltPressed) {
            if (currentHandle.classList.contains('left-top') || currentHandle.classList.contains('left-bottom') || currentHandle.classList.contains('left')) {
                newLeft = startLeft + startWidth - adjustedWidth;
            }
            if (currentHandle.classList.contains('left-top') || currentHandle.classList.contains('right-top') || currentHandle.classList.contains('top')) {
                newTop = startTop + startHeight - adjustedHeight;
            }
        }
        newWidth = adjustedWidth;
        newHeight = adjustedHeight;
    }

    // 确保裁剪框不会超出容器边界
    // newLeft = Math.max(0, Math.min(newLeft, containerRect.width - newWidth));
    // newTop = Math.max(0, Math.min(newTop, containerRect.height - newHeight));
    // newWidth = Math.min(newWidth, containerRect.width - newLeft);
    // newHeight = Math.min(newHeight, containerRect.height - newTop);

    // 应用新的尺寸和位置
    cropBox.style.width = `${newWidth}px`;
    cropBox.style.height = `${newHeight}px`;
    cropBox.style.left = `${newLeft}px`;
    cropBox.style.top = `${newTop}px`;
}

function drag(e) {
    if (!isDragging) return;

    const containerRect = cropperContainer.getBoundingClientRect();
    const deltaX = e.clientX - startX;
    const deltaY = e.clientY - startY;

    let newLeft = Math.max(0, Math.min(startLeft + deltaX, containerRect.width - parseInt(cropBox.style.width)));
    let newTop = Math.max(0, Math.min(startTop + deltaY, containerRect.height - parseInt(cropBox.style.height)));

    cropBox.style.left = `${newLeft}px`;
    cropBox.style.top = `${newTop}px`;
}

function stopInteraction() {
    isResizing = false;
    isDragging = false;
}