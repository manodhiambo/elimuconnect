import { useEffect } from 'react';
import { ExternalLink } from 'lucide-react';

export const AdminPanelPage = () => {
  const ADMIN_DASHBOARD_URL = 'https://elimuconnect-admin-dashboard.vercel.app';

  useEffect(() => {
    const timer = setTimeout(() => {
      window.location.href = ADMIN_DASHBOARD_URL;
    }, 3000);

    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="text-center bg-white p-8 rounded-lg shadow-md max-w-md">
        <h1 className="text-2xl font-bold text-gray-900 mb-4">
          Redirecting to Admin Dashboard
        </h1>
        <p className="text-gray-600 mb-6">
          Redirecting you to the admin dashboard...
        </p>
        
          href={ADMIN_DASHBOARD_URL}
          className="inline-flex items-center px-6 py-3 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
        >
          Go to Admin Dashboard
          <ExternalLink className="ml-2 w-5 h-5" />
        </a>
        <p className="text-sm text-gray-500 mt-4">
          Click the button if not redirected automatically.
        </p>
      </div>
    </div>
  );
};
