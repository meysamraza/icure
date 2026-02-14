import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { toast } from 'react-toastify';
import api from '../utils/api';

const ProfileSettings = () => {
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const { register, handleSubmit, setValue, watch, formState: { errors } } = useForm();
    const [previewImage, setPreviewImage] = useState(null);

    useEffect(() => {
        const fetchProfile = async () => {
            try {
                const res = await api.get('/doctor/profile');
                const data = res.data;
                setValue('full_name', data.full_name);
                setValue('specialization', data.specialization);
                setValue('qualifications', data.qualifications);
                setValue('experience_years', data.experience_years);
                setValue('consultation_fee', data.consultation_fee);
                setValue('bio', data.bio);
                setPreviewImage(data.profile_image_url);
            } catch (error) {
                toast.error('Failed to load profile.');
            } finally {
                setLoading(false);
            }
        };
        fetchProfile();
    }, [setValue]);

    const onSubmit = async (data) => {
        setSaving(true);
        const formData = new FormData();
        Object.keys(data).forEach(key => {
            if (key === 'profile_image' && data[key][0]) {
                formData.append('file', data[key][0]);
            } else {
                formData.append(key, data[key]);
            }
        });

        try {
            await api.put('/doctor/profile', formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });
            toast.success('Profile updated successfully!');
        } catch (error) {
            toast.error('Update failed. Ensure all fields are valid.');
        } finally {
            setSaving(false);
        }
    };

    if (loading) return <div className="text-center py-20">Loading settings...</div>;

    return (
        <div className="max-w-4xl mx-auto px-4 py-8">
            <h1 className="text-3xl font-extrabold text-slate-800 mb-2 uppercase tracking-tight">Profile Settings</h1>
            <p className="text-slate-500 mb-8">This information is visible to your patients on the public site.</p>

            <form onSubmit={handleSubmit(onSubmit)} className="bg-white rounded-3xl shadow-xl overflow-hidden border">
                <div className="p-8 space-y-8">
                    {/* Header/Image Section */}
                    <div className="flex flex-col md:flex-row gap-8 items-center border-b pb-8">
                        <div className="w-32 h-32 rounded-2xl bg-slate-100 overflow-hidden border-4 border-white shadow-lg shrink-0">
                            <img src={previewImage} alt="Preview" className="w-full h-full object-cover" />
                        </div>
                        <div className="flex-grow w-full">
                            <label className="block text-xs font-bold uppercase text-slate-400 mb-2">Change Profile Photo</label>
                            <input
                                type="file"
                                {...register('profile_image')}
                                className="block w-full text-sm text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 transition"
                            />
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="md:col-span-2">
                            <label className="block text-xs font-bold uppercase text-slate-400 mb-1">Full Name</label>
                            <input
                                {...register('full_name', { required: true })}
                                className="w-full p-3 bg-gray-50 border rounded-xl outline-none focus:border-blue-500 font-bold"
                            />
                        </div>
                        <div>
                            <label className="block text-xs font-bold uppercase text-slate-400 mb-1">Specialization</label>
                            <input
                                {...register('specialization', { required: true })}
                                className="w-full p-3 bg-gray-50 border rounded-xl outline-none focus:border-blue-500"
                            />
                        </div>
                        <div>
                            <label className="block text-xs font-bold uppercase text-slate-400 mb-1">Experience (Years)</label>
                            <input
                                type="number"
                                {...register('experience_years', { required: true })}
                                className="w-full p-3 bg-gray-50 border rounded-xl outline-none focus:border-blue-500"
                            />
                        </div>
                        <div className="md:col-span-2">
                            <label className="block text-xs font-bold uppercase text-slate-400 mb-1">Qualifications (Comma separated)</label>
                            <input
                                {...register('qualifications', { required: true })}
                                className="w-full p-3 bg-gray-50 border rounded-xl outline-none focus:border-blue-500"
                                placeholder="MBBS, FCPS, etc."
                            />
                        </div>
                        <div>
                            <label className="block text-xs font-bold uppercase text-slate-400 mb-1">Consultation Fee (Rs.)</label>
                            <input
                                type="number"
                                {...register('consultation_fee', { required: true })}
                                className="w-full p-3 bg-gray-50 border rounded-xl outline-none focus:border-blue-500 font-extrabold text-blue-600"
                            />
                        </div>
                        <div className="md:col-span-2">
                            <label className="block text-xs font-bold uppercase text-slate-400 mb-1">Bio / About Me</label>
                            <textarea
                                {...register('bio')}
                                rows="4"
                                className="w-full p-3 bg-gray-50 border rounded-xl outline-none focus:border-blue-500 italic text-slate-600"
                            />
                        </div>
                    </div>
                </div>

                <div className="bg-slate-50 p-6 flex justify-end gap-4 border-t">
                    <button
                        type="button"
                        onClick={() => window.location.reload()}
                        className="text-slate-400 font-bold uppercase tracking-wider text-xs hover:text-slate-600"
                    >
                        Discard Changes
                    </button>
                    <button
                        type="submit"
                        disabled={saving}
                        className="bg-blue-600 text-white px-10 py-3 rounded-xl font-bold shadow-lg hover:bg-blue-700 transition disabled:bg-gray-400"
                    >
                        {saving ? 'Saving...' : 'Update Public Profile'}
                    </button>
                </div>
            </form>
        </div>
    );
};

export default ProfileSettings;
