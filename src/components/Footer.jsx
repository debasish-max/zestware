import { MessageCircle, Instagram, Twitter, Mail, MapPin, Phone, Globe } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function Footer() {
    return (
        <footer className="bg-gray-950 text-white pt-20 pb-10 px-4 md:px-8 border-t border-gray-900">
            <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-16">
                {/* Brand Section */}
                <div className="space-y-6">
                    <h2 className="text-4xl font-black tracking-tighter uppercase italic">
                        ZEST<span className="text-gray-600">WEAR</span>
                    </h2>
                    <p className="text-gray-400 text-sm font-medium leading-relaxed max-w-sm">
                        Defining the next generation of premium streetwear. Bold designs for those who live life in the fast lane. Crafted with precision and passion.
                    </p>
                </div>

                {/* Social Section */}
                <div>
                    <h3 className="text-sm font-black uppercase tracking-widest mb-8 text-gray-500">Follow Our Journey</h3>
                    <div className="space-y-4">
                        <a href="https://www.instagram.com/zestwearindiaofficial/" className="flex items-center gap-3 text-gray-400 hover:text-white transition-all group font-bold text-sm w-fit">
                            <div className="w-8 h-8 rounded-lg bg-gray-900 border border-gray-800 flex items-center justify-center group-hover:border-white group-hover:bg-white group-hover:text-black transition-all">
                                <Instagram size={16} />
                            </div>
                            Instagram
                        </a>
                        <a href="https://chat.whatsapp.com/B5rKZPNL80yCTTZmX6lkvh" className="flex items-center gap-3 text-gray-400 hover:text-white transition-all group font-bold text-sm w-fit">
                            <div className="w-8 h-8 rounded-lg bg-gray-900 border border-gray-800 flex items-center justify-center group-hover:border-white group-hover:bg-white group-hover:text-black transition-all">
                                <MessageCircle size={16} />
                            </div>
                            WhatsApp Community
                        </a>
                        <a href="" className="flex items-center gap-3 text-gray-400 hover:text-white transition-all group font-bold text-sm w-fit">
                            <div className="w-8 h-8 rounded-lg bg-gray-900 border border-gray-800 flex items-center justify-center group-hover:border-white group-hover:bg-white group-hover:text-black transition-all">
                                <Twitter size={16} />
                            </div>
                            Twitter
                        </a>
                    </div>
                </div>

                {/* Explore Section */}
                <div>
                    <h3 className="text-sm font-black uppercase tracking-widest mb-8 text-gray-500">Explore</h3>
                    <div className="space-y-4 flex flex-col">
                        <Link to="/" className="text-gray-400 hover:text-brand transition-colors text-sm font-bold">Home</Link>
                        <Link to="/contact" className="text-gray-400 hover:text-brand transition-colors text-sm font-bold">Contact Us</Link>
                        <Link to="/terms" className="text-gray-400 hover:text-brand transition-colors text-sm font-bold">Terms & Conditions</Link>
                        <Link to="/privacy-policy" className="text-gray-400 hover:text-brand transition-colors text-sm font-bold">Privacy Policy</Link>
                    </div>
                </div>

                {/* Contact Section */}
                <div className="space-y-6">
                    <h3 className="text-sm font-black uppercase tracking-widest mb-8 text-gray-500">Contact Us</h3>
                    <div className="space-y-5">
                        <div className="flex items-center gap-4 text-gray-400 text-sm font-bold">
                            <div className="w-8 h-8 rounded-lg bg-gray-900 flex items-center justify-center shrink-0 border border-gray-800">
                                <MapPin size={16} />
                            </div>
                            <span>Jorhat, Assam, India</span>
                        </div>
                        <div className="flex items-center gap-4 text-gray-400 text-sm font-bold">
                            <div className="w-8 h-8 rounded-lg bg-gray-900 flex items-center justify-center shrink-0 border border-gray-800">
                                <Phone size={16} />
                            </div>
                            <span>+91 69011 88826</span>
                        </div>
                        <div className="flex items-center gap-4 text-gray-400 text-sm font-bold">
                            <div className="w-8 h-8 rounded-lg bg-gray-900 flex items-center justify-center shrink-0 border border-gray-800">
                                <Mail size={16} />
                            </div>
                            <span>zestwearindia@gmail.com</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Bottom Bar */}
            <div className="max-w-7xl mx-auto flex flex-col items-center text-center">
                <p className="text-gray-600 text-[10px] font-black uppercase tracking-[0.3em]">
                    © 2026 ZESTWEAR. ALL RIGHTS RESERVED.
                </p>
            </div>
        </footer>
    );
}
