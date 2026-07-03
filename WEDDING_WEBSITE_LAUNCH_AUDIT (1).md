# Wedding Website Launch Audit and Handoff

Repo: `amador-mesa-miller-main`  
Project: Rachel & Ernesto wedding website  
Context note: Walter is Rachel & Ernesto's dog. References to Walter may be intentional, but should be checked for guest-facing clarity.

This file summarizes the initial repo review and is meant to help a new chat in this ChatGPT project continue the work without needing to re-discover the same issues.

## How to use this file in a new chat

Suggested prompt:

```text
Please use the attached WEDDING_WEBSITE_LAUNCH_AUDIT.md as the working checklist for improving the Rachel & Ernesto wedding website. Start with the P0/P1 issues. Keep the site static with HTML, CSS, and vanilla JavaScript. Make minimal, targeted changes and explain exactly which files/snippets to replace.
```

Recommended workflow:

1. Start with the launch blockers and correctness issues.
2. Make one small set of changes at a time.
3. Re-check RSVP, language toggle, room booking, modal behavior, and mobile layout after each JavaScript or CSS change.
4. Keep English and Spanish content aligned in meaning, while using natural Latin American Spanish.
5. Avoid adding frameworks, build tools, or new dependencies.

## Repo snapshot reviewed

The zip contained these files:

| File | Purpose | Review notes |
|---|---|---|
| `index.html` | Main wedding website | Hero, schedule, stay, travel, FAQ, RSVP |
| `rooms.html` | Accommodations and request-to-book page | Active room cards and booking modal |
| `draft.html` | Older/alternate draft page | Should probably not be publicly deployed |
| `style.css` | Main stylesheet | Responsive styles, bilingual visibility, modal and room card styles |
| `script.js` | Language toggle, RSVP, Google Apps Script submissions, booking modal | Syntax checked cleanly with Node during initial review |
| `Hf-background-tall.png` | Live background image | Used by CSS; large file size |
| `Hf-background.png` | Alternate background image | Appeared unused in static inspection |
| `CNAME` | GitHub Pages custom domain | `amador-mesa-miller.com` |
| `README.md` | Minimal repo readme | Only basic title/content |

## What was verified

- Static inspection of `index.html`, `rooms.html`, `draft.html`, `style.css`, and `script.js`.
- `script.js` passed a basic Node syntax check during the initial review.
- Image file sizes and dimensions were inspected.
- External links, placeholder links, public draft risks, and major HTML/CSS/JS patterns were reviewed.

## What was not fully verified

- No full live browser smoke test was completed in the original environment.
- The Google Apps Script backend behavior was not verified.
- The actual deployed GitHub Pages site was not inspected.
- No real RSVP or room-booking submission should be assumed successful until tested with the live backend/spreadsheet.

---

# Priority checklist

## P0: Fix before launch

### 1. Fix hero language-button scroll behavior

**File:** `script.js`  
**Current area:** `scrollToContent()` around lines 79-85 in the reviewed copy.

Problem: `scrollToContent()` scrolls to the fixed navbar. Because the navbar is `position: fixed`, this may not move guests into the main content properly.

Current code:

```js
function scrollToContent() {
    const yOffset = -20; 
    if (navbar) {
        const y = navbar.getBoundingClientRect().top + window.pageYOffset + yOffset;
        window.scrollTo({top: y, behavior: 'smooth'});
    }
}
```

Recommended replacement:

```js
function scrollToContent() {
    const target = document.getElementById('location');
    if (!target) return;
    target.scrollIntoView({ behavior: 'smooth', block: 'start' });
}
```

Why it matters: the first action guests take is choosing English or Spanish. That click should reliably bring them to the site content.

Acceptance check:
- Click `ENGLISH` from the hero.
- Click `ESPAÑOL` from the hero.
- Each should scroll to the first main content section.
- Spanish mode should still persist with `localStorage`.

---

### 2. Fix invalid closing tags in `rooms.html`

**File:** `rooms.html`  
**Current area:** around lines 463-467 in the reviewed copy.

