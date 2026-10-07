import React, { useState, useEffect, useRef } from 'react';
import { motion, useScroll, useTransform, useSpring } from 'motion/react';
import {
  ArrowRight,
  ChevronLeft,
  ChevronRight,
  Star,
  MapPin,
  UserCheck,
  CreditCard,
  Building2,
  PhoneCall
} from 'lucide-react';

interface HowItWorksPageProps {
  onStartApplication: (type: 'INDIVIDUAL' | 'BUSINESS') => void;
  onNavigate?: (page: string) => void;
}

interface StepData {
  step: string;
  title: string;
  description: string;
  hasButton: boolean;
  imageSrc: string;
}

// Individual Timeline Step with Scroll-Driven Fade In / Fade Out Effect
const TimelineStepItem: React.FC<{
  item: StepData;
  index: number;
  onStartApplication: (type: 'INDIVIDUAL' | 'BUSINESS') => void;
}> = ({ item, onStartApplication }) => {
  const itemRef = useRef<HTMLDivElement>(null);

  const { scrollYProgress } = useScroll({
    target: itemRef,
    offset: ['start 0.9', 'center 0.5', 'end 0.1']
  });

  // Opacity: Faded (0.18) when out of view -> 1.0 when centered -> Faded (0.18) when scrolling past
  const opacity = useTransform(scrollYProgress, [0, 0.35, 0.65, 1], [0.18, 1, 1, 0.18]);
  const scale = useTransform(scrollYProgress, [0, 0.35, 0.65, 1], [0.96, 1, 1, 0.96]);
  const dotScale = useTransform(scrollYProgress, [0, 0.35, 0.65, 1], [0.75, 1.2, 1.2, 0.75]);
  const dotBg = useTransform(scrollYProgress, [0, 0.35, 0.65, 1], ['#94A3B8', '#0B0B0F', '#0B0B0F', '#94A3B8']);

  return (
    <div ref={itemRef} className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-start relative">
      {/* Left Column: Step Eyebrow & Title */}
      <motion.div
        style={{ opacity, scale }}
        className="lg:col-span-5 lg:text-right pt-2 space-y-2 lg:pr-6 transition-all duration-300"
      >
        <div className="text-xs font-black tracking-[0.2em] text-[#9CA3AF] uppercase">
          {item.step}
        </div>
        <h2 className="text-2xl sm:text-4xl font-extrabold text-[#0B0B0F] tracking-tight">
          {item.title}
        </h2>
      </motion.div>

      {/* Center Dot Indicator */}
      <div className="hidden lg:flex lg:col-span-1 justify-center pt-4 relative">
        <motion.div
          style={{ scale: dotScale, backgroundColor: dotBg }}
          className="w-4 h-4 rounded-full ring-4 ring-white shadow-md z-10 -ml-[45%] transition-colors duration-300"
        />
      </div>

      {/* Right Column: Text, Button, and Photo with curved Blue Backing */}
      <motion.div
        style={{ opacity, scale }}
        className="lg:col-span-6 space-y-6 lg:pl-4 transition-all duration-300"
      >
        <p className="text-base sm:text-lg text-[#5A5F71] leading-relaxed">
          {item.description}
        </p>

        {item.hasButton && (
          <div>
            <button
              onClick={() => onStartApplication('INDIVIDUAL')}
              className="px-7 py-3.5 rounded-[12px] bg-[#2D62FF] text-white font-extrabold text-sm shadow-md hover:bg-[#1a4edf] hover:shadow-lg transition-all flex items-center gap-2 cursor-pointer"
            >
              <span>Apply Now</span>
              <ArrowRight className="w-4 h-4 text-white" />
            </button>
          </div>
        )}

        {/* Image with Signature Organic Curved Blue Backdrop */}
        <div className="relative pt-6 pl-6 pr-2 pb-2">
          {/* Background Blue Curved Shape */}
          <div className="absolute top-0 left-0 w-[90%] h-[90%] bg-[#2D62FF] rounded-tl-[36px] rounded-br-[36px] rounded-tr-[16px] rounded-bl-[16px] -z-0 shadow-lg transition-all duration-300" />

          {/* Foreground Image */}
          <div className="relative z-10 rounded-[20px] overflow-hidden shadow-2xl border-4 border-white bg-slate-100">
            <img
              src={item.imageSrc}
              alt={item.title}
              className="w-full h-64 sm:h-80 lg:h-96 object-cover transition-transform duration-700 hover:scale-105"
            />
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export const HowItWorksPage: React.FC<HowItWorksPageProps> = ({ onStartApplication }) => {
  // Testimonial slider state
  const [currentSlide, setCurrentSlide] = useState(0);

  const testimonials = [
    {
      id: 1,
      rating: 5,
      text: "I needed urgent bridge capital of ₦450,000 for inventory before my supply shipment cleared. AkoFinanced It processed my application within 20 minutes, and after prompt repayment I even won a ₦50,000 weekly rebate! The most transparent loan advisory platform in Nigeria.",
      author: "Babajide O.",
      location: "Ikeja, Lagos State",
      image: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=120&auto=format&fit=crop&q=80"
    },
    {
      id: 2,
      rating: 5,
      text: "Securing a working capital loan of ₦2,500,000 for my pharmacy branch expansion was completely seamless. No hidden processing charges, transparent monthly payback schedule, and helpful loan advisors. Again, thank you AkoFinanced It!",
      author: "Amina K.",
      location: "Maitama, Abuja FCT",
      image: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=120&auto=format&fit=crop&q=80"
    },
    {
      id: 3,
      rating: 5,
      text: "When unexpected logistics vehicle repairs hit our supply run, AkoFinanced It matched our business with an institutional lender in minutes. The funds hit our bank account before noon and saved our client delivery. Truly exceptional service!",
      author: "Emeka N.",
      location: "Port Harcourt, Rivers State",
      image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=120&auto=format&fit=crop&q=80"
    }
  ];

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % testimonials.length);
  };

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + testimonials.length) % testimonials.length);
  };

  const steps: StepData[] = [
    {
      step: 'STEP 1',
      title: 'Apply Online in Minutes',
      description:
        'Start by filling out our simple, encrypted digital application form from any smartphone or computer. Provide your basic personal details, employment or SME turnover info, and funding requirements to initiate instant matching.',
      hasButton: true,
      imageSrc:
        'https://images.unsplash.com/photo-1573497620053-ea5300f94f21?auto=format&fit=crop&q=80&w=900'
    },
    {
      step: 'STEP 2',
      title: 'Get Approved',
      description:
        'Our underwriting engine matches your profile with regulated institutional lenders in real-time. Once pre-approved, you will receive a transparent offer outlining your loan amount, competitive monthly rate, flexible repayment schedule, and zero hidden fees.',
      hasButton: false,
      imageSrc:
        'https://images.unsplash.com/photo-1551836022-d5d88e9218df?auto=format&fit=crop&q=80&w=900'
    },
    {
      step: 'STEP 3',
      title: 'Direct Bank Disbursement',
      description:
        'After reviewing and electronically signing your loan offer, approved funds are transferred directly into your verified Nigerian commercial bank account (GTBank, Access, Zenith, FirstBank, UBA, etc.) in minutes.',
      hasButton: false,
      imageSrc:
        'https://images.unsplash.com/photo-1563986768609-322da13575f3?auto=format&fit=crop&q=80&w=900'
    },
    {
      step: 'STEP 4',
      title: 'Earn Rewards & Build Credit',
      description:
        'For every ₦10,000 borrowed and repaid on schedule, you receive automated loyalty draw tickets while strengthening your credit rating. Repaid loans are entered into our weekly cash prize draw held every Friday at 12:00 noon WAT.',
      hasButton: false,
      imageSrc:
        'https://images.unsplash.com/photo-1522071820081-009f0129c71c?auto=format&fit=crop&q=80&w=900'
    },
    {
      step: 'STEP 5',
      title: 'Unlock Higher Limits & Rebates',
      description:
        'Enjoy automatic limit upgrades up to ₦95,000,000+ for businesses, interest rate discounts, and instant SMS draw notifications. When you win our weekly reward draw, prize cash is credited directly to your bank account with no hassle.',
      hasButton: true,
      imageSrc:
        'https://images.unsplash.com/photo-1531482615713-2afd69097998?auto=format&fit=crop&q=80&w=900'
    }
  ];

  // Ref for the timeline container for scroll-progress tracking
  const timelineRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: timelineRef,
    offset: ['start center', 'end center']
  });

  const smoothProgress = useSpring(scrollYProgress, {
    stiffness: 100,
    damping: 30,
    restDelta: 0.001
  });

  const scaleY = useTransform(smoothProgress, [0, 1], [0, 1]);

  return (
    <div className="w-full bg-white text-[#0B0B0F]">
      {/* ================= 1. HEADING SECTION ================= */}
      <section className="pt-20 pb-16 sm:pt-28 sm:pb-24 text-center">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
          className="max-w-4xl mx-auto px-4 sm:px-6"
        >
          <div className="text-xs sm:text-sm font-black uppercase tracking-[0.2em] text-[#71717A] mb-4">
            HOW IT WORKS
          </div>
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black tracking-tight text-[#0B0B0F] mb-6 leading-tight">
            Borrow Smarter, Grow Faster:
            <br />
            <span className="text-[#2D62FF]">Prize-Linked</span> & Advisory Financing
          </h1>
          <p className="text-base sm:text-lg text-[#5A5F71] max-w-2xl mx-auto leading-relaxed">
            Fast-track digital approvals with transparent terms. From salary-bridge loans to SME working capital up to ₦95,000,000, get matched with licensed institutional lenders and disbursed in minutes.
          </p>
        </motion.div>
      </section>

      {/* ================= 2. TIMELINE SECTION (Scroll-driven Dynamic Step Fading) ================= */}
      <section className="py-8 sm:py-16 relative overflow-hidden" ref={timelineRef}>
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="relative">
            
            {/* Background Grey Track Line */}
            <div className="hidden lg:block absolute top-12 bottom-12 left-[45%] -translate-x-1/2 w-[3px] bg-slate-100 rounded-full" />

            {/* Scroll-driven Active Blue Progress Bar */}
            <motion.div
              style={{ scaleY, transformOrigin: 'top center' }}
              className="hidden lg:block absolute top-12 bottom-12 left-[45%] -translate-x-1/2 w-[3px] bg-[#2D62FF] rounded-full shadow-[0_0_12px_rgba(45,98,255,0.4)]"
            />

            {/* Timeline Steps with Individual Focus Fading */}
            <div className="space-y-24 sm:space-y-36">
              {steps.map((item, idx) => (
                <TimelineStepItem
                  key={idx}
                  item={item}
                  index={idx}
                  onStartApplication={onStartApplication}
                />
              ))}
            </div>

          </div>
        </div>
      </section>

      {/* ================= 3. LOAN REQUIREMENTS SECTION (layout65) ================= */}
      <section className="py-24 sm:py-32 bg-white border-t border-slate-100">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-start">
            
            {/* Left Column */}
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: false, amount: 0.3 }}
              transition={{ duration: 0.6 }}
              className="lg:col-span-5 space-y-5"
            >
              <div className="text-xs font-black uppercase tracking-[0.2em] text-[#2D62FF]">
                LOAN REQUIREMENTS
              </div>
              <h2 className="text-3xl sm:text-5xl font-black text-[#0B0B0F] tracking-tight leading-tight">
                View Our Requirements Before Applying
              </h2>
              <p className="text-base text-[#5A5F71] leading-relaxed pt-2">
                Before starting your application, take a moment to review our straightforward eligibility requirements. Here’s what you need to qualify with AkoFinanced It:
              </p>
              <div className="pt-4">
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

            {/* Right Column: Clean Requirements List */}
            <motion.div
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: false, amount: 0.3 }}
              transition={{ duration: 0.6, delay: 0.15 }}
              className="lg:col-span-7 space-y-6"
            >
              
              {/* Item 1: Residency */}
              <div className="flex items-start gap-4 p-2">
                <div className="w-7 h-7 text-[#2D62FF] shrink-0 mt-0.5">
                  <MapPin className="w-6 h-6" />
                </div>
                <div className="text-base text-[#0B0B0F] leading-relaxed">
                  <span className="font-extrabold">Residency: </span>
                  <span className="text-[#5A5F71]">
                    You must be a Nigerian citizen or legal resident residing in any of the 36 states or FCT Abuja.
                  </span>
                </div>
              </div>

              {/* Item 2: Age and ID */}
              <div className="flex items-start gap-4 p-2">
                <div className="w-7 h-7 text-[#2D62FF] shrink-0 mt-0.5">
                  <UserCheck className="w-6 h-6" />
                </div>
                <div className="text-base text-[#0B0B0F] leading-relaxed">
                  <span className="font-extrabold">Age and Valid ID: </span>
                  <span className="text-[#5A5F71]">
                    You must be at least 18 years old and hold a valid government-issued ID (NIN, Voter's Card, International Passport, or Driver's License).
                  </span>
                </div>
              </div>

              {/* Item 3: Income */}
              <div className="flex items-start gap-4 p-2">
                <div className="w-7 h-7 text-[#2D62FF] shrink-0 mt-0.5">
                  <CreditCard className="w-6 h-6" />
                </div>
                <div className="text-base text-[#0B0B0F] leading-relaxed">
                  <span className="font-extrabold">Verifiable Income: </span>
                  <span className="text-[#5A5F71]">
                    A steady source of income (monthly employment salary, SME business revenue, or corporate turnover) to support loan servicing.
                  </span>
                </div>
              </div>

              {/* Item 4: Bank Account */}
              <div className="flex items-start gap-4 p-2">
                <div className="w-7 h-7 text-[#2D62FF] shrink-0 mt-0.5">
                  <Building2 className="w-6 h-6" />
                </div>
                <div className="text-base text-[#0B0B0F] leading-relaxed">
                  <span className="font-extrabold">Commercial Bank Account: </span>
                  <span className="text-[#5A5F71]">
                    An active account with any CBN-licensed commercial bank for direct electronic disbursement and automated repayment.
                  </span>
                </div>
              </div>

              {/* Item 5: Contact Information */}
              <div className="flex items-start gap-4 p-2">
                <div className="w-7 h-7 text-[#2D62FF] shrink-0 mt-0.5">
                  <PhoneCall className="w-6 h-6" />
                </div>
                <div className="text-base text-[#0B0B0F] leading-relaxed">
                  <span className="font-extrabold">Active Contact Information: </span>
                  <span className="text-[#5A5F71]">
                    A verified mobile phone number for instant SMS alerts/OTP, active email address, and residential/business address.
                  </span>
                </div>
              </div>

            </motion.div>

          </div>
        </div>
      </section>

      {/* ================= 4. TESTIMONIAL SLIDER (testimonial10) ================= */}
      <section id="reviews" className="py-24 sm:py-32 bg-white border-t border-slate-100 relative">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: false, amount: 0.3 }}
          transition={{ duration: 0.6 }}
          className="max-w-4xl mx-auto px-4 sm:px-6 text-center"
        >
          {/* Stars */}
          <div className="flex justify-center items-center gap-1 mb-8">
            {[...Array(5)].map((_, i) => (
              <Star key={i} className="w-5 h-5 fill-[#FBBF24] text-[#FBBF24]" />
            ))}
          </div>

          {/* Testimonial Quote */}
          <blockquote className="text-xl sm:text-2xl lg:text-3xl text-[#0B0B0F] font-medium leading-relaxed italic mb-10 max-w-3xl mx-auto">
            "{testimonials[currentSlide].text}"
          </blockquote>

          {/* Client Profile */}
          <div className="flex flex-col items-center gap-3">
            <img
              src={testimonials[currentSlide].image}
              alt={testimonials[currentSlide].author}
              className="w-14 h-14 rounded-full object-cover shadow-sm border border-slate-200"
            />
            <div>
              <div className="font-extrabold text-base text-[#0B0B0F]">
                {testimonials[currentSlide].author}
              </div>
              <div className="text-sm text-[#71717A]">
                {testimonials[currentSlide].location}
              </div>
            </div>
          </div>

          {/* Navigation Arrows & Round Dots */}
          <div className="flex justify-between items-center mt-12 max-w-lg mx-auto">
            <button
              onClick={prevSlide}
              className="w-12 h-12 rounded-full border border-[#2D62FF]/40 hover:border-[#2D62FF] text-[#2D62FF] hover:bg-[#2D62FF]/5 flex items-center justify-center transition-all cursor-pointer"
              aria-label="Previous review"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>

            {/* Dots */}
            <div className="flex items-center gap-2">
              {testimonials.map((_, idx) => (
                <button
                  key={idx}
                  onClick={() => setCurrentSlide(idx)}
                  className={`h-2.5 rounded-full transition-all cursor-pointer ${
                    currentSlide === idx ? 'w-8 bg-[#2D62FF]' : 'w-2.5 bg-[#BFDBFE]'
                  }`}
                  aria-label={`Go to slide ${idx + 1}`}
                />
              ))}
            </div>

            <button
              onClick={nextSlide}
              className="w-12 h-12 rounded-full border border-[#2D62FF]/40 hover:border-[#2D62FF] text-[#2D62FF] hover:bg-[#2D62FF]/5 flex items-center justify-center transition-all cursor-pointer"
              aria-label="Next review"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>

        </motion.div>
      </section>
    </div>
  );
};
