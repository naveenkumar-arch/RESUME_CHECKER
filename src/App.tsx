import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ResumeProvider } from './context/ResumeContext';
import ToastContainer from './components/ToastContainer';
import DashboardLayout from './layouts/DashboardLayout';
import Landing from './pages/Landing';
import Dashboard from './pages/Dashboard';
import ResumeAnalysis from './pages/ResumeAnalysis';
import KeywordAnalysis from './pages/KeywordAnalysis';
import SkillGap from './pages/SkillGap';
import Suggestions from './pages/Suggestions';
import Reports from './pages/Reports';
import History from './pages/History';

export default function App() {
  return (
    <ResumeProvider>
      <Router>
        <Routes>
          <Route path="/" element={<Landing />} />
          <Route element={<DashboardLayout />}>
            <Route path="/dashboard"   element={<Dashboard />} />
            <Route path="/analysis"    element={<ResumeAnalysis />} />
            <Route path="/keywords"    element={<KeywordAnalysis />} />
            <Route path="/skills"      element={<SkillGap />} />
            <Route path="/suggestions" element={<Suggestions />} />
            <Route path="/reports"     element={<Reports />} />
            <Route path="/history"     element={<History />} />
          </Route>
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
        <ToastContainer />
      </Router>
    </ResumeProvider>
  );
}
