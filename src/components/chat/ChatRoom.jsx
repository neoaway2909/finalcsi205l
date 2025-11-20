import React, { useState, useEffect, useRef } from 'react';
import { FaUser, FaPaperPlane, FaArrowLeft } from 'react-icons/fa';
import { collection, query, where, onSnapshot, addDoc } from 'firebase/firestore';
import './ChatRoom.css';

const ChatRoom = ({ db, patientId, doctorId, currentUser, otherUser, onBack }) => {
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [sending, setSending] = useState(false);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    if (!db || !patientId || !doctorId) return;

    const messagesCol = collection(db, "messages");
    const q = query(
      messagesCol,
      where("patientId", "==", patientId),
      where("doctorId", "==", doctorId)
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const msgs = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));

      // Sort by timestamp manually (ascending - oldest first)
      msgs.sort((a, b) => {
        if (!a.timestamp) return 1;
        if (!b.timestamp) return -1;

        // Handle both Firestore Timestamp and plain Date objects
        const aTime = a.timestamp.seconds || a.timestamp.getTime() / 1000;
        const bTime = b.timestamp.seconds || b.timestamp.getTime() / 1000;

        return aTime - bTime;
      });

      setMessages(msgs);
    });

    return () => unsubscribe();
  }, [db, patientId, doctorId]);

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!newMessage.trim() || sending) return;

    setSending(true);
    const messageText = newMessage.trim();
    setNewMessage('');

    try {
      // Use Firestore Timestamp instead of serverTimestamp
      const now = new Date();

      await addDoc(collection(db, "messages"), {
        patientId,
        doctorId,
        senderId: currentUser.uid,
        senderName: currentUser.displayName || currentUser.email,
        text: messageText,
        timestamp: now,
        read: false
      });
    } catch (error) {
      console.error("Error sending message:", error);
      alert("Failed to send message. Please try again.");
      setNewMessage(messageText); // Restore message on error
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="chat-room">
      <div className="chat-room-header">
        <button className="back-button mobile-only" onClick={onBack}>
          <FaArrowLeft size={20} />
        </button>
        <div className="chat-room-avatar">
          <FaUser size={24} color="#c0d1f0" />
        </div>
        <div className="chat-room-info">
          <h3>{otherUser.name}</h3>
          <span className="user-role">{otherUser.role}</span>
        </div>
      </div>

      <div className="messages-container">
        {messages.length === 0 ? (
          <div className="no-messages">
            <p>No messages yet. Start the conversation!</p>
          </div>
        ) : (
          messages.map((message) => (
            <div
              key={message.id}
              className={`message ${message.senderId === currentUser.uid ? 'sent' : 'received'}`}
            >
              <div className="message-bubble">
                <p>{message.text}</p>
                <span className="message-time">
                  {message.timestamp
                    ? (() => {
                        const time = message.timestamp.seconds
                          ? new Date(message.timestamp.seconds * 1000)
                          : message.timestamp;
                        return time.toLocaleTimeString('en-US', {
                          hour: '2-digit',
                          minute: '2-digit'
                        });
                      })()
                    : 'Sending...'}
                </span>
              </div>
            </div>
          ))
        )}
        <div ref={messagesEndRef} />
      </div>

      <form className="message-input-container" onSubmit={handleSendMessage}>
        <input
          type="text"
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          placeholder="Type a message..."
          disabled={sending}
          className="message-input"
        />
        <button
          type="submit"
          disabled={!newMessage.trim() || sending}
          className="send-button"
        >
          <FaPaperPlane size={18} />
        </button>
      </form>
    </div>
  );
};

export default ChatRoom;
