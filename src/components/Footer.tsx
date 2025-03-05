import React from 'react';
import { Move } from 'lucide-react';
import {
    FaFacebook,
    FaTwitter,
    FaInstagram,
    FaLinkedin,
    FaEnvelope,
    FaPhoneAlt
} from 'react-icons/fa';

interface FooterProps {
    scrollToSection: (sectionId: string) => void;
}

const Footer: React.FC<FooterProps> = ({ scrollToSection }) => {
    return (
        <footer className="bg-black text-white py-12 px-6 relative z-10">
            <div className="container mx-auto grid grid-cols-1 md:grid-cols-4 gap-8">
                {/* Logo and Branding */}
                <div className="flex flex-col">
                    <div className="flex items-center mb-4">
                        <Move className="h-8 w-8 text-purple-300" />
                        <span className="ml-3 text-xl font-bold">FitMaster AI</span>
                    </div>
                    <p className="text-sm text-gray-300">
                        Experience the next evolution of fitness with AI-powered guidance and real-time form correction.
                    </p>
                </div>

                {/* Quick Links */}
                <div>
                    <h4 className="font-bold mb-4">Quick Links</h4>
                    <ul className="space-y-2">
                        <li>
                            <button
                                onClick={() => scrollToSection('home')}
                                className="hover:text-purple-500 text-left w-full"
                            >
                                Home
                            </button>
                        </li>
                        <li>
                            <button
                                onClick={() => scrollToSection('features')}
                                className="hover:text-purple-500 text-left w-full"
                            >
                                Features
                            </button>
                        </li>
                        <li>
                            <button
                                onClick={() => scrollToSection('pricing')}
                                className="hover:text-purple-500 text-left w-full"
                            >
                                Pricing
                            </button>
                        </li>
                        <li>
                            <button
                                onClick={() => scrollToSection('blog')}
                                className="hover:text-purple-500 text-left w-full"
                            >
                                Blog
                            </button>
                        </li>
                    </ul>
                </div>

                {/* Legal Links */}
                <div>
                    <h4 className="font-bold mb-4">Legal</h4>
                    <ul className="space-y-2">
                        <li><a href="/privacy" className="hover:text-purple-500">Privacy Policy</a></li>
                        <li><a href="/terms" className="hover:text-purple-500">Terms of Service</a></li>
                        <li><a href="/cookies" className="hover:text-purple-500">Cookie Policy</a></li>
                    </ul>
                </div>

                {/* Contact Information */}
                <div>
                    <h4 className="font-bold mb-4">Contact Us</h4>
                    <div className="space-y-2">
                        <div className="flex items-center">
                            <FaEnvelope className="mr-2" />
                            <a href="mailto:support@fitmasterai.com" className="hover:text-purple-500">
                                support@fitmasterai.com
                            </a>
                        </div>
                        <div className="flex items-center">
                            <FaPhoneAlt className="mr-2" />
                            <a href="tel:+1234567890" className="hover:text-purple-500">
                                +1 (234) 567-890
                            </a>
                        </div>
                    </div>

                    {/* Social Media Icons */}
                    <div className="mt-4 flex space-x-4">
                        <a href="https://facebook.com/fitmasterai" target="_blank" rel="noopener noreferrer">
                            <FaFacebook className="text-2xl hover:text-purple-500" />
                        </a>
                        <a href="https://twitter.com/fitmasterai" target="_blank" rel="noopener noreferrer">
                            <FaTwitter className="text-2xl hover:text-purple-500" />
                        </a>
                        <a href="https://instagram.com/fitmasterai" target="_blank" rel="noopener noreferrer">
                            <FaInstagram className="text-2xl hover:text-purple-500" />
                        </a>
                        <a href="https://linkedin.com/company/fitmasterai" target="_blank" rel="noopener noreferrer">
                            <FaLinkedin className="text-2xl hover:text-purple-500" />
                        </a>
                    </div>
                </div>
            </div>

            {/* Copyright */}
            <div className="text-center mt-8 pt-4 border-t border-gray-800">
                <p className="text-sm text-gray-400">
                    © {new Date().getFullYear()} FitMaster AI. All Rights Reserved.
                </p>
            </div>
        </footer>
    );
};

export default Footer;