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
} from 'lucide-react';

const services = [
  { name: 'Weekly Mowing', desc: 'Precision cut with striping patterns for a professional finish every time.', icon: Leaf, color: 'bg-green-500' },
  { name: 'Landscaping Design', desc: 'Custom landscape architecture that transforms your outdoor living space.', icon: MapPin, color: 'bg-amber-500' },
  { name: 'Seasonal Clean-ups', desc: 'Spring & fall clean-ups including leaf removal, bed prep, and debris hauling.', icon: Calendar, color: 'bg-orange-500' },
  { name: 'Fertilization & Weed Control', desc: 'Science-based lawn nutrition programs tailored to Central Florida turf.', icon: Zap, color: 'bg-violet-500' },
  { name: 'Shrub & Hedge Trimming', desc: 'Expert shaping and maintenance to keep your property looking sharp year-round.', icon: CheckCircle2, color: 'bg-teal-500' },
  { name: 'Snow & Storm Cleanup', desc: 'Emergency storm debris removal and seasonal snow services when you need them most.', icon: CloudSun, color: 'bg-blue-500' },
];

const features = [
  { title: 'Online Scheduling', desc: 'Book and manage your service appointments 24/7 from any device.', icon: Calendar },
  { title: 'Real-Time Updates', desc: 'Get notified when your crew is en route, on-site, and when the job is done.', icon: Smartphone },
  { title: 'Weather-Smart', desc: 'We monitor weather automatically and reschedule proactively — no phone tag.', icon: CloudSun },
  { title: 'Transparent Pricing', desc: 'Flat-rate quotes with no hidden fees. Know exactly what you\'re paying before we start.', icon: Shield },
];

const testimonials = [
  { name: 'Sarah M.', location: 'Winter Park, FL', rating: 5, text: 'Orange Blossom has been taking care of our lawn for two years. They\'re always on time, communicative, and our yard has never looked better.' },
  { name: 'David & Lisa R.', location: 'Orlando, FL', rating: 5, text: 'The online scheduling is a game-changer. I can book, reschedule, and see exactly when my crew is coming. No more playing phone tag!' },
  { name: 'Tom K.', location: 'Kissimmee, FL', rating: 5, text: 'Professional, reliable, and they actually care about the health of the lawn — not just cutting it. Highly recommend their fertilization program.' },
];

const plans = [
  {
    name: 'Essential',
    price: 99,
    period: '/mo',
    desc: 'Perfect for basic lawn maintenance',
    features: ['Bi-weekly mowing', 'Edging & blowing', 'Seasonal adjustments', 'Online scheduling'],
    popular: false,
  },
  {
    name: 'Premium',
    price: 179,
    period: '/mo',
    desc: 'Our most popular full-service plan',
    features: ['Weekly mowing', 'Edging & blowing', 'Quarterly fertilization', 'Shrub trimming (2x/yr)', 'Weed control', 'Priority scheduling'],
    popular: true,
  },
  {
    name: 'Estate',
    price: 349,
    period: '/mo',
    desc: 'Comprehensive property care',
    features: ['Weekly mowing', 'Full landscape maintenance', 'Monthly fertilization', 'Irrigation monitoring', 'Seasonal clean-ups', 'Dedicated crew', 'Same-day support'],
    popular: false,
  },
];

