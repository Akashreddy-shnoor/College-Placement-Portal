import { BrowserRouter, Routes, Route } from 'react-router-dom';
import LandingPage from './pages/Landing/LandingPage';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* The one and only page in our project right now */}
        <Route path="/" element={<LandingPage />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
