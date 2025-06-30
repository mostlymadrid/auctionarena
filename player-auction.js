document.addEventListener('DOMContentLoaded', function() {
    // Get room ID from URL
    const urlParams = new URLSearchParams(window.location.search);
    const roomId = urlParams.get('id');
    
    if (!roomId) {
        window.location.href = 'rooms.html';
        return;
    }

    // DOM elements
    const roomNameEl = document.getElementById('roomName');
    const roomBudgetEl = document.getElementById('roomBudget');
    const playerCountEl = document.getElementById('playerCount');
    const currentPlayerEl = document.getElementById('currentPlayer');
    const playerImageEl = document.getElementById('playerImage');
    const playerNameEl = document.getElementById('playerName');
    const playerRatingEl = document.getElementById('playerRating');
    const playerPositionEl = document.getElementById('playerPosition');
    const playerNationalityEl = document.getElementById('playerNationality');
    const currentBidEl = document.getElementById('currentBid');
    const bidLeaderEl = document.getElementById('bidLeader');
    const bidAmountEl = document.getElementById('bidAmount');
    const placeBidBtn = document.getElementById('placeBid');
    const roomUsersEl = document.getElementById('roomUsers');
    const chatMessagesEl = document.getElementById('chatMessages');
    const chatInputEl = document.getElementById('chatInput');
    const sendMessageBtn = document.getElementById('sendMessage');

    // Firebase references
    const roomRef = db.collection('rooms').doc(roomId);
    const chatRef = db.collection('rooms').doc(roomId).collection('chat').orderBy('timestamp');

    // Load room data
    roomRef.onSnapshot(doc => {
        if (!doc.exists) {
            showNotification('Room not found', 'error');
            setTimeout(() => window.location.href = 'rooms.html', 2000);
            return;
        }

        const room = doc.data();
        roomNameEl.textContent = room.name;
        roomBudgetEl.textContent = `Budget: €${room.budget?.toLocaleString() || 0}`;
        playerCountEl.textContent = `Players: ${room.playersCount || 0}/10`;

        // Update current player
        if (room.currentPlayer) {
            // In a real app, you would fetch player data from your database
            playerNameEl.textContent = room.currentPlayer.name || "Player Name";
            playerImageEl.src = room.currentPlayer.image || "images/player-placeholder.png";
            playerRatingEl.textContent = room.currentPlayer.rating || "85";
            playerPositionEl.textContent = room.currentPlayer.position || "Forward";
            playerNationalityEl.textContent = room.currentPlayer.nationality || "International";
        }

        // Update current bid
        if (room.currentBid) {
            currentBidEl.textContent = `€${room.currentBid.toLocaleString()}`;
            bidLeaderEl.textContent = `Leading: ${room.currentLeaderName || "User"}`;
        }
    });

    // Load room users
    roomRef.collection('users').onSnapshot(snapshot => {
        roomUsersEl.innerHTML = '';
        snapshot.forEach(doc => {
            const user = doc.data();
            const userEl = document.createElement('div');
            userEl.className = 'user-item';
            userEl.innerHTML = `
                <img src="${user.photoURL || 'images/default-avatar.png'}" alt="${user.displayName}">
                <span>${user.displayName}</span>
                <span class="user-budget">€${user.budget?.toLocaleString() || 0}</span>
            `;
            roomUsersEl.appendChild(userEl);
        });
    });

    // Load chat messages
    chatRef.onSnapshot(snapshot => {
        chatMessagesEl.innerHTML = '';
        snapshot.forEach(doc => {
            const message = doc.data();
            const messageEl = document.createElement('div');
            messageEl.className = 'chat-message';
            messageEl.innerHTML = `
                <img src="${message.userPhoto || 'images/default-avatar.png'}" alt="${message.userName}">
                <div class="message-content">
                    <span class="message-user">${message.userName}</span>
                    <span class="message-text">${message.text}</span>
                </div>
            `;
            chatMessagesEl.appendChild(messageEl);
        });
        chatMessagesEl.scrollTop = chatMessagesEl.scrollHeight;
    });

    // Place bid
    placeBidBtn.addEventListener('click', () => {
        const bidAmount = parseInt(bidAmountEl.value);
        if (!bidAmount || isNaN(bidAmount)) {
            showNotification('Please enter a valid bid amount', 'error');
            return;
        }

        auth.onAuthStateChanged(user => {
            if (user) {
                roomRef.get().then(doc => {
                    const room = doc.data();
                    if (bidAmount <= room.currentBid) {
                        showNotification(`Bid must be higher than current bid (€${room.currentBid.toLocaleString()})`, 'error');
                        return;
                    }

                    // Update room with new bid
                    roomRef.update({
                        currentBid: bidAmount,
                        currentLeader: user.uid,
                        currentLeaderName: user.displayName || "Anonymous"
                    }).then(() => {
                        showNotification('Bid placed successfully!', 'success');
                        bidAmountEl.value = '';
                    });
                });
            }
        });
    });

    // Send message
    function sendMessage() {
        const messageText = chatInputEl.value.trim();
        if (!messageText) return;

        auth.onAuthStateChanged(user => {
            if (user) {
                chatRef.add({
                    text: messageText,
                    userName: user.displayName || "Anonymous",
                    userPhoto: user.photoURL || "",
                    userId: user.uid,
                    timestamp: firebase.firestore.FieldValue.serverTimestamp()
                }).then(() => {
                    chatInputEl.value = '';
                });
            }
        });
    }

    sendMessageBtn.addEventListener('click', sendMessage);
    chatInputEl.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') sendMessage();
    });
});