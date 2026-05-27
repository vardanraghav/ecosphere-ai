/* ==========================================================================
   FUTURE SELF SIMULATOR - CORE CONTROLLER & INTEL ENGINE
   Premium Cyber-Dark Aesthetic // Real-Time Biometric & Lifestyle Telemetry
   Vanilla Javascript, Canvas Physics, Chart.js & Chatbot
   ========================================================================== */

// 1. GLOBAL STATE & BASELINE VALUES
const BASELINE = {
    sleepHours: 4.5,
    screenTime: 12,
    studyHours: 1,
    exerciseDays: 0,
    eatingHabit: 0,
    stressLevel: 80,
    socialMediaTime: 6,
    savingsRate: 5,
    ecoScore: 35 // Base Vitality Index
};

let currentState = {
    sleepHours: 7,
    screenTime: 5,
    studyHours: 4,
    exerciseDays: 3,
    eatingHabit: 2, // Good
    stressLevel: 30,
    socialMediaTime: 2,
    savingsRate: 20,

    // Simulated Threat Factors
    simPollution: 0,
    simDeforestation: 0,
    simPlastic: 0,
    simFossil: 0,

    // Progression & Profile
    xp: 40,
    avatarLevel: 1,
    pledgedPoints: 0,
    claimedQuests: [],
    streakCount: 1,
    simulatedYear: 2025,
    name: "",
    age: "",
    phone: "",
    department: "ECE",
    city: "",
    futureGoal: "Entrepreneurial Success",
    gender: "astronaut",
    photoURL: "",
    profileComplete: false,
    achievements: ["first_uplink"]
};

// Rates & Constants
const DOPAMINE_MULTIPLIER = 1.2;
const CELLULAR_DECAY_RATE = 0.12; // aging factor

// Document Elements cache
let breakdownChart = null;
let predictionChart = null;
let earthRotationAngle = 0;
let earthAnimationFrameId = null;
let interpolatedEcoScore = 72; // Smooth tracking for state transitions
let hudRingRotation = 0; // Rotation tracking for planet HUD rings
let activeParticles = [];

// Initialize app when window loads
window.addEventListener('load', () => {
    // Populate slider bubbles and wire events
    initSliders();
    
    // Render Charts
    initCharts();
    
    // Set initial baseline comparison stats and populate charts with live calculated data
    updateCalculations(true);
    
    // Run Earth/Avatar visual loop
    initEarthCanvas();
    
    // Generate background atmosphere particles
    initBackgroundAtmosphere();

    // Initialize Gamification Widgets & Avatar states
    updateAvatarXPWidget();
    evaluateQuests();
    updateWeeklyTargetProgress();
    updateBattleLeaderboard();
    
    // Run cinematic startup loader timeline
    runLoaderSequence();
});

// Cinematic Loader
function runLoaderSequence() {
    const loader = document.getElementById('app-loader');
    const bar = document.getElementById('loader-bar-fill');
    const statusText = document.getElementById('loader-status-text');
    
    const steps = [
        { progress: 15, text: "Initializing Chrono-Intelligence Core..." },
        { progress: 38, text: "Loading predictive biological aging models..." },
        { progress: 62, text: "Calibrating neurological wellness matrices..." },
        { progress: 85, text: "Retrieving user bio-telemetry..." },
        { progress: 100, text: "Establishing secure future simulation link..." }
    ];
    
    let stepIndex = 0;
    
    function nextStep() {
        if (stepIndex < steps.length) {
            const step = steps[stepIndex];
            if (bar) bar.style.width = `${step.progress}%`;
            if (statusText) statusText.textContent = step.text;
            stepIndex++;
            setTimeout(nextStep, 350);
        } else {
            setTimeout(() => {
                if (loader) {
                    loader.classList.add('fade-out');
                    setTimeout(() => {
                        loader.style.display = 'none';
                    }, 500);
                }
                
                // Show AI bot welcome message with typewriter stream!
                setTimeout(() => {
                    showThinkingIndicator();
                    setTimeout(() => {
                        hideThinkingIndicator();
                        addBotMessage("Welcome to the <strong>Future Self Simulator</strong>. 🔮<br><br>Your baseline profile is initialized. Adjust the behavior telemetry sliders on the left or select presets to dynamically simulate your cognitive, physical, and financial destiny in the year <strong>2035</strong>! Watch your Chrono-Avatar wireframe visualizer change dynamically.");
                    }, 800);
                }, 500);
            }, 300);
        }
    }
    
    nextStep();
}

// 2. INITIALIZE SLIDERS AND EVENT LISTENERS
function initSliders() {
    const sliders = [
        { id: 'input-screen-time', bubbleId: 'val-screen-time', stateKey: 'screenTime', badgeId: 'val-screen-level', thresholds: ['LIGHT', 'MODERATE', 'HEAVY LOAD', 'SEVERE DEPLETION'] },
        { id: 'input-social-media', bubbleId: 'val-social-media', stateKey: 'socialMediaTime' },
        { id: 'input-sleep-hours', bubbleId: 'val-sleep-hours', stateKey: 'sleepHours', badgeId: 'val-sleep-quality', thresholds: ['CRITICAL', 'DEPRIVED', 'RESTED', 'ZEN'] },
        { id: 'input-exercise-days', bubbleId: 'val-exercise-days', stateKey: 'exerciseDays' },
        { id: 'input-study-hours', bubbleId: 'val-study-hours', stateKey: 'studyHours', badgeId: 'val-focus-level', thresholds: ['DISTRACTED', 'STANDARD', 'HIGH FOCUS', 'DEEP SCHOLAR'] },
        { id: 'input-savings-rate', bubbleId: 'val-savings-rate', stateKey: 'savingsRate' },
        { id: 'input-stress-level', bubbleId: 'val-stress-level', stateKey: 'stressLevel' }
    ];

    sliders.forEach(s => {
        const el = document.getElementById(s.id);
        if (!el) return;

        el.addEventListener('input', (e) => {
            const val = parseFloat(e.target.value);
            const bubble = document.getElementById(s.bubbleId);
            if (bubble) bubble.textContent = val;
            currentState[s.stateKey] = val;

            // Update semantic status badge if threshold specified
            if (s.badgeId && s.thresholds) {
                const badge = document.getElementById(s.badgeId);
                if (badge) {
                    let status = s.thresholds[0];
                    if (s.stateKey === 'screenTime') {
                        if (val >= 12) status = s.thresholds[3];
                        else if (val >= 8) status = s.thresholds[2];
                        else if (val >= 4) status = s.thresholds[1];
                    } else if (s.stateKey === 'sleepHours') {
                        if (val >= 8) status = s.thresholds[3];
                        else if (val >= 7) status = s.thresholds[2];
                        else if (val >= 5) status = s.thresholds[1];
                    } else if (s.stateKey === 'studyHours') {
                        if (val >= 10) status = s.thresholds[3];
                        else if (val >= 6) status = s.thresholds[2];
                        else if (val >= 3) status = s.thresholds[1];
                    }
                    badge.textContent = status;
                }
            }

            updateCalculations(true);
            triggerAutoSave();
        });
    });

    const eatingSelect = document.getElementById('input-eating-habit');
    if (eatingSelect) {
        eatingSelect.addEventListener('change', (e) => {
            currentState.eatingHabit = parseInt(e.target.value);
            const badge = document.getElementById('val-diet-status');
            if (badge) {
                const dietLabels = ["POOR", "AVERAGE", "GOOD QUALITY", "CLEAN NUTRIENT"];
                badge.textContent = dietLabels[currentState.eatingHabit] || "GOOD";
            }
            updateCalculations(true);
            triggerAutoSave();
        });
    }

    // Dynamic environmental sliders inside simulation card
    const simInputs = [
        { id: 'input-sim-pollution', bubbleId: 'val-sim-pollution', stateKey: 'simPollution', labelId: 'val-sim-pollution-label', thresholds: ['STABLE', 'FATIGUE', 'DRAINED', 'SEVERE CHRONIC!'] },
        { id: 'input-sim-deforestation', bubbleId: 'val-sim-deforestation', stateKey: 'simDeforestation', labelId: 'val-sim-deforestation-label', thresholds: ['HEALTHY Tissues', 'MINOR DECAY', 'ACCELERATED AGING', 'CRITICAL CELL DECAY!'] },
        { id: 'input-sim-plastic', bubbleId: 'val-sim-plastic', stateKey: 'simPlastic', labelId: 'val-sim-plastic-label', thresholds: ['CONNECTED', 'SOCIAL DETACH', 'ISOLATION SURGE', 'TOTAL BRAIN BURNOUT'] },
        { id: 'input-sim-fossil', bubbleId: 'val-sim-fossil', stateKey: 'simFossil', labelId: 'val-sim-fossil-label', thresholds: ['NORMAL Rate', 'MINOR FATIGUE', 'ACUTE EXHAUSTION', 'TEMPORAL FAILURE!'] }
    ];

    simInputs.forEach(sim => {
        const el = document.getElementById(sim.id);
        if (!el) return;

        el.addEventListener('input', (e) => {
            const val = parseFloat(e.target.value);
            const bubble = document.getElementById(sim.bubbleId);
            if (bubble) bubble.textContent = val;
            currentState[sim.stateKey] = val;

            let status = sim.thresholds[0];
            let color = 'var(--color-friendly)';
            if (val >= 75) { status = sim.thresholds[3]; color = 'var(--color-danger)'; }
            else if (val >= 45) { status = sim.thresholds[2]; color = 'var(--color-unsustainable)'; }
            else if (val >= 15) { status = sim.thresholds[1]; color = 'var(--color-moderate)'; }

            const lbl = document.getElementById(sim.labelId);
            if (lbl) {
                lbl.textContent = status;
                lbl.style.color = color;
                lbl.style.borderColor = color;
            }

            updateCalculations(true);
        });
    });
}

// 3. PRESETS CONTROLLER
function applyPreset(presetType) {
    document.querySelectorAll('.btn-preset').forEach(btn => btn.classList.remove('active'));
    document.body.classList.remove('preset-theme-green', 'preset-theme-red', 'preset-theme-blue');
    
    const appContainer = document.querySelector('.app-container');
    if (appContainer) {
        appContainer.classList.add('glitch-shake');
        setTimeout(() => {
            appContainer.classList.remove('glitch-shake');
        }, 460);
    }
    
    if (presetType === 'alarm') {
        const btnAlarm = document.getElementById('btn-preset-alarm');
        if (btnAlarm) btnAlarm.classList.add('active');
        document.body.classList.add('preset-theme-red');
        setFormInputs({
            sleepHours: 4,
            screenTime: 12,
            studyHours: 2,
            exerciseDays: 0,
            eatingHabit: 0,
            stressLevel: 85,
            socialMediaTime: 7,
            savingsRate: 5
        });
        
        showThinkingIndicator();
        setTimeout(() => {
            hideThinkingIndicator();
            addBotMessage("🚨 <strong>SYSTEM CRISIS: Burnout Future Seeded (2035 Warning)</strong>.<br><br>Warning! Deprived sleep (4h), high daily screen load (12h), excessive stress (85%), and low savings (5%) have been activated.<br><br>Your future self in 2035 is projected to be in **severe physical and cognitive burnout**, experiencing chronic neural depletion and high stress fatigue. Action is highly recommended!");
        }, 650);

    } else if (presetType === 'student') {
        const btnStudent = document.getElementById('btn-preset-student');
        if (btnStudent) btnStudent.classList.add('active');
        document.body.classList.add('preset-theme-blue');
        setFormInputs({
            sleepHours: 7,
            screenTime: 6,
            studyHours: 4,
            exerciseDays: 2,
            eatingHabit: 1,
            stressLevel: 45,
            socialMediaTime: 3,
            savingsRate: 15
        });
        
        showThinkingIndicator();
        setTimeout(() => {
            hideThinkingIndicator();
            addBotMessage("🎓 <strong>Preset Loaded: Typical Campus Student (2035 Forecast)</strong>.<br><br>This is a standard behavioral baseline: 7h sleep, 6h screen time, 4h study focus, and 15% financial savings.<br><br>Your 2035 self is forecast to be a **Moderate Achiever** but with high screen load and minor physical fatigue. It is a solid baseline to optimize and accelerate discipline!");
        }, 650);

    } else if (presetType === 'warrior') {
        const btnWarrior = document.getElementById('btn-preset-warrior');
        if (btnWarrior) btnWarrior.classList.add('active');
        document.body.classList.add('preset-theme-green');
        setFormInputs({
            sleepHours: 8,
            screenTime: 3,
            studyHours: 8,
            exerciseDays: 5,
            eatingHabit: 3,
            stressLevel: 10,
            socialMediaTime: 1,
            savingsRate: 50
        });
        
        showThinkingIndicator();
        setTimeout(() => {
            hideThinkingIndicator();
            addBotMessage("🌱 <strong>CHRONO EQUILIBRIUM: Successful Entrepreneur & Zen Leader</strong>.<br><br>Outstanding! This simulates a highly disciplined lifestyle: 8h quality rest, 8h productive work/study focus, clean nutrition, and 50% savings rate.<br><br>Your 2035 self is projected to achieve **exceptional professional growth, physical vitality, and digital harmony**. Your future self thanks you!");
        }, 650);
    }
}

function setFormInputs(data) {
    currentState = { ...currentState, ...data };

    const mappings = [
        { id: 'input-screen-time', bubbleId: 'val-screen-time', val: data.screenTime },
        { id: 'input-social-media', bubbleId: 'val-social-media', val: data.socialMediaTime },
        { id: 'input-sleep-hours', bubbleId: 'val-sleep-hours', val: data.sleepHours },
        { id: 'input-exercise-days', bubbleId: 'val-exercise-days', val: data.exerciseDays },
        { id: 'input-study-hours', bubbleId: 'val-study-hours', val: data.studyHours },
        { id: 'input-savings-rate', bubbleId: 'val-savings-rate', val: data.savingsRate },
        { id: 'input-stress-level', bubbleId: 'val-stress-level', val: data.stressLevel }
    ];

    mappings.forEach(m => {
        const el = document.getElementById(m.id);
        const bubble = document.getElementById(m.bubbleId);
        if (el) el.value = m.val;
        if (bubble) bubble.textContent = m.val;
    });

    const eatingSelect = document.getElementById('input-eating-habit');
    if (eatingSelect) {
        eatingSelect.value = data.eatingHabit;
        const dietBadge = document.getElementById('val-diet-status');
        if (dietBadge) {
            const dietLabels = ["POOR", "AVERAGE", "GOOD QUALITY", "CLEAN NUTRIENT"];
            dietBadge.textContent = dietLabels[data.eatingHabit] || "GOOD";
        }
    }

    updateCalculations();
}

// Helper to calculate vitality dynamically for any year
function calculateVitalityForYear(year) {
    const yearDiff = year - 2025;
    let sleepHours = currentState.sleepHours;
    let screenTime = currentState.screenTime;
    let exerciseDays = currentState.exerciseDays;
    let eatingHabit = currentState.eatingHabit; 
    let stressLevel = currentState.stressLevel;
    let socialMediaTime = currentState.socialMediaTime;

    let health = 100 - (10 - sleepHours) * 3.5 - screenTime * 1.2 + exerciseDays * 4.5 + eatingHabit * 5 - (yearDiff * stressLevel * 0.05);
    health = Math.max(10, Math.min(100, health));

    let mental = 100 - stressLevel * 0.5 - screenTime * 1.5 - socialMediaTime * 2.0 + sleepHours * 3.0;
    mental = mental - (yearDiff * (screenTime + socialMediaTime) * 0.15);
    mental = Math.max(10, Math.min(100, mental));

    let vitality = Math.round((health + mental) / 2);
    return Math.max(10, Math.min(100, vitality));
}

