



/* =========================================
   1. SUPABASE CONFIGURATION
========================================= */

const SUPABASE_URL = "https://fizgyohjbybvrrofefvm.supabase.co";
const SUPABASE_PUBLISHABLE_KEY = "sb_publishable_x45J9wytPjh5pLrDJykKFw_eoZA-1jd";

const supabaseClient = window.supabase.createClient(
    SUPABASE_URL,
    SUPABASE_PUBLISHABLE_KEY
);


/* =========================================
   2. HTML ELEMENTS
========================================= */

// Pages
const welcomePage = document.getElementById("welcomePage");
const profilePage = document.getElementById("profilePage");
const loginPage = document.getElementById("loginPage");
const resetPasswordPage = document.getElementById("resetPasswordPage");
const themePage = document.getElementById("themePage");
const diaryHome = document.getElementById("diaryHome");
const newEntryPage = document.getElementById("newEntryPage");
const readEntryPage = document.getElementById("readEntryPage");

// Signup
const nameInput = document.getElementById("name");
const emailInput = document.getElementById("email");
const usernameInput = document.getElementById("username");
const passwordInput = document.getElementById("password");
const continueBtn = document.getElementById("continueBtn");

// Login and password reset
const loginEmail = document.getElementById("loginEmail");
const loginPassword = document.getElementById("loginPassword");
const loginBtn = document.getElementById("loginBtn");
const openLoginBtn = document.getElementById("openLoginBtn");
const startBtn = document.getElementById("startBtn");
const forgotPasswordBtn = document.getElementById("forgotPasswordBtn");
const newPassword = document.getElementById("newPassword");
const confirmNewPassword = document.getElementById("confirmNewPassword");
const resetPasswordBtn = document.getElementById("resetPasswordBtn");

// Themes
const girlTheme = document.getElementById("girlTheme");
const boyTheme = document.getElementById("boyTheme");
const teddyTheme = document.getElementById("teddyTheme");

// Diary
const newEntryBtn = document.getElementById("newEntryBtn");
const savedEntryBtn = document.getElementById("savedEntryBtn");
const logoutBtn = document.getElementById("logoutBtn");
const backHomeBtn = document.getElementById("backHomeBtn");
const backFromEntryBtn = document.getElementById("backFromEntryBtn");
const editEntryBtn = document.getElementById("editEntryBtn");

const entryDate = document.getElementById("entryDate");
const entryTitle = document.getElementById("entryTitle");
const entryContent = document.getElementById("entryContent");
const entryPicture = document.getElementById("entryPicture");
const picturePreview = document.getElementById("picturePreview");

const entriesContainer = document.getElementById("entriesContainer");
const searchEntry = document.getElementById("searchEntry");

// Read entry
const readEntryTitle = document.getElementById("readEntryTitle");
const readEntryDate = document.getElementById("readEntryDate");
const readEntryText = document.getElementById("readEntryText");
const readEntryPicture = document.getElementById("readEntryPicture");

// Welcome text
const welcomeName = document.getElementById("welcomeName");
const userWelcome = document.getElementById("userWelcome");

// Profile picture
const profilePictureInput = document.getElementById("profilePictureInput");
const profilePicturePreview = document.getElementById("profilePicturePreview");
const saveProfilePictureBtn = document.getElementById("saveProfilePictureBtn");

// Current state
let editingEntry = null;
let readingEntry = null;
let allEntries = [];
let selectedPictureFile = null;
let selectedProfilePicture = null;


/* =========================================
   3. PAGE NAVIGATION
========================================= */

function showPage(page) {
    const pages = [
        welcomePage,
        profilePage,
        loginPage,
        themePage,
        diaryHome,
        newEntryPage,
        readEntryPage
    ];

    pages.forEach(function (item) {
        if (item) item.style.display = "none";
    });

    if (resetPasswordPage) {
        resetPasswordPage.style.display = "none";
    }

    if (!page) return;

    // Reset page is inside loginPage in your HTML.
    if (page === resetPasswordPage) {
        if (loginPage) loginPage.style.display = "block";
        resetPasswordPage.style.display = "block";
        return;
    }

    page.style.display = "block";

    if (page === diaryHome) {
        loadProfilePicture();
    }
}


/* =========================================
   4. THEME HELPERS
========================================= */

function getCurrentTheme() {
    const themes = ["girl-theme", "boy-theme", "teddy-theme"];

    return themes.find(function (theme) {
        return document.body.classList.contains(theme);
    }) || "teddy-theme";
}

