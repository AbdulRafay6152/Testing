/* =========================================================
   ARTÉ — 3D GALLERY ENGINE
========================================================= */

// DOM Elements
const gallery = document.querySelector(".gallery");
const carousel = document.querySelector(".carousel");
const cards = Array.from(document.querySelectorAll(".art-card"));
const previousButton = document.getElementById("previousButton");
const nextButton = document.getElementById("nextButton");
const currentNumber = document.getElementById("currentNumber");
const totalNumber = document.getElementById("totalNumber");
const activeCategory = document.getElementById("activeCategory");

const globalRipple = document.getElementById("globalRipple");
const liquidDistortion = document.getElementById("liquidDistortion");

const artViewer = document.getElementById("artViewer");
const viewerClose = document.getElementById("viewerClose");
const viewerImage = document.getElementById("viewerImage");
const viewerTitle = document.getElementById("viewerTitle");
const viewerArtist = document.getElementById("viewerArtist");
const viewerCategory = document.getElementById("viewerCategory");
const viewerPrice = document.getElementById("viewerPrice");
const viewerDescription = document.getElementById("viewerDescription");

const aboutSection = document.getElementById("aboutSection");
const contactForm = document.getElementById("contactForm");
const formStatus = document.getElementById("formStatus");

// Carousel State
const totalCards = cards.length;
let activeIndex = 0;
let isAnimating = false;
let viewerOpen = false;

// Initialization
totalNumber.textContent = String(totalCards).padStart(2, "0");

/* =========================================================
   POSITIONING HELPERS
========================================================= */
function normalizeIndex(index) {
    if (index < 0) return totalCards - 1;
    if (index >= totalCards) return 0;
    return index;
}

function getRelativePosition(cardIndex) {
    let difference = cardIndex - activeIndex;
    if (difference > totalCards / 2) difference -= totalCards;
    if (difference < -totalCards / 2) difference += totalCards;
    return difference;
}

/* =========================================================
   CAROUSEL RENDERING
========================================================= */
function updateCarousel(animate = true) {
    const isMobile = window.innerWidth <= 800;
    
    // Dynamic settings for responsive 3D spatial layout
    const SIDE_DISTANCE = isMobile ? 180 : 370;
    const SIDE_SCALE = isMobile ? 0.78 : 0.82;
    const SIDE_ROTATION = isMobile ? 22 : 35;

    cards.forEach((card, index) => {
        const position = getRelativePosition(index);

        card.style.transition = animate 
            ? "transform 2500ms cubic-bezier(0.16, 1, 0.3, 1), opacity 650ms ease, filter 500ms ease" 
            : "none";

        if (position === 0) {
            // CENTER CARD
            card.style.transform = `translate3d(-50%, -50%, ${isMobile ? 120 : 250}px) rotateY(0deg) scale(1)`;
            card.style.opacity = "1";
            card.style.zIndex = "30";
            card.style.pointerEvents = "auto";
            card.style.filter = "none";
        } else if (position === 1) {
            // RIGHT CARD
            card.style.transform = `translate3d(calc(-50% + ${SIDE_DISTANCE}px), -50%, 0px) rotateY(-${SIDE_ROTATION}deg) scale(${SIDE_SCALE})`;
            card.style.opacity = "0.75";
            card.style.zIndex = "20";
            card.style.pointerEvents = "auto";
            card.style.filter = "none";
        } else if (position === -1) {
            // LEFT CARD
            card.style.transform = `translate3d(calc(-50% - ${SIDE_DISTANCE}px), -50%, 0px) rotateY(${SIDE_ROTATION}deg) scale(${SIDE_SCALE})`;
            card.style.opacity = "0.75";
            card.style.zIndex = "20";
            card.style.pointerEvents = "auto";
            card.style.filter = "none";
        } else {
            // HIDDEN CARDS
            const direction = position > 0 ? 1 : -1;
            const distance = Math.min(Math.abs(position), 3);
            card.style.transform = `translate3d(calc(-50% + ${direction * (isMobile ? 350 : 650)}px), -50%, ${-distance * 300}px) rotateY(${direction * -55}deg) scale(0.55)`;
            card.style.opacity = "0";
            card.style.zIndex = "1";
            card.style.pointerEvents = "none";
            card.style.filter = "blur(4px)";
        }
    });

    updateInformation();
}

function updateInformation() {
    const activeCard = cards[activeIndex];
    currentNumber.textContent = String(activeIndex + 1).padStart(2, "0");
    activeCategory.textContent = activeCard.dataset.category.toUpperCase();
}

/* =========================================================
   HOVER & NAVIGATION ACTIONS
========================================================= */
function clearHover() {
    gallery.classList.remove("has-hover");
    cards.forEach(card => card.classList.remove("hovered"));
}

