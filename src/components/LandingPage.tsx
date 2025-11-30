import React, { useState, useEffect } from 'react';
import { 
  Stethoscope, Wind, Activity, Zap, ShieldCheck, 
  ArrowRight, Users, CheckCircle, Menu, X,
  Heart, Smartphone, BarChart3, Calendar, MessageCircle,
  ClipboardList, TrendingUp, Clock, Bell, Thermometer,
  Droplets, Eye, MessageSquare
} from 'lucide-react';
import { LogIn } from "lucide-react";

// --- INTERFACES ---
interface LandingPageProps {
  onPatientLogin: () => void;
  onDoctorLogin: () => void;
  onPatientRegister: () => void;
}

// --- CSS IN-JS POUR LE THÈME CLAIR ---
const styleTag = `
  @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@200;300;400;500;600;700;800&display=swap');

  :root {
    --primary: #2563EB;
    --secondary: #06B6D4;
    --accent: #F43F5E;
    --text-main: #0F172A;
    --text-muted: #64748B;
  }

  body { 
    font-family: 'Plus Jakarta Sans', sans-serif; 
    background-color: #F8FAFC;
    color: #0F172A;
    overflow-x: hidden;
  }

  /* --- ANIMATIONS DE FOND (AURORA LIGHT) --- */
  @keyframes aurora {
    0% { background-position: 50% 50%, 50% 50%; }
    100% { background-position: 350% 50%, 350% 50%; }
  }

  .aurora-bg {
    background-image: 
      radial-gradient(at 0% 0%, rgba(37, 99, 235, 0.08) 0px, transparent 50%),
      radial-gradient(at 100% 0%, rgba(6, 182, 212, 0.08) 0px, transparent 50%),
      radial-gradient(at 100% 100%, rgba(37, 99, 235, 0.08) 0px, transparent 50%),
      radial-gradient(at 0% 100%, rgba(6, 182, 212, 0.08) 0px, transparent 50%);
    background-size: 100% 100%;
    filter: blur(60px);
  }

  /* --- FLOTTEMENT & MOUVEMENT --- */
  @keyframes float-slow {
    0%, 100% { transform: translateY(0px) rotate(0deg); }
    50% { transform: translateY(-20px) rotate(1deg); }
  }
  @keyframes float-medium {
    0%, 100% { transform: translateY(0px); }
    50% { transform: translateY(-15px); }
  }
  
  .animate-float-slow { animation: float-slow 8s ease-in-out infinite; }
  .animate-float-medium { animation: float-medium 5s ease-in-out infinite; }
  
  /* --- TEXTE SHIMMER (Dark variant) --- */
  .shimmer-text {
    background: linear-gradient(to right, #0F172A 20%, #64748B 40%, #64748B 60%, #0F172A 80%);
    background-size: 200% auto;
    color: #000;
    background-clip: text;
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    animation: shine 5s linear infinite;
  }
  @keyframes shine { to { background-position: 200% center; } }

  /* --- GLASSMORPHISM LIGHT --- */
  .glass-card {
    background: rgba(255, 255, 255, 0.7);
    backdrop-filter: blur(16px);
    -webkit-backdrop-filter: blur(16px);
    border: 1px solid rgba(226, 232, 240, 0.8);
    box-shadow: 0 10px 40px -10px rgba(0, 0, 0, 0.05);
  }
  
  .glass-card:hover {
    background: rgba(255, 255, 255, 0.9);
    border: 1px solid rgba(37, 99, 235, 0.2);
    box-shadow: 0 20px 40px -10px rgba(37, 99, 235, 0.1);
  }

  /* --- SCROLL REVEAL --- */
  .reveal {
    opacity: 0;
    transform: translateY(30px);
    transition: all 1s cubic-bezier(0.16, 1, 0.3, 1);
  }
  .reveal.active {
    opacity: 1;
    transform: translateY(0);
  }
  
  /* Utility for Marquee */
  @keyframes marquee {
    0% { transform: translateX(0%); }
    100% { transform: translateX(-50%); }
  }
  .animate-marquee {
    animation: marquee 30s linear infinite;
  }
`;

