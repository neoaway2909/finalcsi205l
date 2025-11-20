import React from 'react';
import { FaUserMd, FaStethoscope, FaPills, FaStickyNote, FaCalendarAlt } from 'react-icons/fa';
import { Card, CardHeader, CardContent } from '../ui/card';
import { Avatar, AvatarFallback } from '../ui/avatar';
import { Separator } from '../ui/separator';
import { translations } from '../../constants/translations';
import { cn } from '../../lib/utils';

const MedicalHistoryCard = ({ history, lang = 'th' }) => {
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

export default MedicalHistoryCard;
