import { translations } from "../../constants/translations";

export const ChatPage = ({ lang }) => (
  <div className="page-placeholder">
    <h2>{translations[lang].pageChat}</h2>
    <p>{translations[lang].pageChatDesc}</p>
  </div>
);
