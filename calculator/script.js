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
        // Compute normalized value (0 to 1)
        let x = (windSpeed - cutInSpeed) / (ratedWindSpeed - cutInSpeed);
        // Theoretical power at rated wind speed
        const ratedTheoreticalPower =
          0.5 * airDensity * sweptArea * Math.pow(ratedWindSpeed, 3);
        // S-curve interpolation (smooth start)
        powerOutput =
          ratedTheoreticalPower *
          (3 * Math.pow(x, 2) - 2 * Math.pow(x, 3)) *
          efficiencyFactor;
      } else if (windSpeed >= ratedWindSpeed && windSpeed <= cutOutSpeed) {
        const ratedTheoreticalPower =
          0.5 * airDensity * sweptArea * Math.pow(ratedWindSpeed, 3);
        powerOutput = ratedTheoreticalPower * efficiencyFactor;
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

    // Update charts, passing the rated wind speed from the text input
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

  // Update the power curve chart based on current inputs
  function updateCharts(
    cutInSpeed,
    cutOutSpeed,
    ratedWindSpeed,
    efficiencyFactor,
    airDensity,
    bladeLength
  ) {
    // Create an array for wind speeds 0 to 30 m/s
    const windSpeeds = Array.from({ length: 31 }, (_, i) => i);
    const sweptArea = Math.PI * Math.pow(bladeLength, 2);

    // Compute the rated power (in kW) using the rated wind speed
    const powerRated =
      (0.5 *
        airDensity *
        sweptArea *
        Math.pow(ratedWindSpeed, 3) *
        efficiencyFactor) /
      1000;

    // Determine power output for each wind speed using a piecewise function
    const powerOutputs = windSpeeds.map((speed) => {
      if (speed < cutInSpeed) {
        return 0;
      } else if (speed >= cutInSpeed && speed < ratedWindSpeed) {
        let x = (speed - cutInSpeed) / (ratedWindSpeed - cutInSpeed);
        return powerRated * (3 * Math.pow(x, 2) - 2 * Math.pow(x, 3));
      } else if (speed >= ratedWindSpeed && speed <= cutOutSpeed) {
        return powerRated;
      } else {
        return 0;
      }
    });

    powerCurveChart.data.labels = windSpeeds;
    powerCurveChart.data.datasets[0].data = powerOutputs;
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
