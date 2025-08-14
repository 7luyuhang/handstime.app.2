// Smooth Drag Physics Engine
class SmoothDrag {
    constructor(element, options = {}) {
        this.element = element;
        this.container = document.querySelector('.container-circle');
        
        // Physics configuration
        this.config = {
            friction: options.friction || 0.94,        // 摩擦系数 - 平滑的减速效果
            bounceStiffness: options.stiffness || 0.12,  // 弹簧刚度 - 自然的弹性感
            bounceDamping: options.damping || 0.7,    // 弹簧阻尼 - 恰到好处的回弹
            velocityThreshold: options.threshold || 0.5, // 速度阈值 - 灵敏的响应
            touchMultiplier: options.touchMultiplier || 1.3, // 触摸设备上的速度增强
            ...options
        };
        
        // State
        this.position = { x: 0, y: 0 };
        this.velocity = { x: 0, y: 0 };
        this.dragStart = { x: 0, y: 0 };
        this.previousPosition = { x: 0, y: 0 };
        this.isDragging = false;
        this.isAnimating = false;
        this.lastTime = 0;
        this.bounds = null;
        
        // Gesture tracking for velocity calculation
        this.trackingPoints = [];
        this.trackingTime = 100; // Track last 100ms of movement
        
        this.init();
    }
    
    init() {
        // Enable hardware acceleration
        this.element.style.willChange = 'transform';
        this.element.style.transform = 'translate3d(0, 0, 0)';
        
        // Bind event handlers
        this.handleStart = this.handleStart.bind(this);
        this.handleMove = this.handleMove.bind(this);
        this.handleEnd = this.handleEnd.bind(this);
        this.animate = this.animate.bind(this);
        
        // Add event listeners
        this.element.addEventListener('mousedown', this.handleStart, { passive: false });
        this.element.addEventListener('touchstart', this.handleStart, { passive: false });
        
        document.addEventListener('mousemove', this.handleMove, { passive: false });
        document.addEventListener('touchmove', this.handleMove, { passive: false });
        
        document.addEventListener('mouseup', this.handleEnd);
        document.addEventListener('touchend', this.handleEnd);
        
        // Calculate bounds
        this.updateBounds();
        window.addEventListener('resize', () => this.updateBounds());
    }
    
    updateBounds() {
        const containerRect = this.container.getBoundingClientRect();
        const elementRect = this.element.getBoundingClientRect();
        
        // Calculate movement bounds with some padding
        const padding = 10;
        this.bounds = {
            minX: -(containerRect.width / 2 - elementRect.width / 2) + padding,
            maxX: (containerRect.width / 2 - elementRect.width / 2) - padding,
            minY: -(containerRect.height / 2 - elementRect.height / 2) + padding,
            maxY: (containerRect.height / 2 - elementRect.height / 2) - padding
        };
    }
    
    handleStart(e) {
        if (e.type === 'mousedown' && e.button !== 0) return;
        
        this.isDragging = true;
        this.element.classList.add('dragging');
        
        const point = e.touches ? e.touches[0] : e;
        this.dragStart.x = point.clientX - this.position.x;
        this.dragStart.y = point.clientY - this.position.y;
        
        // Reset velocity and tracking
        this.velocity.x = 0;
        this.velocity.y = 0;
        this.trackingPoints = [{
            x: point.clientX,
            y: point.clientY,
            time: Date.now()
        }];
        
        // Stop any ongoing animation
        this.isAnimating = false;
        
        e.preventDefault();
    }
    
    handleMove(e) {
        if (!this.isDragging) return;
        
        const point = e.touches ? e.touches[0] : e;
        
        // Calculate new position
        this.position.x = point.clientX - this.dragStart.x;
        this.position.y = point.clientY - this.dragStart.y;
        
        // Track movement for velocity calculation
        const now = Date.now();
        this.trackingPoints.push({
            x: point.clientX,
            y: point.clientY,
            time: now
        });
        
        // Keep only recent tracking points
        this.trackingPoints = this.trackingPoints.filter(
            pt => now - pt.time <= this.trackingTime
        );
        
        // Apply soft boundaries during drag (elastic effect)
        if (this.config.elasticBounds) {
            this.position.x = this.applyElasticBounds(this.position.x, this.bounds.minX, this.bounds.maxX);
            this.position.y = this.applyElasticBounds(this.position.y, this.bounds.minY, this.bounds.maxY);
        }
        
        // Update element position
        this.updateElementPosition();
        
        // Check if outside container
        this.checkOutsideBounds();
        
        e.preventDefault();
    }
    
