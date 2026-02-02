# 🚀 Aerostic - WhatsApp Marketing SaaS

**Aerostic** is a production-ready, multi-tenant SaaS platform for WhatsApp Marketing & Automation. It is built to scale, featuring Meta Embedded Signup, AI-powered responses, and a complete CRM dashboard.

---

## 🌟 Key Features

*   **Multi-tenant Architecture**: Isolated workspaces for every user.
*   **Official Meta Integration**: Supports both **Cloud API** (New Numbers) and **Embedded Signup** (Existing Business Numbers).
*   **Smart AI Agents**: Google Gemini-powered chatbots with automated handoff to human agents.
*   **Campaign Manager**: Bulk broadcasting with template message support.
*   **Team Inbox**: Real-time shared inbox for support agents.
*   **Role-Based Access**: Super Admin, Workspace Admin, and Agent roles.

---

## 🛠️ Technology Stack

*   **Frontend**: Next.js 14, Tailwind CSS, ShadCN UI
*   **Backend**: NestJS (Node.js), TypeORM
*   **Database**: PostgreSQL
*   **Queue/Cache**: Redis
*   **Infrastructure**: Docker, Docker Compose, Nginx

---

## ☁️ Deployment Guide (AWS)

This project is optimized for deployment on **AWS EC2** (Amazon Linux 2023 or Ubuntu).

### 1-Click Deployment
We provide a helper script to automate the entire setup:

1.  **Launch an EC2 Instance** (t3.small or larger recommended).
2.  **Configure Security Group**: Allow Inbound on Ports `80` (HTTP), `443` (HTTPS), and `22` (SSH).
3.  **Run the Auto-Deploy Script**:
    ```bash
    curl -o deploy_aws.sh https://raw.githubusercontent.com/itsmodassir/aerostic-whatsapp-automation/main/deploy_aws.sh
    chmod +x deploy_aws.sh
    ./deploy_aws.sh
    ```
4.  **Access Your App**:
    *   **Landing Page**: `https://aerostic.com`
    *   **User Dashboard**: `https://app.aerostic.com`
    *   **Platform Admin**: `https://admin.aerostic.com`
    *   **Backend API**: `https://api.aerostic.com/api/` (Internal path: `/api/`)

---

## 📂 Documentation

For deep technical details, please refer to the `docs/` folder:

*   **[📘 System Blueprint](docs/BLUEPRINT.md)**: Full architecture, API design, and data flows.
*   **[📋 Implementation Plan](docs/implementation_plan.md)**: Development roadmap and status.
*   **[✅ Production Checklist](docs/production_checklist.md)**: Security and launch verification steps.

---

## 💻 Local Development

1.  **Clone the Repo**:
    ```bash
    git clone https://github.com/itsmodassir/aerostic-whatsapp-automation.git
    cd aerostic
    ```

2.  **Start Services**:
    ```bash
    ./start.sh
    ```

3.  **Access Locally**:
    *   Frontend (Landing): `http://localhost:3000`
    *   App Dashboard: `http://localhost:3000/dashboard`
    *   Platform Admin: `http://localhost:3000/admin`
    *   Backend: `http://localhost:3001`

    > [!NOTE]
    > In production, these are served via strict subdomains (`app.`, `admin.`, and the root domain).

---

## 🌍 Going Public & Community

If you plan to make this repository **Public** on GitHub, please follow this checklist to ensure security and community readiness:

### 🔒 Security Checklist (Before Public Release)
1.  **Audit Secrets**: Ensure no real API keys, passwords, or `.env` files are committed.
    *   Check `git log` history for accidental commits of secrets.
    *   Use `bfg-repo-cleaner` if you need to scrub history.
2.  **Environment Variables**:
    *   Keep `.env` in `.gitignore` (Already configured).
    *   Provide a `.env.example` with dummy values for users to copy.
3.  **ConfigFile Audit**: Check `config/` or `src/` for any hardcoded tokens.

### 📢 How to Make It Public
1.  Go to **Settings** > **General**.
2.  Scroll to the **Danger Zone** at the bottom.
3.  Click **Change repository visibility**.
4.  Select **Make public** and confirm.

### 💬 Enabling GitHub Discussions
To build a community around Aerostic:
1.  Go to **Settings** > **General**.
2.  Under **Features**, check the box for **Discussions**.
3.  Click **Set up discussions** to create initial categories (General, Ideas, Q&A).

### 🤝 Contributing
We welcome contributions! Please see [CONTRIBUTING.md](CONTRIBUTING.md) (coming soon) for details on how to submit Pull Requests, report bugs, and suggest features.

---

## 📜 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.
