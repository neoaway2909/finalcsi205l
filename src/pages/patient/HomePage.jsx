import { useState } from "react";
import { DoctorCard, LoadingSkeletonCard, EmptyState, ActionButton } from "../../components/common";
import { FaUserMd } from "react-icons/fa";
import { translations } from "../../constants/translations";
import { AIChatModal } from "../../components/chat/AIChatModal";

export const HomePage = ({ userName, activeTab, setActiveTab, isLoading, doctors, BotIcon, lang, onBook }) => {
  const [isAIChatOpen, setIsAIChatOpen] = useState(false);

  // Filter doctors based on active tab
  const filteredDoctors = doctors.filter(doc => {
    if (activeTab === "instant") {
      return doc.appointmentType === "instant" || doc.appointmentType === "both";
    } else if (activeTab === "book") {
      return doc.appointmentType === "advance" || doc.appointmentType === "both";
    }
    return true;
  });

  const handleAskAI = () => {
    setIsAIChatOpen(true);
  };

  return (
  <>
    <div className="main-banner-content">
      <div className="banner-text-content">
        <h2 className="banner-text">{translations[lang].welcomeBack}, {userName}!</h2>
        <p className="banner-subtext">{translations[lang].howFeeling}</p>
      </div>
      <div className="banner-illustration-placeholder">
        <span>(Illustration)</span>
      </div>
    </div>
    <div className="action-icons-row-large">
      <ActionButton
        isImage={true}
        imageSrc={BotIcon}
        label={translations[lang].askAI}
        onClick={handleAskAI}
      />
    </div>
    <div className="tab-selector" style={{marginTop: '25px'}}>
      <span
        className={activeTab === "instant" ? "active-tab" : "inactive-tab"}
        onClick={() => setActiveTab("instant")}
      >
        {translations[lang].instantDoctor}
      </span>
      <span
        className={activeTab === "book" ? "active-tab" : "inactive-tab"}
        onClick={() => setActiveTab("book")}
      >
        {translations[lang].bookAppointment}
      </span>
    </div>
    <div className="doctor-list">
      {isLoading ? (
        <><LoadingSkeletonCard /><LoadingSkeletonCard /></>
      ) : filteredDoctors.length === 0 ? (
        <EmptyState message={translations[lang].noDoctorsFound} icon={<FaUserMd size={48} />} />
      ) : (
        filteredDoctors.map((doc) => (
          <DoctorCard
            key={doc.id}
            name={doc.name || "N/A"}
            specialty={doc.specialty || "N/A"}
            hospital={doc.hospital || "N/A"}
            cases={doc.cases || 0}
            price={doc.price || 0}
            time={doc.time || 0}
            lang={lang}
            onBook={() => onBook(doc)}
          />
        ))
      )}
    </div>

    <AIChatModal
      isOpen={isAIChatOpen}
      onClose={() => setIsAIChatOpen(false)}
      lang={lang}
    />
  </>
  );
};
