// src/components/AttendanceWidget.jsx
import React, { useState, useEffect, useCallback } from 'react';
import {
  Users, Clock, UserCheck, UserX, Calendar,
  TrendingUp, AlarmClock, Coffee, LogIn, LogOut,
  ChevronRight, Briefcase, Award
} from 'lucide-react';
import { useDashboard } from '../context/DashboardContext';
import { toBanglaDigits } from '../utils/bengaliUtils';

// ---- Simulated fallback data (Bangla names) ----
const DEMO_EMPLOYEES = [
  { id: 1, name: 'কাজী মোঃ আলদীন ফারদীন', job_title: 'প্রধান নির্বাহী কর্মকর্তা', dept: 'ম্যানেজমেন্ট' },
  { id: 2, name: 'মোঃ রাফিউল ইসলাম',        job_title: 'বিক্রয় ব্যবস্থাপক',         dept: 'বিক্রয় বিভাগ' },
  { id: 3, name: 'সাবরিনা আক্তার',           job_title: 'একাউন্টস অফিসার',           dept: 'হিসাব বিভাগ' },
  { id: 4, name: 'আবু তালহা মাহমুদ',         job_title: 'স্টক ম্যানেজার',             dept: 'ইনভেন্টরি' },
  { id: 5, name: 'নুসরাত জাহান',              job_title: 'কাস্টমার সার্ভিস',           dept: 'সেবা বিভাগ' },
  { id: 6, name: 'মোঃ আনোয়ার হোসেন',        job_title: 'ড্রাইভার / ডেলিভারি',        dept: 'লজিস্টিক্স' },
];

function buildDemoAttendance() {
  const now = Date.now();
  const records = [];
  DEMO_EMPLOYEES.forEach((emp, ei) => {
    for (let d = 0; d < 7; d++) {
      const checkInMs = now - d * 86400000 - (7 - ei) * 3600000 - Math.random() * 1800000;
      const workedH = 7.5 + Math.random() * 1.5;
      const checkOut = d === 0 && ei >= 3 ? null : checkInMs + workedH * 3600000;
      records.push({
        id: ei * 10 + d,
        employee_id: [emp.id, emp.name],
        check_in: new Date(checkInMs).toISOString().replace('T', ' ').slice(0, 19),
        check_out: checkOut ? new Date(checkOut).toISOString().replace('T', ' ').slice(0, 19) : null,
        worked_hours: checkOut ? workedH : null,
      });
    }
  });
  return records;
}

// ---- Helper functions ----
const parseDate = (s) => s ? new Date(s.replace(' ', 'T') + (s.includes('T') ? '' : 'Z')) : null;

function formatHours(h, numSys) {
  if (!h && h !== 0) return '—';
  const hrs = Math.floor(h);
  const mins = Math.round((h - hrs) * 60);
  const hStr = numSys === 'bangla' ? toBanglaDigits(hrs) : hrs;
  const mStr = numSys === 'bangla' ? toBanglaDigits(mins) : mins;
  return `${hStr}ঘ ${mStr}মি`;
}

function formatTime(dateStr, numSys) {
  const d = parseDate(dateStr);
  if (!d) return '—';
  const h = d.getHours(), m = d.getMinutes();
  const hh = numSys === 'bangla' ? toBanglaDigits(h.toString().padStart(2, '0')) : h.toString().padStart(2, '0');
  const mm = numSys === 'bangla' ? toBanglaDigits(m.toString().padStart(2, '0')) : m.toString().padStart(2, '0');
  return `${hh}:${mm}`;
}

function formatDate(dateStr, numSys) {
  const d = parseDate(dateStr);
  if (!d) return '—';
  const day   = numSys === 'bangla' ? toBanglaDigits(d.getDate())      : d.getDate();
  const month = numSys === 'bangla' ? toBanglaDigits(d.getMonth() + 1) : d.getMonth() + 1;
  return `${day}/${month}`;
}

function isToday(dateStr) {
  const d = parseDate(dateStr);
  if (!d) return false;
  const now = new Date();
  return d.getDate() === now.getDate() &&
    d.getMonth() === now.getMonth() &&
    d.getFullYear() === now.getFullYear();
}