function setTheme(theme) {
    document.body.classList.remove(
        "girl-theme",
        "boy-theme",
        "teddy-theme"
    );

    document.body.classList.add(theme);
}


/* =========================================
   5. AUTHENTICATION HELPERS
========================================= */

async function getLoggedInUser() {
    const { data, error } = await supabaseClient.auth.getUser();

    if (error || !data.user) {
        alert("Please log in first 🤎");
        showPage(welcomePage);
        return null;
    }

    return data.user;
}

async function loadWelcomeDetails(user) {
    if (!user) return;

    const { data: profile, error } = await supabaseClient
        .from("profiles")
        .select("full_name, username")
        .eq("id", user.id)
        .maybeSingle();

    if (error) {
        console.error("Profile loading error:", error);
    }

    const fullName =
        profile?.full_name || user.user_metadata?.full_name || "Friend";

    const username =
        profile?.username || user.user_metadata?.username || "";

    if (welcomeName) {
        welcomeName.textContent = `Hello, ${fullName}! 🌸`;
    }

    if (userWelcome) {
        userWelcome.textContent =
            `Your private little space, @${username}! 🌸`;
    }
}


/* =========================================
   6. WELCOME PAGE
========================================= */

if (startBtn) {
    startBtn.addEventListener("click", function () {
        showPage(profilePage);
    });
}

if (openLoginBtn) {
    openLoginBtn.addEventListener("click", function () {
        showPage(loginPage);
    });
}


/* =========================================
   7. SIGNUP
========================================= */

if (continueBtn) {
    continueBtn.addEventListener("click", async function () {
        const fullName = nameInput.value.trim();
        const email = emailInput.value.trim();
        const username = usernameInput.value.trim().toLowerCase();
        const password = passwordInput.value;

        if (!fullName || !email || !username || !password) {
            alert("Please fill in all fields 🌸");
            return;
        }

        if (username.length < 3) {
            alert("Username must have at least 3 characters.");
            return;
        }

        if (password.length < 6) {
            alert("Password must have at least 6 characters.");
            return;
        }

        continueBtn.disabled = true;

        try {
            const { data, error } = await supabaseClient.auth.signUp({
                email: email,
                password: password,
                options: {
                    data: {
                        full_name: fullName,
                        username: username
                    },
                    emailRedirectTo: window.location.origin + window.location.pathname
                }
            });

            if (error) {
                alert("Signup failed: " + error.message);
                return;
            }

            if (data.session) {
                await loadWelcomeDetails(data.user);
                alert("Your Dairiva account is ready! 🌸");
                showPage(themePage);
            } else {
                alert(
                    "Account created! Please confirm your email, " +
                    "then log in using your email and password."
                );
                showPage(loginPage);
            }
        } catch (error) {
            console.error("Signup error:", error);
            alert("Something went wrong during signup.");
        } finally {
            continueBtn.disabled = false;
        }
    });
}


/* =========================================
   8. LOGIN
========================================= */

if (loginBtn) {
    loginBtn.addEventListener("click", async function () {
        const email = loginEmail.value.trim();
        const password = loginPassword.value;

        if (!email || !password) {
            alert("Please enter your email and password 🤎");
            return;
        }

        loginBtn.disabled = true;

        try {
            const { data, error } =
                await supabaseClient.auth.signInWithPassword({
                    email: email,
                    password: password
                });

            if (error) {
                alert("Login failed: " + error.message);
                return;
            }

            await loadWelcomeDetails(data.user);
            loginPassword.value = "";

            alert("Login successful! Welcome back to Dairiva 🌸");
            showPage(themePage);
        } catch (error) {
            console.error("Login error:", error);
            alert("Login failed. Please try again.");
        } finally {
            loginBtn.disabled = false;
        }
    });
}


/* =========================================
   9. FORGOT AND RESET PASSWORD
========================================= */

if (forgotPasswordBtn) {
    forgotPasswordBtn.addEventListener("click", async function () {
        const email = loginEmail.value.trim();

        if (!email) {
            alert("Please enter your email address first 🤎");
            loginEmail.focus();
            return;
        }

        forgotPasswordBtn.disabled = true;

        try {
            const { error } =
                await supabaseClient.auth.resetPasswordForEmail(email, {
                    redirectTo: window.location.origin + window.location.pathname
                });

            if (error) {
                alert("Could not send reset link: " + error.message);
                return;
            }

            alert(
                "If an account exists for this email, a reset link " +
                "will be sent. Check your inbox and spam folder. 🤎"
            );
        } catch (error) {
            console.error("Password reset error:", error);
            alert("Something went wrong. Please try again.");
        } finally {
            forgotPasswordBtn.disabled = false;
        }
    });
}

