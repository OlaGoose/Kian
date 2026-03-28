'use client';

import { useState, useRef, type FormEvent } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  MessageSquare,
  X,
  Mic,
  Square,
  Play,
  Trash2,
} from 'lucide-react';
import { useTranslations } from 'next-intl';
import { usePathname } from 'next/navigation';

function AudioPlayer({ src, onDelete, deleteLabel }: { src: string; onDelete: () => void; deleteLabel: string }) {
  const audioRef = useRef<HTMLAudioElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0);

  const togglePlay = () => {
    if (!audioRef.current) return;
    if (isPlaying) {
      audioRef.current.pause();
    } else {
      audioRef.current.play();
    }
    setIsPlaying(!isPlaying);
  };

  return (
    <div className="w-full flex items-center gap-3 py-2">
      <audio
        ref={audioRef}
        src={src}
        onTimeUpdate={() => {
          if (audioRef.current) {
            setProgress((audioRef.current.currentTime / audioRef.current.duration) * 100);
          }
        }}
        onEnded={() => { setIsPlaying(false); setProgress(0); }}
      />
      <button type="button" onClick={togglePlay} className="p-1.5 text-neutral-900 dark:text-neutral-100 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors rounded-[2px]">
        {isPlaying ? <Square size={14} fill="currentColor" /> : <Play size={14} fill="currentColor" />}
      </button>
      <div className="flex-1 h-[1px] bg-neutral-200 dark:bg-neutral-800 relative overflow-hidden">
        <motion.div
          className="absolute inset-y-0 left-0 bg-neutral-900 dark:bg-neutral-100"
          animate={{ width: `${progress}%` }}
          transition={{ type: 'spring', bounce: 0, duration: 0.1 }}
        />
      </div>
      <button type="button" onClick={onDelete} className="p-1.5 text-neutral-400 hover:text-red-500 transition-colors" aria-label={deleteLabel}>
        <Trash2 size={14} strokeWidth={1.5} />
      </button>
    </div>
  );
}

