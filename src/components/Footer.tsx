import React, { useState } from 'react';
import { ArrowUp, Sparkles, ArrowRight, CheckCircle2 } from 'lucide-react';
import { BrandLogo } from './BrandLogo';

interface FooterProps {
  onNavigate: (path: string) => void;
  onStartApplication?: (type: 'INDIVIDUAL' | 'BUSINESS') => void;
}

export const Footer: React.FC<FooterProps> = ({ onNavigate, onStartApplication }) => {
  const [email, setEmail] = useState('');
  const [subscribed, setSubscribed] = useState(false);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault();
    if (email.trim()) {
      setSubscribed(true);
      setEmail('');
    }
  };

  return (
    <footer className="w-full px-4 sm:px-8 py-10 sm:py-16 max-w-[1360px] mx-auto text-[#102A43]">
      {/* Frosted Glass Card Wrapper */}
      <div className="relative overflow-hidden bg-[#F3F6FA]/90 backdrop-blur-xl rounded-[32px] sm:rounded-[40px] p-6 sm:p-12 md:p-14 shadow-sm flex flex-col justify-between min-h-[520px]">
        
        {/* Faded Outer Border Overlay - smoothly fades away towards the bottom */}
        <div 
          className="absolute inset-0 rounded-[32px] sm:rounded-[40px] border border-slate-300/80 pointer-events-none z-20"
          style={{
            WebkitMaskImage: 'linear-gradient(to bottom, rgba(0,0,0,1) 0%, rgba(0,0,0,0.7) 45%, rgba(0,0,0,0) 85%)',
            maskImage: 'linear-gradient(to bottom, rgba(0,0,0,1) 0%, rgba(0,0,0,0.7) 45%, rgba(0,0,0,0) 85%)'
          }}
        />

        {/* Soft Bottom Fade Overlay into Page Background */}
        <div className="absolute inset-x-0 bottom-0 h-32 bg-gradient-to-b from-transparent to-[#F3F6FA]/80 pointer-events-none z-0" />
        
        {/* Soft Background Aurora Glow inside Footer Card */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden -z-0">
          <div className="absolute -bottom-20 left-1/2 -translate-x-1/2 w-[80%] h-[320px] bg-gradient-to-r from-blue-300/30 via-indigo-300/20 to-purple-300/30 blur-[90px] rounded-full pointer-events-none" />
        </div>

        <div className="relative z-10 flex flex-col h-full justify-between space-y-12 sm:space-y-16">
          
          {/* Top Row: Logo & Back to Top */}
          <div className="flex items-center justify-between pb-6 border-b border-slate-200/60">
            <div className="flex items-center gap-2.5 cursor-pointer group" onClick={() => onNavigate('/')}>
              <BrandLogo size={36} />
              <span className="font-extrabold text-xl sm:text-2xl tracking-tight text-[#0B0B0F]">
                AkoFinanced <span className="text-[#2D62FF]">It</span>
              </span>
            </div>

            <button
              onClick={scrollToTop}
              className="inline-flex items-center gap-1.5 text-xs sm:text-sm font-semibold text-[#5A5F71] hover:text-[#2D62FF] transition-colors group cursor-pointer"
            >
              <ArrowUp className="w-4 h-4 text-[#8F95A5] group-hover:-translate-y-0.5 group-hover:text-[#2D62FF] transition-transform" />
              <span>Back to Top</span>
            </button>
          </div>

          {/* Middle Content Section */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-8 items-start">
            
            {/* Left Info Column */}
            <div className="lg:col-span-6 space-y-6">
              <p className="text-sm sm:text-base text-[#5A5F71] leading-relaxed max-w-md font-medium">
                AkoFinanced It gives every business and individual a personal financing advisory team, signal-aware, always on, zero overhead.
              </p>

              <div className="space-y-1 text-xs sm:text-sm text-[#5A5F71]">
                <p className="font-bold text-[#0B0B0F]">Address:</p>
                <p className="text-[#8F95A5]">
                  Plot 12, Commercial Avenue, Victoria Island, Lagos, Nigeria
                </p>
              </div>
            </div>

            {/* Right Links & Newsletter Column */}
            <div className="lg:col-span-6 flex flex-col justify-between space-y-8">
              
              {/* Nav Links Grid */}
              <div className="grid grid-cols-3 gap-4 sm:gap-8">
                {/* Resources */}
                <div className="space-y-3">
                  <h4 className="text-xs sm:text-sm font-bold text-[#102A43]">
                    Resources
                  </h4>
                  <ul className="space-y-2 text-xs sm:text-sm text-slate-500 font-medium">
                    <li>
                      <button onClick={() => onNavigate('/faqs')} className="hover:text-[#102A43] transition-colors cursor-pointer">
                        Eligibility FAQs
                      </button>
                    </li>
                    <li>
                      <button onClick={() => onNavigate('/how-it-works')} className="hover:text-[#102A43] transition-colors cursor-pointer">
                        How It Works
                      </button>
                    </li>
                  </ul>
                </div>

                {/* Contact */}
                <div className="space-y-3">
                  <h4 className="text-xs sm:text-sm font-bold text-[#102A43]">
                    Contact
                  </h4>
                  <ul className="space-y-2 text-xs sm:text-sm text-slate-500 font-medium">
                    <li>
                      <button onClick={() => onNavigate('/contact')} className="hover:text-[#102A43] transition-colors">
                        General
                      </button>
                    </li>
                    <li>
                      <button onClick={() => onNavigate('/about')} className="hover:text-[#102A43] transition-colors">
                        Press
                      </button>
                    </li>
                    <li>
                      <button onClick={() => onNavigate('/businesses')} className="hover:text-[#102A43] transition-colors">
                        Investors
                      </button>
                    </li>
                  </ul>
                </div>

                {/* Social */}
                <div className="space-y-3">
                  <h4 className="text-xs sm:text-sm font-bold text-[#102A43]">
                    Social
                  </h4>
                  <ul className="space-y-2 text-xs sm:text-sm text-slate-500 font-medium">
                    <li>
                      <a href="https://youtube.com" target="_blank" rel="noopener noreferrer" className="hover:text-[#102A43] transition-colors">
                        YouTube
                      </a>
                    </li>
                    <li>
                      <a href="https://linkedin.com" target="_blank" rel="noopener noreferrer" className="hover:text-[#102A43] transition-colors">
                        LinkedIn
                      </a>
                    </li>
                    <li>
                      <a href="https://twitter.com" target="_blank" rel="noopener noreferrer" className="hover:text-[#102A43] transition-colors">
                        Twitter
                      </a>
                    </li>
                  </ul>
                </div>
              </div>

              {/* Newsletter Block Below Nav Links */}
              <div className="pt-2 space-y-1.5">
                <h4 className="text-sm font-bold text-slate-900">
                  Newsletter
                </h4>
                <p className="text-xs sm:text-sm text-slate-500 font-medium max-w-sm leading-snug">
                  Receive product updates news, exclusive discounts and early access.
                </p>
                {subscribed ? (
                  <div className="inline-flex items-center gap-2 text-xs font-semibold text-[#21C77A] bg-[#21C77A]/10 px-4 py-2.5 rounded-full border border-[#21C77A]/20 mt-2">
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Thank you for subscribing!</span>
                  </div>
                ) : (
                  <form onSubmit={handleSubscribe} className="pt-2">
                    <div className="bg-white rounded-full p-1.5 pl-4 border border-slate-200/90 shadow-xs flex items-center max-w-sm w-full transition-all focus-within:border-slate-400 focus-within:shadow-sm">
                      <span className="text-slate-400 font-normal mr-2 text-sm select-none">@</span>
                      <input
                        type="email"
                        required
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="Enter your email..."
                        className="w-full bg-transparent text-xs sm:text-sm text-slate-800 placeholder-slate-400 focus:outline-none"
                      />
                      <button
                        type="submit"
                        aria-label="Subscribe to newsletter"
                        className="bg-black hover:bg-slate-800 text-white p-2.5 rounded-full transition-all flex items-center justify-center shrink-0 ml-2 cursor-pointer shadow-xs"
                      >
                        <ArrowRight className="w-4 h-4" />
                      </button>
                    </div>
                  </form>
                )}
              </div>

            </div>

          </div>

          {/* Massive Watermark Typography */}
          <div className="relative my-2 sm:my-6 overflow-hidden flex items-center justify-center select-none pointer-events-none">
            <h1 className="text-[10vw] sm:text-[90px] md:text-[120px] lg:text-[140px] font-black tracking-tighter leading-none text-transparent bg-clip-text bg-gradient-to-b from-blue-400/30 via-indigo-400/20 to-purple-400/5 text-center w-full whitespace-nowrap filter blur-[0.4px]">
              AkoFinanced It
            </h1>
          </div>

          {/* Bottom Copyright Bar Divider */}
          <div className="h-px w-full bg-gradient-to-r from-transparent via-slate-300/60 to-transparent" />

          {/* Bottom Copyright Bar */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-2 text-xs text-slate-400 font-medium">
            <div>
              ©2026 AkoFinanced It. All right reserved
            </div>
            <div className="flex items-center gap-4 sm:gap-6">
              <button onClick={() => onNavigate('/terms')} className="hover:text-slate-600 transition-colors">
                Terms of Services
              </button>
              <button onClick={() => onNavigate('/privacy')} className="hover:text-slate-600 transition-colors">
                Privacy Policy
              </button>
              <button onClick={() => onNavigate('/cookies')} className="hover:text-slate-600 transition-colors">
                Cookie Policy
              </button>
              <button onClick={() => onNavigate('/admin')} className="text-[#2D62FF] hover:underline font-semibold transition-colors flex items-center gap-1 cursor-pointer">
                <span>Staff Portal</span>
              </button>
            </div>
          </div>

        </div>
      </div>
    </footer>
  );
};

