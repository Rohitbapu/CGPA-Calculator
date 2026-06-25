# 🎓 Academic Tracker (Semester 2 & Cumulative CGPA)

A beautiful, responsive, professional GPA & CGPA tracker crafted specifically for Semester 2 curriculum mapping. Features custom name personalization, persistent local storage, printing support, and dynamic credit-weighting calculation.

**Created by Rohit Bapu S B**

---

## 🚀 How to Run Locally

To run this app on your local computer, make sure you have [Node.js](https://nodejs.org/) installed, then follow these steps:

1. **Extract/Navigate** into this directory:
   ```bash
   cd deploy
   ```

2. **Install the dependencies**:
   ```bash
   npm install
   ```

3. **Start the development server**:
   ```bash
   npm run dev
   ```
   Open your browser and navigate to the local link printed in your terminal (usually `http://localhost:5173`).

4. **Build for Production**:
   ```bash
   npm run build
   ```
   This creates a optimized production-ready bundle in the `dist` directory.

---

## 🌐 How to Deploy to GitHub Pages (Fastest & 100% Free)

Deploying a Vite + React application to GitHub Pages is extremely straightforward. Here is how you can host this app so anyone can access it:

### Option A: The automated way (Recommended)
1. Initialize a Git repository inside this directory:
   ```bash
   git init
   git add .
   git commit -m "Initialize Academic Tracker"
   ```
2. Create a new repository on [GitHub](https://github.com/).
3. Link your local repo to GitHub and push your code:
   ```bash
   git remote add origin https://github.com/YOUR_USERNAME/YOUR_REPO_NAME.git
   git branch -M main
   git push -u origin main
   ```
4. Install the GitHub Pages deployment package:
   ```bash
   npm install --save-dev gh-pages
   ```
5. Open your `package.json` in this folder and make the following small adjustments:
   * Add a `"homepage"` field at the top level:
     ```json
     "homepage": "https://YOUR_USERNAME.github.io/YOUR_REPO_NAME",
     ```
   * Add these two scripts under `"scripts"`:
     ```json
     "predeploy": "npm run build",
     "deploy": "gh-pages -d dist"
     ```
6. Run the deployment script:
   ```bash
   npm run deploy
   ```
   *Your app will be live at `https://YOUR_USERNAME.github.io/YOUR_REPO_NAME/` in a few minutes!*

---

## ☁️ Deploying to Other Platforms (Vercel / Netlify)

This project has been fully configured with relative paths (`base: "./"` in `vite.config.ts`) which means it is **100% compatible** with one-click cloud hosting providers:

### ⚡ Vercel / Netlify
1. Log in to [Vercel](https://vercel.com/) or [Netlify](https://www.netlify.com/).
2. Connect your GitHub repository.
3. Select this folder (`deploy`) as the root.
4. Set the build commands:
   * **Build Command**: `npm run build`
   * **Output Directory**: `dist`
5. Click **Deploy**. Your app will instantly receive a custom secure URL.

---

## 🐍 Note on Streamlit
Streamlit is a framework primarily optimized for hosting Python applications. Because this app is built with modern high-performance React and Vite, the best, fastest, and most optimized platforms to host it are **GitHub Pages, Vercel, Netlify, or Cloudflare Pages**. 

If you absolutely must run it inside a Python stream, you can serve the static build folder (`dist/`) using Python's built-in HTTP server or a lightweight Flask/FastAPI backend wrapper.
