import React, { useState, useEffect, useRef } from 'react';
import { useLocation } from 'wouter';
import { Video, Globe, ArrowRight, Sparkles, Loader2, CheckCircle2, Lightbulb, PenTool, Rocket, X, Terminal, Users, LifeBuoy, BarChart3 } from 'lucide-react';
import { motion, useScroll, useTransform } from 'framer-motion';
import { buildApiUrl } from "@/lib/api";
import { writeStoredSession, resetSessionHeartbeat } from '@/utils/session';
import type { StoredSession } from '@/types/session';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';

// --- 1. TYPES & INTERFACES ---
interface TutorApplication {
  fullName: string;
  email: string;
  phone: string;
  headline: string;
  expertiseArea: string;
  yearsExperience: number;
  courseTitle: string;
  availability: string;
  courseDescription: string;
  targetAudience: string;
}

// --- 2. Description helper (client-safe template) ---
const generateCourseDescription = async (
  title: string,
  expertise: string,
): Promise<string> => {
  if (!title || !expertise) {
    return "Describe your proposed curriculum, learning objectives, and the skills learners will gain.";
  }

  return [
    `${title} takes learners inside real workflows that ${expertise.toLowerCase()} teams use every day.`,
    "You will define a production-grade project, ship weekly deliverables, and review your work with industry mentors.",
    "By the end, participants graduate with a polished portfolio, repeatable playbooks, and the confidence to lead in their role.",
  ].join(" ");
};

// --- 3. SUB-COMPONENTS ---

// Sub-component for the Scroll-Scrubbing Number Animation
const ScrollFillNumber = ({ number, sizeClass }: { number: string; sizeClass?: string }) => {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start 90%", "center 50%"]
  });
  const fillHeight = useTransform(scrollYProgress, [0, 1], ["0%", "100%"]);

  return (
    <div className="p-4 overflow-visible relative">
      <motion.div
        ref={ref}
        className={`${sizeClass ?? "text-[8rem] md:text-[12rem]"} font-black leading-[0.85] tracking-tighter shrink-0 select-none`}
        style={{
          WebkitTextStroke: '3px rgba(36, 72, 85, 0.15)',
          color: 'transparent',
          backgroundImage: 'linear-gradient(to top, #E64833, #E64833)',
          backgroundRepeat: 'no-repeat',
          backgroundPosition: 'bottom',
          WebkitBackgroundClip: 'text',
          backgroundClip: 'text',
          backgroundSize: useTransform(fillHeight, (h) => `100% ${h}`)
        }}
      >
        {number}
      </motion.div>
    </div>
  );
};

// --- 4. MAIN COMPONENT ---
const initialFormState: TutorApplication = {
  fullName: "",
  email: "",
  phone: "",
  headline: "",
  expertiseArea: "",
  yearsExperience: 0,
  courseTitle: "",
  availability: "",
  courseDescription: "",
  targetAudience: "",
};

