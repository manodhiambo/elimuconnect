import React from 'react';
import { Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { 
  BookOpen, 
  Users, 
  Award, 
  MessageCircle, 
  Download, 
  Play,
  ArrowRight,
  CheckCircle,
  Star
} from 'lucide-react';

const LandingPage = () => {
  const features = [
    {
      icon: BookOpen,
      title: "Digital Library",
      description: "Access thousands of educational books and resources from top publishers"
    },
    {
      icon: Award,
      title: "Past Papers",
      description: "Complete collection of KNEC past papers with marking schemes"
    },
    {
      icon: MessageCircle,
      title: "Discussion Forums",
      description: "Connect with teachers and peers for collaborative learning"
    },
    {
      icon: Users,
      title: "Study Groups",
      description: "Join or create study groups with students in your area"
    }
  ];

  const testimonials = [
    {
      name: "Mary Wanjiku",
      role: "Form 4 Student",
      school: "Alliance High School",
      content: "ElimuConnect helped me improve my grades significantly. The past papers and discussion forums are amazing!",
      rating: 5
    },
    {
      name: "James Mwangi",
      role: "Mathematics Teacher",
      school: "Starehe Boys Centre",
      content: "As a teacher, I love how I can interact with students and share resources easily on this platform.",
      rating: 5
    },
    {
      name: "Grace Akinyi",
      role: "Class 8 Student",
      school: "Olympic Primary School",
      content: "The digital library has so many books that help me with my studies. I can even read offline!",
      rating: 5
    }
  ];

  const stats = [
    { number: "50,000+", label: "Active Students" },
    { number: "2,000+", label: "Teachers" },
    { number: "500+", label: "Schools" },
    { number: "10,000+", label: "Resources" }
  ];

  return (
    <>
      <Helmet>
        <title>ElimuConnect - Connecting Kenyan Students with Quality Education</title>
        <meta name="description" content="Join Kenya's premier educational platform. Access digital books, past papers, connect with teachers and students across the country." />
      </Helmet>

      <div className="min-h-screen bg-white">
        {/* Navigation */}
        <nav className="bg-white shadow-sm border-b">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center h-16">
              <div className="flex items-center space-x-2">
                <BookOpen className="h-8 w-8 text-blue-600" />
                <span className="text-xl font-bold text-gray-900">ElimuConnect</span>
              </div>
              <div className="flex items-center space-x-4">
                <Link
                  to="/login"
                  className="text-gray-600 hover:text-gray-900 px-3 py-2 rounded-md text-sm font-medium"
                >
                  Login
                </Link>
                <Link
                  to="/register"
                  className="bg-blue-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-blue-700 transition-colors"
                >
                  Get Started
                </Link>
              </div>
            </div>
          </div>
        </nav>

        {/* Hero Section */}
        <section className="relative bg-gradient-to-r from-blue-600 to-blue-800 text-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
              <div>
                <h1 className="text-4xl md:text-6xl font-bold leading-tight mb-6">
                  Connect. Learn. <span className="text-blue-200">Excel.</span>
                </h1>
                <p className="text-xl text-blue-100 mb-8 leading-relaxed">
                  Join Kenya's premier educational platform connecting students, teachers, and schools. 
                  Access quality resources, collaborate with peers, and achieve academic excellence.
                </p>
                <div className="flex flex-col sm:flex-row gap-4">
                  <Link
                    to="/register"
                    className="bg-white text-blue-600 px-8 py-3 rounded-lg font-semibold hover:bg-blue-50 transition-colors inline-flex items-center justify-center"
                  >
                    Join Free Today
                    <ArrowRight className="ml-2 h-5 w-5" />
                  </Link>
                  <button className="border border-white text-white px-8 py-3 rounded-lg font-semibold hover:bg-white hover:text-blue-600 transition-colors inline-flex items-center justify-center">
                    <Play className="mr-2 h-5 w-5" />
                    Watch Demo
                  </button>
                </div>
              </div>
              <div className="hidden lg:block">
                <div className="relative">
                  <div className="bg-white rounded-lg shadow-2xl p-6 transform rotate-3">
                    <div className="bg-blue-50 rounded-lg p-4 mb-4">
                      <div className="flex items-center space-x-3 mb-3">
                        <div className="w-8 h-8 bg-blue-600 rounded-full"></div>
                        <div>
                          <div className="w-20 h-3 bg-gray-300 rounded"></div>
                          <div className="w-16 h-2 bg-gray-200 rounded mt-1"></div>
                        </div>
                      </div>
                      <div className="space-y-2">
                        <div className="w-full h-2 bg-gray-200 rounded"></div>
                        <div className="w-4/5 h-2 bg-gray-200 rounded"></div>
                        <div className="w-3/5 h-2 bg-gray-200 rounded"></div>
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <div className="bg-green-50 p-3 rounded text-center">
                        <BookOpen className="h-6 w-6 text-green-600 mx-auto mb-1" />
                        <div className="text-xs text-gray-600">Library</div>
                      </div>
                      <div className="bg-purple-50 p-3 rounded text-center">
                        <Award className="h-6 w-6 text-purple-600 mx-auto mb-1" />
                        <div className="text-xs text-gray-600">Papers</div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Stats Section */}
        <section className="py-16 bg-gray-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
              {stats.map((stat, index) => (
                <div key={index} className="text-center">
                  <div className="text-3xl md:text-4xl font-bold text-blue-600 mb-2">
                    {stat.number}
                  </div>
                  <div className="text-gray-600">{stat.label}</div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section className="py-20">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
                Everything You Need to Succeed
              </h2>
              <p className="text-xl text-gray-600 max-w-3xl mx-auto">
                Our comprehensive platform provides all the tools and resources you need 
                for academic success in the Kenyan education system.
              </p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
              {features.map((feature, index) => (
                <div key={index} className="bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition-shadow">
                  <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-4">
                    <feature.icon className="h-6 w-6 text-blue-600" />
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">
                    {feature.title}
                  </h3>
                  <p className="text-gray-600 leading-relaxed">
                    {feature.description}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Testimonials Section */}
        <section className="py-20 bg-gray-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
                What Our Users Say
              </h2>
              <p className="text-xl text-gray-600">
                Join thousands of students and teachers who trust ElimuConnect
              </p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {testimonials.map((testimonial, index) => (
                <div key={index} className="bg-white rounded-xl shadow-lg p-6">
                  <div className="flex items-center mb-4">
                    {[...Array(testimonial.rating)].map((_, i) => (
                      <Star key={i} className="h-5 w-5 text-yellow-400 fill-current" />
                    ))}
                  </div>
                  <p className="text-gray-700 mb-6 leading-relaxed">
                    "{testimonial.content}"
                  </p>
                  <div>
                    <div className="font-semibold text-gray-900">{testimonial.name}</div>
                    <div className="text-sm text-gray-600">{testimonial.role}</div>
                    <div className="text-sm text-blue-600">{testimonial.school}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-20 bg-blue-600">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
              Ready to Transform Your Learning?
            </h2>
            <p className="text-xl text-blue-100 mb-8 max-w-2xl mx-auto">
              Join ElimuConnect today and connect with Kenya's largest educational community.
            </p>
            <Link
              to="/register"
              className="bg-white text-blue-600 px-8 py-3 rounded-lg font-semibold hover:bg-blue-50 transition-colors inline-flex items-center"
            >
              Get Started for Free
              <ArrowRight className="ml-2 h-5 w-5" />
            </Link>
          </div>
        </section>

        {/* Footer */}
        <footer className="bg-gray-900 text-white py-12">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
              <div>
                <div className="flex items-center space-x-2 mb-4">
                  <BookOpen className="h-6 w-6 text-blue-400" />
                  <span className="text-lg font-bold">ElimuConnect</span>
                </div>
                <p className="text-gray-400 leading-relaxed">
                  Connecting Kenyan students with quality education resources and opportunities.
                </p>
              </div>
              
              <div>
                <h3 className="font-semibold mb-4">Platform</h3>
                <ul className="space-y-2 text-gray-400">
                  <li><a href="#" className="hover:text-white transition-colors">Digital Library</a></li>
                  <li><a href="#" className="hover:text-white transition-colors">Past Papers</a></li>
                  <li><a href="#" className="hover:text-white transition-colors">Discussion Forums</a></li>
                  <li><a href="#" className="hover:text-white transition-colors">Study Groups</a></li>
                </ul>
              </div>
              
              <div>
                <h3 className="font-semibold mb-4">Support</h3>
                <ul className="space-y-2 text-gray-400">
                  <li><a href="#" className="hover:text-white transition-colors">Help Center</a></li>
                  <li><a href="#" className="hover:text-white transition-colors">Contact Us</a></li>
                  <li><a href="#" className="hover:text-white transition-colors">Privacy Policy</a></li>
                  <li><a href="#" className="hover:text-white transition-colors">Terms of Service</a></li>
                </ul>
              </div>
              
              <div>
                <h3 className="font-semibold mb-4">Connect</h3>
                <ul className="space-y-2 text-gray-400">
                  <li><a href="#" className="hover:text-white transition-colors">Twitter</a></li>
                  <li><a href="#" className="hover:text-white transition-colors">Facebook</a></li>
                  <li><a href="#" className="hover:text-white transition-colors">Instagram</a></li>
                  <li><a href="#" className="hover:text-white transition-colors">YouTube</a></li>
                </ul>
              </div>
            </div>
            
            <div className="border-t border-gray-800 mt-8 pt-8 text-center text-gray-400">
              <p>&copy; 2024 ElimuConnect. All rights reserved.</p>
            </div>
          </div>
        </footer>
      </div>
    </>
  );
};

export default LandingPage;
