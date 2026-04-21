# ⛳ GolfGives

A full-stack web application where golfers can submit scores, enter monthly prize draws, and support charities through a subscription model.

---

## 🚀 Live Demo
https://golf-platform-seven-ecru.vercel.app/

---

## 📌 Features

- 🔐 User Authentication (Signup/Login)
- 📊 Dashboard with real-time data
- ⛳ Score submission (Stableford system)
- 🔄 Rolling 5-score logic (latest scores only)
- 🎰 Monthly draw system (unique random numbers)
- 🏆 Winner detection and prize allocation
- ❤️ Charity selection and contribution tracking
- ⚙️ Admin panel (manage users, draws, winners)
- 🌐 Fully deployed application

---

## 🧠 Tech Stack

- Frontend: Next.js, Tailwind CSS
- Backend: Supabase (Auth + Database)
- Deployment: Vercel

---

## ⚙️ System Design

- Users → Authentication via Supabase
- Scores → Stored per user (max 5 latest)
- Draws → Generated monthly with random numbers
- Winners → Matched based on score vs draw numbers
- Admin → Controls system operations

---

## 📊 Key Logic

### 🎯 Score System
- Users can submit golf scores (1–45)
- Only latest 5 scores are stored
- Oldest scores are automatically removed

### 🎰 Draw System
- Generates 5 unique random numbers
- Matches against user scores
- Assigns prize tiers:
  - 🥇 Jackpot
  - 🥈 Second Prize
  - 🥉 Third Prize

### ❤️ Charity Contribution
- Monthly: £9.99 → 10% donated
- Yearly: £95.99 → calculated monthly contribution

---

## 🧪 Testing Checklist

- ✅ Signup & Login
- ✅ Score entry and validation
- ✅ Rolling score logic
- ✅ Draw generation
- ✅ Winner detection
- ✅ Admin controls
- ✅ Data consistency
- ✅ Responsive UI

---

## 📈 Future Improvements

- Stripe payment integration
- Email notifications
- Leaderboard system
- Advanced analytics dashboard

---

## 👨‍💻 Author

**Sathyaseelan G**
- BE CSE Student
- Full Stack Developer (Learning Phase)

---

## 📌 Note

This project demonstrates full-stack development, real-time database interaction, and system design thinking.