Problem: part of the River House section is commented out, but closing tags remain active:

```html
                </div>  -->

            </div>
        </div>
    </section> 
```

Because the corresponding opening tags appear to be inside a comment, those closing tags are invalid active HTML. Browsers may recover, but this can create layout bugs or make future edits fragile.

Recommended fix:
- Either remove the inactive River House/commented-out block entirely, or
- Ensure the opening and closing tags are consistently commented together.

Preferred launch-safe approach:
- Remove inactive room sections from deployed HTML.
- Keep unavailable room details in a private notes file if needed.

Why it matters: invalid HTML near the end of `rooms.html` can affect page structure, footer placement, modal behavior, or future edits.

Acceptance check:
- Run the page through an HTML validator.
- Confirm the footer and booking modal still appear correctly.
- Confirm all intended room cards are present and unavailable rooms are not visible.

---

### 3. Remove or exclude `draft.html` from public deployment

**File:** `draft.html`

Problem: `draft.html` is publicly reachable on a static GitHub Pages site at `/draft.html` if committed to the deployed branch. It contains older/incomplete content and a placeholder link.

Example placeholder found:

```html
<a href="#" target="_blank" class="btn-text">Vermont Translines Bus →</a>
```

Recommended fix:
- Remove `draft.html` from the deployed branch, or
- Move it into a private/local folder that is not deployed, or
- Rename it in a way that will not be linked or published only if you understand GitHub Pages will still serve it.

Why it matters: guests can stumble onto outdated or incomplete information.

Acceptance check:
- Confirm `/draft.html` is not available on the deployed site.
- Confirm no public page links to it.

---

### 4. Remove commented-out sensitive room/rate information from deployed HTML

**File:** `rooms.html`

Problem: commented-out HTML still appears in page source. The reviewed file included inactive/unavailable room details and rates in comments.

Recommended fix:
- Delete unavailable room cards from the deployed HTML.
- Keep a private room inventory note outside the public site if needed.

Why it matters: guests can view source and see information that may be outdated, unavailable, sensitive, or confusing.

Acceptance check:
- View page source in the browser.
- Search for unavailable room names and rates.
- Only launch-safe public content should remain.

---

### 5. Adjust RSVP and room-booking success wording because `no-cors` cannot verify true server success

**File:** `script.js`  
**Current areas:** RSVP submission around lines 224-255; booking submission around lines 338-354 in the reviewed copy.

Problem: both forms use:

```js
mode: 'no-cors'
```

With `no-cors`, the frontend receives an opaque response and cannot confirm that Google Apps Script actually processed the request successfully. The `.then()` callback only confirms that the browser sent the request without a network-level failure.

Current RSVP success alert:

```js
alert("Thank you! Your RSVP has been sent. / ¡Gracias! Tu confirmación ha sido enviada.");
```

Suggested safer wording:

```js
alert("Thank you! Your RSVP was submitted. If you do not hear from us or need to make a change, please contact us directly. / ¡Gracias! Tu confirmación fue enviada. Si necesitas hacer un cambio, por favor contáctanos directamente.");
```

Current room-booking success alert:

```js
alert("Request Sent! We will contact you shortly. / ¡Solicitud Enviada!");
```

Suggested safer wording:

```js
alert("Request submitted! We will follow up to confirm availability. / ¡Solicitud enviada! Te contactaremos para confirmar disponibilidad.");
```

Why it matters: guests should not be told the backend definitely succeeded if the browser cannot verify it.

Acceptance check:
- Submit a test RSVP.
- Confirm it appears in the destination spreadsheet.
- Submit a test room request.
- Confirm it appears in the destination spreadsheet.
- Confirm the user-facing wording does not overpromise confirmation.

---

# P1: Strongly recommended before broad sharing

## 6. Restore or finish Spanish FAQ content

**File:** `index.html`  
**Current area:** FAQ section around lines 204-213 in the reviewed copy.

