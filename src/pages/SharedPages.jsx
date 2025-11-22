import React, { useState } from 'react';
import { FaUser, FaCalendarAlt as FaCalendarIcon, FaCheck, FaPlusCircle } from "react-icons/fa";
import { ChatRoomList, ChatRoom } from "../components/ChatComponents";
import { db } from "../firebase";
import useAuth from "../hooks/useAuth";
import { translations } from "../constants/translations";

// ==================== ChatPage ====================

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
    <div className="flex flex-col h-full w-full overflow-hidden">
      <div className="flex-1 flex overflow-hidden min-h-0" style={{ background: 'var(--md-surface)' }}>
        {/* Chat List - Always visible on desktop */}
        <div
          className={`flex-none w-[380px] flex flex-col overflow-hidden border-r bg-[var(--md-surface)] ${selectedRoom ? 'max-md:hidden' : ''}`}
          style={{ borderColor: 'var(--md-outline-variant)' }}
        >
          <ChatRoomList
            db={db}
            currentUser={userProfile}
            onSelectRoom={handleSelectRoom}
            selectedRoomId={selectedRoom?.roomId}
          />
        </div>

        {/* Chat Room - Shows selected conversation */}
        <div className="flex-1 flex flex-col overflow-hidden min-w-0 max-md:absolute max-md:inset-0 max-md:z-10 max-md:[&:not(:has(.chat-room))]:hidden">
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
            <div className="flex-1 flex items-center justify-center" style={{ background: 'hsl(var(--muted) / 0.1)' }}>
              <div className="text-center max-w-[320px] p-8">
                <svg
                  width="120"
                  height="120"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="mx-auto mb-6 opacity-30"
                  style={{ color: 'hsl(var(--muted-foreground))' }}
                >
                  <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
                </svg>
                <h3 className="m-0 mb-2 text-lg font-semibold" style={{ color: 'hsl(var(--foreground))' }}>
                  {lang === 'th' ? 'เลือกแชทเพื่อเริ่มการสนทนา' : 'Select a chat to start conversation'}
                </h3>
                <p className="m-0 text-sm" style={{ color: 'hsl(var(--muted-foreground))' }}>
                  {lang === 'th' ? 'เลือกการสนทนาจากรายการด้านซ้าย' : 'Choose a conversation from the list'}
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

// ==================== ProfilePage ====================

