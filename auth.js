/* ==========================================================================
   ECOSPHERE AI - FIREBASE CONFIGURATION & SECURITY GATEWAY
   Vanilla Javascript & Firebase v10 Compat SDK Controller
   ========================================================================== */

// 1. FIREBASE CONFIGURATION BLOCK (Public/Client Keys)
// Note: If these keys are uninitialized or Firestore is inaccessible, sandbox local mode automatically engages.
const firebaseConfig = {
  apiKey: "AIzaSyAqlu27471uhYansa5q3sBkK76uBZL_tz0",
  authDomain: "ecosphereai-ba151.firebaseapp.com",
  projectId: "ecosphereai-ba151",
  storageBucket: "ecosphereai-ba151.firebasestorage.app",
  messagingSenderId: "793871345256",
  appId: "1:793871345256:web:7d02c77685fb67a124fddd",
  measurementId: "G-C0485Z966W"
};

let db = null;
let auth = null;
let isSandboxMode = false;
let currentUserProfile = null;

// Initialize Firebase with auto sandbox fail-safe
try {
    firebase.initializeApp(firebaseConfig);
    auth = firebase.auth();
    db = firebase.firestore();
    console.log("🚀 ECOSPHERE // Firebase core initialized successfully.");
} catch (e) {
    console.warn("⚠️ ECOSPHERE // Firebase initialization failed. Entering Sandbox local storage fallback:", e);
    isSandboxMode = true;
}

// Streaks active checker
function checkAndUpdateDailyStreak() {
    if (!currentUserProfile || currentUserProfile.role === 'admin') return;
    
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const day = String(now.getDate()).padStart(2, '0');
    const todayStr = `${year}-${month}-${day}`;
    
    let lastActive = currentUserProfile.lastActiveDate || "";
    let streak = currentUserProfile.sustainabilityStreak || 1;
    
    if (lastActive === todayStr) {
        console.log("🔥 ECOSPHERE // Streak verified for today: " + streak + " days active.");
    } else if (lastActive === "") {
        streak = 1;
        currentUserProfile.lastActiveDate = todayStr;
        currentUserProfile.sustainabilityStreak = streak;
        console.log("🔥 ECOSPHERE // First active day! Streak initiated: 1 day.");
    } else {
        const lastActiveDateObj = new Date(lastActive);
        const todayDateObj = new Date(todayStr);
        const diffTime = Math.abs(todayDateObj - lastActiveDateObj);
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        
        if (diffDays === 1) {
            streak += 1;
            console.log("🔥 ECOSPHERE // Consecutive day detected! Streak incremented to: " + streak);
        } else {
            streak = 1;
            console.log("🔥 ECOSPHERE // Streak broken. Resetting active streak to 1 day.");
        }
        
        currentUserProfile.lastActiveDate = todayStr;
        currentUserProfile.sustainabilityStreak = streak;
    }
    
    if (typeof currentState !== 'undefined') {
        currentState.sustainabilityStreak = streak;
        currentState.lastActiveDate = todayStr;
    }
}