Problem: Spanish versions of at least two FAQ items are commented out, so Spanish mode may hide or omit those answers.

Reviewed examples:

```html
<!-- <h4 class="lang-es">¿Puedo traer acompañante?</h4> -->
<!-- <p class="lang-es">Si tienes acompañante, su nombre ya estará en la invitación.</p> -->
```

and

```html
<!-- <p class="lang-es">¡Nos encantaría que trajeras a tus hijos, pero sin presión! ...</p> -->
```

Recommended Spanish copy for plus-one FAQ:

```html
<h4 class="lang-es">¿Puedo llevar acompañante?</h4>
<p class="lang-es">Si tienes acompañante, su nombre aparecerá en la invitación.</p>
```

Recommended Spanish copy for children FAQ:

```html
<h4 class="lang-es">¿Debería llevar a mis hijos?</h4>
<p class="lang-es">Nos encantaría que trajeras a tus hijos, pero sin presión. Tendremos varias niñeras durante la recepción del sábado para que puedas relajarte y disfrutar. El hotel y la granja son muy aptos para niños, al igual que toda el área de Manchester. Sin embargo, si prefieres tomarte un fin de semana para ustedes, nuestra boda también puede ser una buena excusa. Por favor recuerda incluir a tus hijos en tu RSVP.</p>
```

Why it matters: Spanish-speaking guests should get the same practical information as English-speaking guests.

Acceptance check:
- Toggle to Spanish.
- Read the full FAQ.
- Confirm no FAQ card becomes empty or English-only unless intentionally bilingual.

---

## 7. Polish Spanish copy and accent marks

Files likely affected: `index.html`, `rooms.html`, maybe `draft.html` if retained privately.

Suggested edits from the initial review:

| Current | Suggested |
|---|---|
| `Te invitamos a celebrar nuestro matrimonio el sur de Vermont.` | `Te invitamos a celebrar nuestro matrimonio en el sur de Vermont.` |
| `SABADO` | `SÁBADO` |
| `Todos las opciones` | `Todas las opciones` |
| `Por Favor Responder antes de Agosto 1, 2026` | `Por favor responder antes del 1 de agosto de 2026` |
| `YES | SI` | `YES | SÍ` |

Why it matters: the site should feel equally polished in English and Spanish.

Acceptance check:
- Search for unaccented Spanish words that need accents, especially `SABADO`, `SI`, `ESPANOL`, and dates.
- Read each Spanish section naturally, not as a literal translation.

---

## 8. Confirm footer wording involving Walter

Files:
- `index.html`
- `rooms.html`
- `draft.html` if retained

Reviewed footer text:

```html
<p>Built by Ernesto for Rachel & Walter • 2026</p>
```

Context: Walter is Rachel & Ernesto's dog. This may be intentional and sweet.

Decision needed:
- If intentional: leave it.
- If guests may be confused: consider a clearer phrase.

Possible alternatives:

```html
<p>Built by Ernesto for Rachel, with Walter’s approval • 2026</p>
```

or

```html
<p>Built by Ernesto for Rachel & Walter • 2026</p>
```

Why it matters: this is not a bug if intentional, but it should be a deliberate choice.

Acceptance check:
- Confirm Rachel and Ernesto like the footer joke/reference.
- Confirm it appears consistently across public pages.

---

## 9. Improve room-card mobile and keyboard accessibility

Files:
- `rooms.html`
- `style.css`
- `script.js`

Problem: room booking appears to depend heavily on hover behavior:

```css
.room-card:hover .card-overlay {
    ...
}
```

Touch devices do not have true hover, and keyboard users may not easily reach the hidden booking button.

Recommended CSS direction:

```css
@media (hover: none) {
    .card-overlay {
        opacity: 1;
        visibility: visible;
        position: static;
        background: transparent;
        backdrop-filter: none;
        margin-top: 20px;
    }

    .btn-book {
        transform: none;
        width: 100%;
    }
}
```

Recommended JavaScript direction:
- Attach the modal-open handler directly to `.btn-book`.
- Keep the room name on the parent `.room-card[data-room]`.
- Ensure pressing Enter/Space on the button opens the modal naturally.

