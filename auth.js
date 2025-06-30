document.addEventListener('DOMContentLoaded', function() {
    // Check auth state
    auth.onAuthStateChanged(user => {
        const authSection = document.getElementById('authSection');
        const userSection = document.getElementById('userSection');
        
        if (user) {
            // User is signed in
            if (authSection) authSection.style.display = 'none';
            if (userSection) userSection.style.display = 'flex';
            
            // Update profile link
            const profileLink = document.getElementById('profileLink');
            if (profileLink) {
                profileLink.innerHTML = `
                    <img src="${user.photoURL || 'images/default-avatar.png'}" 
                         alt="${user.displayName || 'User'}" 
                         class="avatar">
                    ${user.displayName || 'Profile'}
                `;
            }
        } else {
            // No user signed in
            if (authSection) authSection.style.display = 'flex';
            if (userSection) userSection.style.display = 'none';
        }
    });

    // Logout functionality
    const logoutBtn = document.getElementById('logoutBtn');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', () => {
            auth.signOut().then(() => {
                showNotification('Logged out successfully', 'success');
                setTimeout(() => window.location.href = 'index.html', 1000);
            });
        });
    }

    // Login form
    const loginForm = document.getElementById('loginForm');
    if (loginForm) {
        loginForm.addEventListener('submit', e => {
            e.preventDefault();
            const email = loginForm['email'].value;
            const password = loginForm['password'].value;
            
            auth.signInWithEmailAndPassword(email, password)
                .then(() => {
                    showNotification('Login successful!', 'success');
                    setTimeout(() => window.location.href = 'rooms.html', 1000);
                })
                .catch(err => {
                    showNotification(err.message, 'error');
                });
        });
    }

    // Register form
    const registerForm = document.getElementById('registerForm');
    if (registerForm) {
        registerForm.addEventListener('submit', e => {
            e.preventDefault();
            const email = registerForm['email'].value;
            const password = registerForm['password'].value;
            
            auth.createUserWithEmailAndPassword(email, password)
                .then(() => {
                    showNotification('Account created!', 'success');
                    setTimeout(() => window.location.href = 'profile.html', 1000);
                })
                .catch(err => {
                    showNotification(err.message, 'error');
                });
        });
    }

    // Google login
    const googleLoginBtn = document.getElementById('googleLogin');
    if (googleLoginBtn) {
        googleLoginBtn.addEventListener('click', () => {
            auth.signInWithPopup(googleProvider)
                .then(() => {
                    showNotification('Google login successful!', 'success');
                    setTimeout(() => window.location.href = 'rooms.html', 1000);
                })
                .catch(err => {
                    showNotification(err.message, 'error');
                });
        });
    }
});