// 4. MAIN CALCULATIONS ENGINE
function updateCalculations(instant = false) {
    const yearDiff = (currentState.simulatedYear || 2025) - 2025;

    // Physical Health Score
    let physicalHealth = 100 - (10 - currentState.sleepHours) * 3.5 - currentState.screenTime * 1.2 + currentState.exerciseDays * 4.5 + currentState.eatingHabit * 5;
    physicalHealth -= (yearDiff * currentState.stressLevel * 0.05);
    physicalHealth = Math.max(10, Math.min(100, physicalHealth));

    // Mental Wellness Score
    let mentalWellness = 100 - currentState.stressLevel * 0.5 - currentState.screenTime * 1.5 - currentState.socialMediaTime * 2.0 + currentState.sleepHours * 3.0;
    mentalWellness -= (yearDiff * (currentState.screenTime + currentState.socialMediaTime) * 0.15);
    mentalWellness = Math.max(10, Math.min(100, mentalWellness));

    // Burnout Risk Score
    let burnoutRisk = (currentState.stressLevel * 0.7 + currentState.screenTime * 0.4 + currentState.studyHours * 0.5 - currentState.sleepHours * 2.0) * (1 + yearDiff * 0.08);
    burnoutRisk = Math.max(0, Math.min(100, burnoutRisk));

    // Career Growth & Wealth Projection
    let careerGrowth = currentState.studyHours * 6.0 + (100 - currentState.stressLevel) * 0.15 + currentState.sleepHours * 2.0 - currentState.screenTime * 0.8;
    careerGrowth = Math.max(10, Math.min(100, careerGrowth));

    let wealthProjection = currentState.savingsRate * 1.5 * (1 + yearDiff * 0.12);
    wealthProjection = Math.max(0, Math.min(100, wealthProjection));

    // ----------------------------------------------------
    // PLANETARY IMPACT TELEMETRY CALCULATIONS
    // ----------------------------------------------------
    const eatingHabitValue = currentState.eatingHabit; // 0, 1, 2, 3
    const simPollution = currentState.simPollution || 0;
    const simDeforestation = currentState.simDeforestation || 0;
    const simPlastic = currentState.simPlastic || 0;
    const simFossil = currentState.simFossil || 0;

    // Atmospheric Quality
    let atmos = 100 - (currentState.screenTime * 1.5) - (currentState.stressLevel * 0.2) - (yearDiff * 0.6) - (simPollution * 0.3) - (simFossil * 0.2);
    atmos = Math.max(10, Math.min(100, Math.round(atmos)));

    // Biodiversity Index
    let biodiv = 100 - (eatingHabitValue === 0 ? 25 : eatingHabitValue === 1 ? 12 : 0) - (currentState.screenTime * 0.8) - (yearDiff * 0.8) - (simDeforestation * 0.4) - (simPlastic * 0.1);
    biodiv = Math.max(10, Math.min(100, Math.round(biodiv)));

    // Ocean Acidity Index (pH)
    let oceanpH = 8.15 - (yearDiff * 0.005) - (currentState.screenTime * 0.008) - (simPollution * 0.001) - (simFossil * 0.002);
    oceanpH = Math.max(7.2, Math.min(8.2, parseFloat(oceanpH.toFixed(3))));

    // Forest Canopy Density
    let canopy = 100 - (yearDiff * 1.2) - ((3 - eatingHabitValue) * 5) - (simDeforestation * 0.5);
    canopy = Math.max(10, Math.min(100, Math.round(canopy)));

    // Polar Ice Stability
    let ice = 100 - (yearDiff * 1.5) - (currentState.stressLevel * 0.15) - (simFossil * 0.3) - (simPollution * 0.1);
    ice = Math.max(10, Math.min(100, Math.round(ice)));

    // Planetary Carbon Load
    let carbon = (currentState.screenTime * 4 + currentState.stressLevel * 0.3 + (simFossil * 0.4) + (simPollution * 0.3)) * (1 + yearDiff * 0.08);
    carbon = Math.max(0, Math.min(100, Math.round(carbon)));

    // Human-Earth Alignment Ratio
    let alignment = 100 - (currentState.screenTime * 2) - (currentState.stressLevel * 0.3) + (currentState.exerciseDays * 3) + (eatingHabitValue * 4) - (simFossil * 0.2);
    alignment = Math.max(10, Math.min(100, Math.round(alignment)));

    // Store in State
    currentState.atmos = atmos;
    currentState.biodiv = biodiv;
    currentState.oceanpH = oceanpH;
    currentState.canopy = canopy;
    currentState.ice = ice;
    currentState.carbon = carbon;
    currentState.alignment = alignment;

    // Scale pH to 0-100% for progress bars
    const pHPercent = Math.max(0, Math.min(100, Math.round(((oceanpH - 7.2) / 1.0) * 100)));

    // Calculate Planetary average (with Carbon Load inverted)
    const planetaryAvg = (atmos + biodiv + pHPercent + canopy + ice + (100 - carbon) + alignment) / 7;
    currentState.planetaryAvg = planetaryAvg;

    // Overall Vitality Index (Personal Wellness)
    let vitalityIndex = (physicalHealth + mentalWellness) / 2;
    
    // Weighted Human-Earth Sustainability Index (50% Personal Wellness, 50% Planetary Health)
    let sustainabilityIndex = (vitalityIndex * 0.5) + (planetaryAvg * 0.5);
    currentState.ecoScore = Math.max(10, Math.min(100, Math.round(sustainabilityIndex)));
    currentState.burnoutRisk = burnoutRisk;
    currentState.careerGrowth = careerGrowth;
    currentState.physicalHealth = physicalHealth;
    currentState.mentalWellness = mentalWellness;

    // ----------------------------------------------------
    // DEFENSIVE UPDATE DOM FOR LIVE EARTH PANEL
    // ----------------------------------------------------
    const elAtmosVal = document.getElementById('earth-val-atmos');
    const elAtmosBar = document.getElementById('earth-bar-atmos');
    if (elAtmosVal) elAtmosVal.textContent = `${atmos} %`;
    if (elAtmosBar) {
        elAtmosBar.style.width = `${atmos}%`;
        elAtmosBar.style.background = atmos >= 75 ? 'var(--color-friendly)' : atmos >= 55 ? 'var(--color-moderate)' : atmos >= 35 ? 'var(--color-unsustainable)' : 'var(--color-danger)';
    }

    const elBiodivVal = document.getElementById('earth-val-biodiv');
    const elBiodivBar = document.getElementById('earth-bar-biodiv');
    if (elBiodivVal) elBiodivVal.textContent = `${biodiv} %`;
    if (elBiodivBar) {
        elBiodivBar.style.width = `${biodiv}%`;
        elBiodivBar.style.background = biodiv >= 75 ? 'var(--color-friendly)' : biodiv >= 55 ? 'var(--color-moderate)' : biodiv >= 35 ? 'var(--color-unsustainable)' : 'var(--color-danger)';
    }

    const elOceanVal = document.getElementById('earth-val-ocean');
    const elOceanBar = document.getElementById('earth-bar-ocean');
    if (elOceanVal) elOceanVal.textContent = `${oceanpH.toFixed(2)} pH`;
    if (elOceanBar) {
        elOceanBar.style.width = `${pHPercent}%`;
        elOceanBar.style.background = oceanpH >= 8.0 ? 'var(--color-friendly)' : oceanpH >= 7.8 ? 'var(--color-moderate)' : oceanpH >= 7.5 ? 'var(--color-unsustainable)' : 'var(--color-danger)';
    }

    const elCanopyVal = document.getElementById('earth-val-canopy');
    const elCanopyBar = document.getElementById('earth-bar-canopy');
    if (elCanopyVal) elCanopyVal.textContent = `${canopy} %`;
    if (elCanopyBar) {
        elCanopyBar.style.width = `${canopy}%`;
        elCanopyBar.style.background = canopy >= 75 ? 'var(--color-friendly)' : canopy >= 55 ? 'var(--color-moderate)' : canopy >= 35 ? 'var(--color-unsustainable)' : 'var(--color-danger)';
    }

    const elIceVal = document.getElementById('earth-val-ice');
    const elIceBar = document.getElementById('earth-bar-ice');
    if (elIceVal) elIceVal.textContent = `${ice} %`;
    if (elIceBar) {
        elIceBar.style.width = `${ice}%`;
        elIceBar.style.background = ice >= 75 ? 'var(--color-friendly)' : ice >= 55 ? 'var(--color-moderate)' : ice >= 35 ? 'var(--color-unsustainable)' : 'var(--color-danger)';
    }

    const elCarbonVal = document.getElementById('earth-val-carbon');
    const elCarbonBar = document.getElementById('earth-bar-carbon');
    if (elCarbonVal) elCarbonVal.textContent = `${carbon} %`;
    if (elCarbonBar) {
        elCarbonBar.style.width = `${carbon}%`;
        elCarbonBar.style.background = carbon < 35 ? 'var(--color-friendly)' : carbon < 55 ? 'var(--color-moderate)' : carbon < 75 ? 'var(--color-unsustainable)' : 'var(--color-danger)';
    }

    const elAlignVal = document.getElementById('earth-val-align');
    if (elAlignVal) {
        elAlignVal.textContent = `${alignment} %`;
        elAlignVal.className = alignment >= 75 ? 'font-green font-mono' : alignment >= 55 ? 'font-cyan font-mono' : alignment >= 35 ? 'font-amber font-mono' : 'font-red font-mono';
    }

    // Earth Health State Machine (Four-Tier Planetary Indicators)
    let earthHealthBadgeText = "HEALTHY EARTH";
    let earthHealthColor = "var(--color-friendly)";
    let bodyCollapseActive = false;

    if (currentState.ecoScore >= 75) {
        earthHealthBadgeText = "HEALTHY EARTH";
        earthHealthColor = "var(--color-friendly)";
    } else if (currentState.ecoScore >= 55) {
        earthHealthBadgeText = "WARNING EARTH";
        earthHealthColor = "var(--color-moderate)";
    } else if (currentState.ecoScore >= 35) {
        earthHealthBadgeText = "CRITICAL EARTH";
        earthHealthColor = "var(--color-unsustainable)";
    } else {
        earthHealthBadgeText = "COLLAPSE MODE";
        earthHealthColor = "var(--color-danger)";
        bodyCollapseActive = true;
    }

    const elBadge = document.getElementById('earth-health-state-badge');
    if (elBadge) {
        elBadge.textContent = earthHealthBadgeText;
        elBadge.style.borderColor = earthHealthColor;
        elBadge.style.color = earthHealthColor;
    }

    // Toggle Collapse active class on body and glass cards
    const bodyEl = document.body;
    if (bodyEl) {
        if (bodyCollapseActive) {
            bodyEl.classList.add('collapse-active');
        } else {
            bodyEl.classList.remove('collapse-active');
        }
    }

    const glassCards = document.querySelectorAll('.glass-card');
    glassCards.forEach(c => {
        if (bodyCollapseActive) {
            c.classList.add('glitch-effect');
        } else {
            c.classList.remove('glitch-effect');
        }
    });

    // ----------------------------------------------------
    // PLANETARY SIMULATION ENG METRICS & STACK
    // ----------------------------------------------------
    let globalTempRise = 1.1 + (carbon / 100) * 2.2 + (yearDiff * 0.015);
    globalTempRise = parseFloat(globalTempRise.toFixed(2));

    let seaLevelRise = 0.1 + (globalTempRise - 1.1) * 0.5 + ((100 - ice) / 100) * 0.8;
    seaLevelRise = parseFloat(seaLevelRise.toFixed(2));

    let renewRatio = Math.max(10, Math.min(100, Math.round(currentState.savingsRate * 1.5 + currentState.exerciseDays * 5 + (100 - currentState.stressLevel) * 0.3 - simFossil * 0.4)));
    let extinctionRate = Math.round(15 + ((100 - biodiv) / 100) * 225);

    // Save in State
    currentState.globalTempRise = globalTempRise;
    currentState.seaLevelRise = seaLevelRise;
    currentState.renewRatio = renewRatio;
    currentState.extinctionRate = extinctionRate;

    // Update Projections UI text nodes in column 1 card
    const projTempEl = document.getElementById('proj-temp');
    if (projTempEl) projTempEl.textContent = `+${globalTempRise.toFixed(2)} °C`;

    const projSpeciesEl = document.getElementById('proj-species');
    if (projSpeciesEl) projSpeciesEl.textContent = `+${seaLevelRise.toFixed(2)} m`;

    const projAcidEl = document.getElementById('proj-acid');
    if (projAcidEl) projAcidEl.textContent = `${renewRatio} %`;

    const projCanopyEl = document.getElementById('proj-canopy');
    if (projCanopyEl) projCanopyEl.textContent = `${extinctionRate} / day`;

    // Dynamic Cause-Effect Feed Updates
    const elSlide1 = document.querySelector('#tip-slide-1 p');
    if (elSlide1) {
        elSlide1.innerHTML = `High screen time (<strong>${currentState.screenTime}h/day</strong>) → higher local grid electricity demand → coal/gas combustion rises → atmospheric quality decays to <strong>${atmos}%</strong>.`;
    }
    const elSlide2 = document.querySelector('#tip-slide-2 p');
    if (elSlide2) {
        const dietLabels = ["POOR", "AVERAGE", "GOOD QUALITY", "CLEAN NUTRIENT"];
        elSlide2.innerHTML = `Poor eating habits (<strong>${dietLabels[currentState.eatingHabit]}</strong>) → industrial agriculture pressure climbs → forest canopy cleared for pastures → biodiversity survival drops to <strong>${biodiv}%</strong>.`;
    }
    const elSlide3 = document.querySelector('#tip-slide-3 p');
    if (elSlide3) {
        elSlide3.innerHTML = `Low savings (<strong>${currentState.savingsRate}% Savings</strong>) → frequent consumer purchases → manufacturing cycles increase → resource depletion climbs → sea level rise compounds by <strong>+${seaLevelRise}m</strong>.`;
    }

    // Dynamic Event Telemetry alerts
    const elEventsList = document.getElementById('satellite-events-list');
    if (elEventsList) {
        let eventsHtml = "";
        if (currentState.ecoScore >= 75) {
            eventsHtml = `
                <div class="news-item" style="border-left: 2px solid var(--color-friendly); padding-left: 8px; margin-bottom: 0.75rem;">
                    <div class="news-meta font-green text-xxs" style="font-weight: bold; display: flex; justify-content: space-between;">
                        <span>🟢 ATMOSPHERIC BALANCED</span> <span>NORMAL</span>
                    </div>
                    <h5>Planetary Carbon Scrubbers Operating at Peak</h5>
                    <p>Carbon saturation remains low at <strong>${carbon}%</strong>. Vibrant atmospheric circulation and solar indices balanced.</p>
                </div>
                <div class="news-item" style="border-left: 2px solid var(--color-friendly); padding-left: 8px;">
                    <div class="news-meta font-green text-xxs" style="font-weight: bold;">
                        <span>🏔️ POLAR GLACIER SYMMETRY</span>
                    </div>
                    <h5>Glacial Ice Caps Stability Reaches ${ice}%</h5>
                    <p>Polar regions remain frozen and stable. Sea level rise checked at a minimal <strong>+${seaLevelRise}m</strong>.</p>
                </div>
            `;
        } else if (currentState.ecoScore >= 35) {
            eventsHtml = `
                <div class="news-item" style="border-left: 2px solid var(--color-moderate); padding-left: 8px; margin-bottom: 0.75rem;">
                    <div class="news-meta font-amber text-xxs" style="font-weight: bold; display: flex; justify-content: space-between;">
                        <span>⚠️ ELEVATED AQI HAZARD</span> <span class="animate-pulse">WARNING</span>
                    </div>
                    <h5>Aerosol Smog Build-up in Urban Grids</h5>
                    <p>Atmospheric quality has declined to <strong>${atmos}%</strong>. Carbon load is rising. Bypassing screen loads recommended.</p>
                </div>
                <div class="news-item" style="border-left: 2px solid var(--color-unsustainable); padding-left: 8px;">
                    <div class="news-meta font-pink text-xxs" style="font-weight: bold;">
                        <span>🏔️ GLACIAL RETREAT DETECTED</span>
                    </div>
                    <h5>Polar Ice stability dropped to ${ice}%</h5>
                    <p>Glaciers are retreating at accelerated velocities. Coastal water lines rising. Sea level currently at <strong>+${seaLevelRise}m</strong>.</p>
                </div>
            `;
        } else {
            eventsHtml = `
                <div class="news-item" style="border-left: 2px solid var(--color-danger); padding-left: 8px; margin-bottom: 0.75rem;">
                    <div class="news-meta font-red text-xxs" style="font-weight: bold; display: flex; justify-content: space-between;">
                        <span>🚨 PLANETARY STABILITY CRITICAL</span> <span class="animate-flash" style="color:#ef4444;">COLLAPSE</span>
                    </div>
                    <h5>Ecosystem Feedback Loop Failures Active</h5>
                    <p>Consolidated Earth integrity average is at a fatal <strong>${Math.round(planetaryAvg)}%</strong>. Global temperatures have risen by <strong>+${globalTempRise}°C</strong>.</p>
                </div>
                <div class="news-item" style="border-left: 2px solid var(--color-danger); padding-left: 8px; margin-bottom: 0.75rem;">
                    <div class="news-meta font-red text-xxs" style="font-weight: bold;">
                        <span>💀 MASS EXTINCTION EVENT</span>
                    </div>
                    <h5>Marine Acidification Catastrophic at ${oceanpH} pH</h5>
                    <p>Coral ecosystems have collapsed. Species extinction rate has surged to a critical <strong>${extinctionRate} / day</strong>.</p>
                </div>
                <div class="news-item" style="border-left: 2px solid var(--color-danger); padding-left: 8px;">
                    <div class="news-meta font-red text-xxs" style="font-weight: bold;">
                        <span>🌊 COASTAL STORM INUNDATION</span>
                    </div>
                    <h5>Sea Level Rise Climbs to +${seaLevelRise}m</h5>
                    <p>Low-lying grid sectors undergo active seawater flooding. Emergency evacuation routes triggered in coastal hubs.</p>
                </div>
            `;
        }
        elEventsList.innerHTML = eventsHtml;
    }

    // 4.3 Update UI Widgets
    updateUI(burnoutRisk, careerGrowth, mentalWellness, physicalHealth);
    
    // Check achievements unlock conditions
    checkAchievements();
    
    // Sync Agent dashboard UI
    updateProfileDashboardUI();
    
    // Evaluate daily challenges
    evaluateQuests();
    
    // Update Campus Battle scoring Standings
    updateBattleLeaderboard();

    // 4.4 Live Charts Update
    updateCharts(instant);
}