Why it matters: many guests will use phones.

Acceptance check:
- On mobile viewport, each available room has a visible booking/request button.
- The button can be reached by keyboard tabbing.
- Pressing Enter opens the modal.
- The correct room name populates the modal.

---

## 10. Add proper labels to form fields

Files:
- `index.html`
- `rooms.html`
- `script.js` if dynamic guest-row HTML is updated

Problem: several form fields rely primarily on placeholders. Placeholders are not a substitute for labels.

Reviewed dynamic guest input in `script.js`:

```js
<input type="text" class="input-name input-field" placeholder="Full Name / Nombre Completo" required>
```

Recommended approach:
- Add visible labels where they fit.
- Use visually hidden labels where the design should remain compact.
- Ensure every input has a stable `id` and matching `for`.

Example for generated guest rows:

```js
const rowHTML = `
    <div class="guest-block">
        <h5 class="guest-header">Guest ${i} / Invitado ${i}</h5>

        <div class="guest-row" id="guest-row-${i}">
            <label class="sr-only" for="guest-${i}-name">Full Name / Nombre completo</label>
            <input id="guest-${i}-name" type="text" class="input-name input-field" placeholder="Full Name / Nombre completo" required>

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
```

Add an `.sr-only` utility class in `style.css`:

```css
.sr-only {
    position: absolute;
    width: 1px;
    height: 1px;
    padding: 0;
    margin: -1px;
    overflow: hidden;
    clip: rect(0, 0, 0, 0);
    white-space: nowrap;
    border: 0;
}
```

Why it matters: labels help accessibility, autofill, and guest clarity.

Acceptance check:
- Use keyboard tabbing through the form.
- Confirm screen-reader labels are available.
- Confirm visual design is not disrupted.

---

## 11. Replace hidden radio styling with accessible visually-hidden styling

**File:** `style.css`  
**Reviewed current rule:** around line 733.

Current rule:

```css
.age-group input[type="radio"] { display: none; }
```

Problem: `display: none` removes the radio inputs from the accessibility tree and keyboard focus order.

Recommended replacement:

```css
.age-group input[type="radio"] {
    position: absolute;
    opacity: 0;
    width: 1px;
    height: 1px;
}
```

Also add a visible focus state:

```css
.age-group input[type="radio"]:focus-visible + .age-label {
    outline: 2px solid currentColor;
    outline-offset: 3px;
}
```

Why it matters: keyboard and assistive-technology users should be able to select age group.

Acceptance check:
- Tab to the age radio group.
- Arrow through or select age options.
- Focus is visible.

---

## 12. Replace “Please check back soon” with more launch-ready copy

**File:** `index.html`

Problem: “Please check back soon for a list of activities!” can make the site feel unfinished.

Suggested English:

```html
<p class="lang-en">We’ll share more local recommendations closer to the wedding.</p>
```

Suggested Spanish:

```html
<p class="lang-es">Compartiremos más recomendaciones locales cuando se acerque la boda.</p>
```

Why it matters: the site can launch while still acknowledging more details may come later.

Acceptance check:
- The activities/travel area feels intentional, not incomplete.

---

# P2: Performance, privacy, and polish

## 13. Convert the large background image to WebP

Files:
- `Hf-background-tall.png`
- `style.css`

Reviewed image sizes:

| File | Dimensions | Approx. size | Used? |
|---|---:|---:|---|
| `Hf-background-tall.png` | 1366 x 905 | ~3.31 MB | Yes |
| `Hf-background.png` | 1366 x 768 | ~2.84 MB | Appeared unused |

Initial local conversion test:
- `Hf-background-tall.png` converted to WebP quality 80 dropped to roughly 143 KB.
- This was about a 96% reduction.

Recommended CSS update after generating WebP:

```css
#global-bg {
    background-image: url('Hf-background-tall.webp');
}
```

Optional fallback approach:

```css
#global-bg {
    background-image: url('Hf-background-tall.png');
}

