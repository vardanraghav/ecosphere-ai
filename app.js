/* ==========================================================================
   ECOSPHERE AI - PLATFORM CONTROLLER & INTEL ENGINE
   Real-Time Calculations, Dynamic 2D Canvas Earth, Chart.js & Chatbot
   ========================================================================== */

// 1. GLOBAL STATE & BASELINE VALUES (Alarming Impact is our comparative baseline)
const BASELINE = {
    acHours: 18,
    appliances: 12,
    travelMode: 'petrol',
    distance: 65,
    waterLiters: 360,
    waterWastage: true,
    plasticBottles: 25,
    plasticBags: true,
    foodWaste: 3, // Extreme
    dailyCo2: 21.82,
    dailyWater: 360,
    ecoScore: 24
};

let currentState = {
    acHours: 8,
    appliances: 6,
    travelMode: 'petrol',
    distance: 30,
    waterLiters: 200,
    waterWastage: false,
    plasticBottles: 12,
    plasticBags: true,
    foodWaste: 2, // Frequent
    dailyCo2: 0,
    dailyWater: 0,
    ecoScore: 0
};

// Rates & Constants
const ELEC_CO2_PER_AC_HR = 1.35; // kg CO2
const ELEC_CO2_PER_UNIT = 0.40;   // kg CO2
const ELEC_RATE_PER_KWH = 8;     // ₹
const ELEC_AC_KWH = 1.5;         // kWh/hour

const TRANSPORT_FACTORS = {
    walk: 0.00,
    ev: 0.03,
    transit: 0.04,
    bike: 0.11,
    petrol: 0.18
};

const TRANSPORT_COSTS = {
    walk: 0,
    ev: 1.0,
    transit: 1.5,
    bike: 2.5,
    petrol: 8.0
};

const WATER_CO2_PER_LITER = 0.0003; // kg CO2 per liter
const WATER_RATE_PER_L = 0.15;      // ₹ cost

const PLASTIC_CO2_PER_BOTTLE = 0.12; // kg CO2
const PLASTIC_BOTTLE_COST = 20;      // ₹ cost

const FOOD_WASTE_DATA = [
    { label: "Never", co2: 0.10, penalty: 0 },
    { label: "Rare", co2: 0.50, penalty: 5 },
    { label: "Frequent", co2: 1.50, penalty: 15 },
    { label: "Extreme", co2: 3.00, penalty: 30 }
];

// Document Elements cache
let breakdownChart = null;
let predictionChart = null;
let earthRotationAngle = 0;
let earthAnimationFrameId = null;
let interpolatedEcoScore = 72; // Smooth tracking for state transitions
let hudRingRotation = 0; // Rotation tracking for planet HUD rings

// Initialize app when window loads
window.addEventListener('load', () => {
    // Populate slider bubbles and wire events
    initSliders();
    
    // Render Charts
    initCharts();
    
    // Set initial baseline comparison stats and populate charts with live calculated data
    updateCalculations(true);
    
    // Run Earth visual loop
    initEarthCanvas();
    
    // Generate background atmosphere particles
    initBackgroundAtmosphere();
    
    // Run cinematic startup loader timeline
    runLoaderSequence();
});

function runLoaderSequence() {
    const loader = document.getElementById('app-loader');
    const bar = document.getElementById('loader-bar-fill');
    const statusText = document.getElementById('loader-status-text');
    
    const steps = [
        { progress: 15, text: "Initializing Eco-Intelligence Core..." },
        { progress: 38, text: "Loading predictive climate action formulas..." },
        { progress: 62, text: "Calibrating lifestyle optimization ratios..." },
        { progress: 85, text: "Retrieving campus standing & standings..." },
        { progress: 100, text: "Establishing climate action protocols..." }
    ];
    
    let stepIndex = 0;
    
    function nextStep() {
        if (stepIndex < steps.length) {
            const step = steps[stepIndex];
            bar.style.width = `${step.progress}%`;
            statusText.textContent = step.text;
            stepIndex++;
            setTimeout(nextStep, 450); // Snappy build-up
        } else {
            // Loader completes! Fade out dashboard loader
            setTimeout(() => {
                loader.classList.add('fade-out');
                
                // Show AI bot welcome message with typewriter stream!
                setTimeout(() => {
                    showThinkingIndicator();
                    setTimeout(() => {
                        hideThinkingIndicator();
                        addBotMessage("Hello! I am your <strong>Eco-Intelligence Assistant</strong>. 🌍<br><br>I've loaded the <strong>Typical Student</strong> profile. You can drag the sliders on the left or select the presets at the top to simulate lifestyle improvements in real-time. Notice how your score, charts, savings, and the Earth's atmosphere change dynamically!");
                    }, 800);
                }, 500);
            }, 300);
        }
    }
    
    nextStep();
}

// 2. INITIALIZE SLIDERS AND EVENT LISTENERS
function initSliders() {
    const inputs = [
        { id: 'input-ac-hours', bubbleId: 'val-ac-hours', stateKey: 'acHours', type: 'slider' },
        { id: 'input-appliances', bubbleId: 'val-appliances', stateKey: 'appliances', type: 'slider' },
        { id: 'input-distance', bubbleId: 'val-distance', stateKey: 'distance', type: 'slider' },
        { id: 'input-water', bubbleId: 'val-water', stateKey: 'waterLiters', type: 'slider' },
        { id: 'input-plastic', bubbleId: 'val-plastic', stateKey: 'plasticBottles', type: 'slider' },
        { id: 'input-food-waste', bubbleId: 'lbl-food-waste', stateKey: 'foodWaste', type: 'food' },
        { id: 'input-water-wastage', stateKey: 'waterWastage', type: 'checkbox' },
        { id: 'input-plastic-bags', stateKey: 'plasticBags', type: 'checkbox' }
    ];

    inputs.forEach(input => {
        const el = document.getElementById(input.id);
        if (!el) return;

        if (input.type === 'slider') {
            el.addEventListener('input', (e) => {
                const val = parseFloat(e.target.value);
                document.getElementById(input.bubbleId).textContent = val;
                currentState[input.stateKey] = val;
                updateCalculations(true);
            });
        } else if (input.type === 'food') {
            el.addEventListener('input', (e) => {
                const val = parseInt(e.target.value);
                const label = FOOD_WASTE_DATA[val].label;
                document.getElementById(input.bubbleId).textContent = label;
                currentState[input.stateKey] = val;
                updateCalculations(true);
            });
        } else if (input.type === 'checkbox') {
            el.addEventListener('change', (e) => {
                currentState[input.stateKey] = e.target.checked;
                updateCalculations(true);
            });
        }
    });

    // Travel radio buttons
    const radios = document.querySelectorAll('input[name="travelMode"]');
    radios.forEach(radio => {
        radio.addEventListener('change', (e) => {
            if (e.target.checked) {
                currentState.travelMode = e.target.value;
                
                // Update badge label
                const labelText = {
                    walk: 'Walk/Cycle',
                    ev: 'Electric Veh',
                    transit: 'Public Transit',
                    bike: 'Motorcycle',
                    petrol: 'Petrol Car'
                }[e.target.value];
                document.getElementById('val-transport-mode-text').textContent = labelText;
                
                updateCalculations(true);
            }
        });
    });
}

// 3. PRESETS CONTROLLER
function applyPreset(presetType) {
    // Remove active class from all preset buttons
    document.querySelectorAll('.btn-preset').forEach(btn => btn.classList.remove('active'));
    
    // Clear dynamic body preset themes
    document.body.classList.remove('preset-theme-green', 'preset-theme-red', 'preset-theme-blue');
    
    // Trigger screen glitch-shake command center feedback!
    const appContainer = document.querySelector('.app-container');
    if (appContainer) {
        appContainer.classList.add('glitch-shake');
        setTimeout(() => {
            appContainer.classList.remove('glitch-shake');
        }, 460);
    }
    
    if (presetType === 'alarm') {
        document.getElementById('btn-preset-alarm').classList.add('active');
        document.body.classList.add('preset-theme-red');
        setFormInputs({
            acHours: 18,
            appliances: 12,
            travelMode: 'petrol',
            distance: 65,
            waterLiters: 360,
            waterWastage: true,
            plasticBottles: 25,
            plasticBags: true,
            foodWaste: 3
        });
        
        // Custom typewriter bot sequence with thinking indicator
        showThinkingIndicator();
        setTimeout(() => {
            hideThinkingIndicator();
            addBotMessage("🚨 <strong>SYSTEM EMERGENCY ACTIVE: Alarming Impact Profile</strong>.<br><br>Warning! High AC loads, long commutes in a petrol car, leaking water resources, packaging waste, and extreme food leftovers have been activated.<br><br>The Earth's atmosphere has degraded to a desolated <strong>critical state</strong>, oceans are stagnant sludge, and your ECE Department campus standing has fallen to <strong>Rank #3</strong> with a warning warning badge!");
        }, 650);

    } else if (presetType === 'student') {
        document.getElementById('btn-preset-student').classList.add('active');
        document.body.classList.add('preset-theme-blue');
        setFormInputs({
            acHours: 8,
            appliances: 6,
            travelMode: 'petrol',
            distance: 30,
            waterLiters: 200,
            waterWastage: false,
            plasticBottles: 12,
            plasticBags: true,
            foodWaste: 2
        });
        
        showThinkingIndicator();
        setTimeout(() => {
            hideThinkingIndicator();
            addBotMessage("🎓 <strong>Preset Activated: Typical Campus Student</strong>.<br><br>This is a moderate profile: some AC during study hours, travel by petrol car or motorbike, standard water usage, moderate packaging waste, and typical food discard. A solid base to begin optimizing!");
        }, 650);

    } else if (presetType === 'warrior') {
        document.getElementById('btn-preset-warrior').classList.add('active');
        document.body.classList.add('preset-theme-green');
        setFormInputs({
            acHours: 1,
            appliances: 2,
            travelMode: 'walk',
            distance: 10,
            waterLiters: 80,
            waterWastage: false,
            plasticBottles: 0,
            plasticBags: false,
            foodWaste: 0
        });
        
        showThinkingIndicator();
        setTimeout(() => {
            hideThinkingIndicator();
            addBotMessage("🌱 <strong>GLOBAL EQUILIBRIUM SECURED: Green Eco-Warrior</strong>.<br><br>Excellent! This simulates an highly sustainable, low-carbon lifestyle: minimal AC, active walking/cycling for transit, conscious water saving, zero single-use plastics, and zero leftovers waste.<br><br>The Earth is healthy, leaf particles are floating, and the ECE department climbs to **Rank #1** in campus standing! Outstanding leadership!");
        }, 650);
    }
}