// 5. UPDATE UI VIEW & TICKERS
function updateUI(burnout, career, mental, physical) {
    const scoreVal = currentState.ecoScore;
    const scoreNum = document.getElementById('score-num');
    if (scoreNum) scoreNum.textContent = scoreVal;
    
    // Calculate circular stroke-dashoffset (Radius = 92, Perimeter = 2 * PI * 92 = 578)
    const strokeDashOffset = 578 - (578 * scoreVal) / 100;
    const progressRing = document.getElementById('score-ring-progress');
    if (progressRing) {
        progressRing.style.strokeDashoffset = strokeDashOffset;
    }

    // Get color & status classes
    let statusClass = 'status-moderately';
    let statusText = 'Stable Cognitive Path';
    let scoreColor = 'var(--color-moderate)';
    
    if (scoreVal >= 80) {
        statusClass = 'status-friendly';
        statusText = 'Optimal Vitality Path';
        scoreColor = 'var(--color-friendly)';
    } else if (scoreVal >= 60) {
        statusClass = 'status-moderately';
        statusText = 'Stable Cognitive Path';
        scoreColor = 'var(--color-moderate)';
    } else if (scoreVal >= 40) {
        statusClass = 'status-unsustainable';
        statusText = 'Stressed Burnout Path';
        scoreColor = 'var(--color-unsustainable)';
    } else {
        statusClass = 'status-highimpact';
        statusText = 'Critical Cognitive Exhaustion';
        scoreColor = 'var(--color-danger)';
    }

    if (progressRing) {
        progressRing.style.stroke = scoreColor;
    }

    // Update earth-halo style
    const earthHalo = document.getElementById('earth-halo');
    if (earthHalo) {
        earthHalo.className = `earth-halo-glow ${statusClass}`;
    }
    
    const statusBadge = document.getElementById('status-badge');
    if (statusBadge) {
        statusBadge.className = `status-badge ${statusClass}`;
        const statusIcon = statusBadge.querySelector('i');
        if (statusIcon) {
            statusIcon.className = scoreVal >= 60 ? 'fa-solid fa-circle-check' : 'fa-solid fa-triangle-exclamation';
        }
    }
    
    const statusTextEl = document.getElementById('status-text');
    if (statusTextEl) {
        statusTextEl.textContent = statusText;
    }

    // Update real-time header badges for each category in columns
    const valElectricity = document.getElementById('val-electricity-cost');
    if (valElectricity) valElectricity.textContent = `${Math.round(career)} pts`;

    const valWater = document.getElementById('val-water-efficiency');
    if (valWater) valWater.textContent = `${Math.round(mental)}%`;

    const valPlastic = document.getElementById('val-plastic-level');
    if (valPlastic) valPlastic.textContent = `${Math.round(burnout)}%`;

    const valFood = document.getElementById('val-food-impact');
    if (valFood) {
        const eatingLabels = ["Poor Intake", "Average Diet", "Good Balanced", "Clean Superfoods"];
        valFood.textContent = eatingLabels[currentState.eatingHabit] || "Good Balanced";
    }

    // Live Tickers Calculations (Compare Current vs BASELINE)
    const annualSavings = Math.round(currentState.savingsRate * 12 * 80); // proportional INR saved
    const annualCo2 = Math.round((16 - currentState.screenTime) * 150); // screen equivalent detox
    const annualWater = Math.round((currentState.sleepHours - 3) * 5000); // deep biological recovery equivalent
    const treesEquivalent = (currentState.exerciseDays * 1.5).toFixed(1);

    animateTicker('save-cash', annualSavings);
    animateTicker('save-co2', annualCo2);
    animateTicker('save-water', annualWater);
    
    const saveTrees = document.getElementById('save-trees');
    if (saveTrees) saveTrees.textContent = treesEquivalent;

    // Campus standings ECE Department average
    const campusRankVal = document.getElementById('campus-rank-val');
    if (campusRankVal) {
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
    }

    // Standings list update
    updateLeaderboard();

    // Update Before vs After comparison Table in centerpiece
    const compOptScore = document.getElementById('comp-opt-score');
    if (compOptScore) compOptScore.textContent = scoreVal;
    
    const compDiffScore = document.getElementById('comp-diff-score');
    if (compDiffScore) compDiffScore.textContent = `+${Math.max(0, scoreVal - BASELINE.ecoScore)} pts`;
    
    const compOptCo2 = document.getElementById('comp-opt-co2');
    if (compOptCo2) compOptCo2.textContent = `${Math.round(burnout)}%`;
    
    const compDiffCo2 = document.getElementById('comp-diff-co2');
    if (compDiffCo2) {
        const burnoutDiff = Math.round(80 - burnout);
        compDiffCo2.textContent = burnoutDiff >= 0 ? `-${burnoutDiff}%` : `+${Math.abs(burnoutDiff)}%`;
    }

    const compOptWater = document.getElementById('comp-opt-water');
    if (compOptWater) compOptWater.textContent = `${currentState.studyHours.toFixed(1)} hr`;
    
    const compDiffWater = document.getElementById('comp-diff-water');
    if (compDiffWater) {
        const focusIncrease = Math.round(((currentState.studyHours - 1) / 1) * 100);
        compDiffWater.textContent = focusIncrease >= 0 ? `+${focusIncrease}%` : `${focusIncrease}%`;
    }

    // Dynamic AI Coach suggestions cards (under centerpiece)
    updateAiRecommendationsList();
}

