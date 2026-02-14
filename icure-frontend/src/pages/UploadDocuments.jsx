import { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import api from '../utils/api';

const UploadDocuments = () => {
    const [documents, setDocuments] = useState([]);
    const [file, setFile] = useState(null);
    const [uploading, setUploading] = useState(false);
    const [loading, setLoading] = useState(true);

    const fetchDocuments = async () => {
        try {
            const res = await api.get('/documents/my-documents');
            setDocuments(res.data);
        } catch (error) {
            console.error('Error fetching documents:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchDocuments();
    }, []);

    const handleFileChange = (e) => {
        setFile(e.target.files[0]);
    };

    const handleUpload = async (e) => {
        e.preventDefault();
        if (!file) return;

        const formData = new FormData();
        formData.append('file', file);

        setUploading(true);
        try {
            await api.post('/documents/upload', formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });
            toast.success('File uploaded successfully!');
            setFile(null);
            fetchDocuments();
        } catch (error) {
            toast.error('Upload failed. Please try again.');
        } finally {
            setUploading(false);
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm('Are you sure you want to delete this document?')) return;

        try {
            await api.delete(`/documents/${id}`);
            toast.success('Document deleted.');
            setDocuments(prev => prev.filter(d => d.id !== id));
        } catch (error) {
            toast.error('Failed to delete document.');
        }
    }

    return (
        <div className="max-w-4xl mx-auto px-4 py-12">
            <h1 className="text-3xl font-extrabold text-gray-900 mb-2">Medical Records</h1>
            <p className="text-gray-600 mb-10">Upload your lab reports, prescriptions, or any relevant health documents.</p>

            {/* Upload Box */}
            <div className="bg-white rounded-3xl shadow-xl p-8 mb-12 border-2 border-dashed border-blue-200">
                <form onSubmit={handleUpload} className="space-y-6">
                    <div className="text-center">
                        <input
                            type="file"
                            onChange={handleFileChange}
                            id="file-upload"
                            className="hidden"
                            accept=".pdf,image/*"
                        />
                        <label
                            htmlFor="file-upload"
                            className="cursor-pointer inline-flex flex-col items-center justify-center p-10 bg-blue-50 rounded-2xl hover:bg-blue-100 transition border-2 border-blue-100 mb-4"
                        >
                            <span className="text-4xl mb-4">📁</span>
                            <span className="font-bold text-blue-800">{file ? file.name : 'Tap to select a document'}</span>
                            <span className="text-xs text-blue-500 mt-2 uppercase tracking-wide">PDF, PNG, JPG (Max 5MB)</span>
                        </label>
                    </div>

                    <button
                        type="submit"
                        disabled={!file || uploading}
                        className="w-full bg-blue-600 text-white py-4 rounded-xl font-bold hover:bg-blue-700 transition disabled:bg-gray-200 disabled:text-gray-400 shadow-md"
                    >
                        {uploading ? 'Uploading to Portal...' : file ? `Upload "${file.name}"` : 'Select a File to Start'}
                    </button>
                </form>
            </div>

            {/* List Box */}
            <div className="bg-white rounded-3xl shadow-xl p-8 border">
                <h3 className="text-xl font-bold mb-8">Your Archive</h3>
                {loading ? (
                    <div className="text-center py-10 text-gray-400">Fetching records...</div>
                ) : documents.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {documents.map((doc) => (
                            <div key={doc.id} className="p-4 bg-gray-50 rounded-2xl border flex items-center justify-between group">
                                <div className="flex items-center gap-4 overflow-hidden">
                                    <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center text-xl shrink-0">📄</div>
                                    <div className="truncate">
                                        <p className="font-bold text-gray-800 truncate">{doc.file_name}</p>
                                        <p className="text-xs text-gray-400">{new Date(doc.created_at).toLocaleDateString()}</p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-2">
                                    <a
                                        href={doc.file_url}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="p-2 text-blue-600 hover:bg-white rounded-lg transition font-bold text-xs uppercase"
                                    >
                                        View
                                    </a>
                                    <button
                                        onClick={() => handleDelete(doc.id)}
                                        className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition"
                                        title="Delete"
                                    >
                                        🗑️
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="text-center py-20 text-gray-400 italic">No medical records uploaded yet.</div>
                )}
            </div>
        </div>
    );
};

export default UploadDocuments;
