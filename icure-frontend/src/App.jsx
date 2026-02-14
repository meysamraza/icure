import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

import { AuthProvider } from './context/AuthContext';
import Navbar from './components/shared/Navbar';
import Footer from './components/shared/Footer';
import ProtectedRoute from './components/shared/ProtectedRoute';

// Pages
import Home from './pages/Home';
import Login from './pages/Login';
import Signup from './pages/Signup';
import AdminLogin from './pages/AdminLogin';
import About from './pages/About';
import Contact from './pages/Contact';
import AllReviews from './pages/AllReviews';
import PatientDashboard from './pages/PatientDashboard';
import BookAppointment from './pages/BookAppointment';
import MyAppointments from './pages/MyAppointments';
import UploadDocuments from './pages/UploadDocuments';

// Admin Pages
import AdminDashboard from './pages/AdminDashboard';
import ManageAppointments from './pages/ManageAppointments';
import ManageAvailability from './pages/ManageAvailability';
import PatientManagement from './pages/PatientManagement';
import ProfileSettings from './pages/ProfileSettings';

function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="flex flex-col min-h-screen bg-gray-50 font-sans text-slate-900">
          <Navbar />
          <main className="flex-grow">
            <Routes>
              {/* Public Routes */}
              <Route path="/" element={<Home />} />
              <Route path="/about" element={<About />} />
              <Route path="/contact" element={<Contact />} />
              <Route path="/all-reviews" element={<AllReviews />} />
              <Route path="/login" element={<Login />} />
              <Route path="/signup" element={<Signup />} />
              <Route path="/admin/login" element={<AdminLogin />} />

              {/* Patient Protected Routes */}
              <Route path="/dashboard" element={
                <ProtectedRoute allowedRole="patient">
                  <PatientDashboard />
                </ProtectedRoute>
              } />
              <Route path="/book-appointment" element={
                <ProtectedRoute allowedRole="patient">
                  <BookAppointment />
                </ProtectedRoute>
              } />
              <Route path="/my-appointments" element={
                <ProtectedRoute allowedRole="patient">
                  <MyAppointments />
                </ProtectedRoute>
              } />
              <Route path="/upload-documents" element={
                <ProtectedRoute allowedRole="patient">
                  <UploadDocuments />
                </ProtectedRoute>
              } />

              {/* Admin Protected Routes */}
              <Route path="/admin/dashboard" element={
                <ProtectedRoute allowedRole="doctor">
                  <AdminDashboard />
                </ProtectedRoute>
              } />
              <Route path="/admin/appointments" element={
                <ProtectedRoute allowedRole="doctor">
                  <ManageAppointments />
                </ProtectedRoute>
              } />
              <Route path="/admin/availability" element={
                <ProtectedRoute allowedRole="doctor">
                  <ManageAvailability />
                </ProtectedRoute>
              } />
              <Route path="/admin/patients" element={
                <ProtectedRoute allowedRole="doctor">
                  <PatientManagement />
                </ProtectedRoute>
              } />
              <Route path="/admin/profile" element={
                <ProtectedRoute allowedRole="doctor">
                  <ProfileSettings />
                </ProtectedRoute>
              } />

              {/* Catch all */}
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </main>
          <Footer />
        </div>
        <ToastContainer position="top-right" autoClose={3000} />
      </Router>
    </AuthProvider>
  );
}

export default App;
