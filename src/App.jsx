import React, { useState, useEffect } from 'react';
import { 
  Heart, Zap, Shield, Plus, Minus, Backpack, Coins, Sparkles, 
  Download, Upload, Sword, Flag, RotateCcw, LayoutGrid, X, LogOut, Copy, Check
} from 'lucide-react';

// Firebase Imports
import { db } from './firebase'; // Stelle sicher, dass die Datei existiert
import { doc, onSnapshot, setDoc, updateDoc, getDoc } from "firebase/firestore";

const CLASS_CONFIGS = {
  "Krieger": { slots: ["Aktive Kraft (Kampfhaltung)", "Spontane / Aktive Kraft", "Spontane / Aktive Kraft", "Fernkampf (Bogen/Schuss)", "Nahkampf (Kolben/Schwert)", "Item / Spontane Kraft", "Rüstung (Alle)"], stats: { hp: [4, 6, 8, 11, 14], energy: [1, 2, 3, 4, 5] } },
  "Priester": { slots: ["Spontane / Aktive Kraft", "Spontane / Aktive Kraft", "Spontane / Aktive Kraft", "Fernkampf (Zauberstab)", "Nahkampf (Kolben/Stab) / Spontane Kraft", "Item / Spontane Kraft", "Rüstung (Stoff)"], stats: { hp: [2, 3, 4, 6, 8], energy: [4, 6, 9, 11, 12] } },
  "Magier": { slots: ["Spontane / Aktive Kraft", "Spontane / Aktive Kraft", "Aktive Kraft", "Fernkampf (Zauberstab)", "Nahkampf (Stab/Schwert)", "Item / Spontane Kraft", "Rüstung (Stoff)"], stats: { hp: [2, 3, 4, 6, 8], energy: [4, 6, 9, 11, 12] } },
  "Hexenmeister": { slots: ["Spontane / Aktive Kraft", "Spontane / Aktive Kraft", "Aktive Kraft", "Fernkampf (Zauberstab)", "Nahkampf (Stab/Schwert) / Spontane Kraft", "Item / Spontane Kraft", "Rüstung (Stoff)"], stats: { hp: [2, 3, 4, 6, 8], energy: [4, 6, 9, 11, 12] } },
  "Jäger": { slots: ["Spontane / Aktive Kraft", "Spontane / Aktive Kraft", "Spontane Kraft", "Fernkampf (Bogen/Schuss)", "Nahkampf (Stab/Schwert)", "Item / Spontane Kraft", "Rüstung (Stoff/Leder)"], stats: { hp: [3, 4, 6, 8, 10], energy: [3, 5, 6, 8, 10] } },
  "Schurke": { slots: ["Spontane / Aktive Kraft", "Spontane / Aktive Kraft", "Aktive Kraft", "Fernkampf (Bogen/Schuss)", "Nahkampf (Kolben/Schwert) / Spontane Kraft", "Item / Spontane Kraft", "Rüstung (Stoff/Leder)"], stats: { hp: [3, 5, 6, 8, 10], energy: [3, 4, 6, 8, 10] } },
  "Schamane": { slots: ["Spontane / Aktive Kraft", "Spontane / Aktive Kraft", "Spontane / Aktive Kraft", "Spontane Kraft", "Nahkampf (Kolben/Stab)", "Item / Spontane Kraft", "Rüstung (Stoff/Leder)"], stats: { hp: [3, 4, 5, 7, 9], energy: [3, 5, 7, 9, 11] } },
  "Paladin": { slots: ["Spontane / Aktive Kraft", "Spontane / Aktive Kraft", "Spontane / Aktive Kraft", "Spontane Kraft", "Nahkampf (Kolben/Schwert)", "Item / Spontane Kraft", "Rüstung (Alle)"], stats: { hp: [3, 5, 7, 9, 12], energy: [2, 4, 5, 6, 8] } },
  "Druide": { slots: ["Spontane / Aktive Kraft", "Spontane / Aktive Kraft", "Aktive Kraft", "Spontane Kraft", "Nahkampf (Kolben/Stab) / Spontane Kraft", "Item / Spontane Kraft", "Rüstung (Stoff/Leder)"], stats: { hp: [2, 3, 4, 6, 8], energy: [4, 6, 9, 11, 12] } }
};

