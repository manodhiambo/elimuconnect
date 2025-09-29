import { Link } from 'react-router-dom';
import { BookOpen, Users, Trophy, MessageSquare, ArrowRight } from 'lucide-react';

export function LandingPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white">
      {/* Navigation */}
      <nav className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <BookOpen className="h-8 w-8 text-blue-600" />
              <span className="ml-2 text-2xl font-bold text-gray-900">ElimuConnect</span>
            </div>
            <div className="flex gap-4">
              <Link
                to="/login"
                className="px-4 py-2 text-blue-600 hover:text-blue-700 font-medium"
              >
                Login
              </Link>
              <Link
                to="/register"
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium"
              >
                Get Started
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="text-center">
          <h1 className="text-5xl font-bold text-gray-900 mb-6">
            Transforming Education in Kenya
          </h1>
          <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
            ElimuConnect bridges the digital divide by providing accessible, quality 
            educational resources to schools across Kenya. Join thousands of students 
            and teachers already benefiting from our platform.
          </p>
          <div className="flex justify-center gap-4">
            <Link
              to="/register"
              className="px-8 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium flex items-center gap-2"
            >
              Get Started <ArrowRight className="h-5 w-5" />
            </Link>

            <a
              href="#features"
              className="px-8 py-3 border-2 border-blue-600 text-blue-600 rounded-lg hover:bg-blue-50 font-medium"
            >
              Learn More
            </a>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div id="features" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <h2 className="text-3xl font-bold text-center text-gray-900 mb-12">
          Why Choose ElimuConnect?
        </h2>
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
          <FeatureCard
            icon={<BookOpen className="h-8 w-8 text-blue-600" />}
            title="Digital Library"
            description="Access thousands of educational resources, textbooks, and learning materials aligned with the Kenyan curriculum."
          />
          <FeatureCard
            icon={<Trophy className="h-8 w-8 text-blue-600" />}
            title="Assessments"
            description="Track progress with online quizzes, assignments, and exams. Get instant feedback and detailed analytics."
          />
          <FeatureCard
            icon={<Users className="h-8 w-8 text-blue-600" />}
            title="Collaborative Learning"
            description="Connect students and teachers in a safe, moderated environment designed for educational excellence."
          />
          <FeatureCard
            icon={<MessageSquare className="h-8 w-8 text-blue-600" />}
            title="Real-time Communication"
            description="Stay connected with announcements, messaging, and virtual classrooms that work even with limited connectivity."
          />
        </div>
      </div>

      {/* Stats Section */}
      <div className="bg-blue-600 text-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-3 gap-8 text-center">
            <StatCard number="500+" label="Schools Connected" />
            <StatCard number="50,000+" label="Active Students" />
            <StatCard number="2,000+" label="Teachers" />
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 text-center">
        <h2 className="text-3xl font-bold text-gray-900 mb-6">
          Ready to Transform Your Learning Experience?
        </h2>
        <p className="text-xl text-gray-600 mb-8">
          Join ElimuConnect today and be part of Kenya's educational revolution.
        </p>
        <Link
          to="/register"
          className="inline-flex items-center gap-2 px-8 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium text-lg"
        >
          Create Free Account <ArrowRight className="h-5 w-5" />
        </Link>
      </div>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <p>&copy; 2025 ElimuConnect. Empowering Education Across Kenya.</p>
        </div>
      </footer>
    </div>
  );
}

function FeatureCard({ icon, title, description }: { icon: React.ReactNode; title: string; description: string }) {
  return (
    <div className="bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow">
      <div className="mb-4">{icon}</div>
      <h3 className="text-xl font-semibold text-gray-900 mb-2">{title}</h3>
      <p className="text-gray-600">{description}</p>
    </div>
  );
}

function StatCard({ number, label }: { number: string; label: string }) {
  return (
    <div>
      <div className="text-4xl font-bold mb-2">{number}</div>
      <div className="text-blue-100">{label}</div>
    </div>
  );
}
