// Simple Circle Drag
document.addEventListener('DOMContentLoaded', () => {
    const circle = document.querySelector('.circle');
    let isDragging = false;
    let currentX;
    let currentY;
    let initialX;
    let initialY;
    let xOffset = 0;
    let yOffset = 0;

    function isMobile() {
        return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
    }

    if (!isMobile()) {
        circle.addEventListener('touchstart', dragStart, false);
        document.addEventListener('touchend', dragEnd, false);
        document.addEventListener('touchmove', drag, false);
    }

    // Cursor Event
    circle.addEventListener('mousedown', dragStart, false);
    document.addEventListener('mouseup', dragEnd, false);
    document.addEventListener('mousemove', drag, false);

    function dragStart(e) {
        if (isMobile()) return;

        if (e.type === 'touchstart') {
            initialX = e.touches[0].clientX - xOffset;
            initialY = e.touches[0].clientY - yOffset;
        } else {
            initialX = e.clientX - xOffset;
            initialY = e.clientY - yOffset;
        }

        if (e.target === circle) {
            isDragging = true;
            circle.classList.add('dragging');
        }
    }

    function dragEnd(e) {
        if (isMobile()) return;

        initialX = currentX;
        initialY = currentY;

        isDragging = false;
        circle.classList.remove('dragging');
        circle.classList.remove('outside'); // Remove outside class when resetting

        circle.style.transform = `translate(0px, 0px)`;
        xOffset = 0;
        yOffset = 0;
    }

    function drag(e) {
        if (isMobile()) return;

        if (isDragging) {
            e.preventDefault();

            if (e.type === 'touchmove') {
                currentX = e.touches[0].clientX - initialX;
                currentY = e.touches[0].clientY - initialY;
            } else {
                currentX = e.clientX - initialX;
                currentY = e.clientY - initialY;
            }

            xOffset = currentX;
            yOffset = currentY;

            circle.style.transform = `translate(${currentX}px, ${currentY}px)`;
            
            // Check if circle is outside container
            checkOutsideBounds();
        }
    }
    
    function checkOutsideBounds() {
        const container = document.querySelector('.container-circle');
        const containerRect = container.getBoundingClientRect();
        const circleRect = circle.getBoundingClientRect();
        
        // Check if any part of circle is outside the container
        const isOutside = (
            circleRect.right < containerRect.left ||
            circleRect.left > containerRect.right ||
            circleRect.bottom < containerRect.top ||
            circleRect.top > containerRect.bottom
        );
        
        if (isOutside) {
            circle.classList.add('outside');
        } else {
            circle.classList.remove('outside');
        }
    }
});
