import React from 'react';

const Footer: React.FC = () => {
    return (
        <footer className="bg-[#1A1C2E] text-white py-16 border-t border-slate-800">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-12">
                    {/* Logo & Mission */}
                    <div className="md:col-span-2 space-y-6">
                        <div className="flex items-center gap-2">
                            <div className="w-8 h-8 bg-[#E64833] transform rotate-45 rounded-sm flex items-center justify-center">
                                <span className="-rotate-45 text-white font-bold text-[10px]">OL</span>
                            </div>
                            <span className="text-2xl font-bold tracking-tight text-white">Ottolearn</span>
                        </div>
                        <p className="text-slate-400 max-w-sm leading-relaxed">
                            Ottobon Course Platform is dedicated to providing high-performance, AI-driven education inspired by the Harvard Method of Teaching.
                        </p>
                    </div>

                    {/* Quick Links */}
                    <div className="space-y-4">
                        <h4 className="text-lg font-bold">Platform</h4>
                        <ul className="space-y-2 text-slate-400">
                            <li><a href="/our-courses/cohort" className="hover:text-white transition-colors">Cohort Program</a></li>
                            <li><a href="/methodology" className="hover:text-white transition-colors">Methodology</a></li>
                            <li><a href="/more-info" className="hover:text-white transition-colors">About Us</a></li>
                            <li><a href="/become-a-tutor" className="hover:text-white transition-colors">Become a Tutor</a></li>
                        </ul>
                    </div>

                    {/* Community */}
                    <div className="space-y-4">
                        <h4 className="text-lg font-bold">Connect</h4>
                        <ul className="space-y-2 text-slate-400">
                            <li><a href="https://linkedin.com/company/ottobon" target="_blank" rel="noopener noreferrer" className="hover:text-white transition-colors">LinkedIn</a></li>
                            <li><a href="https://twitter.com/ottobon" target="_blank" rel="noopener noreferrer" className="hover:text-white transition-colors">Twitter</a></li>
                            <li><a href="https://github.com/ottobon" target="_blank" rel="noopener noreferrer" className="hover:text-white transition-colors">GitHub</a></li>
                        </ul>
                    </div>
                </div>

                <div className="pt-8 border-t border-slate-800 flex flex-col md:flex-row justify-between items-center gap-6">
                    {/* Copyright */}
                    <div className="text-sm text-slate-400">
                        © 2026 Ottobon Inc. All rights reserved.
                    </div>

                    {/* Legal Links */}
                    <div className="flex items-center gap-8 text-sm font-medium text-slate-400">
                        <a href="/privacy" className="hover:text-white transition-colors">Privacy Policy</a>
                        <a href="/terms" className="hover:text-white transition-colors">Terms of Service</a>
                    </div>
                </div>
            </div>
        </footer>
    );
};

export default Footer;
