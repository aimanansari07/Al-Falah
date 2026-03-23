import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Clock, Moon, Star, Megaphone, Radio, Settings, LogOut, Save, Plus, Trash2, ShieldCheck, Eye, EyeOff, Mic, MicOff, Pencil } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { useData } from '../../context/DataContext';
import { api } from '../../api';
import { startBroadcast, stopBroadcast, isBroadcasting } from '../../lib/agora';
import { fmt12 } from '../../utils/prayerUtils';

const SECTIONS = [
  { id: 'prayer',   icon: Clock,        label: 'Prayers',  color: '#1A5C38' },
  { id: 'ramadan',  icon: Moon,         label: 'Ramadan',  color: '#9A7B2F' },
  { id: 'eid',      icon: Star,         label: 'Eid',      color: '#D97706' },
  { id: 'news',     icon: Megaphone,    label: 'News',     color: '#2563EB' },
  { id: 'live',     icon: Radio,        label: 'Live',     color: '#C0392B' },
  { id: 'app',      icon: Settings,     label: 'App',      color: '#7C3AED' },
  { id: 'security', icon: ShieldCheck,  label: 'Security', color: '#059669' },
];

function Field({ label, value, onChange, type = 'text', placeholder }) {
  return (
    <div>
      <label className="block text-[12px] font-bold text-[#9CA3AF] uppercase mb-1">{label}</label>
      <input type={type} value={value} onChange={e => onChange(e.target.value)} placeholder={placeholder}
        className="w-full border-2 border-[#EEEBE4] rounded-xl px-3.5 py-2.5 text-[14px] focus:outline-none focus:border-primary bg-[#FAFAF8]" />
    </div>
  );
}

function PhoneField({ label, value, onChange }) {
  return (
    <div>
      <label className="block text-[12px] font-bold text-[#9CA3AF] uppercase mb-1">{label}</label>
      <div className="flex border-2 border-[#EEEBE4] rounded-xl overflow-hidden focus-within:border-primary bg-[#FAFAF8]">
        <div className="flex items-center gap-1.5 px-3 py-2.5 bg-[#F0EDE6] border-r border-[#EEEBE4] shrink-0">
          <span className="text-[15px]">🇮🇳</span>
          <span className="text-[14px] font-bold text-[#4A5568]">+91</span>
        </div>
        <input
          type="tel"
          value={value}
          onChange={e => onChange(e.target.value.replace(/\D/g, '').slice(0, 10))}
          placeholder="10-digit number"
          maxLength={10}
          className="flex-1 px-3 py-2.5 text-[14px] focus:outline-none bg-transparent"
        />
      </div>
    </div>
  );
}

function SaveBtn({ onSave, saved, saving }) {
  return (
    <button onClick={onSave} disabled={saving}
      className={`w-full py-3.5 rounded-2xl font-bold text-[15px] flex items-center justify-center gap-2 mt-3 transition-colors
        ${saved ? 'bg-green-500 text-white' : 'bg-primary text-white disabled:opacity-60'}`}>
      {saving
        ? <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
        : saved ? '✅ Saved!' : <><Save size={16} /> Save Changes</>
      }
    </button>
  );
}

function useSave(saveFn) {
  const [saved,  setSaved]  = useState(false);
  const [saving, setSaving] = useState(false);
  const doSave = async () => {
    if (saving) return;
    setSaving(true);
    try {
      await saveFn();
      setSaved(true);
      setTimeout(() => setSaved(false), 2500);
    } catch (e) {
      console.error('Save failed:', e);
      alert('Save failed: ' + e.message);
    } finally {
      setSaving(false);
    }
  };
  return [saved, saving, doSave];
}