const CLASS_ICONS = {
  "Krieger": "https://static.wikia.nocookie.net/wowpedia/images/3/37/Ui-charactercreate-classes_warrior.png",
  "Priester": "https://static.wikia.nocookie.net/wowpedia/images/0/0f/Ui-charactercreate-classes_priest.png",
  "Magier": "https://static.wikia.nocookie.net/wowpedia/images/5/56/Ui-charactercreate-classes_mage.png",
  "Hexenmeister": "https://static.wikia.nocookie.net/wowpedia/images/c/cf/Ui-charactercreate-classes_warlock.png",
  "Jäger": "https://static.wikia.nocookie.net/wowpedia/images/4/4e/Ui-charactercreate-classes_hunter.png",
  "Schurke": "https://static.wikia.nocookie.net/wowpedia/images/b/b1/Ui-charactercreate-classes_rogue.png",
  "Schamane": "https://static.wikia.nocookie.net/wowpedia/images/3/3e/Ui-charactercreate-classes_shaman.png",
  "Paladin": "https://static.wikia.nocookie.net/wowpedia/images/8/80/Ui-charactercreate-classes_paladin.png",
  "Druide": "https://static.wikia.nocookie.net/wowpedia/images/6/6f/Ui-charactercreate-classes_druid.png"
};

const XP_THRESHOLDS = [0, 4, 10, 18, 28];

const createEmptyChar = (cls, faction) => {
  const config = CLASS_CONFIGS[cls];
  return {
    selectedClass: cls, faction: faction, level: 1, 
    health: config.stats.hp[0], maxHealth: config.stats.hp[0], 
    energy: config.stats.energy[0], maxEnergy: config.stats.energy[0], 
    gold: 0, xp: 0, actions: 2, dice: { red: 2, green: 2, blue: 2 },
    equipment: config.slots.map(label => ({ label, name: "", effect: "" })),
    talents: [{ name: "", effect: "", maxLvl: 2 }, { name: "", effect: "", maxLvl: 3 }, { name: "", effect: "", maxLvl: 4 }, { name: "", effect: "", maxLvl: 5 }],
    bag: []
  };
};

