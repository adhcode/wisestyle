'use client';

import Link from 'next/link';
import Image from 'next/image';

export default function Footer() {
    return (
        <footer className="bg-[#FEFBF4] text-[#3B2305] font-lora border-t border-[#E5E1D8] mt-12">
            <div className="max-w-[1600px] w-full mx-auto px-4 sm:px-8 lg:px-[120px] py-12">
                <div className="flex flex-col md:flex-row md:justify-between md:items-start gap-10 md:gap-0">
                    {/* Brand & Newsletter */}


                    {/* Navigation Links */}
                    <div className="flex flex-1 flex-col sm:flex-row gap-8 justify-between">
                        <div>
                            <h4 className="text-[18px] font-[500] mb-4 text-[#3B2305]">Policy</h4>
                            <ul className="space-y-3">
                                <li><Link href="/returns-policy" className="hover:text-[#C97203] text-[14px] font-[400] text-[#3B2305]">Returns & Refunds</Link></li>
                                <li><Link href="/shipping-policy" className="hover:text-[#C97203] text-[14px] font-[400] text-[#3B2305]">Shipping & Delivery</Link></li>
                                <li><Link href="/privacy-policy" className="hover:text-[#C97203] text-[14px] font-[400] text-[#3B2305]">Privacy Policy</Link></li>
                                <li><Link href="/terms-conditions" className="hover:text-[#C97203] text-[14px] font-[400] text-[#3B2305]">Terms & Conditions</Link></li>
                            </ul>
                        </div>
                        <div>
                            <h4 className="text-[18px] font-[500] mb-4 text-[#3B2305]">Customer Service</h4>
                            <ul className="space-y-3">
                                <li><Link href="/contact" className="hover:text-[#C97203] text-[14px] font-[400] text-[#3B2305]">Contact</Link></li>
                                <li><Link href="/faqs" className="hover:text-[#C97203] text-[14px] font-[400] text-[#3B2305]">Faqs</Link></li>

                            </ul>
                        </div>
                        <div>
                            <h4 className="text-[18px] font-[500] mb-4 text-[#3B2305]">About</h4>
                            <ul className="space-y-3">
                                <li><Link href="/about" className="hover:text-[#C97203] text-[14px] font-[400] text-[#3B2305]">Our Story</Link></li>
                            </ul>
                        </div>

                        <div className="flex items-center gap-6">
                            <a href="https://facebook.com" target="_blank" rel="noopener noreferrer" className="hover:opacity-80">
                                <Image src="/images/icons/instagram.png" alt="Facebook" width={18} height={18} />
                            </a>
                            <a href="https://instagram.com" target="_blank" rel="noopener noreferrer" className="hover:opacity-80">
                                <Image src="/images/icons/facebook.png" alt="Instagram" width={18} height={18} />
                            </a>
                            <a href="https://tiktok.com" target="_blank" rel="noopener noreferrer" className="hover:opacity-80">
                                <Image src="/images/icons/tiktok.png" alt="TikTok" width={18} height={18} />
                            </a>
                        </div>
                    </div>
                </div>

                


            </div>
        </footer>
    );
} 