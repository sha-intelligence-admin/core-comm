"use client";

import React, { useCallback, useState } from "react";
import { ArrowUpRight, MenuIcon, User2, X } from "lucide-react";

interface HeaderProps {
    className?: string;
}

const Header: React.FC<HeaderProps> = ({ className = "" }) => {
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

    const toggleMobileMenu = () => {
        setIsMobileMenuOpen(!isMobileMenuOpen);
    };

    const handleDemoClick = useCallback(() => {
        window.location.href = '/demo';
    }, []);

    return (
        <header className={`p-8 px-4 sticky top-0 z-50 ${className}`}>
            <div className="max-w-7xl bg-white rounded-full p-1 mx-auto flex items-center justify-between relative">
                {/* Logo */}
                <div className="flex items-center gap-2">
                    <a href="/" className="flex items-center gap-2">
                        <img src="/logo.png" alt="Logo" className="h-10" />
                        <span className="text-electricBlue font-extrabold text-lg font-poppins pr-2">
                            CoreComm
                        </span>
                    </a>

                    {/* Navigation Links */}
                    <nav className="hidden lg:flex items-center space-x-8">
                        <a
                            href="/pricing"
                            className="text-deepBlue hover:text-electricBlue transition-colors duration-200 font-medium"
                        >
                            Pricing
                        </a>
                        <a
                            href="/documentation"
                            className="text-deepBlue hover:text-electricBlue transition-colors duration-200 font-medium"
                        >
                            Documentation
                        </a>
                        <a
                            href="/demo"
                            className="text-deepBlue hover:text-electricBlue transition-colors duration-200 font-medium"
                        >
                            Demo
                        </a>
                    </nav>
                </div>

                {/* CTA Buttons */}
                <div className="hidden lg:flex items-center space-x-4">
                    <button 
                    onClick={() => window.location.href = '/signup'}
                    className="flex text-deepBlue hover:text-electricBlue transition-colors duration-200 font-medium">

                        <User2 />
                        Sign Up
                    </button>
                    <button
                    onClick={handleDemoClick}
                    className="group bg-electricBlue hover:bg-aquaGlow hover:text-deepBlue text-white px-1 pl-4 py-1 rounded-full font-medium transition-all duration-200 flex items-center gap-2 shadow-lg hover:shadow-xl">
                        Consult with an expert
                        <div className="flex items-center justify-center rounded-full bg-deepBlue p-2 transition-colors duration-200">
                            <ArrowUpRight className="w-4 h-4 text-white group-hover:text-white" />
                        </div>
                    </button>
                </div>

                {/* Mobile Menu Button */}
                <button
                    onClick={toggleMobileMenu}
                    className="lg:hidden px-2 py-2 text-white bg-deepBlue rounded-full relative"
                >
                    {/* Smooth icon swap */}
                    <MenuIcon
                        className={` w-5 h-5 transition-all duration-300 ${isMobileMenuOpen
                            ? "opacity-0 scale-75 rotate-90"
                            : "opacity-100 scale-100 rotate-0"
                            }`}
                    />
                    <X
                        className={`top-2 absolute w-5 h-5 transition-all duration-300 ${isMobileMenuOpen
                            ? "opacity-100 scale-100 rotate-0"
                            : "opacity-0 scale-75 -rotate-90"
                            }`}
                    />
                </button>

                {/* Mobile Dropdown with animation */}

            </div>
            <div
                className={`lg:hidden absolute top-[88px] mx-4 left-0 right-0 max-w-7xl bg-white rounded-3xl shadow-2xl border border-gray-100 z-50 overflow-hidden transform transition-all duration-500 ${isMobileMenuOpen
                    ? "opacity-100 translate-y-0 scale-100"
                    : "opacity-0 -translate-y-5 scale-95 pointer-events-none"
                    }`}
            >
                <nav className="py-2 space-y-2">
                    <a
                        href="/pricing"
                        className="block px-4 py-3 text-deepBlue hover:text-electricBlue transition-all duration-200 font-medium"
                        onClick={() => setIsMobileMenuOpen(false)}
                    >
                        Pricing
                    </a>
                    <a
                        href="/documentation"
                        className="block px-4 py-3 text-deepBlue hover:text-electricBlue transition-all duration-200 font-medium"
                        onClick={() => setIsMobileMenuOpen(false)}
                    >
                        Documentation
                    </a>
                    <a
                        href="/demo"
                        className="block px-4 py-3 text-deepBlue hover:text-electricBlue transition-all duration-200 font-medium"
                        onClick={() => setIsMobileMenuOpen(false)}
                    >
                        Demo
                    </a>
                    <a
                        href="/signup"
                        className="flex items-center px-4 py-3 text-deepBlue hover:text-electricBlue transition-all duration-200 font-medium"
                        onClick={() => setIsMobileMenuOpen(false)}
                    >
                        Sign Up
                    </a>
                </nav>

                <div className="border-gray-100 p-1 space-y-3">
                    <button
                        className="w-full group bg-electricBlue hover:bg-aquaGlow hover:text-deepBlue text-white p-1 pl-3 rounded-full font-medium transition-all duration-200 flex items-center justify-between gap-2 shadow-lg hover:shadow-xl"
                        onClick={() => { setIsMobileMenuOpen(false); handleDemoClick(); }}
                    >
                        Consult with an expert
                        <div className="flex items-center justify-center rounded-full bg-deepBlue transition-colors duration-200 px-3 py-3">
                            <ArrowUpRight className="w-3 h-3 text-white group-hover:text-white" />
                        </div>
                    </button>
                </div>
            </div>
        </header>
    );
};

export default Header;
