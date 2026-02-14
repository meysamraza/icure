import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import api from '../utils/api';

const BookAppointment = () => {
    const navigate = useNavigate();
    const [step, setStep] = useState(1);
    const [loading, setLoading] = useState(false);

    // Selection state
    const [selectedDate, setSelectedDate] = useState('');
    const [availableSlots, setAvailableSlots] = useState([]);
    const [selectedSlot, setSelectedSlot] = useState('');
    const [notes, setNotes] = useState('');
    const [documents, setDocuments] = useState([]); // Selected IDs from archive
    const [myDocuments, setMyDocuments] = useState([]);

    // Fetch documents for selection
    useEffect(() => {
        if (step === 3) {
            api.get('/documents/my-documents')
                .then(res => setMyDocuments(res.data))
                .catch(err => console.error(err));
        }
    }, [step]);

    // Fetch slots when date changes
    const handleDateChange = async (e) => {
        const date = e.target.value;
        setSelectedDate(date);
        setSelectedSlot('');

        if (!date) return;

        setLoading(true);
        try {
            const res = await api.get(`/appointments/available-slots?date=${date}`);
            setAvailableSlots(res.data.slots);
            if (res.data.message && res.data.slots.length === 0) {
                toast.info(res.data.message);
            }
        } catch (error) {
            toast.error('Failed to load availability for this date.');
            setAvailableSlots([]);
        } finally {
            setLoading(false);
        }
    };

    const handleBooking = async () => {
        setLoading(true);
        try {
            await api.post('/appointments/book', {
                appointment_date: selectedDate,
                appointment_time: selectedSlot,
                patient_notes: notes,
                document_ids: documents
            });
            toast.success('Appointment booked successfully!');
            navigate('/my-appointments');
        } catch (error) {
            toast.error(error.response?.data?.message || 'Failed to book appointment.');
        } finally {
            setLoading(false);
        }
    };

    const toggleDocument = (id) => {
        setDocuments(prev =>
            prev.includes(id) ? prev.filter(d => d !== id) : [...prev, id]
        );
    };

    // Helper for disabling Sundays and past dates in input
    const today = new Date().toISOString().split('T')[0];

    return (
        <div className="max-w-3xl mx-auto px-4 py-12">
            {/* Progress Stepper */}
            <div className="flex items-center justify-between mb-12 relative px-4">
                <div className="absolute top-1/2 left-0 w-full h-0.5 bg-gray-200 -z-10 transform -translate-y-1/2"></div>
                {[1, 2, 3, 4].map(s => (
                    <div key={s} className={`w-10 h-10 rounded-full flex items-center justify-center font-bold border-2 transition ${step === s ? 'bg-blue-600 text-white border-blue-600 shadow-lg scale-110' :
                            step > s ? 'bg-green-500 text-white border-green-500' : 'bg-white text-gray-400 border-gray-200'
                        }`}>
                        {step > s ? '✓' : s}
                    </div>
                ))}
            </div>

            <div className="bg-white rounded-3xl shadow-xl p-8 border">
                {/* Step 1: Select Date */}
                {step === 1 && (
                    <div>
                        <h2 className="text-2xl font-bold mb-6">Step 1: Choose a Date</h2>
                        <p className="text-gray-600 mb-8 font-medium italic">Note: Consultation days are Monday to Saturday.</p>
                        <input
                            type="date"
                            min={today}
                            value={selectedDate}
                            onChange={handleDateChange}
                            className="w-full text-2xl font-bold p-6 border-4 border-blue-100 rounded-2xl focus:border-blue-500 outline-none transition cursor-pointer"
                        />
                        <div className="mt-12 flex justify-end">
                            <button
                                onClick={() => setStep(2)}
                                disabled={!selectedDate || availableSlots.length === 0}
                                className="bg-blue-600 text-white px-10 py-4 rounded-xl font-bold text-lg disabled:bg-gray-200 disabled:text-gray-400 transition"
                            >
                                Continue to Timeslots
                            </button>
                        </div>
                    </div>
                )}

                {/* Step 2: Select Time */}
                {step === 2 && (
                    <div>
                        <h2 className="text-2xl font-bold mb-2">Step 2: Select a Time Slot</h2>
                        <p className="text-blue-600 mb-8 font-medium italic">Available slots for {new Date(selectedDate).toLocaleDateString()}</p>

                        {loading ? (
                            <div className="text-center py-20 animate-pulse text-blue-400">Loading availability...</div>
                        ) : (
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                {availableSlots.map(slot => (
                                    <button
                                        key={slot}
                                        onClick={() => setSelectedSlot(slot)}
                                        className={`p-4 rounded-xl border-2 font-bold transition flex flex-col items-center ${selectedSlot === slot ? 'bg-blue-600 text-white border-blue-600 shadow-lg' : 'bg-white border-gray-100 hover:border-blue-300'
                                            }`}
                                    >
                                        <span className="text-xs opacity-60 uppercase mb-1">Time</span>
                                        {slot}
                                    </button>
                                ))}
                            </div>
                        )}

                        <div className="mt-12 flex justify-between">
                            <button onClick={() => setStep(1)} className="text-gray-500 font-bold hover:underline">← Go Back</button>
                            <button
                                onClick={() => setStep(3)}
                                disabled={!selectedSlot}
                                className="bg-blue-600 text-white px-10 py-4 rounded-xl font-bold text-lg disabled:bg-gray-200 transition"
                            >
                                Next: Consultation Details
                            </button>
                        </div>
                    </div>
                )}

                {/* Step 3: Notes & Documents */}
                {step === 3 && (
                    <div>
                        <h2 className="text-2xl font-bold mb-2">Step 3: Consultation Details</h2>
                        <p className="text-gray-500 mb-8 italic font-medium">Any specific concerns or existing medical records to share?</p>

                        <div className="space-y-6">
                            <div>
                                <label className="block text-gray-700 font-bold mb-2">Symptoms or Patient Notes</label>
                                <textarea
                                    value={notes}
                                    onChange={(e) => setNotes(e.target.value)}
                                    rows="4"
                                    className="w-full p-6 border-2 border-gray-100 rounded-2xl focus:border-blue-500 outline-none transition"
                                    placeholder="Briefly describe why you are booking this consultation..."
                                ></textarea>
                            </div>

                            <div>
                                <label className="block text-gray-700 font-bold mb-2">Attach Previous Records (Optional)</label>
                                <div className="max-h-48 overflow-y-auto space-y-2 pr-2">
                                    {myDocuments.length > 0 ? myDocuments.map(doc => (
                                        <div
                                            key={doc.id}
                                            onClick={() => toggleDocument(doc.id)}
                                            className={`flex items-center justify-between p-4 rounded-xl border-2 cursor-pointer transition ${documents.includes(doc.id) ? 'border-blue-600 bg-blue-50' : 'border-gray-50 bg-gray-50'
                                                }`}
                                        >
                                            <span className="font-medium">{doc.file_name}</span>
                                            <span className={documents.includes(doc.id) ? 'text-blue-600' : 'text-gray-400'}>
                                                {documents.includes(doc.id) ? '📎 Attached' : '+ Tap to Attach'}
                                            </span>
                                        </div>
                                    )) : (
                                        <p className="text-sm text-gray-500 italic">No stored documents found. You can upload them in the dashboard later.</p>
                                    )}
                                </div>
                            </div>
                        </div>

                        <div className="mt-12 flex justify-between">
                            <button onClick={() => setStep(2)} className="text-gray-500 font-bold hover:underline">← Go Back</button>
                            <button
                                onClick={() => setStep(4)}
                                className="bg-blue-600 text-white px-10 py-4 rounded-xl font-bold text-lg transition"
                            >
                                Review & Confirm
                            </button>
                        </div>
                    </div>
                )}

                {/* Step 4: Final Review */}
                {step === 4 && (
                    <div className="text-center">
                        <h2 className="text-3xl font-extrabold mb-10">Review Your Booking</h2>
                        <div className="bg-blue-50 p-8 rounded-3xl border border-blue-100 mb-10 text-left space-y-6">
                            <div className="flex justify-between border-b border-blue-200 pb-4">
                                <span className="text-blue-800 font-bold uppercase tracking-wider text-sm">Consultation For</span>
                                <span className="font-extrabold text-blue-900">Dr. Noreen Abid</span>
                            </div>
                            <div className="flex justify-between border-b border-blue-200 pb-4">
                                <span className="text-blue-800 font-bold uppercase tracking-wider text-sm">Selected Date</span>
                                <span className="font-extrabold text-blue-900">{new Date(selectedDate).toLocaleDateString(undefined, { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</span>
                            </div>
                            <div className="flex justify-between border-b border-blue-200 pb-4">
                                <span className="text-blue-800 font-bold uppercase tracking-wider text-sm">Selected Time</span>
                                <span className="font-extrabold text-blue-900">{selectedSlot}</span>
                            </div>
                            <div className="border-b border-blue-200 pb-4">
                                <span className="text-blue-800 font-bold uppercase tracking-wider text-sm block mb-2 text-left">Your Notes</span>
                                <p className="text-blue-900 bg-white/50 p-3 rounded-lg italic">"{notes || 'No extra notes provided'}"</p>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-blue-800 font-bold uppercase tracking-wider text-sm">Attached Files</span>
                                <span className="font-extrabold text-blue-900">{documents.length} File(s)</span>
                            </div>
                        </div>

                        <div className="flex flex-col gap-4">
                            <button
                                onClick={handleBooking}
                                disabled={loading}
                                className="bg-blue-600 text-white w-full py-5 rounded-2xl font-extrabold text-xl shadow-xl hover:bg-blue-700 transition disabled:bg-gray-400"
                            >
                                {loading ? 'Processing...' : 'Confirm & Send Request'}
                            </button>
                            <button onClick={() => setStep(3)} className="text-gray-500 font-bold hover:underline">Wait, let me change something</button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default BookAppointment;