function PrayerEditor() {
  const { prayers, jumma, refetch } = useData();
  const { token } = useApp();
  const salah = ['fajr', 'dhuhr', 'asr', 'maghrib', 'isha'];

  const [times, setTimes] = useState(() =>
    Object.fromEntries(salah.map(k => [k, { azan: prayers[k].azan, jamat: prayers[k].jamat || '', qazaEnd: prayers[k].qazaEnd || '' }]))
  );
  const [jummaState, setJummaState] = useState({
    azan1: jumma.azan1, jamat1: jumma.jamat1,
    azan2: jumma.azan2, jamat2: jumma.jamat2,
    note:  jumma.note,
  });

  const [saved, saving, doSave] = useSave(async () => {
    const payload = {};
    for (const k of salah) payload[k] = { azan: times[k].azan, jamat: times[k].jamat || null, qazaEnd: times[k].qazaEnd || null };
    await Promise.all([
      api.updatePrayers(payload, token),
      api.updateJumma(jummaState, token),
    ]);
    refetch();
  });

  return (
    <div className="space-y-3">
      <p className="text-[11px] font-bold text-[#9CA3AF] uppercase tracking-widest px-1">Daily Prayers</p>
      {salah.map(k => (
        <div key={k} className="bg-[#F7F5F0] rounded-xl p-3">
          <p className="font-bold text-[14px] text-primary capitalize mb-2">{prayers[k].name}</p>
          <div className="grid grid-cols-2 gap-2">
            <div><label className="text-[11px] text-[#9CA3AF] font-bold block mb-1">Azan</label>
              <input type="time" value={times[k].azan}
                onChange={e => setTimes(p => ({ ...p, [k]: { ...p[k], azan: e.target.value } }))}
                className="w-full border-2 border-[#EEEBE4] rounded-xl px-3 py-2 text-[13px] focus:outline-none focus:border-primary bg-white" /></div>
            <div><label className="text-[11px] text-[#9CA3AF] font-bold block mb-1">Jamat</label>
              <input type="time" value={times[k].jamat || ''}
                onChange={e => setTimes(p => ({ ...p, [k]: { ...p[k], jamat: e.target.value } }))}
                className="w-full border-2 border-[#EEEBE4] rounded-xl px-3 py-2 text-[13px] focus:outline-none focus:border-primary bg-white" /></div>
          </div>
          <div><label className="text-[11px] text-[#9CA3AF] font-bold block mb-1">Qaza End <span className="normal-case font-normal">(optional — last time to pray as Qaza)</span></label>
            <input type="time" value={times[k].qazaEnd || ''}
              onChange={e => setTimes(p => ({ ...p, [k]: { ...p[k], qazaEnd: e.target.value } }))}
              className="w-full border-2 border-[#EEEBE4] rounded-xl px-3 py-2 text-[13px] focus:outline-none focus:border-accent bg-white" /></div>
        </div>
      ))}

      <div className="pt-1">
        <p className="text-[11px] font-bold text-[#9CA3AF] uppercase tracking-widest px-1 mb-2">Friday Jumu'ah</p>
        <div className="bg-primary/5 rounded-xl p-3 border border-primary/15 space-y-2">
          <div className="grid grid-cols-2 gap-2">
            <Field label="Azan (1st)"  value={jummaState.azan1}   onChange={v => setJummaState(j => ({...j, azan1: v}))}   type="time" />
            <Field label="1st Jamat"   value={jummaState.jamat1}  onChange={v => setJummaState(j => ({...j, jamat1: v}))}  type="time" />
            <Field label="Azan (2nd)"  value={jummaState.azan2}   onChange={v => setJummaState(j => ({...j, azan2: v}))}   type="time" />
            <Field label="2nd Jamat"   value={jummaState.jamat2}  onChange={v => setJummaState(j => ({...j, jamat2: v}))}  type="time" />
          </div>
          <Field label="Note" value={jummaState.note} onChange={v => setJummaState(j => ({...j, note: v}))} />
        </div>
      </div>

      <SaveBtn onSave={doSave} saved={saved} saving={saving} />
    </div>
  );
}

// Add/subtract minutes from a "HH:MM" string, returns "HH:MM"
function shiftTime(hhmm, deltaMins) {
  const [h, m] = hhmm.split(':').map(Number);
  let total = h * 60 + m + deltaMins;
  total = ((total % 1440) + 1440) % 1440; // wrap 0-1439
  const hh = String(Math.floor(total / 60)).padStart(2, '0');
  const mm = String(total % 60).padStart(2, '0');
  return `${hh}:${mm}`;
}

// Format a Date as "2 Mar"
function fmtDate(d) {
  return `${d.getDate()} ${d.toLocaleString('en-GB', { month: 'short' })}`;
}

