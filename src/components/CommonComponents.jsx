import React, { useState, useEffect } from 'react';
import {
  FaUser,
  FaBell,
  FaSearch,
  FaUserShield,
  FaMapMarkerAlt,
  FaChartBar,
  FaClock,
  FaStar,
  FaCalendarAlt,
  FaUserMd,
  FaStethoscope,
  FaPills,
  FaStickyNote,
  FaHistory,
  FaCheck,
  FaNotesMedical,
  FaCheckCircle,
  FaExclamationCircle,
  FaInfoCircle,
  FaBoxOpen
} from 'react-icons/fa';
import { collection, query, where, getDocs, doc, getDoc } from 'firebase/firestore';
import { db } from '../firebase';
import { translations } from '../constants/translations';
import {
  Card,
  CardHeader,
  CardContent,
  CardFooter,
  Avatar,
  AvatarFallback,
  Badge,
  Button,
  Separator,
  AlertDialog,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogAction,
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  Input,
  Textarea,
  Label,
  ScrollArea,
} from './ui';
import { cn } from '../lib/utils';
import LogoImage from '../assets/logo.png';

// ==================== ActionButton ====================
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

// ==================== AlertModal ====================
/**
 * AlertModal - Custom modal for showing alerts/notifications
 * @param {string} type - 'success', 'error', or 'info'
 * @param {string} title - Modal title
 * @param {string} message - Modal message
 * @param {function} onClose - Callback when modal is closed
 * @param {string} confirmText - Text for confirm button (default: "OK")
 */
export const AlertModal = ({ type = 'info', title, message, onClose, confirmText = 'OK' }) => {
  const iconConfig = {
    success: {
      icon: <FaCheckCircle size={48} />,
      color: 'text-green-500',
      bgColor: 'bg-green-50',
    },
    error: {
      icon: <FaExclamationCircle size={48} />,
      color: 'text-red-500',
      bgColor: 'bg-red-50',
    },
    info: {
      icon: <FaInfoCircle size={48} />,
      color: 'text-blue-500',
      bgColor: 'bg-blue-50',
    },
  };

  const config = iconConfig[type] || iconConfig.info;

  return (
    <AlertDialog open={true} onOpenChange={(open) => !open && onClose()}>
      <AlertDialogContent className="max-w-md">
        <AlertDialogHeader className="items-center text-center space-y-4">
          <div className={cn(
            "rounded-full p-4 w-fit mx-auto",
            config.bgColor
          )}>
            <div className={config.color}>
              {config.icon}
            </div>
          </div>

          {title && (
            <AlertDialogTitle className="text-2xl">
              {title}
            </AlertDialogTitle>
          )}

          <AlertDialogDescription className="text-base text-center">
            {message}
          </AlertDialogDescription>
        </AlertDialogHeader>

        <AlertDialogFooter className="sm:justify-center">
          <AlertDialogAction
            onClick={onClose}
            className={cn(
              "min-w-[120px]",
              type === 'error' && "bg-red-600 hover:bg-red-700",
              type === 'success' && "bg-green-600 hover:bg-green-700"
            )}
          >
            {confirmText}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};

// ==================== AppointmentCard ====================
export const AppointmentCard = ({ appointment }) => {
  const { doctor, date, time } = appointment;

  // Convert date string to Date object if needed
  const appointmentDate = typeof date === 'string' ? new Date(date) : date;

  const formattedDate = appointmentDate.toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });

  const now = new Date();
  const diffTime = appointmentDate.getTime() - now.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

  const isUrgent = diffDays <= 3;
  const indicatorClass = isUrgent ? 'bg-red-500' : 'bg-green-500';
  const urgencyText = diffDays === 0 ? 'Today' : diffDays === 1 ? 'Tomorrow' : `${diffDays} days`;

  return (
    <Card className="relative overflow-hidden hover:shadow-lg transition-shadow duration-200">
      {/* Status Indicator */}
      <div className={cn("absolute top-0 left-0 w-1.5 h-full", indicatorClass)} />

      <div className="flex items-center gap-4 p-4 pl-6">
        {/* Doctor Info */}
        <Avatar className="h-14 w-14">
          <AvatarFallback className="bg-primary/10 text-primary">
            <FaUser size={28} />
          </AvatarFallback>
        </Avatar>

        <div className="flex-1 space-y-2">
          <div className="flex items-start justify-between">
            <div>
              <h3 className="font-semibold text-base leading-none">{doctor.name}</h3>
              <p className="text-sm text-muted-foreground mt-1">{doctor.specialty}</p>
            </div>
            {isUrgent && (
              <Badge variant="destructive" className="ml-2">
                {urgencyText}
              </Badge>
            )}
          </div>

          <div className="flex flex-wrap gap-3 text-sm text-muted-foreground">
            <div className="flex items-center gap-1.5">
              <FaCalendarAlt size={12} />
              <span>{formattedDate}</span>
            </div>
            <div className="flex items-center gap-1.5">
              <FaClock size={12} />
              <span>{time}</span>
            </div>
          </div>
        </div>
      </div>
    </Card>
  );
};

