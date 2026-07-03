# Wedding Website Expansion Roadmap

This file captures the next planned improvements for Rachel & Ernesto's wedding website so a future ChatGPT project chat can continue implementation without needing the prior conversation.

Walter is Rachel & Ernesto's dog.

## Purpose

The current site is a static HTML/CSS/vanilla JavaScript wedding website. The next round of work should expand the site from a simple RSVP/accommodations site into a more complete guest hub while preserving the current visual direction: elegant, warm, romantic, simple, nature/Vermont-inspired, and bilingual English/Spanish.

## Planned improvements

1. Add a simple password gate.
2. Improve the Travel Information section.
3. Expand the Schedule with more event detail, descriptions, and timing.
4. Create a new Things To Do page.
5. Create a new Registry page and add a homepage card linking to it.

## Recommended final site structure

```text
index.html       Main guest dashboard
rooms.html       Available accommodations + room request form
things.html      Things to do around Hill Farm / Manchester / Southern Vermont
registry.html    Registry links
style.css        Shared styles
script.js        Language toggle, RSVP, Google Apps Script submissions, room modal, password gate
CNAME            Custom GitHub Pages domain
```

Recommended homepage flow:

```text
Hero
Schedule
Stay
Travel
Weekend Details cards
FAQ
RSVP
Footer
```

Recommended guest journey:

```text
When is everything? -> Schedule
Where should I stay? -> Stay / Rooms
How do I get there? -> Travel
What can I do nearby? -> Things To Do
Where is the registry? -> Registry
Can I RSVP? -> RSVP
```

## Navigation recommendation

Current navigation should be updated to support the expanded site.

Suggested English navigation:

```text
Schedule | Stay | Travel | Things To Do | Registry | FAQ | RSVP
```

Suggested Spanish navigation:

```text
Evento | Hospedaje | Viaje | Qué hacer | Regalos | FAQ | RSVP
```

Mobile note: after adding the two new links, test the nav at narrow phone widths. If it feels crowded, keep only the most important anchors in the nav and use homepage cards for Things To Do and Registry.

Possible simpler mobile-friendly nav:

```text
Schedule | Stay | Travel | FAQ | RSVP
```

with Things To Do and Registry shown as prominent cards in the body.

---

# 1. Password gate

## Goal

Add a light privacy gate that asks guests to enter a shared wedding password before viewing the site.

This is common for wedding websites and is acceptable for casual guest privacy. It is not true security because the site is static and the password can be found in the HTML/JavaScript by someone technical.

## Important caveat

Because the site is hosted as static files, the password gate should be treated as a courtesy privacy screen, not as protection for sensitive information.

Do not put truly sensitive information in the site source, including:

- Private addresses not intended for guests
- Bank details
- Cash transfer handles
- Private phone numbers
- Private guest lists
- Sensitive pricing or room data
- Anything that would be a problem if someone viewed the source code

## Recommended behavior

The password gate should:

- Appear on all guest-facing pages.
- Ask for the password from the invitation.
- Support English and Spanish.
- Store successful unlock status in `localStorage`.
- Let guests unlock once and continue browsing.
- Be keyboard-accessible.
- Show a clear error message if the password is wrong.
- Avoid looking overly technical or intimidating.
- Work without adding dependencies.

Pages to gate:

```text
index.html
rooms.html
things.html
registry.html
```

Also remove, rename, or gate:

```text
draft.html
```

## Recommended copy

English:

```text
Welcome! Please enter the password from your invitation.
```

Spanish:

```text
Bienvenidos. Por favor ingresa la clave de la invitación.
```

Button copy:

```text
Enter / Entrar
```

Error copy:

```text
That password did not work. Please check your invitation and try again.
Esa clave no funcionó. Por favor revisa tu invitación e inténtalo de nuevo.
```

## Suggested HTML hook

Add a class to the `<body>` element on every gated page.

For `index.html`:

```html
<body class="site-locked">
```

For pages that already have a background/body class:

```html
<body class="bg-offwhite site-locked">
```

## Suggested metadata

