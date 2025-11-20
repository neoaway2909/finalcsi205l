import React, { useState } from 'react';
import ChatRoomList from "../../components/chat/ChatRoomList";
import ChatRoom from "../../components/chat/ChatRoom";
import { db } from "../../firebase";
import useAuth from "../../hooks/useAuth";
import "./ChatPage.css";

export const ChatPage = ({ lang }) => {
  const [selectedRoom, setSelectedRoom] = useState(null);
  const { userProfile } = useAuth();

  const handleSelectRoom = (room) => {
    setSelectedRoom(room);
  };

  const handleBackToList = () => {
    setSelectedRoom(null);
  };

  return (
    <div className="chat-page">
      <div className="chat-container">
        {/* Chat List - Always visible on desktop */}
        <div className={`chat-list-panel ${selectedRoom ? 'has-selection' : ''}`}>
          <ChatRoomList
            db={db}
            currentUser={userProfile}
            onSelectRoom={handleSelectRoom}
            selectedRoomId={selectedRoom?.roomId}
          />
        </div>

        {/* Chat Room - Shows selected conversation */}
        <div className="chat-room-panel">
          {selectedRoom ? (
            <ChatRoom
              db={db}
              patientId={selectedRoom.patientId}
              doctorId={selectedRoom.doctorId}
              currentUser={userProfile}
              otherUser={selectedRoom.otherUser}
              onBack={handleBackToList}
            />
          ) : (
            <div className="chat-empty-state">
              <div className="empty-state-content">
                <svg
                  width="120"
                  height="120"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  style={{ color: 'hsl(var(--muted-foreground))' }}
                >
                  <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
                </svg>
                <h3>{lang === 'th' ? 'เลือกแชทเพื่อเริ่มการสนทนา' : 'Select a chat to start conversation'}</h3>
                <p>{lang === 'th' ? 'เลือกการสนทนาจากรายการด้านซ้าย' : 'Choose a conversation from the list'}</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
