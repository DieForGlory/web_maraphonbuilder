import { Link, useLocation } from 'react-router-dom';

// Все категории из скрапера для быстрого доступа
const CATEGORIES = [
  { path: 'shells', label: 'Оболочки' },
  { path: 'weapons', label: 'Оружие' },
  { path: 'ammo', label: 'Патроны' },
  { path: 'backpacks', label: 'Рюкзаки' },
  { path: 'consumables', label: 'Расходники' },
  { path: 'cores', label: 'Ядра' },
  { path: 'implanty', label: 'Импланты' },
  { path: 'mods', label: 'Модификации' },
  { path: 'valuables', label: 'Ценности' }
];

export default function Header() {
  const loc = useLocation();

  // Основные разделы приложения
  const mainNav = [
    { path: '/', label: 'Конструктор' },
    { path: '/compare', label: 'Сравнение' },
    { path: '/lore', label: 'ЛОР' },
    { path: '/highlights', label: 'Хайлайты' }
  ];

  return (
    <header className="border-b border-m-pink pb-4 mb-8 flex flex-col gap-4">
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-4xl uppercase tracking-widest text-m-cyan">Marathon Core</h1>
          <p className="text-sm opacity-70">v0.7.0 // Системы синхронизированы</p>
        </div>

        <nav className="flex gap-6">
          {mainNav.map(link => (
            <Link
              key={link.path}
              to={link.path}
              className={`uppercase tracking-wider text-sm pb-1 border-b-2 transition-colors ${
                loc.pathname === link.path
                ? 'border-m-acid text-m-acid'
                : 'border-transparent text-m-cyan hover:border-m-cyan'
              }`}
            >
              [{link.label}]
            </Link>
          ))}
        </nav>
      </div>

      {/* Вспомогательная навигация по категориям БД */}
      <div className="w-full overflow-x-auto custom-scrollbar pb-2 border-t border-m-cyan/20 pt-2">
        <nav className="flex gap-4 w-max px-2">
          {CATEGORIES.map(cat => {
            const fullPath = `/db/${cat.path}`;
            const isActive = loc.pathname === fullPath;
            return (
              <Link
                key={cat.path}
                to={fullPath}
                className={`uppercase text-[11px] px-2 py-1 border transition-colors whitespace-nowrap ${
                  isActive
                  ? 'bg-m-pink/20 border-m-pink text-m-pink'
                  : 'border-transparent text-gray-400 hover:text-white hover:border-white/20'
                }`}
              >
                {cat.label}
              </Link>
            );
          })}
        </nav>
      </div>
    </header>
  );
}