function RamadanMgr() {
  const { ramadan, ramadanMode, refetch } = useData();
  const { token } = useApp();
  const [toggling, setToggling] = useState(false);

  // Auto-generate form state
  const [startDate,    setStartDate]    = useState('2025-03-02');
  const [day1Sehri,    setDay1Sehri]    = useState(ramadan[0]?.sehri  || '04:58');
  const [day1Iftar,    setDay1Iftar]    = useState(ramadan[0]?.iftar  || '18:15');
  const [taraweeh,     setTaraweeh]     = useState(ramadan[0]?.taraweeh || '21:45');
  const [sehriShift,   setSehriShift]   = useState('-1');  // mins/day (negative = earlier)
  const [iftarShift,   setIftarShift]   = useState('1');   // mins/day (positive = later)
  const [preview,      setPreview]      = useState(false);
  const [generated,    setGenerated]    = useState([]);

  const [saved, saving, doSave] = useSave(async () => {
    await api.updateRamadan(generated, token);
    refetch();
    setPreview(false);
  });

  const generate = () => {
    const base = new Date(startDate);
    const rows = [];
    for (let i = 0; i < 30; i++) {
      const d = new Date(base);
      d.setDate(base.getDate() + i);
      rows.push({
        day:      i + 1,
        date:     fmtDate(d),
        sehri:    shiftTime(day1Sehri, i * Number(sehriShift)),
        iftar:    shiftTime(day1Iftar, i * Number(iftarShift)),
        taraweeh,
      });
    }
    setGenerated(rows);
    setPreview(true);
  };

  const toggleRamadanMode = async () => {
    setToggling(true);
    try {
      await api.updateMasjid({ ramadanMode: !ramadanMode }, token);
      refetch();
    } finally {
      setToggling(false);
    }
  };

  return (
    <div className="space-y-3">

      {/* RAMADAN MODE TOGGLE */}
      <div className={`rounded-2xl border-2 p-4 ${ramadanMode ? 'border-[#9A7B2F] bg-amber-50' : 'border-[#EEEBE4] bg-[#F7F5F0]'}`}>
        <div className="flex items-center justify-between mb-2">
          <div>
            <p className="font-bold text-[16px] text-[#1A1A1A]">🌙 Ramadan Mode</p>
            <p className="text-[12px] text-[#9CA3AF] mt-0.5">
              {ramadanMode ? 'Users can see Ramadan timetable & features' : 'Ramadan features hidden from users'}
            </p>
          </div>
          <button onClick={toggleRamadanMode} disabled={toggling}
            className={`w-14 h-7 rounded-full relative transition-colors shrink-0 disabled:opacity-60 ${ramadanMode ? 'bg-[#9A7B2F]' : 'bg-[#D1D5DB]'}`}>
            <motion.span className="absolute top-1 w-5 h-5 bg-white rounded-full shadow"
              animate={{ left: ramadanMode ? '30px' : '4px' }}
              transition={{ type: 'spring', stiffness: 500, damping: 35 }} />
          </button>
        </div>
        {ramadanMode
          ? <p className="text-[11px] font-bold text-[#9A7B2F] bg-[#9A7B2F]/10 rounded-lg px-2.5 py-1.5">✅ Ramadan Mode is ON — timetable & strip visible to users</p>
          : <p className="text-[11px] text-[#9CA3AF] bg-white border border-[#EEEBE4] rounded-lg px-2.5 py-1.5">⚫ Ramadan Mode is OFF — all Ramadan features are hidden</p>
        }
      </div>

      {/* AUTO-GENERATE TIMETABLE */}
      {ramadanMode && !preview && (
        <div className="bg-white rounded-2xl border border-[#EEEBE4] p-4 space-y-3">
          <div>
            <p className="font-bold text-[15px] text-[#1A1A1A]">Generate 30-Day Timetable</p>
            <p className="text-[12px] text-[#9CA3AF] mt-0.5">Enter Day 1 times — app calculates the rest automatically</p>
          </div>

          <Field label="Ramadan Start Date" value={startDate} onChange={setStartDate} type="date" />

          <div className="grid grid-cols-2 gap-2">
            <Field label="Day 1 Sehri End"  value={day1Sehri}  onChange={setDay1Sehri}  type="time" />
            <Field label="Day 1 Iftar Time" value={day1Iftar}  onChange={setDay1Iftar}  type="time" />
          </div>

          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="block text-[12px] font-bold text-[#9CA3AF] uppercase mb-1">Sehri shift / day</label>
              <div className="flex items-center border-2 border-[#EEEBE4] rounded-xl overflow-hidden bg-[#FAFAF8]">
                <input type="number" value={sehriShift} onChange={e => setSehriShift(e.target.value)}
                  className="flex-1 px-3 py-2.5 text-[14px] bg-transparent focus:outline-none w-0" />
                <span className="text-[12px] text-[#9CA3AF] pr-3 font-semibold shrink-0">min</span>
              </div>
              <p className="text-[10px] text-[#9CA3AF] mt-1 px-1">Use -1 (gets earlier each day)</p>
            </div>
            <div>
              <label className="block text-[12px] font-bold text-[#9CA3AF] uppercase mb-1">Iftar shift / day</label>
              <div className="flex items-center border-2 border-[#EEEBE4] rounded-xl overflow-hidden bg-[#FAFAF8]">
                <input type="number" value={iftarShift} onChange={e => setIftarShift(e.target.value)}
                  className="flex-1 px-3 py-2.5 text-[14px] bg-transparent focus:outline-none w-0" />
                <span className="text-[12px] text-[#9CA3AF] pr-3 font-semibold shrink-0">min</span>
              </div>
              <p className="text-[10px] text-[#9CA3AF] mt-1 px-1">Use +1 (gets later each day)</p>
            </div>
          </div>

          <Field label="Taraweeh Jamat (all 30 days)" value={taraweeh} onChange={setTaraweeh} type="time" />

          <button onClick={generate}
            className="w-full bg-[#9A7B2F] text-white font-bold text-[15px] py-3.5 rounded-2xl flex items-center justify-center gap-2">
            ✨ Preview & Generate 30 Days
          </button>
        </div>
      )}

      {/* PREVIEW + EDIT TABLE */}
      {ramadanMode && preview && generated.length > 0 && (
        <div className="space-y-3">
          <div className="bg-amber-50 border border-amber-200 rounded-xl px-3.5 py-2.5 flex items-center justify-between">
            <div>
              <p className="font-bold text-[13px] text-[#9A7B2F]">Preview — 30 days generated</p>
              <p className="text-[11px] text-[#9CA3AF] mt-0.5">Tap any Sehri / Iftar cell to edit, then save</p>
            </div>
            <button onClick={() => setPreview(false)} className="flex items-center gap-1 text-[12px] text-[#9CA3AF] font-semibold">
              <Pencil size={11} /> Re-generate
            </button>
          </div>

          <div className="bg-white rounded-2xl border border-[#EEEBE4] overflow-hidden">
            {/* Header */}
            <div className="grid bg-[#F7F5F0] border-b border-[#EEEBE4]"
              style={{ gridTemplateColumns: '24px 52px 1fr 1fr 1fr' }}>
              {['#', 'Date', 'Sehri', 'Iftar', 'Tarw.'].map(h => (
                <p key={h} className="text-[10px] font-bold text-[#9CA3AF] uppercase text-center py-2 px-1">{h}</p>
              ))}
            </div>

            {generated.map((r, i) => (
              <div key={i}
                className={`grid items-center border-b border-[#F5F3EE] last:border-0 ${i % 2 === 0 ? 'bg-white' : 'bg-[#FAFAF8]'}`}
                style={{ gridTemplateColumns: '24px 52px 1fr 1fr 1fr' }}>

                {/* Day # */}
                <p className="text-center font-black text-[11px] text-[#9CA3AF] digit py-1">{r.day}</p>

                {/* Date */}
                <p className="text-[11px] font-semibold text-[#4A5568] px-1 py-1">{r.date}</p>

                {/* Sehri — editable */}
                <div className="px-1 py-1">
                  <div className="relative">
                    <input
                      type="time"
                      value={r.sehri}
                      onChange={e => setGenerated(g => g.map((row, idx) => idx === i ? { ...row, sehri: e.target.value } : row))}
                      className="w-full text-[12px] font-bold text-[#1A1A1A] bg-transparent border border-[#EEEBE4] rounded-lg px-1.5 py-1 focus:outline-none focus:border-primary focus:bg-white"
                    />
                    <p className="text-[10px] text-[#9CA3AF] text-center mt-0.5 digit">{fmt12(r.sehri)}</p>
                  </div>
                </div>

                {/* Iftar — editable */}
                <div className="px-1 py-1">
                  <div className="relative">
                    <input
                      type="time"
                      value={r.iftar}
                      onChange={e => setGenerated(g => g.map((row, idx) => idx === i ? { ...row, iftar: e.target.value } : row))}
                      className="w-full text-[12px] font-bold text-accent bg-transparent border border-[#EEEBE4] rounded-lg px-1.5 py-1 focus:outline-none focus:border-accent focus:bg-white"
                    />
                    <p className="text-[10px] text-accent text-center mt-0.5 digit">{fmt12(r.iftar)}</p>
                  </div>
                </div>

                {/* Taraweeh — editable */}
                <div className="px-1 py-1">
                  <input
                    type="time"
                    value={r.taraweeh}
                    onChange={e => setGenerated(g => g.map((row, idx) => idx === i ? { ...row, taraweeh: e.target.value } : row))}
                    className="w-full text-[11px] font-semibold text-[#9CA3AF] bg-transparent border border-[#EEEBE4] rounded-lg px-1 py-1 focus:outline-none focus:border-primary focus:bg-white"
                  />
                  <p className="text-[10px] text-[#9CA3AF] text-center mt-0.5 digit">{fmt12(r.taraweeh)}</p>
                </div>
              </div>
            ))}
          </div>

          <SaveBtn onSave={doSave} saved={saved} saving={saving} />
        </div>
      )}
    </div>
  );
}

