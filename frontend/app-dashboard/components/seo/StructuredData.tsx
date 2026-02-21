// Structured Data Components for SEO, GEO SEO, and AEO
// Implements JSON-LD schema markup for rich search results

export function OrganizationSchema() {
    const schema = {
        "@context": "https://schema.org",
        "@type": "Organization",
        "@id": "https://aimstore.in/#organization",
        "name": "Aerostic",
        "alternateName": "Aerostic WhatsApp Marketing",
        "url": "https://aimstore.in",
        "logo": "https://aimstore.in/logo.png",
        "image": "https://aimstore.in/og-image.png",
        "description": "India's #1 WhatsApp Marketing & Automation Platform. Send bulk campaigns, deploy AI chatbots, automate customer support.",
        "email": "hello@aimstore.in",
        "telephone": "+91-9876543210",
        "foundingDate": "2024",
        "founders": [
            {
                "@type": "Person",
                "name": "Aerostic Team"
            }
        ],
        "address": {
            "@type": "PostalAddress",
            "streetAddress": "Sector 62",
            "addressLocality": "Noida",
            "addressRegion": "Uttar Pradesh",
            "postalCode": "201301",
            "addressCountry": "IN"
        },
        "geo": {
            "@type": "GeoCoordinates",
            "latitude": "28.6273",
            "longitude": "77.3714"
        },
        "contactPoint": [
            {
                "@type": "ContactPoint",
                "contactType": "customer support",
                "telephone": "+91-9876543210",
                "email": "support@aimstore.in",
                "availableLanguage": ["English", "Hindi"],
                "areaServed": "IN"
            },
            {
                "@type": "ContactPoint",
                "contactType": "sales",
                "telephone": "+91-9876543210",
                "email": "sales@aimstore.in",
                "availableLanguage": ["English", "Hindi"]
            }
        ],
        "sameAs": [
            "https://twitter.com/aerostic",
            "https://linkedin.com/company/aerostic",
            "https://instagram.com/aerostic",
            "https://facebook.com/aerostic"
        ]
    };

    return (
        <script
            type="application/ld+json"
            dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
        />
    );
}

export function LocalBusinessSchema() {
    const schema = {
        "@context": "https://schema.org",
        "@type": "SoftwareApplication",
        "@id": "https://aimstore.in/#software",
        "name": "Aerostic",
        "applicationCategory": "BusinessApplication",
        "operatingSystem": "Web, iOS, Android",
        "offers": {
            "@type": "AggregateOffer",
            "priceCurrency": "INR",
            "lowPrice": "1999",
            "highPrice": "14999",
            "offerCount": "3"
        },
        "aggregateRating": {
            "@type": "AggregateRating",
            "ratingValue": "4.8",
            "ratingCount": "2847",
            "bestRating": "5",
            "worstRating": "1"
        },
        "provider": {
            "@type": "Organization",
            "@id": "https://aimstore.in/#organization"
        },
        "featureList": [
            "Bulk WhatsApp Campaigns",
            "AI-Powered Chatbots",
            "Template Management",
            "Contact Segmentation",
            "Analytics Dashboard",
            "API Integration",
            "Webhook Support",
            "Multi-Agent Support"
        ]
    };

    return (
        <script
            type="application/ld+json"
            dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
        />
    );
}

export function SoftwareApplicationSchema() {
    const schema = {
        "@context": "https://schema.org",
        "@type": "SoftwareApplication",
        "name": "Aerostic WhatsApp Marketing Platform",
        "applicationCategory": "BusinessApplication",
        "operatingSystem": "Web Browser",
        "offers": {
            "@type": "Offer",
            "price": "1999",
            "priceCurrency": "INR",
            "priceValidUntil": "2026-12-31"
        },
        "aggregateRating": {
            "@type": "AggregateRating",
            "ratingValue": "4.8",
            "reviewCount": "2847"
        },
        "screenshot": "https://aimstore.in/dashboard-screenshot.png",
        "downloadUrl": "https://aimstore.in/signup",
        "softwareVersion": "2.0",
        "releaseNotes": "https://aimstore.in/changelog"
    };

    return (
        <script
            type="application/ld+json"
            dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
        />
    );
}

