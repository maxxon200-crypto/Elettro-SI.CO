# Elettro SI.CO — Sistema di Design

> Sito editoriale, svizzero, premium. Verde bottiglia + panna + grafite + ottone.
> Deve sembrare disegnato da un umano con gusto — mai un template, mai "AI slop".

Questo documento è la **fonte di verità**. Tutti i token vivono in
`assets/css/tokens.css` (`:root`). **Vietato hardcodare colori/font/spazi nelle
pagine**: usare sempre `var(--token)`.

---

## 0. Regole MUST (lezioni da non rifare)

Vincoli duri, non suggerimenti. La checklist §12 li verifica.

1. **Bottoni mai piccoli.** `min-height: 48px`, padding `14px 28px`, font ≥16px/600.
   Vale per ghost e link-azione (tap target ≥44px). → token `--btn-*`.
2. **Niente spazi morti.** Difetto n.1. Il padding-block **superiore** delle sezioni è
   ridotto: il contenuto parte vicino al titolo. Whitespace = lusso solo se intenzionale.
3. **Testi mai sotto 17px.** Body ≥17px (`--fs-body` parte da 1.0625rem), line-height ≥1.55.
4. **Gerarchia con l'opacità.** Tier: 100% titoli / ~70% corpo / ~50% label secondarie.
5. **Servizi = card cliccabili**, tap pieno, hover-lift. Mai link testuali minuscoli.
6. **Niente numeri indice giganti 01–06.** Solo un piccolo segno a linea o eyebrow mono.
7. **Frame foto = design.** Ombra morbida, luce interna (gradiente, sorgente in alto a sx),
   grana diagonale fine, ring interno 1px, chip-etichetta. Mai rettangolo grigio + corsivo.
8. **Layout non ripetitivo.** Alterna lato immagine/testo e sfondo (panna / paper / verde scuro).
9. **Logo nell'header.** Mark geometrico minimale (placeholder) + wordmark. Altezza header costante.
   Bottone tap-to-call a destra.
10. **Copy editoriale.** Paragrafi brevi, frasi chiave con underline disegnato a mano (SVG draw-on).

---

## 1. Colore

Scelto apposta per distinguersi dal mare di blu del settore.

| Token | Hex / valore | Uso |
|---|---|---|
| `--forest-900` | `#14261F` | Sezioni scure |
| `--forest-700` | `#1F3D34` | Brand / ink principale, titoli |
| `--forest-500` | `#2F5B4C` | Secondario, hover |
| `--cream` | `#F4EFE6` | Sfondo pagina |
| `--paper` | `#FAF9F6` | Card / superfici |
| `--graphite` | `#1A1A1A` | Testo corpo |
| `--graphite-70` | `rgba(26,26,26,.70)` | Corpo secondario |
| `--graphite-50` | `rgba(26,26,26,.50)` | Label secondarie |
| `--line` | `rgba(20,38,31,.14)` | Hairline |
| `--brass` | `#C9A84C` | Accento — **uso parco**: righe, marchi, mai testo lungo |
| `--brass-600` | `#B2913A` | Hover ottone |
| `--on-dark` | `#EDE7D8` | Testo su verde scuro |

**Regole ferme**
- **NO** terracotta / ruggine / arancio bruciato. Da nessuna parte.
- **NO** blu (nessun gradiente blu, nessun accento blu).
- Ottone solo per accenti/decoro, **mai testo corrente**.
- Max **5 colori a schermo** insieme.

---

## 2. Tipografia (NON Inter)

| Ruolo | Famiglia | Note |
|---|---|---|
| Display / titoli / pull-quote | **Fraunces** (Google) | `font-variation-settings:"SOFT" 30,"WONK" 0,"opsz" 144` sui titoli grandi |
| Corpo / UI | **Switzer** (Fontshare) → fallback **Hanken Grotesk** (Google) | grotesque con carattere, non Inter |
| Label / cifre / sigle | **JetBrains Mono** (Google) | eyebrow, telefono, "CEI 64-8" |

- Caricamento: `preconnect`, `font-display:swap`.
- **Mai** Inter / Roboto / Arial / system-ui come font del brand.
- Max **2 famiglie + 1 mono**.

**Scala fluida (base 18px)** — vedi `tokens.css`:
`--fs-eyebrow .8125rem` · `--fs-body clamp(1.0625→1.1875rem)` · `--fs-lead clamp(1.1875→1.375rem)` ·
`--fs-h3` · `--fs-h2 clamp(2→3rem)` · `--fs-h1 clamp(2.5→4rem)` · `--fs-display clamp(3→6rem)` ·
`--fs-quote clamp(1.5→2.25rem)`.