    handleEnd(e) {
        if (!this.isDragging) return;
        
        this.isDragging = false;
        this.element.classList.remove('dragging');
        
        // Calculate release velocity from tracking points
        this.calculateReleaseVelocity();
        
        // Start inertia animation
        if (Math.abs(this.velocity.x) > this.config.velocityThreshold || 
            Math.abs(this.velocity.y) > this.config.velocityThreshold) {
            this.startInertiaAnimation();
        } else {
            // Snap back if outside bounds
            this.snapToBounds();
        }
    }
    
    calculateReleaseVelocity() {
        if (this.trackingPoints.length < 2) {
            this.velocity = { x: 0, y: 0 };
            return;
        }
        
        const recent = this.trackingPoints.slice(-5); // Use last 5 points
        if (recent.length < 2) return;
        
        const first = recent[0];
        const last = recent[recent.length - 1];
        const timeDelta = last.time - first.time;
        
        if (timeDelta === 0) {
            this.velocity = { x: 0, y: 0 };
            return;
        }
        
        // Calculate velocity with touch multiplier for better feel
        const multiplier = this.config.touchMultiplier;
        this.velocity.x = ((last.x - first.x) / timeDelta) * 16 * multiplier; // Convert to px/frame
        this.velocity.y = ((last.y - first.y) / timeDelta) * 16 * multiplier;
        
        // Clamp maximum velocity
        const maxVelocity = 50;
        this.velocity.x = Math.max(-maxVelocity, Math.min(maxVelocity, this.velocity.x));
        this.velocity.y = Math.max(-maxVelocity, Math.min(maxVelocity, this.velocity.y));
    }
    
    startInertiaAnimation() {
        this.isAnimating = true;
        this.lastTime = performance.now();
        requestAnimationFrame(this.animate);
    }
    
    animate(currentTime) {
        if (!this.isAnimating) return;
        
        const deltaTime = Math.min((currentTime - this.lastTime) / 16, 2); // Cap delta time
        this.lastTime = currentTime;
        
        // Apply friction
        this.velocity.x *= Math.pow(this.config.friction, deltaTime);
        this.velocity.y *= Math.pow(this.config.friction, deltaTime);
        
        // Update position
        this.position.x += this.velocity.x * deltaTime;
        this.position.y += this.velocity.y * deltaTime;
        
        // Spring physics for boundaries
        if (this.position.x < this.bounds.minX || this.position.x > this.bounds.maxX) {
            const target = this.position.x < this.bounds.minX ? this.bounds.minX : this.bounds.maxX;
            const distance = target - this.position.x;
            const spring = distance * this.config.bounceStiffness;
            this.velocity.x += spring;
            this.velocity.x *= this.config.bounceDamping;
        }
        
        if (this.position.y < this.bounds.minY || this.position.y > this.bounds.maxY) {
            const target = this.position.y < this.bounds.minY ? this.bounds.minY : this.bounds.maxY;
            const distance = target - this.position.y;
            const spring = distance * this.config.bounceStiffness;
            this.velocity.y += spring;
            this.velocity.y *= this.config.bounceDamping;
        }
        
        // Update element
        this.updateElementPosition();
        this.checkOutsideBounds();
        
        // Continue animation if velocity is significant
        if (Math.abs(this.velocity.x) > this.config.velocityThreshold || 
            Math.abs(this.velocity.y) > this.config.velocityThreshold) {
            requestAnimationFrame(this.animate);
        } else {
            this.isAnimating = false;
            this.velocity = { x: 0, y: 0 };
            this.snapToBounds();
        }
    }
    
