import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import ClientLayout from './components/Layouts/FontEnd/index'
import AdmLayout from './components/Layouts/BackEnd/index'
function App() {
  return (
    <Router>
      <Routes>
        <Route path="/admin/*" element={<AdmLayout />} />
        <Route path="/*" element={<ClientLayout />} />
      </Routes>
    </Router>
  );
}

export default App;
