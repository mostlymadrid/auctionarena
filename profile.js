document.addEventListener('DOMContentChanged', function() {
    const profileAvatar = document.getElementById('profileAvatar');
    const profileName = document.getElementById('profileName');
    const profileEmail = document.getElementById('profileEmail');
    const roomsJoined = document.getElementById('roomsJoined');
    const playersWon = document.getElementById('playersWon');
    const totalBids = document.getElementById('totalBids');
    const myPlayers = document.getElementById('myPlayers');
    const activityFeed = document.getElementById('activityFeed');
    const changeAvatar = document.getElementById('changeAvatar');

    // Load user profile
    auth.onAuthStateChanged(user => {
        if (user) {
            // Basic profile info
            profileName.textContent = user.displayName || "User";
            profileEmail.textContent = user.email;
            if (user.photoURL) {
                profileAvatar.src = user.photoURL;
            }

            // Load user stats
            db.collection('users').doc(user.uid).get().then(doc => {
                if (doc.exists) {
                    const userData = doc.data();
                    roomsJoined.textContent = userData.roomsJoined || 0;
                    playersWon.textContent = userData.playersWon || 0;
                    totalBids.textContent = userData.totalBids || 0;
                }
            });

            // Load won players
            db.collection('users').doc(user.uid).collection('players').get()
                .then(snapshot => {
                    if (snapshot.empty) {
                        myPlayers.innerHTML = `
                            <div class="empty-state">
                                <i class="fas fa-search"></i>
                                <p>You haven't won any players yet</p>
                            </div>
                        `;
                        return;
                    }

                    myPlayers.innerHTML = '';
                    snapshot.forEach(doc => {
                        const player = doc.data();
                        const playerEl = document.createElement('div');
                        playerEl.className = 'player-card';
                        playerEl.innerHTML = `
                            <img src="${player.image || 'images/player-placeholder.png'}" alt="${player.name}">
                            <h3>${player.name}</h3>
                            <p>${player.position} • ${player.rating}</p>
                            <p>Won for €${player.price?.toLocaleString() || 0}</p>
                        `;
                        myPlayers.appendChild(playerEl);
                    });
                });

            // Load activity feed
            db.collection('users').doc(user.uid).collection('activity')
                .orderBy('timestamp', 'desc')
                .limit(10)
                .get()
                .then(snapshot => {
                    activityFeed.innerHTML = '';
                    snapshot.forEach(doc => {
                        const activity = doc.data();
                        const activityEl = document.createElement('div');
                        activityEl.className = 'activity-item';
                        activityEl.innerHTML = `
                            <i class="fas fa-${activity.icon || 'bell'}"></i>
                            <div class="activity-content">
                                <p>${activity.text}</p>
                                <small>${new Date(activity.timestamp?.toDate()).toLocaleString()}</small>
                            </div>
                        `;
                        activityFeed.appendChild(activityEl);
                    });
                });
        } else {
            window.location.href = 'login.html';
        }
    });

    // Change avatar
    changeAvatar.addEventListener('click', () => {
        // In a real app, you would implement image upload to Firebase Storage
        showNotification('Avatar change functionality coming soon!', 'info');
    });
});