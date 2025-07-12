import { Link } from "react-router-dom";
import { Globe, Mail, FileText, Users } from "lucide-react";
const Footer = () => {
  return <footer className="relative bg-card/95 backdrop-blur-sm border-t border-border text-foreground py-12 mt-16">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid md:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="col-span-1">
            <div className="flex items-center space-x-2 mb-4">
              <Globe className="h-8 w-8 text-primary" />
              <span className="text-xl font-bold text-foreground">Aerostic AI</span>
            </div>
            <p className="text-muted-foreground text-sm leading-relaxed">
              Create professional blogs and websites with the power of AI. Generate content, build sites, and manage your online presence effortlessly.
            </p>
          </div>

          {/* Features */}
          <div>
            <h3 className="font-semibold mb-4 text-foreground">Features</h3>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li>
                <Link to="/blog-editor" className="hover:text-primary transition-colors block">
                  AI Blog Editor
                </Link>
              </li>
              <li>
                <Link to="/blog-builder" className="hover:text-primary transition-colors block">
                  Website Builder
                </Link>
              </li>
              <li>
                <Link to="/deploy" className="hover:text-primary transition-colors block">
                  Deploy
                </Link>
              </li>
              <li>
                <Link to="/dashboard" className="hover:text-primary transition-colors block">
                  Dashboard
                </Link>
              </li>
              <li>
                <Link to="/features" className="hover:text-primary transition-colors block">
                  All Features
                </Link>
              </li>
            </ul>
          </div>

          {/* Company */}
          <div>
            <h3 className="font-semibold mb-4 text-foreground">Company</h3>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li>
                <Link to="/about" className="hover:text-primary transition-colors block">
                  About Us
                </Link>
              </li>
              <li>
                <Link to="/blog" className="hover:text-primary transition-colors block">
                  Blog
                </Link>
              </li>
              <li>
                <Link to="/contact" className="hover:text-primary transition-colors block">
                  Contact
                </Link>
              </li>
              <li>
                <Link to="/privacy" className="hover:text-primary transition-colors block">
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link to="/terms" className="hover:text-primary transition-colors block">
                  Terms of Service
                </Link>
              </li>
            </ul>
          </div>

          {/* Support */}
          <div>
            <h3 className="font-semibold mb-4 text-foreground">Support</h3>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li>
                <Link to="/faq" className="hover:text-primary transition-colors block">
                  FAQ
                </Link>
              </li>
              <li>
                <Link to="/help" className="hover:text-primary transition-colors block">
                  Help Center
                </Link>
              </li>
              <li>
                <Link to="/pricing" className="hover:text-primary transition-colors block">
                  Pricing
                </Link>
              </li>
              <li>
                <a href="mailto:support@aerostic.ai" className="hover:text-primary transition-colors block">
                  Support
                </a>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-border mt-8 pt-8">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="text-sm text-muted-foreground mb-4 md:mb-0">© 2025 Aerostic AI. All rights reserved.</div>
            <div className="flex space-x-6 text-sm text-muted-foreground">
              <a href="#" className="hover:text-primary transition-colors">Privacy</a>
              <a href="#" className="hover:text-primary transition-colors">Terms</a>
              <a href="#" className="hover:text-primary transition-colors">Cookies</a>
            </div>
          </div>
        </div>
      </div>
    </footer>;
};
export default Footer;