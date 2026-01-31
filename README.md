# 🎮 Game Kata (Multiplayer Word Race)

![Status](https://img.shields.io/badge/Status-Active-success)
![Tech](https://img.shields.io/badge/Stack-MERN%20%2B%20Socket.IO-blue)

**Game Kata** adalah permainan tebak kata multiplayer real-time yang kompetitif. Dua pemain beradu cepat untuk menemukan kata yang valid berdasarkan **Huruf Awal** dan **Huruf Akhir** yang ditentukan secara acak oleh para pemain itu sendiri.

Validasi kata dilakukan secara cerdas menggunakan **AI (Groq/Llama)**, sehingga sistem bisa memahami kata-kata dalam Bahasa Indonesia maupun Inggris (tergantung prompt).

🔗 **Live Demo:** [kata.anugrahbimantara.my.id](https://kata.anugrahbimantara.my.id)

---

## ✨ Fitur Utama

- **⚔️ Real-time Multiplayer:** Koneksi instan antar pemain menggunakan Socket.IO.
- **🤖 Validasi AI:** Menggunakan Groq AI untuk memvalidasi apakah kata tersebut nyata dan sesuai konteks.
- **🏆 Sistem Skor & Win Streak:**
    - Menang ronde = +1 Poin.
    - **Win Streak (🔥):** Menang 3x berturut-turut memberikan bonus poin.
- **⏭️ Continuous Play:** Permainan tidak putus; bisa lanjut ronde berikutnya tanpa reset skor ("Next Round").
- **🏳️ Skip / Give Up:** Fitur menyerah mutual jika kedua pemain buntu.
- **📱 Responsif:** Tampilan UI yang optimal di Desktop maupun Mobile.
- **🔒 Blind Pick:** Pilihan huruf lawan disembunyikan sampai kedua pemain selesai memilih.

---

## 🛠️ Teknologi yang Digunakan

- **Frontend:** React, Vite, Tailwind CSS, Framer Motion (untuk animasi).
- **Backend:** Node.js, Express.
- **Real-time:** Socket.IO.
- **AI Integration:** Groq SDK (gpt-oss-120b model).

---

## 🕹️ Cara Main

1.  **Join Room:** Masukkan nama dan masuk ke Lobby. Pilih room yang tersedia atau buat room baru.
2.  **Picking Phase (Fase Memilih):**
    - **Pemain 1** memilih **Huruf Awal** (Start Letter).
    - **Pemain 2** memilih **Huruf Akhir** (End Letter).
    - Pilihan bersifat *Blind Pick* (rahasia) sampai keduanya selesai memilih.
3.  **Playing Phase (Tebak Kata):**
    - Setelah kedua huruf terbuka (misal: **A ... K**), lomba dimulai!
    - Ketik kata yang berawalan **A** dan berakhiran **K** (contoh: "ANAK", "ADIK", "ABSTRAK").
    - Tekan ✈️ (Kirim) untuk menebak.
4.  **Menang/Kalah:**
    - Pemain tercepat dengan kata yang valid menurut AI akan menang.
    - Poin dan Streak akan bertambah.
    - Klik **"Next Round ➡️"** untuk lanjut ke ronde berikutnya dengan peran pemilih huruf yang ditukar.

---

## 🚀 Cara Instalasi & Setup (Local)

Ikuti langkah ini untuk menjalankan game di komputer Anda sendiri.

### Prasyarat
- Node.js (v18 atau lebih baru)
- NPM

### 1. Clone Repository
```bash
git clone https://github.com/bimantaraz/game-kata.git
cd game-kata
```

### 2. Setup Backend (Server)
```bash
cd server
npm install
```

Buat file `.env` di dalam folder `server/` dan isi konfigurasi berikut:
```env
PORT=3001
# Dapatkan API Key gratis di https://console.groq.com/
GROQ_API_KEY=gsk_your_api_key_here
```

Jalankan server:
```bash
npm start
```
*Server akan berjalan di http://localhost:3001*

### 3. Setup Frontend (Client)
Buka terminal baru untuk frontend.

```bash
cd client
npm install
```

Buat file `.env` di dalam folder `client/` (opsional jika default localhost):
```env
VITE_SERVER_URL=http://localhost:3001
```

Jalankan client:
```bash
npm run dev
```
*Buka browser di http://localhost:5173*

---

## 📂 Struktur Folder

```
game-kata/
├── client/           # Frontend React Application
│   ├── src/
│   │   ├── components/  # GameRoom.jsx, Lobby.jsx
│   │   └── ...
│   └── ...
├── server/           # Backend Node.js Server
│   ├── server.js     # Main Socket.IO Logic
│   ├── groq.js       # AI Validation Logic
│   └── ...
└── README.md         # Dokumentasi ini
```

---

Created by **Anugrah Bimantara**.
