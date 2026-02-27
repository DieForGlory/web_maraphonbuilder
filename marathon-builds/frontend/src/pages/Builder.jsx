import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useBuildStore } from '../store/useBuildStore';
import { t } from '../utils/translator';

const STAGES = [
  { id: 0, title: 'ОБОЛОЧКА', key: 'shells' },
  { id: 1, title: 'ЯДРО', key: 'cores' },
  { id: 2, title: 'ИМПЛАНТЫ', key: 'implants' },
  { id: 3, title: 'ОРУЖИЕ', key: 'weapons' }
];

const HoverInfo = ({ item, mousePos }) => {
  if (!item) return null;
  const exclude = ['id', 'name', 'category', 'image', 'description', 'slots', 'abilities', 'mod_slots'];
  const stats = Object.entries(item).filter(([k]) => !exclude.includes(k));

  return (
    <div
      className="fixed z-[100] pointer-events-none bg-black/95 border border-m-cyan/50 p-4 w-72 backdrop-blur-sm shadow-[0_0_20px_rgba(0,255,255,0.15)] transition-opacity animate-fade-in"
      style={{ left: mousePos.x + 20, top: mousePos.y + 20 }}
    >
      <h4 className="text-m-cyan font-bold uppercase tracking-wider text-sm border-b border-m-cyan/30 pb-2 mb-2">{item.name}</h4>
      <div className="text-[10px] opacity-70 uppercase mb-3 text-m-pink">{t(item.type || item.weapon_type || item.category)}</div>

      {item.description && <p className="text-[10px] text-gray-400 mb-3 leading-tight line-clamp-3">{item.description}</p>}
      {item.effect && <p className="text-[10px] text-m-acid font-mono mb-3">{t(item.effect)}</p>}

      <div className="space-y-1">
        {stats.slice(0, 6).map(([k, v]) => (
          <div key={k} className="flex justify-between items-end border-b border-white/5 pb-0.5">
            <span className="text-[9px] text-gray-500 uppercase tracking-widest truncate mr-2">{t(k)}</span>
            <span className="text-[10px] text-gray-200 font-mono shrink-0">{t(v)}</span>
          </div>
        ))}
        {stats.length > 6 && <div className="text-[9px] text-m-cyan text-right mt-1 opacity-50">...ДАННЫЕ УСЕЧЕНЫ</div>}
      </div>
    </div>
  );
};