// Ticker Animation
const activeTickers = {};
function animateTicker(elementId, targetValue) {
    const el = document.getElementById(elementId);
    if (!el) return;
    
    const currentValue = parseInt(el.textContent.replace(/,/g, '')) || 0;
    if (currentValue === targetValue) return;
    
    if (activeTickers[elementId]) {
        cancelAnimationFrame(activeTickers[elementId]);
    }
    
    const duration = 400; 
    const startTime = performance.now();
    
    function updateTicker(now) {
        const elapsed = now - startTime;
        const progress = Math.min(elapsed / duration, 1);
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

// Department Leaderboard Standing
function updateLeaderboard() {
    const userScore = currentState.ecoScore;
    const leaderboardList = document.getElementById('leaderboard-list');
    if (!leaderboardList) return;
    
    const departments = [
        { name: "Computer Science Dept", score: 81, isUser: false },
        { name: "ECE Department (You)", score: userScore, isUser: true },
        { name: "Mechanical Dept", score: 61, isUser: false }
    ];

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

// AI Recommendations List
function updateAiRecommendationsList() {
    const container = document.getElementById('insights-container');
    if (!container) return;
    container.innerHTML = '';

    const list = [];

    if (currentState.screenTime >= 8) {
        list.push({
            icon: 'fa-display font-amber',
            title: 'Critical Screen Load',
            text: `Your ${currentState.screenTime}h screen load decays your cellular tissues and elevates cognitive fatigue. Carry out a Digital Detox!`
        });
    }

    if (currentState.sleepHours < 6) {
        list.push({
            icon: 'fa-bed font-cyan',
            title: 'Acute Rest Deprivation',
            text: 'Your daily rest hours are below healthy baseline. Regulation to 8 hours daily will instantly boost cellular longevity.'
        });
    }

    if (currentState.savingsRate < 15) {
        list.push({
            icon: 'fa-indian-rupee-sign font-pink',
            title: 'Sub-Optimal Wealth Matrix',
            text: 'Your current financial savings rate is too low. Aim for at least 25% savings to lock career wealth projection targets.'
        });
    }

    if (currentState.stressLevel >= 60) {
        list.push({
            icon: 'fa-brain font-red',
            title: 'Neurological Stress Fatigue',
            text: 'High cortisol and stress index detected. Apply deep breathing or meditation cycles to regulated neural stability.'
        });
    }

    if (list.length === 0) {
        list.push({
            icon: 'fa-thumbs-up font-green',
            title: 'Perfect Chrono Equilibrium',
            text: 'Your current lifestyle choices are absolutely outstanding! Continue practicing regulated habits and secure your Zen destiny!'
        });
    }

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

// 6. CHART.JS INTERFACE MANAGER
function initCharts() {
    const ctxBreakdown = document.getElementById('chart-breakdown');
    if (ctxBreakdown && typeof Chart !== 'undefined') {
        const ctxDoughnut = ctxBreakdown.getContext('2d');
        breakdownChart = new Chart(ctxDoughnut, {
            type: 'doughnut',
            data: {
                labels: ['Sleep', 'Screen Time', 'Study/Focus', 'Exercise', 'Stress load'],
                datasets: [{
                    data: [7, 5, 4, 3, 3],
                    backgroundColor: [
                        '#3b82f6', // Blue
                        '#eab308', // Yellow
                        '#06b6d4', // Cyan
                        '#10b981', // Emerald
                        '#ef4444'  // Red
                    ],
                    borderWidth: 2,
                    borderColor: '#0d1425'
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                animation: { duration: 800, easing: 'easeOutQuart' },
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
                        cornerRadius: 8,
                        bodyFont: { family: 'Outfit', size: 10 },
                        titleFont: { family: 'Outfit', size: 11, weight: 'bold' }
                    }
                },
                cutout: '74%'
            }
        });
    }

    const ctxPrediction = document.getElementById('chart-prediction');
    if (ctxPrediction && typeof Chart !== 'undefined') {
        const ctxLine = ctxPrediction.getContext('2d');
        const greenGrad = ctxLine.createLinearGradient(0, 0, 0, 160);
        greenGrad.addColorStop(0, 'rgba(16, 185, 129, 0.22)');
        greenGrad.addColorStop(1, 'rgba(16, 185, 129, 0.0)');
        
        const redGrad = ctxLine.createLinearGradient(0, 0, 0, 160);
        redGrad.addColorStop(0, 'rgba(239, 68, 68, 0.20)');
        redGrad.addColorStop(1, 'rgba(239, 68, 68, 0.0)');

        predictionChart = new Chart(ctxLine, {
            type: 'line',
            data: {
                labels: ['2025', '2030', '2035', '2040'],
                datasets: [
                    {
                        label: 'Doomscrolling BAU',
                        data: [35, 24, 14, 8],
                        borderColor: '#ef4444',
                        borderWidth: 2.0,
                        backgroundColor: redGrad,
                        fill: true,
                        tension: 0.35,
                        pointRadius: 2
                    },
                    {
                        label: 'Optimized Path',
                        data: [72, 70, 68, 65],
                        borderColor: '#10b981',
                        borderWidth: 2.5,
                        backgroundColor: greenGrad,
                        fill: true,
                        tension: 0.35,
                        pointRadius: 4,
                        pointBackgroundColor: '#10b981',
                        pointBorderColor: '#ffffff'
                    }
                ]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                animation: { duration: 800, easing: 'easeOutQuart' },
                plugins: { legend: { display: false } },
                scales: {
                    x: {
                        grid: { color: 'rgba(255, 255, 255, 0.02)' },
                        ticks: { color: '#9ca3af', font: { family: 'Share Tech Mono', size: 9 } }
                    },
                    y: {
                        grid: { color: 'rgba(255, 255, 255, 0.02)' },
                        ticks: { color: '#9ca3af', font: { family: 'Share Tech Mono', size: 9 } }
                    }
                }
            }
        });
    }

    if (window.initHistoryMiniChart) {
        window.initHistoryMiniChart();
    }
}

function updateCharts(instant = false) {
    if (breakdownChart) {
        breakdownChart.data.datasets[0].data = [
            currentState.sleepHours,
            currentState.screenTime,
            currentState.studyHours,
            currentState.exerciseDays,
            currentState.stressLevel / 10
        ];
        breakdownChart.update(instant ? 'none' : undefined);
    }

    if (predictionChart) {
        predictionChart.data.datasets[1].data = [
            calculateVitalityForYear(2025),
            calculateVitalityForYear(2030),
            calculateVitalityForYear(2035),
            calculateVitalityForYear(2040)
        ];
        predictionChart.update(instant ? 'none' : undefined);
    }
}

// 7. DYNAMIC 2D CANVAS CYBERNETIC AVATAR LOOP
function initEarthCanvas() {
    const canvas = document.getElementById('earth-canvas');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    // Hide default EcoSphere overlays if present
    const crackedOverlay = document.getElementById('earth-cracks');
    if (crackedOverlay) crackedOverlay.style.opacity = '0';

    function drawLoop() {
        const now = performance.now();
        if (!drawLoop.lastTime) drawLoop.lastTime = now;
        const delta = Math.min(3.0, (now - drawLoop.lastTime) / 16.667);
        drawLoop.lastTime = now;

        const width = canvas.width || 340;
        const height = canvas.height || 340;
        const center = width / 2;

        drawAvatar(ctx, center, width, height, interpolatedEcoScore, delta);
        earthAnimationFrameId = requestAnimationFrame(drawLoop);
    }

    drawLoop();
}

function drawAvatar(ctx, center, width, height, score, delta = 1) {
    ctx.clearRect(0, 0, width, height);

    // Easing interpolation chase (moves smoothly to currentState.ecoScore)
    interpolatedEcoScore += (currentState.ecoScore - interpolatedEcoScore) * 0.05 * delta;

    hudRingRotation += 0.004 * delta;
    const pulseScale = Math.sin(performance.now() / 650) * 1.5;
    
    let glowColor = 'rgba(6, 182, 212, 0.85)'; // cyan
    let glowRgb = [6, 182, 212];
    if (interpolatedEcoScore >= 75) {
        glowColor = 'rgba(16, 185, 129, 0.85)'; // green
        glowRgb = [16, 185, 129];
    } else if (interpolatedEcoScore >= 55) {
        glowColor = 'rgba(6, 182, 212, 0.85)'; // cyan
        glowRgb = [6, 182, 212];
    } else if (interpolatedEcoScore >= 35) {
        glowColor = 'rgba(245, 158, 11, 0.85)'; // amber
        glowRgb = [245, 158, 11];
    } else {
        glowColor = 'rgba(239, 68, 68, 0.85)'; // red
        glowRgb = [239, 68, 68];
    }

    // Glitch offsets triggered by collapse mode or high burnout risk (>75%)
    const burnoutRisk = currentState.burnoutRisk || 0;
    const isCollapse = interpolatedEcoScore < 35;
    const isGlitching = (isCollapse || burnoutRisk > 75) && Math.random() > 0.82;

    ctx.save();
    if (isGlitching) {
        ctx.translate((Math.random() - 0.5) * 12, (Math.random() - 0.5) * 4); // intense CRT jitter
    }

    // ----------------------------------------------------
    // 1. LEFT HALF: ROTATING NEXT-GEN EARTH SIMULATION
    // ----------------------------------------------------
    const globeX = 82;
    const globeY = 170;
    const globeRadius = 65;

    // Siren Background Alert Glow (Collapse Mode)
    if (isCollapse) {
        ctx.fillStyle = `rgba(239, 68, 68, ${0.03 + Math.sin(performance.now() / 250) * 0.02})`;
        ctx.beginPath();
        ctx.arc(globeX, globeY, globeRadius + 30, 0, Math.PI * 2);
        ctx.fill();
    }
    
    // Draw Globe Oceans with dynamic colors
    let oceanColor = 'rgba(6, 182, 212, 0.15)'; // healthy cyan
    let landColor = `rgba(${glowRgb[0]}, ${glowRgb[1]}, ${glowRgb[2]}, 0.65)`;
    if (interpolatedEcoScore >= 75) {
        oceanColor = 'rgba(16, 185, 129, 0.16)'; // green-cyan
        landColor = 'rgba(16, 185, 129, 0.78)';
    } else if (interpolatedEcoScore >= 55) {
        oceanColor = 'rgba(6, 182, 212, 0.12)'; // blue-cyan
        landColor = 'rgba(6, 182, 212, 0.72)';
    } else if (interpolatedEcoScore >= 35) {
        oceanColor = 'rgba(245, 158, 11, 0.08)'; // stagnant amber
        landColor = 'rgba(217, 119, 6, 0.65)';
    } else {
        oceanColor = 'rgba(30, 20, 20, 0.85)'; // stagnant collapse charcoal grey
        landColor = 'rgba(60, 60, 60, 0.85)';
    }
    
    ctx.fillStyle = oceanColor;
    ctx.beginPath();
    ctx.arc(globeX, globeY, globeRadius, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = `rgba(${glowRgb[0]}, ${glowRgb[1]}, ${glowRgb[2]}, 0.35)`;
    ctx.lineWidth = 1.5;
    ctx.stroke();

    // Draw Cracks inside oceans if in Collapse Mode
    if (isCollapse) {
        ctx.save();
        ctx.beginPath();
        ctx.arc(globeX, globeY, globeRadius, 0, Math.PI * 2);
        ctx.clip();
        
        ctx.strokeStyle = 'rgba(239, 68, 68, 0.25)';
        ctx.lineWidth = 0.8;
        for (let i = 0; i < 6; i++) {
            ctx.beginPath();
            ctx.moveTo(globeX + (Math.sin(i * 1.2) * globeRadius * 0.8), globeY - globeRadius);
            ctx.quadraticCurveTo(globeX + (Math.cos(i) * 18), globeY + (Math.sin(i * 1.5) * 15), globeX + (Math.cos(i * 1.2) * globeRadius * 0.8), globeY + globeRadius);
            ctx.stroke();
        }
        ctx.restore();
    }

    // Atmosphere halo rim glow
    ctx.save();
    ctx.shadowColor = `rgb(${glowRgb[0]}, ${glowRgb[1]}, ${glowRgb[2]})`;
    ctx.shadowBlur = 12;
    ctx.strokeStyle = `rgba(${glowRgb[0]}, ${glowRgb[1]}, ${glowRgb[2]}, 0.25)`;
    ctx.lineWidth = 1.0;
    ctx.beginPath();
    ctx.arc(globeX, globeY, globeRadius + 4, 0, Math.PI * 2);
    ctx.stroke();
    ctx.restore();

    // Rotating Grid lines (longitude/latitude) simulating orthographic rotation
    ctx.save();
    ctx.beginPath();
    ctx.arc(globeX, globeY, globeRadius, 0, Math.PI * 2);
    ctx.clip(); // Keep grid inside oceans
    
    ctx.strokeStyle = `rgba(${glowRgb[0]}, ${glowRgb[1]}, ${glowRgb[2]}, 0.22)`;
    ctx.lineWidth = 0.85;
    const timeRot = performance.now() * 0.0006;
    
    // Draw 3 rotating longitudes
    for (let i = 0; i < 3; i++) {
        const offset = ((timeRot + i * (Math.PI / 3)) % Math.PI) - Math.PI / 2;
        const width = globeRadius * Math.sin(offset);
        if (Math.cos(offset) > 0) {
            ctx.beginPath();
            ctx.ellipse(globeX, globeY, Math.abs(width), globeRadius, 0, 0, Math.PI * 2);
            ctx.stroke();
        }
    }
    
    // Draw latitudes
    for (let lat = -2; lat <= 2; lat++) {
        const latY = globeY + (lat * globeRadius * 0.3);
        const latR = Math.sqrt(globeRadius * globeRadius - (latY - globeY) * (latY - globeY));
        ctx.beginPath();
        ctx.ellipse(globeX, latY, latR, latR * 0.12, 0, 0, Math.PI * 2);
        ctx.stroke();
    }
    
    // Draw Continent Clusters (simulating land masses floating across)
    const landSpeed = 0.0004;
    const landSeed = [
        { lat: 0.1, lonOffset: 0, size: 14 },
        { lat: -0.3, lonOffset: 1.5, size: 20 },
        { lat: 0.4, lonOffset: 3.0, size: 16 },
        { lat: -0.1, lonOffset: 4.2, size: 12 },
        { lat: 0.2, lonOffset: 5.5, size: 18 }
    ];
    landSeed.forEach(mass => {
        const lon = (performance.now() * landSpeed + mass.lonOffset) % (Math.PI * 2);
        const cosLat = Math.cos(mass.lat);
        const sinLon = Math.sin(lon);
        const cosLon = Math.cos(lon);
        
        if (cosLon > 0) { // On the visible hemisphere
            const lx = globeX + globeRadius * cosLat * sinLon;
            const ly = globeY + globeRadius * Math.sin(mass.lat);
            
            ctx.beginPath();
            ctx.arc(lx, ly, mass.size * (0.35 + cosLon * 0.65), 0, Math.PI * 2);
            ctx.fillStyle = landColor;
            ctx.fill();

            // Draw forest fires if in Collapse Mode
            if (isCollapse) {
                ctx.fillStyle = `rgba(239, 68, 68, ${0.45 + Math.sin(performance.now() / 120) * 0.45})`;
                ctx.beginPath();
                ctx.arc(lx + 2, ly - 2, 4, 0, Math.PI * 2);
                ctx.fill();
            }
        }
    });

    // Polar Ice Cap (melts with higher timeline and lower ice stability)
    const iceFactor = (currentState.ice || 100) / 100;
    const polarIceSize = 18 * iceFactor;
    if (polarIceSize > 1) {
        ctx.fillStyle = 'rgba(255, 255, 255, 0.95)';
        // Top Cap
        ctx.beginPath();
        ctx.arc(globeX, globeY - 58, polarIceSize, 0, Math.PI, true);
        ctx.closePath();
        ctx.fill();
        
        // Bottom Cap
        ctx.beginPath();
        ctx.arc(globeX, globeY + 58, polarIceSize * 0.8, Math.PI, 0, true);
        ctx.closePath();
        ctx.fill();
    }

    // Dynamic Cloud Formations (flowing white/grey paths)
    ctx.fillStyle = isCollapse ? 'rgba(100, 85, 85, 0.28)' : 'rgba(255, 255, 255, 0.16)';
    const cloudSpeed = 0.0003;
    const cloudTime = performance.now() * cloudSpeed;
    for (let c = 0; c < 3; c++) {
        const cx = globeX + Math.sin(cloudTime + c * 2.2) * globeRadius * 0.7;
        const cy = globeY - 24 + c * 24;
        ctx.beginPath();
        ctx.arc(cx, cy, 14, 0, Math.PI * 2);
        ctx.fill();
    }

    // Glowing Auroras (Active during high score states)
    if (interpolatedEcoScore >= 75) {
        ctx.strokeStyle = `rgba(16, 185, 129, ${0.15 + Math.sin(performance.now() / 400) * 0.1})`;
        ctx.lineWidth = 2.5;
        ctx.beginPath();
        ctx.ellipse(globeX, globeY - 50, 42, 7, 0.08, 0, Math.PI * 2);
        ctx.stroke();
    }

    // Atmospheric Red Lightning Bolts (Flashes during collapse)
    if (isCollapse && Math.random() > 0.93) {
        ctx.strokeStyle = 'rgba(239, 68, 68, 0.85)';
        ctx.lineWidth = 1.4;
        ctx.beginPath();
        ctx.moveTo(globeX - 40 + Math.random() * 80, globeY - 52);
        ctx.lineTo(globeX - 10 + Math.random() * 20, globeY);
        ctx.lineTo(globeX - 30 + Math.random() * 60, globeY + 52);
        ctx.stroke();
    }
    
    ctx.restore();

    // ----------------------------------------------------
    // 2. RIGHT HALF: GLOWING CYBERNETIC HUMAN
    // ----------------------------------------------------
    const humanX = 258;
    const humanY = 170;
    
    ctx.strokeStyle = glowColor;
    ctx.lineWidth = 2.0;
    ctx.shadowColor = `rgb(${glowRgb[0]}, ${glowRgb[1]}, ${glowRgb[2]})`;
    ctx.shadowBlur = 8;
    ctx.lineCap = "round";
    ctx.lineJoin = "round";

    // HEAD
    ctx.beginPath();
    ctx.arc(humanX, humanY - 45, 13, 0, Math.PI * 2);
    ctx.stroke();

    // SPINE/NECK
    ctx.beginPath();
    ctx.moveTo(humanX, humanY - 32);
    ctx.lineTo(humanX, humanY + 22);
    ctx.stroke();

    // SHOULDERS
    ctx.beginPath();
    ctx.moveTo(humanX - 26, humanY - 20);
    ctx.lineTo(humanX + 26, humanY - 20);
    ctx.stroke();

    // ARMS
    ctx.beginPath();
    ctx.moveTo(humanX - 26, humanY - 20);
    ctx.lineTo(humanX - 38, humanY + 12);
    ctx.moveTo(humanX + 26, humanY - 20);
    ctx.lineTo(humanX + 38, humanY + 12);
    ctx.stroke();

    // TORSO/CHEST
    ctx.beginPath();
    ctx.moveTo(humanX - 26, humanY - 20);
    ctx.lineTo(humanX - 14, humanY + 22);
    ctx.lineTo(humanX + 14, humanY + 22);
    ctx.lineTo(humanX + 26, humanY - 20);
    ctx.closePath();
    ctx.stroke();

    // LEGS
    ctx.beginPath();
    ctx.moveTo(humanX - 14, humanY + 22);
    ctx.lineTo(humanX - 18, humanY + 68);
    ctx.moveTo(humanX + 14, humanY + 22);
    ctx.lineTo(humanX + 18, humanY + 68);
    ctx.stroke();

    // 2.3 HEAD BRAIN OSCILLATIONS
    ctx.save();
    ctx.beginPath();
    ctx.arc(humanX, humanY - 45, 13, 0, Math.PI * 2);
    ctx.clip();

    ctx.strokeStyle = `rgba(${glowRgb[0]}, ${glowRgb[1]}, ${glowRgb[2]}, 0.55)`;
    ctx.lineWidth = 1.0;
    ctx.beginPath();
    const frequency = 0.18;
    const speed = 0.009 * (currentState.stressLevel || 30);
    const amplitude = 4;
    const time = performance.now() * speed;

    for (let x = humanX - 15; x <= humanX + 15; x++) {
        const y = humanY - 45 + Math.sin((x - humanX) * frequency + time) * amplitude;
        if (x === humanX - 15) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
    }
    ctx.stroke();
    ctx.restore();

    // 2.4 CHEST HEART RATE BEATS
    const heartPulseBpm = 60 + (burnoutRisk / 100) * 120;
    const heartPulsePeriod = 60000 / heartPulseBpm;
    const heartPulsePhase = (performance.now() % heartPulsePeriod) / heartPulsePeriod;
    const heartPulseScale = 1 + Math.sin(heartPulsePhase * Math.PI) * 0.45;
    
    ctx.fillStyle = `rgba(${glowRgb[0]}, ${glowRgb[1]}, ${glowRgb[2]}, 0.8)`;
    ctx.beginPath();
    ctx.arc(humanX, humanY - 8, 4.5 * heartPulseScale, 0, Math.PI * 2);
    ctx.fill();

    ctx.strokeStyle = `rgba(${glowRgb[0]}, ${glowRgb[1]}, ${glowRgb[2]}, ${Math.max(0, 0.6 - heartPulsePhase)})`;
    ctx.lineWidth = 0.9;
    ctx.beginPath();
    ctx.arc(humanX, humanY - 8, 16 * heartPulsePhase, 0, Math.PI * 2);
    ctx.stroke();

    // ----------------------------------------------------
    // 3. CENTER TELEMETRY & BEZIER CONNECTIONS
    // ----------------------------------------------------
    ctx.strokeStyle = `rgba(${glowRgb[0]}, ${glowRgb[1]}, ${glowRgb[2]}, 0.22)`;
    ctx.lineWidth = 1.0;
    ctx.setLineDash([4, 4]);
    
    // Path 1: Upper link
    ctx.beginPath();
    ctx.moveTo(humanX, humanY - 20);
    ctx.quadraticCurveTo(170, 130, globeX + 50, globeY - 25);
    ctx.stroke();

    // Path 2: Center link
    ctx.beginPath();
    ctx.moveTo(humanX, humanY - 8);
    ctx.quadraticCurveTo(170, 170, globeX + 65, globeY);
    ctx.stroke();

    // Path 3: Lower link
    ctx.beginPath();
    ctx.moveTo(humanX, humanY + 15);
    ctx.quadraticCurveTo(170, 210, globeX + 50, globeY + 25);
    ctx.stroke();
    
    ctx.setLineDash([]); // Reset
    
    // Flowing connection dots
    const dotTime = (performance.now() * 0.0008) % 1.0;
    ctx.fillStyle = `rgba(${glowRgb[0]}, ${glowRgb[1]}, ${glowRgb[2]}, 0.9)`;
    
    // P1 dot
    const p1x = humanX * (1 - dotTime) + (globeX + 50) * dotTime;
    const p1y = (humanY - 20) * (1 - dotTime) + (globeY - 25) * dotTime - Math.sin(dotTime * Math.PI) * 12;
    ctx.beginPath();
    ctx.arc(p1x, p1y, 3, 0, Math.PI * 2);
    ctx.fill();

    // P2 dot
    const p2x = (globeX + 65) * (1 - dotTime) + humanX * dotTime;
    const p2y = globeY * (1 - dotTime) + (humanY - 8) * dotTime;
    ctx.beginPath();
    ctx.arc(p2x, p2y, 2.5, 0, Math.PI * 2);
    ctx.fill();

    // P3 dot
    const p3x = humanX * (1 - dotTime) + (globeX + 50) * dotTime;
    const p3y = (humanY + 15) * (1 - dotTime) + (globeY + 25) * dotTime + Math.sin(dotTime * Math.PI) * 12;
    ctx.beginPath();
    ctx.arc(p3x, p3y, 3, 0, Math.PI * 2);
    ctx.fill();

    ctx.restore();

    // 4. Orbit telemetries HUD rings around the whole view
    ctx.save();
    ctx.translate(center, center);
    ctx.rotate(-0.06);
    ctx.strokeStyle = `rgba(${glowRgb[0]}, ${glowRgb[1]}, ${glowRgb[2]}, 0.16)`;
    ctx.lineWidth = 0.8;
    ctx.setLineDash([3, 15]);
    ctx.lineDashOffset = -hudRingRotation * 60;
    ctx.beginPath();
    ctx.ellipse(0, 0, 160 + pulseScale, 152 + pulseScale * 0.15, 0, 0, Math.PI * 2);
    ctx.stroke();
    ctx.restore();

    // 5. Horizontal CRT scanlines overlay
    ctx.fillStyle = 'rgba(255, 255, 255, 0.015)';
    for (let y = 10; y < height - 10; y += 4) {
        ctx.fillRect(10, y, width - 20, 1.0);
    }

    // 6. Draw Volumetric Atmospheric Aura Glow
    ctx.save();
    ctx.shadowColor = `rgb(${glowRgb[0]}, ${glowRgb[1]}, ${glowRgb[2]})`;
    ctx.shadowBlur = 12;
    ctx.strokeStyle = `rgba(${glowRgb[0]}, ${glowRgb[1]}, ${glowRgb[2]}, 0.15)`;
    ctx.lineWidth = 1.0;
    ctx.beginPath();
    ctx.arc(globeX, globeY, globeRadius + 12, 0, Math.PI * 2);
    ctx.stroke();
    ctx.restore();

    // 7. Spawn and draw active particles
    spawnCanvasParticles(center, 120, interpolatedEcoScore);
    updateAndDrawParticles(ctx, delta);
}

// 8. FLOATING AI ASSISTANT CHAT ENGINE
function toggleChat() {
    const chatBox = document.getElementById('ai-chat-box');
    if (!chatBox) return;
    chatBox.classList.toggle('hidden');
    
    if (!chatBox.classList.contains('hidden')) {
        setTimeout(() => {
            const chatMessages = document.getElementById('chat-messages');
            if (chatMessages) chatMessages.scrollTop = chatMessages.scrollHeight;
        }, 50);
    }
}

function handleChatKeyPress(event) {
    if (event.key === 'Enter') {
        sendMessage();
    }
}

function showThinkingIndicator() {
    const chatMessages = document.getElementById('chat-messages');
    if (!chatMessages) return;
    
    if (document.getElementById('chat-thinking')) return;

    const wave = document.getElementById('voice-wave-container');
    if (wave) wave.classList.add('voice-wave-active');

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
    const wave = document.getElementById('voice-wave-container');
    if (wave) wave.classList.remove('voice-wave-active');
}

function sendMessage() {
    const inputEl = document.getElementById('chat-user-input');
    if (!inputEl) return;
    const msgText = inputEl.value.trim();
    
    if (msgText === '') return;

    addUserMessage(msgText);
    inputEl.value = '';

    showThinkingIndicator();
    
    setTimeout(() => {
        hideThinkingIndicator();
        const response = getAIResponse(msgText);
        addBotMessage(response);
    }, 900); 
}

function addUserMessage(text) {
    const chatMessages = document.getElementById('chat-messages');
    if (!chatMessages) return;
    
    const msgDiv = document.createElement('div');
    msgDiv.className = 'chat-msg user-msg';
    msgDiv.innerHTML = `<div class="msg-bubble">${text}</div>`;
    
    chatMessages.appendChild(msgDiv);
    chatMessages.scrollTop = chatMessages.scrollHeight;
}

function addBotMessage(text) {
    const chatMessages = document.getElementById('chat-messages');
    if (!chatMessages) return;
    
    const msgDiv = document.createElement('div');
    msgDiv.className = 'chat-msg ai-msg';
    
    const bubble = document.createElement('div');
    bubble.className = 'msg-bubble';
    msgDiv.appendChild(bubble);
    chatMessages.appendChild(msgDiv);
    
    let i = 0;
    let isTag = false;
    let tempText = "";
    
    function typeChar() {
        if (i < text.length) {
            let char = text.charAt(i);
            
            if (char === '<') {
                isTag = true;
            }
            
            tempText += char;
            
            if (char === '>') {
                isTag = false;
            }
            
            bubble.innerHTML = tempText;
            chatMessages.scrollTop = chatMessages.scrollHeight;
            i++;
            
            if (isTag) {
                typeChar(); 
            } else {
                setTimeout(typeChar, 10);
            }
        }
    }
    
    typeChar();
}

// Click chips presets
function askPresetQuestion(type) {
    let questionText = "";
    
    if (type === 'boost') questionText = "How can I avoid 2035 burnout?";
    else if (type === 'transport') questionText = "Can you analyze my digital screen load?";
    else if (type === 'forecast') questionText = "Explain my 2035 future life projection.";
    else if (type === 'water') questionText = "What are your quick dopamine regulation tips?";

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
        if (currentState.screenTime >= 8) {
            recommendation = `Currently, your digital screen time is a heavy <strong>${currentState.screenTime} hours</strong>. Bypassing screen load reduces household power dissipation and restores cognitive clarity, adding <strong>+12 points</strong> to the Human-Earth Sustainability Index!`;
        } else if (currentState.sleepHours < 6) {
            recommendation = `Your biological rest is too low (<strong>${currentState.sleepHours}h</strong>). Elevating sleep above 7.5 hours restores deep biological cellular integrity and balances natural circadian loops, adding <strong>+15 points</strong>!`;
        } else if (currentState.stressLevel >= 50) {
            recommendation = `High stress (<strong>${currentState.stressLevel}%</strong>) releases neuro-toxins and drains planetary carbon focus. Correcting daily stress through meditation boosts the Alignment ratio, adding <strong>+10 points</strong>!`;
        } else if (currentState.savingsRate < 20) {
            recommendation = `Your savings rate is sub-optimal (<strong>${currentState.savingsRate}%</strong>). Bypassing consumer carbon footprints by saving at least 40% will boost environmental wealth, adding <strong>+8 points</strong>!`;
        } else {
            recommendation = `Your Human-Earth Sustainability Index is a superb <strong>${scoreVal}</strong>! To approach 100, try minimizing screen time further and optimizing plant-based clean intake.`;
        }
        
        return `⚡ <strong>Planetary Intelligence AI - Calibration Advice:</strong><br><br>${recommendation}<br><br>Every personal habit optimization directly reduces environmental load and restores natural ecosystems!`;
    }
    
    if (type === 'transport') {
        let analysis = `You spent <strong>${currentState.screenTime} hours</strong> on screens and <strong>${currentState.socialMediaTime} hours</strong> doomscrolling daily.<br><br>`;
        if (currentState.screenTime >= 10) {
            analysis += `⚠️ <strong>Heavy Grid & Neural Load</strong> detected. High screens waste electricity and increase carbon emissions while causing dopamine fatigue. Bypassing screens after 6 hours reduces grid carbon load significantly.`;
        } else {
            analysis += `⭐ Outstanding screen conservation! You are keeping carbon footprints minimal and cognitive pathways sharp.`;
        }
        return analysis;
    }
    
    if (type === 'forecast') {
        let prediction = `🔮 <strong>Future Earth & Self Projection (2025 - 2100):</strong><br><br>`;
        if (scoreVal < 50) {
            prediction += `⚠️ Continuing with your current habits will trigger a <strong>Planetary Collapse outcome by 2100</strong>. Forest canopies decay, atmospheric quality drops to critical levels, and carbon indexes skyrocket. Hectares of polar ice will melt rapidly.`;
        } else {
            prediction += `🟢 By adopting your current disciplined habits, you will secure a <strong>Utopian Co-existence</strong> path by 2100!<br><br>Ecosystem biodiversity peaks, carbon emissions are fully neutralized, and your human biometrics scale to optimal limits. Earth health stabilizes at healthy parameters!`;
        }
        return prediction;
    }
    
    if (type === 'water') {
        let tips = `🧠 <strong>Behavioral Ecology Insight:</strong><br><br>Doomscrolling for <strong>${currentState.socialMediaTime} hours/day</strong> drains both your focus and local water-saving focus. `;
        if (currentState.socialMediaTime >= 4) {
            tips += `Bypassing social media alerts after 8 PM will reduce active screen consumption, saving valuable kilowatt-hours and restoring mental index by 25%. `;
        }
        tips += `Try consuming clean foods, practicing regular exercise, and maintaining high savings to lock ecological synchronicity!`;
        return tips;
    }
}

// Custom prompt parser for typed messages
function getAIResponse(msgText) {
    const text = msgText.toLowerCase();
    const scoreVal = currentState.ecoScore;

    if (text.includes('hello') || text.includes('hi') || text.includes('hey')) {
        return "Greetings Agent! I am the Planetary Intelligence AI coach. Ask me any questions about your biometrics, carbon load, atmospheric levels, or ecosystem synchronicity!";
    }
    if (text.includes('score') || text.includes('vitality') || text.includes('eco') || text.includes('sustainability')) {
        return `Your current Human-Earth Sustainability Index is <strong>${scoreVal}/100</strong>. ${scoreVal >= 75 ? 'An outstanding score! You are locked in for a sustainable future.' : 'This can be easily optimized by improving sleep, eating clean foods, or minimizing screens.'}`;
    }
    if (text.includes('sleep') || text.includes('rest') || text.includes('tired')) {
        return `Your biological sleep is set to <strong>${currentState.sleepHours} hours</strong>. Deep rest below 6 hours decays cellular tissues. Try to aim for 7.5+ hours!`;
    }
    if (text.includes('screen') || text.includes('social') || text.includes('media') || text.includes('doomscroll')) {
        return `You spent <strong>${currentState.screenTime}h</strong> on screens and <strong>${currentState.socialMediaTime}h</strong> doomscrolling daily. High screen usage increases grid electricity consumption and increases planetary carbon load!`;
    }
    if (text.includes('stress') || text.includes('mental') || text.includes('burnout')) {
        return `Your Neurological Stress is <strong>${currentState.stressLevel}%</strong>, and Burnout Risk is projected at <strong>${Math.round(currentState.burnoutRisk)}%</strong>. High stress impacts your focus and decreases human-earth alignment!`;
    }
    if (text.includes('saving') || text.includes('money') || text.includes('wealth')) {
        return `Your savings rate is <strong>${currentState.savingsRate}%</strong>. High savings rates prevent impulse consumer purchases, directly avoiding manufacturing carbon footprints!`;
    }

    return "Fascinating query! My analytical matrices highlight that minor tweaks in daily loops—like sleeping 1 hour more, clean dietary intake, and minimizing screen usage—accumulate massive ecosystem-shifting results by 2100. Try a slider and watch the split-screen Earth visualizer react!";
}

// Particle physics emitter
function spawnCanvasParticles(center, radius, score) {
    const maxParticles = 35;
    if (activeParticles.length >= maxParticles) return;
    
    const now = performance.now();
    if (!spawnCanvasParticles.lastSpawnTime) spawnCanvasParticles.lastSpawnTime = 0;
    if (now - spawnCanvasParticles.lastSpawnTime < 120) return;
    
    if (Math.random() > 0.6) return;
    spawnCanvasParticles.lastSpawnTime = now;
    
    let type = 'sparkle';
    
    let simPollution = currentState.simPollution || 0;
    let simDeforestation = currentState.simDeforestation || 0;
    let simPlastic = currentState.simPlastic || 0;
    let simFossil = currentState.simFossil || 0;
    let maxThreat = Math.max(simPollution, simDeforestation, simPlastic, simFossil) / 100;
    
    const simulatedYear = currentState.simulatedYear || 2025;
    if (simulatedYear > 2025) {
        const yearFactor = (simulatedYear - 2025) / 15;
        maxThreat = Math.min(1.0, maxThreat + yearFactor * (currentState.stressLevel / 100) * 0.5);
    }
    
    if (maxThreat > 0.05) {
        if (Math.random() < maxThreat) {
            type = Math.random() > 0.4 ? 'smoke' : 'ash';
        } else {
            type = 'dust';
        }
    } else {
        if (score >= 80) {
            type = Math.random() > 0.4 ? 'leaf' : 'sparkle';
        } else if (score >= 60) {
            type = 'sparkle';
        } else if (score >= 40) {
            type = 'dust';
        } else {
            type = Math.random() > 0.35 ? 'smoke' : 'ash';
        }
    }
    
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
            ctx.arc(p.x, p.y, p.size * 0.45, 0, Math.PI * 2);
            ctx.fillStyle = '#ef4444';
            ctx.fill();
        }
        
        ctx.restore();
        return true;
    });
}

function initBackgroundAtmosphere() {
    // Dynamic pure CSS space / ambient particles
    console.log("🌌 Chrono atmosphere backgrounds active.");
}

// Setup onboarding submit interceptor
function handleProfileSetupSubmit(event) {
    if (event) event.preventDefault();
    console.log("💾 ECOSPHERE // Intercepting profile linking protocol...");

    const nameEl = document.getElementById('setup-name');
    const ageEl = document.getElementById('setup-age');
    const phoneEl = document.getElementById('setup-phone');
    const deptEl = document.getElementById('setup-dept');
    const cityEl = document.getElementById('setup-city');
    const goalEl = document.getElementById('setup-goal');
    const genderEl = document.getElementById('setup-gender');
    const errorBox = document.getElementById('profile-setup-error-box');

    const name = nameEl ? nameEl.value.trim() : "";
    const age = ageEl ? parseInt(ageEl.value) : NaN;
    const phone = phoneEl ? phoneEl.value.trim() : "";
    const dept = deptEl ? deptEl.value : "";
    const city = cityEl ? cityEl.value.trim() : "";
    const goal = goalEl ? goalEl.value : "";
    const gender = genderEl ? genderEl.value : "astronaut";

    if (!name || isNaN(age) || !phone || !dept || !city || !goal || !gender) {
        if (errorBox) {
            errorBox.classList.remove('hidden');
            const errText = document.getElementById('profile-setup-error-text');
            if (errText) errText.textContent = "ERROR: ALL PROTOCOL FIELDS MANDATORY";
        }
        return;
    }

    if (errorBox) errorBox.classList.add('hidden');

    // Seed state details
    currentState.name = name;
    currentState.age = age;
    currentState.phone = phone;
    currentState.department = dept;
    currentState.city = city;
    currentState.futureGoal = goal;
    currentState.gender = gender;
    currentState.profileComplete = true;

    // Dicebear avatar seeding
    currentState.photoURL = `https://api.dicebear.com/7.x/${gender === 'identicon' ? 'identicon' : 'bottts'}/svg?seed=${encodeURIComponent(name)}`;

    if (typeof currentUserProfile !== 'undefined' && currentUserProfile) {
        currentUserProfile.profileComplete = true;
        currentUserProfile.name = name;
        currentUserProfile.photoURL = currentState.photoURL;
        currentUserProfile.age = age;
        currentUserProfile.phone = phone;
        currentUserProfile.department = dept;
        currentUserProfile.city = city;
        currentUserProfile.futureGoal = goal;
        currentUserProfile.gender = gender;
    }

    if (window.saveUserDataToCloud) {
        window.saveUserDataToCloud(currentState);
    }

    createAchievementParticles();

    const overlay = document.getElementById('profile-setup-overlay');
    if (overlay) {
        overlay.style.transition = 'opacity 0.4s ease-out';
        overlay.style.opacity = '0';
        setTimeout(() => {
            overlay.style.display = 'none';
            const appCont = document.querySelector('.app-container');
            if (appCont) appCont.classList.remove('hidden');
            updateCalculations(true);
        }, 400);
    }
}

// Achievements Check logic
function checkAchievements() {
    let unlocked = currentState.achievements || ["first_uplink"];
    let newlyUnlocked = false;

    if (currentState.profileComplete && !unlocked.includes("first_uplink")) {
        unlocked.push("first_uplink");
        newlyUnlocked = true;
    }

    if (currentState.screenTime <= 4 && !unlocked.includes("digital_zen")) {
        unlocked.push("digital_zen");
        newlyUnlocked = true;
        createAchievementParticles();
    }

    if (currentState.sleepHours >= 7.5 && !unlocked.includes("deep_sleep")) {
        unlocked.push("deep_sleep");
        newlyUnlocked = true;
        createAchievementParticles();
    }

    if (currentState.savingsRate >= 40 && !unlocked.includes("wealth_builder")) {
        unlocked.push("wealth_builder");
        newlyUnlocked = true;
        createAchievementParticles();
    }

    if (newlyUnlocked) {
        currentState.achievements = unlocked;
        if (window.saveUserDataToCloud) {
            window.saveUserDataToCloud(currentState);
        }
    }
}

function createAchievementParticles() {
    console.log("⭐ ACHIEVEMENT UNLOCKED! Particle burst.");
    for (let i = 0; i < 25; i++) {
        activeParticles.push({
            x: 170 + (Math.random() - 0.5) * 120,
            y: 170 + (Math.random() - 0.5) * 120,
            vx: (Math.random() - 0.5) * 5,
            vy: (Math.random() - 0.5) * 5 - 2,
            size: Math.random() * 4 + 3,
            alpha: 1.0,
            life: 1.0,
            decay: 0.015,
            angle: Math.random() * Math.PI * 2,
            spin: 0.05,
            type: Math.random() > 0.4 ? 'sparkle' : 'leaf'
        });
    }
}

// Sync Agent Dashboard UI
function updateProfileDashboardUI() {
    if (!currentState.profileComplete) return;

    const agentNameEl = document.getElementById('dashboard-agent-name');
    if (agentNameEl) agentNameEl.textContent = currentState.name || "AGENT_NAME";

    const dashAvatar = document.getElementById('dashboard-avatar-img');
    if (dashAvatar) {
        dashAvatar.src = currentState.photoURL || `https://api.dicebear.com/7.x/bottts/svg?seed=${encodeURIComponent(currentState.name)}`;
    }

    const rankBadge = document.getElementById('dashboard-agent-rank');
    if (rankBadge) {
        rankBadge.className = 'badge-role font-mono';
        let score = currentState.ecoScore || 72;
        if (score >= 90) {
            rankBadge.textContent = 'CHRONO TRANSCENDENT';
            rankBadge.classList.add('rank-emerald');
        } else if (score >= 80) {
            rankBadge.textContent = 'TEMPORAL PRODIGY';
            rankBadge.classList.add('rank-gold');
        } else if (score >= 60) {
            rankBadge.textContent = 'STEADY SURVIVOR';
            rankBadge.classList.add('rank-silver');
        } else if (score >= 40) {
            rankBadge.textContent = 'SCREEN ADDICT';
            rankBadge.classList.add('rank-bronze');
        } else {
            rankBadge.textContent = 'BURNOUT VICTIM';
            rankBadge.classList.add('rank-carbon');
        }
    }

    const streakEl = document.getElementById('dashboard-streak-count');
    if (streakEl) streakEl.textContent = currentState.streakCount || 1;

    const pctText = document.getElementById('profile-completion-val');
    if (pctText) pctText.textContent = '100%';
    
    const fillCircle = document.getElementById('completion-fill-circle');
    if (fillCircle) {
        fillCircle.style.strokeDashoffset = '0';
    }

    // Sync Details List
    const deptEl = document.getElementById('profile-dept-val');
    if (deptEl) deptEl.textContent = currentState.department || '-';
    
    const cityEl = document.getElementById('profile-city-val');
    if (cityEl) cityEl.textContent = currentState.city || '-';
    
    const goalEl = document.getElementById('profile-goal-val');
    if (goalEl) goalEl.textContent = currentState.futureGoal || '-';
    
    const commuteEl = document.getElementById('profile-commute-val');
    if (commuteEl) {
        const genderLabel = { astronaut: 'Astronaut', male: 'Cyber Male', female: 'Cyber Female', identicon: 'Matrix' }[currentState.gender];
        commuteEl.textContent = genderLabel || '-';
    }

    // Sync Achievements locking grids
    const achs = ["first-uplink", "power-saver", "hydration-guard", "zero-plastic"];
    const achKeys = {
        "first-uplink": "first_uplink",
        "power-saver": "digital_zen",
        "hydration-guard": "deep_sleep",
        "zero-plastic": "wealth_builder"
    };
    
    let unlockedCount = 0;
    achs.forEach(a => {
        const el = document.getElementById(`achievement-${a}`);
        if (el) {
            const isUnlocked = currentState.achievements && currentState.achievements.includes(achKeys[a]);
            if (isUnlocked) {
                el.classList.remove('locked');
                el.classList.add('unlocked');
                unlockedCount++;
            } else {
                el.classList.remove('unlocked');
                el.classList.add('locked');
            }
        }
    });

    const ratioText = document.getElementById('achievements-unlocked-ratio');
    if (ratioText) {
        ratioText.textContent = `${unlockedCount}/4 UNLOCKED`;
    }
}

// Profile edit controls
function toggleProfileEditMode(active) {
    const editContainer = document.getElementById('dashboard-edit-container');
    const toggleBtn = document.getElementById('btn-edit-profile-toggle');
    const staticElements = [
        document.getElementById('dashboard-name-row'),
        document.getElementById('profile-details-grid'),
        document.getElementById('profile-completion-widget')
    ];
    
    if (active) {
        if (editContainer) editContainer.classList.remove('hidden');
        if (toggleBtn) toggleBtn.classList.add('hidden');
        staticElements.forEach(el => {
            if (el && el !== editContainer && el !== toggleBtn) {
                el.style.display = 'none';
            }
        });
        
        const editName = document.getElementById('edit-name');
        if (editName) editName.value = currentState.name || "";
        
        const editAge = document.getElementById('edit-age');
        if (editAge) editAge.value = currentState.age || "";
        
        const editPhone = document.getElementById('edit-phone');
        if (editPhone) editPhone.value = currentState.phone || "";
        
        const editCity = document.getElementById('edit-city');
        if (editCity) editCity.value = currentState.city || "";
        
        const previewImg = document.getElementById('edit-avatar-preview-img');
        if (previewImg) {
            previewImg.src = currentState.photoURL || `https://api.dicebear.com/7.x/bottts/svg?seed=${encodeURIComponent(currentState.name || 'EcoAgent')}`;
        }
    } else {
        if (editContainer) editContainer.classList.add('hidden');
        if (toggleBtn) toggleBtn.classList.remove('hidden');
        staticElements.forEach(el => {
            if (el && el !== editContainer && el !== toggleBtn) {
                el.style.display = '';
            }
        });
    }
}

function previewEditProfilePic(event) {
    const file = event.target.files[0];
    if (!file) return;
    
    if (file.size > 500 * 1024) {
        alert("File size exceeds 500KB. Please choose a smaller image.");
        return;
    }
    
    const reader = new FileReader();
    reader.onload = function(e) {
        const previewImg = document.getElementById('edit-avatar-preview-img');
        if (previewImg) {
            previewImg.src = e.target.result;
        }
    };
    reader.readAsDataURL(file);
}

function handleProfileUpdateSubmit(event) {
    if (event) event.preventDefault();
    console.log("💾 ECOSPHERE // Saving edited user profile metrics...");
    
    const editName = document.getElementById('edit-name');
    const editAge = document.getElementById('edit-age');
    const editPhone = document.getElementById('edit-phone');
    const editCity = document.getElementById('edit-city');

    const name = editName ? editName.value.trim() : "";
    const age = editAge ? parseInt(editAge.value) : NaN;
    const phone = editPhone ? editPhone.value.trim() : "";
    const city = editCity ? editCity.value.trim() : "";
    
    currentState.name = name;
    currentState.age = age;
    currentState.phone = phone;
    currentState.city = city;
    
    const previewImg = document.getElementById('edit-avatar-preview-img');
    if (previewImg) {
        currentState.photoURL = previewImg.src;
    }
    
    if (window.saveUserDataToCloud) {
        window.saveUserDataToCloud(currentState);
    }
    
    createAchievementParticles();
    toggleProfileEditMode(false);
    updateProfileDashboardUI();
    console.log("🔗 ECOSPHERE // Profile successfully saved.");
}

// Voice recogniser SpeechRecognition chatbot
let isListening = false;
let speechRecognizer = null;
function toggleVoiceInput() {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
        alert("Web Speech API Voice input is not supported in this browser.");
        return;
    }

    const voiceBtn = document.getElementById('chat-voice-btn');
    if (!voiceBtn) return;

    if (isListening) {
        if (speechRecognizer) speechRecognizer.stop();
        isListening = false;
        voiceBtn.classList.remove('active-mic');
        return;
    }

    try {
        speechRecognizer = new SpeechRecognition();
        speechRecognizer.continuous = false;
        speechRecognizer.interimResults = false;
        speechRecognizer.lang = 'en-US';

        speechRecognizer.onstart = () => {
            isListening = true;
            voiceBtn.classList.add('active-mic');
            showThinkingIndicator();
        };

        speechRecognizer.onresult = (event) => {
            const transcript = event.results[0][0].transcript;
            const inputEl = document.getElementById('chat-user-input');
            if (inputEl) {
                inputEl.value = transcript;
                sendMessage();
            }
        };

        speechRecognizer.onerror = (e) => {
            console.error("Speech Recognition error:", e);
            isListening = false;
            voiceBtn.classList.remove('active-mic');
            hideThinkingIndicator();
        };

        speechRecognizer.onend = () => {
            isListening = false;
            voiceBtn.classList.remove('active-mic');
            hideThinkingIndicator();
        };

        speechRecognizer.start();
    } catch (err) {
        console.error("Voice input start error:", err);
        isListening = false;
        voiceBtn.classList.remove('active-mic');
    }
}

