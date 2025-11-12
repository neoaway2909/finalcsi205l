import { FaUser } from "react-icons/fa";
import { translations } from "../../constants/translations";

export const DoctorCard = ({ name, specialty, hospital, cases, price, time, lang }) => (
  <div className="doctor-card">
    <div className="doctor-photo-placeholder">
      <FaUser size={32} color="#c0d1f0" />
    </div>
    <div className="info-section">
      <p className="name">{name}</p>
      <span className="specialty">{specialty}</span>
      <p className="details">{hospital}</p>
      <p className="details">{cases} {translations[lang].case}</p>
      <div className="accredited">{translations[lang].accreditedBy}</div>
    </div>
    <div className="price-section">
      <div>
        <span className="price">{price} {translations[lang].baht}</span>
        <span className="time">{time} {translations[lang].minute}</span>
      </div>
      <button className="btn btn-primary">{translations[lang].bookNow}</button>
    </div>
  </div>
);
