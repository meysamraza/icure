const Footer = () => {
    return (
        <footer className="bg-gray-800 text-white py-8 mt-auto">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    <div>
                        <h3 className="text-xl font-bold mb-4">iCure</h3>
                        <p className="text-gray-400">Professional healthcare at your fingertips. Book your appointment today.</p>
                    </div>
                    <div>
                        <h4 className="text-lg font-semibold mb-4">Quick Links</h4>
                        <ul className="space-y-2">
                            <li><a href="/about" className="text-gray-400 hover:text-white">About Us</a></li>
                            <li><a href="/all-reviews" className="text-gray-400 hover:text-white">Patient Reviews</a></li>
                            <li><a href="/contact" className="text-gray-400 hover:text-white">Contact</a></li>
                        </ul>
                    </div>
                    <div>
                        <h4 className="text-lg font-semibold mb-4">Contact Info</h4>
                        <p className="text-gray-400">WhatsApp: +92 300 9436807</p>
                        <p className="text-gray-400">Hours: Mon-Sat, 10 AM - 10 PM</p>
                    </div>
                </div>
                <div className="border-t border-gray-700 mt-8 pt-8 text-center text-gray-400">
                    <p>&copy; {new Date().getFullYear()} iCure Doctor Appointment System. All rights reserved.</p>
                </div>
            </div>
        </footer>
    );
};

export default Footer;