// Quest Card unlock mechanics
function evaluateQuests() {
    if (!document.getElementById('quest-card-ac')) return;
    
    // Digital Detox: screenTime <= 4
    const acOk = currentState.screenTime <= 4;
    const acCard = document.getElementById('quest-card-ac');
    const acBar = document.getElementById('quest-progress-bar-ac');
    const acStatus = document.getElementById('quest-status-ac');
    const acBtn = document.getElementById('btn-claim-ac');
    
    if (acStatus) acStatus.textContent = currentState.screenTime + '/4 hrs';
    if (acBar) {
        const acPct = currentState.screenTime <= 4 ? 100 : Math.min(100, Math.max(0, (4 / currentState.screenTime) * 100));
        acBar.style.width = acPct + '%';
    }
    updateQuestCardState('ac', acOk, acCard, acBtn, 30);

    // Sleep Recovery: sleepHours >= 7
    const waterOk = currentState.sleepHours >= 7;
    const waterCard = document.getElementById('quest-card-water');
    const waterBar = document.getElementById('quest-progress-bar-water');
    const waterStatus = document.getElementById('quest-status-water');
    const waterBtn = document.getElementById('btn-claim-water');
    
    if (waterStatus) waterStatus.textContent = currentState.sleepHours + '/7 hrs';
    if (waterBar) {
        const waterPct = currentState.sleepHours >= 7 ? 100 : Math.min(100, Math.max(0, (currentState.sleepHours / 7) * 100));
        waterBar.style.width = waterPct + '%';
    }
    updateQuestCardState('water', waterOk, waterCard, waterBtn, 25);

    // Physical Activity: exerciseDays >= 3
    const transitOk = currentState.exerciseDays >= 3;
    const transitCard = document.getElementById('quest-card-transit');
    const transitBar = document.getElementById('quest-progress-bar-transit');
    const transitStatus = document.getElementById('quest-status-transit');
    const transitBtn = document.getElementById('btn-claim-transit');
    
    if (transitStatus) transitStatus.textContent = currentState.exerciseDays + '/3 days';
    if (transitBar) {
        const transitPct = currentState.exerciseDays >= 3 ? 100 : Math.min(100, Math.max(0, (currentState.exerciseDays / 3) * 100));
        transitBar.style.width = transitPct + '%';
    }
    updateQuestCardState('transit', transitOk, transitCard, transitBtn, 40);

    // Savings: savingsRate >= 25
    const plasticOk = currentState.savingsRate >= 25;
    const plasticCard = document.getElementById('quest-card-plastic');
    const plasticBar = document.getElementById('quest-progress-bar-plastic');
    const plasticStatus = document.getElementById('quest-status-plastic');
    const plasticBtn = document.getElementById('btn-claim-plastic');
    
    if (plasticStatus) plasticStatus.textContent = currentState.savingsRate + '% saved';
    if (plasticBar) {
        const plasticPct = currentState.savingsRate >= 25 ? 100 : Math.min(100, Math.max(0, (currentState.savingsRate / 25) * 100));
        plasticBar.style.width = plasticPct + '%';
    }
    updateQuestCardState('plastic', plasticOk, plasticCard, plasticBtn, 35);
    
    const claimedCount = currentState.claimedQuests.length;
    const claimedCounter = document.getElementById('challenges-claimed-count');
    if (claimedCounter) claimedCounter.textContent = claimedCount + '/4 DONE';
}