export default function Landing() {
  return (
    <div className="min-h-screen bg-white">
      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-white/90 backdrop-blur-md border-b border-slate-200/60">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-primary flex items-center justify-center">
                <Leaf className="w-5 h-5 text-white" />
              </div>
              <span className="font-bold text-lg text-slate-900 tracking-tight">
                Orange Blossom Special
              </span>
            </div>
            <div className="hidden md:flex items-center gap-8">
              <a href="#services" className="text-sm font-medium text-slate-600 hover:text-slate-900 transition-colors">Services</a>
              <a href="#how-it-works" className="text-sm font-medium text-slate-600 hover:text-slate-900 transition-colors">How It Works</a>
              <a href="#pricing" className="text-sm font-medium text-slate-600 hover:text-slate-900 transition-colors">Pricing</a>
              <a href="#testimonials" className="text-sm font-medium text-slate-600 hover:text-slate-900 transition-colors">Reviews</a>
              <a href="#contact" className="text-sm font-medium text-slate-600 hover:text-slate-900 transition-colors">Contact</a>
            </div>
            <div className="flex items-center gap-3">
              <a href="tel:+14075551234" className="hidden sm:flex items-center gap-1.5 text-sm font-medium text-slate-600 hover:text-primary transition-colors">
                <Phone className="w-4 h-4" />
                (407) 555-1234
              </a>
              <Link
                to="/dashboard"
                className="px-4 py-2 bg-primary text-white text-sm font-semibold rounded-xl hover:bg-primary-dark transition-colors"
              >
                Customer Portal
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative pt-32 pb-20 sm:pt-40 sm:pb-28 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-green-50 via-white to-blue-50" />
        <div className="absolute top-20 right-0 w-96 h-96 bg-green-200/30 rounded-full blur-3xl" />
        <div className="absolute bottom-0 left-0 w-80 h-80 bg-primary/5 rounded-full blur-3xl" />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-green-100 rounded-full text-green-700 text-sm font-medium mb-6">
              <Leaf className="w-4 h-4" />
              Serving Central Florida Since 2018
            </div>
            <h1 className="text-5xl sm:text-6xl lg:text-7xl font-extrabold text-slate-900 tracking-tight leading-[1.1]">
              Your Lawn,{' '}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-green-500 to-primary">
                Perfected.
              </span>
            </h1>
            <p className="mt-6 text-lg sm:text-xl text-slate-600 leading-relaxed max-w-2xl">
              Professional lawn care and landscaping powered by intelligent scheduling,
              weather-smart automation, and a crew that treats your property like their own.
            </p>
            <div className="mt-8 flex flex-col sm:flex-row gap-4">
              <a
                href="#pricing"
                className="inline-flex items-center justify-center gap-2 px-6 py-3.5 bg-primary text-white text-base font-semibold rounded-xl hover:bg-primary-dark transition-colors shadow-lg shadow-primary/25"
              >
                Get a Free Quote
                <ArrowRight className="w-5 h-5" />
              </a>
              <a
                href="#services"
                className="inline-flex items-center justify-center gap-2 px-6 py-3.5 bg-white text-slate-700 text-base font-semibold rounded-xl border border-slate-200 hover:bg-slate-50 transition-colors"
              >
                View Services
              </a>
            </div>
            <div className="mt-10 flex items-center gap-6 text-sm text-slate-500">
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
        </div>
      </section>

      {/* Stats Bar */}
      <section className="bg-slate-900 py-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            {[
              { value: '500+', label: 'Happy Customers' },
              { value: '8+', label: 'Years Experience' },
              { value: '15K+', label: 'Jobs Completed' },
              { value: '4.9★', label: 'Average Rating' },
            ].map((stat) => (
              <div key={stat.label}>
                <p className="text-3xl font-bold text-white">{stat.value}</p>
                <p className="mt-1 text-sm text-slate-400">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Services Section */}
      <section id="services" className="py-20 sm:py-28 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold text-slate-900">Our Services</h2>
            <p className="mt-4 text-lg text-slate-600">
              From weekly mowing to full landscape transformations — we handle it all so you can enjoy your yard.
            </p>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {services.map((service) => (
              <div
                key={service.name}
                className="group p-6 rounded-2xl border border-slate-200 hover:border-primary/30 hover:shadow-lg hover:shadow-primary/5 transition-all duration-300"
              >
                <div className={`w-12 h-12 rounded-xl ${service.color} flex items-center justify-center mb-4`}>
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
            <h2 className="text-3xl sm:text-4xl font-bold text-slate-900">How It Works</h2>
            <p className="mt-4 text-lg text-slate-600">
              Getting started is simple. We make professional lawn care effortless.
            </p>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, i) => (
              <div key={feature.title} className="text-center">
                <div className="relative mx-auto w-16 h-16 rounded-2xl bg-white border border-slate-200 flex items-center justify-center shadow-sm mb-5">
                  <feature.icon className="w-7 h-7 text-primary" />
                  <span className="absolute -top-2 -right-2 w-6 h-6 rounded-full bg-primary text-white text-xs font-bold flex items-center justify-center">
                    {i + 1}
                  </span>
                </div>
                <h3 className="text-base font-semibold text-slate-900">{feature.title}</h3>
                <p className="mt-2 text-sm text-slate-600 leading-relaxed">{feature.desc}</p>
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
              <h2 className="text-3xl sm:text-4xl font-bold text-slate-900">
                Why Homeowners Choose Orange Blossom Special
              </h2>
              <p className="mt-4 text-lg text-slate-600">
                We combine old-fashioned work ethic with modern technology to deliver a lawn care experience that's second to none.
              </p>
              <div className="mt-8 space-y-5">
                {[
                  { icon: Users, title: 'Dedicated Crews', desc: 'The same trained team services your property every visit — they know your lawn.' },
                  { icon: BarChart3, title: 'Data-Driven Care', desc: 'We track soil health, growth patterns, and weather data to optimize every treatment.' },
                  { icon: Clock, title: 'Reliable & Punctual', desc: '97% on-time rate. If weather forces a change, we notify you immediately and reschedule.' },
                ].map((item) => (
                  <div key={item.title} className="flex gap-4">
                    <div className="flex-shrink-0 w-10 h-10 rounded-xl bg-accent-light flex items-center justify-center">
                      <item.icon className="w-5 h-5 text-primary" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-slate-900">{item.title}</h3>
                      <p className="mt-1 text-sm text-slate-600">{item.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            <div className="relative">
              <div className="aspect-[4/3] rounded-2xl bg-gradient-to-br from-green-100 to-green-200 flex items-center justify-center overflow-hidden">
                <div className="text-center p-8">
                  <Leaf className="w-20 h-20 text-green-500 mx-auto mb-4" />
                  <p className="text-green-700 font-semibold text-lg">Beautiful Lawns, Happy Customers</p>
                  <p className="text-green-600 text-sm mt-2">Serving Central Florida communities with pride</p>
                </div>
              </div>
              <div className="absolute -bottom-6 -left-6 bg-white rounded-xl shadow-lg p-4 flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center">
                  <CheckCircle2 className="w-5 h-5 text-green-600" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-slate-900">98% Retention Rate</p>
                  <p className="text-xs text-slate-500">Customers who stay year after year</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section id="testimonials" className="py-20 sm:py-28 bg-slate-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold text-slate-900">What Our Customers Say</h2>
            <p className="mt-4 text-lg text-slate-600">
              Don't just take our word for it — hear from homeowners who trust us with their properties.
            </p>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {testimonials.map((t) => (
              <div key={t.name} className="p-6 bg-white rounded-2xl border border-slate-200">
                <div className="flex gap-0.5 mb-4">
                  {Array.from({ length: t.rating }).map((_, i) => (
                    <Star key={i} className="w-4 h-4 text-amber-400 fill-amber-400" />
                  ))}
                </div>
                <p className="text-slate-700 text-sm leading-relaxed">"{t.text}"</p>
                <div className="mt-4 pt-4 border-t border-slate-100">
                  <p className="font-semibold text-sm text-slate-900">{t.name}</p>
                  <p className="text-xs text-slate-500">{t.location}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section id="pricing" className="py-20 sm:py-28 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold text-slate-900">Simple, Honest Pricing</h2>
            <p className="mt-4 text-lg text-slate-600">
              Choose a plan that fits your property. All plans include our satisfaction guarantee.
            </p>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 max-w-5xl mx-auto">
            {plans.map((plan) => (
              <div
                key={plan.name}
                className={`relative p-6 rounded-2xl border-2 ${
                  plan.popular
                    ? 'border-primary shadow-lg shadow-primary/10'
                    : 'border-slate-200'
                }`}
              >
                {plan.popular && (
                  <span className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-1 bg-primary text-white text-xs font-bold rounded-full">
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
                  className={`mt-6 block text-center py-3 rounded-xl text-sm font-semibold transition-colors ${
                    plan.popular
                      ? 'bg-primary text-white hover:bg-primary-dark'
                      : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                  }`}
                >
                  Get Started
                </a>
              </div>
            ))}
          </div>
          <p className="mt-8 text-center text-sm text-slate-500">
            All prices based on standard residential lots (up to 1/4 acre). Custom quotes available for larger properties.
          </p>
        </div>
      </section>

      {/* CTA / Contact */}
      <section id="contact" className="py-20 sm:py-28 bg-gradient-to-br from-slate-900 to-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-16">
            <div>
              <h2 className="text-3xl sm:text-4xl font-bold text-white">
                Ready for the Best Lawn on the Block?
              </h2>
              <p className="mt-4 text-lg text-slate-300">
                Get a free, no-obligation quote in minutes. We'll assess your property and recommend the perfect plan.
              </p>
              <div className="mt-8 space-y-4">
                <a href="tel:+14075551234" className="flex items-center gap-3 text-slate-300 hover:text-white transition-colors">
                  <Phone className="w-5 h-5" />
                  <span>(407) 555-1234</span>
                </a>
                <a href="mailto:hello@orangeblossomspecial.com" className="flex items-center gap-3 text-slate-300 hover:text-white transition-colors">
                  <Mail className="w-5 h-5" />
                  <span>hello@orangeblossomspecial.com</span>
                </a>
                <div className="flex items-center gap-3 text-slate-300">
                  <Clock className="w-5 h-5" />
                  <span>Mon–Sat: 7:00 AM – 6:00 PM</span>
                </div>
                <div className="flex items-center gap-3 text-slate-300">
                  <MapPin className="w-5 h-5" />
                  <span>Serving Orlando, Winter Park, Kissimmee & surrounding areas</span>
                </div>
              </div>
            </div>
            <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 sm:p-8">
              <h3 className="text-xl font-semibold text-white mb-6">Request a Free Quote</h3>
              <form className="space-y-4" onSubmit={(e) => e.preventDefault()}>
                <div className="grid sm:grid-cols-2 gap-4">
                  <input
                    type="text"
                    placeholder="First Name"
                    className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                  />
                  <input
                    type="text"
                    placeholder="Last Name"
                    className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                  />
                </div>
                <input
                  type="email"
                  placeholder="Email Address"
                  className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                />
                <input
                  type="tel"
                  placeholder="Phone Number"
                  className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                />
                <textarea
                  rows={3}
                  placeholder="Tell us about your property and what services you're interested in..."
                  className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent resize-none"
                />
                <button
                  type="submit"
                  className="w-full py-3.5 bg-primary text-white font-semibold rounded-xl hover:bg-primary-dark transition-colors shadow-lg shadow-primary/25"
                >
                  Send My Free Quote Request
                </button>
              </form>
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
                <div className="w-8 h-8 rounded-xl bg-primary flex items-center justify-center">
                  <Leaf className="w-4 h-4 text-white" />
                </div>
                <span className="font-bold text-white">OBS Lawncare</span>
              </div>
              <p className="text-sm text-slate-400 leading-relaxed">
                Professional lawn care and landscaping services for Central Florida homeowners and businesses.
              </p>
            </div>
            <div>
              <h4 className="font-semibold text-white mb-3">Services</h4>
              <ul className="space-y-2 text-sm text-slate-400">
                <li><a href="#services" className="hover:text-white transition-colors">Weekly Mowing</a></li>
                <li><a href="#services" className="hover:text-white transition-colors">Landscaping</a></li>
                <li><a href="#services" className="hover:text-white transition-colors">Fertilization</a></li>
                <li><a href="#services" className="hover:text-white transition-colors">Seasonal Clean-ups</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold text-white mb-3">Company</h4>
              <ul className="space-y-2 text-sm text-slate-400">
                <li><a href="#how-it-works" className="hover:text-white transition-colors">How It Works</a></li>
                <li><a href="#pricing" className="hover:text-white transition-colors">Pricing</a></li>
                <li><a href="#testimonials" className="hover:text-white transition-colors">Reviews</a></li>
                <li><a href="#contact" className="hover:text-white transition-colors">Contact</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold text-white mb-3">Contact</h4>
              <ul className="space-y-2 text-sm text-slate-400">
                <li>(407) 555-1234</li>
                <li>hello@orangeblossomspecial.com</li>
                <li>Mon–Sat: 7 AM – 6 PM</li>
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
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
