import React from 'react';
import { FaUser, FaCalendarAlt, FaClock } from 'react-icons/fa';
import { Card } from '../ui/card';
import { Avatar, AvatarFallback } from '../ui/avatar';
import { Badge } from '../ui/badge';
import { cn } from '../../lib/utils';

const AppointmentCard = ({ appointment }) => {
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

export default AppointmentCard;
