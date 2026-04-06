import Link from 'next/link';
import { Bot, Mail, MessageSquare, Settings2, Workflow } from 'lucide-react';

const cards = [
  {
    title: 'WhatsApp',
    description: 'Connect Meta embedded signup, messaging identity, and account sync.',
    href: '/settings/whatsapp',
    icon: MessageSquare,
    accent: 'text-emerald-600 bg-emerald-50 border-emerald-100',
  },
  {
    title: 'WhatsApp Flows',
    description: 'Manage WhatsApp forms and interactive journey assets.',
    href: '/settings/whatsapp/flows',
    icon: Workflow,
    accent: 'text-blue-600 bg-blue-50 border-blue-100',
  },
  {
    title: 'AI Config',
    description: 'Configure tenant AI providers, keys, and model defaults.',
    href: '/settings/ai',
    icon: Bot,
    accent: 'text-violet-600 bg-violet-50 border-violet-100',
  },
  {
    title: 'Email',
    description: 'Add SMTP mailboxes and validate sending configuration.',
    href: '/settings/email',
    icon: Mail,
    accent: 'text-amber-600 bg-amber-50 border-amber-100',
  },
];

export default function SettingsPage() {
  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
        <div className="flex items-center gap-3">
          <Settings2 className="h-8 w-8 text-slate-700" />
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Settings Hub</h1>
            <p className="text-gray-500 mt-1">
              Use the sections below to configure the live parts of the platform.
            </p>
          </div>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        {cards.map((card) => (
          <Link
            key={card.href}
            href={card.href}
            className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-md"
          >
            <div className={`mb-4 inline-flex rounded-xl border p-3 ${card.accent}`}>
              <card.icon className="h-6 w-6" />
            </div>
            <h2 className="text-xl font-semibold text-gray-900">{card.title}</h2>
            <p className="mt-2 text-sm text-gray-500">{card.description}</p>
            <p className="mt-4 text-sm font-semibold text-blue-600">Open section</p>
          </Link>
        ))}
      </div>
    </div>
  );
}
