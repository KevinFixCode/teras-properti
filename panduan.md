# Teras (Pekanbaru, Padang, Malang)

Website properti statis berbahasa Indonesia dengan identitas Teras. Dapat diterbitkan langsung di Netlify tanpa proses build.

## Konten properti

Daftar kota dan katalog ada di `data.js` (bukan `app.js`). Saat ini berisi 22 listing contoh: Pekanbaru 8, Padang 7, dan Malang 7. Seluruh nama, harga, spesifikasi, dan legalitas merupakan ilustrasi. Ganti dengan data terkonfirmasi sebelum digunakan untuk pemasaran. Foto dalam `assets/` berasal dari Unsplash dan merupakan ilustrasi arsitektur, bukan dokumentasi properti di kota mana pun. Gunakan foto milik sendiri untuk listing aktual.

Setiap properti memiliki ID unik, judul, area, tipe, status jual/sewa, harga, foto, galeri, spesifikasi, deskripsi, dan fasilitas. Tautan `/?properti=ID` membuka detail properti yang sesuai. Tambahkan pilihan area pada formulir pencarian bila katalog diperluas.

## Konsultasi dan titip jual

Formulir konsultasi dan permintaan titip jual menggunakan Netlify Forms dengan nama `konsultasi-properti`. Formulir mencatat kontak, kebutuhan, pesan, persetujuan, dan ID properti jika dibuka dari listing. Formulir memakai validasi, honeypot, serta tampilan berhasil dan gagal. Tidak ada nomor telepon atau alamat kantor palsu yang digunakan.

Untuk melihat permintaan masuk, buka Manage dan cari 'Forms'. Notifikasi email dapat dikonfigurasi sesuai kebutuhan pengelola.

## Simulasi KPR

Kalkulator menggunakan metode anuitas. Bunga dianggap tetap sepanjang tenor. Simulasi belum termasuk pajak, asuransi, provisi, biaya bank, dan notaris. Contoh awal menggunakan harga Rp 650 juta, uang muka 20%, bunga 7% per tahun, dan tenor 20 tahun.

## Identitas dan domain

Nama, narasi, dan footer berada di `index.html`; tampilan di `styles.css`; interaksi di `app.js`. Logo dan favicon merupakan SVG. Teras adalah identitas contoh independen dan tidak berafiliasi dengan Brighton.

Saat memakai domain khusus, sesuaikan canonical, metadata Open Graph, `robots.txt`, dan `sitemap.xml`. Halaman Malang lama diarahkan ke beranda melalui `_redirects`.

## Menambah kota baru

1. Buka `data.js`. Di bagian `cities`, tambahkan satu blok baru, misalnya `surabaya:{name:'Surabaya',province:'Jawa Timur',areas:[...]}` dengan 4-5 kawasan.
2. Isi listing di `properties` dengan `city:'surabaya'` dan `area` yang sama persis dengan nama kawasan.
3. Tambahkan `<option value="surabaya">Surabaya</option>` pada pilihan Kota (`id="city"`) di `index.html`, juga pada formulir noscript.
4. Tautan per kota: `/?kota=padang`, `/?kota=malang`. Formulir konsultasi mencatat kolom `kota`.
