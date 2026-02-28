import dynamic from 'next/dynamic';
import Navbar from '@/components/landing/Navbar';
import Hero from '@/components/landing/Hero';
import TrustStrip from '@/components/landing/TrustStrip';
import {
    OrganizationSchema,
    LocalBusinessSchema,
    SoftwareApplicationSchema,
    FAQSchema,
} from '@/components/seo/StructuredData';

const Problem = dynamic(() => import('@/components/landing/Problem'));
const Solution = dynamic(() => import('@/components/landing/Solution'));
const Features = dynamic(() => import('@/components/landing/Features'));
const Comparison = dynamic(() => import('@/components/landing/Comparison'));
const UseCases = dynamic(() => import('@/components/landing/UseCases'));
const SocialProof = dynamic(() => import('@/components/landing/SocialProof'));
const Pricing = dynamic(() => import('@/components/landing/Pricing'));
const CTA = dynamic(() => import('@/components/landing/CTA'));
const Footer = dynamic(() => import('@/components/landing/Footer'));

// FAQ data for structured data
const faqData = [
    { question: "What is Aimstors Solution?", answer: "Aimstors Solution is India's #1 WhatsApp Marketing & Automation Platform that helps businesses send bulk campaigns, deploy AI chatbots, and automate customer support." },
    { question: "How much does Aimstors Solution cost?", answer: "Aimstors Solution offers three plans: Starter at ₹1,999/month, Growth at ₹4,999/month, and Enterprise at ₹14,999/month with a 14-day free trial." },
    { question: "Do I need technical knowledge to use Aimstors Solution?", answer: "No, Aimstors Solution is designed for non-technical users with an intuitive drag-and-drop interface. No coding required." },
    { question: "Is Aimstors Solution officially approved by Meta?", answer: "Yes, Aimstors Solution uses the official WhatsApp Business API provided by Meta, ensuring compliance and reliability." },
];

export default function LandingPage() {
    return (
        <main className="font-sans antialiased text-gray-900 bg-white selection:bg-emerald-100 selection:text-emerald-900">
            {/* Structured Data for SEO */}
            <OrganizationSchema />
            <LocalBusinessSchema />
            <SoftwareApplicationSchema />
            <FAQSchema faqs={faqData} />

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
