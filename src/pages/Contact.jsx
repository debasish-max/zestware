import React from 'react';
import { MessageSquare, MapPin, Mail, Phone, Instagram, Twitter, MessageCircle } from 'lucide-react';

export default function Contact() {
  return (
    <div className="min-h-screen bg-white">
      {/* Header Section */}
      <section className="bg-gray-950 text-white py-32 px-4 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-brand/20 rounded-full blur-[120px] -translate-y-1/2 translate-x-1/2" />
        <div className="max-w-4xl mx-auto text-center relative z-10">
          <h1 className="text-6xl md:text-8xl font-black tracking-tighter mb-8 leading-none">
            GET IN <span className="text-brand italic">TOUCH</span>
          </h1>
          <p className="text-xl text-gray-400 font-medium max-w-2xl mx-auto leading-relaxed">
            Have a question about an order, a business inquiry, or just want to say hello? 
            Our team is here to help you.
          </p>
        </div>
      </section>

      {/* Main Content */}
      <section className="max-w-7xl mx-auto px-4 py-24 -mt-16 relative z-20">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Contact Information Cards */}
          <div className="space-y-6">
            <ContactInfoCard 
              icon={<Mail className="text-brand" size={24} />}
              title="Email Us"
              value="zestwearindia@gmail.com"
              subtitle="We usually respond within 24 hours."
            />
            <ContactInfoCard 
              icon={<Phone className="text-brand" size={24} />}
              title="Call Us"
              value="+91 70021 37717"
              subtitle="Mon-Sat, 10am - 7pm IST"
            />
            <ContactInfoCard 
              icon={<MapPin className="text-brand" size={24} />}
              title="Visit Us"
              value="Jorhat, Assam, India"
              subtitle="Headquarters & Creative Studio"
            />
          </div>

          {/* Contact Form */}
          <div className="lg:col-span-2">
            <div className="bg-white p-8 md:p-12 rounded-[3rem] shadow-2xl shadow-gray-200/50 border border-gray-50">
              <form className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-xs font-black uppercase tracking-widest text-gray-400 pl-4">Full Name</label>
                    <input
                      type="text"
                      className="w-full px-6 py-4 bg-gray-50 border-transparent rounded-2xl focus:ring-4 focus:ring-brand/10 focus:bg-white focus:border-brand transition-all outline-none font-bold"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-black uppercase tracking-widest text-gray-400 pl-4">Email Address</label>
                    <input
                      type="email"
                      className="w-full px-6 py-4 bg-gray-50 border-transparent rounded-2xl focus:ring-4 focus:ring-brand/10 focus:bg-white focus:border-brand transition-all outline-none font-bold"
                      required
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-black uppercase tracking-widest text-gray-400 pl-4">Subject</label>
                  <input
                    type="text"
                    className="w-full px-6 py-4 bg-gray-50 border-transparent rounded-2xl focus:ring-4 focus:ring-brand/10 focus:bg-white focus:border-brand transition-all outline-none font-bold"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-black uppercase tracking-widest text-gray-400 pl-4">Your Message</label>
                  <textarea
                    rows="6"
                    className="w-full px-6 py-4 bg-gray-50 border-transparent rounded-3xl focus:ring-4 focus:ring-brand/10 focus:bg-white focus:border-brand transition-all outline-none font-bold resize-none"
                    required
                  ></textarea>
                </div>
                <button
                  type="submit"
                  className="w-full bg-brand text-white py-6 rounded-[2rem] text-lg font-black tracking-tight hover:bg-gray-800 transition-all duration-300 shadow-xl shadow-brand/20 active:scale-[0.98]"
                >
                  Send Message
                </button>
              </form>
            </div>
          </div>
        </div>
      </section>

      {/* Social Connect */}
      <section className="bg-gray-50 py-24 px-4 text-center">
        <h2 className="text-sm font-black uppercase tracking-[0.4em] text-gray-400 mb-12">Connect with us on Socials</h2>
        <div className="flex flex-wrap justify-center gap-6">
          <SocialLink icon={<Instagram size={24} />} label="Instagram" href="https://www.instagram.com/zestwearindiaofficial/" />
          <SocialLink icon={<MessageCircle size={24} />} label="WhatsApp" href="https://chat.whatsapp.com/B5rKZPNL80yCTTZmX6lkvh" />
          <SocialLink icon={<Twitter size={24} />} label="Twitter" href="#" />
        </div>
      </section>
    </div>
  );
}

function ContactInfoCard({ icon, title, value, subtitle }) {
  return (
    <div className="bg-white p-8 rounded-[2.5rem] border border-gray-100 shadow-sm hover:shadow-md transition-shadow">
      <div className="w-12 h-12 bg-brand/5 rounded-2xl flex items-center justify-center mb-6">
        {icon}
      </div>
      <h3 className="text-xs font-black uppercase tracking-widest text-gray-400 mb-2">{title}</h3>
      <p className="text-xl font-black text-gray-800 mb-1">{value}</p>
      <p className="text-sm text-gray-500 font-medium">{subtitle}</p>
    </div>
  );
}

function SocialLink({ icon, label, href }) {
  return (
    <a 
      href={href} 
      className="flex items-center gap-3 px-8 py-4 bg-white rounded-2xl border border-gray-100 hover:border-brand hover:text-brand transition-all font-black text-sm shadow-sm hover:shadow-md group"
    >
      <span className="group-hover:scale-110 transition-transform">{icon}</span>
      {label}
    </a>
  );
}
