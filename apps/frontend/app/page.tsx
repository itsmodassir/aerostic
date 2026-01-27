import Link from 'next/link';

export default function LandingPage() {
    return (
        <div className="min-h-screen bg-white">
            <nav className="flex items-center justify-between p-6 border-b">
                <div className="text-2xl font-bold text-blue-600">Aerostic</div>
                <div className="space-x-4">
                    <Link href="/login" className="text-gray-600 hover:text-gray-900">Login</Link>
                    <Link href="/register" className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700">Get Started</Link>
                </div>
            </nav>

            <main className="max-w-6xl mx-auto px-6 py-20 text-center">
                <h1 className="text-5xl font-extrabold text-gray-900 mb-6">
                    The WhatsApp Marketing Platform <br />
                    <span className="text-blue-600">Built for Scale</span>
                </h1>
                <p className="text-xl text-gray-600 mb-10 max-w-2xl mx-auto">
                    Automate your customer communication, broadcast campaigns, and support users with our Meta-approved solution.
                </p>
                <div className="flex justify-center gap-4">
                    <Link href="/register" className="bg-blue-600 text-white px-8 py-3 rounded-lg text-lg font-medium hover:bg-blue-700">Start Free Trial</Link>
                    <Link href="/docs" className="bg-gray-100 text-gray-700 px-8 py-3 rounded-lg text-lg font-medium hover:bg-gray-200">View Documentation</Link>
                </div>
            </main>
        </div>
    );
}
