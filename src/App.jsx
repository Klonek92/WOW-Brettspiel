import React, { useState, useEffect } from 'react';
import { 
  Heart, Zap, Shield, Plus, Minus, Backpack, Award, Coins, Sparkles, 
  ChevronDown, Download, Upload, Sword, Flag, RotateCcw, LayoutGrid, X 
} from 'lucide-react';

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
  const [matchType, setMatchType] = useState(2); 
  const [activeSlot, setActiveSlot] = useState(0);
  const [gameTurn, setGameTurn] = useState(1);
  const [showDashboard, setShowDashboard] = useState(false);
  const [characters, setCharacters] = useState([
    createEmptyChar("Krieger", "Alliance"), createEmptyChar("Paladin", "Alliance"), createEmptyChar("Priester", "Alliance"),
    createEmptyChar("Schamane", "Horde"), createEmptyChar("Hexenmeister", "Horde"), createEmptyChar("Jäger", "Horde")
  ]);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem('wow_v15_final');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        // Validierung: Sicherstellen, dass characters ein Array mit 6 Elementen ist
        if (Array.isArray(parsed.characters) && parsed.characters.length === 6) {
          setCharacters(parsed.characters);
        }
        setMatchType(parsed.matchType || 2);
        setActiveSlot(parsed.activeSlot < 6 ? parsed.activeSlot : 0);
        setGameTurn(parsed.gameTurn || 1);
      } catch (e) { console.error("Ladefehler:", e); }
    }
    setIsLoaded(true);
  }, []);

  useEffect(() => {
    if (isLoaded) {
      localStorage.setItem('wow_v15_final', JSON.stringify({ characters, matchType, activeSlot, gameTurn }));
    }
  }, [characters, matchType, activeSlot, gameTurn, isLoaded]);

  const activeFaction = gameTurn % 2 !== 0 ? "Alliance" : "Horde";
  const isAllianceActive = activeFaction === "Alliance";
  
  // Sicherer Zugriff auf den aktuellen Charakter
  const currentChar = characters[activeSlot] || characters[0];

  const updateCurrentChar = (updates) => {
    setCharacters(prev => {
      const next = [...prev];
      next[activeSlot] = { ...next[activeSlot], ...updates };
      return next;
    });
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

  const StatBar = ({ current, max, colorClass }) => (
    <div className="w-full h-3 bg-black/50 rounded-full overflow-hidden border border-white/5 relative">
      <div className={`h-full ${colorClass} transition-all duration-500`} style={{ width: `${(current / max) * 100}%` }} />
      <div className="absolute inset-0 flex items-center justify-center text-[7px] font-black text-white uppercase tracking-tighter">{current} / {max}</div>
    </div>
  );

  if (!isLoaded) return null;

  return (
    <div className="min-h-screen bg-[#05070a] text-slate-200 p-3 md:p-6 font-sans select-none bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-[#161b22] via-[#05070a] to-black">
      
      {/* RAID DASHBOARD MODAL */}
      {showDashboard && (
        <div className="fixed inset-0 bg-black/95 backdrop-blur-xl z-[100] p-4 md:p-8 flex flex-col items-center overflow-y-auto">
          <div className="w-full max-w-5xl">
            <div className="flex justify-between items-center mb-10">
              <h2 className="text-2xl font-black text-amber-500 uppercase tracking-[0.3em] flex items-center gap-3"><LayoutGrid size={24}/> Raid Übersicht</h2>
              <button onClick={() => setShowDashboard(false)} className="p-2 hover:bg-white/10 rounded-full transition-colors"><X size={32} className="text-slate-400" /></button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="space-y-4">
                <h3 className="text-blue-400 font-black uppercase text-xs tracking-widest border-b border-blue-900/50 pb-2 flex justify-between items-center">
                  Allianz {isAllianceActive && <span className="animate-pulse bg-blue-500 text-white px-2 py-0.5 rounded-[4px] text-[8px]">Am Zug</span>}
                </h3>
                {characters.slice(0, matchType).map((c, i) => (
                  <button key={i} onClick={() => { setActiveSlot(i); setShowDashboard(false); }} className={`w-full text-left bg-slate-900/60 p-3 rounded-xl border ${activeSlot === i ? 'border-blue-500 shadow-[0_0_15px_rgba(59,130,246,0.2)]' : 'border-slate-800'} flex items-center gap-4`}>
                    <img src={CLASS_ICONS[c.selectedClass]} className="w-10 h-10 object-contain" alt=""/>
                    <div className="flex-1 space-y-1">
                      <div className="flex justify-between items-end"><span className="text-sm font-black uppercase">{c.selectedClass}</span><span className="text-[10px] font-bold text-slate-500">Lvl {c.level}</span></div>
                      <StatBar current={c.health} max={c.maxHealth} colorClass="bg-red-600" />
                      <StatBar current={c.energy} max={c.maxEnergy} colorClass="bg-blue-600" />
                    </div>
                  </button>
                ))}
              </div>
              <div className="space-y-4">
                <h3 className="text-red-500 font-black uppercase text-xs tracking-widest border-b border-red-900/50 pb-2 flex justify-between items-center">
                  Horde {!isAllianceActive && <span className="animate-pulse bg-red-600 text-white px-2 py-0.5 rounded-[4px] text-[8px]">Am Zug</span>}
                </h3>
                {characters.slice(3, 3 + matchType).map((c, i) => (
                  <button key={i+3} onClick={() => { setActiveSlot(i+3); setShowDashboard(false); }} className={`w-full text-left bg-slate-900/60 p-3 rounded-xl border ${activeSlot === i+3 ? 'border-red-500 shadow-[0_0_15px_rgba(239,68,68,0.2)]' : 'border-slate-800'} flex items-center gap-4`}>
                    <img src={CLASS_ICONS[c.selectedClass]} className="w-10 h-10 object-contain" alt=""/>
                    <div className="flex-1 space-y-1">
                      <div className="flex justify-between items-end"><span className="text-sm font-black uppercase">{c.selectedClass}</span><span className="text-[10px] font-bold text-slate-500">Lvl {c.level}</span></div>
                      <StatBar current={c.health} max={c.maxHealth} colorClass="bg-red-600" />
                      <StatBar current={c.energy} max={c.maxEnergy} colorClass="bg-blue-600" />
                    </div>
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* HEADER */}
      <div className="max-w-7xl mx-auto mb-4 flex flex-col gap-3">
        <div className="bg-slate-900/90 backdrop-blur-md p-4 rounded-xl border border-amber-900/30 flex flex-wrap justify-between items-center shadow-2xl relative overflow-hidden">
          <div className={`absolute top-0 left-0 w-full h-1 bg-gradient-to-r ${isAllianceActive ? 'from-blue-600/50' : 'from-red-600/50'} to-transparent`}></div>
          <div className="flex items-center gap-4">
            <div className="flex bg-black/60 rounded-lg p-1 border border-slate-800">
              {[2, 3].map(num => (
                <button key={num} onClick={() => { setMatchType(num); if(activeSlot === 2 || activeSlot === 5) setActiveSlot(0); }} className={`px-3 py-1 rounded text-[9px] font-black uppercase ${matchType === num ? 'bg-amber-700 text-white' : 'text-slate-500'}`}>{num}vs{num}</button>
              ))}
            </div>
            <div className="text-center px-4 border-l border-slate-800 text-lg font-black text-white">{gameTurn}</div>
            <button onClick={() => setShowDashboard(true)} className="flex items-center gap-2 px-4 py-2 bg-blue-900/30 text-blue-400 rounded-lg border border-blue-500/20 text-[10px] font-black uppercase"><LayoutGrid size={14}/> Übersicht</button>
            <button onClick={() => { setGameTurn(prev => prev + 1); setCharacters(chars => chars.map(c => ({...c, actions: 2}))); }} className="px-3 py-1.5 bg-amber-700/20 text-amber-500 rounded border border-amber-500/20 text-[9px] font-black uppercase flex items-center gap-2">Turn <RotateCcw size={12}/></button>
          </div>
          <div className={`flex items-center gap-2 px-3 py-1.5 rounded border ${isAllianceActive ? 'bg-blue-900/40 border-blue-500/50' : 'bg-red-900/40 border-red-500/50'}`}>
            <Flag size={14} fill="currentColor" className={isAllianceActive ? 'text-blue-400' : 'text-red-500'}/><span className={`text-[10px] font-black uppercase tracking-widest ${isAllianceActive ? 'text-blue-400' : 'text-red-500'}`}>{isAllianceActive ? 'Allianz' : 'Horde'}</span>
          </div>
        </div>

        {/* TEAM SELECTION - REPARIERT */}
        <div className="grid grid-cols-2 gap-4">
          <div className={`p-1.5 rounded-xl border bg-blue-900/10 flex gap-2 ${isAllianceActive ? 'border-blue-500/50 shadow-lg' : 'border-blue-900/20'}`}>
             {characters.slice(0, matchType).map((char, i) => (
               <button key={i} onClick={() => setActiveSlot(i)} className={`flex-1 py-1.5 rounded text-[9px] font-black uppercase border transition-all ${activeSlot === i ? 'bg-blue-600 border-blue-400 text-white shadow-md font-black' : 'bg-slate-900 border-slate-800 text-slate-500'}`}>
                 {char.selectedClass}
               </button>
             ))}
          </div>
          <div className={`p-1.5 rounded-xl border bg-red-900/10 flex gap-2 ${!isAllianceActive ? 'border-red-500/50 shadow-lg' : 'border-red-900/20'}`}>
             {characters.slice(3, 3 + matchType).map((char, i) => (
               <button key={i + 3} onClick={() => setActiveSlot(i + 3)} className={`flex-1 py-1.5 rounded text-[9px] font-black uppercase border transition-all ${activeSlot === i + 3 ? 'bg-red-600 border-red-400 text-white shadow-md font-black' : 'bg-slate-900 border-slate-800 text-slate-500'}`}>
                 {char.selectedClass}
               </button>
             ))}
          </div>
        </div>
      </div>

      {/* MAIN SHEET */}
      <div className="max-w-7xl mx-auto">
        <div className={`bg-slate-900/90 p-5 rounded-t-2xl border-t border-x ${currentChar.faction === "Alliance" ? 'border-blue-900/50' : 'border-red-900/50'} relative overflow-hidden backdrop-blur-sm`}>
          <div className="flex flex-col md:flex-row justify-between items-center gap-6">
            <div className="flex items-center gap-6">
              <div className="relative">
                <div className={`w-20 h-20 rounded-full border-4 flex items-center justify-center bg-black/40 overflow-hidden ${currentChar.faction === "Alliance" ? 'border-blue-500' : 'border-red-500'}`}>
                  <img src={CLASS_ICONS[currentChar.selectedClass]} alt="" className="w-full h-full object-contain p-1" />
                </div>
                <div className="absolute -bottom-1 -right-1 bg-purple-600 px-2 py-0.5 rounded text-[10px] font-black border border-purple-400">Lvl {currentChar.level}</div>
              </div>
              <div className="flex flex-col gap-1">
                <div className="flex items-center gap-4 font-black text-3xl uppercase text-amber-50 tracking-tighter">
                  {currentChar.selectedClass}
                  <div className="flex gap-1.5">
                    {[1, 2].map(i => (
                      <button key={i} onClick={() => updateCurrentChar({ actions: currentChar.actions === i ? i - 1 : i })} className={`w-6 h-6 rounded-full border-2 transition-all ${i <= currentChar.actions ? (currentChar.faction === "Alliance" ? 'bg-blue-500 border-blue-300' : 'bg-red-500 border-red-300') : 'bg-slate-800 border-slate-700 opacity-20'}`}/>
                    ))}
                  </div>
                </div>
                <select value={currentChar.selectedClass} onChange={(e) => handleClassChange(e.target.value)} className="bg-slate-800 border border-amber-900/20 text-[10px] font-black py-2 px-3 rounded text-amber-400 outline-none">
                  {Object.keys(CLASS_CONFIGS).map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
            </div>
            <div className="bg-black/60 p-3 rounded-2xl border border-amber-900/20 flex flex-col items-center w-24 shadow-inner">
               <Coins size={18} className="text-yellow-500 mb-1"/>
               <div className="flex items-center gap-4 font-black text-xl text-amber-50">
                 <button onClick={() => updateCurrentChar({gold: Math.max(0, currentChar.gold-1)})} className="text-slate-700">-</button>{currentChar.gold}<button onClick={() => updateCurrentChar({gold: currentChar.gold+1})} className="text-slate-700">+</button>
               </div>
            </div>
          </div>
        </div>

        {/* XP BAR MIT LEVEL-STRICHEN */}
        <div className={`mb-6 bg-slate-900/95 border-x border-b ${currentChar.faction === "Alliance" ? 'border-blue-900/50' : 'border-red-900/50'} rounded-b-2xl p-1 shadow-2xl`}>
            <div className="flex justify-between items-center px-6 py-2 text-[10px] font-black text-purple-400 uppercase tracking-widest">
                <div className="flex items-center gap-4">
                    <button onClick={() => handleXPChange(-1)} className="bg-black/60 rounded px-3 py-1 text-slate-500 hover:text-white">-</button>
                    <span className="text-slate-200">{currentChar.xp} XP</span>
                    <button onClick={() => handleXPChange(1)} className="bg-black/60 rounded px-3 py-1 text-slate-500 hover:text-white">+</button>
                </div>
                <span>UP BEI: {XP_THRESHOLDS[currentChar.level] || 28} XP</span>
            </div>
            <div className="h-4 bg-black/60 rounded-full mx-3 mb-2 border border-slate-800 overflow-hidden relative">
                {[4, 10, 18].map(t => (
                  <div key={t} className="absolute top-0 bottom-0 w-px bg-white/20 z-10" style={{ left: `${(t / 28) * 100}%` }} />
                ))}
                <div className="h-full bg-gradient-to-r from-purple-900 via-purple-500 to-purple-400 transition-all duration-700" style={{ width: `${(currentChar.xp / 28) * 100}%` }}/>
            </div>
        </div>

        {/* STATS GRID */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 pb-24">
          <div className="lg:col-span-3 space-y-4">
             <div className="bg-slate-900/60 p-5 rounded-2xl border border-red-900/30 shadow-xl backdrop-blur-sm">
                <h3 className="text-red-500 font-black uppercase text-[10px] tracking-widest mb-4 flex items-center justify-between">
                  <div className="flex items-center gap-2"><Heart size={16} fill="#ef4444" className="opacity-70"/>HP</div>
                  <span className="bg-black/40 px-2 rounded text-white">{currentChar.health} / {currentChar.maxHealth}</span>
                </h3>
                <div className="grid grid-cols-5 gap-2">
                  {[...Array(currentChar.maxHealth)].map((_, i) => (
                    <button key={i} onClick={() => updateCurrentChar({ health: i + 1 })} className={`h-8 rounded-lg transition-all ${i < currentChar.health ? 'bg-gradient-to-br from-red-600 to-red-800 border border-red-400/30' : 'bg-slate-800 opacity-20'}`}/>
                  ))}
                </div>
             </div>
             <div className="bg-slate-900/60 p-5 rounded-2xl border border-blue-900/30 shadow-xl backdrop-blur-sm">
                <h3 className="text-blue-500 font-black uppercase text-[10px] tracking-widest mb-4 flex items-center justify-between">
                  <div className="flex items-center gap-2"><Zap size={16} fill="#3b82f6" className="opacity-70"/>EP</div>
                  <span className="bg-black/40 px-2 rounded text-white">{currentChar.energy} / {currentChar.maxEnergy}</span>
                </h3>
                <div className="grid grid-cols-5 gap-2">
                  {[...Array(currentChar.maxEnergy)].map((_, i) => (
                    <button key={i} onClick={() => updateCurrentChar({ energy: i + 1 })} className={`h-8 rounded-lg transition-all ${i < currentChar.energy ? 'bg-gradient-to-br from-blue-600 to-blue-800 border border-blue-400/30' : 'bg-slate-800 opacity-20'}`}/>
                  ))}
                </div>
             </div>
          </div>
          {/* EQUIPMENT */}
          <div className="lg:col-span-9">
            <div className="bg-slate-900/80 p-6 rounded-2xl border border-amber-900/20 shadow-2xl backdrop-blur-sm">
              <h3 className="text-amber-600/70 font-black uppercase text-[10px] mb-6 underline decoration-amber-600 decoration-2 underline-offset-8 tracking-widest flex items-center gap-2"><Shield size={14}/>Equipment</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {currentChar.equipment.map((item, idx) => (
                  <div key={idx} className="bg-black/40 rounded-xl border border-amber-900/10 overflow-hidden shadow-inner group hover:border-amber-600/30 transition-all">
                    <div className="px-3 py-1.5 bg-amber-900/10 text-[9px] font-black uppercase text-amber-500/60">{item.label}</div>
                    <div className="p-1">
                      <input type="text" placeholder="Name..." value={item.name} onChange={(e) => {const ne = [...currentChar.equipment]; ne[idx].name = e.target.value; updateCurrentChar({equipment: ne});}} className="bg-transparent w-full px-3 py-2 text-sm font-bold outline-none text-amber-50"/>
                      <textarea placeholder="Effekt..." value={item.effect} onChange={(e) => {const ne = [...currentChar.equipment]; ne[idx].effect = e.target.value; updateCurrentChar({equipment: ne});}} className="bg-black/20 w-full p-2.5 text-[10px] text-slate-400 outline-none min-h-[45px] resize-none border-t border-slate-800/40"/>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* FOOTER CONTROLS */}
        <div className="fixed bottom-4 left-4 right-4 max-w-7xl mx-auto flex justify-between items-center bg-slate-900/95 backdrop-blur-lg p-4 rounded-2xl border border-amber-900/30 shadow-2xl z-50">
           <div className="flex gap-4 font-black uppercase tracking-widest text-xs">
              <button onClick={() => { const code = btoa(JSON.stringify({ characters, matchType, activeSlot, gameTurn })); navigator.clipboard.writeText(code); alert("Backup kopiert!"); }} className="flex items-center gap-2 px-6 py-2.5 bg-emerald-900/30 text-emerald-400 rounded-xl border border-emerald-500/20"><Download size={16}/> Export</button>
           </div>
        </div>
      </div>
    </div>
  );
};

export default App;