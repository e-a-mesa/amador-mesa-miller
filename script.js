// 1. CONFIGURATION
const scriptURL = 'https://script.google.com/macros/s/AKfycbx6tElnpkrRjcnZ2mLjHQj8OzLrW0tKGDluIb6pWSfk-EwEV1u_3fPgKQQFDdtFGGtL/exec'; 

// 2. SELECT DOM ELEMENTS
const navbar = document.getElementById("navbar");
const langBtn = document.getElementById('langToggle');
const btnEnterEn = document.getElementById('enterEn');
const btnEnterEs = document.getElementById('enterEs');

// --- NAVBAR REVEAL & PARALLAX LOGIC ---
window.addEventListener('scroll', function() {
    const bg = document.getElementById('global-bg');
    const hero = document.querySelector('.hero-poster');
    const navbar = document.getElementById('navbar');
    
    if (bg && hero) {
        const scrollPosition = window.pageYOffset;
        const heroHeight = hero.offsetHeight;

        // 1. PARALLAX OPACITY LOGIC
        let opacityValue = 1 - (scrollPosition / heroHeight);
        if (opacityValue < 0.15) opacityValue = 0.15;
        if (opacityValue > 1) opacityValue = 1;
        bg.style.opacity = opacityValue;

        // 2. NAVBAR REVEAL LOGIC
        // "heroHeight - 100" means the menu slides down just before 
        // you finish scrolling past the hero.
        if (scrollPosition > (heroHeight - 100)) {
            navbar.classList.add('visible');
        } else {
            navbar.classList.remove('visible');
        }
    }
});

// --- LANGUAGE LOGIC ---
const storedLang = localStorage.getItem('weddingLang');
if (storedLang === 'es') {
    enableSpanish();
}

if (langBtn) {
    langBtn.addEventListener('click', function() {
        if (document.body.classList.contains('spanish-mode')) {
            disableSpanish();
        } else {
            enableSpanish();
        }
    });
}

if (btnEnterEn) {
    btnEnterEn.addEventListener('click', function() {
        disableSpanish();
        scrollToContent();
    });
}

if (btnEnterEs) {
    btnEnterEs.addEventListener('click', function() {
        enableSpanish();
        scrollToContent();
    });
}

function enableSpanish() {
    document.body.classList.add('spanish-mode');
    if(langBtn) langBtn.textContent = "ENGLISH";
    localStorage.setItem('weddingLang', 'es');
}

function disableSpanish() {
    document.body.classList.remove('spanish-mode');
    if(langBtn) langBtn.textContent = "ESPAÑOL";
    localStorage.setItem('weddingLang', 'en');
}

function scrollToContent() {
    const target = document.getElementById('location');
    if (!target) return;
    target.scrollIntoView({ behavior: 'smooth', block: 'start' });
}

// --- DYNAMIC RSVP FORM LOGIC ---

const stepNo = document.getElementById('rsvp-step-no');
const stepYes = document.getElementById('rsvp-step-yes');
const formYes = document.getElementById('form-yes');
const formNo = document.getElementById('form-no'); 
const containerGuests = document.getElementById('guest-rows-container');

// 1. Handle "Will you be attending?"
const btnNo = document.getElementById('btn-attending-no');
const btnYes = document.getElementById('btn-attending-yes');

if (btnNo) {
    btnNo.addEventListener('click', function() {
        stepNo.classList.remove('hidden');
        stepYes.classList.add('hidden');
        this.classList.add('active');
        if(btnYes) btnYes.classList.remove('active');
    });
}

if (btnYes) {
    btnYes.addEventListener('click', function() {
        stepYes.classList.remove('hidden');
        stepNo.classList.add('hidden');
        this.classList.add('active');
        if(btnNo) btnNo.classList.remove('active');
    });
}

