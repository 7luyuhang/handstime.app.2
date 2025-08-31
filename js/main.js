// Circle Drag Functionality - Replaced by smooth-drag.js
// The old drag functionality has been replaced with a physics-based smooth drag system
// See smooth-drag.js for the new implementation that provides:
// - Momentum-based inertia
// - Spring physics for boundaries
// - 60fps smooth animations
// - Better touch/mouse handling

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

 