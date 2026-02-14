import { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import api from '../utils/api';

const MyAppointments = () => {
    const [appointments, setAppointments] = useState([]);
    const [loading, setLoading] = useState(true);

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

    useEffect(() => {
        fetchAppointments();
    }, []);

    const handleCancel = async (id) => {
        if (!window.confirm('Are you sure you want to cancel this appointment?')) return;

        try {
            await api.put(`/appointments/${id}/cancel`);
            toast.success('Appointment cancelled successfully.');
            fetchAppointments(); // Refresh list
        } catch (error) {
            toast.error(error.response?.data?.message || 'Failed to cancel appointment.');
        }
    };

    const statusColors = {
        pending: 'bg-yellow-100 text-yellow-700 border-yellow-200',
        approved: 'bg-green-100 text-green-700 border-green-200',
        completed: 'bg-blue-100 text-blue-700 border-blue-200',
        cancelled: 'bg-red-100 text-red-700 border-red-200',
        rejected: 'bg-gray-100 text-gray-700 border-gray-200'
    };

    return (
        <div className="max-w-6xl mx-auto px-4 py-12">
            <h1 className="text-3xl font-extrabold text-gray-900 mb-2">My Appointments</h1>
            <p className="text-gray-600 mb-10">Track your consultation history and manage upcoming visits.</p>

            {loading ? (
                <div className="text-center py-20 text-gray-400">Loading your history...</div>
            ) : appointments.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    {appointments.map((appt) => (
                        <div key={appt.id} className="bg-white rounded-3xl shadow-lg border overflow-hidden flex flex-col h-full border-gray-100 hover:border-blue-200 transition">
                            <div className="p-8">
                                <div className="flex justify-between items-start mb-6">
                                    <div>
                                        <span className={`px-4 py-1 rounded-full text-xs font-extrabold border uppercase tracking-wider ${statusColors[appt.status]}`}>
                                            {appt.status}
                                        </span>
                                    </div>
                                    {(appt.status === 'pending' || appt.status === 'approved') && (
                                        <button
                                            onClick={() => handleCancel(appt.id)}
                                            className="text-red-500 hover:bg-red-50 px-3 py-1 rounded-lg text-sm font-bold transition border border-transparent hover:border-red-100"
                                        >
                                            Cancel Visit
                                        </button>
                                    )}
                                </div>

                                <div className="space-y-6">
                                    <div className="flex items-center gap-6">
                                        <div className="bg-blue-50 p-4 rounded-2xl text-center min-w-[100px]">
                                            <p className="text-xs text-blue-800 font-bold uppercase tracking-tighter mb-1">Time</p>
                                            <p className="text-2xl font-extrabold text-blue-900">{appt.appointment_time}</p>
                                        </div>
                                        <div>
                                            <p className="text-xs text-gray-400 font-bold uppercase tracking-widest mb-1">Date</p>
                                            <p className="text-xl font-bold text-gray-800">
                                                {new Date(appt.appointment_date).toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' })}
                                            </p>
                                        </div>
                                    </div>

                                    {appt.patient_notes && (
                                        <div className="bg-gray-50 p-5 rounded-2xl border border-gray-50 italic text-gray-600 text-sm">
                                            <span className="block font-bold text-xs uppercase text-gray-400 mb-2 not-italic tracking-wider">Your Note</span>
                                            "{appt.patient_notes}"
                                        </div>
                                    )}

                                    {appt.doctor_notes && (
                                        <div className="bg-blue-50 p-5 rounded-2xl border border-blue-50 italic text-blue-700 text-sm">
                                            <span className="block font-bold text-xs uppercase text-blue-400 mb-2 not-italic tracking-wider">Doctor Remark</span>
                                            "{appt.doctor_notes}"
                                        </div>
                                    )}

                                    {appt.documents && appt.documents.length > 0 && (
                                        <div className="pt-4 border-t border-gray-50">
                                            <p className="text-xs text-gray-400 font-bold uppercase tracking-wider mb-3">Attached Records</p>
                                            <div className="flex flex-wrap gap-2">
                                                {appt.documents.map(doc => (
                                                    <a key={doc.id} href={doc.file_url} target="_blank" rel="noopener noreferrer" className="bg-white border p-2 rounded-lg text-xs font-bold flex mb-1 items-center gap-2 hover:border-blue-300">
                                                        📄 {doc.file_name}
                                                    </a>
                                                ))}
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            ) : (
                <div className="text-center py-40 border-4 border-dashed rounded-3xl">
                    <p className="text-4xl mb-6">🗓️</p>
                    <p className="text-2xl text-gray-400 font-medium italic">Your appointment history is currently empty.</p>
                    <button onClick={() => window.location.href = '/book-appointment'} className="mt-8 bg-blue-600 text-white px-8 py-3 rounded-xl font-bold shadow-lg">Book Now</button>
                </div>
            )}
        </div>
    );
};

export default MyAppointments;