Add to the `<head>` of all guest-facing pages:

```html
<meta name="robots" content="noindex, nofollow">
```

This does not guarantee search engines will never index the site, but it is a good basic privacy signal.

## Suggested implementation approach

Add shared password gate markup dynamically in `script.js` so it does not need to be repeated in every HTML file.

Implementation concept:

```js
const SITE_PASSWORD = 'replace-with-real-password';
const PASSWORD_STORAGE_KEY = 'weddingSiteUnlocked';

function initPasswordGate() {
    const lockedPage = document.body.classList.contains('site-locked');
    if (!lockedPage) return;

    const alreadyUnlocked = localStorage.getItem(PASSWORD_STORAGE_KEY) === 'true';
    if (alreadyUnlocked) {
        document.body.classList.remove('site-locked');
        return;
    }

    const gate = document.createElement('div');
    gate.className = 'password-gate';
    gate.innerHTML = `
        <div class="password-card">
            <h1>Rachel & Ernesto</h1>
            <p class="lang-en">Welcome! Please enter the password from your invitation.</p>
            <p class="lang-es">Bienvenidos. Por favor ingresa la clave de la invitación.</p>

            <form id="passwordForm">
                <label for="sitePassword" class="sr-only">Password / Clave</label>
                <input id="sitePassword" type="password" autocomplete="current-password" placeholder="Password / Clave" required>
                <button type="submit">Enter / Entrar</button>
                <p id="passwordError" class="password-error" hidden>
                    That password did not work. Please check your invitation and try again.
                </p>
            </form>
        </div>
    `;

    document.body.appendChild(gate);

    const form = document.getElementById('passwordForm');
    const input = document.getElementById('sitePassword');
    const error = document.getElementById('passwordError');

    input.focus();

    form.addEventListener('submit', function(event) {
        event.preventDefault();

        if (input.value.trim() === SITE_PASSWORD) {
            localStorage.setItem(PASSWORD_STORAGE_KEY, 'true');
            gate.remove();
            document.body.classList.remove('site-locked');
        } else {
            error.hidden = false;
            input.value = '';
            input.focus();
        }
    });
}

document.addEventListener('DOMContentLoaded', initPasswordGate);
```

Before finalizing, choose the actual password. Do not use a password that would create problems if a curious guest found it in source code.

## Suggested CSS

Add to `style.css`:

```css
.site-locked > *:not(.password-gate) {
    display: none;
}

.password-gate {
    position: fixed;
    inset: 0;
    z-index: 9999;
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 24px;
    background: var(--color-cream);
}

.password-card {
    width: min(100%, 440px);
    padding: 40px 28px;
    text-align: center;
    background: rgba(255, 255, 255, 0.88);
    border: 1px solid rgba(61, 80, 52, 0.16);
    box-shadow: 0 20px 60px rgba(0, 0, 0, 0.12);
}

.password-card h1 {
    margin-bottom: 18px;
}

.password-card input {
    width: 100%;
    margin-top: 18px;
    padding: 14px 16px;
    border: 1px solid rgba(61, 80, 52, 0.28);
    font: inherit;
}

.password-card button {
    width: 100%;
    margin-top: 14px;
    padding: 14px 16px;
    border: 0;
    cursor: pointer;
    background: var(--color-green);
    color: white;
    font: inherit;
    letter-spacing: 0.08em;
    text-transform: uppercase;
}

.password-error {
    margin-top: 14px;
    color: #8a2f2f;
    font-size: 0.95rem;
}
```

If `var(--color-cream)` or `var(--color-green)` do not exist in the actual CSS, use the closest existing site color variables or values.

## Password gate QA checklist

- Password appears on first visit.
- Wrong password shows an error.
- Correct password unlocks the page.
- Refreshing after unlock keeps the site open.
- Opening `rooms.html`, `things.html`, and `registry.html` after unlock does not ask again.
- Private/incognito mode asks again.
- Keyboard users can tab into the input and button.
- Escape key is not required to use the gate.
- Spanish mode does not break the gate.
- The gate works on mobile Safari and Chrome.

