import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { api } from '../api';
import {
  PRAYERS, JUMMA, MAKRUH, WEEKLY, RAMADAN, EID,
  ANNOUNCEMENTS, MASJID, TICKER,
} from '../data/mockData';

const DataCtx = createContext(null);

export function DataProvider({ children }) {
  const [prayers,       setPrayers]       = useState(PRAYERS);
  const [jumma,         setJumma]         = useState(JUMMA);
  const [makruh,        setMakruh]        = useState(MAKRUH);
  const [weekly,        setWeekly]        = useState(WEEKLY);
  const [ramadan,       setRamadan]       = useState(RAMADAN);
  const [eid,           setEid]           = useState(EID);
  const [announcements, setAnnouncements] = useState(ANNOUNCEMENTS);
  const [masjid,        setMasjid]        = useState(MASJID);
  const [ticker,        setTicker]        = useState(TICKER);
  const [liveAzan,      setLiveAzan]      = useState({ isLive: false, channelName: 'alfalah-azan' });
  const [ramadanMode,   setRamadanMode]   = useState(false);

  const fetchAll = useCallback(async () => {
    try {
      const [p, j, mk, wk, rm, ei, ann, ms, tk, la] = await Promise.all([
        api.getPrayers(),
        api.getJumma(),
        api.getMakruh(),
        api.getWeekly(),
        api.getRamadan(),
        api.getEid(),
        api.getAnnouncements(),
        api.getMasjid(),
        api.getTicker(),
        api.getLiveAzan(),
      ]);
      setPrayers(p);
      setJumma(j);
      setMakruh(mk);
      setWeekly(wk);
      setRamadan(rm);
      setEid(ei);
      setAnnouncements(ann);
      setMasjid(ms);
      setRamadanMode(!!ms.ramadanMode);
      setTicker(tk.items || TICKER);
      setLiveAzan(la);
    } catch (err) {
      console.warn('API unavailable, using mock data:', err.message);
    }
  }, []);

  useEffect(() => { fetchAll(); }, [fetchAll]);

  // Poll live azan status every 5s so admin panel and muazzin panel stay in sync
  useEffect(() => {
    const id = setInterval(async () => {
      try {
        const la = await api.getLiveAzan();
        setLiveAzan(la);
      } catch { /* ignore */ }
    }, 5000);
    return () => clearInterval(id);
  }, []);

  return (
    <DataCtx.Provider value={{
      prayers, jumma, makruh, weekly, ramadan, eid,
      announcements, masjid, ticker, liveAzan, ramadanMode,
      refetch: fetchAll,
    }}>
      {children}
    </DataCtx.Provider>
  );
}

export const useData = () => useContext(DataCtx);
