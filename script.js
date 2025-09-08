// Application State Management
const AppState = {
    currentScreen: "welcome",
    currentSection: "dashboard",
    accountType: null, // 'creator' or 'student'
    user: {
        id: null,
        name: "",
        username: "",
        email: "",
        accountType: null,
        joinDate: new Date().toISOString(),
        followers: 0,
        students: 0,
        courses: 0,
        totalEarnings: 0,
        totalEngagements: 0,
        convertedStudents: 0,
        rewardPoints: 0,
        faceVerificationEnabled: true,
        isMonetizationEligible: false
    },
    sidebarOpen: false,
    notificationsOpen: false,
    faceVerificationPending: null,
    engagementData: {
        likes: 0,
        comments: 0,
        shares: 0,
        enrollments: 0
    },
    followerEngagements: new Map(), // Track engagement count per follower
    courses: [],
    students: [],
    notifications: [],
    rewardHistory: [],
    activeRewards: new Map(), // Track active conversion progress
    monetizationRequirements: {
        minFollowers: 1000,
        minEngagements: 100,
        minCourses: 3
    }
};

// Constants
const ENGAGEMENT_THRESHOLD = 10; // Engagements needed to convert follower to student
const FACE_VERIFICATION_ACTIONS = ['withdraw', 'add-payment', 'change-avatar', 'edit-profile', 'change-password'];

// Initialize Application
document.addEventListener("DOMContentLoaded", function () {
    // Add small delay to ensure all elements are properly loaded
    setTimeout(() => {
        initializeApp();
        setupEventListeners();
        loadUserData();
    }, 150);
});


 // Initialize the application
 function initializeApp() {
    console.log("Creator Flow Academy - Enhanced Platform Initializing...");
    
    try {
        // Hide loading screen after initialization
        setTimeout(() => {
            const loadingScreen = document.getElementById("loading-screen");
            if (loadingScreen) {
                loadingScreen.classList.add("hidden");
                loadingScreen.style.display = "none";
            }
        }, 2000);

        // Load saved state from localStorage
        loadAppState();

        // Ensure only welcome screen shows at start
        // First hide all screens
        document.querySelectorAll('.screen').forEach(s => {
            s.classList.remove('active');
            s.style.display = 'none';
        });
        // Show only welcome screen
        const welcomeScreen = document.getElementById("welcome-screen");
        if (welcomeScreen) {
            welcomeScreen.style.display = "block";
            welcomeScreen.classList.add("active");
        }

        // Initialize other parts
        createSidebarOverlay();
        initializeDragAndDrop();
        initializeCharts();
        initializeNotifications();
        initializeEngagementTracking();

        // Optional: set current screen in state
        AppState.currentScreen = "welcome";

        console.log("Application initialized successfully");
    } catch (error) {
        console.error("Error during initialization:", error);
        showToast("Application initialization failed. Please refresh the page.", "error");
    }
}
 
 // Create sidebar overlay for mobile
 
function createSidebarOverlay() {
    if (document.getElementById("sidebar-overlay")) return;
    
    const overlay = document.createElement("div");
    overlay.className = "sidebar-overlay";
    overlay.id = "sidebar-overlay";
    overlay.addEventListener("click", closeSidebar);
    document.body.appendChild(overlay);
}


//  Setup event listeners
 
function setupEventListeners() {
    // Window resize handler
    window.addEventListener("resize", handleResize);
    
    // Keyboard navigation
    document.addEventListener("keydown", handleKeyboardNavigation);
    
    // Close modals on escape
    document.addEventListener("keydown", function (e) {
        if (e.key === "Escape") {
            closeAllModals();
            closeNotifications();
            closeFaceVerification();
        }
    });
    
    // Handle back button
    window.addEventListener("popstate", function (e) {
        if (e.state) {
            AppState.currentScreen = e.state.screen;
            AppState.currentSection = e.state.section;
            updateUI();
        }
    });

    // Auto-save state periodically
    setInterval(saveAppState, 10000); // Save every 10 seconds
}

 // Handle window resize
 
function handleResize() {
    const isMobile = window.innerWidth <= 768;
    
    if (!isMobile && AppState.sidebarOpen) {
        closeSidebar();
    }
}


 // Handle keyboard navigation

function handleKeyboardNavigation(e) {
    if ((e.ctrlKey || e.metaKey) && e.key >= "1" && e.key <= "9") {
        e.preventDefault();
        const sections = [
            "dashboard", "engagement", "courses", "students", 
            "analytics", "rewards", "monetization", "messages", "profile"
        ];
        const sectionIndex = parseInt(e.key) - 1;
        if (sections[sectionIndex]) {
            showSection(sections[sectionIndex]);
        }
    }
}


//  Account Type Selection Functions
 
function showAccountTypeSelection() {
    switchScreen("account-type");
}

function selectAccountType(type) {
    AppState.accountType = type;
    AppState.user.accountType = type;
    
    // Update UI elements for account type
    updateAccountTypeDisplay();
    
    // Show login screen
    showLogin();
}

function updateAccountTypeDisplay() {
    const accountTypeDisplay = document.getElementById("account-type-display");
    const signupAccountType = document.getElementById("signup-account-type");
    
    if (accountTypeDisplay) {
        accountTypeDisplay.textContent = AppState.accountType || "creator";
    }
    if (signupAccountType) {
        signupAccountType.textContent = AppState.accountType || "creator";
    }
}


 //Screen Navigation Functions

function showLogin() {
    updateAccountTypeDisplay();
    switchScreen("login");
}

function showSignup() {
    updateAccountTypeDisplay();
    switchScreen("signup");
}

function skipWelcome() {
    // Set default account type for demo
    AppState.accountType = "creator";
    AppState.user.accountType = "creator";
    initializeDemoData();
    switchScreen("dashboard");
}

function login(event) {
    event.preventDefault();
    
    const email = document.getElementById("email").value;
    const password = document.getElementById("password").value;
    
    if (!email || !password) {
        showToast("Please fill in all fields", "error");
        return;
    }
    
    // Simulate login process
    showLoadingState();
    
    setTimeout(() => {
        AppState.user.email = email;
        AppState.user.name = email.split("@")[0];
        AppState.user.username = "@" + email.split("@")[0];
        AppState.user.id = Date.now().toString();
        
        initializeDemoData();
        switchScreen("dashboard");
        hideLoadingState();
        showToast("Welcome back!", "success");
        updateUserInfo();
    }, 1500);
}

function signup(event) {
    event.preventDefault();
    
    const fullname = document.getElementById("fullname").value;
    const email = document.getElementById("signup-email").value;
    const username = document.getElementById("username").value;
    const password = document.getElementById("signup-password").value;
    
    if (!fullname || !email || !username || !password) {
        showToast("Please fill in all fields", "error");
        return;
    }
    
    // Simulate signup process
    showLoadingState();
    
    setTimeout(() => {
        AppState.user.name = fullname;
        AppState.user.email = email;
        AppState.user.username = "@" + username;
        AppState.user.id = Date.now().toString();
        
        initializeDemoData();
        switchScreen("dashboard");
        hideLoadingState();
        showToast("Account created successfully!", "success");
        updateUserInfo();
    }, 1500);
}

//for socail loging
function socialLogin(provider) {
    showToast(`${provider} login coming soon!`, "info");
}
//logout funtion
function logout() {
    if (confirm("Are you sure you want to logout?")) {
        localStorage.removeItem("creatorFlowState");
        
        // Reset state
        Object.keys(AppState).forEach(key => {
            if (typeof AppState[key] === 'object' && AppState[key] !== null) {
                if (Array.isArray(AppState[key])) {
                    AppState[key] = [];
                } else if (AppState[key] instanceof Map) {
                    AppState[key].clear();
                } else {
                    AppState[key] = {};
                }
            } else {
                AppState[key] = null;
            }
        });
        
        AppState.currentScreen = "welcome";
        AppState.currentSection = "dashboard";
        
        switchScreen("welcome");
        showToast("Logged out successfully", "info");
    }
}

 // Initialize demo data for testing
