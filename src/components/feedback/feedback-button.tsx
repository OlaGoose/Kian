'use client';

import { useState, useRef, useEffect, type FormEvent } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  MessageSquare,
  X,
  Mic,
  Square,
  Play,
  Pause,
  Trash2,
} from 'lucide-react';
import { useTranslations } from 'next-intl';
import { usePathname } from 'next/navigation';

const MAX_RECORD_SECONDS = 60;

function AudioPlayer({ src, onDelete, deleteLabel }: { src: string; onDelete: () => void; deleteLabel: string }) {
  const audioRef = useRef<HTMLAudioElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    return () => {
      audioRef.current?.pause();
    };
  }, []);

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
            setProgress((audioRef.current.currentTime / audioRef.current.duration) * 100 || 0);
          }
        }}
        onEnded={() => { setIsPlaying(false); setProgress(0); }}
      />
      <button
        type="button"
        onClick={togglePlay}
        className="p-1.5 text-neutral-900 dark:text-neutral-100 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors rounded-[2px]"
      >
        {isPlaying
          ? <Pause size={14} fill="currentColor" strokeWidth={0} />
          : <Play size={14} fill="currentColor" strokeWidth={0} />
        }
      </button>
      <div className="flex-1 h-[1px] bg-neutral-200 dark:bg-neutral-800 relative overflow-hidden">
        <motion.div
          className="absolute inset-y-0 left-0 bg-neutral-900 dark:bg-neutral-100"
          animate={{ width: `${progress}%` }}
          transition={{ type: 'spring', bounce: 0, duration: 0.1 }}
        />
      </div>
      <button
        type="button"
        onClick={onDelete}
        className="p-1.5 text-neutral-400 hover:text-red-500 transition-colors"
        aria-label={deleteLabel}
      >
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
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [isRecording, setIsRecording] = useState(false);
  const [recordingSeconds, setRecordingSeconds] = useState(0);
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [permissionError, setPermissionError] = useState<string | null>(null);

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const secondsRef = useRef(0);

  const clearTimer = () => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
    secondsRef.current = 0;
    setRecordingSeconds(0);
  };

  const stopRecording = () => {
    clearTimer();
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
      mediaRecorderRef.current.stop();
    }
    setIsRecording(false);
  };

  const startRecording = async () => {
    setPermissionError(null);
    setAudioBlob(null);
    if (audioUrl) {
      URL.revokeObjectURL(audioUrl);
      setAudioUrl(null);
    }
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });

      const preferredTypes = [
        'audio/webm;codecs=opus',
        'audio/webm',
        'audio/ogg;codecs=opus',
        'audio/mp4',
      ];
      const mimeType = preferredTypes.find((t) => MediaRecorder.isTypeSupported(t)) ?? '';
      const mediaRecorder = mimeType
        ? new MediaRecorder(stream, { mimeType })
        : new MediaRecorder(stream);

      mediaRecorderRef.current = mediaRecorder;
      chunksRef.current = [];

      mediaRecorder.ondataavailable = (e) => {
        if (e.data.size > 0) chunksRef.current.push(e.data);
      };
      mediaRecorder.onstop = () => {
        const recordedMime = mediaRecorder.mimeType || mimeType || 'audio/webm';
        const blob = new Blob(chunksRef.current, { type: recordedMime });
        setAudioBlob(blob);
        setAudioUrl(URL.createObjectURL(blob));
        stream.getTracks().forEach((t) => t.stop());
      };

      mediaRecorder.start();
      setIsRecording(true);

      secondsRef.current = 0;
      setRecordingSeconds(0);
      timerRef.current = setInterval(() => {
        secondsRef.current += 1;
        setRecordingSeconds(secondsRef.current);
        if (secondsRef.current >= MAX_RECORD_SECONDS) {
          stopRecording();
        }
      }, 1000);
    } catch (err) {
      setPermissionError(err instanceof Error ? err.message : t('voice.permissionDenied'));
    }
  };

  const deleteRecording = () => {
    if (audioUrl) URL.revokeObjectURL(audioUrl);
    setAudioBlob(null);
    setAudioUrl(null);
  };

  const resetState = () => {
    clearTimer();
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
      mediaRecorderRef.current.stop();
    }
    mediaRecorderRef.current = null;
    if (audioUrl) URL.revokeObjectURL(audioUrl);
    setMode('text');
    setFeedback('');
    setIsSubmitted(false);
    setSubmitError(null);
    setIsSubmitting(false);
    setIsRecording(false);
    setAudioBlob(null);
    setAudioUrl(null);
    setPermissionError(null);
  };

  const handleClose = () => {
    setIsOpen(false);
    setTimeout(resetState, 300);
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (mode === 'text' && !feedback.trim()) return;
    if (mode === 'voice' && !audioBlob) return;

    setIsSubmitting(true);
    setSubmitError(null);

    try {
      let res: Response;

      if (mode === 'voice' && audioBlob) {
        const ext = audioBlob.type.includes('mp4') ? 'mp4'
          : audioBlob.type.includes('ogg') ? 'ogg'
          : 'webm';
        const formData = new FormData();
        formData.append('type', 'voice');
        formData.append('page_path', pathname);
        formData.append('audio', audioBlob, `voice-feedback.${ext}`);
        res = await fetch('/api/feedback', { method: 'POST', body: formData });
      } else {
        res = await fetch('/api/feedback', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ content: feedback.trim(), type: 'text', page_path: pathname }),
        });
      }

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        setSubmitError((data as { error?: string }).error ?? t('submitError'));
        return;
      }

      setIsSubmitted(true);
      setTimeout(() => {
        setIsOpen(false);
        setTimeout(resetState, 300);
      }, 2000);
    } catch {
      setSubmitError(t('submitError'));
    } finally {
      setIsSubmitting(false);
    }
  };

  const timeLeft = MAX_RECORD_SECONDS - recordingSeconds;

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-5 right-5 md:bottom-7 md:right-7 p-2.5 bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 text-neutral-400 hover:text-neutral-900 dark:hover:text-neutral-100 transition-all shadow-sm hover:shadow z-40 active:scale-95 rounded-[2px]"
        aria-label={t('title')}
      >
        <MessageSquare className="w-[18px] h-[18px]" strokeWidth={1.5} />
      </button>

      <AnimatePresence>
        {isOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.15 }}
              onClick={handleClose}
              className="fixed inset-0 bg-black/5 dark:bg-black/30 z-50"
            />

            <div className="fixed inset-0 flex items-end md:items-center justify-center z-50 pointer-events-none px-0 md:px-4">
              <motion.div
                initial={{ opacity: 0, y: 24 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 24 }}
                transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
                className="pointer-events-auto w-full md:max-w-[480px] bg-white dark:bg-[#0a0a0a] border border-neutral-200 dark:border-neutral-800 border-b-0 md:border-b rounded-t-[4px] md:rounded-[2px] px-6 pt-6 pb-8 md:px-8 md:pt-8 md:pb-8 shadow-2xl"
              >
                <div className="flex justify-center mb-6 md:hidden">
                  <div className="w-10 h-[3px] bg-neutral-200 dark:bg-neutral-800 rounded-full" />
                </div>

                <div className="flex justify-between items-start mb-5">
                  <div>
                    <h2 className="text-[16px] md:text-[18px] font-medium text-neutral-900 dark:text-neutral-100">
                      {t('title')}
                    </h2>
                    <p className="text-[13px] md:text-[15px] text-neutral-500 dark:text-neutral-500 mt-1 leading-relaxed">
                      {t('description')}
                    </p>
                  </div>
                  <button
                    onClick={handleClose}
                    className="ml-4 mt-0.5 text-neutral-400 hover:text-neutral-900 dark:hover:text-neutral-100 transition-colors flex-shrink-0"
                    aria-label={t('close')}
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>

                {isSubmitted ? (
                  <motion.div
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="py-8 text-center text-[15px] md:text-[17px] text-neutral-900 dark:text-neutral-100"
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
                          className="w-full bg-white dark:bg-neutral-900/30 border border-neutral-200 dark:border-neutral-800 rounded-[2px] p-3.5 pr-11 text-[14px] md:text-[16px] focus:outline-none focus:border-neutral-400 dark:focus:border-neutral-600 transition-colors placeholder:text-neutral-400 dark:placeholder:text-neutral-600 min-h-[140px] resize-none leading-relaxed"
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
                              className={`p-6 transition-all ${isRecording ? 'text-red-500' : 'text-neutral-400 hover:text-neutral-900 dark:hover:text-neutral-100'}`}
                            >
                              {isRecording
                                ? <Square className="w-10 h-10" strokeWidth={1.5} fill="currentColor" />
                                : <Mic className="w-10 h-10" strokeWidth={1.5} />
                              }
                            </button>
                            {isRecording && (
                              <div className="flex flex-col items-center gap-1">
                                <span className="text-[12px] text-red-500 font-mono animate-pulse">
                                  {t('voice.recording')}
                                </span>
                                <span className="text-[11px] text-neutral-400 dark:text-neutral-600 font-mono tabular-nums">
                                  {t('voice.timeLeft', { seconds: timeLeft })}
                                </span>
                              </div>
                            )}
                          </>
                        ) : (
                          <div className="w-full">
                            <AudioPlayer
                              src={audioUrl}
                              onDelete={deleteRecording}
                              deleteLabel={t('voice.delete')}
                            />
                          </div>
                        )}
                        {permissionError && (
                          <p className="mt-2 text-[11px] md:text-[13px] text-red-500 text-center px-4">
                            {permissionError}
                          </p>
                        )}
                      </div>
                    )}

                    {submitError && (
                      <p className="text-[12px] text-red-500">{submitError}</p>
                    )}

                    <button
                      type="submit"
                      disabled={
                        isSubmitting ||
                        (mode === 'text' && !feedback.trim()) ||
                        (mode === 'voice' && !audioBlob)
                      }
                      className="w-full py-2.5 bg-neutral-900 dark:bg-neutral-100 text-white dark:text-black text-[12px] md:text-[14px] font-medium uppercase tracking-wider hover:opacity-80 transition-all active:scale-[0.99] disabled:opacity-25 rounded-[2px]"
                    >
                      {isSubmitting ? t('submitting') : t('submit')}
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