// 2. SESSION & STATE PERSISTENCE LISTENER
window.addEventListener('load', () => {
    if (isSandboxMode) {
        initializeLocalSandboxState();
    } else {
        auth.onAuthStateChanged(async (user) => {
            const authOverlay = document.getElementById('auth-overlay');
            const appContainer = document.querySelector('.app-container');
            const adminContainer = document.getElementById('admin-dashboard-container');
            
            if (user) {
                console.log("🔗 ECOSPHERE // Secure Uplink established for: " + user.email);
                
                // Fetch User Profile Role Check
                try {
                    const userDoc = await db.collection('users').doc(user.uid).get();
                    let profile = null;
                    
                    if (userDoc.exists) {
                        profile = userDoc.data();
                    } else {
                        // Create default settings if new profile
                        profile = {
                            uid: user.uid,
                            name: user.displayName || user.email.split('@')[0],
                            email: user.email,
                            photoURL: user.photoURL || `https://api.dicebear.com/7.x/bottts/svg?seed=${encodeURIComponent(user.email)}`,
                            role: user.email === 'admin@ecosphere.ai' ? 'admin' : 'user',
                            profileComplete: false,
                            age: "",
                            phone: "",
                            department: "ECE",
                            city: "",
                            sustainabilityGoal: "Carbon Neutral",
                            transportPreference: "EV",
                            sustainabilityStreak: 1,
                            lastActiveDate: "",
                            achievements: ["first_uplink"],
                            ecoScore: 72,
                            dailyCo2: 12.2,
                            sliderSettings: {
                                acHours: 8,
                                appliances: 6,
                                travelMode: 'petrol',
                                distance: 30,
                                waterLiters: 200,
                                waterWastage: false,
                                plasticBottles: 12,
                                plasticBags: true,
                                foodWaste: 2
                            },
                            xp: 40,
                            claimedQuests: [],
                            pledgedPoints: 0,
                            lastUpdated: firebase.firestore.FieldValue.serverTimestamp()
                        };
                        await db.collection('users').doc(user.uid).set(profile);
                    }
                    
                    currentUserProfile = profile;
                    
                    // Expose global callback for slider modifications auto-saving
                    window.saveUserDataToCloud = async (state) => {
                        if (currentUserProfile.role === 'admin') return; // Admin preview doesn't save to admin email
                        
                        try {
                            const sliderSettings = {
                                acHours: state.acHours,
                                appliances: state.appliances,
                                travelMode: state.travelMode,
                                distance: state.distance,
                                waterLiters: state.waterLiters,
                                waterWastage: state.waterWastage,
                                plasticBottles: state.plasticBottles,
                                plasticBags: state.plasticBags,
                                foodWaste: state.foodWaste
                            };
                            
                            await db.collection('users').doc(user.uid).update({
                                ecoScore: state.ecoScore,
                                dailyCo2: state.dailyCo2,
                                sliderSettings: sliderSettings,
                                xp: state.xp,
                                claimedQuests: state.claimedQuests,
                                pledgedPoints: state.pledgedPoints,
                                name: state.name || currentUserProfile.name || "",
                                photoURL: state.photoURL || currentUserProfile.photoURL || "",
                                age: state.age || currentUserProfile.age || "",
                                phone: state.phone || currentUserProfile.phone || "",
                                department: state.department || currentUserProfile.department || "ECE",
                                city: state.city || currentUserProfile.city || "",
                                sustainabilityGoal: state.sustainabilityGoal || currentUserProfile.sustainabilityGoal || "Carbon Neutral",
                                transportPreference: state.transportPreference || currentUserProfile.transportPreference || "EV",
                                sustainabilityStreak: state.sustainabilityStreak || currentUserProfile.sustainabilityStreak || 1,
                                lastActiveDate: state.lastActiveDate || currentUserProfile.lastActiveDate || "",
                                achievements: state.achievements || currentUserProfile.achievements || ["first_uplink"],
                                profileComplete: state.profileComplete !== undefined ? state.profileComplete : (currentUserProfile.profileComplete || false),
                                lastUpdated: firebase.firestore.FieldValue.serverTimestamp()
                            });
                            
                            // Log history subcollection entry
                            await db.collection('users').doc(user.uid).collection('history').add({
                                timestamp: firebase.firestore.FieldValue.serverTimestamp(),
                                ecoScore: state.ecoScore,
                                dailyCo2: state.dailyCo2
                            });
                            
                            console.log("💾 ECOSPHERE // Firestore auto-saved user profile settings successfully.");
                            
                            const writesIndicator = document.getElementById('admin-db-writes');
                            if (writesIndicator) {
                                writesIndicator.textContent = "SYNCHRONIZED";
                                writesIndicator.style.color = "var(--color-friendly)";
                            }
                        } catch (err) {
                            console.error("Error auto-saving settings to Firestore:", err);
                        }
                    };

                    // Role-Based Redirection
                    if (profile.role === 'admin') {
                        console.log("👑 ECOSPHERE // Admin authority detected. Redirecting to Command Console...");
                        authOverlay.classList.add('hidden');
                        appContainer.classList.add('hidden');
                        adminContainer.classList.remove('hidden');
                        
                        // Load Administrator Dashboard Data
                        loadAdminDashboardTelemetry();
                    } else {
                        console.log("👤 ECOSPHERE // Standard Agent uplink complete.");
                        
                        // Seed properties to currentState
                        if (typeof currentState !== 'undefined') {
                            currentState.name = profile.name || "";
                            currentState.photoURL = profile.photoURL || "";
                            currentState.age = profile.age || "";
                            currentState.phone = profile.phone || "";
                            currentState.department = profile.department || "ECE";
                            currentState.city = profile.city || "";
                            currentState.sustainabilityGoal = profile.sustainabilityGoal || "Carbon Neutral";
                            currentState.transportPreference = profile.transportPreference || "EV";
                            currentState.sustainabilityStreak = profile.sustainabilityStreak || 1;
                            currentState.lastActiveDate = profile.lastActiveDate || "";
                            currentState.achievements = profile.achievements || ["first_uplink"];
                            currentState.profileComplete = profile.profileComplete || false;
                            
                            currentState.xp = profile.xp !== undefined ? profile.xp : 40;
                            currentState.claimedQuests = profile.claimedQuests || [];
                            currentState.pledgedPoints = profile.pledgedPoints || 0;
                        }

                        // Calculate and update daily streak
                        checkAndUpdateDailyStreak();

                        if (profile.profileComplete) {
                            authOverlay.classList.add('hidden');
                            document.getElementById('profile-setup-overlay').style.display = 'none';
                            adminContainer.classList.add('hidden');
                            appContainer.classList.remove('hidden');
                            
                            // Restore Loaded slider values to DOM using the hook inside app.js
                            if (window.restoreUserSettings) {
                                window.restoreUserSettings(profile.sliderSettings);
                                
                                // Re-evaluate bio-avatar and standings widgets
                                if (window.updateAvatarXPWidget) window.updateAvatarXPWidget();
                                if (window.evaluateQuests) window.evaluateQuests();
                                if (window.updateBattleLeaderboard) window.updateBattleLeaderboard();
                                if (window.updateProfileDashboardUI) window.updateProfileDashboardUI();
                            }
                        } else {
                            // Block dashboard & show onboarding setup!
                            authOverlay.classList.add('hidden');
                            adminContainer.classList.add('hidden');
                            appContainer.classList.add('hidden'); // Keep main app locked
                            
                            const setupOverlay = document.getElementById('profile-setup-overlay');
                            setupOverlay.style.display = 'flex';
                            
                            // Pre-fill setup form fields
                            document.getElementById('setup-name').value = profile.name || user.displayName || "";
                            
                            const avatarImg = document.getElementById('setup-avatar-img');
                            if (avatarImg) {
                                avatarImg.src = profile.photoURL || user.photoURL || `https://api.dicebear.com/7.x/bottts/svg?seed=${encodeURIComponent(user.email)}`;
                            }
                        }
                    }
                } catch (err) {
                    console.error("Error loading user profile from Firestore:", err);
                    enterLocalSandboxFallback("Firestore Access Error. Falling back to Sandbox Mode.");
                }
            } else {
                console.log("🔒 ECOSPHERE // Access denied. Uplink offline.");
                authOverlay.classList.remove('hidden');
                appContainer.classList.add('hidden');
                adminContainer.classList.add('hidden');
            }
        });
    }
});

