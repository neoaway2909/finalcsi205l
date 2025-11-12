import { translations } from "../../constants/translations";

export const QueuePage = ({ lang }) => (
  <div className="page-placeholder">
    <h2>{translations[lang].queue}</h2>
    <p>{translations[lang].pageQueueDesc}</p>
  </div>
);
