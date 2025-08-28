// Set Timer functionality
// Handles timer adjustment with drag interaction

(function() {
    // Timer adjustment module
    window.timerAdjustment = {
        // State
        isAdjustingTimer: false,
        adjustedTimerMinutes: 25,
        dragStartX: 0,
        dragStartMinutes: 25,
        accumulatedMovement: 0,
        hasStartedDragging: false,
        
        // Audio
        clickAudio: null,
        lastPlayedValue: null,
        
        // Constants
        MIN_TIMER_SECONDS: 5, // 00:05
        MAX_TIMER_MINUTES: 60, // 60:00
        TIMER_STEP_SECONDS: 5, // 5 second increments
        SENSITIVITY_FACTOR: 2, // Pixels per second (10 pixels = 5 seconds change)
        
        // Format timer for display (MM:SS)
        formatTimerDisplay: function(totalSeconds) {
            const minutes = Math.floor(totalSeconds / 60);
            const seconds = totalSeconds % 60;
            return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
        },
        
        // Play click sound when timer value changes
        playClickSound: function(newTotalSeconds) {
            // Only play sound if the value has changed and we're actually dragging
            if (this.lastPlayedValue !== newTotalSeconds && this.clickAudio && this.hasStartedDragging) {
                this.lastPlayedValue = newTotalSeconds;
                
                // Clone and play the audio to allow rapid playback
                const audioClone = this.clickAudio.cloneNode();
                audioClone.volume = 0.2; // Adjust volume if needed
                audioClone.play().catch(e => {
                    // Ignore errors if audio can't play
                });
            }
        },
        
        // Start timer adjustment
        startTimerAdjustment: function(e, elements, callbacks) {
            // Stop any active countdown
            if (callbacks.stopCountdown) {
                callbacks.stopCountdown();
            }
            
            this.isAdjustingTimer = true;
            this.dragStartX = e.clientX;
            this.dragStartMinutes = this.adjustedTimerMinutes;
            this.accumulatedMovement = 0; // Reset accumulated movement
            this.lastPlayedValue = null; // Reset last played value for audio
            this.hasStartedDragging = false; // Track if actual dragging has started
            
            // Hide all controls during adjustment
            if (elements.timeFormatButton) elements.timeFormatButton.style.display = 'none';
            if (elements.backgroundToggleBtn) elements.backgroundToggleBtn.style.display = 'none';
            if (elements.setTimerBtn) elements.setTimerBtn.style.display = 'none';
            if (elements.cancelButton) elements.cancelButton.style.display = 'none';
            if (elements.fullscreenModeButton) elements.fullscreenModeButton.style.display = 'none';
            document.querySelectorAll('.vertical-divider').forEach(div => div.style.display = 'none');
            
            // Hide background selector if it's showing
            if (window.backgroundSelector && window.backgroundSelector.hideSelector) {
                window.backgroundSelector.hideSelector();
            }
            
            // Update display to show current timer value
            const totalSeconds = Math.round(this.adjustedTimerMinutes * 60);
            elements.fullscreenClock.textContent = this.formatTimerDisplay(totalSeconds);
            
            // Add visual feedback
            elements.fullscreenClock.classList.add('countdown-active');
            
            // Request pointer lock for infinite scrolling (with vendor prefixes)
            const requestPointerLock = document.body.requestPointerLock || 
                                      document.body.mozRequestPointerLock || 
                                      document.body.webkitRequestPointerLock;
            
            if (requestPointerLock) {
                requestPointerLock.call(document.body);
                // Add pointer lock listener
                document.addEventListener('mousemove', this.handleTimerDragWithPointerLock.bind(this, elements));
            } else {
                // Fallback to regular drag if pointer lock not supported
                document.addEventListener('mousemove', this.handleTimerDrag.bind(this, elements));
            }
            
            // Add mouse up listener
            document.addEventListener('mouseup', this.endTimerAdjustment.bind(this, elements, callbacks));
            
            // Prevent text selection during drag
            document.body.style.userSelect = 'none';
            document.body.style.cursor = 'ew-resize';
        },
        
        // Handle timer drag adjustment with pointer lock
        handleTimerDragWithPointerLock: function(elements, e) {
            if (!this.isAdjustingTimer) return;
            
            // Use movementX for pointer lock movement
            const movement = e.movementX || e.mozMovementX || e.webkitMovementX || 0;
            
            // Mark as dragging when actual movement is detected
            if (movement !== 0 && !this.hasStartedDragging) {
                this.hasStartedDragging = true;
            }
            
            // Accumulate movement with higher sensitivity
            this.accumulatedMovement += movement;
            
            // Map pixel movement to timer change with improved sensitivity
            // Now 1 second requires SENSITIVITY_FACTOR pixels (2 pixels per second)
            const deltaSeconds = this.accumulatedMovement / this.SENSITIVITY_FACTOR;
            
            // Calculate new timer value in seconds (don't round deltaSeconds for smoother control)
            let newTotalSeconds = Math.round(this.dragStartMinutes * 60) + deltaSeconds;
            
            // Round to nearest TIMER_STEP_SECONDS increment for the final value
            newTotalSeconds = Math.round(newTotalSeconds / this.TIMER_STEP_SECONDS) * this.TIMER_STEP_SECONDS;
            
            // Clamp to min/max
            newTotalSeconds = Math.max(this.MIN_TIMER_SECONDS, Math.min(this.MAX_TIMER_MINUTES * 60, newTotalSeconds));
            
            // Update the stored value
            this.adjustedTimerMinutes = newTotalSeconds / 60;
            
            // Play click sound when value changes
            this.playClickSound(newTotalSeconds);
            
            // Update display
            elements.fullscreenClock.textContent = this.formatTimerDisplay(newTotalSeconds);
        },
        
        // Handle timer drag adjustment (fallback without pointer lock)
        handleTimerDrag: function(elements, e) {
            if (!this.isAdjustingTimer) return;
            
            const deltaX = e.clientX - this.dragStartX;
            
            // Mark as dragging when actual movement is detected (threshold to avoid micro-movements)
            if (Math.abs(deltaX) > 2 && !this.hasStartedDragging) {
                this.hasStartedDragging = true;
            }
            // Map pixel movement to timer change with improved sensitivity
            // Now 1 second requires SENSITIVITY_FACTOR pixels (2 pixels per second)
            const deltaSeconds = deltaX / this.SENSITIVITY_FACTOR;
            
            // Calculate new timer value in seconds (don't round deltaSeconds for smoother control)
            let newTotalSeconds = Math.round(this.dragStartMinutes * 60) + deltaSeconds;
            
            // Round to nearest TIMER_STEP_SECONDS increment for the final value
            newTotalSeconds = Math.round(newTotalSeconds / this.TIMER_STEP_SECONDS) * this.TIMER_STEP_SECONDS;
            
            // Clamp to min/max
            newTotalSeconds = Math.max(this.MIN_TIMER_SECONDS, Math.min(this.MAX_TIMER_MINUTES * 60, newTotalSeconds));
            
            // Update the stored value
            this.adjustedTimerMinutes = newTotalSeconds / 60;
            
            // Play click sound when value changes
            this.playClickSound(newTotalSeconds);
            
            // Update display
            elements.fullscreenClock.textContent = this.formatTimerDisplay(newTotalSeconds);
        },
        
        // End timer adjustment
        endTimerAdjustment: function(elements, callbacks, e) {
            if (!this.isAdjustingTimer) return;
            
            this.isAdjustingTimer = false;
            this.hasStartedDragging = false; // Reset dragging flag
            
            // Exit pointer lock (with vendor prefixes)
            const exitPointerLock = document.exitPointerLock || 
                                   document.mozExitPointerLock || 
                                   document.webkitExitPointerLock;
            
            if (exitPointerLock) {
                exitPointerLock.call(document);
            }
            
            // Update the countdown duration via callback
            if (callbacks.updateCountdownDuration) {
                callbacks.updateCountdownDuration(this.adjustedTimerMinutes);
            }
            
            // Show all controls again
            if (elements.timeFormatButton) elements.timeFormatButton.style.display = '';
            if (elements.backgroundToggleBtn) elements.backgroundToggleBtn.style.display = '';
            if (elements.setTimerBtn) elements.setTimerBtn.style.display = '';
            if (elements.cancelButton) elements.cancelButton.style.display = '';
            if (elements.fullscreenModeButton) elements.fullscreenModeButton.style.display = '';
            document.querySelectorAll('.vertical-divider').forEach(div => div.style.display = '');
            
            // Update button text to show current timer value
            const totalSeconds = Math.round(this.adjustedTimerMinutes * 60);
            const btnText = elements.setTimerBtn.querySelector('.timer-btn-text');
            if (btnText) {
                btnText.textContent = this.formatTimerDisplay(totalSeconds);
            } else {
                elements.setTimerBtn.textContent = this.formatTimerDisplay(totalSeconds);
            }
            
            // Remove visual feedback
            elements.fullscreenClock.classList.remove('countdown-active');
            
            // Remove event listeners
            document.removeEventListener('mousemove', this.handleTimerDragWithPointerLock.bind(this, elements));
            document.removeEventListener('mousemove', this.handleTimerDrag.bind(this, elements));
            document.removeEventListener('mouseup', this.endTimerAdjustment.bind(this, elements, callbacks));
            
            // Re-enable text selection and reset cursor
            document.body.style.userSelect = '';
            document.body.style.cursor = '';
            
            // Reset accumulated movement
            this.accumulatedMovement = 0;
            
            // Return to showing time via callback
            if (callbacks.updateFullscreenTime) {
                callbacks.updateFullscreenTime();
            }
        },
        
        // Handle pointer lock change
        handlePointerLockChange: function(elements) {
            const isLocked = document.pointerLockElement || 
                            document.mozPointerLockElement || 
                            document.webkitPointerLockElement;
            
            // If pointer lock was lost while adjusting timer, switch to regular drag
            if (this.isAdjustingTimer && !isLocked) {
                // Remove pointer lock handler and add regular handler
                document.removeEventListener('mousemove', this.handleTimerDragWithPointerLock.bind(this, elements));
                document.addEventListener('mousemove', this.handleTimerDrag.bind(this, elements));
            }
        },
        
        // Initialize timer adjustment
        init: function(elements, callbacks) {
            const self = this;
            
            // Initialize audio
            this.clickAudio = new Audio('styles/sound/key_press_click.mp3');
            this.clickAudio.preload = 'auto';
            
            // Set up Set Timer button
            if (elements.setTimerBtn) {
                elements.setTimerBtn.addEventListener('mousedown', function(e) {
                    e.stopPropagation();
                    e.preventDefault();
                    self.startTimerAdjustment(e, elements, callbacks);
                });
                
                // Initialize button text with current timer value
                const totalSeconds = Math.round(self.adjustedTimerMinutes * 60);
                const btnText = elements.setTimerBtn.querySelector('.timer-btn-text');
                if (btnText) {
                    btnText.textContent = self.formatTimerDisplay(totalSeconds);
                } else {
                    elements.setTimerBtn.textContent = self.formatTimerDisplay(totalSeconds);
                }
            }
            
            // Listen for pointer lock changes (with vendor prefixes)
            const handleChange = function() {
                self.handlePointerLockChange(elements);
            };
            
            document.addEventListener('pointerlockchange', handleChange);
            document.addEventListener('mozpointerlockchange', handleChange);
            document.addEventListener('webkitpointerlockchange', handleChange);
        }
    };
})();
