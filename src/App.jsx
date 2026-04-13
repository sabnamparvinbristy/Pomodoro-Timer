import { useState, useEffect, useRef } from 'react';
import './App.css';

const MODES = {
  work:       { label: 'Focus',      duration: 25 * 60, icon: '🎯' },
  shortBreak: { label: 'Short Break', duration: 5 * 60,  icon: '☕' },
  longBreak:  { label: 'Long Break',  duration: 15 * 60, icon: '🌿' },
};

const ACCENTS = {
  work:       { color: '#3b82f6', tint: 'rgba(59,130,246,0.10)',  border: 'rgba(59,130,246,0.28)',  glow: 'rgba(59,130,246,0.18)' },
  shortBreak: { color: '#38bdf8', tint: 'rgba(56,189,248,0.10)',  border: 'rgba(56,189,248,0.28)',  glow: 'rgba(56,189,248,0.16)' },
  longBreak:  { color: '#818cf8', tint: 'rgba(129,140,248,0.10)', border: 'rgba(129,140,248,0.28)', glow: 'rgba(129,140,248,0.16)' },
};

const DARK_BG = {
  work:       'linear-gradient(160deg, #0f1b33 0%, #1a2540 40%, #111e38 70%, #0a1220 100%)',
  shortBreak: 'linear-gradient(160deg, #0d1e2e 0%, #152535 40%, #0f1e2d 70%, #091520 100%)',
  longBreak:  'linear-gradient(160deg, #13132a 0%, #1a1a38 40%, #111128 70%, #0b0b1e 100%)',
};

const formatTime = (seconds) => {
  const m = Math.floor(seconds / 60).toString().padStart(2, '0');
  const s = (seconds % 60).toString().padStart(2, '0');
  return { m, s };
};

