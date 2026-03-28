'use client';

import { useState, type FormEvent } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Check } from 'lucide-react';
import { useTranslations } from 'next-intl';

interface BookingModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const SCHEDULE = [
  { time: '09:00', status: 'busy' },
  { time: '10:00', status: 'available' },
  { time: '11:00', status: 'available' },
  { time: '12:00', status: 'busy' },
  { time: '14:00', status: 'available' },
  { time: '15:00', status: 'busy' },
] as const;

export function BookingModal({ isOpen, onClose }: BookingModalProps) {
  const t = useTranslations('booking');
  const [step, setStep] = useState<'view' | 'form' | 'success'>('view');
  const [formData, setFormData] = useState({ name: '', email: '', message: '' });

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    setStep('success');
    setTimeout(() => {
      onClose();
      setStep('view');
      setFormData({ name: '', email: '', message: '' });
    }, 2000);
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-white/80 dark:bg-black/80 backdrop-blur-sm"
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ duration: 0.2 }}
            className="relative w-full max-w-md bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 p-6 md:p-8 shadow-2xl rounded-[2px]"
          >
            <button
              onClick={onClose}
              className="absolute top-4 right-4 text-neutral-400 hover:text-neutral-900 dark:hover:text-neutral-100 transition-colors"
              aria-label="Close"
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
                <div className="mb-8">
                  <h2 className="text-[18px] md:text-[20px] font-bold text-neutral-900 dark:text-neutral-100 mb-1 font-serif">
                    {t('title')}
                  </h2>
                  <p className="text-neutral-500 text-[11px] md:text-[13px] font-sans">
                    {t('subtitle')}
                  </p>
                </div>

                {step === 'view' ? (
                  <div className="space-y-6">
                    <div>
                      <h3 className="text-[11px] md:text-[13px] font-sans font-medium uppercase tracking-wider text-neutral-400 mb-4">
                        {t('mySchedule')}
                      </h3>
                      <div className="grid grid-cols-2 gap-2">
                        {SCHEDULE.map((item) => (
                          <div
                            key={item.time}
                            className={`p-3 border flex justify-between items-center rounded-[2px] ${
                              item.status === 'available'
                                ? 'border-neutral-200 dark:border-neutral-800'
                                : 'border-neutral-100 dark:border-neutral-900 opacity-40'
                            }`}
                          >
                            <span className="text-[13px] font-mono">{item.time}</span>
                            <span className={`text-[10px] uppercase tracking-tighter font-sans ${
                              item.status === 'available' ? 'text-neutral-900 dark:text-neutral-100' : 'text-neutral-400'
                            }`}>
                              {item.status === 'available' ? t('available') : t('busy')}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                    <button
                      onClick={() => setStep('form')}
                      className="w-full py-3 bg-neutral-900 dark:bg-neutral-100 text-white dark:text-black text-[11px] md:text-[13px] font-sans font-medium uppercase tracking-wider hover:opacity-80 transition-all rounded-[2px]"
                    >
                      {t('submit')}
                    </button>
                  </div>
                ) : (
                  <form onSubmit={handleSubmit} className="space-y-4">
                    {(['name', 'email', 'message'] as const).map((field) => (
                      <div key={field} className="space-y-1">
                        <label className="text-[10px] uppercase tracking-wider text-neutral-400 font-sans">
                          {t(field)}
                        </label>
                        {field === 'message' ? (
                          <textarea
                            required
                            rows={3}
                            value={formData[field]}
                            onChange={(e) => setFormData({ ...formData, [field]: e.target.value })}
                            className="w-full bg-transparent border-b border-neutral-200 dark:border-neutral-800 py-2 text-[13px] font-serif focus:outline-none focus:border-neutral-900 dark:focus:border-neutral-100 transition-colors resize-none"
                          />
                        ) : (
                          <input
                            required
                            type={field === 'email' ? 'email' : 'text'}
                            value={formData[field]}
                            onChange={(e) => setFormData({ ...formData, [field]: e.target.value })}
                            className="w-full bg-transparent border-b border-neutral-200 dark:border-neutral-800 py-2 text-[13px] font-serif focus:outline-none focus:border-neutral-900 dark:focus:border-neutral-100 transition-colors"
                          />
                        )}
                      </div>
                    ))}
                    <div className="pt-4 flex gap-3">
                      <button
                        type="button"
                        onClick={() => setStep('view')}
                        className="flex-1 py-3 border border-neutral-200 dark:border-neutral-800 text-[11px] md:text-[13px] font-sans font-medium uppercase tracking-wider hover:bg-neutral-50 dark:hover:bg-neutral-900 transition-all rounded-[2px]"
                      >
                        {t('back')}
                      </button>
                      <button
                        type="submit"
                        className="flex-1 py-3 bg-neutral-900 dark:bg-neutral-100 text-white dark:text-black text-[11px] md:text-[13px] font-sans font-medium uppercase tracking-wider hover:opacity-80 transition-all rounded-[2px]"
                      >
                        {t('submit')}
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
