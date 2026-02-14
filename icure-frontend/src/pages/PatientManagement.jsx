import { useEffect, useState } from 'react';
import api from '../utils/api';

const PatientManagement = () => {
    const [patients, setPatients] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');

    useEffect(() => {
        const fetchPatients = async () => {
            try {
                const res = await api.get('/patients');
                setPatients(res.data);
            } catch (error) {
                console.error('Error fetching patients:', error);
            } finally {
                setLoading(false);
            }
        };
        fetchPatients();
    }, []);

    const filteredPatients = patients.filter(p =>
        p.full_name?.toLowerCase().includes(search.toLowerCase()) ||
        p.username?.toLowerCase().includes(search.toLowerCase())
    );

    return (
        <div className="max-w-7xl mx-auto px-4 py-8">
            <header className="mb-8">
                <h1 className="text-3xl font-extrabold text-slate-800 uppercase tracking-tight">Patient Archive</h1>
                <p className="text-slate-500 font-medium">Manage and view records for all registered patients.</p>
            </header>

            <div className="bg-white rounded-2xl shadow-sm border mb-8 p-4">
                <input
                    type="text"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    placeholder="Search by name or username..."
                    className="w-full p-4 bg-gray-50 border-none rounded-xl focus:ring-2 focus:ring-blue-500 outline-none"
                />
            </div>

            {loading ? (
                <div className="text-center py-20 text-slate-400">Loading patient list...</div>
            ) : filteredPatients.length > 0 ? (
                <div className="overflow-x-auto bg-white rounded-2xl shadow-sm border">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-slate-50 border-b">
                                <th className="p-4 font-extrabold text-xs uppercase text-slate-500 tracking-wider">Patient Details</th>
                                <th className="p-4 font-extrabold text-xs uppercase text-slate-500 tracking-wider">Contact Info</th>
                                <th className="p-4 font-extrabold text-xs uppercase text-slate-500 tracking-wider text-center">Appts</th>
                                <th className="p-4 font-extrabold text-xs uppercase text-slate-500 tracking-wider text-right">Joined</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y">
                            {filteredPatients.map(patient => (
                                <tr key={patient.id} className="hover:bg-slate-50 transition">
                                    <td className="p-4">
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 bg-indigo-100 rounded-full flex items-center justify-center font-bold text-indigo-700">
                                                {patient.full_name?.[0]}
                                            </div>
                                            <div>
                                                <p className="font-bold text-slate-800">{patient.full_name}</p>
                                                <p className="text-xs text-slate-400">@{patient.username}</p>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="p-4">
                                        <p className="text-sm font-medium text-slate-700">{patient.phone}</p>
                                        <p className="text-[10px] text-green-600 font-bold uppercase tracking-tighter">WhatsApp Opt-in</p>
                                    </td>
                                    <td className="p-4 text-center">
                                        <span className="inline-block bg-blue-100 text-blue-700 px-3 py-1 rounded-lg text-xs font-bold">
                                            {patient.appointment_count || 0}
                                        </span>
                                    </td>
                                    <td className="p-4 text-right">
                                        <p className="text-sm text-slate-500">{new Date(patient.created_at).toLocaleDateString()}</p>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            ) : (
                <div className="text-center py-40 border-4 border-dashed rounded-3xl">
                    <p className="text-slate-400 italic font-medium">No patients found matches your search.</p>
                </div>
            )}
        </div>
    );
};

export default PatientManagement;
