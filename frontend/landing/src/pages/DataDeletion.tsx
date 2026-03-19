
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Mail, Trash2 } from "lucide-react";

const DataDeletion = () => {
  return (
    <div className="min-h-screen gradient-bg flex flex-col">
      <Navigation />
      
      <div className="flex-1 pt-24 pb-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <h1 className="text-4xl font-bold text-gray-900 mb-4">
              Data Deletion Instructions
            </h1>
            <p className="text-xl text-gray-600">
              How to request the deletion of your account and data.
            </p>
          </div>

          <div className="bg-white rounded-lg p-8 shadow-sm">
            <div className="prose prose-lg max-w-none">
              <p className="lead">
                At Aimstors, we value your privacy and provide clear ways to manage and delete your data 
                associated with our platform and Facebook/Meta applications.
              </p>

              <div className="my-8 flex items-center gap-4 p-4 bg-red-50 border border-red-100 rounded-lg text-red-700">
                <Trash2 className="w-6 h-6 shrink-0" />
                <p className="m-0 font-medium">
                  Requesting data deletion will permanently remove your account, settings, and all 
                  stored WhatsApp conversation history from our servers.
                </p>
              </div>

              <h2>How to Request Data Deletion</h2>
              <p>
                You can request the deletion of your data through any of the following methods:
              </p>

              <div className="grid md:grid-cols-2 gap-6 my-8">
                <div className="p-6 border rounded-xl hover:border-primary/50 transition-colors">
                  <h3 className="text-lg font-bold mb-2 flex items-center gap-2">
                    <Mail className="w-5 h-5 text-primary" />
                    Via Email
                  </h3>
                  <p className="text-sm text-gray-600 mb-4">
                    Send an email to our data protection team with your account details.
                  </p>
                  <Button variant="outline" className="w-full" asChild>
                    <a href="mailto:privacy@aimstors.ai?subject=Data Deletion Request">
                      Email privacy@aimstors.ai
                    </a>
                  </Button>
                </div>

                <div className="p-6 border rounded-xl hover:border-primary/50 transition-colors opacity-50">
                  <h3 className="text-lg font-bold mb-2">In-App Settings</h3>
                  <p className="text-sm text-gray-600">
                    (Coming Soon) Navigate to Settings {">"} Profile {">"} Delete Account within your 
                    dashboard.
                  </p>
                </div>
              </div>

              <h2>Facebook App Data Deletion</h2>
              <p>
                If you have connected your Meta/Facebook account and wish to remove the app's access 
                to your data, follow these steps:
              </p>
              <ol>
                <li>Go to your Facebook Account's "Settings & Privacy"</li>
                <li>Click on "Settings"</li>
                <li>Look for "Apps and Websites" in the left menu</li>
                <li>Find **Aimstors** and click "Remove"</li>
                <li>Confirm the removal to stop sharing any future data</li>
              </ol>

              <h2>Processing Time</h2>
              <p>
                Once a request is received via email, our team will verify your identity and process 
                the deletion within **30 business days**. You will receive a confirmation email once 
                all data has been purged from our active databases and backup systems.
              </p>
            </div>
          </div>
        </div>
      </div>
      
      <Footer />
    </div>
  );
};

export default DataDeletion;