const App = () => {
  // Cloud States
  const [gameId, setGameId] = useState(localStorage.getItem('wow_last_game') || null);
  const [inputGameId, setInputGameId] = useState("");
  const [loading, setLoading] = useState(false);
  
  // Game States
  const [characters, setCharacters] = useState([]);
  const [matchType, setMatchType] = useState(2); 
  const [gameTurn, setGameTurn] = useState(1);
  const [activeSlot, setActiveSlot] = useState(0);
  const [showDashboard, setShowDashboard] = useState(false);
  const [copied, setCopied] = useState(false);

  // Firebase Real-Time Sync
  useEffect(() => {
    if (!gameId) return;
    setLoading(true);
    const unsub = onSnapshot(doc(db, "games", gameId), (snapshot) => {
      if (snapshot.exists()) {
        const data = snapshot.data();
        setCharacters(data.characters);
        setMatchType(data.matchType);
        setGameTurn(data.gameTurn);
        localStorage.setItem('wow_last_game', gameId);
      } else {
        alert("Spiel nicht gefunden.");
        setGameId(null);
        localStorage.removeItem('wow_last_game');
      }
      setLoading(false);
    });
    return () => unsub();
  }, [gameId]);

  // Cloud Actions
  const createGame = async () => {
    const newId = Math.random().toString(36).substring(2, 8).toUpperCase();
    const initialData = {
      characters: [
        createEmptyChar("Krieger", "Alliance"), createEmptyChar("Paladin", "Alliance"), createEmptyChar("Priester", "Alliance"),
        createEmptyChar("Schamane", "Horde"), createEmptyChar("Hexenmeister", "Horde"), createEmptyChar("Jäger", "Horde")
      ],
      matchType: 2,
      gameTurn: 1
    };
    await setDoc(doc(db, "games", newId), initialData);
    setGameId(newId);
  };

  const updateRemote = async (updates) => {
    if (!gameId) return;
    await updateDoc(doc(db, "games", gameId), updates);
  };

  // UI Helper
  const currentChar = characters[activeSlot] || null;
  const activeFaction = gameTurn % 2 !== 0 ? "Alliance" : "Horde";
  const isAllianceActive = activeFaction === "Alliance";
  const activeTeamIndices = isAllianceActive 
    ? (matchType === 2 ? [0, 1] : [0, 1, 2]) 
    : (matchType === 2 ? [3, 4] : [3, 4, 5]);

  const updateCurrentChar = (updates) => {
    const nextChars = [...characters];
    nextChars[activeSlot] = { ...nextChars[activeSlot], ...updates };
    updateRemote({ characters: nextChars });
  };

  const handleXPChange = (delta) => {
    const newXP = Math.max(0, Math.min(28, currentChar.xp + delta));
    const newLevel = XP_THRESHOLDS.filter(t => newXP >= t).length;
    const config = CLASS_CONFIGS[currentChar.selectedClass];
    const updates = { xp: newXP, level: newLevel, maxHealth: config.stats.hp[newLevel-1], maxEnergy: config.stats.energy[newLevel-1] };
    if (newLevel !== currentChar.level) { updates.health = updates.maxHealth; updates.energy = updates.maxEnergy; }
    updateCurrentChar(updates);
  };

  const handleClassChange = (newClass) => {
    const config = CLASS_CONFIGS[newClass];
    updateCurrentChar({
      selectedClass: newClass,
      maxHealth: config.stats.hp[currentChar.level-1], health: config.stats.hp[currentChar.level-1],
      maxEnergy: config.stats.energy[currentChar.level-1], energy: config.stats.energy[currentChar.level-1],
      equipment: config.slots.map(label => ({ label, name: "", effect: "" }))
    });
  };

  const StatBar = ({ current, max, colorClass, label }) => (
    <div className="w-full h-3.5 bg-black/60 rounded-full overflow-hidden border border-white/5 relative shadow-inner">
      <div className={`h-full ${colorClass} transition-all duration-500`} style={{ width: `${(current / max) * 100}%` }} />
      <div className="absolute inset-0 flex items-center justify-center text-[8px] font-black text-white uppercase tracking-tighter drop-shadow-md">
        {label || `${current} / ${max}`}
      </div>
    </div>
  );

  // Lobby View
  if (!gameId) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center p-6 text-slate-200 font-sans bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-[#161b22] via-[#05070a] to-black">
        <div className="bg-slate-900/80 backdrop-blur-md p-8 rounded-3xl border border-amber-900/30 w-full max-w-md shadow-2xl flex flex-col items-center">
          <div className="w-20 h-20 bg-amber-700/20 rounded-full flex items-center justify-center mb-6 border border-amber-500/30 shadow-[0_0_20px_rgba(180,83,9,0.2)]">
            <Sword size={40} className="text-amber-500" />
          </div>
          <h1 className="text-2xl font-black mb-1 text-amber-50 uppercase tracking-[0.2em]">WoW Boardgame</h1>
          <p className="text-slate-500 text-[10px] font-bold uppercase tracking-widest mb-8">Cloud Assistant</p>
          
          <button onClick={createGame} className="w-full py-4 bg-amber-700 hover:bg-amber-600 text-white rounded-xl font-black uppercase transition-all shadow-lg active:scale-95">Neues Spiel</button>
          
          <div className="w-full flex items-center py-6">
            <div className="flex-grow border-t border-slate-800"></div>
            <span className="px-4 text-[9px] font-black text-slate-600 uppercase tracking-widest">oder beitreten</span>
            <div className="flex-grow border-t border-slate-800"></div>
          </div>

          <input 
            type="text" 
            placeholder="CODE EINGEBEN" 
            value={inputGameId}
            onChange={(e) => setInputGameId(e.target.value.toUpperCase())}
            className="w-full bg-black/40 border border-slate-800 rounded-xl p-4 mb-4 text-center font-black text-xl text-amber-500 outline-none focus:border-amber-500/50 transition-colors"
          />
          <button 
            onClick={() => inputGameId && setGameId(inputGameId)} 
            disabled={!inputGameId}
            className="w-full py-4 bg-blue-900/40 text-blue-400 border border-blue-500/20 rounded-xl font-black uppercase hover:bg-blue-800/40 disabled:opacity-30 transition-all"
          >
            Spiel Beitreten
          </button>
        </div>
      </div>
    );
  }

  if (loading || !currentChar) return <div className="min-h-screen bg-black flex items-center justify-center text-amber-500 font-black italic tracking-widest animate-pulse">LADE AZEROTH...</div>;

  return (
    <div className="min-h-screen bg-[#05070a] text-slate-200 p-3 md:p-6 font-sans select-none bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-[#161b22] via-[#05070a] to-black">
      
      {/* RAID DASHBOARD OVERLAY */}
      {showDashboard && (
        <div className="fixed inset-0 bg-black/95 backdrop-blur-xl z-[100] p-4 md:p-8 flex flex-col items-center overflow-y-auto">
          <div className="w-full max-w-5xl">
            <div className="flex justify-between items-center mb-10 border-b border-slate-800 pb-4">
              <h2 className="text-2xl font-black text-amber-500 uppercase tracking-[0.3em] flex items-center gap-3"><LayoutGrid size={24}/> Raid Übersicht</h2>
              <button onClick={() => setShowDashboard(false)} className="p-2 hover:bg-white/10 rounded-full transition-colors"><X size={32} className="text-slate-400" /></button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pb-10">
              {["Alliance", "Horde"].map((f, fIdx) => {
                const team = characters.slice(fIdx * 3, fIdx * 3 + matchType);
                const isTeamActive = activeFaction === f;
                return (
                  <div key={f} className="space-y-4">
                    <h3 className={`${f === 'Alliance' ? 'text-blue-400' : 'text-red-500'} font-black uppercase text-xs tracking-widest flex justify-between items-center px-2`}>
                      {f} {isTeamActive && <span className="animate-pulse bg-current text-white px-2 py-0.5 rounded text-[8px]">Am Zug</span>}
                    </h3>
                    {team.map((c, i) => {
                      const idx = fIdx * 3 + i;
                      return (
                        <button key={idx} onClick={() => { setActiveSlot(idx); setShowDashboard(false); }} className={`w-full text-left bg-slate-900/60 p-3 rounded-2xl border ${activeSlot === idx ? (f === 'Alliance' ? 'border-blue-500 shadow-blue-900/20' : 'border-red-500 shadow-red-900/20') : 'border-slate-800'} flex items-center gap-4 transition-all hover:bg-slate-800/60`}>
                          <img src={CLASS_ICONS[c.selectedClass]} className="w-12 h-12 object-contain" alt=""/>
                          <div className="flex-1 space-y-1.5">
                            <div className="flex justify-between items-end"><span className="text-sm font-black uppercase text-amber-50">{c.selectedClass}</span><span className="text-[10px] font-bold text-slate-500 uppercase">Stufe {c.level}</span></div>
                            <StatBar current={c.health} max={c.maxHealth} colorClass="bg-red-600" />
                            <StatBar current={c.energy} max={c.maxEnergy} colorClass="bg-blue-600" />
                          </div>
                          <div className="text-center min-w-[40px] border-l border-slate-800 pl-3">
                            <Coins size={14} className="text-yellow-500 mx-auto mb-1"/>
                            <span className="text-sm font-black">{c.gold}</span>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* TOP META BAR */}
      <div className="max-w-7xl mx-auto mb-4 flex flex-col gap-3">
        <div className="bg-slate-900/90 backdrop-blur-md p-4 rounded-2xl border border-amber-900/30 flex flex-wrap justify-between items-center shadow-2xl relative overflow-hidden">
          <div className={`absolute top-0 left-0 w-full h-1 bg-gradient-to-r ${isAllianceActive ? 'from-blue-600/50' : 'from-red-600/50'} to-transparent`}></div>
          <div className="flex items-center gap-4 flex-wrap">
            <div className="flex bg-black/60 rounded-lg p-1 border border-slate-800">
              {[2, 3].map(num => (
                <button key={num} onClick={() => updateRemote({ matchType: num })} className={`px-3 py-1.5 rounded text-[9px] font-black uppercase ${matchType === num ? 'bg-amber-700 text-white' : 'text-slate-500 hover:text-slate-300'}`}>{num}vs{num}</button>
              ))}
            </div>
            <div className="flex items-center gap-4 border-l border-slate-800 pl-4">
               <div className="text-center">
                 <span className="text-[8px] font-black uppercase text-amber-600 block mb-0.5">Runde</span>
                 <div className="flex items-center gap-3">
                   <button onClick={() => updateRemote({ gameTurn: Math.max(1, gameTurn - 1) })} className="text-slate-500">-</button>
                   <span className="text-lg font-black text-white">{gameTurn}</span>
                   <button onClick={() => updateRemote({ gameTurn: Math.min(30, gameTurn + 1) })} className="text-slate-500">+</button>
                 </div>
               </div>
               <button onClick={() => updateRemote({ gameTurn: gameTurn + 1, characters: characters.map(c => ({...c, actions: 2})) })} className="px-3 py-1.5 bg-amber-700/20 text-amber-500 rounded border border-amber-500/20 text-[9px] font-black uppercase flex items-center gap-2 hover:bg-amber-700/40">Turn <RotateCcw size={12}/></button>
            </div>
            
            {/* Action Monitor */}
            <div className="hidden lg:flex gap-3 items-center border-l border-slate-800 pl-4">
              {activeTeamIndices.map(idx => (
                <div key={idx} className={`flex flex-col items-center p-1 rounded ${activeSlot === idx ? 'bg-white/5' : ''}`}>
                  <span className={`text-[7px] font-black uppercase mb-1 tracking-widest ${isAllianceActive ? 'text-blue-400' : 'text-red-400'}`}>{characters[idx].selectedClass}</span>
                  <div className="flex gap-1">
                    {[1, 2].map(a => (
                      <div key={a} className={`w-2 h-2 rounded-full border border-black/50 ${a <= characters[idx].actions ? (isAllianceActive ? 'bg-blue-500 shadow-[0_0_5px_rgba(59,130,246,0.5)]' : 'bg-red-500 shadow-[0_0_5px_rgba(239,68,68,0.5)]') : 'bg-slate-950'}`}/>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
          
          <div className="flex items-center gap-3">
            <button onClick={() => setShowDashboard(true)} className="flex items-center gap-2 px-4 py-2 bg-slate-800 text-slate-300 rounded-xl border border-slate-700 text-[10px] font-black uppercase hover:bg-slate-700"><LayoutGrid size={14}/> Dashboard</button>
            <div className={`flex items-center gap-2 px-3 py-1.5 rounded-xl border-2 ${isAllianceActive ? 'bg-blue-900/40 border-blue-500/50 shadow-[0_0_15px_rgba(37,99,235,0.1)]' : 'bg-red-900/40 border-red-500/50 shadow-[0_0_15px_rgba(220,38,38,0.1)]'}`}>
              <Flag size={14} fill="currentColor" className={isAllianceActive ? 'text-blue-400' : 'text-red-500'}/><span className={`text-[10px] font-black uppercase tracking-widest ${isAllianceActive ? 'text-blue-400' : 'text-red-500'}`}>{isAllianceActive ? 'Allianz' : 'Horde'}</span>
            </div>
          </div>
        </div>

        {/* TEAM SELECTOR */}
        <div className="grid grid-cols-2 gap-4">
          <div className={`p-1.5 rounded-2xl border bg-blue-900/10 flex gap-2 ${isAllianceActive ? 'border-blue-500/50 shadow-lg' : 'border-blue-900/20'}`}>
             {characters.slice(0, matchType).map((char, i) => (
               <button key={i} onClick={() => setActiveSlot(i)} className={`flex-1 py-2 rounded-xl text-[9px] font-black uppercase border transition-all ${activeSlot === i ? 'bg-blue-600 border-blue-400 text-white shadow-md' : 'bg-slate-900 border-slate-800 text-slate-500'}`}>{char.selectedClass}</button>
             ))}
          </div>
          <div className={`p-1.5 rounded-2xl border bg-red-900/10 flex gap-2 ${!isAllianceActive ? 'border-red-500/50 shadow-lg' : 'border-red-900/20'}`}>
             {characters.slice(3, 3 + matchType).map((char, i) => (
               <button key={i + 3} onClick={() => setActiveSlot(i + 3)} className={`flex-1 py-2 rounded-xl text-[9px] font-black uppercase border transition-all ${activeSlot === i + 3 ? 'bg-red-600 border-red-400 text-white shadow-md' : 'bg-slate-900 border-slate-800 text-slate-500'}`}>{char.selectedClass}</button>
             ))}
          </div>
        </div>
      </div>

      {/* MAIN HERO CARD */}
      <div className="max-w-7xl mx-auto">
        <div className={`bg-slate-900/90 p-6 rounded-t-3xl border-t border-x ${currentChar.faction === "Alliance" ? 'border-blue-900/50 shadow-[inset_0_4px_30px_rgba(37,99,235,0.05)]' : 'border-red-900/50 shadow-[inset_0_4px_30px_rgba(220,38,38,0.05)]'} relative overflow-hidden`}>
          <div className="flex flex-col md:flex-row justify-between items-center gap-6">
            <div className="flex items-center gap-6">
              <div className="relative">
                <div className={`w-24 h-24 rounded-full border-4 flex items-center justify-center bg-black/60 overflow-hidden shadow-2xl ${currentChar.faction === "Alliance" ? 'border-blue-500' : 'border-red-500'}`}>
                  <img src={CLASS_ICONS[currentChar.selectedClass]} alt="" className="w-full h-full object-contain p-1.5" />
                </div>
                <div className="absolute -bottom-1 -right-1 bg-purple-600 px-2.5 py-1 rounded-lg text-[11px] font-black border border-purple-400 shadow-xl">LVL {currentChar.level}</div>
              </div>
              <div className="flex flex-col gap-2">
                <div className="flex items-center gap-4 font-black text-4xl uppercase text-amber-50 tracking-tighter">
                  {currentChar.selectedClass}
                  <div className="flex gap-2">
                    {[1, 2].map(i => (
                      <button key={i} onClick={() => updateCurrentChar({ actions: currentChar.actions === i ? i - 1 : i })} className={`w-7 h-7 rounded-full border-2 transition-all ${i <= currentChar.actions ? (currentChar.faction === "Alliance" ? 'bg-blue-500 border-blue-300 shadow-[0_0_10px_rgba(59,130,246,0.4)]' : 'bg-red-500 border-red-300 shadow-[0_0_10px_rgba(239,68,68,0.4)]') : 'bg-slate-800 border-slate-700 opacity-20'}`}/>
                    ))}
                  </div>
                </div>
                <select value={currentChar.selectedClass} onChange={(e) => handleClassChange(e.target.value)} className="bg-slate-800 border border-amber-900/20 text-[11px] font-black py-2 px-4 rounded-xl text-amber-400 outline-none shadow-lg">
                  {Object.keys(CLASS_CONFIGS).map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
            </div>
            <div className="flex gap-4">
              <div className="bg-black/60 p-4 rounded-2xl border border-amber-900/20 flex flex-col items-center w-24 shadow-inner">
                 <Coins size={20} className="text-yellow-500 mb-1.5"/>
                 <div className="flex items-center gap-4 font-black text-2xl text-amber-50">
                   <button onClick={() => updateCurrentChar({gold: Math.max(0, currentChar.gold-1)})} className="text-slate-700 hover:text-white transition-colors">-</button>
                   {currentChar.gold}
                   <button onClick={() => updateCurrentChar({gold: currentChar.gold+1})} className="text-slate-700 hover:text-white transition-colors">+</button>
                 </div>
              </div>
              <button onClick={() => updateCurrentChar({health: CLASS_CONFIGS[currentChar.selectedClass].stats.hp[currentChar.level-1], energy: CLASS_CONFIGS[currentChar.selectedClass].stats.energy[currentChar.level-1]})} className="p-4 bg-amber-900/20 text-amber-500 rounded-2xl border border-amber-500/20 hover:bg-amber-900/40 transition-all"><RotateCcw size={24}/></button>
            </div>
          </div>
        </div>

        {/* XP PROGRESS BAR */}
        <div className={`mb-6 bg-slate-900/95 border-x border-b ${currentChar.faction === "Alliance" ? 'border-blue-900/50' : 'border-red-900/50'} rounded-b-3xl p-1.5 shadow-2xl relative`}>
            <div className="flex justify-between items-center px-6 py-2.5 text-[11px] font-black text-purple-400 uppercase tracking-widest">
                <div className="flex items-center gap-4">
                    <button onClick={() => handleXPChange(-1)} className="bg-black/60 rounded px-3 py-1 text-slate-500 hover:text-white">-</button>
                    <span className="text-slate-200">{currentChar.xp} XP / 28</span>
                    <button onClick={() => handleXPChange(1)} className="bg-black/60 rounded px-3 py-1 text-slate-500 hover:text-white">+</button>
                </div>
                <span>UP: {XP_THRESHOLDS[currentChar.level] || 28} XP</span>
            </div>
            <div className="h-4 bg-black/60 rounded-full mx-3 mb-2 border border-slate-800 overflow-hidden relative">
                {[4, 10, 18].map(t => (
                  <div key={t} className="absolute top-0 bottom-0 w-px bg-white/20 z-10" style={{ left: `${(t / 28) * 100}%` }} />
                ))}
                <div className="h-full bg-gradient-to-r from-purple-900 via-purple-500 to-purple-400 transition-all duration-1000 ease-out" style={{ width: `${(currentChar.xp / 28) * 100}%` }}/>
            </div>
        </div>

        {/* DETAILS GRID */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 pb-32">
          {/* STATS */}
          <div className="lg:col-span-3 space-y-4">
             <div className="bg-slate-900/60 p-5 rounded-3xl border border-red-900/30 shadow-xl backdrop-blur-sm">
                <h3 className="text-red-500 font-black uppercase text-[10px] tracking-[0.2em] mb-5 flex items-center justify-between border-b border-red-900/20 pb-2">
                  <div className="flex items-center gap-2"><Heart size={16} fill="#ef4444" className="opacity-70"/>Lebensenergie</div>
                  <span className="bg-black/60 px-2.5 py-0.5 rounded-lg text-white font-black">{currentChar.health} / {currentChar.maxHealth}</span>
                </h3>
                <div className="grid grid-cols-5 gap-2.5">
                  {[...Array(currentChar.maxHealth)].map((_, i) => (
                    <button key={i} onClick={() => updateCurrentChar({ health: i + 1 })} className={`h-9 rounded-xl transition-all ${i < currentChar.health ? 'bg-gradient-to-br from-red-600 to-red-800 border border-red-400/30 shadow-lg' : 'bg-slate-800 opacity-20 hover:opacity-40'}`}/>
                  ))}
                </div>
             </div>
             <div className="bg-slate-900/60 p-5 rounded-3xl border border-blue-900/30 shadow-xl backdrop-blur-sm">
                <h3 className="text-blue-500 font-black uppercase text-[10px] tracking-[0.2em] mb-5 flex items-center justify-between border-b border-blue-900/20 pb-2">
                  <div className="flex items-center gap-2"><Zap size={16} fill="#3b82f6" className="opacity-70"/>Energiepunkte</div>
                  <span className="bg-black/60 px-2.5 py-0.5 rounded-lg text-white font-black">{currentChar.energy} / {currentChar.maxEnergy}</span>
                </h3>
                <div className="grid grid-cols-5 gap-2.5">
                  {[...Array(currentChar.maxEnergy)].map((_, i) => (
                    <button key={i} onClick={() => updateCurrentChar({ energy: i + 1 })} className={`h-9 rounded-xl transition-all ${i < currentChar.energy ? 'bg-gradient-to-br from-blue-600 to-blue-800 border border-blue-400/30 shadow-lg' : 'bg-slate-800 opacity-20 hover:opacity-40'}`}/>
                  ))}
                </div>
             </div>
             <div className="bg-slate-900/60 p-5 rounded-3xl border border-slate-800 space-y-3 shadow-xl backdrop-blur-sm">
                {['red', 'green', 'blue'].map(c => (
                  <div key={c} className="flex justify-between items-center p-3 rounded-2xl bg-black/40 border border-slate-800">
                    <span className={`text-[10px] font-black uppercase ${c === 'red' ? 'text-red-400' : c === 'green' ? 'text-green-400' : 'text-blue-400'}`}>{c === 'red' ? 'Kraft' : c === 'green' ? 'Gewandtheit' : 'Intelligenz'}</span>
                    <div className="flex items-center gap-4">
                      <button onClick={() => updateCurrentChar({dice: {...currentChar.dice, [c]: Math.max(0, currentChar.dice[c]-1)}})} className="w-8 h-8 bg-slate-800 rounded-lg font-black text-slate-400 hover:text-white">-</button>
                      <span className="text-xl font-black text-white w-5 text-center">{currentChar.dice[c]}</span>
                      <button onClick={() => updateCurrentChar({dice: {...currentChar.dice, [c]: currentChar.dice[c]+1}})} className="w-8 h-8 bg-slate-800 rounded-lg font-black text-slate-400 hover:text-white">+</button>
                    </div>
                  </div>
                ))}
             </div>
          </div>

          {/* EQUIPMENT & TALENTS */}
          <div className="lg:col-span-9 space-y-6">
            <div className="bg-slate-900/80 p-6 rounded-3xl border border-amber-900/20 shadow-2xl backdrop-blur-sm">
              <h3 className="text-amber-600/70 font-black uppercase text-[11px] mb-6 underline decoration-amber-600 decoration-2 underline-offset-8 tracking-widest flex items-center gap-2"><Shield size={16}/>Ausrüstung</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {currentChar.equipment.map((item, idx) => (
                  <div key={idx} className="bg-black/40 rounded-2xl border border-amber-900/10 overflow-hidden shadow-inner group hover:border-amber-600/30 transition-all">
                    <div className="px-4 py-2 bg-amber-900/10 text-[9px] font-black uppercase text-amber-500/60 tracking-widest">{item.label}</div>
                    <div className="p-1">
                      <input type="text" placeholder="Gegenstand..." value={item.name} onChange={(e) => {const ne = [...currentChar.equipment]; ne[idx].name = e.target.value; updateCurrentChar({equipment: ne});}} className="bg-transparent w-full px-4 py-2 text-sm font-bold outline-none text-amber-50"/>
                      <textarea placeholder="Effektbeschreibung..." value={item.effect} onChange={(e) => {const ne = [...currentChar.equipment]; ne[idx].effect = e.target.value; updateCurrentChar({equipment: ne});}} className="bg-black/20 w-full p-4 text-[11px] text-slate-400 outline-none min-h-[60px] resize-none border-t border-slate-800/40"/>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-slate-900/80 p-6 rounded-3xl border border-purple-900/20 shadow-2xl backdrop-blur-sm">
              <h3 className="text-purple-400/70 font-black uppercase text-[11px] mb-6 underline decoration-purple-600 decoration-2 underline-offset-8 tracking-widest flex items-center gap-2"><Sparkles size={16}/>Talente & Fähigkeiten</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {currentChar.talents.map((t, idx) => (
                  <div key={idx} className="bg-purple-900/5 rounded-2xl border border-purple-900/10 overflow-hidden hover:border-purple-500/30 transition-all">
                    <div className="px-4 py-2 bg-purple-900/10 text-[9px] uppercase font-black text-purple-300/70">Talent {idx + 1} (Max Stufe {t.maxLvl})</div>
                    <div className="p-1">
                      <input type="text" placeholder="Name..." value={t.name} onChange={(e) => {const nt = [...currentChar.talents]; nt[idx].name = e.target.value; updateCurrentChar({talents: nt});}} className="bg-transparent w-full px-4 py-2 font-black outline-none text-purple-100 text-sm"/>
                      <textarea placeholder="Wirkungsweise..." value={t.effect} onChange={(e) => {const nt = [...currentChar.talents]; nt[idx].effect = e.target.value; updateCurrentChar({talents: nt});}} className="bg-black/40 w-full p-4 text-[11px] text-slate-400 outline-none border-t border-purple-900/10 min-h-[100px] resize-none"/>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* FLOATING ACTION BAR */}
        <div className="fixed bottom-6 left-6 right-6 max-w-7xl mx-auto flex justify-between items-center bg-slate-900/95 backdrop-blur-xl p-4 rounded-3xl border border-amber-900/30 shadow-[0_20px_50px_rgba(0,0,0,0.5)] z-50">
           <div className="flex gap-4">
              <div className="flex items-center gap-2 px-6 py-3 bg-black/60 rounded-2xl border border-slate-800">
                <span className="text-[10px] font-black text-slate-500 uppercase">Spiel-ID:</span>
                <span className="text-amber-500 font-black text-lg tracking-widest font-mono">{gameId}</span>
                <button 
                  onClick={() => {navigator.clipboard.writeText(gameId); setCopied(true); setTimeout(() => setCopied(false), 2000);}} 
                  className={`ml-2 p-2 rounded-lg transition-all ${copied ? 'bg-emerald-500/20 text-emerald-500' : 'bg-slate-800 text-slate-400 hover:text-white'}`}
                >
                  {copied ? <Check size={16}/> : <Copy size={16}/>}
                </button>
              </div>
              <button 
                onClick={() => {if(window.confirm("Spiel wirklich verlassen?")) { setGameId(null); localStorage.removeItem('wow_last_game'); }}}
                className="flex items-center gap-2 px-6 py-3 bg-red-900/20 text-red-500 rounded-2xl border border-red-500/20 text-[10px] font-black uppercase hover:bg-red-900/40"
              >
                <LogOut size={16}/> Beenden
              </button>
           </div>
           <div className="hidden sm:block text-[9px] font-black text-slate-700 uppercase tracking-[0.5em]">Battle Assistant v15.0 Cloud</div>
        </div>
      </div>
    </div>
  );
};

export default App;