    snapToBounds() {
        let needsSnap = false;
        let targetX = this.position.x;
        let targetY = this.position.y;
        
        if (this.position.x < this.bounds.minX) {
            targetX = this.bounds.minX;
            needsSnap = true;
        } else if (this.position.x > this.bounds.maxX) {
            targetX = this.bounds.maxX;
            needsSnap = true;
        }
        
        if (this.position.y < this.bounds.minY) {
            targetY = this.bounds.minY;
            needsSnap = true;
        } else if (this.position.y > this.bounds.maxY) {
            targetY = this.bounds.maxY;
            needsSnap = true;
        }
        
        if (needsSnap) {
            this.animateSnapTo(targetX, targetY);
        } else if (this.config.snapToCenter) {
            // Optional: snap back to center
            this.animateSnapTo(0, 0);
        }
    }
    
    animateSnapTo(targetX, targetY, duration = 500) {
        const startX = this.position.x;
        const startY = this.position.y;
        const startTime = performance.now();
        
        const snapAnimation = (currentTime) => {
            const elapsed = currentTime - startTime;
            const progress = Math.min(elapsed / duration, 1);
            
            // Smooth easing function (ease-out-back for bounce effect)
            const easeOutBack = (t) => {
                const c1 = 1.70158;
                const c3 = c1 + 1;
                return 1 + c3 * Math.pow(t - 1, 3) + c1 * Math.pow(t - 1, 2);
            };
            
            const easedProgress = easeOutBack(progress);
            
            this.position.x = startX + (targetX - startX) * easedProgress;
            this.position.y = startY + (targetY - startY) * easedProgress;
            
            this.updateElementPosition();
            
            if (progress < 1) {
                requestAnimationFrame(snapAnimation);
            } else {
                this.checkOutsideBounds();
            }
        };
        
        requestAnimationFrame(snapAnimation);
    }
    
    applyElasticBounds(value, min, max) {
        if (value < min) {
            const diff = min - value;
            return min - diff * 0.5; // Elastic resistance
        } else if (value > max) {
            const diff = value - max;
            return max + diff * 0.5; // Elastic resistance
        }
        return value;
    }
    
    updateElementPosition() {
        // Use transform3d for hardware acceleration
        this.element.style.transform = `translate3d(${this.position.x}px, ${this.position.y}px, 0)`;
    }
    
    checkOutsideBounds() {
        // Get actual positions of circle and container
        const containerRect = this.container.getBoundingClientRect();
        const circleRect = this.element.getBoundingClientRect();
        
        // Check if circle is completely outside the container
        const isOutside = (
            circleRect.right < containerRect.left ||
            circleRect.left > containerRect.right ||
            circleRect.bottom < containerRect.top ||
            circleRect.top > containerRect.bottom
        );
        
        if (isOutside) {
            this.element.classList.add('outside');
        } else {
            this.element.classList.remove('outside');
        }
    }
    
    reset() {
        this.animateSnapTo(0, 0, 600);
    }
    
    destroy() {
        this.element.removeEventListener('mousedown', this.handleStart);
        this.element.removeEventListener('touchstart', this.handleStart);
        document.removeEventListener('mousemove', this.handleMove);
        document.removeEventListener('touchmove', this.handleMove);
        document.removeEventListener('mouseup', this.handleEnd);
        document.removeEventListener('touchend', this.handleEnd);
        this.element.style.willChange = 'auto';
    }
}

// Initialize smooth dragging when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    const circle = document.querySelector('.circle');
    if (circle) {
        // Initialize with optimized settings similar to mikematas.com
        window.smoothDrag = new SmoothDrag(circle, {
            friction: 0.94,           // 平滑的减速
            bounceStiffness: 0.12,    // 边界弹簧效果
            bounceDamping: 0.7,       // 弹簧阻尼
            velocityThreshold: 0.5,   // 更灵敏的速度检测
            touchMultiplier: 1.3,     // 触摸设备上的速度增强
            elasticBounds: false,     // 拖动时的弹性边界
            snapToCenter: true        // 释放后回弹到中心
        });
        
        // Optional: Add double-click to reset position
        circle.addEventListener('dblclick', () => {
            window.smoothDrag.reset();
        });
    }
});

// Export for use in other scripts
if (typeof module !== 'undefined' && module.exports) {
    module.exports = SmoothDrag;
}