function initializeDemoData() {
    if (AppState.user.accountType === "creator") {
        AppState.user.followers = 850; // Below monetization threshold
        AppState.user.students = 45;
        AppState.user.courses = 2; // Below required courses
        AppState.user.totalEarnings = 2450.75;
        AppState.engagementData.likes = 320;
        AppState.engagementData.comments = 156;
        AppState.engagementData.shares = 89;
        AppState.engagementData.enrollments = 67;
        AppState.user.totalEngagements = 632;
        AppState.user.convertedStudents = 12;
        AppState.user.rewardPoints = 240;
        
        // Add some demo follower engagements
        initializeDemoFollowerEngagements();
        
        // Add demo courses
        initializeDemoCourses();
        
        // Add demo students
        initializeDemoStudents();
        
        // Add demo notifications
        initializeDemoNotifications();
        
        // Add demo reward history
        initializeDemoRewardHistory();
    }
    
    checkMonetizationEligibility();
    updateDashboardData();
}

function initializeDemoFollowerEngagements() {
    const demoFollowers = [
        { id: "1", name: "Alex Rivera", avatar: "AR", engagements: 8 },
        { id: "2", name: "Sarah Chen", avatar: "SC", engagements: 12 },
        { id: "3", name: "Marcus Johnson", avatar: "MJ", engagements: 6 },
        { id: "4", name: "Emma Wilson", avatar: "EW", engagements: 15 },
        { id: "5", name: "David Kim", avatar: "DK", engagements: 9 }
    ];
    
    demoFollowers.forEach(follower => {
        AppState.followerEngagements.set(follower.id, {
            name: follower.name,
            avatar: follower.avatar,
            engagements: follower.engagements,
            isStudent: follower.engagements >= ENGAGEMENT_THRESHOLD
        });
        
        if (follower.engagements >= ENGAGEMENT_THRESHOLD && !follower.isStudent) {
            // This follower should be converted to student
            convertFollowerToStudent(follower.id);
        }
    });
}

function initializeDemoCourses() {
    AppState.courses = [
        {
            id: "course_1",
            title: "Web Development Fundamentals",
            description: "Learn HTML, CSS, and JavaScript basics",
            students: 234,
            rating: 4.8,
            category: "Programming",
            price: 79.99,
            engagements: 145
        },
        {
            id: "course_2",
            title: "UI/UX Design Principles",
            description: "Master design thinking and user experience",
            students: 189,
            rating: 4.6,
            category: "Design",
            price: 89.99,
            engagements: 98
        }
    ];
}

function initializeDemoStudents() {
    AppState.students = [
        {
            id: "student_1",
            name: "Sarah Chen",
            email: "sarah.chen@email.com",
            avatar: "SC",
            joinDate: "2024-01-15",
            coursesEnrolled: 2,
            engagementRate: 85,
            isConverted: true,
            totalEngagements: 12
        },
        {
            id: "student_2",
            name: "Emma Wilson",
            email: "emma.wilson@email.com",
            avatar: "EW",
            joinDate: "2024-02-03",
            coursesEnrolled: 1,
            engagementRate: 92,
            isConverted: true,
            totalEngagements: 15
        }
    ];
}

function initializeDemoNotifications() {
    AppState.notifications = [
        {
            id: "notif_1",
            type: "conversion",
            title: "New Student Converted!",
            message: "Sarah Chen became your student after 12 engagements",
            time: new Date(Date.now() - 1800000).toISOString(), // 30 min ago
            unread: true,
            icon: "fas fa-user-graduate"
        },
        {
            id: "notif_2",
            type: "engagement",
            title: "High Engagement Alert",
            message: "Your Web Development course received 15 new likes",
            time: new Date(Date.now() - 3600000).toISOString(), // 1 hour ago
            unread: true,
            icon: "fas fa-heart"
        },
        {
            id: "notif_3",
            type: "milestone",
            title: "Follower Milestone",
            message: "You've reached 850 followers! 150 more for monetization",
            time: new Date(Date.now() - 7200000).toISOString(), // 2 hours ago
            unread: false,
            icon: "fas fa-users"
        }
    ];
}

function initializeDemoRewardHistory() {
    AppState.rewardHistory = [
        {
            id: "reward_1",
            type: "conversion",
            title: "Student Conversion Reward",
            description: "Sarah Chen converted to student",
            points: 50,
            date: new Date(Date.now() - 1800000).toISOString(),
            icon: "conversion"
        },
        {
            id: "reward_2",
            type: "milestone",
            title: "Engagement Milestone",
            description: "Reached 500 total engagements",
            points: 25,
            date: new Date(Date.now() - 86400000).toISOString(),
            icon: "milestone"
        }
    ];
}


 //Switch between screens
 
function switchScreen(screenName) {
    // Hide all screens
    const screens = document.querySelectorAll(".screen");
    screens.forEach((screen) => {
        screen.classList.remove("active");
        screen.style.display = "none";
    });
    
    // Show target screen
    const targetScreen = document.getElementById(`${screenName}-screen`);
    if (targetScreen) {
        targetScreen.style.display = "block";
        targetScreen.classList.add("active");
        AppState.currentScreen = screenName;
        
        // Update browser history
        const state = { screen: screenName, section: AppState.currentSection };
        history.pushState(state, "", `#${screenName}`);
        
        // Close sidebar if open
        if (AppState.sidebarOpen) {
            closeSidebar();
        }
        
        // Update page title
        updatePageTitle(screenName);
        
        saveAppState();
        
        console.log(`Switched to screen: ${screenName}`);
    } else {
        console.error(`Screen not found: ${screenName}-screen`);
    }
}


 //Section Navigation Functions

function showSection(sectionName) {
    // Update menu active state
    const menuItems = document.querySelectorAll(".menu-item");
    menuItems.forEach((item) => {
        item.classList.remove("active");
        if (item.getAttribute("onclick") && item.getAttribute("onclick").includes(sectionName)) {
            item.classList.add("active");
        }
    });
    
    // Hide all sections
    const sections = document.querySelectorAll(".content-section");
    sections.forEach((section) => section.classList.remove("active"));
    
    // Show target section
    const targetSection = document.getElementById(`${sectionName}-section`);
    if (targetSection) {
        targetSection.classList.add("active");
        AppState.currentSection = sectionName;
        
        // Update page title
        updatePageTitle(sectionName);
        
        // Initialize section-specific functionality
        initializeSection(sectionName);
        
        // Close sidebar on mobile
        if (window.innerWidth <= 768 && AppState.sidebarOpen) {
            closeSidebar();
        }
        
        saveAppState();
    }
}

function updatePageTitle(section) {
    const pageTitle = document.getElementById("page-title");
    if (pageTitle) {
        const titles = {
            dashboard: "Dashboard",
            engagement: "Engagement Tracking",
            courses: "Course Management",
            students: "Student Management",
            analytics: "Analytics",
            rewards: "Rewards & Achievements",
            monetization: "Monetization Center",
            messages: "Messages",
            profile: "Profile Settings"
        };
        pageTitle.textContent = titles[section] || "Dashboard";
    }
}


 // Initialize section-specific functionality

function initializeSection(sectionName) {
    switch (sectionName) {
        case "dashboard":
            updateDashboardData();
            break;
        case "engagement":
            updateEngagementSection();
            break;
        case "courses":
            updateCoursesSection();
            break;
        case "students":
            updateStudentsSection();
            break;
        case "analytics":
            updateAnalyticsSection();
            break;
        case "rewards":
            updateRewardsSection();
            break;
        case "monetization":
            updateMonetizationSection();
            break;
        case "messages":
            updateMessagesSection();
            break;
        case "profile":
            updateProfileSection();
            break;
    }
}


 // Sidebar Functions
 
function toggleSidebar() {
    const sidebar = document.getElementById("sidebar");
    if (sidebar) {
        AppState.sidebarOpen = !AppState.sidebarOpen;
        sidebar.classList.toggle("active", AppState.sidebarOpen);
        updateSidebarOverlay();
    }
}

function closeSidebar() {
    const sidebar = document.getElementById("sidebar");
    if (sidebar) {
        sidebar.classList.remove("active");
        AppState.sidebarOpen = false;
        updateSidebarOverlay();
    }
}

