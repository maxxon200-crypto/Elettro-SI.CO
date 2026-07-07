# Elettro SI.CO — sito

Sito statico (HTML + CSS + JS vanilla) per **Elettro Si.Co. S.n.c.** — impianti elettrici a
Sesto San Giovanni, dal 1992. Editoriale, premium, con animazioni Lenis + GSAP.
Nessun framework, nessuna build: si può aprire direttamente o deployare su Vercel.

## Struttura

```
index.html          Home (one-page: hero, servizi, lavori, chi siamo, fiducia, contatti)
chi-siamo.html      Storia dei titolari
privacy.html        Informativa privacy (art. 13 GDPR) — TEMPLATE da verificare
cookie.html         Cookie Policy — TEMPLATE da verificare
404.html            Pagina non trovata
DESIGN.md           Sistema di design (token, regole, checklist)
assets/
  css/tokens.css    Tutti i token (:root) — UNICA fonte di colori/font/spazi
  css/styles.css    Componenti e sezioni (usa solo i token)
  js/main.js        Lenis + GSAP, count-up, cookie consent, mappa click-to-load, form
  img/              (vuota) — qui vanno le foto reali
```

Regola d'oro: **non hardcodare colori/font nelle pagine**. Tutto passa da `assets/css/tokens.css`.

## Come sostituire i contenuti

### 1. P.IVA e dati legali (obbligatorio)
Cerca ovunque il testo **`[INSERIRE P.IVA]`** e sostituiscilo con la partita IVA reale.
Gli altri segnaposto sono marcati con `data-todo` e testo tra parentesi quadre:
`[inserire orari]`, `[INSERIRE DATA]`, `[DA DEFINIRE COL CLIENTE]`, ecc.

```
grep -rn "INSERIRE\|data-todo\|DA VERIFICARE\|DA CONFERMARE\|DA DEFINIRE" .
```

### 2. Foto reali
Le cornici (`.frame`) mostrano un **placeholder trattato** (gradiente verde + grana + luce +
ring + chip), non un box vuoto. Per inserire una foto vera, dentro la `<figure class="frame ...">`
sostituisci `<span class="frame__fill"></span>` con:

```html
<img class="frame__img" src="assets/img/lavoro-1.avif" alt="Descrizione in italiano" loading="lazy">
```

Lascia gli altri livelli (`frame__light`, `frame__grain`, `frame__ring`, `frame__chip`): danno
il grading e la profondità. Aggiorna il testo del `frame__chip` con la didascalia reale.

**Hero:** in `index.html`, nella sezione `.hero`, sostituisci il `<div class="hero__bg-photo" ...>`
con l'immagine reale full-bleed:

```html
<img class="hero__bg-photo" src="assets/img/hero.avif" alt="" fetchpriority="high">
```

Formati consigliati: **AVIF/WebP**, con `srcset` per il responsive. Applicare un grading verde
coerente in post-produzione (l'immagine di sfondo hero ha già un overlay verde via CSS).

### 3. Testi
Copy e sezioni sono in italiano dentro le pagine `.html`. Modifica direttamente.
Le frasi chiave evidenziate usano `<span class="mark">…<svg class="mark__ul">…</svg></span>`
(underline disegnato a mano che si anima allo scroll).

## Form contatti
Il form (`index.html`, sezione Contatti) di default apre il client email dell'utente
(`mailto:`). Per riceverlo su un backend reale, aggiungi `data-endpoint` al `<form>` e un
`action`/`method` verso il tuo servizio (es. Formspree o una serverless function Vercel).
Vedi `initForm()` in `assets/js/main.js`.

## Cookie & privacy (GDPR)
- Banner con **Accetta tutti / Rifiuta tutti / Preferenze** (consenso granulare), nessuna casella
  pre-selezionata; la chiusura non equivale a consenso.
- I cookie non necessari (mappa, eventuali analitici) restano **bloccati fino al consenso**.
- La **mappa Google** è caricata solo con "Carica la mappa" **dopo** il consenso (click-to-load).
- La scelta è salvata in `localStorage` (`esico_consent_v1`); si revoca da **Preferenze cookie**
  nel footer.
- Le pagine `privacy.html` e `cookie.html` sono **template**: vanno verificate da un professionista
  e completate (P.IVA, date, tempi di conservazione, fornitori effettivi).

## Animazioni
`Lenis` (smooth scroll) + `GSAP` + `ScrollTrigger` via CDN. Effetti solo su `transform`/`opacity`.
Tutto degrada con `prefers-reduced-motion: reduce` (niente scrub/parallax, contenuto istantaneo)
e funziona anche senza JS (contenuto visibile). Per self-hostare le librerie, scaricale in
`assets/js/vendor/` e aggiorna i `<script src>`.

## Font
- **Fraunces** (display) e **JetBrains Mono** (label) via Google Fonts.
- **Switzer** (corpo) via Fontshare, con fallback **Hanken Grotesk**.
- Caricati con `preconnect` + `font-display:swap`. Nessun uso di Inter/Roboto/Arial.
- Per la massima performance si possono self-hostare/subsettare i font in `assets/fonts/`.

## Deploy su Vercel
Progetto statico: nessun comando di build.
1. Push del repository su GitHub.
2. Su Vercel: *New Project* → importa il repo → framework **"Other"** → Deploy.
3. Configura il dominio `elettrosico.it`.
Il file `404.html` viene servito automaticamente da Vercel come pagina d'errore.

## TODO prima della pubblicazione
- [ ] Inserire la **P.IVA** reale (cerca `[INSERIRE P.IVA]`).
- [ ] Inserire **orari** di apertura nel footer.
- [ ] Sostituire i **placeholder foto** con scatti reali dei titolari e dei lavori (grading verde).
- [ ] Confermare o rimuovere le **ancore di prezzo** ("da ~€290", "da ~€2.200").
- [ ] Far **verificare Privacy e Cookie Policy** da un professionista; completare date, tempi di
      conservazione e fornitori effettivi.
- [ ] Collegare il **form** a un endpoint reale (opzionale).
- [ ] Aggiungere immagini **Open Graph** (`og:image`) per la condivisione social.
