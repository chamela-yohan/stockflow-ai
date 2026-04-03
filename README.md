# ☕ StockFlow AI: Predictive Inventory Management

> **"From a rainy evening brainstorm to a production-ready AI Agent."** ⛈️

StockFlow AI is a high-performance, full-stack inventory management system built to explore the boundaries of **Next.js 16**, **React 19**, and **AI Tool-Calling**. Developed by a software engineering lecturer transitioning into industry-ready AI roles, this project bridges the gap between academic theory and production-grade engineering.

---

## 🌟 The Inspiration

While enjoying a coffee during a rainy evening in Sri Lanka, I began thinking about how small businesses struggle with "Out of Stock" surprises. I decided to build a system that doesn't just record data but **predicts the future** using data science principles and a custom "Coffee & Cream" aesthetic.

---

## 🚀 Key Features

* **🤖 AI Inventory Agent**
  Integrated with **OpenRouter**, the agent uses native tool-calling to query the database and provide real-time answers about stock levels.

* **📈 Predictive Burn Rate**
  A custom-built forecasting engine that analyzes 30-day sales trends to predict the exact date a product will run out.

* **🔐 Role-Based Access (RBAC)**
  Secured with **Clerk**, providing a clear separation between:

  * **Admin** → AI Insights + Analytics
  * **Staff** → Basic Inventory Views

* **🎨 Premium UI**
  A custom earth-tone palette built with **Tailwind CSS v4** and **Lucide React** for a modern, professional user experience.

---

## 🛠️ The Tech Stack

* **Framework**: Next.js 16.2 (App Router) & React 19 (Server Components)
* **Language**: TypeScript
* **Database**: PostgreSQL with Prisma 7 ORM
* **AI Engine**: OpenRouter SDK (Model-agnostic architecture)
* **Authentication**: Clerk Auth
* **Icons**: Lucide React

---

## 📊 The Math Behind the Prediction

The system implements a **Linear Burn Rate algorithm** to provide inventory intelligence:

```math
Average_Daily_Sales = (Σ Sales_Quantity_i over 30 days) / 30
```

```math
Days_Until_Empty = Current_Stock / Average_Daily_Sales
```

---

## ⚙️ Setup & Installation

### 1. Clone the Repository

```bash
git clone https://github.com/your-username/stockflow-ai.git
cd stockflow-ai
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Environment Variables

Create a `.env` file and add your credentials:

* PostgreSQL Database URL
* Clerk Authentication Keys
* OpenRouter API Key

---

### 4. Database Setup

```bash
npx prisma migrate dev --name init
npx prisma db seed
```

---

### 5. Run Development Server

```bash
npm run dev
```

---

## 👨‍🏫 About the Author

**Chamela Yohan**
Lecturer & Software Engineer with a Bachelor's degree in Software Engineering from NIC University. Based in Sri Lanka, currently transitioning into AI Engineering and Data Science—building systems that solve real-world problems through a deep, from-scratch approach.

---

## 🚀 Future Roadmap

* [ ] Smart Reordering
  → Automated email drafts to suppliers when stock is predicted to be low

* [ ] Peak Hours Heatmap
  → Visualizing sales spikes using Recharts

* [ ] Mobile App
  → A React Native companion for warehouse scanning

---

## 🤝 Let's Connect

Interested in collaborating or hiring?
Feel free to connect on LinkedIn!