// ==================== DashboardHeader ====================
export const DashboardHeader = ({
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

// ==================== DoctorCard ====================
export const DoctorCard = ({ name, specialty, hospital, cases, price, time, lang, onBook }) => (
  <div className="doctor-card">
    {/* Left Column: Photo */}
    <div className="doctor-photo-placeholder">
      <FaUser size={36} style={{ color: 'var(--md-primary)' }} />
    </div>

    {/* Middle Column: Info */}
    <div className="info-section">
      <h3 className="name">{name}</h3>
      <span className="specialty">{specialty}</span>

      <div className="details-group">
        <p className="details">
          <FaMapMarkerAlt size={12} className="detail-icon" />
          <span>{hospital}</span>
        </p>
        <p className="details">
          <FaChartBar size={12} className="detail-icon" />
          <span>{cases} {translations[lang].case}</span>
        </p>
      </div>

      <span className="accredited">
        <FaStar size={11} />
        {translations[lang].accreditedBy}
      </span>
    </div>

    {/* Right Column: Price + Button */}
    <div className="price-action-column">
      <div className="price-highlight-box">
        <div className="price">{price}</div>
        <div className="time">
          <FaClock size={11} className="time-icon" />
          {time} {translations[lang].minute}
        </div>
      </div>

      <button
        className="btn btn-primary btn-book"
        onClick={(e) => {
          e.stopPropagation();
          onBook();
        }}
      >
        {translations[lang].bookNow}
      </button>
    </div>
  </div>
);

// ==================== LoadingScreen ====================
export const LoadingScreen = ({ title = "กำลังโหลดระบบ...", subtitle = "โปรดรอสักครู่" }) => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-50 flex items-center justify-center p-4">
      <div className="flex flex-col items-center gap-6">
        {/* Logo/Branding */}
        <div className="text-center mb-4">
          <h1 className="text-4xl font-bold text-primary mb-2">Care yoursafe</h1>
          <p className="text-sm text-muted-foreground">online</p>
        </div>

        {/* Modern Spinner */}
        <div className="relative">
          {/* Outer ring */}
          <div className="w-20 h-20 rounded-full border-4 border-gray-200"></div>
          {/* Spinning ring */}
          <div className="absolute inset-0 w-20 h-20 rounded-full border-4 border-transparent border-t-primary animate-spin"></div>
          {/* Inner dot */}
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-3 h-3 rounded-full bg-primary animate-pulse"></div>
          </div>
        </div>

        {/* Loading Text */}
        <div className="text-center space-y-2">
          <h2 className="text-xl font-semibold text-gray-800">
            {title}
          </h2>
          <p className="text-sm text-muted-foreground">
            {subtitle}
          </p>
        </div>
      </div>
    </div>
  );
};

// ==================== LoadingStates ====================
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