function updateQuestCardState(id, isMet, card, btn, xpGained) {
    if (!card || !btn) return;
    const isClaimed = currentState.claimedQuests.includes(id);
    
    if (isClaimed) {
        card.className = "quest-card glass-card quest-claimed";
        btn.className = "btn-quest-claim claimed";
        btn.disabled = true;
        btn.innerHTML = `<i class="fa-solid fa-circle-check"></i> QUEST_COMPLETED`;
    } else if (isMet) {
        card.className = "quest-card glass-card quest-unlocked";
        btn.className = "btn-quest-claim active";
        btn.disabled = false;
        btn.innerHTML = `<i class="fa-solid fa-gift font-cyan animate-pulse"></i> CLAIM +${xpGained} XP`;
    } else {
        card.className = "quest-card glass-card";
        btn.className = "btn-quest-claim";
        btn.disabled = true;
        btn.innerHTML = `<i class="fa-solid fa-lock"></i> LOCK_ACTIVE`;
    }
}

function claimQuestXP(id, xpGained) {
    if (currentState.claimedQuests.includes(id)) return;
    
    console.log("🏅 QUEST COMPLETED // Claimed: " + id + " (+" + xpGained + " XP)");
    currentState.claimedQuests.push(id);
    currentState.xp += xpGained;
    
    updateAvatarXPWidget();
    checkAvatarLevelUp();
    evaluateQuests();
    triggerAutoSave();
    
    // quest spark particles
    triggerQuestParticles();
}