---

# 2. Travel Information update

## Goal

Make the Travel section more useful for guests by organizing it around travel decisions instead of broad transportation categories.

The section should answer:

- What is the easiest airport?
- Should guests rent a car?
- What should international guests consider?
- Is there a train or bus option?
- Where exactly is the venue?
- What link should guests use for directions?

## Recommended layout

Keep the Travel section on `index.html`, but turn it into a structured guide.

Suggested section title:

English:

```text
Travel Information
```

Spanish:

```text
Información de Viaje
```

Suggested intro copy:

English:

```text
Most guests will find it easiest to rent a car, especially if they want to explore Manchester or the surrounding area during the weekend. For guests who prefer not to drive the full way, train and bus options are also available.
```

Spanish:

```text
Para la mayoría de los invitados, lo más fácil será alquilar un carro, especialmente si quieren explorar Manchester o los alrededores durante el fin de semana. Para quienes prefieran no manejar todo el trayecto, también hay opciones de tren y bus.
```

## Recommended travel cards

Use three main cards:

| Card | Purpose |
|---|---|
| Flying into Albany | Best domestic/regional option for many guests |
| International routes | Helpful for guests traveling from Colombia or abroad |
| Train + bus option | Useful for guests who prefer not to drive the full way |

## Suggested card structure

Each card should include:

```text
Best for:
What to book:
Notes:
Links:
```

## Suggested English copy

### Card 1: Flying into Albany

```text
Flying into Albany

Best for: Guests flying domestically or connecting through a U.S. hub.

What to book: A flight to Albany International Airport, then a rental car to Hill Farm.

Notes: This is likely the simplest route for many guests. A car will also make it easier to explore Manchester and the surrounding area during the weekend.
```

### Card 2: International routes

```text
International Routes

Best for: Guests traveling from Colombia or outside the United States.

What to book: Flights into Boston, New York City, or another major U.S. hub, then a connecting flight, rental car, train, or bus toward Southern Vermont.

Notes: If you are flying internationally, compare total travel time carefully. The cheapest flight may not be the easiest route once ground transportation is included.
```

### Card 3: Train + bus option

```text
Train + Bus Option

Best for: Guests who prefer not to drive the full way.

What to book: Train service to Albany-Rensselaer, then bus or local transportation toward Manchester / Sunderland.

Notes: Please check current schedules before booking. Rural transportation can be limited, especially later in the day.
```

### Driving directions card

```text
Driving Directions

Hill Farm Inn
458 Hill Farm Rd
Sunderland, VT 05250

Use the map link below for the most up-to-date directions.
```

## Suggested Spanish copy

### Card 1: Flying into Albany

```text
Vuelos a Albany

Ideal para: Invitados que viajan dentro de Estados Unidos o hacen conexión por una ciudad estadounidense.

Qué reservar: Un vuelo al Aeropuerto Internacional de Albany y luego un carro de alquiler hasta Hill Farm.

Notas: Probablemente sea la ruta más sencilla para muchos invitados. Tener carro también hará más fácil explorar Manchester y los alrededores durante el fin de semana.
```

### Card 2: International routes

```text
Rutas internacionales

Ideal para: Invitados que viajan desde Colombia o desde fuera de Estados Unidos.

Qué reservar: Vuelos a Boston, Nueva York u otra ciudad principal de Estados Unidos, y luego una conexión, carro de alquiler, tren o bus hacia el sur de Vermont.

Notas: Si viajas internacionalmente, compara bien el tiempo total del viaje. El vuelo más barato no siempre es la ruta más fácil cuando se incluye el transporte por tierra.
```

### Card 3: Train + bus option

```text
Opción de tren y bus

Ideal para: Invitados que prefieren no manejar todo el camino.

Qué reservar: Tren hasta Albany-Rensselaer y luego bus o transporte local hacia Manchester / Sunderland.

Notas: Por favor revisa los horarios actuales antes de reservar. El transporte rural puede ser limitado, especialmente más tarde en el día.
```

### Driving directions card

