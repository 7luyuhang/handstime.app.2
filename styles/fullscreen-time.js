// Fullscreen Time functionality with 25-minute countdown
document.addEventListener('DOMContentLoaded', function() {
    const localTimeElement = document.getElementById('localTime');
    const fullscreenOverlay = document.getElementById('fullscreenTime');
    const fullscreenClock = document.getElementById('fullscreenClock');
    const countdownHint = document.getElementById('countdownHint');
    
    // Countdown state management
    let countdownInterval = null;
    let countdownEndTime = null;
    let isCountdownActive = false;
    
    // Constants
    const COUNTDOWN_MINUTES = 25;
    const COUNTDOWN_DURATION = COUNTDOWN_MINUTES * 60 * 1000; // 25 minutes in milliseconds
    
    // Format time for countdown display (MM:SS)
    function formatCountdownTime(milliseconds) {
        const totalSeconds = Math.floor(milliseconds / 1000);
        const minutes = Math.floor(totalSeconds / 60);
        const seconds = totalSeconds % 60;
        return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
    }
    
    // Update fullscreen time to match local time
    function updateFullscreenTime() {
        if (!isCountdownActive) {
            // Generate fresh time to avoid conflicts
            const now = new Date();
            const currentTime = now.toLocaleTimeString();
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
        
        // Add scale effect during transition
        fullscreenClock.style.transform = 'scale(0.95)';
        
        setTimeout(() => {
            // Add visual feedback
            fullscreenClock.classList.add('countdown-active');
            
            // Show countdown hint
            countdownHint.classList.add('active');
            
            // Update immediately
            updateCountdown();
            
            // Remove scale after transition
            fullscreenClock.style.transform = '';
        }, 125); // Half of the transition duration
        
        // Update every second
        countdownInterval = setInterval(updateCountdown, 1000); // Update every second
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
        
        // Add scale effect during transition
        fullscreenClock.style.transform = 'scale(0.95)';
        
        setTimeout(() => {
            fullscreenClock.classList.remove('countdown-active');
            
            // Hide countdown hint
            countdownHint.classList.remove('active');
            
            // Remove scale after transition
            fullscreenClock.style.transform = '';
        }, 125); // Half of the transition duration
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
            setTimeout(() => {
                updateFullscreenTime();
            }, 125); // Wait for scale transition
        } else {
            // Start 25-minute countdown
            startCountdown();
        }
    });
    
    // Click anywhere on fullscreen overlay to exit (only when no countdown is active)
    fullscreenOverlay.addEventListener('click', function() {
        if (!isCountdownActive) {
            // Only exit fullscreen when no countdown is active
            exitFullscreenTime();
        }
        // If countdown is active, do nothing (only clicking the clock can cancel it)
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