# 🚀 Workflow Manager-useFlow()

A desktop productivity app built with **Electron.js** that helps you manage workspaces, launch tools efficiently, and stay focused by blocking distracting applications.

---

## ✨ Features

- **Workspace Manager** – Create and switch between different workspaces, each with its own set of apps, scripts, and workflows.  
- **App Blocker** – Temporarily block distracting apps (e.g., browsers, games, social media apps) while you work.    
- **Persistent Storage** – User data (workspaces, blocked apps) is saved locally in JSON for easy persistence.  

---

## 🛠️ Tech Stack

- [Electron.js](https://www.electronjs.org/) – Desktop app framework  
- [React](https://react.dev/) – UI rendering  
- [TailwindCSS](https://tailwindcss.com/) – Styling  
- [Node.js](https://nodejs.org/) – Backend logic & APIs  
- [DaisyUI](https://daisyui.com/) – UI components 

---

## 📸 Screenshots

### Home Screen  
![Home Screen](https://github.com/akshW88/Exam-Bud/blob/e9a4719439f091fcf2826992f164f2a0c0a84cde/Screenshot1.png)

### Main Page  
![Main Page](https://github.com/akshW88/Exam-Bud/blob/e9a4719439f091fcf2826992f164f2a0c0a84cde/Screenshot2.png)

---

## ⚠️ Known Issues

1. Does not fully support Windows.  
2. Has issues on machines running **nvm**.

---

## 🚀 Getting Started

1. Clone the repo:

```bash
git clone https://github.com/your-username/workflow-manager.git
cd workflow-manager
```

2. Install dependencies:

```bash
npm install
```

3. Start the App Blocker service

```bash
sudo systemctl start app-blocker.service
```

4. Run the app

```bash
npm start
```