// 2. Generate Guest Rows (Updated)
window.generateGuests = function(count) { 
    if (!formYes || !containerGuests) return;
    
    formYes.classList.remove('hidden');
    containerGuests.innerHTML = '';
    
    // Highlight the selected circle
    document.querySelectorAll('.btn-count').forEach(btn => btn.classList.remove('active'));
    if (window.event) {
        window.event.target.classList.add('active');
    }

    formYes.setAttribute('data-guest-count', count);

    for (let i = 1; i <= count; i++) {
        const rowHTML = `
            <div class="guest-block">
                <h5 class="guest-header">Guest ${i} / Invitado ${i}</h5>

                <div class="guest-row" id="guest-row-${i}">
                    <label class="sr-only" for="guest-${i}-name">Full Name / Nombre completo</label>
                    <input id="guest-${i}-name" type="text" class="input-name input-field" placeholder="Full Name / Nombre Completo" required>

                    <p class="input-label" id="guest-${i}-age-label">Age Group / Edad</p>
                    <div class="age-group" aria-labelledby="guest-${i}-age-label">
                        <label><input type="radio" name="guest_${i}_age" value="0-6"><span class="age-label">0-6</span></label>
                        <label><input type="radio" name="guest_${i}_age" value="7-12"><span class="age-label">7-12</span></label>
                        <label><input type="radio" name="guest_${i}_age" value="13-20"><span class="age-label">13-20</span></label>
                        <label><input type="radio" name="guest_${i}_age" value="21+" checked><span class="age-label">21+</span></label>
                    </div>

                    <label class="sr-only" for="guest-${i}-diet">Dietary Restrictions / Dieta</label>
                    <input id="guest-${i}-diet" type="text" class="input-diet input-field" placeholder="Dietary Restrictions / Dieta (Optional)" style="margin-top: 15px;">
                </div>
            </div>
        `;
        containerGuests.insertAdjacentHTML('beforeend', rowHTML);
    }
}

// 3. SUBMIT FORM (NO)
if (formNo) {
    formNo.addEventListener('submit', e => {
        e.preventDefault();
        const nameInput = formNo.querySelector('input[name="name_decline"]');
        const name = nameInput ? nameInput.value : "Unknown";
        
        submitToGoogle({
            attendance: "No",
            party_leader: name,
            guest_list: [] 
        }, formNo);
    });
}

// 4. SUBMIT FORM (YES)
if (formYes) {
    formYes.addEventListener('submit', e => {
        e.preventDefault();
        
        // --- NEW: Capture Contact Info ---
        const emailInput = formYes.querySelector('input[name="email"]');
        const phoneCode = formYes.querySelector('select[name="phone_code"]');
        const phoneNum = formYes.querySelector('input[name="phone_number"]');
        
        const email = emailInput ? emailInput.value : "";
        const phone_code = phoneCode ? phoneCode.value : "";
        const phone_number = phoneNum ? phoneNum.value : "";

        // --- Existing Guest Logic ---
        const count = formYes.getAttribute('data-guest-count');
        let guestList = []; 
        let mainName = ""; 

        for (let i = 1; i <= count; i++) {
            const row = document.getElementById(`guest-row-${i}`);
            if (row) {
                const nameInput = row.querySelector('.input-name');
                const name = nameInput ? nameInput.value : "";
                
                const dietInput = row.querySelector('.input-diet');
                const diet = dietInput ? dietInput.value : "None";
                
                const ageChecked = row.querySelector(`input[name="guest_${i}_age"]:checked`);
                const age = ageChecked ? ageChecked.value : "Unknown";

                if (i === 1) mainName = name; // First guest is the Party Leader

                guestList.push({
                    name: name,
                    age: age,
                    diet: diet
                });
            }
        }

        // Send everything to Google
        submitToGoogle({
            attendance: "Yes",
            party_leader: mainName,
            email: email,             // Added
            phone_code: phone_code,   // Added
            phone_number: phone_number, // Added
            guest_list: guestList 
        }, formYes);
    });
}

// 5. SEND TO GOOGLE FUNCTION (Enhanced)
function submitToGoogle(data, formElement) {
    const btn = formElement.querySelector('button[type="submit"]');
    const originalText = btn.innerText;
    btn.innerText = "SENDING...";
    btn.disabled = true;

    fetch(scriptURL, {
        method: 'POST',
        body: JSON.stringify(data),
        mode: 'no-cors' 
    })
    .then(response => {
        alert("Thank you! Your RSVP was submitted. If you need to make a change, email us at amador.mesa.miller@gmail.com. / ¡Gracias! Tu confirmación fue enviada. Si necesitas hacer un cambio, escríbenos a amador.mesa.miller@gmail.com.");
        
        // Reset Button
        btn.innerText = originalText;
        btn.disabled = false;

        // Reset the Forms
        formElement.reset();
        
        // Reset the UI State
        resetRSVPUI();
    })
    .catch(error => {
        console.error('Error!', error.message);
        alert("Something went wrong. Please email amador.mesa.miller@gmail.com to RSVP. / Algo salió mal. Por favor escríbenos a amador.mesa.miller@gmail.com para confirmar tu asistencia.");
        btn.innerText = originalText;
        btn.disabled = false;
    });
}

