
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

              <h2>Information Sharing</h2>
              <p>
                We do not sell, trade, or otherwise transfer your personal information to third parties 
                without your consent, except as described in this policy. We may share your information 
                in certain limited circumstances, such as with service providers who assist us in 
                operating our platform.
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
