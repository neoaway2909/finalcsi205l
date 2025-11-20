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
    <div className="side-nav">
      <div className="nav-menu">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeNav === item.id;

          return (
            <div
              key={item.id}
              className={`nav-item-side ${isActive ? 'active' : ''}`}
              onClick={() => handleClick(item.id)}
            >
              <Icon size={20} />
              <span className="nav-label">{item.label[lang]}</span>
            </div>
          );
        })}
      </div>

      <div className="nav-item-side nav-item-logout" onClick={logout}>
        <FaSignOutAlt size={20} />
        <span className="nav-label">{translations[lang].logout}</span>
      </div>
    </div>
  );
};