const BecomeTutor: React.FC = () => {
  const [formData, setFormData] = useState<TutorApplication>({ ...initialFormState });
  const [, setLocation] = useLocation();

  const [isGenerating, setIsGenerating] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitMessage, setSubmitMessage] = useState<string | null>(null);
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [loginEmail, setLoginEmail] = useState("");
  const [loginPassword, setLoginPassword] = useState("");
  const [loginError, setLoginError] = useState<string | null>(null);
  const [isLoggingIn, setIsLoggingIn] = useState(false);

  const fullText = "Your knowledge can change a career.";
  const [typedText, setTypedText] = useState("");

  const openLoginModal = () => {
    setLoginError(null);
    setShowLoginModal(true);
  };

  const closeLoginModal = () => {
    setShowLoginModal(false);
    setLoginEmail("");
    setLoginPassword("");
    setLoginError(null);
    setIsLoggingIn(false);
  };

  useEffect(() => {
    let index = 0;
    const timer = setInterval(() => {
      setTypedText((prev) => fullText.slice(0, index + 1));
      index++;
      if (index === fullText.length) clearInterval(timer);
    }, 40);
    return () => clearInterval(timer);
  }, []);

  const observerRef = useRef<IntersectionObserver | null>(null);

  useEffect(() => {
    observerRef.current = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('active');
        }
      });
    }, { threshold: 0.1 });

    const elements = document.querySelectorAll('.reveal');
    elements.forEach((el) => observerRef.current?.observe(el));

    return () => observerRef.current?.disconnect();
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleAiGenerate = async () => {
    if (!formData.courseTitle || !formData.expertiseArea) {
      alert("Please enter a Course Title and Area of Expertise first.");
      return;
    }

    setIsGenerating(true);
    try {
      const description = await generateCourseDescription(formData.courseTitle, formData.expertiseArea);
      setFormData(prev => ({ ...prev, courseDescription: description }));
    } catch (error) {
      console.error("AI Generation failed", error);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleTutorLogin = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!loginEmail.trim() || !loginPassword.trim()) {
      setLoginError("Please enter both email and password.");
      return;
    }

    setLoginError(null);
    setIsLoggingIn(true);

    try {
      const response = await fetch(buildApiUrl("/api/tutors/login"), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: loginEmail.trim().toLowerCase(), password: loginPassword }),
      });

      if (!response.ok) {
        const error = await response.json().catch(() => null);
        throw new Error(error?.message ?? "Wrong email or wrong password");
      }

      const payload = await response.json();
      const session: StoredSession = {
        accessToken: payload.session?.accessToken,
        accessTokenExpiresAt: payload.session?.accessTokenExpiresAt,
        refreshToken: payload.session?.refreshToken,
        refreshTokenExpiresAt: payload.session?.refreshTokenExpiresAt,
        sessionId: payload.session?.sessionId,
        role: payload.user?.role,
        userId: payload.user?.id,
        email: payload.user?.email,
        fullName: payload.user?.fullName,
      };

      writeStoredSession(session);
      resetSessionHeartbeat();

      const userPayload = {
        id: payload.user?.id,
        email: payload.user?.email,
        fullName: payload.user?.fullName,
        role: payload.user?.role,
        tutorId: payload.user?.tutorId,
        displayName: payload.user?.displayName,
      };

      localStorage.setItem("user", JSON.stringify(userPayload));
      localStorage.setItem("isAuthenticated", "true");

      closeLoginModal();
      setLocation("/tutors");
    } catch (error) {
      setLoginError(error instanceof Error ? error.message : "Wrong email or wrong password");
    } finally {
      setIsLoggingIn(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitMessage(null);
    setIsSubmitting(true);

    const payload = {
      fullName: formData.fullName.trim(),
      email: formData.email.trim(),
      phone: formData.phone?.trim() || undefined,
      headline: formData.headline.trim(),
      courseTitle: formData.courseTitle.trim(),
      courseDescription: formData.courseDescription.trim(),
      targetAudience: formData.targetAudience.trim(),
      expertiseArea: formData.expertiseArea.trim(),
      experienceYears: Number(formData.yearsExperience) || 0,
      availability: formData.availability.trim(),
    };

    try {
      const res = await fetch(buildApiUrl("/api/tutor-applications"), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const error = await res.json().catch(() => null);
        throw new Error(error?.message ?? "Failed to submit tutor application.");
      }

      setSubmitMessage("Proposal submitted successfully! Our team will be in touch soon.");
      setFormData({ ...initialFormState });
    } catch (error) {
      setSubmitMessage(error instanceof Error ? error.message : "Submission failed. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="w-full min-h-screen bg-retro-bg text-retro-teal overflow-x-hidden font-sans">
      <Navbar onLogin={() => setLocation('/auth')} onApplyTutor={() => { }} />
      <style>{`
        .typewriter-cursor::after {
          content: '|';
          animation: blink 1s step-start infinite;
          color: #E64833;
        }
        @keyframes blink { 50% { opacity: 0; } }
        .reveal {
          opacity: 0;
          transform: translateY(30px);
          transition: all 1s cubic-bezier(0.5, 0, 0, 1);
        }
        .reveal.active {
          opacity: 1;
          transform: translateY(0);
        }
        .stagger-1 { transition-delay: 150ms; }
        .stagger-2 { transition-delay: 300ms; }
        .stagger-3 { transition-delay: 450ms; }
        ::-webkit-scrollbar { width: 10px; }
        ::-webkit-scrollbar-track { background: #FBE9D0; }
        ::-webkit-scrollbar-thumb { background: #E64833; border-radius: 5px; border: 2px solid #FBE9D0; }
        ::-webkit-scrollbar-thumb:hover { background: #C03520; }
      `}</style>

      {/* Hero Section */}
      <section className="pt-32 pb-16 px-6 md:px-12 max-w-[1400px] mx-auto flex flex-col items-center text-center">
        <div className="max-w-4xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-retro-salmon/10 text-retro-salmon text-[10px] md:text-xs font-black uppercase tracking-widest mb-6 reveal">
            New Cohort 2025
          </div>
          <h1 className="text-4xl md:text-6xl lg:text-7xl font-black text-retro-teal tracking-tight mb-6 leading-tight min-h-[1.4em]">
            <span className="typewriter-cursor">{typedText}</span>
          </h1>
          <p className="text-lg md:text-2xl text-retro-teal/70 font-medium max-w-2xl mx-auto reveal stagger-1 leading-relaxed">
            Become a tutor and lead the AI revolution.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mt-10 reveal stagger-2">
            <button
              type="button"
              onClick={openLoginModal}
              className="inline-flex items-center gap-2 rounded-full px-8 py-3 bg-retro-teal text-white font-semibold text-sm uppercase tracking-widest shadow-lg shadow-retro-teal/30 transition hover:-translate-y-0.5 hover:bg-black"
            >
              Login as Tutor
            </button>
            <p className="text-sm text-retro-teal/60 text-center max-w-sm">
              Already teaching with us? Sign in to access your studio dashboard and resources.
            </p>
          </div>
        </div>
      </section>

      {/* Why Teach Section */}
      <section className="py-16 px-6 md:px-12 max-w-[1400px] mx-auto">
        <div className="text-center mb-16 reveal">
          <h3 className="text-4xl md:text-5xl font-black text-retro-teal tracking-tight mb-4">Why teach with us?</h3>
          <p className="text-retro-teal/60 text-lg max-w-lg mx-auto font-medium">We provide the platform, the audience, and the tools so you can focus on teaching.</p>
        </div>
        <div className="grid md:grid-cols-3 gap-8">
          {[
            { icon: <BarChart3 size={28} />, title: "Revenue Share", text: "Earn competitive royalties. Top instructors earn 6-figures annually." },
            { icon: <Video size={28} />, title: "Studio Quality", text: "We provide professional editing and motion graphics. You just bring the knowledge." },
            { icon: <Globe size={28} />, title: "Global Reach", text: "Instant access to 10,000+ active learners. We handle distribution." }
          ].map((card, i) => (
            <div key={i} className={`reveal stagger-${i + 1} group p-8 rounded-[2rem] bg-white border border-retro-teal/5 hover:border-retro-salmon/20 hover:shadow-xl transition-all duration-500`}>
              <div className="w-14 h-14 rounded-xl bg-retro-bg flex items-center justify-center text-retro-salmon mb-6 group-hover:scale-110 transition-transform">
                {card.icon}
              </div>
              <h4 className="text-2xl font-bold text-retro-teal mb-3">{card.title}</h4>
              <p className="text-retro-teal/70 text-base leading-relaxed font-medium">{card.text}</p>
            </div>
          ))}
        </div>
      </section>

      {/* How It Works Section */}
      <section className="bg-white py-20">
        <div className="max-w-[1200px] mx-auto px-6 md:px-12 space-y-16">
          <div className="text-center mb-16 reveal">
            <h3 className="text-4xl font-black text-retro-teal mb-4">How it works</h3>
          </div>
          {[
            { id: "01", title: "Submit Idea", desc: "Tell us about your expertise and proposed topic." },
            { id: "02", title: "Design Syllabus", desc: "Collaborate with our curriculum experts." },
            { id: "03", title: "Launch & Earn", desc: "Go live on the platform. Track analytics and get paid." },
          ].map((step, index) => (
            <div key={index} className="reveal flex flex-col md:flex-row md:items-center gap-6 border-b border-retro-teal/10 pb-12 last:border-b-0" style={{ transitionDelay: `${index * 150}ms` }}>
              <div className="w-[140px] flex items-center justify-center">
                <ScrollFillNumber number={step.id} sizeClass="text-6xl md:text-[120px]" />
              </div>
              <div className="flex-1">
                <h4 className="text-3xl md:text-4xl font-black text-retro-teal">{step.title}</h4>
                <p className="text-lg text-retro-teal/70 mt-2">{step.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Application Form Section */}
      <section id="apply" className="py-24 px-6 md:px-12 bg-retro-bg">
        <div className="max-w-4xl mx-auto">
          <div className="bg-white rounded-[3rem] p-8 md:p-16 border border-retro-teal/5 shadow-2xl reveal">
            <h3 className="text-4xl md:text-5xl font-black text-retro-teal tracking-tight mb-4 text-center">Submit your proposal</h3>
            <p className="text-retro-teal/60 text-lg mb-12 font-medium text-center">Draft your course idea. Use the AI assistant to refine your curriculum structure.</p>

            <form onSubmit={handleSubmit} className="space-y-8">
              <div className="grid md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-sm font-bold text-retro-teal/70 uppercase tracking-widest ml-1">Full Name</label>
                  <input type="text" name="fullName" value={formData.fullName} onChange={handleChange} required className="w-full h-14 bg-retro-bg border border-retro-teal/10 rounded-2xl px-6 font-medium focus:ring-4 focus:ring-retro-teal/5 focus:border-retro-teal outline-none transition-all" placeholder="John Doe" />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-bold text-retro-teal/70 uppercase tracking-widest ml-1">Email Address</label>
                  <input type="email" name="email" value={formData.email} onChange={handleChange} required className="w-full h-14 bg-retro-bg border border-retro-teal/10 rounded-2xl px-6 font-medium focus:ring-4 focus:ring-retro-teal/5 focus:border-retro-teal outline-none transition-all" placeholder="john@example.com" />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-bold text-retro-teal/70 uppercase tracking-widest ml-1">Course Title</label>
                <input type="text" name="courseTitle" value={formData.courseTitle} onChange={handleChange} required className="w-full h-14 bg-retro-bg border border-retro-teal/10 rounded-2xl px-6 font-medium focus:ring-4 focus:ring-retro-teal/5 focus:border-retro-teal outline-none transition-all" placeholder="e.g. Master Modern Distributed Systems" />
              </div>

              <div className="space-y-2">
                <div className="flex justify-between items-center ml-1">
                  <label className="text-sm font-bold text-retro-teal/70 uppercase tracking-widest">Course Description</label>
                  <button type="button" onClick={handleAiGenerate} disabled={isGenerating} className="flex items-center gap-1.5 text-[10px] font-black uppercase text-retro-salmon hover:text-retro-teal transition-colors disabled:opacity-50">
                    <Sparkles size={12} /> {isGenerating ? "Refining..." : "Refine with AI"}
                  </button>
                </div>
                <textarea name="courseDescription" value={formData.courseDescription} onChange={handleChange} rows={5} required className="w-full bg-retro-bg border border-retro-teal/10 rounded-3xl p-6 font-medium focus:ring-4 focus:ring-retro-teal/5 focus:border-retro-teal outline-none transition-all resize-none" placeholder="Describe what learners will achieve..." />
              </div>

              <div className="grid md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-sm font-bold text-retro-teal/70 uppercase tracking-widest ml-1">Area of Expertise</label>
                  <input type="text" name="expertiseArea" value={formData.expertiseArea} onChange={handleChange} required className="w-full h-14 bg-retro-bg border border-retro-teal/10 rounded-2xl px-6 font-medium focus:ring-4 focus:ring-retro-teal/5 focus:border-retro-teal outline-none transition-all" placeholder="e.g. Backend Engineering, AI" />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-bold text-retro-teal/70 uppercase tracking-widest ml-1">Years of Experience</label>
                  <input type="number" name="yearsExperience" value={formData.yearsExperience} onChange={handleChange} required className="w-full h-14 bg-retro-bg border border-retro-teal/10 rounded-2xl px-6 font-medium focus:ring-4 focus:ring-retro-teal/5 focus:border-retro-teal outline-none transition-all" placeholder="e.g. 5" />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-bold text-retro-teal/70 uppercase tracking-widest ml-1">Current Role / Headline</label>
                <input type="text" name="headline" value={formData.headline} onChange={handleChange} required className="w-full h-14 bg-retro-bg border border-retro-teal/10 rounded-2xl px-6 font-medium focus:ring-4 focus:ring-retro-teal/5 focus:border-retro-teal outline-none transition-all" placeholder="Staff Engineer at..." />
              </div>

              <button type="submit" disabled={isSubmitting} className="w-full h-16 bg-retro-teal text-white rounded-[2rem] font-bold text-lg uppercase tracking-widest shadow-xl shadow-retro-teal/20 transition hover:-translate-y-1 hover:bg-black disabled:opacity-50 flex items-center justify-center gap-3">
                {isSubmitting ? "Submitting..." : <>Submit Proposal <ArrowRight size={20} /></>}
              </button>
              {submitMessage && <p className="text-center text-sm font-bold mt-4">{submitMessage}</p>}
            </form>
          </div>
        </div>
      </section>

      {/* Footer */}
      <Footer />

      {/* Login Modal */}
      {showLoginModal && (
        <div className="fixed inset-0 z-[100] bg-black/60 backdrop-blur-sm px-6 flex items-center justify-center">
          <div className="relative w-full max-w-lg rounded-[2.5rem] bg-white p-10 shadow-2xl text-left border border-retro-teal/5">
            <button
              type="button"
              onClick={closeLoginModal}
              className="absolute right-6 top-6 text-retro-teal/40 hover:text-retro-teal transition"
            >
              <X size={24} />
            </button>
            <div className="space-y-2 mb-8">
              <p className="text-[11px] font-black uppercase tracking-[0.4em] text-retro-salmon">Tutor Console</p>
              <h3 className="text-3xl font-black text-retro-teal">Log in to continue</h3>
              <p className="text-sm text-retro-teal/60">Access your studio and cohort analytics.</p>
            </div>
            <form className="space-y-5" onSubmit={handleTutorLogin}>
              <div className="space-y-2">
                <label className="text-xs font-bold uppercase tracking-wide text-retro-teal/50 ml-1">Work Email</label>
                <input
                  type="email"
                  value={loginEmail}
                  onChange={(e) => setLoginEmail(e.target.value)}
                  className="w-full h-14 bg-retro-bg border border-retro-teal/5 rounded-2xl px-6 font-bold text-retro-teal placeholder:text-retro-teal/20 focus:ring-4 focus:ring-retro-teal/5 outline-none"
                  placeholder="you@metatutor.com"
                  required
                />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-bold uppercase tracking-wide text-retro-teal/50 ml-1">Password</label>
                <input
                  type="password"
                  value={loginPassword}
                  onChange={(e) => setLoginPassword(e.target.value)}
                  className="w-full h-14 bg-retro-bg border border-retro-teal/5 rounded-2xl px-6 font-bold text-retro-teal placeholder:text-retro-teal/20 focus:ring-4 focus:ring-retro-teal/5 outline-none"
                  placeholder="••••••••"
                  required
                />
              </div>
              {loginError && <p className="text-sm text-retro-salmon font-bold bg-retro-salmon/10 p-4 rounded-2xl">{loginError}</p>}
              <button
                type="submit"
                disabled={isLoggingIn}
                className="w-full h-14 bg-retro-teal text-white rounded-2xl font-bold uppercase tracking-widest shadow-lg shadow-retro-teal/20 transition hover:-translate-y-1 hover:bg-black disabled:opacity-50"
              >
                {isLoggingIn ? "Signing in..." : "Continue"}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default BecomeTutor;
