/* ==========================================================================
   Rooms Page Interaction (Nice Guest House)
   ========================================================================== */

document.addEventListener('DOMContentLoaded', function() {
    const sidebar = document.querySelector('.filter-sidebar');
    const offcanvasFilterContent = document.getElementById('offcanvasFilterContent');
    const offcanvasFilter = document.getElementById('filterOffcanvas');

    // 1. Handle Responsive Filter (Move Sidebar to Offcanvas)
    function handleResponsiveFilters() {
        if (window.innerWidth < 992) {
            if (sidebar && offcanvasFilterContent && !offcanvasFilterContent.contains(sidebar)) {
                offcanvasFilterContent.appendChild(sidebar);
                sidebar.classList.remove('d-none');
            }
        } else {
            const aside = document.querySelector('aside.col-lg-3');
            if (sidebar && aside && !aside.contains(sidebar)) {
                aside.appendChild(sidebar);
                sidebar.classList.add('d-none', 'd-lg-block');
            }
        }
    }

    window.addEventListener('resize', handleResponsiveFilters);
    handleResponsiveFilters(); // Initial check

    // 2. Sync Mobile/Desktop Reset
    const resetMobile = document.getElementById('resetAllFiltersMobile');
    if (resetMobile) {
        resetMobile.onclick = () => {
            const resetDesktop = document.getElementById('resetAllFilters');
            if (resetDesktop) resetDesktop.click();
            bootstrap.Offcanvas.getInstance(offcanvasFilter).hide();
        };
    }

    // --- Initialization ---
    const itemsPerPage = 6;
    let currentPage = 1;
    let filteredCards = [];

    const roomCards = Array.from(document.querySelectorAll('.rooms-grid > div'));
    const initialOrder = [...roomCards]; // Preserve initial DOM order for 'newest' sort
    const paginationContainer = document.getElementById('rooms-pagination');
    const resultsCount = document.querySelector('.results-header strong');

    // Initialize Select2
    if (window.jQuery && $.fn.select2) {
        $('#sortRooms').select2({
            minimumResultsForSearch: Infinity,
            width: '180px'
        }).on('change', () => {
            sortCards();
            updateDisplay();
        });
    }

    // --- Helper: Normalize Rating to 10-point scale ---
    function getNormalizedRating(card) {
        // Extract numerical rating (e.g., "4.8" from "(4.8 · 85 reviews)")
        const reviewText = card.querySelector('.card-review-text')?.textContent || '(0.0 · 0 reviews)';
        const ratingMatch = reviewText.match(/\d+(\.\d+)?/);
        let val = ratingMatch ? parseFloat(ratingMatch[0]) : 0;
        
        // If the value is <= 5, we assume it's a 5-star scale and normalize to 10
        // (Unless it's explicitly 0.0 which stays 0)
        if (val > 0 && val <= 5.0) {
            return val * 2;
        }
        return val;
    }

    // --- Professional Dual-Handle Price Slider Logic ---
    const minRange = document.getElementById('minPriceRange');
    const maxRange = document.getElementById('maxPriceRange');
    const minInput = document.getElementById('minPriceInput');
    const maxInput = document.getElementById('maxPriceInput');
    const sliderTrack = document.querySelector('.slider-track');

    function updateSlider() {
        let minVal = parseInt(minRange.value);
        let maxVal = parseInt(maxRange.value);

        // Gap enforcement
        if (maxVal - minVal < 0) {
            if (this === minRange) minRange.value = maxVal;
            else maxRange.value = minVal;
        }

        minInput.value = minRange.value;
        maxInput.value = maxRange.value;
        
        // Update track background
        const minPercent = (minRange.value / minRange.max) * 100;
        const maxPercent = (maxRange.value / maxRange.max) * 100;
        
        if (sliderTrack) {
           sliderTrack.style.background = `linear-gradient(to right, #e9ecef ${minPercent}%, var(--primary-brand) ${minPercent}%, var(--primary-brand) ${maxPercent}%, #e9ecef ${maxPercent}%)`;
        }

        currentPage = 1;
        updateDisplay();
    }

    function updateFromInput() {
        let minVal = parseInt(minInput.value) || 0;
        let maxVal = parseInt(maxInput.value) || 1000;

        if (minVal > maxVal) {
            if (this === minInput) minVal = maxVal;
            else maxVal = minVal;
        }

        minRange.value = minVal;
        maxRange.value = maxVal;
        updateSlider();
    }

    if (minRange && maxRange) {
        minRange.addEventListener('input', updateSlider);
        maxRange.addEventListener('input', updateSlider);
        minInput.addEventListener('change', updateFromInput);
        maxInput.addEventListener('change', updateFromInput);
        updateSlider();
    }

    function matchesFilters(card, filters) {
        const badgeText = card.querySelector('.offer-badge')?.textContent.toLowerCase() || '';
        const typeText = card.getAttribute('data-room-type')?.toLowerCase() || '';
        const price = parseInt(card.getAttribute('data-price') || '0');
        const ratingValue = getNormalizedRating(card);
        const cardStars = Math.floor(ratingValue / 2);
        const hasOldPrice = !!card.querySelector('.price-old');

        const badgeMatch = filters.badges.length === 0 || filters.badges.some(b => badgeText.includes(b));
        const typeMatch = filters.types.length === 0 || filters.types.some(t => typeText.includes(t));
        const priceMatch = price >= filters.minPrice && price <= filters.maxPrice;
        const starMatch = filters.stars.length === 0 || filters.stars.includes(cardStars);
        const discountMatch = !filters.showDiscountOnly || hasOldPrice;

        return badgeMatch && typeMatch && priceMatch && starMatch && discountMatch;
    }

    function updateDisplay() {
        const filters = {
            badges: Array.from(document.querySelectorAll('input[id^="badge-"]:checked'))
                .map(cb => cb.id.replace('badge-', '').toLowerCase()),
            types: Array.from(document.querySelectorAll('input[id^="type-"]:checked'))
                .map(cb => cb.id.replace('type-', '').toLowerCase()),
            stars: Array.from(document.querySelectorAll('.rating-filter-item input:checked'))
                .map(cb => parseInt(cb.id.replace('review-', ''))),
            showDiscountOnly: document.getElementById('offer-discount')?.checked || false,
            minPrice: minRange ? parseInt(minRange.value) : 0,
            maxPrice: maxRange ? parseInt(maxRange.value) : 1000
        };

        // 1. Filter
        filteredCards = roomCards.filter(card => matchesFilters(card, filters));

        // 2. Update Filter Counts (Faceted Search Logic)
        updateFilterCounts(filters);

        // 3. Paginate & Render
        applyPagination();
    }

    function applyPagination() {
        const totalItems = filteredCards.length;
        const totalPages = Math.ceil(totalItems / itemsPerPage);
        if (currentPage > totalPages) currentPage = totalPages || 1;

        const start = (currentPage - 1) * itemsPerPage;
        const end = start + itemsPerPage;

        roomCards.forEach(card => card.classList.add('d-none'));
        filteredCards.slice(start, end).forEach(card => card.classList.remove('d-none'));

        if (resultsCount) resultsCount.textContent = totalItems;
        renderPagination(totalPages);
        init360Viewers(); // Re-initialize 360 viewers for newly displayed cards
    }

    function updateFilterCounts(activeFilters) {
        // If activeFilters is not provided, generate it from current state
        if (!activeFilters) {
            activeFilters = {
                badges: Array.from(document.querySelectorAll('input[id^="badge-"]:checked'))
                    .map(cb => cb.id.replace('badge-', '').toLowerCase()),
                types: Array.from(document.querySelectorAll('input[id^="type-"]:checked'))
                    .map(cb => cb.id.replace('type-', '').toLowerCase()),
                stars: Array.from(document.querySelectorAll('.rating-filter-item input:checked'))
                    .map(cb => parseInt(cb.id.replace('review-', ''))),
                showDiscountOnly: document.getElementById('offer-discount')?.checked || false,
                minPrice: minRange ? parseInt(minRange.value) : 0,
                maxPrice: maxRange ? parseInt(maxRange.value) : 1000
            };
        }

        // Helper to count matches when a specific category's filters are ignored
        const countForCategory = (categoryKey) => {
            const tempFilters = { ...activeFilters, [categoryKey]: [] };
            return (predicate) => roomCards.filter(card => matchesFilters(card, tempFilters) && predicate(card)).length;
        };

        // 1. Types (Ignore active type filters for counting types)
        const typeCounter = countForCategory('types');
        document.querySelectorAll('input[id^="type-"]').forEach(input => {
            const type = input.id.replace('type-', '');
            const count = typeCounter(c => c.getAttribute('data-room-type') === type);
            const countLabel = input.closest('.filter-item')?.querySelector('.count');
            if (countLabel) countLabel.textContent = count;
        });

        // 2. Badges (Ignore active badge filters for counting badges)
        const badgeCounter = countForCategory('badges');
        document.querySelectorAll('input[id^="badge-"]').forEach(input => {
            const badge = input.id.replace('badge-', '').replace(/-/g, ' ');
            const count = badgeCounter(c => c.querySelector('.offer-badge')?.textContent.toLowerCase().includes(badge));
            const countLabel = input.closest('.filter-item')?.querySelector('.count');
            if (countLabel) countLabel.textContent = count;
        });

        // 3. Stars (Ignore active star filters for counting stars)
        const starCounter = countForCategory('stars');
        document.querySelectorAll('.rating-filter-item input').forEach(input => {
            const star = parseInt(input.id.replace('review-', ''));
            const count = starCounter(c => Math.floor(getNormalizedRating(c) / 2) === star);
            const countLabel = input.closest('.filter-item')?.querySelector('.count');
            if (countLabel) countLabel.textContent = count;
        });

        // 4. Discount (Don't ignore discount filter here, or follow same logic if desired)
        const discountCounter = countForCategory('showDiscountOnly');
        const discountCount = discountCounter(c => !!c.querySelector('.price-old'));
        const discountLabel = document.getElementById('offer-discount')?.closest('.filter-item')?.querySelector('.count');
        if (discountLabel) discountLabel.textContent = discountCount;
    }

    function sortCards() {
        if (!window.jQuery) return;
        const sortBy = $('#sortRooms').val();
        roomCards.sort((a, b) => {
            if (sortBy === 'newest') {
                return initialOrder.indexOf(a) - initialOrder.indexOf(b);
            }

            const priceA = parseInt(a.getAttribute('data-price') || '0');
            const priceB = parseInt(b.getAttribute('data-price') || '0');
            
            const ratingA = getNormalizedRating(a);
            const ratingB = getNormalizedRating(b);

            if (sortBy === 'price-low') return priceA - priceB;
            if (sortBy === 'price-high') return priceB - priceA;
            if (sortBy === 'rating') return ratingB - ratingA;
            return 0;
        });
        
        const grid = document.querySelector('.rooms-grid');
        if (grid) {
            roomCards.forEach(c => grid.appendChild(c));
        }
    }

    function renderPagination(totalPages) {
        if (!paginationContainer) return;
        paginationContainer.innerHTML = '';
        if (totalPages <= 1) return;

        const createLink = (page, content, disabled = false, active = false) => {
            const li = document.createElement('li');
            li.className = `page-item ${disabled ? 'disabled' : ''} ${active ? 'active' : ''}`;
            li.innerHTML = `<a class="page-link" href="#">${content}</a>`;
            li.onclick = (e) => {
                e.preventDefault();
                if (!disabled && !active) {
                    currentPage = page;
                    updateDisplay();
                    window.scrollTo({ top: 300, behavior: 'smooth' });
                }
            };
            li.appendChild(li.querySelector('a')); // Redundant but ensures structure
            return li;
        };

        // Prev
        paginationContainer.appendChild(createLink(currentPage - 1, '<i class="bi bi-chevron-left"></i>', currentPage === 1));

        // Pages
        for (let i = 1; i <= totalPages; i++) {
            paginationContainer.appendChild(createLink(i, i, false, i === currentPage));
        }

        // Next
        paginationContainer.appendChild(createLink(currentPage + 1, '<i class="bi bi-chevron-right"></i>', currentPage === totalPages));
    }

    function init360Viewers() {
        // Re-bind click events to 360 buttons if they were AJAX/Dynamic
        // Since we are using onclick in HTML, we just need to ensure the viewer function is global
        // and the modal exists in the DOM (which we added to rooms.html)
    }

    // --- Interactive Star Filtering (Hidden Checkboxes) ---
    document.querySelectorAll('.rating-filter-item').forEach(item => {
        item.addEventListener('click', function(e) {
            const checkbox = this.querySelector('input[type="checkbox"]');
            const label = this.querySelector('label');
            
            // If we clicked the checkbox itself, let it handle its own state
            if (e.target === checkbox) return;
            
            // If we clicked the label or anything inside it (like stars), 
            // the browser will naturally toggle the checkbox via 'for' attribute.
            // We ONLY need to manually toggle if the click was on the item container but NOT the label.
            if (!label.contains(e.target)) {
                checkbox.checked = !checkbox.checked;
            }
            
            // Note: Since checkbox state might change AFTER this block (if label was clicked),
            // we use a small timeout or a 'change' listener on the checkbox for visual sync.
            // Better yet, let's just trigger a 'change' event manually if we toggled it.
            if (!label.contains(e.target)) {
                checkbox.dispatchEvent(new Event('change'));
            }
        });

        // Add change listener to handle visual 'active' class sync regardless of how it was toggled
        const checkbox = item.querySelector('input[type="checkbox"]');
        checkbox.addEventListener('change', function() {
            if (this.checked) item.classList.add('active');
            else item.classList.remove('active');
            
            currentPage = 1;
            updateDisplay();
        });
    });

    // Handle other checkboxes
    document.querySelectorAll('.filter-section input[type="checkbox"]').forEach(input => {
        if (input.closest('.rating-filter-item')) return; // Already handled
        input.addEventListener('change', () => {
            currentPage = 1;
            updateDisplay();
        });
    });

    // Reset All Filters
    const resetBtn = document.getElementById('resetAllFilters');
    if (resetBtn) {
        resetBtn.addEventListener('click', function(e) {
            e.preventDefault();
            document.querySelectorAll('.filter-sidebar input[type="checkbox"]').forEach(cb => {
                cb.checked = false;
                cb.closest('.rating-filter-item')?.classList.remove('active');
            });
            
            if (minRange && maxRange) {
                minRange.value = 0;
                maxRange.value = 1000;
                updateSlider();
            }
            
            currentPage = 1;
            updateDisplay();
        });
    }

    // Initial Display
    updateDisplay();
});