```text
Direcciones

Hill Farm Inn
458 Hill Farm Rd
Sunderland, VT 05250

Usa el enlace del mapa para ver las direcciones más actualizadas.
```

## Useful official links to include

Use external links with:

```html
target="_blank" rel="noopener noreferrer"
```

Potential links:

```text
Hill Farm Inn official site
Google Maps directions to Hill Farm Inn
Albany International Airport
Amtrak Albany-Rensselaer Station
Vermont Translines Manchester Center stop / schedules
Manchester, Vermont visitor site
```

When adding final links, verify all URLs shortly before launch.

## Travel section QA checklist

- Travel cards are clear on mobile.
- Spanish and English versions are aligned in meaning.
- External links open safely with `rel="noopener noreferrer"`.
- There are no placeholder `href="#"` links.
- The section does not promise exact travel times unless those have been verified.
- Guests can easily find the venue address.
- International guests have enough context to compare routes.

---

# 3. Expanded Schedule

## Goal

Update the schedule from simple day cards into a more detailed weekend guide with timing, locations, event descriptions, and practical notes.

Guests should be able to answer:

- What events are happening each day?
- What time does each event start?
- Where is each event?
- What should I wear?
- Will food/drinks be served?
- Are kids included?
- Do I need transportation?

## Recommended section ID

If currently using:

```html
<section id="location" class="section-pad">
```

consider renaming to:

```html
<section id="schedule" class="section-pad">
```

Then update all nav links from:

```html
href="#location"
```

to:

```html
href="#schedule"
```

This is clearer and more maintainable.

## Recommended format

Keep the current three-day layout, but make each day card a mini timeline.

Possible structure:

```text
Friday, September 25
- Welcome Party
- Time
- Location
- Description
- Attire / notes

Saturday, September 26
- Ceremony
- Cocktail Hour
- Reception
- After-party or late-night gathering, if applicable

Sunday, September 27
- Breakfast / Brunch
- Goodbyes
```

## Suggested HTML pattern

```html
<div class="schedule-day schedule-day-detail">
    <span class="day-date lang-en">FRIDAY, SEPTEMBER 25</span>
    <span class="day-date lang-es">VIERNES, 25 DE SEPTIEMBRE</span>

    <div class="event-list">
        <div class="event-item">
            <p class="event-time">[Time]</p>

            <h4 class="lang-en">Welcome Party</h4>
            <h4 class="lang-es">Fiesta de Bienvenida</h4>

            <p class="lang-en">Join us for an informal welcome gathering to start the weekend.</p>
            <p class="lang-es">Acompáñanos en una reunión informal para empezar el fin de semana.</p>

            <p class="event-note lang-en">Attire: [casual / comfortable / TBD]</p>
            <p class="event-note lang-es">Vestimenta: [casual / cómoda / por confirmar]</p>
        </div>
    </div>
</div>
```

## Suggested schedule content placeholders

Do not guess final event details. Replace bracketed items only when confirmed.

### Friday

English:

```text
Friday, September 25

Welcome Gathering
[Time]
[Location]

Join us for a relaxed welcome gathering to start the weekend with family and friends.

Attire: [TBD]
Food & drinks: [TBD]
```

Spanish:

```text
Viernes, 25 de septiembre

Encuentro de Bienvenida
[Hora]
[Lugar]

Acompáñanos en un encuentro relajado para empezar el fin de semana con familia y amigos.

Vestimenta: [Por confirmar]
Comida y bebidas: [Por confirmar]
```

### Saturday

English:

```text
Saturday, September 26

Ceremony
[Time]
[Location]

Cocktail Hour
[Time]
[Location]

Reception
[Time]
[Location]

Attire: [TBD]
Transportation: [TBD]
```

Spanish:

```text
Sábado, 26 de septiembre

Ceremonia
[Hora]
[Lugar]

Cóctel
[Hora]
[Lugar]

Recepción
[Hora]
[Lugar]

Vestimenta: [Por confirmar]
Transporte: [Por confirmar]
```

### Sunday

English:

```text
Sunday, September 27

Farewell Breakfast / Brunch
[Time]
[Location]

Stop by before heading home so we can say goodbye and thank you for celebrating with us.

Attire: Casual
```

Spanish:

```text
Domingo, 27 de septiembre

Desayuno / Brunch de Despedida
[Hora]
[Lugar]

Pasa a saludarnos antes de volver a casa para despedirnos y agradecerte por celebrar con nosotros.

Vestimenta: Casual
```

## Spanish formatting notes

Use accent marks:

```text
SÁBADO
Sábado
Cóctel
Recepción
Qué
Sí
```

Prefer natural Spanish date formatting:

```text
Sábado, 26 de septiembre
```

instead of:

```text
Sábado Septiembre 26
```

## Schedule QA checklist

- No event time is guessed.
- All TBD items are intentional and acceptable for launch, or are removed until confirmed.
- English and Spanish schedule versions are aligned.
- Event cards are readable on mobile.
- Guests can tell whether each event is formal, casual, family-friendly, indoor, outdoor, or weather-dependent.
- If transportation matters, it is clearly stated.
- If an event is invite-only, this is handled carefully and clearly.

---

# 4. Things To Do page

## Goal

Create a curated page of things to do around Hill Farm, Manchester, and Southern Vermont for guests who have free time during the wedding weekend.

New file:

```text
things.html
```

## Recommended approach

Use `rooms.html` as the starting template because it already includes the shared nav, fixed header, language toggle, typography, and page styling.

Process:

1. Copy `rooms.html`.
2. Rename the copy to `things.html`.
3. Remove room-specific cards, modal code, and room request content.
4. Keep the nav, language toggle, shared footer, and page layout.
5. Add curated things-to-do content.
6. Confirm `script.js` does not assume room elements exist on every page.

## Homepage link

Replace the current placeholder activity copy with a real link to the new page.

Suggested English copy:

```text
We put together a few ideas for things to do around Hill Farm and Manchester if you have extra time during the weekend.
```

Suggested Spanish copy:

```text
Preparamos algunas ideas de cosas para hacer cerca de Hill Farm y Manchester si tienes tiempo libre durante el fin de semana.
```

Suggested button:

```html
<a href="things.html" class="btn-outline">
    <span class="lang-en">Things To Do</span>
    <span class="lang-es">Qué Hacer</span>
</a>
```

## Recommended page title

English:

```text
Things To Do
```

Spanish:

```text
Qué Hacer
```

Intro copy:

English:

```text
If you have extra time during the weekend, here are a few ideas for exploring Hill Farm, Manchester, and Southern Vermont.
```

Spanish:

```text
Si tienes tiempo libre durante el fin de semana, aquí tienes algunas ideas para disfrutar Hill Farm, Manchester y el sur de Vermont.
```

## Recommended categories

Keep this page curated and guest-friendly. Around 8 to 12 total recommendations is probably enough.

Suggested sections:

| Section | Purpose |
|---|---|
| At Hill Farm | Easy on-property activities |
| Around Manchester | Coffee, shopping, restaurants, relaxed local outings |
| Outdoors | Scenic drives, hikes, foliage, short walks |
| Rainy Day / Kid-Friendly | Indoor or family-friendly options |
| Food & Drinks | Casual meals, coffee, reservations notes |

## Recommended card structure

Each recommendation card should include:

```text
Name
Short description
Best for: quick stop / outdoors / kids / rainy day / food / shopping
Area or approximate distance
Button to official site or map
```

Suggested card HTML pattern:

```html
<article class="detail-card">
    <span class="card-kicker lang-en">Outdoors</span>
    <span class="card-kicker lang-es">Aire libre</span>

    <h3 class="lang-en">[Place Name]</h3>
    <h3 class="lang-es">[Nombre del lugar]</h3>

    <p class="lang-en">[Short guest-friendly description.]</p>
    <p class="lang-es">[Descripción breve y útil para invitados.]</p>

    <p class="card-note lang-en">Best for: [quick stop / kids / rainy day]</p>
    <p class="card-note lang-es">Ideal para: [parada rápida / niños / día de lluvia]</p>

    <a href="[URL]" class="btn-text" target="_blank" rel="noopener noreferrer">
        <span class="lang-en">Visit Website -></span>
        <span class="lang-es">Ver Sitio -></span>
    </a>
</article>
```