function EidSection({ title, bg, border, emoji, state, setState }) {
  const color = title === 'Eid-ul-Fitr' ? '#9A7B2F' : '#1A5C38';
  return (
    <div className={`${bg} rounded-xl p-3 border ${border} space-y-2`}>
      <div className="flex items-center justify-between">
        <p className="font-bold text-[14px]" style={{ color }}>{emoji} {title}</p>
        <div className="flex items-center gap-2">
          <span className="text-[12px] font-semibold text-[#6B7280]">Show on Home</span>
          <button onClick={() => setState(s => ({...s, isLive: !s.isLive}))}
            className={`w-11 h-6 rounded-full relative transition-colors ${state.isLive ? 'bg-primary' : 'bg-[#D1D5DB]'}`}>
            <motion.span className="absolute top-0.5 w-5 h-5 bg-white rounded-full shadow"
              animate={{ left: state.isLive ? '22px' : '2px' }} transition={{ type: 'spring', stiffness: 500, damping: 35 }} />
          </button>
        </div>
      </div>
      {state.isLive && (
        <p className="text-[11px] font-bold text-primary bg-primary/10 rounded-lg px-2 py-1">
          ✅ Eid banner is LIVE on the home screen
        </p>
      )}
      <Field label="Expected Date" value={state.date} onChange={v => setState(s => ({...s, date: v}))} />
      <p className="text-[11px] font-bold text-[#9CA3AF] uppercase mt-1">Jamat Times</p>
      <div className="grid grid-cols-3 gap-2">
        <Field label="1st Jamat" value={state.j1} onChange={v => setState(s => ({...s, j1: v}))} type="time" />
        <Field label="2nd Jamat" value={state.j2} onChange={v => setState(s => ({...s, j2: v}))} type="time" />
        <Field label="3rd Jamat" value={state.j3} onChange={v => setState(s => ({...s, j3: v}))} type="time" />
      </div>
      <Field label="Venue" value={state.venue} onChange={v => setState(s => ({...s, venue: v}))} placeholder="e.g. Masjid Main Hall" />
      <Field label="Note" value={state.note}  onChange={v => setState(s => ({...s, note:  v}))} placeholder="e.g. Gates open 30 mins early" />
    </div>
  );
}

