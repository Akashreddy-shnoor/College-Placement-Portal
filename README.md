# Campus Placement Portal (Landing Page)

This is the landing page for an AI-powered Campus Placement Portal. It's built using React 19, Vite, and React Router.

Right now, only the landing page is implemented. The dashboard layouts are set up in the CSS, but the dashboard views themselves aren't active yet.

## What's Built So Far

* **Header**: Main navigation links (Home, Features, About Us, How It Works, Contact) with Login and Register buttons.
* **Hero Section**: Big intro banner explaining what the platform does, with quick links and trust badges highlighting key features (ATS scoring, candidate ranking).
* **Features**: Displays three main services (Resume Upload, ATS scoring feedback, candidate ranking).
* **How It Works Timeline**: Steps for students from uploading their resume to getting hired.
* **Stats Banner**: Key metrics like number of registered students, recruiters, and placement rate.
* **Footer**: Quick links, categories (For Students, For Recruiters), support resources, and social links.

## Tech Stack

* **React 19**
* **Vite**
* **React Router DOM v7** (routing configuration is set up in `src/App.jsx`)
* **Lucide React** (icons)
* **Recharts** (installed for future analytics/dashboard charts)
* **CSS** (plain custom CSS using variables defined in `src/index.css`)

## Project Structure

* `src/components/layout/`: Common layout items like `PublicHeader.jsx` and `Footer.jsx`. Also contains dashboard CSS templates (`Sidebar.css` and `Header.css`).
* `src/pages/Landing/`: The landing page component (`LandingPage.jsx` and its CSS).
* `src/App.jsx`: Handles routing (currently only pointing to the Landing Page).
* `src/index.css`: Global styles and color variables (primary blue, neutral slate, success green, etc.).

## How to Run It

First, install the dependencies:
```bash
npm install
```

To run the development server:
```bash
npm run dev
```

Open the URL shown in your terminal (usually [http://localhost:5173](http://localhost:5173) or another port if 5173 is occupied).

To compile the project for production:
```bash
npm run build
```
