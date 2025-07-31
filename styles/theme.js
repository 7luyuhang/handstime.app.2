// Theme Toggle Functionality
const icon = document.querySelector('.icon');
const body = document.body;

// Initialize theme on page load
function initializeTheme() {
    const savedTheme = localStorage.getItem('theme');
    
    if (savedTheme === 'dark') {
        body.classList.add('dark-mode');
    } else {
        // Default to light mode
        body.classList.remove('dark-mode');
    }
}

// Toggle theme function
function toggleTheme() {
    const isDarkMode = body.classList.contains('dark-mode');
    
    if (isDarkMode) {
        // Currently dark mode -> switch to light mode
        body.classList.remove('dark-mode');
        localStorage.setItem('theme', 'light');
    } else {
        // Currently light mode -> switch to dark mode
        body.classList.add('dark-mode');
        localStorage.setItem('theme', 'dark');
    }
}

// Add click event to icon
if (icon) {
    icon.addEventListener('click', toggleTheme);
}

// Initialize theme when page loads
initializeTheme();