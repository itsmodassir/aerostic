
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";

const DashboardLoading = () => {
  return (
    <div className="min-h-screen gradient-bg flex flex-col">
      <Navigation />
      <div className="flex-1 pt-24 pb-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-gray-600">Loading your dashboard...</p>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default DashboardLoading;
