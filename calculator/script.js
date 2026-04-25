// Initialize MathJax configuration
window.MathJax = {
  tex: {
    inlineMath: [
      ["$", "$"],
      ["\\(", "\\)"],
    ],
    displayMath: [
      ["$$", "$$"],
      ["\\[", "\\]"],
    ],
    processEscapes: true,
  },
};

// Initialize chart variable
let powerCurveChart;

document.addEventListener("DOMContentLoaded", function () {
  // Get input elements (all as text inputs)
  const airDensityInput = document.getElementById("airDensity");
  const bladeLengthInput = document.getElementById("bladeLength");
  const windSpeedInput = document.getElementById("windSpeed");
  const efficiencyFactorInput = document.getElementById("efficiencyFactor");
  const cutInSpeedInput = document.getElementById("cutInSpeed");
  const cutOutSpeedInput = document.getElementById("cutOutSpeed");
  const ratedSpeedInput = document.getElementById("ratedSpeed");

  // Get output elements
  const bladeDiameterOutput = document.getElementById("bladeDiameter");
  const sweptAreaOutput = document.getElementById("sweptArea");
  const airVolumeOutput = document.getElementById("airVolume");
  const airMassOutput = document.getElementById("airMass");
  const powerTheoryOutput = document.getElementById("powerTheory");
  const powerOutputOutput = document.getElementById("powerOutput");
  const windStateOutput = document.getElementById("windState");
  const efficiencyWarning = document.getElementById("efficiencyWarning");

  // Get formula containers
  const diameterFormulaContainer = document.getElementById("diameterFormula");
  const areaFormulaContainer = document.getElementById("areaFormula");
  const volumeFormulaContainer = document.getElementById("volumeFormula");
  const massFormulaContainer = document.getElementById("massFormula");
  const powerTheoryFormulaContainer =
    document.getElementById("powerTheoryFormula");
  const powerOutputFormulaContainer =
    document.getElementById("powerOutputFormula");

  // Initialize charts
  initCharts();

  // Set up event listeners for text inputs
  airDensityInput.addEventListener("input", updateCalculations);
  bladeLengthInput.addEventListener("input", updateCalculations);
  windSpeedInput.addEventListener("input", updateCalculations);
  efficiencyFactorInput.addEventListener("input", updateCalculations);
  cutInSpeedInput.addEventListener("input", updateCalculations);
  cutOutSpeedInput.addEventListener("input", updateCalculations);
  ratedSpeedInput.addEventListener("input", updateCalculations);

  // Run initial calculations
  updateCalculations();

  // Helper function: formats a number with fixed decimals and replaces dot by comma
  function fmt(num, decimals) {
    return num.toFixed(decimals).replace(".", ",");
  }

  // Update all calculations based on the text input values
  function updateCalculations() {
    // Retrieve numerical values from inputs
    const airDensity = parseFloat(airDensityInput.value);
    const bladeLength = parseFloat(bladeLengthInput.value);
    const windSpeed = parseFloat(windSpeedInput.value);
    const efficiencyFactor = parseFloat(efficiencyFactorInput.value);
    const cutInSpeed = parseFloat(cutInSpeedInput.value);
    const cutOutSpeed = parseFloat(cutOutSpeedInput.value);
    const ratedWindSpeed = parseFloat(ratedSpeedInput.value);

    // Betz limit check (efficiency should not exceed 0.593)
    if (efficiencyFactor > 0.593) {
      efficiencyWarning.style.display = "block";
    } else {
      efficiencyWarning.style.display = "none";
    }

    // Blade diameter calculation
    const bladeDiameter = 2 * bladeLength;
    bladeDiameterOutput.textContent = fmt(bladeDiameter, 2) + " m";
    diameterFormulaContainer.innerHTML =
      "$$D = 2 \\times L = 2 \\times " +
      fmt(bladeLength, 2) +
      " = " +
      fmt(bladeDiameter, 2) +
      "\\ \\text{m}$$";

    // Swept area calculation
    const sweptArea = Math.PI * Math.pow(bladeLength, 2);
    sweptAreaOutput.textContent = fmt(sweptArea, 2) + " m²";
    areaFormulaContainer.innerHTML =
      "$$A = \\pi \\times L^2 = \\pi \\times " +
      fmt(bladeLength, 2) +
      "^2 = " +
      fmt(sweptArea, 2) +
      "\\ \\text{m}^2$$";

    // Air volume per second calculation
    const airVolume = sweptArea * windSpeed;
    airVolumeOutput.textContent = fmt(airVolume, 2) + " m³/s";
    volumeFormulaContainer.innerHTML =
      "$$V = A \\times v = " +
      fmt(sweptArea, 2) +
      " \\times " +
      fmt(windSpeed, 2) +
      " = " +
      fmt(airVolume, 2) +
      "\\ \\text{m}^3/\\text{s}$$";

    // Air mass per second calculation
    const airMass = airDensity * airVolume;
    airMassOutput.textContent = fmt(airMass, 2) + " kg/s";
    massFormulaContainer.innerHTML =
      "$$m = \\rho \\times V = " +
      fmt(airDensity, 3) +
      " \\times " +
      fmt(airVolume, 2) +
      " = " +
      fmt(airMass, 2) +
      "\\ \\text{kg/s}$$";

    // Theoretical wind power calculation
    const powerTheory = 0.5 * airMass * Math.pow(windSpeed, 2);
    powerTheoryOutput.textContent = formatPower(powerTheory);
    powerTheoryFormulaContainer.innerHTML =
      "$$P_{\\mathrm{th}} = \\frac{1}{2} \\times m \\times v^2 = 0,5 \\times " +
      fmt(airMass, 2) +
      " \\times " +
      fmt(windSpeed, 2) +
      "^2 = " +
      fmt(powerTheory, 2) +
      "\\ \\text{W}$$";

    // Determine actual power output based on wind speed constraints
    let powerOutput = 0;
    let windState = "";

    // Calcul de la puissance nominale (en kW)
    const ratedTheoreticalPower =
      0.5 * airDensity * sweptArea * Math.pow(ratedWindSpeed, 3);
    const powerRated = (ratedTheoreticalPower * efficiencyFactor) / 1000;

    if (windSpeed < cutInSpeed) {
      windState =
        "<div class='wind-state too-slow'>Statut: <b>Non opérationnelle</b> " +
        "<span class='wind-speed-badge too-slow'>• Vent trop faible</span></div>";
      powerOutput = 0;
    } else if (windSpeed > cutOutSpeed) {
      windState =
        "<div class='wind-state too-fast'>Statut: <b>Arrêt d'urgence</b> " +
        "<span class='wind-speed-badge too-fast'>• Vent trop fort</span></div>";
      powerOutput = 0;
    } else {
      windState =
        "<div class='wind-state operational'>Statut: <b>En fonctionnement</b> " +
        "<span class='wind-speed-badge operational'>• Conditions optimales</span></div>";

      if (windSpeed >= cutInSpeed && windSpeed < ratedWindSpeed) {
        // Interpolation cubique pour refléter l'évolution en v^3
        let x = (windSpeed - cutInSpeed) / (ratedWindSpeed - cutInSpeed);
        powerOutput = powerRated * Math.pow(x, 3);
      } else if (windSpeed >= ratedWindSpeed && windSpeed <= cutOutSpeed) {
        powerOutput = powerRated;
      }
    }

    windStateOutput.innerHTML = windState;
    powerOutputOutput.textContent = formatPower(powerOutput);

    if (powerOutput > 0) {
      if (windSpeed >= ratedWindSpeed) {
        powerOutputFormulaContainer.innerHTML =
          "$$P_{\\mathrm{élec}} = P_{\\mathrm{rated}} = " +
          fmt(powerOutput, 2) +
          "\\ \\text{W (Puissance nominale)}$$";
      } else {
        powerOutputFormulaContainer.innerHTML =
          "$$P_{\\mathrm{élec}} = P_{\\mathrm{th}} \\times C_p = " +
          fmt(powerTheory, 2) +
          " \\times " +
          fmt(efficiencyFactor, 2) +
          " = " +
          fmt(powerOutput, 2) +
          "\\ \\text{W}$$";
      }
    } else {
      powerOutputFormulaContainer.innerHTML =
        "$$P_{\\mathrm{élec}} = 0 \\ \\text{W (Éolienne non opérationnelle)}$$";
    }

    // Update charts
    updateCharts(
      cutInSpeed,
      cutOutSpeed,
      ratedWindSpeed,
      efficiencyFactor,
      airDensity,
      bladeLength
    );

    // Render math formulas via MathJax
    if (MathJax && MathJax.typesetPromise) {
      MathJax.typesetPromise();
    } else if (window.MathJax && window.MathJax.typesetPromise) {
      window.MathJax.typesetPromise();
    }
  }

  // Initialize the power curve chart
  function initCharts() {
    const powerCurveCtx = document
      .getElementById("powerCurveChart")
      .getContext("2d");

    powerCurveChart = new Chart(powerCurveCtx, {
      type: "line",
      data: {
        labels: [],
        datasets: [
          // Courbe de la puissance électrique de l'éolienne (mise en avant)
          {
            label: "Puissance électrique produite (kW)",
            data: [],
            borderColor: "#3498db",
            backgroundColor: "rgba(52, 152, 219, 0.1)",
            borderWidth: 3,
            fill: true,
            tension: 0.1,
          },
          // Courbe secondaire de la puissance de vent (re-scalée)
          {
            label: "Puissance théorique du vent (kW)",
            data: [],
            borderColor: "#e74c3c",
            backgroundColor: "rgba(231, 76, 60, 0.1)",
            borderWidth: 1,
            borderDash: [5, 5],
            fill: false,
            tension: 0.1,
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: true,
        aspectRatio: 1.5,
        scales: {
          y: {
            beginAtZero: true,
            title: {
              display: true,
              text: "Puissance (kW)",
            },
          },
          x: {
            title: {
              display: true,
              text: "Vitesse du vent (m/s)",
            },
          },
        },
      },
    });
  }

  // Update the power curve chart based on current inputs
  function updateCharts(
    cutInSpeed,
    cutOutSpeed,
    ratedWindSpeed,
    efficiencyFactor,
    airDensity,
    bladeLength
  ) {
    // Crée un tableau pour les vitesses de vent de 0 à 30 m/s
    const windSpeeds = Array.from({ length: 31 }, (_, i) => i);
    const sweptArea = Math.PI * Math.pow(bladeLength, 2);

    // Calcul de la puissance nominale (en kW) à la vitesse nominale
    const ratedTheoreticalPower =
      0.5 * airDensity * sweptArea * Math.pow(ratedWindSpeed, 3);
    const powerRated = (ratedTheoreticalPower * efficiencyFactor) / 1000;

    // Courbe de l'éolienne : interpolation cubique entre cutInSpeed et ratedWindSpeed,
    // puis puissance nominale entre ratedWindSpeed et cutOutSpeed.
    const turbineOutputs = windSpeeds.map((speed) => {
      if (speed < cutInSpeed) {
        return 0;
      } else if (speed >= cutInSpeed && speed < ratedWindSpeed) {
        let x = (speed - cutInSpeed) / (ratedWindSpeed - cutInSpeed);
        return powerRated * Math.pow(x, 3);
      } else if (speed >= ratedWindSpeed && speed <= cutOutSpeed) {
        return powerRated;
      } else {
        return 0;
      }
    });

    // Courbe de la puissance de vent (théorique), re-scalée pour rester secondaire.
    // On normalise pour que la courbe passe de 0 à powerRated entre cutInSpeed et ratedWindSpeed.
    const windPowerOutputs = windSpeeds.map((speed) => {
      if (speed < cutInSpeed) {
        return 0;
      } else if (speed >= cutInSpeed && speed < ratedWindSpeed) {
        let raw =
          (0.5 *
            airDensity *
            sweptArea *
            (Math.pow(speed, 3) - Math.pow(cutInSpeed, 3))) /
          1000;
        let rawMax =
          (0.5 *
            airDensity *
            sweptArea *
            (Math.pow(ratedWindSpeed, 3) - Math.pow(cutInSpeed, 3))) /
          1000;
        return (raw / rawMax) * powerRated;
      } else if (speed >= ratedWindSpeed && speed <= cutOutSpeed) {
        return powerRated;
      } else {
        return 0;
      }
    });

    powerCurveChart.data.labels = windSpeeds;
    powerCurveChart.data.datasets[0].data = turbineOutputs; // Puissance éolienne
    powerCurveChart.data.datasets[1].data = windPowerOutputs; // Puissance de vent re-scalée
    powerCurveChart.update();
  }

  // Helper function to format power values in W, kW, or MW
  function formatPower(watts) {
    if (watts >= 1000000) {
      return fmt(watts / 1000000, 2) + " MW";
    } else if (watts >= 1000) {
      return fmt(watts / 1000, 2) + " kW";
    } else {
      return fmt(watts, 2) + " W";
    }
  }
});

// Popup handling snippet
document.addEventListener("DOMContentLoaded", function () {
  const popup = document.getElementById("devicePopup");
  const closeButton = document.getElementById("closePopup");
  const dontShowButton = document.getElementById("dontShowPopup");

  // Check if user already chose not to show the popup
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
