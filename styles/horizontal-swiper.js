// Horizontal Container Swipe Functionality
class HorizontalSwiper {
    constructor() {
        this.containerGroup = document.querySelector('.horizontal-container-group');
        this.currentIndex = 0;
        this.totalContainers = 3;
        this.containerWidth = 360;
        this.gapSize = 4; // 0.25em ≈ 4px (假設 1em = 16px)
        this.isDragging = false;
        this.startX = 0;
        this.currentX = 0;
        this.startTransform = 0;
        this.threshold = 50; // Minimum swipe distance to trigger navigation
        
        this.init();
    }
    
    init() {
        if (!this.containerGroup) return;
        
        // Touch events
        this.containerGroup.addEventListener('touchstart', this.handleTouchStart.bind(this), { passive: true });
        this.containerGroup.addEventListener('touchmove', this.handleTouchMove.bind(this), { passive: false });
        this.containerGroup.addEventListener('touchend', this.handleTouchEnd.bind(this), { passive: true });
        
        // Mouse events for desktop
        this.containerGroup.addEventListener('mousedown', this.handleMouseStart.bind(this));
        document.addEventListener('mousemove', this.handleMouseMove.bind(this));
        document.addEventListener('mouseup', this.handleMouseEnd.bind(this));
        
        // Prevent default drag behavior on images and other elements
        this.containerGroup.addEventListener('dragstart', (e) => e.preventDefault());
    }
    
    handleTouchStart(e) {
        this.startDrag(e.touches[0].clientX);
    }
    
    handleTouchMove(e) {
        if (!this.isDragging) return;
        e.preventDefault();
        this.updateDrag(e.touches[0].clientX);
    }
    
    handleTouchEnd(e) {
        this.endDrag();
    }
    
    handleMouseStart(e) {
        e.preventDefault();
        this.startDrag(e.clientX);
    }
    
    handleMouseMove(e) {
        if (!this.isDragging) return;
        e.preventDefault();
        this.updateDrag(e.clientX);
    }
    
    handleMouseEnd(e) {
        this.endDrag();
    }
    
    startDrag(clientX) {
        this.isDragging = true;
        this.startX = clientX;
        this.startTransform = -this.currentIndex * (this.containerWidth + this.gapSize);
        this.containerGroup.style.transition = 'none';
        document.body.style.userSelect = 'none';
    }
    
    updateDrag(clientX) {
        this.currentX = clientX;
        const deltaX = this.currentX - this.startX;
        const newTransform = this.startTransform + deltaX;
        
        // Add some resistance at the edges
        const maxTransform = 0;
        const minTransform = -(this.totalContainers - 1) * (this.containerWidth + this.gapSize);
        
        let finalTransform = newTransform;
        if (newTransform > maxTransform) {
            finalTransform = maxTransform + (newTransform - maxTransform) * 0.3;
        } else if (newTransform < minTransform) {
            finalTransform = minTransform + (newTransform - minTransform) * 0.3;
        }
        
        this.containerGroup.style.transform = `translateX(${finalTransform}px)`;
    }
    
    endDrag() {
        if (!this.isDragging) return;
        
        this.isDragging = false;
        document.body.style.userSelect = '';
        this.containerGroup.style.transition = 'transform 0.3s cubic-bezier(0.25, 0.46, 0.45, 0.94)';
        
        const deltaX = this.currentX - this.startX;
        
        // Determine if we should navigate to next/previous slide
        if (Math.abs(deltaX) > this.threshold) {
            if (deltaX > 0 && this.currentIndex > 0) {
                // Swipe right - go to previous
                this.goToSlide(this.currentIndex - 1);
            } else if (deltaX < 0 && this.currentIndex < this.totalContainers - 1) {
                // Swipe left - go to next
                this.goToSlide(this.currentIndex + 1);
            } else {
                // Not enough distance or at edge, snap back
                this.goToSlide(this.currentIndex);
            }
        } else {
            // Not enough distance, snap back
            this.goToSlide(this.currentIndex);
        }
    }
    
    goToSlide(index) {
        if (index < 0 || index >= this.totalContainers) return;
        
        this.currentIndex = index;
        // 計算位置時需要考慮 gap 間距
        const translateX = -index * (this.containerWidth + this.gapSize);
        this.containerGroup.style.transform = `translateX(${translateX}px)`;
    }
}

// Initialize horizontal swiper when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    new HorizontalSwiper();
});