import React, { useState, useEffect } from 'react';
import { useAuthStore } from '../store/authStore';
import { Html5QrcodeScanner } from 'html5-qrcode';
import { Users, QrCode, DollarSign, History, Settings, CheckCircle, XCircle, Trash2, Power } from 'lucide-react';

export default function AdminDashboard() {
  const { token } = useAuthStore();
  const [stats, setStats] = useState<any>(null);
  const [members, setMembers] = useState<any[]>([]);
  const [withdrawals, setWithdrawals] = useState<any[]>([]);
  const [settings, setSettings] = useState<any>({});
  const [activeTab, setActiveTab] = useState('dashboard');
  const [message, setMessage] = useState('');
  const [scanResult, setScanResult] = useState<any>(null);

  useEffect(() => {
    fetchStats();
    fetchMembers();
    fetchWithdrawals();
    fetchSettings();
  }, []);

  useEffect(() => {
    if (activeTab === 'scan') {
      const scanner = new Html5QrcodeScanner(
        "reader",
        { fps: 10, qrbox: { width: 250, height: 250 } },
        false
      );

      scanner.render(
        async (decodedText) => {
          scanner.clear();
          handleScan(decodedText);
        },
        (error) => {
          // console.warn(error);
        }
      );

      return () => {
        scanner.clear().catch(error => console.error("Failed to clear scanner", error));
      };
    }
  }, [activeTab]);

  const fetchStats = async () => {
    const res = await fetch('/api/admin/stats', { headers: { Authorization: `Bearer ${token}` } });
    setStats(await res.json());
  };

  const fetchMembers = async () => {
    const res = await fetch('/api/admin/members', { headers: { Authorization: `Bearer ${token}` } });
    setMembers(await res.json());
  };

  const fetchWithdrawals = async () => {
    const res = await fetch('/api/admin/withdrawals', { headers: { Authorization: `Bearer ${token}` } });
    setWithdrawals(await res.json());
  };

  const fetchSettings = async () => {
    const res = await fetch('/api/admin/settings', { headers: { Authorization: `Bearer ${token}` } });
    setSettings(await res.json());
  };

  const handleScan = async (member_id: string) => {
    setMessage('');
    setScanResult(null);
    try {
      const res = await fetch('/api/admin/scan', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ member_id }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setScanResult(data);
      fetchStats();
      fetchMembers();
    } catch (err: any) {
      setMessage(err.message);
    }
  };

  const handleMemberStatus = async (id: number, status: string) => {
    try {
      await fetch(`/api/admin/members/${id}/status`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ status }),
      });
      fetchMembers();
    } catch (err) {
      console.error(err);
    }
  };

  const handleDeleteMember = async (id: number) => {
    if (!confirm('Yakin ingin menghapus member ini? Semua data transaksi akan hilang.')) return;
    try {
      await fetch(`/api/admin/members/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });
      fetchMembers();
      fetchStats();
    } catch (err) {
      console.error(err);
    }
  };

  const handleWithdrawalStatus = async (id: number, status: string) => {
    try {
      await fetch(`/api/admin/withdrawals/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ status }),
      });
      fetchWithdrawals();
      fetchStats();
    } catch (err) {
      console.error(err);
    }
  };

  const handleUpdateSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage('');
    try {
      const res = await fetch('/api/admin/settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify(settings),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setMessage('Pengaturan berhasil disimpan');
      fetchSettings();
    } catch (err: any) {
      setMessage(err.message);
    }
  };

  if (!stats) return <div className="text-center py-20">Loading...</div>;

  return (
    <div className="flex flex-col md:flex-row gap-8">
      {/* Sidebar */}
      <div className="w-full md:w-64 space-y-2">
        <button
          onClick={() => setActiveTab('dashboard')}
          className={`w-full text-left px-4 py-3 rounded-xl font-medium flex items-center gap-3 transition-colors ${activeTab === 'dashboard' ? 'bg-black text-white' : 'hover:bg-zinc-100'}`}
        >
          <Users size={20} /> Dashboard
        </button>
        <button
          onClick={() => setActiveTab('scan')}
          className={`w-full text-left px-4 py-3 rounded-xl font-medium flex items-center gap-3 transition-colors ${activeTab === 'scan' ? 'bg-black text-white' : 'hover:bg-zinc-100'}`}
        >
          <QrCode size={20} /> Scan Member
        </button>
        <button
          onClick={() => setActiveTab('members')}
          className={`w-full text-left px-4 py-3 rounded-xl font-medium flex items-center gap-3 transition-colors ${activeTab === 'members' ? 'bg-black text-white' : 'hover:bg-zinc-100'}`}
        >
          <Users size={20} /> Daftar Member
        </button>
        <button
          onClick={() => setActiveTab('withdrawals')}
          className={`w-full text-left px-4 py-3 rounded-xl font-medium flex items-center gap-3 transition-colors ${activeTab === 'withdrawals' ? 'bg-black text-white' : 'hover:bg-zinc-100'}`}
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
            <h2 className="text-2xl font-bold">Dashboard Admin</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="bg-zinc-50 p-6 rounded-2xl border border-zinc-200">
                <p className="text-zinc-500 text-sm font-medium uppercase tracking-wider mb-2">Total Member</p>
                <p className="text-3xl font-bold text-black">{stats.totalMembers}</p>
              </div>
              <div className="bg-zinc-50 p-6 rounded-2xl border border-zinc-200">
                <p className="text-zinc-500 text-sm font-medium uppercase tracking-wider mb-2">Total Transaksi</p>
                <p className="text-3xl font-bold text-black">{stats.totalTransactions}</p>
              </div>
              <div className="bg-gradient-to-br from-black to-zinc-800 text-white p-6 rounded-2xl shadow-lg">
                <p className="text-zinc-400 text-sm font-medium uppercase tracking-wider mb-2">Komisi Beredar</p>
                <p className="text-2xl font-mono font-bold tracking-tight text-amber-500">
                  Rp {stats.totalCommission.toLocaleString('id-ID')}
                </p>
              </div>
              <div className="bg-amber-50 p-6 rounded-2xl border border-amber-200">
                <p className="text-amber-800 text-sm font-medium uppercase tracking-wider mb-2">Total Withdraw</p>
                <p className="text-2xl font-mono font-bold tracking-tight text-amber-600">
                  Rp {stats.totalWithdraw.toLocaleString('id-ID')}
                </p>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'scan' && (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold">Scan QR Code Member</h2>
            <div className="max-w-md mx-auto">
              <div id="reader" className="w-full rounded-2xl overflow-hidden border-2 border-zinc-200"></div>
              
              {scanResult && (
                <div className="mt-6 bg-emerald-50 border border-emerald-200 p-6 rounded-2xl text-center">
                  <CheckCircle className="text-emerald-500 w-12 h-12 mx-auto mb-3" />
                  <h3 className="text-xl font-bold text-emerald-800 mb-1">Scan Berhasil!</h3>
                  <p className="text-emerald-700">
                    Komisi Rp {scanResult.amount.toLocaleString('id-ID')} ditambahkan ke member <br/>
                    <span className="font-bold">{scanResult.member_name}</span>
                  </p>
                </div>
              )}
            </div>
          </div>
        )}

        {activeTab === 'members' && (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold">Daftar Member</h2>
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b-2 border-zinc-200">
                    <th className="py-3 px-4 font-semibold text-zinc-600">ID Member</th>
                    <th className="py-3 px-4 font-semibold text-zinc-600">Nama</th>
                    <th className="py-3 px-4 font-semibold text-zinc-600">Komisi</th>
                    <th className="py-3 px-4 font-semibold text-zinc-600">Status</th>
                    <th className="py-3 px-4 font-semibold text-zinc-600 text-right">Aksi</th>
                  </tr>
                </thead>
                <tbody>
                  {members.map((m) => (
                    <tr key={m.id} className="border-b border-zinc-100 hover:bg-zinc-50">
                      <td className="py-3 px-4 font-mono text-sm">{m.member_id}</td>
                      <td className="py-3 px-4 font-medium">{m.name}</td>
                      <td className="py-3 px-4 font-mono">Rp {m.commission.toLocaleString('id-ID')}</td>
                      <td className="py-3 px-4">
                        <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                          m.status === 'active' ? 'bg-emerald-100 text-emerald-700' : 'bg-red-100 text-red-700'
                        }`}>
                          {m.status.toUpperCase()}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-right space-x-2">
                        <button
                          onClick={() => handleMemberStatus(m.id, m.status === 'active' ? 'inactive' : 'active')}
                          className={`p-2 rounded-lg transition-colors ${m.status === 'active' ? 'text-amber-600 hover:bg-amber-50' : 'text-emerald-600 hover:bg-emerald-50'}`}
                          title={m.status === 'active' ? 'Nonaktifkan' : 'Aktifkan'}
                        >
                          <Power size={18} />
                        </button>
                        <button
                          onClick={() => handleDeleteMember(m.id)}
                          className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                          title="Hapus"
                        >
                          <Trash2 size={18} />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {activeTab === 'withdrawals' && (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold">Riwayat Redeem</h2>
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b-2 border-zinc-200">
                    <th className="py-3 px-4 font-semibold text-zinc-600">Tanggal</th>
                    <th className="py-3 px-4 font-semibold text-zinc-600">Member</th>
                    <th className="py-3 px-4 font-semibold text-zinc-600">Nominal</th>
                    <th className="py-3 px-4 font-semibold text-zinc-600">Status</th>
                    <th className="py-3 px-4 font-semibold text-zinc-600 text-right">Aksi</th>
                  </tr>
                </thead>
                <tbody>
                  {withdrawals.map((w) => (
                    <tr key={w.id} className="border-b border-zinc-100 hover:bg-zinc-50">
                      <td className="py-3 px-4 text-sm text-zinc-600">{new Date(w.created_at).toLocaleDateString('id-ID')}</td>
                      <td className="py-3 px-4">
                        <p className="font-medium">{w.name}</p>
                        <p className="text-xs text-zinc-500 font-mono">{w.member_id}</p>
                      </td>
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
                      <td className="py-3 px-4 text-right space-x-2">
                        {w.status === 'pending' && (
                          <>
                            <button
                              onClick={() => handleWithdrawalStatus(w.id, 'approved')}
                              className="p-2 text-emerald-600 hover:bg-emerald-50 rounded-lg transition-colors"
                              title="Approve"
                            >
                              <CheckCircle size={18} />
                            </button>
                            <button
                              onClick={() => handleWithdrawalStatus(w.id, 'rejected')}
                              className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                              title="Reject"
                            >
                              <XCircle size={18} />
                            </button>
                          </>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {activeTab === 'settings' && (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold">Pengaturan Sistem</h2>
            <form onSubmit={handleUpdateSettings} className="space-y-4 max-w-md">
              <div>
                <label className="block text-sm font-medium text-zinc-700 mb-1">Komisi per Transaksi (Rp)</label>
                <input
                  type="number"
                  required
                  className="w-full px-4 py-3 rounded-xl border border-zinc-300 focus:ring-2 focus:ring-amber-500 focus:border-amber-500 transition-all"
                  value={settings.commission_per_transaction || ''}
                  onChange={(e) => setSettings({ ...settings, commission_per_transaction: e.target.value })}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-zinc-700 mb-1">Minimal Withdraw (Rp)</label>
                <input
                  type="number"
                  required
                  className="w-full px-4 py-3 rounded-xl border border-zinc-300 focus:ring-2 focus:ring-amber-500 focus:border-amber-500 transition-all"
                  value={settings.min_withdraw || ''}
                  onChange={(e) => setSettings({ ...settings, min_withdraw: e.target.value })}
                />
              </div>
              <hr className="my-6 border-zinc-200" />
              <h3 className="text-lg font-bold">Akun Admin</h3>
              <div>
                <label className="block text-sm font-medium text-zinc-700 mb-1">Email / Username Admin</label>
                <input
                  type="text"
                  className="w-full px-4 py-3 rounded-xl border border-zinc-300 focus:ring-2 focus:ring-amber-500 focus:border-amber-500 transition-all"
                  value={settings.username || ''}
                  onChange={(e) => setSettings({ ...settings, username: e.target.value })}
                  placeholder="admin@digitalmeera.com"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-zinc-700 mb-1">Password Baru (Kosongkan jika tidak ingin ganti)</label>
                <input
                  type="password"
                  className="w-full px-4 py-3 rounded-xl border border-zinc-300 focus:ring-2 focus:ring-amber-500 focus:border-amber-500 transition-all"
                  value={settings.password || ''}
                  onChange={(e) => setSettings({ ...settings, password: e.target.value })}
                />
              </div>
              <button
                type="submit"
                className="w-full bg-black text-white py-3 rounded-xl font-bold hover:bg-zinc-800 transition-all"
              >
                Simpan Pengaturan
              </button>
            </form>
          </div>
        )}
      </div>
    </div>
  );
}
