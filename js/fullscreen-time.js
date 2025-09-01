// Fullscreen Time functionality with 25-minute countdown
document.addEventListener('DOMContentLoaded', function() {
    const localTimeElement = document.getElementById('localTime');
    const fullscreenOverlay = document.getElementById('fullscreenTime');
    const fullscreenClock = document.getElementById('fullscreenClock');
    const cancelButton = document.getElementById('fullscreenCancelBtn');
    const fullscreenModeButton = document.getElementById('fullscreenModeBtn');
    const timeFormatButton = document.getElementById('timeFormatBtn');
    const backgroundToggleBtn = document.getElementById('backgroundToggleBtn');
    const setTimerBtn = document.getElementById('setTimerBtn');
    const bottomControlsGroup = document.querySelector('.bottom-controls-group');
    const pauseResumeBtn = document.getElementById('pauseResumeBtn');
    const timerControlsGroup = document.querySelector('.timer-controls-group');
    
    // Countdown state management
    let countdownInterval = null;
    let countdownEndTime = null;
    let countdownStartTime = null; // Track when countdown started
    let isCountdownActive = false;
    let isCountdownComplete = false;
    let isCountdownPaused = false;
    let pausedRemainingTime = null; // Store remaining time when paused
    
    // Time format state: 0 = 24H, 1 = 12H
    let timeFormatMode = 0;
    const timeFormatLabels = ['24H', '12H'];
    
    // Timer adjustment will be handled by timerAdjustment module
    
    // Constants
    let COUNTDOWN_MINUTES = window.timerAdjustment ? window.timerAdjustment.adjustedTimerMinutes : 25;
    let COUNTDOWN_DURATION = COUNTDOWN_MINUTES * 60 * 1000; // default in milliseconds
    
    // Format time for countdown display (MM:SS)
    function formatCountdownTime(milliseconds) {
        const totalSeconds = Math.ceil(milliseconds / 1000);
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
        const isAdjusting = window.timerAdjustment && window.timerAdjustment.isAdjustingTimer;
        if (!isCountdownActive && !isAdjusting) {
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
        
        // Play warsaw.mp3 sound when timer starts
        const audio = new Audio('assets/sound/warsaw.mp3');
        audio.play().catch(err => {
            console.log('Error playing sound:', err);
        });
        
        // Get the latest timer value from the module if available
        if (window.timerAdjustment) {
            COUNTDOWN_MINUTES = window.timerAdjustment.adjustedTimerMinutes;
            COUNTDOWN_DURATION = COUNTDOWN_MINUTES * 60 * 1000;
        }
        
        // Set the start and end time
        countdownStartTime = Date.now();
        countdownEndTime = Date.now() + COUNTDOWN_DURATION;
        isCountdownActive = true;
        isCountdownComplete = false;
        isCountdownPaused = false;
        pausedRemainingTime = null;
        lastDisplayedSeconds = -1; // Reset tracker for new countdown
        
        // Hide background selector during countdown
        if (window.backgroundSelector && window.backgroundSelector.hideSelector) {
            window.backgroundSelector.hideSelector();
        }
        
        // Disable background toggle button during countdown
        if (backgroundToggleBtn) {
            backgroundToggleBtn.disabled = true;
            backgroundToggleBtn.style.opacity = '0.3';
        }
        
        // Hide bottom controls during countdown
        if (bottomControlsGroup) {
            bottomControlsGroup.style.display = 'none';
        }
        
        // Add scale effect during transition
        fullscreenClock.style.transform = 'scale(0.95)';
        
        setTimeout(() => {
            // Add visual feedback
            fullscreenClock.classList.add('countdown-active');
            
            // Update immediately
            updateCountdown();
            
            // Remove scale after transition
            fullscreenClock.style.transform = '';
        }, 125); // Half of the transition duration
        
        // Update every second
        countdownInterval = setInterval(updateCountdown, 100); // Update every 100ms for smooth display
    }
    
    // Pause countdown
    function pauseCountdown() {
        if (isCountdownActive && !isCountdownPaused) {
            isCountdownPaused = true;
            pausedRemainingTime = countdownEndTime - Date.now();
            
            // Clear the interval
            if (countdownInterval) {
                clearInterval(countdownInterval);
                countdownInterval = null;
            }
            
            // Update button icon to continue
            if (pauseResumeBtn) {
                const buttonIcon = pauseResumeBtn.querySelector('.button-icon');
                if (buttonIcon) {
                    buttonIcon.src = 'assets/image/systemIcon/systemIcon_continue.svg';
                    buttonIcon.alt = 'Continue';
                    pauseResumeBtn.title = 'Resume';
                }
            }
        }
    }
    
    // Resume countdown
    function resumeCountdown() {
        if (isCountdownActive && isCountdownPaused && pausedRemainingTime !== null) {
            isCountdownPaused = false;
            
            // Reset the end time based on paused remaining time
            countdownEndTime = Date.now() + pausedRemainingTime;
            pausedRemainingTime = null;
            
            // Update button icon back to pause
            if (pauseResumeBtn) {
                const buttonIcon = pauseResumeBtn.querySelector('.button-icon');
                if (buttonIcon) {
                    buttonIcon.src = 'assets/image/systemIcon/systemIcon_pasue.svg';
                    buttonIcon.alt = 'Pause';
                    pauseResumeBtn.title = 'Pause';
                }
            }
            
            // Update immediately and restart interval
            updateCountdown();
            countdownInterval = setInterval(updateCountdown, 100);
        }
    }
    
    // Update countdown display
    let lastDisplayedSeconds = -1; // Track last displayed second to avoid unnecessary DOM updates
    
    function updateCountdown() {
        if (!isCountdownActive || !countdownEndTime || isCountdownPaused) {
            return;
        }
        
        const remainingTime = countdownEndTime - Date.now();
        
        if (remainingTime <= 0) {
            // Countdown finished
            fullscreenClock.textContent = '00:00';
            lastDisplayedSeconds = 0;
            
            // Clear the interval but keep the state
            if (countdownInterval) {
                clearInterval(countdownInterval);
                countdownInterval = null;
            }
            
            // Record the actual timer usage (full duration was used)
            if (window.timerHistory && countdownStartTime) {
                const actualDurationMs = Date.now() - countdownStartTime;
                const actualDurationMinutes = actualDurationMs / (60 * 1000);
                // Pass true to indicate timer was completed
                window.timerHistory.addTimerRecord(actualDurationMinutes, true);
            }
            
            // Mark as complete but don't reset other states
            isCountdownActive = false;
            isCountdownComplete = true;
            
            // Add visual feedback for completion
            fullscreenClock.classList.remove('countdown-active'); // Remove active class
            fullscreenClock.classList.add('countdown-complete');
            // Keep hint visible to guide user
            // Keep showing 00:00 until user clicks to reset
        } else {
            // Update display only if the second has changed
            const currentSeconds = Math.ceil(remainingTime / 1000);
            if (currentSeconds !== lastDisplayedSeconds) {
                fullscreenClock.textContent = formatCountdownTime(remainingTime);
                lastDisplayedSeconds = currentSeconds;
            }
        }
    }
    
    // Stop countdown
    function stopCountdown() {
        // Record actual timer usage if countdown was active (user stopped early)
        if (isCountdownActive && countdownStartTime && window.timerHistory) {
            // Calculate actual duration considering pauses
            let actualDurationMs;
            if (isCountdownPaused && pausedRemainingTime !== null) {
                // If paused, calculate based on what was already used
                const originalDuration = COUNTDOWN_DURATION;
                actualDurationMs = originalDuration - pausedRemainingTime;
            } else {
                actualDurationMs = Date.now() - countdownStartTime;
            }
            const actualDurationMinutes = actualDurationMs / (60 * 1000);
            // Pass false to indicate timer was stopped early
            window.timerHistory.addTimerRecord(actualDurationMinutes, false);
        }
        
        if (countdownInterval) {
            clearInterval(countdownInterval);
            countdownInterval = null;
        }
        countdownEndTime = null;
        countdownStartTime = null;
        isCountdownActive = false;
        isCountdownComplete = false;
        isCountdownPaused = false;
        pausedRemainingTime = null;
        lastDisplayedSeconds = -1; // Reset the last displayed seconds tracker
        
        // Reset button icon to pause (for next countdown)
        if (pauseResumeBtn) {
            const buttonIcon = pauseResumeBtn.querySelector('.button-icon');
            if (buttonIcon) {
                buttonIcon.src = 'assets/image/systemIcon/systemIcon_pasue.svg';
                buttonIcon.alt = 'Pause';
                pauseResumeBtn.title = 'Pause';
            }
        }
        
        // Re-enable background toggle button when countdown stops
        if (backgroundToggleBtn) {
            backgroundToggleBtn.disabled = false;
            backgroundToggleBtn.style.opacity = '';
        }
        
        // Show bottom controls when countdown stops
        if (bottomControlsGroup) {
            bottomControlsGroup.style.display = '';
        }
        
        // Add scale effect during transition
        fullscreenClock.style.transform = 'scale(0.95)';
        
        setTimeout(() => {
            fullscreenClock.classList.remove('countdown-active');
            fullscreenClock.classList.remove('countdown-complete');
            
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
        
        // Hide background selector when exiting
        if (window.backgroundSelector && window.backgroundSelector.hideSelector) {
            window.backgroundSelector.hideSelector();
        }
        
        // Stop countdown when exiting fullscreen
        if (isCountdownActive || isCountdownComplete) {
            stopCountdown();
        }
        
        // Re-enable body scroll
        document.body.style.overflow = '';
    }
    
    // Callback to update countdown duration from timer adjustment
    function updateCountdownDuration(minutes) {
        COUNTDOWN_MINUTES = minutes;
        COUNTDOWN_DURATION = COUNTDOWN_MINUTES * 60 * 1000;
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
        
        // Don't start countdown if we're adjusting timer
        const isAdjusting = window.timerAdjustment && window.timerAdjustment.isAdjustingTimer;
        if (isAdjusting) {
            return;
        }
        
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
            // Start countdown with adjusted duration
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
    
    // Click pause/resume button
    if (pauseResumeBtn) {
        pauseResumeBtn.addEventListener('click', function(e) {
            e.stopPropagation(); // Prevent event bubbling
            
            if (isCountdownActive && !isCountdownComplete) {
                if (isCountdownPaused) {
                    resumeCountdown();
                } else {
                    pauseCountdown();
                }
            }
        });
    }
    
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
    
    // Update button icon and tooltip based on fullscreen state
    document.addEventListener('fullscreenchange', function() {
        if (fullscreenModeButton) {
            const buttonIcon = fullscreenModeButton.querySelector('.button-icon');
            if (buttonIcon) {
                if (document.fullscreenElement) {
                    // In fullscreen - show collapse icon
                    buttonIcon.src = 'assets/image/systemIcon/systemIcon_collapse.svg';
                    buttonIcon.alt = 'Collapse';
                    fullscreenModeButton.title = 'Exit Full Screen';
                } else {
                    // Not in fullscreen - show expand icon
                    buttonIcon.src = 'assets/image/systemIcon/systemIcon_expand.svg';
                    buttonIcon.alt = 'Expand';
                    fullscreenModeButton.title = 'Full Screen';
                }
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
            
            // Trigger update of main page time display
            if (typeof updateLocalTime === 'function') {
                updateLocalTime();
            }
        });
    }
    
    // Initialize timer adjustment module
    if (window.timerAdjustment) {
        const elements = {
            timeFormatButton,
            backgroundToggleBtn,
            setTimerBtn,
            cancelButton,
            fullscreenModeButton,
            fullscreenClock
        };
        
        const callbacks = {
            stopCountdown: function() {
                if (isCountdownActive || isCountdownComplete) {
                    stopCountdown();
                }
            },
            updateCountdownDuration,
            updateFullscreenTime
        };
        
        window.timerAdjustment.init(elements, callbacks);
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
        const isAdjusting = window.timerAdjustment && window.timerAdjustment.isAdjustingTimer;
        if (fullscreenOverlay.classList.contains('active') && !isCountdownActive && !isCountdownComplete && !isAdjusting) {
            updateFullscreenTime();
        }
    }, 1000);
});