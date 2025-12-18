# Smart Study Planner 🎓

> **Plan smart. Study better. Stress less.**

**🔴 Live Demo:** [https://smart-study-planner-90246.web.app/](https://smart-study-planner-90246.web.app/)

[![Live Demo](https://img.shields.io/badge/Live-Demo-brightgreen)](https://smart-study-planner-90246.web.app/)
![React](https://img.shields.io/badge/React-18.3-blue?logo=react)
![TypeScript](https://img.shields.io/badge/TypeScript-5.6-blue?logo=typescript)
![Tailwind CSS](https://img.shields.io/badge/Tailwind-3.4-06B6D4?logo=tailwindcss)
![Firebase](https://img.shields.io/badge/Firebase-10.14-orange?logo=firebase)

An AI-powered study planning system that generates personalized timetables, reduces burnout, and automatically manages revision schedules.

## ✨ Features

- 🔐 **Secure Authentication** - Email/password and Google login
- 🧠 **AI Study Plan Generator** - Powered by Google Gemini
- 📅 **Day-wise Schedules** - Clear, structured study plans
- ⚖️ **Smart Allocation** - More time for difficult subjects
- 📝 **Automatic Revision** - Built-in revision days
- 💾 **Cloud Storage** - Save and access plans anytime
- 🎨 **Modern UI** - Beautiful dark theme with glassmorphism

## 🛠️ Tech Stack

| Layer | Technology |
|-------|------------|
| Frontend | React, TypeScript, Tailwind CSS |
| Backend | Cloudflare Workers |
| Database | Firebase Firestore |
| Auth | Firebase Authentication |
| AI | Google Gemini API |

## 🚀 Getting Started

### Prerequisites

- Node.js 18+
- Firebase project
- Cloudflare account
- Google Gemini API key

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/shrivastavaankit-2006/samrt-study-planner.git
   cd samrt-study-planner
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Configure environment**
   Create a `.env` file based on `.env.example`:
   ```bash
   cp .env.example .env
   ```
   Edit `.env` with your Firebase and Cloudflare Worker credentials.

4. **Start development server**
   ```bash
   npm run dev
   ```

### Cloudflare Worker Setup

The backend logic for AI generation is handled by a Cloudflare Worker to secure your API keys.

1. **Navigate to worker directory**
   ```bash
   cd cloudflare-worker
   npm install
   ```

2. **Set Gemini API key**
   ```bash
   npx wrangler secret put GEMINI_API_KEY
   ```

3. **Deploy worker**
   ```bash
   npm run deploy
   ```

4. **Update frontend environment**
   Update `VITE_API_URL` in your frontend `.env` with your deployed worker URL.

## 📁 Project Structure

```
smart-study-planner/
├── src/
│   ├── components/       # Reusable UI components
│   ├── contexts/         # React contexts (Auth)
│   ├── pages/            # Page components
│   ├── services/         # Firebase & API services
│   ├── types/            # TypeScript types
│   └── App.tsx           # Main app with routing
├── cloudflare-worker/    # Backend API proxy
│   └── src/index.ts      # Worker code
└── public/               # Static assets
```

## 🔐 Security

- ✅ API keys stored in Cloudflare Worker environment
- ✅ Firebase Auth protects user data
- ✅ Gemini API key never exposed to frontend

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 👤 Author

**Ankit Shrivastava**
- GitHub: [@shrivastavaankit-2006](https://github.com/shrivastavaankit-2006)

## 📄 License

This project is licensed under the MIT License.

---

Made with ❤️ for students everywhere
