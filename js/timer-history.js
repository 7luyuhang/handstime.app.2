// Timer History Functionality
(function () {
    // Timer history module
    window.timerHistory = {
        // State
        historyData: [],
        maxHistoryItems: 50,
        isSheetOpen: false,
        initialStartDate: null, // Store the very first timer date
        notesData: {}, // Store notes separately by timer ID
        currentEditingRecord: null, // Track which record is being edited

        // Initialize
        init: function () {
            const self = this;

            // Load notes from localStorage first
            this.loadNotes();
            
            // Load history from localStorage (will migrate IDs if needed)
            this.loadHistory();

            // Update info stats to set initial visibility
            this.updateInfoStats();

            // Adjust padding for info section
            this.adjustInfoSectionPadding();

            // Set up ResizeObserver for info section
            this.setupInfoSectionObserver();

            // Get elements
            const historyBtn = document.getElementById('historyBtn');
            const historySheet = document.getElementById('historySheet');
            const historyOverlay = document.getElementById('historyOverlay');
            const noteOverlay = document.getElementById('noteOverlay');
            const historyList = document.getElementById('historyList');

            // Set up event listeners
            if (historyBtn) {
                historyBtn.addEventListener('click', function (e) {
                    e.stopPropagation();
                    self.openHistorySheet();
                });
            }

            // Close sheet when clicking overlay
            if (historyOverlay) {
                historyOverlay.addEventListener('click', function () {
                    // Don't close history sheet if note sheet is open
                    const noteSheet = document.getElementById('noteSheet');
                    if (noteSheet && noteSheet.classList.contains('active')) {
                        return;
                    }
                    self.closeHistorySheet();
                });
            }

            // Close note sheet when clicking note overlay
            if (noteOverlay) {
                noteOverlay.addEventListener('click', function () {
                    self.closeNoteSheet();
                    // Restore history overlay if history sheet is still open
                    const historySheet = document.getElementById('historySheet');
                    const historyOverlay = document.getElementById('historyOverlay');
                    if (historySheet && historySheet.classList.contains('active')) {
                        if (historyOverlay) {
                            historyOverlay.classList.add('active');
                        }
                    }
                });
            }

            // Listen for ESC key to close sheet
            document.addEventListener('keydown', function (e) {
                if (e.key === 'Escape') {
                    // Check if note sheet is open
                    const noteSheet = document.getElementById('noteSheet');
                    if (noteSheet && noteSheet.classList.contains('active')) {
                        self.closeNoteSheet();
                        // Restore history overlay if history sheet is still open
                        const historySheet = document.getElementById('historySheet');
                        const historyOverlay = document.getElementById('historyOverlay');
                        if (historySheet && historySheet.classList.contains('active')) {
                            if (historyOverlay) {
                                historyOverlay.classList.add('active');
                            }
                        }
                    } else if (self.isSheetOpen) {
                        self.closeHistorySheet();
                    }
                }
            });

            // Set up reset button
            const resetBtn = document.getElementById('resetHistoryBtn');
            if (resetBtn) {
                resetBtn.addEventListener('click', function () {
                    self.handleReset();
                });
            }
        },

        // Load history from localStorage
        loadHistory: function () {
            const saved = localStorage.getItem('timerHistory');
            if (saved) {
                try {
                    this.historyData = JSON.parse(saved);
                    // Migrate old IDs to ensure uniqueness
                    this.migrateOldIds();
                } catch (e) {
                    console.error('Failed to parse timer history:', e);
                    this.historyData = [];
                }
            }

            // Load initial start date
            const savedStartDate = localStorage.getItem('timerInitialStartDate');
            if (savedStartDate) {
                this.initialStartDate = savedStartDate;
            } else if (this.historyData.length > 0) {
                // If no saved start date but we have history, use the oldest timer
                const oldestTimer = this.historyData[this.historyData.length - 1];
                this.initialStartDate = oldestTimer.startTime;
                localStorage.setItem('timerInitialStartDate', this.initialStartDate);
            }
        },

        // Save history to localStorage
        saveHistory: function () {
            localStorage.setItem('timerHistory', JSON.stringify(this.historyData));
        },

        // Migrate old IDs to ensure uniqueness
        migrateOldIds: function () {
            const seenIds = new Set();
            let needsSave = false;
            
            this.historyData = this.historyData.map((record, index) => {
                // Check if ID is old format (just a number) or if it's a duplicate
                if (typeof record.id === 'number' || seenIds.has(record.id)) {
                    // Generate new unique ID
                    const newId = Date.now() + '_' + index + '_' + Math.random().toString(36).substr(2, 9);
                    
                    // Update notes data if exists
                    if (this.notesData[record.id]) {
                        this.notesData[newId] = this.notesData[record.id];
                        delete this.notesData[record.id];
                    }
                    
                    record.id = newId;
                    needsSave = true;
                }
                seenIds.add(record.id);
                return record;
            });
            
            // Save if we made changes
            if (needsSave) {
                this.saveHistory();
                this.saveNotes();
            }
        },

        // Load notes from localStorage
        loadNotes: function () {
            const savedNotes = localStorage.getItem('timerNotes');
            if (savedNotes) {
                try {
                    this.notesData = JSON.parse(savedNotes);
                } catch (e) {
                    console.error('Failed to parse notes data:', e);
                    this.notesData = {};
                }
            }
        },

        // Save notes to localStorage
        saveNotes: function () {
            localStorage.setItem('timerNotes', JSON.stringify(this.notesData));
        },

        // Add a timer record to history
        addTimerRecord: function (duration, isCompleted = false) {
            const now = new Date();
            const dateTime = this.formatDateTime(now);
            // Generate unique ID with timestamp and random component to prevent duplicates
            const uniqueId = Date.now() + '_' + Math.random().toString(36).substr(2, 9);
            const record = {
                id: uniqueId,
                startTime: now.toISOString(),
                duration: duration, // Duration in minutes
                isCompleted: isCompleted, // Track if timer was completed or stopped early
                formattedDate: dateTime.date,
                formattedTime: dateTime.time,
                formattedDuration: this.formatDuration(duration)
            };

            // Set initial start date if this is the first timer ever
            if (!this.initialStartDate) {
                this.initialStartDate = record.startTime;
                localStorage.setItem('timerInitialStartDate', this.initialStartDate);
            }

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
        formatDateTime: function (date) {
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
        formatDuration: function (minutes) {
            const mins = Math.floor(minutes);
            // Use floor instead of round to avoid showing 16 when user set 15
            const secs = Math.floor((minutes - mins) * 60);
            return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
        },

        // Open history sheet
        openHistorySheet: function () {
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
                this.renderHistory(); // This calls updateInfoStats internally

                // Adjust padding for info section
                setTimeout(() => {
                    this.adjustInfoSectionPadding();
                }, 10);

                // Prevent body scroll when sheet is open
                document.body.style.overflow = 'hidden';
            }
        },

        // Close history sheet
        closeHistorySheet: function () {
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
        renderHistory: function () {
            const historyList = document.getElementById('historyList');
            if (!historyList) return;

            // Clear current content
            historyList.innerHTML = '';

            // Update info section stats
            this.updateInfoStats();

            if (this.historyData.length === 0) {
                // Show empty state
                const emptyDiv = document.createElement('div');
                emptyDiv.className = 'history-list-empty';
                emptyDiv.textContent = 'No timer history';
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

                        // Add completion indicator if timer was completed
                        const durationContainer = document.createElement('div');
                        durationContainer.className = 'history-item-duration-container';

                        if (record.isCompleted) {
                            const completionIndicator = document.createElement('span');
                            completionIndicator.className = 'history-completion-indicator';
                            durationContainer.appendChild(completionIndicator);
                        }

                        const durationSpan = document.createElement('span');
                        durationSpan.className = 'history-item-duration';
                        // Apply special styling for 00:00 duration
                        if (record.formattedDuration === '00:00') {
                            durationSpan.classList.add('zero-duration');
                        }
                        durationSpan.textContent = record.formattedDuration;
                        durationContainer.appendChild(durationSpan);

                        // Add delete button
                        const deleteBtn = document.createElement('button');
                        deleteBtn.className = 'history-item-delete';
                        deleteBtn.setAttribute('data-record-id', record.id);
                        deleteBtn.innerHTML = '<img src="assets/image/systemIcon/systemIcon_close.svg" alt="Delete">';
                        deleteBtn.addEventListener('click', (e) => {
                            e.stopPropagation();
                            this.deleteRecord(record.id);
                        });


                        // Add click handler to open note sheet
                        item.style.cursor = 'pointer';
                        item.addEventListener('click', (e) => {
                            // Don't open if clicking delete button
                            if (e.target.closest('.history-item-delete')) {
                                return;
                            }
                            this.openNoteSheet(record);
                        });

                        item.appendChild(timeSpan);
                        item.appendChild(durationContainer);
                        item.appendChild(deleteBtn);
                        dateSection.appendChild(item);
                    });

                    historyList.appendChild(dateSection);
                });
            }
        },

        // Delete a single record
        deleteRecord: function (recordId) {
            // Filter out the record with the given ID
            this.historyData = this.historyData.filter(record => record.id !== recordId);

            // Also delete associated note if any
            if (this.notesData[recordId]) {
                delete this.notesData[recordId];
                this.saveNotes();
            }

            // Save updated history
            this.saveHistory();

            // Re-render if sheet is open
            if (this.isSheetOpen) {
                this.renderHistory();
            }
        },

        // Clear all history
        clearHistory: function () {
            this.historyData = [];
            this.notesData = {}; // Clear all notes
            this.initialStartDate = null;
            this.saveHistory();
            this.saveNotes(); // Save empty notes
            // Also clear the stored initial date
            localStorage.removeItem('timerInitialStartDate');
            if (this.isSheetOpen) {
                this.renderHistory(); // This will also update info stats and hide reset button
            }
        },

        // Handle reset button click
        handleReset: function () {
            if (this.historyData.length === 0) {
                // No history to clear
                return;
            }

            // Show confirmation dialog
            const confirmMessage = 'Are you sure you want to reset the timer history?';
            if (confirm(confirmMessage)) {
                this.clearHistory();
                // Show feedback that history was cleared
                const resetBtn = document.getElementById('resetHistoryBtn');
                if (resetBtn) {
                    const originalText = resetBtn.querySelector('.history-reset-text').textContent;
                    resetBtn.querySelector('.history-reset-text').textContent = 'Cleared';

                    // Restore button text after a delay
                    setTimeout(() => {
                        resetBtn.querySelector('.history-reset-text').textContent = originalText;
                    }, 2000);
                }
            }
        },

        // Calculate and update info section statistics
        updateInfoStats: function () {
            // Update timer done count
            const timerDoneCount = document.getElementById('timerDoneCount');
            if (timerDoneCount) {
                const completedCount = this.historyData.filter(record => record.isCompleted).length;
                timerDoneCount.textContent = completedCount;
            }

            // Update started date (use preserved initial date)
            const timerStartedDate = document.getElementById('timerStartedDate');
            if (timerStartedDate) {
                if (this.initialStartDate) {
                    const startDate = new Date(this.initialStartDate);

                    // Format date as "Aug 25, 2025"
                    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
                    const month = months[startDate.getMonth()];
                    const day = startDate.getDate();
                    const year = startDate.getFullYear();

                    timerStartedDate.textContent = `${month} ${day}, ${year}`;
                } else {
                    timerStartedDate.textContent = 'None';
                }
            }

            // Show/hide reset button and divider based on history data
            const resetContainer = document.querySelector('.history-reset-container');
            const divider = document.querySelector('.history-info-divider');

            if (this.historyData.length > 0) {
                // Show reset button and divider when there's data
                if (resetContainer) resetContainer.style.display = 'block';
                if (divider) divider.style.display = 'block';
            } else {
                // Hide reset button and divider when there's no data
                if (resetContainer) resetContainer.style.display = 'none';
                if (divider) divider.style.display = 'none';
            }

            // Adjust padding after potentially changing visibility of elements
            this.adjustInfoSectionPadding();
        },

        // Adjust padding bottom to match info section height
        adjustInfoSectionPadding: function () {
            const historySheetContent = document.querySelector('.history-sheet-content');
            const historyInfoSection = document.querySelector('.history-info-section');
            const historyList = document.querySelector('.history-list');

            if (historySheetContent && historyInfoSection && historyList) {
                // Get the actual height of the info section
                const infoSectionHeight = historyInfoSection.offsetHeight;

                // Set padding-bottom on sheet content to match
                historySheetContent.style.paddingBottom = infoSectionHeight + 'px';

                // Also adjust the min-height of the list
                historyList.style.minHeight = `calc(100vh - ${infoSectionHeight}px)`;
            }
        },

        // Open note sheet for a timer record
        openNoteSheet: function (record) {
            const noteSheet = document.getElementById('noteSheet');
            const noteOverlay = document.getElementById('noteOverlay');
            const noteTextarea = document.getElementById('noteTextarea');
            const noteCharCount = document.getElementById('noteCharCount');
            const noteTimerTime = document.getElementById('noteTimerTime');
            const noteTimerDuration = document.getElementById('noteTimerDuration');
            const noteDoneBtn = document.getElementById('noteDoneBtn');
            const historyOverlay = document.getElementById('historyOverlay');
            const historySheet = document.getElementById('historySheet');

            // Store current record
            this.currentEditingRecord = record;

            // Set timer info
            noteTimerTime.textContent = record.formattedTime;
            noteTimerDuration.textContent = record.formattedDuration;

            // Load existing note if any
            const existingNote = this.notesData[record.id] || '';
            noteTextarea.value = existingNote;
            noteCharCount.textContent = existingNote.length;

            // Make sure history sheet stays active (note sheet will be on top)
            if (historySheet && !historySheet.classList.contains('active')) {
                historySheet.classList.add('active');
            }

            // Hide history overlay when note sheet opens (note sheet is on top)
            if (historyOverlay) {
                historyOverlay.classList.remove('active');
            }

            // Show note overlay
            if (noteOverlay) {
                noteOverlay.classList.add('active');
            }

            // Show the note sheet
            noteSheet.classList.add('active');

            // Set up event handlers
            const self = this;

            // Auto-save timer
            let saveTimeout = null;

            // Remove any existing input event listeners by cloning the textarea
            const oldTextarea = noteTextarea;
            const newTextarea = oldTextarea.cloneNode(true);
            oldTextarea.parentNode.replaceChild(newTextarea, oldTextarea);
            
            // Re-get the textarea element and set its value
            const noteTextareaNew = document.getElementById('noteTextarea');
            noteTextareaNew.value = existingNote;
            
            // Focus textarea after animation
            setTimeout(() => {
                noteTextareaNew.focus();
            }, 250);

            // Auto-save and character count update
            const handleInput = () => {
                const currentText = noteTextareaNew.value;
                noteCharCount.textContent = currentText.length;

                // Clear previous save timeout
                if (saveTimeout) {
                    clearTimeout(saveTimeout);
                }

                // Auto-save after 500ms of no typing
                saveTimeout = setTimeout(() => {
                    const noteText = currentText.trim();
                    if (noteText) {
                        self.notesData[record.id] = noteText;
                    } else {
                        // Remove note if empty
                        delete self.notesData[record.id];
                    }
                    self.saveNotes();
                    self.renderHistoryList(); // Re-render to update list
                }, 500);
            };
            noteTextareaNew.addEventListener('input', handleInput);

            // Done button handler
            const doneNote = (e) => {
                // Prevent any default behavior
                if (e) {
                    e.preventDefault();
                    e.stopPropagation();
                }

                // Save immediately if there are pending changes
                if (saveTimeout) {
                    clearTimeout(saveTimeout);
                    saveTimeout = null;
                }
                const noteText = noteTextareaNew.value.trim();
                if (noteText) {
                    self.notesData[record.id] = noteText;
                } else {
                    // Remove note if empty
                    delete self.notesData[record.id];
                }
                self.saveNotes();
                self.renderHistoryList();

                // Close note sheet and return to history sheet
                self.closeNoteSheet();

                // Restore history overlay and ensure history sheet is still active
                const historySheet = document.getElementById('historySheet');
                const historyOverlay = document.getElementById('historyOverlay');

                if (historySheet && historySheet.classList.contains('active')) {
                    // Restore overlay for history sheet
                    if (historyOverlay) {
                        historyOverlay.classList.add('active');
                    }
                }
            };

            // Clean up previous handlers by removing all event listeners
            const oldDoneBtn = document.getElementById('noteDoneBtn');
            const newDoneBtn = oldDoneBtn.cloneNode(true);
            oldDoneBtn.parentNode.replaceChild(newDoneBtn, oldDoneBtn);

            // Add new event listener
            newDoneBtn.addEventListener('click', doneNote);
        },

        // Close note sheet
        closeNoteSheet: function () {
            const noteSheet = document.getElementById('noteSheet');
            const noteOverlay = document.getElementById('noteOverlay');
            const noteTextarea = document.getElementById('noteTextarea');

            if (noteSheet) {
                noteSheet.classList.remove('active');
            }

            // Hide note overlay
            if (noteOverlay) {
                noteOverlay.classList.remove('active');
            }

            // Clear the textarea for next use
            if (noteTextarea) {
                noteTextarea.value = '';
            }

            // Clear current editing record
            this.currentEditingRecord = null;

            // Focus back on history sheet for better keyboard navigation
            const historySheet = document.getElementById('historySheet');
            if (historySheet && historySheet.classList.contains('active')) {
                historySheet.focus();
            }
        },

        // Set up ResizeObserver to watch info section size changes
        setupInfoSectionObserver: function () {
            const historyInfoSection = document.querySelector('.history-info-section');

            if (historyInfoSection && window.ResizeObserver) {
                const resizeObserver = new ResizeObserver(() => {
                    this.adjustInfoSectionPadding();
                });

                resizeObserver.observe(historyInfoSection);
            }
        }
    };

    // Initialize when DOM is ready
    document.addEventListener('DOMContentLoaded', function () {
        window.timerHistory.init();
    });
})();
