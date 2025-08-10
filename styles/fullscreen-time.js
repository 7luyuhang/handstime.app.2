// Fullscreen Time functionality with 25-minute countdown
document.addEventListener('DOMContentLoaded', function() {
    const localTimeElement = document.getElementById('localTime');
    const fullscreenOverlay = document.getElementById('fullscreenTime');
    const fullscreenClock = document.getElementById('fullscreenClock');
    
    // Countdown state management
    let countdownInterval = null;
    let countdownEndTime = null;
    let isCountdownActive = false;
    
    // Constants
    const COUNTDOWN_MINUTES = 25;
    const COUNTDOWN_DURATION = COUNTDOWN_MINUTES * 60 * 1000; // 25 minutes in milliseconds
    
    // Format time for countdown display (MM:SS)
    function formatCountdownTime(milliseconds) {
        const totalSeconds = Math.ceil(milliseconds / 1000);
        const minutes = Math.floor(totalSeconds / 60);
        const seconds = totalSeconds % 60;
        return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
    }
    
    // Update fullscreen time to match local time
    function updateFullscreenTime() {
        if (!isCountdownActive) {
            // Get the current time from the local time element to ensure sync
            const currentTime = localTimeElement.textContent || new Date().toLocaleTimeString();
            fullscreenClock.textContent = currentTime;
        }
    }
    
    // Start countdown
    function startCountdown() {
        // Clear any existing countdown
        stopCountdown();
        
        // Set the end time
        countdownEndTime = Date.now() + COUNTDOWN_DURATION;
        isCountdownActive = true;
        
        // Add visual feedback
        fullscreenClock.classList.add('countdown-active');
        
        // Update immediately
        updateCountdown();
        
        // Update every second
        countdownInterval = setInterval(updateCountdown, 100); // Update every 100ms for smoother display
    }
    
    // Update countdown display
    function updateCountdown() {
        if (!isCountdownActive || !countdownEndTime) {
            return;
        }
        
        const remainingTime = countdownEndTime - Date.now();
        
        if (remainingTime <= 0) {
            // Countdown finished
            fullscreenClock.textContent = '00:00';
            stopCountdown();
            // Optional: Add some visual/audio feedback for completion
            fullscreenClock.classList.add('countdown-complete');
            setTimeout(() => {
                fullscreenClock.classList.remove('countdown-complete');
                updateFullscreenTime(); // Return to showing current time
            }, 2000);
        } else {
            // Update display with remaining time
            fullscreenClock.textContent = formatCountdownTime(remainingTime);
        }
    }
    
    // Stop countdown
    function stopCountdown() {
        if (countdownInterval) {
            clearInterval(countdownInterval);
            countdownInterval = null;
        }
        countdownEndTime = null;
        isCountdownActive = false;
        fullscreenClock.classList.remove('countdown-active');
    }
    
    // Enter fullscreen mode
    function enterFullscreenTime() {
        fullscreenOverlay.classList.add('active');
        updateFullscreenTime();
        
        // Disable body scroll
        document.body.style.overflow = 'hidden';
    }
    
    // Exit fullscreen mode
    function exitFullscreenTime() {
        fullscreenOverlay.classList.remove('active');
        
        // Stop countdown when exiting fullscreen
        if (isCountdownActive) {
            stopCountdown();
        }
        
        // Re-enable body scroll
        document.body.style.overflow = '';
    }
    
    // Click on local time to enter fullscreen
    localTimeElement.addEventListener('click', function(e) {
        e.preventDefault();
        e.stopPropagation();
        enterFullscreenTime();
    });
    
    // Click on fullscreen clock to toggle countdown
    fullscreenClock.addEventListener('click', function(e) {
        e.stopPropagation(); // Prevent closing the fullscreen
        
        if (isCountdownActive) {
            // Stop countdown and return to current time
            stopCountdown();
            updateFullscreenTime();
        } else {
            // Start 25-minute countdown
            startCountdown();
        }
    });
    
    // Click anywhere on fullscreen overlay to exit (or stop countdown if active)
    fullscreenOverlay.addEventListener('click', function() {
        if (isCountdownActive) {
            // First click stops countdown
            stopCountdown();
            updateFullscreenTime();
        } else {
            // Second click (or click when no countdown) exits fullscreen
            exitFullscreenTime();
        }
    });
    
    // Press Escape key to exit fullscreen
    document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape' && fullscreenOverlay.classList.contains('active')) {
            exitFullscreenTime();
        }
    });
    
    // Prevent clicks inside the content from closing the fullscreen
    // (Now handled by the clock click event)
    
    // Update fullscreen time when in normal time mode
    setInterval(() => {
        if (fullscreenOverlay.classList.contains('active') && !isCountdownActive) {
            updateFullscreenTime();
        }
    }, 1000);
});