// 3. SECURE AUTHENTICATION TRIGGERS

// Switch Tab UI (Login vs Signup)
function switchAuthTab(tab) {
    const tabLogin = document.getElementById('tab-login');
    const tabSignup = document.getElementById('tab-signup');
    const groupName = document.getElementById('group-name');
    const btnSubmitText = document.getElementById('submit-btn-text');
    
    // Reset inputs & error alert
    document.getElementById('auth-error-box').classList.add('hidden');
    
    if (tab === 'login') {
        tabLogin.classList.add('active');
        tabSignup.classList.remove('active');
        groupName.style.display = 'none';
        document.getElementById('auth-name').required = false;
        btnSubmitText.textContent = "ESTABLISH SECURE LINK";
    } else {
        tabSignup.classList.add('active');
        tabLogin.classList.remove('active');
        groupName.style.display = 'flex';
        document.getElementById('auth-name').required = true;
        btnSubmitText.textContent = "INITIALIZE AGENT PORTAL";
    }
}

// Handle Form Submit (Email/Password Uplink or Registration)
async function handleAuthSubmit(event) {
    event.preventDefault();
    
    const email = document.getElementById('auth-email').value.trim();
    const password = document.getElementById('auth-password').value;
    const name = document.getElementById('auth-name').value.trim();
    const isSignup = document.getElementById('tab-signup').classList.contains('active');
    const errorBox = document.getElementById('auth-error-box');
    const errorText = document.getElementById('auth-error-text');
    const submitBtn = document.getElementById('btn-auth-submit');
    
    errorBox.classList.add('hidden');
    submitBtn.disabled = true;
    submitBtn.style.opacity = '0.7';
    
    if (isSandboxMode) {
        // Handle local sandbox login mockup
        handleLocalSandboxAuth(email, password, name, isSignup);
        submitBtn.disabled = false;
        submitBtn.style.opacity = '1';
        return;
    }
    
    try {
        if (isSignup) {
            // Standard user registration
            const cred = await auth.createUserWithEmailAndPassword(email, password);
            await cred.user.updateProfile({ displayName: name });
            
            // Create Firestore user record
            const profile = {
                uid: cred.user.uid,
                name: name,
                email: email,
                photoURL: `https://api.dicebear.com/7.x/bottts/svg?seed=${encodeURIComponent(email)}`,
                role: 'user',
                profileComplete: false,
                age: "",
                phone: "",
                department: "ECE",
                city: "",
                sustainabilityGoal: "Carbon Neutral",
                transportPreference: "EV",
                sustainabilityStreak: 1,
                lastActiveDate: "",
                achievements: ["first_uplink"],
                ecoScore: 72,
                dailyCo2: 12.2,
                sliderSettings: {
                    acHours: 8,
                    appliances: 6,
                    travelMode: 'petrol',
                    distance: 30,
                    waterLiters: 200,
                    waterWastage: false,
                    plasticBottles: 12,
                    plasticBags: true,
                    foodWaste: 2
                },
                xp: 40,
                claimedQuests: [],
                pledgedPoints: 0,
                lastUpdated: firebase.firestore.FieldValue.serverTimestamp()
            };
            await db.collection('users').doc(cred.user.uid).set(profile);
            console.log("🌱 ECOSPHERE // Registered new Agent profile database: " + email);
        } else {
            // ADMIN AUTO-SEED FAIL-SAFE
            // If logging in as admin but credentials don't exist yet, register in background!
            if (email === 'admin@ecosphere.ai' && password === 'EcoSphereAdmin123') {
                try {
                    await auth.signInWithEmailAndPassword(email, password);
                } catch (err) {
                    if (err.code === 'auth/user-not-found' || err.code === 'auth/invalid-credential') {
                        console.log("⚙️ ECOSPHERE // Seeding Admin root account dynamically...");
                        const adminCred = await auth.createUserWithEmailAndPassword(email, password);
                        const adminProfile = {
                            uid: adminCred.user.uid,
                            name: "Root Admin",
                            email: email,
                            role: 'admin',
                            ecoScore: 100,
                            dailyCo2: 0,
                            sliderSettings: {},
                            lastUpdated: firebase.firestore.FieldValue.serverTimestamp()
                        };
                        await db.collection('users').doc(adminCred.user.uid).set(adminProfile);
                        console.log("👑 ECOSPHERE // Admin root account successfully seeded.");
                    } else {
                        throw err;
                    }
                }
            } else {
                // Standard User sign in
                await auth.signInWithEmailAndPassword(email, password);
            }
        }
    } catch (err) {
        console.error("Auth submit error:", err);
        errorBox.classList.remove('hidden');
        
        let msg = "UPLINK ERROR: " + err.message;
        if (err.code === 'auth/wrong-password' || err.code === 'auth/invalid-credential') {
            msg = "SECURITY_ALERT // ACCESS DENIED: Password Key Rejected.";
        } else if (err.code === 'auth/user-not-found') {
            msg = "SECURITY_ALERT // UPLINK FAILED: Email Link not established.";
        } else if (err.code === 'auth/email-already-in-use') {
            msg = "ERROR // PROTOCOL IN USE: Email already initialized.";
        }
        errorText.textContent = msg;
    } finally {
        submitBtn.disabled = false;
        submitBtn.style.opacity = '1';
    }
}