function updateSidebarOverlay() {
    const overlay = document.getElementById("sidebar-overlay");
    if (overlay) {
        overlay.classList.toggle("active", AppState.sidebarOpen);
    }
}


 //Engagement Tracking System

function initializeEngagementTracking() {
    // Simulate real-time engagement events
    if (AppState.user.accountType === "creator") {
        setInterval(simulateEngagementEvent, 30000); // Every 30 seconds
    }
}

function simulateEngagementEvent() {
    if (Math.random() < 0.3) { // 30% chance of engagement event
        const engagementTypes = ['like', 'comment', 'share', 'enrollment'];
        const type = engagementTypes[Math.floor(Math.random() * engagementTypes.length)];
        const followerId = `follower_${Math.floor(Math.random() * 100)}`;
        
        addEngagement(type, followerId);
    }
}

function addEngagement(type, followerId) {
    // Update engagement counts
    AppState.engagementData[type + 's'] = (AppState.engagementData[type + 's'] || 0) + 1;
    AppState.user.totalEngagements++;
    
    // Track follower engagement
    if (!AppState.followerEngagements.has(followerId)) {
        AppState.followerEngagements.set(followerId, {
            name: `User ${followerId.split('_')[1]}`,
            avatar: `U${followerId.split('_')[1]}`,
            engagements: 0,
            isStudent: false
        });
    }
    
    const followerData = AppState.followerEngagements.get(followerId);
    followerData.engagements++;
    
    // Check for conversion threshold
    if (followerData.engagements >= ENGAGEMENT_THRESHOLD && !followerData.isStudent) {
        convertFollowerToStudent(followerId);
    }
    
    // Update UI
    updateEngagementDisplays();
    
    // Show notification
    showToast(`New ${type} received!`, "success");
    
    // Add to notifications
    addNotification({
        type: "engagement",
        title: "New Engagement",
        message: `Received a ${type} from ${followerData.name}`,
        icon: getEngagementIcon(type)
    });
    
    saveAppState();
}

function convertFollowerToStudent(followerId) {
    const followerData = AppState.followerEngagements.get(followerId);
    if (!followerData || followerData.isStudent) return;
    
    // Mark as student
    followerData.isStudent = true;
    AppState.user.convertedStudents++;
    AppState.user.students++;
    
    // Add to students list
    const newStudent = {
        id: `student_${followerId}`,
        name: followerData.name,
        email: `${followerData.name.toLowerCase().replace(' ', '.')}@email.com`,
        avatar: followerData.avatar,
        joinDate: new Date().toISOString().split('T')[0],
        coursesEnrolled: 0,
        engagementRate: Math.floor(Math.random() * 30) + 70, // 70-100%
        isConverted: true,
        totalEngagements: followerData.engagements
    };
    
    AppState.students.push(newStudent);
    
    // Award reward points
    const rewardPoints = 50;
    AppState.user.rewardPoints += rewardPoints;
    
    // Add to reward history
    AppState.rewardHistory.unshift({
        id: `reward_${Date.now()}`,
        type: "conversion",
        title: "Student Conversion Reward",
        description: `${followerData.name} converted to student`,
        points: rewardPoints,
        date: new Date().toISOString(),
        icon: "conversion"
    });
    
    // Show notification
    showToast(`🎉 ${followerData.name} became your student!`, "success");
    
    // Add notification
    addNotification({
        type: "conversion",
        title: "New Student Converted!",
        message: `${followerData.name} became your student after ${followerData.engagements} engagements`,
        icon: "fas fa-user-graduate"
    });
    
    // Update UI
    updateDashboardData();
    updateEngagementSection();
    updateRewardsSection();
    updateStudentsSection();
}

function getEngagementIcon(type) {
    const icons = {
        like: "fas fa-thumbs-up",
        comment: "fas fa-comments",
        share: "fas fa-share",
        enrollment: "fas fa-user-plus"
    };
    return icons[type] || "fas fa-heart";
}


 // Face Verification System

function requestFaceVerification(action) {
    if (!AppState.user.faceVerificationEnabled) {
        executeAction(action);
        return;
    }
    
    if (!FACE_VERIFICATION_ACTIONS.includes(action)) {
        executeAction(action);
        return;
    }
    
    AppState.faceVerificationPending = action;
    showFaceVerificationModal(action);
}

function showFaceVerificationModal(action) {
    const modal = document.getElementById("face-verification-modal");
    const reasonText = document.getElementById("verification-reason");
    
    if (modal && reasonText) {
        const actionNames = {
            'withdraw': 'Withdraw Funds',
            'add-payment': 'Add Payment Method',
            'change-avatar': 'Change Profile Picture',
            'edit-profile': 'Edit Profile Information',
            'change-password': 'Change Password'
        };
        
        reasonText.textContent = actionNames[action] || action;
        modal.classList.add("active");
        
        // Reset verification steps
        resetVerificationSteps();
    }
}

function resetVerificationSteps() {
    const steps = document.querySelectorAll(".verification-step");
    steps.forEach(step => step.classList.add("hidden"));
    
    const step1 = document.getElementById("verification-step-1");
    if (step1) {
        step1.classList.remove("hidden");
    }
}

function startFaceVerification() {
    const step1 = document.getElementById("verification-step-1");
    const step2 = document.getElementById("verification-step-2");
    
    if (step1 && step2) {
        step1.classList.add("hidden");
        step2.classList.remove("hidden");
        
        initializeCamera();
    }
}

async function initializeCamera() {
    const video = document.getElementById("verification-video");
    const captureBtn = document.getElementById("capture-btn");
    
    try {
        const stream = await navigator.mediaDevices.getUserMedia({ 
            video: { 
                width: 400, 
                height: 300,
                facingMode: 'user'
            } 
        });
        
        if (video) {
            video.srcObject = stream;
            video.play();
            
            // Enable capture button after video loads
            video.addEventListener('loadedmetadata', () => {
                if (captureBtn) {
                    captureBtn.disabled = false;
                }
            });
        }
    } catch (error) {
        console.error("Camera access denied:", error);
        showToast("Camera access is required for face verification", "error");
        closeFaceVerification();
    }
}

function captureFace() {
    const video = document.getElementById("verification-video");
    const step2 = document.getElementById("verification-step-2");
    const step3 = document.getElementById("verification-step-3");
    
    if (video && step2 && step3) {
        // Stop camera stream
        const stream = video.srcObject;
        if (stream) {
            stream.getTracks().forEach(track => track.stop());
        }
        
        // Show processing step
        step2.classList.add("hidden");
        step3.classList.remove("hidden");
        
        // Simulate verification process
        setTimeout(() => {
            processVerification();
        }, 3000);
    }
}

function processVerification() {
    const step3 = document.getElementById("verification-step-3");
    const step4 = document.getElementById("verification-step-4");
    const resultDiv = document.getElementById("verification-result");
    
    // Simulate 90% success rate
    const isSuccessful = Math.random() > 0.1;
    
    if (step3 && step4 && resultDiv) {
        step3.classList.add("hidden");
        step4.classList.remove("hidden");
        
        if (isSuccessful) {
            resultDiv.innerHTML = `
                <div class="verification-success">
                    <div class="verification-icon">
                        <i class="fas fa-check-circle"></i>
                    </div>
                    <h4>Verification Successful</h4>
                    <p>Your identity has been verified successfully.</p>
                    <button class="btn-primary" onclick="completeVerification(true)">Continue</button>
                </div>
            `;
        } else {
            resultDiv.innerHTML = `
                <div class="verification-error">
                    <div class="verification-icon">
                        <i class="fas fa-times-circle"></i>
                    </div>
                    <h4>Verification Failed</h4>
                    <p>We couldn't verify your identity. Please try again.</p>
                    <div style="display: flex; gap: 1rem; justify-content: center; margin-top: 1rem;">
                        <button class="btn-secondary" onclick="startFaceVerification()">Try Again</button>
                        <button class="btn-primary" onclick="closeFaceVerification()">Cancel</button>
                    </div>
                </div>
            `;
        }
    }
}

function completeVerification(success) {
    if (success && AppState.faceVerificationPending) {
        executeAction(AppState.faceVerificationPending);
        showToast("Face verification successful!", "success");
    }
    
    closeFaceVerification();
}

