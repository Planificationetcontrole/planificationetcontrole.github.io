window.onload = function () {
  // Remplissage automatique des champs
  document.getElementById("cardNumber").value = "4242 4242 4242 4242";
  document.getElementById("name").value = "Jean Dupont";
  document.getElementById("expiry").value = "12/30";
  document.getElementById("cvv").value = "123";
};

function fakePayment() {
  const status = document.getElementById("status");

  status.innerText = "Traitement du paiement...";

  setTimeout(() => {
    status.innerText = "✅ Paiement accepté ! Redirection...";
    
    setTimeout(() => {
      window.location.href = "cours-premium.html";
    }, 2000);

  }, 2000);
}
