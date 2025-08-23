// Background Selector Functionality
// Handles background switching for fullscreen time display

document.addEventListener('DOMContentLoaded', function() {
    // Get DOM elements
    const fullscreenOverlay = document.getElementById('fullscreenTime');
    const backgroundOptions = document.querySelectorAll('.background-option');
    
    // State
    let currentBackground = 'bg-1';
    
    // Initialize background selector
    function initBackgroundSelector() {
        // Load saved background preference
        const savedBackground = localStorage.getItem('preferredBackground');
        if (savedBackground) {
            currentBackground = savedBackground;
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
        
        // Optional: Add a subtle animation effect
        if (fullscreenOverlay) {
            fullscreenOverlay.style.transition = 'background 0.3s ease';
        }
    }
    
    // Public API (if needed by other scripts)
    window.backgroundSelector = {
        getCurrentBackground: () => currentBackground,
        setBackground: (bg) => selectBackground(bg),
        reset: () => selectBackground('bg-1')
    };
    
    // Initialize
    initBackgroundSelector();
});
