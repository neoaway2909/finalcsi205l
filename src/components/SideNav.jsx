import { useNavigate } from "react-router-dom";
import { FaSignOutAlt } from "react-icons/fa";
import { translations } from "../constants/translations";

export const SideNav = ({ logout, activeNav, navItems, lang, isDirty, setIsDirty, setProfileToView, user, handleSaveProfile }) => {
  const navigate = useNavigate();

  const handleClick = (itemId) => {
    if (activeNav === 'profile' && isDirty) {
      if (window.confirm(translations[lang].confirmLeave)) {
        handleSaveProfile();
        setIsDirty(false);
        navigate(`/${itemId}`);
      } else {
        setIsDirty(false);
        navigate(`/${itemId}`);
      }
    }
    else {
      if (itemId === 'profile') {
        setProfileToView(user);
      }
      navigate(`/${itemId}`);
    }
  };

  return (
    <div className="side-nav anim-slide-in-left">
      <nav className="nav-menu" style={{marginTop: '20px'}}>
        {navItems.map((item) => (
          <div
            key={item.id}
            className={`nav-item-side ${
              activeNav === item.id ? "active" : ""
            }`}
            onClick={() => handleClick(item.id)}
            title={item.label[lang]}
          >
            <item.icon size={22} />
            <span className="nav-label">{item.label[lang]}</span>
          </div>
        ))}
        <div
          className="nav-item-side nav-item-logout"
          onClick={logout}
          title={translations[lang].logout}
        >
          <FaSignOutAlt size={22} />
          <span className="nav-label">{translations[lang].logout}</span>
        </div>
      </nav>
    </div>
  );
};
