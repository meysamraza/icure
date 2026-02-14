import { useEffect, useState } from 'react';
import { toast } from 'react-toastify';
import api from '../utils/api';

const ManageAppointments = () => {
    const [appointments, setAppointments] = useState([]);
    const [filters, setFilters] = useState({ date: '', status: '', search: '' });
    const [loading, setLoading] = useState(true);
    const [actionNotes, setActionNotes] = useState({}); // Stores notes per appointment ID

    const fetchAppointments = async () => {
        setLoading(true);
        try {
            let url = '/appointments/all?';
            if (filters.date) url += `date=${filters.date}&`;
            if (filters.status) url += `status=${filters.status}&`;
            if (filters.search) url += `search=${filters.search}&`;

            const res = await api.get(url);
            setAppointments(res.data);
        } catch (error) {
            console.error('Error fetching appointments:', error);
            toast.error('Failed to load appointments.');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchAppointments();
    }, [filters.date, filters.status]);

    const handleAction = async (id, action) => {
        try {
            const payload = action === 'complete' || action === 'reject' ? {
                doctor_notes: actionNotes[id],
                reason: actionNotes[id]
            } : {};

            await api.put(`/appointments/${id}/${action}`, payload);
            toast.success(`Appointment ${action}ed successfully.`);
            fetchAppointments();
        } catch (error) {
            toast.error(`Failed to ${action} appointment.`);
        }
    };

    const handleNoteChange = (id, val) => {
        setActionNotes(prev => ({ ...prev, [id]: val }));
    };

    return (
        <div className="max-w-7xl mx-auto px-4 py-8">
            <h1 className="text-3xl font-extrabold text-slate-800 mb-8 uppercase tracking-tight">Manage Appointments</h1>

            {/* Filters */}
            <div className="bg-white p-6 rounded-2xl shadow-sm border mb-8 flex flex-wrap gap-4 items-end">
                <div className="flex-1 min-w-[200px]">
                    <label className="block text-xs font-bold uppercase text-slate-400 mb-1">Search Patient</label>
                    <div className="flex gap-2">
                        <input
                            type="text"
                            value={filters.search}
                            onChange={(e) => setFilters(prev => ({ ...prev, search: e.target.value }))}
                            className="w-full p-2 border rounded-lg outline-none focus:border-blue-500"
                            placeholder="Name or Username..."
                        />
                        <button onClick={fetchAppointments} className="bg-blue-600 text-white px-4 py-2 rounded-lg font-bold">Find</button>
                    </div>
                </div>
                <div>
                    <label className="block text-xs font-bold uppercase text-slate-400 mb-1">Status</label>
                    <select
                        value={filters.status}
                        onChange={(e) => setFilters(prev => ({ ...prev, status: e.target.value }))}
                        className="p-2 border rounded-lg outline-none cursor-pointer"
                    >
                        <option value="">All Statuses</option>
                        <option value="pending">Pending</option>
                        <option value="approved">Approved</option>
                        <option value="completed">Completed</option>
                        <option value="cancelled">Cancelled</option>
                        <option value="rejected">Rejected</option>
                    </select>
                </div>
                <div>
                    <label className="block text-xs font-bold uppercase text-slate-400 mb-1">Date</label>
                    <input
                        type="date"
                        value={filters.date}
                        onChange={(e) => setFilters(prev => ({ ...prev, date: e.target.value }))}
                        className="p-2 border rounded-lg outline-none"
                    />
                </div>
            </div>

            {loading ? (
                <div className="text-center py-20 text-slate-400">Loading appointments...</div>
            ) : appointments.length > 0 ? (
                <div className="space-y-6">
                    {appointments.map(appt => (
                        <div key={appt.id} className="bg-white rounded-2xl shadow-sm border overflow-hidden">
                            <div className="p-6 md:p-8 flex flex-col md:flex-row justify-between gap-8">
                                <div className="flex-grow space-y-4">
                                    <div className="flex items-center gap-4">
                                        <span className={`px-3 py-1 rounded-full text-[10px] font-extrabold uppercase border ${appt.status === 'approved' ? 'bg-green-50 text-green-700 border-green-100' :
                                                appt.status === 'pending' ? 'bg-yellow-50 text-yellow-700 border-yellow-100' :
                                                    appt.status === 'completed' ? 'bg-blue-50 text-blue-700 border-blue-100' : 'bg-gray-50 text-gray-500'
                                            }`}>
                                            {appt.status}
                                        </span>
                                        <span className="text-slate-400 text-xs">#{appt.id.slice(0, 8)}</span>
                                    </div>

                                    <div>
                                        <h3 className="text-2xl font-bold text-slate-800">{appt.patient_name}</h3>
                                        <p className="text-slate-500 font-medium">@{appt.patient_username} • {appt.patient_phone}</p>
                                    </div>

                                    <div className="flex items-center gap-6">
                                        <div>
                                            <p className="text-[10px] font-extrabold uppercase text-slate-400 mb-1">Sheduled For</p>
                                            <p className="font-bold text-slate-700">{new Date(appt.appointment_date).toLocaleDateString()} at {appt.appointment_time}</p>
                                        </div>
                                    </div>

                                    {appt.patient_notes && (
                                        <div className="p-4 bg-slate-50 rounded-xl border italic text-sm text-slate-600">
                                            <span className="block not-italic font-bold text-[10px] uppercase text-slate-400 mb-1">Patient's Message</span>
                                            "{appt.patient_notes}"
                                        </div>
                                    )}
                                </div>

                                <div className="md:w-1/3 space-y-4">
                                    {appt.status === 'pending' && (
                                        <div className="flex gap-2">
                                            <button
                                                onClick={() => handleAction(appt.id, 'approve')}
                                                className="flex-1 bg-green-600 text-white py-2 rounded-lg font-bold hover:bg-green-700"
                                            >
                                                Approve
                                            </button>
                                            <button
                                                onClick={() => handleAction(appt.id, 'reject')}
                                                className="flex-1 bg-red-100 text-red-600 py-2 rounded-lg font-bold hover:bg-red-200"
                                            >
                                                Reject
                                            </button>
                                        </div>
                                    )}

                                    {(appt.status === 'approved' || appt.status === 'pending') && (
                                        <div className="space-y-2">
                                            <textarea
                                                value={actionNotes[appt.id] || ''}
                                                onChange={(e) => handleNoteChange(appt.id, e.target.value)}
                                                className="w-full p-3 border rounded-lg text-sm outline-none focus:border-blue-500"
                                                placeholder="Add completion notes or rejection reason..."
                                            ></textarea>
                                            {appt.status === 'approved' && (
                                                <button
                                                    onClick={() => handleAction(appt.id, 'complete')}
                                                    className="w-full bg-blue-600 text-white py-2 rounded-lg font-bold hover:bg-blue-700"
                                                    disabled={!actionNotes[appt.id]}
                                                >
                                                    Mark as Completed
                                                </button>
                                            )}
                                        </div>
                                    )}

                                    {appt.status === 'completed' && appt.doctor_notes && (
                                        <div className="p-4 bg-blue-50 rounded-xl border border-blue-100 italic text-sm text-blue-700">
                                            <span className="block not-italic font-bold text-[10px] uppercase text-blue-400 mb-1">Your notes</span>
                                            "{appt.doctor_notes}"
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            ) : (
                <div className="text-center py-40 bg-white rounded-3xl border border-dashed">
                    <p className="text-4xl mb-4">🔍</p>
                    <p className="text-slate-400 font-medium italic">No appointments found matching your criteria.</p>
                </div>
            )}
        </div>
    );
};

export default ManageAppointments;
