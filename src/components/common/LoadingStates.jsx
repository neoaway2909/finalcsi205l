import { FaBoxOpen } from "react-icons/fa";

export const LoadingSkeletonCard = () => (
  <div className="doctor-card skeleton-card">
    <div className="doctor-photo-placeholder skeleton"></div>
    <div className="info-section">
      <p className="name skeleton skeleton-text"></p>
      <span className="specialty skeleton skeleton-text-short"></span>
      <p className="details skeleton skeleton-text-long"></p>
    </div>
    <div className="price-section">
      <div className="skeleton skeleton-text"></div>
      <div className="skeleton skeleton-button"></div>
    </div>
  </div>
);

export const LoadingSkeletonRow = ({ cols }) => (
  <tr>
    <td colSpan={cols}>
      <div className="skeleton-row">
        <span className="skeleton skeleton-text-long"></span>
      </div>
    </td>
  </tr>
);

export const EmptyState = ({ icon, message }) => (
  <div className="empty-state-container">
    <div className="empty-state-icon">{icon || <FaBoxOpen size={48} />}</div>
    <p>{message}</p>
  </div>
);
