import React, { useState, useCallback } from 'react';
import { FaUser, FaCheck, FaCalendarAlt as FaCalendarIcon, FaPlusCircle } from "react-icons/fa";
import { ChatRoomList, ChatRoom } from "../components/ChatComponents";
import AddressDropdowns from '../components/AddressDropdowns';
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

export const ProfilePage = ({ lang, profileData, setProfileData, isDirty, setIsDirty, handleSaveAll, userRole }) => {
  const [newMedicalHistoryItem, setNewMedicalHistoryItem] = useState('');

  const handleAddItem = () => {
    if (newMedicalHistoryItem.trim() === '') return;
    const currentHistory = profileData.medicalHistory ? profileData.medicalHistory.split(',') : [];
    const updatedHistory = [...currentHistory, newMedicalHistoryItem.trim()];
    setProfileData(prev => ({ ...prev, medicalHistory: updatedHistory.join(',') }));
    setNewMedicalHistoryItem('');
    setIsDirty(true);
  };

  const handleRemoveItem = (itemToRemove) => {
    const currentHistory = profileData.medicalHistory.split(',');
    const updatedHistory = currentHistory.filter(item => item !== itemToRemove);
    setProfileData(prev => ({ ...prev, medicalHistory: updatedHistory.join(',') }));
    setIsDirty(true);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setProfileData(prev => ({ ...prev, [name]: value }));
    setIsDirty(true);
  };

  const autoGrow = (e) => {
    e.target.style.height = 'auto';
    e.target.style.height = (e.target.scrollHeight) + 'px';
  };

  const onSave = () => {
    handleSaveAll(profileData);
  };

    const handleAddressChange = useCallback((address) => {
      setProfileData(prev => ({ ...prev, ...address }));
      setIsDirty(true);
    }, [setProfileData, setIsDirty]);
  
    const medicalHistoryItems = profileData.medicalHistory?.split(',').map(item => item.trim()).filter(item => item);
   
    const handleDateInput = (e) => {    let value = e.target.value.replace(/[^0-9/]/g, '');
    if (value.length > 10) value = value.substring(0, 10);
    if (e.nativeEvent.inputType !== 'deleteContentBackward') {
      if (value.length === 2 || value.length === 5) { value += '/'; }
    }
    value = value.replace(/[/]{2,}/g, '/');
    setProfileData(prev => ({ ...prev, dob: value }));
    setIsDirty(true);
  };

  return (
    <div className="flex flex-col gap-5 relative">
      {isDirty && (
        <button
          className="fixed bottom-10 right-10 bg-[#4CAF50] text-white border-none rounded-full w-14 h-14 flex items-center justify-center cursor-pointer z-50"
          style={{ boxShadow: '0 4px 12px rgba(0,0,0,0.3)' }}
          onClick={onSave}
        >
          <FaCheck size={24} />
        </button>
      )}
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
            {userRole === 'doctor' && (
              <textarea
                rows="1"
                name="specialty"
                className="w-full border-none bg-transparent resize-none overflow-hidden p-[5px] font-inherit text-base text-[#666]"
                placeholder={translations[lang].specialty}
                value={profileData.specialty}
                onChange={handleChange}
                onInput={autoGrow}
              />
            )}
            <select
              name="gender"
              className="w-full border-none bg-transparent p-[5px] font-inherit text-sm text-[#888] appearance-none"
              value={profileData.gender || ''}
              onChange={handleChange}
              style={{
                background: `url('data:image/svg+xml;charset=US-ASCII,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%22292.4%22%20height%3D%22292.4%22%3E%3Cpath%20fill%3D%22%23000000%22%20d%3D%22M287%20164.7c-4.7%204.7-12.3%204.7-17%200L146.2%2041.1c-4.7-4.7-12.3-4.7-17%200L5.3%20164.7c-4.7%204.7-4.7%2012.3%200%2017l17%2017c4.7%204.7%2012.3%204.7%2017%200l106-106.1L253%20198.7c4.7%204.7%2012.3%204.7%2017%200l17-17c4.7-4.7%204.7-12.3%200-17z%22%2F%3E%3C%2Fsvg%3E') no-repeat right 5px center`,
                backgroundSize: '12px',
                paddingRight: '25px', // Make space for the arrow
                borderBottom: '1px solid #eee', // subtle line
              }}
            >
              <option value="" disabled>{translations[lang].selectGender || 'Select Gender'}</option>
              <option value="Male">{translations[lang].male || 'Male'}</option>
              <option value="Female">{translations[lang].female || 'Female'}</option>
              <option value="Other">{translations[lang].other || 'Other'}</option>
              <option value="Prefer not to say">{translations[lang].preferNotToSay || 'Prefer not to say'}</option>
            </select>
            <textarea
              rows="1"
              name="phone"
              className="w-full border-none bg-transparent resize-none overflow-hidden p-[5px] font-inherit text-sm text-[#888]"
              placeholder={translations[lang].phone || 'Phone Number'}
              value={profileData.phone}
              onChange={handleChange}
              onInput={autoGrow}
            />
          </div>
        </div>
      </div>

      {/* Date of Birth Section */}
      {userRole === 'patient' && (
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
        </div>
      )}

      {/* Address Section */}
      {userRole === 'patient' && (
        <div className="bg-white p-5 rounded-[10px] relative" style={{ boxShadow: '0 2px 10px rgba(0,0,0,0.05)' }}>
          <h3 className="text-xl font-bold mt-0 mb-5">{translations[lang].address || 'Address'}</h3>
          <AddressDropdowns
            lang={lang}
            onAddressChange={handleAddressChange}
            initialAddress={{
              province: profileData.province,
              district: profileData.district,
              subDistrict: profileData.subDistrict,
            }}
          />
        </div>
      )}

      {/* Medical History Section */}
      {userRole === 'patient' && (
        <div className="bg-white p-5 rounded-[10px] relative" style={{ boxShadow: '0 2px 10px rgba(0,0,0,0.05)' }}>
          <h3 className="text-xl font-bold mt-0 mb-5">{translations[lang].medicalHistory}</h3>
          <div>
            {medicalHistoryItems && medicalHistoryItems.length > 0 ? (
              <ul className="list-disc pl-5 text-[#555] mb-4">
                {medicalHistoryItems.map((item, index) => (
                  <li key={index} className="flex justify-between items-center mb-2">
                    <span>{item}</span>
                    <button
                      onClick={() => handleRemoveItem(item)}
                      className="text-red-500 hover:text-red-700 font-bold"
                    >
                      &times;
                    </button>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-[#555] leading-relaxed whitespace-pre-wrap mb-4">{translations[lang].medicalHistoryPlaceholder}</p>
            )}
            <div className="flex gap-2">
              <input
                type="text"
                value={newMedicalHistoryItem}
                onChange={(e) => setNewMedicalHistoryItem(e.target.value)}
                placeholder={translations[lang].addMedicalHistory || "Add new item"}
                className="w-full border border-[#ddd] rounded-[5px] p-[10px_15px] text-base"
              />
              <button
                onClick={handleAddItem}
                className="bg-[#668ee0] text-white border-none rounded-[5px] px-4 py-2 cursor-pointer"
              >
                {translations[lang].add || "Add"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
