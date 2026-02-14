const Contact = () => {
    return (
        <div className="max-w-4xl mx-auto px-4 py-20">
            <div className="bg-white rounded-3xl shadow-xl overflow-hidden flex flex-col md:flex-row border">
                <div className="md:w-1/2 bg-blue-600 p-12 text-white flex flex-col justify-center">
                    <h1 className="text-4xl font-bold mb-6">Get in Touch</h1>
                    <p className="text-blue-100 text-lg mb-8">
                        Whether you have a medical query or want to schedule an appointment, we're here to help.
                    </p>
                    <div className="space-y-6">
                        <div className="flex items-center gap-4">
                            <div className="bg-blue-500 p-3 rounded-full text-2xl">📞</div>
                            <div>
                                <p className="text-blue-200 text-sm uppercase tracking-wider font-bold">Call Us</p>
                                <p className="text-xl font-bold">+92 300 9436807</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-4">
                            <div className="bg-blue-500 p-3 rounded-full text-2xl">💬</div>
                            <div>
                                <p className="text-blue-200 text-sm uppercase tracking-wider font-bold">WhatsApp</p>
                                <p className="text-xl font-bold">+92 300 9436807</p>
                            </div>
                        </div>
                    </div>
                </div>
                <div className="md:w-1/2 p-12">
                    <h2 className="text-2xl font-bold text-gray-800 mb-6 border-b pb-2">Consultation Hours</h2>
                    <div className="space-y-4">
                        <div className="flex justify-between items-center bg-gray-50 p-4 rounded-xl">
                            <span className="font-semibold text-gray-700">Monday - Saturday</span>
                            <span className="text-blue-600 font-bold">10 AM - 10 PM</span>
                        </div>
                        <div className="flex justify-between items-center bg-gray-50 p-4 rounded-xl">
                            <span className="font-semibold text-gray-700">Sunday</span>
                            <span className="text-red-500 font-bold italic">Closed</span>
                        </div>
                    </div>
                    <div className="mt-12">
                        <h3 className="text-lg font-bold mb-4">Location</h3>
                        <p className="text-gray-600 italic">Online & Call Consultations available everywhere. Private clinic visits by appointment only.</p>
                        <div className="mt-8">
                            <a
                                href="https://wa.me/923009436807?text=Hello%20Dr.%20Noreen,%20I%20have%20a%20question"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="w-full bg-green-500 text-white py-4 rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-green-600 transition shadow-lg"
                            >
                                Chat on WhatsApp
                            </a>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Contact;
