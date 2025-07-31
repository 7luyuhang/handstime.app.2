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

// Initialize video scrubbing when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    // Small delay to ensure video elements are ready
    setTimeout(initVideoScrubbing, 200);
});