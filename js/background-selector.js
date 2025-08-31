// Background Selector Functionality
// Handles background switching for fullscreen time display

document.addEventListener('DOMContentLoaded', function() {
    // Get DOM elements
    const fullscreenOverlay = document.getElementById('fullscreenTime');
    const backgroundOptions = document.querySelectorAll('.background-option');
    const backgroundToggleBtn = document.getElementById('backgroundToggleBtn');
    
    // State
    let currentBackground = 'bg-4'; // Default to gray (#808080)
    let isSelectorVisible = false;
    
    // Initialize background selector
    function initBackgroundSelector() {
        // Load saved background preference
        const savedBackground = localStorage.getItem('preferredBackground');
        if (savedBackground) {
            currentBackground = savedBackground;
            applyBackground(currentBackground);
        } else {
            // Apply default background if no saved preference
            applyBackground(currentBackground);
        }
        
        // Add click handlers to background options
        backgroundOptions.forEach(option => {
            option.addEventListener('click', function(e) {
                e.stopPropagation(); // Prevent event bubbling
                const newBackground = this.getAttribute('data-bg');
                selectBackground(newBackground);
            });
        });
        
        // Add click handler for Background toggle button
        if (backgroundToggleBtn) {
            backgroundToggleBtn.addEventListener('click', function(e) {
                e.stopPropagation();
                toggleBackgroundSelector();
            });
        }
    }
    
    // Toggle background selector visibility
    function toggleBackgroundSelector() {
        isSelectorVisible = !isSelectorVisible;
        
        if (isSelectorVisible) {
            fullscreenOverlay.classList.add('show-background-selector');
        } else {
            fullscreenOverlay.classList.remove('show-background-selector');
        }
    }
    
    // Apply background to overlay
    function applyBackground(bgClass) {
        if (!fullscreenOverlay) return;
        
        // Remove all background classes
        fullscreenOverlay.classList.remove('bg-1', 'bg-2', 'bg-3', 'bg-4', 'bg-5', 'bg-6', 'bg-7');
        
        // Add the selected background class
        fullscreenOverlay.classList.add(bgClass);
        
        // Update active state on options
        backgroundOptions.forEach(option => {
            option.classList.remove('active');
            if (option.getAttribute('data-bg') === bgClass) {
                option.classList.add('active');
            }
        });
    }
    
    // Select and save background
    function selectBackground(bgClass) {
        currentBackground = bgClass;
        applyBackground(bgClass);
        
        // Save preference to localStorage
        localStorage.setItem('preferredBackground', bgClass);
        
        // Animation removed for instant background switching
    }
    
    // Public API (if needed by other scripts)
    window.backgroundSelector = {
        getCurrentBackground: () => currentBackground,
        setBackground: (bg) => selectBackground(bg),
        reset: () => selectBackground('bg-4'), // Reset to default gray
        toggleSelector: () => toggleBackgroundSelector(),
        hideSelector: () => {
            isSelectorVisible = false;
            fullscreenOverlay.classList.remove('show-background-selector');
        }
    };
    
    // Initialize
    initBackgroundSelector();
});
