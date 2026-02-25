import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import { Shield } from 'lucide-react';

export default function AdminLogin() {
  const [formData, setFormData] = useState({ emailOrId: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { login } = useAuthStore();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Login failed');
      }

      if (data.user.role !== 'admin') {
        throw new Error('Akses ditolak. Anda bukan admin.');
      }

      login(data.token, data.user);
      navigate('/admin');
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto bg-white p-8 rounded-2xl shadow-lg border border-zinc-100">
      <div className="flex justify-center mb-6">
        <div className="bg-black p-4 rounded-full">
          <Shield className="text-amber-500" size={32} />
        </div>
      </div>
      <h2 className="text-3xl font-bold text-center mb-8 text-black">Admin Login</h2>
      {error && <div className="bg-red-50 text-red-600 p-4 rounded-lg mb-6 text-sm">{error}</div>}
      <form onSubmit={handleSubmit} className="space-y-5">
        <div>
          <label className="block text-sm font-medium text-zinc-700 mb-1">Email Admin</label>
          <input
            type="text"
            required
            className="w-full px-4 py-3 rounded-xl border border-zinc-300 focus:ring-2 focus:ring-amber-500 focus:border-amber-500 transition-all"
            value={formData.emailOrId}
            onChange={(e) => setFormData({ ...formData, emailOrId: e.target.value })}
            placeholder="admin@digitalmeera.com"
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
            placeholder="••••••••"
          />
        </div>
        <button
          type="submit"
          disabled={loading}
          className="w-full bg-black text-amber-500 py-3 rounded-xl font-bold hover:bg-zinc-800 transition-all disabled:opacity-50 flex justify-center items-center gap-2"
        >
          <Shield size={20} />
          {loading ? 'Loading...' : 'Masuk sebagai Admin'}
        </button>
      </form>
    </div>
  );
}