// Google Authentication Uplink
async function handleGoogleAuth() {
    if (isSandboxMode) {
        // Sandbox mock Google login
        handleLocalSandboxAuth("google.agent@ecosphere.ai", "google_fake_pass", "Google Agent", false);
        return;
    }
    
    const provider = new firebase.auth.GoogleAuthProvider();
    try {
        await auth.signInWithPopup(provider);
    } catch (err) {
        console.error("Google Auth error:", err);
        const errorBox = document.getElementById('auth-error-box');
        const errorText = document.getElementById('auth-error-text');
        errorBox.classList.remove('hidden');
        errorText.textContent = "QUANTUM LINK FAILED: " + err.message;
    }
}

// Exit secure console (Logout)
async function handleLogout() {
    if (isSandboxMode) {
        // Sandbox logout
        currentUserProfile = null;
        localStorage.removeItem('ecosphere_sandbox_user');
        console.log("🔒 ECOSPHERE // Sandbox offline.");
        document.getElementById('auth-overlay').classList.remove('hidden');
        document.querySelector('.app-container').classList.add('hidden');
        document.getElementById('admin-dashboard-container').classList.add('hidden');
        return;
    }
    
    try {
        await auth.signOut();
        currentUserProfile = null;
        console.log("🔒 ECOSPHERE // Portal uplink severed. Safely logged out.");
    } catch (err) {
        console.error("Logout error:", err);
    }
}


