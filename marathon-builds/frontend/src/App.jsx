import { useState, useEffect } from 'react';
import { useBuildStore } from './store/useBuildStore';

function App() {
  const [db, setDb] = useState({ shells: [], weapons: [], implants: [], mods: [] });
  const { shell, weapons, implants, setShell, addWeapon, removeWeapon, addImplant, removeImplant, toggleMod } = useBuildStore();

  useEffect(() => {
    Promise.all([
      fetch('http://127.0.0.1:5000/api/data/shells').then(res => res.json()),
      fetch('http://127.0.0.1:5000/api/data/weapons').then(res => res.json()),
      fetch('http://127.0.0.1:5000/api/data/implants').then(res => res.json()),
      fetch('http://127.0.0.1:5000/api/data/mods').then(res => res.json())
    ]).then(([shellsData, weaponsData, implantsData, modsData]) => {
      setDb({ shells: shellsData, weapons: weaponsData, implants: implantsData, mods: modsData });
    }).catch(err => console.error("Data Load Error:", err));
  }, []);

  const handleWeaponToggle = (w) => {
    weapons.find(i => i.id === w.id) ? removeWeapon(w.id) : (weapons.length < 2 && addWeapon(w));
  };

  const handleImplantToggle = (imp) => {
    implants.find(i => i.id === imp.id) ? removeImplant(imp.id) : (implants.length < 2 && addImplant(imp));
  };

  const calcTotalHeat = () => {
    if (!shell) return 0;
    let heat = shell.base_heat;
    implants.forEach(imp => { if (imp.effect.includes("Heat Cap")) heat += 15; });
    return heat;
  };

  return (
    <div className="min-h-screen bg-m-black text-m-acid p-8 font-mono pb-24">
      <header className="border-b border-m-pink pb-4 mb-8">
        <h1 className="text-4xl uppercase tracking-widest text-m-cyan">Marathon Builder</h1>
        <p className="text-sm opacity-70">v0.4.0 // Weapon Modding Online</p>
      </header>

      <main className="grid grid-cols-3 gap-6">
        <section className="col-span-2 space-y-6">
          <div className="border border-m-acid/30 p-4">
            <h2 className="text-xl mb-4 text-m-pink">&gt; Shell</h2>
            <div className="grid grid-cols-3 gap-4">
              {db.shells.map(s => (
                <div
                  key={s.id}
                  onClick={() => setShell(s)}
                  className={`border p-3 cursor-pointer transition-colors ${shell?.id === s.id ? 'border-m-pink bg-m-pink/20' : 'border-m-cyan hover:bg-m-cyan/10'}`}
                >
                  <h3 className={`text-md font-bold uppercase ${shell?.id === s.id ? 'text-m-pink' : 'text-m-cyan'}`}>{s.name}</h3>
                </div>
              ))}
            </div>
          </div>

          <div className="border border-m-acid/30 p-4">
            <h2 className="text-xl mb-4 text-m-pink">&gt; Weapons (Max 2)</h2>
            <div className="grid grid-cols-3 gap-4 mb-4">
              {db.weapons.map(w => {
                const isActive = weapons.find(i => i.id === w.id);
                return (
                  <div
                    key={w.id}
                    onClick={() => handleWeaponToggle(w)}
                    className={`border p-3 cursor-pointer transition-colors ${isActive ? 'border-m-acid bg-m-acid/20 text-m-black' : 'border-m-cyan hover:bg-m-cyan/10'}`}
                  >
                    <h3 className="text-md font-bold uppercase">{w.name}</h3>
                    <p className="text-xs opacity-80">{w.type} // DMG: {w.damage}</p>
                  </div>
                );
              })}
            </div>

            {/* Блок конфигурации активного оружия */}
            {weapons.map(activeW => (
              <div key={`mod-${activeW.id}`} className="mt-4 border-t border-m-acid/30 pt-4">
                <h3 className="text-lg text-m-acid mb-2 uppercase">[{activeW.name}] Configuration</h3>
                <div className="grid grid-cols-3 gap-4">
                  {activeW.mod_slots.map(slotType => (
                    <div key={slotType} className="border border-m-cyan/30 p-2">
                      <div className="text-xs opacity-50 uppercase mb-2 border-b border-m-cyan/30 pb-1">{slotType}</div>
                      <div className="space-y-1">
                        {db.mods.filter(m => m.type === slotType).map(mod => {
                          const isModActive = activeW.selectedMods.find(m => m.id === mod.id);
                          return (
                            <div
                              key={mod.id}
                              onClick={() => toggleMod(activeW.id, mod)}
                              className={`text-xs p-1 cursor-pointer border ${isModActive ? 'border-m-pink bg-m-pink/20 text-m-pink' : 'border-transparent hover:border-m-cyan/50'}`}
                            >
                              {mod.name}
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>

          <div className="border border-m-acid/30 p-4">
            <h2 className="text-xl mb-4 text-m-pink">&gt; Implants (Max 2)</h2>
            <div className="grid grid-cols-3 gap-4">
              {db.implants.map(imp => {
                const isActive = implants.find(i => i.id === imp.id);
                return (
                  <div
                    key={imp.id}
                    onClick={() => handleImplantToggle(imp)}
                    className={`border p-3 cursor-pointer transition-colors ${isActive ? 'border-m-cyan bg-m-cyan/20' : 'border-m-cyan hover:bg-m-cyan/10'}`}
                  >
                    <h3 className="text-md font-bold uppercase">{imp.name}</h3>
                    <p className="text-xs opacity-80">{imp.effect}</p>
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        <aside className="border border-m-cyan/30 p-4 h-fit sticky top-8">
          <h2 className="text-xl mb-4 text-m-cyan">&gt; Telemetry</h2>
          {!shell ? (
            <div className="text-sm opacity-50 animate-pulse">Awaiting Shell...</div>
          ) : (
            <div className="space-y-6">
              <div>
                <h3 className="text-lg text-m-pink uppercase border-b border-m-pink/30 pb-1 mb-2">System</h3>
                <div className="flex justify-between text-sm"><span className="opacity-70">Class:</span> <span className="text-m-cyan">{shell.name}</span></div>
                <div className="flex justify-between text-sm"><span className="opacity-70">Total Heat Cap:</span> <span className="text-m-acid font-bold">{calcTotalHeat()}</span></div>
              </div>

              <div>
                <h3 className="text-lg text-m-pink uppercase border-b border-m-pink/30 pb-1 mb-2">Arsenal</h3>
                {weapons.length === 0 ? <p className="text-xs opacity-50">No weapons equipped</p> :
                  weapons.map(w => (
                    <div key={`tel-${w.id}`} className="mb-2">
                      <div className="text-sm flex justify-between"><span className="text-m-acid">{w.name}</span> <span className="opacity-70">{w.damage} DMG</span></div>
                      {w.selectedMods.map(m => (
                        <div key={`tel-mod-${m.id}`} className="text-xs text-m-pink ml-2 opacity-80">+ {m.name}</div>
                      ))}
                    </div>
                  ))
                }
              </div>

              <div>
                <h3 className="text-lg text-m-pink uppercase border-b border-m-pink/30 pb-1 mb-2">Cybernetics</h3>
                {implants.length === 0 ? <p className="text-xs opacity-50">No implants installed</p> :
                  implants.map(imp => <div key={imp.id} className="text-sm text-m-cyan mb-1">- {imp.name}</div>)
                }
              </div>
            </div>
          )}
        </aside>
      </main>
    </div>
  );
}

export default App;