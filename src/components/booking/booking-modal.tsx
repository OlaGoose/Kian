'use client';

import { useState, useEffect, type FormEvent } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Check, MapPin } from 'lucide-react';
import { useTranslations, useLocale } from 'next-intl';
import { LOCATION } from '@/lib/constants';

interface BookingModalProps {
  isOpen: boolean;
  onClose: () => void;
}

type MeetingType = 'online' | 'inperson';
type SlotStatus = 'available' | 'busy';

interface TimeSlot {
  time: string;
  status: SlotStatus;
}

interface DateOption {
  date: Date;
  dateStr: string;
}

const AVAILABLE_TIMES = ['12:00', '13:00', '14:00', '18:00', '19:00', '20:00'];
const DAY_NAMES_EN = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const DAY_NAMES_ZH = ['日', '一', '二', '三', '四', '五', '六'];

function toDateStr(d: Date): string {
  return d.toISOString().split('T')[0];
}

// Returns Mon–Fri of the next calendar week
function getNextWeekDates(): DateOption[] {
  const today = new Date();
  const dow = today.getDay(); // 0=Sun … 6=Sat
  const daysUntilNextMonday = dow === 0 ? 1 : 8 - dow;
  return Array.from({ length: 5 }, (_, i) => {
    const d = new Date(today);
    d.setDate(today.getDate() + daysUntilNextMonday + i);
    return { date: d, dateStr: toDateStr(d) };
  });
}

