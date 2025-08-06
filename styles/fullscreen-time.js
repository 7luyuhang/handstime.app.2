// Fullscreen Time functionality
document.addEventListener('DOMContentLoaded', function() {
    const localTimeElement = document.getElementById('localTime');
    const fullscreenOverlay = document.getElementById('fullscreenTime');
    const fullscreenClock = document.getElementById('fullscreenClock');
    
    // Update fullscreen time to match local time
    function updateFullscreenTime() {
        // Get the current time from the local time element to ensure sync
        const currentTime = localTimeElement.textContent || new Date().toLocaleTimeString();
        fullscreenClock.textContent = currentTime;
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
        
        // Re-enable body scroll
        document.body.style.overflow = '';
    }
    
    // Click on local time to enter fullscreen
    localTimeElement.addEventListener('click', function(e) {
        e.preventDefault();
        e.stopPropagation();
        enterFullscreenTime();
    });
    
    // Click anywhere on fullscreen overlay to exit
    fullscreenOverlay.addEventListener('click', function() {
        exitFullscreenTime();
    });
    
    // Press Escape key to exit fullscreen
    document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape' && fullscreenOverlay.classList.contains('active')) {
            exitFullscreenTime();
        }
    });
    
    // Prevent clicks inside the content from closing the fullscreen
    document.querySelector('.fullscreen-time-content').addEventListener('click', function(e) {
        e.stopPropagation();
    });
});