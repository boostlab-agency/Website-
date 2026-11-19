/* Boost Lab tracking: Google Consent Mode v2 + cookiebanner + conversies.
   ---------------------------------------------------------------------
   INSTELLEN: vul hieronder je eigen ID's in. Zolang ze leeg zijn laadt er
   niets van Google en verschijnt er ook geen cookiebanner.
     GA4_ID         Google Analytics 4 meet-ID, bijv. 'G-ABC123XYZ'
     ADS_ID         Google Ads conversie-ID, bijv. 'AW-123456789'
     ADS_LABELS     per conversie het label uit Google Ads (Doelen > Conversies)
   Conversies die worden doorgegeven:
     lead_contact      contactformulier succesvol verstuurd
     lead_boost_check  Boost Check lead-formulier succesvol verstuurd
     click_phone       klik op een tel: link
     click_whatsapp    klik op een wa.me link
     click_email       klik op een mailto: link
*/
(function () {
  'use strict';

  var GA4_ID = 'G-WBGYY2EJ77';
  var ADS_ID = '';
  var ADS_LABELS = {
    lead_contact: '',
    lead_boost_check: '',
    click_phone: '',
    click_whatsapp: ''
  };

  var CONSENT_KEY = 'bl-consent';
  if (!GA4_ID && !ADS_ID) {
    window.blTrack = function () {};
    return;
  }

  window.dataLayer = window.dataLayer || [];
  function gtag() { window.dataLayer.push(arguments); }
  window.gtag = gtag;

  /* Consent Mode v2: standaard alles geweigerd tot de bezoeker kiest. */
  gtag('consent', 'default', {
    ad_storage: 'denied',
    ad_user_data: 'denied',
    ad_personalization: 'denied',
    analytics_storage: 'denied',
    wait_for_update: 500
  });

  function readConsent() {
    try { return localStorage.getItem(CONSENT_KEY); } catch (e) { return null; }
  }
  function writeConsent(value) {
    try { localStorage.setItem(CONSENT_KEY, value); } catch (e) {}
  }
  function applyConsent(value) {
    var granted = value === 'granted' ? 'granted' : 'denied';
    gtag('consent', 'update', {
      ad_storage: granted,
      ad_user_data: granted,
      ad_personalization: granted,
      analytics_storage: granted
    });
  }

  /* Zonder cookie-toestemming de Google Ads klik-ID (gclid) via de URL doorgeven,
     zodat leads van bezoekers die cookies weigeren toch aan de advertentie gekoppeld worden. */
  gtag('set', 'url_passthrough', true);

  var stored = readConsent();
  if (stored) applyConsent(stored);

  var s = document.createElement('script');
  s.async = true;
  s.src = 'https://www.googletagmanager.com/gtag/js?id=' + (GA4_ID || ADS_ID);
  document.head.appendChild(s);
  gtag('js', new Date());
  if (GA4_ID) gtag('config', GA4_ID);
  if (ADS_ID) gtag('config', ADS_ID);

  /* Eén functie voor alle conversies, ook bruikbaar vanuit andere scripts. */
  window.blTrack = function (name, params) {
    params = params || {};
    gtag('event', name, params);
    if (name.indexOf('lead_') === 0) gtag('event', 'generate_lead', { lead_type: name });
    var label = ADS_LABELS[name];
    if (ADS_ID && label) gtag('event', 'conversion', { send_to: ADS_ID + '/' + label });
  };

  document.addEventListener('click', function (e) {
    var a = e.target.closest ? e.target.closest('a[href]') : null;
    if (!a) return;
    var href = a.getAttribute('href') || '';
    if (href.indexOf('tel:') === 0) window.blTrack('click_phone');
    else if (href.indexOf('https://wa.me/') === 0) window.blTrack('click_whatsapp');
    else if (href.indexOf('mailto:') === 0) window.blTrack('click_email');
  }, true);

  /* Cookiebanner, alleen als er nog geen keuze is gemaakt. */
  function showBanner() {
    var bar = document.createElement('div');
    bar.className = 'consent-bar';
    bar.setAttribute('role', 'dialog');
    bar.setAttribute('aria-label', 'Cookievoorkeuren');
    bar.innerHTML =
      '<p>We gebruiken cookies om te meten hoe de site gebruikt wordt en om advertenties te verbeteren. Akkoord?</p>' +
      '<div class="consent-bar__actions">' +
      '<button type="button" class="consent-bar__btn consent-bar__btn--ghost" data-consent="denied">Alleen noodzakelijk</button>' +
      '<button type="button" class="consent-bar__btn" data-consent="granted">Akkoord</button>' +
      '</div>';
    bar.addEventListener('click', function (e) {
      var choice = e.target.getAttribute && e.target.getAttribute('data-consent');
      if (!choice) return;
      writeConsent(choice);
      applyConsent(choice);
      bar.remove();
    });
    document.body.appendChild(bar);
  }
  if (!stored) {
    if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', showBanner);
    else showBanner();
  }
})();
