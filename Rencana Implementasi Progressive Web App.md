# Rencana Implementasi Progressive Web App (PWA)

Dokumen ini berisi langkah-langkah yang diperlukan untuk mengubah aplikasi React + Vite Anda menjadi PWA yang dapat diinstal dan memiliki kemampuan offline dasar.

## Tahap 1: Konfigurasi Awal (Vite PWA Plugin)

Tujuan: Menginstal dan mengkonfigurasi plugin Vite yang akan menangani sebagian besar pekerjaan berat dalam pembuatan service worker dan manifest.

[ ] 1.1 Install Dependency: Tambahkan vite-plugin-pwa ke devDependencies di dalam frontend-web/package.json.
[ ] 1.2 Perbarui vite.config.ts: Impor plugin dan tambahkan ke dalam daftar plugins. Di sini kita akan mendefinisikan nama aplikasi, warna tema, dan ikon.
[ ] 1.3 Perbarui tsconfig.node.json: Tambahkan "vite-plugin-pwa/client" ke compiler options untuk memastikan TypeScript mengenali tipe data dari plugin.

## Tahap 2: Aset & Metadata Aplikasi

Tujuan: Menyiapkan semua aset visual dan metadata yang dibutuhkan agar aplikasi terlihat profesional saat diinstal di perangkat pengguna.

[ ] 2.1 Siapkan Ikon Aplikasi: Buat atau siapkan satu set ikon aplikasi dalam berbagai ukuran (misalnya, 192x192, 512x512). Ikon-ikon ini akan ditempatkan di dalam folder frontend-web/public/icons/.
[ ] 2.2 Buat File manifest.json: Buat file web app manifest di dalam frontend-web/public/. File ini akan berisi nama aplikasi, nama pendek, deskripsi, warna, dan link ke ikon-ikon yang sudah disiapkan.
[ ] 2.3 Tambahkan Link Manifest ke index.html: Tambahkan tag <link rel="manifest" ...> dan tag meta untuk tema di dalam <head> pada file frontend-web/index.html.

## Tahap 3: Implementasi Service Worker & UX

Tujuan: Mengaktifkan service worker untuk caching dan memberikan pengalaman pengguna yang baik saat ada pembaruan.

[ ] 3.1 Buat Komponen Notifikasi Pembaruan: Buat komponen React baru (UpdateNotification.tsx) yang akan muncul sebagai toast atau notifikasi ketika versi baru dari aplikasi tersedia, memberikan tombol bagi pengguna untuk me-reload.
[ ] 3.2 Integrasikan Komponen Notifikasi: Tambahkan komponen UpdateNotification ke dalam App.tsx agar bisa muncul di seluruh bagian aplikasi.

## Tahap 4: Pengujian & Verifikasi

Tujuan: Memastikan semua fitur PWA berjalan sebagaimana mestinya.

[ ] 4.1 Verifikasi di Browser (Lighthouse): Jalankan aplikasi setelah di-build (npm run build dan npm run preview), lalu gunakan tab Lighthouse di Chrome DevTools untuk memverifikasi bahwa aplikasi Anda terdeteksi sebagai PWA.
[ ] 4.2 Uji "Add to Home Screen": Coba instal aplikasi ke desktop atau ponsel Anda dari browser.
[ ] 4.3 Uji Fungsionalitas Offline: Matikan koneksi internet dan coba buka kembali aplikasi. Aplikasi seharusnya masih bisa dimuat (meskipun mungkin tanpa data dinamis).
