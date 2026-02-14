import { Link } from 'react-router-dom';
import { useEffect, useState } from 'react';
import api from '../utils/api';

const Home = () => {
    const [stats, setStats] = useState({ rating: 4.8, totalReviews: 0, experience: 10 });
    const [reviews, setReviews] = useState([]);

    useEffect(() => {
        const fetchHomeData = async () => {
            try {
                const reviewsRes = await api.get('/reviews');
                setReviews(reviewsRes.data.slice(0, 3));
            } catch (error) {
                console.error('Error fetching home data:', error);
            }
        };
        fetchHomeData();
    }, []);

    return (
        <div>
            {/* Hero Section */}
            <section className="bg-blue-600 text-white py-20 px-4">
                <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between">
                    <div className="md:w-1/2 mb-10 md:mb-0">
                        <h1 className="text-4xl md:text-6xl font-extrabold mb-6 leading-tight">
                            Quality Healthcare <br /> at Your Fingertips
                        </h1>
                        <p className="text-xl mb-8 opacity-90">
                            Expert medical consultation from Dr. Noreen Abid. Book your appointment online today and avoid long waiting times.
                        </p>
                        <div className="flex flex-wrap gap-4">
                            <Link to="/login" className="bg-white text-blue-600 px-8 py-3 rounded-lg font-bold text-lg hover:bg-blue-50 transition shadow-lg">
                                Book Appointment
                            </Link>
                            <Link to="/about" className="border-2 border-white px-8 py-3 rounded-lg font-bold text-lg hover:bg-white hover:text-blue-600 transition">
                                Learn More
                            </Link>
                        </div>
                    </div>
                    <div className="md:w-1/2 flex justify-center">
                        <div className="relative">
                            <div className="w-64 h-64 md:w-80 md:h-80 bg-blue-400 rounded-full overflow-hidden border-4 border-white shadow-2xl">
                                <img src="https://res.cloudinary.com/dc7o6m23d/image/upload/v1700000000/default_doctor.png" alt="Doctor" className="w-full h-full object-cover" />
                            </div>
                            <div className="absolute -bottom-4 -right-4 bg-white text-blue-600 p-4 rounded-xl shadow-xl">
                                <p className="font-bold text-2xl">10+</p>
                                <p className="text-sm font-medium">Years Experience</p>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Stats Section */}
            <section className="py-16 bg-white">
                <div className="max-w-7xl mx-auto px-4 grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
                    <div>
                        <p className="text-4xl font-bold text-blue-600 mb-2">500+</p>
                        <p className="text-gray-600 font-medium">Patients Served</p>
                    </div>
                    <div>
                        <p className="text-4xl font-bold text-blue-600 mb-2">4.9/5</p>
                        <p className="text-gray-600 font-medium">Average Rating</p>
                    </div>
                    <div>
                        <p className="text-4xl font-bold text-blue-600 mb-2">100%</p>
                        <p className="text-gray-600 font-medium">Safe & Secure</p>
                    </div>
                    <div>
                        <p className="text-4xl font-bold text-blue-600 mb-2">24/7</p>
                        <p className="text-gray-600 font-medium">Online Support</p>
                    </div>
                </div>
            </section>

            {/* Testimonials */}
            <section className="py-20 bg-gray-50">
                <div className="max-w-7xl mx-auto px-4">
                    <div className="text-center mb-16">
                        <h2 className="text-3xl font-bold mb-4">What Our Patients Say</h2>
                        <p className="text-gray-600 max-w-2xl mx-auto">Read honest feedback from people who have consulted with Dr. Noreen Abid.</p>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        {reviews.length > 0 ? reviews.map((review, i) => (
                            <div key={i} className="bg-white p-6 rounded-xl shadow-md">
                                <div className="flex text-yellow-400 mb-4">
                                    {[...Array(5)].map((_, star) => (
                                        <span key={star} className={star < review.rating ? "text-yellow-400" : "text-gray-300"}>★</span>
                                    ))}
                                </div>
                                <p className="italic mb-4">"{review.review_text}"</p>
                                <p className="font-bold text-blue-600">- {review.patient_name || 'Verified Patient'}</p>
                            </div>
                        )) : (
                            <div className="col-span-3 text-center text-gray-500 italic">No reviews yet. Be the first to leave one!</div>
                        )}
                    </div>
                    <div className="text-center mt-12">
                        <Link to="/all-reviews" className="text-blue-600 font-bold hover:underline">View All Reviews →</Link>
                    </div>
                </div>
            </section>
        </div>
    );
};

export default Home;
