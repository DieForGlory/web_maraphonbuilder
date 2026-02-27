import { Link, useLocation } from 'react-router-dom';

export default function Header() {
  const loc = useLocation();
  const nav = [
    { path: '/', label: 'Builder' },
    { path: '/shells', label: 'Shells DB' },
    { path: '/weapons', label: 'Armory' }
  ];

  return (
    <header className="border-b border-m-pink pb-4 mb-8 flex justify-between items-end">
      <div>
        <h1 className="text-4xl uppercase tracking-widest text-m-cyan">Marathon Core</h1>
        <p className="text-sm opacity-70">v0.5.0 // Nav-System Online</p>
      </div>
      <nav className="flex gap-6">
        {nav.map(link => (
          <Link
            key={link.path}
            to={link.path}
            className={`uppercase tracking-wider text-sm pb-1 border-b-2 transition-colors ${loc.pathname === link.path ? 'border-m-acid text-m-acid' : 'border-transparent text-m-cyan hover:border-m-cyan'}`}
          >
            [{link.label}]
          </Link>
        ))}
      </nav>
    </header>
  );
}