const STATUS_COLORS = {
  present:  { bg: 'var(--color-success-light)', color: 'var(--color-success)', border: 'rgba(16,185,129,0.25)' },
  absent:   { bg: 'var(--color-danger-light)',  color: 'var(--color-danger)',  border: 'rgba(239,68,68,0.25)' },
  checkedin:{ bg: 'var(--color-warning-light)', color: 'var(--color-warning)', border: 'rgba(245,158,11,0.25)' },
  leave:    { bg: 'var(--color-purple-light)',  color: 'var(--color-purple)',  border: 'rgba(168,85,247,0.25)' },
};

const TABS = [
  { id: 'today',   label: 'আজ' },
  { id: 'weekly',  label: 'সাপ্তাহিক' },
  { id: 'records', label: 'রেকর্ড' },
];

// ---- Main Component ----
export const AttendanceWidget = () => {
  const { settings } = useDashboard();
  const numSys = settings.numeralSystem;
  const cfg    = settings.odooConfig;

  const [tab,        setTab]        = useState('today');
  const [data,       setData]       = useState(null);
  const [loading,    setLoading]    = useState(true);
  const [liveTime,   setLiveTime]   = useState(new Date());

  // Live clock ticker
  useEffect(() => {
    const t = setInterval(() => setLiveTime(new Date()), 30000);
    return () => clearInterval(t);
  }, []);

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      if (cfg.login) {
        const params = new URLSearchParams({
          baseUrl: cfg.baseUrl, apiKey: cfg.apiKey, db: cfg.db, login: cfg.login, t: Date.now()
        });
        const res = await fetch(`/api/odoo/attendance?${params}`, { method: 'GET', headers: { Accept: 'application/json' } });
        if (res.ok) {
          const json = await res.json();
          if (json.success) {
            setData({
              employees:  json.employees  || [],
              attendance: json.attendance || [],
              leaves:     json.leaves     || [],
              isLive:     true,
            });
            setLoading(false);
            return;
          }
        }
      }
    } catch (e) { /* fall through to demo */ }

    // Fallback simulated data
    const demoAtt = buildDemoAttendance();
    setData({
      employees:  DEMO_EMPLOYEES.map(e => ({ id: e.id, name: e.name, job_title: e.job_title, department_id: [0, e.dept] })),
      attendance: demoAtt,
      leaves:     [],
      isLive:     false,
    });
    setLoading(false);
  }, [cfg.login, cfg.baseUrl, cfg.apiKey, cfg.db]);

  useEffect(() => { loadData(); }, [loadData]);

  if (loading || !data) {
    return (
      <div className="glass-card" style={{ minHeight: '320px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ textAlign: 'center', color: 'var(--text-muted)' }}>
          <Clock size={32} style={{ margin: '0 auto 0.6rem', opacity: 0.4 }} />
          <div>উপস্থিতি তথ্য লোড হচ্ছে...</div>
        </div>
      </div>
    );
  }

  // ---- Computed aggregates ----
  const { employees, attendance, leaves, isLive } = data;
  const totalEmp = employees.length;

  const todayAtt = attendance.filter(a => isToday(a.check_in));
  const presentEmpIds = [...new Set(todayAtt.map(a => a.employee_id?.[0]))];
  const checkedInCount = todayAtt.filter(a => a.check_out === null || a.check_out === false).length;
  const presentCount   = presentEmpIds.length;
  const absentCount    = Math.max(0, totalEmp - presentCount);
  const onLeaveCount   = leaves.filter(l => {
    const today = new Date().toISOString().slice(0, 10);
    return l.date_from && l.date_to && l.date_from.slice(0, 10) <= today && l.date_to.slice(0, 10) >= today;
  }).length;

  const totalWorkedToday = todayAtt.reduce((acc, a) => acc + (a.worked_hours || 0), 0);
  const avgHoursToday = presentCount > 0 ? totalWorkedToday / presentCount : 0;

  // Per-employee today map
  const empTodayMap = {};
  todayAtt.forEach(a => {
    const eid = a.employee_id?.[0];
    if (!empTodayMap[eid]) empTodayMap[eid] = a;
  });

  // Weekly attendance data (last 7 days)
  const weeklyData = Array.from({ length: 7 }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - (6 - i));
    const dayStr = d.toLocaleDateString('bn-BD', { weekday: 'short' });
    const dayRecs = attendance.filter(a => {
      const ad = parseDate(a.check_in);
      return ad && ad.getDate() === d.getDate() && ad.getMonth() === d.getMonth();
    });
    const uniqEmp = new Set(dayRecs.map(a => a.employee_id?.[0])).size;
    return { day: dayStr, count: uniqEmp, date: d };
  });
  const maxWeekly = Math.max(...weeklyData.map(d => d.count), 1);

  // ---- KPI summary cards ----
  const kpis = [
    { icon: Users,     label: 'মোট কর্মী',   value: totalEmp,       color: 'var(--color-primary)', bg: 'var(--color-primary-light)' },
    { icon: UserCheck, label: 'উপস্থিত',      value: presentCount,   color: 'var(--color-success)', bg: 'var(--color-success-light)' },
    { icon: LogIn,     label: 'চেক-ইন আছেন', value: checkedInCount, color: 'var(--color-warning)', bg: 'var(--color-warning-light)' },
    { icon: UserX,     label: 'অনুপস্থিত',   value: absentCount,    color: 'var(--color-danger)',  bg: 'var(--color-danger-light)' },
  ];

  // Current time display
  const nowHH = numSys === 'bangla' ? toBanglaDigits(liveTime.getHours().toString().padStart(2,'0')) : liveTime.getHours().toString().padStart(2,'0');
  const nowMM = numSys === 'bangla' ? toBanglaDigits(liveTime.getMinutes().toString().padStart(2,'0')) : liveTime.getMinutes().toString().padStart(2,'0');

  return (
    <div className="glass-card">
      {/* Header */}
      <div className="card-header-clean">
        <div className="card-title">
          <div className="icon-badge"><Users size={18} /></div>
          <div>
            <div>কর্মী উপস্থিতি ব্যবস্থাপন</div>
            <div style={{ fontSize: '0.73rem', fontWeight: 400, color: 'var(--text-secondary)', marginTop: '1px' }}>
              আজকের তারিখ: {new Date().toLocaleDateString('bn-BD', { dateStyle: 'long' })}
            </div>
          </div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', flexWrap: 'wrap' }}>
          {/* Live clock */}
          <div style={{
            background: 'var(--color-primary-light)',
            border: '1px solid rgba(var(--color-primary-rgb), 0.2)',
            borderRadius: 'var(--radius-md)',
            padding: '0.3rem 0.7rem',
            fontWeight: 700,
            fontSize: '1rem',
            color: 'var(--color-primary)',
            fontFamily: "'JetBrains Mono', monospace",
            letterSpacing: '0.05em',
          }}>
            <AlarmClock size={14} style={{ verticalAlign: 'middle', marginRight: '5px' }} />
            {nowHH}:{nowMM}
          </div>
          <span className={`badge ${isLive ? 'badge-green' : 'badge-orange'}`} style={{ fontSize: '0.7rem' }}>
            <span className="pulse-dot" style={{ width: '6px', height: '6px' }} />
            {isLive ? 'লাইভ ওদু' : 'সিমুলেটেড'}
          </span>
        </div>
      </div>

      {/* KPI Boxes */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(2, 1fr)',
        gap: '0.6rem',
        marginBottom: '1rem',
      }}>
        {kpis.map((k) => {
          const Icon = k.icon;
          const val = numSys === 'bangla' ? toBanglaDigits(k.value) : k.value;
          return (
            <div key={k.label} style={{
              background: k.bg,
              border: `1px solid ${k.color}33`,
              borderRadius: 'var(--radius-md)',
              padding: '0.75rem',
              display: 'flex',
              alignItems: 'center',
              gap: '0.6rem',
            }}>
              <div style={{
                width: '36px', height: '36px', borderRadius: 'var(--radius-sm)',
                background: `${k.color}22`, color: k.color,
                display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
              }}>
                <Icon size={18} />
              </div>
              <div>
                <div style={{ fontSize: '1.4rem', fontWeight: 800, color: k.color, lineHeight: 1 }} className="bangla-number">{val}</div>
                <div style={{ fontSize: '0.72rem', color: 'var(--text-secondary)', marginTop: '2px' }}>{k.label}</div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Average hours bar */}
      <div style={{
        padding: '0.6rem 0.85rem',
        background: 'var(--bg-input)',
        borderRadius: 'var(--radius-md)',
        border: '1px solid var(--border-color)',
        marginBottom: '1rem',
        display: 'flex',
        alignItems: 'center',
        gap: '0.75rem',
      }}>
        <TrendingUp size={16} style={{ color: 'var(--color-success)', flexShrink: 0 }} />
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginBottom: '4px' }}>
            আজকের গড় কার্যঘণ্টা
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <div style={{ flex: 1, height: '6px', background: 'var(--border-color)', borderRadius: '9999px', overflow: 'hidden' }}>
              <div style={{
                width: `${Math.min(100, (avgHoursToday / 9) * 100)}%`,
                height: '100%',
                background: `linear-gradient(90deg, var(--color-success), var(--color-primary))`,
                borderRadius: '9999px',
                transition: 'width 0.6s ease',
              }} />
            </div>
            <span style={{ fontSize: '0.82rem', fontWeight: 700, color: 'var(--color-success)', whiteSpace: 'nowrap' }} className="bangla-number">
              {formatHours(avgHoursToday, numSys)} / ৯ঘ
            </span>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div style={{
        display: 'flex',
        gap: '0.3rem',
        borderBottom: '1px solid var(--border-color)',
        marginBottom: '1rem',
        overflowX: 'auto',
      }}>
        {TABS.map(t => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            style={{
              padding: '0.5rem 0.9rem',
              border: 'none',
              background: 'transparent',
              fontFamily: 'inherit',
              fontSize: '0.84rem',
              fontWeight: 600,
              cursor: 'pointer',
              color: tab === t.id ? 'var(--color-primary)' : 'var(--text-secondary)',
              borderBottom: `2px solid ${tab === t.id ? 'var(--color-primary)' : 'transparent'}`,
              whiteSpace: 'nowrap',
              transition: 'color 0.2s, border-color 0.2s',
            }}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* Tab: Today */}
      {tab === 'today' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
          {employees.length === 0 ? (
            <div style={{ textAlign: 'center', color: 'var(--text-muted)', padding: '2rem 0', fontSize: '0.88rem' }}>
              কোনো কর্মী পাওয়া যায়নি
            </div>
          ) : (
            employees.map(emp => {
              const todayRecord = empTodayMap[emp.id];
              const isIn       = todayRecord && (todayRecord.check_out === null || todayRecord.check_out === false);
              const isPresent  = !!todayRecord;
              const statusKey  = isIn ? 'checkedin' : isPresent ? 'present' : 'absent';
              const sc         = STATUS_COLORS[statusKey];

              return (
                <div key={emp.id} style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.7rem',
                  padding: '0.65rem 0.85rem',
                  background: 'var(--bg-input)',
                  border: '1px solid var(--border-color)',
                  borderRadius: 'var(--radius-md)',
                  transition: 'border-color 0.2s',
                }}>
                  {/* Avatar circle */}
                  <div style={{
                    width: '38px', height: '38px', borderRadius: '50%',
                    background: `linear-gradient(135deg, ${sc.color}44, ${sc.color}22)`,
                    border: `2px solid ${sc.color}55`,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontWeight: 700, fontSize: '0.9rem', color: sc.color, flexShrink: 0,
                  }}>
                    {emp.name.charAt(0)}
                  </div>

                  {/* Name & title */}
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontWeight: 600, fontSize: '0.88rem', color: 'var(--text-primary)' }} className="truncate">
                      {emp.name}
                    </div>
                    <div style={{ fontSize: '0.72rem', color: 'var(--text-secondary)' }}>
                      {emp.job_title || (Array.isArray(emp.department_id) ? emp.department_id[1] : 'কর্মী')}
                    </div>
                  </div>

                  {/* Check-in / out times */}
                  <div style={{ textAlign: 'right', fontSize: '0.78rem', color: 'var(--text-secondary)', flexShrink: 0 }}>
                    {todayRecord ? (
                      <>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '3px' }}>
                          <LogIn  size={11} style={{ color: 'var(--color-success)' }} />
                          <span>{formatTime(todayRecord.check_in, numSys)}</span>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '3px' }}>
                          <LogOut size={11} style={{ color: todayRecord.check_out ? 'var(--color-danger)' : 'var(--text-muted)' }} />
                          <span>{todayRecord.check_out ? formatTime(todayRecord.check_out, numSys) : '—'}</span>
                        </div>
                      </>
                    ) : (
                      <span style={{ color: 'var(--color-danger)', fontSize: '0.75rem' }}>অনুপস্থিত</span>
                    )}
                  </div>

                  {/* Hours worked */}
                  {todayRecord && (
                    <div style={{ textAlign: 'right', minWidth: '52px', flexShrink: 0 }}>
                      <div className="bangla-number" style={{ fontSize: '0.82rem', fontWeight: 700, color: sc.color }}>
                        {formatHours(todayRecord.worked_hours, numSys)}
                      </div>
                    </div>
                  )}

                  {/* Status badge */}
                  <div style={{
                    padding: '0.2rem 0.55rem',
                    borderRadius: '9999px',
                    fontSize: '0.7rem',
                    fontWeight: 600,
                    background: sc.bg,
                    color: sc.color,
                    border: `1px solid ${sc.border}`,
                    whiteSpace: 'nowrap',
                    flexShrink: 0,
                  }}>
                    {isIn ? 'চেক-ইনে' : isPresent ? 'সম্পন্ন' : 'অনুপস্থিত'}
                  </div>
                </div>
              );
            })
          )}
        </div>
      )}

      {/* Tab: Weekly bar chart */}
      {tab === 'weekly' && (
        <div>
          <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: '1rem' }}>
            গত ৭ দিনের উপস্থিতির প্রবণতা
          </div>
          <div style={{ display: 'flex', alignItems: 'flex-end', gap: '0.4rem', height: '120px', marginBottom: '0.5rem' }}>
            {weeklyData.map((d, i) => {
              const isToday = i === weeklyData.length - 1;
              const pct = (d.count / maxWeekly) * 100;
              return (
                <div key={i} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px', height: '100%' }}>
                  <div style={{ flex: 1, width: '100%', display: 'flex', alignItems: 'flex-end' }}>
                    <div
                      style={{
                        width: '100%',
                        height: `${Math.max(8, pct)}%`,
                        background: isToday
                          ? 'linear-gradient(180deg, var(--color-primary), #4338ca)'
                          : 'var(--color-primary-light)',
                        border: `1px solid ${isToday ? 'var(--color-primary)' : 'var(--border-glow)'}`,
                        borderRadius: '4px 4px 0 0',
                        transition: 'height 0.5s ease',
                        position: 'relative',
                      }}
                      title={`${d.day}: ${d.count} জন`}
                    >
                      {d.count > 0 && (
                        <div style={{
                          position: 'absolute',
                          top: '-18px',
                          left: '50%',
                          transform: 'translateX(-50%)',
                          fontSize: '0.7rem',
                          fontWeight: 700,
                          color: isToday ? 'var(--color-primary)' : 'var(--text-muted)',
                          whiteSpace: 'nowrap',
                        }} className="bangla-number">
                          {numSys === 'bangla' ? toBanglaDigits(d.count) : d.count}
                        </div>
                      )}
                    </div>
                  </div>
                  <div style={{ fontSize: '0.68rem', color: isToday ? 'var(--color-primary)' : 'var(--text-muted)', fontWeight: isToday ? 700 : 400 }}>
                    {d.day}
                  </div>
                </div>
              );
            })}
          </div>
          <div style={{ marginTop: '1rem', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem' }}>
            {[
              { label: 'এই সপ্তাহে গড় উপস্থিতি', value: `${numSys === 'bangla' ? toBanglaDigits(Math.round(weeklyData.reduce((a,b)=>a+b.count,0)/7)) : Math.round(weeklyData.reduce((a,b)=>a+b.count,0)/7)} জন/দিন` },
              { label: 'সর্বোচ্চ একদিনে', value: `${numSys === 'bangla' ? toBanglaDigits(maxWeekly) : maxWeekly} জন` },
            ].map(s => (
              <div key={s.label} style={{
                padding: '0.6rem 0.85rem',
                background: 'var(--bg-input)',
                border: '1px solid var(--border-color)',
                borderRadius: 'var(--radius-md)',
              }}>
                <div style={{ fontSize: '0.7rem', color: 'var(--text-secondary)', marginBottom: '2px' }}>{s.label}</div>
                <div style={{ fontSize: '0.95rem', fontWeight: 700, color: 'var(--text-primary)' }} className="bangla-number">{s.value}</div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tab: Records table */}
      {tab === 'records' && (
        <div>
          <div className="table-wrapper">
            <table className="data-table" style={{ minWidth: '480px' }}>
              <thead>
                <tr>
                  <th>কর্মীর নাম</th>
                  <th>তারিখ</th>
                  <th>চেক-ইন</th>
                  <th>চেক-আউট</th>
                  <th>কার্যঘণ্টা</th>
                </tr>
              </thead>
              <tbody>
                {attendance.slice(0, 25).map((a, idx) => {
                  const workedOk = a.worked_hours > 0;
                  return (
                    <tr key={a.id || idx}>
                      <td>
                        <div style={{ fontWeight: 600, fontSize: '0.85rem' }}>
                          {Array.isArray(a.employee_id) ? a.employee_id[1] : 'কর্মী'}
                        </div>
                      </td>
                      <td style={{ color: 'var(--text-secondary)', fontSize: '0.82rem' }} className="bangla-number">
                        {formatDate(a.check_in, numSys)}
                      </td>
                      <td>
                        <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', fontSize: '0.82rem' }}>
                          <LogIn size={12} style={{ color: 'var(--color-success)' }} />
                          <span className="bangla-number">{formatTime(a.check_in, numSys)}</span>
                        </span>
                      </td>
                      <td>
                        {a.check_out ? (
                          <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', fontSize: '0.82rem' }}>
                            <LogOut size={12} style={{ color: 'var(--color-danger)' }} />
                            <span className="bangla-number">{formatTime(a.check_out, numSys)}</span>
                          </span>
                        ) : (
                          <span style={{
                            fontSize: '0.75rem', padding: '0.15rem 0.5rem',
                            background: 'var(--color-warning-light)', color: 'var(--color-warning)',
                            borderRadius: '9999px', fontWeight: 600,
                          }}>চেক-ইনে</span>
                        )}
                      </td>
                      <td>
                        <span className={`bangla-number`} style={{
                          fontWeight: 700,
                          color: workedOk
                            ? (a.worked_hours >= 8 ? 'var(--color-success)' : 'var(--color-warning)')
                            : 'var(--text-muted)',
                          fontSize: '0.85rem',
                        }}>
                          {formatHours(a.worked_hours, numSys)}
                        </span>
                      </td>
                    </tr>
                  );
                })}
                {attendance.length === 0 && (
                  <tr><td colSpan={5} style={{ textAlign: 'center', color: 'var(--text-muted)', padding: '2rem' }}>কোনো উপস্থিতি রেকর্ড নেই</td></tr>
                )}
              </tbody>
            </table>
          </div>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.5rem', textAlign: 'right' }}>
            মোট {numSys === 'bangla' ? toBanglaDigits(attendance.length) : attendance.length} টি রেকর্ড (সর্বশেষ ৩০ দিন)
          </div>
        </div>
      )}
    </div>
  );
};
