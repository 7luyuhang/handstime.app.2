// Fullscreen Time functionality with 25-minute countdown
document.addEventListener('DOMContentLoaded', function() {
    const localTimeElement = document.getElementById('localTime');
    const fullscreenOverlay = document.getElementById('fullscreenTime');
    const fullscreenClock = document.getElementById('fullscreenClock');
    const countdownHint = document.getElementById('countdownHint');
    const cancelButton = document.getElementById('fullscreenCancelBtn');
    const fullscreenModeButton = document.getElementById('fullscreenModeBtn');
    const timeFormatButton = document.getElementById('timeFormatBtn');
    
    // Countdown state management
    let countdownInterval = null;
    let countdownEndTime = null;
    let isCountdownActive = false;
    let isCountdownComplete = false;
    
    // Time format state: 0 = 24H, 1 = 12H
    let timeFormatMode = 0;
    const timeFormatLabels = ['24H', '12H'];
    
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
    
    // Format time based on current format mode
    function formatTimeDisplay(date) {
        let hours = date.getHours();
        let minutes = date.getMinutes();
        let seconds = date.getSeconds();
        let timeString = '';
        
        if (timeFormatMode === 0) {
            // 24H format
            timeString = `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
        } else {
            // 12H format without AM/PM
            hours = hours % 12 || 12;
            timeString = `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
        }
        
        return timeString;
    }
    
    // Update fullscreen time to match local time
    function updateFullscreenTime() {
        if (!isCountdownActive) {
            // Generate fresh time to avoid conflicts
            const now = new Date();
            const currentTime = formatTimeDisplay(now);
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
        isCountdownComplete = false;
        
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
            
            // Clear the interval but keep the state
            if (countdownInterval) {
                clearInterval(countdownInterval);
                countdownInterval = null;
            }
            
            // Mark as complete but don't reset other states
            isCountdownActive = false;
            isCountdownComplete = true;
            
            // Add visual feedback for completion
            fullscreenClock.classList.add('countdown-complete');
            // Keep hint visible to guide user
            // Keep showing 00:00 until user clicks to reset
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
        isCountdownComplete = false;
        
        // Add scale effect during transition
        fullscreenClock.style.transform = 'scale(0.95)';
        
        setTimeout(() => {
            fullscreenClock.classList.remove('countdown-active');
            fullscreenClock.classList.remove('countdown-complete');
            
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
        if (isCountdownActive || isCountdownComplete) {
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
        } else if (isCountdownComplete) {
            // Reset from completed state to current time
            stopCountdown();
            setTimeout(() => {
                updateFullscreenTime();
            }, 125);
        } else {
            // Start 25-minute countdown
            startCountdown();
        }
    });
    
    // Remove click to exit functionality - only use Cancel button
    // fullscreenOverlay.addEventListener('click', function() {
    //     if (!isCountdownActive && !isCountdownComplete) {
    //         // Only exit fullscreen when no countdown is active or complete
    //         exitFullscreenTime();
    //     }
    //     // If countdown is active or complete, do nothing (only clicking the clock can reset it)
    // });
    
    // Click cancel button to exit fullscreen
    cancelButton.addEventListener('click', function(e) {
        e.stopPropagation(); // Prevent event bubbling
        exitFullscreenTime();
    });
    
    // Click Full Screen button to enter browser fullscreen mode
    fullscreenModeButton.addEventListener('click', function(e) {
        e.stopPropagation(); // Prevent event bubbling
        
        // Toggle fullscreen mode
        if (!document.fullscreenElement) {
            // Enter fullscreen
            document.documentElement.requestFullscreen().catch(err => {
                console.log(`Error attempting to enable fullscreen: ${err.message}`);
            });
        } else {
            // Exit fullscreen
            document.exitFullscreen().catch(err => {
                console.log(`Error attempting to exit fullscreen: ${err.message}`);
            });
        }
    });
    
    // Update button text based on fullscreen state
    document.addEventListener('fullscreenchange', function() {
        if (fullscreenModeButton) {
            if (document.fullscreenElement) {
                fullscreenModeButton.textContent = 'Collapse';
            } else {
                fullscreenModeButton.textContent = 'Expand';
            }
        }
    });
    
    // Click Time Format button to cycle through formats
    if (timeFormatButton) {
        timeFormatButton.addEventListener('click', function(e) {
            e.stopPropagation(); // Prevent event bubbling
            
            // Cycle through formats: 0 -> 1 -> 0
            timeFormatMode = (timeFormatMode + 1) % 2;
            
            // Update button text
            timeFormatButton.textContent = timeFormatLabels[timeFormatMode];
            
            // Update the displayed time immediately
            updateFullscreenTime();
            
            // Save preference to localStorage
            localStorage.setItem('preferredTimeFormat', timeFormatMode);
        });
    }
    
    // Load saved time format preference
    const savedFormat = localStorage.getItem('preferredTimeFormat');
    if (savedFormat !== null) {
        timeFormatMode = Math.min(parseInt(savedFormat), 1); // Ensure it's 0 or 1
        if (timeFormatButton) {
            timeFormatButton.textContent = timeFormatLabels[timeFormatMode];
        }
    }
    
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
        if (fullscreenOverlay.classList.contains('active') && !isCountdownActive && !isCountdownComplete) {
            updateFullscreenTime();
        }
    }, 1000);
});