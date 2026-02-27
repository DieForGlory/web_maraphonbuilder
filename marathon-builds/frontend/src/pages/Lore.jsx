import { useState, useEffect } from 'react';
import { t } from '../utils/translator';

export default function Lore() {
  const [loreData, setLoreData] = useState([]);
  const [selectedEntry, setSelectedEntry] = useState(null);

  useEffect(() => {
    fetch('https://5mpxwrp0-5000.euw.devtunnels.ms/api/community/lore')
      .then(res => res.json())
      .then(data => setLoreData(data));
  }, []);

  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-8 animate-fade-in">
      {/* Sidebar навигация */}
      <aside className="border-r border-m-cyan/20 pr-4 space-y-2">
        <h3 className="text-m-cyan text-xs tracking-widest uppercase mb-4 opacity-50">Архивные записи</h3>
        {loreData.map(entry => (
          <button
            key={entry.id}
            onClick={() => setSelectedEntry(entry)}
            className={`w-full text-left px-3 py-2 text-sm uppercase transition-all border-l-2 ${selectedEntry?.id === entry.id ? 'border-m-pink text-m-pink bg-m-pink/5' : 'border-transparent text-gray-500 hover:text-white'}`}
          >
            {entry.title}
          </button>
        ))}
      </aside>

      {/* Контентная область */}
      <main className="md:col-span-3 min-h-[60vh] border border-m-cyan/10 bg-black/40 p-8 relative overflow-hidden">
        <div className="absolute top-0 right-0 p-4 text-[10px] text-m-cyan/20 font-mono tracking-tighter">
          STATUS: ENCRYPTED_ACCESS_GRANTED
        </div>

        {selectedEntry ? (
          <div className="space-y-6 animate-fade-in">
            <div className="space-y-1">
              <span className="text-m-acid text-[10px] tracking-widest uppercase">[{selectedEntry.category}]</span>
              <h2 className="text-3xl text-m-cyan font-bold uppercase tracking-tighter">{selectedEntry.title}</h2>
            </div>

            {selectedEntry.image && (
              <div className="w-full h-64 bg-m-black border border-white/5 overflow-hidden">
                <img src={selectedEntry.image} alt={entry.title} className="w-full h-full object-cover opacity-60 grayscale hover:grayscale-0 transition-all duration-700" />
              </div>
            )}

            <p className="text-gray-300 leading-relaxed font-light text-lg whitespace-pre-wrap">
              {selectedEntry.content}
            </p>
          </div>
        ) : (
          <div className="h-full flex flex-col items-center justify-center opacity-20 space-y-4">
             <div className="w-16 h-16 border-2 border-m-cyan border-t-transparent rounded-full animate-spin"></div>
             <p className="uppercase tracking-[0.3em] text-sm">Ожидание выбора записи...</p>
          </div>
        )}
      </main>
    </div>
  );
}