function cancelFaceVerification() {
    const video = document.getElementById("verification-video");
    
    // Stop camera stream
    if (video && video.srcObject) {
        video.srcObject.getTracks().forEach(track => track.stop());
    }
    
    closeFaceVerification();
}

function closeFaceVerification() {
    const modal = document.getElementById("face-verification-modal");
    const video = document.getElementById("verification-video");
    
    // Stop camera stream
    if (video && video.srcObject) {
        video.srcObject.getTracks().forEach(track => track.stop());
        video.srcObject = null;
    }
    
    if (modal) {
        modal.classList.remove("active");
    }
    
    AppState.faceVerificationPending = null;
    resetVerificationSteps();
}

function executeAction(action) {
    switch (action) {
        case 'withdraw':
            handleWithdraw();
            break;
        case 'add-payment':
            handleAddPayment();
            break;
        case 'change-avatar':
            handleChangeAvatar();
            break;
        case 'edit-profile':
            handleEditProfile();
            break;
        case 'change-password':
            handleChangePassword();
            break;
        default:
            showToast(`Action ${action} executed`, "info");
    }
}

function handleWithdraw() {
    if (AppState.user.totalEarnings < 10) {
        showToast("Minimum withdrawal amount is $10", "error");
        return;
    }
    
    if (!AppState.user.isMonetizationEligible) {
        showToast("Complete monetization requirements to withdraw", "error");
        return;
    }
    
    showToast("Withdrawal request submitted successfully!", "success");
}

function handleAddPayment() {
    showToast("Payment method feature coming soon!", "info");
}

function handleChangeAvatar() {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*';
    input.onchange = function(e) {
        const file = e.target.files[0];
        if (file) {
            showToast("Profile picture updated successfully!", "success");
        }
    };
    input.click();
}

function handleEditProfile() {
    showToast("Profile editing feature coming soon!", "info");
}

function handleChangePassword() {
    showToast("Password change feature coming soon!", "info");
}

function toggleFaceVerification(enabled) {
    AppState.user.faceVerificationEnabled = enabled;
    saveAppState();
    showToast(
        enabled ? "Face verification enabled" : "Face verification disabled", 
        "info"
    );
}


 // Monetization System
 
function checkMonetizationEligibility() {
    const requirements = AppState.monetizationRequirements;
    const user = AppState.user;
    
    const followersOk = user.followers >= requirements.minFollowers;
    const engagementsOk = user.totalEngagements >= requirements.minEngagements;
    const coursesOk = user.courses >= requirements.minCourses;
    
    user.isMonetizationEligible = followersOk && engagementsOk && coursesOk;
    
    updateMonetizationRequirements(followersOk, engagementsOk, coursesOk);
    updateMonetizationStatus();
    
    return user.isMonetizationEligible;
}

function updateMonetizationRequirements(followersOk, engagementsOk, coursesOk) {
    // Update followers requirement
    updateRequirement('followers', followersOk, AppState.user.followers, AppState.monetizationRequirements.minFollowers);
    
    // Update engagement requirement
    updateRequirement('engagement', engagementsOk, AppState.user.totalEngagements, AppState.monetizationRequirements.minEngagements);
    
    // Update courses requirement
    updateRequirement('courses', coursesOk, AppState.user.courses, AppState.monetizationRequirements.minCourses);
}

function updateRequirement(type, isCompleted, current, required) {
    const progress = Math.min((current / required) * 100, 100);
    
    const progressBar = document.getElementById(`${type}-requirement-progress`);
    const progressText = document.getElementById(`${type}-requirement-text`);
    const icon = document.getElementById(`${type}-req-icon`);
    const status = document.getElementById(`${type}-req-status`);
    
    if (progressBar) {
        progressBar.style.width = progress + '%';
    }
    
    if (progressText) {
        progressText.textContent = `${current}/${required}`;
    }
    
    if (icon) {
        icon.className = isCompleted ? 
            `fas fa-${getRequirementIcon(type)} completed` : 
            `fas fa-${getRequirementIcon(type)}`;
    }
    
    if (status) {
        status.innerHTML = isCompleted ? 
            '<i class="fas fa-check"></i>' : 
            '<i class="fas fa-times"></i>';
    }
}

function getRequirementIcon(type) {
    const icons = {
        followers: 'users',
        engagement: 'heart',
        courses: 'graduation-cap'
    };
    return icons[type] || 'check';
}

function updateMonetizationStatus() {
    const statusIndicator = document.getElementById("monetization-status-indicator");
    const menuStatus = document.getElementById("monetization-status");
    
    if (statusIndicator) {
        if (AppState.user.isMonetizationEligible) {
            statusIndicator.className = "status-indicator eligible";
            statusIndicator.innerHTML = '<i class="fas fa-check"></i><span>Eligible</span>';
        } else {
            statusIndicator.className = "status-indicator not-eligible";
            statusIndicator.innerHTML = '<i class="fas fa-lock"></i><span>Not Eligible</span>';
        }
    }
    
    if (menuStatus) {
        if (AppState.user.isMonetizationEligible) {
            menuStatus.className = "monetization-status eligible";
            menuStatus.innerHTML = '<i class="fas fa-check"></i>';
        } else {
            menuStatus.className = "monetization-status";
            menuStatus.innerHTML = '<i class="fas fa-lock"></i>';
        }
    }
}


// Dashboard Data Updates

function updateDashboardData() {
    updateBalanceDisplay();
    updateStatsDisplay();
    updateUserInfo();
    updateProgressBars();
    checkMonetizationEligibility();
}

function updateBalanceDisplay() {
    const balanceElement = document.getElementById("total-earnings");
    if (balanceElement) {
        balanceElement.textContent = `$${AppState.user.totalEarnings.toLocaleString("en-US", {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2
        })}`;
    }
    
    // Update withdraw button state
    const withdrawBtn = document.getElementById("withdraw-btn");
    if (withdrawBtn) {
        withdrawBtn.disabled = !AppState.user.isMonetizationEligible || AppState.user.totalEarnings < 10;
    }
}

function updateStatsDisplay() {
    // Update main stats
    updateElement("total-followers", AppState.user.followers);
    updateElement("total-engagements", AppState.user.totalEngagements);
    updateElement("converted-students", AppState.user.convertedStudents);
    
    // Update sidebar stats
    updateElement("sidebar-followers", AppState.user.followers);
    updateElement("sidebar-students", AppState.user.students);
    updateElement("sidebar-courses", AppState.user.courses);
}

function updateUserInfo() {
    updateElement("sidebar-username", AppState.user.name || "Creator");
    updateElement("sidebar-account-type", AppState.user.accountType === "creator" ? "Creator Account" : "Student Account");
}

function updateProgressBars() {
    // Followers progress to monetization
    const followersProgress = Math.min((AppState.user.followers / AppState.monetizationRequirements.minFollowers) * 100, 100);
    const followersProgressBar = document.getElementById("followers-progress");
    const followersProgressText = document.getElementById("followers-progress-text");
    
    if (followersProgressBar) {
        followersProgressBar.style.width = followersProgress + '%';
    }
    
    if (followersProgressText) {
        const remaining = Math.max(0, AppState.monetizationRequirements.minFollowers - AppState.user.followers);
        followersProgressText.textContent = remaining > 0 ? 
            `${remaining} more to monetization` : 
            "Monetization unlocked!";
    }
}

function updateElement(id, value) {
    const element = document.getElementById(id);
    if (element) {
        if (typeof value === 'number' && value >= 1000) {
            element.textContent = (value / 1000).toFixed(1) + 'k';
        } else {
            element.textContent = value;
        }
    }
}

// Section Update Functions

function updateEngagementSection() {
    updateEngagementOverview();
    updateConversionList();
    updateEngagementFeed();
}

function updateEngagementOverview() {
    updateElement("total-likes", AppState.engagementData.likes);
    updateElement("total-comments", AppState.engagementData.comments);
    updateElement("total-shares", AppState.engagementData.shares);
    updateElement("total-enrollments", AppState.engagementData.enrollments);
}