interface FAQItem {
    question: string;
    answer: string;
}

export function FAQSchema({ faqs }: { faqs: FAQItem[] }) {
    if (!faqs || !Array.isArray(faqs)) return null;

    const schema = {
        "@context": "https://schema.org",
        "@type": "FAQPage",
        "mainEntity": faqs.map(faq => ({
            "@type": "Question",
            "name": faq.question,
            "acceptedAnswer": {
                "@type": "Answer",
                "text": faq.answer
            }
        }))
    };

    return (
        <script
            type="application/ld+json"
            dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
        />
    );
}

export function HowToSchema() {
    const schema = {
        "@context": "https://schema.org",
        "@type": "HowTo",
        "name": "How to Set Up WhatsApp Marketing with Aerostic",
        "description": "Step-by-step guide to start WhatsApp marketing campaigns with Aerostic",
        "totalTime": "PT15M",
        "estimatedCost": {
            "@type": "MonetaryAmount",
            "currency": "INR",
            "value": "1999"
        },
        "tool": [
            {
                "@type": "HowToTool",
                "name": "Meta Business Account"
            },
            {
                "@type": "HowToTool",
                "name": "WhatsApp Business Phone Number"
            }
        ],
        "step": [
            {
                "@type": "HowToStep",
                "position": 1,
                "name": "Create Account",
                "text": "Sign up for a free 14-day trial at aimstore.in with your business email.",
                "url": "https://aimstore.in/signup"
            },
            {
                "@type": "HowToStep",
                "position": 2,
                "name": "Connect WhatsApp",
                "text": "Link your WhatsApp Business Account using the embedded signup flow.",
                "url": "https://aimstore.in/docs/getting-started"
            },
            {
                "@type": "HowToStep",
                "position": 3,
                "name": "Create Templates",
                "text": "Design message templates and submit them for Meta approval.",
                "url": "https://aimstore.in/docs/templates"
            },
            {
                "@type": "HowToStep",
                "position": 4,
                "name": "Send Messages",
                "text": "Start sending bulk campaigns or set up AI chatbots for automation.",
                "url": "https://aimstore.in/docs/api-reference"
            }
        ]
    };

    return (
        <script
            type="application/ld+json"
            dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
        />
    );
}

export function ProductSchema() {
    const schema = {
        "@context": "https://schema.org",
        "@type": "Product",
        "name": "Aerostic WhatsApp Marketing Platform",
        "description": "Complete WhatsApp marketing automation solution with AI chatbots, bulk messaging, and analytics.",
        "brand": {
            "@type": "Brand",
            "name": "Aerostic"
        },
        "offers": [
            {
                "@type": "Offer",
                "name": "Starter Plan",
                "price": "1999",
                "priceCurrency": "INR",
                "priceValidUntil": "2026-12-31",
                "availability": "https://schema.org/InStock",
                "url": "https://aimstore.in/pricing",
                "description": "5,000 messages/month, 1 AI agent, basic analytics"
            },
            {
                "@type": "Offer",
                "name": "Growth Plan",
                "price": "4999",
                "priceCurrency": "INR",
                "priceValidUntil": "2026-12-31",
                "availability": "https://schema.org/InStock",
                "url": "https://aimstore.in/pricing",
                "description": "25,000 messages/month, 5 AI agents, advanced analytics"
            },
            {
                "@type": "Offer",
                "name": "Enterprise Plan",
                "price": "14999",
                "priceCurrency": "INR",
                "priceValidUntil": "2026-12-31",
                "availability": "https://schema.org/InStock",
                "url": "https://aimstore.in/pricing",
                "description": "Unlimited messages, unlimited AI agents, dedicated support"
            }
        ],
        "aggregateRating": {
            "@type": "AggregateRating",
            "ratingValue": "4.8",
            "reviewCount": "2847",
            "bestRating": "5",
            "worstRating": "1"
        },
        "review": [
            {
                "@type": "Review",
                "author": {
                    "@type": "Person",
                    "name": "Rahul Sharma"
                },
                "datePublished": "2026-01-15",
                "reviewBody": "Aerostic transformed our customer engagement. We went from 100 to 10,000 monthly conversations with the same team size.",
                "reviewRating": {
                    "@type": "Rating",
                    "ratingValue": "5"
                }
            },
            {
                "@type": "Review",
                "author": {
                    "@type": "Person",
                    "name": "Priya Patel"
                },
                "datePublished": "2026-01-10",
                "reviewBody": "The AI agents handle 80% of our queries automatically. Our customers love the instant responses!",
                "reviewRating": {
                    "@type": "Rating",
                    "ratingValue": "5"
                }
            }
        ]
    };

    return (
        <script
            type="application/ld+json"
            dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
        />
    );
}