if (resetPasswordBtn) {
    resetPasswordBtn.addEventListener("click", async function () {
        const password = newPassword.value;
        const confirmPassword = confirmNewPassword.value;

        if (!password || !confirmPassword) {
            alert("Please fill in both password fields.");
            return;
        }

        if (password.length < 6) {
            alert("Password must have at least 6 characters.");
            return;
        }

        if (password !== confirmPassword) {
            alert("Passwords do not match.");
            return;
        }

        resetPasswordBtn.disabled = true;

        try {
            const { error } = await supabaseClient.auth.updateUser({
                password: password
            });

            if (error) {
                alert("Password update failed: " + error.message);
                return;
            }

            alert("Password updated successfully! 🤎");

            await supabaseClient.auth.signOut();

            newPassword.value = "";
            confirmNewPassword.value = "";
            showPage(loginPage);
        } catch (error) {
            console.error("Password update error:", error);
            alert("Something went wrong. Please try again.");
        } finally {
            resetPasswordBtn.disabled = false;
        }
    });
}


/* =========================================
   10. THEME SELECTION
========================================= */

[
    [girlTheme, "girl-theme"],
    [boyTheme, "boy-theme"],
    [teddyTheme, "teddy-theme"]
].forEach(function ([button, theme]) {
    if (!button) return;

    button.addEventListener("click", async function () {
        setTheme(theme);
        showPage(diaryHome);
        await loadThemeEntries();
    });
});


/* =========================================
   11. DIARY PICTURE HELPERS
========================================= */

async function getDiaryPictureURL(picturePath) {
    if (!picturePath) return null;

    const { data, error } = await supabaseClient.storage
        .from("diary-pictures")
        .createSignedUrl(picturePath, 3600);

    if (error) {
        console.error("Could not load picture:", error.message);
        return null;
    }

    return data?.signedUrl || null;
}

function showPicturePreview(file) {
    if (!picturePreview) return;

    if (!file) {
        picturePreview.removeAttribute("src");
        picturePreview.style.display = "none";
        return;
    }

    picturePreview.src = URL.createObjectURL(file);
    picturePreview.style.display = "block";
}

if (entryPicture) {
    entryPicture.addEventListener("change", function () {
        const file = entryPicture.files?.[0];

        selectedPictureFile = null;

        if (!file) {
            showPicturePreview(null);
            return;
        }

        if (!file.type.startsWith("image/")) {
            alert("Please select an image file.");
            entryPicture.value = "";
            showPicturePreview(null);
            return;
        }

        if (file.size > 5 * 1024 * 1024) {
            alert("Please select an image smaller than 5 MB.");
            entryPicture.value = "";
            showPicturePreview(null);
            return;
        }

        selectedPictureFile = file;
        showPicturePreview(file);
    });
}


/* =========================================
   12. PROFILE PICTURE
========================================= */

if (profilePictureInput) {
    profilePictureInput.addEventListener("change", function () {
        const file = profilePictureInput.files?.[0];

        selectedProfilePicture = null;

        if (!file) return;

        if (!file.type.startsWith("image/")) {
            alert("Please select an image file.");
            profilePictureInput.value = "";
            return;
        }

        if (file.size > 5 * 1024 * 1024) {
            alert("Please select an image smaller than 5 MB.");
            profilePictureInput.value = "";
            return;
        }

        selectedProfilePicture = file;

        if (profilePicturePreview) {
            profilePicturePreview.src = URL.createObjectURL(file);
            profilePicturePreview.style.display = "block";
        }
    });
}

