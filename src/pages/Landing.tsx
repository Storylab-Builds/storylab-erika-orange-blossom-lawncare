import { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import {
  Leaf,
  Calendar,
  Users,
  CloudSun,
  BarChart3,
  MapPin,
  CheckCircle2,
  ArrowRight,
  Star,
  Phone,
  Mail,
  Clock,
  Shield,
  Zap,
  Smartphone,
  ChevronDown,
  Sparkles,
  TreePine,
  Flower2,
  Sun,
  Menu,
  X,
  Camera,
  Award,
  ThumbsUp,
  Truck,
} from 'lucide-react';

const services = [
  { name: 'Weekly Mowing', desc: 'Precision cut with striping patterns for a professional finish every time.', icon: Leaf, color: 'bg-green-500' },
  { name: 'Landscaping Design', desc: 'Custom landscape architecture that transforms your outdoor living space.', icon: MapPin, color: 'bg-amber-500' },
  { name: 'Seasonal Clean-ups', desc: 'Spring & fall clean-ups including leaf removal, bed prep, and debris hauling.', icon: Calendar, color: 'bg-orange-500' },
  { name: 'Fertilization & Weed Control', desc: 'Science-based lawn nutrition programs tailored to Northeast Ohio cool-season turf.', icon: Zap, color: 'bg-violet-500' },
  { name: 'Shrub & Hedge Trimming', desc: 'Expert shaping and maintenance to keep your property looking sharp year-round.', icon: TreePine, color: 'bg-teal-500' },
  { name: 'Snow & Ice Management', desc: 'Seasonal snow plowing, salting, and ice management to keep your property safe all winter.', icon: CloudSun, color: 'bg-blue-500' },
];

const features = [
  { title: 'Book Online', desc: 'Schedule your service in seconds from any device — no phone calls needed.', icon: Calendar, step: '01' },
  { title: 'Get Matched', desc: 'We assign a dedicated crew who learns your property and preferences.', icon: Users, step: '02' },
  { title: 'Weather-Smart', desc: 'AI monitors forecasts and auto-reschedules around rain — no phone tag.', icon: CloudSun, step: '03' },
  { title: 'Enjoy Your Yard', desc: 'Sit back with real-time updates, photos, and a lawn that\'s always perfect.', icon: Smartphone, step: '04' },
];

const testimonials = [
  { name: 'Sarah Mitchell', location: 'Hudson, OH', rating: 5, text: 'Orange Blossom has been taking care of our lawn for two years. They\'re always on time, communicative, and our yard has never looked better. The neighbors are jealous!', avatar: 'SM' },
  { name: 'David & Lisa R.', location: 'Akron, OH', rating: 5, text: 'The online scheduling is a game-changer. I can book, reschedule, and see exactly when my crew is coming. No more playing phone tag!', avatar: 'DL' },
  { name: 'Tom Kowalski', location: 'Canton, OH', rating: 5, text: 'Professional, reliable, and they actually care about the health of the lawn — not just cutting it. Highly recommend their fertilization program.', avatar: 'TK' },
  { name: 'Maria Gonzalez', location: 'Stow, OH', rating: 5, text: 'Switched from another service and the difference is night and day. They actually take photos after each visit so I can see the work. Love the transparency!', avatar: 'MG' },
];

const plans = [
  {
    name: 'Essential',
    price: 99,
    period: '/mo',
    desc: 'Perfect for basic lawn maintenance',
    features: ['Bi-weekly mowing', 'Edging & blowing', 'Seasonal adjustments', 'Online scheduling', 'Email support'],
    popular: false,
    cta: 'Start Essential',
  },
  {
    name: 'Premium',
    price: 179,
    period: '/mo',
    desc: 'Our most popular full-service plan',
    features: ['Weekly mowing', 'Edging & blowing', 'Quarterly fertilization', 'Shrub trimming (2x/yr)', 'Weed control', 'Priority scheduling', 'After-visit photos'],
    popular: true,
    cta: 'Start Premium',
  },
  {
    name: 'Estate',
    price: 349,
    period: '/mo',
    desc: 'Comprehensive property care',
    features: ['Weekly mowing', 'Full landscape maintenance', 'Monthly fertilization', 'Irrigation monitoring', 'Seasonal clean-ups', 'Dedicated crew', 'Same-day support', 'Quarterly consultations'],
    popular: false,
    cta: 'Start Estate',
  },
];

const faqs = [
  { q: 'What areas do you serve?', a: 'We proudly serve Akron, Canton, Hudson, Stow, Cuyahoga Falls, Kent, Medina, and surrounding Northeastern Ohio communities within a 30-mile radius of downtown Akron.' },
  { q: 'What happens when it rains or snows?', a: 'Our weather-smart system monitors forecasts 48 hours in advance. If rain or snow is expected, we automatically reschedule your service to the next available slot and notify you via text or email — no action needed on your part.' },
  { q: 'Can I skip or pause my service?', a: 'Absolutely! You can pause, skip, or reschedule any visit through your online portal or by contacting us. We\'re flexible because we know life happens.' },
  { q: 'Are you licensed and insured?', a: 'Yes — we carry full commercial liability insurance and all required Ohio business licenses. Our team members are background-checked and professionally trained.' },
  { q: 'How do I get a custom quote?', a: 'Fill out the quote form on this page or call us at (330) 555-1234. We\'ll assess your property (often using satellite imagery) and send a detailed quote within 24 hours.' },
  { q: 'Do you offer snow removal in winter?', a: 'Yes! Our Snow & Ice Management program covers plowing, salting, and ice management from November through March. Many of our lawn care customers bundle winter services for year-round property care at a discounted rate.' },
  { q: 'What types of grass do you work with?', a: 'We specialize in cool-season grasses common to Northeastern Ohio: Kentucky Bluegrass, Perennial Ryegrass, Fine Fescue, and Tall Fescue blends. Our fertilization programs are customized to your specific turf type and soil conditions.' },
];

const recentProjects = [
  { title: 'Complete Landscape Overhaul', location: 'Hudson, OH', type: 'Landscaping', before: 'Overgrown beds, bare patches, no curb appeal', after: 'Fresh sod, native plantings, stone edging, mulched beds', duration: '3 days', sqft: '8,500' },
  { title: 'Commercial Property Maintenance', location: 'Akron, OH', type: 'Full Service', before: 'Inconsistent mowing, neglected shrubs, weed-filled beds', after: 'Pristine grounds, shaped hedges, weed-free beds, fresh mulch', duration: 'Ongoing weekly', sqft: '22,000' },
  { title: 'Seasonal Spring Cleanup', location: 'Stow, OH', type: 'Clean-up', before: 'Leaf debris, dead branches, compacted soil, dormant turf', after: 'Clean beds, aerated lawn, first fertilizer applied, vibrant green', duration: '1 day', sqft: '6,200' },
  { title: 'Fertilization Recovery Program', location: 'Medina, OH', type: 'Fertilization', before: 'Thin, patchy lawn with heavy crabgrass and clover invasion', after: 'Thick, uniform turf — 90% weed reduction in one season', duration: '6 months', sqft: '11,000' },
  { title: 'New Construction Sod Install', location: 'Canton, OH', type: 'Landscaping', before: 'Bare dirt and gravel from construction, no grading', after: 'Graded, topsoil added, fresh Kentucky Bluegrass sod, irrigation', duration: '2 days', sqft: '5,800' },
  { title: 'Hedge & Shrub Restoration', location: 'Cuyahoga Falls, OH', type: 'Trimming', before: 'Overgrown boxwoods, misshapen arborvitae, blocked walkway', after: 'Crisp geometric shapes, clear sightlines, healthy regrowth', duration: '1 day', sqft: '1,200' },
];

const serviceAreas = [
  { city: 'Akron', zip: '44301-44320', customers: 142, responseTime: 'Same day' },
  { city: 'Canton', zip: '44701-44730', customers: 87, responseTime: 'Same day' },
  { city: 'Hudson', zip: '44236', customers: 63, responseTime: 'Same day' },
  { city: 'Stow', zip: '44224', customers: 51, responseTime: 'Same day' },
  { city: 'Cuyahoga Falls', zip: '44221-44223', customers: 48, responseTime: 'Same day' },
  { city: 'Kent', zip: '44240', customers: 35, responseTime: 'Next day' },
  { city: 'Medina', zip: '44256', customers: 41, responseTime: 'Same day' },
  { city: 'Wadsworth', zip: '44281', customers: 28, responseTime: 'Next day' },
  { city: 'Barberton', zip: '44203', customers: 22, responseTime: 'Same day' },
  { city: 'Green', zip: '44232', customers: 19, responseTime: 'Same day' },
];

function useCountUp(target: number, duration: number = 2000, startOnView: boolean = true) {
  const [count, setCount] = useState(0);
  const [hasStarted, setHasStarted] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!startOnView) {
      setHasStarted(true);
    }
    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting && !hasStarted) setHasStarted(true); },
      { threshold: 0.3 }
    );
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, [hasStarted, startOnView]);

  useEffect(() => {
    if (!hasStarted) return;
    let startTime: number;
    const step = (timestamp: number) => {
      if (!startTime) startTime = timestamp;
      const progress = Math.min((timestamp - startTime) / duration, 1);
      setCount(Math.floor(progress * target));
      if (progress < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  }, [hasStarted, target, duration]);

  return { count, ref };
}

export default function Landing() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [openFaq, setOpenFaq] = useState<number | null>(null);
  const [formData, setFormData] = useState({ firstName: '', lastName: '', email: '', phone: '', service: '', message: '' });
  const [formSubmitted, setFormSubmitted] = useState(false);
  const [activeProject, setActiveProject] = useState(0);

  const customersCount = useCountUp(500, 2000);
  const yearsCount = useCountUp(8, 1500);
  const jobsCount = useCountUp(15000, 2500);

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setFormSubmitted(true);
    setTimeout(() => setFormSubmitted(false), 5000);
    setFormData({ firstName: '', lastName: '', email: '', phone: '', service: '', message: '' });
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-white/90 backdrop-blur-md border-b border-slate-200/60">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-green-500 to-green-600 flex items-center justify-center shadow-sm">
                <Leaf className="w-5 h-5 text-white" />
              </div>
              <div className="flex flex-col">
                <span className="font-bold text-base text-slate-900 tracking-tight leading-tight">
                  Orange Blossom
                </span>
                <span className="text-[10px] font-semibold text-green-600 uppercase tracking-widest leading-tight">
                  Special Lawncare
                </span>
              </div>
            </div>
            <div className="hidden md:flex items-center gap-8">
              <a href="#services" className="text-sm font-medium text-slate-600 hover:text-slate-900 transition-colors">Services</a>
              <a href="#how-it-works" className="text-sm font-medium text-slate-600 hover:text-slate-900 transition-colors">How It Works</a>
              <a href="#pricing" className="text-sm font-medium text-slate-600 hover:text-slate-900 transition-colors">Pricing</a>
              <a href="#reviews" className="text-sm font-medium text-slate-600 hover:text-slate-900 transition-colors">Reviews</a>
              <a href="#faq" className="text-sm font-medium text-slate-600 hover:text-slate-900 transition-colors">FAQ</a>
            </div>
            <div className="flex items-center gap-3">
              <a href="tel:+13305551234" className="hidden sm:flex items-center gap-1.5 text-sm font-medium text-slate-600 hover:text-primary transition-colors">
                <Phone className="w-4 h-4" />
                (330) 555-1234
              </a>
              <Link
                to="/dashboard"
                className="hidden sm:inline-flex px-4 py-2 bg-primary text-white text-sm font-semibold rounded-xl hover:bg-primary-dark transition-colors shadow-sm"
              >
                Customer Portal
              </Link>
              <button
                className="md:hidden p-2 text-slate-600 hover:text-slate-900"
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                aria-label="Toggle menu"
              >
                {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile menu */}
        {mobileMenuOpen && (
          <div className="md:hidden bg-white border-t border-slate-200 py-4 px-4 space-y-3">
            <a href="#services" onClick={() => setMobileMenuOpen(false)} className="block text-sm font-medium text-slate-700 py-2">Services</a>
            <a href="#how-it-works" onClick={() => setMobileMenuOpen(false)} className="block text-sm font-medium text-slate-700 py-2">How It Works</a>
            <a href="#pricing" onClick={() => setMobileMenuOpen(false)} className="block text-sm font-medium text-slate-700 py-2">Pricing</a>
            <a href="#reviews" onClick={() => setMobileMenuOpen(false)} className="block text-sm font-medium text-slate-700 py-2">Reviews</a>
            <a href="#faq" onClick={() => setMobileMenuOpen(false)} className="block text-sm font-medium text-slate-700 py-2">FAQ</a>
            <div className="pt-2 border-t border-slate-200 flex flex-col gap-3">
              <a href="tel:+13305551234" className="flex items-center gap-2 text-sm font-medium text-slate-700 py-2">
                <Phone className="w-4 h-4" /> (330) 555-1234
              </a>
              <Link
                to="/dashboard"
                className="inline-flex items-center justify-center px-4 py-2.5 bg-primary text-white text-sm font-semibold rounded-xl"
                onClick={() => setMobileMenuOpen(false)}
              >
                Customer Portal
              </Link>
            </div>
          </div>
        )}
      </nav>

      {/* Hero Section */}
      <section className="relative pt-28 pb-16 sm:pt-36 sm:pb-24 lg:pt-40 lg:pb-32 overflow-hidden">
        {/* Background decorations */}
        <div className="absolute inset-0 bg-gradient-to-br from-green-50 via-white to-blue-50" />
        <div className="absolute top-20 right-[-100px] w-[500px] h-[500px] bg-green-200/20 rounded-full blur-3xl" />
        <div className="absolute bottom-[-50px] left-[-50px] w-[400px] h-[400px] bg-blue-200/15 rounded-full blur-3xl" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-gradient-radial from-green-100/30 to-transparent rounded-full blur-2xl" />

        {/* Floating decorative elements */}
        <div className="absolute top-32 right-[15%] hidden lg:block animate-bounce" style={{ animationDuration: '3s' }}>
          <Flower2 className="w-8 h-8 text-green-300/60" />
        </div>
        <div className="absolute top-48 right-[8%] hidden lg:block animate-bounce" style={{ animationDuration: '4s', animationDelay: '1s' }}>
          <Sun className="w-6 h-6 text-amber-300/50" />
        </div>
        <div className="absolute bottom-32 right-[20%] hidden lg:block animate-bounce" style={{ animationDuration: '3.5s', animationDelay: '0.5s' }}>
          <Sparkles className="w-7 h-7 text-blue-300/40" />
        </div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
            <div>
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-green-100/80 rounded-full text-green-700 text-sm font-medium mb-6 border border-green-200/60">
                <Leaf className="w-4 h-4" />
                Serving Northeastern Ohio Since 2018
              </div>
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-slate-900 tracking-tight leading-[1.08]">
                Your Lawn,{' '}
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-green-500 via-green-500 to-primary">
                  Perfected.
                </span>
              </h1>
              <p className="mt-6 text-lg sm:text-xl text-slate-600 leading-relaxed max-w-xl">
                Professional lawn care powered by intelligent scheduling, weather-smart
                automation, and a crew that treats your property like their own.
              </p>
              <div className="mt-8 flex flex-col sm:flex-row gap-3">
                <a
                  href="#contact"
                  className="inline-flex items-center justify-center gap-2 px-7 py-3.5 bg-primary text-white text-base font-semibold rounded-xl hover:bg-primary-dark transition-all shadow-lg shadow-primary/25 hover:shadow-xl hover:shadow-primary/30 hover:-translate-y-0.5"
                >
                  Get a Free Quote
                  <ArrowRight className="w-5 h-5" />
                </a>
                <a
                  href="#services"
                  className="inline-flex items-center justify-center gap-2 px-7 py-3.5 bg-white text-slate-700 text-base font-semibold rounded-xl border border-slate-200 hover:bg-slate-50 hover:border-slate-300 transition-all"
                >
                  View Services
                </a>
              </div>
              <div className="mt-10 flex flex-wrap items-center gap-x-6 gap-y-2 text-sm text-slate-500">
                <span className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-green-500" />
                  Licensed & Insured
                </span>
                <span className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-green-500" />
                  Satisfaction Guaranteed
                </span>
                <span className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-green-500" />
                  Free Estimates
                </span>
              </div>
            </div>

            {/* Hero visual - property showcase card */}
            <div className="relative hidden lg:block">
              <div className="relative rounded-3xl overflow-hidden shadow-2xl shadow-slate-900/10 border border-slate-200/60 bg-gradient-to-br from-green-50 to-green-100">
                <div className="aspect-[4/3] flex flex-col items-center justify-center p-10">
                  <div className="relative">
                    <div className="w-28 h-28 rounded-full bg-gradient-to-br from-green-400 to-green-600 flex items-center justify-center shadow-lg shadow-green-500/30">
                      <Leaf className="w-14 h-14 text-white" />
                    </div>
                    <div className="absolute -top-2 -right-2 w-8 h-8 rounded-full bg-amber-400 flex items-center justify-center shadow-md">
                      <Sun className="w-5 h-5 text-white" />
                    </div>
                  </div>
                  <p className="mt-6 text-green-800 font-bold text-xl">Beautiful Lawns</p>
                  <p className="text-green-600 text-sm mt-1">Powered by Smart Technology</p>
                  <div className="mt-6 flex gap-3">
                    <span className="px-3 py-1.5 bg-white/80 rounded-full text-xs font-medium text-green-700 border border-green-200/60">Weather-Smart</span>
                    <span className="px-3 py-1.5 bg-white/80 rounded-full text-xs font-medium text-green-700 border border-green-200/60">GPS Tracked</span>
                    <span className="px-3 py-1.5 bg-white/80 rounded-full text-xs font-medium text-green-700 border border-green-200/60">Real-Time Updates</span>
                  </div>
                </div>
              </div>

              {/* Floating stat cards */}
              <div className="absolute -bottom-4 -left-4 bg-white rounded-xl shadow-lg shadow-slate-900/8 p-4 flex items-center gap-3 border border-slate-100">
                <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center">
                  <CheckCircle2 className="w-5 h-5 text-green-600" />
                </div>
                <div>
                  <p className="text-sm font-bold text-slate-900">98% Retention</p>
                  <p className="text-xs text-slate-500">Customers who stay year after year</p>
                </div>
              </div>
              <div className="absolute -top-3 -right-3 bg-white rounded-xl shadow-lg shadow-slate-900/8 p-3 flex items-center gap-2.5 border border-slate-100">
                <div className="flex gap-0.5">
                  {[1,2,3,4,5].map(i => <Star key={i} className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />)}
                </div>
                <span className="text-sm font-bold text-slate-900">4.9</span>
                <span className="text-xs text-slate-500">500+ reviews</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Bar */}
      <section className="bg-slate-900 py-10 sm:py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            <div className="flex flex-col items-center" ref={customersCount.ref}>
              <Users className="w-6 h-6 text-primary-light mb-2" />
              <p className="text-3xl sm:text-4xl font-extrabold text-white">{customersCount.count}+</p>
              <p className="mt-1 text-sm text-slate-400">Happy Customers</p>
            </div>
            <div className="flex flex-col items-center" ref={yearsCount.ref}>
              <Calendar className="w-6 h-6 text-primary-light mb-2" />
              <p className="text-3xl sm:text-4xl font-extrabold text-white">{yearsCount.count}+</p>
              <p className="mt-1 text-sm text-slate-400">Years Experience</p>
            </div>
            <div className="flex flex-col items-center" ref={jobsCount.ref}>
              <CheckCircle2 className="w-6 h-6 text-primary-light mb-2" />
              <p className="text-3xl sm:text-4xl font-extrabold text-white">{(jobsCount.count / 1000).toFixed(jobsCount.count >= 1000 ? 0 : 1)}K+</p>
              <p className="mt-1 text-sm text-slate-400">Jobs Completed</p>
            </div>
            <div className="flex flex-col items-center">
              <Star className="w-6 h-6 text-primary-light mb-2" />
              <p className="text-3xl sm:text-4xl font-extrabold text-white">4.9</p>
              <p className="mt-1 text-sm text-slate-400">Average Rating</p>
            </div>
          </div>
        </div>
      </section>

      {/* Services Section */}
      <section id="services" className="py-20 sm:py-28 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <span className="inline-block text-sm font-semibold text-primary uppercase tracking-wider mb-3">What We Offer</span>
            <h2 className="text-3xl sm:text-4xl font-bold text-slate-900">Complete Lawn & Landscape Services</h2>
            <p className="mt-4 text-lg text-slate-600">
              From weekly mowing to full landscape transformations — we handle it all so you can enjoy your yard.
            </p>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {services.map((service) => (
              <div
                key={service.name}
                className="group p-6 rounded-2xl border border-slate-200 hover:border-primary/30 hover:shadow-lg hover:shadow-primary/5 transition-all duration-300 bg-white"
              >
                <div className={`w-12 h-12 rounded-xl ${service.color} flex items-center justify-center mb-4 shadow-sm`}>
                  <service.icon className="w-6 h-6 text-white" />
                </div>
                <h3 className="text-lg font-semibold text-slate-900 group-hover:text-primary transition-colors">
                  {service.name}
                </h3>
                <p className="mt-2 text-sm text-slate-600 leading-relaxed">{service.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section id="how-it-works" className="py-20 sm:py-28 bg-slate-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <span className="inline-block text-sm font-semibold text-primary uppercase tracking-wider mb-3">Simple Process</span>
            <h2 className="text-3xl sm:text-4xl font-bold text-slate-900">How It Works</h2>
            <p className="mt-4 text-lg text-slate-600">
              Getting started is simple. Professional lawn care in four easy steps.
            </p>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, i) => (
              <div key={feature.title} className="relative text-center group">
                {/* Connector line */}
                {i < features.length - 1 && (
                  <div className="hidden lg:block absolute top-8 left-[60%] w-[80%] h-[2px] bg-gradient-to-r from-primary/20 to-primary/5" />
                )}
                <div className="relative mx-auto w-16 h-16 rounded-2xl bg-white border border-slate-200 flex items-center justify-center shadow-sm mb-5 group-hover:shadow-md group-hover:border-primary/30 transition-all">
                  <feature.icon className="w-7 h-7 text-primary" />
                  <span className="absolute -top-2.5 -right-2.5 w-7 h-7 rounded-full bg-primary text-white text-xs font-bold flex items-center justify-center shadow-sm">
                    {feature.step}
                  </span>
                </div>
                <h3 className="text-base font-semibold text-slate-900">{feature.title}</h3>
                <p className="mt-2 text-sm text-slate-600 leading-relaxed max-w-[240px] mx-auto">{feature.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Why Choose Us */}
      <section className="py-20 sm:py-28 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <div>
              <span className="inline-block text-sm font-semibold text-primary uppercase tracking-wider mb-3">Why Us</span>
              <h2 className="text-3xl sm:text-4xl font-bold text-slate-900">
                Why Homeowners Choose Orange Blossom Special
              </h2>
              <p className="mt-4 text-lg text-slate-600">
                We combine old-fashioned work ethic with modern technology to deliver a lawn care experience that's second to none.
              </p>
              <div className="mt-8 space-y-5">
                {[
                  { icon: Users, title: 'Dedicated Crews', desc: 'The same trained team services your property every visit — they know your lawn inside and out.' },
                  { icon: BarChart3, title: 'Data-Driven Care', desc: 'We track soil health, growth patterns, and weather data to optimize every treatment for your turf type.' },
                  { icon: Clock, title: 'Reliable & Punctual', desc: '97% on-time rate. If weather forces a change, we notify you immediately and reschedule within 48 hours.' },
                  { icon: Shield, title: 'Fully Licensed & Insured', desc: 'Complete commercial liability coverage and all required Ohio licenses. Background-checked crews you can trust.' },
                ].map((item) => (
                  <div key={item.title} className="flex gap-4 group">
                    <div className="flex-shrink-0 w-11 h-11 rounded-xl bg-accent-light flex items-center justify-center group-hover:bg-primary/10 transition-colors">
                      <item.icon className="w-5 h-5 text-primary" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-slate-900">{item.title}</h3>
                      <p className="mt-1 text-sm text-slate-600 leading-relaxed">{item.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            <div className="relative">
              <div className="aspect-[4/3] rounded-3xl bg-gradient-to-br from-green-100 via-green-50 to-blue-50 flex items-center justify-center overflow-hidden border border-green-200/40">
                <div className="text-center p-8">
                  <div className="relative inline-block">
                    <Leaf className="w-20 h-20 text-green-500 mx-auto mb-4" />
                  </div>
                  <p className="text-green-700 font-bold text-xl">Beautiful Lawns, Happy Customers</p>
                  <p className="text-green-600 text-sm mt-2">Serving Northeastern Ohio communities with pride</p>
                  <div className="mt-6 grid grid-cols-3 gap-3 max-w-xs mx-auto">
                    <div className="bg-white/70 rounded-xl p-3 border border-green-200/40">
                      <p className="text-lg font-bold text-slate-900">97%</p>
                      <p className="text-xs text-slate-500">On-time</p>
                    </div>
                    <div className="bg-white/70 rounded-xl p-3 border border-green-200/40">
                      <p className="text-lg font-bold text-slate-900">4.9</p>
                      <p className="text-xs text-slate-500">Rating</p>
                    </div>
                    <div className="bg-white/70 rounded-xl p-3 border border-green-200/40">
                      <p className="text-lg font-bold text-slate-900">98%</p>
                      <p className="text-xs text-slate-500">Retention</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section id="reviews" className="py-20 sm:py-28 bg-slate-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <span className="inline-block text-sm font-semibold text-primary uppercase tracking-wider mb-3">Testimonials</span>
            <h2 className="text-3xl sm:text-4xl font-bold text-slate-900">What Our Customers Say</h2>
            <p className="mt-4 text-lg text-slate-600">
              Don't just take our word for it — hear from homeowners who trust us with their properties.
            </p>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {testimonials.map((t) => (
              <div key={t.name} className="p-5 bg-white rounded-2xl border border-slate-200 hover:shadow-lg hover:border-slate-300 transition-all duration-300">
                <div className="flex gap-0.5 mb-3">
                  {Array.from({ length: t.rating }).map((_, i) => (
                    <Star key={i} className="w-4 h-4 text-amber-400 fill-amber-400" />
                  ))}
                </div>
                <p className="text-slate-700 text-sm leading-relaxed">"{t.text}"</p>
                <div className="mt-4 pt-4 border-t border-slate-100 flex items-center gap-3">
                  <div className="w-9 h-9 rounded-full bg-primary/10 flex items-center justify-center">
                    <span className="text-xs font-bold text-primary">{t.avatar}</span>
                  </div>
                  <div>
                    <p className="font-semibold text-sm text-slate-900">{t.name}</p>
                    <p className="text-xs text-slate-500">{t.location}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Recent Projects */}
      <section id="projects" className="py-20 sm:py-28 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <span className="inline-block text-sm font-semibold text-primary uppercase tracking-wider mb-3">Our Work</span>
            <h2 className="text-3xl sm:text-4xl font-bold text-slate-900">Recent Projects</h2>
            <p className="mt-4 text-lg text-slate-600">
              Real transformations for real Northeastern Ohio properties. See the difference professional care makes.
            </p>
          </div>

          <div className="grid lg:grid-cols-5 gap-8">
            {/* Project selector */}
            <div className="lg:col-span-2 space-y-2">
              {recentProjects.map((project, i) => (
                <button
                  key={i}
                  onClick={() => setActiveProject(i)}
                  className={`w-full text-left p-4 rounded-xl border transition-all duration-200 ${
                    activeProject === i
                      ? 'border-primary bg-primary/5 shadow-sm'
                      : 'border-slate-200 hover:border-slate-300 bg-white'
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <h4 className={`font-semibold text-sm ${activeProject === i ? 'text-primary' : 'text-slate-900'}`}>
                        {project.title}
                      </h4>
                      <p className="text-xs text-slate-500 mt-0.5 flex items-center gap-1">
                        <MapPin className="w-3 h-3" /> {project.location}
                      </p>
                    </div>
                    <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                      activeProject === i ? 'bg-primary/10 text-primary' : 'bg-slate-100 text-slate-600'
                    }`}>
                      {project.type}
                    </span>
                  </div>
                </button>
              ))}
            </div>

            {/* Project detail */}
            <div className="lg:col-span-3">
              <div className="rounded-2xl border border-slate-200 overflow-hidden bg-white shadow-sm">
                <div className="bg-gradient-to-br from-green-50 to-blue-50 p-8">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-10 h-10 rounded-xl bg-green-500 flex items-center justify-center">
                      <Camera className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <h3 className="font-bold text-slate-900">{recentProjects[activeProject].title}</h3>
                      <p className="text-sm text-slate-500">{recentProjects[activeProject].location}</p>
                    </div>
                  </div>
                  <div className="grid sm:grid-cols-2 gap-4 mt-6">
                    <div className="bg-white/80 rounded-xl p-4 border border-red-200/40">
                      <p className="text-xs font-semibold text-red-600 uppercase tracking-wider mb-2">Before</p>
                      <p className="text-sm text-slate-700 leading-relaxed">{recentProjects[activeProject].before}</p>
                    </div>
                    <div className="bg-white/80 rounded-xl p-4 border border-green-200/40">
                      <p className="text-xs font-semibold text-green-600 uppercase tracking-wider mb-2">After</p>
                      <p className="text-sm text-slate-700 leading-relaxed">{recentProjects[activeProject].after}</p>
                    </div>
                  </div>
                </div>
                <div className="p-5 flex items-center justify-between border-t border-slate-100">
                  <div className="flex gap-6">
                    <div>
                      <p className="text-xs text-slate-500">Duration</p>
                      <p className="text-sm font-semibold text-slate-900">{recentProjects[activeProject].duration}</p>
                    </div>
                    <div>
                      <p className="text-xs text-slate-500">Area</p>
                      <p className="text-sm font-semibold text-slate-900">{recentProjects[activeProject].sqft} sq ft</p>
                    </div>
                    <div>
                      <p className="text-xs text-slate-500">Type</p>
                      <p className="text-sm font-semibold text-slate-900">{recentProjects[activeProject].type}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-1">
                    <ThumbsUp className="w-4 h-4 text-green-500" />
                    <span className="text-xs font-medium text-green-600">Customer Approved</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Service Area */}
      <section className="py-20 sm:py-28 bg-slate-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <span className="inline-block text-sm font-semibold text-primary uppercase tracking-wider mb-3">Coverage</span>
            <h2 className="text-3xl sm:text-4xl font-bold text-slate-900">Serving Northeastern Ohio</h2>
            <p className="mt-4 text-lg text-slate-600">
              From Akron to Canton and everywhere in between — we cover a 30-mile radius with same-day or next-day service.
            </p>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-5 gap-3">
            {serviceAreas.map((area) => (
              <div key={area.city} className="p-4 bg-white rounded-xl border border-slate-200 hover:border-primary/30 hover:shadow-md transition-all group">
                <div className="flex items-center gap-2 mb-2">
                  <MapPin className="w-4 h-4 text-primary group-hover:scale-110 transition-transform" />
                  <h4 className="font-semibold text-slate-900 text-sm">{area.city}</h4>
                </div>
                <p className="text-xs text-slate-500 mb-2">ZIP: {area.zip}</p>
                <div className="flex items-center justify-between">
                  <span className="text-xs text-slate-600">{area.customers} customers</span>
                  <span className={`text-xs font-medium px-1.5 py-0.5 rounded ${
                    area.responseTime === 'Same day' ? 'bg-green-50 text-green-600' : 'bg-amber-50 text-amber-600'
                  }`}>
                    {area.responseTime}
                  </span>
                </div>
              </div>
            ))}
          </div>
          <div className="mt-8 text-center">
            <p className="text-sm text-slate-500">
              <Truck className="w-4 h-4 inline mr-1" />
              Total service area: <strong className="text-slate-700">536+ active customers</strong> across <strong className="text-slate-700">10 communities</strong>
            </p>
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section id="pricing" className="py-20 sm:py-28 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <span className="inline-block text-sm font-semibold text-primary uppercase tracking-wider mb-3">Plans</span>
            <h2 className="text-3xl sm:text-4xl font-bold text-slate-900">Simple, Honest Pricing</h2>
            <p className="mt-4 text-lg text-slate-600">
              Choose a plan that fits your property. All plans include our satisfaction guarantee.
            </p>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 max-w-5xl mx-auto">
            {plans.map((plan) => (
              <div
                key={plan.name}
                className={`relative p-6 rounded-2xl border-2 transition-all duration-300 hover:shadow-lg ${
                  plan.popular
                    ? 'border-primary shadow-lg shadow-primary/10 bg-white scale-[1.02]'
                    : 'border-slate-200 hover:border-slate-300'
                }`}
              >
                {plan.popular && (
                  <span className="absolute -top-3.5 left-1/2 -translate-x-1/2 px-4 py-1 bg-gradient-to-r from-primary to-primary-dark text-white text-xs font-bold rounded-full shadow-sm">
                    Most Popular
                  </span>
                )}
                <h3 className="text-lg font-bold text-slate-900">{plan.name}</h3>
                <p className="mt-1 text-sm text-slate-500">{plan.desc}</p>
                <div className="mt-4 flex items-baseline gap-1">
                  <span className="text-4xl font-extrabold text-slate-900">${plan.price}</span>
                  <span className="text-slate-500 text-sm">{plan.period}</span>
                </div>
                <ul className="mt-6 space-y-3">
                  {plan.features.map((f) => (
                    <li key={f} className="flex items-start gap-2 text-sm text-slate-700">
                      <CheckCircle2 className="w-4 h-4 text-green-500 flex-shrink-0 mt-0.5" />
                      {f}
                    </li>
                  ))}
                </ul>
                <a
                  href="#contact"
                  className={`mt-6 block text-center py-3 rounded-xl text-sm font-semibold transition-all ${
                    plan.popular
                      ? 'bg-primary text-white hover:bg-primary-dark shadow-sm hover:shadow-md'
                      : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                  }`}
                >
                  {plan.cta}
                </a>
              </div>
            ))}
          </div>
          <p className="mt-8 text-center text-sm text-slate-500">
            All prices based on standard residential lots (up to 1/4 acre). Custom quotes available for larger properties.
          </p>
        </div>
      </section>

      {/* FAQ Section */}
      <section id="faq" className="py-20 sm:py-28 bg-slate-50">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <span className="inline-block text-sm font-semibold text-primary uppercase tracking-wider mb-3">FAQ</span>
            <h2 className="text-3xl sm:text-4xl font-bold text-slate-900">Frequently Asked Questions</h2>
            <p className="mt-4 text-lg text-slate-600">
              Everything you need to know about our lawn care services.
            </p>
          </div>
          <div className="space-y-3">
            {faqs.map((faq, i) => (
              <div
                key={i}
                className="bg-white rounded-xl border border-slate-200 overflow-hidden transition-all"
              >
                <button
                  onClick={() => setOpenFaq(openFaq === i ? null : i)}
                  className="w-full flex items-center justify-between px-6 py-4 text-left"
                >
                  <span className="font-semibold text-slate-900 text-sm sm:text-base pr-4">{faq.q}</span>
                  <ChevronDown
                    className={`w-5 h-5 text-slate-400 flex-shrink-0 transition-transform duration-200 ${
                      openFaq === i ? 'rotate-180' : ''
                    }`}
                  />
                </button>
                {openFaq === i && (
                  <div className="px-6 pb-4">
                    <p className="text-sm text-slate-600 leading-relaxed">{faq.a}</p>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA / Contact */}
      <section id="contact" className="py-20 sm:py-28 bg-gradient-to-br from-slate-900 via-slate-900 to-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12 lg:gap-16">
            <div>
              <span className="inline-block text-sm font-semibold text-primary-light uppercase tracking-wider mb-3">Get Started</span>
              <h2 className="text-3xl sm:text-4xl font-bold text-white">
                Ready for the Best Lawn on the Block?
              </h2>
              <p className="mt-4 text-lg text-slate-300">
                Get a free, no-obligation quote in minutes. We'll assess your property and recommend the perfect plan for your needs and budget.
              </p>
              <div className="mt-8 space-y-4">
                <a href="tel:+13305551234" className="flex items-center gap-3 text-slate-300 hover:text-white transition-colors group">
                  <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center group-hover:bg-white/15 transition-colors">
                    <Phone className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="text-xs text-slate-400">Call us</p>
                    <p className="font-medium">(330) 555-1234</p>
                  </div>
                </a>
                <a href="mailto:hello@orangeblossomspecial.com" className="flex items-center gap-3 text-slate-300 hover:text-white transition-colors group">
                  <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center group-hover:bg-white/15 transition-colors">
                    <Mail className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="text-xs text-slate-400">Email us</p>
                    <p className="font-medium">hello@orangeblossomspecial.com</p>
                  </div>
                </a>
                <div className="flex items-center gap-3 text-slate-300">
                  <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center">
                    <Clock className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="text-xs text-slate-400">Business hours</p>
                    <p className="font-medium">Mon-Sat: 7:00 AM - 6:00 PM</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 text-slate-300">
                  <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center">
                    <MapPin className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="text-xs text-slate-400">Service area</p>
                    <p className="font-medium">Akron, Canton, Hudson & surrounding NE Ohio</p>
                  </div>
                </div>
              </div>
            </div>
            <div className="bg-white/[0.07] backdrop-blur-sm rounded-2xl p-6 sm:p-8 border border-white/10">
              <h3 className="text-xl font-semibold text-white mb-6">Request a Free Quote</h3>
              {formSubmitted ? (
                <div className="text-center py-12">
                  <div className="w-16 h-16 rounded-full bg-green-500/20 flex items-center justify-center mx-auto mb-4">
                    <CheckCircle2 className="w-8 h-8 text-green-400" />
                  </div>
                  <h4 className="text-lg font-bold text-white mb-2">Quote Request Received!</h4>
                  <p className="text-slate-300 text-sm">We'll review your property and send a detailed quote within 24 hours. Check your email for confirmation.</p>
                </div>
              ) : (
                <form className="space-y-4" onSubmit={handleFormSubmit}>
                  <div className="grid sm:grid-cols-2 gap-4">
                    <input
                      type="text"
                      placeholder="First Name"
                      value={formData.firstName}
                      onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                      required
                      className="w-full px-4 py-3 bg-white/10 border border-white/15 rounded-xl text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
                    />
                    <input
                      type="text"
                      placeholder="Last Name"
                      value={formData.lastName}
                      onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                      required
                      className="w-full px-4 py-3 bg-white/10 border border-white/15 rounded-xl text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
                    />
                  </div>
                  <input
                    type="email"
                    placeholder="Email Address"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    required
                    className="w-full px-4 py-3 bg-white/10 border border-white/15 rounded-xl text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
                  />
                  <input
                    type="tel"
                    placeholder="Phone Number"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    required
                    className="w-full px-4 py-3 bg-white/10 border border-white/15 rounded-xl text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
                  />
                  <select
                    className={`w-full px-4 py-3 bg-white/10 border border-white/15 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all ${formData.service ? 'text-white' : 'text-slate-400'}`}
                    value={formData.service}
                    onChange={(e) => setFormData({ ...formData, service: e.target.value })}
                    required
                  >
                    <option value="" disabled>Select a service...</option>
                    <option value="mowing">Weekly Mowing</option>
                    <option value="landscaping">Landscaping Design</option>
                    <option value="cleanup">Seasonal Clean-up</option>
                    <option value="fertilization">Fertilization & Weed Control</option>
                    <option value="trimming">Shrub & Hedge Trimming</option>
                    <option value="snow">Snow & Ice Management</option>
                    <option value="full">Full-Service Plan</option>
                  </select>
                  <textarea
                    rows={3}
                    placeholder="Tell us about your property and what services you're interested in..."
                    value={formData.message}
                    onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                    className="w-full px-4 py-3 bg-white/10 border border-white/15 rounded-xl text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent resize-none transition-all"
                  />
                  <button
                    type="submit"
                    className="w-full py-3.5 bg-primary text-white font-semibold rounded-xl hover:bg-primary-dark transition-all shadow-lg shadow-primary/25 hover:shadow-xl hover:shadow-primary/30 hover:-translate-y-0.5 flex items-center justify-center gap-2"
                  >
                    Send My Free Quote Request
                    <ArrowRight className="w-4 h-4" />
                  </button>
                  <p className="text-xs text-slate-500 text-center">No spam, no obligation. We typically respond within 2 hours.</p>
                </form>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-slate-900 border-t border-slate-800 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center gap-2.5 mb-4">
                <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-green-500 to-green-600 flex items-center justify-center">
                  <Leaf className="w-4 h-4 text-white" />
                </div>
                <span className="font-bold text-white">OBS Lawncare</span>
              </div>
              <p className="text-sm text-slate-400 leading-relaxed">
                Professional lawn care and landscaping services for Northeastern Ohio homeowners and businesses.
              </p>
            </div>
            <div>
              <h4 className="font-semibold text-white mb-3">Services</h4>
              <ul className="space-y-2 text-sm text-slate-400">
                <li><a href="#services" className="hover:text-white transition-colors">Weekly Mowing</a></li>
                <li><a href="#services" className="hover:text-white transition-colors">Landscaping</a></li>
                <li><a href="#services" className="hover:text-white transition-colors">Fertilization</a></li>
                <li><a href="#services" className="hover:text-white transition-colors">Seasonal Clean-ups</a></li>
                <li><a href="#services" className="hover:text-white transition-colors">Irrigation</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold text-white mb-3">Company</h4>
              <ul className="space-y-2 text-sm text-slate-400">
                <li><a href="#how-it-works" className="hover:text-white transition-colors">How It Works</a></li>
                <li><a href="#pricing" className="hover:text-white transition-colors">Pricing</a></li>
                <li><a href="#reviews" className="hover:text-white transition-colors">Reviews</a></li>
                <li><a href="#faq" className="hover:text-white transition-colors">FAQ</a></li>
                <li><a href="#contact" className="hover:text-white transition-colors">Contact</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold text-white mb-3">Contact</h4>
              <ul className="space-y-2 text-sm text-slate-400">
                <li><a href="tel:+13305551234" className="hover:text-white transition-colors">(330) 555-1234</a></li>
                <li><a href="mailto:hello@orangeblossomspecial.com" className="hover:text-white transition-colors">hello@orangeblossomspecial.com</a></li>
                <li>Mon-Sat: 7 AM - 6 PM</li>
                <li className="pt-2">
                  <Link to="/dashboard" className="text-primary-light hover:text-primary transition-colors font-medium">
                    Customer Portal &rarr;
                  </Link>
                </li>
              </ul>
            </div>
          </div>
          <div className="mt-10 pt-8 border-t border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-4">
            <p className="text-sm text-slate-500">
              &copy; {new Date().getFullYear()} Orange Blossom Special Lawncare. All rights reserved.
            </p>
            <div className="flex gap-6 text-sm text-slate-500">
              <a href="#" className="hover:text-white transition-colors">Privacy Policy</a>
              <a href="#" className="hover:text-white transition-colors">Terms of Service</a>
              <a href="#" className="hover:text-white transition-colors">Sitemap</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
