import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';

export default function Register() {
  const [formData, setFormData] = useState({ name: '', phone: '', email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { login } = useAuthStore();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Registration failed');
      }

      // Auto login
      const loginRes = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ emailOrId: formData.email, password: formData.password }),
      });
      const loginData = await loginRes.json();
      
      if (loginRes.ok) {
        login(loginData.token, loginData.user);
        navigate('/member');
      } else {
        navigate('/login');
      }

    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto bg-white p-6 md:p-8 rounded-2xl shadow-lg border border-zinc-100">
      <h2 className="text-3xl font-bold text-center mb-8 text-black">Daftar Member</h2>
      {error && <div className="bg-red-50 text-red-600 p-4 rounded-lg mb-6 text-sm">{error}</div>}
      <form onSubmit={handleSubmit} className="space-y-5">
        <div>
          <label className="block text-sm font-medium text-zinc-700 mb-1">Nama Lengkap</label>
          <input
            type="text"
            required
            className="w-full px-4 py-3 rounded-xl border border-zinc-300 focus:ring-2 focus:ring-amber-500 focus:border-amber-500 transition-all"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-zinc-700 mb-1">No. Handphone / WhatsApp</label>
          <input
            type="tel"
            required
            className="w-full px-4 py-3 rounded-xl border border-zinc-300 focus:ring-2 focus:ring-amber-500 focus:border-amber-500 transition-all"
            value={formData.phone}
            onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-zinc-700 mb-1">Email</label>
          <input
            type="email"
            required
            className="w-full px-4 py-3 rounded-xl border border-zinc-300 focus:ring-2 focus:ring-amber-500 focus:border-amber-500 transition-all"
            value={formData.email}
            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-zinc-700 mb-1">Password</label>
          <input
            type="password"
            required
            className="w-full px-4 py-3 rounded-xl border border-zinc-300 focus:ring-2 focus:ring-amber-500 focus:border-amber-500 transition-all"
            value={formData.password}
            onChange={(e) => setFormData({ ...formData, password: e.target.value })}
          />
        </div>
        <button
          type="submit"
          disabled={loading}
          className="w-full bg-black text-white py-3 rounded-xl font-bold hover:bg-zinc-800 transition-all disabled:opacity-50"
        >
          {loading ? 'Mendaftar...' : 'Daftar Sekarang'}
        </button>
      </form>
    </div>
  );
}
