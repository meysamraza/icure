import { useEffect, useState } from 'react';
import { toast } from 'react-toastify';
import api from '../utils/api';

const ManageAvailability = () => {
    const [blockedSlots, setBlockedSlots] = useState([]);
    const [loading, setLoading] = useState(true);

    // New block form state
    const [newBlock, setNewBlock] = useState({
        block_date: '',
        start_time: '10:00',
        end_time: '22:00',
        reason: ''
    });

    const fetchBlocked = async () => {
        try {
            const res = await api.get('/blocked-slots');
            setBlockedSlots(res.data);
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchBlocked();
    }, []);

    const handleCreateBlock = async (e) => {
        e.preventDefault();
        try {
            await api.post('/blocked-slots', newBlock);
            toast.success('Time range blocked successfully.');
            setNewBlock({ block_date: '', start_time: '10:00', end_time: '22:00', reason: '' });
            fetchBlocked();
        } catch (error) {
            toast.error('Failed to block slots. Check the inputs.');
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm('Remove this block? Slots will become available again.')) return;
        try {
            await api.delete(`/blocked-slots/${id}`);
            toast.success('Block removed.');
            fetchBlocked();
        } catch (error) {
            toast.error('Failed to remove block.');
        }
    };

    return (
        <div className="max-w-7xl mx-auto px-4 py-8">
            <h1 className="text-3xl font-extrabold text-slate-800 mb-8 uppercase tracking-tight">Availability Control</h1>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Create Block Form */}
                <div className="bg-white p-8 rounded-3xl shadow-xl border border-slate-200">
                    <h2 className="text-xl font-bold mb-6 text-slate-700">Block New Range</h2>
                    <form onSubmit={handleCreateBlock} className="space-y-4">
                        <div>
                            <label className="block text-xs font-bold uppercase text-slate-400 mb-1">Date</label>
                            <input
                                type="date"
                                required
                                value={newBlock.block_date}
                                onChange={(e) => setNewBlock(prev => ({ ...prev, block_date: e.target.value }))}
                                className="w-full p-3 bg-gray-50 border rounded-xl outline-none focus:border-blue-500 font-bold"
                            />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-xs font-bold uppercase text-slate-400 mb-1">Start Time</label>
                                <input
                                    type="time"
                                    step="1800"
                                    required
                                    value={newBlock.start_time}
                                    onChange={(e) => setNewBlock(prev => ({ ...prev, start_time: e.target.value }))}
                                    className="w-full p-3 bg-gray-50 border rounded-xl outline-none focus:border-blue-500"
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-bold uppercase text-slate-400 mb-1">End Time</label>
                                <input
                                    type="time"
                                    step="1800"
                                    required
                                    value={newBlock.end_time}
                                    onChange={(e) => setNewBlock(prev => ({ ...prev, end_time: e.target.value }))}
                                    className="w-full p-3 bg-gray-50 border rounded-xl outline-none focus:border-blue-500"
                                />
                            </div>
                        </div>
                        <div>
                            <label className="block text-xs font-bold uppercase text-slate-400 mb-1">Reason (Optional)</label>
                            <input
                                type="text"
                                value={newBlock.reason}
                                onChange={(e) => setNewBlock(prev => ({ ...prev, reason: e.target.value }))}
                                placeholder="Vacation, Emergency, etc."
                                className="w-full p-3 bg-gray-50 border rounded-xl outline-none focus:border-blue-500"
                            />
                        </div>
                        <button type="submit" className="w-full bg-slate-800 text-white py-4 rounded-xl font-bold hover:bg-slate-900 transition mt-6">
                            Add Block Rule
                        </button>
                    </form>
                </div>

                {/* Blocked List */}
                <div className="lg:col-span-2 bg-white rounded-3xl shadow-xl border border-slate-200 overflow-hidden">
                    <div className="p-6 bg-slate-50 border-b">
                        <h2 className="text-sm font-extrabold text-slate-700 uppercase tracking-wider">Scheduled Blocks</h2>
                    </div>
                    {loading ? (
                        <div className="p-20 text-center text-slate-400">Loading block rules...</div>
                    ) : blockedSlots.length > 0 ? (
                        <div className="overflow-x-auto">
                            <table className="w-full text-left">
                                <thead>
                                    <tr className="border-b text-slate-400 uppercase text-[10px] font-extrabold tracking-widest">
                                        <th className="p-6">Date</th>
                                        <th className="p-6">Time Range</th>
                                        <th className="p-6">Reason</th>
                                        <th className="p-6 text-right">Action</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y">
                                    {blockedSlots.map(slot => (
                                        <tr key={slot.id} className="hover:bg-slate-50">
                                            <td className="p-6 font-bold text-slate-800">{new Date(slot.block_date).toLocaleDateString()}</td>
                                            <td className="p-6">
                                                <span className="bg-slate-100 px-2 py-1 rounded text-xs font-bold">{slot.start_time} - {slot.end_time}</span>
                                            </td>
                                            <td className="p-6 text-slate-500 italic text-sm">{slot.reason || '—'}</td>
                                            <td className="p-6 text-right">
                                                <button
                                                    onClick={() => handleDelete(slot.id)}
                                                    className="text-red-500 hover:text-red-700 font-bold text-xs uppercase"
                                                >
                                                    Delete
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    ) : (
                        <div className="p-40 text-center">
                            <p className="text-slate-400 font-medium italic">Your schedule is clear. No blocked slots.</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default ManageAvailability;
