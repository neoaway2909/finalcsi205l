import { translations } from "../../constants/translations";

export const AppointmentsPage = ({ lang }) => (
  <div className="page-placeholder">
    <h2>{translations[lang].pageAppointments}</h2>
    <p>{translations[lang].pageAppointmentsDesc}</p>
  </div>
);
