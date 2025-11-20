import React from 'react';
import { FaUser, FaHistory, FaCheck, FaNotesMedical } from 'react-icons/fa';
import { Card, CardHeader, CardFooter } from '../ui/card';
import { Avatar, AvatarFallback } from '../ui/avatar';
import { Badge } from '../ui/badge';
import { Button } from '../ui/button';
import { Separator } from '../ui/separator';
import { translations } from '../../constants/translations';
import { cn } from '../../lib/utils';

const PatientCard = ({ appointment, onAddMedicalHistory, onComplete, onViewHistory, lang = 'th' }) => {
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

export default PatientCard;
