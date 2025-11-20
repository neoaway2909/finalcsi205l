import { FaUser, FaBell, FaSearch, FaUserShield } from 'react-icons/fa';
import LogoImage from '../../assets/logo.png';

const DashboardHeader = ({
  userName,
  userRole = 'patient',
  activeLang,
  setActiveLang,
  translations,
  notifications = []
}) => {
  const getRoleIcon = () => {
    if (userRole === 'admin') {
      return <FaUserShield size={20} />;
    }
    return <FaUser size={20} />;
  };

  const getRoleLabel = () => {
    if (userRole === 'admin') {
      return 'System Administrator';
    }
    return translations[activeLang]?.idCardNumber || 'หมายเลขบัตรประชาชน';
  };

  return (
    <header className="top-header-bar">
      {/* Logo */}
      <div className="logo-container-header">
        <div className="app-logo-header-icon">
          <img src={LogoImage} alt="Care yoursafe Logo" className="app-logo-img" />
        </div>
      </div>

      {/* Search Bar */}
      <div className="search-bar-header">
        <FaSearch size={18} />
        <input
          type="text"
          placeholder={translations[activeLang]?.searchPlaceholder || 'ค้นหาหมอ, แผนก...'}
        />
      </div>

      {/* Right Actions */}
      <div className="header-actions-right">
        {/* Language Switcher with Dropdown */}
        <div className="profile-header-sm" style={{ marginRight: 0 }}>
          <button
            className={`language-item ${activeLang === 'th' ? 'active-lang' : ''}`}
            onClick={() => setActiveLang('th')}
            style={{
              backgroundColor: activeLang === 'th' ? 'var(--md-primary)' : 'transparent',
              color: activeLang === 'th' ? 'white' : 'rgba(255, 255, 255, 0.8)',
              padding: '8px 16px',
              borderRadius: '8px',
              border: 'none',
              cursor: 'pointer',
              fontWeight: '600',
              fontSize: '14px'
            }}
          >
            TH
          </button>
          <button
            className={`language-item ${activeLang === 'en' ? 'active-lang' : ''}`}
            onClick={() => setActiveLang('en')}
            style={{
              backgroundColor: activeLang === 'en' ? 'var(--md-primary)' : 'transparent',
              color: activeLang === 'en' ? 'white' : 'rgba(255, 255, 255, 0.8)',
              padding: '8px 16px',
              borderRadius: '8px',
              border: 'none',
              cursor: 'pointer',
              fontWeight: '600',
              fontSize: '14px',
              marginLeft: '4px'
            }}
          >
            EN
          </button>
        </div>

        {/* Notification Bell */}
        <div className="notification-bell-container">
          <div className="header-icon-wrapper">
            <FaBell size={20} />
          </div>
          {notifications.length > 0 && (
            <div className="notification-count">
              {notifications.length > 9 ? '9+' : notifications.length}
            </div>
          )}
          <div className="notification-dropdown">
            {notifications.length === 0 ? (
              <div className="notification-item">
                <p>No new notifications</p>
              </div>
            ) : (
              notifications.slice(0, 5).map((notif, index) => (
                <div key={notif.id || index} className="notification-item">
                  <strong>
                    {notif.type === 'new_booking' ? 'New Booking' : notif.title || 'Notification'}
                  </strong>
                  <p>{notif.message || notif.description}</p>
                  <span>
                    {notif.timestamp?.seconds
                      ? new Date(notif.timestamp.seconds * 1000).toLocaleTimeString('th-TH', {
                          hour: '2-digit',
                          minute: '2-digit'
                        })
                      : notif.time}
                  </span>
                </div>
              ))
            )}
          </div>
        </div>

        {/* User Profile */}
        <div className="profile-header-sm">
          <div className="user-icon-sm">
            {getRoleIcon()}
          </div>
          <div className="user-info-sm">
            <span className="name">{userName}</span>
            <span className="id-card">{getRoleLabel()}</span>
          </div>
        </div>
      </div>
    </header>
  );
};

export default DashboardHeader;