async function uploadProfilePicture() {
    const user = await getLoggedInUser();
    if (!user) return;

    if (!selectedProfilePicture) {
        alert("Please select a profile picture first.");
        return;
    }

    try {
        const file = selectedProfilePicture;
        const safeName = file.name.replace(/[^a-zA-Z0-9._-]/g, "_");

        const filePath =
            `${user.id}/profile-${Date.now()}-${safeName}`;

        const { data: uploadedFile, error: uploadError } =
            await supabaseClient.storage
                .from("diary-pictures")
                .upload(filePath, file, {
                    contentType: file.type,
                    upsert: false
                });

        if (uploadError) {
            console.error("Profile picture upload error:", uploadError);
            alert("Profile picture upload failed: " + uploadError.message);
            return;
        }

        const { data: profileData, error: profileError } =
            await supabaseClient
                .from("profiles")
                .update({ avatar_path: uploadedFile.path })
                .eq("id", user.id)
                .select("avatar_path");

        if (profileError || !profileData || profileData.length === 0) {
            console.error("Profile update error:", profileError);

            await supabaseClient.storage
                .from("diary-pictures")
                .remove([uploadedFile.path]);

            alert(
                "Picture uploaded, but profile could not be updated. " +
                (profileError?.message || "Check your profile row and RLS policies.")
            );
            return;
        }

        selectedProfilePicture = null;
        profilePictureInput.value = "";

        await loadProfilePicture();
        alert("Profile picture saved successfully 🤎");
    } catch (error) {
        console.error("Profile picture error:", error);
        alert("Something went wrong while saving the profile picture.");
    }
}

if (saveProfilePictureBtn) {
    saveProfilePictureBtn.addEventListener("click", async function () {
        saveProfilePictureBtn.disabled = true;

        try {
            await uploadProfilePicture();
        } finally {
            saveProfilePictureBtn.disabled = false;
        }
    });
}

async function loadProfilePicture() {
    const user = await getLoggedInUser();

    if (!user || !profilePicturePreview) return;

    const { data, error } = await supabaseClient
        .from("profiles")
        .select("avatar_path")
        .eq("id", user.id)
        .maybeSingle();

    if (error) {
        console.error("Could not load profile picture:", error);
        return;
    }

    if (!data?.avatar_path) {
        profilePicturePreview.removeAttribute("src");
        profilePicturePreview.style.display = "none";
        return;
    }

    const pictureURL = await getDiaryPictureURL(data.avatar_path);

    if (pictureURL) {
        profilePicturePreview.src = pictureURL;
        profilePicturePreview.style.display = "block";
    }
}


/* =========================================
   13. OPEN NEW ENTRY
========================================= */

if (newEntryBtn) {
    newEntryBtn.addEventListener("click", function () {
        editingEntry = null;
        selectedPictureFile = null;

        entryTitle.value = "";
        entryContent.value = "";
        entryDate.value = new Date().toLocaleDateString("en-CA");

        if (entryPicture) entryPicture.value = "";
        showPicturePreview(null);

        showPage(newEntryPage);
    });
}


/* =========================================
   14. SAVE OR UPDATE ENTRY
========================================= */

if (savedEntryBtn) {
    savedEntryBtn.addEventListener("click", async function () {
        const user = await getLoggedInUser();
        if (!user) return;

        const title = entryTitle.value.trim();
        const content = entryContent.value.trim();
        const date = entryDate.value;
        const theme = getCurrentTheme();

        if (!title || !content || !date) {
            alert("Please enter the date, title and your thoughts.");
            return;
        }

        savedEntryBtn.disabled = true;
        let newlyUploadedPath = null;

        try {
            // Keep the old picture unless a new one is selected.
            let picturePath = editingEntry?.picture_path || null;

            if (selectedPictureFile) {
                const file = selectedPictureFile;
                const safeName = file.name.replace(/[^a-zA-Z0-9._-]/g, "_");

                const filePath =
                    `${user.id}/${Date.now()}-${safeName}`;

                const { data: uploadedFile, error: uploadError } =
                    await supabaseClient.storage
                        .from("diary-pictures")
                        .upload(filePath, file, {
                            contentType: file.type,
                            upsert: false
                        });

                if (uploadError) {
                    console.error("Picture upload error:", uploadError);
                    alert("Picture upload failed: " + uploadError.message);
                    return;
                }

                newlyUploadedPath = uploadedFile.path;
                picturePath = uploadedFile.path;
            }

            const entryData = {
                title: title,
                content: content,
                entry_date: date,
                theme: theme,
                picture_path: picturePath,
                updated_at: new Date().toISOString()
            };

            let result;

            if (editingEntry?.id) {
                result = await supabaseClient
                    .from("diary_entries")
                    .update(entryData)
                    .eq("id", editingEntry.id)
                    .eq("user_id", user.id)
                    .select();
            } else {
                result = await supabaseClient
                    .from("diary_entries")
                    .insert({
                        ...entryData,
                        user_id: user.id
                    })
                    .select();
            }

            if (result.error || !result.data || result.data.length === 0) {
                console.error("Save error:", result.error);

                if (newlyUploadedPath) {
                    await supabaseClient.storage
                        .from("diary-pictures")
                        .remove([newlyUploadedPath]);
                }

                alert(
                    "Could not save entry: " +
                    (result.error?.message || "Check your database columns and RLS policies.")
                );
                return;
            }

            editingEntry = null;
            selectedPictureFile = null;

            if (entryPicture) entryPicture.value = "";
            showPicturePreview(null);

            alert("Your memory has been saved 🤎");

            showPage(diaryHome);
            await loadThemeEntries();
        } catch (error) {
            console.error("Save error:", error);

            if (newlyUploadedPath) {
                await supabaseClient.storage
                    .from("diary-pictures")
                    .remove([newlyUploadedPath]);
            }

            alert("Something went wrong while saving: " + error.message);
        } finally {
            savedEntryBtn.disabled = false;
        }
    });
}


