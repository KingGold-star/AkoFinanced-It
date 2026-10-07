import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Mail,
  Phone,
  MapPin,
  ArrowUpRight,
  ArrowRight,
  CheckCircle2,
  Linkedin,
  Facebook,
  Youtube,
  Twitter,
  Building2,
  FileCheck2,
  MessageCircle,
  Sparkles,
  Loader2,
  AlertCircle
} from 'lucide-react';

const FORMSPREE_ENDPOINT = 'https://formspree.io/f/myeglwgl';

interface ContactPageProps {
  onStartApplication?: (type: 'INDIVIDUAL' | 'BUSINESS') => void;
  onNavigate?: (page: string) => void;
}

export const ContactPage: React.FC<ContactPageProps> = ({ onNavigate }) => {
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phone: '',
    countryCode: '+234',
    contactingAs: 'Individual',
    applicationRef: '',
    businessName: '',
    subject: '',
    message: '',
    preferredMethod: 'Email',
    privacyConsent: false
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.privacyConsent) {
      setErrorMessage('Please consent to the privacy policy to proceed.');
      return;
    }

    setIsSubmitting(true);
    setErrorMessage(null);

    try {
      const payload: Record<string, any> = {
        name: formData.fullName.trim(),
        email: formData.email.trim(),
        phone: `${formData.countryCode} ${formData.phone.trim()}`,
        contacting_as: formData.contactingAs,
        subject: formData.subject.trim(),
        message: formData.message.trim(),
        preferred_contact_method: formData.preferredMethod,
        portal_source: 'AkoFinanced It Web Contact Form',
        submitted_at: new Date().toLocaleString()
      };

      if (formData.applicationRef.trim()) {
        payload.application_reference = formData.applicationRef.trim();
      }

      if (formData.businessName.trim()) {
        payload.business_name = formData.businessName.trim();
      }

      const response = await fetch(FORMSPREE_ENDPOINT, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/json'
        },
        body: JSON.stringify(payload)
      });

      if (response.ok) {
        setSubmitted(true);
      } else {
        const data = await response.json().catch(() => null);
        const errorText =
          data?.errors?.map((err: any) => err.message).join(', ') ||
          data?.error ||
          'Failed to send message. Please check your connection and try again.';
        setErrorMessage(errorText);
      }
    } catch (err: any) {
      setErrorMessage(
        err.message || 'Unable to submit message at this time. Please try again shortly.'
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleReset = () => {
    setSubmitted(false);
    setErrorMessage(null);
    setIsSubmitting(false);
    setFormData({
      fullName: '',
      email: '',
      phone: '',
      countryCode: '+234',
      contactingAs: 'Individual',
      applicationRef: '',
      businessName: '',
      subject: '',
      message: '',
      preferredMethod: 'Email',
      privacyConsent: false
    });
  };

  const contactingAsOptions = [
    'Individual',
    'Business Owner',
    'Existing Applicant',
    'Partner/Lender',
    'Other'
  ];

  const preferredMethods = [
    { label: 'Phone', icon: Phone },
    { label: 'Email', icon: Mail },
    { label: 'WhatsApp', icon: MessageCircle }
  ];

  return (
    <div className="w-full min-h-[calc(100vh-80px)] bg-[#F8FAFC] py-12 sm:py-16 px-4 sm:px-6 lg:px-8 relative overflow-hidden flex items-center justify-center">
      {/* Background Decorative Grid Pattern */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#e2e8f015_1px,transparent_1px),linear-gradient(to_bottom,#e2e8f015_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_50%,#000_70%,transparent_100%)] pointer-events-none" />

      <div className="max-w-6xl w-full mx-auto grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-14 items-start relative z-10">
        
        {/* ================= LEFT COLUMN ================= */}
        <div className="lg:col-span-5 space-y-8 lg:sticky lg:top-24">
          {/* Breadcrumbs */}
          <div className="flex items-center gap-2 text-xs font-semibold text-slate-500">
            <button
              onClick={() => onNavigate && onNavigate('home')}
              className="hover:text-[#2D62FF] transition-colors cursor-pointer"
            >
              Home
            </button>
            <span>/</span>
            <span className="text-[#0B0B0F]">Contact</span>
          </div>

          {/* Heading */}
          <div className="space-y-3">
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black tracking-tight text-[#0B0B0F] leading-[1.08]">
              Lets Get <br />
              <span className="text-[#2D62FF]">in touch</span>
            </h1>
            <p className="text-base sm:text-lg text-slate-600 font-medium">
              Don’t be afraid to say hello with us!
            </p>
          </div>

          {/* 3 Contact Info Cards */}
          <div className="space-y-3.5 pt-2">
            {/* Email Card */}
            <a
              href="mailto:support@akofinanced.it"
              className="group flex items-center justify-between p-4 sm:p-4.5 rounded-[16px] bg-white/90 backdrop-blur-sm border border-slate-200/80 hover:border-[#2D62FF]/50 shadow-sm hover:shadow-md transition-all cursor-pointer"
            >
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-[12px] bg-blue-50 text-[#2D62FF] flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
                  <Mail className="w-5 h-5 stroke-[2.2]" />
                </div>
                <div>
                  <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                    Email Us
                  </div>
                  <div className="text-sm font-extrabold text-[#0B0B0F]">
                    support@akofinanced.it
                  </div>
                </div>
              </div>
              <div className="w-8 h-8 rounded-full bg-slate-50 flex items-center justify-center text-slate-400 group-hover:text-[#2D62FF] group-hover:bg-blue-50 transition-colors">
                <ArrowUpRight className="w-4 h-4" />
              </div>
            </a>

            {/* Call Card */}
            <a
              href="tel:+234800256346"
              className="group flex items-center justify-between p-4 sm:p-4.5 rounded-[16px] bg-white/90 backdrop-blur-sm border border-slate-200/80 hover:border-[#2D62FF]/50 shadow-sm hover:shadow-md transition-all cursor-pointer"
            >
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-[12px] bg-blue-50 text-[#2D62FF] flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
                  <Phone className="w-5 h-5 stroke-[2.2]" />
                </div>
                <div>
                  <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                    Call Us
                  </div>
                  <div className="text-sm font-extrabold text-[#0B0B0F]">
                    +234 (0) 1 800 256 346
                  </div>
                </div>
              </div>
              <div className="w-8 h-8 rounded-full bg-slate-50 flex items-center justify-center text-slate-400 group-hover:text-[#2D62FF] group-hover:bg-blue-50 transition-colors">
                <ArrowUpRight className="w-4 h-4" />
              </div>
            </a>

            {/* Headquarters Card */}
            <div className="group flex items-center justify-between p-4 sm:p-4.5 rounded-[16px] bg-white/90 backdrop-blur-sm border border-slate-200/80 hover:border-[#2D62FF]/50 shadow-sm hover:shadow-md transition-all">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-[12px] bg-blue-50 text-[#2D62FF] flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
                  <MapPin className="w-5 h-5 stroke-[2.2]" />
                </div>
                <div>
                  <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                    Our Headquarter
                  </div>
                  <div className="text-sm font-extrabold text-[#0B0B0F]">
                    Victoria Island, Lagos, Nigeria
                  </div>
                </div>
              </div>
              <div className="w-8 h-8 rounded-full bg-slate-50 flex items-center justify-center text-slate-400 group-hover:text-[#2D62FF] group-hover:bg-blue-50 transition-colors">
                <ArrowUpRight className="w-4 h-4" />
              </div>
            </div>
          </div>

          {/* Social Links Row */}
          <div className="pt-2 flex items-center gap-4">
            <span className="text-xs font-black text-slate-700 tracking-tight leading-tight">
              Follow<br />us on
            </span>
            <div className="flex items-center gap-2">
              <a
                href="https://facebook.com"
                target="_blank"
                rel="noreferrer"
                aria-label="Facebook"
                className="w-10 h-10 rounded-[12px] bg-white border border-slate-200/80 shadow-sm hover:border-[#2D62FF] hover:text-[#2D62FF] text-slate-600 flex items-center justify-center transition-all cursor-pointer"
              >
                <Facebook className="w-4 h-4" />
              </a>
              <a
                href="https://linkedin.com"
                target="_blank"
                rel="noreferrer"
                aria-label="LinkedIn"
                className="w-10 h-10 rounded-[12px] bg-white border border-slate-200/80 shadow-sm hover:border-[#2D62FF] hover:text-[#2D62FF] text-slate-600 flex items-center justify-center transition-all cursor-pointer"
              >
                <Linkedin className="w-4 h-4" />
              </a>
              <a
                href="https://x.com"
                target="_blank"
                rel="noreferrer"
                aria-label="Twitter / X"
                className="w-10 h-10 rounded-[12px] bg-white border border-slate-200/80 shadow-sm hover:border-[#2D62FF] hover:text-[#2D62FF] text-slate-600 flex items-center justify-center transition-all cursor-pointer"
              >
                <Twitter className="w-4 h-4" />
              </a>
              <a
                href="https://youtube.com"
                target="_blank"
                rel="noreferrer"
                aria-label="YouTube"
                className="w-10 h-10 rounded-[12px] bg-white border border-slate-200/80 shadow-sm hover:border-[#2D62FF] hover:text-[#2D62FF] text-slate-600 flex items-center justify-center transition-all cursor-pointer"
              >
                <Youtube className="w-4 h-4" />
              </a>
            </div>
          </div>
        </div>

        {/* ================= RIGHT COLUMN: FORM CARD ================= */}
        <div className="lg:col-span-7">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="rounded-[32px] sm:rounded-[36px] bg-white border border-slate-200/90 shadow-2xl p-6 sm:p-10 lg:p-12 relative"
          >
            <div className="flex items-center justify-between gap-3 mb-6">
              <div>
                <h2 className="text-2xl sm:text-3xl font-black text-[#0B0B0F] tracking-tight">
                  Contact Us
                </h2>
                <p className="text-xs sm:text-sm text-slate-500 font-medium mt-1">
                  Have a question or need financial guidance? Fill in the details below.
                </p>
              </div>
              <div className="w-10 h-10 rounded-2xl bg-blue-50 text-[#2D62FF] flex items-center justify-center shrink-0">
                <Sparkles className="w-5 h-5" />
              </div>
            </div>

            {submitted ? (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="p-8 rounded-[24px] bg-blue-50/60 border border-blue-100 text-center space-y-4 py-12"
              >
                <div className="w-14 h-14 rounded-full bg-[#2D62FF] text-white flex items-center justify-center mx-auto shadow-lg shadow-[#2D62FF]/30">
                  <CheckCircle2 className="w-8 h-8" />
                </div>
                <h3 className="text-xl font-black text-[#0B0B0F]">
                  Message Sent Successfully!
                </h3>
                <p className="text-sm text-slate-600 max-w-md mx-auto leading-relaxed">
                  Thank you for reaching out, <span className="font-bold text-[#0B0B0F]">{formData.fullName || 'there'}</span>. An AkoFinanced It representative will reach out to you via <span className="font-bold text-[#2D62FF]">{formData.preferredMethod}</span> ({formData.preferredMethod === 'Email' ? formData.email : formData.phone}) within 24 hours.
                </p>
                <div className="pt-4">
                  <button
                    onClick={handleReset}
                    className="px-6 py-3 rounded-full bg-white border border-slate-200 hover:border-slate-300 text-xs font-extrabold text-[#0B0B0F] shadow-sm transition-all cursor-pointer"
                  >
                    Send Another Message
                  </button>
                </div>
              </motion.div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-5">
                {/* Row 1: Full Name & Email Address */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-5">
                  <div className="space-y-1.5">
                    <label className="block text-xs font-bold text-slate-700">
                      Full Name <span className="text-rose-500">*</span>
                    </label>
                    <input
                      required
                      type="text"
                      value={formData.fullName}
                      onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                      placeholder="e.g. Babatunde Adeyemi"
                      className="w-full px-4 py-3.5 rounded-[14px] bg-slate-50/70 border border-slate-200/80 focus:border-[#2D62FF] focus:bg-white text-xs sm:text-sm text-[#0B0B0F] placeholder-slate-400 outline-none transition-all"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="block text-xs font-bold text-slate-700">
                      Email Address <span className="text-rose-500">*</span>
                    </label>
                    <input
                      required
                      type="email"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      placeholder="babatunde@example.com"
                      className="w-full px-4 py-3.5 rounded-[14px] bg-slate-50/70 border border-slate-200/80 focus:border-[#2D62FF] focus:bg-white text-xs sm:text-sm text-[#0B0B0F] placeholder-slate-400 outline-none transition-all"
                    />
                  </div>
                </div>

                {/* Row 2: Phone Number & Contacting You As */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-5">
                  <div className="space-y-1.5">
                    <label className="block text-xs font-bold text-slate-700">
                      Phone Number <span className="text-rose-500">*</span>
                    </label>
                    <div className="flex items-center rounded-[14px] bg-slate-50/70 border border-slate-200/80 focus-within:border-[#2D62FF] focus-within:bg-white overflow-hidden transition-all">
                      <div className="flex items-center gap-1.5 px-3 py-3.5 border-r border-slate-200/80 bg-slate-100/50 shrink-0 text-xs font-extrabold text-slate-700">
                        <span>🇳🇬</span>
                        <span>+234</span>
                      </div>
                      <input
                        required
                        type="tel"
                        value={formData.phone}
                        onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                        placeholder="800 000 0000"
                        className="w-full px-3 py-3.5 bg-transparent text-xs sm:text-sm text-[#0B0B0F] placeholder-slate-400 outline-none"
                      />
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <label className="block text-xs font-bold text-slate-700">
                      Contacting You As <span className="text-rose-500">*</span>
                    </label>
                    <select
                      value={formData.contactingAs}
                      onChange={(e) => setFormData({ ...formData, contactingAs: e.target.value })}
                      className="w-full px-4 py-3.5 rounded-[14px] bg-slate-50/70 border border-slate-200/80 focus:border-[#2D62FF] focus:bg-white text-xs sm:text-sm text-[#0B0B0F] outline-none transition-all cursor-pointer"
                    >
                      {contactingAsOptions.map((opt) => (
                        <option key={opt} value={opt}>
                          {opt}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Conditional Fields: Application Reference Number (for Existing Applicant) */}
                <AnimatePresence>
                  {formData.contactingAs === 'Existing Applicant' && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      transition={{ duration: 0.25 }}
                      className="overflow-hidden"
                    >
                      <div className="space-y-1.5 p-3.5 sm:p-4 rounded-[16px] bg-blue-50/50 border border-blue-100">
                        <label className="flex items-center gap-1.5 text-xs font-bold text-[#0B0B0F]">
                          <FileCheck2 className="w-3.5 h-3.5 text-[#2D62FF]" />
                          Application Reference Number <span className="text-rose-500">*</span>
                        </label>
                        <input
                          required
                          type="text"
                          value={formData.applicationRef}
                          onChange={(e) => setFormData({ ...formData, applicationRef: e.target.value })}
                          placeholder="e.g. AKO-2026-89421"
                          className="w-full px-4 py-3 rounded-[12px] bg-white border border-blue-200 focus:border-[#2D62FF] text-xs sm:text-sm text-[#0B0B0F] placeholder-slate-400 outline-none"
                        />
                        <p className="text-[11px] text-slate-500">
                          Enter the reference number sent to your email during application.
                        </p>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* Conditional Fields: Business/Organisation Name (for Business Owner or Partner/Lender) */}
                <AnimatePresence>
                  {(formData.contactingAs === 'Business Owner' || formData.contactingAs === 'Partner/Lender') && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      transition={{ duration: 0.25 }}
                      className="overflow-hidden"
                    >
                      <div className="space-y-1.5 p-3.5 sm:p-4 rounded-[16px] bg-slate-50 border border-slate-200">
                        <label className="flex items-center gap-1.5 text-xs font-bold text-[#0B0B0F]">
                          <Building2 className="w-3.5 h-3.5 text-slate-700" />
                          Business / Organisation Name <span className="text-rose-500">*</span>
                        </label>
                        <input
                          required
                          type="text"
                          value={formData.businessName}
                          onChange={(e) => setFormData({ ...formData, businessName: e.target.value })}
                          placeholder="e.g. Apex Global Ventures Ltd"
                          className="w-full px-4 py-3 rounded-[12px] bg-white border border-slate-200 focus:border-[#2D62FF] text-xs sm:text-sm text-[#0B0B0F] placeholder-slate-400 outline-none"
                        />
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* Subject */}
                <div className="space-y-1.5">
                  <label className="block text-xs font-bold text-slate-700">
                    Subject <span className="text-rose-500">*</span>
                  </label>
                  <input
                    required
                    type="text"
                    value={formData.subject}
                    onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                    placeholder="e.g. Inquiry regarding working capital loan rates"
                    className="w-full px-4 py-3.5 rounded-[14px] bg-slate-50/70 border border-slate-200/80 focus:border-[#2D62FF] focus:bg-white text-xs sm:text-sm text-[#0B0B0F] placeholder-slate-400 outline-none transition-all"
                  />
                </div>

                {/* Message */}
                <div className="space-y-1.5">
                  <label className="block text-xs font-bold text-slate-700">
                    Message <span className="text-rose-500">*</span>
                  </label>
                  <textarea
                    required
                    rows={4}
                    value={formData.message}
                    onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                    placeholder="Please provide details about your inquiry or request..."
                    className="w-full px-4 py-3.5 rounded-[14px] bg-slate-50/70 border border-slate-200/80 focus:border-[#2D62FF] focus:bg-white text-xs sm:text-sm text-[#0B0B0F] placeholder-slate-400 outline-none transition-all resize-none"
                  />
                </div>

                {/* Preferred Contact Method */}
                <div className="space-y-2">
                  <label className="block text-xs font-bold text-slate-700">
                    Preferred Contact Method
                  </label>
                  <div className="grid grid-cols-3 gap-2.5 sm:gap-3">
                    {preferredMethods.map((method) => {
                      const Icon = method.icon;
                      const isSelected = formData.preferredMethod === method.label;
                      return (
                        <button
                          key={method.label}
                          type="button"
                          onClick={() => setFormData({ ...formData, preferredMethod: method.label })}
                          className={`flex items-center justify-center gap-2 py-2.5 px-3 rounded-[12px] text-xs font-bold transition-all border cursor-pointer ${
                            isSelected
                              ? 'bg-blue-50/80 border-[#2D62FF] text-[#2D62FF] shadow-xs'
                              : 'bg-slate-50/70 border-slate-200/80 text-slate-600 hover:bg-slate-100 hover:border-slate-300'
                          }`}
                        >
                          <Icon className={`w-3.5 h-3.5 ${isSelected ? 'text-[#2D62FF]' : 'text-slate-500'}`} />
                          <span>{method.label}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Privacy Policy Consent Checkbox */}
                <div className="pt-2">
                  <label className="flex items-start gap-3 cursor-pointer group select-none">
                    <input
                      required
                      type="checkbox"
                      checked={formData.privacyConsent}
                      onChange={(e) => setFormData({ ...formData, privacyConsent: e.target.checked })}
                      className="mt-0.5 w-4 h-4 rounded border-slate-300 text-[#2D62FF] focus:ring-[#2D62FF] cursor-pointer"
                    />
                    <span className="text-xs text-slate-600 leading-relaxed">
                      I agree to the AkoFinanced It{' '}
                      <button
                        type="button"
                        onClick={() => onNavigate && onNavigate('privacy')}
                        className="text-[#2D62FF] font-bold hover:underline"
                      >
                        Privacy Policy
                      </button>{' '}
                      and consent to AkoFinanced It processing my contact information to respond to my inquiry.
                    </span>
                  </label>
                </div>

                {/* Error Banner */}
                {errorMessage && (
                  <div className="p-3.5 rounded-[14px] bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-start gap-2.5">
                    <AlertCircle className="w-4 h-4 shrink-0 text-rose-600 mt-0.5" />
                    <span className="leading-relaxed">{errorMessage}</span>
                  </div>
                )}

                {/* Submit Button */}
                <div className="pt-2">
                  <motion.button
                    whileHover={{ scale: isSubmitting ? 1 : 1.01 }}
                    whileTap={{ scale: isSubmitting ? 1 : 0.99 }}
                    type="submit"
                    disabled={isSubmitting}
                    className={`w-full py-4 rounded-[14px] bg-gradient-to-r from-[#2D62FF] to-[#3B66FF] hover:from-[#1E4ECC] hover:to-[#2D62FF] text-white font-extrabold text-sm shadow-xl shadow-[#2D62FF]/20 flex items-center justify-center gap-2 transition-all btn-glow ${
                      isSubmitting ? 'opacity-80 cursor-wait' : 'cursor-pointer'
                    }`}
                  >
                    {isSubmitting ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin text-white" />
                        <span>Sending Message...</span>
                      </>
                    ) : (
                      <span>Send Message →</span>
                    )}
                  </motion.button>
                </div>
              </form>
            )}
          </motion.div>
        </div>

      </div>
    </div>
  );
};