// --- COMPOSANT: HERO SIMPLE ---
const HeroSection = () => (
  <div className="w-full h-full flex items-center justify-center relative z-20">
    {/* Glow background */}
    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[300px] h-[300px] sm:w-[400px] sm:h-[400px] lg:w-[600px] lg:h-[600px] bg-blue-200/40 rounded-full blur-[60px] sm:blur-[80px] animate-pulse"></div>

    <div className="relative w-full max-w-4xl px-4 sm:px-6">
      {/* Carte principale avec formulaire en cours */}
      <div className="bg-white/90 backdrop-blur-xl rounded-2xl lg:rounded-3xl border border-slate-200 shadow-xl lg:shadow-2xl shadow-slate-300/50 overflow-hidden">
        
        {/* Header */}
        <div className="h-14 lg:h-16 border-b border-slate-100 flex items-center px-4 lg:px-8 justify-between bg-slate-50/80">
           <div className="flex items-center gap-2 lg:gap-3">
             <div className="w-2 h-2 lg:w-3 lg:h-3 rounded-full bg-emerald-400"></div>
             <span className="text-xs lg:text-sm font-bold text-slate-700">Formulaire en cours</span>
           </div>
           <div className="flex items-center gap-2 lg:gap-3">
             <div className="text-xs text-slate-500 font-medium">Étape 4/8</div>
             <div className="w-1.5 h-1.5 lg:w-2 lg:h-2 bg-emerald-500 rounded-full animate-pulse"></div>
           </div>
        </div>

        {/* Contenu du formulaire */}
        <div className="p-4 lg:p-8">
          {/* Barre de progression */}
          <div className="mb-6 lg:mb-8">
            <div className="flex justify-between text-xs lg:text-sm text-slate-500 mb-2">
              <span>Fiche de suivi quotidien</span>
              <span>50% complété</span>
            </div>
            <div className="w-full bg-slate-100 h-1.5 lg:h-2 rounded-full overflow-hidden">
              <div className="bg-blue-500 h-full w-1/2 rounded-full"></div>
            </div>
          </div>

          {/* Étapes du formulaire */}
          <div className="grid grid-cols-4 gap-2 lg:gap-3 mb-6 lg:mb-8">
            {['Temp', 'Tension', 'Cardiaque', 'Respir', 'Oxygène', 'Sang', 'Crachats', 'Notes'].map((step, index) => (
              <div key={index} className={`text-center ${index < 4 ? 'text-blue-600' : 'text-slate-400'}`}>
                <div className={`w-6 h-6 lg:w-8 lg:h-8 rounded-full flex items-center justify-center text-xs font-bold mx-auto mb-1 lg:mb-2 ${
                  index < 4 ? 'bg-blue-100 text-blue-600' : 'bg-slate-100 text-slate-400'
                }`}>
                  {index + 1}
                </div>
                <div className="text-[10px] lg:text-xs font-medium leading-tight">{step}</div>
              </div>
            ))}
          </div>

          {/* Champs du formulaire actuel */}
          <div className="bg-slate-50 rounded-xl lg:rounded-2xl p-4 lg:p-6 mb-4 lg:mb-6">
            <div className="flex items-center gap-2 lg:gap-3 mb-3 lg:mb-4">
              <div className="w-8 h-8 lg:w-10 lg:h-10 rounded-full bg-blue-100 flex items-center justify-center">
                <Wind className="text-blue-600 w-4 h-4 lg:w-5 lg:h-5" />
              </div>
              <div>
                <h3 className="font-bold text-slate-800 text-sm lg:text-base">Fréquence Respiratoire</h3>
                <p className="text-xs lg:text-sm text-slate-500">Nombre de cycles par minute</p>
              </div>
            </div>
            
            <div className="flex items-center justify-center gap-3 lg:gap-4">
              <input 
                type="number" 
                className="text-4xl lg:text-5xl font-bold text-slate-900 bg-transparent border-none focus:ring-0 text-center w-24 lg:w-32 placeholder-slate-300"
                placeholder="16"
                value="16"
                readOnly
              />
              <span className="text-xl lg:text-2xl font-bold text-slate-400">/min</span>
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-2 lg:gap-3">
            <button className="flex-1 py-2 lg:py-3 px-3 lg:px-4 bg-white border border-slate-200 rounded-lg lg:rounded-xl text-slate-600 text-sm lg:text-base font-medium hover:bg-slate-50 transition-colors">
              Aide vidéo
            </button>
            <button className="flex-1 py-2 lg:py-3 px-3 lg:px-4 bg-blue-600 text-white rounded-lg lg:rounded-xl font-bold hover:bg-blue-700 transition-colors text-sm lg:text-base">
              Suivant
            </button>
          </div>
        </div>
      </div>

      {/* Notification flottante */}
      <div className="absolute -right-2 lg:-right-10 top-4 lg:top-8 glass-card p-3 lg:p-4 rounded-xl flex items-center gap-3 lg:gap-4 animate-float-medium z-30 max-w-[160px] lg:max-w-[200px] bg-white/90">
         <div className="w-8 h-8 lg:w-10 lg:h-10 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-600 shrink-0">
           <img 
             src="/media/25.jpg" 
             alt="Dr. HAMMA Sanae" 
             className="w-6 h-6 lg:w-8 lg:h-8 rounded-full object-cover"
             onError={(e) => {
               const target = e.target as HTMLImageElement;
               target.style.display = 'none';
               // Fallback à l'icône si l'image ne charge pas
               const parent = target.parentElement;
               if (parent) {
                 parent.innerHTML = '<CheckCircle size={20} />';
               }
             }}
           />
         </div>
         <div>
           <div className="text-xs lg:text-xs text-slate-800 font-bold leading-tight">Connecté au Dr. FDIL</div>
           <div className="text-[9px] lg:text-[10px] text-slate-500 leading-tight mt-0.5">Votre médecin est informé</div>
         </div>
      </div>
    </div>
  </div>
);