/* =========================================
   15. LOAD ENTRIES FROM SUPABASE
========================================= */

async function loadThemeEntries() {
    const user = await getLoggedInUser();

    if (!user || !entriesContainer) return;

    entriesContainer.innerHTML = "<p>Loading your memories... 🤎</p>";

    const { data, error } = await supabaseClient
        .from("diary_entries")
        .select("*")
        .eq("user_id", user.id)
        .eq("theme", getCurrentTheme())
        .order("entry_date", { ascending: false });

    if (error) {
        console.error("Load error:", error);
        entriesContainer.textContent =
            "Could not load entries. Please try again.";
        return;
    }

    allEntries = data || [];
    await renderEntries(allEntries);
}


/* =========================================
   16. DISPLAY, READ, EDIT AND DELETE
========================================= */

async function renderEntries(entries) {
    entriesContainer.innerHTML = "";

    if (!entries.length) {
        const message = document.createElement("p");
        message.textContent =
            "No entries yet. Start by creating a new entry! 🌸";
        entriesContainer.appendChild(message);
        return;
    }

    for (const entry of entries) {
        const card = document.createElement("div");
        card.className = "entry-card";

        const title = document.createElement("h3");
        title.textContent = entry.title;

        const date = document.createElement("p");
        date.textContent = "Date: " + entry.entry_date;

        const preview = document.createElement("p");
        const content = entry.content || "";
        preview.textContent = content.length > 100
            ? content.slice(0, 100) + "..."
            : content;

        // Display the saved picture on the diary card.
        if (entry.picture_path) {
            const pictureURL =
                await getDiaryPictureURL(entry.picture_path);

            if (pictureURL) {
                const picture = document.createElement("img");
                picture.src = pictureURL;
                picture.alt = "Diary memory";
                picture.loading = "lazy";
                card.appendChild(title);
                card.appendChild(date);
                card.appendChild(preview);
                card.appendChild(picture);
            } else {
                card.append(title, date, preview);
            }
        } else {
            card.append(title, date, preview);
        }

        const readButton = document.createElement("button");
        readButton.textContent = "Read 🤎";

        readButton.addEventListener("click", async function () {
            readingEntry = entry;

            readEntryTitle.textContent = entry.title;
            readEntryDate.textContent = entry.entry_date;
            readEntryText.textContent = entry.content || "";

            if (readEntryPicture) {
                readEntryPicture.removeAttribute("src");
                readEntryPicture.style.display = "none";

                if (entry.picture_path) {
                    const pictureURL =
                        await getDiaryPictureURL(entry.picture_path);

                    if (pictureURL) {
                        readEntryPicture.src = pictureURL;
                        readEntryPicture.style.display = "block";
                    }
                }
            }

            showPage(readEntryPage);
        });

        const editButton = document.createElement("button");
        editButton.textContent = "Edit ✏️";

        editButton.addEventListener("click", async function () {
            editingEntry = entry;
            selectedPictureFile = null;

            entryTitle.value = entry.title;
            entryDate.value = entry.entry_date;
            entryContent.value = entry.content || "";

            if (entryPicture) entryPicture.value = "";
            showPicturePreview(null);

            if (entry.picture_path) {
                const pictureURL =
                    await getDiaryPictureURL(entry.picture_path);

                if (pictureURL && picturePreview) {
                    picturePreview.src = pictureURL;
                    picturePreview.style.display = "block";
                }
            }

            showPage(newEntryPage);
        });

        const deleteButton = document.createElement("button");
        deleteButton.textContent = "Delete 🗑️";

        deleteButton.addEventListener("click", async function () {
            if (!confirm("Are you sure you want to delete this entry?")) {
                return;
            }

            const user = await getLoggedInUser();
            if (!user) return;

            const { error } = await supabaseClient
                .from("diary_entries")
                .delete()
                .eq("id", entry.id)
                .eq("user_id", user.id);

            if (error) {
                console.error("Delete error:", error);
                alert("Could not delete entry: " + error.message);
                return;
            }

            // Remove its stored picture after the entry is deleted.
            if (entry.picture_path) {
                const { error: storageError } = await supabaseClient.storage
                    .from("diary-pictures")
                    .remove([entry.picture_path]);

                if (storageError) {
                    console.error("Picture cleanup error:", storageError);
                }
            }

            alert("Entry deleted 🤎");
            await loadThemeEntries();
        });

        card.append(readButton, editButton, deleteButton);
        entriesContainer.appendChild(card);
    }
}


