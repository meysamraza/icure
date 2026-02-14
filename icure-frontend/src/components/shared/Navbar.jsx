import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

const Navbar = () => {
    const { user, logout } = useAuth();
    const navigate = useNavigate();

    const handleLogout = () => {
        logout();
        navigate('/');
    };

    return (
        <nav className="bg-blue-600 text-white shadow-md">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between h-16 items-center">
                    <div className="flex items-center">
                        <Link to="/" className="text-2xl font-bold">iCure</Link>
                    </div>
                    <div className="hidden md:block">
                        <div className="ml-10 flex items-baseline space-x-4">
                            <Link to="/" className="hover:bg-blue-700 px-3 py-2 rounded-md transition">Home</Link>
                            <Link to="/about" className="hover:bg-blue-700 px-3 py-2 rounded-md transition">About</Link>
                            <Link to="/all-reviews" className="hover:bg-blue-700 px-3 py-2 rounded-md transition">Reviews</Link>
                            <Link to="/contact" className="hover:bg-blue-700 px-3 py-2 rounded-md transition">Contact</Link>

                            {user ? (
                                <>
                                    {user.role === 'doctor' ? (
                                        <Link to="/admin/dashboard" className="bg-white text-blue-600 px-4 py-2 rounded-md font-medium">Admin Panel</Link>
                                    ) : (
                                        <Link to="/dashboard" className="bg-white text-blue-600 px-4 py-2 rounded-md font-medium">Dashboard</Link>
                                    )}
                                    <button onClick={handleLogout} className="border border-white px-4 py-2 rounded-md hover:bg-white hover:text-blue-600 transition">Logout</button>
                                </>
                            ) : (
                                <>
                                    <Link to="/login" className="hover:bg-blue-700 px-3 py-2 rounded-md transition">Login</Link>
                                    <Link to="/signup" className="bg-white text-blue-600 px-4 py-2 rounded-md font-medium">Signup</Link>
                                </>
                            )}
                        </div>
                    </div>
                    {/* Mobile menu button could go here */}
                </div>
            </div>
        </nav>
    );
};

export default Navbar;
