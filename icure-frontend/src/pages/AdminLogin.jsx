import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { toast } from 'react-toastify';
import { useAuth } from '../context/AuthContext';

const AdminLogin = () => {
    const [isLoading, setIsLoading] = useState(false);
    const { login } = useAuth();
    const navigate = useNavigate();
    const { register, handleSubmit, formState: { errors } } = useForm();

    const onSubmit = async (data) => {
        setIsLoading(true);
        try {
            await login(data.username, data.password, true);
            toast.success('Admin login successful!');
            navigate('/admin/dashboard');
        } catch (error) {
            toast.error(error.response?.data?.message || 'Access denied. Invalid credentials.');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-[calc(100vh-8rem)] flex items-center justify-center p-4 bg-gray-100">
            <div className="max-w-md w-full bg-white rounded-2xl shadow-2xl overflow-hidden border-2 border-blue-600/20">
                <div className="bg-slate-800 py-6 px-8 text-white text-center">
                    <h2 className="text-2xl font-bold">Doctor's Portal</h2>
                    <p className="text-blue-300 font-medium">Administration Login</p>
                </div>
                <form onSubmit={handleSubmit(onSubmit)} className="p-8 space-y-6">
                    <div className="bg-blue-50 p-4 rounded-lg border border-blue-100 mb-4">
                        <p className="text-sm text-blue-800 italic text-center">This portal is strictly for medical staff authorized by Dr. Noreen Abid.</p>
                    </div>

                    <div>
                        <label className="block text-gray-700 font-medium mb-1">Doctor ID / Username</label>
                        <input
                            type="text"
                            {...register("username", { required: "Username is required" })}
                            className={`w-full px-4 py-2 border rounded-lg bg-gray-50 focus:ring-2 focus:ring-blue-600 outline-none transition ${errors.username ? 'border-red-500' : 'border-gray-300'}`}
                            placeholder="Username"
                        />
                        {errors.username && <p className="text-red-500 text-sm mt-1">{errors.username.message}</p>}
                    </div>

                    <div>
                        <label className="block text-gray-700 font-medium mb-1">Password</label>
                        <input
                            type="password"
                            {...register("password", { required: "Password is required" })}
                            className={`w-full px-4 py-2 border rounded-lg bg-gray-50 focus:ring-2 focus:ring-blue-600 outline-none transition ${errors.password ? 'border-red-500' : 'border-gray-300'}`}
                            placeholder="••••••••"
                        />
                        {errors.password && <p className="text-red-500 text-sm mt-1">{errors.password.message}</p>}
                    </div>

                    <button
                        type="submit"
                        disabled={isLoading}
                        className="w-full bg-slate-800 text-white py-3 rounded-lg font-bold hover:bg-slate-900 transition disabled:bg-slate-400 shadow-md border-b-4 border-slate-950 active:border-b-0 active:translate-y-1"
                    >
                        {isLoading ? 'Authenticating...' : 'Access Admin Panel'}
                    </button>

                    <div className="text-center pt-2">
                        <button
                            type="button"
                            onClick={() => navigate('/login')}
                            className="text-sm text-blue-600 font-bold hover:underline"
                        >
                            Back to Patient Login
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default AdminLogin;
