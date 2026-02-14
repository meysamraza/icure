import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../utils/api';
import { useAuth } from '../context/AuthContext';

const PatientDashboard = () => {
    const { user } = useAuth();
    const [appointments, setAppointments] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchAppointments = async () => {
            try {
                const res = await api.get('/appointments/my-appointments');
                setAppointments(res.data);
            } catch (error) {
                console.error('Error fetching appointments:', error);
            } finally {
                setLoading(false);
            }
        };
        fetchAppointments();
    }, []);

    const upcoming = appointments.filter(a => ['pending', 'approved'].includes(a.status));

    return (
        <div className="max-w-7xl mx-auto px-4 py-10">
            <div className="mb-10">
                <h1 className="text-3xl font-extrabold text-gray-900">Welcome, {user?.full_name}!</h1>
                <p className="text-gray-600">Manage your health and consultations easily.</p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Quick Actions */}
                <div className="space-y-6">
                    <Link to="/book-appointment" className="block bg-blue-600 text-white p-8 rounded-2xl shadow-lg hover:bg-blue-700 transition transform hover:-translate-y-1">
                        <h3 className="text-xl font-bold mb-2">Book New Appointment</h3>
                        <p className="opacity-80 text-sm">Select a date and time that works for you.</p>
                    </Link>
                    <Link to="/upload-documents" className="block bg-white text-gray-800 p-8 rounded-2xl shadow-lg border hover:border-blue-300 transition transform hover:-translate-y-1">
                        <h3 className="text-xl font-bold mb-2 text-blue-600">My Medical Records</h3>
                        <p className="text-gray-500 text-sm">Upload and manage your health documents.</p>
                    </Link>
                    <Link to="/all-reviews" className="block bg-white text-gray-800 p-8 rounded-2xl shadow-lg border hover:border-blue-300 transition transform hover:-translate-y-1">
                        <h3 className="text-xl font-bold mb-2 text-blue-600">Write a Review</h3>
                        <p className="text-gray-500 text-sm">Share your experience to help others.</p>
                    </Link>
                </div>

                {/* Upcoming Appointments */}
                <div className="lg:col-span-2 space-y-6">
                    <div className="bg-white rounded-2xl shadow-lg border p-6 min-h-[400px]">
                        <h3 className="text-xl font-bold mb-6 flex justify-between items-center">
                            <span>Upcoming Consultations</span>
                            <Link to="/my-appointments" className="text-blue-600 text-sm font-bold hover:underline">View All</Link>
                        </h3>

                        {loading ? (
                            <div className="text-center py-20 text-gray-400">Loading your schedule...</div>
                        ) : upcoming.length > 0 ? (
                            <div className="space-y-4">
                                {upcoming.map((appt) => (
                                    <div key={appt.id} className="flex flex-col md:flex-row md:items-center justify-between p-4 bg-gray-50 rounded-xl border border-gray-100">
                                        <div>
                                            <p className="text-blue-600 font-bold mb-1">{new Date(appt.appointment_date).toLocaleDateString(undefined, { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</p>
                                            <p className="text-2xl font-extrabold text-gray-900">{appt.appointment_time}</p>
                                        </div>
                                        <div className="mt-4 md:mt-0 flex items-center gap-4">
                                            <span className={`px-4 py-1 rounded-full text-xs font-bold uppercase ${appt.status === 'approved' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'
                                                }`}>
                                                {appt.status}
                                            </span>
                                            <Link to="/my-appointments" className="bg-white border text-gray-700 px-4 py-2 rounded-lg text-sm font-bold hover:bg-gray-100">Details</Link>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="flex flex-col items-center justify-center py-20 text-center">
                                <div className="text-4xl mb-4">🗓️</div>
                                <p className="text-gray-500 font-medium italic">No upcoming appointments scheduled.</p>
                                <Link to="/book-appointment" className="mt-4 text-blue-600 font-bold hover:underline">Book your first consultation</Link>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default PatientDashboard;
