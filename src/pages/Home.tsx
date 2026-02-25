import { Link } from 'react-router-dom';
import { QrCode, Search, ShoppingBag, DollarSign } from 'lucide-react';

export default function Home() {
  return (
    <div className="space-y-12">
      <section className="text-center py-12 md:py-20 px-4 bg-gradient-to-b from-black to-zinc-900 text-white rounded-3xl shadow-2xl">
        <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight mb-6">
          Sistem Kartu Member <span className="text-amber-500">DigitalMeera</span>
        </h1>
        <p className="text-lg md:text-xl text-zinc-300 max-w-2xl mx-auto mb-10">
          Belanja di DigitalMeera, dapatkan cashback setiap transaksi, dan cairkan komisi Anda kapan saja.
        </p>
        <div className="flex flex-col sm:flex-row justify-center gap-4">
          <Link to="/register" className="bg-amber-500 text-black px-8 py-4 rounded-full font-bold text-lg hover:bg-amber-400 transition-all shadow-lg hover:shadow-amber-500/20">
            Daftar Sekarang (Gratis)
          </Link>
          <Link to="/check-commission" className="bg-white/10 text-white px-8 py-4 rounded-full font-bold text-lg hover:bg-white/20 transition-all backdrop-blur-sm">
            Cek Komisi
          </Link>
        </div>
      </section>

      <section className="grid md:grid-cols-3 gap-8">
        <div className="bg-white p-6 md:p-8 rounded-2xl shadow-sm border border-zinc-100 text-center hover:shadow-md transition-shadow">
          <div className="bg-amber-100 w-16 h-16 mx-auto rounded-full flex items-center justify-center mb-6">
            <ShoppingBag className="text-amber-600" size={32} />
          </div>
          <h3 className="text-xl font-bold mb-3">Belanja di DigitalMeera</h3>
          <p className="text-zinc-600">Lakukan transaksi di toko kami dan tunjukkan QR Code member Anda.</p>
        </div>
        <div className="bg-white p-6 md:p-8 rounded-2xl shadow-sm border border-zinc-100 text-center hover:shadow-md transition-shadow">
          <div className="bg-amber-100 w-16 h-16 mx-auto rounded-full flex items-center justify-center mb-6">
            <QrCode className="text-amber-600" size={32} />
          </div>
          <h3 className="text-xl font-bold mb-3">Dapat Cashback</h3>
          <p className="text-zinc-600">Admin akan scan QR Code Anda dan cashback otomatis masuk ke saldo komisi.</p>
        </div>
        <div className="bg-white p-6 md:p-8 rounded-2xl shadow-sm border border-zinc-100 text-center hover:shadow-md transition-shadow">
          <div className="bg-amber-100 w-16 h-16 mx-auto rounded-full flex items-center justify-center mb-6">
            <DollarSign className="text-amber-600" size={32} />
          </div>
          <h3 className="text-xl font-bold mb-3">Cairkan Komisi</h3>
          <p className="text-zinc-600">Kumpulkan komisi Anda dan cairkan ke rekening bank atau e-wallet.</p>
        </div>
      </section>
    </div>
  );
}