## Candidate content categories

Do not add final recommendations without verifying links, hours, and suitability close to launch.

Potential ideas:

### At Hill Farm

- Walking trails
- Porch / relaxing at the inn
- Pool, if seasonal and available
- Game room
- Garden
- Farm animals, if guest-accessible
- Lawn games
- River loop trail, if guest-accessible

### Around Manchester

- Coffee
- Restaurants
- Local shops
- Manchester visitor area
- Casual lunch spots

### Outdoors

- Scenic drives
- Short hikes
- Fall foliage routes
- Dorset / Manchester trails

### Rainy day / kid-friendly

- Museums
- Indoor activities
- Pinball / arcade-style stop
- Bookstores / shops

### Food & drinks

- Breakfast / brunch spots
- Casual lunch
- Dinner reservation suggestions
- Coffee

## Things To Do QA checklist

- No recommendation is included without a working link.
- Hours and seasonal availability are checked close to launch.
- The page does not overwhelm guests with too many options.
- Cards are organized by guest need, not just alphabetically.
- English and Spanish content are aligned.
- External links include `rel="noopener noreferrer"`.
- Distances/times are not over-specific unless verified.
- Kid-friendly claims are verified or phrased carefully.
- On-property activities are confirmed with Hill Farm before launch.

---

# 5. Registry page

## Goal

Create a simple, warm, bilingual page with wedding registry links.

New file:

```text
registry.html
```

## Tone

The registry should be easy to find but not feel overly prominent. The tone should communicate that guests' presence is the most important gift.

## Homepage card copy

English:

```text
Registry

Your presence is the best gift. For those who have asked, we've shared our registry links here.
```

Spanish:

```text
Regalos

Su presencia es el mejor regalo. Para quienes nos han preguntado, dejamos aquí los enlaces.
```

Button:

```text
View Registry / Ver Regalos
```

## Registry page intro

English:

```text
Your presence at our wedding is truly the gift. If you would like to celebrate with something extra, you can find our registry links below.
```

Spanish:

```text
Su presencia en nuestra boda es realmente el mejor regalo. Si quieren celebrar con algo adicional, pueden encontrar nuestros enlaces de regalos abajo.
```

Alternative, slightly warmer Spanish:

```text
El mejor regalo es poder celebrar con ustedes. Para quienes nos han preguntado, dejamos aquí nuestros enlaces de regalos.
```

## Recommended page structure

```text
Registry
Intro copy
Registry card grid
Return to homepage link
```

## Recommended registry card structure

Each card should include:

```text
Registry/store name
Short description, if useful
External button
```

Suggested card HTML pattern:

```html
<article class="detail-card registry-card">
    <h3>[Registry Name]</h3>
    <p class="lang-en">[Optional short description.]</p>
    <p class="lang-es">[Descripción breve opcional.]</p>

    <a href="[REGISTRY_URL]" class="btn-outline" target="_blank" rel="noopener noreferrer">
        <span class="lang-en">Open Registry</span>
        <span class="lang-es">Ver Regalos</span>
    </a>
</article>
```

## Registry privacy note

Avoid putting sensitive details directly in source code.

Do not include:

- Bank account information
- Private addresses
- Personal phone numbers
- Cash transfer handles unless intentionally public
- Any information that should not be visible in page source

If using cash funds or honeymoon funds, link to the official registry/fund page rather than listing payment details directly.

## Registry QA checklist

- All registry links work.
- External links open in a new tab and use `rel="noopener noreferrer"`.
- Registry page is gated by the password screen.
- Registry page has `noindex, nofollow`.
- Spanish copy feels natural, not overly literal.
- No sensitive payment or address information appears directly in the HTML.
- Homepage card links to `registry.html`.
- Nav link works in both English and Spanish mode.

