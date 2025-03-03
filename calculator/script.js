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

// Initialize charts
let powerCurveChart;

// Wait for DOM to be ready
document.addEventListener("DOMContentLoaded", function () {
  // Get input elements
  const airDensityInput = document.getElementById("airDensity");
  const bladeLengthInput = document.getElementById("bladeLength");
  const windSpeedInput = document.getElementById("windSpeed");
  const efficiencyFactorInput = document.getElementById("efficiencyFactor");
  const cutInSpeedInput = document.getElementById("cutInSpeed");
  const cutOutSpeedInput = document.getElementById("cutOutSpeed");

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

  // Set up event listeners for inputs
  airDensityInput.addEventListener("input", updateCalculations);
  bladeLengthInput.addEventListener("input", updateCalculations);
  windSpeedInput.addEventListener("input", updateCalculations);
  efficiencyFactorInput.addEventListener("input", updateCalculations);
  cutInSpeedInput.addEventListener("input", updateCalculations);
  cutOutSpeedInput.addEventListener("input", updateCalculations);

  // Initial calculation
  updateCalculations();

  // Helper function to replace decimal dots by commas in number strings
  function fmt(num, decimals) {
    return num.toFixed(decimals).replace(".", ",");
  }

  // Function to update all calculations
  function updateCalculations() {
    // Get input values
    const airDensity = parseFloat(airDensityInput.value);
    const bladeLength = parseFloat(bladeLengthInput.value);
    const windSpeed = parseFloat(windSpeedInput.value);
    const efficiencyFactor = parseFloat(efficiencyFactorInput.value);
    const cutInSpeed = parseFloat(cutInSpeedInput.value);
    const cutOutSpeed = parseFloat(cutOutSpeedInput.value);

    // Check for Betz limit
    if (efficiencyFactor > 0.593) {
      efficiencyWarning.style.display = "block";
    } else {
      efficiencyWarning.style.display = "none";
    }

    // Calculate blade diameter
    const bladeDiameter = 2 * bladeLength;
    bladeDiameterOutput.textContent = fmt(bladeDiameter, 2) + " m";

    // Update diameter formula (using L for longueur de pale)
    diameterFormulaContainer.innerHTML =
      "$$D = 2 \\times L = 2 \\times " +
      fmt(bladeLength, 2) +
      " = " +
      fmt(bladeDiameter, 2) +
      "\\ \\text{m}$$";

    // Calculate swept area
    const sweptArea = Math.PI * Math.pow(bladeLength, 2);
    sweptAreaOutput.textContent = fmt(sweptArea, 2) + " m²";

    // Update area formula (using L instead of r)
    areaFormulaContainer.innerHTML =
      "$$A = \\pi \\times L^2 = \\pi \\times " +
      fmt(bladeLength, 2) +
      "^2 = " +
      fmt(sweptArea, 2) +
      "\\ \\text{m}^2$$";

    // Calculate volume of air per second
    const airVolume = sweptArea * windSpeed;
    airVolumeOutput.textContent = fmt(airVolume, 2) + " m³/s";

    // Update volume formula
    volumeFormulaContainer.innerHTML =
      "$$V = A \\times v = " +
      fmt(sweptArea, 2) +
      " \\times " +
      fmt(windSpeed, 2) +
      " = " +
      fmt(airVolume, 2) +
      "\\ \\text{m}^3/\\text{s}$$";

    // Calculate mass of air per second
    const airMass = airDensity * airVolume;
    airMassOutput.textContent = fmt(airMass, 2) + " kg/s";

    // Update mass formula
    massFormulaContainer.innerHTML =
      "$$m = \\rho \\times V = " +
      fmt(airDensity, 3) +
      " \\times " +
      fmt(airVolume, 2) +
      " = " +
      fmt(airMass, 2) +
      "\\ \\text{kg/s}$$";

    // Calculate theoretical power in wind
    const powerTheory = 0.5 * airMass * Math.pow(windSpeed, 2);
    powerTheoryOutput.textContent = formatPower(powerTheory);

    // Update power theory formula
    powerTheoryFormulaContainer.innerHTML =
      "$$P_{\\mathrm{th}} = \\frac{1}{2} \\times m \\times v^2 = 0,5 \\times " +
      fmt(airMass, 2) +
      " \\times " +
      fmt(windSpeed, 2) +
      "^2 = " +
      fmt(powerTheory, 2) +
      "\\ \\text{W}$$";

    // Calculate actual power output based on efficiency and wind speed constraints
    let powerOutput = 0;
    let windState = "";

    if (windSpeed < cutInSpeed) {
      windState =
        "<div class='wind-state too-slow'>Statut: <b>Non opérationnelle</b> <span class='wind-speed-badge too-slow'>• Vent trop faible</span></div>";
      powerOutput = 0;
    } else if (windSpeed > cutOutSpeed) {
      windState =
        "<div class='wind-state too-fast'>Statut: <b>Arrêt d'urgence</b> <span class='wind-speed-badge too-fast'>• Vent trop fort</span></div>";
      powerOutput = 0;
    } else {
      windState =
        "<div class='wind-state operational'>Statut: <b>En fonctionnement</b> <span class='wind-speed-badge operational'>• Conditions optimales</span></div>";
      powerOutput = powerTheory * efficiencyFactor;
    }

    windStateOutput.innerHTML = windState;
    powerOutputOutput.textContent = formatPower(powerOutput);

    // Update power output formula
    if (powerOutput > 0) {
      powerOutputFormulaContainer.innerHTML =
        "$$P_{\\mathrm{élec}} = P_{\\mathrm{th}} \\times C_p = " +
        fmt(powerTheory, 2) +
        " \\times " +
        fmt(efficiencyFactor, 2) +
        " = " +
        fmt(powerOutput, 2) +
        "\\ \\text{W}$$";
    } else {
      powerOutputFormulaContainer.innerHTML =
        "$$P_{\\mathrm{élec}} = 0 \\ \\text{W (Eolienne non opérationnelle)}$$";
    }

    // Update charts
    updateCharts(
      cutInSpeed,
      cutOutSpeed,
      efficiencyFactor,
      airDensity,
      bladeLength
    );

    // Typeset the math formulas
    if (MathJax && MathJax.typesetPromise) {
      MathJax.typesetPromise();
    } else if (window.MathJax) {
      window.MathJax.typesetPromise && window.MathJax.typesetPromise();
    }
  }

  // Function to initialize charts
  function initCharts() {
    const powerCurveCtx = document
      .getElementById("powerCurveChart")
      .getContext("2d");

    // Initialize power curve chart
    powerCurveChart = new Chart(powerCurveCtx, {
      type: "line",
      data: {
        labels: [],
        datasets: [
          {
            label: "Puissance électrique produite (kW)",
            data: [],
            borderColor: "#3498db",
            backgroundColor: "rgba(52, 152, 219, 0.1)",
            borderWidth: 2,
            fill: true,
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
              text: "Puissance électrique produite (kW)",
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

  // Function to update charts
  function updateCharts(
    cutInSpeed,
    cutOutSpeed,
    efficiencyFactor,
    airDensity,
    bladeLength
  ) {
    // Generate wind speed range for power curve (0-30 m/s)
    const windSpeeds = Array.from({ length: 31 }, (_, i) => i);
    const sweptArea = Math.PI * Math.pow(bladeLength, 2);

    // Calculate power for each wind speed
    const powerOutputs = windSpeeds.map((speed) => {
      if (speed < cutInSpeed || speed > cutOutSpeed) {
        return 0;
      } else {
        // Power in kW
        const power =
          (0.5 *
            airDensity *
            sweptArea *
            Math.pow(speed, 3) *
            efficiencyFactor) /
          1000;
        return power;
      }
    });

    // Update power curve chart
    powerCurveChart.data.labels = windSpeeds;
    powerCurveChart.data.datasets[0].data = powerOutputs;
    powerCurveChart.update();
  }

  // Helper function to format power values
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
