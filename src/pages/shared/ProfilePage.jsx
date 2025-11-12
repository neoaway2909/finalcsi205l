import { useState } from "react";
import { FaUser, FaCalendarAlt as FaCalendarIcon, FaCheck, FaPlusCircle } from "react-icons/fa";
import { translations } from "../../constants/translations";

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

  return (
    <div className="profile-page-content">
      <div className="profile-section-card">
        <h3>{translations[lang].personalInformation}</h3>
        <div className="personal-info-box">
          <div className="profile-avatar-placeholder">
            <FaUser size={40} color="#9BB8DD" />
          </div>
          <div className="profile-text-info">
            <textarea rows="1" name="name" className="profile-input-name" placeholder={translations[lang].firstNameLastName} value={profileData.name} onChange={handleChange} onInput={autoGrow} />
            <textarea rows="1" name="specialty" className="profile-input-specialty" placeholder={translations[lang].specialty} value={profileData.specialty} onChange={handleChange} onInput={autoGrow} />
            <textarea rows="1" name="data" className="profile-input-data" placeholder={translations[lang].data} value={profileData.data} onChange={handleChange} onInput={autoGrow} />
          </div>
        </div>
        {isDirty && (
          <button className="profile-save-btn" onClick={onSave}>
            <FaCheck size={20} />
          </button>
        )}
      </div>
      <div className="profile-section-card">
        <h3>{translations[lang].placeholder}</h3>
        <div className="profile-date-input-container">
          <input type="text" name="dob" placeholder={translations[lang].dayMonthYear} className="profile-date-input" value={profileData.dob} onInput={handleDateInput} maxLength="10" />
          <FaCalendarIcon className="profile-date-icon" size={20} color="#9BB8DD" />
        </div>
        {isDirty && (
          <button className="profile-save-btn" onClick={onSave}>
            <FaCheck size={20} />
          </button>
        )}
      </div>
      <div className="profile-section-card">
        <h3>{translations[lang].medicalHistory}</h3>
        <div className="medical-history-box">
          {isEditingHistory ? (
            <textarea name="medicalHistory" className="profile-input-textarea" placeholder={translations[lang].medicalHistoryPlaceholder} value={profileData.medicalHistory} onChange={handleChange} onInput={autoGrow} autoFocus />
          ) : (
            <p className="medical-history-text">{profileData.medicalHistory || translations[lang].medicalHistoryPlaceholder}</p>
          )}
          <button className="add-medical-history-btn" onClick={() => isEditingHistory ? handleMedicalHistorySave() : setIsEditingHistory(true)}>
            {isEditingHistory ? (<FaCheck size={28} color="#28a745" />) : (<FaPlusCircle size={28} color="#668ee0" />)}
          </button>
        </div>
        {isDirty && (
          <button className="profile-save-btn" onClick={onSave}>
            <FaCheck size={20} />
          </button>
        )}
      </div>
    </div>
  );
};
