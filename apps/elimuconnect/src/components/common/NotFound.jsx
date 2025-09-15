import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { Home, ArrowLeft, Search, BookOpen } from 'lucide-react';
import { ROUTES } from '@utils/constants';

const NotFound = () => {
  const navigate = useNavigate();

  const handleGoBack = () => {
    navigate(-1);
  };

  const popularPages = [
    {
      title: 'Dashboard',
      description: 'Go to your personalized dashboard',
      icon: Home,
      path: ROUTES.DASHBOARD
    },
    {
      title: 'Digital Library',
      description: 'Browse our collection of educational books',
      icon: BookOpen,
      path: ROUTES.LIBRARY
    },
    {
      title: 'Past Papers',
      description: 'Access KNEC past papers and marking schemes',
      icon: Search,
      path: ROUTES.PAPERS
    }
  ];

  return (
    <>
      <Helmet>
        <title>Page Not Found - ElimuConnect</title>
        <meta name="description" content="The page you're looking for doesn't exist. Return to ElimuConnect to continue your learning journey." />
      </Helmet>

      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center px-4">
        <div className="max-w-2xl w-full text-center">
          {/* 404 Illustration */}
          <div className="mb-8">
            <div className="text-8xl md:text-9xl font-bold text-blue-600 dark:text-blue-400 mb-4">
              404
            </div>
            <div className="relative">
              <BookOpen className="h-24 w-24 text-gray-300 dark:text-gray-600 mx-auto" />
              <div className="absolute -top-2 -right-2 bg-red-500 text-white text-xs px-2 py-1 rounded-full">
                Missing
              </div>
            </div>
          </div>

          {/* Error Message */}
          <div className="mb-8">
            <h1 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-4">
              Oops! Page Not Found
            </h1>
            <p className="text-lg text-gray-600 dark:text-gray-400 leading-relaxed">
              The page you're looking for doesn't exist or has been moved. 
              Don't worry, let's get you back on track with your learning journey.
            </p>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
            <button
              onClick={handleGoBack}
              className="inline-flex items-center justify-center px-6 py-3 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
            >
              <ArrowLeft className="h-5 w-5 mr-2" />
              Go Back
            </button>
            <Link
              to={ROUTES.HOME}
              className="inline-flex items-center justify-center px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <Home className="h-5 w-5 mr-2" />
              Go Home
            </Link>
          </div>

          {/* Popular Pages */}
          <div className="text-left">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-6">
              Or try these popular pages:
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {popularPages.map((page, index) => (
                <Link
                  key={index}
                  to={page.path}
                  className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 hover:shadow-md hover:border-blue-300 dark:hover:border-blue-600 transition-all group"
                >
                  <div className="flex items-center mb-3">
                    <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900 rounded-lg flex items-center justify-center mr-3 group-hover:bg-blue-200 dark:group-hover:bg-blue-800 transition-colors">
                      <page.icon className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                    </div>
                    <h3 className="font-semibold text-gray-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                      {page.title}
                    </h3>
                  </div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    {page.description}
                  </p>
                </Link>
              ))}
            </div>
          </div>

          {/* Help Section */}
          <div className="mt-12 p-6 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
            <h3 className="font-semibold text-gray-900 dark:text-white mb-2">
              Still need help?
            </h3>
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              If you think this is an error or you're looking for something specific, 
              don't hesitate to reach out to our support team.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <a
                href="mailto:support@elimuconnect.ke"
                className="inline-flex items-center justify-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm"
              >
                Contact Support
              </a>
              <Link
                to="/help"
                className="inline-flex items-center justify-center px-4 py-2 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors text-sm"
              >
                Help Center
              </Link>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default NotFound;