---

# 6. New homepage card section

## Goal

Add a section to the homepage that links guests to the new supporting pages without cluttering the nav or overwhelming the RSVP flow.

Recommended placement:

```text
Between Travel and FAQ
```

Suggested section ID:

```html
<section id="guest-details" class="section-pad bg-offwhite">
```

## Suggested HTML

```html
<section id="guest-details" class="section-pad bg-offwhite">
    <div class="container">
        <span class="section-subtitle lang-en">Weekend Details</span>
        <span class="section-subtitle lang-es">Detalles del Fin de Semana</span>

        <h2 class="lang-en">Plan Your Weekend</h2>
        <h2 class="lang-es">Planea Tu Fin de Semana</h2>

        <div class="link-card-grid">
            <a href="rooms.html" class="link-card">
                <h3 class="lang-en">Stay</h3>
                <h3 class="lang-es">Hospedaje</h3>

                <p class="lang-en">See available accommodations and request a room.</p>
                <p class="lang-es">Consulta las opciones disponibles y solicita una reserva.</p>
            </a>

            <a href="things.html" class="link-card">
                <h3 class="lang-en">Things To Do</h3>
                <h3 class="lang-es">Qué Hacer</h3>

                <p class="lang-en">A few ideas for exploring Hill Farm, Manchester, and Southern Vermont.</p>
                <p class="lang-es">Algunas ideas para disfrutar Hill Farm, Manchester y el sur de Vermont.</p>
            </a>

            <a href="registry.html" class="link-card">
                <h3 class="lang-en">Registry</h3>
                <h3 class="lang-es">Regalos</h3>

                <p class="lang-en">For those who have asked, our registry links are here.</p>
                <p class="lang-es">Para quienes nos han preguntado, aquí están los enlaces.</p>
            </a>
        </div>
    </div>
</section>
```

## Suggested CSS

Adapt to existing site variables/classes as needed.

```css
.link-card-grid {
    display: grid;
    grid-template-columns: repeat(3, minmax(0, 1fr));
    gap: 24px;
    margin-top: 36px;
}

.link-card {
    display: block;
    padding: 32px 28px;
    text-decoration: none;
    color: inherit;
    background: rgba(255, 255, 255, 0.72);
    border: 1px solid rgba(61, 80, 52, 0.16);
    transition: transform 0.2s ease, box-shadow 0.2s ease;
}

.link-card:hover,
.link-card:focus-visible {
    transform: translateY(-3px);
    box-shadow: 0 18px 40px rgba(0, 0, 0, 0.08);
}

.link-card h3 {
    margin-bottom: 12px;
}

.link-card p {
    margin-bottom: 0;
}

@media (max-width: 800px) {
    .link-card-grid {
        grid-template-columns: 1fr;
    }
}
```

## Homepage card QA checklist

- Cards are keyboard-focusable.
- Cards have visible focus state.
- Cards stack cleanly on mobile.
- Cards do not duplicate the nav in a confusing way.
- Rooms, Things To Do, and Registry links work.
- Spanish labels are short enough not to break layout.

---

# 7. Recommended implementation order

## Phase 1: Privacy and structure

1. Add password gate to all guest-facing pages.
2. Add `noindex, nofollow` to all guest-facing pages.
3. Remove, rename, or gate `draft.html`.
4. Confirm existing pages still load correctly after adding the gate.

## Phase 2: New page scaffolding

1. Create `things.html` from the existing page template.
2. Create `registry.html` from the existing page template.
3. Update nav links across all pages.
4. Add homepage cards linking to Rooms, Things To Do, and Registry.
5. Confirm the language toggle works on all pages.

## Phase 3: Content upgrades

1. Expand the homepage schedule.
2. Rewrite the travel section.
3. Fill in Things To Do recommendations.
4. Add registry links and final registry copy.

## Phase 4: Launch QA