// 4. SECURE ADMIN COMMAND DASHBOARD CONTROLLER

// Fetch User profiles & calculate global statistics in real-time!
async function loadAdminDashboardTelemetry() {
    if (isSandboxMode) {
        loadLocalSandboxAdminTelemetry();
        return;
    }
    
    try {
        const usersSnapshot = await db.collection('users').get();
        const usersList = [];
        
        let sumScore = 0;
        let sumCo2 = 0;
        let activeLinksCount = Math.floor(Math.random() * 4) + 4; // Simulated live links for cyber presentation
        
        usersSnapshot.forEach(doc => {
            const u = doc.data();
            if (u.role !== 'admin') {
                usersList.push(u);
                sumScore += u.ecoScore || 0;
                sumCo2 += u.dailyCo2 || 0;
            }
        });
        
        const totalAgents = usersList.length;
        const avgScore = totalAgents > 0 ? Math.round(sumScore / totalAgents) : 72;
        
        // Cumulative annual co2 savings (Baseline CO2 is 21.82 per user, total users saved relative)
        const baselineTotalAnnual = totalAgents * 21.82 * 365;
        const currentTotalAnnual = sumCo2 * 365;
        const totalCo2Prevented = Math.max(0, Math.round(baselineTotalAnnual - currentTotalAnnual));

        // Update Admin DOM Telemetry Tickers
        document.getElementById('admin-total-users').textContent = totalAgents.toLocaleString();
        document.getElementById('admin-avg-score').textContent = avgScore.toLocaleString();
        document.getElementById('admin-total-co2').textContent = totalCo2Prevented.toLocaleString();
        document.getElementById('admin-active-links').textContent = activeLinksCount.toLocaleString();

        // 4.1 Render secure User Directory table rows
        const listContainer = document.getElementById('admin-user-list');
        listContainer.innerHTML = '';
        
        if (totalAgents === 0) {
            listContainer.innerHTML = `
                <div class="admin-user-row font-mono" style="grid-template-columns: 1fr; text-align: center; color: var(--color-text-sub);">
                    NO_ACTIVE_AGENTS_UPLINKED_IN_DATABASE
                </div>
            `;
        } else {
            usersList.forEach(u => {
                const row = document.createElement('div');
                row.className = 'admin-user-row font-mono';
                
                let scoreColor = 'var(--color-moderate)';
                if (u.ecoScore >= 80) scoreColor = 'var(--color-friendly)';
                else if (u.ecoScore < 40) scoreColor = 'var(--color-danger)';
                
                row.innerHTML = `
                    <div class="comp-cell" style="color: #fff; font-weight: bold;"><i class="fa-solid fa-user-tag font-cyan" style="margin-right: 5px;"></i> ${u.name.toUpperCase()}</div>
                    <div class="comp-cell" style="color: var(--color-text-sub);">${u.email}</div>
                    <div class="comp-cell" style="color: ${scoreColor}; font-weight: bold;">${u.ecoScore} pts</div>
                    <div class="comp-cell" style="color: var(--color-transit);">${Math.round(u.dailyCo2 * 30)} kg</div>
                `;
                listContainer.appendChild(row);
            });
        }

        // 4.2 Render secure Admin Leaderboard standings
        const leaderboardContainer = document.getElementById('admin-leaderboard');
        leaderboardContainer.innerHTML = '';
        
        const departments = [
            { name: "Computer Science Dept", score: 81, isUser: false },
            { name: "ECE Department (You)", score: avgScore, isUser: true },
            { name: "Mechanical Dept", score: 61, isUser: false }
        ];

        departments.sort((a, b) => b.score - a.score);
        
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
            leaderboardContainer.appendChild(item);
        });

    } catch (err) {
        console.error("Error loading Admin Dashboard Telemetry:", err);
    }
}

