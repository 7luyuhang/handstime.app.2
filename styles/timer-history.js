// Timer History Functionality
(function() {
    // Timer history module
    window.timerHistory = {
        // State
        historyData: [],
        maxHistoryItems: 50,
        isSheetOpen: false,
        
        // Initialize
        init: function() {
            const self = this;
            
            // Load history from localStorage
            this.loadHistory();
            
            // Get elements
            const historyBtn = document.getElementById('historyBtn');
            const historySheet = document.getElementById('historySheet');
            const historyOverlay = document.getElementById('historyOverlay');
            const historyList = document.getElementById('historyList');
            
            // Set up event listeners
            if (historyBtn) {
                historyBtn.addEventListener('click', function(e) {
                    e.stopPropagation();
                    self.openHistorySheet();
                });
            }
            
            // Close sheet when clicking overlay
            if (historyOverlay) {
                historyOverlay.addEventListener('click', function() {
                    self.closeHistorySheet();
                });
            }
            
            // Listen for ESC key to close sheet
            document.addEventListener('keydown', function(e) {
                if (e.key === 'Escape' && self.isSheetOpen) {
                    self.closeHistorySheet();
                }
            });
        },
        
        // Load history from localStorage
        loadHistory: function() {
            const saved = localStorage.getItem('timerHistory');
            if (saved) {
                try {
                    this.historyData = JSON.parse(saved);
                } catch (e) {
                    console.error('Failed to parse timer history:', e);
                    this.historyData = [];
                }
            }
        },
        
        // Save history to localStorage
        saveHistory: function() {
            localStorage.setItem('timerHistory', JSON.stringify(this.historyData));
        },
        
        // Add a timer record to history
        addTimerRecord: function(duration) {
            const now = new Date();
            const dateTime = this.formatDateTime(now);
            const record = {
                id: Date.now(),
                startTime: now.toISOString(),
                duration: duration, // Duration in minutes
                formattedDate: dateTime.date,
                formattedTime: dateTime.time,
                formattedDuration: this.formatDuration(duration)
            };
            
            // Add to beginning of array
            this.historyData.unshift(record);
            
            // Limit history size
            if (this.historyData.length > this.maxHistoryItems) {
                this.historyData = this.historyData.slice(0, this.maxHistoryItems);
            }
            
            // Save to localStorage
            this.saveHistory();
            
            // Update UI if sheet is open
            if (this.isSheetOpen) {
                this.renderHistory();
            }
        },
        
        // Format date and time for display
        formatDateTime: function(date) {
            const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
            const month = months[date.getMonth()];
            const day = date.getDate();
            const year = date.getFullYear();
            const hours = date.getHours().toString().padStart(2, '0');
            const minutes = date.getMinutes().toString().padStart(2, '0');
            return {
                date: `${month} ${day}, ${year}`,
                time: `${hours}:${minutes}`
            };
        },
        
        // Format duration for display
        formatDuration: function(minutes) {
            const mins = Math.floor(minutes);
            const secs = Math.round((minutes - mins) * 60);
            return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
        },
        
        // Open history sheet
        openHistorySheet: function() {
            const historySheet = document.getElementById('historySheet');
            const historyOverlay = document.getElementById('historyOverlay');
            
            if (historySheet) {
                // Show overlay first
                if (historyOverlay) {
                    historyOverlay.classList.add('active');
                }
                
                // Then show sheet
                historySheet.classList.add('active');
                this.isSheetOpen = true;
                this.renderHistory();
                
                // Prevent body scroll when sheet is open
                document.body.style.overflow = 'hidden';
            }
        },
        
        // Close history sheet
        closeHistorySheet: function() {
            const historySheet = document.getElementById('historySheet');
            const historyOverlay = document.getElementById('historyOverlay');
            
            if (historySheet) {
                historySheet.classList.remove('active');
                this.isSheetOpen = false;
                
                // Hide overlay
                if (historyOverlay) {
                    historyOverlay.classList.remove('active');
                }
                
                // Restore body scroll
                document.body.style.overflow = '';
            }
        },
        
        // Render history list
        renderHistory: function() {
            const historyList = document.getElementById('historyList');
            if (!historyList) return;
            
            // Clear current content
            historyList.innerHTML = '';
            
            if (this.historyData.length === 0) {
                // Show empty state
                const emptyDiv = document.createElement('div');
                emptyDiv.className = 'history-list-empty';
                emptyDiv.textContent = 'No timer history yet';
                historyList.appendChild(emptyDiv);
            } else {
                // Group history items by date
                const groupedByDate = {};
                
                this.historyData.forEach(record => {
                    // Get date text for grouping
                    let dateText = record.formattedDate;
                    
                    // Handle old records that might not have formattedDate
                    if (!dateText && record.formattedTime && record.formattedTime.includes(',')) {
                        // Old format might be like "Aug 29, 2025 14:30"
                        const parts = record.formattedTime.split(' ');
                        if (parts.length >= 4) {
                            dateText = `${parts[0]} ${parts[1]} ${parts[2]}`;
                        }
                    }
                    
                    // Use a default date if none found
                    if (!dateText) {
                        const date = new Date(record.startTime);
                        const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
                        dateText = `${months[date.getMonth()]} ${date.getDate()}, ${date.getFullYear()}`;
                    }
                    
                    // Check if it's today or yesterday
                    const recordDate = new Date(record.startTime);
                    const today = new Date();
                    const yesterday = new Date(today);
                    yesterday.setDate(yesterday.getDate() - 1);
                    
                    // Compare dates (ignoring time)
                    const isToday = recordDate.toDateString() === today.toDateString();
                    const isYesterday = recordDate.toDateString() === yesterday.toDateString();
                    
                    if (isToday) {
                        dateText = 'Today';
                    } else if (isYesterday) {
                        dateText = 'Yesterday';
                    }
                    
                    // Group by date
                    if (!groupedByDate[dateText]) {
                        groupedByDate[dateText] = [];
                    }
                    groupedByDate[dateText].push(record);
                });
                
                // Render each date group
                Object.keys(groupedByDate).forEach(date => {
                    // Create date section
                    const dateSection = document.createElement('div');
                    dateSection.className = 'history-date-section';
                    
                    // Create date header
                    const dateHeader = document.createElement('div');
                    dateHeader.className = 'history-date-header';
                    dateHeader.textContent = date;
                    dateSection.appendChild(dateHeader);
                    
                    // Render items for this date
                    groupedByDate[date].forEach(record => {
                        const item = document.createElement('div');
                        item.className = 'history-list-item';
                        
                        // Get time text
                        let timeText = record.formattedTime;
                        
                        // Handle old format
                        if (!record.formattedDate && record.formattedTime && record.formattedTime.includes(',')) {
                            const parts = record.formattedTime.split(' ');
                            if (parts.length >= 4) {
                                timeText = parts[3] || '';
                            }
                        }
                        
                        const timeSpan = document.createElement('span');
                        timeSpan.className = 'history-item-time';
                        timeSpan.textContent = timeText || '';
                        
                        const durationSpan = document.createElement('span');
                        durationSpan.className = 'history-item-duration';
                        durationSpan.textContent = record.formattedDuration;
                        
                        // Add delete button
                        const deleteBtn = document.createElement('button');
                        deleteBtn.className = 'history-item-delete';
                        deleteBtn.setAttribute('data-record-id', record.id);
                        deleteBtn.innerHTML = '<img src="styles/image/systemIcon/systemIcon_close.svg" alt="Delete">';
                        deleteBtn.addEventListener('click', (e) => {
                            e.stopPropagation();
                            this.deleteRecord(record.id);
                        });
                        
                        item.appendChild(timeSpan);
                        item.appendChild(durationSpan);
                        item.appendChild(deleteBtn);
                        dateSection.appendChild(item);
                    });
                    
                    historyList.appendChild(dateSection);
                });
            }
        },
        
        // Delete a single record
        deleteRecord: function(recordId) {
            // Filter out the record with the given ID
            this.historyData = this.historyData.filter(record => record.id !== recordId);
            
            // Save updated history
            this.saveHistory();
            
            // Re-render if sheet is open
            if (this.isSheetOpen) {
                this.renderHistory();
            }
        },
        
        // Clear all history
        clearHistory: function() {
            this.historyData = [];
            this.saveHistory();
            if (this.isSheetOpen) {
                this.renderHistory();
            }
        }
    };
    
    // Initialize when DOM is ready
    document.addEventListener('DOMContentLoaded', function() {
        window.timerHistory.init();
    });
})();