function setFormInputs(data) {
    currentState = { ...currentState, ...data };

    // Update range elements in UI
    document.getElementById('input-ac-hours').value = data.acHours;
    document.getElementById('val-ac-hours').textContent = data.acHours;

    document.getElementById('input-appliances').value = data.appliances;
    document.getElementById('val-appliances').textContent = data.appliances;

    document.getElementById('input-distance').value = data.distance;
    document.getElementById('val-distance').textContent = data.distance;

    document.getElementById('input-water').value = data.waterLiters;
    document.getElementById('val-water').textContent = data.waterLiters;

    document.getElementById('input-plastic').value = data.plasticBottles;
    document.getElementById('val-plastic').textContent = data.plasticBottles;

    document.getElementById('input-food-waste').value = data.foodWaste;
    document.getElementById('lbl-food-waste').textContent = FOOD_WASTE_DATA[data.foodWaste].label;

    document.getElementById('input-water-wastage').checked = data.waterWastage;
    document.getElementById('input-plastic-bags').checked = data.plasticBags;

    // Check correct radio button
    document.getElementById(`mode-${data.travelMode}`).checked = true;
    
    // Update badge labels
    const labelText = {
        walk: 'Walk/Cycle',
        ev: 'Electric Veh',
        transit: 'Public Transit',
        bike: 'Motorcycle',
        petrol: 'Petrol Car'
    }[data.travelMode];
    document.getElementById('val-transport-mode-text').textContent = labelText;

    updateCalculations();
}

// 4. MAIN CALCULATIONS ENGINE
function updateCalculations(instant = false) {
    // 4.1 Carbon Footprint calculations (Daily emissions in kg CO2)
    const elecCo2 = (currentState.acHours * ELEC_CO2_PER_AC_HR) + (currentState.appliances * ELEC_CO2_PER_UNIT);
    
    const transportFactor = TRANSPORT_FACTORS[currentState.travelMode];
    const transportCo2 = currentState.distance * transportFactor;
    
    const waterWastagePenaltyCo2 = currentState.waterWastage ? 0.40 : 0.00;
    const waterCo2 = (currentState.waterLiters * WATER_CO2_PER_LITER) + waterWastagePenaltyCo2;
    
    const plasticBagPenaltyCo2 = currentState.plasticBags ? 0.30 : 0.00;
    const plasticCo2 = (currentState.plasticBottles / 7 * PLASTIC_CO2_PER_BOTTLE) + plasticBagPenaltyCo2;
    
    const foodCo2 = FOOD_WASTE_DATA[currentState.foodWaste].co2;
    
    const totalDailyCo2 = elecCo2 + transportCo2 + waterCo2 + plasticCo2 + foodCo2;
    currentState.dailyCo2 = totalDailyCo2;
    currentState.dailyWater = currentState.waterLiters;

    // 4.2 Eco Score calculation (10 - 100 scale)
    let acDeduction = currentState.acHours * 2.0;
    let applianceDeduction = currentState.appliances * 1.2;
    
    // Transport deduction weighted by mode
    let transportDeduction = transportCo2 * 4.0;
    
    // Water deduction
    let waterDeduction = 0;
    if (currentState.waterLiters > 100) {
        waterDeduction = (currentState.waterLiters - 100) * 0.08;
    }
    if (currentState.waterWastage) waterDeduction += 8;
    
    // Plastic deduction
    let plasticDeduction = currentState.plasticBottles * 0.7;
    if (currentState.plasticBags) plasticDeduction += 6;
    
    // Food deduction
    let foodDeduction = FOOD_WASTE_DATA[currentState.foodWaste].penalty;

    let totalScore = 100 - (acDeduction + applianceDeduction + transportDeduction + waterDeduction + plasticDeduction + foodDeduction);
    currentState.ecoScore = Math.max(12, Math.min(100, Math.round(totalScore)));

    // 4.3 Update UI Widgets
    updateUI(elecCo2, transportCo2, waterCo2, plasticCo2, foodCo2);
    
    // 4.4 Live Charts Update
    updateCharts(elecCo2, transportCo2, waterCo2, plasticCo2, foodCo2, instant);
}

