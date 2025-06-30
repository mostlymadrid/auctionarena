document.addEventListener('DOMContentLoaded', function() {
    const roomsContainer = document.getElementById('roomsContainer');
    const createRoomBtn = document.getElementById('createRoomBtn');

    // Load rooms
    function loadRooms() {
        roomsContainer.innerHTML = `
            <div class="room-card skeleton"></div>
            <div class="room-card skeleton"></div>
            <div class="room-card skeleton"></div>
        `;

        db.collection('rooms').where('status', '==', 'active')
            .orderBy('createdAt', 'desc')
            .limit(20)
            .get()
            .then(snapshot => {
                roomsContainer.innerHTML = '';
                
                if (snapshot.empty) {
                    roomsContainer.innerHTML = `
                        <div class="empty-state">
                            <i class="fas fa-door-open"></i>
                            <h3>No active rooms</h3>
                            <p>Be the first to create one!</p>
                        </div>
                    `;
                    return;
                }

                snapshot.forEach(doc => {
                    const room = doc.data();
                    const roomCard = document.createElement('div');
                    roomCard.className = 'room-card';
                    roomCard.innerHTML = `
                        <div class="room-header">
                            <h3>${room.name}</h3>
                            <span class="badge ${room.privacy === 'private' ? 'badge-warning' : 'badge-success'}">
                                ${room.privacy === 'private' ? 'Private' : 'Public'}
                            </span>
                        </div>
                        <div class="room-stats">
                            <div class="stat">
                                <i class="fas fa-users"></i>
                                <span>${room.playersCount || 0}/10</span>
                            </div>
                            <div class="stat">
                                <i class="fas fa-coins"></i>
                                <span>€${(room.budget || 0).toLocaleString()}</span>
                            </div>
                        </div>
                        <div class="room-footer">
                            <a href="room.html?id=${doc.id}" class="btn-primary">
                                <i class="fas fa-arrow-right"></i> Join
                            </a>
                        </div>
                    `;
                    roomsContainer.appendChild(roomCard);
                });
            })
            .catch(err => {
                showNotification('Error loading rooms: ' + err.message, 'error');
            });
    }

    // Create room modal
    createRoomBtn.addEventListener('click', () => {
        const modal = document.createElement('div');
        modal.className = 'modal';
        modal.innerHTML = `
            <div class="modal-content">
                <h2>Create New Room</h2>
                <form id="createRoomForm">
                    <div class="form-group">
                        <label for="roomName">Room Name</label>
                        <input type="text" id="roomName" required placeholder="e.g. Premier League Stars">
                    </div>
                    <div class="form-group">
                        <label for="roomBudget">Budget (€)</label>
                        <input type="number" id="roomBudget" value="100000000" required>
                    </div>
                    <div class="form-group">
                        <label for="roomPrivacy">Privacy</label>
                        <select id="roomPrivacy">
                            <option value="public">Public (Anyone can join)</option>
                            <option value="private">Private (Invite only)</option>
                        </select>
                    </div>
                    <div class="form-actions">
                        <button type="button" class="btn-outline" id="cancelCreate">Cancel</button>
                        <button type="submit" class="btn-primary">Create Room</button>
                    </div>
                </form>
            </div>
        `;
        document.body.appendChild(modal);

        // Handle form submission
        const form = document.getElementById('createRoomForm');
        form.addEventListener('submit', e => {
            e.preventDefault();
            const roomName = document.getElementById('roomName').value;
            const budget = parseInt(document.getElementById('roomBudget').value);
            const privacy = document.getElementById('roomPrivacy').value;

            if (!roomName || !budget) {
                showNotification('Please fill all fields', 'error');
                return;
            }

            auth.onAuthStateChanged(user => {
                if (user) {
                    db.collection('rooms').add({
                        name: roomName,
                        budget: budget,
                        privacy: privacy,
                        status: 'active',
                        playersCount: 0,
                        createdAt: firebase.firestore.FieldValue.serverTimestamp(),
                        createdBy: user.uid,
                        currentPlayer: null,
                        currentBid: 0,
                        currentLeader: null
                    })
                    .then(() => {
                        modal.remove();
                        showNotification('Room created successfully!', 'success');
                    })
                    .catch(err => {
                        showNotification('Error creating room: ' + err.message, 'error');
                    });
                }
            });
        });

        // Cancel button
        document.getElementById('cancelCreate').addEventListener('click', () => {
            modal.remove();
        });
    });

    // Initial load
    loadRooms();
});