import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../utils/api';

const AdminDashboard = () => {
    const [stats, setStats] = useState({ todayAppts: 0, pendingAppts: 0, totalPatients: 0, avgRating: 0 });
    const [todayAppts, setTodayAppts] = useState([]);
    const [recentReviews, setRecentReviews] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchAdminData = async () => {
            try {
                const statsRes = await api.get('/doctor/stats');
                setStats(statsRes.data);

                const today = new Date().toISOString().split('T')[0];
                const apptsRes = await api.get(`/appointments/all?date=${today}`);
                setTodayAppts(apptsRes.data);

                const reviewsRes = await api.get('/reviews');
                setRecentReviews(reviewsRes.data.slice(0, 5));
            } catch (error) {
                console.error('Error fetching admin data:', error);
            } finally {
                setLoading(false);
            }
        };
        fetchAdminData();
    }, []);

    return (
        <div className="bg-gray-100 min-h-screen p-4 md:p-8">
            <div className="max-w-7xl mx-auto">
                <header className="mb-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                    <div>
                        <h1 className="text-3xl font-extrabold text-slate-800 uppercase tracking-tight">Admin Overview</h1>
                        <p className="text-slate-500 font-medium italic">Welcome back to your practice management.</p>
                    </div>
                    <div className="flex gap-4">
                        <Link to="/admin/availability" className="bg-slate-700 text-white px-6 py-2 rounded-lg font-bold hover:bg-slate-800 transition">Manage Availability</Link>
                        <Link to="/admin/profile" className="bg-blue-600 text-white px-6 py-2 rounded-lg font-bold hover:bg-blue-700 transition">Edit Profile</Link>
                    </div>
                </header>

                {/* Stats Cards */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-10">
                    {[
                        { label: "Today's Appts", value: stats.todayAppts || todayAppts.length, color: 'blue' },
                        { label: "Pending Requests", value: stats.pendingAppts, color: 'yellow' },
                        { label: "Total Patients", value: stats.totalPatients, color: 'indigo' },
                        { label: "Avg Rating", value: `${stats.avgRating || 4.9}/5`, color: 'green' }
                    ].map((stat, i) => (
                        <div key={i} className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
                            <p className="text-xs font-extrabold uppercase text-slate-400 tracking-wider mb-2">{stat.label}</p>
                            <p className={`text-3xl font-extrabold text-${stat.color}-600`}>{stat.value}</p>
                        </div>
                    ))}
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    {/* Today's Schedule */}
                    <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
                        <div className="p-6 bg-slate-50 border-b flex justify-between items-center">
                            <h2 className="font-extrabold text-slate-700 uppercase tracking-wider text-sm">Today's Appointments</h2>
                            <Link to="/admin/appointments" className="text-blue-600 text-xs font-bold hover:underline">Manage All</Link>
                        </div>
                        <div className="p-0">
                            {loading ? (
                                <div className="p-12 text-center text-slate-400 italic">Generating schedule...</div>
                            ) : todayAppts.length > 0 ? (
                                <div className="divide-y">
                                    {todayAppts.map(appt => (
                                        <div key={appt.id} className="p-6 flex items-center justify-between hover:bg-slate-50 transition">
                                            <div className="flex items-center gap-4">
                                                <div className="text-center bg-blue-50 p-2 rounded-xl min-w-[70px]">
                                                    <p className="text-lg font-extrabold text-blue-700 leading-none">{appt.appointment_time}</p>
                                                </div>
                                                <div>
                                                    <p className="font-bold text-slate-800">{appt.patient_name}</p>
                                                    <p className="text-xs text-slate-400">ID: {appt.id.slice(0, 8)}</p>
                                                </div>
                                            </div>
                                            <span className={`px-3 py-1 rounded-full text-[10px] font-extrabold uppercase border ${appt.status === 'approved' ? 'bg-green-50 text-green-700 border-green-100' :
                                                    appt.status === 'pending' ? 'bg-yellow-50 text-yellow-700 border-yellow-100' : 'bg-gray-50 text-gray-500'
                                                }`}>
                                                {appt.status}
                                            </span>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="p-20 text-center">
                                    <p className="text-4xl mb-4">☕</p>
                                    <p className="text-slate-400 font-medium italic">No appointments for today yet.</p>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Recent Reviews */}
                    <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
                        <div className="p-6 bg-slate-50 border-b">
                            <h2 className="font-extrabold text-slate-700 uppercase tracking-wider text-sm">Recent Feedback</h2>
                        </div>
                        <div className="p-6 space-y-6">
                            {recentReviews.length > 0 ? recentReviews.map(review => (
                                <div key={review.id} className="border-b last:border-0 pb-4 last:pb-0">
                                    <div className="flex text-yellow-400 text-xs mb-2">
                                        {[...Array(5)].map((_, i) => (
                                            <span key={i}>{i < review.rating ? '★' : '☆'}</span>
                                        ))}
                                    </div>
                                    <p className="text-sm text-slate-600 italic mb-2">"{review.review_text}"</p>
                                    <p className="text-xs font-bold text-slate-400 uppercase tracking-tighter">— {review.username}</p>
                                </div>
                            )) : (
                                <p className="text-slate-400 italic text-center py-20">No reviews to display.</p>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AdminDashboard;
