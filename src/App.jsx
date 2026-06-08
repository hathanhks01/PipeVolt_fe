import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import { useEffect } from 'react';
import ClientLayout from './components/Layouts/FontEnd/index'
import AdmLayout from './components/Layouts/BackEnd/index'
import ProtectedRoute from './components/ProtectedRoute'

function TitleUpdater() {
  const location = useLocation();
  useEffect(() => {
    const path = location.pathname || '/';
    let page = '';
    if (path === '/' || path === '') {
      page = '';
    } else {
      const seg = path.split('/').filter(Boolean);
      page = seg.length ? seg[seg.length - 1] : '';
      page = page.replace(/[-_]/g, ' ');
      page = page.charAt(0).toUpperCase() + page.slice(1);
    }
    document.title = page ? `PipeVolt - ${page}` : 'PipeVolt';
  }, [location]);
  return null;
}

function App() {
  return (
    <Router>
      <TitleUpdater />
      <Routes>
        <Route path="/admin/*" element={
          <ProtectedRoute>
            <AdmLayout />
          </ProtectedRoute>
        } />
        <Route path="/*" element={<ClientLayout />} />
      </Routes>
    </Router>
  );
}

export default App;