function triggerQuestParticles() {
    const center = 170;
    for (let i = 0; i < 15; i++) {
        activeParticles.push({
            x: center + (Math.random() - 0.5) * 80,
            y: 170 + (Math.random() - 0.5) * 80,
            vx: (Math.random() - 0.5) * 4.5,
            vy: (Math.random() - 0.5) * 4.5 - 2, 
            size: Math.random() * 4 + 3,
            alpha: 1.0,
            life: 1.0,
            decay: 0.012 + Math.random() * 0.008,
            angle: Math.random() * Math.PI * 2,
            spin: (Math.random() - 0.5) * 0.05,
            type: Math.random() > 0.4 ? 'sparkle' : 'leaf'
        });
    }
}

// Bio-Avatar Progress
function updateAvatarXPWidget() {
    const xp = currentState.xp;
    if (!document.getElementById('avatar-level-num')) return;

    let level = 1;
    let xpCurrent = xp;
    let xpNeeded = 100;
    let title = "CHRONO SURVIVOR";
    let badgeIcon = '<i class="fa-solid fa-shield-halved badge-level-1 text-shadow-glow"></i>';
    
    if (xp >= 600) {
        level = 4;
        xpCurrent = xp - 600;
        xpNeeded = 10000;
        title = "COGNITIVE TRANSCENDENT";
        badgeIcon = '<i class="fa-solid fa-crown badge-level-4 text-shadow-glow animate-pulse-slow"></i>';
    } else if (xp >= 300) {
        level = 3;
        xpCurrent = xp - 300;
        xpNeeded = 300;
        title = "TEMPORAL LEADER";
        badgeIcon = '<i class="fa-solid fa-leaf badge-level-3 text-shadow-glow"></i>';
    } else if (xp >= 100) {
        level = 2;
        xpCurrent = xp - 100;
        xpNeeded = 200;
        title = "DISCIPLINE PRODIGY";
        badgeIcon = '<i class="fa-solid fa-seedling badge-level-2 text-shadow-glow"></i>';
    }
    
    currentState.avatarLevel = level;
    
    const lvlNum = document.getElementById('avatar-level-num');
    if (lvlNum) lvlNum.textContent = level;
    
    const titleEl = document.getElementById('avatar-title');
    if (titleEl) titleEl.textContent = title;
    
    const badgeIconEl = document.getElementById('avatar-badge-icon');
    if (badgeIconEl) badgeIconEl.innerHTML = badgeIcon;
    
    const xpCurrentEl = document.getElementById('avatar-xp-current');
    if (xpCurrentEl) xpCurrentEl.textContent = xpCurrent;
    
    const xpNextEl = document.getElementById('avatar-xp-next');
    if (xpNextEl) xpNextEl.textContent = xpNeeded === 10000 ? "MAX" : xpNeeded;
    
    const xpBar = document.getElementById('avatar-xp-bar');
    if (xpBar) {
        const xpPct = xpNeeded === 10000 ? 100 : Math.min(100, Math.max(0, (xpCurrent / xpNeeded) * 100));
        xpBar.style.width = xpPct + '%';
    }
    
    const btn10 = document.getElementById('btn-pledge-10');
    const btnAll = document.getElementById('btn-pledge-all');
    if (btn10) btn10.disabled = xp < 10;
    if (btnAll) btnAll.disabled = xp <= 0;
}

function checkAvatarLevelUp() {
    const xp = currentState.xp;
    let targetLevel = 1;
    if (xp >= 600) targetLevel = 4;
    else if (xp >= 300) targetLevel = 3;
    else if (xp >= 100) targetLevel = 2;
    
    if (!checkAvatarLevelUp.lastLevel) checkAvatarLevelUp.lastLevel = 1;
    
    if (targetLevel > checkAvatarLevelUp.lastLevel) {
        console.log("🏆 LEVEL UP! Promoted to Bio-Avatar Level " + targetLevel);
        const flash = document.getElementById('level-up-flash');
        if (flash) {
            flash.classList.remove('hidden');
            setTimeout(() => {
                flash.classList.add('hidden');
            }, 1800);
        }
        createAchievementParticles();
    }
    
    checkAvatarLevelUp.lastLevel = targetLevel;
}

// Standings Pledges
function pledgeXPToDept(amount) {
    let toPledge = 0;
    if (amount === 'all') {
        toPledge = currentState.xp;
    } else {
        toPledge = parseInt(amount);
    }
    
    if (toPledge <= 0 || currentState.xp < toPledge) return;
    
    console.log("⚡ ECE LEDGER UPLINK // Pledged: " + toPledge + " XP to department standings");
    currentState.xp -= toPledge;
    currentState.pledgedPoints += toPledge;
    
    updateAvatarXPWidget();
    
    const userTotalPledge = document.getElementById('pledge-user-total');
    if (userTotalPledge) userTotalPledge.textContent = currentState.pledgedPoints + ' XP';
    
    const eceBonus = document.getElementById('pledge-ece-bonus');
    if (eceBonus) {
        const bonusPts = (currentState.pledgedPoints * 0.1).toFixed(1);
        eceBonus.textContent = '+' + bonusPts + ' pts';
    }
    
    const feedback = document.getElementById('pledge-feedback-text');
    if (feedback) {
        feedback.classList.remove('hidden');
        setTimeout(() => feedback.classList.add('hidden'), 2200);
    }
    
    updateBattleLeaderboard();
    triggerAutoSave();
    
    const eceRow = document.querySelector('.user-dept-row');
    if (eceRow) {
        eceRow.classList.add('glitch-shake');
        setTimeout(() => eceRow.classList.remove('glitch-shake'), 450);
    }
}

// Battle leader standings
function updateBattleLeaderboard() {
    const list = document.getElementById('battle-leaderboard-list');
    if (!list) return;

    const userPledge = currentState.pledgedPoints || 0;
    
    const players = [
        { rank: '🥇 #1', name: 'AGENT_NEO', dept: 'CSE', score: 850, isUser: false },
        { rank: '🥈 #2', name: 'CHRONOS_01', dept: 'ECE', score: 620, isUser: false },
        { rank: '🥉 #3', name: `${currentState.name ? currentState.name.toUpperCase().slice(0,10) : 'YOU'} (You)`, dept: 'ECE', score: 100 + userPledge, isUser: true },
        { rank: '#4', name: 'CYBER_ZEAL', dept: 'MECH', score: 180, isUser: false }
    ];

    players.sort((a, b) => b.score - a.score);

    list.innerHTML = '';
    players.forEach((p, idx) => {
        const row = document.createElement('div');
        row.className = `battle-row font-mono ${p.isUser ? 'user-battle-row' : ''}`;
        
        let rankString = `#${idx + 1}`;
        if (idx === 0) rankString = '🥇 #1';
        else if (idx === 1) rankString = '🥈 #2';
        else if (idx === 2) rankString = '🥉 #3';

        row.innerHTML = `
            <div class="comp-cell">${rankString}</div>
            <div class="comp-cell" style="font-weight:bold;">${p.name}</div>
            <div class="comp-cell" style="color:var(--color-text-sub);">${p.dept}</div>
            <div class="comp-cell font-green" style="font-weight:bold;">${p.score} XP</div>
        `;
        list.appendChild(row);
    });
}