@supports (background-image: url('image.webp')) {
    #global-bg {
        background-image: url('Hf-background-tall.webp');
    }
}
```

Why it matters: this is likely the single biggest page-load improvement, especially on mobile.

Acceptance check:
- Confirm the WebP image looks good on desktop and mobile.
- Confirm the background loads correctly on the deployed site.
- Consider removing unused image assets once the final background choice is made.

---

## 14. Add Google Fonts preconnect hints

**File:** likely `index.html` and `rooms.html`

Add before the Google Fonts stylesheet link:

```html
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
```

Why it matters: small performance improvement for font loading.

Acceptance check:
- Fonts still load.
- No duplicate preconnect links are added unnecessarily.

---

## 15. Add `rel="noopener noreferrer"` to external links using `target="_blank"`

Files:
- `index.html`
- `rooms.html`
- `draft.html` if retained

Reviewed examples:
- Google Maps links in `index.html`
- Hill Farm links in `rooms.html`

Current example:

```html
<a href="https://maps.app.goo.gl/UhhaFYrD8niwfYwZA" target="_blank" class="btn-outline lang-en">VIEW ON GOOGLE MAPS</a>
```

Recommended:

```html
<a href="https://maps.app.goo.gl/UhhaFYrD8niwfYwZA" target="_blank" rel="noopener noreferrer" class="btn-outline lang-en">VIEW ON GOOGLE MAPS</a>
```

Why it matters: prevents the newly opened page from having access to the original page via `window.opener`.

Acceptance check:
- Search for all `target="_blank"` links.
- Confirm each active public link has `rel="noopener noreferrer"`.

---

## 16. Add a short RSVP privacy note

**File:** `index.html`

Suggested English:

```html
<p class="privacy-note lang-en">We’ll only use this information for wedding planning and guest logistics.</p>
```

Suggested Spanish:

```html
<p class="privacy-note lang-es">Usaremos esta información únicamente para la organización de la boda y la logística de invitados.</p>
```

Possible CSS:

```css
.privacy-note {
    font-size: 0.85rem;
    opacity: 0.8;
    margin-top: 12px;
}
```

Why it matters: the RSVP collects personal information including guest names, email, phone, age group, and dietary restrictions.

Acceptance check:
- Note appears near the RSVP form before submission.
- Tone stays warm and not overly legalistic.

---

## 17. Add basic SEO and social sharing metadata

Files:
- `index.html`
- possibly `rooms.html`

Recommended metadata for `index.html` head, with wording adjusted to the couple’s preference:

```html
<meta name="description" content="Wedding information for Rachel and Ernesto’s celebration in southern Vermont, including RSVP, schedule, travel, and accommodations.">

<meta property="og:title" content="Rachel & Ernesto">
<meta property="og:description" content="Join us in southern Vermont to celebrate our wedding.">
<meta property="og:type" content="website">
<meta property="og:url" content="https://amador-mesa-miller.com/">
```

If a social preview image is added:

```html
<meta property="og:image" content="https://amador-mesa-miller.com/path-to-preview-image.jpg">
```

Why it matters: improves search result snippets and link previews in texts/social apps.

Acceptance check:
- Use a social preview/debug tool after deployment.
- Confirm the title and description look guest-friendly.

---

## 18. Add modal accessibility improvements

Files:
- `rooms.html`
- `script.js`
- `style.css`

Current modal appears visually functional, but consider:
- Add `role="dialog"`.
- Add `aria-modal="true"`.
- Add an accessible label via `aria-labelledby`.
- Close on Escape.
- Move focus into the modal when opened.
- Return focus to the clicked booking button when closed.

Example HTML direction:

```html
<div id="booking-modal" class="modal-overlay hidden" role="dialog" aria-modal="true" aria-labelledby="booking-modal-title">
    <div class="modal-content">
        <button id="close-modal" class="btn-close" type="button" aria-label="Close booking form">&times;</button>

        <h3 id="booking-modal-title" class="lang-en">Request to Book</h3>
        <h3 class="lang-es">Solicitar reserva</h3>