// --- MAIN LANDING PAGE ---
export default function LandingPage({ onPatientLogin, onDoctorLogin, onPatientRegister }: LandingPageProps) {
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  
  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
      const reveals = document.querySelectorAll('.reveal');
      reveals.forEach(reveal => {
        const windowHeight = window.innerHeight;
        const elementTop = reveal.getBoundingClientRect().top;
        if (elementTop < windowHeight - 100) {
          reveal.classList.add('active');
        }
      });
    };
    window.addEventListener('scroll', handleScroll);
    handleScroll();
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <div className="min-h-screen bg-[#F8FAFC] text-slate-900 selection:bg-blue-200 selection:text-blue-900">
      <style>{styleTag}</style>

      {/* --- BACKGROUND ANIMÉ --- */}
      <div className="fixed inset-0 w-full h-full pointer-events-none z-0 overflow-hidden bg-slate-50">
         <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-blue-200/40 rounded-full blur-[120px] animate-float-slow"></div>
         <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-cyan-200/40 rounded-full blur-[120px] animate-float-medium"></div>
         <div className="aurora-bg absolute inset-0 opacity-60"></div>
         {/* Grid pattern overlay light */}
         <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-10 mix-blend-overlay"></div>
      </div>

      {/* --- NAVBAR --- */}
      <nav className={`fixed w-full z-50 transition-all duration-500 border-b ${scrolled ? 'bg-white/80 backdrop-blur-md border-slate-200 py-3 shadow-sm' : 'bg-transparent border-transparent py-4 lg:py-6'}`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="flex justify-between items-center">
            {/* Logo */}
            <div className="flex items-center gap-2 lg:gap-3 cursor-pointer group">
              <div className="relative w-8 h-8 lg:w-10 lg:h-10 flex items-center justify-center">
                 <div className="">
                    <img 
                        src="/media/logo.png" 
                        alt="PNEUMO Suivie Logo" 
                        className="w-12 h-12 lg:w-15 lg:h-15 object-contain"
                        onError={(e) => {
                        const target = e.target as HTMLImageElement;
                        target.style.display = 'none';
                        }}
                    />
                 </div>
              </div>
              <span className="text-lg lg:text-xl font-bold tracking-tight text-slate-900 group-hover:text-blue-600 transition-colors">
                PNEUMO SuitVie<span className="text-cyan-500">.</span>
              </span>
            </div>

            {/* Desktop Nav */}
            <div className="hidden md:flex items-center gap-6 lg:gap-8">
              <button onClick={onPatientLogin} className="text-sm font-medium text-slate-600 hover:text-blue-600 transition-colors relative group">
                Espace Patient
                <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-blue-600 transition-all group-hover:w-full"></span>
              </button>
              
              <button onClick={onDoctorLogin} className="group relative px-4 lg:px-6 py-2 lg:py-2.5 rounded-full font-bold text-sm overflow-hidden bg-slate-900 text-white hover:scale-105 transition-transform shadow-lg shadow-slate-900/20">
                <span className="relative z-10 flex items-center gap-2">Portail Pro <ArrowRight size={14}/></span>
                <div className="absolute inset-0 bg-gradient-to-r from-slate-800 to-slate-700 opacity-0 group-hover:opacity-100 transition-opacity"></div>
              </button>
            </div>

            {/* Mobile Toggle */}
            <button className="md:hidden text-slate-800 p-1" onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>
              {mobileMenuOpen ? <X size={20}/> : <Menu size={20}/>}
            </button>
          </div>

          {/* Mobile Menu */}
          {mobileMenuOpen && (
            <div className="md:hidden absolute top-full left-0 right-0 bg-white/95 backdrop-blur-md border-b border-slate-200 py-4 px-4 shadow-lg">
              <div className="flex flex-col gap-4">
                <button 
                  onClick={onPatientLogin}
                  className="text-left py-2 px-4 text-slate-700 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors font-medium"
                >
                  Espace Patient
                </button>
                <button 
                  onClick={onDoctorLogin}
                  className="text-left py-2 px-4 bg-slate-900 text-white rounded-lg font-medium hover:bg-slate-800 transition-colors"
                >
                  Portail Professionnel
                </button>
              </div>
            </div>
          )}
        </div>
      </nav>

      {/* --- HERO SECTION --- */}
      <section className="relative pt-28 pb-16 lg:pt-48 lg:pb-32 px-4 sm:px-6 z-10 overflow-hidden">
        <div className="max-w-7xl mx-auto grid lg:grid-cols-2 gap-8 lg:gap-12 items-center">
          
          <div className="text-center lg:text-left z-20">
            {/* Titre Principal */}
            <h1 className="text-4xl sm:text-5xl lg:text-7xl font-extrabold tracking-tight leading-[1.1] mb-6 reveal active transition-delay-100 text-slate-900">
              Votre souffle, <br/>
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 via-cyan-500 to-emerald-500 animate-pulse">
                notre priorité
              </span>
            </h1>

            {/* PHRASE CLÉ AVEC STYLE SPÉCIAL */}
            <div className="mb-8 lg:mb-10 reveal active transition-delay-200">
                <div className="relative inline-block">
                    <p className="relative text-lg sm:text-xl lg:text-2xl text-slate-500 font-light italic leading-relaxed border-l-4 border-blue-500 pl-4 lg:pl-6 py-2">
                      "Un suivi quotidien simple,<br className="hidden sm:block"/> pour une respiration sereine."
                    </p>
                </div>
            </div>

            {/* CTAs */}
            <div className="flex flex-col sm:flex-row gap-3 lg:gap-4 justify-center lg:justify-start reveal active transition-delay-300">
              <button onClick={onPatientRegister} className="group relative px-6 lg:px-8 py-3 lg:py-4 bg-blue-600 rounded-xl lg:rounded-2xl font-bold text-base lg:text-lg overflow-hidden shadow-xl shadow-blue-500/30 hover:shadow-blue-500/50 transition-all hover:-translate-y-1 text-white">
                 <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700"></div>
                 <span className="flex items-center gap-2 lg:gap-3"><ClipboardList size={18} className="fill-current"/> Commencer le suivi</span>
              </button>

              <button onClick={onPatientLogin} className="px-6 lg:px-8 py-3 lg:py-4 rounded-xl lg:rounded-2xl font-bold text-base lg:text-lg border border-slate-200 bg-white text-slate-700 hover:bg-slate-50 hover:border-slate-300 transition-all flex items-center gap-2 lg:gap-3 shadow-sm hover:shadow-md">
                 <LogIn size={18}/> Se connecter
              </button>
            </div>

          </div>

          {/* Côté Droit : Hero Section */}
          <div className="relative h-[400px] sm:h-[450px] lg:h-[500px] flex items-center justify-center reveal active transition-delay-300">
             <HeroSection />
          </div>
        </div>
      </section>

      {/* --- LOGO MARQUEE (TRUST) --- */}
      <section className="py-8 lg:py-10 border-y border-slate-200 bg-white relative overflow-hidden">
         <div className="absolute inset-0 bg-gradient-to-r from-white via-transparent to-white z-10 pointer-events-none"></div>
         <div className="max-w-7xl mx-auto flex items-center gap-8 lg:gap-12 opacity-60 animate-marquee whitespace-nowrap overflow-hidden">
             <div className="flex gap-12 lg:gap-16" style={{width: '200%'}}>
               {["Dr. FDIL Soumia", "Dr. HAMMI Sanae","Dr. BOUTI Khalid","Dr. ZAGAOUCH Dalal"].map((name, i) => (
                  <span key={i} className="text-lg lg:text-xl font-bold tracking-widest text-slate-400 hover:text-blue-600 transition-colors cursor-default whitespace-nowrap">
                    {name}
                  </span>
               ))}
               {["Dr. FDIL Soumia", "Dr. HAMMI Sanae","Dr. BOUTI Khalid","Dr. ZAGAOUCH Dalal"].map((name, i) => (
                  <span key={`dup-${i}`} className="text-lg lg:text-xl font-bold tracking-widest text-slate-400 hover:text-blue-600 transition-colors cursor-default whitespace-nowrap">
                    {name}
                  </span>
               ))}
             </div>
         </div>
      </section>

      {/* --- FORMULAIRE QUOTIDIEN DÉTAILLÉ --- */}
      <section className="py-20 lg:py-32 relative z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
           <div className="text-center mb-12 lg:mb-20 reveal">
              <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold mb-4 lg:mb-6 text-slate-900">Votre formulaire <br/><span className="shimmer-text">complet en 8 étapes</span></h2>
              <p className="text-slate-500 max-w-2xl mx-auto text-base lg:text-lg">
                Un suivi médical précis grâce à des mesures quotidiennes simples et guidées.
              </p>
           </div>

           <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6">
             
             {/* Étape 1: Température */}
             <div className="glass-card rounded-2xl lg:rounded-3xl p-4 lg:p-6 group hover:bg-white transition-all duration-300 reveal bg-white">
                 <div className="w-10 h-10 lg:w-12 lg:h-12 bg-blue-100 rounded-lg lg:rounded-xl flex items-center justify-center mb-3 lg:mb-4 group-hover:scale-110 transition-transform">
                    <Thermometer className="text-blue-600 w-5 h-5 lg:w-6 lg:h-6" />
                 </div>
                 <h3 className="text-base lg:text-lg font-bold mb-2 text-slate-900">1. Température</h3>
                 <p className="text-slate-500 text-xs lg:text-sm">Mesure de la température corporelle avec guide vidéo.</p>
                 <div className="mt-2 lg:mt-3 text-xs text-blue-600 font-medium">Vidéo guide disponible</div>
             </div>

             {/* Étape 2: Tension */}
             <div className="glass-card rounded-2xl lg:rounded-3xl p-4 lg:p-6 group hover:bg-white transition-all duration-300 reveal bg-white">
                 <div className="w-10 h-10 lg:w-12 lg:h-12 bg-purple-100 rounded-lg lg:rounded-xl flex items-center justify-center mb-3 lg:mb-4 group-hover:scale-110 transition-transform">
                    <Activity className="text-purple-600 w-5 h-5 lg:w-6 lg:h-6" />
                 </div>
                 <h3 className="text-base lg:text-lg font-bold mb-2 text-slate-900">2. Tension Artérielle</h3>
                 <p className="text-slate-500 text-xs lg:text-sm">Systolique et diastolique avec instructions.</p>
                 <div className="mt-2 lg:mt-3 text-xs text-purple-600 font-medium">Vidéo guide disponible</div>
             </div>

             {/* Étape 3: Cardiaque */}
             <div className="glass-card rounded-2xl lg:rounded-3xl p-4 lg:p-6 group hover:bg-white transition-all duration-300 reveal bg-white">
                 <div className="w-10 h-10 lg:w-12 lg:h-12 bg-red-100 rounded-lg lg:rounded-xl flex items-center justify-center mb-3 lg:mb-4 group-hover:scale-110 transition-transform">
                    <Heart className="text-red-600 w-5 h-5 lg:w-6 lg:h-6" />
                 </div>
                 <h3 className="text-base lg:text-lg font-bold mb-2 text-slate-900">3. Fréquence Cardiaque</h3>
                 <p className="text-slate-500 text-xs lg:text-sm">Mesure du pouls en battements par minute.</p>
                 <div className="mt-2 lg:mt-3 text-xs text-red-600 font-medium">Vidéo guide disponible</div>
             </div>

             {/* Étape 4: Respiratoire */}
             <div className="glass-card rounded-2xl lg:rounded-3xl p-4 lg:p-6 group hover:bg-white transition-all duration-300 reveal bg-white">
                 <div className="w-10 h-10 lg:w-12 lg:h-12 bg-cyan-100 rounded-lg lg:rounded-xl flex items-center justify-center mb-3 lg:mb-4 group-hover:scale-110 transition-transform">
                    <Wind className="text-cyan-600 w-5 h-5 lg:w-6 lg:h-6" />
                 </div>
                 <h3 className="text-base lg:text-lg font-bold mb-2 text-slate-900">4. Fréquence Respiratoire</h3>
                 <p className="text-slate-500 text-xs lg:text-sm">Nombre de cycles respiratoires par minute.</p>
                 <div className="mt-2 lg:mt-3 text-xs text-cyan-600 font-medium">Vidéo guide disponible</div>
             </div>

             {/* Étape 5: Oxygène */}
             <div className="glass-card rounded-2xl lg:rounded-3xl p-4 lg:p-6 group hover:bg-white transition-all duration-300 reveal bg-white">
                 <div className="w-10 h-10 lg:w-12 lg:h-12 bg-emerald-100 rounded-lg lg:rounded-xl flex items-center justify-center mb-3 lg:mb-4 group-hover:scale-110 transition-transform">
                    <Droplets className="text-emerald-600 w-5 h-5 lg:w-6 lg:h-6" />
                 </div>
                 <h3 className="text-base lg:text-lg font-bold mb-2 text-slate-900">5. Oxygène (SpO₂)</h3>
                 <p className="text-slate-500 text-xs lg:text-sm">Saturation en oxygène avec option oxygénothérapie.</p>
                 <div className="mt-2 lg:mt-3 text-xs text-emerald-600 font-medium">Vidéo guide disponible</div>
             </div>

             {/* Étape 6: Hémoptysie */}
             <div className="glass-card rounded-2xl lg:rounded-3xl p-4 lg:p-6 group hover:bg-white transition-all duration-300 reveal bg-white">
                 <div className="w-10 h-10 lg:w-12 lg:h-12 bg-rose-100 rounded-lg lg:rounded-xl flex items-center justify-center mb-3 lg:mb-4 group-hover:scale-110 transition-transform">
                    <Eye className="text-rose-600 w-5 h-5 lg:w-6 lg:h-6" />
                 </div>
                 <h3 className="text-base lg:text-lg font-bold mb-2 text-slate-900">6. Hémoptysie (Sang)</h3>
                 <p className="text-slate-500 text-xs lg:text-sm">Détection et quantification avec guide visuel.</p>
                 <div className="mt-2 lg:mt-3 text-xs text-rose-600 font-medium">Guide image disponible</div>
             </div>

             {/* Étape 7: Expectorations */}
             <div className="glass-card rounded-2xl lg:rounded-3xl p-4 lg:p-6 group hover:bg-white transition-all duration-300 reveal bg-white">
                 <div className="w-10 h-10 lg:w-12 lg:h-12 bg-amber-100 rounded-lg lg:rounded-xl flex items-center justify-center mb-3 lg:mb-4 group-hover:scale-110 transition-transform">
                    <Droplets className="text-amber-600 w-5 h-5 lg:w-6 lg:h-6" />
                 </div>
                 <h3 className="text-base lg:text-lg font-bold mb-2 text-slate-900">7. Expectorations</h3>
                 <p className="text-slate-500 text-xs lg:text-sm">Couleur, aspect et quantité des crachats.</p>
                 <div className="mt-2 lg:mt-3 text-xs text-amber-600 font-medium">Nuancier disponible</div>
             </div>

             {/* Étape 8: Notes */}
             <div className="glass-card rounded-2xl lg:rounded-3xl p-4 lg:p-6 group hover:bg-white transition-all duration-300 reveal bg-white">
                 <div className="w-10 h-10 lg:w-12 lg:h-12 bg-slate-100 rounded-lg lg:rounded-xl flex items-center justify-center mb-3 lg:mb-4 group-hover:scale-110 transition-transform">
                    <MessageSquare className="text-slate-600 w-5 h-5 lg:w-6 lg:h-6" />
                 </div>
                 <h3 className="text-base lg:text-lg font-bold mb-2 text-slate-900">8. Notes & Ressenti</h3>
                 <p className="text-slate-500 text-xs lg:text-sm">Votre état général, fatigue et observations.</p>
                 <div className="mt-2 lg:mt-3 text-xs text-slate-600 font-medium">Commentaires libres</div>
             </div>

           </div>
        </div>
      </section>

      {/* --- AVANTAGES DU SUIVI --- */}
      <section className="py-20 lg:py-32 overflow-hidden relative bg-slate-50">
         <div className="max-w-7xl mx-auto px-4 sm:px-6 grid lg:grid-cols-2 gap-12 lg:gap-20 items-center">
             <div className="reveal">
                <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold mb-6 lg:mb-8 text-slate-900">Un suivi médical <br/>sans contraintes.</h2>
                <p className="text-slate-500 text-base lg:text-lg mb-6 lg:mb-8">
                  Remplissez votre formulaire quotidien en moins de 5 minutes et gardez votre médecin informé en temps réel.
                </p>
                
                <div className="space-y-4 lg:space-y-6">
                   {[
                      {title: "Guidage pas à pas", desc: "Chaque mesure est expliquée avec des vidéos et images", icon: ClipboardList},
                      {title: "Connexion directe", desc: "Votre pneumologue reçoit instantanément vos données", icon: Users},
                      {title: "Alertes intelligentes", desc: "Notifications automatiques en cas de valeurs anormales", icon: Bell},
                      {title: "Historique complet", desc: "Suivez votre évolution sur plusieurs semaines", icon: TrendingUp},
                   ].map((item, i) => (
                      <div key={i} className="flex gap-3 lg:gap-4 group cursor-pointer">
                         <div className="w-10 h-10 lg:w-12 lg:h-12 rounded-full bg-slate-50 border border-slate-200 flex items-center justify-center group-hover:bg-blue-600 group-hover:border-blue-600 transition-colors shrink-0">
                            <item.icon size={18} className="text-slate-400 group-hover:text-white"/>
                         </div>
                         <div>
                            <h4 className="text-lg lg:text-xl font-bold text-slate-800 group-hover:text-blue-600 transition-colors">{item.title}</h4>
                            <p className="text-slate-500 text-xs lg:text-sm mt-1">{item.desc}</p>
                         </div>
                      </div>
                   ))}
                </div>
             </div>

             {/* Visualisation mobile */}
             <div className="relative flex justify-center reveal">
                 <div className="absolute inset-0 bg-gradient-to-tr from-blue-400/20 to-purple-400/20 blur-[60px] lg:blur-[80px] rounded-full"></div>
                 
                 <div className="relative w-full max-w-xs lg:max-w-sm bg-white rounded-2xl lg:rounded-3xl border border-slate-200 shadow-xl lg:shadow-2xl overflow-hidden transform hover:scale-105 transition-transform duration-500">
                   {/* Header mobile */}
                   <div className="bg-gradient-to-r from-blue-600 to-cyan-500 p-4 lg:p-6 text-white">
                      <div className="flex items-center gap-2 lg:gap-3 mb-1 lg:mb-2">
                         <ClipboardList size={20} className="lg:w-6 lg:h-6" />
                         <h3 className="text-lg lg:text-xl font-bold">Aujourd'hui</h3>
                      </div>
                      <p className="text-blue-100 text-xs lg:text-sm">Formulaire à compléter</p>
                   </div>
                   
                   {/* Liste des étapes */}
                   <div className="p-4 lg:p-6 space-y-3 lg:space-y-4">
                      {[
                         {step: 1, title: "Température", completed: true, icon: Thermometer},
                         {step: 2, title: "Tension", completed: true, icon: Activity},
                         {step: 3, title: "Cardiaque", completed: true, icon: Heart},
                         {step: 4, title: "Respiratoire", completed: false, icon: Wind},
                         {step: 5, title: "Oxygène", completed: false, icon: Droplets},
                         {step: 6, title: "Hémoptysie", completed: false, icon: Eye},
                         {step: 7, title: "Expectorations", completed: false, icon: Droplets},
                         {step: 8, title: "Notes", completed: false, icon: MessageSquare},
                      ].map((item) => (
                         <div key={item.step} className="flex items-center gap-3 lg:gap-4 p-2 lg:p-3 rounded-lg lg:rounded-xl bg-slate-50">
                            <div className={`w-6 h-6 lg:w-8 lg:h-8 rounded-full flex items-center justify-center text-xs lg:text-sm font-bold ${
                               item.completed ? 'bg-emerald-100 text-emerald-600' : 'bg-slate-200 text-slate-400'
                            }`}>
                               {item.completed ? '✓' : item.step}
                            </div>
                            <div className="flex-1">
                               <div className="font-medium text-slate-800 text-sm lg:text-base">{item.title}</div>
                            </div>
                            {item.completed && (
                               <div className="w-1.5 h-1.5 lg:w-2 lg:h-2 bg-emerald-500 rounded-full"></div>
                            )}
                         </div>
                      ))}
                   </div>

                   {/* Bouton d'action */}
                   <div className="p-4 lg:p-6 border-t border-slate-100">
                      <button className="w-full bg-blue-600 text-white py-2 lg:py-3 rounded-lg lg:rounded-xl font-bold hover:bg-blue-700 transition-colors text-sm lg:text-base">
                         Continuer le formulaire
                      </button>
                   </div>
                 </div>
             </div>
         </div>
      </section>

      {/* --- CTA FINAL --- */}
      <section className="py-20 lg:py-32 relative overflow-hidden bg-white">
         <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-[400px] h-[400px] lg:w-[800px] lg:h-[800px] bg-blue-100 rounded-full blur-[60px] lg:blur-[100px] pointer-events-none"></div>
         
         <div className="max-w-4xl mx-auto px-4 sm:px-6 text-center relative z-10 reveal">
            <h2 className="text-3xl sm:text-4xl lg:text-5xl xl:text-7xl font-bold tracking-tight mb-6 lg:mb-8 text-slate-900">
               Prêt à simplifier <br/>
               <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-500 to-blue-600">votre suivi médical ?</span>
            </h2>
            <p className="text-lg lg:text-xl text-slate-500 mb-8 lg:mb-12">
               Rejoignez des centaines de patients qui suivent leur santé respiratoire au quotidien.
            </p>
            
            <div className="flex flex-col sm:flex-row justify-center gap-4 lg:gap-6">
               <button onClick={onPatientRegister} className="px-6 lg:px-10 py-3 lg:py-5 bg-blue-600 text-white rounded-full text-base lg:text-xl font-bold shadow-xl lg:shadow-2xl shadow-blue-500/30 hover:scale-105 transition-transform">
                  Commencer le suivi
               </button>
               <button onClick={onDoctorLogin} className="px-6 lg:px-10 py-3 lg:py-5 bg-white border border-slate-200 text-slate-700 rounded-full text-base lg:text-xl font-bold hover:bg-slate-50 transition-colors shadow-lg lg:shadow-xl shadow-slate-200/50">
                  Accès Médecin
               </button>
            </div>
         </div>
      </section>

      {/* --- FOOTER MINIMALISTE --- */}
      <footer className="border-t border-slate-200 bg-white pt-12 lg:pt-16 pb-6 lg:pb-8">
         <div className="max-w-7xl mx-auto px-4 sm:px-6 flex flex-col md:flex-row justify-between items-center gap-6 lg:gap-8">
            <div className="flex items-center gap-2">
               <div className="w-6 h-6 lg:w-8 lg:h-8 bg-blue-600 rounded-lg flex items-center justify-center text-white">
                  <span className="font-bold text-sm lg:text-lg">P</span>
               </div>
               <span className="text-lg lg:text-xl font-bold text-slate-900">Pneumo SuitVie.</span>
            </div>
            
            <div className="flex gap-6 lg:gap-8 text-slate-500 text-sm lg:text-base">
               <a href="#" className="hover:text-blue-600 transition-colors">À propos</a>
               <a href="#" className="hover:text-blue-600 transition-colors">Sécurité</a>
               <a href="#" className="hover:text-blue-600 transition-colors">Support</a>
            </div>

            <div className="text-xs lg:text-sm text-slate-400">
               © 2024 Pneumo SuitVie Technologies.
            </div>
         </div>
      </footer>
    </div>
  );
}