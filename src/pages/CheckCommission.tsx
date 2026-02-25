import React, { useState } from 'react';
import { Search } from 'lucide-react';

export default function CheckCommission() {
  const [memberId, setMemberId] = useState('');
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!memberId) return;
    
    setLoading(true);
    setError('');
    setResult(null);

    try {
      const res = await fetch(`/api/check-commission/${memberId}`);
      const data = await res.json();
      
      if (!res.ok) throw new Error(data.error || 'Member tidak ditemukan');
      setResult(data);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-xl mx-auto">
      <div className="bg-white p-6 md:p-8 rounded-2xl shadow-lg border border-zinc-100 mb-8">
        <h2 className="text-3xl font-bold text-center mb-8 text-black">Cek Komisi Member</h2>
        <form onSubmit={handleSearch} className="flex flex-col sm:flex-row gap-4">
          <input
            type="text"
            placeholder="Masukkan ID Member (contoh: DM20260001)"
            className="flex-1 px-4 py-3 rounded-xl border border-zinc-300 focus:ring-2 focus:ring-amber-500 focus:border-amber-500 transition-all uppercase"
            value={memberId}
            onChange={(e) => setMemberId(e.target.value.toUpperCase())}
          />
          <button
            type="submit"
            disabled={loading}
            className="bg-amber-500 text-black px-6 py-3 rounded-xl font-bold hover:bg-amber-400 transition-all disabled:opacity-50 flex items-center gap-2"
          >
            <Search size={20} />
            {loading ? 'Mencari...' : 'Cari'}
          </button>
        </form>
      </div>

      {error && (
        <div className="bg-red-50 text-red-600 p-6 rounded-2xl text-center font-medium shadow-sm border border-red-100">
          {error}
        </div>
      )}

      {result && (
        <div className="bg-gradient-to-br from-black to-zinc-900 text-white p-6 md:p-8 rounded-2xl shadow-2xl relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-amber-500/10 rounded-full blur-3xl"></div>
          <div className="relative z-10">
            <div className="flex justify-between items-start mb-8">
              <div>
                <p className="text-zinc-400 text-sm font-medium uppercase tracking-wider mb-1">Nama Member</p>
                <h3 className="text-2xl font-bold text-amber-500">{result.name}</h3>
              </div>
              <div className="text-right">
                <p className="text-zinc-400 text-sm font-medium uppercase tracking-wider mb-1">Status</p>
                <span className={`px-3 py-1 rounded-full text-xs font-bold ${result.status === 'active' ? 'bg-emerald-500/20 text-emerald-400' : 'bg-red-500/20 text-red-400'}`}>
                  {result.status.toUpperCase()}
                </span>
              </div>
            </div>
            
            <div className="bg-white/5 rounded-xl p-6 border border-white/10">
              <p className="text-zinc-400 text-sm font-medium uppercase tracking-wider mb-2">Total Komisi</p>
              <p className="text-4xl font-mono font-bold tracking-tight">
                Rp {result.commission.toLocaleString('id-ID')}
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