```

Why it matters: makes the room request flow better for keyboard and assistive-technology users.

Acceptance check:
- Keyboard focus moves into modal.
- Escape closes modal.
- Focus returns to the booking button.
- Clicking outside still closes if desired.

---

# Suggested order for implementation

1. `script.js`: fix `scrollToContent()`.
2. `rooms.html`: remove/fix inactive commented room blocks and invalid closing tags.
3. Repo cleanup: remove or exclude `draft.html` from deployment.
4. `index.html`: restore Spanish FAQ content and fix Spanish copy.
5. `style.css` + `script.js`: make room cards mobile and keyboard accessible.
6. `index.html` + `script.js`: add/strengthen labels and accessible radio styling.
7. Images + `style.css`: convert background to WebP and update reference.
8. `index.html` + `rooms.html`: add `rel` attributes, privacy note, and SEO/social metadata.
9. Test end-to-end: language toggle, RSVP yes/no, dynamic guests, Google Sheets logging, room request modal, mobile layout.

---

# Regression test checklist

Use this after each meaningful change.

## Global

- Site loads from `index.html`.
- Site loads from deployed domain if testing live.
- No console errors on `index.html`.
- No console errors on `rooms.html`.
- Navigation links scroll to the right sections.
- English/Spanish toggle works.
- Language choice persists after refresh if intended.
- Mobile layout does not overflow horizontally.

## RSVP

- Click `YES`.
- Select 1 guest.
- Submit a test RSVP.
- Select multiple guests.
- Confirm all dynamic guest rows appear.
- Confirm age group and dietary fields submit as expected.
- Click `NO`.
- Submit a decline.
- Confirm backend receives test data.
- Confirm success wording is accurate.

## Rooms

- Page loads.
- Every available room card is visible.
- Unavailable rooms are not visible and not present in source if sensitive.
- Booking button opens modal.
- Correct room name is inserted into modal.
- Booking request submits to backend/spreadsheet.
- Modal closes via close button.
- Modal closes via outside click if intended.
- Modal closes via Escape if implemented.
- Mobile users can see and tap booking buttons.

## Accessibility

- Keyboard can reach all interactive controls.
- Focus styles are visible.
- Inputs have labels.
- Radio groups are keyboard usable.
- Modal is keyboard usable.
- Buttons have clear accessible names.
- Color contrast feels readable over the background.

## Content

- English and Spanish sections match in meaning.
- Spanish accents and grammar are polished.
- RSVP deadline is accurate.
- Dates, times, and venue details are accurate.
- Travel/accommodations info is accurate.
- Placeholder links are removed.
- Footer wording is intentional.

## Performance

- Background image is optimized.
- Unused large images are removed if safe.
- Fonts load without visible breakage.
- Mobile load time is acceptable.

---

# Open questions to confirm with Rachel & Ernesto

These should not be guessed:

1. Is the footer “Built by Ernesto for Rachel & Walter” intentionally keeping Ernesto out of the recipient line because Walter is the dog?
2. Should unavailable rooms and rates be completely removed from public source?
3. What fallback contact method should guests use if RSVP or booking submission fails?
4. Is the RSVP deadline final?
5. Are children and plus-one policies final?
6. Are all Hill Farm room rates final and safe to show publicly?
7. Should the site include a password or private RSVP link, or is public access acceptable?
8. Should `draft.html` be deleted, archived privately, or kept locally only?

---

# Notes for future ChatGPT work

- Inspect the actual current files before making exact claims because the repo may change after this audit.
- Do not assume the deployed site matches the zip.
- Keep changes small and explain why each matters.
- Prefer direct file edits or replacement snippets.
- Do not introduce frameworks or build tools.
- Keep the tone warm, personal, and guest-friendly.
- Treat the Google Apps Script URL as public, not secret.
- Be privacy-conscious around guest names, phone numbers, emails, age groups, and dietary restrictions.
