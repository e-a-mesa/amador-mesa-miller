// 1. CONFIGURATION
const scriptURL = 'https://script.google.com/macros/s/AKfycbx6tElnpkrRjcnZ2mLjHQj8OzLrW0tKGDluIb6pWSfk-EwEV1u_3fPgKQQFDdtFGGtL/exec'; 

// 2. SELECT DOM ELEMENTS
const navbar = document.getElementById("navbar");
const langBtn = document.getElementById('langToggle');
const btnEnterEn = document.getElementById('enterEn');
const btnEnterEs = document.getElementById('enterEs');

// --- SCROLL LOCK LOGIC ---
const navOffset = navbar ? navbar.offsetTop : 0; 

if (navbar) {
    window.addEventListener('scroll', function() {
        if (window.pageYOffset >= navOffset) {
            navbar.classList.add("fixed-mode");
            document.body.style.paddingTop = navbar.offsetHeight + "px";
        } else {
            navbar.classList.remove("fixed-mode");
            document.body.style.paddingTop = 0;
        }
    });
}

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
    const yOffset = -20; 
    if (navbar) {
        const y = navbar.getBoundingClientRect().top + window.pageYOffset + yOffset;
        window.scrollTo({top: y, behavior: 'smooth'});
    }
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

// 2. Generate Guest Rows
window.generateGuests = function(count) { 
    if (!formYes || !containerGuests) return;
    
    formYes.classList.remove('hidden');
    containerGuests.innerHTML = '';
    
    document.querySelectorAll('.btn-count').forEach(btn => btn.classList.remove('active'));
    if (window.event) {
        window.event.target.classList.add('active');
    }

    formYes.setAttribute('data-guest-count', count);

    for (let i = 1; i <= count; i++) {
        const rowHTML = `
            <div class="guest-row" id="guest-row-${i}">
                <input type="text" class="input-name input-field" placeholder="Guest ${i} Name / Nombre" required>
                <div class="age-group">
                    <label><input type="radio" name="guest_${i}_age" value="0-6"><span class="age-label">0-6</span></label>
                    <label><input type="radio" name="guest_${i}_age" value="7-12"><span class="age-label">7-12</span></label>
                    <label><input type="radio" name="guest_${i}_age" value="13-20"><span class="age-label">13-20</span></label>
                    <label><input type="radio" name="guest_${i}_age" value="21+" checked><span class="age-label">21+</span></label>
                </div>
                <input type="text" class="input-diet input-field" placeholder="Dietary Restrictions / Dieta" style="flex:1;">
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

                if (i === 1) mainName = name;

                guestList.push({
                    name: name,
                    age: age,
                    diet: diet
                });
            }
        }

        submitToGoogle({
            attendance: "Yes",
            party_leader: mainName,
            guest_list: guestList 
        }, formYes);
    });
}

// 5. SEND TO GOOGLE FUNCTION
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
        alert("Thank you! Your RSVP has been sent. / ¡Gracias! Tu confirmación ha sido enviada.");
        btn.innerText = "SENT / ENVIADO";
        formElement.reset();
    })
    .catch(error => {
        console.error('Error!', error.message);
        alert("Something went wrong. Please try again.");
        btn.innerText = originalText;
        btn.disabled = false;
    });
}