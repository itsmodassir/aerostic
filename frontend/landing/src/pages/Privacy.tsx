
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";

const Privacy = () => {
  return (
    <div className="min-h-screen gradient-bg flex flex-col">
      <Navigation />
      
      <div className="flex-1 pt-24 pb-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <h1 className="text-4xl font-bold text-gray-900 mb-4">
              Privacy Policy
            </h1>
            <p className="text-xl text-gray-600">
              Last updated: {new Date().toLocaleDateString()}
            </p>
          </div>

          <div className="bg-white rounded-lg p-8 shadow-sm">
            <div className="prose prose-lg max-w-none">
              <h2>Information We Collect</h2>
              <p>
                We collect information you provide directly to us, such as when you create an account, 
                use our services, or contact us for support. This may include your name, email address, 
                and content you create using our platform.
              </p>

              <h2>How We Use Your Information</h2>
              <p>We use the information we collect to:</p>
              <ul>
                <li>Provide, maintain, and improve our services</li>
                <li>Process transactions and send related information</li>
                <li>Send technical notices, updates, and support messages</li>
                <li>Respond to your comments and questions</li>
                <li>Monitor and analyze trends and usage</li>
              </ul>

              <p>
                We do not sell or trade your personal information. We share your information 
                only in the following circumstances:
              </p>
              <ul>
                <li><strong>Service Providers:</strong> Cloud hosting (AWS), database management, and analytics providers.</li>
                <li><strong>Meta APIs:</strong> When you connect your WhatsApp Business Account, we share data with Meta Platforms, Inc. to facilitate message delivery. This is governed by Meta's own privacy policies.</li>
                <li><strong>Legal Compliance:</strong> If required by law or to protect our rights.</li>
              </ul>

              <h2>WhatsApp & Meta Data Handling</h2>
              <p>
                When using our WhatsApp automation features, we process:
              </p>
              <ul>
                <li>Phone numbers and display names of your customers.</li>
                <li>Message content transferred via the WhatsApp Business Platform.</li>
                <li>Media files (images, documents) sent within conversations.</li>
              </ul>
              <p>
                This data is stored securely and used solely to provide the automation and inbox 
                features you have configured.
              </p>

              <h2>Data Deletion & Retention</h2>
              <p>
                We retain your data for as long as your account is active. You can request full 
                data deletion at any time by following our 
                <a href="/data-deletion" className="text-primary hover:underline ml-1">
                  Data Deletion Instructions
                </a>.
              </p>

              <h2>Data Security</h2>
              <p>
                We implement appropriate technical and organizational measures to protect your personal 
                information against unauthorized access, alteration, disclosure, or destruction.
              </p>

              <h2>Your Rights</h2>
              <p>
                You have the right to access, update, or delete your personal information. You may also 
                request that we restrict or stop processing your data in certain circumstances.
              </p>

              <h2>Contact Us</h2>
              <p>
                If you have questions about this Privacy Policy, please contact us at 
                privacy@aimstors.ai
              </p>
            </div>
          </div>
        </div>
      </div>
      
      <Footer />
    </div>
  );
};

export default Privacy;