---

## 3. Spazio, raggi, ombre, motion

- **Scala 8pt**: `--space-1..12` (4→192px).
- `--section-pad: clamp(5rem,9vw,9rem)` per il **bottom**; il **top** è ridotto (`--section-pad-top`)
  per evitare il gap morto sotto i titoli.
- Raggi: `--r-control:8px` (solo bottoni/input), `--r-card:12px` (card). Blocchi editoriali: **raggio 0**.
- Ombre **quasi assenti**: hairline + contrasto tonale, non drop-shadow su tutto.
  `--shadow-soft` **solo** per l'elemento sollevato (frame foto).
- Motion: `--ease-out`, `--ease-expo`; durate `--dur-1..4` (200→800ms).

---

## 4. Direzione estetica

Editoriale svizzero: griglia 12 colonne, margini generosi, layout asimmetrici da rivista,
titoli grandi in Fraunces, whitespace come lusso. Espressivo ma ordinato.

**Elementi firma** (con disciplina):
- Underline disegnato a mano (SVG draw-on) su **1 frase chiave per sezione**.
- **Una** sezione scura (`--forest-900`) per spezzare la panna.
- Eyebrow mono sopra ogni titolo.
- Righe hairline che disegnano la struttura, non riquadri pesanti.

---

## 5. Animazioni

Stack: **Lenis** (smooth scroll) + **GSAP** + **ScrollTrigger**. Solo `transform`/`opacity`.

- Hero: titolo Fraunces reveal a maschera (righe salgono da clip, stagger 60–80ms).
- Reveal on scroll: `opacity 0→1` + `translateY(20→0)`, 600–800ms, stagger sui gruppi.
- Count-up sulle stat ("1992", "30+").
- **Una** sezione pinnata (Lavori): scrub orizzontale — il "momento wow".
- Parallax leggero sulle immagini. Hairline `scaleX 0→1` all'ingresso.
- Bottoni: hover-lift + underline animato. Sticky tap-to-call su mobile.
- `prefers-reduced-motion: reduce` → niente scrub/parallax/transform; contenuto istantaneo.

**Anti-circo:** il movimento rivela il contenuto, non decora il vuoto.

---

## 6. Componenti (tutti tokenizzati)

`Button` (primary/secondary/ghost, ≥48px) · `Eyebrow` (mono uppercase) · `SectionHeader` ·
`ServiceCard` (tap pieno, segno a linea) · `StatBlock` (count-up) · `WorkTile` ·
`PhotoFrame` (arco/rettangolo/cerchio: ombra+luce+grana+ring+chip) · `Quote` (Fraunces italic) ·
`ContactForm` · `StickyCallBar` · `CookieBanner`.

---

## 7. Legale (GDPR / Italia)

- Banner cookie: **Accetta tutti · Rifiuta tutti · Preferenze** con pari evidenza.
  Nessuna casella pre-selezionata. X ≠ consenso. Non necessari bloccati fino al consenso.
- Mappa: **click-to-load** (nessun cookie di terze parti prima del consenso).
- Scelta salvata (localStorage). Revoca da footer ("Preferenze cookie").
- Pagine `privacy.html` (art. 13 GDPR) e `cookie.html` (policy + tabella).
- **P.IVA**: placeholder `[INSERIRE P.IVA]` — mai inventata.

---

## 8. Definition of Done (checklist §12)

- [ ] `DESIGN.md` + token in un solo CSS, zero colori/font hardcodati.
- [ ] Nessun gap morto sotto i titoli; sezioni con ritmo alternato.
- [ ] Ogni bottone/tap ≥44px (base ≥48px); testi ≥17px; gerarchia con opacità.
- [ ] Servizi = card cliccabili (no numeri 01–06 giganti); frame foto con ombra+luce+grana+ring+chip.
- [ ] Lenis+GSAP presenti, una sezione pinnata, `prefers-reduced-motion` gestito.
- [ ] Header con lockup logo; sezione scura; underline disegnato su frasi chiave.
- [ ] Privacy + Cookie presenti; banner con Accetta/Rifiuta/Preferenze; non necessari bloccati;
      mappa dopo consenso; P.IVA placeholder nel footer.
- [ ] Verifica 1440px e 390px. Lighthouse ≥95.
- [ ] Nessun blu, terracotta o Inter da nessuna parte.
