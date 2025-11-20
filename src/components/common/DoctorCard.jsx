import { FaUser, FaMapMarkerAlt, FaChartBar, FaClock, FaStar } from "react-icons/fa";
import { translations } from "../../constants/translations";

export const DoctorCard = ({ name, specialty, hospital, cases, price, time, lang, onBook }) => (
  <div className="doctor-card">
    {/* Left Column: Photo */}
    <div className="doctor-photo-placeholder">
      <FaUser size={36} style={{ color: 'var(--md-primary)' }} />
    </div>

    {/* Middle Column: Info */}
    <div className="info-section">
      <h3 className="name">{name}</h3>
      <span className="specialty">{specialty}</span>

      <div className="details-group">
        <p className="details">
          <FaMapMarkerAlt size={12} className="detail-icon" />
          <span>{hospital}</span>
        </p>
        <p className="details">
          <FaChartBar size={12} className="detail-icon" />
          <span>{cases} {translations[lang].case}</span>
        </p>
      </div>

      <span className="accredited">
        <FaStar size={11} />
        {translations[lang].accreditedBy}
      </span>
    </div>

    {/* Right Column: Price + Button */}
    <div className="price-action-column">
      <div className="price-highlight-box">
        <div className="price">{price}</div>
        <div className="time">
          <FaClock size={11} className="time-icon" />
          {time} {translations[lang].minute}
        </div>
      </div>

      <button
        className="btn btn-primary btn-book"
        onClick={(e) => {
          e.stopPropagation();
          onBook();
        }}
      >
        {translations[lang].bookNow}
      </button>
    </div>
  </div>
);
