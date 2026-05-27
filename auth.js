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
    let streak = currentUserProfile.streakCount || 1;
    
    if (lastActive === todayStr) {
        console.log("🔥 SIMULATOR // Streak verified for today: " + streak + " days active.");
    } else if (lastActive === "") {
        streak = 1;
        currentUserProfile.lastActiveDate = todayStr;
        currentUserProfile.streakCount = streak;
        console.log("🔥 SIMULATOR // First active day! Streak initiated: 1 day.");
    } else {
        const lastActiveDateObj = new Date(lastActive);
        const todayDateObj = new Date(todayStr);
        const diffTime = Math.abs(todayDateObj - lastActiveDateObj);
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        
        if (diffDays === 1) {
            streak += 1;
            console.log("🔥 SIMULATOR // Consecutive day detected! Streak incremented to: " + streak);
        } else {
            streak = 1;
            console.log("🔥 SIMULATOR // Streak broken. Resetting active streak to 1 day.");
        }
        
        currentUserProfile.lastActiveDate = todayStr;
        currentUserProfile.streakCount = streak;
    }
    
    if (typeof currentState !== 'undefined') {
        currentState.streakCount = streak;
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
                            photoURL: user.photoURL || `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(user.email)}`,
                            role: user.email === 'admin@ecosphere.ai' ? 'admin' : 'user',
                            profileComplete: false,
                            age: "",
                            gender: "astronaut",
                            unlockedMissions: ["first_uplink"],
                            sliderSettings: {
                                sleepHours: 7,
                                screenTime: 5,
                                studyHours: 4,
                                exerciseDays: 3,
                                eatingHabit: 2,
                                stressLevel: 30,
                                socialMediaTime: 2,
                                savingsRate: 20
                            },
                            xp: 40,
                            level: 1,
                            streakCount: 1,
                            simulatedYear: 2025,
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
                                sleepHours: state.sleepHours,
                                screenTime: state.screenTime,
                                studyHours: state.studyHours,
                                exerciseDays: state.exerciseDays,
                                eatingHabit: state.eatingHabit,
                                stressLevel: state.stressLevel,
                                socialMediaTime: state.socialMediaTime,
                                savingsRate: state.savingsRate
                            };
                            
                            await db.collection('users').doc(user.uid).update({
                                sliderSettings: sliderSettings,
                                xp: state.xp,
                                level: state.level || currentUserProfile.level || 1,
                                streakCount: state.streakCount || currentUserProfile.streakCount || 1,
                                unlockedMissions: state.unlockedMissions || currentUserProfile.unlockedMissions || ["first_uplink"],
                                name: state.name || currentUserProfile.name || "",
                                photoURL: state.photoURL || currentUserProfile.photoURL || "",
                                age: state.age || currentUserProfile.age || "",
                                gender: state.gender || currentUserProfile.gender || "astronaut",
                                simulatedYear: state.simulatedYear || currentUserProfile.simulatedYear || 2025,
                                profileComplete: state.profileComplete !== undefined ? state.profileComplete : (currentUserProfile.profileComplete || false),
                                lastUpdated: firebase.firestore.FieldValue.serverTimestamp()
                            });
                            
                            console.log("💾 SIMULATOR // Firestore auto-saved telemetry successfully.");
                            
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
                        console.log("👑 SIMULATOR // Admin authority detected. Redirecting to Command Console...");
                        authOverlay.classList.add('hidden');
                        appContainer.classList.add('hidden');
                        adminContainer.classList.remove('hidden');
                        
                        loadAdminDashboardTelemetry();
                    } else {
                        console.log("👤 SIMULATOR // Standard Agent uplink complete.");
                        
                        // Seed properties to currentState
                        if (typeof currentState !== 'undefined') {
                            currentState.name = profile.name || "";
                            currentState.photoURL = profile.photoURL || "";
                            currentState.age = profile.age || "";
                            currentState.gender = profile.gender || "astronaut";
                            currentState.unlockedMissions = profile.unlockedMissions || ["first_uplink"];
                            currentState.profileComplete = profile.profileComplete || false;
                            
                            currentState.xp = profile.xp !== undefined ? profile.xp : 40;
                            currentState.level = profile.level !== undefined ? profile.level : 1;
                            currentState.streakCount = profile.streakCount !== undefined ? profile.streakCount : 1;
                            currentState.simulatedYear = profile.simulatedYear || 2025;
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
                gender: "astronaut",
                futureGoal: "Entrepreneurial Success",
                streakCount: 1,
                lastActiveDate: "",
                unlockedMissions: ["first_uplink"],
                xp: 40,
                level: 1,
                simulatedYear: 2025,
                sliderSettings: {
                    sleepHours: 7,
                    screenTime: 5,
                    studyHours: 4,
                    exerciseDays: 3,
                    eatingHabit: 2,
                    stressLevel: 30,
                    socialMediaTime: 2,
                    savingsRate: 20
                },
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
            sleepHours: 7,
            screenTime: 5,
            studyHours: 4,
            exerciseDays: 3,
            eatingHabit: 2,
            stressLevel: 30,
            socialMediaTime: 2,
            savingsRate: 20
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
            
            currentUserProfile.xp = state.xp;
            currentUserProfile.level = state.level || currentUserProfile.level || 1;
            currentUserProfile.streakCount = state.streakCount || currentUserProfile.streakCount || 1;
            currentUserProfile.unlockedMissions = state.unlockedMissions || currentUserProfile.unlockedMissions || ["first_uplink"];
            currentUserProfile.simulatedYear = state.simulatedYear || currentUserProfile.simulatedYear || 2025;
            
            currentUserProfile.name = state.name || currentUserProfile.name || "";
            currentUserProfile.photoURL = state.photoURL || currentUserProfile.photoURL || "";
            currentUserProfile.age = state.age || currentUserProfile.age || "";
            currentUserProfile.gender = state.gender || currentUserProfile.gender || "astronaut";
            currentUserProfile.profileComplete = state.profileComplete !== undefined ? state.profileComplete : (currentUserProfile.profileComplete || false);

            currentUserProfile.sliderSettings = {
                sleepHours: state.sleepHours,
                screenTime: state.screenTime,
                studyHours: state.studyHours,
                exerciseDays: state.exerciseDays,
                eatingHabit: state.eatingHabit,
                stressLevel: state.stressLevel,
                socialMediaTime: state.socialMediaTime,
                savingsRate: state.savingsRate
            };
            localStorage.setItem('ecosphere_sandbox_user', JSON.stringify(currentUserProfile));
            console.log("💾 SIMULATOR // Sandbox Auto-Saved to Local Storage successfully.");
            
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
            currentState.gender = u.gender || "astronaut";
            currentState.unlockedMissions = u.unlockedMissions || ["first_uplink"];
            currentState.profileComplete = u.profileComplete || false;
            
            currentState.xp = u.xp !== undefined ? u.xp : 40;
            currentState.level = u.level !== undefined ? u.level : 1;
            currentState.streakCount = u.streakCount !== undefined ? u.streakCount : 1;
            currentState.simulatedYear = u.simulatedYear || 2025;
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
            photoURL: email.includes("google") ? "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=150&q=80" : `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(email)}`,
            role: "user",
            profileComplete: false,
            age: "",
            gender: "astronaut",
            unlockedMissions: ["first_uplink"],
            sliderSettings: {
                sleepHours: 7,
                screenTime: 5,
                studyHours: 4,
                exerciseDays: 3,
                eatingHabit: 2,
                stressLevel: 30,
                socialMediaTime: 2,
                savingsRate: 20
            },
            xp: 40,
            level: 1,
            streakCount: 1,
            simulatedYear: 2025
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
                xp: 120,
                level: 2,
                streakCount: 5,
                simulatedYear: 2025,
                gender: "female",
                futureGoal: "Balanced Zen Life",
                profileComplete: true,
                sliderSettings: {
                    sleepHours: 8,
                    screenTime: 3,
                    studyHours: 6,
                    exerciseDays: 5,
                    eatingHabit: 3,
                    stressLevel: 15,
                    socialMediaTime: 1,
                    savingsRate: 45
                }
            },
            {
                uid: "mock_john_smith",
                name: "JOHN_SMITH",
                email: "smith.j@ecosphere.net",
                role: "user",
                xp: 20,
                level: 1,
                streakCount: 1,
                simulatedYear: 2025,
                gender: "male",
                futureGoal: "Wealth Generation",
                profileComplete: true,
                sliderSettings: {
                    sleepHours: 4,
                    screenTime: 12,
                    studyHours: 1,
                    exerciseDays: 0,
                    eatingHabit: 0,
                    stressLevel: 80,
                    socialMediaTime: 6,
                    savingsRate: 5
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