// 5. UPDATE UI VIEW & TICKERS
function updateUI(elecCo2, transportCo2, waterCo2, plasticCo2, foodCo2) {
    // Score ring progress bar
    const scoreVal = currentState.ecoScore;
    document.getElementById('score-num').textContent = scoreVal;
    
    // Calculate circular stroke-dashoffset (Radius = 92, Perimeter = 2 * PI * 92 = 578)
    const strokeDashOffset = 578 - (578 * scoreVal) / 100;
    const progressRing = document.getElementById('score-ring-progress');
    progressRing.style.strokeDashoffset = strokeDashOffset;

    // Get color & status classes
    let statusClass = 'status-moderately';
    let statusText = 'Moderately Sustainable';
    let scoreColor = 'var(--color-moderate)';
    
    if (scoreVal >= 80) {
        statusClass = 'status-friendly';
        statusText = 'Eco Friendly';
        scoreColor = 'var(--color-friendly)';
    } else if (scoreVal >= 60) {
        statusClass = 'status-moderately';
        statusText = 'Moderately Sustainable';
        scoreColor = 'var(--color-moderate)';
    } else if (scoreVal >= 40) {
        statusClass = 'status-unsustainable';
        statusText = 'Unsustainable';
        scoreColor = 'var(--color-unsustainable)';
    } else {
        statusClass = 'status-highimpact';
        statusText = 'High Environmental Impact';
        scoreColor = 'var(--color-danger)';
    }

    progressRing.style.stroke = scoreColor;

    // Update Earth visual containers
    const earthHalo = document.getElementById('earth-halo');
    earthHalo.className = `earth-halo-glow ${statusClass}`;
    
    const statusBadge = document.getElementById('status-badge');
    statusBadge.className = `status-badge ${statusClass}`;
    
    // Update badge checkmark icon based on score
    const statusIcon = statusBadge.querySelector('i');
    statusIcon.className = scoreVal >= 60 ? 'fa-solid fa-circle-check' : 'fa-solid fa-triangle-exclamation';
    
    document.getElementById('status-text').textContent = statusText;

    // Update real-time header badges for each optimizer category
    const electricityCost = Math.round((currentState.acHours * 1.5 * 30 * 8) + (currentState.appliances * 0.4 * 30 * 8));
    document.getElementById('val-electricity-cost').textContent = '₹' + electricityCost.toLocaleString() + '/mo';

    let waterRating = "Standard";
    if (currentState.waterLiters <= 100 && !currentState.waterWastage) waterRating = "Excellent";
    else if (currentState.waterLiters <= 180 && !currentState.waterWastage) waterRating = "Efficient";
    else if (currentState.waterLiters > 300 || currentState.waterWastage) waterRating = "Excessive";
    document.getElementById('val-water-efficiency').textContent = waterRating;

    let plasticRating = "Moderate";
    if (currentState.plasticBottles <= 2 && !currentState.plasticBags) plasticRating = "Zero Plastic";
    else if (currentState.plasticBottles <= 10 && !currentState.plasticBags) plasticRating = "Low Waste";
    else if (currentState.plasticBottles > 20 || currentState.plasticBags) plasticRating = "High Waste";
    document.getElementById('val-plastic-level').textContent = plasticRating;

    const foodImpactLabels = ["Zero Waste", "Low Scraps", "Frequent Leftovers", "Severe Waste"];
    document.getElementById('val-food-impact').textContent = foodImpactLabels[currentState.foodWaste];

    // 5.1 Dynamic Particle Emitter runs automatically inside the Canvas frame loop

    // 5.2 Live Tickers Calculations (Compare Current vs BASELINE [Alarming Profile])
    // Base Baseline daily water: 360L, daily co2: 21.82 kg
    const baseDailyCo2 = BASELINE.dailyCo2;
    const baseDailyWater = BASELINE.dailyWater;

    // Annual Money Saved (₹)
    // Electricity Cash saved
    const baselineAcCost = BASELINE.acHours * ELEC_AC_KWH * 30 * ELEC_RATE_PER_KWH;
    const currentAcCost = currentState.acHours * ELEC_AC_KWH * 30 * ELEC_RATE_PER_KWH;
    const electricitySavingsAnnual = (baselineAcCost - currentAcCost) * 12;

    // Transport Cash saved
    const baselineTransportCost = BASELINE.distance * TRANSPORT_COSTS.petrol * 365;
    const currentTransportCost = currentState.distance * TRANSPORT_COSTS[currentState.travelMode] * 365;
    const transportSavingsAnnual = Math.max(0, baselineTransportCost - currentTransportCost);

    // Water Cash saved
    const waterSavingsAnnual = Math.max(0, (baseDailyWater - currentState.waterLiters) * 365 * WATER_RATE_PER_L);

    // Plastic Cash saved
    const baselinePlasticCost = BASELINE.plasticBottles * 52 * PLASTIC_BOTTLE_COST;
    const currentPlasticCost = currentState.plasticBottles * 52 * PLASTIC_BOTTLE_COST;
    const plasticSavingsAnnual = baselinePlasticCost - currentPlasticCost;

    // Total Savings
    const totalCashSavedAnnual = Math.max(0, Math.round(electricitySavingsAnnual + transportSavingsAnnual + waterSavingsAnnual + plasticSavingsAnnual));
    animateTicker('save-cash', totalCashSavedAnnual);

    // Annual CO2 prevented in kg
    const co2SavedAnnual = Math.max(0, Math.round((baseDailyCo2 - currentState.dailyCo2) * 365));
    animateTicker('save-co2', co2SavedAnnual);

    // Annual Water Saved in Liters
    const waterSavedAnnual = Math.max(0, Math.round((baseDailyWater - currentState.waterLiters) * 365));
    animateTicker('save-water', waterSavedAnnual);

    // Trees Equivalent
    const treesEquivalent = Math.max(0, (co2SavedAnnual / 22)).toFixed(1);
    document.getElementById('save-trees').textContent = treesEquivalent;

    // 5.3 Campus Standings & Rank Shift (JUDGE WOW EFFECT)
    const campusRankVal = document.getElementById('campus-rank-val');
    if (scoreVal >= 82) {
        campusRankVal.innerHTML = 'Rank #1 <span class="rank-pct" style="color:var(--color-friendly)">🏆 Leader! (Top 1%)</span>';
        campusRankVal.style.color = 'var(--color-friendly)';
        campusRankVal.style.textShadow = '0 0 10px rgba(16, 185, 129, 0.4)';
    } else if (scoreVal >= 55) {
        campusRankVal.innerHTML = 'Rank #2 <span class="rank-pct">(Top 5%)</span>';
        campusRankVal.style.color = '#fff';
        campusRankVal.style.textShadow = 'none';
    } else {
        campusRankVal.innerHTML = 'Rank #3 <span class="rank-pct" style="color:var(--color-danger)">⚠️ Warning! (Bottom 20%)</span>';
        campusRankVal.style.color = 'var(--color-danger)';
        campusRankVal.style.textShadow = '0 0 10px rgba(239, 68, 68, 0.4)';
    }

    // Leaderboard Live Update
    updateLeaderboard();

    // 5.4 Update Before vs After comparison Table
    document.getElementById('comp-opt-score').textContent = scoreVal;
    document.getElementById('comp-diff-score').textContent = `+${Math.max(0, scoreVal - BASELINE.ecoScore)} pts`;
    
    document.getElementById('comp-opt-co2').textContent = `${Math.round(currentState.dailyCo2 * 30)} kg`;
    const co2ReductionPct = Math.max(0, Math.round((1 - (currentState.dailyCo2 / BASELINE.dailyCo2)) * 100));
    document.getElementById('comp-diff-co2').textContent = `-${co2ReductionPct}%`;

    document.getElementById('comp-opt-water').textContent = `${Math.round(currentState.waterLiters * 30 / 1000 * 10) / 10}k L`;
    const waterReductionPct = Math.max(0, Math.round((1 - (currentState.waterLiters / BASELINE.waterLiters)) * 100));
    document.getElementById('comp-diff-water').textContent = `-${waterReductionPct}%`;

    // 5.5 Update AI suggestions cards (under Earth)
    updateAiRecommendationsList(elecCo2, transportCo2, waterCo2, plasticCo2, foodCo2);
}

// 6. TICKER ANIMATION HELPER
const activeTickers = {};

function animateTicker(elementId, targetValue) {
    const el = document.getElementById(elementId);
    if (!el) return;
    
    const currentValue = parseInt(el.textContent.replace(/,/g, '')) || 0;
    if (currentValue === targetValue) return;
    
    // Cancel any active animation frame loop on this element to prevent parallel rendering conflicts
    if (activeTickers[elementId]) {
        cancelAnimationFrame(activeTickers[elementId]);
    }
    
    const duration = 400; // Snappy 400ms duration for better command center reactivity
    const startTime = performance.now();
    
    function updateTicker(now) {
        const elapsed = now - startTime;
        const progress = Math.min(elapsed / duration, 1);
        
        // Ease out quad
        const easeProgress = progress * (2 - progress);
        const nextValue = Math.round(currentValue + (targetValue - currentValue) * easeProgress);
        
        el.textContent = nextValue.toLocaleString();
        
        if (progress < 1) {
            activeTickers[elementId] = requestAnimationFrame(updateTicker);
        } else {
            activeTickers[elementId] = null;
        }
    }
    
    activeTickers[elementId] = requestAnimationFrame(updateTicker);
}



// 8. CAMPUS LEADERBOARD LIVE UPDATE
function updateLeaderboard() {
    const userScore = currentState.ecoScore;
    const leaderboardList = document.getElementById('leaderboard-list');
    
    // CS is fixed at 81. Mechanical is 61. 
    // ECE represents the user's actual department standing score
    const eceAverage = userScore;

    const departments = [
        { name: "Computer Science Dept", score: 81, isUser: false },
        { name: "ECE Department (You)", score: eceAverage, isUser: true },
        { name: "Mechanical Dept", score: 61, isUser: false }
    ];

    // Sort departments
    departments.sort((a, b) => b.score - a.score);

    leaderboardList.innerHTML = '';
    departments.forEach((dept, index) => {
        const item = document.createElement('div');
        item.className = `leaderboard-item ${dept.isUser ? 'user-dept' : ''}`;
        
        let rankMedal = `#${index + 1}`;
        if (index === 0) rankMedal = '🥇 #1';
        else if (index === 1) rankMedal = '🥈 #2';
        else if (index === 2) rankMedal = '🥉 #3';

        item.innerHTML = `
            <div class="item-rank">${rankMedal}</div>
            <div class="item-name">${dept.name}</div>
            <div class="item-score font-mono">${dept.score}</div>
        `;
        leaderboardList.appendChild(item);
    });
}

// 9. DYNAMIC AI RECOMMENDATIONS LIST (Under Earth)
function updateAiRecommendationsList(elec, transport, water, plastic, food) {
    const container = document.getElementById('insights-container');
    container.innerHTML = '';

    const list = [];

    // Check biggest polluters
    if (currentState.acHours >= 10) {
        list.push({
            icon: 'fa-bolt font-amber',
            title: 'High AC Emissions Detected',
            text: `Reducing AC usage to 5 hrs/day saves ₹${Math.round((currentState.acHours - 5) * 1.5 * 30 * 8)}/mo and boosts Eco Score by ${Math.round((currentState.acHours - 5) * 2)} points!`
        });
    }

    if (currentState.travelMode === 'petrol' && currentState.distance >= 25) {
        list.push({
            icon: 'fa-car-side font-cyan',
            title: 'Heavy Petrol Car Travel',
            text: 'Switching travel mode to EV or public transit doubles travel efficiency and prevents massive carbon footprints.'
        });
    }

    if (currentState.waterLiters >= 250 || currentState.waterWastage) {
        list.push({
            icon: 'fa-droplet font-blue',
            title: 'Sub-Optimal Water Habit',
            text: currentState.waterWastage 
                ? 'Fixing leaks and shortening shower times lifts Eco Score by 8 points instantly!'
                : 'Consuming water carefully is essential. Try aiming for 150L daily.'
        });
    }

    if (currentState.plasticBottles >= 15 || currentState.plasticBags) {
        list.push({
            icon: 'fa-recycle font-pink',
            title: 'High Packaging Impact',
            text: 'Ditching single-use mineral bottles for a reusable metal flask prevents tons of landfill packaging waste.'
        });
    }

    if (currentState.foodWaste >= 2) {
        list.push({
            icon: 'fa-utensils font-emerald',
            title: 'Food Waste Contributor',
            text: 'Composting leftovers rather than throwing them to trash stops methane gas formation in local dump yards.'
        });
    }

    // Default encouragement
    if (list.length === 0) {
        list.push({
            icon: 'fa-thumbs-up font-green',
            title: 'Exemplary Environmental Path',
            text: 'Your current lifestyle choices are outstanding! Continue practicing green habits and encourage others!'
        });
    }

    // Add first 2 to the UI
    list.slice(0, 2).forEach(item => {
        const card = document.createElement('div');
        card.className = 'insight-card';
        card.innerHTML = `
            <i class="fa-solid ${item.icon}"></i>
            <div class="insight-details">
                <h4>${item.title}</h4>
                <p>${item.text}</p>
            </div>
        `;
        container.appendChild(card);
    });
}

