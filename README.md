# Curator — Furniture Curation App

A React app for curating and presenting furniture moodboards.

---

## First-time setup (do this once)

### 1. Install Node.js
Download and install from https://nodejs.org (choose the LTS version)

### 2. Install dependencies
Open Terminal (Mac) or Command Prompt (Windows), navigate to this folder, and run:
```
npm install
```

### 3. Run locally
```
npm start
```
This opens the app at http://localhost:3000 in your browser.

---

## Push to GitHub

### 1. Create a GitHub account
Go to https://github.com and sign up (free)

### 2. Create a new repository
- Click the **+** button → New repository
- Name it `curator-app`
- Keep it Public
- Do NOT initialise with README (you already have one)
- Click **Create repository**

### 3. Push your code
In Terminal, inside this folder run these commands one by one:
```
git init
git add .
git commit -m "first commit"
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/curator-app.git
git push -u origin main
```
Replace `YOUR_USERNAME` with your GitHub username.

---

## Deploy as a live website (GitHub Pages)

This gives you a shareable link you can send to clients.

### 1. Update package.json homepage
Open `package.json` and change the homepage line to:
```
"homepage": "https://YOUR_USERNAME.github.io/curator-app"
```

### 2. Deploy
```
npm run deploy
```

### 3. Enable GitHub Pages
- Go to your repo on GitHub
- Click **Settings** → **Pages**
- Under Source, select branch: `gh-pages`, folder: `/ (root)`
- Click Save

Your app will be live at:
**https://YOUR_USERNAME.github.io/curator-app**

It may take 2–3 minutes to go live the first time.

---

## Adding new furniture to the database

Open `src/data/furniture.js` and add a new object to the array following the same format as existing items. The app will automatically include it.

---

## Folder structure

```
curator-app/
├── public/
│   └── index.html
├── src/
│   ├── data/
│   │   └── furniture.js      ← your furniture database
│   ├── components/
│   │   ├── Database.js       ← database browser with search + filters
│   │   └── Moodboard.js      ← moodboard presentation tool
│   ├── App.js
│   ├── App.css
│   └── index.js
├── package.json
└── README.md
```
