import React, { useState, useEffect } from 'react';
import { FaUser, FaCircle } from 'react-icons/fa';
import { collection, query, where, onSnapshot, doc, getDoc } from 'firebase/firestore';
import './ChatRoomList.css';

const ChatRoomList = ({ db, currentUser, onSelectRoom, selectedRoomId }) => {
  const [chatRooms, setChatRooms] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!db || !currentUser) return;

    // Listen to messages where this user is involved
    const messagesCol = collection(db, "messages");
    const q = currentUser.role === 'patient'
      ? query(messagesCol, where("patientId", "==", currentUser.uid))
      : query(messagesCol, where("doctorId", "==", currentUser.uid));

    const unsubscribe = onSnapshot(q, async (snapshot) => {
      const messagesByUser = {};

      // Group messages by the other user
      snapshot.docs.forEach(doc => {
        const msg = doc.data();
        const otherUserId = currentUser.role === 'patient' ? msg.doctorId : msg.patientId;

        if (!messagesByUser[otherUserId]) {
          messagesByUser[otherUserId] = [];
        }
        messagesByUser[otherUserId].push(msg);
      });

      // Build rooms
      const rooms = [];
      for (const otherUserId in messagesByUser) {
        // Fetch other user's data
        const userDocRef = doc(db, "users", otherUserId);
        const userDocSnap = await getDoc(userDocRef);
        const otherUser = userDocSnap.exists() ? userDocSnap.data() : null;

        if (otherUser) {
          // Get last message
          const messages = messagesByUser[otherUserId];
          const sortedMessages = messages.sort((a, b) => {
            if (!a.timestamp) return 1;
            if (!b.timestamp) return -1;
            return b.timestamp.seconds - a.timestamp.seconds;
          });
          const lastMessage = sortedMessages[0];

          rooms.push({
            roomId: `${currentUser.uid}_${otherUserId}`,
            patientId: currentUser.role === 'patient' ? currentUser.uid : otherUserId,
            doctorId: currentUser.role === 'patient' ? otherUserId : currentUser.uid,
            otherUser: {
              uid: otherUserId,
              name: otherUser.displayName || otherUser.email,
              role: otherUser.role
            },
            lastMessage: lastMessage?.text || 'No messages yet',
            lastMessageTime: lastMessage?.timestamp
          });
        }
      }

      // Sort by last message time
      rooms.sort((a, b) => {
        if (!a.lastMessageTime) return 1;
        if (!b.lastMessageTime) return -1;
        return b.lastMessageTime.seconds - a.lastMessageTime.seconds;
      });

      setChatRooms(rooms);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [db, currentUser]);

  if (loading) {
    return <div className="chat-loading">Loading conversations...</div>;
  }

  if (chatRooms.length === 0) {
    return (
      <div className="chat-empty">
        <p>No conversations yet.</p>
        <p>Book an appointment to start chatting with a {currentUser.role === 'patient' ? 'doctor' : 'patient'}.</p>
      </div>
    );
  }

  return (
    <div className="chat-room-list">
      {chatRooms.map((room) => (
        <div
          key={room.roomId}
          className={`chat-room-item ${selectedRoomId === room.roomId ? 'active' : ''}`}
          onClick={() => onSelectRoom(room)}
        >
          <div className="chat-avatar">
            <FaUser size={24} color="#c0d1f0" />
            <FaCircle className="online-indicator" size={10} />
          </div>
          <div className="chat-info">
            <div className="chat-header">
              <h4>{room.otherUser.name}</h4>
              <span className="chat-time">
                {room.lastMessageTime
                  ? new Date(room.lastMessageTime.seconds * 1000).toLocaleTimeString('en-US', {
                      hour: '2-digit',
                      minute: '2-digit'
                    })
                  : ''}
              </span>
            </div>
            <p className="chat-preview">{room.lastMessage}</p>
          </div>
        </div>
      ))}
    </div>
  );
};

export default ChatRoomList;