function goToCard(newIndex) {
    if (isAnimating || viewerOpen) return;
    newIndex = normalizeIndex(newIndex);
    if (newIndex === activeIndex) return;

    isAnimating = true;
    clearHover();
    activeIndex = newIndex;
    updateCarousel(true);

    setTimeout(() => {
        isAnimating = false;
    }, 900);
}

function nextCard() { goToCard(activeIndex + 1); }
function previousCard() { goToCard(activeIndex - 1); }

nextButton.addEventListener("click", nextCard);
previousButton.addEventListener("click", previousCard);

/* =========================================================
   HOVER ISOLATION HANDLERS
========================================================= */
cards.forEach(card => {
    card.addEventListener("mouseenter", () => {
        if (isAnimating || viewerOpen) return;
        const position = getRelativePosition(Number(card.dataset.index));
        if (Math.abs(position) <= 1) {
            gallery.classList.add("has-hover");
            card.classList.add("hovered");
        }
    });

    card.addEventListener("mouseleave", () => {
        card.classList.remove("hovered");
        setTimeout(() => {
            if (!document.querySelector(".art-card:hover")) {
                gallery.classList.remove("has-hover");
            }
        }, 30);
    });
});

/* =========================================================
   CARD CLICK & RIPPLE TRANSITION ENGINE
========================================================= */
cards.forEach(card => {
    card.addEventListener("click", event => {
        if (isAnimating || viewerOpen) return;

        const index = Number(card.dataset.index);
        const position = getRelativePosition(index);

        if (position === 1) {
            createMiniCardRipple(card, event);
            setTimeout(nextCard, 80);
            return;
        }

        if (position === -1) {
            createMiniCardRipple(card, event);
            setTimeout(previousCard, 80);
            return;
        }

        if (position === 0) {
            triggerCenterCardOpeningSequence(card, event);
        }
    });
});

function createMiniCardRipple(card, event) {
    const container = card.querySelector(".ripple-container");
    container.querySelectorAll(".ripple").forEach(r => r.remove());

    const rect = card.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;

    const ripple = document.createElement("span");
    ripple.className = "ripple";
    ripple.style.left = `${x}px`;
    ripple.style.top = `${y}px`;

    container.appendChild(ripple);
    ripple.addEventListener("animationend", () => ripple.remove());
}

/* =========================================================
   SIGNATURE INTERACTION (RIPPLE -> PAUSE -> 3D EXPANSION)
========================================================= */
function triggerCenterCardOpeningSequence(card, event) {
    isAnimating = true;
    viewerOpen = true;
    clearHover();

    // 1. Detect click coordinates
    const clickX = event.clientX;
    const clickY = event.clientY;

    globalRipple.style.setProperty("--ripple-x", `${clickX}px`);
    globalRipple.style.setProperty("--ripple-y", `${clickY}px`);

    // 2. Read datasets directly from HTML (No JS hardcoding)
    const img = card.querySelector(".card-image img");
    viewerImage.src = img.src;
    viewerImage.alt = img.alt;
    viewerTitle.textContent = card.dataset.title;
    viewerArtist.textContent = card.dataset.artist;
    viewerCategory.textContent = (card.dataset.category || "EXHIBITION").toUpperCase();
    viewerPrice.textContent = card.dataset.price || "P.O.A.";
    viewerDescription.textContent = card.dataset.description || "A curated piece from the ARTÉ visual collection.";

    // 3. Reset and trigger single liquid glass ripple behind card
    globalRipple.classList.remove("active");
    liquidDistortion.classList.remove("active");
    void globalRipple.offsetWidth; // Force Reflow

    globalRipple.classList.add("active");
    setTimeout(() => liquidDistortion.classList.add("active"), 150);

    // 4. Ripple travels and finishes (~1.35s)
    setTimeout(() => {
        globalRipple.classList.remove("active");
        liquidDistortion.classList.remove("active");
    }, 1350);

    // 5. Short pause, then 3D Card Expansion (~1.85s mark)
    setTimeout(() => {
        execute3DCardExpansion(card);
    }, 1850);
}

function execute3DCardExpansion(card) {
    card.classList.add("opening");

    // Perform True 3D Z-axis movement towards viewer
    card.style.transform = `translate3d(-50%, -50%, 600px) scale(1.28) rotateY(0deg)`;

    setTimeout(() => {
        artViewer.classList.add("open");
    }, 350);

    setTimeout(() => {
        card.classList.remove("opening");
        updateCarousel(false);
        isAnimating = false;
    }, 1400);
}

function closeArtwork() {
    if (!viewerOpen) return;
    artViewer.classList.remove("open");
    viewerOpen = false;

    setTimeout(() => {
        updateCarousel(true);
        isAnimating = false;
    }, 600);
}

viewerClose.addEventListener("click", closeArtwork);

