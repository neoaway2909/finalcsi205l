export const ActionButton = ({ label, isImage = false, imageSrc, onClick }) => (
  <div className="action-button-container" onClick={onClick} style={{ cursor: onClick ? 'pointer' : 'default' }}>
    <div className="action-button">
      {isImage && (
        <img src={imageSrc} alt={label} style={{ width: '48px', height: '48px', objectFit: 'contain' }} />
      )}
    </div>
    <span className="label">{label}</span>
  </div>
);