function updateConversionList() {
    const conversionList = document.getElementById("conversion-list");
    if (!conversionList) return;
    
    conversionList.innerHTML = "";
    
    AppState.followerEngagements.forEach((followerData, followerId) => {
        const item = document.createElement("div");
        item.className = "conversion-item";
        
        const progress = Math.min((followerData.engagements / ENGAGEMENT_THRESHOLD) * 100, 100);
        const statusText = followerData.isStudent ? 
            "Converted to Student" : 
            `${followerData.engagements}/${ENGAGEMENT_THRESHOLD} engagements`;
        
        item.innerHTML = `
            <div class="conversion-avatar">${followerData.avatar}</div>
            <div class="conversion-info">
                <div class="conversion-name">${followerData.name}</div>
                <div class="conversion-status">${statusText}</div>
            </div>
            <div class="conversion-progress">
                <div class="progress-bar">
                    <div class="progress-fill" style="width: ${progress}%"></div>
                </div>
            </div>
            <div class="conversion-count">${followerData.engagements}</div>
        `;
        
        if (followerData.isStudent) {
            item.style.background = "rgba(16, 185, 129, 0.1)";
            item.style.borderColor = "rgba(16, 185, 129, 0.3)";
        }
        
        conversionList.appendChild(item);
    });
}

function updateEngagementFeed() {
    const engagementFeed = document.getElementById("engagement-feed");
    if (!engagementFeed) return;
    
    engagementFeed.innerHTML = "";
    
    // Create recent activity items
    const activities = [
        { user: "Sarah Chen", action: "liked your Web Development course", time: "2 min ago", type: "like" },
        { user: "Alex Rivera", action: "commented on your UI/UX post", time: "5 min ago", type: "comment" },
        { user: "Emma Wilson", action: "shared your design tips", time: "10 min ago", type: "share" },
        { user: "Marcus Johnson", action: "enrolled in your course", time: "15 min ago", type: "enrollment" }
    ];
    
    activities.forEach(activity => {
        const item = document.createElement("div");
        item.className = "activity-item";
        
        item.innerHTML = `
            <div class="activity-avatar">${activity.user.split(' ').map(n => n[0]).join('')}</div>
            <div class="activity-content">
                <div class="activity-text">
                    <strong>${activity.user}</strong> ${activity.action}
                </div>
                <div class="activity-time">${activity.time}</div>
            </div>
            <div class="activity-type ${activity.type}">
                <i class="${getEngagementIcon(activity.type)}"></i>
            </div>
        `;
        
        engagementFeed.appendChild(item);
    });
}

function updateStudentsSection() {
    updateStudentStats();
    updateStudentsGrid();
}

function updateStudentStats() {
    updateElement("active-students", AppState.students.length);
    updateElement("new-this-month", AppState.students.filter(s => {
        const joinDate = new Date(s.joinDate);
        const thisMonth = new Date();
        return joinDate.getMonth() === thisMonth.getMonth() && 
               joinDate.getFullYear() === thisMonth.getFullYear();
    }).length);
    
    const avgEngagement = AppState.students.length > 0 ? 
        Math.round(AppState.students.reduce((sum, s) => sum + s.engagementRate, 0) / AppState.students.length) : 0;
    updateElement("avg-engagement-rate", avgEngagement + "%");
    updateElement("retention-rate", "89%"); // Demo value
}

function updateStudentsGrid() {
    const studentsGrid = document.getElementById("students-grid");
    if (!studentsGrid) return;
    
    studentsGrid.innerHTML = "";
    
    AppState.students.forEach(student => {
        const card = document.createElement("div");
        card.className = "student-card";
        
        card.innerHTML = `
            <div class="student-header">
                <div class="student-avatar">${student.avatar}</div>
                <div class="student-info">
                    <div class="student-name">${student.name}</div>
                    <div class="student-email">${student.email}</div>
                </div>
            </div>
            <div class="student-stats">
                <span>Courses: ${student.coursesEnrolled}</span>
                <span>Engagement: ${student.engagementRate}%</span>
                <span>Joined: ${new Date(student.joinDate).toLocaleDateString()}</span>
            </div>
            ${student.isConverted ? '<div class="student-badge"><i class="fas fa-star"></i> Converted Student</div>' : ''}
            <div class="student-actions">
                <button onclick="viewStudent('${student.id}')">View</button>
                <button onclick="messageStudent('${student.id}')">Message</button>
            </div>
        `;
        
        studentsGrid.appendChild(card);
    });
}

function updateRewardsSection() {
    updateActiveRewards();
    updateRewardHistory();
    updateElement("total-reward-points", AppState.user.rewardPoints);
}

function updateActiveRewards() {
    const activeRewardsGrid = document.getElementById("active-rewards-grid");
    if (!activeRewardsGrid) return;
    
    activeRewardsGrid.innerHTML = "";
    
    AppState.followerEngagements.forEach((followerData, followerId) => {
        if (!followerData.isStudent && followerData.engagements > 0) {
            const card = document.createElement("div");
            card.className = "reward-card";
            
            const progress = Math.min((followerData.engagements / ENGAGEMENT_THRESHOLD) * 100, 100);
            const remaining = Math.max(0, ENGAGEMENT_THRESHOLD - followerData.engagements);
            
            card.innerHTML = `
                <div class="reward-header">
                    <div class="reward-icon">
                        <i class="fas fa-user-graduate"></i>
                    </div>
                    <div>
                        <div class="reward-title">Student Conversion</div>
                        <div class="reward-follower">${followerData.name}</div>
                    </div>
                </div>
                <div class="reward-progress">
                    <div class="reward-progress-text">${followerData.engagements}/${ENGAGEMENT_THRESHOLD} engagements</div>
                    <div class="progress-bar">
                        <div class="progress-fill" style="width: ${progress}%"></div>
                    </div>
                </div>
                <div class="reward-status ${remaining === 0 ? 'completed' : 'pending'}">
                    <i class="fas fa-${remaining === 0 ? 'check' : 'clock'}"></i>
                    <span>${remaining === 0 ? 'Ready to convert!' : `${remaining} more needed`}</span>
                </div>
            `;
            
            activeRewardsGrid.appendChild(card);
        }
    });
    
    if (activeRewardsGrid.children.length === 0) {
        activeRewardsGrid.innerHTML = `
            <div style="text-align: center; color: var(--text-secondary); padding: 2rem; grid-column: 1 / -1;">
                <i class="fas fa-trophy" style="font-size: 3rem; margin-bottom: 1rem; color: var(--text-muted);"></i>
                <h3>No Active Conversions</h3>
                <p>Start engaging with your followers to begin tracking conversions!</p>
            </div>
        `;
    }
}

function updateRewardHistory() {
    const historyList = document.getElementById("reward-history-list");
    if (!historyList) return;
    
    historyList.innerHTML = "";
    
    AppState.rewardHistory.forEach(reward => {
        const item = document.createElement("div");
        item.className = "history-item";
        
        const timeAgo = getTimeAgo(new Date(reward.date));
        
        item.innerHTML = `
            <div class="history-icon ${reward.icon}">
                <i class="fas fa-${reward.icon === 'conversion' ? 'user-graduate' : 
                                   reward.icon === 'milestone' ? 'trophy' : 'gift'}"></i>
            </div>
            <div class="history-content">
                <div class="history-title">${reward.title}</div>
                <div class="history-description">${reward.description}</div>
            </div>
            <div class="history-reward">+${reward.points} pts</div>
            <div class="history-time">${timeAgo}</div>
        `;
        
        historyList.appendChild(item);
    });
}

function updateCoursesSection() {
    updateCoursesGrid();
}

function updateCoursesGrid() {
    const coursesGrid = document.getElementById("courses-grid");
    if (!coursesGrid) return;
    
    coursesGrid.innerHTML = "";
    
    AppState.courses.forEach(course => {
        const card = document.createElement("div");
        card.className = "course-card";
        
        card.innerHTML = `
            <div class="course-thumbnail">
                <i class="fas fa-play-circle"></i>
            </div>
            <div class="course-info">
                <h4>${course.title}</h4>
                <p>${course.description}</p>
                <div class="course-stats">
                    <span><i class="fas fa-users"></i> ${course.students.toLocaleString()} students</span>
                    <span><i class="fas fa-star"></i> ${course.rating || 'New'}</span>
                    <span><i class="fas fa-heart"></i> ${course.engagements || 0} engagements</span>
                </div>
            </div>
            <div class="course-actions">
                <button class="edit-btn" onclick="editCourse('${course.id}')">
                    <i class="fas fa-edit"></i>
                </button>
                <button class="delete-btn" onclick="deleteCourse('${course.id}')">
                    <i class="fas fa-trash"></i>
                </button>
            </div>
        `;
        
        coursesGrid.appendChild(card);
    });
}

