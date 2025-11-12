export const ActionButton = ({ label, isImage = false, imageSrc }) => (
  <div className="action-button-container">
    <div className="action-button">
      {isImage && (
        <img src={imageSrc} alt={label} style={{ width: '48px', height: '48px', objectFit: 'contain' }} />
      )}
    </div>
    <span className="label">{label}</span>
  </div>
);
