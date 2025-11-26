import React, { useState, useEffect } from 'react';
import { translations } from "../constants/translations";
import { collection, addDoc, serverTimestamp, query, onSnapshot, orderBy, doc, deleteDoc } from "firebase/firestore";
import CustomCalendar from '../components/CustomCalendar';

const DoctorSchedulePage = ({ lang, db, user }) => {
  const [date, setDate] = useState('');
  const [startTime, setStartTime] = useState('');
  const [endTime, setEndTime] = useState('');
  const [unavailability, setUnavailability] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!db || !user) {
      setIsLoading(false);
      return;
    }

    const unavailabilityCol = collection(db, "users", user.uid, "unavailability");
    const q = query(
      unavailabilityCol,
      orderBy("date", "desc")
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const unavailabilities = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setUnavailability(unavailabilities);
      setIsLoading(false);
    }, (error) => {
      console.error("Error fetching unavailability: ", error);
      setIsLoading(false);
    });

    return () => unsubscribe();
  }, [db, user]);

  const handleSaveUnavailability = async () => {
    if (!date || !startTime || !endTime) {
      alert(translations[lang]?.fillAllFields || 'Please fill all fields');
      return;
    }

    if (!db || !user) {
      alert(translations[lang]?.dbError || 'Database not available. Please try again later.');
      return;
    }

    try {
      const unavailabilityCol = collection(db, "users", user.uid, "unavailability");
      await addDoc(unavailabilityCol, {
        date,
        startTime,
        endTime,
        createdAt: serverTimestamp(),
      });
      alert(translations[lang]?.unavailabilitySaved || 'Unavailable time saved successfully!');
      setDate('');
      setStartTime('');
      setEndTime('');
    } catch (error) {
      console.error("Error saving unavailability: ", error);
      alert(translations[lang]?.unavailabilitySaveError || 'Failed to save unavailable time.');
    }
  };

  const handleDeleteUnavailability = async (item) => {
    if (!db || !user) return;
    if (window.confirm(translations[lang]?.confirmDelete || "Are you sure you want to delete this unavailable slot?")) {
      try {
        const docRef = doc(db, "users", user.uid, "unavailability", item.id);
        await deleteDoc(docRef);
        alert(translations[lang]?.deleteSuccess || "Slot deleted successfully.");
      } catch (error) {
        console.error("Error deleting unavailable slot: ", error);
        alert(translations[lang]?.deleteError || "Failed to delete slot.");
      }
    }
  };

  return (
    <div className="p-6 space-y-6">
      <h1 className="text-3xl font-bold text-foreground">
        {translations[lang]?.manageSchedule || 'Manage Schedule'}
      </h1>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
        {/* Left side: Form for adding unavailability */}
        <div className="lg:col-span-1 space-y-4">
          <h2 className="text-xl font-semibold text-foreground">{translations[lang]?.addUnavailability || 'Add Unavailable Time'}</h2>
          <div>
            <label htmlFor="date" className="block text-sm font-medium text-muted-foreground">
              {translations[lang]?.date || 'Date'}
            </label>
            <input
              type="date"
              id="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="mt-1 block w-full rounded-md border-input bg-background p-2 shadow-sm focus:border-primary focus:ring-primary"
            />
          </div>
          <div>
            <label htmlFor="start-time" className="block text-sm font-medium text-muted-foreground">
              {translations[lang]?.startTime || 'Start Time'}
            </label>
            <input
              type="time"
              id="start-time"
              value={startTime}
              onChange={(e) => setStartTime(e.target.value)}
              className="mt-1 block w-full rounded-md border-input bg-background p-2 shadow-sm focus:border-primary focus:ring-primary"
            />
          </div>
          <div>
            <label htmlFor="end-time" className="block text-sm font-medium text-muted-foreground">
              {translations[lang]?.endTime || 'End Time'}
            </label>
            <input
              type="time"
              id="end-time"
              value={endTime}
              onChange={(e) => setEndTime(e.target.value)}
              className="mt-1 block w-full rounded-md border-input bg-background p-2 shadow-sm focus:border-primary focus:ring-primary"
            />
          </div>
          <button
            onClick={handleSaveUnavailability}
            className="w-full justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground shadow-sm hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2"
          >
            {translations[lang]?.saveUnavailability || 'Save Unavailable Time'}
          </button>
        </div>

        {/* Right side: Calendar view */}
        <div className="lg:col-span-2">
           {isLoading ? (
             <p className="text-muted-foreground">Loading schedule...</p>
           ) : (
            <CustomCalendar 
              lang={lang}
              unavailability={unavailability}
              onDelete={handleDeleteUnavailability}
            />
           )}
        </div>
      </div>
    </div>
  );
};

export default DoctorSchedulePage;