// Mini-graph history
let historyChart = null;
function initHistoryMiniChart() {
    const ctx = document.getElementById('chart-history-mini');
    if (!ctx) return;
    if (typeof Chart === 'undefined') return;
    
    const fillGrad = ctx.getContext('2d').createLinearGradient(0, 0, 0, 80);
    fillGrad.addColorStop(0, 'rgba(6, 182, 212, 0.22)');
    fillGrad.addColorStop(1, 'rgba(6, 182, 212, 0.00)');
    
    historyChart = new Chart(ctx, {
        type: 'line',
        data: {
            labels: ['W1', 'W2', 'W3', 'W4', 'W5', 'W6'],
            datasets: [{
                label: 'Vitality Index Trend',
                data: [35, 42, 55, 68, 72, 85],
                borderColor: '#06b6d4',
                borderWidth: 2,
                backgroundColor: fillGrad,
                fill: true,
                tension: 0.4,
                pointRadius: 2,
                pointBackgroundColor: '#06b6d4'
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: { legend: { display: false } },
            scales: {
                x: { grid: { display: false } },
                y: { min: 0, max: 100, grid: { color: 'rgba(255, 255, 255, 0.02)' } }
            }
        }
    });
}

let autoSaveTimeout = null;
function triggerAutoSave() {
    if (autoSaveTimeout) clearTimeout(autoSaveTimeout);
    autoSaveTimeout = setTimeout(() => {
        if (window.saveUserDataToCloud) {
            window.saveUserDataToCloud(currentState);
        }
    }, 1500); 
}

function restoreUserSettings(data) {
    if (!data) return;
    currentState = { ...currentState, ...data };

    const mappings = [
        { id: 'input-screen-time', bubbleId: 'val-screen-time', val: currentState.screenTime },
        { id: 'input-social-media', bubbleId: 'val-social-media', val: currentState.socialMediaTime },
        { id: 'input-sleep-hours', bubbleId: 'val-sleep-hours', val: currentState.sleepHours },
        { id: 'input-exercise-days', bubbleId: 'val-exercise-days', val: currentState.exerciseDays },
        { id: 'input-study-hours', bubbleId: 'val-study-hours', val: currentState.studyHours },
        { id: 'input-savings-rate', bubbleId: 'val-savings-rate', val: currentState.savingsRate },
        { id: 'input-stress-level', bubbleId: 'val-stress-level', val: currentState.stressLevel }
    ];

    mappings.forEach(m => {
        const el = document.getElementById(m.id);
        const bubble = document.getElementById(m.bubbleId);
        if (el) el.value = m.val;
        if (bubble) bubble.textContent = m.val;
    });

    const eatingSelect = document.getElementById('input-eating-habit');
    if (eatingSelect) {
        eatingSelect.value = currentState.eatingHabit;
        const dietBadge = document.getElementById('val-diet-status');
        if (dietBadge) {
            const dietLabels = ["POOR", "AVERAGE", "GOOD QUALITY", "CLEAN NUTRIENT"];
            dietBadge.textContent = dietLabels[currentState.eatingHabit] || "GOOD";
        }
    }

    const simPollutionEl = document.getElementById('input-sim-pollution');
    if (simPollutionEl) {
        simPollutionEl.value = currentState.simPollution || 0;
        const bubble = document.getElementById('val-sim-pollution');
        if (bubble) bubble.textContent = currentState.simPollution || 0;
    }
    
    const simDeforestEl = document.getElementById('input-sim-deforestation');
    if (simDeforestEl) {
        simDeforestEl.value = currentState.simDeforestation || 0;
        const bubble = document.getElementById('val-sim-deforestation');
        if (bubble) bubble.textContent = currentState.simDeforestation || 0;
    }

    const simPlasticEl = document.getElementById('input-sim-plastic');
    if (simPlasticEl) {
        simPlasticEl.value = currentState.simPlastic || 0;
        const bubble = document.getElementById('val-sim-plastic');
        if (bubble) bubble.textContent = currentState.simPlastic || 0;
    }

    const simFossilEl = document.getElementById('input-sim-fossil');
    if (simFossilEl) {
        simFossilEl.value = currentState.simFossil || 0;
        const bubble = document.getElementById('val-sim-fossil');
        if (bubble) bubble.textContent = currentState.simFossil || 0;
    }

    const simYearEl = document.getElementById('input-sim-year');
    if (simYearEl) {
        simYearEl.value = currentState.simulatedYear || 2025;
        const bubble = document.getElementById('val-sim-year');
        if (bubble) bubble.textContent = currentState.simulatedYear || 2025;
        
        const label = document.getElementById('val-sim-year-label');
        if (label) {
            label.textContent = currentState.simulatedYear === 2025 ? "PRESENT (2025)" : `PROJECTED (${currentState.simulatedYear})`;
        }
    }

    updateCalculations(true);
}

// Dynamic columns tab toggles
function switchColTab(colId, panelId) {
    console.log("🖥️ ECOSPHERE // Tab switch: " + colId + " -> panel-" + panelId);
    
    const tabsContainer = document.getElementById(colId + '-tabs');
    if (tabsContainer) {
        tabsContainer.querySelectorAll('.col-tab').forEach(tab => tab.classList.remove('active'));
    }
    
    const clickedTab = Array.from(tabsContainer?.querySelectorAll('.col-tab') || []).find(tab => 
        tab.getAttribute('onclick').includes(`'${panelId}'`)
    );
    if (clickedTab) clickedTab.classList.add('active');

    const colCol = document.querySelector('.' + (colId === 'col1' ? 'optimizer' : 'analytics') + '-column');
    if (colCol) {
        colCol.querySelectorAll('.col-tab-panel').forEach(panel => panel.classList.add('hidden'));
        const targetPanel = colCol.querySelector('#panel-' + panelId);
        if (targetPanel) targetPanel.classList.remove('hidden');
    }
}

// Weekly goals
function updateWeeklyTargetProgress() {
    if (!currentState.profileComplete) return;
    
    // Target is defined as Vitality Index Gain above baseline
    const gain = Math.max(0, currentState.ecoScore - 35);
    const progressVal = gain * 7; // cumulative weekly recovery index points
    const target = 250;
    const pct = Math.min(100, Math.round((progressVal / target) * 100));

    const pctEl = document.getElementById('weekly-goal-pct');
    if (pctEl) pctEl.textContent = `${pct}%`;
    
    const fillBar = document.getElementById('weekly-bar-fill');
    if (fillBar) fillBar.style.width = `${pct}%`;
    
    const savedEl = document.getElementById('weekly-goal-saved-val');
    if (savedEl) savedEl.textContent = `${progressVal.toFixed(1)} pts`;
    
    const claimBtn = document.getElementById('btn-claim-weekly');
    if (claimBtn) {
        if (pct >= 100 && !currentState.claimedWeeklyReward) {
            claimBtn.disabled = false;
        } else {
            claimBtn.disabled = true;
        }
    }
}

function claimWeeklyTargetReward() {
    if (currentState.claimedWeeklyReward) return;
    
    console.log("🏆 WEEKLY REWARD CLAIMED! Awarded +200 XP!");
    currentState.xp = (currentState.xp || 40) + 200;
    currentState.claimedWeeklyReward = true;
    
    if (window.saveUserDataToCloud) {
        window.saveUserDataToCloud(currentState);
    }
    
    createAchievementParticles();
    updateAvatarXPWidget();
    checkAvatarLevelUp();
    updateWeeklyTargetProgress();
}

function sendFriendChallenge(opponent) {
    console.log("⚔️ ECOSPHERE // Sending challenge duel request to: " + opponent);
    const feedback = document.getElementById('challenge-feedback-text');
    if (feedback) {
        feedback.textContent = `DUEL_ESTABLISHED // Challenge transmitted to ${opponent}. +10 XP awarded!`;
        feedback.classList.remove('hidden');
        setTimeout(() => {
            feedback.classList.add('hidden');
        }, 3000);
    }
    
    currentState.xp = (currentState.xp || 40) + 10;
    if (window.saveUserDataToCloud) {
        window.saveUserDataToCloud(currentState);
    }
    updateAvatarXPWidget();
    checkAvatarLevelUp();
    updateBattleLeaderboard();
}

// Carousel slides
let currentCarouselIndex = 0;
function moveCarousel(dir) {
    const slides = document.querySelectorAll('.awareness-slide');
    if (slides.length === 0) return;
    
    slides[currentCarouselIndex].classList.remove('active');
    
    currentCarouselIndex = (currentCarouselIndex + dir + slides.length) % slides.length;
    slides[currentCarouselIndex].classList.add('active');
}

setInterval(() => {
    moveCarousel(1);
}, 8000);

function updateFutureSimulationYear(year) {
    currentState.simulatedYear = parseInt(year);
    
    const simYearVal = document.getElementById('val-sim-year');
    if (simYearVal) simYearVal.textContent = year;
    
    const simYearLabel = document.getElementById('val-sim-year-label');
    if (simYearLabel) {
        simYearLabel.textContent = year === 2025 ? "PRESENT (2025)" : `PROJECTED (${year})`;
    }
    
    updateCalculations(true);
}

function switchMobilePane(paneId) {
    const panes = ['home', 'projections', 'profile'];
    panes.forEach(p => {
        const tabBtn = document.getElementById(`tab-mob-${p}`);
        if (tabBtn) tabBtn.classList.remove('active');
    });
    
    const activeTab = document.getElementById(`tab-mob-${paneId}`);
    if (activeTab) activeTab.classList.add('active');

    if (paneId === 'home') {
        switchColTab('col3', 'challenges');
    } else if (paneId === 'projections') {
        switchColTab('col3', 'analytics');
    } else if (paneId === 'profile') {
        switchColTab('col3', 'profile');
    }
}

// 8. jsPDF BRANDED REPORT GENERATOR
function generatePdfReport() {
    console.log("📄 ECOSPHERE // Compiling custom branded Human-Earth Future Simulation Report...");
    
    if (!window.jspdf) {
        alert("Report generator initialising. Please try again in a few seconds.");
        return;
    }
    
    try {
        const { jsPDF } = window.jspdf;
        const doc = new jsPDF();
        
        const PRIMARY_COLOR = [6, 182, 212];   // Cyan
        const SECONDARY_COLOR = [16, 185, 129]; // Green
        const TEXT_COLOR = [17, 24, 39];        
        const GRAY_COLOR = [107, 114, 128];     
        
        // Header card background
        doc.setFillColor(9, 13, 22); 
        doc.rect(0, 0, 210, 42, "F");
        
        doc.setFont("Helvetica", "bold");
        doc.setFontSize(18);
        doc.setTextColor(255, 255, 255);
        doc.text("HUMAN-EARTH FUTURE SIMULATION REPORT", 15, 22);
        
        doc.setFont("Courier", "bold");
        doc.setFontSize(9);
        doc.setTextColor(...PRIMARY_COLOR);
        doc.text("PLANETARY_CLIMATE_FEEDBACK_TELEMETRY // PROJECTION_TIMELINE_2100", 15, 32);
        
        doc.setFont("Helvetica", "normal");
        doc.setTextColor(...GRAY_COLOR);
        doc.setFontSize(9);
        const today = new Date().toLocaleDateString();
        doc.text(`REPORT_DATE: ${today}`, 150, 18);
        doc.text(`AGENT_ID: ${currentState.name ? currentState.name.toUpperCase().replace(/\s+/g, '_') : 'CHRONO_AGENT_01'}`, 150, 24);
        doc.text("SYS_STATUS: CRYPTO_VERIFIED", 150, 30);
        
        // 1. Habit telemetry
        doc.setFont("Helvetica", "bold");
        doc.setFontSize(12);
        doc.setTextColor(...TEXT_COLOR);
        doc.text("1. Daily Lifestyle Habits & Telemetry", 15, 52);
        
        doc.setDrawColor(...PRIMARY_COLOR);
        doc.setLineWidth(0.5);
        doc.line(15, 55, 195, 55);
        
        doc.setFont("Helvetica", "normal");
        doc.setFontSize(9);
        
        let y = 62;
        const rowHeight = 6.8;
        const addMetricRow = (label, val, baselineVal, rating) => {
            doc.setTextColor(...TEXT_COLOR);
            doc.setFont("Helvetica", "bold");
            doc.text(label, 15, y);
            doc.setFont("Helvetica", "normal");
            doc.text(val, 70, y);
            doc.setTextColor(...GRAY_COLOR);
            doc.text(`(Baseline: ${baselineVal})`, 112, y);
            
            if (rating.includes("Optimal") || rating.includes("Healthy") || rating.includes("Regulated") || rating.includes("Zen") || rating.includes("Active")) {
                doc.setTextColor(...SECONDARY_COLOR);
            } else {
                doc.setTextColor(239, 68, 68); 
            }
            doc.setFont("Helvetica", "bold");
            doc.text(rating, 160, y);
            y += rowHeight;
        };
        
        addMetricRow("Daily Sleep Recovery", `${currentState.sleepHours} Hours/Day`, "4.5 Hours", currentState.sleepHours >= 7.5 ? "Optimal Rest" : "Deprived");
        addMetricRow("Active Screen load", `${currentState.screenTime} Hours/Day`, "12 Hours", currentState.screenTime <= 4 ? "Regulated" : "Heavy Load");
        addMetricRow("Doomscrolling Media", `${currentState.socialMediaTime} Hours/Day`, "6 Hours", currentState.socialMediaTime <= 2 ? "Healthy" : "Addicted");
        addMetricRow("Productive Focus Hours", `${currentState.studyHours} Hours/Day`, "1.0 Hour", currentState.studyHours >= 6 ? "High Focus" : "Distracted");
        addMetricRow("Physical Activity", `${currentState.exerciseDays} Days/Week`, "0 Days", currentState.exerciseDays >= 3 ? "Optimal Active" : "Stagnant");
        addMetricRow("Financial Savings Ratio", `${currentState.savingsRate}% Savings`, "5%", currentState.savingsRate >= 35 ? "Wealth Builder" : "Unstable");
        addMetricRow("Neurological Stress", `${currentState.stressLevel}% Index`, "80%", currentState.stressLevel <= 30 ? "Optimal Zen" : "High Cortisol");
        
        y += 2;
        
        // Sustainability score box
        doc.setFillColor(243, 244, 246); 
        doc.rect(15, y, 180, 22, "F");
        
        doc.setFont("Helvetica", "bold");
        doc.setFontSize(10);
        doc.setTextColor(...TEXT_COLOR);
        doc.text("HUMAN-EARTH SUSTAINABILITY INDEX (INTEGRATION)", 20, y + 7);
        
        doc.setFontSize(14);
        doc.setTextColor(...PRIMARY_COLOR);
        doc.text(`${currentState.ecoScore} / 100`, 20, y + 16);
        
        const improvement = Math.max(0, currentState.ecoScore - 35);
        doc.setFont("Helvetica", "bold");
        doc.setFontSize(10);
        doc.setTextColor(...SECONDARY_COLOR);
        doc.text(`+${improvement} PTS SYNC GAIN`, 110, y + 7);
        doc.setFont("Helvetica", "normal");
        doc.setFontSize(8);
        doc.setTextColor(...GRAY_COLOR);
        doc.text("Synchronized score compared to poor lifestyle baseline (35 Index)", 110, y + 14);
        
        y += 30;
        
        // 2. Projections
        doc.setFont("Helvetica", "bold");
        doc.setFontSize(12);
        doc.setTextColor(...TEXT_COLOR);
        doc.text("2. 2100 Human-Earth Telemetry & Projections (Planetary Stability)", 15, y);
        
        doc.setDrawColor(...SECONDARY_COLOR);
        doc.line(15, y + 3, 195, y + 3);
        
        y += 10;
        
        doc.setFont("Helvetica", "normal");
        doc.setFontSize(9);
        
        const addForecastRow = (label, val, target) => {
            doc.setTextColor(...TEXT_COLOR);
            doc.setFont("Helvetica", "normal");
            doc.text(label, 15, y);
            doc.setFont("Helvetica", "bold");
            doc.text(val, 115, y);
            doc.setTextColor(...GRAY_COLOR);
            doc.setFont("Helvetica", "normal");
            doc.text(`(Target: ${target})`, 152, y);
            y += 5.2;
        };

        const survivalProb = Math.max(5, Math.min(99, Math.round(currentState.ecoScore)));

        addForecastRow("Projected 2100 Physical Health", `${Math.round(currentState.physicalHealth)}%`, ">=80%");
        addForecastRow("Projected 2100 Mental Wellness", `${Math.round(currentState.mentalWellness)}%`, ">=80%");
        addForecastRow("Simulated 2100 Chronic Burnout", `${Math.round(currentState.burnoutRisk)}%`, "<40%");
        addForecastRow("Atmospheric Quality Index", `${currentState.atmos || 100}%`, ">=85%");
        addForecastRow("Ecosystem Biodiversity Index", `${currentState.biodiv || 100}%`, ">=85%");
        addForecastRow("Oceanic Acidity Level", `${currentState.oceanpH || 8.15} pH`, "8.10-8.20 pH");
        addForecastRow("Polar Ice Stability Index", `${currentState.ice || 100}%`, ">=80%");
        addForecastRow("Human-Earth Alignment Ratio", `${currentState.alignment || 100}%`, ">=85%");
        addForecastRow("Global Temperature Rise", `+${(currentState.globalTempRise || 1.1).toFixed(2)} °C`, "<=+1.5 °C");
        addForecastRow("Sea Level Rise Inundation", `+${(currentState.seaLevelRise || 0.1).toFixed(2)} m`, "<=+0.3 m");
        addForecastRow("Renewable Energy Ratio", `${currentState.renewRatio || 25}%`, ">=80%");
        addForecastRow("Species Extinction Rate", `${currentState.extinctionRate || 15} / day`, "<=25 / day");
        addForecastRow("Future Survival Probability", `${survivalProb}%`, ">=75%");
        
        y += 8;
        
        // 3. AI recommendations
        doc.setFont("Helvetica", "bold");
        doc.setFontSize(12);
        doc.setTextColor(...TEXT_COLOR);
        doc.text("3. Actionable AI Sustainability Adjustments", 15, y);
        
        doc.setDrawColor(...PRIMARY_COLOR);
        doc.line(15, y + 3, 195, y + 3);
        
        y += 10;
        
        doc.setFont("Helvetica", "normal");
        doc.setFontSize(8.5);
        doc.setTextColor(...TEXT_COLOR);
        
        const addAdvicePoint = (title, desc) => {
            doc.setFont("Helvetica", "bold");
            doc.text(`* ${title}:`, 15, y);
            doc.setFont("Helvetica", "normal");
            doc.text(desc, 50, y);
            y += 6.2;
        };
        
        if (currentState.screenTime > 4) {
            addAdvicePoint("Screen Limitation", "Limit screens below 4h to reduce grid energy loads and restore biological stress.");
        } else {
            addAdvicePoint("Screen Limitation", "Excellent digital detox habits maintained! Keeping grid carbon loads minimal.");
        }
        
        if (currentState.sleepHours < 7.5) {
            addAdvicePoint("Sleep Regulation", "Aim for 7.5h sleep to optimize cellular metabolism and increase recovery indices.");
        } else {
            addAdvicePoint("Sleep Regulation", "Exceptional circadian harmony! Biological tissues are regenerating optimally.");
        }
        
        if (currentState.savingsRate < 25) {
            addAdvicePoint("Savings Allocation", "Curb impulsive consumer purchases to save 25%+, preventing manufacturing carbon load.");
        } else {
            addAdvicePoint("Savings Allocation", "Excellent economic wisdom! Directing excess assets toward green wealth growth.");
        }
        
        if (currentState.stressLevel >= 40) {
            addAdvicePoint("Ecosystem Zen", "Commit to early screens-off hours to reduce cortisol levels and maximize planetary focus.");
        } else {
            addAdvicePoint("Ecosystem Zen", "Perfect neurological zen! Your cognitive stability is in perfect ecosystem sync.");
        }
        
        // Footer card
        doc.setFillColor(9, 13, 22); 
        doc.rect(0, 280, 210, 17, "F");
        doc.setFont("Courier", "bold");
        doc.setFontSize(8);
        doc.setTextColor(...GRAY_COLOR);
        doc.text("HUMAN-EARTH COMMAND CLIENT // SECURE PORTAL COMPILER REPORT v2.0", 15, 290);
        
        const filename = `HumanEarth_Report_${currentState.name ? currentState.name.replace(/\s+/g, '_') : 'Agent'}.pdf`;
        doc.save(filename);
        
        console.log("💾 ECOSPHERE // PDF downloaded successfully!");
        createAchievementParticles();
    } catch (e) {
        console.error("PDF generation failure:", e);
        alert("Error exporting PDF report. Please verify connection and try again.");
    }
}

// Expose all callback hooks to index.html and auth.js
window.toggleProfileEditMode = toggleProfileEditMode;
window.previewEditProfilePic = previewEditProfilePic;
window.handleProfileUpdateSubmit = handleProfileUpdateSubmit;
window.toggleVoiceInput = toggleVoiceInput;
window.updateWeeklyTargetProgress = updateWeeklyTargetProgress;
window.claimWeeklyTargetReward = claimWeeklyTargetReward;
window.sendFriendChallenge = sendFriendChallenge;
window.moveCarousel = moveCarousel;
window.updateFutureSimulationYear = updateFutureSimulationYear;
window.switchMobilePane = switchMobilePane;
window.generatePdfReport = generatePdfReport;

// Bind Setup Form globally
window.handleProfileSetupSubmit = handleProfileSetupSubmit;
window.checkAchievements = checkAchievements;
window.updateProfileDashboardUI = updateProfileDashboardUI;
window.updateAvatarXPWidget = updateAvatarXPWidget;
window.checkAvatarLevelUp = checkAvatarLevelUp;
window.evaluateQuests = evaluateQuests;
window.updateBattleLeaderboard = updateBattleLeaderboard;
window.pledgeXPToDept = pledgeXPToDept;
window.askPresetQuestion = askPresetQuestion;
window.initHistoryMiniChart = initHistoryMiniChart;
window.applyPreset = applyPreset;
window.setFormInputs = setFormInputs;
window.updateCalculations = updateCalculations;
window.restoreUserSettings = restoreUserSettings;
window.toggleChat = toggleChat;
window.handleChatKeyPress = handleChatKeyPress;
window.sendMessage = sendMessage;
