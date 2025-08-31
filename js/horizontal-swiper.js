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
        
        // Setup page indicators
        this.wrapper = document.querySelector('.horizontal-container-wrapper');
        if (this.wrapper) {
            this.pageIndicator = document.createElement('div');
            this.pageIndicator.classList.add('page-indicator');
            for (let i = 0; i < this.totalContainers; i++) {
                const dot = document.createElement('span');
                dot.classList.add('page-dot');
                if (i === 0) dot.classList.add('active');
                this.pageIndicator.appendChild(dot);
            }
            this.wrapper.appendChild(this.pageIndicator);
        }
        
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
        this.startY = e.touches[0].clientY;
        this.isHorizontalSwipe = null; // Reset swipe direction detection
    }
    
    handleTouchMove(e) {
        if (!this.isDragging) return;
        
        // Detect swipe direction on first move
        if (this.isHorizontalSwipe === null) {
            const deltaX = Math.abs(e.touches[0].clientX - this.startX);
            const deltaY = Math.abs(e.touches[0].clientY - this.startY);
            
            // Determine if this is a horizontal or vertical swipe
            // Threshold: if horizontal movement is greater, it's a horizontal swipe
            this.isHorizontalSwipe = deltaX > deltaY * 0.5; // More lenient for vertical scrolling
        }
        
        // Only prevent default and handle swipe if it's horizontal
        if (this.isHorizontalSwipe) {
            e.preventDefault();
            this.updateDrag(e.touches[0].clientX);
        }
    }
    
    handleTouchEnd(e) {
        this.endDrag();
        this.isHorizontalSwipe = null; // Reset for next interaction
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
        
        this.updateIndicator();
    }
    
    updateIndicator() {
        if (!this.pageIndicator) return;
        Array.from(this.pageIndicator.children).forEach((dot, i) => {
            dot.classList.toggle('active', i === this.currentIndex);
        });
    }
}

// Initialize horizontal swiper when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    new HorizontalSwiper();
});