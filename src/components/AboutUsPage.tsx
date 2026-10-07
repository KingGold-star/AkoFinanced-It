import React, { useRef } from 'react';
import { motion } from 'motion/react';
import {
  ArrowRight,
  ArrowDown,
  Shield,
  Sparkles,
  Scale,
  Gift,
  CheckCircle2,
  Users,
  Award,
  Zap
} from 'lucide-react';

interface AboutUsPageProps {
  onStartApplication: (type: 'INDIVIDUAL' | 'BUSINESS') => void;
  onNavigate?: (page: string) => void;
}

export const AboutUsPage: React.FC<AboutUsPageProps> = ({ onStartApplication, onNavigate }) => {
  const missionRef = useRef<HTMLDivElement>(null);

  const scrollToMission = () => {
    missionRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const values = [
    {
      icon: Shield,
      title: 'Addressing Financial Vulnerability',
      description:
        'Recent studies show that nearly 50% of people are less than a few weeks away from being unable to meet their monthly obligations. We aim to provide a safe and fair alternative to traditional predatory loans, which often come with confusing terms and exorbitant rates that trap borrowers in a cycle of debt.'
    },
    {
      icon: Sparkles,
      title: 'Combining Fun With Financial Support',
      description:
        "We've taken the excitement of prize-linked savings and rewards and combined it with personal and SME loans that offer better rates and cash rewards. With AkoFinanced It, you get your loan and the chance to win cash rebates. We pool a portion of the revenue we earn from lending and pay it out to lucky customers through weekly cash-prize draws."
    },
    {
      icon: Scale,
      title: 'Ensuring Transparency & Fairness',
      description:
        'Many payday lenders lack transparency and charge hidden fees, leaving borrowers worse off. At AkoFinanced It, we prioritize clear terms and conditions, ensuring our customers understand their loan conditions, monthly payback amounts, and repayment schedules with zero surprises.'
    },
    {
      icon: Gift,
      title: 'Redirecting Marketing Dollars to Customers',
      description:
        'Unlike traditional lenders who spend heavily on predatory ads, we reinvest our marketing budget directly back into our customers through weekly cash prize draws and reward them for sharing their positive experiences with friends, helping us grow sustainably.'
    }
  ];

  return (
    <div className="w-full bg-white text-[#0B0B0F]">
      {/* ================= 1. HERO SECTION ================= */}
      <section className="pt-12 pb-6 sm:pt-16 sm:pb-8 text-center relative overflow-hidden">
        <div className="max-w-4xl mx-auto px-4 sm:px-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="space-y-6"
          >
            <h1 className="text-4xl sm:text-6xl lg:text-7xl font-black tracking-tight text-[#0B0B0F] leading-[1.1]">
              We’re <span className="text-[#2D62FF]">Redefining</span> Borrowing
            </h1>

            <p className="text-base sm:text-lg text-[#5A5F71] max-w-2xl mx-auto leading-relaxed">
              Learn about our mission to transform the small value loan industry, the core values that drive us, and how we make borrowing a transparent, empowering, and rewarding experience for everyone.
            </p>

            {/* Dual CTA Buttons */}
            <div className="flex flex-wrap justify-center items-center gap-4 pt-2">
              <motion.button
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => onStartApplication('INDIVIDUAL')}
                className="px-8 py-4 rounded-[12px] bg-[#2D62FF] text-white font-extrabold text-sm shadow-md hover:bg-[#1a4edf] hover:shadow-lg transition-all cursor-pointer flex items-center gap-2"
              >
                <span>Apply Now</span>
                <ArrowRight className="w-4 h-4 text-white" />
              </motion.button>

              <motion.button
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.98 }}
                onClick={scrollToMission}
                className="px-8 py-4 rounded-[12px] bg-white border border-slate-300 hover:border-slate-400 text-[#0B0B0F] font-extrabold text-sm transition-all cursor-pointer"
              >
                Learn More
              </motion.button>
            </div>

            {/* Scroll Down Indicator */}
            <div className="pt-3 flex justify-center">
              <button
                onClick={scrollToMission}
                aria-label="Scroll to mission section"
                className="w-9 h-9 rounded-full border border-slate-200 hover:border-[#2D62FF] hover:text-[#2D62FF] text-slate-400 flex items-center justify-center transition-all cursor-pointer"
              >
                <ArrowDown className="w-4 h-4 animate-bounce" />
              </button>
            </div>
          </motion.div>
        </div>
      </section>

      {/* ================= 2. OUR MISSION SECTION ================= */}
      <section ref={missionRef} className="pt-4 pb-16 sm:pt-6 sm:pb-24 bg-white">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Header Row: Left Title vs Right Paragraph & CTA */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-16 items-start mb-12 lg:mb-16">
            <motion.div
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.3 }}
              transition={{ duration: 0.6 }}
              className="lg:col-span-6 space-y-3"
            >
              <div className="text-xs font-black uppercase tracking-[0.2em] text-[#2D62FF]">
                OUR MISSION
              </div>
              <h2 className="text-3xl sm:text-5xl font-black text-[#0B0B0F] tracking-tight leading-tight">
                We Make Accessing Emergency Funds Quick, Easy, And Rewarding
              </h2>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.3 }}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="lg:col-span-6 space-y-6 lg:pt-6"
            >
              <p className="text-base sm:text-lg text-[#5A5F71] leading-relaxed">
                At AkoFinanced It, we believe everyone is worthy of positive financial dignity and growing net worth. We're on a mission to promote financial inclusion and incentivize responsible borrowing. We're working to improve the way people borrow by sharing lending profits back with the people!
              </p>
              <div>
                <motion.button
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => onStartApplication('INDIVIDUAL')}
                  className="px-7 py-3.5 rounded-[12px] bg-white border border-slate-300 hover:border-slate-400 text-[#0B0B0F] font-bold text-sm shadow-sm transition-all cursor-pointer flex items-center gap-2"
                >
                  <span>Apply Now</span>
                  <ArrowRight className="w-4 h-4 text-slate-600" />
                </motion.button>
              </div>
            </motion.div>
          </div>

          {/* Full-width Mission Lifestyle Banner */}
          <motion.div
            initial={{ opacity: 0, scale: 0.98 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true, amount: 0.3 }}
            transition={{ duration: 0.7 }}
            className="rounded-[28px] overflow-hidden shadow-2xl border-4 border-white bg-slate-100 relative"
          >
            <img
              src="https://images.unsplash.com/photo-1529156069898-49953e39b3ac?auto=format&fit=crop&q=80&w=1600"
              alt="Friends smiling and using mobile phone together"
              className="w-full h-80 sm:h-[460px] lg:h-[520px] object-cover object-center"
            />
          </motion.div>
        </div>
      </section>

      {/* ================= 3. OUR VALUES SECTION (The Commitments That Drive Us) ================= */}
      <section className="py-20 sm:py-32 border-t border-slate-100 bg-white">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-start">
            {/* Left Column */}
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true, amount: 0.3 }}
              transition={{ duration: 0.6 }}
              className="lg:col-span-5 space-y-6 lg:sticky lg:top-28"
            >
              <div className="text-xs font-black uppercase tracking-[0.2em] text-[#2D62FF]">
                OUR VALUES
              </div>
              <h2 className="text-3xl sm:text-5xl font-black text-[#0B0B0F] tracking-tight leading-tight">
                The Commitments That Drive Us
              </h2>
              <p className="text-base text-[#5A5F71] leading-relaxed">
                We're dedicated to providing a solution that not only addresses the immediate financial needs of our customers but also brings excitement, integrity, and transparency to the borrowing process.
              </p>
              <div className="pt-2">
                <motion.button
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => onStartApplication('INDIVIDUAL')}
                  className="px-8 py-4 rounded-[12px] bg-[#2D62FF] text-white font-extrabold text-sm shadow-md hover:bg-[#1a4edf] transition-all cursor-pointer flex items-center gap-2"
                >
                  <span>Apply Now</span>
                  <ArrowRight className="w-4 h-4 text-white" />
                </motion.button>
              </div>
            </motion.div>

            {/* Right Column: 2x2 Values Grid */}
            <motion.div
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true, amount: 0.3 }}
              transition={{ duration: 0.6, delay: 0.15 }}
              className="lg:col-span-7 grid grid-cols-1 sm:grid-cols-2 gap-8 lg:gap-10"
            >
              {values.map((v, i) => {
                const IconComponent = v.icon;
                return (
                  <div key={i} className="space-y-3 p-1">
                    <div className="w-8 h-8 text-[#2D62FF] mb-2">
                      <IconComponent className="w-7 h-7 stroke-[2.2]" />
                    </div>
                    <h3 className="text-lg sm:text-xl font-extrabold text-[#0B0B0F] tracking-tight leading-snug">
                      {v.title}
                    </h3>
                    <p className="text-sm text-[#5A5F71] leading-relaxed">
                      {v.description}
                    </p>
                  </div>
                );
              })}
            </motion.div>
          </div>
        </div>
      </section>

      {/* ================= 4. ARTISTIC CREATIVE HIGHLIGHT: OUR IMPACT IN NUMBERS ================= */}
      <section className="py-16 sm:py-24 border-t border-slate-100 bg-[#FAFAFA]">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8 text-center">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.1 }}
              className="p-6 rounded-[20px] bg-white border border-slate-200/70 shadow-sm"
            >
              <Zap className="w-6 h-6 text-[#2D62FF] mx-auto mb-3" />
              <div className="text-3xl sm:text-4xl font-black text-[#0B0B0F]">15 Mins</div>
              <div className="text-xs sm:text-sm font-semibold text-[#5A5F71] mt-1">Average Approval Time</div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="p-6 rounded-[20px] bg-white border border-slate-200/70 shadow-sm"
            >
              <Users className="w-6 h-6 text-[#2D62FF] mx-auto mb-3" />
              <div className="text-3xl sm:text-4xl font-black text-[#0B0B0F]">50,000+</div>
              <div className="text-xs sm:text-sm font-semibold text-[#5A5F71] mt-1">Borrowers Empowered</div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.3 }}
              className="p-6 rounded-[20px] bg-white border border-slate-200/70 shadow-sm"
            >
              <Award className="w-6 h-6 text-[#2D62FF] mx-auto mb-3" />
              <div className="text-3xl sm:text-4xl font-black text-[#0B0B0F]">₦150M+</div>
              <div className="text-xs sm:text-sm font-semibold text-[#5A5F71] mt-1">Cash Prizes & Rebates Paid</div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.4 }}
              className="p-6 rounded-[20px] bg-white border border-slate-200/70 shadow-sm"
            >
              <CheckCircle2 className="w-6 h-6 text-[#2D62FF] mx-auto mb-3" />
              <div className="text-3xl sm:text-4xl font-black text-[#0B0B0F]">100%</div>
              <div className="text-xs sm:text-sm font-semibold text-[#5A5F71] mt-1">Transparent Pricing</div>
            </motion.div>
          </div>
        </div>
      </section>
    </div>
  );
};
