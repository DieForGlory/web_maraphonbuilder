import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useBuildStore } from '../store/useBuildStore';

export default function Weapons() {
  const [weapons, setWeapons] = useState([]);
  const nav = useNavigate();
  const { resetBuild, addWeapon } = useBuildStore();

  useEffect(() => {
    fetch('http://127.0.0.1:5000/api/data/weapons')
      .then(res => res.json())
      .then(data => setWeapons(data));
  }, []);

  const initBuild = (weapon) => {
    resetBuild();
    addWeapon(weapon);
    nav('/');
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <h2 className="text-2xl text-m-pink uppercase">&gt; Armory Index</h2>
      <div className="grid grid-cols-2 gap-6">
        {weapons.map(w => (
          <div key={w.id} className="border border-m-cyan/30 p-6 relative group overflow-hidden bg-m-black hover:border-m-acid transition-colors">
            <div className="absolute top-0 right-0 p-2 text-xs opacity-30 group-hover:opacity-100 group-hover:text-m-acid transition-all">{w.id}</div>
            <h3 className="text-3xl text-m-cyan font-bold uppercase mb-2">{w.name}</h3>
            <div className="flex gap-4 text-sm opacity-80 mb-6 border-b border-m-cyan/20 pb-4">
              <span>Type: <span className="text-white">{w.type}</span></span>
              <span>DMG: <span className="text-white">{w.damage}</span></span>
              <span>WGT: <span className="text-white">{w.weight}</span></span>
            </div>
            <div className="text-xs text-m-pink mb-6 uppercase">
              Compatible Mods: {w.mod_slots.join(', ')}
            </div>
            <button
              onClick={() => initBuild(w)}
              className="bg-transparent border border-m-acid text-m-acid px-4 py-2 uppercase text-sm hover:bg-m-acid hover:text-m-black transition-colors w-full"
            >
              Init Build // {w.name}
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}