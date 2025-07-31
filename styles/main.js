// Circle Drag Functionality
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
        circle.classList.remove('outside');
    }
}

function dragEnd(e) {
    if (isMobile()) return;

    initialX = currentX;
    initialY = currentY;

    isDragging = false;
    circle.classList.remove('dragging');

    circle.style.transform = `translate(0px, 0px)`;
    xOffset = 0;
    yOffset = 0;

    circle.classList.remove('outside');
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

        checkCirclePosition();
    }
}

function checkCirclePosition() {
    const container = document.querySelector('.container-circle');
    const containerRect = container.getBoundingClientRect();
    const circleRect = circle.getBoundingClientRect();

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

// Newsletter Functionality
const form = document.getElementById('newsletterForm');
const messageDiv = document.getElementById('message');

form.addEventListener('submit', async (e) => {
    e.preventDefault();

    const email = document.getElementById('email').value;
    messageDiv.className = 'message';

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
        messageDiv.textContent = 'Invalid Format.';
        messageDiv.classList.add('error');
        return;
    }

    try {
        const formBody = `email=${encodeURIComponent(email)}`;

        // Send to Loops.so API
        const response = await fetch("https://app.loops.so/api/newsletter-form/cm321lydv012ti0rop4mwqgh2", {
            method: "POST",
            body: formBody,
            headers: {
                "Content-Type": "application/x-www-form-urlencoded",
            },
        });

        if (!response.ok) {
            throw new Error('Network Error');
        }

        messageDiv.textContent = 'Keep in touch :)';
        messageDiv.classList.add('success');
        form.reset();
    } catch (error) {
        messageDiv.textContent = 'Something went wrong.';
        messageDiv.classList.add('error');
        console.error('Form Error.', error);
    }
});



// Mobile detection for tooltip handling
function isMobileDevice() {
    return (
        /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) ||
        window.matchMedia('(hover: none) and (pointer: coarse)').matches ||
        'ontouchstart' in window ||
        navigator.maxTouchPoints > 0
    );
}

// Light mobile detection - only add class for CSS targeting
function initTooltipHandling() {
    if (isMobileDevice()) {
        // Add mobile-specific class to body for CSS targeting
        document.body.classList.add('mobile-device');
    }
}

// Initialize tooltip handling when DOM is loaded
document.addEventListener('DOMContentLoaded', initTooltipHandling);

 