// 10. CHART.JS INTERFACE MANAGER
function initCharts() {
    // Chart 1: Doughnut Breakdown
    const ctxBreakdown = document.getElementById('chart-breakdown').getContext('2d');
    breakdownChart = new Chart(ctxBreakdown, {
        type: 'doughnut',
        data: {
            labels: ['Electricity', 'Transport', 'Water', 'Plastic', 'Food Waste'],
            datasets: [{
                data: [5, 4, 1, 1, 1],
                backgroundColor: [
                    '#eab308', // Yellow
                    '#06b6d4', // Cyan
                    '#3b82f6', // Blue
                    '#ec4899', // Pink
                    '#10b981'  // Emerald
                ],
                borderWidth: 2,
                borderColor: '#0d1425'
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            animation: {
                duration: 800,
                easing: 'easeOutQuart'
            },
            plugins: {
                legend: {
                    position: 'right',
                    labels: {
                        color: '#9ca3af',
                        font: { size: 9, family: 'Outfit', weight: '500' },
                        boxWidth: 8,
                        padding: 6
                    }
                },
                tooltip: {
                    backgroundColor: 'rgba(13, 20, 37, 0.85)',
                    titleColor: '#fff',
                    bodyColor: '#e5e7eb',
                    borderColor: 'rgba(255, 255, 255, 0.1)',
                    borderWidth: 1,
                    cornerRadius: 8,
                    padding: 8,
                    bodyFont: { family: 'Outfit', size: 10 },
                    titleFont: { family: 'Outfit', size: 11, weight: 'bold' }
                }
            },
            cutout: '74%'
        },
        plugins: [doughnutCenterTextPlugin]
    });

    // Chart 2: Future Projections
    const ctxPrediction = document.getElementById('chart-prediction').getContext('2d');
    
    // Create beautiful neon linear gradients for backgrounds
    const greenGrad = ctxPrediction.createLinearGradient(0, 0, 0, 160);
    greenGrad.addColorStop(0, 'rgba(16, 185, 129, 0.22)');
    greenGrad.addColorStop(1, 'rgba(16, 185, 129, 0.0)');
    
    const redGrad = ctxPrediction.createLinearGradient(0, 0, 0, 160);
    redGrad.addColorStop(0, 'rgba(239, 68, 68, 0.20)');
    redGrad.addColorStop(1, 'rgba(239, 68, 68, 0.0)');

    predictionChart = new Chart(ctxPrediction, {
        type: 'line',
        data: {
            labels: ['2026', '2027', '2028', '2029', '2030'],
            datasets: [
                {
                    label: 'Business as Usual',
                    data: [8.0, 16.0, 24.0, 32.0, 40.0],
                    borderColor: '#ef4444',
                    borderWidth: 2.0,
                    backgroundColor: redGrad,
                    fill: true,
                    tension: 0.35, // Curved lines
                    pointRadius: 2,
                    pointHoverRadius: 4
                },
                {
                    label: 'Optimized Path',
                    data: [4.0, 8.0, 12.0, 16.0, 20.0],
                    borderColor: '#10b981',
                    borderWidth: 2.5,
                    backgroundColor: greenGrad,
                    fill: true,
                    tension: 0.35, // Curved lines
                    pointRadius: 4,
                    pointHoverRadius: 6,
                    pointBackgroundColor: '#10b981',
                    pointBorderColor: '#ffffff',
                    pointBorderWidth: 1.5
                }
            ]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            animation: {
                duration: 800,
                easing: 'easeOutQuart'
            },
            plugins: {
                legend: { display: false },
                tooltip: {
                    backgroundColor: 'rgba(13, 20, 37, 0.85)',
                    titleColor: '#fff',
                    bodyColor: '#e5e7eb',
                    borderColor: 'rgba(255, 255, 255, 0.1)',
                    borderWidth: 1,
                    cornerRadius: 8,
                    padding: 8,
                    bodyFont: { family: 'Outfit', size: 10 },
                    titleFont: { family: 'Outfit', size: 11, weight: 'bold' }
                }
            },
            scales: {
                x: {
                    grid: { color: 'rgba(255, 255, 255, 0.02)', drawBorder: false },
                    ticks: { color: '#9ca3af', font: { family: 'Share Tech Mono', size: 9 } }
                },
                y: {
                    grid: { color: 'rgba(255, 255, 255, 0.02)', drawBorder: false },
                    ticks: { color: '#9ca3af', font: { family: 'Share Tech Mono', size: 9 } }
                }
            }
        },
        plugins: [chartShadowPlugin]
    });
}

function updateCharts(elec, transport, water, plastic, food, instant = false) {
    if (!breakdownChart || !predictionChart) return;

    // Update Doughnut data
    breakdownChart.data.datasets[0].data = [
        parseFloat(elec.toFixed(2)),
        parseFloat(transport.toFixed(2)),
        parseFloat(water.toFixed(2)),
        parseFloat(plastic.toFixed(2)),
        parseFloat(food.toFixed(2))
    ];
    breakdownChart.update(instant ? 'none' : undefined);

    // Update line graph prediction lines
    // Baseline daily emissions: 21.82 kg/day
    // Cumulative tons of CO2 over 5 years (Tons = kg * 365 / 1000)
    const baseTonsPerYear = (BASELINE.dailyCo2 * 365) / 1000;
    const currentTonsPerYear = (currentState.dailyCo2 * 365) / 1000;

    let baseCumulative = [];
    let currentCumulative = [];
    
    for (let i = 1; i <= 5; i++) {
        baseCumulative.push(parseFloat((baseTonsPerYear * i).toFixed(1)));
        currentCumulative.push(parseFloat((currentTonsPerYear * i).toFixed(1)));
    }

    predictionChart.data.datasets[0].data = baseCumulative;
    predictionChart.data.datasets[1].data = currentCumulative;
    predictionChart.update(instant ? 'none' : undefined);
}

// 11. HIGH-TECH PROCEDURAL ROTATING EARTH CANVAS
function initEarthCanvas() {
    const canvas = document.getElementById('earth-canvas');
    const ctx = canvas.getContext('2d');
    const crackedOverlay = document.getElementById('earth-cracks');

    // High-fidelity continent coordinates (detailed paths from 0 to 1 relative scale)
    const landmasses = [
        // North America
        [
            {x: 0.10, y: 0.16}, {x: 0.16, y: 0.13}, {x: 0.24, y: 0.22},
            {x: 0.28, y: 0.26}, {x: 0.20, y: 0.36}, {x: 0.16, y: 0.38},
            {x: 0.17, y: 0.44}, {x: 0.11, y: 0.40}, {x: 0.08, y: 0.30}
        ],
        // South America
        [
            {x: 0.18, y: 0.46}, {x: 0.24, y: 0.50}, {x: 0.27, y: 0.60},
            {x: 0.21, y: 0.76}, {x: 0.18, y: 0.84}, {x: 0.14, y: 0.74},
            {x: 0.15, y: 0.62}, {x: 0.13, y: 0.52}
        ],
        // Africa
        [
            {x: 0.43, y: 0.40}, {x: 0.52, y: 0.38}, {x: 0.56, y: 0.45},
            {x: 0.54, y: 0.60}, {x: 0.47, y: 0.72}, {x: 0.44, y: 0.66},
            {x: 0.40, y: 0.58}, {x: 0.39, y: 0.48}
        ],
        // Eurasia
        [
            {x: 0.38, y: 0.12}, {x: 0.48, y: 0.08}, {x: 0.66, y: 0.11},
            {x: 0.76, y: 0.22}, {x: 0.70, y: 0.34}, {x: 0.61, y: 0.37},
            {x: 0.54, y: 0.31}, {x: 0.48, y: 0.35}, {x: 0.42, y: 0.29},
            {x: 0.35, y: 0.22}
        ],
        // Greenland
        [
            {x: 0.24, y: 0.06}, {x: 0.32, y: 0.05}, {x: 0.30, y: 0.11},
            {x: 0.21, y: 0.09}
        ],
        // Australia
        [
            {x: 0.73, y: 0.62}, {x: 0.82, y: 0.65}, {x: 0.80, y: 0.75},
            {x: 0.72, y: 0.72}, {x: 0.70, y: 0.66}
        ],
        // Asia islands
        [
            {x: 0.57, y: 0.33}, {x: 0.61, y: 0.31}, {x: 0.59, y: 0.36}
        ],
        [
            {x: 0.65, y: 0.44}, {x: 0.70, y: 0.41}, {x: 0.68, y: 0.47}
        ]
    ];

    // Atmospheric concentric orbital HUD rings (Saturn-tilted)
    function drawAtmosphericRings(ctx, center, hudColors, delta = 1) {
        hudRingRotation += 0.003 * delta;
        
        // Add dynamic breathing scale to orbits
        const pulseScale = Math.sin(performance.now() / 850) * 2;
        const innerRing = `rgba(${hudColors[0]}, ${hudColors[1]}, ${hudColors[2]}, ${hudColors[3]})`;
        const outerRing = `rgba(${hudColors[0]}, ${hudColors[1]}, ${hudColors[2]}, ${hudColors[4]})`;

        ctx.save();
        ctx.translate(center, center);
        ctx.rotate(-0.18); // Tilted layout orbit

        // Inner ring spinning backwards
        ctx.strokeStyle = innerRing;
        ctx.lineWidth = 1.0;
        ctx.setLineDash([4, 12]);
        ctx.lineDashOffset = -hudRingRotation * 100;
        ctx.beginPath();
        ctx.ellipse(0, 0, 132 + pulseScale * 0.5, 28 + pulseScale * 0.1, 0, 0, Math.PI * 2);
        ctx.stroke();

        // Main outer glowing HUD orbit track
        ctx.strokeStyle = outerRing;
        ctx.lineWidth = 1.5;
        ctx.setLineDash([6, 15]);
        ctx.lineDashOffset = hudRingRotation * 120;
        ctx.beginPath();
        ctx.ellipse(0, 0, 175 + pulseScale, 40 + pulseScale * 0.2, 0, 0, Math.PI * 2);
        ctx.stroke();

        ctx.restore();
    }

    // Swirling atmospheric white clouds (layered 3D counter-rotations with organic parallax)
    function drawClouds(ctx, center, radius, cloudAlpha) {
        if (cloudAlpha <= 0.02) return; // Hide clouds in critical alarms
        
        const circumference = radius * 2 * Math.PI;

        // Layer 1: High-altitude Northern Clouds (fast speed, rotating right)
        ctx.save();
        ctx.globalAlpha = cloudAlpha;
        ctx.fillStyle = '#ffffff';

        const cloudOffset1 = (earthRotationAngle * 1.3) * circumference;
        const wave1 = Math.sin(performance.now() / 1800) * 4;

        for (let copy = -1; copy <= 1; copy++) {
            const shiftX = copy * circumference - cloudOffset1 + center;
            ctx.beginPath();
            ctx.arc(shiftX + radius * 0.2, center - radius * 0.25 + wave1, radius * 0.22, 0, Math.PI * 2);
            ctx.arc(shiftX + radius * 0.5, center - radius * 0.3 + wave1 * 0.7, radius * 0.25, 0, Math.PI * 2);
            ctx.arc(shiftX + radius * 0.75, center - radius * 0.18 + wave1 * 1.1, radius * 0.16, 0, Math.PI * 2);
            ctx.fill();
        }
        ctx.restore();

        // Layer 2: Lower-altitude Southern Clouds (slower speed, counter-rotating left)
        ctx.save();
        ctx.globalAlpha = cloudAlpha * 0.65;
        ctx.fillStyle = 'rgba(255, 255, 255, 0.85)';
        
        const cloudOffset2 = (-earthRotationAngle * 0.7) * circumference;
        const wave2 = Math.cos(performance.now() / 2500) * 3;

        for (let copy = -1; copy <= 1; copy++) {
            const shiftX = copy * circumference - cloudOffset2 + center;
            ctx.beginPath();
            ctx.arc(shiftX - radius * 0.3, center + radius * 0.35 + wave2, radius * 0.24, 0, Math.PI * 2);
            ctx.arc(shiftX - radius * 0.05, center + radius * 0.28 + wave2 * 0.5, radius * 0.20, 0, Math.PI * 2);
            ctx.arc(shiftX + radius * 0.25, center + radius * 0.42 + wave2 * 0.9, radius * 0.16, 0, Math.PI * 2);
            ctx.fill();
        }
        ctx.restore();
    }

    function drawEarth() {
        // Calculate frame delta to prevent speedups on high-refresh-rate screens
        const now = performance.now();
        if (!drawEarth.lastTime) drawEarth.lastTime = now;
        const delta = Math.min(3.0, (now - drawEarth.lastTime) / 16.667); // Capped to avoid huge jumps on tab resume
        drawEarth.lastTime = now;

        // Easing interpolation chase (moves smoothly to currentState.ecoScore)
        interpolatedEcoScore += (currentState.ecoScore - interpolatedEcoScore) * 0.05 * delta;
        
        const state = getInterpolatedState(interpolatedEcoScore);
        const width = canvas.width;  // 340
        const height = canvas.height; // 340
        const radius = 115;            // Earth Sphere Radius scaled up
        const center = width / 2;     // 170

        ctx.clearRect(0, 0, width, height);

        // 1. Draw tilted holographic HUD rings around the planet
        drawAtmosphericRings(ctx, center, state.hud, delta);

        // 2. Setup sphere clipping for ocean and landmasses
        ctx.save();
        ctx.beginPath();
        ctx.arc(center, center, radius, 0, Math.PI * 2);
        ctx.clip();

        // 3. Setup dynamic Ocean base gradient
        let oceanGrad = ctx.createRadialGradient(
            center - radius * 0.25, center - radius * 0.25, radius * 0.1, 
            center, center, radius
        );
        const o1 = state.ocean[0];
        const o2 = state.ocean[1];
        const o3 = state.ocean[2];
        
        oceanGrad.addColorStop(0, `rgb(${Math.round(o1[0])}, ${Math.round(o1[1])}, ${Math.round(o1[2])})`);
        oceanGrad.addColorStop(0.6, `rgb(${Math.round(o2[0])}, ${Math.round(o2[1])}, ${Math.round(o2[2])})`);
        oceanGrad.addColorStop(1, `rgb(${Math.round(o3[0])}, ${Math.round(o3[1])}, ${Math.round(o3[2])})`);

        ctx.fillStyle = oceanGrad;
        ctx.fill();

        // 4. Update Earth Rotation Offset (orthographic scroll)
        earthRotationAngle = (earthRotationAngle + state.rotationSpeed * delta) % 2;
        
        const l = state.land;
        ctx.fillStyle = `rgb(${Math.round(l[0])}, ${Math.round(l[1])}, ${Math.round(l[2])})`;

        const mapWidth = radius * 2 * Math.PI; // Full sphere wrap circumference
        const scrollX = (earthRotationAngle / 2) * mapWidth;

        // Loop double map textures for endless horizontal rotation
        for (let copy = -1; copy <= 1; copy++) {
            const offset = copy * mapWidth - scrollX + center;
            
            landmasses.forEach(coords => {
                let first = true;
                ctx.beginPath();
                coords.forEach((pt) => {
                    // Orthographic spherical coordinate projection
                    const xMap = pt.x * mapWidth + offset - center;
                    const angle = xMap / radius;
                    
                    // Render coordinates located in the visible hemisphere
                    if (angle >= -Math.PI / 2 && angle <= Math.PI / 2) {
                        const xProj = center + radius * Math.sin(angle);
                        const yFactor = Math.cos(angle);
                        const yProj = center + (pt.y * 2 * radius - radius) * yFactor;

                        if (first) {
                            ctx.moveTo(xProj, yProj);
                            first = false;
                        } else {
                            ctx.lineTo(xProj, yProj);
                        }
                    } else {
                        // Break and close the path segment when crossing the sphere border
                        first = true;
                    }
                });
                ctx.closePath();
                ctx.fill();

                // Draw real rotating jagged cracks relative to continent maps in unstable states
                if (state.cracksOpacity > 0.05) {
                    ctx.strokeStyle = `rgba(0, 0, 0, ${state.cracksOpacity})`;
                    ctx.lineWidth = 1.6;
                    ctx.beginPath();
                    coords.forEach((pt, idx) => {
                        if (idx % 3 === 0) {
                            const xMap = pt.x * mapWidth + offset - center;
                            const angle = xMap / radius;
                            if (angle >= -Math.PI / 2 && angle <= Math.PI / 2) {
                                const xProj = center + radius * Math.sin(angle);
                                const yFactor = Math.cos(angle);
                                const yProj = center + (pt.y * 2 * radius - radius) * yFactor;
                                
                                // Jagged cracks branching
                                ctx.moveTo(xProj, yProj);
                                ctx.lineTo(xProj + (idx % 2 === 0 ? 5 : -5), yProj + 8);
                                ctx.lineTo(xProj + (idx % 2 === 0 ? 10 : -10), yProj + 12);
                            }
                        }
                    });
                    ctx.stroke();
                }
            });
        }

        // 4.5 Draw 3D Spherical Holographic Wireframe Grid wrapping around the globe
        ctx.strokeStyle = `rgba(${state.rim[0]}, ${state.rim[1]}, ${state.rim[2]}, 0.12)`;
        ctx.lineWidth = 0.8;
        
        // Draw latitudes
        for (let lat = -radius; lat <= radius; lat += 24) {
            ctx.beginPath();
            const rLat = radius * Math.sqrt(1 - (lat / radius) * (lat / radius));
            ctx.ellipse(center, center + lat * 0.95, rLat, rLat * 0.16, 0, 0, Math.PI * 2);
            ctx.stroke();
        }
        // Draw longitudes
        for (let lon = -radius; lon <= radius; lon += 30) {
            ctx.beginPath();
            const rLon = radius * Math.sqrt(1 - (lon / radius) * (lon / radius));
            ctx.ellipse(center + lon * 0.95, center, rLon * 0.16, rLon, 0, 0, Math.PI * 2);
            ctx.stroke();
        }

        // 4.6 Draw horizontal planetary CRT scanlines inside the globe
        ctx.fillStyle = 'rgba(255, 255, 255, 0.04)';
        for (let y = center - radius; y < center + radius; y += 4) {
            ctx.fillRect(center - radius, y, radius * 2, 1.2);
        }

        // Update cracked overlay div style opacity in sync
        crackedOverlay.style.opacity = state.cracksOpacity;

        // 5. Overlay rotating clouds
        drawClouds(ctx, center, radius, state.cloudAlpha);

        // 6. Draw 3D Shading Spherical shadow overlay
        const shadowGrad = ctx.createRadialGradient(
            center - radius * 0.25, center - radius * 0.25, radius * 0.15,
            center, center, radius
        );
        shadowGrad.addColorStop(0, 'rgba(255, 255, 255, 0.18)'); // spec specular highlight
        shadowGrad.addColorStop(0.5, 'rgba(0, 0, 0, 0.0)');
        shadowGrad.addColorStop(1, 'rgba(0, 0, 0, 0.88)');      // terminator shadow
        ctx.fillStyle = shadowGrad;
        ctx.beginPath();
        ctx.arc(center, center, radius, 0, Math.PI * 2);
        ctx.fill();

        // 6.1 Cinematic Volumetric Atmospheric Rim Backlight
        const rimGrad = ctx.createRadialGradient(
            center - radius * 0.45, center - radius * 0.45, radius * 0.4,
            center, center, radius * 1.02
        );
        rimGrad.addColorStop(0.5, 'rgba(0, 0, 0, 0)');
        rimGrad.addColorStop(0.85, `rgba(${state.rim[0]}, ${state.rim[1]}, ${state.rim[2]}, ${state.rim[3]})`);
        rimGrad.addColorStop(1, 'rgba(255, 255, 255, 0.45)');
        ctx.fillStyle = rimGrad;
        ctx.beginPath();
        ctx.arc(center, center, radius, 0, Math.PI * 2);
        ctx.fill();

        ctx.restore();

        // 7. Spawn and update dynamic environmental particles
        spawnCanvasParticles(center, radius, interpolatedEcoScore);
        updateAndDrawParticles(ctx, delta);

        // 8.5 Draw Cyanide Radar Scanning Sweep revolving around the planet with soft radial gradient
        const sweepAngle = (performance.now() / 1600) % (Math.PI * 2);
        ctx.save();
        ctx.translate(center, center);
        ctx.rotate(sweepAngle);
        
        let sweepGrad = ctx.createLinearGradient(0, 0, radius * 1.4, 0);
        sweepGrad.addColorStop(0, `rgba(${state.rim[0]}, ${state.rim[1]}, ${state.rim[2]}, 0.14)`);
        sweepGrad.addColorStop(1, `rgba(${state.rim[0]}, ${state.rim[1]}, ${state.rim[2]}, 0)`);
        
        ctx.fillStyle = sweepGrad;
        ctx.beginPath();
        ctx.moveTo(0, 0);
        ctx.arc(0, 0, radius * 1.4, -0.22, 0.22);
        ctx.closePath();
        ctx.fill();
        
        // High-tech outer scan tick crosshairs
        ctx.strokeStyle = `rgba(${state.rim[0]}, ${state.rim[1]}, ${state.rim[2]}, 0.25)`;
        ctx.lineWidth = 1.0;
        ctx.beginPath();
        ctx.moveTo(0, -radius * 1.22);
        ctx.lineTo(0, -radius * 1.34);
        ctx.moveTo(0, radius * 1.22);
        ctx.lineTo(0, radius * 1.34);
        ctx.moveTo(-radius * 1.22, 0);
        ctx.lineTo(-radius * 1.34, 0);
        ctx.moveTo(radius * 1.22, 0);
        ctx.lineTo(radius * 1.34, 0);
        ctx.stroke();
        
        ctx.restore();

        // 8. Draw beautiful volumetric pulsing atmospheric aura directly on Canvas!
        // Pulsing speed and blur bounds are synced to the score!
        const pulseSpeed = 0.001 + (100 - interpolatedEcoScore) * 0.00003; // faster speed for danger
        const pulseFactor = Math.sin(performance.now() * pulseSpeed);
        const pulseAlpha = pulseFactor * 0.12 + 0.38;
        const blurDepth = 16 + pulseFactor * 6;

        let auraColor = `rgba(${state.rim[0]}, ${state.rim[1]}, ${state.rim[2]}, ${pulseAlpha * 0.4})`;

        ctx.save();
        ctx.shadowColor = `rgb(${state.rim[0]}, ${state.rim[1]}, ${state.rim[2]})`;
        ctx.shadowBlur = blurDepth;
        ctx.fillStyle = auraColor;
        ctx.beginPath();
        ctx.arc(center, center, radius - 1, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();

        // 9. Queue next frame
        earthAnimationFrameId = requestAnimationFrame(drawEarth);
    }

    drawEarth();
}

// 12. FLOATING AI ASSISTANT CHAT ENGINE
function toggleChat() {
    const chatBox = document.getElementById('ai-chat-box');
    chatBox.classList.toggle('hidden');
    
    // Auto scroll chat to bottom when opened
    if (!chatBox.classList.contains('hidden')) {
        setTimeout(() => {
            const chatMessages = document.getElementById('chat-messages');
            chatMessages.scrollTop = chatMessages.scrollHeight;
        }, 50);
    }
}

function handleChatKeyPress(event) {
    if (event.key === 'Enter') {
        sendMessage();
    }
}

// AI Chat Thinking Indicator functions
function showThinkingIndicator() {
    const chatMessages = document.getElementById('chat-messages');
    
    // Check if indicator already exists
    if (document.getElementById('chat-thinking')) return;

    const thinkingDiv = document.createElement('div');
    thinkingDiv.id = 'chat-thinking';
    thinkingDiv.className = 'chat-msg ai-msg';
    thinkingDiv.innerHTML = `
        <div class="msg-bubble thinking-bubble">
            <span class="thinking-dot"></span>
            <span class="thinking-dot"></span>
            <span class="thinking-dot"></span>
        </div>
    `;
    
    chatMessages.appendChild(thinkingDiv);
    chatMessages.scrollTop = chatMessages.scrollHeight;
}

function hideThinkingIndicator() {
    const indicator = document.getElementById('chat-thinking');
    if (indicator) {
        indicator.remove();
    }
}

function sendMessage() {
    const inputEl = document.getElementById('chat-user-input');
    const msgText = inputEl.value.trim();
    
    if (msgText === '') return;

    // User Message
    addUserMessage(msgText);
    inputEl.value = '';

    // Show dynamic thinking indicator before responding
    showThinkingIndicator();
    
    setTimeout(() => {
        hideThinkingIndicator();
        const response = getAIResponse(msgText);
        addBotMessage(response);
    }, 900); // 900ms thinking time
}

function addUserMessage(text) {
    const chatMessages = document.getElementById('chat-messages');
    
    const msgDiv = document.createElement('div');
    msgDiv.className = 'chat-msg user-msg';
    msgDiv.innerHTML = `<div class="msg-bubble">${text}</div>`;
    
    chatMessages.appendChild(msgDiv);
    chatMessages.scrollTop = chatMessages.scrollHeight;
}

function addBotMessage(text) {
    const chatMessages = document.getElementById('chat-messages');
    
    const msgDiv = document.createElement('div');
    msgDiv.className = 'chat-msg ai-msg';
    
    const bubble = document.createElement('div');
    bubble.className = 'msg-bubble';
    msgDiv.appendChild(bubble);
    chatMessages.appendChild(msgDiv);
    
    // Snappy Character Typewriter effect
    let i = 0;
    let isTag = false;
    let tempText = "";
    
    function typeChar() {
        if (i < text.length) {
            let char = text.charAt(i);
            
            // Skip delaying inside HTML markup
            if (char === '<') {
                isTag = true;
            }
            
            tempText += char;
            
            if (char === '>') {
                isTag = false;
            }
            
            bubble.innerHTML = tempText;
            i++;
            
            chatMessages.scrollTop = chatMessages.scrollHeight;
            
            if (isTag) {
                typeChar(); // Skip delay for markup
            } else {
                setTimeout(typeChar, 8); // Snappy 8ms key delay
            }
        }
    }
    
    typeChar();
}

// Click chips presets
function askPresetQuestion(type) {
    let questionText = "";
    
    if (type === 'boost') questionText = "How can I boost my Eco Score?";
    else if (type === 'transport') questionText = "Analyze my transport emissions.";
    else if (type === 'forecast') questionText = "Explain my 2030 forecast predictions.";
    else if (type === 'water') questionText = "Give me quick water conservation tips.";

    addUserMessage(questionText);
    
    showThinkingIndicator();
    
    setTimeout(() => {
        hideThinkingIndicator();
        const response = getAIResponsePreset(type);
        addBotMessage(response);
    }, 850);
}

// Preset answers with state evaluations
function getAIResponsePreset(type) {
    const scoreVal = currentState.ecoScore;
    
    if (type === 'boost') {
        let recommendation = "";
        if (currentState.acHours >= 6) {
            recommendation = `Currently, your AC is set to <strong>${currentState.acHours} hours</strong>. Sliding it down to 4 hours daily will add about <strong>+8 points</strong> to your Eco Score!`;
        } else if (currentState.travelMode === 'petrol' && currentState.distance >= 15) {
            recommendation = `Your petrol vehicle travel is a major contributor. Switching to public transit or EV will instantly add about <strong>+12 to +15 points</strong>!`;
        } else if (currentState.waterWastage) {
            recommendation = `Turning off the tap while brushing and correcting leaky faucets will instantly boost your score by <strong>+8 points</strong>!`;
        } else if (currentState.plasticBottles >= 10) {
            recommendation = `Ditching those <strong>${currentState.plasticBottles} single-use bottles</strong> weekly for a metal flask will raise your score by <strong>+6 points</strong>!`;
        } else {
            recommendation = `You are doing amazingly well with a score of <strong>${scoreVal}</strong>! To get closer to 100, try minimizing food scraps to absolute zero and lowering AC usage completely.`;
        }
        
        return `⚡ <strong>Score Optimization Engine Analysis:</strong><br><br>${recommendation}<br><br>Every minor optimization reflects immediately in your annual cash savings ticker!`;
    }
    
    if (type === 'transport') {
        const factor = TRANSPORT_FACTORS[currentState.travelMode];
        const transportCo2 = Math.round(currentState.distance * factor * 30);
        
        let analysis = `You travel <strong>${currentState.distance} km</strong> daily using <strong>${currentState.travelMode}</strong>. This outputs approximately <strong>${transportCo2} kg of CO₂</strong> monthly.<br><br>`;
        
        if (currentState.travelMode === 'petrol') {
            analysis += `⚠️ <strong>Petrol Cars</strong> have severe impact. By toggling to <strong>Transit</strong> or <strong>EV</strong>, you reduce transport emissions by 75%+, saving thousands of rupees in fuel annually.`;
        } else if (currentState.travelMode === 'bike') {
            analysis += `🏍️ <strong>Bikes</strong> are better than cars, but still exhaust greenhouse gases. Try carpooling or taking campus electric buses twice a week to boost your standing.`;
        } else {
            analysis += `⭐ Excellent choice! Choosing <strong>${currentState.travelMode}</strong> keeps emissions negligible. ECE Department ranks high thanks to conscious citizens like you!`;
        }
        return analysis;
    }
    
    if (type === 'forecast') {
        const annualSavedCo2 = Math.round((BASELINE.dailyCo2 - currentState.dailyCo2) * 365);
        const saved5Years = (annualSavedCo2 * 5 / 1000).toFixed(1);
        
        let prediction = `🔮 <strong>Future Intelligence Forecast (2026 - 2030):</strong><br><br>`;
        if (scoreVal < 50) {
            prediction += `⚠️ Continuing with your current profile will lead to <strong>${(BASELINE.dailyCo2 * 365 * 5 / 1000).toFixed(1)} Tons of cumulative CO₂</strong> output by 2030. The charts show a sharp divergence, driving environmental degradation.`;
        } else {
            prediction += `🟢 By adopting your current green habits, you will prevent <strong>${saved5Years} Tons of greenhouse gases</strong> by 2030 compared to Business as Usual!<br><br>Additionally, you prevent significant resources from depletion, and your cumulative utility savings reach a projected <strong>₹${(Math.round((BASELINE.dailyCo2 - currentState.dailyCo2) * 365 * 10) * 5).toLocaleString()}</strong>!`;
        }
        return prediction;
    }
    
    if (type === 'water') {
        let waterTip = `💧 <strong>Water Intelligence Insight:</strong><br><br>You currently consume <strong>${currentState.waterLiters} Liters/day</strong>. `;
        if (currentState.waterWastage) {
            waterTip += `By turning off water wastage habits in the checkbox, you instantly conserve over <strong>${(BASELINE.dailyWater - currentState.waterLiters) * 365 + 3000} Liters annually</strong>. `;
        }
        waterTip += `Try keeping daily showers below 5 minutes, running laundry on full loads only, and harvesting rainwater for campus gardens!`;
        return waterTip;
    }
}

// Custom prompt parser for typed messages
function getAIResponse(msgText) {
    const text = msgText.toLowerCase();
    const scoreVal = currentState.ecoScore;

    if (text.includes('hello') || text.includes('hi') || text.includes('hey')) {
        return "Hey there! Ask me any questions about sustainability, your environmental metrics, or click a suggestion chip below for live optimizations!";
    }
    if (text.includes('score') || text.includes('eco')) {
        return `Your current Eco Score is <strong>${scoreVal}/100</strong>. ${scoreVal >= 80 ? 'An excellent score! Keep it up.' : 'You can easily boost this by adjusting AC usage, commuting in an EV, or avoiding single-use plastics.'}`;
    }
    if (text.includes('electricity') || text.includes('ac') || text.includes('power')) {
        return `Your AC runs for <strong>${currentState.acHours} hours</strong>. Each AC hour emits about 1.35kg of CO₂. Consider using high-efficiency fans or closing blinds to reduce AC loads!`;
    }
    if (text.includes('car') || text.includes('petrol') || text.includes('transport') || text.includes('ev') || text.includes('travel')) {
        return `You commuter distance is <strong>${currentState.distance} km</strong> via <strong>${currentState.travelMode}</strong>. Petrol cars release 180g of CO₂ per km. EV and walking are the best options!`;
    }
    if (text.includes('water') || text.includes('shower') || text.includes('leak')) {
        return `Water is vital! Your consumption is <strong>${currentState.waterLiters}L/day</strong>. Shortening showers and repairing tap leakage holds immense conservation power.`;
    }
    if (text.includes('plastic') || text.includes('bottle') || text.includes('recycle')) {
        return `You discard <strong>${currentState.plasticBottles} plastic bottles</strong> weekly. Carry a steel bottle! Single-use plastics take 450+ years to disintegrate in soil.`;
    }
    if (text.includes('food') || text.includes('waste') || text.includes('leftover')) {
        return `Food scraps in landfills ferment into methane, a gas 25x more toxic than CO₂. Planning meals and composting will save resources.`;
    }
    if (text.includes('saving') || text.includes('rupee') || text.includes('cash') || text.includes('money')) {
        return `By adjusting these sliders, you are looking at potential savings of <strong>₹${document.getElementById('save-cash').textContent} annually</strong>! Ecology and economy are deeply connected.`;
    }

    return "Interesting question! My environmental intelligence system highlights that minor changes in daily routines—like reducing AC, using campus transit, and bypassing bottled water—accumulate massive planet-saving results. Try testing a slider and watch the numbers shift!";
}

// ==========================================================================
// ECOSPHERE AI - ADVANCED VISUAL PLUGINS & INTERPOLATION ENGINE
// ==========================================================================

const ANCHORS = {
    green: {
        score: 90,
        ocean: [[0, 180, 216], [0, 119, 182], [3, 4, 94]],
        land: [16, 185, 129],
        rim: [16, 185, 129, 0.32],
        hud: [16, 185, 129, 0.12, 0.35],
        rotationSpeed: 0.005,
        cracksOpacity: 0.0,
        cloudAlpha: 0.24
    },
    yellow: {
        score: 70,
        ocean: [[10, 147, 150], [0, 95, 115], [10, 47, 53]],
        land: [132, 204, 22],
        rim: [6, 182, 212, 0.28],
        hud: [6, 182, 212, 0.12, 0.3],
        rotationSpeed: 0.0035,
        cracksOpacity: 0.0,
        cloudAlpha: 0.18
    },
    orange: {
        score: 45,
        ocean: [[74, 85, 104], [45, 55, 72], [26, 32, 44]],
        land: [180, 83, 9],
        rim: [245, 158, 11, 0.22],
        hud: [245, 158, 11, 0.08, 0.2],
        rotationSpeed: 0.0018,
        cracksOpacity: 0.25,
        cloudAlpha: 0.08
    },
    red: {
        score: 20,
        ocean: [[43, 45, 66], [27, 28, 37], [13, 14, 18]],
        land: [127, 29, 29],
        rim: [239, 68, 68, 0.32],
        hud: [239, 68, 68, 0.05, 0.18],
        rotationSpeed: 0.0006,
        cracksOpacity: 0.7,
        cloudAlpha: 0.0
    }
};

function getInterpolatedState(score) {
    let s1, s2, f;
    if (score >= 90) {
        return ANCHORS.green;
    } else if (score >= 70) {
        s1 = ANCHORS.yellow;
        s2 = ANCHORS.green;
        f = (score - 70) / 20;
    } else if (score >= 45) {
        s1 = ANCHORS.orange;
        s2 = ANCHORS.yellow;
        f = (score - 45) / 25;
    } else if (score >= 20) {
        s1 = ANCHORS.red;
        s2 = ANCHORS.orange;
        f = (score - 20) / 25;
    } else {
        return ANCHORS.red;
    }

    const interpolate = (v1, v2) => v1 + (v2 - v1) * f;
    const interpolateArr = (a1, a2) => a1.map((v, i) => v + (a2[i] - v) * f);
    
    return {
        ocean: [
            interpolateArr(s1.ocean[0], s2.ocean[0]),
            interpolateArr(s1.ocean[1], s2.ocean[1]),
            interpolateArr(s1.ocean[2], s2.ocean[2])
        ],
        land: interpolateArr(s1.land, s2.land),
        rim: interpolateArr(s1.rim, s2.rim),
        hud: interpolateArr(s1.hud, s2.hud),
        rotationSpeed: interpolate(s1.rotationSpeed, s2.rotationSpeed),
        cracksOpacity: interpolate(s1.cracksOpacity, s2.cracksOpacity),
        cloudAlpha: interpolate(s1.cloudAlpha, s2.cloudAlpha)
    };
}

// Capped Dynamic Particle Emitter System (Capped at 35 particles max)
let activeParticles = [];

function spawnCanvasParticles(center, radius, score) {
    const maxParticles = 35;
    if (activeParticles.length >= maxParticles) return;
    
    // Throttled spawner rate: spawn at most once every 120ms to prevent high refresh rate pile-ups
    const now = performance.now();
    if (!spawnCanvasParticles.lastSpawnTime) spawnCanvasParticles.lastSpawnTime = 0;
    if (now - spawnCanvasParticles.lastSpawnTime < 120) return;
    
    // Controlled spawn rate: 60% probability per throttling step
    if (Math.random() > 0.6) return;
    spawnCanvasParticles.lastSpawnTime = now;
    
    let type = 'sparkle';
    if (score >= 80) {
        type = Math.random() > 0.4 ? 'leaf' : 'sparkle';
    } else if (score >= 60) {
        type = 'sparkle';
    } else if (score >= 40) {
        type = 'dust';
    } else {
        type = Math.random() > 0.35 ? 'smoke' : 'ash';
    }
    
    // Spawn bottom area with vertical drift velocity
    activeParticles.push({
        x: center + (Math.random() - 0.5) * radius * 2.2,
        y: 280 + Math.random() * 20,
        vx: (Math.random() - 0.5) * 0.5,
        vy: -(Math.random() * 0.6 + 0.3),
        size: Math.random() * (type === 'leaf' ? 5 : (type === 'smoke' ? 8 : 3)) + 3,
        alpha: 1.0,
        life: 1.0,
        decay: 0.003 + Math.random() * 0.005,
        angle: Math.random() * Math.PI * 2,
        spin: (Math.random() - 0.5) * 0.02,
        type: type
    });
}

function updateAndDrawParticles(ctx, delta = 1) {
    activeParticles = activeParticles.filter(p => {
        p.x += p.vx * delta;
        p.y += p.vy * delta;
        p.angle += p.spin * delta;
        p.life -= p.decay * delta;
        p.alpha = Math.max(0, p.life);
        
        if (p.life <= 0 || p.y < -30) return false;
        
        ctx.save();
        ctx.globalAlpha = p.alpha * 0.55;
        
        if (p.type === 'leaf') {
            ctx.translate(p.x, p.y);
            ctx.rotate(p.angle);
            ctx.beginPath();
            ctx.moveTo(0, 0);
            ctx.quadraticCurveTo(p.size, -p.size/2, p.size, -p.size);
            ctx.quadraticCurveTo(p.size/2, -p.size, 0, 0);
            ctx.closePath();
            ctx.fillStyle = '#10b981';
            ctx.fill();
        } else if (p.type === 'sparkle') {
            ctx.beginPath();
            ctx.arc(p.x, p.y, p.size * 0.4, 0, Math.PI * 2);
            ctx.fillStyle = '#06b6d4';
            ctx.shadowColor = '#06b6d4';
            ctx.shadowBlur = 6;
            ctx.fill();
        } else if (p.type === 'dust') {
            ctx.beginPath();
            ctx.arc(p.x, p.y, p.size * 0.35, 0, Math.PI * 2);
            ctx.fillStyle = '#f59e0b';
            ctx.fill();
        } else if (p.type === 'smoke') {
            let smokeGrad = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, p.size * 2);
            smokeGrad.addColorStop(0, 'rgba(80, 75, 75, 0.20)');
            smokeGrad.addColorStop(0.5, 'rgba(50, 50, 50, 0.06)');
            smokeGrad.addColorStop(1, 'rgba(50, 50, 50, 0)');
            ctx.fillStyle = smokeGrad;
            ctx.beginPath();
            ctx.arc(p.x, p.y, p.size * 2, 0, Math.PI * 2);
            ctx.fill();
        } else if (p.type === 'ash') {
            ctx.beginPath();
            ctx.arc(p.x, p.y, p.size * 0.3, 0, Math.PI * 2);
            ctx.fillStyle = '#2d3748';
            ctx.fill();
        }
        
        ctx.restore();
        return true;
    });
}

// Chart.js Neon Lines Shadow Plugin
const chartShadowPlugin = {
    id: 'chartShadow',
    beforeDatasetDraw: (chart, args) => {
        const ctx = chart.ctx;
        ctx.save();
        ctx.shadowColor = args.meta.dataset.options.borderColor;
        ctx.shadowBlur = 12;
        ctx.shadowOffsetX = 0;
        ctx.shadowOffsetY = 4;
    },
    afterDatasetDraw: (chart) => {
        chart.ctx.restore();
    }
};

// Chart.js Doughnut Center Dynamic Readout Text Plugin
const doughnutCenterTextPlugin = {
    id: 'doughnutCenterText',
    afterDraw: (chart) => {
        if (chart.config.type !== 'doughnut') return;
        const { ctx, chartArea } = chart;
        if (!chartArea) return;
        
        ctx.save();
        const x = (chartArea.left + chartArea.right) / 2;
        const y = (chartArea.top + chartArea.bottom) / 2;
        
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        
        // Label
        ctx.font = '700 8px Outfit';
        ctx.fillStyle = '#9ca3af';
        ctx.fillText('DAILY CO₂', x, y - 8);
        
        // Digital Live Value Ticker
        ctx.font = '800 14px Share Tech Mono';
        ctx.fillStyle = '#ffffff';
        ctx.fillText(currentState.dailyCo2.toFixed(1) + ' kg', x, y + 8);
        ctx.restore();
    }
};

// Cinematic Background Atmosphere Particle Generator
function initBackgroundAtmosphere() {
    const bgContainer = document.querySelector('.app-background');
    if (!bgContainer) return;
    
    for (let i = 0; i < 15; i++) {
        const particle = document.createElement('div');
        particle.className = 'bg-atmosphere-particle';
        
        const size = Math.random() * 4 + 2; // 2px to 6px
        particle.style.width = `${size}px`;
        particle.style.height = `${size}px`;
        particle.style.left = `${Math.random() * 100}%`;
        particle.style.top = `${Math.random() * 100}%`;
        
        const duration = Math.random() * 30 + 30; // 30s to 60s
        const delay = Math.random() * -30;
        particle.style.animation = `bgFloat ${duration}s linear infinite ${delay}s`;
        
        const colors = [
            'rgba(16, 185, 129, 0.08)', // green
            'rgba(6, 182, 212, 0.08)',  // cyan
            'rgba(245, 158, 11, 0.05)'   // amber
        ];
        const color = colors[Math.floor(Math.random() * colors.length)];
        particle.style.background = color;
        particle.style.boxShadow = `0 0 12px ${color}`;
        
        const driftX = Math.random() * 100 - 50; // -50px to 50px drift
        particle.style.setProperty('--drift-x', `${driftX}px`);
        
        bgContainer.appendChild(particle);
    }
}