export function BookingModal({ isOpen, onClose }: BookingModalProps) {
  const t = useTranslations('booking');
  const locale = useLocale();
  const dayNames = locale === 'zh' ? DAY_NAMES_ZH : DAY_NAMES_EN;

  const [step, setStep] = useState<'view' | 'form' | 'success'>('view');
  const [selectedDate, setSelectedDate] = useState<string>('');
  const [selectedTime, setSelectedTime] = useState<string>('');
  const [meetingType, setMeetingType] = useState<MeetingType>('inperson');
  const [formData, setFormData] = useState({ name: '', email: '', message: '' });
  const [bookedSlots, setBookedSlots] = useState<{ date: string; time: string }[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState('');

  const weekDates = getNextWeekDates();

  useEffect(() => {
    if (!isOpen) return;

    const start = weekDates[0].dateStr;
    const end = weekDates[weekDates.length - 1].dateStr;

    fetch(`/api/booking/available?start=${start}&end=${end}`)
      .then((r) => r.json())
      .then((data) => setBookedSlots(data.booked ?? []))
      .catch(() => setBookedSlots([]));

    if (!selectedDate && weekDates.length > 0) {
      setSelectedDate(weekDates[0].dateStr);
    }
  }, [isOpen]); // eslint-disable-line react-hooks/exhaustive-deps

  const handleClose = () => {
    onClose();
    setTimeout(() => {
      setStep('view');
      setSelectedDate('');
      setSelectedTime('');
      setMeetingType('inperson');
      setFormData({ name: '', email: '', message: '' });
      setSubmitError('');
    }, 300);
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setSubmitError('');

    try {
      const res = await fetch('/api/booking', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          meeting_type: meetingType,
          date: selectedDate,
          time: selectedTime,
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        setSubmitError(data.error ?? t('submitError'));
        return;
      }

      setStep('success');
      setTimeout(() => handleClose(), 2000);
    } catch {
      setSubmitError(t('submitError'));
    } finally {
      setSubmitting(false);
    }
  };

  const locationLabel = locale === 'zh' ? LOCATION.displayZh : LOCATION.display;

  const timeSlotsForDate: TimeSlot[] = AVAILABLE_TIMES.map((time) => ({
    time,
    status: bookedSlots.some((b) => b.date === selectedDate && b.time === time)
      ? 'busy'
      : 'available',
  }));

  const selectedDateObj = weekDates.find((d) => d.dateStr === selectedDate);
  const selectedDateLabel = selectedDateObj
    ? selectedDateObj.date.toLocaleDateString(locale === 'zh' ? 'zh-CN' : 'en-US', {
        month: 'numeric',
        day: 'numeric',
      })
    : '';

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex md:items-center items-end">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={handleClose}
            className="absolute inset-0 bg-black/5 dark:bg-black/30"
          />
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 24 }}
            transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
            className="relative w-full md:max-w-[520px] md:mx-auto bg-white dark:bg-[#0a0a0a] border border-neutral-200 dark:border-neutral-800 p-6 md:p-8 rounded-t-[4px] md:rounded-[2px] overflow-y-auto max-h-[92vh]"
          >
            <div className="md:hidden w-8 h-[3px] bg-neutral-200 dark:bg-neutral-800 rounded-full mx-auto mb-6" />

            <button
              onClick={handleClose}
              className="absolute top-4 right-4 text-neutral-400 dark:text-neutral-600 hover:text-neutral-900 dark:hover:text-neutral-100 transition-colors"
              aria-label={t('close')}
            >
              <X className="w-4 h-4" />
            </button>

            {step === 'success' ? (
              <div className="py-12 flex flex-col items-center text-center">
                <div className="w-12 h-12 bg-neutral-900 dark:bg-neutral-100 rounded-full flex items-center justify-center mb-4">
                  <Check className="text-white dark:text-black" size={24} />
                </div>
                <p className="text-copy font-medium font-sans">{t('success')}</p>
              </div>
            ) : (
              <>
                <div className="mb-6">
                  <h2 className="text-[18px] font-medium text-neutral-900 dark:text-neutral-100 mb-1">
                    {t('title')}
                  </h2>
                  <p className="text-[13px] text-neutral-500 dark:text-neutral-500">
                    {t('subtitle')}
                  </p>
                </div>

                {step === 'view' ? (
                  <div className="space-y-6">
                    <div>
                      <p className="text-[11px] uppercase tracking-wider text-neutral-400 dark:text-neutral-600 mb-3 font-sans">
                        {t('meetingType')}
                      </p>
                      <div className="flex gap-2">
                        {(['inperson', 'online'] as MeetingType[]).map((type) => (
                          <button
                            key={type}
                            onClick={() => setMeetingType(type)}
                            className={`flex-1 py-2.5 text-[11px] uppercase tracking-wider font-sans font-medium border rounded-[2px] transition-all ${
                              meetingType === type
                                ? 'bg-neutral-900 dark:bg-neutral-100 text-white dark:text-black border-neutral-900 dark:border-neutral-100'
                                : 'border-neutral-200 dark:border-neutral-800 text-neutral-500 hover:border-neutral-400 dark:hover:border-neutral-600'
                            }`}
                          >
                            {t(type)}
                            {type === 'inperson' && (
                              <span
                                className={`ml-1.5 text-[9px] ${
                                  meetingType === type
                                    ? 'opacity-60'
                                    : 'text-neutral-400 dark:text-neutral-600'
                                }`}
                              >
                                {t('recommended')}
                              </span>
                            )}
                          </button>
                        ))}
                      </div>
                      <div className="mt-2.5 flex min-h-4 items-center gap-1.5 text-[12px] text-neutral-400 dark:text-neutral-600">
                        {meetingType === 'inperson' ? (
                          <>
                            <MapPin className="w-3 h-3 flex-shrink-0" strokeWidth={1.5} />
                            <span>{locationLabel}</span>
                          </>
                        ) : null}
                      </div>
                    </div>

                    <div>
                      <p className="text-[11px] uppercase tracking-wider text-neutral-400 dark:text-neutral-600 mb-3 font-sans">
                        {t('selectDate')}
                      </p>
                      <div className="grid grid-cols-5 gap-1.5">
                        {weekDates.map(({ date, dateStr }) => {
                          const isSelected = selectedDate === dateStr;
                          return (
                            <button
                              key={dateStr}
                              onClick={() => {
                                setSelectedDate(dateStr);
                                setSelectedTime('');
                              }}
                              className={`flex flex-col items-center py-2.5 px-1 rounded-[2px] border transition-all cursor-pointer ${
                                isSelected
                                  ? 'border-neutral-900 dark:border-neutral-100 bg-neutral-900 dark:bg-neutral-100'
                                  : 'border-neutral-200 dark:border-neutral-800 hover:border-neutral-400 dark:hover:border-neutral-600'
                              }`}
                            >
                              <span
                                className={`text-[9px] uppercase tracking-wider font-sans mb-1.5 ${
                                  isSelected
                                    ? 'text-white dark:text-black'
                                    : 'text-neutral-400 dark:text-neutral-600'
                                }`}
                              >
                                {dayNames[date.getDay()]}
                              </span>
                              <span
                                className={`text-[14px] font-mono leading-none ${
                                  isSelected
                                    ? 'text-white dark:text-black'
                                    : 'text-neutral-900 dark:text-neutral-100'
                                }`}
                              >
                                {date.getDate()}
                              </span>
                            </button>
                          );
                        })}
                      </div>
                    </div>

                    {selectedDate && (
                      <div>
                        <p className="text-[11px] uppercase tracking-wider text-neutral-400 dark:text-neutral-600 mb-3 font-sans">
                          {t('selectTime')} · {selectedDateLabel}
                        </p>
                        <div className="grid grid-cols-3 gap-2">
                          {timeSlotsForDate.map(({ time, status }) => {
                            const isAvailable = status === 'available';
                            const isSelected = selectedTime === time;
                            return (
                              <button
                                key={time}
                                disabled={!isAvailable}
                                onClick={() => setSelectedTime(isSelected ? '' : time)}
                                className={`p-3 border flex justify-between items-center rounded-[2px] transition-all ${
                                  !isAvailable
                                    ? 'border-neutral-100 dark:border-neutral-900 opacity-30 cursor-not-allowed'
                                    : isSelected
                                    ? 'border-neutral-900 dark:border-neutral-100 bg-neutral-900 dark:bg-neutral-100'
                                    : 'border-neutral-200 dark:border-neutral-800 hover:border-neutral-400 dark:hover:border-neutral-600 cursor-pointer'
                                }`}
                              >
                                <span
                                  className={`text-[13px] font-mono ${
                                    isSelected
                                      ? 'text-white dark:text-black'
                                      : 'text-neutral-900 dark:text-neutral-100'
                                  }`}
                                >
                                  {time}
                                </span>
                                <span
                                  className={`text-[10px] uppercase tracking-tighter font-sans ${
                                    isSelected
                                      ? 'text-white dark:text-black'
                                      : isAvailable
                                      ? 'text-neutral-500 dark:text-neutral-500'
                                      : 'text-neutral-400 dark:text-neutral-600'
                                  }`}
                                >
                                  {isAvailable
                                    ? isSelected
                                      ? t('selected')
                                      : t('available')
                                    : t('busy')}
                                </span>
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    )}

                    <button
                      onClick={() => setStep('form')}
                      disabled={!selectedDate || !selectedTime}
                      className="w-full py-2.5 bg-neutral-900 dark:bg-neutral-100 text-white dark:text-black text-[11px] font-sans font-medium uppercase tracking-wider hover:opacity-80 transition-all rounded-[2px] disabled:opacity-25 active:scale-[0.99]"
                      data-ga-label="booking_next"
                    >
                      {t('next')}
                    </button>
                  </div>
                ) : (
                  <form onSubmit={handleSubmit} className="space-y-5">
                    <div className="flex items-center gap-2.5 text-[12px] text-neutral-500 dark:text-neutral-500 border border-neutral-100 dark:border-neutral-900 rounded-[2px] p-3">
                      <span className="font-mono text-neutral-900 dark:text-neutral-100">
                        {selectedDateLabel} {selectedTime}
                      </span>
                      <span className="text-neutral-300 dark:text-neutral-700">·</span>
                      <span>{t(meetingType)}</span>
                      {meetingType === 'inperson' && (
                        <>
                          <span className="text-neutral-300 dark:text-neutral-700">·</span>
                          <span className="flex items-center gap-1">
                            <MapPin className="w-3 h-3 flex-shrink-0" strokeWidth={1.5} />
                            {locationLabel}
                          </span>
                        </>
                      )}
                    </div>

                    {(['name', 'email', 'message'] as const).map((field) => (
                      <div key={field} className="space-y-1.5">
                        <label className="text-[10px] uppercase tracking-wider text-neutral-400 dark:text-neutral-600 font-sans">
                          {t(field)}
                        </label>
                        {field === 'message' ? (
                          <textarea
                            required
                            rows={3}
                            value={formData[field]}
                            onChange={(e) =>
                              setFormData({ ...formData, [field]: e.target.value })
                            }
                            className="w-full bg-transparent border-b border-neutral-200 dark:border-neutral-800 py-2 text-[13px] focus:outline-none focus:border-neutral-900 dark:focus:border-neutral-100 transition-colors resize-none"
                          />
                        ) : (
                          <input
                            required
                            type={field === 'email' ? 'email' : 'text'}
                            value={formData[field]}
                            onChange={(e) =>
                              setFormData({ ...formData, [field]: e.target.value })
                            }
                            className="w-full bg-transparent border-b border-neutral-200 dark:border-neutral-800 py-2 text-[13px] focus:outline-none focus:border-neutral-900 dark:focus:border-neutral-100 transition-colors"
                          />
                        )}
                      </div>
                    ))}

                    {submitError && (
                      <p className="text-[12px] text-neutral-500 dark:text-neutral-500">
                        {submitError}
                      </p>
                    )}

                    <div className="pt-2 flex gap-3">
                      <button
                        type="button"
                        onClick={() => setStep('view')}
                        className="flex-1 py-2.5 border border-neutral-200 dark:border-neutral-800 text-[11px] font-sans font-medium uppercase tracking-wider hover:bg-neutral-50 dark:hover:bg-neutral-900/50 transition-all rounded-[2px]"
                      >
                        {t('back')}
                      </button>
                      <button
                        type="submit"
                        disabled={submitting}
                        className="flex-1 py-2.5 bg-neutral-900 dark:bg-neutral-100 text-white dark:text-black text-[11px] font-sans font-medium uppercase tracking-wider hover:opacity-80 transition-all rounded-[2px] active:scale-[0.99] disabled:opacity-25"
                        data-ga-label="booking_submit"
                      >
                        {submitting ? t('submitting') : t('submit')}
                      </button>
                    </div>
                  </form>
                )}
              </>
            )}
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
