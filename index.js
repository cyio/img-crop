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
        if (isShiftPressed) {
            if (currentHandle.classList.contains('top') || currentHandle.classList.contains('bottom')) {
                newHeight = startHeight + heightChange
                newWidth = newHeight * aspectRatio;
            } else if (currentHandle.classList.contains('left') || currentHandle.classList.contains('right')) {
                newWidth = startWidth + widthChange
                newHeight = newWidth / aspectRatio
            } else {
                newWidth = startWidth + widthChange
                newHeight = newWidth / aspectRatio
            }
            newTop = centerY - newHeight / 2;
            newLeft = centerX - newWidth / 2;
        } else {
            newWidth = Math.min(Math.max(startWidth + widthChange, 0), containerRect.width);
            newHeight = Math.min(Math.max(startHeight + heightChange, 0), containerRect.height);
            newLeft = Math.max(0, Math.min(centerX - newWidth / 2, containerRect.width - newWidth));
            newTop = Math.max(0, Math.min(centerY - newHeight / 2, containerRect.height - newHeight));    
        }
        console.log('applyAltResize input', {centerX, centerY, widthChange, heightChange, startWidth})
        console.log('applyAltResize output', {newLeft, newWidth})
    }

    function applyShiftAdjust() {
        if (!isShiftPressed) return;

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
                if (currentHandle.classList.contains('left-top') || currentHandle.classList.contains('right-top')) {
                    const deltaY = startHeight - adjustedHeight; // 计算调整后的 delta
                    newTop = startTop + deltaY;
                }
            } else {
                adjustedHeight = newHeight;
                adjustedWidth = newHeight * aspectRatio;
                if (
                    currentHandle.classList.contains('left-top') ||
                    currentHandle.classList.contains('left-bottom')
                ) {
                    const deltaX = startWidth - adjustedWidth;
                    newLeft = startLeft + deltaX;
                }
            }
        }
        if (currentHandle.classList.contains('right') || currentHandle.classList.contains('left')) {
            const deltaY = adjustedHeight - startHeight;
            newTop -= deltaY / 2;
        }
        if (currentHandle.classList.contains('top') || currentHandle.classList.contains('bottom')) {
            const delta = adjustedWidth - startWidth;
            newLeft -= delta / 2;
        }

        newWidth = adjustedWidth;
        newHeight = adjustedHeight;
        console.log('applyShiftAdjust input', { startTop, startHeight });
        console.log('applyShiftAdjust output', { newTop, newHeight });
        // console.log('debug shift: ', { newWidth, newHeight })
    }

    const enableOpposite = !isAltPressed && !isShiftPressed; // 无按键时，允许反向调节

    // 右下角
    if (currentHandle.classList.contains('right-bottom')) {
        if (isAltPressed) {
            applyAltResize(deltaX * 2, deltaY * 2);
        } else {
            newWidth = startWidth + deltaX;
            newHeight = startHeight + deltaY;
            newLeft = startLeft;
            newTop = startTop;
            applyShiftAdjust();
        }
        if (enableOpposite) {
            if (newWidth < 0) {
                newWidth = Math.abs(newWidth);
                newLeft -= newWidth;
            }
            if (newHeight < 0) {
                newHeight = Math.abs(newHeight);
                newTop -= newHeight;
            }
        }
    // 左下角
    } else if (currentHandle.classList.contains('left-bottom')) {
        if (isAltPressed) {
            applyAltResize(-deltaX * 2, deltaY * 2);
        } else {
            newWidth = startWidth - deltaX;
            newHeight = startHeight + deltaY;
            newLeft = startLeft + deltaX;
            newTop = startTop;
            applyShiftAdjust();
            if (enableOpposite) {
                if (newWidth < 0) {
                    newWidth = Math.abs(newWidth);
                    newLeft = startLeft + startWidth;
                }
                if (newHeight < 0) {
                    newHeight = Math.abs(newHeight);
                    newTop = startTop - newHeight;
                }
            }
        }
    // 右上角
    } else if (currentHandle.classList.contains('right-top')) {
        if (isAltPressed) {
            applyAltResize(deltaX * 2, -deltaY * 2);
        } else {
            newWidth = startWidth + deltaX;
            newHeight = startHeight - deltaY;
            newLeft = startLeft;
            newTop = startTop + deltaY;
            applyShiftAdjust();
            if (enableOpposite) {
                if (newWidth < 0) {
                    newWidth = Math.abs(newWidth);
                    newLeft = startLeft - newWidth;
                }
                if (newHeight < 0) {
                    newHeight = Math.abs(newHeight);
                    newTop = startTop + startHeight;
                }
            }
        }
    // 左上角
    } else if (currentHandle.classList.contains('left-top')) {
        if (isAltPressed) {
            applyAltResize(-deltaX * 2, -deltaY * 2);
        } else {
            newWidth = startWidth - deltaX;
            newHeight = startHeight - deltaY;
            newLeft = startLeft + deltaX;
            newTop = startTop + deltaY;
            applyShiftAdjust();
            if (enableOpposite) {
                if (newWidth < 0) {
                    newWidth = Math.abs(newWidth);
                    newLeft = startLeft + startWidth;
                }
                if (newHeight < 0) {
                    newHeight = Math.abs(newHeight);
                    newTop = startTop + startHeight;
                }
            }
        }
    // 上
    } else if (currentHandle.classList.contains('top')) {
        if (isAltPressed) {
            applyAltResize(0, -deltaY * 2);
        } else {
            newWidth = startWidth;
            newHeight = startHeight - deltaY;
            newLeft = startLeft;
            newTop = startTop + deltaY;
            applyShiftAdjust();
        }
        if (enableOpposite) {
            if (newHeight < 0) {
                newHeight = Math.abs(newHeight);
                newTop = startTop + startHeight;
            }
        }
    // 下
    } else if (currentHandle.classList.contains('bottom')) {
        if (isAltPressed) {
            applyAltResize(0, deltaY * 2);
        } else {
            newWidth = startWidth;
            newHeight = startHeight + deltaY;
            newLeft = startLeft;
            newTop = startTop; // 底部不改变 top 值
            applyShiftAdjust();
        }
        if (enableOpposite) {
            if (newHeight < 0) {
                newHeight = Math.abs(newHeight);
                newHeight = Math.min(newHeight, startTop);
                newTop = startTop - newHeight;
            }
        }
    // 左
    } else if (currentHandle.classList.contains('left')) {
        if (isAltPressed) {
            applyAltResize(-deltaX * 2, 0);
        } else {
            newWidth = startWidth - deltaX;
            newHeight = startHeight;
            newLeft = startLeft + deltaX;
            newTop = startTop;
            applyShiftAdjust();
        }
        if (enableOpposite) {
            if (newWidth < 0) {
                newWidth = Math.abs(newWidth);
                newLeft = startLeft + startWidth;
            }
        }
    // 右
    } else if (currentHandle.classList.contains('right')) {
        if (isAltPressed) {
            applyAltResize(deltaX * 2, 0);
        } else {
            newWidth = startWidth + deltaX;
            newHeight = startHeight;
            newLeft = startLeft; // 右侧不改变 left 值
            newTop = startTop;
            applyShiftAdjust();
        }
        if (enableOpposite) {
            if (newWidth < 0) {
                newWidth = Math.abs(newWidth);
                newLeft = startLeft - newWidth;
            }
        }
    }

    function keepRatio() {
        // 保持比例，输出不变形
        if (isShiftPressed && !isAltPressed) {
            if (newWidth / aspectRatio <= newHeight) {
                newHeight = newWidth / aspectRatio;
            } else {
                newWidth = newHeight * aspectRatio;
            }
        }
    }

    function limitByImgContainer() {
        // 确保裁剪框不会超出容器边界
        // newLeft = Math.max(0, Math.min(newLeft, containerRect.x + containerRect.width - newWidth));
        // newTop = Math.max(0, Math.min(newTop, containerRect.y + containerRect.height - newHeight));
        newWidth = Math.min(newWidth, containerRect.x + containerRect.width - newLeft); // 一侧不溢出
        newWidth = Math.min(newWidth, containerRect.width); // 限制在容器内
        newHeight = Math.min(newHeight, containerRect.y + containerRect.height - newTop);

        // 公共限制，防止 x 超出左边界
        if (newLeft < containerRect.x) {
            const diff = containerRect.x - newLeft;
            newLeft = containerRect.x;
            newWidth -= diff;
            if (isShiftPressed) {
                newHeight = newWidth / aspectRatio;
            }
        }

        if (newTop < containerRect.y) {
            const diff = containerRect.y - newTop;
            newTop = containerRect.y;
            newHeight -= diff;
            if (isShiftPressed) {
                newWidth = newHeight * aspectRatio;
            }
        }
    }

    function minLimit() {
        return newWidth <= 50 || newHeight <= 50;
    }
    function limitByEdge() {
        const tolerance = 1; // 1像素的容差，以处理可能的舍入误差

        const isLeftEdge = newLeft <= containerRect.x + tolerance;
        const isRightEdge = newLeft + newWidth >= containerRect.x + containerRect.width - tolerance;
        const isTopEdge = newTop <= containerRect.y + tolerance;
        const isBottomEdge = newTop + newHeight >= containerRect.y + containerRect.height - tolerance;

        console.log('isEdge', isRightEdge, { newLeft, newWidth }, containerRect);
        return isLeftEdge || isRightEdge || isTopEdge || isBottomEdge;
    }

    // 按住 alt 或 shift时，有任意一边贴边时，停止 resize
    if (isShiftPressed || isAltPressed) {
        if (limitByEdge()) {
            return;
        }
        // if (minLimit()) {
        //     return;
        // }
    } else {
    }

    keepRatio();
    limitByImgContainer();

    // console.log('debug', { newWidth, newHeight, newLeft, newTop })
    let scene = 'drag'
    updateCropBox('resize', { newWidth, newHeight, newLeft, newTop });
}

function updateCropBox(scene, {newWidth, newHeight, newLeft, newTop}) {
    console.log('updateCropBox: ', scene, { newWidth, newHeight, newLeft, newTop })
    // 应用新的尺寸和位置
    if (scene === 'resize') {
        cropBox.style.width = `${newWidth}px`;
        cropBox.style.height = `${newHeight}px`;       
    }
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

    updateCropBox('drag', {newLeft, newTop})
}

function stopInteraction() {
    isResizing = false;
    isDragging = false;
}