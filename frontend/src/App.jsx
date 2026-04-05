import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Home from './pages/Home';
import Itinerary from './pages/Itinerary';
import Dashboard from './pages/Dashboard';
import Header from './components/Header';

function App() {
  return (
    <Router>
      <div className="min-h-screen bg-background font-sans antialiased text-foreground selection:bg-blue-600/10 selection:text-blue-600">
        <Header />

        <main className="animate-in fade-in duration-700">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/itinerary" element={<Itinerary />} />
            <Route path="/dashboard" element={<Dashboard />} />
          </Routes>
        </main>

        <footer className="py-12 border-t mt-20 bg-gray-50/50">
          <div className="max-w-6xl mx-auto px-4 text-center">
            <p className="text-gray-400 text-sm font-medium">© 2024 Multi-Agent AI Travel Planner • Powered by Intelligence</p>
          </div>
        </footer>
      </div>
    </Router>
  );
}

export default App;