/* =========================================
   17. SEARCH BY TITLE OR DATE
========================================= */

if (searchEntry) {
    searchEntry.addEventListener("input", function () {
        const query = searchEntry.value.trim().toLowerCase();

        const filteredEntries = allEntries.filter(function (entry) {
            return (
                (entry.title || "").toLowerCase().includes(query) ||
                (entry.entry_date || "").includes(query)
            );
        });

        renderEntries(filteredEntries);
    });
}


/* =========================================
   18. BACK BUTTONS AND EDIT FROM READ PAGE
========================================= */

if (backHomeBtn) {
    backHomeBtn.addEventListener("click", async function () {
        editingEntry = null;
        showPage(diaryHome);
        await loadThemeEntries();
    });
}

if (backFromEntryBtn) {
    backFromEntryBtn.addEventListener("click", async function () {
        readingEntry = null;
        showPage(diaryHome);
        await loadThemeEntries();
    });
}

if (editEntryBtn) {
    editEntryBtn.addEventListener("click", async function () {
        if (!readingEntry) return;

        editingEntry = readingEntry;
        selectedPictureFile = null;

        entryTitle.value = readingEntry.title;
        entryDate.value = readingEntry.entry_date;
        entryContent.value = readingEntry.content || "";

        if (entryPicture) entryPicture.value = "";
        showPicturePreview(null);

        if (readingEntry.picture_path) {
            const pictureURL =
                await getDiaryPictureURL(readingEntry.picture_path);

            if (pictureURL && picturePreview) {
                picturePreview.src = pictureURL;
                picturePreview.style.display = "block";
            }
        }

        showPage(newEntryPage);
    });
}


/* =========================================
   19. LOGOUT
========================================= */

if (logoutBtn) {
    logoutBtn.addEventListener("click", async function () {
        logoutBtn.disabled = true;

        try {
            const { error } = await supabaseClient.auth.signOut();

            if (error) {
                alert("Logout failed: " + error.message);
                return;
            }

            editingEntry = null;
            readingEntry = null;
            allEntries = [];

            if (loginPassword) loginPassword.value = "";
            if (loginEmail) loginEmail.value = "";

            alert("You have logged out safely 🤎");
            showPage(welcomePage);
        } catch (error) {
            console.error("Logout error:", error);
            alert("Could not log out. Please try again.");
        } finally {
            logoutBtn.disabled = false;
        }
    });
}





/* =========================================
   20. RESTORE SESSION
========================================= */

(async function restoreSession() {
    try {
        const hashParams = new URLSearchParams(
            window.location.hash.substring(1)
        );

        const queryParams = new URLSearchParams(
            window.location.search
        );

        const isRecoveryLink =
            hashParams.get("type") === "recovery" ||
            queryParams.get("type") === "recovery" ||
            queryParams.has("code");

        if (isRecoveryLink) {
            showPage(resetPasswordPage);
            return;
        }

        const { data: sessionData, error: sessionError } =
            await supabaseClient.auth.getSession();

        if (sessionError || !sessionData.session) {
            showPage(welcomePage);
            return;
        }

        // Verify that the saved session still belongs to
        // a user who can be authenticated by Supabase.
        const { data: userData, error: userError } =
            await supabaseClient.auth.getUser();

        if (userError || !userData.user) {
            await supabaseClient.auth.signOut();
            showPage(welcomePage);
            return;
        }

        await loadWelcomeDetails(userData.user);
        showPage(themePage);

    } catch (error) {
        console.error("Session restore error:", error);
        showPage(welcomePage);
    }
})();