export default function Builder() {
  const [db, setDb] = useState({ shells: [], cores: [], weapons: [], implants: [], mods: [] });
  const [activeStage, setActiveStage] = useState(0);
  const [hoveredItem, setHoveredItem] = useState(null);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const nav = useNavigate();

  const {
    shell, cores, weapons, implants,
    setShell, addCore, removeCore, addWeapon, removeWeapon,
    addImplant, removeImplant, toggleMod
  } = useBuildStore();

  useEffect(() => {
    Promise.all([
      fetch('https://5mpxwrp0-5000.euw.devtunnels.ms/api/data/shells').then(res => res.json()),
      fetch('https://5mpxwrp0-5000.euw.devtunnels.ms/api/data/cores').then(res => res.json()),
      fetch('https://5mpxwrp0-5000.euw.devtunnels.ms/api/data/weapons').then(res => res.json()),
      fetch('https://5mpxwrp0-5000.euw.devtunnels.ms/api/data/implants').then(res => res.json()),
      fetch('https://5mpxwrp0-5000.euw.devtunnels.ms/api/data/mods').then(res => res.json())
    ]).then(([shellsData, coresData, weaponsData, implantsData, modsData]) => {
      setDb({
        shells: Array.isArray(shellsData) ? shellsData : [],
        cores: Array.isArray(coresData) ? coresData : [],
        weapons: Array.isArray(weaponsData) ? weaponsData : [],
        implants: Array.isArray(implantsData) ? implantsData : [],
        mods: Array.isArray(modsData) ? modsData : []
      });
    }).catch(err => console.error("Data Load Error:", err));
  }, []);

  const handleMouseMove = (e) => {
    if (hoveredItem) setMousePos({ x: e.clientX, y: e.clientY });
  };

  const CardWrapper = ({ item, children, onClick, active, className }) => (
    <div
      onClick={onClick}
      onMouseEnter={(e) => { setHoveredItem(item); setMousePos({ x: e.clientX, y: e.clientY }); }}
      onMouseLeave={() => setHoveredItem(null)}
      className={`border p-4 cursor-pointer transition-all relative group overflow-hidden ${active ? 'bg-white/5 border-m-acid/50' : 'border-white/10 hover:border-m-cyan/50 hover:bg-white/5'} ${className}`}
    >
      {active && <div className="absolute top-0 right-0 w-full h-full border border-m-acid shadow-[inset_0_0_20px_rgba(186,250,1,0.1)] pointer-events-none"></div>}
      {children}
    </div>
  );

  const calcTotalHeat = () => {
    if (!shell) return 0;
    let heat = shell.base_heat || 100;
    implants.forEach(imp => { if (imp.effect && imp.effect.includes("Heat Cap")) heat += 15; });
    return heat;
  };

  return (
    <main className="grid grid-cols-1 xl:grid-cols-4 gap-6 animate-fade-in relative" onMouseMove={handleMouseMove}>
      {hoveredItem && <HoverInfo item={hoveredItem} mousePos={mousePos} />}

      <section className="xl:col-span-3 space-y-6 flex flex-col min-h-[70vh]">
        <div className="flex border border-m-cyan/30 bg-m-black/50 overflow-hidden">
          {STAGES.map((stage) => {
            const isActive = activeStage === stage.id;
            const isPassed = activeStage > stage.id;
            return (
              <button
                key={stage.id}
                onClick={() => setActiveStage(stage.id)}
                className={`flex-1 py-3 px-4 text-xs tracking-widest uppercase transition-all flex items-center justify-center gap-2 border-r border-m-cyan/30 last:border-0 ${isActive ? 'bg-m-pink/20 text-m-pink border-b-2 border-b-m-pink shadow-[inset_0_0_15px_rgba(255,0,85,0.2)]' : isPassed ? 'text-m-cyan hover:bg-m-cyan/10' : 'text-gray-600 hover:text-gray-400'}`}
              >
                <span className="font-mono opacity-50">0{stage.id + 1}</span> {stage.title}
              </button>
            );
          })}
        </div>

        <div className="flex-1 border border-m-cyan/30 p-6 bg-[#0C0C0D] relative overflow-hidden">
          <div className="absolute inset-0 pointer-events-none bg-[linear-gradient(rgba(186,250,1,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(186,250,1,0.03)_1px,transparent_1px)] bg-[size:20px_20px]"></div>

          {activeStage === 0 && (
            <div className="animate-fade-in relative z-10">
              <h2 className="text-xl mb-6 text-m-cyan tracking-widest uppercase border-b border-m-cyan/20 pb-2">ВЫБОР ОБОЛОЧКИ</h2>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {db.shells.map(s => (
                  <CardWrapper key={s.id} item={s} active={shell?.id === s.id} onClick={() => { setShell(s); setActiveStage(1); }} className="flex flex-col items-center justify-center min-h-[160px]">
                    {s.image && <img src={s.image} alt={s.name} className={`h-24 object-contain mb-4 transition-transform group-hover:scale-110 ${shell?.id === s.id ? 'drop-shadow-[0_0_8px_rgba(255,0,85,0.5)]' : 'opacity-60 group-hover:opacity-100'}`} />}
                    <h3 className={`text-sm font-bold uppercase tracking-widest z-10 ${shell?.id === s.id ? 'text-m-pink' : 'text-gray-300 group-hover:text-m-cyan'}`}>{s.name}</h3>
                  </CardWrapper>
                ))}
              </div>
            </div>
          )}

          {activeStage === 1 && (
            <div className="animate-fade-in relative z-10">
              <h2 className="text-xl mb-6 text-m-cyan tracking-widest uppercase border-b border-m-cyan/20 pb-2">ИНТЕГРАЦИЯ ЯДРА (МАКС 1)</h2>
              <div className="grid grid-cols-2 gap-4">
                {db.cores.map(c => {
                  const isActive = cores.find(i => i.id === c.id);
                  return (
                    <CardWrapper key={c.id} item={c} active={isActive} onClick={() => cores.find(i => i.id === c.id) ? removeCore(c.id) : (cores.length < 1 && addCore(c))} className="flex items-center gap-4">
                      {c.image && <img src={c.image} alt={c.name} className={`w-16 h-16 object-contain z-10 ${isActive ? '' : 'opacity-60 group-hover:opacity-100'}`} />}
                      <div className="z-10 relative">
                        <h3 className={`text-sm font-bold uppercase tracking-widest ${isActive ? 'text-m-acid' : 'text-gray-300 group-hover:text-white'}`}>{c.name}</h3>
                        <p className="text-[10px] opacity-60 mt-1 line-clamp-2">{t(c.description || c.effect || '')}</p>
                      </div>
                    </CardWrapper>
                  );
                })}
              </div>
              {cores.length > 0 && <button onClick={() => setActiveStage(2)} className="mt-8 border border-m-cyan text-m-cyan px-8 py-2 uppercase text-xs hover:bg-m-cyan hover:text-black transition-colors">ПРОТОКОЛ: ИМПЛАНТЫ -&gt;</button>}
            </div>
          )}

          {activeStage === 2 && (
            <div className="animate-fade-in relative z-10">
              <h2 className="text-xl mb-6 text-m-cyan tracking-widest uppercase border-b border-m-cyan/20 pb-2">КИБЕРНЕТИКА (МАКС 2)</h2>
              <div className="grid grid-cols-2 gap-4">
                {db.implants.map(imp => {
                  const isActive = implants.find(i => i.id === imp.id);
                  return (
                    <CardWrapper key={imp.id} item={imp} active={isActive} onClick={() => implants.find(i => i.id === imp.id) ? removeImplant(imp.id) : (implants.length < 2 && addImplant(imp))} className="flex items-center gap-4">
                      {imp.image && <img src={imp.image} alt={imp.name} className={`w-12 h-12 object-contain z-10 ${isActive ? '' : 'opacity-60 group-hover:opacity-100'}`} />}
                      <div className="z-10 relative">
                        <h3 className={`text-sm font-bold uppercase tracking-widest ${isActive ? 'text-m-cyan' : 'text-gray-300 group-hover:text-white'}`}>{imp.name}</h3>
                        <p className="text-[10px] opacity-60 mt-1 line-clamp-2">{t(imp.effect)}</p>
                      </div>
                    </CardWrapper>
                  );
                })}
              </div>
              <button onClick={() => setActiveStage(3)} className="mt-8 border border-m-cyan text-m-cyan px-8 py-2 uppercase text-xs hover:bg-m-cyan hover:text-black transition-colors">ПРОТОКОЛ: ОРУЖИЕ -&gt;</button>
            </div>
          )}

          {activeStage === 3 && (
            <div className="animate-fade-in relative z-10">
              <h2 className="text-xl mb-6 text-m-cyan tracking-widest uppercase border-b border-m-cyan/20 pb-2">АРСЕНАЛ И МОДИФИКАЦИИ (МАКС 2)</h2>
              <div className="grid grid-cols-3 md:grid-cols-4 gap-3 mb-8">
                {db.weapons.map(w => {
                  const isActive = weapons.find(i => i.id === w.id);
                  return (
                    <CardWrapper key={w.id} item={w} active={isActive} onClick={() => weapons.find(i => i.id === w.id) ? removeWeapon(w.id) : (weapons.length < 2 && addWeapon(w))} className="p-2 flex flex-col justify-center">
                      <h3 className={`text-[10px] font-bold uppercase tracking-widest truncate z-10 ${isActive ? 'text-m-acid' : 'text-gray-300 group-hover:text-white'}`}>{w.name}</h3>
                      <div className="text-[9px] opacity-50 uppercase truncate z-10">{t(w.type || w.weapon_type)}</div>
                    </CardWrapper>
                  );
                })}
              </div>

              {weapons.length > 0 && (
                <div className="space-y-6">
                  {weapons.map(activeW => (
                    <div key={`mod-${activeW.id}`} className="border border-m-acid/30 bg-black/50 p-4 relative z-10">
                      <div className="flex items-center gap-4 mb-4 border-b border-m-acid/20 pb-4">
                        {activeW.image && <img src={activeW.image} alt={activeW.name} className="w-24 object-contain opacity-80" />}
                        <div>
                          <h3 className="text-lg text-m-acid uppercase tracking-widest">{activeW.name}</h3>
                          <div className="text-xs opacity-50 uppercase">Установка модификаций</div>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        {(activeW.mod_slots || []).map(slotType => (
                          <div key={slotType} className="border border-white/5 p-2 bg-[#0C0C0D]">
                            <div className="text-[10px] text-gray-500 uppercase tracking-widest mb-2 border-b border-white/10 pb-1">{t(slotType)}</div>
                            <div className="flex flex-col gap-1">
                              {db.mods.filter(m => m.type === slotType).map(mod => {
                                const isModActive = activeW.selectedMods.find(m => m.id === mod.id);
                                return (
                                  <button
                                    key={mod.id}
                                    onClick={() => toggleMod(activeW.id, mod)}
                                    onMouseEnter={(e) => { setHoveredItem(mod); setMousePos({ x: e.clientX, y: e.clientY }); }}
                                    onMouseLeave={() => setHoveredItem(null)}
                                    className={`text-[9px] text-left p-1.5 uppercase transition-colors border ${isModActive ? 'border-m-pink bg-m-pink/10 text-m-pink' : 'border-transparent text-gray-500 hover:text-white hover:bg-white/5'}`}
                                  >
                                    {t(mod.name)}
                                  </button>
                                );
                              })}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </section>

      <aside className="border border-m-cyan/30 p-6 bg-[#0C0C0D] h-fit sticky top-8 flex flex-col min-h-[70vh]">
        <h2 className="text-lg mb-6 text-m-cyan tracking-widest uppercase border-b border-m-cyan/30 pb-2 flex items-center justify-between">
          <span>ТЕЛЕМЕТРИЯ</span>
          <span className="w-2 h-2 bg-m-pink rounded-full animate-pulse"></span>
        </h2>

        <div className="space-y-6 flex-1">
          <div>
            <h3 className="text-[10px] text-gray-500 uppercase tracking-widest mb-2">ОБОЛОЧКА</h3>
            {shell ? <div className="text-sm text-m-pink font-bold uppercase tracking-wider">{shell.name}</div> : <div className="text-xs opacity-30 font-mono">НЕ ВЫБРАНА</div>}
          </div>

          <div>
            <h3 className="text-[10px] text-gray-500 uppercase tracking-widest mb-2">ЯДРО</h3>
            {cores.length > 0 ? cores.map(c => <div key={c.id} className="text-sm text-m-acid font-bold uppercase tracking-wider">{c.name}</div>) : <div className="text-xs opacity-30 font-mono">ОТСУТСТВУЕТ</div>}
          </div>

          <div>
            <h3 className="text-[10px] text-gray-500 uppercase tracking-widest mb-2">КИБЕРНЕТИКА</h3>
            {implants.length > 0 ? implants.map(imp => <div key={imp.id} className="text-xs text-m-cyan uppercase tracking-wider mb-1">- {imp.name}</div>) : <div className="text-xs opacity-30 font-mono">ОТСУТСТВУЕТ</div>}
          </div>

          <div>
            <h3 className="text-[10px] text-gray-500 uppercase tracking-widest mb-2">АРСЕНАЛ</h3>
            {weapons.length > 0 ? weapons.map(w => (
                <div key={w.instanceId} className="mb-3 border-l-2 border-m-acid/50 pl-2">
                  <div className="text-xs text-m-acid uppercase tracking-wider">{w.name}</div>
                  {w.selectedMods.map(m => <div key={m.id} className="text-[9px] text-gray-400 uppercase mt-0.5">+ {t(m.name)}</div>)}
                </div>
              )) : <div className="text-xs opacity-30 font-mono">ОТСУТСТВУЕТ</div>}
          </div>

          <div className="border-t border-white/10 pt-4 mt-auto">
            <div className="flex justify-between items-end mb-4">
              <span className="text-[10px] text-gray-500 uppercase tracking-widest">РАСЧЕТНАЯ ТЕПЛОЕМКОСТЬ</span>
              <span className="text-xl text-white font-mono">{calcTotalHeat()}</span>
            </div>
            <button
              onClick={() => {
                if(shell) nav('/build');
              }}
              className={`w-full py-3 uppercase text-xs font-bold tracking-widest transition-all ${shell ? 'bg-m-pink/10 border border-m-pink text-m-pink hover:bg-m-pink hover:text-black shadow-[0_0_15px_rgba(255,0,85,0.2)] hover:shadow-[0_0_25px_rgba(255,0,85,0.5)]' : 'border border-gray-600 text-gray-600 cursor-not-allowed'}`}
            >
              РАЗВЕРНУТЬ КОНФИГУРАЦИЮ
            </button>
          </div>
        </div>
      </aside>
    </main>
  );
}