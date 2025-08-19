// Video Scrubbing Functionality
class VideoScrubber {
    constructor(videoElement) {
        this.video = videoElement;
        this.isHovering = false;
        this.isScrubbing = false;
        this.originalTime = 0;
        this.wasPlaying = false;
        
        this.init();
    }
    
    init() {
        if (!this.video) return;
        
        // Bind event listeners
        this.video.addEventListener('mouseenter', this.handleMouseEnter.bind(this));
        this.video.addEventListener('mouseleave', this.handleMouseLeave.bind(this));
        this.video.addEventListener('mousemove', this.handleMouseMove.bind(this));
    }
    
    handleMouseEnter(e) {
        this.isHovering = true;
        this.originalTime = this.video.currentTime;
        this.wasPlaying = !this.video.paused;
        this.video.pause(); // Pause for scrubbing
    }
    
    handleMouseLeave(e) {
        this.isHovering = false;
        this.isScrubbing = false;
        
        // Remove scrubbing visual state
        this.video.classList.remove('scrubbing');
        
        // Resume playing if it was playing before
        if (this.wasPlaying) {
            this.video.play();
        }
    }
    
    handleMouseMove(e) {
        if (!this.isHovering) return;
        
        const rect = this.video.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const width = rect.width;
        
        // Calculate percentage of video width
        const percentage = Math.max(0, Math.min(1, x / width));
        
        // Calculate target time based on percentage
        const duration = this.video.duration;
        if (duration && !isNaN(duration)) {
            const targetTime = percentage * duration;
            this.video.currentTime = targetTime;
            
            if (!this.isScrubbing) {
                this.isScrubbing = true;
                this.video.classList.add('scrubbing');
            }
        }
    }
}

// Initialize video scrubbing
function initVideoScrubbing() {
    const videos = document.querySelectorAll('.container.video-container video');
    videos.forEach(video => {
        new VideoScrubber(video);
    });
}

// Ensure video plays on mobile devices
function ensureVideoPlayback() {
    const videos = document.querySelectorAll('.container.video-container video');
    videos.forEach(video => {
        // Try to play the video
        const playPromise = video.play();
        
        if (playPromise !== undefined) {
            playPromise.catch(error => {
                // Auto-play was prevented, try again on user interaction
                console.log('Autoplay prevented, will retry on user interaction');
                
                // Add a one-time event listener for user interaction
                const startPlayback = () => {
                    video.play().catch(e => console.log('Video play failed:', e));
                    // Remove listeners after first interaction
                    document.removeEventListener('touchstart', startPlayback);
                    document.removeEventListener('click', startPlayback);
                };
                
                // Listen for first user interaction
                document.addEventListener('touchstart', startPlayback, { once: true });
                document.addEventListener('click', startPlayback, { once: true });
            });
        }
    });
}

// Initialize video scrubbing when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    // Small delay to ensure video elements are ready
    setTimeout(() => {
        initVideoScrubbing();
        ensureVideoPlayback();
    }, 200);
});