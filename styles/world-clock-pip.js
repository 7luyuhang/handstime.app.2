// World Clock Picture-in-Picture functionality
// Using Document Picture-in-Picture API for arbitrary HTML content

document.addEventListener('DOMContentLoaded', function () {
    // Check if Document Picture-in-Picture API is supported
    const isPiPSupported = 'documentPictureInPicture' in window;

    if (!isPiPSupported) {
        console.log('Document Picture-in-Picture API is not supported in this browser');
        return;
    }

    let pipWindow = null;
    let updateInterval = null;

    // Get the world clock container
    const worldClockContainer = document.querySelector('.world-clock-container');

    if (!worldClockContainer) {
        console.log('World clock container not found');
        return;
    }

    // Add click handler to world clock container
    worldClockContainer.style.cursor = 'pointer';

    // Function to get selected cities from localStorage
    function getSelectedCities() {
        const saved = localStorage.getItem('selectedWorldClocks');
        if (saved) {
            return JSON.parse(saved);
        }
        // Default cities if none saved
        return [
            'Europe/London',
            'America/New_York',
            'America/Los_Angeles',
            'Asia/Tokyo',
            'Asia/Shanghai'
        ];
    }

    // Function to get city name from timezone
    function getCityName(timezone) {
        const cityMap = {
            'Pacific/Auckland': 'Auckland',
            'Europe/Berlin': 'Berlin',
            'America/Chicago': 'Chicago',
            'Asia/Dubai': 'Dubai',
            'Asia/Hong_Kong': 'Hong Kong',
            'Europe/London': 'London',
            'Europe/Moscow': 'Moscow',
            'Asia/Kolkata': 'Mumbai',
            'America/New_York': 'New York',
            'Europe/Paris': 'Paris',
            'America/Los_Angeles': 'Los Angeles',
            'America/Sao_Paulo': 'São Paulo',
            'Asia/Seoul': 'Seoul',
            'Asia/Shanghai': 'Shanghai',
            'Asia/Singapore': 'Singapore',
            'Australia/Sydney': 'Sydney',
            'Asia/Tokyo': 'Tokyo'
        };
        return cityMap[timezone] || timezone.split('/').pop().replace('_', ' ');
    }

    // Function to format time for a specific timezone
    function formatTimeForTimezone(timezone) {
        try {
            const now = new Date();
            const options = {
                timeZone: timezone,
                hour: '2-digit',
                minute: '2-digit',
                hour12: false
            };
            return now.toLocaleTimeString('en-US', options);
        } catch (error) {
            console.error(`Error formatting time for ${timezone}:`, error);
            return '--:--';
        }
    }

    // Function to create PiP content
    function createPiPContent() {
        const selectedCities = getSelectedCities();

        // Check if dark mode is active
        const isDarkMode = document.body.classList.contains('dark-mode');

        // Create HTML structure for PiP window
        const container = document.createElement('div');
        container.style.cssText = `
            padding: 24px;
            font-family: 'ABCDiatypeSemi-Mono', monospace, system-ui, -apple-system, sans-serif;
            background: ${isDarkMode ? '#000000' : 'white'};
            color: ${isDarkMode ? 'white' : 'black'};
            height: 100%;
            display: flex;
            flex-direction: column;
            ${selectedCities.length === 0 ? 'justify-content: center; align-items: center;' : ''}
        `;

        // If no cities selected, show empty message
        if (selectedCities.length === 0) {
            const emptyMessage = document.createElement('div');
            emptyMessage.style.cssText = `
                font-family: 'ABCDiatypeSemi-Mono', monospace;
                color: ${isDarkMode ? '#808080' : '#808080'};
                font-size: 1em;
                text-align: center;
            `;
            emptyMessage.textContent = 'Select time around the world.';
            container.appendChild(emptyMessage);
            return container;
        }

        // Add clock items
        selectedCities.forEach((timezone, index) => {
            const clockItem = document.createElement('div');
            clockItem.style.cssText = `
                display: flex;
                justify-content: space-between;
                align-items: center;
                padding: ${index > 0 ? '10px 0 10px 0' : '0 0 10px 0'};
                ${index > 0 ? 'border-top: 1px solid rgba(128, 128, 128, 0.15);' : ''}
            `;

            const timeSpan = document.createElement('span');
            timeSpan.className = 'pip-clock-time';
            timeSpan.setAttribute('data-timezone', timezone);
            timeSpan.style.cssText = `
                font-family: 'ABCDiatypeSemi-Mono', monospace;
                font-size: 1em;
                font-variant-numeric: tabular-nums;
                color: ${isDarkMode ? 'white' : 'black'};
            `;
            timeSpan.textContent = formatTimeForTimezone(timezone);

            const citySpan = document.createElement('span');
            citySpan.style.cssText = `
                font-family: 'ABCDiatypeSemi-Mono', monospace;
                font-size: 1em;
                color: ${isDarkMode ? '#808080' : '#808080'};
            `;
            citySpan.textContent = getCityName(timezone);

            clockItem.appendChild(timeSpan);
            clockItem.appendChild(citySpan);
            container.appendChild(clockItem);
        });

        return container;
    }

    // Function to update times in PiP window
    function updatePiPTimes() {
        if (!pipWindow) return;

        const clockElements = pipWindow.document.querySelectorAll('.pip-clock-time');
        clockElements.forEach(element => {
            const timezone = element.getAttribute('data-timezone');
            if (timezone) {
                element.textContent = formatTimeForTimezone(timezone);
            }
        });
    }

    // Function to open Picture-in-Picture
    async function openPiP() {
        try {
            // Close existing PiP if any
            if (pipWindow) {
                closePiP();
            }

            // Open new PiP window
            pipWindow = await window.documentPictureInPicture.requestWindow({
                width: 360,
                height: 360 // Allow user to resize if needed
            });

            // Copy font file to PiP window if available
            const fontLink = document.querySelector('link[href*="font"]');
            if (fontLink) {
                const newFontLink = pipWindow.document.createElement('link');
                newFontLink.rel = 'stylesheet';
                newFontLink.href = fontLink.href;
                pipWindow.document.head.appendChild(newFontLink);
            }

            // Add font-face declaration directly
            const style = pipWindow.document.createElement('style');
            style.textContent = `
                @font-face {
                    font-family: 'ABCDiatypeSemi-Mono';
                    src: url('${window.location.origin}/styles/font/ABCDiatypeSemi-Mono-Regular.otf') format('opentype');
                    font-weight: normal;
                    font-style: normal;
                    font-display: swap;
                }
                body {
                    margin: 0;
                    padding: 0;
                    overflow: hidden;
                    background: ${document.body.classList.contains('dark-mode') ? '#000000' : 'white'};
                    height: 100vh;
                    width: 100vw;
                    font-family: 'ABCDiatypeSemi-Mono', monospace, system-ui, -apple-system, sans-serif;
                }
                * {
                    font-family: 'ABCDiatypeSemi-Mono', monospace, system-ui, -apple-system, sans-serif;
                }
            `;
            pipWindow.document.head.appendChild(style);

            // Set window title
            pipWindow.document.title = 'World Clock - Picture in Picture';

            // Add content to PiP window
            const content = createPiPContent();
            pipWindow.document.body.appendChild(content);

            // Start updating times
            updateInterval = setInterval(updatePiPTimes, 1000);

            // Handle PiP window close
            pipWindow.addEventListener('pagehide', () => {
                closePiP();
            });

            console.log('Picture-in-Picture window opened successfully');

        } catch (error) {
            console.error('Failed to open Picture-in-Picture:', error);

            // Provide user feedback
            if (error.name === 'NotAllowedError') {
                alert('Picture-in-Picture permission was denied. Please allow PiP for this site.');
            } else if (error.name === 'NotSupportedError') {
                alert('Document Picture-in-Picture is not supported in your browser. Please use Chrome 116 or later.');
            } else {
                alert('Failed to open Picture-in-Picture window. Please try again.');
            }
        }
    }

    // Function to close Picture-in-Picture
    function closePiP() {
        if (updateInterval) {
            clearInterval(updateInterval);
            updateInterval = null;
        }

        if (pipWindow) {
            pipWindow.close();
            pipWindow = null;
        }

        console.log('Picture-in-Picture window closed');
    }

    // Add click event listener to world clock container
    worldClockContainer.addEventListener('click', function (e) {
        // Don't trigger if clicking on buttons or interactive elements
        if (e.target.closest('button') ||
            e.target.closest('input') ||
            e.target.closest('.world-clock-selectable')) {
            return;
        }

        // Add scale effect on click
        worldClockContainer.style.transform = 'scale(0.98)'; // Hover scale effct
        worldClockContainer.style.transition = 'transform 0.25s cubic-bezier(0.5, 0, 0, 1)';
        
        // Reset scale after animation
        setTimeout(() => {
            worldClockContainer.style.transform = 'scale(1)';
        }, 250);

        // Toggle PiP
        if (pipWindow) {
            closePiP();
        } else {
            openPiP();
        }
    });

    // Clean up on page unload
    window.addEventListener('beforeunload', closePiP);

    // Listen for theme changes and update PiP window if open
    const observer = new MutationObserver(function (mutations) {
        mutations.forEach(function (mutation) {
            if (mutation.type === 'attributes' && mutation.attributeName === 'class') {
                // Theme has changed, update PiP window if it's open
                if (pipWindow) {
                    const isDarkMode = document.body.classList.contains('dark-mode');

                    // Update background color
                    pipWindow.document.body.style.background = isDarkMode ? '#black' : 'white';

                    // Update all text colors
                    const container = pipWindow.document.querySelector('div');
                    if (container) {
                        container.style.background = isDarkMode ? '#black' : 'white';
                        container.style.color = isDarkMode ? 'white' : 'black';
                    }

                    // Update clock times
                    const times = pipWindow.document.querySelectorAll('.pip-clock-time');
                    times.forEach(time => {
                        time.style.color = isDarkMode ? 'white' : 'black';
                    });

                    // Update city names
                    const cities = pipWindow.document.querySelectorAll('.pip-clock-time + span');
                    cities.forEach(city => {
                        city.style.color = isDarkMode ? '#808080' : '#808080';
                    });
                    
                    // Update empty message if exists
                    const emptyMessage = pipWindow.document.querySelector('div[style*="text-align: center"]');
                    if (emptyMessage && emptyMessage.textContent === 'Select time around the world.') {
                        emptyMessage.style.color = isDarkMode ? '#808080' : '#808080';
                    }
                }
            }
        });
    });

    // Start observing body for class changes
    observer.observe(document.body, {
        attributes: true,
        attributeFilter: ['class']
    });
});
