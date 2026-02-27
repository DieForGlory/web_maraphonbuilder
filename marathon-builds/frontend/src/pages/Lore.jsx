import { useState, useEffect } from 'react';
import { t } from '../utils/translator';

export default function Lore() {
  const [loreData, setLoreData] = useState([]);
  const [selectedEntry, setSelectedEntry] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // ПРОВЕРЬ ЭТОТ URL! Он должен совпадать с твоим туннелем для порта 5000
  const API_BASE = "https://5mpxwrp0-5000.euw.devtunnels.ms";

  useEffect(() => {
    setLoading(true);
    fetch(`${API_BASE}/api/community/lore`)
      .then(res => {
        if (!res.ok) throw new Error(`Ошибка сервера: ${res.status}`);
        return res.json();
      })
      .then(data => {
        console.log("Данные ЛОРа получены:", data); // Отладка в консоли
        setLoreData(Array.isArray(data) ? data : []);
        setLoading(false);
      })
      .catch(err => {
        console.error("Ошибка загрузки ЛОРа:", err);
        setError(err.message);
        setLoading(false);
      });
  }, []);

  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-8 animate-fade-in min-h-[70vh]">
      {/* Левая панель: Навигация по архиву */}
      <aside className="border-r border-m-cyan/20 pr-4 space-y-2">
        <h3 className="text-m-cyan text-[10px] tracking-[0.3em] uppercase mb-6 opacity-50 border-b border-m-cyan/10 pb-2">
          УЗЛЫ_ДАННЫХ_UESC
        </h3>

        {loading && <div className="text-xs text-gray-600 animate-pulse uppercase">Сканирование частот...</div>}
        {error && <div className="text-xs text-m-pink uppercase">Ошибка связи: {error}</div>}

        {!loading && loreData.length === 0 && (
          <div className="text-xs text-gray-500 uppercase">Архив пуст. Запустите seed_lore.py</div>
        )}

        {loreData.map(entry => (
          <button
            key={entry.id}
            onClick={() => setSelectedEntry(entry)}
            className={`w-full text-left px-4 py-3 text-[11px] uppercase transition-all border-l-2 font-mono tracking-wider ${
              selectedEntry?.id === entry.id
              ? 'border-m-pink text-m-pink bg-m-pink/5 shadow-[inset_0_0_10px_rgba(255,0,85,0.1)]'
              : 'border-transparent text-gray-500 hover:text-white hover:bg-white/5'
            }`}
          >
            {entry.title}
          </button>
        ))}
      </aside>

      {/* Правая панель: Вывод данных */}
      <main className="md:col-span-3 border border-m-cyan/10 bg-m-black/40 p-8 relative overflow-hidden flex flex-col">
        {/* Декоративная сетка на фоне */}
        <div className="absolute inset-0 pointer-events-none bg-[linear-gradient(rgba(0,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(0,255,255,0.02)_1px,transparent_1px)] bg-[size:30px_30px]"></div>

        <div className="absolute top-0 right-0 p-4 text-[9px] text-m-cyan/20 font-mono tracking-widest z-0">
          DATA_TYPE: ARCHIVE_RECORD // ACCESS_LVL: ALPHA
        </div>

        {selectedEntry ? (
          <div className="space-y-8 animate-fade-in relative z-10">
            <div className="border-b border-m-cyan/30 pb-4">
              <span className="text-m-acid text-[10px] tracking-[0.4em] uppercase font-bold">
                // КАТЕГОРИЯ: {t(selectedEntry.category)}
              </span>
              <h2 className="text-4xl text-white font-bold uppercase tracking-tighter mt-2 leading-none">
                {selectedEntry.title}
              </h2>
            </div>

            {/* Если есть изображение — показываем, если нет — не ломаем верстку */}
            {selectedEntry.image && (
              <div className="w-full h-72 bg-black border border-white/5 overflow-hidden relative">
                <img
                  src={selectedEntry.image}
                  alt={selectedEntry.title}
                  className="w-full h-full object-cover opacity-70 grayscale hover:grayscale-0 transition-all duration-1000"
                  onError={(e) => e.target.style.display = 'none'} // Скрыть если картинка 404
                />
                <div className="absolute bottom-0 left-0 w-full h-1 bg-m-pink/50"></div>
              </div>
            )}

            <div className="text-gray-300 leading-relaxed font-light text-lg whitespace-pre-wrap max-w-4xl border-l-2 border-white/5 pl-6">
              {selectedEntry.content}
            </div>

            <div className="pt-8 opacity-20 text-[10px] uppercase tracking-widest font-mono">
              Конец записи. Все права защищены UESC.
            </div>
          </div>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center opacity-30 space-y-6 z-10">
             <div className="w-20 h-20 border-2 border-m-cyan/30 border-t-m-cyan rounded-full animate-spin"></div>
             <div className="text-center">
               <p className="uppercase tracking-[0.4em] text-sm text-m-cyan">Ожидание выбора протокола</p>
               <p className="text-[10px] mt-2">Выберите узел данных в левой панели для дешифровки</p>
             </div>
          </div>
        )}
      </main>
    </div>
  );
}