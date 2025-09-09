function initCarousel(root) {


    const toggleBtn = root.querySelector('.dropdown-toggle');
    const panel = root.querySelector('.dropdown-panel');
    const track = root.querySelector('.carousel-track');

    const prevBtn = panel.querySelector('.carousel-btn.prev');
    const nextBtn = panel.querySelector('.carousel-btn.next');

    const AUTOPLAY_INTERVAL_MS = 3500;
    let autoplayTimer = null;
    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');

    let currentIndex = 0;
    let cardWidth = 0;
    let cards = [];

    function isPanelOpen() {
        return panel.classList.contains('active');
    }

    function startAutoPlay() {
        if (reducedMotion.matches || !isPanelOpen() || cards.length === 0) return;

        stopAutoPlay();

        autoplayTimer = setInterval(() => {
            if (!isPanelOpen() || reducedMotion.matches) {
                console.log('AUTOplay: STOP (closed or reduced-motion)');
                stopAutoPlay();
                return;
            }
            console.log('Autoplay: TICK -> goNext');
            goNext();
        }, AUTOPLAY_INTERVAL_MS);
    }

    function stopAutoPlay() {
        if (autoplayTimer !== null) {
            clearInterval(autoplayTimer);
            autoplayTimer = null;
        }
    }


    function measure() {

        cards = Array.from(track.querySelectorAll('.card'));
        if (cards.length === 0) return;


        const first = cards[0];
        const styles = window.getComputedStyle(first);
        const marginLeft = parseFloat(styles.marginLeft) || 0;
        const marginRight = parseFloat(styles.marginRight) || 0;
        cardWidth = first.getBoundingClientRect().width + marginLeft + marginRight;


        const viewport = root.querySelector('.carousel-viewport');
        if (viewport && cards[0]) {
            const inner = cards[0].getBoundingClientRect().width;
            //viewport.style.width = `${inner}px`
        }


        currentIndex = Math.max(0, Math.min(currentIndex, cards.length - 1));
        updateCarousel();
    }

    toggleBtn.addEventListener('click', () => {
        panel.classList.toggle('active');

        const isOpen = panel.classList.contains('active');
        toggleBtn.setAttribute('aria-expanded', String(isOpen));
        panel.hidden = !isOpen;

        const baseLabel = toggleBtn.dataset.label || toggleBtn.textContent.replace(/[▴▾]/g, '').trim();
        toggleBtn.dataset.label = baseLabel;

        toggleBtn.textContent = isOpen ? `${baseLabel} ▴` : `${baseLabel} ▾`;

        if (isOpen) {
            measure();
            startAutoPlay();
        } else {
            stopAutoPlay();
        }
    });



    function goNext() {
        if (cards.length === 0) return;
        currentIndex = (currentIndex + 1) % cards.length;
        updateCarousel();
    }

    function goPrev() {
        if (cards.length === 0) return;
        currentIndex = (currentIndex - 1 + cards.length) % cards.length;
        updateCarousel();
    }

    function updateCarousel() {
        const offset = -(currentIndex * cardWidth);
        track.style.transform = `translateX(${offset}px)`;
    }

    window.addEventListener('resize', measure);


    if (nextBtn) nextBtn.addEventListener('click', goNext);
    if (prevBtn) prevBtn.addEventListener('click', goPrev);


    document.addEventListener('keydown', (e) => {
        if (!panel.classList.contains('active')) return;
        if (e.key === 'ArrowRight') goNext();
        if (e.key === 'ArrowLeft') goPrev();
    });

    function afterImagesLoad() {
        measure();
        if (isPanelOpen()) startAutoPlay();
    }

    if (document.readyState === 'complete') {
        afterImagesLoad();
    } else {
        window.addEventListener('load', afterImagesLoad);
    }

    panel.addEventListener('mouseenter', stopAutoPlay);
    panel.addEventListener('mouseleave', () => {
        startAutoPlay();
    });

    panel.addEventListener('focusin', stopAutoPlay);
    panel.addEventListener('focusout', () => {
        if (!panel.contains(document.activeElement)) startAutoPlay();
    });

    document.addEventListener('visibilitychange', () => {
        if (document.hidden) {
            stopAutoPlay();
        } else {
            startAutoPlay();
        }
    });

    reducedMotion.addEventListener('change', () => {
        if (reducedMotion.matches) {
            stopAutoPlay();
        } else {
            startAutoPlay();
        }
    });
}

document.querySelectorAll('.carousel-widget').forEach(initCarousel);