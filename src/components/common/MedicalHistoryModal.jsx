import React, { useState } from 'react';
import { translations } from '../../constants/translations';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '../ui/dialog';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Textarea } from '../ui/textarea';
import { Label } from '../ui/label';
import { Separator } from '../ui/separator';

const MedicalHistoryModal = ({ appointment, onClose, onSave, lang = 'th' }) => {
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

export default MedicalHistoryModal;
