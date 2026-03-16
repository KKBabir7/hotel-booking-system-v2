// --- Hero Text Slider (Slick) ---
$(document).ready(function () {
    $('.hero-text-slider').slick({
        dots: false,
        infinite: true,
        speed: 1000,
        fade: true,
        cssEase: 'cubic-bezier(0.7, 0, 0.3, 1)',
        autoplay: true,
        autoplaySpeed: 6000,
        arrows: false,
        draggable: true,
        swipe: true,
        pauseOnHover: false
    });
});

document.addEventListener('DOMContentLoaded', () => {
    // Desktop Dropdown Submenu Logic
    const submenus = document.querySelectorAll('.dropdown-submenu .dropdown-toggle');
    submenus.forEach(submenu => {
        submenu.addEventListener('click', (e) => {
            e.preventDefault();
            e.stopPropagation();
            const sub = submenu.nextElementSibling;
            if (sub) {
                sub.classList.toggle('show');
            }
        });
    });

    // Close all when clicking outside
    document.addEventListener('click', (e) => {
        if (!e.target.closest('.dropdown')) {
            document.querySelectorAll('.dropdown-menu').forEach(menu => {
                menu.classList.remove('show');
            });
            document.querySelectorAll('.btn-menu-toggle').forEach(btn => {
                btn.classList.remove('active');
            });
        }
    });

    // --- Animated Hamburger Logic ---
    const animatedBtns = document.querySelectorAll('.animated-burger-btn');
    const offcanvasMenu = document.getElementById('offcanvasMenu');
    const desktopDropdown = document.getElementById('desktopMenuDropdown');

    // --- Desktop Dropdown & Burger Sync ---
    const desktopDropdownWrapper = document.querySelector('.desktop-dropdown');
    const dropdownBtn = document.getElementById('desktopMenuDropdown');
    const dropdownMenu = desktopDropdownWrapper?.querySelector('.dropdown-menu');

    if (dropdownBtn && dropdownMenu) {
        dropdownBtn.addEventListener('click', (e) => {
            e.preventDefault();
            e.stopPropagation();
            dropdownMenu.classList.toggle('show');
            dropdownBtn.classList.toggle('active');
        });

        // Close on click outside
        document.addEventListener('click', (e) => {
            if (desktopDropdownWrapper && !desktopDropdownWrapper.contains(e.target)) {
                dropdownMenu.classList.remove('show');
                dropdownBtn.classList.remove('active');
            }
        });
    }

    // Sync Mobile Offcanvas Icon
    if (offcanvasMenu) {
        const mobileToggle = document.querySelector('[data-bs-target="#offcanvasMenu"]');
        offcanvasMenu.addEventListener('show.bs.offcanvas', () => {
            if (mobileToggle) mobileToggle.classList.add('active');
        });
        offcanvasMenu.addEventListener('hide.bs.offcanvas', () => {
            if (mobileToggle) mobileToggle.classList.remove('active');
        });
    }

    // --- Dynamic Sticky Navbar Logic ---
    const mainNav = document.getElementById('main-nav');
    if (mainNav) {
        window.addEventListener('scroll', () => {
            if (window.scrollY > 50) {
                mainNav.classList.add('navbar-scrolled');
            } else {
                mainNav.classList.remove('navbar-scrolled');
            }
        });
    }

    // --- Functional Search Bar Logic ---
    const searchWhere = document.getElementById('search-where');
    const searchWhen = document.getElementById('search-when');
    const searchWho = document.getElementById('search-who');
    const locationInput = document.getElementById('location-input');
    const locationPanel = document.querySelector('.location-panel');
    const locationResults = document.getElementById('location-results');
    const guestPanel = document.querySelector('.guest-panel');
    const dateDisplay = document.getElementById('date-display');
    const guestDisplay = document.getElementById('guest-display');

    const clearWhere = document.getElementById('clear-where');
    const clearWhen = document.getElementById('clear-when');
    const clearWho = document.getElementById('clear-who');

    function toggleClearBtn(btn, show) {
        if (!btn) return;
        if (show) btn.classList.remove('d-none');
        else btn.classList.add('d-none');
    }
    // --- Dynamic Search Panel Positioning (Smart Flip) ---
    const NAVBAR_HEIGHT = 80;

    function updatePanelPosition(panel) {
        if (!panel) return;

        const parentItem = panel.closest('.search-item');
        if (!parentItem) return;

        const rect = parentItem.getBoundingClientRect();
        const viewportHeight = window.innerHeight;
        const panelHeight = 480; // Added buffer for safer flipping

        const spaceBottom = viewportHeight - rect.bottom;
        const spaceTop = rect.top - NAVBAR_HEIGHT;

        // Reset flip
        panel.classList.remove('flip-top');

        // If bottom space is less than panel height AND top has more space than bottom
        if (spaceBottom < panelHeight && spaceTop > spaceBottom) {
            panel.classList.add('flip-top');
        }
    }

    // Utility: Show a specific panel
    function showPanel(panelName) {
        // Hide all panels first
        document.querySelectorAll('.search-panel').forEach(p => p.classList.add('d-none'));
        document.querySelectorAll('.search-item').forEach(i => i.classList.remove('active-section'));

        if (panelName === 'where') {
            locationPanel.classList.remove('d-none');
            searchWhere.classList.add('active-section');
            updatePanelPosition(locationPanel);
            locationInput.focus();
        } else if (panelName === 'when') {
            searchWhen.classList.add('active-section');
            datePickerInstance.open();
        } else if (panelName === 'who') {
            guestPanel.classList.remove('d-none');
            searchWho.classList.add('active-section');
            updatePanelPosition(guestPanel);
        }
    }

    // Event Listeners for Tab Switching
    searchWhere.addEventListener('click', (e) => {
        e.stopPropagation();
        showPanel('where');
    });

    searchWhen.addEventListener('click', (e) => {
        e.stopPropagation();
        showPanel('when');
    });

    searchWho.addEventListener('click', (e) => {
        e.stopPropagation();
        showPanel('who');
    });

    // Close panels on outside click
    document.addEventListener('click', (e) => {
        if (!e.target.closest('.hero-search-container') && !e.target.closest('.flatpickr-calendar')) {
            document.querySelectorAll('.search-panel').forEach(p => p.classList.add('d-none'));
            document.querySelectorAll('.search-item').forEach(i => i.classList.remove('active-section'));
        }
    });

    // 1. Location Search (Nominatim API)
    let debounceTimer;
    locationInput.addEventListener('input', (e) => {
        const query = e.target.value;
        toggleClearBtn(clearWhere, query.length > 0);
        clearTimeout(debounceTimer);
        if (query.length < 3) return;

        debounceTimer = setTimeout(() => {
            fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${query}&countrycodes=bd&limit=5`)
                .then(res => res.json())
                .then(data => {
                    locationResults.innerHTML = ''; // Clear suggestions
                    data.forEach(place => {
                        const item = document.createElement('div');
                        item.className = 'suggestion-item d-flex align-items-center px-4 py-3';
                        item.innerHTML = `
                            <div class="suggestion-icon me-3 bg-light rounded-3 p-2">
                                <i class="bi bi-geo-alt text-primary"></i>
                            </div>
                            <div>
                                <div class="suggestion-title fw-bold">${place.display_name.split(',')[0]}</div>
                                <div class="suggestion-subtitle text-muted small">${place.display_name.split(',').slice(1, 3).join(',')}</div>
                            </div>
                        `;
                        item.addEventListener('click', (e) => {
                            e.stopPropagation();
                            locationInput.value = place.display_name.split(',')[0];
                            showPanel('when'); // Auto-switch to When
                        });
                        locationResults.appendChild(item);
                    });
                });
        }, 500);
    });

    // Static suggestion click logic
    document.querySelectorAll('.suggestion-item').forEach(item => {
        item.addEventListener('click', (e) => {
            e.stopPropagation();
            const loc = item.getAttribute('data-location');
            if (loc !== 'nearby') {
                locationInput.value = loc.split(',')[0];
                toggleClearBtn(clearWhere, true);
                showPanel('when');
            }
        });
    });

    clearWhere.addEventListener('click', (e) => {
        e.stopPropagation();
        locationInput.value = '';
        locationResults.innerHTML = '';
        toggleClearBtn(clearWhere, false);
        locationPanel.classList.add('d-none');
    });

    // 2. Date Range Selection (Flatpickr)
    const datePickerInstance = flatpickr("#date-range-picker", {
        mode: "range",
        dateFormat: "Y-m-d",
        minDate: "today",
        showMonths: window.innerWidth < 768 ? 1 : 2,
        appendTo: document.querySelector('.hero-search-wrapper'),
        onOpen: function (selectedDates, dateStr, instance) {
            const wrapper = document.querySelector('.hero-search-wrapper');
            if (!wrapper) return;

            const rect = wrapper.getBoundingClientRect();
            const panelHeight = 500;
            const spaceBottom = window.innerHeight - rect.bottom;
            const spaceTop = rect.top - NAVBAR_HEIGHT;

            // If bottom space is tight AND top has more room
            if (spaceBottom < panelHeight && spaceTop > spaceBottom) {
                instance.calendarContainer.classList.add('flip-top-calendar');
            } else {
                instance.calendarContainer.classList.remove('flip-top-calendar');
            }
        },
        onReady: function(selectedDates, dateStr, instance) {
            // Initialize Select2 on the month dropdown for mobile views
            if (window.innerWidth < 768) {
                const $monthDropdowns = $(instance.calendarContainer).find('.flatpickr-monthDropdown-months');
                if ($monthDropdowns.length && $.fn.select2) {
                    $monthDropdowns.select2({
                        minimumResultsForSearch: Infinity,
                        dropdownParent: $(instance.calendarContainer),
                        width: 'auto'
                    });
                    
                    // Propagate Select2 changes back to Flatpickr
                    $monthDropdowns.on('select2:select', function (e) {
                        this.dispatchEvent(new Event('change'));
                    });
                }
            }
        },
        onMonthChange: function(selectedDates, dateStr, instance) {
            if (window.innerWidth < 768) {
                const $monthDropdowns = $(instance.calendarContainer).find('.flatpickr-monthDropdown-months');
                if ($monthDropdowns.length && $monthDropdowns.hasClass('select2-hidden-accessible')) {
                    $monthDropdowns.val(instance.currentMonth).trigger('change.select2');
                }
            }
        },
        onYearChange: function(selectedDates, dateStr, instance) {
            if (window.innerWidth < 768) {
                const $monthDropdowns = $(instance.calendarContainer).find('.flatpickr-monthDropdown-months');
                if ($monthDropdowns.length && $monthDropdowns.hasClass('select2-hidden-accessible')) {
                    $monthDropdowns.val(instance.currentMonth).trigger('change.select2');
                }
            }
        },
        onChange: function (selectedDates, dateStr, instance) {
            if (selectedDates.length === 2) {
                const start = instance.formatDate(selectedDates[0], "M d");
                const end = instance.formatDate(selectedDates[1], "M d");
                if (dateDisplay) {
                    dateDisplay.textContent = `${start} - ${end}`;
                    dateDisplay.classList.remove('text-muted');
                    dateDisplay.classList.add('text-dark', 'fw-bold');
                }
                toggleClearBtn(clearWhen, true);
                setTimeout(() => showPanel('who'), 300); // Auto-switch after selection
            }
        }
    });

    clearWhen.addEventListener('click', (e) => {
        e.stopPropagation();
        datePickerInstance.clear();
        dateDisplay.textContent = 'Add dates';
        dateDisplay.classList.add('text-muted');
        dateDisplay.classList.remove('text-dark', 'fw-bold');
        toggleClearBtn(clearWhen, false);
    });

    // 3. Guest Counter Logic
    const guestCounts = { adults: 0, children: 0, infants: 0, pets: 0 };
    document.querySelectorAll('.counter-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.stopPropagation();
            const type = btn.getAttribute('data-type');
            if (btn.classList.contains('plus')) {
                guestCounts[type]++;
            } else if (guestCounts[type] > 0) {
                guestCounts[type]--;
            }
            document.getElementById(`count-${type}`).textContent = guestCounts[type];
            updateGuestDisplay();
        });
    });

    function updateGuestDisplay() {
        const total = guestCounts.adults + guestCounts.children;
        const subTotal = total + guestCounts.infants + guestCounts.pets;
        toggleClearBtn(clearWho, subTotal > 0);

        if (total === 0) {
            guestDisplay.textContent = 'Add guests';
        } else {
            let text = `${total} guest${total > 1 ? 's' : ''}`;
            if (guestCounts.infants > 0) text += `, ${guestCounts.infants} infant${guestCounts.infants > 1 ? 's' : ''}`;
            guestDisplay.textContent = text;
        }
    }

    clearWho.addEventListener('click', (e) => {
        e.stopPropagation();
        Object.keys(guestCounts).forEach(k => {
            guestCounts[k] = 0;
            const countEl = document.getElementById(`count-${k}`);
            if (countEl) countEl.textContent = '0';
        });
        updateGuestDisplay();
        toggleClearBtn(clearWho, false);
        guestPanel.classList.add('d-none');
    });

    // --- Featured Offers Slider Initialization ---
    $('.offers-slider, .available-offers-slider').slick({
        dots: false,
        infinite: true,
        speed: 600,
        slidesToShow: 3,
        slidesToScroll: 1,
        prevArrow: '<button type="button" class="slick-prev shadow-sm d-flex align-items-center justify-content-center"><i class="bi bi-chevron-left"></i></button>',
        nextArrow: '<button type="button" class="slick-next shadow-sm d-flex align-items-center justify-content-center"><i class="bi bi-chevron-right"></i></button>',
        responsive: [
            {
                breakpoint: 1024,
                settings: {
                    slidesToShow: 2,
                    slidesToScroll: 1,
                    dots: false
                }
            },
            {
                breakpoint: 768,
                settings: {
                    slidesToShow: 1,
                    slidesToScroll: 1,
                    arrows: true,
                    dots: false
                }
            }
        ]
    });

    // --- Hall Booking Modal Functionality ---
    const bookingModal = document.getElementById('bookingModal');
    const hallNameDisplay = document.getElementById('selectedHallName');
    const hallCapacityDisplay = document.getElementById('selectedHallCapacity');
    const bookingForm = document.getElementById('hallBookingForm');

    // When modal is triggered, populate hall information
    if (bookingModal) {
        bookingModal.addEventListener('show.bs.modal', function (event) {
            const button = event.relatedTarget; // Button that triggered the modal
            const hallName = button.getAttribute('data-hall-name');
            const hallCapacity = button.getAttribute('data-hall-capacity');

            // Update modal content
            hallNameDisplay.textContent = hallName;
            hallCapacityDisplay.textContent = hallCapacity;
        });
    }

    // Initialize Flatpickr for event date
    if (document.getElementById('eventDate')) {
        flatpickr("#eventDate", {
            minDate: "today",
            dateFormat: "Y-m-d",
            disableMobile: true
        });
    }

    // Handle form submission
    if (bookingForm) {
        bookingForm.addEventListener('submit', function (e) {
            e.preventDefault();

            // Get form values
            const formData = {
                hallName: hallNameDisplay.textContent,
                hallCapacity: hallCapacityDisplay.textContent,
                eventDate: document.getElementById('eventDate').value,
                guestCount: document.getElementById('guestCount').value,
                startTime: document.getElementById('startTime').value,
                endTime: document.getElementById('endTime').value,
                customerName: document.getElementById('customerName').value,
                customerEmail: document.getElementById('customerEmail').value,
                customerPhone: document.getElementById('customerPhone').value,
                eventType: document.getElementById('eventType').value,
                specialRequests: document.getElementById('specialRequests').value
            };

            // Basic validation
            if (!formData.eventDate || !formData.guestCount || !formData.startTime ||
                !formData.endTime || !formData.customerName || !formData.customerEmail ||
                !formData.customerPhone || !formData.eventType) {
                alert('Please fill in all required fields.');
                return;
            }

            // Validate guest count doesn't exceed capacity
            if (parseInt(formData.guestCount) > parseInt(formData.hallCapacity)) {
                alert(`Guest count exceeds hall capacity of ${formData.hallCapacity} persons.`);
                return;
            }

            // Log booking data (in production, this would be sent to a server)
            console.log('Booking submitted:', formData);

            // Show success message
            alert(`Booking request submitted successfully!\n\nHall: ${formData.hallName}\nDate: ${formData.eventDate}\nTime: ${formData.startTime} - ${formData.endTime}\nGuests: ${formData.guestCount}\n\nWe'll contact you at ${formData.customerEmail} to confirm your booking.`);

            // Reset form and close modal
            bookingForm.reset();
            const modalInstance = bootstrap.Modal.getInstance(bookingModal);
            modalInstance.hide();
        });
    }
});

// --- 3D 360 Viewer Module ---
let panoramaViewer = null;

function open3DViewer(imageUrl, hallName) {
    const modalElement = document.getElementById('viewer3DModal');
    const modal = new bootstrap.Modal(modalElement);

    document.getElementById('viewerHallTitle').textContent = hallName + ' - 360° 3D View';

    modal.show();

    // Destroy previous instance if exists
    if (panoramaViewer) {
        panoramaViewer.destroy();
    }

    // Initialize Pannellum after a short delay to ensure modal is rendered
    setTimeout(() => {
        panoramaViewer = pannellum.viewer('panorama-container', {
            "type": "equirectangular",
            "panorama": imageUrl,
            "autoLoad": true,
            "autoRotate": -2,
            "showControls": true
        });
    }, 500);
}

// Ensure viewer is cleaned up when modal is closed
document.addEventListener('DOMContentLoaded', function () {
    const modalElement = document.getElementById('viewer3DModal');
    if (modalElement) {
        modalElement.addEventListener('hidden.bs.modal', function () {
            if (panoramaViewer) {
                panoramaViewer.destroy();
                panoramaViewer = null;
            }
        });
    }
});

// =============================================================
// --- Demo Auth State Management ---
// =============================================================
function updateNavbarAuthState() {
    const isLoggedIn = localStorage.getItem('ngh_logged_in') === 'true';
    const userName = localStorage.getItem('ngh_user_name') || 'Account';
    const userInitial = userName.charAt(0).toUpperCase();

    const authBtnWrapper = document.getElementById('auth-btn-wrapper');
    if (!authBtnWrapper) return;

    if (isLoggedIn) {
        authBtnWrapper.innerHTML = `
            <div class="dropdown">
                <button class="btn btn-primary rounded-pill btn-signup ms-3 d-flex align-items-center gap-2 px-3 py-2 text-white"
                    type="button" id="accountNavDropdown" data-bs-toggle="dropdown" aria-expanded="false" style="border:none;">
                    <i class="bi bi-person-circle fs-6"></i>
                    <span class="fw-medium">${userName}</span>
                    <i class="bi bi-chevron-down ms-1" style="font-size:0.75rem;"></i>
                </button>
                <ul class="dropdown-menu dropdown-menu-end shadow border-0 py-2 mt-3" aria-labelledby="accountNavDropdown" style="min-width:190px;border-radius:14px;">
                    <li class="px-3 pt-2 pb-3 border-bottom mb-1">
                        <div class="d-flex align-items-center">
                            <div style="width:38px;height:38px;background:linear-gradient(135deg,#f76156,#ff9a8b);color:#fff;border-radius:50%;display:flex;align-items:center;justify-content:center;font-weight:700;font-size:1rem;flex-shrink:0;">${userInitial}</div>
                            <div class="ms-2">
                                <div class="fw-bold" style="font-size:0.88rem;">${userName}</div>
                                <div class="text-muted" style="font-size:0.72rem;">NGH Member</div>
                            </div>
                        </div>
                    </li>
                    <li><a class="dropdown-item py-2 px-3" style="font-size:0.88rem;" href="account.html"><i class="bi bi-speedometer2 me-2 text-primary"></i>Dashboard</a></li>
                    <li><a class="dropdown-item py-2 px-3" style="font-size:0.88rem;" href="account.html?tab=bookings"><i class="bi bi-calendar-check me-2 text-primary"></i>My Bookings</a></li>
                    <li><a class="dropdown-item py-2 px-3" style="font-size:0.88rem;" href="account.html?tab=favorites"><i class="bi bi-heart me-2 text-danger"></i>Favorites</a></li>
                    <li><hr class="dropdown-divider my-1"></li>
                    <li><a class="dropdown-item py-2 px-3 text-danger" style="font-size:0.88rem;" href="#" id="signOutBtn"><i class="bi bi-box-arrow-right me-2"></i>Sign Out</a></li>
                </ul>
            </div>`;

        document.getElementById('signOutBtn')?.addEventListener('click', function(e) {
            e.preventDefault();
            localStorage.removeItem('ngh_logged_in');
            localStorage.removeItem('ngh_user_name');
            localStorage.removeItem('ngh_user_email');
            window.location.href = 'index.html';
        });
    } else {
        authBtnWrapper.innerHTML = `
            <div class="btn btn-primary rounded-pill btn-signup ms-3 d-flex align-items-center gap-1 p-0 overflow-hidden ps-3 pe-3">
                <a href="signup.html" class="text-white text-decoration-none px-1 py-2"><i class="bi bi-person-plus me-1"></i> Sign Up</a>
                <span class="text-white-50">|</span>
                <a href="signin.html" class="text-white text-decoration-none px-1 py-2"><i class="bi bi-box-arrow-in-right me-1"></i> Log In</a>
            </div>`;
    }
}

document.addEventListener('DOMContentLoaded', updateNavbarAuthState);

// =========================================================
// Mobile Off-Canvas Auth Section (mirrors desktop)
// =========================================================
function updateMobileAuthSection() {
    const isLoggedIn = localStorage.getItem('ngh_logged_in') === 'true';
    const userName = localStorage.getItem('ngh_user_name') || 'Account';
    const userInitial = userName.charAt(0).toUpperCase();
    const mobileAuthSection = document.getElementById('mobile-auth-section');
    const mobileSignOutItem = document.getElementById('mobile-signout-item');

    if (!mobileAuthSection) return;

    if (isLoggedIn) {
        mobileAuthSection.innerHTML = `
            <div class="d-flex align-items-center gap-3 py-1">
                <div style="width:42px;height:42px;background:linear-gradient(135deg,#f76156,#ff9a8b);color:#fff;border-radius:50%;display:flex;align-items:center;justify-content:center;font-weight:700;font-size:1.1rem;flex-shrink:0;">${userInitial}</div>
                <div>
                    <div class="fw-bold" style="font-size:0.9rem;">${userName}</div>
                    <div class="text-muted" style="font-size:0.75rem;">NGH Member</div>
                </div>
                <a href="account.html" class="mobile-dashboard-btn ms-auto">
                    <i class="bi bi-speedometer2"></i> Dashboard
                </a>
            </div>`;
        if (mobileSignOutItem) mobileSignOutItem.style.display = '';
        const mobileSignOutBtn = document.getElementById('mobileSignOut');
        if (mobileSignOutBtn) {
            mobileSignOutBtn.addEventListener('click', function(e) {
                e.preventDefault();
                localStorage.removeItem('ngh_logged_in');
                localStorage.removeItem('ngh_user_name');
                localStorage.removeItem('ngh_user_email');
                window.location.href = 'index.html';
            });
        }
    } else {
        mobileAuthSection.innerHTML = `
            <div class="row g-2">
                <div class="col-6">
                    <a href="signup.html" class="btn btn-primary rounded-pill w-100 btn-sm py-2">
                        <i class="bi bi-person-plus me-1"></i> Sign Up
                    </a>
                </div>
                <div class="col-6">
                    <a href="signin.html" class="btn btn-outline-secondary rounded-pill w-100 btn-sm py-2">
                        <i class="bi bi-box-arrow-in-right me-1"></i> Log In
                    </a>
                </div>
            </div>`;
        if (mobileSignOutItem) mobileSignOutItem.style.display = 'none';
    }
}

document.addEventListener('DOMContentLoaded', updateMobileAuthSection);

// =========================================================
// Mobile Search Modal Logic
// =========================================================
document.addEventListener('DOMContentLoaded', function() {
    const mobileSearchTrigger = document.getElementById('mobileSearchTrigger');
    const mobileSearchTriggerRooms = document.getElementById('mobileSearchTriggerRooms');
    const mobileSearchClose = document.getElementById('mobileSearchClose');
    const mobileSearchCloseRooms = document.getElementById('mobileSearchCloseRooms');

    function openSearchModal() {
        document.body.classList.add('search-modal-open');
    }

    function closeSearchModal() {
        document.body.classList.remove('search-modal-open');
    }

    if (mobileSearchTrigger) {
        mobileSearchTrigger.addEventListener('click', openSearchModal);
    }
    
    if (mobileSearchTriggerRooms) {
        mobileSearchTriggerRooms.addEventListener('click', openSearchModal);
    }

    if (mobileSearchClose) {
        mobileSearchClose.addEventListener('click', closeSearchModal);
    }
    
    if (mobileSearchCloseRooms) {
        mobileSearchCloseRooms.addEventListener('click', closeSearchModal);
    }
});
