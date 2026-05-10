import React from 'react';
import { Lock, Eye, Database, Server, Shield } from 'lucide-react';

export default function PrivacyPolicy() {
  return (
    <div className="min-h-screen bg-white py-20 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-16">
          <div className="w-16 h-16 bg-brand/5 rounded-2xl flex items-center justify-center mx-auto mb-6 text-brand">
            <Lock size={32} />
          </div>
          <h1 className="text-5xl font-black text-gray-900 tracking-tighter mb-4">Privacy Policy</h1>
          <p className="text-gray-500 font-medium italic">Last Updated: May 10, 2026</p>
        </div>

        <div className="space-y-12 text-gray-600 leading-relaxed font-medium">
          <section className="space-y-4">
            <h2 className="text-2xl font-black text-gray-800 flex items-center gap-3">
              <Eye className="text-brand" size={24} />
              1. Information Collection
            </h2>
            <p>
              We collect information that you provide directly to us when you create an account, make a purchase, or communicate with us. This includes your name, email address, phone number, shipping address, and payment details processed via our secure partners like Razorpay.
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="text-2xl font-black text-gray-800 flex items-center gap-3">
              <Database className="text-brand" size={24} />
              2. How We Use Data
            </h2>
            <p>
              Your data is primarily used to process orders, manage your account, and provide customer support. We may also use your information to send you updates about your order status or promotional content if you have opted in to receive it.
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="text-2xl font-black text-gray-800 flex items-center gap-3">
              <Shield className="text-brand" size={24} />
              3. Data Protection
            </h2>
            <p>
              We implement industry-standard security measures to protect your personal information. All transactions are encrypted, and we do not store sensitive payment information on our servers. Access to your personal data is restricted to authorized personnel only.
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="text-2xl font-black text-gray-800 flex items-center gap-3">
              <Server className="text-brand" size={24} />
              4. Third-Party Sharing
            </h2>
            <p>
              We do not sell your personal data. We only share information with trusted third parties necessary to fulfill your orders, such as payment processors (Razorpay), shipping carriers, and authentication services (Supabase/Clerk).
            </p>
          </section>

          <section className="space-y-4 border-t border-gray-100 pt-12">
            <h2 className="text-2xl font-black text-gray-800">5. Your Rights</h2>
            <p>
              You have the right to access, correct, or request the deletion of your personal data at any time. If you wish to exercise these rights, please contact us at zestwearindia@gmail.com.
            </p>
          </section>

          <div className="bg-gray-950 text-white p-12 rounded-[3rem] border border-gray-800 mt-16 text-center">
            <Shield className="mx-auto mb-6 text-brand" size={48} />
            <h3 className="text-2xl font-black mb-4">Your Privacy is Our Priority</h3>
            <p className="text-gray-400 font-medium">
              We are committed to being transparent about how we handle your information and ensuring your experience with ZESTWEAR is safe and secure.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
