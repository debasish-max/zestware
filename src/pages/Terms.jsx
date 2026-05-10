import React from 'react';
import { ShieldCheck, FileText, Scale, AlertCircle } from 'lucide-react';

export default function Terms() {
  return (
    <div className="min-h-screen bg-white py-20 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-16">
          <div className="w-16 h-16 bg-brand/5 rounded-2xl flex items-center justify-center mx-auto mb-6 text-brand">
            <Scale size={32} />
          </div>
          <h1 className="text-5xl font-black text-gray-900 tracking-tighter mb-4">Terms & Conditions</h1>
          <p className="text-gray-500 font-medium italic">Last Updated: May 10, 2026</p>
        </div>

        <div className="space-y-12 text-gray-600 leading-relaxed font-medium">
          <section className="space-y-4">
            <h2 className="text-2xl font-black text-gray-800 flex items-center gap-3">
              <FileText className="text-brand" size={24} />
              1. Introduction
            </h2>
            <p>
              Welcome to ZESTWEAR. These Terms and Conditions govern your use of our website and the purchase of our products. By accessing or using our site, you agree to be bound by these terms. If you disagree with any part of the terms, you may not access our services.
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="text-2xl font-black text-gray-800 flex items-center gap-3">
              <ShieldCheck className="text-brand" size={24} />
              2. Intellectual Property
            </h2>
            <p>
              All content on this site, including but not limited to designs, logos, text, graphics, and images, is the property of ZESTWEAR and is protected by intellectual property laws. You may not reproduce, distribute, or create derivative works from our content without explicit written permission.
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="text-2xl font-black text-gray-800 flex items-center gap-3">
              <AlertCircle className="text-brand" size={24} />
              3. User Responsibilities
            </h2>
            <p>
              When using our platform, you agree to provide accurate information and maintain the security of your account. You are responsible for all activities that occur under your account. Prohibited activities include but are not limited to:
            </p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Engaging in fraudulent transactions.</li>
              <li>Attempting to breach the site's security measures.</li>
              <li>Using the site for any unlawful purpose.</li>
            </ul>
          </section>

          <section className="space-y-4">
            <h2 className="text-2xl font-black text-gray-800 flex items-center gap-3">
              <Scale className="text-brand" size={24} />
              4. Limitation of Liability
            </h2>
            <p>
              ZESTWEAR shall not be liable for any indirect, incidental, special, or consequential damages resulting from the use or inability to use our products or website. Our maximum liability shall not exceed the amount paid by you for the specific product purchased.
            </p>
          </section>

          <section className="space-y-4 border-t border-gray-100 pt-12">
            <h2 className="text-2xl font-black text-gray-800">5. Governing Law</h2>
            <p>
              These terms are governed by and construed in accordance with the laws of India, and any disputes shall be subject to the exclusive jurisdiction of the courts in Jorhat, Assam.
            </p>
          </section>

          <div className="bg-gray-50 p-8 rounded-[2rem] border border-gray-100 mt-16">
            <p className="text-sm text-center font-bold text-gray-500 uppercase tracking-widest">
              By continuing to use ZESTWEAR, you acknowledge that you have read and understood these terms.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
