import { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { toast } from 'react-toastify';
import { useAuth } from '../context/AuthContext';

const Login = () => {
    const [isLoading, setIsLoading] = useState(false);
    const { login } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();
    const { register, handleSubmit, formState: { errors } } = useForm();

    const from = location.state?.from?.pathname || '/dashboard';

    const onSubmit = async (data) => {
        setIsLoading(true);
        try {
            await login(data.username, data.password);
            toast.success('Login successful!');
            navigate(from, { replace: true });
        } catch (error) {
            toast.error(error.response?.data?.message || 'Invalid username or password');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-[calc(100vh-8rem)] flex items-center justify-center p-4">
            <div className="max-w-md w-full bg-white rounded-2xl shadow-xl overflow-hidden">
                <div className="bg-blue-600 py-6 px-8 text-white">
                    <h2 className="text-2xl font-bold">Patient Login</h2>
                    <p className="opacity-80">Welcome back to iCure</p>
                </div>
                <form onSubmit={handleSubmit(onSubmit)} className="p-8 space-y-6">
                    <div>
                        <label className="block text-gray-700 font-medium mb-1">Username</label>
                        <input
                            type="text"
                            {...register("username", { required: "Username is required" })}
                            className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none transition ${errors.username ? 'border-red-500' : 'border-gray-300'}`}
                            placeholder="Enter your username"
                        />
                        {errors.username && <p className="text-red-500 text-sm mt-1">{errors.username.message}</p>}
                    </div>

                    <div>
                        <label className="block text-gray-700 font-medium mb-1">Password</label>
                        <input
                            type="password"
                            {...register("password", { required: "Password is required" })}
                            className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none transition ${errors.password ? 'border-red-500' : 'border-gray-300'}`}
                            placeholder="••••••••"
                        />
                        {errors.password && <p className="text-red-500 text-sm mt-1">{errors.password.message}</p>}
                    </div>

                    <button
                        type="submit"
                        disabled={isLoading}
                        className="w-full bg-blue-600 text-white py-3 rounded-lg font-bold hover:bg-blue-700 transition disabled:bg-blue-300 shadow-md"
                    >
                        {isLoading ? 'Logging in...' : 'Sign In'}
                    </button>

                    <div className="text-center text-gray-600">
                        Don't have an account? <Link to="/signup" className="text-blue-600 font-bold hover:underline">Sign up</Link>
                    </div>

                    <div className="border-t pt-4">
                        <Link to="/admin/login" className="text-sm text-gray-500 hover:text-blue-600 block text-center">Are you a Doctor? Login here</Link>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default Login;
