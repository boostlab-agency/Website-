# Regels voor deze website

Statische HTML-site van Boost Lab Agency, gehost op Vercel. Formulieren lopen via /api (Resend).

## Meting en conversies (niet breken)
- Verwijder of wijzig nooit /assets/js/tracking.js of de regel `<script src="/assets/js/tracking.js" defer></script>` in de `<head>` van pagina's.
- Laat de regels met `window.blTrack(...)` in assets/js/contact.js en assets/js/boost-check.js staan.
- Nieuwe pagina's krijgen dezelfde tracking.js-regel in de `<head>` en worden toegevoegd aan sitemap.xml.

## Teksten
- De site praat in de wij-vorm.
- Gebruik geen gedachtestreepjes (— of –) in zinnen; herschrijf de zin.
- Geen verzonnen cijfers, klantscores of reviews. Reviews alleen met goedgekeurde tekst van de klant.
- Geen huisadres op de site; alleen Tilburg als plaats.
