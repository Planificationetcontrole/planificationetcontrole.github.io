/* =========================================================
   PlanControl Academy — Paiement (simulation pédagogique)
   ========================================================= */

(function () {
  // -------- Sélecteurs --------
  const cardNumberInput  = document.getElementById('cardNumber');
  const nameInput        = document.getElementById('name');
  const expiryInput      = document.getElementById('expiry');
  const cvvInput         = document.getElementById('cvv');

  const cardPreview      = document.getElementById('cardPreview');
  const cardNumberDisp   = document.getElementById('cardNumberDisplay');
  const cardNameDisp     = document.getElementById('cardNameDisplay');
  const cardExpiryDisp   = document.getElementById('cardExpiryDisplay');
  const cardCvvDisp      = document.getElementById('cardCvvDisplay');
  const cardTypeDisp     = document.getElementById('cardType');

  const payBtn           = document.getElementById('payBtn');
  const testFillBtn      = document.getElementById('testFillBtn');
  const form             = document.getElementById('paymentForm');
  const paymentProcess   = document.getElementById('paymentProcess');
  const successScreen    = document.getElementById('successScreen');

  if (!cardNumberInput) return; // Sécurité

  // -------- Formatage : numéro de carte (groupes de 4) --------
  cardNumberInput.addEventListener('input', (e) => {
    let v = e.target.value.replace(/\D/g, '').slice(0, 16);
    const groups = v.match(/.{1,4}/g);
    e.target.value = groups ? groups.join(' ') : '';
    updateCardNumberDisplay(e.target.value);
    detectCardType(v);
  });

  // -------- Formatage : nom (lettres + espaces, majuscules sur la carte) --------
  nameInput.addEventListener('input', (e) => {
    e.target.value = e.target.value.replace(/[^a-zA-ZÀ-ÿ\-\s']/g, '');
    updateNameDisplay(e.target.value);
  });

  // -------- Formatage : expiration MM/AA --------
  expiryInput.addEventListener('input', (e) => {
    let v = e.target.value.replace(/\D/g, '').slice(0, 4);
    if (v.length >= 3) {
      v = v.slice(0, 2) + '/' + v.slice(2);
    } else if (v.length === 2 && e.inputType !== 'deleteContentBackward') {
      v = v + '/';
    }
    // Validation mois (01-12)
    if (v.length >= 2) {
      const month = parseInt(v.slice(0, 2), 10);
      if (month > 12) v = '12' + v.slice(2);
      if (v.slice(0, 2) === '00') v = '01' + v.slice(2);
    }
    e.target.value = v;
    updateExpiryDisplay(v);
  });

  // -------- Formatage : CVV (3 chiffres) --------
  cvvInput.addEventListener('input', (e) => {
    e.target.value = e.target.value.replace(/\D/g, '').slice(0, 3);
    updateCvvDisplay(e.target.value);
  });

  // -------- Flip de la carte sur focus du CVV --------
  cvvInput.addEventListener('focus', () => cardPreview.classList.add('flipped'));
  cvvInput.addEventListener('blur', () => cardPreview.classList.remove('flipped'));

  // -------- Maj affichage carte : numéro --------
  function updateCardNumberDisplay(value) {
    const digits = (value || '').replace(/\s/g, '');
    if (!digits) {
      cardNumberDisp.innerHTML = '<span class="placeholder">•••• •••• •••• ••••</span>';
      return;
    }
    let html = '';
    for (let i = 0; i < 16; i++) {
      if (i > 0 && i % 4 === 0) html += ' ';
      if (i < digits.length) {
        html += digits[i];
      } else {
        html += '<span class="placeholder">•</span>';
      }
    }
    cardNumberDisp.innerHTML = html;
  }

  function updateNameDisplay(value) {
    cardNameDisp.innerHTML = value
      ? value.toUpperCase()
      : '<span class="placeholder">VOTRE NOM</span>';
  }

  function updateExpiryDisplay(value) {
    cardExpiryDisp.innerHTML = value
      ? value
      : '<span class="placeholder">MM/AA</span>';
  }

  function updateCvvDisplay(value) {
    cardCvvDisp.textContent = value || '•••';
  }

  // -------- Détection type de carte (label visuel) --------
  function detectCardType(digits) {
    let type = 'CARTE';
    if (/^4/.test(digits)) type = 'VISA';
    else if (/^5[1-5]/.test(digits) || /^2[2-7]/.test(digits)) type = 'MASTERCARD';
    else if (/^3[47]/.test(digits)) type = 'AMEX';
    cardTypeDisp.textContent = type;
  }

  // -------- Bouton "remplir avec données de test" --------
  testFillBtn.addEventListener('click', () => {
    cardNumberInput.value = '5131 3066 0518 8745';
    nameInput.value = 'Thomas Cosnier';
    expiryInput.value = '04/27';
    cvvInput.value = '123';

    updateCardNumberDisplay(cardNumberInput.value);
    updateNameDisplay(nameInput.value);
    updateExpiryDisplay(expiryInput.value);
    updateCvvDisplay(cvvInput.value);
    detectCardType('4242424242424242');

    // Petit feedback visuel
    testFillBtn.textContent = '✓ Données de test remplies';
    setTimeout(() => {
      testFillBtn.innerHTML = '⚡ Remplir avec une carte de test';
    }, 1800);
  });

  // -------- Validation simple --------
  function validateForm() {
    const num = cardNumberInput.value.replace(/\s/g, '');
    if (num.length !== 16)        return 'Le numéro de carte doit contenir 16 chiffres.';
    if (nameInput.value.trim().length < 2) return 'Veuillez renseigner le nom du titulaire.';
    if (!/^\d{2}\/\d{2}$/.test(expiryInput.value)) return 'Date d\'expiration invalide (MM/AA).';
    if (cvvInput.value.length !== 3) return 'Le CVV doit contenir 3 chiffres.';
    return null;
  }

  // -------- Animation des étapes --------
  function setStep(stepNum, state) {
    const el = document.getElementById('step' + stepNum);
    if (!el) return;
    el.classList.remove('active', 'done');
    if (state) el.classList.add(state);
  }

  // -------- Paiement fictif (multi-étapes) --------
  window.fakePayment = function () {
    const error = validateForm();
    if (error) {
      // Petit shake + alerte douce
      payBtn.style.animation = 'none';
      void payBtn.offsetWidth;
      payBtn.style.animation = 'shake 0.4s';
      payBtn.textContent = '⚠ ' + error;
      setTimeout(() => {
        payBtn.textContent = 'Payer 49,00 €';
      }, 2200);
      return;
    }

    // Désactive le formulaire et lance le process
    payBtn.disabled = true;
    payBtn.textContent = 'Traitement en cours...';
    [cardNumberInput, nameInput, expiryInput, cvvInput, testFillBtn].forEach(el => el.disabled = true);
    paymentProcess.classList.add('show');

    const steps = [
      { delay: 0,    activate: 1 },
      { delay: 1200, complete: 1, activate: 2 },
      { delay: 2500, complete: 2, activate: 3 },
      { delay: 3700, complete: 3, activate: 4 },
      { delay: 4900, complete: 4, finish: true }
    ];

    steps.forEach(s => {
      setTimeout(() => {
        if (s.complete)  setStep(s.complete, 'done');
        if (s.activate)  setStep(s.activate, 'active');
        if (s.finish) {
          // Bascule sur l'écran de succès
          form.style.display = 'none';
          paymentProcess.classList.remove('show');
          successScreen.classList.add('show');

          setTimeout(() => {
            window.location.href = 'cours-premium.html';
          }, 1800);
        }
      }, s.delay);
    });
  };

  // Petite animation shake (injectée si manquante)
  if (!document.getElementById('shake-style')) {
    const s = document.createElement('style');
    s.id = 'shake-style';
    s.textContent = `@keyframes shake {
      0%, 100% { transform: translateX(0); }
      25% { transform: translateX(-6px); }
      75% { transform: translateX(6px); }
    }`;
    document.head.appendChild(s);
  }
})();
