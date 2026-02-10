'use client';

import Navbar from '@/components/landing/Navbar';
import Hero from '@/components/landing/Hero';
import TrustStrip from '@/components/landing/TrustStrip';
import Problem from '@/components/landing/Problem';
import Solution from '@/components/landing/Solution';
import Features from '@/components/landing/Features';
import Comparison from '@/components/landing/Comparison';
import UseCases from '@/components/landing/UseCases';
import SocialProof from '@/components/landing/SocialProof';
import Pricing from '@/components/landing/Pricing';
import CTA from '@/components/landing/CTA';
import Footer from '@/components/landing/Footer';
import {
    OrganizationSchema,
    LocalBusinessSchema,
    SoftwareApplicationSchema,
    FAQSchema,
} from '@/components/seo/StructuredData';

// FAQ data for structured data
const faqData = [
    { question: "What is Aerostic?", answer: "Aerostic is India's #1 WhatsApp Marketing & Automation Platform that helps businesses send bulk campaigns, deploy AI chatbots, and automate customer support." },
    { question: "How much does Aerostic cost?", answer: "Aerostic offers three plans: Starter at ₹1,999/month, Growth at ₹4,999/month, and Enterprise at ₹14,999/month with a 14-day free trial." },
    { question: "Do I need technical knowledge to use Aerostic?", answer: "No, Aerostic is designed for non-technical users with an intuitive drag-and-drop interface. No coding required." },
    { question: "Is Aerostic officially approved by Meta?", answer: "Yes, Aerostic uses the official WhatsApp Business API provided by Meta, ensuring compliance and reliability." },
];

export default function LandingPage() {
    return (
        <main className="font-sans antialiased text-gray-900 bg-white selection:bg-emerald-100 selection:text-emerald-900">
            {/* Structured Data for SEO */}
            <OrganizationSchema />
            <LocalBusinessSchema />
            <SoftwareApplicationSchema />
            <FAQSchema faqItems={faqData} />

            <Navbar />
            <Hero />
            <TrustStrip />
            <Problem />
            <Solution />
            <Features />
            <Comparison />
            <UseCases />
            <SocialProof />
            <Pricing />
            <CTA />
            <Footer />
        </main>
    );
}
