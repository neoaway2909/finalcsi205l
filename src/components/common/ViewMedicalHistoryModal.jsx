import React, { useState, useEffect } from 'react';
import { FaUser, FaCalendarAlt, FaStethoscope } from 'react-icons/fa';
import { collection, query, where, getDocs, doc, getDoc } from 'firebase/firestore';
import { db } from '../../firebase';
import { translations } from '../../constants/translations';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '../ui/dialog';
import { ScrollArea } from '../ui/scroll-area';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';

const ViewMedicalHistoryModal = ({ patientId, patientName, onClose, lang = 'th' }) => {
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

export default ViewMedicalHistoryModal;