function updateAnalyticsSection() {
    updateAnalyticsSummary();
    updateAnalyticsChart();
    updateMetrics();
}

function updateAnalyticsSummary() {
    updateElement("revenue-growth", `$${AppState.user.totalEarnings.toFixed(2)}`);
    
    const engagementRate = AppState.user.followers > 0 ? 
        ((AppState.user.totalEngagements / AppState.user.followers) * 100).toFixed(1) : 0;
    updateElement("engagement-rate", engagementRate + "%");
    
    const conversionRate = AppState.user.followers > 0 ? 
        ((AppState.user.convertedStudents / AppState.user.followers) * 100).toFixed(1) : 0;
    updateElement("conversion-rate", conversionRate + "%");
}

function updateAnalyticsChart() {
    const ctx = document.getElementById('analytics-chart');
    if (ctx && typeof Chart !== 'undefined') {
        createAnalyticsChart(ctx);
    }
}

function updateMetrics() {
    const topContentList = document.getElementById("top-content-list");
    if (topContentList) {
        topContentList.innerHTML = "";
        
        AppState.courses.forEach((course, index) => {
            const item = document.createElement("div");
            item.className = "metric-item";
            item.innerHTML = `
                <span class="metric-name">${course.title}</span>
                <span class="metric-value">${course.engagements || 0} engagements</span>
            `;
            topContentList.appendChild(item);
        });
    }
}

function updateMonetizationSection() {
    checkMonetizationEligibility();
    updatePaymentMethods();
    updateEarningsOverview();
}

function updatePaymentMethods() {
    // Payment methods are handled by the existing UI
}

function updateEarningsOverview() {
    const earningsOverview = document.getElementById("earnings-overview");
    if (earningsOverview && AppState.user.isMonetizationEligible) {
        earningsOverview.innerHTML = `
            <h3>Earnings Overview</h3>
            <div class="earnings-stats">
                <div class="earning-stat">
                    <div class="stat-value">$${AppState.user.totalEarnings.toFixed(2)}</div>
                    <div class="stat-label">Total Earnings</div>
                </div>
                <div class="earning-stat">
                    <div class="stat-value">$${(AppState.user.totalEarnings * 0.3).toFixed(2)}</div>
                    <div class="stat-label">This Month</div>
                </div>
                <div class="earning-stat">
                    <div class="stat-value">${AppState.user.students}</div>
                    <div class="stat-label">Paying Students</div>
                </div>
            </div>
        `;
    }
}

function updateMessagesSection() {
    const messageList = document.getElementById("message-list");
    if (messageList) {
        messageList.innerHTML = `
            <div style="padding: 2rem; text-align: center; color: var(--text-secondary);">
                <i class="fas fa-envelope" style="font-size: 3rem; margin-bottom: 1rem; color: var(--text-muted);"></i>
                <h3>No Messages</h3>
                <p>Start engaging with your students to receive messages!</p>
            </div>
        `;
    }
}

function updateProfileSection() {
    updateElement("profile-username", AppState.user.name);
    updateElement("profile-email", AppState.user.email);
    updateElement("profile-account-type-badge", AppState.user.accountType === "creator" ? "Creator Account" : "Student Account");
    updateElement("profile-followers", AppState.user.followers);
    updateElement("profile-students", AppState.user.students);
    updateElement("profile-courses", AppState.user.courses);
    updateElement("profile-earnings", `$${AppState.user.totalEarnings.toFixed(2)}`);
    updateElement("profile-fullname", AppState.user.name);
    updateElement("profile-email-display", AppState.user.email);
    updateElement("profile-type-display", AppState.user.accountType === "creator" ? "Creator" : "Student");
    updateElement("profile-join-date", new Date(AppState.user.joinDate).toLocaleDateString());
    
    // Update face verification toggle
    const faceVerificationToggle = document.getElementById("face-verification-toggle");
    if (faceVerificationToggle) {
        faceVerificationToggle.checked = AppState.user.faceVerificationEnabled;
    }
}


// Filter and Search Functions
 
function filterEngagement(type) {
    updateEngagementFeed(); // For now, just refresh the feed
}

function searchStudents(query) {
    const studentsGrid = document.getElementById("students-grid");
    if (!studentsGrid) return;
    
    const filteredStudents = AppState.students.filter(student =>
        student.name.toLowerCase().includes(query.toLowerCase()) ||
        student.email.toLowerCase().includes(query.toLowerCase())
    );
    
    // Re-render with filtered students
    studentsGrid.innerHTML = "";
    filteredStudents.forEach(student => {
        // Same rendering logic as updateStudentsGrid
        const card = document.createElement("div");
        card.className = "student-card";
        // ... card content
        studentsGrid.appendChild(card);
    });
}

function filterStudents(type) {
    let filteredStudents = AppState.students;
    
    switch (type) {
        case 'converted':
            filteredStudents = AppState.students.filter(s => s.isConverted);
            break;
        case 'enrolled':
            filteredStudents = AppState.students.filter(s => s.coursesEnrolled > 0);
            break;
        case 'active':
            filteredStudents = AppState.students.filter(s => s.engagementRate > 80);
            break;
    }
    
    // Re-render grid with filtered students
    updateStudentsGrid();
}

function filterRewardHistory(type) {
    const historyItems = document.querySelectorAll(".history-item");
    const filterBtns = document.querySelectorAll(".filter-btn");
    
    // Update active filter button
    filterBtns.forEach(btn => {
        btn.classList.remove("active");
        if (btn.dataset.filter === type) {
            btn.classList.add("active");
        }
    });
    
    // Show/hide items based on filter
    historyItems.forEach(item => {
        if (type === 'all') {
            item.style.display = 'flex';
        } else {
            const itemType = item.querySelector('.history-icon').className.includes(type);
            item.style.display = itemType ? 'flex' : 'none';
        }
    });
}

function filterMessages(type) {
    showToast(`Filtering by ${type}`, "info");
}

function setAnalyticsTimeframe(timeframe) {
    const filterBtns = document.querySelectorAll(".filter-btn");
    filterBtns.forEach(btn => {
        btn.classList.remove("active");
        if (btn.textContent.includes(timeframe)) {
            btn.classList.add("active");
        }
    });
    
    updateAnalyticsChart();
}


// Action Functions
 
function showUploadModal() {
    const uploadArea = document.getElementById("upload-area");
    if (uploadArea) {
        uploadArea.scrollIntoView({ behavior: 'smooth' });
        uploadArea.style.transform = 'scale(1.02)';
        setTimeout(() => {
            uploadArea.style.transform = 'scale(1)';
        }, 200);
    }
}

function editCourse(courseId) {
    const course = AppState.courses.find(c => c.id === courseId);
    if (course) {
        showToast(`Edit course: ${course.title}`, "info");
    }
}

function deleteCourse(courseId) {
    const course = AppState.courses.find(c => c.id === courseId);
    if (course && confirm(`Are you sure you want to delete "${course.title}"?`)) {
        AppState.courses = AppState.courses.filter(c => c.id !== courseId);
        AppState.user.courses = AppState.courses.length;
        updateCoursesGrid();
        checkMonetizationEligibility();
        saveAppState();
        showToast("Course deleted successfully", "success");
    }
}

function viewStudent(studentId) {
    const student = AppState.students.find(s => s.id === studentId);
    if (student) {
        showToast(`Viewing student: ${student.name}`, "info");
    }
}

function messageStudent(studentId) {
    const student = AppState.students.find(s => s.id === studentId);
    if (student) {
        showToast(`Opening chat with ${student.name}`, "info");
    }
}

