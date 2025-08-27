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
        
        // Constants
        MIN_TIMER_SECONDS: 5, // 00:05
        MAX_TIMER_MINUTES: 60, // 60:00
        TIMER_STEP_SECONDS: 5, // 5 second increments
        
        // Format timer for display (MM:SS)
        formatTimerDisplay: function(totalSeconds) {
            const minutes = Math.floor(totalSeconds / 60);
            const seconds = totalSeconds % 60;
            return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
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
            
            // Accumulate movement
            this.accumulatedMovement += movement;
            
            // Map pixel movement to timer change (1 pixel = 1 second)
            const deltaSeconds = Math.round(this.accumulatedMovement * 1);
            
            // Calculate new timer value in seconds
            let newTotalSeconds = Math.round(this.dragStartMinutes * 60) + deltaSeconds;
            
            // Round to nearest 5-second increment
            newTotalSeconds = Math.round(newTotalSeconds / this.TIMER_STEP_SECONDS) * this.TIMER_STEP_SECONDS;
            
            // Clamp to min/max
            newTotalSeconds = Math.max(this.MIN_TIMER_SECONDS, Math.min(this.MAX_TIMER_MINUTES * 60, newTotalSeconds));
            
            // Update the stored value
            this.adjustedTimerMinutes = newTotalSeconds / 60;
            
            // Update display
            elements.fullscreenClock.textContent = this.formatTimerDisplay(newTotalSeconds);
        },
        
        // Handle timer drag adjustment (fallback without pointer lock)
        handleTimerDrag: function(elements, e) {
            if (!this.isAdjustingTimer) return;
            
            const deltaX = e.clientX - this.dragStartX;
            // Map pixel movement to timer change (1 pixel = 1 second)
            const deltaSeconds = Math.round(deltaX * 1);
            
            // Calculate new timer value in seconds
            let newTotalSeconds = Math.round(this.dragStartMinutes * 60) + deltaSeconds;
            
            // Round to nearest 5-second increment
            newTotalSeconds = Math.round(newTotalSeconds / this.TIMER_STEP_SECONDS) * this.TIMER_STEP_SECONDS;
            
            // Clamp to min/max
            newTotalSeconds = Math.max(this.MIN_TIMER_SECONDS, Math.min(this.MAX_TIMER_MINUTES * 60, newTotalSeconds));
            
            // Update the stored value
            this.adjustedTimerMinutes = newTotalSeconds / 60;
            
            // Update display
            elements.fullscreenClock.textContent = this.formatTimerDisplay(newTotalSeconds);
        },
        
        // End timer adjustment
        endTimerAdjustment: function(elements, callbacks, e) {
            if (!this.isAdjustingTimer) return;
            
            this.isAdjustingTimer = false;
            
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
