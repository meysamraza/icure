import { useEffect, useState } from 'react';
import api from '../utils/api';

const About = () => {
    const [doctor, setDoctor] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchDoctor = async () => {
            try {
                const res = await api.get('/doctor/profile');
                setDoctor(res.data);
            } catch (error) {
                console.error('Error fetching doctor profile:', error);
            } finally {
                setLoading(false);
            }
        };
        fetchDoctor();
    }, []);

    if (loading) return <div className="text-center py-20">Loading...</div>;

    return (
        <div className="max-w-7xl mx-auto px-4 py-16">
            <div className="flex flex-col md:flex-row gap-12 items-start">
                <div className="md:w-1/3 w-full">
                    <div className="bg-white p-2 rounded-2xl shadow-xl overflow-hidden border">
                        <img
                            src={doctor?.profile_image_url || 'https://res.cloudinary.com/dc7o6m23d/image/upload/v1700000000/default_doctor.png'}
                            alt={doctor?.full_name}
                            className="w-full h-auto rounded-xl object-cover"
                        />
                    </div>
                    <div className="mt-8 bg-blue-50 p-6 rounded-xl border border-blue-100">
                        <h3 className="text-lg font-bold text-blue-800 mb-4">Contact & Hours</h3>
                        <p className="text-gray-700 flex justify-between mb-2"><span>Phone:</span> <span className="font-semibold">+92 300 9436807</span></p>
                        <p className="text-gray-700 flex justify-between mb-2"><span>WhatsApp:</span> <span className="font-semibold">+92 300 9436807</span></p>
                        <div className="border-t border-blue-200 mt-4 pt-4">
                            <p className="text-gray-700 font-bold mb-2">Consultation Hours:</p>
                            <p className="text-gray-600 italic">Mon-Sat: 10:00 AM - 10:00 PM</p>
                            <p className="text-gray-600 italic">Sunday: <span className="text-red-500 font-semibold">Closed</span></p>
                        </div>
                    </div>
                </div>

                <div className="md:w-2/3 w-full">
                    <h1 className="text-4xl font-extrabold text-gray-900 mb-2">{doctor?.full_name || 'Dr. Noreen Abid'}</h1>
                    <p className="text-2xl text-blue-600 font-bold mb-6">{doctor?.specialization || 'General Physician'}</p>

                    <div className="prose max-w-none text-gray-700 mb-10">
                        <h3 className="text-xl font-bold mb-4 border-b pb-2">Professional Summary</h3>
                        <p>{doctor?.bio || "Experienced physician dedicated to providing patient-centered care. Committed to clinical excellence and lifelong learning."}</p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-10">
                        <div>
                            <h3 className="text-xl font-bold mb-4 border-b pb-2 text-blue-700">Education & Qualifications</h3>
                            <ul className="list-disc list-inside space-y-2 text-gray-700">
                                {doctor?.qualifications?.split(',').map((q, i) => (
                                    <li key={i}>{q.trim()}</li>
                                ))}
                            </ul>
                        </div>
                        <div>
                            <h3 className="text-xl font-bold mb-4 border-b pb-2 text-blue-700">Experience</h3>
                            <p className="text-gray-700 font-medium">{doctor?.experience_years || 10} Years in medical practice</p>
                        </div>
                    </div>

                    <div className="bg-gray-100 p-8 rounded-2xl flex flex-col md:flex-row items-center justify-between border">
                        <div>
                            <p className="text-gray-600 font-medium">Consultation Fee</p>
                            <p className="text-3xl font-extrabold text-blue-700">Rs. {doctor?.consultation_fee || 500}</p>
                        </div>
                        <a
                            href="https://wa.me/923009436807?text=Hello%20Dr.%20Noreen,%20I%20would%20like%20to%20book%20an%20appointment"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="mt-6 md:mt-0 bg-green-500 text-white px-8 py-4 rounded-xl font-bold flex items-center gap-2 hover:bg-green-600 transition shadow-lg"
                        >
                            Contact on WhatsApp
                        </a>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default About;