1. Test all pages on mobile.
2. Test password gate.
3. Test English/Spanish toggle.
4. Test RSVP form.
5. Test room request form.
6. Test modal behavior on `rooms.html`.
7. Check all external links.
8. Check for placeholders like `href="#"`, `[TBD]`, and commented-out sensitive content.
9. Confirm no private information is exposed in page source.
10. Confirm `draft.html` is not publicly deployed unless intentionally gated.

---

# 8. Open questions to confirm

Do not guess these details. Ask Rachel & Ernesto or confirm from final wedding materials.

## Password gate

- What should the shared password be?
- Should the password appear on the invitation?
- Should Spanish-speaking guests receive the same password?

## Travel

- Is Albany the preferred airport to recommend?
- Should Boston or NYC be recommended for international guests?
- Are shuttle, rideshare, or carpool options being arranged?
- Are guests expected to rent cars?
- Should the travel section include Colombia-specific guidance?
- Are there any routes guests should avoid?

## Schedule

- Final event times
- Final event locations
- Dress code / attire
- Food and drink availability by event
- Whether children are included at each event
- Transportation details
- Weather/rain plan language
- Whether any event is invite-only

## Things To Do

- Which activities are actually available during the wedding weekend?
- Which on-property Hill Farm amenities are available to wedding guests?
- Are there kid-friendly recommendations?
- Are there rainy day recommendations?
- Should restaurants be listed, and if so, should reservations be recommended?

## Registry

- Which registry links should be included?
- Preferred tone: more formal, casual, or playful?
- Should cash/honeymoon fund links be included?
- Should the registry page be in the main nav or only linked from a homepage card?

---

# 9. Suggested prompt for a future chat

Use this prompt in a new project chat:

```text
Please use WEDDING_WEBSITE_EXPANSION_ROADMAP.md and WEDDING_WEBSITE_LAUNCH_AUDIT.md as context. I want to implement the next improvements to Rachel & Ernesto's wedding website. Start by reviewing the repo files, then help me make targeted static HTML/CSS/vanilla JS changes in this order: password gate, new things.html and registry.html pages, homepage cards, travel section rewrite, and expanded schedule. Keep the design elegant, warm, bilingual, mobile-friendly, accessible, and simple.
```

---

# 10. Regression test checklist

Use this after each implementation round.

## General site

- `index.html` loads without console errors.
- `rooms.html` loads without console errors.
- `things.html` loads without console errors.
- `registry.html` loads without console errors.
- Navigation links work from every page.
- Footer links and text are correct.
- The CNAME file remains unchanged unless intentionally updating the domain.

## Password gate

- First-time visitor sees the gate.
- Correct password unlocks.
- Incorrect password shows an error.
- Unlock state persists between pages.
- Gate does not block form submission after unlock.
- Gate is usable by keyboard.
- Gate is usable on mobile.

## Language toggle

- English mode shows English content.
- Spanish mode shows Spanish content.
- Toggle works on every page.
- Newly added content has both English and Spanish versions.
- Spanish accents are correct.

## RSVP

- RSVP form still submits.
- Required fields still validate.
- Success/error messages still show.
- No-cors limitation is understood and copy does not overpromise confirmed server receipt.

## Rooms

- Room cards still display.
- Booking modal still opens.
- Booking modal still closes.
- Room request form still submits.
- Room page works on mobile.
- Keyboard users can access booking actions.

## Travel

- No placeholder travel links.
- All external links work.
- Directions address is correct.
- Travel guidance does not overstate exact times or guarantees.

## Schedule

- All confirmed times are accurate.
- No accidental `[TBD]` remains unless intentional.
- English and Spanish content match.
- Event attire, location, and transportation details are clear.

## Things To Do

- All links work.
- Recommendations are current.
- Hours/seasonality are checked before launch.
- Cards are concise and not overwhelming.

## Registry

- All registry links work.
- External links use `rel="noopener noreferrer"`.
- No private payment/address details appear directly in source.
- Registry page is password gated.

## Accessibility and mobile

- Page can be navigated with keyboard.
- Focus states are visible.
- Forms have labels.
- Color contrast is acceptable.
- Cards stack properly on mobile.
- Nav does not overlap content.
- Tap targets are comfortable on mobile.
