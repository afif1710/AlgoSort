import { Link, NavLink } from 'react-router-dom'
import ThemeToggle from './ThemeToggle'

export default function Navbar() {
  const linkBase = "px-3 py-2 rounded-md text-sm font-medium"
  const active = "bg-brand text-white"
  const inactive = "text-[var(--fg)] hover:bg-[var(--panel)]"
  return (
    <header className="border-b border-slate-200/40 sticky top-0 bg-[var(--bg)] z-50">
      <div className="max-w-7xl mx-auto px-4 py-3 flex items-center gap-3">
        <Link to="/" className="flex items-center gap-2">
          <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-brand to-brand-dark grid place-items-center text-white font-bold">A</div>
          <span className="font-semibold">AlgoSort</span>
        </Link>
        <nav className="ml-auto flex items-center gap-2">
          <NavLink to="/topics" className={({isActive}) => `${linkBase} ${isActive?active:inactive}`}>Tutorials</NavLink>
          <NavLink to="/problems" className={({isActive}) => `${linkBase} ${isActive?active:inactive}`}>Problems</NavLink>
          <ThemeToggle />
        </nav>
      </div>
    </header>
  )
}
