import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { toast } from 'react-toastify';
import { useAuth } from '../context/AuthContext';

const Signup = () => {
    const [isLoading, setIsLoading] = useState(false);
    const { signup } = useAuth();
    const navigate = useNavigate();
    const { register, handleSubmit, formState: { errors } } = useForm();

    const onSubmit = async (data) => {
        setIsLoading(true);
        try {
            await signup(data);
            toast.success('Account created successfully!');
            navigate('/dashboard');
        } catch (error) {
            toast.error(error.response?.data?.message || 'Error creating account. Username might already be taken.');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-[calc(100vh-8rem)] flex items-center justify-center p-4">
            <div className="max-w-2xl w-full bg-white rounded-2xl shadow-xl overflow-hidden">
                <div className="bg-blue-600 py-6 px-8 text-white text-center">
                    <h2 className="text-2xl font-bold">Create Patient Account</h2>
                    <p className="opacity-80">Join iCure for easy appointment management</p>
                </div>
                <form onSubmit={handleSubmit(onSubmit)} className="p-8 grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="col-span-full">
                        <label className="block text-gray-700 font-medium mb-1">Full Name</label>
                        <input
                            type="text"
                            {...register("full_name", { required: "Full Name is required" })}
                            className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none transition ${errors.full_name ? 'border-red-500' : 'border-gray-300'}`}
                            placeholder="John Doe"
                        />
                        {errors.full_name && <p className="text-red-500 text-sm mt-1">{errors.full_name.message}</p>}
                    </div>

                    <div>
                        <label className="block text-gray-700 font-medium mb-1">Username</label>
                        <input
                            type="text"
                            {...register("username", {
                                required: "Username is required",
                                minLength: { value: 3, message: "Min 3 characters" }
                            })}
                            className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none transition ${errors.username ? 'border-red-500' : 'border-gray-300'}`}
                            placeholder="johndoe123"
                        />
                        {errors.username && <p className="text-red-500 text-sm mt-1">{errors.username.message}</p>}
                    </div>

                    <div>
                        <label className="block text-gray-700 font-medium mb-1">Password</label>
                        <input
                            type="password"
                            {...register("password", {
                                required: "Password is required",
                                minLength: { value: 6, message: "Min 6 characters" }
                            })}
                            className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none transition ${errors.password ? 'border-red-500' : 'border-gray-300'}`}
                            placeholder="••••••••"
                        />
                        {errors.password && <p className="text-red-500 text-sm mt-1">{errors.password.message}</p>}
                    </div>

                    <div>
                        <label className="block text-gray-700 font-medium mb-1">Phone Number</label>
                        <input
                            type="tel"
                            {...register("phone", { required: "Phone number is required" })}
                            className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none transition ${errors.phone ? 'border-red-500' : 'border-gray-300'}`}
                            placeholder="+92 3XX XXXXXXX"
                        />
                        {errors.phone && <p className="text-red-500 text-sm mt-1">{errors.phone.message}</p>}
                    </div>

                    <div>
                        <label className="block text-gray-700 font-medium mb-1">WhatsApp (Optional)</label>
                        <input
                            type="tel"
                            {...register("whatsapp_number")}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none transition"
                            placeholder="+92 3XX XXXXXXX"
                        />
                    </div>

                    <div className="col-span-full mt-4">
                        <button
                            type="submit"
                            disabled={isLoading}
                            className="w-full bg-blue-600 text-white py-3 rounded-lg font-bold hover:bg-blue-700 transition disabled:bg-blue-300 shadow-md"
                        >
                            {isLoading ? 'Creating Account...' : 'Sign Up'}
                        </button>
                    </div>

                    <div className="col-span-full text-center text-gray-600">
                        Already have an account? <Link to="/login" className="text-blue-600 font-bold hover:underline">Sign in</Link>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default Signup;