function exportStudentData() {
    const data = AppState.students.map(student => ({
        name: student.name,
        email: student.email,
        joinDate: student.joinDate,
        coursesEnrolled: student.coursesEnrolled,
        engagementRate: student.engagementRate,
        isConverted: student.isConverted
    }));
    
    const dataStr = JSON.stringify(data, null, 2);
    const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
    
    const exportFileDefaultName = 'students_data.json';
    
    const linkElement = document.createElement('a');
    linkElement.setAttribute('href', dataUri);
    linkElement.setAttribute('download', exportFileDefaultName);
    linkElement.click();
    
    showToast("Student data exported successfully!", "success");
}


// Drag and Drop File Upload

function initializeDragAndDrop() {
    const uploadArea = document.getElementById('upload-area');
    const fileInput = document.getElementById('file-input');
    
    if (!uploadArea || !fileInput) return;
    
    // Prevent default drag behaviors
    ['dragenter', 'dragover', 'dragleave', 'drop'].forEach(eventName => {
        uploadArea.addEventListener(eventName, preventDefaults, false);
        document.body.addEventListener(eventName, preventDefaults, false);
    });
    
    // Highlight drop area when dragging over
    ['dragenter', 'dragover'].forEach(eventName => {
        uploadArea.addEventListener(eventName, highlight, false);
    });
    
    ['dragleave', 'drop'].forEach(eventName => {
        uploadArea.addEventListener(eventName, unhighlight, false);
    });
    
    // Handle dropped files
    uploadArea.addEventListener('drop', handleDrop, false);
    
    // Handle click to browse
    uploadArea.addEventListener('click', function() {
        fileInput.click();
    });
    
    // Handle file selection
    fileInput.addEventListener('change', function(e) {
        handleFiles(e.target.files);
    });
    
    function preventDefaults(e) {
        e.preventDefault();
        e.stopPropagation();
    }
    
    function highlight() {
        uploadArea.classList.add('drag-over');
    }
    
    function unhighlight() {
        uploadArea.classList.remove('drag-over');
    }
    
    function handleDrop(e) {
        const dt = e.dataTransfer;
        const files = dt.files;
        handleFiles(files);
    }
    
    function handleFiles(files) {
        Array.from(files).forEach(uploadFile);
    }
    
    function uploadFile(file) {
        // Create upload progress UI
        const uploadItem = createUploadItem(file);
        const uploadList = getOrCreateUploadList();
        uploadList.appendChild(uploadItem);
        
        // Simulate file upload progress
        simulateUpload(file, uploadItem);
    }
    
    function createUploadItem(file) {
        const item = document.createElement('div');
        item.className = 'upload-item';
        
        const fileSize = (file.size / 1024 / 1024).toFixed(2);
        const fileIcon = getFileIcon(file.type);
        
        item.innerHTML = `
            <div class="upload-icon">
                <i class="fas fa-${fileIcon}"></i>
            </div>
            <div class="upload-info">
                <div class="upload-name">${file.name}</div>
                <div class="upload-size">${fileSize} MB</div>
            </div>
            <div class="upload-progress">
                <div class="progress-bar">
                    <div class="progress-fill" style="width: 0%"></div>
                </div>
                <span class="progress-text">0%</span>
            </div>
        `;
        
        return item;
    }
    
    function getFileIcon(fileType) {
        if (fileType.startsWith('video/')) return 'play-circle';
        if (fileType.startsWith('image/')) return 'image';
        if (fileType === 'application/pdf') return 'file-pdf';
        if (fileType.includes('zip') || fileType.includes('rar')) return 'file-archive';
        return 'file';
    }
    
    function getOrCreateUploadList() {
        let uploadList = document.getElementById('upload-list');
        if (!uploadList) {
            uploadList = document.createElement('div');
            uploadList.id = 'upload-list';
            uploadList.className = 'upload-list';
            uploadArea.parentNode.insertBefore(uploadList, uploadArea.nextSibling);
        }
        return uploadList;
    }
    
    function simulateUpload(file, uploadItem) {
        const progressFill = uploadItem.querySelector('.progress-fill');
        const progressText = uploadItem.querySelector('.progress-text');
        
        let progress = 0;
        const interval = setInterval(() => {
            progress += Math.random() * 15;
            if (progress > 100) progress = 100;
            
            progressFill.style.width = progress + '%';
            progressText.textContent = Math.round(progress) + '%';
            
            if (progress >= 100) {
                clearInterval(interval);
                uploadItem.classList.add('upload-complete');
                
                // Add to courses list
                addCourseFromFile(file);
                showToast(`${file.name} uploaded successfully!`, 'success');
            }
        }, 200);
    }
    
    function addCourseFromFile(file) {
        const newCourse = {
            id: `course_${Date.now()}`,
            title: file.name.replace(/\.[^/.]+$/, ''), // Remove extension
            description: 'Recently uploaded course',
            students: 0,
            rating: 0,
            category: 'Uncategorized',
            price: 0,
            engagements: 0
        };
        
        AppState.courses.push(newCourse);
        AppState.user.courses = AppState.courses.length;
        updateCoursesGrid();
        checkMonetizationEligibility();
        saveAppState();
    }
}


// Charts Integration
 
function initializeCharts() {
    setTimeout(() => {
        const ctx = document.getElementById('analytics-chart');
        if (ctx && typeof Chart !== 'undefined') {
            createAnalyticsChart(ctx);
        }
    }, 1000);
}

function createAnalyticsChart(ctx) {
    if (window.analyticsChart) {
        window.analyticsChart.destroy();
    }
    
    const gradient = ctx.getContext('2d').createLinearGradient(0, 0, 0, 300);
    gradient.addColorStop(0, 'rgba(112, 69, 212, 0.3)');
    gradient.addColorStop(1, 'rgba(139, 92, 246, 0.05)');
    
    window.analyticsChart = new Chart(ctx, {
        type: 'line',
        data: {
            labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug'],
            datasets: [{
                label: 'Engagements',
                data: [45, 67, 89, 120, 156, 189, 234, AppState.user.totalEngagements],
                borderColor: '#8B5CF6',
                backgroundColor: gradient,
                borderWidth: 3,
                fill: true,
                tension: 0.4,
                pointBackgroundColor: '#8B5CF6',
                pointBorderColor: '#ffffff',
                pointBorderWidth: 2,
                pointRadius: 6,
                pointHoverRadius: 8
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    display: false
                }
            },
            scales: {
                x: {
                    grid: {
                        display: false
                    },
                    ticks: {
                        color: '#B8BCC8'
                    }
                },
                y: {
                    grid: {
                        color: 'rgba(255, 255, 255, 0.1)'
                    },
                    ticks: {
                        color: '#B8BCC8'
                    }
                }
            }
        }
    });
}


// Notification System
 
function initializeNotifications() {
    updateNotificationsBadge();
    updateNotificationsList();
}

function addNotification(notification) {
    const newNotification = {
        id: `notif_${Date.now()}`,
        type: notification.type,
        title: notification.title,
        message: notification.message,
        time: new Date().toISOString(),
        unread: true,
        icon: notification.icon
    };
    
    AppState.notifications.unshift(newNotification);
    
    // Keep only last 50 notifications
    if (AppState.notifications.length > 50) {
        AppState.notifications = AppState.notifications.slice(0, 50);
    }
    
    updateNotificationsBadge();
    updateNotificationsList();
    saveAppState();
}

function updateNotificationsBadge() {
    const badge = document.getElementById("header-notification-badge");
    const engagementBadge = document.getElementById("engagement-badge");
    const rewardsBadge = document.getElementById("rewards-badge");
    
    const unreadCount = AppState.notifications.filter(n => n.unread).length;
    
    if (badge) {
        badge.textContent = unreadCount;
        badge.style.display = unreadCount > 0 ? 'block' : 'none';
    }
    
    const engagementNotifications = AppState.notifications.filter(n => n.type === 'engagement' && n.unread).length;
    if (engagementBadge) {
        engagementBadge.textContent = engagementNotifications;
        engagementBadge.style.display = engagementNotifications > 0 ? 'block' : 'none';
    }
    
    const rewardNotifications = AppState.notifications.filter(n => n.type === 'conversion' && n.unread).length;
    if (rewardsBadge) {
        rewardsBadge.textContent = rewardNotifications;
        rewardsBadge.style.display = rewardNotifications > 0 ? 'block' : 'none';
    }
}

