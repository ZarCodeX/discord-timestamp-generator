document.addEventListener('DOMContentLoaded', function() {
    // Set initial datetime to current time
    const now = new Date();
    const datetimeInput = document.getElementById('datetime');
    datetimeInput.value = formatDateTimeLocal(now);
    
    // Theme toggle
    const darkBtn = document.getElementById('darkBtn');
    const lightBtn = document.getElementById('lightBtn');
    const body = document.body;
    
    // Check for saved theme preference
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme === 'light') {
        body.classList.add('light-mode');
        darkBtn.classList.remove('active');
        lightBtn.classList.add('active');
    }
    
    darkBtn.addEventListener('click', () => {
        body.classList.remove('light-mode');
        darkBtn.classList.add('active');
        lightBtn.classList.remove('active');
        localStorage.setItem('theme', 'dark');
    });
    
    lightBtn.addEventListener('click', () => {
        body.classList.add('light-mode');
        darkBtn.classList.remove('active');
        lightBtn.classList.add('active');
        localStorage.setItem('theme', 'light');
    });
    
    // Format definitions
    const formats = [
        {
            id: 't',
            name: 'Short Time',
            preview: '9:41 AM',
            tooltip: 'Displays only the time (hours:minutes)'
        },
        {
            id: 'T',
            name: 'Long Time',
            preview: '9:41:30 AM',
            tooltip: 'Displays time with seconds'
        },
        {
            id: 'd',
            name: 'Short Date',
            preview: '04/27/2025',
            tooltip: 'Displays date in numeric format'
        },
        {
            id: 'D',
            name: 'Full Date',
            preview: 'April 27, 2025',
            tooltip: 'Displays full month name and year'
        },
        {
            id: 'f',
            name: 'Full Date & Time',
            preview: 'April 27, 2025 9:41 AM',
            tooltip: 'Default format with date and time'
        },
        {
            id: 'F',
            name: 'Long Date & Time',
            preview: 'Sunday, April 27, 2025 9:41 AM',
            tooltip: 'Includes day of the week'
        },
        {
            id: 'R',
            name: 'Relative Time',
            preview: 'in 2 days',
            tooltip: 'Shows relative time like "2 hours ago"'
        }
    ];
    
    // Render format options
    const formatGrid = document.getElementById('formatGrid');
    formats.forEach(format => {
        const formatCard = document.createElement('div');
        formatCard.className = 'format-card';
        formatCard.innerHTML = `
            <div class="format-name">${format.name}</div>
            <div class="format-preview">${format.preview}</div>
            <div class="format-tooltip">${format.tooltip}</div>
        `;
        formatCard.dataset.id = format.id;
        formatCard.addEventListener('click', () => selectFormat(format.id));
        formatGrid.appendChild(formatCard);
    });
    
    // Set current time button
    const currentTimeBtn = document.getElementById('currentTimeBtn');
    currentTimeBtn.addEventListener('click', () => {
        const now = new Date();
        datetimeInput.value = formatDateTimeLocal(now);
        updatePreview();
    });
    
    // Copy button functionality
    const copyBtn = document.getElementById('copyBtn');
    const discordCode = document.getElementById('discordCode');
    const copySuccess = document.getElementById('copySuccess');
    
    copyBtn.addEventListener('click', () => {
        if (discordCode.value === '') return;
        
        navigator.clipboard.writeText(discordCode.value).then(() => {
            copySuccess.classList.add('show');
            setTimeout(() => {
                copySuccess.classList.remove('show');
            }, 2000);
        });
    });
    
    // Event listeners for updates
    datetimeInput.addEventListener('change', updatePreview);
    
    // Initialize with first format selected
    selectFormat('f');
    
    // Format selection function
    function selectFormat(formatId) {
        // Remove active class from all cards
        document.querySelectorAll('.format-card').forEach(card => {
            card.classList.remove('active');
        });
        
        // Add active class to selected card
        document.querySelector(`.format-card[data-id="${formatId}"]`).classList.add('active');
        
        // Update preview
        updatePreview(formatId);
    }
    
    // Update preview function
    function updatePreview() {
        const formatCard = document.querySelector('.format-card.active');
        if (!formatCard) return;
        
        const formatId = formatCard.dataset.id;
        const dateValue = datetimeInput.value;
        const selectedDate = dateValue ? new Date(dateValue) : new Date();
        
        // Get Unix timestamp in seconds
        const unixTimestamp = Math.floor(selectedDate.getTime() / 1000);
        
        // Generate Discord code
        const discordTimestamp = `<t:${unixTimestamp}:${formatId}>`;
        discordCode.value = discordTimestamp;
        
        // Generate preview text
        let previewText = '';
        
        switch (formatId) {
            case 't':
                previewText = selectedDate.toLocaleTimeString([], {hour: 'numeric', minute: '2-digit'});
                break;
            case 'T':
                previewText = selectedDate.toLocaleTimeString([], {hour: 'numeric', minute: '2-digit', second: '2-digit'});
                break;
            case 'd':
                previewText = selectedDate.toLocaleDateString([], {month: '2-digit', day: '2-digit', year: 'numeric'});
                break;
            case 'D':
                previewText = selectedDate.toLocaleDateString([], {month: 'long', day: 'numeric', year: 'numeric'});
                break;
            case 'f':
                previewText = selectedDate.toLocaleDateString([], {month: 'long', day: 'numeric', year: 'numeric'}) + ' ' + 
                            selectedDate.toLocaleTimeString([], {hour: 'numeric', minute: '2-digit'});
                break;
            case 'F':
                previewText = selectedDate.toLocaleDateString([], {weekday: 'long', month: 'long', day: 'numeric', year: 'numeric'}) + ' ' + 
                            selectedDate.toLocaleTimeString([], {hour: 'numeric', minute: '2-digit'});
                break;
            case 'R':
                const now = new Date();
                const diff = selectedDate - now;
                const diffSeconds = Math.floor(Math.abs(diff) / 1000);
                
                if (diff < 0) {
                    // Past time
                    if (diffSeconds < 60) {
                        previewText = `${diffSeconds} seconds ago`;
                    } else if (diffSeconds < 3600) {
                        const minutes = Math.floor(diffSeconds / 60);
                        previewText = `${minutes} minute${minutes > 1 ? 's' : ''} ago`;
                    } else if (diffSeconds < 86400) {
                        const hours = Math.floor(diffSeconds / 3600);
                        previewText = `${hours} hour${hours > 1 ? 's' : ''} ago`;
                    } else {
                        const days = Math.floor(diffSeconds / 86400);
                        previewText = `${days} day${days > 1 ? 's' : ''} ago`;
                    }
                } else {
                    // Future time
                    if (diffSeconds < 60) {
                        previewText = `in ${diffSeconds} seconds`;
                    } else if (diffSeconds < 3600) {
                        const minutes = Math.floor(diffSeconds / 60);
                        previewText = `in ${minutes} minute${minutes > 1 ? 's' : ''}`;
                    } else if (diffSeconds < 86400) {
                        const hours = Math.floor(diffSeconds / 3600);
                        previewText = `in ${hours} hour${hours > 1 ? 's' : ''}`;
                    } else {
                        const days = Math.floor(diffSeconds / 86400);
                        previewText = `in ${days} day${days > 1 ? 's' : ''}`;
                    }
                }
                break;
        }
        
        document.getElementById('previewText').textContent = previewText;
    }
    
    // Helper function to format datetime-local input value
    function formatDateTimeLocal(date) {
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        const hours = String(date.getHours()).padStart(2, '0');
        const minutes = String(date.getMinutes()).padStart(2, '0');
        
        return `${year}-${month}-${day}T${hours}:${minutes}`;
    }
});