export default function App() {
  const [mode, setMode]         = useState('work');
  const [timeLeft, setTimeLeft] = useState(MODES.work.duration);
  const [isActive, setIsActive] = useState(false);
  const [sessions, setSessions] = useState(0);
  const [tick, setTick]         = useState(new Date());
  const timerRef                = useRef(null);

  const acc = ACCENTS[mode];
  const bg  = DARK_BG[mode];
  const total = MODES[mode].duration;
  const progress = ((total - timeLeft) / total) * 100;
  const { m, s } = formatTime(timeLeft);

  //live clock
  useEffect(() => {
    const t = setInterval(() => setTick(new Date()), 1000);
    return () => clearInterval(t);
  }, []);

  //cleanup
  useEffect(() => () => clearInterval(timerRef.current), []);

  const startTimer = () => {
    if (isActive) return;
    setIsActive(true);
    timerRef.current = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          clearInterval(timerRef.current);
          setIsActive(false);
          handleComplete();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  const pauseTimer = () => {
    clearInterval(timerRef.current);
    setIsActive(false);
  };

  const resetTimer = () => {
    clearInterval(timerRef.current);
    setIsActive(false);
    setTimeLeft(MODES[mode].duration);
  };

  const handleComplete = () => {
    if (mode === 'work') {
      setSessions(n => n + 1);
      setMode('shortBreak');
      setTimeLeft(MODES.shortBreak.duration);
    } else {
      setMode('work');
      setTimeLeft(MODES.work.duration);
    }
  };

  const switchMode = (newMode) => {
    clearInterval(timerRef.current);
    setIsActive(false);
    setMode(newMode);
    setTimeLeft(MODES[newMode].duration);
  };

  //circle
  const r = 110;
  const circ = 2 * Math.PI * r;
  const offset = circ - (progress / 100) * circ;

  const glassCard = {
    background: 'rgba(255,255,255,0.06)',
    border: `1px solid ${acc.border}`,
    backdropFilter: 'blur(24px)',
    WebkitBackdropFilter: 'blur(24px)',
    boxShadow: `0 8px 40px rgba(0,0,0,0.4), inset 0 1px 0 rgba(255,255,255,0.08)`,
  };

  return (
    <div className="app" style={{ background: bg }}>

      {/* ambient orbs */}
      <div className="orb orb1" style={{ background: `radial-gradient(circle, ${acc.glow} 0%, transparent 70%)` }} />
      <div className="orb orb2" style={{ background: `radial-gradient(circle, ${acc.glow} 0%, transparent 70%)` }} />

      <div className="container">

        {/* header */}
        <div className="hdr">
          <div className="brand">
            <span className="brand-icon">⏱️</span>
            <span className="brand-name">Pomodoro</span>
          </div>
          <div className="hdr-right">
            <div className="clock-wrap">
              <span className="live-clock" style={{ color: acc.color }}>
                {tick.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </span>
              <span className="live-date">
                {tick.toLocaleDateString([], { weekday: 'short', month: 'short', day: 'numeric' })}
              </span>
            </div>
            <div className="session-badge" style={{ background: acc.tint, border: `1px solid ${acc.border}`, color: acc.color }}>
              🔥 {sessions} session{sessions !== 1 ? 's' : ''}
            </div>
          </div>
        </div>

        {/* mode tabs */}
        <div className="mode-tabs" style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.09)' }}>
          {Object.entries(MODES).map(([key, val]) => (
            <button
              key={key}
              className="mode-tab"
              style={mode === key
                ? { background: acc.color, color: '#fff', boxShadow: `0 2px 12px ${acc.glow}` }
                : { color: 'rgba(232,237,245,0.4)', background: 'transparent' }
              }
              onClick={() => switchMode(key)}
            >
              {val.icon} {val.label}
            </button>
          ))}
        </div>

        {/* main card */}
        <div className="card" style={glassCard}>

          {/* ring timer */}
          <div className="ring-wrap">
            <svg className="ring-svg" viewBox="0 0 260 260">
              {/* track */}
              <circle cx="130" cy="130" r={r} fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="10" />
              {/* progress */}
              <circle
                cx="130" cy="130" r={r}
                fill="none"
                stroke={acc.color}
                strokeWidth="10"
                strokeLinecap="round"
                strokeDasharray={circ}
                strokeDashoffset={offset}
                transform="rotate(-90 130 130)"
                style={{ transition: 'stroke-dashoffset 0.9s cubic-bezier(0.4,0,0.2,1)', filter: `drop-shadow(0 0 8px ${acc.color})` }}
              />
            </svg>

            <div className="ring-inner">
              <div className="mode-label" style={{ color: acc.color }}>
                {MODES[mode].icon} {MODES[mode].label}
              </div>
              <div className="time-display">
                <span className="time-digits">{m}</span>
                <span className="time-colon" style={{ color: acc.color }}>:</span>
                <span className="time-digits">{s}</span>
              </div>
              <div className="time-sub">{isActive ? 'in progress…' : timeLeft === MODES[mode].duration ? 'ready' : 'paused'}</div>
            </div>
          </div>

          {/* divider */}
          <div className="divider" style={{ background: 'rgba(255,255,255,0.07)' }} />

          {/* controls */}
          <div className="controls">
            {!isActive ? (
              <button
                className="ctrl-btn start"
                style={{ background: acc.color, boxShadow: `0 4px 20px ${acc.glow}` }}
                onClick={startTimer}
              >
                ▶ Start
              </button>
            ) : (
              <button
                className="ctrl-btn pause"
                style={{ background: 'rgba(255,255,255,0.12)', border: `1px solid ${acc.border}`, color: '#e8edf5' }}
                onClick={pauseTimer}
              >
                ⏸ Pause
              </button>
            )}
            <button
              className="ctrl-btn reset"
              style={{ background: 'rgba(255,255,255,0.07)', border: '1px solid rgba(255,255,255,0.12)', color: 'rgba(232,237,245,0.5)' }}
              onClick={resetTimer}
            >
              ↺ Reset
            </button>
          </div>

          {/* progress bar */}
          <div className="prog-track">
            <div className="prog-fill" style={{ width: `${progress}%`, background: acc.color, boxShadow: `0 0 8px ${acc.color}` }} />
          </div>

        </div>

        {/* tips */}
        <div className="tip-row">
          {[
            { icon: '🎯', text: '25 min deep focus' },
            { icon: '☕', text: '5 min recharge' },
            { icon: '🌿', text: '15 min long rest' },
          ].map((t, i) => (
            <div key={i} className="tip" style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)' }}>
              <span>{t.icon}</span>
              <span className="tip-text">{t.text}</span>
            </div>
          ))}
        </div>

        {/* footer */}
        <div className="footer">
          © 2026 Sabnam Parvin Bristy — All rights reserved<br />
          Narayanganj, Bangladesh
        </div>

      </div>
    </div>
  );
}
