/* ==========================================================================
   Room Details Interaction Logic
   ========================================================================== */

document.addEventListener('DOMContentLoaded', function() {
    
    // 1. Initialize Date Range Picker (Flatpickr)
    const dateInput = document.getElementById('booking-dates');
    const nightCountEl = document.getElementById('nightCount');
    const basePrice = 299; // Mock base price

    const bookingCard = document.querySelector('.booking-card');

    const datePicker = flatpickr(dateInput, {
        mode: "range",
        minDate: "today",
        dateFormat: "Y-m-d",
        showMonths: window.innerWidth < 768 ? 1 : 2,
        appendTo: bookingCard,
        positionElement: dateInput,
        position: "above",
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
        onChange: function(selectedDates, dateStr, instance) {
            if (selectedDates.length === 2) {
                const diffTime = Math.abs(selectedDates[1] - selectedDates[0]);
                const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
                
                if (nightCountEl) {
                    nightCountEl.textContent = diffDays;
                }
            }
        }
    });

    // 2. Guest Counter Logic (Sidebar)
    const guestDisplay = document.getElementById('guestDisplaySidebar');
    const counters = {
        adults: 2,
        children: 0,
        infants: 0,
        pets: 0
    };

    document.querySelectorAll('.booking-card .counter-btn').forEach(btn => {
        btn.addEventListener('click', function(e) {
            e.stopPropagation();
            e.preventDefault();
            const type = this.getAttribute('data-type');
            const isPlus = this.classList.contains('plus');
            
            if (isPlus) {
                counters[type]++;
            } else if (counters[type] > (type === 'adults' ? 1 : 0)) {
                counters[type]--;
            }

            // Update UI
            const countEl = document.getElementById(`count-${type}-sidebar`);
            if (countEl) countEl.textContent = counters[type];
            
            updateGuestText();
        });
    });

    function updateGuestText() {
        const total = counters.adults + counters.children;
        let text = `${total} guest${total > 1 ? 's' : ''}`;
        if (counters.infants > 0) {
            text += `, ${counters.infants} infant${counters.infants > 1 ? 's' : ''}`;
        }
        if (counters.pets > 0) {
            text += `, ${counters.pets} pet${counters.pets > 1 ? 's' : ''}`;
        }
        if (guestDisplay) {
            guestDisplay.textContent = text;
        }
    }

    // 3. Form Submission Mock
    const bookingForm = document.getElementById('bookingFormSidebar');
    if (bookingForm) {
        bookingForm.addEventListener('submit', function(e) {
            e.preventDefault();
            alert('Booking request sent successfully! We will contact you shortly.');
        });
    }

    // 4. Reviews Tab Auto-scroll
    const reviewsTabLink = document.getElementById('reviews-tab-link');
    const reviewsSection = document.querySelector('.reviews-section');
    
    if (reviewsTabLink && reviewsSection) {
        reviewsTabLink.addEventListener('click', function(e) {
            e.preventDefault();
            const offset = 100; // Account for fixed navbar
            const bodyRect = document.body.getBoundingClientRect().top;
            const elementRect = reviewsSection.getBoundingClientRect().top;
            const elementPosition = elementRect - bodyRect;
            const offsetPosition = elementPosition - offset;

            window.scrollTo({
                top: offsetPosition,
                behavior: 'smooth'
            });
        });
    }

    // 5. Review Modal Management
    const showMoreReviewsBtn = document.getElementById('showMoreReviews');
    const reviewModalEl = document.getElementById('reviewModal');
    
    if (showMoreReviewsBtn && reviewModalEl) {
        const reviewModal = new bootstrap.Modal(reviewModalEl);
        showMoreReviewsBtn.addEventListener('click', function() {
            reviewModal.show();
        });
    }

    // 6. Initialize Related Rooms Carousel (Slick Slider)
    const $slider = $('.related-rooms-slider');
    if ($slider.length) {
        $slider.slick({
            dots: false,
            infinite: true,
            speed: 500,
            slidesToShow: 4,
            slidesToScroll: 1,
            prevArrow: $('.slider-prev'),
            nextArrow: $('.slider-next'),
            responsive: [
                {
                    breakpoint: 1200,
                    settings: {
                        slidesToShow: 3
                    }
                },
                {
                    breakpoint: 992,
                    settings: {
                        slidesToShow: 2
                    }
                },
                {
                    breakpoint: 576,
                    settings: {
                        slidesToShow: 1
                    }
                }
            ]
        });
    }

    // 7. Initialize Room Gallery Zooming (PhotoSwipe v5)
    const initZoomGallery = () => {
        if (window.PhotoSwipeLightbox) {
            const lightbox = new PhotoSwipeLightbox({
                gallery: '#room-gallery',
                children: '.gallery-link',
                pswpModule: window.PhotoSwipe,
                padding: { top: 20, bottom: 20, left: 20, right: 20 }
            });
            lightbox.init();

            const openGalleryBtn = document.getElementById('openMainGallery');
            if (openGalleryBtn) {
                openGalleryBtn.addEventListener('click', function(e) {
                    e.preventDefault();
                    lightbox.loadAndOpen(0);
                });
            }
        } else {
            setTimeout(initZoomGallery, 50);
        }
    };
    initZoomGallery();
});
