import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { ToastProvider } from './components/ToastProvider';
import { Landing } from './pages/Landing';
import { Builder } from './pages/Builder';
import { TemplateDetail } from './pages/TemplateDetail';
import { Privacy } from './pages/Privacy';
import { Terms } from './pages/Terms';
import { Refund } from './pages/Refund';

function App() {
  return (
    <BrowserRouter>
      <ToastProvider>
        <Routes>
          <Route path="/" element={<Landing />} />
          <Route path="/builder" element={<Builder />} />
          <Route path="/template/:templateKey" element={<TemplateDetail />} />
          <Route path="/privacy" element={<Privacy />} />
          <Route path="/terms" element={<Terms />} />
          <Route path="/refund" element={<Refund />} />
        </Routes>
      </ToastProvider>
    </BrowserRouter>
  );
}

export default App;
