import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useBuildStore } from '../store/useBuildStore';

export default function Shells() {
  const [shells, setShells] = useState([]);
  const nav = useNavigate();
  const { resetBuild, setShell } = useBuildStore();

  useEffect(() => {
    fetch('http://127.0.0.1:5000/api/data/shells')
      .then(res => res.json())
      .then(data => setShells(data));
  }, []);

  const initBuild = (shell) => {
    resetBuild();
    setShell(shell);
    nav('/');
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <h2 className="text-2xl text-m-pink uppercase">&gt; Runner Shells Database</h2>
      <div className="grid grid-cols-2 gap-6">
        {shells.map(s => (
          <div key={s.id} className="border border-m-cyan/30 p-6 relative group hover:border-m-pink transition-colors">
            <h3 className="text-3xl text-m-pink font-bold uppercase mb-2">{s.name}</h3>
            <div className="flex flex-col gap-2 text-sm opacity-80 mb-6 border-l-2 border-m-pink pl-4 mt-4">
              <span>Role Designation: <span className="text-white uppercase">{s.role}</span></span>
              <span>Base Heat Capacity: <span className="text-white">{s.base_heat}</span></span>
            </div>
            <div className="flex flex-wrap gap-2 mb-6">
              {s.slots.map(slot => (
                <span key={slot} className="text-xs border border-m-cyan/30 px-2 py-1 uppercase opacity-70">
                  {slot}
                </span>
              ))}
            </div>
            <button
              onClick={() => initBuild(s)}
              className="bg-transparent border border-m-pink text-m-pink px-4 py-2 uppercase text-sm hover:bg-m-pink hover:text-m-black transition-colors w-full"
            >
              Sync Shell to Builder
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}