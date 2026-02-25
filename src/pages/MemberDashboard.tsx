import React, { useState, useEffect, useRef } from 'react';
import { useAuthStore } from '../store/authStore';
import { QRCodeSVG } from 'qrcode.react';
import * as htmlToImage from 'html-to-image';
import { Download, Edit, CreditCard, History, Settings, DollarSign } from 'lucide-react';

export default function MemberDashboard() {
  const { token, user } = useAuthStore();
  const [profile, setProfile] = useState<any>(null);
  const [withdrawals, setWithdrawals] = useState<any[]>([]);
  const [activeTab, setActiveTab] = useState('dashboard');
  const [withdrawAmount, setWithdrawAmount] = useState('');
  const [editForm, setEditForm] = useState({ name: '', phone: '', email: '', password: '' });
  const [message, setMessage] = useState('');
  const cardRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetchProfile();
    fetchWithdrawals();
  }, []);

  const fetchProfile = async () => {
    const res = await fetch('/api/member/profile', {
      headers: { Authorization: `Bearer ${token}` },
    });
    const data = await res.json();
    setProfile(data);
    setEditForm({ name: data.name, phone: data.phone || '', email: data.email, password: '' });
  };

  const fetchWithdrawals = async () => {
    const res = await fetch('/api/member/withdrawals', {
      headers: { Authorization: `Bearer ${token}` },
    });
    const data = await res.json();
    setWithdrawals(data);
  };

  const handleWithdraw = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage('');
    try {
      const res = await fetch('/api/member/withdraw', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ amount: parseInt(withdrawAmount) }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setMessage('Withdrawal request submitted successfully');
      setWithdrawAmount('');
      fetchProfile();
      fetchWithdrawals();
    } catch (err: any) {
      setMessage(err.message);
    }
  };

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage('');
    try {
      const res = await fetch('/api/member/profile', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(editForm),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setMessage('Profile updated successfully');
      fetchProfile();
    } catch (err: any) {
      setMessage(err.message);
    }
  };

  const downloadCard = async () => {
    if (cardRef.current) {
      const url = await htmlToImage.toPng(cardRef.current);
      const link = document.createElement('a');
      link.download = `DigitalMeera_Card_${profile.member_id}.png`;
      link.href = url;
      link.click();
    }
  };

  if (!profile) return <div className="text-center py-20">Loading...</div>;

  return (
    <div className="flex flex-col md:flex-row gap-8">
      {/* Sidebar */}
      <div className="w-full md:w-64 space-y-2">
        <button
          onClick={() => setActiveTab('dashboard')}
          className={`w-full text-left px-4 py-3 rounded-xl font-medium flex items-center gap-3 transition-colors ${activeTab === 'dashboard' ? 'bg-black text-white' : 'hover:bg-zinc-100'}`}
        >
          <CreditCard size={20} /> Dashboard
        </button>
        <button
          onClick={() => setActiveTab('card')}
          className={`w-full text-left px-4 py-3 rounded-xl font-medium flex items-center gap-3 transition-colors ${activeTab === 'card' ? 'bg-black text-white' : 'hover:bg-zinc-100'}`}
        >
          <QrCodeIcon size={20} /> Kartu Member
        </button>
        <button
          onClick={() => setActiveTab('withdraw')}
          className={`w-full text-left px-4 py-3 rounded-xl font-medium flex items-center gap-3 transition-colors ${activeTab === 'withdraw' ? 'bg-black text-white' : 'hover:bg-zinc-100'}`}
        >
          <DollarSign size={20} /> Redeem Komisi
        </button>
        <button
          onClick={() => setActiveTab('history')}
          className={`w-full text-left px-4 py-3 rounded-xl font-medium flex items-center gap-3 transition-colors ${activeTab === 'history' ? 'bg-black text-white' : 'hover:bg-zinc-100'}`}
        >
          <History size={20} /> Riwayat Redeem
        </button>
        <button
          onClick={() => setActiveTab('settings')}
          className={`w-full text-left px-4 py-3 rounded-xl font-medium flex items-center gap-3 transition-colors ${activeTab === 'settings' ? 'bg-black text-white' : 'hover:bg-zinc-100'}`}
        >
          <Settings size={20} /> Pengaturan
        </button>
      </div>

      {/* Main Content */}
      <div className="flex-1 bg-white p-8 rounded-2xl shadow-sm border border-zinc-100">
        {message && (
          <div className="bg-amber-50 text-amber-800 p-4 rounded-xl mb-6 font-medium border border-amber-200">
            {message}
          </div>
        )}

        {activeTab === 'dashboard' && (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold">Dashboard Member</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-gradient-to-br from-black to-zinc-800 text-white p-6 rounded-2xl shadow-lg">
                <p className="text-zinc-400 text-sm font-medium uppercase tracking-wider mb-2">Total Komisi</p>
                <p className="text-4xl font-mono font-bold tracking-tight text-amber-500">
                  Rp {profile.commission.toLocaleString('id-ID')}
                </p>
              </div>
              <div className="bg-zinc-50 p-6 rounded-2xl border border-zinc-200">
                <p className="text-zinc-500 text-sm font-medium uppercase tracking-wider mb-2">Total Transaksi</p>
                <p className="text-4xl font-mono font-bold tracking-tight text-black">
                  {profile.total_transactions}
                </p>
              </div>
            </div>
            <div className="bg-zinc-50 p-6 rounded-2xl border border-zinc-200">
              <h3 className="text-lg font-bold mb-4">Informasi Akun</h3>
              <div className="space-y-3 text-sm">
                <div className="flex justify-between border-b border-zinc-200 pb-2">
                  <span className="text-zinc-500">Nama Lengkap</span>
                  <span className="font-medium text-black">{profile.name}</span>
                </div>
                <div className="flex justify-between border-b border-zinc-200 pb-2">
                  <span className="text-zinc-500">ID Member</span>
                  <span className="font-mono font-medium text-black">{profile.member_id}</span>
                </div>
                <div className="flex justify-between border-b border-zinc-200 pb-2">
                  <span className="text-zinc-500">Status</span>
                  <span className={`font-medium ${profile.status === 'active' ? 'text-emerald-600' : 'text-red-600'}`}>
                    {profile.status.toUpperCase()}
                  </span>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'card' && (
          <div className="space-y-8 flex flex-col items-center">
            <h2 className="text-2xl font-bold w-full text-left">Kartu Member Digital</h2>
            
            {/* Card Preview */}
            <div 
              ref={cardRef}
              className="w-full max-w-sm bg-gradient-to-br from-black to-zinc-900 text-white rounded-2xl p-6 shadow-2xl relative overflow-hidden aspect-[1.586/1]"
            >
              <div className="absolute top-0 right-0 w-32 h-32 bg-amber-500/20 rounded-full blur-3xl"></div>
              <div className="relative z-10 h-full flex flex-col justify-between">
                <div className="flex justify-between items-start">
                  <h3 className="text-xl font-bold text-amber-500 tracking-tight">DigitalMeera</h3>
                  <span className="text-xs font-mono bg-white/10 px-2 py-1 rounded-md border border-white/20">MEMBER</span>
                </div>
                
                <div className="flex justify-between items-end">
                  <div>
                    <p className="text-xs text-zinc-400 uppercase tracking-wider mb-1">Nama Member</p>
                    <p className="font-bold text-lg leading-tight mb-2">{profile.name}</p>
                    <p className="font-mono text-sm text-amber-400 tracking-widest">{profile.member_id}</p>
                  </div>
                  <div className="bg-white p-2 rounded-xl">
                    <QRCodeSVG value={profile.member_id} size={64} level="M" />
                  </div>
                </div>
              </div>
            </div>

            <button 
              onClick={downloadCard}
              className="bg-amber-500 text-black px-6 py-3 rounded-xl font-bold hover:bg-amber-400 transition-all flex items-center gap-2"
            >
              <Download size={20} /> Download Kartu (PNG)
            </button>
          </div>
        )}

        {activeTab === 'withdraw' && (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold">Redeem Komisi</h2>
            <div className="bg-amber-50 p-6 rounded-2xl border border-amber-200">
              <p className="text-sm text-amber-800 mb-2">Saldo Komisi Tersedia</p>
              <p className="text-3xl font-mono font-bold text-amber-600">Rp {profile.commission.toLocaleString('id-ID')}</p>
            </div>
            <form onSubmit={handleWithdraw} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-zinc-700 mb-1">Nominal Withdraw (Rp)</label>
                <input
                  type="number"
                  required
                  min="0"
                  className="w-full px-4 py-3 rounded-xl border border-zinc-300 focus:ring-2 focus:ring-amber-500 focus:border-amber-500 transition-all"
                  value={withdrawAmount}
                  onChange={(e) => setWithdrawAmount(e.target.value)}
                />
              </div>
              <button
                type="submit"
                className="w-full bg-black text-white py-3 rounded-xl font-bold hover:bg-zinc-800 transition-all"
              >
                Ajukan Withdraw
              </button>
            </form>
          </div>
        )}

        {activeTab === 'history' && (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold">Riwayat Redeem</h2>
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b-2 border-zinc-200">
                    <th className="py-3 px-4 font-semibold text-zinc-600">Tanggal</th>
                    <th className="py-3 px-4 font-semibold text-zinc-600">Nominal</th>
                    <th className="py-3 px-4 font-semibold text-zinc-600">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {withdrawals.length === 0 ? (
                    <tr>
                      <td colSpan={3} className="py-8 text-center text-zinc-500">Belum ada riwayat withdraw</td>
                    </tr>
                  ) : (
                    withdrawals.map((w) => (
                      <tr key={w.id} className="border-b border-zinc-100 hover:bg-zinc-50">
                        <td className="py-3 px-4 text-sm text-zinc-600">{new Date(w.created_at).toLocaleDateString('id-ID')}</td>
                        <td className="py-3 px-4 font-mono font-medium">Rp {w.amount.toLocaleString('id-ID')}</td>
                        <td className="py-3 px-4">
                          <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                            w.status === 'approved' ? 'bg-emerald-100 text-emerald-700' :
                            w.status === 'rejected' ? 'bg-red-100 text-red-700' :
                            'bg-amber-100 text-amber-700'
                          }`}>
                            {w.status.toUpperCase()}
                          </span>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {activeTab === 'settings' && (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold">Pengaturan Profil</h2>
            <form onSubmit={handleUpdateProfile} className="space-y-4 max-w-md">
              <div>
                <label className="block text-sm font-medium text-zinc-700 mb-1">Nama Lengkap</label>
                <input
                  type="text"
                  required
                  className="w-full px-4 py-3 rounded-xl border border-zinc-300 focus:ring-2 focus:ring-amber-500 focus:border-amber-500 transition-all"
                  value={editForm.name}
                  onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-zinc-700 mb-1">No. Handphone</label>
                <input
                  type="tel"
                  required
                  className="w-full px-4 py-3 rounded-xl border border-zinc-300 focus:ring-2 focus:ring-amber-500 focus:border-amber-500 transition-all"
                  value={editForm.phone}
                  onChange={(e) => setEditForm({ ...editForm, phone: e.target.value })}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-zinc-700 mb-1">Email</label>
                <input
                  type="email"
                  required
                  className="w-full px-4 py-3 rounded-xl border border-zinc-300 focus:ring-2 focus:ring-amber-500 focus:border-amber-500 transition-all"
                  value={editForm.email}
                  onChange={(e) => setEditForm({ ...editForm, email: e.target.value })}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-zinc-700 mb-1">Password Baru (Kosongkan jika tidak ingin ganti)</label>
                <input
                  type="password"
                  className="w-full px-4 py-3 rounded-xl border border-zinc-300 focus:ring-2 focus:ring-amber-500 focus:border-amber-500 transition-all"
                  value={editForm.password}
                  onChange={(e) => setEditForm({ ...editForm, password: e.target.value })}
                />
              </div>
              <button
                type="submit"
                className="w-full bg-black text-white py-3 rounded-xl font-bold hover:bg-zinc-800 transition-all"
              >
                Simpan Perubahan
              </button>
            </form>
          </div>
        )}
      </div>
    </div>
  );
}

function QrCodeIcon(props: any) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <rect width="5" height="5" x="3" y="3" rx="1" />
      <rect width="5" height="5" x="16" y="3" rx="1" />
      <rect width="5" height="5" x="3" y="16" rx="1" />
      <path d="M21 16h-3a2 2 0 0 0-2 2v3" />
      <path d="M21 21v.01" />
      <path d="M12 7v3a2 2 0 0 1-2 2H7" />
      <path d="M3 12h.01" />
      <path d="M12 3h.01" />
      <path d="M12 16v.01" />
      <path d="M16 12h1" />
      <path d="M21 12v.01" />
      <path d="M12 21v-1" />
    </svg>
  )
}
