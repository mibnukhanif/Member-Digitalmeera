import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import { LogOut, User, Shield, Home, Menu, X } from 'lucide-react';

export default function Layout({ children }: { children: React.ReactNode }) {
  const { user, logout } = useAuthStore();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const closeMenu = () => setIsMenuOpen(false);

  return (
    <div className="min-h-screen bg-zinc-50 flex flex-col font-sans text-zinc-900">
      <header className="bg-black text-white shadow-md relative z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16 items-center">
            <Link to="/" className="flex items-center gap-2" onClick={closeMenu}>
              <span className="text-2xl font-bold tracking-tight text-amber-500">DigitalMeera</span>
            </Link>
            
            {/* Desktop Navigation */}
            <nav className="hidden md:flex gap-4 items-center">
              <Link to="/" className="hover:text-amber-400 transition-colors flex items-center gap-1"><Home size={18}/> Home</Link>
              <Link to="/check-commission" className="hover:text-amber-400 transition-colors">Cek Komisi</Link>
              
              {!user ? (
                <>
                  <Link to="/login" className="hover:text-amber-400 transition-colors">Login</Link>
                  <Link to="/register" className="bg-amber-500 text-black px-4 py-2 rounded-md font-medium hover:bg-amber-400 transition-colors">Daftar</Link>
                </>
              ) : (
                <>
                  {user.role === 'admin' ? (
                    <Link to="/admin" className="hover:text-amber-400 transition-colors flex items-center gap-1"><Shield size={18}/> Admin</Link>
                  ) : (
                    <Link to="/member" className="hover:text-amber-400 transition-colors flex items-center gap-1"><User size={18}/> Member</Link>
                  )}
                  <button onClick={logout} className="hover:text-red-400 transition-colors flex items-center gap-1">
                    <LogOut size={18} /> Logout
                  </button>
                </>
              )}
            </nav>

            {/* Mobile Menu Button */}
            <button 
              className="md:hidden p-2 text-zinc-300 hover:text-white"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
            >
              {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isMenuOpen && (
          <div className="md:hidden absolute top-16 left-0 w-full bg-black border-t border-zinc-800 shadow-xl">
            <nav className="flex flex-col px-4 pt-2 pb-6 gap-4">
              <Link to="/" onClick={closeMenu} className="hover:text-amber-400 transition-colors flex items-center gap-2 py-2"><Home size={18}/> Home</Link>
              <Link to="/check-commission" onClick={closeMenu} className="hover:text-amber-400 transition-colors py-2">Cek Komisi</Link>
              
              {!user ? (
                <>
                  <Link to="/login" onClick={closeMenu} className="hover:text-amber-400 transition-colors py-2">Login</Link>
                  <Link to="/register" onClick={closeMenu} className="bg-amber-500 text-black px-4 py-3 rounded-md font-medium hover:bg-amber-400 transition-colors text-center mt-2">Daftar</Link>
                </>
              ) : (
                <>
                  {user.role === 'admin' ? (
                    <Link to="/admin" onClick={closeMenu} className="hover:text-amber-400 transition-colors flex items-center gap-2 py-2"><Shield size={18}/> Admin Dashboard</Link>
                  ) : (
                    <Link to="/member" onClick={closeMenu} className="hover:text-amber-400 transition-colors flex items-center gap-2 py-2"><User size={18}/> Member Dashboard</Link>
                  )}
                  <button onClick={() => { logout(); closeMenu(); }} className="hover:text-red-400 transition-colors flex items-center gap-2 py-2 text-left">
                    <LogOut size={18} /> Logout
                  </button>
                </>
              )}
            </nav>
          </div>
        )}
      </header>

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {children}
      </main>

      <footer className="bg-black text-zinc-400 py-6 text-center">
        <div className="max-w-7xl mx-auto px-4 flex flex-col md:flex-row justify-between items-center gap-4">
          <p>&copy; 2026 DigitalMeera. All rights reserved.</p>
          {!user && (
            <Link to="/admin/login" className="text-sm text-zinc-500 hover:text-amber-500 transition-colors flex items-center gap-1">
              <Shield size={14} /> Admin Login
            </Link>
          )}
        </div>
      </footer>
    </div>
  );
}