function EidMgr() {
  const { eid, refetch } = useData();
  const { token } = useApp();

  const toState = (e) => ({ date: e.date, j1: e.jamats[0], j2: e.jamats[1], j3: e.jamats[2], venue: e.venue, note: e.note, isLive: e.isLive });
  const [fitr, setFitr] = useState(() => toState(eid.fitr));
  const [adha, setAdha] = useState(() => toState(eid.adha));

  const [saved, saving, doSave] = useSave(async () => {
    await Promise.all([
      api.updateEid('fitr', { date: fitr.date, jamats: [fitr.j1, fitr.j2, fitr.j3], venue: fitr.venue, note: fitr.note, isLive: fitr.isLive }, token),
      api.updateEid('adha', { date: adha.date, jamats: [adha.j1, adha.j2, adha.j3], venue: adha.venue, note: adha.note, isLive: adha.isLive }, token),
    ]);
    refetch();
  });

  return (
    <div className="space-y-3">
      <EidSection title="Eid-ul-Fitr" bg="bg-amber-50" border="border-amber-200" emoji="🌙" state={fitr} setState={setFitr} />
      <EidSection title="Eid-ul-Adha" bg="bg-green-50"  border="border-green-200" emoji="🐑" state={adha} setState={setAdha} />
      <SaveBtn onSave={doSave} saved={saved} saving={saving} />
    </div>
  );
}

const TAGS = ['Notice', 'Ramadan', "Jumu'ah", 'Education', 'Zakat', 'Facilities', 'Event', 'Other'];

