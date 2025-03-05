document.addEventListener("DOMContentLoaded", function () {
  const popup = document.getElementById("devicePopup");
  const closeButton = document.getElementById("closePopup");
  const dontShowButton = document.getElementById("dontShowPopup");

  // Check if user already chose to not show the popup
  if (localStorage.getItem("dontShowPopup") === "true") {
    popup.style.display = "none";
    return;
  }

  // Display the popup on page load
  popup.style.display = "flex";

  // Hide popup when "Fermer" button is clicked
  closeButton.addEventListener("click", function () {
    popup.style.display = "none";
  });

  // Hide popup and cache choice when "Ne plus afficher" button is clicked
  dontShowButton.addEventListener("click", function () {
    localStorage.setItem("dontShowPopup", "true");
    popup.style.display = "none";
  });

  // Hide popup when clicking outside the popup container
  popup.addEventListener("click", function (event) {
    if (event.target === popup) {
      popup.style.display = "none";
    }
  });
});
