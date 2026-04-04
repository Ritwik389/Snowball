# Snowball

**Break Down Your Goals With AI. Stay Focused. Build Momentum.**

Transform task overwhelm into unstoppable progress with AI-powered task breakdown and gamified momentum tracking.

---

## 🎯 What is Snowball?

Snowball is built for people drowning in long task lists. When you have dozens of goals but can't bring yourself to start, Snowball helps you:

- **AI-Powered Task Breakdown**: Paste any large, overwhelming goal and let AI intelligently break it down into manageable micro-tasks
- **Single Task Focus**: The app shows you ONE task at a time—no distractions, no overwhelm. Just what matters now
- **Gamified Momentum System**: Complete tasks to build momentum, convert momentum into points, and unlock badges for long-term consistency
- **Smart Task Prioritization**: The app ranks tasks using urgency × importance + deadlines, so you always know what to work on next

---

## 🚀 Live Demo

Try Snowball now: **[https://snowball-peach.vercel.app/](https://snowball-peach.vercel.app/)**

---

## 📋 Getting Started

### Prerequisites

- **Node.js** (v18 or higher)
- **npm** or **yarn**

### Installation

1. **Clone the repository** (or navigate to the project folder)
   ```bash
   cd Snowball
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   - Copy the `.env.example` file to `.env.local`:
     ```bash
     cp .env.example .env.local
     ```
   - Open `.env.local` and fill in the required variables:
     ```
     MONGODB_URI=your_mongodb_connection_string
     UPSTASH_REDIS_REST_URL=your_redis_url
     UPSTASH_REDIS_REST_TOKEN=your_redis_token
     NEXTAUTH_URL=http://localhost:3000
     NEXTAUTH_SECRET=your_secret_key
     PORT=3000
     GROQ_API_KEY=your_groq_api_key
     ```

4. **Run the development server**
   ```bash
   npm run dev
   ```

5. **Open in browser**
   - Navigate to `http://localhost:3000`

---

## 🛠️ Tech Stack

- **Framework**: Next.js 16 with React 19
- **Authentication**: NextAuth.js with MongoDB Adapter
- **Database**: MongoDB
- **Caching**: Upstash Redis
- **AI**: Google Generative AI
- **Styling**: Tailwind CSS + DaisyUI
- **Animations**: Framer Motion
- **3D Graphics**: Three.js + Vanta

---

## 📸 Screenshots
<img width="1710" height="951" alt="image" src="https://github.com/user-attachments/assets/7b83509e-d3cb-42d9-b3c3-dc3850848af5" />

<img width="1710" height="950" alt="image" src="https://github.com/user-attachments/assets/d9006bce-806d-4573-b002-1fc445922bfe" />


---

## 📖 How It Works

### 1. Start With A Goal
Paste an overwhelming goal or project idea. The AI breaks it down into concrete, actionable micro-tasks.

### 2. Build Your Mission Queue
Every task gets:
- Importance score (1-10)
- Urgency score (1-10)
- Estimated time
- Deadline

### 3. Play For Momentum
- Complete tasks to build momentum
- Unlock badges as you earn points
- Watch your consistency compound over time

---

## 🎮 Key Features

### ✨ AI Task Generation
Upload your big goal and get an intelligent breakdown in seconds. No more analysis paralysis.

### 🎯 One Task At A Time
See only the highest-priority task based on urgency, importance, and available time. Clean. Focused. Clear.

### 🏆 Gamification System
- **Momentum**: Builds when you complete tasks
- **Points**: Earned when momentum bars fill up
- **Badges**: Unlocked as you accumulate points over time
- Skipping a task only drops momentum by 5—failure doesn't reset your streak

---

## 📝 Available Scripts

```bash
# Start development server
npm run dev

# Build for production
npm build

# Start production server
npm start

# Run linter
npm run lint
```

---

## 🤝 Need Help?

If you run into any issues:
1. Make sure all environment variables are set correctly in `.env.local`
2. Verify your MongoDB and Redis connections
3. Check that Node.js version is v18 or higher

---

**Ready to stop procrastinating and start building momentum?** [Get started now →](https://snowball-peach.vercel.app/)