export const ProfilePage = ({ lang, profileData, setProfileData, isDirty, setIsDirty, handleSaveAll }) => {
  const [isEditingHistory, setIsEditingHistory] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setProfileData(prev => ({ ...prev, [name]: value }));
    setIsDirty(true);
  };

  const autoGrow = (e) => {
    e.target.style.height = 'auto';
    e.target.style.height = (e.target.scrollHeight) + 'px';
  };

  const handleDateInput = (e) => {
    let value = e.target.value.replace(/[^0-9/]/g, '');
    if (value.length > 10) value = value.substring(0, 10);
    if (e.nativeEvent.inputType !== 'deleteContentBackward') {
      if (value.length === 2 || value.length === 5) { value += '/'; }
    }
    value = value.replace(/[/]{2,}/g, '/');
    setProfileData(prev => ({ ...prev, dob: value }));
    setIsDirty(true);
  };

  const handleMedicalHistorySave = () => {
    setIsEditingHistory(false);
    setIsDirty(true);
  };

  const onSave = () => {
    handleSaveAll(profileData);
  };

  const medicalHistoryItems = profileData.medicalHistory?.split(',').map(item => item.trim()).filter(item => item);

  return (
    <div className="flex flex-col gap-5">
      {/* Personal Information Section */}
      <div className="bg-white p-5 rounded-[10px] relative" style={{ boxShadow: '0 2px 10px rgba(0,0,0,0.05)' }}>
        <h3 className="text-xl font-bold mt-0 mb-5">{translations[lang].personalInformation}</h3>
        <div className="flex items-start">
          <div className="w-[60px] h-[60px] rounded-full bg-[#f0f4ff] flex items-center justify-center mr-5">
            <FaUser size={40} color="#9BB8DD" />
          </div>
          <div className="flex-grow">
            <textarea
              rows="1"
              name="name"
              className="w-full border-none bg-transparent resize-none overflow-hidden p-[5px] font-inherit text-2xl font-bold"
              placeholder={translations[lang].firstNameLastName}
              value={profileData.name}
              onChange={handleChange}
              onInput={autoGrow}
            />
            <textarea
              rows="1"
              name="specialty"
              className="w-full border-none bg-transparent resize-none overflow-hidden p-[5px] font-inherit text-base text-[#666]"
              placeholder={translations[lang].specialty}
              value={profileData.specialty}
              onChange={handleChange}
              onInput={autoGrow}
            />
            <textarea
              rows="1"
              name="data"
              className="w-full border-none bg-transparent resize-none overflow-hidden p-[5px] font-inherit text-sm text-[#888]"
              placeholder={translations[lang].data}
              value={profileData.data}
              onChange={handleChange}
              onInput={autoGrow}
            />
          </div>
        </div>
        {isDirty && (
          <button
            className="absolute top-5 right-5 bg-[#4CAF50] text-white border-none rounded-full w-10 h-10 flex items-center justify-center cursor-pointer"
            style={{ boxShadow: '0 2px 5px rgba(0,0,0,0.2)' }}
            onClick={onSave}
          >
            <FaCheck size={20} />
          </button>
        )}
      </div>

      {/* Date of Birth Section */}
      <div className="bg-white p-5 rounded-[10px] relative" style={{ boxShadow: '0 2px 10px rgba(0,0,0,0.05)' }}>
        <h3 className="text-xl font-bold mt-0 mb-5">{translations[lang].placeholder}</h3>
        <div className="relative">
          <input
            type="text"
            name="dob"
            placeholder={translations[lang].dayMonthYear}
            className="w-full border border-[#ddd] rounded-[5px] p-[10px_15px] text-base"
            value={profileData.dob}
            onInput={handleDateInput}
            maxLength="10"
          />
          <FaCalendarIcon
            className="absolute right-[15px] top-1/2 -translate-y-1/2"
            size={20}
            color="#9BB8DD"
          />
        </div>
        {isDirty && (
          <button
            className="absolute top-5 right-5 bg-[#4CAF50] text-white border-none rounded-full w-10 h-10 flex items-center justify-center cursor-pointer"
            style={{ boxShadow: '0 2px 5px rgba(0,0,0,0.2)' }}
            onClick={onSave}
          >
            <FaCheck size={20} />
          </button>
        )}
      </div>

      {/* Medical History Section */}
      <div className="bg-white p-5 rounded-[10px] relative" style={{ boxShadow: '0 2px 10px rgba(0,0,0,0.05)' }}>
        <h3 className="text-xl font-bold mt-0 mb-5">{translations[lang].medicalHistory}</h3>
        <div className="flex justify-between items-start">
          {isEditingHistory ? (
            <textarea
              name="medicalHistory"
              className="w-full border-none bg-transparent resize-none overflow-hidden p-[5px] font-inherit"
              placeholder={translations[lang].medicalHistoryPlaceholder}
              value={profileData.medicalHistory}
              onChange={handleChange}
              onInput={autoGrow}
              autoFocus
            />
          ) : (
            medicalHistoryItems && medicalHistoryItems.length > 0 ? (
              <ul className="list-disc pl-5 text-[#555]">
                {medicalHistoryItems.map((item, index) => (
                  <li key={index}>{item}</li>
                ))}
              </ul>
            ) : (
              <p className="text-[#555] leading-relaxed whitespace-pre-wrap">{translations[lang].medicalHistoryPlaceholder}</p>
            )
          )}
          <button
            className="bg-none border-none cursor-pointer p-0 ml-5"
            onClick={() => isEditingHistory ? handleMedicalHistorySave() : setIsEditingHistory(true)}
          >
            {isEditingHistory ? (<FaCheck size={28} color="#28a745" />) : (<FaPlusCircle size={28} color="#668ee0" />)}
          </button>
        </div>
        {isDirty && (
          <button
            className="absolute top-5 right-5 bg-[#4CAF50] text-white border-none rounded-full w-10 h-10 flex items-center justify-center cursor-pointer"
            style={{ boxShadow: '0 2px 5px rgba(0,0,0,0.2)' }}
            onClick={onSave}
          >
            <FaCheck size={20} />
          </button>
        )}
      </div>
    </div>
  );
};
