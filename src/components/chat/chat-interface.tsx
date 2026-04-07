'use client';

import { useState, useRef, useEffect } from 'react';
import { motion } from 'motion/react';
import { ArrowUp, Plus, Loader2 } from 'lucide-react';
import { useLocale, useTranslations } from 'next-intl';
import { BackLink } from '@/components/layout/back-link';
import { SiteHeader } from '@/components/layout/site-header';

interface Message {
  role: 'user' | 'model';
  text: string;
}

interface ChatInterfaceProps {
  siteName: string;
}

export function ChatInterface({ siteName }: ChatInterfaceProps) {
  const locale = useLocale();
  const t = useTranslations('chat');
  const navT = useTranslations('nav');
  const prefix = locale === 'zh' ? '/zh' : '';

  const [messages, setMessages] = useState<Message[]>([
    { role: 'model', text: t('intro') },
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;

    const userText = input.trim();
    setInput('');
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
    }

    const updatedMessages: Message[] = [
      ...messages,
      { role: 'user', text: userText },
    ];
    setMessages(updatedMessages);
    setIsLoading(true);

    // Optimistic placeholder for streaming
    setMessages((prev) => [...prev, { role: 'model', text: '' }]);

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: updatedMessages,
          locale,
        }),
      });

      if (!res.ok || !res.body) {
        throw new Error('Failed to get response');
      }

      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let accumulated = '';

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value);
        const lines = chunk.split('\n');

        for (const line of lines) {
          if (line.startsWith('data: ')) {
            const data = line.slice(6);
            if (data === '[DONE]') break;
            try {
              const parsed = JSON.parse(data);
              accumulated += parsed.text ?? '';
              setMessages((prev) => {
                const next = [...prev];
                next[next.length - 1] = { role: 'model', text: accumulated };
                return next;
              });
            } catch {
              // Ignore parse errors on partial chunks
            }
          }
        }
      }
    } catch {
      setMessages((prev) => {
        const next = [...prev];
        next[next.length - 1] = {
          role: 'model',
          text: locale === 'zh' ? '抱歉，出现了错误，请重试。' : 'Sorry, something went wrong. Please try again.',
        };
        return next;
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen font-serif bg-white dark:bg-[#050505] flex flex-col">
      <main className="max-w-[640px] w-full mx-auto px-6 pt-10 pb-32 md:pt-24 md:pb-40 flex-1 flex flex-col">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="flex flex-col h-full"
        >
          <div className="flex items-center justify-between mb-12">
            <BackLink href={prefix || '/'} label={t('back')} />
          </div>

          <div
            ref={scrollRef}
            className="flex-1 overflow-y-auto space-y-8 mb-8 no-scrollbar"
          >
            {messages.map((m, i) => (
              <div key={i} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div
                  className={`max-w-[90%] text-copy whitespace-pre-wrap ${
                    m.role === 'user'
                      ? 'text-neutral-500'
                      : 'text-neutral-900 dark:text-neutral-100'
                  }`}
                >
                  {m.text || (isLoading && i === messages.length - 1 ? (
                    <span className="flex items-center gap-2 text-neutral-400">
                      <Loader2 className="w-3 h-3 animate-spin" />
                      {t('thinking')}
                    </span>
                  ) : null)}
                </div>
              </div>
            ))}
          </div>
        </motion.div>
      </main>

      {/* Fixed bottom input */}
      <div className="fixed bottom-0 left-0 right-0 bg-white/80 dark:bg-[#050505]/80 backdrop-blur-md">
        <div className="max-w-[640px] mx-auto px-6 py-4 md:py-6">
          <div className="flex flex-col bg-white dark:bg-neutral-900/30 rounded-[2px] border border-neutral-200 dark:border-neutral-800 transition-all duration-300">
            <div className="p-2 px-3">
              <textarea
                ref={textareaRef}
                rows={1}
                value={input}
                onChange={(e) => {
                  setInput(e.target.value);
                  e.target.style.height = 'auto';
                  e.target.style.height = e.target.scrollHeight + 'px';
                }}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    handleSend();
                  }
                }}
                placeholder={t('placeholder')}
                className="w-full bg-transparent resize-none focus:outline-none text-[13px] md:text-[17px] font-serif placeholder:text-neutral-400 max-h-40 no-scrollbar py-1"
                style={{ height: 'auto' }}
              />
            </div>

            <div className="flex items-center justify-between px-2 pb-2">
              <div className="flex items-center gap-0.5">
                <button className="p-1.5 rounded-[2px] hover:bg-neutral-100 dark:hover:bg-neutral-800 text-neutral-400 transition-colors" aria-label={t('attach')}>
                  <Plus className="w-3 h-3 md:w-3.5 md:h-3.5" strokeWidth={1.5} />
                </button>
                <div className="h-3 w-[1px] bg-neutral-100 dark:bg-neutral-800 mx-1" />
                <span className="text-[8px] md:text-[12px] font-sans font-medium text-neutral-400 uppercase tracking-widest px-1">
                  Gemini 2.0 Flash
                </span>
              </div>

              <button
                onClick={handleSend}
                disabled={isLoading || !input.trim()}
                className="p-1.5 rounded-[2px] bg-neutral-900 dark:bg-neutral-100 text-white dark:text-black disabled:opacity-20 hover:opacity-80 transition-all active:scale-95"
                aria-label={t('send')}
              >
                <ArrowUp className="w-3 h-3 md:w-3.5 md:h-3.5" strokeWidth={2.5} />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