// Helper function to return RSVP to Step 1
function resetRSVPUI() {
    // Hide "Yes" and "No" steps
    stepNo.classList.add('hidden');
    stepYes.classList.add('hidden');
    formYes.classList.add('hidden');
    
    // Show Step 1
    const step1 = document.getElementById('rsvp-step-1');
    step1.classList.remove('hidden');

    // Remove active state from buttons
    if(btnNo) btnNo.classList.remove('active');
    if(btnYes) btnYes.classList.remove('active');
    
    // Clear dynamic guest rows
    if(containerGuests) containerGuests.innerHTML = '';
}

// =========================================
// ROOM BOOKING LOGIC
// =========================================

const bookingModal = document.getElementById('booking-modal');
const closeModalBtn = document.getElementById('close-modal');
const bookingForm = document.getElementById('booking-form');
let lastFocusedBtn = null;

function closeModal() {
    bookingModal.classList.add('hidden');
    if (lastFocusedBtn) lastFocusedBtn.focus();
}

// 1. Open Modal on Book button click (works on touch and keyboard)
document.querySelectorAll('.btn-book').forEach(btn => {
    btn.addEventListener('click', () => {
        const card = btn.closest('.room-card');
        const roomName = card.getAttribute('data-room');

        document.getElementById('modal-room-name').textContent = roomName;
        document.getElementById('hidden-room-name').value = roomName;

        lastFocusedBtn = btn;
        bookingModal.classList.remove('hidden');
        const firstFocusable = bookingModal.querySelector('button, input:not([type="hidden"])');
        if (firstFocusable) firstFocusable.focus();
    });
});

// 2. Close Modal
if(closeModalBtn) {
    closeModalBtn.addEventListener('click', closeModal);
}

// Close if clicking outside the box
if(bookingModal) {
    bookingModal.addEventListener('click', (e) => {
        if (e.target === bookingModal) closeModal();
    });
}

// Close modal on Escape key
document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && bookingModal && !bookingModal.classList.contains('hidden')) {
        closeModal();
    }
});

// 3. Apply room visibility from rooms-config.js
if (typeof ACTIVE_ROOMS !== 'undefined') {
    document.querySelectorAll('.room-card').forEach(card => {
        if (!ACTIVE_ROOMS.includes(card.dataset.room)) {
            card.style.display = 'none';
            card.classList.add('room-hidden');
        }
    });

    // Hide sections where every room card is inactive
    document.querySelectorAll('[id^="section-"]').forEach(section => {
        const allCards = section.querySelectorAll('.room-card');
        const hiddenCards = section.querySelectorAll('.room-hidden');
        if (allCards.length > 0 && allCards.length === hiddenCards.length) {
            section.style.display = 'none';
        }
    });
}

// 4. Submit Booking
if(bookingForm) {
    bookingForm.addEventListener('submit', e => {
        e.preventDefault();
        
        const btn = bookingForm.querySelector('button[type="submit"]');
        const originalText = btn.innerText;
        btn.innerText = "SENDING...";
        btn.disabled = true;

        const data = {
            submission_type: "booking", // Tells Google Script this is a room req
            room_name: bookingForm.room_name.value,
            contact_name: bookingForm.contact_name.value,
            contact_email: bookingForm.contact_email.value
        };

        fetch(scriptURL, {
            method: 'POST',
            body: JSON.stringify(data),
            mode: 'no-cors'
        })
        .then(() => {
            alert("Request submitted! We will follow up to confirm availability. / ¡Solicitud enviada! Te contactaremos para confirmar disponibilidad.");
            bookingModal.classList.add('hidden');
            bookingForm.reset();
            btn.innerText = originalText;
            btn.disabled = false;
        })
        .catch(error => {
            alert("Something went wrong. Please email amador.mesa.miller@gmail.com to request a room. / Algo salió mal. Por favor escríbenos a amador.mesa.miller@gmail.com para solicitar una habitación.");
            btn.innerText = originalText;
            btn.disabled = false;
        });
    });
}