interface BreadcrumbItem {
    name: string;
    url: string;
}

export function BreadcrumbSchema({ items }: { items: BreadcrumbItem[] }) {
    const schema = {
        "@context": "https://schema.org",
        "@type": "BreadcrumbList",
        "itemListElement": items.map((item, index) => ({
            "@type": "ListItem",
            "position": index + 1,
            "name": item.name,
            "item": item.url
        }))
    };

    return (
        <script
            type="application/ld+json"
            dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
        />
    );
}

export function WebSiteSchema() {
    const schema = {
        "@context": "https://schema.org",
        "@type": "WebSite",
        "@id": "https://aimstore.in/#website",
        "url": "https://aimstore.in",
        "name": "Aerostic",
        "description": "India's #1 WhatsApp Marketing & Automation Platform",
        "publisher": {
            "@id": "https://aimstore.in/#organization"
        },
        "potentialAction": {
            "@type": "SearchAction",
            "target": {
                "@type": "EntryPoint",
                "urlTemplate": "https://aimstore.in/search?q={search_term_string}"
            },
            "query-input": "required name=search_term_string"
        },
        "inLanguage": ["en-IN", "hi-IN"]
    };

    return (
        <script
            type="application/ld+json"
            dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
        />
    );
}

export function ArticleSchema({
    title,
    description,
    datePublished,
    dateModified,
    author = "Aerostic Team",
    url
}: {
    title: string;
    description: string;
    datePublished: string;
    dateModified?: string;
    author?: string;
    url: string;
}) {
    const schema = {
        "@context": "https://schema.org",
        "@type": "Article",
        "headline": title,
        "description": description,
        "datePublished": datePublished,
        "dateModified": dateModified || datePublished,
        "author": {
            "@type": "Person",
            "name": author
        },
        "publisher": {
            "@type": "Organization",
            "@id": "https://aimstore.in/#organization"
        },
        "mainEntityOfPage": {
            "@type": "WebPage",
            "@id": url
        }
    };

    return (
        <script
            type="application/ld+json"
            dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
        />
    );
}

// All-in-one SEO component for pages
export function PageSEO({
    page,
    breadcrumbs
}: {
    page: 'home' | 'pricing' | 'docs' | 'about' | 'contact';
    breadcrumbs?: BreadcrumbItem[];
}) {
    const defaultFaqs = [
        { question: "What is Aerostic?", answer: "Aerostic is India's #1 WhatsApp Marketing & Automation Platform that helps businesses send bulk campaigns, deploy AI chatbots, and automate customer support." },
        { question: "How much does Aerostic cost?", answer: "Aerostic offers three plans: Starter at ₹1,999/month, Growth at ₹4,999/month, and Enterprise at ₹14,999/month with a 14-day free trial." },
        { question: "Do I need technical knowledge?", answer: "No, Aerostic is designed for non-technical users with an intuitive drag-and-drop interface. No coding required." },
        { question: "Is Aerostic officially approved by Meta?", answer: "Yes, Aerostic uses the official WhatsApp Business API provided by Meta, ensuring compliance and reliability." }
    ];

    return (
        <>
            <OrganizationSchema />
            <WebSiteSchema />
            {page === 'home' && (
                <>
                    <LocalBusinessSchema />
                    <SoftwareApplicationSchema />
                    <FAQSchema faqs={defaultFaqs} />
                    <HowToSchema />
                    <ProductSchema />
                </>
            )}
            {page === 'pricing' && <ProductSchema />}
            {breadcrumbs && <BreadcrumbSchema items={breadcrumbs} />}
        </>
    );
}