function NewsMgr() {
  const { announcements, refetch } = useData();
  const { token } = useApp();
  const [title,  setTitle]  = useState('');
  const [body,   setBody]   = useState('');
  const [tag,    setTag]    = useState('Notice');
  const [urgent, setUrgent] = useState(false);

  const add = async () => {
    if (!title.trim()) return;
    await api.createAnnouncement({ title, body, urgent, tag }, token);
    setTitle(''); setBody(''); setTag('Notice'); setUrgent(false);
    refetch();
  };

  const remove = async (id) => {
    await api.deleteAnnouncement(id, token);
    refetch();
  };

  return (
    <div className="space-y-3">
      <div className="bg-primary/5 rounded-xl p-3 border border-primary/10 space-y-2">
        <p className="font-bold text-[14px] text-primary flex items-center gap-1"><Plus size={14} />New</p>
        <Field label="Title" value={title} onChange={setTitle} placeholder="Announcement title..." />
        <div><label className="text-[11px] text-[#9CA3AF] font-bold block mb-1">Body</label>
          <textarea value={body} onChange={e => setBody(e.target.value)} placeholder="Details..."
            className="w-full border-2 border-[#EEEBE4] rounded-xl px-3.5 py-2.5 text-[14px] resize-none h-16 focus:outline-none focus:border-primary bg-white" /></div>
        <div>
          <label className="text-[11px] text-[#9CA3AF] font-bold block mb-1.5">Tag</label>
          <div className="flex flex-wrap gap-1.5">
            {TAGS.map(t => (
              <button key={t} type="button" onClick={() => setTag(t)}
                className={`px-2.5 py-1 rounded-lg text-[12px] font-bold transition-colors ${tag === t ? 'bg-primary text-white' : 'bg-white border border-[#EEEBE4] text-[#6B7280]'}`}>
                {t}
              </button>
            ))}
          </div>
        </div>
        <div className="flex items-center justify-between py-1">
          <span className="text-[14px] font-semibold text-[#1A1A1A]">Urgent</span>
          <button onClick={() => setUrgent(v => !v)}
            className={`w-11 h-6 rounded-full relative transition-colors ${urgent ? 'bg-[#C0392B]' : 'bg-[#D1D5DB]'}`}>
            <motion.span className="absolute top-0.5 w-5 h-5 bg-white rounded-full shadow"
              animate={{ left: urgent ? '22px' : '2px' }} transition={{ type: 'spring', stiffness: 500, damping: 35 }} />
          </button>
        </div>
        <button onClick={add} className="w-full bg-primary text-white font-bold text-[14px] py-3 rounded-xl flex items-center justify-center gap-1.5">
          <Plus size={15} /> Post
        </button>
      </div>
      <div className="space-y-2">
        <p className="text-[12px] font-bold text-[#9CA3AF] uppercase">Recent ({announcements.length})</p>
        {announcements.slice(0, 6).map(a => (
          <div key={a.id} className={`bg-white rounded-xl border px-3 py-2.5 flex items-center gap-2 ${a.urgent ? 'border-red-200' : 'border-[#EEEBE4]'}`}>
            <div className="flex-1 min-w-0">
              <p className="font-semibold text-[14px] text-[#1A1A1A] truncate">{a.title}</p>
              <p className="text-[12px] text-[#9CA3AF]">{a.date}</p>
            </div>
            <button onClick={() => remove(a.id)} className="text-[#C0392B]/50 hover:text-[#C0392B]">
              <Trash2 size={15} />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}

function LiveMgr() {
  const { liveAzan, refetch } = useData();
  const { token } = useApp();
  const navigate = useNavigate();
  const [channel,        setChannel]        = useState(liveAzan.channelName || 'azan-live');
  const [broadcasting,   setBroadcasting]   = useState(() => isBroadcasting());
  const [micError,       setMicError]       = useState('');
  const [toggling,       setToggling]       = useState(false);
  const [muazzinToken,   setMuazzinToken]   = useState(null);
  const [tokenLoading,   setTokenLoading]   = useState(false);
  const [linkCopied,     setLinkCopied]     = useState(false);

  useEffect(() => {
    api.getMuazzinToken(token).then(d => setMuazzinToken(d.muazzinToken)).catch(() => {});
  }, [token]);

  const regenerateToken = async () => {
    setTokenLoading(true);
    try {
      const d = await api.generateMuazzinToken(token);
      setMuazzinToken(d.muazzinToken);
    } finally {
      setTokenLoading(false);
    }
  };

  const appBase = import.meta.env.VITE_APP_URL || window.location.origin;
  const muazzinUrl = muazzinToken ? `${appBase}/muazzin/${muazzinToken}` : null;

  const copyLink = () => {
    if (!muazzinUrl) return;
    navigator.clipboard.writeText(muazzinUrl);
    setLinkCopied(true);
    setTimeout(() => setLinkCopied(false), 2000);
  };

  const [saved, saving, doSave] = useSave(async () => {
    await api.updateLiveAzan({ channelName: channel }, token);
    refetch();
  });

  const forceStop = async () => {
    setMicError('');
    setToggling(true);
    try {
      if (isBroadcasting()) { await stopBroadcast(); setBroadcasting(false); }
      await api.updateLiveAzan({ isLive: false }, token);
      refetch();
    } catch (e) {
      setMicError(e.message || 'Failed to stop stream.');
    } finally {
      setToggling(false);
    }
  };

  return (
    <div className="space-y-3">
      {/* STREAM STATUS */}
      <div className={`rounded-xl border-2 p-4 ${liveAzan.isLive ? 'border-[#C0392B] bg-red-50' : 'border-[#EEEBE4] bg-[#F7F5F0]'}`}>
        <div className="flex items-center justify-between mb-3">
          <p className="font-bold text-[16px] text-[#1A1A1A]">Stream Status</p>
          <span className={`text-[11px] font-bold px-2.5 py-1 rounded-full ${liveAzan.isLive ? 'bg-[#C0392B] text-white' : 'bg-[#E5E7EB] text-[#9CA3AF]'}`}>
            {liveAzan.isLive ? '🔴 LIVE' : '⚫ OFFLINE'}
          </span>
        </div>

        {liveAzan.isLive && (
          <div className="flex items-center gap-2 mb-3 bg-red-100 rounded-lg px-3 py-2">
            <Mic size={14} className="text-[#C0392B] shrink-0" />
            <div className="flex items-end gap-0.5 h-4">
              {[3,5,4,6,3,5].map((h, i) => (
                <motion.div key={i} className="w-0.5 bg-[#C0392B] rounded-full origin-bottom"
                  animate={{ scaleY: [h/6, 1, h/6] }}
                  transition={{ duration: 0.4 + i * 0.1, repeat: Infinity, ease: 'easeInOut' }} />
              ))}
            </div>
            <span className="text-[12px] font-bold text-[#C0392B]">Muazzin is broadcasting live</span>
          </div>
        )}

        {!liveAzan.isLive && (
          <p className="text-[13px] text-[#9CA3AF] mb-3">Muazzins start the Azan from their dedicated link.</p>
        )}

        {micError && (
          <div className="mb-3 bg-white border border-red-200 rounded-lg px-3 py-2 text-[12px] text-[#C0392B]">
            {micError}
          </div>
        )}

        {liveAzan.isLive && (
          <button onClick={forceStop} disabled={toggling}
            className="w-full py-3 rounded-xl font-bold text-[14px] flex items-center justify-center gap-2 disabled:opacity-60 bg-[#4A5568] text-white">
            {toggling
              ? <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              : <><MicOff size={16} /> Force Stop</>
            }
          </button>
        )}
      </div>

      {/* CHANNEL SETTINGS */}
      <Field label="Agora Channel Name" value={channel} onChange={setChannel} placeholder="e.g. azan-live" />
      <p className="text-[11px] text-[#9CA3AF] px-1">
        App ID is configured on the server. Both admin and listeners use the same channel name.
      </p>
      <SaveBtn onSave={doSave} saved={saved} saving={saving} />

      {/* MUAZZIN LINK */}
      <div className="bg-[#F7F5F0] rounded-xl p-3 space-y-2 mt-1">
        <p className="text-[11px] font-bold text-[#9CA3AF] uppercase mb-1">Muazzin Link</p>
        <p className="text-[12px] text-[#6B7280]">Share this link with your muazzins. They can start/stop the Azan without logging in.</p>
        {muazzinToken ? (
          <>
            {/* Open muazzin page inside the app — mic works in Capacitor secure context */}
            <button onClick={() => navigate(`/muazzin/${muazzinToken}`)}
              className="w-full py-3 rounded-xl font-bold text-[14px] bg-[#C0392B] text-white flex items-center justify-center gap-2">
              <Mic size={16} /> Start Broadcasting (This Device)
            </button>
            <div className="bg-white border border-[#EEEBE4] rounded-xl px-3 py-2.5 text-[12px] text-primary font-medium break-all">
              {muazzinUrl}
            </div>
            <div className="flex gap-2">
              <button onClick={copyLink}
                className={`flex-1 py-2.5 rounded-xl font-bold text-[13px] border-2 transition-colors ${linkCopied ? 'bg-green-500 text-white border-green-500' : 'border-primary text-primary bg-white'}`}>
                {linkCopied ? '✅ Copied!' : 'Copy Link'}
              </button>
              <button onClick={regenerateToken} disabled={tokenLoading}
                className="flex-1 py-2.5 rounded-xl font-bold text-[13px] bg-[#4A5568] text-white disabled:opacity-60">
                {tokenLoading ? 'Generating...' : 'Regenerate'}
              </button>
            </div>
            <p className="text-[11px] text-[#9CA3AF]">⚠️ Regenerating will invalidate the old link immediately.</p>
          </>
        ) : (
          <button onClick={regenerateToken} disabled={tokenLoading}
            className="w-full py-2.5 rounded-xl font-bold text-[14px] bg-primary text-white disabled:opacity-60">
            {tokenLoading ? 'Generating...' : 'Generate Muazzin Link'}
          </button>
        )}
      </div>
    </div>
  );
}

function AppMgr() {
  const { masjid, ticker, refetch } = useData();
  const { token } = useApp();

  const [name,     setName]     = useState(masjid.name);
  const [arabic,   setArabic]   = useState(masjid.arabic);
  const [addr,     setAddr]     = useState(masjid.address);
  const [phone,    setPhone]    = useState(masjid.phone);
  const [email,    setEmail]    = useState(masjid.email);
  const [whatsapp, setWhatsapp] = useState(masjid.whatsapp);
  const [mapsUrl,  setMapsUrl]  = useState(masjid.mapsUrl || '');
  const [about,    setAbout]    = useState(masjid.about || '');

  const [tickerItems, setTickerItems] = useState(ticker || []);

  const [saved, saving, doSave] = useSave(async () => {
    await Promise.all([
      api.updateMasjid({ name, arabic, address: addr, phone, email, whatsapp, mapsUrl, about }, token),
      api.updateTicker({ items: tickerItems.filter(t => t.trim()) }, token),
    ]);
    refetch();
  });

  return (
    <div className="space-y-3">
      <div className="bg-[#F7F5F0] rounded-xl p-3 space-y-2">
        <p className="text-[11px] font-bold text-[#9CA3AF] uppercase mb-1">Identity</p>
        <Field label="Masjid Name (English)" value={name}   onChange={setName} />
        <Field label="Masjid Name (Arabic)"  value={arabic} onChange={setArabic} />
        <div>
          <label className="block text-[12px] font-bold text-[#9CA3AF] uppercase mb-1">About</label>
          <textarea value={about} onChange={e => setAbout(e.target.value)} rows={3}
            placeholder="Short description shown on the About page..."
            className="w-full border-2 border-[#EEEBE4] rounded-xl px-3.5 py-2.5 text-[14px] focus:outline-none focus:border-primary bg-[#FAFAF8] resize-none" />
        </div>
      </div>
      <div className="bg-[#F7F5F0] rounded-xl p-3 space-y-2">
        <p className="text-[11px] font-bold text-[#9CA3AF] uppercase mb-1">Contact</p>
        <Field label="Address"              value={addr}     onChange={setAddr} />
        <PhoneField label="Phone"           value={phone}    onChange={setPhone} />
        <Field label="Email"               value={email}    onChange={setEmail}    type="email" />
        <PhoneField label="WhatsApp Number" value={whatsapp} onChange={setWhatsapp} />
        <Field label="Google Maps Link"    value={mapsUrl}  onChange={setMapsUrl}  placeholder="https://maps.app.goo.gl/..." />
      </div>
      <div className="bg-[#F7F5F0] rounded-xl p-3 space-y-2">
        <p className="text-[11px] font-bold text-[#9CA3AF] uppercase mb-1">News Ticker</p>
        {tickerItems.map((item, i) => (
          <div key={i} className="flex gap-2 items-center">
            <input value={item} onChange={e => setTickerItems(prev => prev.map((t, j) => j === i ? e.target.value : t))}
              className="flex-1 border-2 border-[#EEEBE4] rounded-xl px-3 py-2 text-[13px] focus:outline-none focus:border-primary bg-[#FAFAF8]" />
            <button onClick={() => setTickerItems(prev => prev.filter((_, j) => j !== i))}
              className="text-red-400 hover:text-red-600 p-1"><Trash2 size={15} /></button>
          </div>
        ))}
        <button onClick={() => setTickerItems(prev => [...prev, ''])}
          className="flex items-center gap-1.5 text-primary font-bold text-[13px] pt-1">
          <Plus size={14} /> Add Message
        </button>
      </div>
      <SaveBtn onSave={doSave} saved={saved} saving={saving} />
    </div>
  );
}

function SecurityMgr() {
  const { token, logout } = useApp();
  const navigate = useNavigate();

  const [curPw,    setCurPw]    = useState('');
  const [newPw,    setNewPw]    = useState('');
  const [confPw,   setConfPw]   = useState('');
  const [show,     setShow]     = useState(false);
  const [error,    setError]    = useState('');
  const [success,  setSuccess]  = useState(false);
  const [loading,  setLoading]  = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    setError(''); setSuccess(false);
    if (newPw !== confPw) { setError('New passwords do not match'); return; }
    if (newPw.length < 8) { setError('New password must be at least 8 characters'); return; }
    setLoading(true);
    try {
      await api.changePassword(curPw, newPw, token);
      setSuccess(true);
      setCurPw(''); setNewPw(''); setConfPw('');
      // Log out — all sessions invalidated after password change
      setTimeout(() => { logout(); navigate('/admin/login'); }, 2000);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-4">
      <div className="bg-[#F0FDF4] border border-green-200 rounded-xl px-3.5 py-2.5">
        <p className="text-[12px] font-bold text-green-700 uppercase tracking-wider mb-0.5">Security Info</p>
        <p className="text-[13px] text-green-600 leading-relaxed">
          After changing your password, all active sessions will be logged out and you'll need to log in again.
        </p>
      </div>

      <form onSubmit={submit} className="space-y-3">
        {[
          { label: 'Current Password',      val: curPw,  set: setCurPw  },
          { label: 'New Password',          val: newPw,  set: setNewPw  },
          { label: 'Confirm New Password',  val: confPw, set: setConfPw },
        ].map(({ label, val, set }) => (
          <div key={label}>
            <label className="block text-[12px] font-bold text-[#9CA3AF] uppercase mb-1">{label}</label>
            <div className="relative">
              <input
                type={show ? 'text' : 'password'} value={val}
                onChange={e => set(e.target.value)}
                placeholder="••••••••"
                className="w-full border-2 border-[#EEEBE4] rounded-xl px-3.5 py-2.5 pr-10 text-[14px] focus:outline-none focus:border-primary bg-[#FAFAF8]"
              />
            </div>
          </div>
        ))}

        <button type="button" onClick={() => setShow(v => !v)}
          className="flex items-center gap-1.5 text-[13px] text-[#6B7280] font-medium">
          {show ? <EyeOff size={14} /> : <Eye size={14} />}
          {show ? 'Hide' : 'Show'} passwords
        </button>

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-xl px-3.5 py-2.5 text-[13px] text-[#C0392B]">
            {error}
          </div>
        )}
        {success && (
          <div className="bg-green-50 border border-green-200 rounded-xl px-3.5 py-2.5 text-[13px] text-green-700 font-semibold">
            ✅ Password updated. Logging you out…
          </div>
        )}

        <button type="submit" disabled={loading || success || !curPw || !newPw || !confPw}
          className={`w-full py-3.5 rounded-2xl font-bold text-[15px] flex items-center justify-center gap-2 mt-1 transition-colors
            ${success ? 'bg-green-500 text-white' : 'bg-primary text-white disabled:opacity-60'}`}>
          {loading
            ? <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            : success ? '✅ Updated!' : <><Save size={16} /> Update Password</>
          }
        </button>
      </form>
    </div>
  );
}

const CONTENT = { prayer: PrayerEditor, ramadan: RamadanMgr, eid: EidMgr, news: NewsMgr, live: LiveMgr, app: AppMgr, security: SecurityMgr };

export default function AdminDashboard() {
  const [active, setActive] = useState('prayer');
  const { logout } = useApp();
  const navigate = useNavigate();
  const Active = CONTENT[active];
  const sec = SECTIONS.find(s => s.id === active);

  return (
    <div className="h-screen bg-[#F5F3EE] flex flex-col overflow-hidden" style={{ maxWidth: 430, margin: '0 auto' }}>
      <div className="bg-primary px-4 pb-3 flex items-center justify-between sticky top-0 z-20"
        style={{ paddingTop: 'max(2.5rem, env(safe-area-inset-top) + 0.75rem)' }}>
        <div>
          <p className="text-white font-bold text-[18px]">Admin Panel</p>
          <p className="text-white/50 text-[12px]">Jama Masjid Ahle Hadith</p>
        </div>
        <button onClick={() => { logout(); navigate('/admin/login'); }}
          className="flex items-center gap-1.5 bg-white/20 text-white px-3 py-2 rounded-xl text-[13px] font-semibold">
          <LogOut size={14} /> Logout
        </button>
      </div>

      <div className="bg-white border-b border-[#EEEBE4] flex overflow-x-auto sticky top-[68px] z-10" style={{ scrollbarWidth: 'none' }}>
        {SECTIONS.map(s => (
          <button key={s.id} onClick={() => setActive(s.id)}
            className={`flex flex-col items-center gap-1 px-4 py-2.5 shrink-0 border-b-2 transition-all ${active === s.id ? 'border-primary' : 'border-transparent'}`}>
            <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${active === s.id ? 'bg-primary' : 'bg-[#F5F3EE]'}`}>
              <s.icon size={16} style={{ color: active === s.id ? 'white' : s.color }} />
            </div>
            <span className={`text-[10px] font-bold ${active === s.id ? 'text-primary' : 'text-[#9CA3AF]'}`}>{s.label}</span>
          </button>
        ))}
      </div>

      <div className="flex-1 overflow-y-auto p-4" style={{ paddingBottom: 'max(2rem, env(safe-area-inset-bottom) + 1.5rem)' }}>
        <AnimatePresence mode="wait">
          <motion.div key={active} initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0 }} transition={{ duration: 0.15 }}>
            <div className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ backgroundColor: sec.color }}>
                <sec.icon size={16} className="text-white" />
              </div>
              <p className="font-bold text-[18px] text-[#1A1A1A]">{sec.label}</p>
            </div>
            <Active />
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}