function updateNotificationsList() {
    const notificationsList = document.getElementById("notifications-list");
    if (!notificationsList) return;
    
    notificationsList.innerHTML = "";
    
    AppState.notifications.forEach(notification => {
        const item = document.createElement("div");
        item.className = `notification-item ${notification.unread ? 'unread' : ''}`;
        
        const timeAgo = getTimeAgo(new Date(notification.time));
        
        item.innerHTML = `
            <div class="notification-header">
                <div class="notification-icon">
                    <i class="${notification.icon}"></i>
                </div>
                <div class="notification-content">
                    <div class="notification-title">${notification.title}</div>
                    <div class="notification-text">${notification.message}</div>
                    <div class="notification-time">${timeAgo}</div>
                </div>
            </div>
        `;
        
        item.addEventListener('click', () => {
            markNotificationAsRead(notification.id);
        });
        
        notificationsList.appendChild(item);
    });
}

function markNotificationAsRead(notificationId) {
    const notification = AppState.notifications.find(n => n.id === notificationId);
    if (notification) {
        notification.unread = false;
        updateNotificationsBadge();
        updateNotificationsList();
        saveAppState();
    }
}

function toggleNotifications() {
    const panel = document.getElementById("notifications-panel");
    if (panel) {
        AppState.notificationsOpen = !AppState.notificationsOpen;
        panel.classList.toggle("active", AppState.notificationsOpen);
        
        if (AppState.notificationsOpen) {
            // Mark all as read when opened
            AppState.notifications.forEach(n => n.unread = false);
            updateNotificationsBadge();
            updateNotificationsList();
        }
    }
}

function closeNotifications() {
    const panel = document.getElementById("notifications-panel");
    if (panel) {
        panel.classList.remove("active");
        AppState.notificationsOpen = false;
    }
}

/**
 * Toast Notification System
 */
function showToast(message, type = 'info', duration = 5000) {
    const container = document.getElementById('toast-container');
    if (!container) return;
    
    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    
    const icons = {
        success: 'fas fa-check-circle',
        error: 'fas fa-exclamation-circle',
        warning: 'fas fa-exclamation-triangle',
        info: 'fas fa-info-circle'
    };
    
    const titles = {
        success: 'Success',
        error: 'Error',
        warning: 'Warning',
        info: 'Info'
    };
    
    toast.innerHTML = `
        <div class="toast-icon">
            <i class="${icons[type]}"></i>
        </div>
        <div class="toast-content">
            <div class="toast-title">${titles[type]}</div>
            <div class="toast-message">${message}</div>
        </div>
        <button class="toast-close" onclick="closeToast(this)">
            <i class="fas fa-times"></i>
        </button>
    `;
    
    container.appendChild(toast);
    
    // Auto remove after duration
    setTimeout(() => {
        if (toast.parentNode) {
            removeToast(toast);
        }
    }, duration);
}

function closeToast(button) {
    const toast = button.closest('.toast');
    if (toast) {
        removeToast(toast);
    }
}

function removeToast(toast) {
    toast.style.animation = 'slideOut 0.3s ease forwards';
    setTimeout(() => {
        if (toast.parentNode) {
            toast.parentNode.removeChild(toast);
        }
    }, 300);
}


 // Utility Functions
 
function getTimeAgo(date) {
    const now = new Date();
    const diffInSeconds = Math.floor((now - date) / 1000);
    
    if (diffInSeconds < 60) return 'Just now';
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)} min ago`;
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)} hour${Math.floor(diffInSeconds / 3600) !== 1 ? 's' : ''} ago`;
    if (diffInSeconds < 2592000) return `${Math.floor(diffInSeconds / 86400)} day${Math.floor(diffInSeconds / 86400) !== 1 ? 's' : ''} ago`;
    if (diffInSeconds < 31536000) return `${Math.floor(diffInSeconds / 2592000)} month${Math.floor(diffInSeconds / 2592000) !== 1 ? 's' : ''} ago`;
    return `${Math.floor(diffInSeconds / 31536000)} year${Math.floor(diffInSeconds / 31536000) !== 1 ? 's' : ''} ago`;
}

function updateEngagementDisplays() {
    updateEngagementOverview();
    updateDashboardData();
}

function showProfile() {
    showSection("profile");
}

function showLoadingState() {
    // Could add a loading spinner to buttons, etc.
}

function hideLoadingState() {
    // Remove loading states
}

function closeAllModals() {
    const modals = document.querySelectorAll('.modal');
    modals.forEach(modal => modal.classList.remove('active'));
}

/**
 * Data Persistence
 */
function saveAppState() {
    try {
        const stateToSave = {
            user: AppState.user,
            accountType: AppState.accountType,
            engagementData: AppState.engagementData,
            followerEngagements: Array.from(AppState.followerEngagements.entries()),
            courses: AppState.courses,
            students: AppState.students,
            notifications: AppState.notifications,
            rewardHistory: AppState.rewardHistory,
            currentScreen: AppState.currentScreen,
            currentSection: AppState.currentSection
        };
        
        localStorage.setItem('creatorFlowState', JSON.stringify(stateToSave));
    } catch (error) {
        console.error('Failed to save state:', error);
    }
}

function loadAppState() {
    try {
        const savedState = localStorage.getItem('creatorFlowState');
        if (savedState) {
            const parsedState = JSON.parse(savedState);
            
            // Restore state
            Object.assign(AppState.user, parsedState.user || {});
            AppState.accountType = parsedState.accountType;
            Object.assign(AppState.engagementData, parsedState.engagementData || {});
            
            if (parsedState.followerEngagements) {
                AppState.followerEngagements = new Map(parsedState.followerEngagements);
            }
            
            AppState.courses = parsedState.courses || [];
            AppState.students = parsedState.students || [];
            AppState.notifications = parsedState.notifications || [];
            AppState.rewardHistory = parsedState.rewardHistory || [];
            
            // Restore UI state
            if (parsedState.currentScreen && parsedState.currentScreen !== 'welcome') {
                AppState.currentScreen = parsedState.currentScreen;
                AppState.currentSection = parsedState.currentSection || 'dashboard';
                
                setTimeout(() => {
                    switchScreen(AppState.currentScreen);
                    showSection(AppState.currentSection);
                }, 100);
            }
            
            console.log('State loaded successfully');
            return true;
        }
    } catch (error) {
        console.error('Failed to load state:', error);
    }
    return false;
}

function loadUserData() {
    if (AppState.user.id) {
        updateUserInfo();
        updateDashboardData();
        initializeNotifications();
    }
}

// Global function assignments for HTML onclick handlers
window.showAccountTypeSelection = showAccountTypeSelection;
window.selectAccountType = selectAccountType;
window.showLogin = showLogin;
window.showSignup = showSignup;
window.skipWelcome = skipWelcome;
window.login = login;
window.signup = signup;
window.socialLogin = socialLogin;
window.logout = logout;
window.toggleSidebar = toggleSidebar;
window.showSection = showSection;
window.showProfile = showProfile;
window.requestFaceVerification = requestFaceVerification;
window.startFaceVerification = startFaceVerification;
window.captureFace = captureFace;
window.cancelFaceVerification = cancelFaceVerification;
window.closeFaceVerification = closeFaceVerification;
window.completeVerification = completeVerification;
window.toggleFaceVerification = toggleFaceVerification;
window.toggleNotifications = toggleNotifications;
window.closeNotifications = closeNotifications;
window.showUploadModal = showUploadModal;
window.editCourse = editCourse;
window.deleteCourse = deleteCourse;
window.viewStudent = viewStudent;
window.messageStudent = messageStudent;
window.exportStudentData = exportStudentData;
window.filterEngagement = filterEngagement;
window.searchStudents = searchStudents;
window.filterStudents = filterStudents;
window.filterRewardHistory = filterRewardHistory;
window.filterMessages = filterMessages;
window.setAnalyticsTimeframe = setAnalyticsTimeframe;
window.closeToast = closeToast;

console.log("Creator Flow Academy - Enhanced Platform Loaded Successfully!");