// Exit Admin View back to main user console for preview testing!
function switchToUserView() {
    console.log("🖥️ ECOSPHERE // Activating Admin-User Preview Simulation mode...");
    const appContainer = document.querySelector('.app-container');
    const adminContainer = document.getElementById('admin-dashboard-container');
    
    adminContainer.classList.add('hidden');
    appContainer.classList.remove('hidden');
    
    // Inject mock user details or typical student presets
    if (window.restoreUserSettings) {
        window.restoreUserSettings({
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
    }
}


// ==========================================================================
// 5. SECURE LOCAL STORAGE SANDBOX FAIL-SAFE
// ==========================================================================

function enterLocalSandboxFallback(reason) {
    console.warn("🔐 ECOSPHERE // Entering Offline Sandbox Mode due to: " + reason);
    isSandboxMode = true;
    initializeLocalSandboxState();
}

function activateLocalSandbox(event) {
    if (event) event.preventDefault();
    enterLocalSandboxFallback("Bypass link requested by user agent.");
}

function initializeLocalSandboxState() {
    const authOverlay = document.getElementById('auth-overlay');
    const appContainer = document.querySelector('.app-container');
    const adminContainer = document.getElementById('admin-dashboard-container');
    
    // Check if sandbox session active
    const savedUser = localStorage.getItem('ecosphere_sandbox_user');
    if (savedUser) {
        const u = JSON.parse(savedUser);
        currentUserProfile = u;
        console.log("🔗 ECOSPHERE // Local Sandbox Session restored for: " + u.email);
        
        // Expose sandbox local storage auto-save window callback
        window.saveUserDataToCloud = (state) => {
            if (currentUserProfile.role === 'admin') return;
            
            currentUserProfile.ecoScore = state.ecoScore;
            currentUserProfile.dailyCo2 = state.dailyCo2;
            currentUserProfile.xp = state.xp;
            currentUserProfile.claimedQuests = state.claimedQuests;
            currentUserProfile.pledgedPoints = state.pledgedPoints;
            
            currentUserProfile.name = state.name || currentUserProfile.name || "";
            currentUserProfile.photoURL = state.photoURL || currentUserProfile.photoURL || "";
            currentUserProfile.age = state.age || currentUserProfile.age || "";
            currentUserProfile.phone = state.phone || currentUserProfile.phone || "";
            currentUserProfile.department = state.department || currentUserProfile.department || "ECE";
            currentUserProfile.city = state.city || currentUserProfile.city || "";
            currentUserProfile.sustainabilityGoal = state.sustainabilityGoal || currentUserProfile.sustainabilityGoal || "Carbon Neutral";
            currentUserProfile.transportPreference = state.transportPreference || currentUserProfile.transportPreference || "EV";
            currentUserProfile.sustainabilityStreak = state.sustainabilityStreak || currentUserProfile.sustainabilityStreak || 1;
            currentUserProfile.lastActiveDate = state.lastActiveDate || currentUserProfile.lastActiveDate || "";
            currentUserProfile.achievements = state.achievements || currentUserProfile.achievements || ["first_uplink"];
            currentUserProfile.profileComplete = state.profileComplete !== undefined ? state.profileComplete : (currentUserProfile.profileComplete || false);

            currentUserProfile.sliderSettings = {
                acHours: state.acHours,
                appliances: state.appliances,
                travelMode: state.travelMode,
                distance: state.distance,
                waterLiters: state.waterLiters,
                waterWastage: state.waterWastage,
                plasticBottles: state.plasticBottles,
                plasticBags: state.plasticBags,
                foodWaste: state.foodWaste
            };
            localStorage.setItem('ecosphere_sandbox_user', JSON.stringify(currentUserProfile));
            console.log("💾 ECOSPHERE // Sandbox Auto-Saved to Local Storage successfully.");
            
            // Add custom local mock directories updates
            let sandboxDb = JSON.parse(localStorage.getItem('ecosphere_sandbox_db') || "[]");
            sandboxDb = sandboxDb.filter(x => x.email !== currentUserProfile.email);
            sandboxDb.push(currentUserProfile);
            localStorage.setItem('ecosphere_sandbox_db', JSON.stringify(sandboxDb));
        };
        
        // Seed properties to currentState
        if (typeof currentState !== 'undefined') {
            currentState.name = u.name || "";
            currentState.photoURL = u.photoURL || "";
            currentState.age = u.age || "";
            currentState.phone = u.phone || "";
            currentState.department = u.department || "ECE";
            currentState.city = u.city || "";
            currentState.sustainabilityGoal = u.sustainabilityGoal || "Carbon Neutral";
            currentState.transportPreference = u.transportPreference || "EV";
            currentState.sustainabilityStreak = u.sustainabilityStreak || 1;
            currentState.lastActiveDate = u.lastActiveDate || "";
            currentState.achievements = u.achievements || ["first_uplink"];
            currentState.profileComplete = u.profileComplete || false;
            
            currentState.xp = u.xp !== undefined ? u.xp : 40;
            currentState.claimedQuests = u.claimedQuests || [];
            currentState.pledgedPoints = u.pledgedPoints || 0;
        }

        // Calculate and update daily streak
        checkAndUpdateDailyStreak();

        if (u.role === 'admin') {
            authOverlay.classList.add('hidden');
            appContainer.classList.add('hidden');
            adminContainer.classList.remove('hidden');
            loadLocalSandboxAdminTelemetry();
        } else {
            if (u.profileComplete) {
                authOverlay.classList.add('hidden');
                document.getElementById('profile-setup-overlay').style.display = 'none';
                adminContainer.classList.add('hidden');
                appContainer.classList.remove('hidden');
                
                if (window.restoreUserSettings) {
                    window.restoreUserSettings(u.sliderSettings);
                    
                    if (window.updateAvatarXPWidget) window.updateAvatarXPWidget();
                    if (window.evaluateQuests) window.evaluateQuests();
                    if (window.updateBattleLeaderboard) window.updateBattleLeaderboard();
                    if (window.updateProfileDashboardUI) window.updateProfileDashboardUI();
                }
            } else {
                // Block dashboard & show onboarding setup!
                authOverlay.classList.add('hidden');
                adminContainer.classList.add('hidden');
                appContainer.classList.add('hidden'); // Keep main app locked
                
                const setupOverlay = document.getElementById('profile-setup-overlay');
                setupOverlay.style.display = 'flex';
                
                document.getElementById('setup-name').value = u.name || "";
                const avatarImg = document.getElementById('setup-avatar-img');
                if (avatarImg) {
                    avatarImg.src = u.photoURL || `https://api.dicebear.com/7.x/bottts/svg?seed=${encodeURIComponent(u.email)}`;
                }
            }
        }
    } else {
        authOverlay.classList.remove('hidden');
        appContainer.classList.add('hidden');
        adminContainer.classList.add('hidden');
    }
}

// Local sandbox authentication mockup
function handleLocalSandboxAuth(email, password, name, isSignup) {
    const errorBox = document.getElementById('auth-error-box');
    const errorText = document.getElementById('auth-error-text');
    
    // Define special credentials check
    if (!isSignup && email === 'admin@ecosphere.ai') {
        if (password !== 'EcoSphereAdmin123') {
            errorBox.classList.remove('hidden');
            errorText.textContent = "SECURITY_ALERT // ACCESS DENIED: Password Key Rejected.";
            return;
        }
        
        currentUserProfile = {
            uid: "sandbox_admin_id_999",
            name: "Root Admin",
            email: email,
            role: "admin",
            ecoScore: 100,
            dailyCo2: 0,
            sliderSettings: {}
        };
    } else {
        if (isSignup && name === "") {
            errorBox.classList.remove('hidden');
            errorText.textContent = "ERROR: USERNAME cannot be blank.";
            return;
        }
        
        currentUserProfile = {
            uid: "sandbox_user_id_" + Math.floor(Math.random() * 10000),
            name: isSignup ? name : email.split('@')[0],
            email: email,
            photoURL: email.includes("google") ? "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=150&q=80" : `https://api.dicebear.com/7.x/bottts/svg?seed=${encodeURIComponent(email)}`,
            role: "user",
            profileComplete: false,
            age: "",
            phone: "",
            department: "ECE",
            city: "",
            sustainabilityGoal: "Carbon Neutral",
            transportPreference: "EV",
            sustainabilityStreak: 1,
            lastActiveDate: "",
            achievements: ["first_uplink"],
            ecoScore: 72,
            dailyCo2: 12.2,
            sliderSettings: {
                acHours: 8,
                appliances: 6,
                travelMode: 'petrol',
                distance: 30,
                waterLiters: 200,
                waterWastage: false,
                plasticBottles: 12,
                plasticBags: true,
                foodWaste: 2
            },
            xp: 40,
            claimedQuests: [],
            pledgedPoints: 0
        };
        
        // Seeding database mockup
        let sandboxDb = JSON.parse(localStorage.getItem('ecosphere_sandbox_db') || "[]");
        if (isSignup && sandboxDb.some(x => x.email === email)) {
            errorBox.classList.remove('hidden');
            errorText.textContent = "ERROR // PROTOCOL IN USE: Email already initialized.";
            return;
        }
        
        if (!isSignup) {
            const match = sandboxDb.find(x => x.email === email);
            if (match) {
                currentUserProfile = match;
            }
        } else {
            sandboxDb.push(currentUserProfile);
            localStorage.setItem('ecosphere_sandbox_db', JSON.stringify(sandboxDb));
        }
    }
    
    localStorage.setItem('ecosphere_sandbox_user', JSON.stringify(currentUserProfile));
    console.log("🔗 ECOSPHERE // Sandbox Uplink secure active: " + currentUserProfile.email);
    initializeLocalSandboxState();
}

function loadLocalSandboxAdminTelemetry() {
    console.log("⚙️ ECOSPHERE // Compiling Sandbox Administrator Telemetry database...");
    
    // Seed default Mock users inside local db if empty
    let sandboxDb = JSON.parse(localStorage.getItem('ecosphere_sandbox_db') || "[]");
    if (sandboxDb.length === 0) {
        sandboxDb = [
            {
                uid: "mock_jane_doe",
                name: "JANE_DOE",
                email: "jane.doe@ecosphere.net",
                role: "user",
                ecoScore: 84,
                dailyCo2: 8.2,
                sliderSettings: {
                    acHours: 2, appliances: 3, travelMode: 'transit', distance: 15,
                    waterLiters: 110, waterWastage: false, plasticBottles: 2,
                    plasticBags: false, foodWaste: 1
                }
            },
            {
                uid: "mock_john_smith",
                name: "JOHN_SMITH",
                email: "smith.j@ecosphere.net",
                role: "user",
                ecoScore: 24,
                dailyCo2: 21.8,
                sliderSettings: {
                    acHours: 18, appliances: 12, travelMode: 'petrol', distance: 65,
                    waterLiters: 360, waterWastage: true, plasticBottles: 25,
                    plasticBags: true, foodWaste: 3
                }
            }
        ];
        localStorage.setItem('ecosphere_sandbox_db', JSON.stringify(sandboxDb));
    }
    
    let sumScore = 0;
    let sumCo2 = 0;
    sandboxDb.forEach(u => {
        sumScore += u.ecoScore || 0;
        sumCo2 += u.dailyCo2 || 0;
    });
    
    const totalAgents = sandboxDb.length;
    const avgScore = totalAgents > 0 ? Math.round(sumScore / totalAgents) : 54;
    const baselineTotalAnnual = totalAgents * 21.82 * 365;
    const currentTotalAnnual = sumCo2 * 365;
    const totalCo2Prevented = Math.max(0, Math.round(baselineTotalAnnual - currentTotalAnnual));
    
    document.getElementById('admin-total-users').textContent = totalAgents.toString();
    document.getElementById('admin-avg-score').textContent = avgScore.toString();
    document.getElementById('admin-total-co2').textContent = totalCo2Prevented.toLocaleString();
    document.getElementById('admin-active-links').textContent = "1 (Local)";
    
    const listContainer = document.getElementById('admin-user-list');
    listContainer.innerHTML = '';
    
    sandboxDb.forEach(u => {
        const row = document.createElement('div');
        row.className = 'admin-user-row font-mono';
        
        let scoreColor = 'var(--color-moderate)';
        if (u.ecoScore >= 80) scoreColor = 'var(--color-friendly)';
        else if (u.ecoScore < 40) scoreColor = 'var(--color-danger)';
        
        row.innerHTML = `
            <div class="comp-cell" style="color: #fff; font-weight: bold;"><i class="fa-solid fa-user-tag font-cyan" style="margin-right: 5px;"></i> ${u.name.toUpperCase()}</div>
            <div class="comp-cell" style="color: var(--color-text-sub);">${u.email}</div>
            <div class="comp-cell" style="color: ${scoreColor}; font-weight: bold;">${u.ecoScore} pts</div>
            <div class="comp-cell" style="color: var(--color-transit);">${Math.round(u.dailyCo2 * 30)} kg</div>
        `;
        listContainer.appendChild(row);
    });
    
    // Render Admin standings
    const leaderboardContainer = document.getElementById('admin-leaderboard');
    leaderboardContainer.innerHTML = '';
    
    const departments = [
        { name: "Computer Science Dept", score: 81, isUser: false },
        { name: "ECE Department (You)", score: avgScore, isUser: true },
        { name: "Mechanical Dept", score: 61, isUser: false }
    ];

    departments.sort((a, b) => b.score - a.score);
    
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
        leaderboardContainer.appendChild(item);
    });
    
    const writesIndicator = document.getElementById('admin-db-writes');
    if (writesIndicator) {
        writesIndicator.textContent = "LOCAL_SANDBOX";
        writesIndicator.style.color = "var(--color-moderate)";
    }
}