export function FeedbackButton() {
  const t = useTranslations('feedback');
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);
  const [mode, setMode] = useState<'text' | 'voice'>('text');
  const [feedback, setFeedback] = useState('');
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [permissionError, setPermissionError] = useState<string | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);

  const startRecording = async () => {
    setPermissionError(null);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      chunksRef.current = [];

      mediaRecorder.ondataavailable = (e) => {
        if (e.data.size > 0) chunksRef.current.push(e.data);
      };
      mediaRecorder.onstop = () => {
        const blob = new Blob(chunksRef.current, { type: 'audio/webm' });
        setAudioBlob(blob);
        setAudioUrl(URL.createObjectURL(blob));
        stream.getTracks().forEach((t) => t.stop());
      };
      mediaRecorder.start();
      setIsRecording(true);
    } catch (err) {
      setPermissionError(err instanceof Error ? err.message : 'Permission denied');
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
    }
  };

  const handleClose = () => {
    setIsOpen(false);
    setMode('text');
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (mode === 'text' && !feedback.trim()) return;
    if (mode === 'voice' && !audioBlob) return;

    try {
      await fetch('/api/feedback', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          content: mode === 'text' ? feedback : '[Voice feedback]',
          type: mode,
          page_path: pathname,
        }),
      });
    } catch {
      // Best-effort; don't block the success UX
    }

    setIsSubmitted(true);
    setFeedback('');
    setAudioBlob(null);
    setAudioUrl(null);
    setTimeout(() => {
      setIsSubmitted(false);
      setIsOpen(false);
      setMode('text');
    }, 2000);
  };

  return (
    <>
      {/* FAB trigger */}
      <button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-5 right-5 md:bottom-7 md:right-7 p-2.5 bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 text-neutral-400 hover:text-neutral-900 dark:hover:text-neutral-100 transition-all shadow-sm hover:shadow z-40 active:scale-95 rounded-[2px]"
        aria-label="Feedback"
      >
        <MessageSquare className="w-[18px] h-[18px]" strokeWidth={1.5} />
      </button>

      <AnimatePresence>
        {isOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.15 }}
              onClick={handleClose}
              className="fixed inset-0 bg-black/5 dark:bg-black/30 z-50"
            />

            {/* Modal container — bottom-sheet on mobile, centered on desktop */}
            <div className="fixed inset-0 flex items-end md:items-center justify-center z-50 pointer-events-none px-0 md:px-4">
              <motion.div
                initial={{ opacity: 0, y: 24 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 24 }}
                transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
                className="pointer-events-auto w-full md:max-w-[480px] bg-white dark:bg-[#0a0a0a] border border-neutral-200 dark:border-neutral-800 border-b-0 md:border-b rounded-t-[4px] md:rounded-[2px] px-6 pt-6 pb-8 md:px-8 md:pt-8 md:pb-8 shadow-2xl"
              >
                {/* Drag handle — mobile only */}
                <div className="flex justify-center mb-6 md:hidden">
                  <div className="w-10 h-[3px] bg-neutral-200 dark:bg-neutral-800 rounded-full" />
                </div>

                <div className="flex justify-between items-start mb-5">
                  <div>
                    <h2 className="text-[16px] font-medium text-neutral-900 dark:text-neutral-100">
                      {t('title')}
                    </h2>
                    <p className="text-[13px] text-neutral-500 dark:text-neutral-500 mt-1 leading-relaxed">
                      {t('description')}
                    </p>
                  </div>
                  <button
                    onClick={handleClose}
                    className="ml-4 mt-0.5 text-neutral-400 hover:text-neutral-900 dark:hover:text-neutral-100 transition-colors flex-shrink-0"
                    aria-label="Close"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>

                {isSubmitted ? (
                  <motion.div
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="py-8 text-center text-[15px] text-neutral-900 dark:text-neutral-100"
                  >
                    {t('success')}
                  </motion.div>
                ) : (
                  <form onSubmit={handleSubmit} className="space-y-4">
                    {mode === 'text' ? (
                      <div className="relative">
                        <textarea
                          autoFocus
                          value={feedback}
                          onChange={(e) => setFeedback(e.target.value)}
                          placeholder={t('placeholder')}
                          className="w-full bg-white dark:bg-neutral-900/30 border border-neutral-200 dark:border-neutral-800 rounded-[2px] p-3.5 pr-11 text-[14px] focus:outline-none focus:border-neutral-400 dark:focus:border-neutral-600 transition-colors placeholder:text-neutral-400 dark:placeholder:text-neutral-600 min-h-[140px] resize-none leading-relaxed"
                        />
                        <button
                          type="button"
                          onClick={() => setMode('voice')}
                          className="absolute bottom-3.5 right-3.5 p-1 text-neutral-400 hover:text-neutral-900 dark:hover:text-neutral-100 transition-colors"
                          title={t('voice.record')}
                        >
                          <Mic className="w-4 h-4" strokeWidth={1.5} />
                        </button>
                      </div>
                    ) : (
                      <div className={`flex flex-col items-center justify-center rounded-[2px] relative transition-all ${!audioUrl ? 'min-h-[140px] bg-neutral-50 dark:bg-neutral-900/30 border border-neutral-200 dark:border-neutral-800 p-4' : 'min-h-[40px]'}`}>
                        {!audioUrl ? (
                          <>
                            <button
                              type="button"
                              onClick={isRecording ? stopRecording : startRecording}
                              className={`p-6 transition-all ${isRecording ? 'text-red-500 animate-pulse' : 'text-neutral-400 hover:text-neutral-900 dark:hover:text-neutral-100'}`}
                            >
                              {isRecording
                                ? <Square className="w-10 h-10" strokeWidth={1.5} fill="currentColor" />
                                : <Mic className="w-10 h-10" strokeWidth={1.5} />
                              }
                            </button>
                            <button
                              type="button"
                              onClick={() => setMode('text')}
                              className="absolute top-2.5 right-2.5 text-neutral-400 hover:text-neutral-900 dark:hover:text-neutral-100 transition-colors"
                              title="Switch to text"
                            >
                              <X className="w-3.5 h-3.5" strokeWidth={1.5} />
                            </button>
                          </>
                        ) : (
                          <div className="w-full">
                            <AudioPlayer src={audioUrl} onDelete={() => { setAudioBlob(null); setAudioUrl(null); }} deleteLabel={t('voice.delete')} />
                          </div>
                        )}
                        {permissionError && (
                          <p className="absolute bottom-2 text-[11px] text-red-500 text-center px-4">{permissionError}</p>
                        )}
                      </div>
                    )}

                    <button
                      type="submit"
                      disabled={(mode === 'text' && !feedback.trim()) || (mode === 'voice' && !audioBlob)}
                      className="w-full py-2.5 bg-neutral-900 dark:bg-neutral-100 text-white dark:text-black text-[12px] font-medium uppercase tracking-wider hover:opacity-80 transition-all active:scale-[0.99] disabled:opacity-25 rounded-[2px]"
                    >
                      {t('submit')}
                    </button>
                  </form>
                )}
              </motion.div>
            </div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
