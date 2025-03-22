# 💪 Meus Desafios

**Meus Desafios** is a SaaS platform designed to help people develop habits and overcome challenges related to productivity, health, and finance.  
Users can join projects, track their progress, and follow motivational leaderboards.

> 🚧 Work in progress — MVP version on the way!

---

## 🚀 Purpose

Build a web and mobile application that allows:
- Participation in challenges with daily/weekly/monthly goals
- Progress tracking
- Leaderboards among participants
- Active community focused on personal growth

---

## 🧰 Tech Stack

- **Next.js** – React framework with modern routing and App Directory support
- **Tailwind CSS** – Utility-first CSS framework
- **Prisma + PostgreSQL** – ORM and relational database
- **Bun** – Fast JavaScript runtime and package manager
- **NextAuth.js** – Authentication with social providers
- **Stripe** – Payment processing (planned)
- **shadcn/ui** – Reusable UI components
- **Zustand** – Simple and scalable global state management
- **Turborepo** – Monorepo support for multiple apps and packages

---

## 📦 Monorepo Structure

```
apps/
  └─ web         → Main Next.js application
packages/
  └─ ui          → Reusable UI components
  └─ db          → Database schemas and utilities
  └─ auth        → Authentication logic
  └─ email       → Email templates and utilities
```

---

## 🛠️ Getting Started

### Prerequisites

- [Bun](https://bun.sh/)
- [Node.js](https://nodejs.org/)
- [Git](https://git-scm.com/)
- [PostgreSQL](https://www.postgresql.org/)

### macOS Setup

```bash
/bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"
brew install git
brew install oven-sh/bun/bun
brew install nvm
```

### Project Setup

```bash
# Clone the repository
git clone https://github.com/psneves/br-com-meusdesafios.git
cd br-com-meusdesafios

# Copy environment variables
cp .env.example .env.local

# add dotenv-cli
bun add -D dotenv-cli

# Run docker compose for starting Postgress locally
docker compose up -d

# Initialize the database (configure .env first)
bun db:push

# Start the development server
bun run dev:web
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## 🧪 MVP Roadmap

- [ ] Auth (Sign up / Sign in)
- [ ] Challenge listing
- [ ] Challenge enrollment and progress tracking
- [ ] Leaderboards
- [ ] User profile page
- [ ] Mobile version (Expo)

---

## 📃 License

This project is licensed under the MIT License. See the [LICENSE](./LICENSE) file for more details.

---

## 🙏 Credits & Inspiration

This project is based on the open source boilerplate **Saasfly**, with inspiration from:
- [Taxonomy (shadcn-ui)](https://github.com/shadcn-ui/taxonomy)
- [create-t3-turbo](https://github.com/t3-oss/create-t3-turbo)