/* =========================================================
   NAVIGATION LINKS & ABOUT PANEL
========================================================= */
const navLinks = document.querySelectorAll(".nav-link");

navLinks.forEach(link => {
    link.addEventListener("click", () => {
        const section = link.dataset.section;
        navLinks.forEach(item => item.classList.remove("active"));
        link.classList.add("active");

        if (section === "about") {
            gallery.classList.add("about-open");
            clearHover();
        } else {
            gallery.classList.remove("about-open");
        }
    });
});

/* =========================================================
   CONTACT FORM
========================================================= */
contactForm.addEventListener("submit", event => {
    event.preventDefault();
    formStatus.textContent = "Thank you. Your message has been sent to our curatorial team.";
    contactForm.reset();
});

/* =========================================================
   KEYBOARD & TOUCH CONTROLS
========================================================= */
document.addEventListener("keydown", event => {
    if (event.key === "Escape") {
        if (viewerOpen) {
            closeArtwork();
        } else {
            gallery.classList.remove("about-open");
            navLinks.forEach(l => l.classList.remove("active"));
            document.querySelector('[data-section="gallery"]').classList.add("active");
        }
    }

    if (!viewerOpen && !gallery.classList.contains("about-open")) {
        if (event.key === "ArrowRight") nextCard();
        if (event.key === "ArrowLeft") previousCard();
    }
});

let touchStartX = 0;
let touchEndX = 0;

carousel.addEventListener("touchstart", e => {
    touchStartX = e.changedTouches[0].screenX;
}, { passive: true });

carousel.addEventListener("touchend", e => {
    touchEndX = e.changedTouches[0].screenX;
    const diff = touchEndX - touchStartX;
    if (Math.abs(diff) < 40) return;
    if (diff < 0) nextCard();
    else previousCard();
}, { passive: true });

let wheelLocked = false;
carousel.addEventListener("wheel", e => {
    e.preventDefault();
    if (wheelLocked || viewerOpen) return;
    wheelLocked = true;

    if (e.deltaY > 0) nextCard();
    else previousCard();

    setTimeout(() => { wheelLocked = false; }, 850);
}, { passive: false });

/* =========================================================
   RANDOM 3D SCATTER & ASSEMBLY ENGINE
========================================================= */

// Unique dynamic scatter coordinates for each card
const scatterTransforms = [
    "translate3d(-180vw, -120vh, 800px) rotateY(-110deg) rotateX(45deg) rotateZ(-30deg) scale(0.2)",
    "translate3d(160vw, -140vh, 600px) rotateY(120deg) rotateX(-60deg) rotateZ(40deg) scale(0.25)",
    "translate3d(-140vw, 150vh, -500px) rotateY(-80deg) rotateX(90deg) rotateZ(-60deg) scale(0.15)",
    "translate3d(180vw, 110vh, 900px) rotateY(140deg) rotateX(-45deg) rotateZ(35deg) scale(0.3)",
    "translate3d(-110vw, -160vh, -800px) rotateY(-90deg) rotateX(-80deg) rotateZ(80deg) scale(0.2)",
    "translate3d(130vw, 170vh, 700px) rotateY(100deg) rotateX(70deg) rotateZ(-45deg) scale(0.25)"
];

function applyScatter() {
    cards.forEach((card, index) => {
        card.classList.add("is-scattered");
        const transformStr = scatterTransforms[index % scatterTransforms.length];
        card.style.transform = transformStr;
        card.style.opacity = "0";
        card.style.filter = "blur(15px)";
    });
}

function assembleGallery() {
    // Apply initial scattered positioning
    applyScatter();

    // Small timeout for browser reflow, then assemble
    setTimeout(() => {
        document.body.classList.add("loaded");
        cards.forEach(card => card.classList.remove("is-scattered"));
        updateCarousel(true);
    }, 150);
}

// Trigger scatter animation when user refreshes or leaves page
window.addEventListener("beforeunload", () => {
    document.body.classList.remove("loaded");
    document.body.classList.add("unloading");
    applyScatter();
});

window.addEventListener("resize", () => updateCarousel(false));

// Initialize assembly sequence on load
document.addEventListener("DOMContentLoaded", assembleGallery);

/* =========================================================
   ABOUT BACK BUTTON CLICK HANDLER
========================================================= */
const aboutBackBtn = document.getElementById("aboutBackBtn");

function closeAboutPage() {
    gallery.classList.remove("about-open");
    
    // Reset active state to Gallery in header nav
    navLinks.forEach(l => l.classList.remove("active"));
    const galleryNavLink = document.querySelector('[data-section="gallery"]');
    if (galleryNavLink) galleryNavLink.classList.add("active");
}

if (aboutBackBtn) {
    aboutBackBtn.addEventListener("click", closeAboutPage);
}