// World Clock Functionality with City Selection
document.addEventListener('DOMContentLoaded', function() {
    
    // Available cities data
    const allCities = [
        // Oceania
        { timezone: 'Pacific/Auckland', name: 'Auckland' },
        { timezone: 'Pacific/Fiji', name: 'Fiji' },
        { timezone: 'Pacific/Guam', name: 'Guam' },
        { timezone: 'Pacific/Honolulu', name: 'Honolulu' },
        { timezone: 'Australia/Sydney', name: 'Sydney' },
        { timezone: 'Australia/Melbourne', name: 'Melbourne' },
        { timezone: 'Australia/Perth', name: 'Perth' },
      
        // East Asia
        { timezone: 'Asia/Shanghai', name: 'Shanghai' },
        { timezone: 'Asia/Hong_Kong', name: 'Hong Kong' },
        { timezone: 'Asia/Tokyo', name: 'Tokyo' },
        { timezone: 'Asia/Seoul', name: 'Seoul' },
        { timezone: 'Asia/Taipei', name: 'Taipei' },
      
        // Southeast Asia
        { timezone: 'Asia/Singapore', name: 'Singapore' },
        { timezone: 'Asia/Bangkok', name: 'Bangkok' },
        { timezone: 'Asia/Kuala_Lumpur', name: 'Kuala Lumpur' },
        { timezone: 'Asia/Jakarta', name: 'Jakarta' },
        { timezone: 'Asia/Manila', name: 'Manila' },
      
        // South Asia
        { timezone: 'Asia/Kolkata', name: 'Mumbai' },
        { timezone: 'Asia/Kathmandu', name: 'Kathmandu' },
        { timezone: 'Asia/Karachi', name: 'Karachi' },
      
        // Middle East
        { timezone: 'Asia/Dubai', name: 'Dubai' },
        { timezone: 'Asia/Riyadh', name: 'Riyadh' },
        { timezone: 'Asia/Tehran', name: 'Tehran' },
        { timezone: 'Asia/Jerusalem', name: 'Jerusalem' },
        { timezone: 'Europe/Istanbul', name: 'Istanbul' },
      
        // Europe
        { timezone: 'Europe/London', name: 'London' },
        { timezone: 'Europe/Paris', name: 'Paris' },
        { timezone: 'Europe/Berlin', name: 'Berlin' },
        { timezone: 'Europe/Madrid', name: 'Madrid' },
        { timezone: 'Europe/Rome', name: 'Rome' },
        { timezone: 'Europe/Moscow', name: 'Moscow' },
        { timezone: 'Europe/Zurich', name: 'Zurich' },
        { timezone: 'Europe/Athens', name: 'Athens' },
        { timezone: 'Europe/Warsaw', name: 'Warsaw' },
        { timezone: 'Europe/Stockholm', name: 'Stockholm' },
      
        // Africa
        { timezone: 'Africa/Cairo', name: 'Cairo' },
        { timezone: 'Africa/Lagos', name: 'Lagos' },
        { timezone: 'Africa/Nairobi', name: 'Nairobi' },
        { timezone: 'Africa/Johannesburg', name: 'Johannesburg' },
        { timezone: 'Africa/Casablanca', name: 'Casablanca' },
      
        // North America
        { timezone: 'America/New_York', name: 'New York' },
        { timezone: 'America/Toronto', name: 'Toronto' },
        { timezone: 'America/Chicago', name: 'Chicago' },
        { timezone: 'America/Denver', name: 'Denver' },
        { timezone: 'America/Los_Angeles', name: 'Los Angeles' },
        { timezone: 'America/Vancouver', name: 'Vancouver' },
        { timezone: 'America/Mexico_City', name: 'Mexico City' },
      
        // South America
        { timezone: 'America/Sao_Paulo', name: 'São Paulo' },
        { timezone: 'America/Buenos_Aires', name: 'Buenos Aires' },
        { timezone: 'America/Lima', name: 'Lima' },
        { timezone: 'America/Bogota', name: 'Bogotá' },
        { timezone: 'America/Santiago', name: 'Santiago' }
      ];
    
    // Default selected cities
    const defaultCities = [
        'Europe/London',
        'America/New_York',
        'America/Los_Angeles',
        'Asia/Tokyo',
        'Asia/Shanghai'
    ];
    
    // Get elements
    const editBtn = document.getElementById('worldClockEditBtn');
    const resetBtn = document.getElementById('worldClockResetBtn');
    const defaultList = document.getElementById('worldClockDefault');
    const fullList = document.getElementById('worldClockFull');
    const selectionCount = document.getElementById('selectionCount');
    const selectionInfo = document.getElementById('worldClockSelectionInfo');
    const controlsContainer = document.querySelector('.world-clock-controls');
    
    let isEditMode = false;
    let selectedCities = [];
    
    // Load saved cities from localStorage or use defaults
    function loadSelectedCities() {
        const saved = localStorage.getItem('selectedWorldClocks');
        if (saved) {
            selectedCities = JSON.parse(saved);
        } else {
            selectedCities = [...defaultCities];
        }
    }
    
    // Save selected cities to localStorage
    function saveSelectedCities() {
        localStorage.setItem('selectedWorldClocks', JSON.stringify(selectedCities));
    }
    
    // Create clock item HTML
    function createClockItem(timezone, name, includeCheckbox = false) {
        const item = document.createElement('div');
        if (includeCheckbox) {
            item.className = 'world-clock-selectable';
            item.setAttribute('data-timezone', timezone);
        } else {
            item.className = 'world-clock-item';
        }
        
        const leftContent = document.createElement('div');
        leftContent.className = 'world-clock-left';
        
        if (includeCheckbox) {
            const checkbox = document.createElement('input');
            checkbox.type = 'checkbox';
            checkbox.className = 'world-clock-checkbox';
            checkbox.value = timezone;
            checkbox.checked = selectedCities.includes(timezone);
            checkbox.addEventListener('change', handleCitySelection);
            leftContent.appendChild(checkbox);
            
            // Make entire row clickable
            item.addEventListener('click', function(e) {
                // Prevent triggering when clicking the checkbox itself
                if (e.target.type !== 'checkbox') {
                    checkbox.checked = !checkbox.checked;
                    checkbox.dispatchEvent(new Event('change'));
                }
            });
        }
        
        const time = document.createElement('span');
        time.className = 'world-clock-time';
        time.setAttribute('data-timezone', timezone);
        time.textContent = '--:--';
        leftContent.appendChild(time);
        
        const city = document.createElement('span');
        city.className = 'world-clock-city';
        city.textContent = name;
        
        item.appendChild(leftContent);
        item.appendChild(city);
        
        return item;
    }
    
    // Create divider
    function createDivider() {
        const divider = document.createElement('div');
        divider.className = 'world-clock-divider';
        return divider;
    }
    
    // Render default view
    function renderDefaultView() {
        defaultList.innerHTML = '';
        
        // If no cities selected, show prompt message
        if (selectedCities.length === 0) {
            const emptyMessage = document.createElement('div');
            emptyMessage.className = 'world-clock-empty-message';
            emptyMessage.textContent = 'Select time around the world.';
            defaultList.appendChild(emptyMessage);
        } else {
            selectedCities.forEach((timezone, index) => {
                const city = allCities.find(c => c.timezone === timezone);
                if (city) {
                    if (index > 0) {
                        defaultList.appendChild(createDivider());
                    }
                    defaultList.appendChild(createClockItem(city.timezone, city.name));
                }
            });
        }
    }
    
    // Render full list view
    function renderFullList() {
        fullList.innerHTML = '';
        
        allCities.forEach((city, index) => {
            if (index > 0) {
                fullList.appendChild(createDivider());
            }
            fullList.appendChild(createClockItem(city.timezone, city.name, true));
        });
        
        updateSelectionCount();
        
        // Add scroll listener for top border
        fullList.addEventListener('scroll', handleScroll);
    }
    
    // Handle scroll event for top border
    function handleScroll() {
        if (fullList.scrollTop > 0) {
            fullList.classList.add('scrolled');
        } else {
            fullList.classList.remove('scrolled');
        }
    }
    
    // Handle city selection
    function handleCitySelection(e) {
        const timezone = e.target.value;
        
        if (e.target.checked) {
            if (selectedCities.length < 5) {
                selectedCities.push(timezone);
            } else {
                e.target.checked = false;
                // Optionally show a message that max 5 cities can be selected
            }
        } else {
            selectedCities = selectedCities.filter(tz => tz !== timezone);
        }
        
        updateSelectionCount();
    }
    
    // Update selection count display
    function updateSelectionCount() {
        if (selectionCount) {
            selectionCount.textContent = selectedCities.length;
            
            // Disable unchecked checkboxes if 5 cities are selected
            const checkboxes = fullList.querySelectorAll('.world-clock-checkbox');
            checkboxes.forEach(checkbox => {
                if (selectedCities.length >= 5 && !checkbox.checked) {
                    checkbox.disabled = true;
                    checkbox.parentElement.parentElement.classList.add('disabled');
                } else {
                    checkbox.disabled = false;
                    checkbox.parentElement.parentElement.classList.remove('disabled');
                }
            });
        }
    }
    
    // Update all world clocks
    function updateWorldClocks() {
        const clockElements = document.querySelectorAll('.world-clock-time');
        
        clockElements.forEach(element => {
            const timezone = element.getAttribute('data-timezone');
            if (timezone) {
                try {
                    // Get current time in the specified timezone
                    const now = new Date();
                    const options = {
                        timeZone: timezone,
                        hour: '2-digit',
                        minute: '2-digit',
                        hour12: false
                    };
                    
                    // Format time as HH:MM
                    const timeString = now.toLocaleTimeString('en-US', options);
                    element.textContent = timeString;
                } catch (error) {
                    console.error(`Error updating time for ${timezone}:`, error);
                    element.textContent = '--:--';
                }
            }
        });
    }
    
    // Reset to default cities
    function resetToDefaults() {
        selectedCities = [...defaultCities];
        saveSelectedCities();
        renderFullList();
        updateSelectionCount();
    }
    
    // Toggle between default and full list
    function toggleEditMode() {
        isEditMode = !isEditMode;
        
        if (isEditMode) {
            // Entering edit mode
            renderFullList();
            defaultList.style.display = 'none';
            fullList.style.display = 'flex';
            fullList.scrollTop = 0; // Reset scroll position to top
            fullList.classList.remove('scrolled'); // Reset scrolled state
            if (selectionInfo) {
                selectionInfo.style.display = 'block';
            }
            if (resetBtn) {
                resetBtn.style.display = 'block';
            }
            editBtn.textContent = 'Done';
            editBtn.classList.remove('world-clock-edit-btn');
            editBtn.classList.add('world-clock-done-btn');
            if (controlsContainer) {
                controlsContainer.classList.remove('edit-mode');
                controlsContainer.classList.add('done-mode');
            }
        } else {
            // Exiting edit mode - save selections
            saveSelectedCities();
            renderDefaultView();
            defaultList.style.display = 'flex';
            fullList.style.display = 'none';
            if (selectionInfo) {
                selectionInfo.style.display = 'none';
            }
            if (resetBtn) {
                resetBtn.style.display = 'none';
            }
            // Remove scroll listener and reset scroll position
            fullList.removeEventListener('scroll', handleScroll);
            fullList.scrollTop = 0;
            fullList.classList.remove('scrolled');
            editBtn.textContent = 'Edit';
            editBtn.classList.remove('world-clock-done-btn');
            editBtn.classList.add('world-clock-edit-btn');
            if (controlsContainer) {
                controlsContainer.classList.remove('done-mode');
                controlsContainer.classList.add('edit-mode');
            }
        }
    }
    
    // Initialize
    function init() {
        loadSelectedCities();
        renderDefaultView();
        
        // Set initial mode class
        if (controlsContainer) {
            controlsContainer.classList.add('edit-mode');
        }
        
        // Add event listener to edit button
        if (editBtn) {
            editBtn.addEventListener('click', toggleEditMode);
        }
        
        // Add event listener to reset button
        if (resetBtn) {
            resetBtn.addEventListener('click', resetToDefaults);
        }
        
        // Update clocks immediately
        updateWorldClocks();
        
        // Update every second
        setInterval(updateWorldClocks, 1000);
    }
    
    // Start the app
    init();
});