// ==================== MedicalHistoryCard ====================
export const MedicalHistoryCard = ({ history, lang = 'th' }) => {
  const { doctor, diagnosis, prescription, notes, createdAt } = history;

  const formattedDate = typeof createdAt === 'string'
    ? new Date(createdAt).toLocaleDateString(lang === 'th' ? 'th-TH' : 'en-US', { year: 'numeric', month: 'long', day: 'numeric' })
    : createdAt?.toDate?.().toLocaleDateString(lang === 'th' ? 'th-TH' : 'en-US', { year: 'numeric', month: 'long', day: 'numeric' }) || 'N/A';

  return (
    <Card className="mb-6 overflow-hidden border-blue-100 shadow-md hover:-translate-y-0.5 transition-all duration-300 hover:shadow-lg">
      <CardHeader className="bg-gradient-to-br from-[hsl(221,83%,70%)] to-[hsl(221,83%,60%)] p-4">
        <div className="flex items-center gap-3.5">
          <Avatar className="h-10 w-10 rounded-xl bg-white/25 backdrop-blur-md shadow-lg">
            <AvatarFallback className="bg-transparent text-white rounded-xl">
              <FaUserMd size={20} />
            </AvatarFallback>
          </Avatar>
          <div className="flex flex-col gap-1.5 flex-1">
            <p className="font-semibold text-white text-base m-0 drop-shadow-sm">
              {doctor?.name || 'Unknown Doctor'}
            </p>
            <div className="flex items-center gap-1.5 text-sm text-white/95">
              <FaCalendarAlt size={12} className="opacity-90" />
              <span>{formattedDate}</span>
            </div>
          </div>
        </div>
      </CardHeader>

      <CardContent className="p-5 space-y-4">
        {diagnosis && (
          <div className={cn(
            "bg-gradient-to-br from-white to-green-50 rounded-lg p-4",
            "border-l-4 border-green-500 transition-all duration-200",
            "hover:translate-x-1"
          )}>
            <div className="flex items-center gap-2.5 mb-2.5">
              <FaStethoscope className="text-green-500 text-base" />
              <h4 className="text-sm font-bold uppercase tracking-wide text-gray-800 m-0">
                {translations[lang].diagnosis}
              </h4>
            </div>
            <p className="text-sm text-gray-600 leading-relaxed m-0 whitespace-pre-wrap pl-6">
              {diagnosis}
            </p>
          </div>
        )}

        {prescription && (
          <div className={cn(
            "bg-gradient-to-br from-white to-orange-50 rounded-lg p-4",
            "border-l-4 border-orange-500 transition-all duration-200",
            "hover:translate-x-1"
          )}>
            <div className="flex items-center gap-2.5 mb-2.5">
              <FaPills className="text-orange-500 text-base" />
              <h4 className="text-sm font-bold uppercase tracking-wide text-gray-800 m-0">
                {translations[lang].prescription}
              </h4>
            </div>
            <p className="text-sm text-gray-600 leading-relaxed m-0 whitespace-pre-wrap pl-6">
              {prescription}
            </p>
          </div>
        )}

        {notes && (
          <div className={cn(
            "bg-gradient-to-br from-white to-blue-50 rounded-lg p-4",
            "border-l-4 border-blue-500 transition-all duration-200",
            "hover:translate-x-1"
          )}>
            <div className="flex items-center gap-2.5 mb-2.5">
              <FaStickyNote className="text-blue-500 text-base" />
              <h4 className="text-sm font-bold uppercase tracking-wide text-gray-800 m-0">
                {translations[lang].notes}
              </h4>
            </div>
            <p className="text-sm text-gray-600 leading-relaxed m-0 whitespace-pre-wrap pl-6">
              {notes}
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

// ==================== MedicalHistoryModal ====================
export const MedicalHistoryModal = ({ appointment, onClose, onSave, lang = 'th' }) => {
  const [diagnosis, setDiagnosis] = useState('');
  const [prescription, setPrescription] = useState('');
  const [notes, setNotes] = useState('');

  const handleSave = () => {
    onSave({
      appointmentId: appointment.id,
      patientId: appointment.patientId,
      doctorId: appointment.doctorId,
      diagnosis,
      prescription,
      notes,
      createdAt: new Date(),
    });
  };

  return (
    <Dialog open={!!appointment} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="text-2xl">
            {translations[lang].addMedicalHistory}
          </DialogTitle>
        </DialogHeader>

        <Separator />

        <div className="space-y-5 py-4">
          <div className="space-y-2">
            <Label htmlFor="diagnosis" className="text-base">
              {translations[lang].diagnosis}
            </Label>
            <Input
              id="diagnosis"
              type="text"
              value={diagnosis}
              onChange={(e) => setDiagnosis(e.target.value)}
              placeholder={`${translations[lang].diagnosis}...`}
              className="h-11"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="prescription" className="text-base">
              {translations[lang].prescription}
            </Label>
            <Textarea
              id="prescription"
              value={prescription}
              onChange={(e) => setPrescription(e.target.value)}
              placeholder={`${translations[lang].prescription}...`}
              className="min-h-[100px] resize-none"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="notes" className="text-base">
              {translations[lang].notes}
            </Label>
            <Textarea
              id="notes"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder={`${translations[lang].notes}...`}
              className="min-h-[100px] resize-none"
            />
          </div>
        </div>

        <Separator />

        <DialogFooter className="gap-2">
          <Button variant="outline" onClick={onClose}>
            {translations[lang].cancel}
          </Button>
          <Button onClick={handleSave}>
            {translations[lang].save}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

// ==================== PatientCard ====================
export const PatientCard = ({ appointment, onAddMedicalHistory, onComplete, onViewHistory, lang = 'th' }) => {
  const { patient, date, time, status } = appointment;
  const patientName = patient?.displayName || patient?.name || patient?.email || 'Unknown Patient';
  const patientAge = patient?.age || 'N/A';
  const patientGender = patient?.gender || 'N/A';

  const getStatusVariant = (status) => {
    switch (status) {
      case 'completed':
        return 'default';
      case 'scheduled':
      case 'instant':
        return 'secondary';
      default:
        return 'outline';
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'completed':
        return 'bg-green-500 text-white hover:bg-green-600';
      case 'scheduled':
      case 'instant':
        return 'bg-blue-500 text-white hover:bg-blue-600';
      default:
        return '';
    }
  };

  return (
    <Card className="hover:shadow-lg transition-shadow duration-200">
      <CardHeader className="pb-3">
        <div className="flex items-start gap-4">
          <Avatar className="h-16 w-16">
            <AvatarFallback className="bg-primary/10 text-primary">
              <FaUser size={32} />
            </AvatarFallback>
          </Avatar>
          <div className="flex-1 space-y-2">
            <div className="flex items-start justify-between">
              <h3 className="text-lg font-semibold leading-none">{patientName}</h3>
              <Badge variant={getStatusVariant(status)} className={cn(getStatusColor(status))}>
                {status}
              </Badge>
            </div>
            <div className="space-y-1 text-sm text-muted-foreground">
              <div className="flex gap-4">
                <span>Age: {patientAge}</span>
                <span>Gender: {patientGender}</span>
              </div>
              <p className="text-xs">
                {date} at {time}
              </p>
            </div>
          </div>
        </div>
      </CardHeader>

      <Separator />

      <CardFooter className="flex flex-wrap gap-2 pt-4">
        <Button
          variant="outline"
          size="sm"
          onClick={() => onViewHistory(appointment)}
          className="flex-1"
        >
          <FaHistory className="mr-2" />
          {translations[lang].viewMedicalHistory}
        </Button>

        {(status === 'scheduled' || status === 'instant') && (
          <Button
            variant="default"
            size="sm"
            onClick={() => onComplete(appointment.id)}
            className="flex-1 bg-green-600 hover:bg-green-700"
          >
            <FaCheck className="mr-2" />
            Complete
          </Button>
        )}

        {status === 'completed' && (
          <Button
            variant="default"
            size="sm"
            onClick={() => onAddMedicalHistory(appointment)}
            className="flex-1"
          >
            <FaNotesMedical className="mr-2" />
            Add Medical History
          </Button>
        )}
      </CardFooter>
    </Card>
  );
};

// ==================== ViewMedicalHistoryModal ====================
export const ViewMedicalHistoryModal = ({ patientId, patientName, onClose, lang = 'th' }) => {
  const [histories, setHistories] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchMedicalHistory = async () => {
      try {
        setIsLoading(true);
        const historiesCol = collection(db, 'medical_history');
        const q = query(historiesCol, where('patientId', '==', patientId));
        const snapshot = await getDocs(q);

        const historiesData = await Promise.all(
          snapshot.docs.map(async (historyDoc) => {
            const historyData = historyDoc.data();

            // Fetch doctor details
            let doctorName = 'Unknown Doctor';
            if (historyData.doctorId) {
              const doctorDoc = await getDoc(doc(db, 'users', historyData.doctorId));
              if (doctorDoc.exists()) {
                const doctorData = doctorDoc.data();
                doctorName = doctorData.displayName || doctorData.email || 'Unknown Doctor';
              }
            }

            return {
              id: historyDoc.id,
              ...historyData,
              doctor: { name: doctorName }
            };
          })
        );

        // Sort by date (newest first)
        historiesData.sort((a, b) => {
          const dateA = a.createdAt?.seconds || 0;
          const dateB = b.createdAt?.seconds || 0;
          return dateB - dateA;
        });

        setHistories(historiesData);
      } catch (error) {
        console.error('Error fetching medical history:', error);
      } finally {
        setIsLoading(false);
      }
    };

    if (patientId) {
      fetchMedicalHistory();
    }
  }, [patientId]);

  const formatDate = (timestamp) => {
    if (!timestamp?.seconds) return 'N/A';
    const date = new Date(timestamp.seconds * 1000);
    return date.toLocaleDateString('th-TH', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <Dialog open={!!patientId} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-3xl h-[80vh] p-0 gap-0 flex flex-col">
        {/* Header */}
        <DialogHeader className="px-5 py-2.5 border-b shrink-0">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                <FaUser className="text-primary" size={14} />
              </div>
              <div>
                <DialogTitle className="text-base font-semibold">
                  {translations[lang].viewMedicalHistory || 'ประวัติการรักษา'}
                </DialogTitle>
                <p className="text-xs text-muted-foreground mt-0.5">
                  {patientName}
                </p>
              </div>
            </div>
            <Badge variant="secondary" className="text-xs px-2 py-0.5">
              {histories.length} {lang === 'th' ? 'รายการ' : 'Records'}
            </Badge>
          </div>
        </DialogHeader>

        {/* Content */}
        <ScrollArea className="flex-1 px-5">
          <div className="py-4">
            {isLoading ? (
              <div className="flex flex-col items-center justify-center py-12">
                <div className="w-10 h-10 border-3 border-primary/20 border-t-primary rounded-full animate-spin mb-3" />
                <p className="text-sm text-muted-foreground">
                  {translations[lang].loading || 'กำลังโหลด...'}
                </p>
              </div>
            ) : histories.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12">
                <div className="w-12 h-12 rounded-full bg-muted/50 flex items-center justify-center mb-3">
                  <FaStethoscope size={24} className="text-muted-foreground" />
                </div>
                <p className="text-base font-medium text-foreground mb-1.5">
                  {translations[lang].noMedicalHistory || 'ไม่มีประวัติการรักษา'}
                </p>
                <p className="text-xs text-muted-foreground">
                  {lang === 'th' ? 'ยังไม่มีข้อมูลประวัติการรักษาสำหรับคนไข้รายนี้' : 'No medical records found for this patient'}
                </p>
              </div>
            ) : (
              <div className="divide-y">
                {histories.map((history) => (
                  <div key={history.id} className="py-4 first:pt-0 last:pb-0">
                    {/* Header */}
                    <div className="flex items-center gap-2.5 mb-3">
                      <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                        <FaStethoscope className="text-primary" size={14} />
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-foreground">
                          {history.doctor?.name || 'Unknown Doctor'}
                        </p>
                        <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                          <FaCalendarAlt size={10} />
                          <span>{formatDate(history.createdAt)}</span>
                        </div>
                      </div>
                    </div>

                    {/* Details */}
                    <div className="space-y-2.5 ml-10.5">
                      {/* Diagnosis */}
                      {history.diagnosis && (
                        <div>
                          <p className="text-xs font-semibold text-muted-foreground mb-0.5">
                            {lang === 'th' ? 'การวินิจฉัย' : 'Diagnosis'}
                          </p>
                          <p className="text-sm text-foreground">
                            {history.diagnosis}
                          </p>
                        </div>
                      )}

                      {/* Prescription */}
                      {history.prescription && (
                        <div>
                          <p className="text-xs font-semibold text-muted-foreground mb-0.5">
                            {lang === 'th' ? 'ยาที่จ่าย' : 'Prescription'}
                          </p>
                          <p className="text-sm text-foreground whitespace-pre-wrap">
                            {history.prescription}
                          </p>
                        </div>
                      )}

                      {/* Notes */}
                      {history.notes && (
                        <div>
                          <p className="text-xs font-semibold text-muted-foreground mb-0.5">
                            {lang === 'th' ? 'หมายเหตุ' : 'Notes'}
                          </p>
                          <p className="text-sm text-foreground whitespace-pre-wrap">
                            {history.notes}
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </ScrollArea>

        {/* Footer */}
        <div className="px-5 py-3 border-t shrink-0 flex items-center justify-end">
          <Button onClick={onClose} size="sm">
            {translations[lang].close || 'ปิด'}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

// Export all components as default as well
export default {
  ActionButton,
  AlertModal,
  AppointmentCard,
  DashboardHeader,
  DoctorCard,
  LoadingScreen,
  LoadingSkeletonCard,
  LoadingSkeletonRow,
  EmptyState,
  MedicalHistoryCard,
  MedicalHistoryModal,
  PatientCard,
  ViewMedicalHistoryModal
};
