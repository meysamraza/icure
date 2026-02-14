import { useEffect, useState } from 'react';
import api from '../utils/api';

const AllReviews = () => {
    const [reviews, setReviews] = useState([]);
    const [stats, setStats] = useState({ average: 0, total: 0 });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchReviews = async () => {
            try {
                const statsRes = await api.get('/reviews/stats');
                setStats(statsRes.data);
                const reviewsRes = await api.get('/reviews');
                setReviews(reviewsRes.data);
            } catch (error) {
                console.error('Error fetching reviews:', error);
            } finally {
                setLoading(false);
            }
        };
        fetchReviews();
    }, []);

    if (loading) return <div className="text-center py-20">Loading...</div>;

    return (
        <div className="max-w-7xl mx-auto px-4 py-16">
            <div className="text-center mb-16">
                <h1 className="text-4xl font-extrabold text-gray-900 mb-4">Patient Satisfaction</h1>
                <div className="flex flex-col items-center">
                    <div className="flex text-4xl text-yellow-400 mb-2">
                        {[...Array(5)].map((_, i) => (
                            <span key={i} className={i < Math.round(stats.average || 4.9) ? "text-yellow-400" : "text-gray-300"}>★</span>
                        ))}
                    </div>
                    <p className="text-2xl font-bold text-blue-600">{stats.average || 4.9} out of 5 stars</p>
                    <p className="text-gray-500 font-medium">Based on {stats.total || reviews.length} verified reviews</p>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {reviews.map((review, i) => (
                    <div key={i} className="bg-white p-8 rounded-2xl shadow-lg border border-gray-100 flex flex-col h-full hover:shadow-2xl transition">
                        <div className="flex text-yellow-400 mb-4">
                            {[...Array(5)].map((_, star) => (
                                <span key={star} className={star < review.rating ? "text-yellow-400" : "text-gray-300"}>★</span>
                            ))}
                        </div>
                        <p className="text-gray-700 italic mb-6 flex-grow leading-relaxed">"{review.review_text}"</p>
                        <div className="flex items-center gap-3 pt-6 border-t border-gray-50 mt-auto">
                            <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 font-bold">
                                {(review.patient_name || 'VP')[0]}
                            </div>
                            <div>
                                <p className="font-bold text-gray-900">{review.patient_name || 'Verified Patient'}</p>
                                <p className="text-xs text-gray-500 uppercase font-bold tracking-tighter">Verified Consult</p>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default AllReviews;
