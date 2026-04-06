'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { ChevronDown, ChevronUp, LogOut, MessageSquare, CalendarDays, BarChart2 } from 'lucide-react';

type BookingStatus = 'pending' | 'confirmed' | 'rejected';
type AdminTab = 'bookings' | 'feedback' | 'analytics';

interface Booking {
  id: string;
  name: string;
  email: string;
  message: string;
  meeting_type: 'online' | 'inperson';
  date: string;
  time: string;
  status: BookingStatus;
  admin_note: string | null;
  created_at: string;
}

interface Feedback {
  id: string;
  content: string | null;
  type: 'text' | 'voice';
  page_path: string | null;
  created_at: string;
}

const STATUS_LABELS: Record<BookingStatus, string> = {
  pending: 'Pending',
  confirmed: 'Confirmed',
  rejected: 'Rejected',
};

const STATUS_COLORS: Record<BookingStatus, string> = {
  pending: 'text-amber-600 dark:text-amber-500',
  confirmed: 'text-emerald-600 dark:text-emerald-500',
  rejected: 'text-neutral-400 dark:text-neutral-600',
};

function formatDate(dateStr: string) {
  const d = new Date(dateStr + 'T00:00:00');
  return d.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
}

function formatDateTime(isoStr: string) {
  return new Date(isoStr).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

function BookingRow({ booking, onUpdate }: { booking: Booking; onUpdate: () => void }) {
  const [expanded, setExpanded] = useState(false);
  const [note, setNote] = useState(booking.admin_note ?? '');
  const [saving, setSaving] = useState(false);

  const updateStatus = async (status: BookingStatus) => {
    setSaving(true);
    try {
      const res = await fetch(`/api/admin/bookings/${booking.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status, admin_note: note || null }),
      });
      if (res.ok) onUpdate();
    } finally {
      setSaving(false);
    }
  };

  const saveNote = async () => {
    setSaving(true);
    try {
      const res = await fetch(`/api/admin/bookings/${booking.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: booking.status, admin_note: note || null }),
      });
      if (res.ok) onUpdate();
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="border-b border-neutral-100 dark:border-neutral-900 last:border-0">
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full py-4 flex items-center gap-4 text-left hover:bg-neutral-50 dark:hover:bg-neutral-900/30 transition-colors px-4 -mx-4"
      >
        <div className="flex-1 min-w-0 grid grid-cols-[1fr_auto_auto_auto] gap-4 items-center">
          <span className="text-[13px] text-neutral-900 dark:text-neutral-100 truncate font-medium">
            {booking.name}
          </span>
          <span className="font-mono text-[12px] text-neutral-500 dark:text-neutral-500 whitespace-nowrap">
            {formatDate(booking.date)} {booking.time}
          </span>
          <span className="text-[11px] uppercase tracking-wider font-sans text-neutral-400 dark:text-neutral-600 whitespace-nowrap">
            {booking.meeting_type === 'inperson' ? 'In-Person' : 'Online'}
          </span>
          <span
            className={`text-[11px] uppercase tracking-wider font-sans whitespace-nowrap ${STATUS_COLORS[booking.status]}`}
          >
            {STATUS_LABELS[booking.status]}
          </span>
        </div>
        <span className="text-neutral-400 dark:text-neutral-600 flex-shrink-0">
          {expanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
        </span>
      </button>

      {expanded && (
        <div className="pb-5 space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-[10px] uppercase tracking-wider text-neutral-400 dark:text-neutral-600 font-sans mb-1">
                Email
              </p>
              <p className="text-[13px] text-neutral-900 dark:text-neutral-100">{booking.email}</p>
            </div>
            <div>
              <p className="text-[10px] uppercase tracking-wider text-neutral-400 dark:text-neutral-600 font-sans mb-1">
                Submitted
              </p>
              <p className="text-[13px] text-neutral-500 dark:text-neutral-500">
                {formatDateTime(booking.created_at)}
              </p>
            </div>
          </div>

          <div>
            <p className="text-[10px] uppercase tracking-wider text-neutral-400 dark:text-neutral-600 font-sans mb-1">
              Message
            </p>
            <p className="text-[13px] text-neutral-700 dark:text-neutral-300 leading-relaxed">
              {booking.message}
            </p>
          </div>

          <div>
            <p className="text-[10px] uppercase tracking-wider text-neutral-400 dark:text-neutral-600 font-sans mb-1">
              Admin Note
            </p>
            <div className="flex gap-2">
              <input
                type="text"
                value={note}
                onChange={(e) => setNote(e.target.value)}
                placeholder="Internal note…"
                className="flex-1 bg-transparent border-b border-neutral-200 dark:border-neutral-800 py-1.5 text-[13px] focus:outline-none focus:border-neutral-900 dark:focus:border-neutral-100 transition-colors placeholder:text-neutral-400 dark:placeholder:text-neutral-600"
              />
              <button
                onClick={saveNote}
                disabled={saving}
                className="text-[11px] uppercase tracking-wider font-sans text-neutral-400 dark:text-neutral-600 hover:text-neutral-900 dark:hover:text-neutral-100 transition-colors disabled:opacity-30 whitespace-nowrap"
              >
                Save
              </button>
            </div>
          </div>

          <div className="flex gap-2 pt-1">
            {booking.status !== 'confirmed' && (
              <button
                onClick={() => updateStatus('confirmed')}
                disabled={saving}
                className="flex-1 py-2 bg-neutral-900 dark:bg-neutral-100 text-white dark:text-black text-[11px] font-sans font-medium uppercase tracking-wider hover:opacity-80 transition-all rounded-[2px] disabled:opacity-25 active:scale-[0.99]"
              >
                Confirm
              </button>
            )}
            {booking.status !== 'rejected' && (
              <button
                onClick={() => updateStatus('rejected')}
                disabled={saving}
                className="flex-1 py-2 border border-neutral-200 dark:border-neutral-800 text-[11px] font-sans font-medium uppercase tracking-wider hover:border-neutral-400 dark:hover:border-neutral-600 transition-all rounded-[2px] disabled:opacity-25"
              >
                Reject
              </button>
            )}
            {booking.status !== 'pending' && (
              <button
                onClick={() => updateStatus('pending')}
                disabled={saving}
                className="flex-1 py-2 border border-neutral-200 dark:border-neutral-800 text-[11px] font-sans font-medium uppercase tracking-wider hover:border-neutral-400 dark:hover:border-neutral-600 transition-all rounded-[2px] disabled:opacity-25 text-neutral-500"
              >
                Reset
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

function FeedbackRow({ item }: { item: Feedback }) {
  const [expanded, setExpanded] = useState(false);
  return (
    <div className="border-b border-neutral-100 dark:border-neutral-900 last:border-0">
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full py-4 flex items-center gap-4 text-left hover:bg-neutral-50 dark:hover:bg-neutral-900/30 transition-colors px-4 -mx-4"
      >
        <div className="flex-1 min-w-0 grid grid-cols-[1fr_auto_auto] gap-4 items-center">
          <span className="text-[13px] text-neutral-700 dark:text-neutral-300 truncate">
            {item.content ?? '—'}
          </span>
          <span className="text-[11px] uppercase tracking-wider font-sans text-neutral-400 dark:text-neutral-600 whitespace-nowrap">
            {item.type}
          </span>
          <span className="font-mono text-[12px] text-neutral-400 dark:text-neutral-600 whitespace-nowrap">
            {formatDateTime(item.created_at)}
          </span>
        </div>
        <span className="text-neutral-400 dark:text-neutral-600 flex-shrink-0">
          {expanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
        </span>
      </button>

      {expanded && (
        <div className="pb-5 space-y-3">
          {item.page_path && (
            <div>
              <p className="text-[10px] uppercase tracking-wider text-neutral-400 dark:text-neutral-600 font-sans mb-1">
                Page
              </p>
              <p className="text-[13px] font-mono text-neutral-500 dark:text-neutral-500">
                {item.page_path}
              </p>
            </div>
          )}
          <div>
            <p className="text-[10px] uppercase tracking-wider text-neutral-400 dark:text-neutral-600 font-sans mb-1">
              Content
            </p>
            <p className="text-[13px] text-neutral-700 dark:text-neutral-300 leading-relaxed whitespace-pre-wrap">
              {item.content ?? '—'}
            </p>
          </div>
        </div>
      )}
    </div>
  );
}

function BookingsPanel({ onUnauth }: { onUnauth: () => void }) {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [filter, setFilter] = useState<BookingStatus | 'all'>('all');
  const [loading, setLoading] = useState(true);

  const fetchBookings = useCallback(async () => {
    setLoading(true);
    try {
      const url =
        filter === 'all' ? '/api/admin/bookings' : `/api/admin/bookings?status=${filter}`;
      const res = await fetch(url);
      if (res.status === 401) { onUnauth(); return; }
      const data = await res.json();
      setBookings(data.bookings ?? []);
    } finally {
      setLoading(false);
    }
  }, [filter, onUnauth]);

  useEffect(() => { fetchBookings(); }, [fetchBookings]);

  const filters: { value: BookingStatus | 'all'; label: string }[] = [
    { value: 'all', label: 'All' },
    { value: 'pending', label: 'Pending' },
    { value: 'confirmed', label: 'Confirmed' },
    { value: 'rejected', label: 'Rejected' },
  ];

  const counts = {
    all: bookings.length,
    pending: bookings.filter((b) => b.status === 'pending').length,
    confirmed: bookings.filter((b) => b.status === 'confirmed').length,
    rejected: bookings.filter((b) => b.status === 'rejected').length,
  };

  const filtered = filter === 'all' ? bookings : bookings.filter((b) => b.status === filter);

  return (
    <>
      <div className="flex gap-1 mb-6">
        {filters.map((f) => (
          <button
            key={f.value}
            onClick={() => setFilter(f.value)}
            className={`px-3 py-1.5 text-[11px] uppercase tracking-wider font-sans rounded-[2px] transition-colors ${
              filter === f.value
                ? 'bg-neutral-900 dark:bg-neutral-100 text-white dark:text-black'
                : 'text-neutral-400 dark:text-neutral-600 hover:text-neutral-900 dark:hover:text-neutral-100'
            }`}
          >
            {f.label}
            {counts[f.value] > 0 && <span className="ml-1.5 opacity-60">{counts[f.value]}</span>}
          </button>
        ))}
      </div>

      <div className="h-[1px] bg-neutral-100 dark:bg-neutral-900 mb-4" />

      {loading ? (
        <p className="text-[13px] text-neutral-400 dark:text-neutral-600 py-8 text-center font-sans">Loading…</p>
      ) : filtered.length === 0 ? (
        <p className="text-[13px] text-neutral-400 dark:text-neutral-600 py-8 text-center font-sans">No bookings</p>
      ) : (
        filtered.map((b) => <BookingRow key={b.id} booking={b} onUpdate={fetchBookings} />)
      )}
    </>
  );
}

function FeedbackPanel({ onUnauth }: { onUnauth: () => void }) {
  const [items, setItems] = useState<Feedback[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchFeedback = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/admin/feedback');
      if (res.status === 401) { onUnauth(); return; }
      const data = await res.json();
      setItems(data.feedback ?? []);
    } finally {
      setLoading(false);
    }
  }, [onUnauth]);

  useEffect(() => { fetchFeedback(); }, [fetchFeedback]);

  return (
    <>
      <div className="h-[1px] bg-neutral-100 dark:bg-neutral-900 mb-4" />
      {loading ? (
        <p className="text-[13px] text-neutral-400 dark:text-neutral-600 py-8 text-center font-sans">Loading…</p>
      ) : items.length === 0 ? (
        <p className="text-[13px] text-neutral-400 dark:text-neutral-600 py-8 text-center font-sans">No feedback</p>
      ) : (
        items.map((item) => <FeedbackRow key={item.id} item={item} />)
      )}
    </>
  );
}

type GAPageRow = {
  path: string;
  pageviews: number;
  sessions: number;
};

type GAReport = {
  users: number;
  sessions: number;
  pageviews: number;
  pages: GAPageRow[];
};

type DateRange = 7 | 28 | 90;

function StatCard({ label, value }: { label: string; value: number }) {
  return (
    <div className="border border-neutral-100 dark:border-neutral-900 rounded-[2px] p-4">
      <p className="text-[10px] uppercase tracking-wider text-neutral-400 dark:text-neutral-600 font-sans mb-2">
        {label}
      </p>
      <p className="text-[22px] font-medium text-neutral-900 dark:text-neutral-100 leading-none">
        {value.toLocaleString()}
      </p>
    </div>
  );
}

function AnalyticsPanel({ onUnauth }: { onUnauth: () => void }) {
  const [report, setReport] = useState<GAReport | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [days, setDays] = useState<DateRange>(28);

  const fetchReport = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/admin/analytics?days=${days}`);
      if (res.status === 401) { onUnauth(); return; }
      const data = await res.json();
      if (data.error) { setError(data.error); return; }
      setReport(data as GAReport);
    } catch {
      setError('Failed to load analytics');
    } finally {
      setLoading(false);
    }
  }, [days, onUnauth]);

  useEffect(() => { fetchReport(); }, [fetchReport]);

  const ranges: { value: DateRange; label: string }[] = [
    { value: 7, label: '7d' },
    { value: 28, label: '28d' },
    { value: 90, label: '90d' },
  ];

  const maxViews = report?.pages[0]?.pageviews ?? 1;

  return (
    <>
      <div className="flex items-center justify-between mb-6">
        <div className="flex gap-1">
          {ranges.map((r) => (
            <button
              key={r.value}
              onClick={() => setDays(r.value)}
              className={`px-3 py-1.5 text-[11px] uppercase tracking-wider font-sans rounded-[2px] transition-colors ${
                days === r.value
                  ? 'bg-neutral-900 dark:bg-neutral-100 text-white dark:text-black'
                  : 'text-neutral-400 dark:text-neutral-600 hover:text-neutral-900 dark:hover:text-neutral-100'
              }`}
            >
              {r.label}
            </button>
          ))}
        </div>
        <button
          onClick={fetchReport}
          className="text-[11px] uppercase tracking-wider font-sans text-neutral-400 dark:text-neutral-600 hover:text-neutral-900 dark:hover:text-neutral-100 transition-colors"
        >
          Refresh
        </button>
      </div>

      <div className="h-[1px] bg-neutral-100 dark:bg-neutral-900 mb-6" />

      {loading ? (
        <p className="text-[13px] text-neutral-400 dark:text-neutral-600 py-8 text-center font-sans">
          Loading…
        </p>
      ) : error ? (
        <div className="py-8 text-center">
          <p className="text-[13px] text-neutral-500 dark:text-neutral-500 font-sans mb-1">{error}</p>
          <p className="text-[11px] text-neutral-400 dark:text-neutral-600 font-sans">
            Make sure GA_PROPERTY_ID and GA_SERVICE_ACCOUNT_B64 are configured.
          </p>
        </div>
      ) : report ? (
        <div className="space-y-6">
          <div className="grid grid-cols-3 gap-3">
            <StatCard label="Users" value={report.users} />
            <StatCard label="Sessions" value={report.sessions} />
            <StatCard label="Pageviews" value={report.pageviews} />
          </div>

          <div>
            <p className="text-[10px] uppercase tracking-wider text-neutral-400 dark:text-neutral-600 font-sans mb-3">
              Top Pages
            </p>
            <div className="space-y-0">
              {report.pages.map((page, i) => (
                <div
                  key={i}
                  className="py-3 border-b border-neutral-100 dark:border-neutral-900 last:border-0"
                >
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-[12px] font-mono text-neutral-700 dark:text-neutral-300 truncate mr-4">
                      {page.path}
                    </span>
                    <span className="text-[12px] font-mono text-neutral-500 dark:text-neutral-500 whitespace-nowrap flex-shrink-0">
                      {page.pageviews.toLocaleString()}
                    </span>
                  </div>
                  <div className="h-[2px] bg-neutral-100 dark:bg-neutral-900 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-neutral-400 dark:bg-neutral-600 rounded-full transition-all duration-500"
                      style={{ width: `${(page.pageviews / maxViews) * 100}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      ) : null}
    </>
  );
}

export function AdminDashboard() {
  const router = useRouter();
  const [tab, setTab] = useState<AdminTab>('bookings');

  const handleUnauth = useCallback(() => {
    router.push('/admin');
  }, [router]);

  const handleLogout = async () => {
    await fetch('/api/admin/logout', { method: 'POST' });
    router.push('/admin');
  };

  const tabs: { value: AdminTab; label: string; icon: React.ReactNode }[] = [
    { value: 'bookings', label: 'Bookings', icon: <CalendarDays size={13} strokeWidth={1.5} /> },
    { value: 'feedback', label: 'Feedback', icon: <MessageSquare size={13} strokeWidth={1.5} /> },
    { value: 'analytics', label: 'Analytics', icon: <BarChart2 size={13} strokeWidth={1.5} /> },
  ];

  return (
    <div className="min-h-screen bg-white dark:bg-[#050505]">
      <div className="max-w-[720px] mx-auto px-6 py-10">
        <div className="flex items-center justify-between mb-8">
          <div>
            <p className="text-[11px] uppercase tracking-wider text-neutral-400 dark:text-neutral-600 mb-1 font-sans">
              Admin
            </p>
            <h1 className="text-[18px] font-medium text-neutral-900 dark:text-neutral-100">
              Dashboard
            </h1>
          </div>
          <button
            onClick={handleLogout}
            className="text-neutral-400 dark:text-neutral-600 hover:text-neutral-900 dark:hover:text-neutral-100 transition-colors"
            title="Sign out"
          >
            <LogOut size={16} strokeWidth={1.5} />
          </button>
        </div>

        <div className="flex gap-1 mb-6 border-b border-neutral-100 dark:border-neutral-900 pb-0">
          {tabs.map((t) => (
            <button
              key={t.value}
              onClick={() => setTab(t.value)}
              className={`flex items-center gap-1.5 px-3 py-2.5 text-[11px] uppercase tracking-wider font-sans transition-colors border-b-[1.5px] -mb-px ${
                tab === t.value
                  ? 'border-neutral-900 dark:border-neutral-100 text-neutral-900 dark:text-neutral-100'
                  : 'border-transparent text-neutral-400 dark:text-neutral-600 hover:text-neutral-700 dark:hover:text-neutral-400'
              }`}
            >
              {t.icon}
              {t.label}
            </button>
          ))}
        </div>

        {tab === 'bookings' && <BookingsPanel onUnauth={handleUnauth} />}
        {tab === 'feedback' && <FeedbackPanel onUnauth={handleUnauth} />}
        {tab === 'analytics' && <AnalyticsPanel onUnauth={handleUnauth} />}
      </div>
    </div>
  );
}
