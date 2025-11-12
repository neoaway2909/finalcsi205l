import { DoctorCard, LoadingSkeletonCard, EmptyState, ActionButton } from "../../components/common";
import { FaUserMd } from "react-icons/fa";
import { translations } from "../../constants/translations";

export const HomePage = ({ userName, activeTab, setActiveTab, isLoading, doctors, BotIcon, lang }) => (
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
      ) : doctors.length === 0 ? (
        <EmptyState message={translations[lang].noDoctorsFound} icon={<FaUserMd size={48} />} />
      ) : (
        doctors.map((doc) => (
          <DoctorCard
            key={doc.id}
            name={doc.name || "N/A"}
            specialty={doc.specialty || "N/A"}
            hospital={doc.hospital || "N/A"}
            cases={doc.cases || 0}
            price={doc.price || 0}
            time={doc.time || 0}
            lang={lang}
          />
        ))
      )}
    </div>
  </>
);
