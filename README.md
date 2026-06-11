# Your-Friend (Y-Friend)

Aplikasi web pendukung kesehatan mental dan produktivitas belajar. Y-Friend membantu pengguna mengenali suasana hati, memulai sesi belajar dengan fokus, dan menemukan ketenangan melalui musik.

---

## Fitur Utama

### Landing Page
Halaman utama berisi pengenalan aplikasi, hero section, serta navigasi ke seluruh fitur. Navbar dilengkapi dengan toggle menu mobile dan pemilih bahasa (Indonesia / English).

### T-Mood — Pelacak Suasana Hati
Mencatat mood harian melalui 7 karakter emosi:
| Karakter | Warna |
|----------|-------|
| Senang   | Kuning `#FFB703` |
| Sedih    | Biru `#5B8DD9` |
| Marah    | Merah `#E05A5A` |
| Cemas    | Ungu `#9234F5` |
| Malas    | Hijau `#4CAF8A` |
| Normal   | Pink `#F9A8D4` |
| Iri      | Hijau Tua `#0DB257` |

- Pencatatan mood dilakukan 3 kali sehari: **Pagi, Siang, Malam**
- Kartu mood bisa discroll secara horizontal dengan drag & klik
- Mood beserta catatan alasan disimpan ke **localStorage**
- Menampilkan alert kustom ketika semua slot hari ini sudah terisi

### Result Mood — Analisis Harian
- Visualisasi "gelas berisi cairan" yang terisi bertahap (1/3, 2/3, penuh) sesuai jumlah mood yang dicatat
- Animasi gelombang (wave) SVG di atas cairan
- Timeline card untuk setiap sesi (pagi / siang / malam) beserta mood dan catatannya
- Karakter bergerak posisinya mengikuti level cairan

### Mulai Belajar — Timer Fokus
- Timer hitung mundur yang dapat dikonfigurasi (jam, menit, detik)
- Digit bisa diklik langsung untuk diedit secara inline
- Tombol naik/turun untuk penyesuaian waktu
- **Break Modal** — muncul otomatis saat sesi berjalan, berisi aktivitas pendukung:
  - Olah Napas
  - Peregangan
  - Minum Air Putih
- Modal break ditampilkan dengan akordeon interaktif
- Notifikasi suara (chime) menggunakan **Web Audio API** saat timer selesai
- Overlay animasi "Selesai!" muncul di atas timer card

### Suasana Tenang — Pemutar Musik
- Pemutar audio dengan daftar lagu/suara alam
- Player bar bawah muncul saat musik diputar (sliding animation)
- Kontrol: play/pause, progress bar seekable, pengatur volume + mute/unmute
- **Sleep Timer** — matikan musik otomatis setelah durasi tertentu (dengan fade out halus)
- Tampilan cover lagu berubah sesuai track yang dipilih

### Login & Register
- Autentikasi sederhana berbasis **localStorage** (token & nama pengguna)
- Tombol show/hide password
- Enter key trigger login
- Semua halaman utama dilindungi — redirect ke login jika belum masuk

---

## Struktur Proyek

```
Your-Friend/
├── index.html                  # Landing page
├── pages/
│   ├── login.html
│   ├── register.html
│   ├── t-mood.html
│   ├── result-mood.html
│   ├── mulai-belajar.html
│   └── suasana-tenang.html
├── assets/
│   ├── CSS/
│   │   ├── input.css           # Source Tailwind CSS
│   │   ├── output.css          # CSS yang di-generate (jangan diedit manual)
│   │   ├── global.css          # Font kustom & gaya global
│   │   ├── mulai-belajar.css   # Gaya khusus halaman timer
│   │   └── suasana-tenang.css  # Gaya khusus pemutar musik
│   ├── JS/
│   │   ├── navbar.js           # Toggle menu & gerbang akses login
│   │   ├── login.js            # Autentikasi & toggle password
│   │   ├── t-mood.js           # Logika pemilihan & penyimpanan mood
│   │   ├── result-mood.js      # Render visualisasi hasil mood
│   │   ├── mulai-belajar.js    # Timer, break modal, Web Audio API
│   │   └── suasana-tenang.js   # Pemutar audio, sleep timer, volume
│   ├── images/
│   │   ├── character/          # 7 karakter emosi (PNG)
│   │   ├── landing/            # Gambar hero, CTA, dsb.
│   │   ├── login/              # Ilustrasi halaman login
│   │   ├── mulai-belajar/      # Background & ilustrasi aktivitas
│   │   └── suasana-tenang/     # Cover musik & banner
│   └── fonts/
│       ├── TitanOne-Regular.ttf
│       └── Tirra-Regular.ttf
└── package.json
```

---

## Teknologi

| Teknologi | Keterangan |
|-----------|-----------|
| HTML5 | Struktur markup semua halaman |
| CSS3 + Tailwind CSS v4 | Styling utility-first |
| Vanilla JavaScript | Logika interaktif tanpa framework |
| [Lucide Icons](https://lucide.dev/) | Ikon UI modern |
| Font Awesome 6 | Ikon tambahan (musik, timer, dll.) |
| Web Audio API | Notifikasi suara native saat timer selesai |
| localStorage | Penyimpanan data mood & autentikasi |

---

## Cara Menjalankan

### Prasyarat
- Node.js dan npm

### Instalasi

```bash
npm install
```

### Build CSS

```bash
# Build sekali (minified, untuk production)
npm run build:css

# Watch mode (otomatis rebuild saat file berubah)
npm run watch:css
```

> **Catatan:** Selalu jalankan `watch:css` atau `build:css` setelah mengubah class Tailwind di file HTML/CSS, karena `output.css` di-generate dari `input.css`.

### Buka di Browser

Buka `index.html` langsung di browser, atau gunakan ekstensi **Live Server** di VS Code untuk hot-reload.

---

## Alur Penggunaan

```
Landing Page
    └─► Login / Register
            └─► T-Mood (pilih & catat mood)
                    └─► Result Mood (lihat analisis harian)

Landing Page
    └─► Mulai Belajar (atur & jalankan timer belajar)
    └─► Suasana Tenang (putar musik fokus)
```

---

## Catatan Pengembangan

- Data mood disimpan di `localStorage` dengan key `"history"` — belum terhubung ke backend/database.
- Autentikasi saat ini bersifat simulasi (token disimpan di localStorage), bukan sistem autentikasi nyata.
- File `output.css` sudah ter-generate dan di-commit — tidak perlu build ulang hanya untuk membuka aplikasi.
