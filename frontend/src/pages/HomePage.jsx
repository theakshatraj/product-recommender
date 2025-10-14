import { Link } from 'react-router-dom';
import { Sparkles, Target, Brain, Search, ArrowRight, Star } from 'lucide-react';

const HomePage = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-blue-50 to-indigo-50">
      {/* Hero Section */}
      <div className="relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 pb-16">
          <div className="text-center">
            <div className="mb-8">
              <div className="inline-flex items-center bg-white/80 backdrop-blur-sm rounded-full px-6 py-3 shadow-lg border border-purple-200 mb-6">
                <Sparkles className="w-5 h-5 text-purple-600 mr-2" />
                <span className="text-purple-700 font-medium">AI-Powered Product Discovery</span>
              </div>
              
              <h1 className="text-5xl md:text-6xl font-bold text-gray-900 mb-6">
                Discover Products
                <span className="block bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
                  Made for You
                </span>
              </h1>
              
              <p className="text-xl text-gray-600 max-w-3xl mx-auto mb-8 leading-relaxed">
                Experience the future of shopping with our intelligent recommendation engine. 
                Get personalized product suggestions powered by advanced AI and machine learning.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
              <Link
                to="/products"
                className="group bg-gradient-to-r from-purple-600 to-blue-600 text-white px-8 py-4 rounded-xl text-lg font-semibold hover:from-purple-700 hover:to-blue-700 transition-all duration-200 transform hover:scale-105 shadow-lg hover:shadow-xl"
              >
                Browse Products
                <ArrowRight className="inline w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
              </Link>
              <Link
                to="/recommendations"
                className="group bg-white text-purple-600 px-8 py-4 rounded-xl text-lg font-semibold border-2 border-purple-600 hover:bg-purple-600 hover:text-white transition-all duration-200 transform hover:scale-105 shadow-lg hover:shadow-xl"
              >
                Get Recommendations
                <Sparkles className="inline w-5 h-5 ml-2 group-hover:rotate-12 transition-transform" />
              </Link>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-4xl mx-auto">
              <div className="bg-white/60 backdrop-blur-sm rounded-xl p-6 shadow-lg border border-purple-100">
                <div className="text-3xl font-bold text-purple-600 mb-2">10K+</div>
                <div className="text-gray-600">Products Available</div>
              </div>
              <div className="bg-white/60 backdrop-blur-sm rounded-xl p-6 shadow-lg border border-blue-100">
                <div className="text-3xl font-bold text-blue-600 mb-2">95%</div>
                <div className="text-gray-600">Recommendation Accuracy</div>
              </div>
              <div className="bg-white/60 backdrop-blur-sm rounded-xl p-6 shadow-lg border border-indigo-100">
                <div className="text-3xl font-bold text-indigo-600 mb-2">1M+</div>
                <div className="text-gray-600">Happy Customers</div>
              </div>
            </div>
          </div>
        </div>

        {/* Background decoration */}
        <div className="absolute inset-0 -z-10">
          <div className="absolute top-20 left-10 w-72 h-72 bg-purple-300 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-pulse"></div>
          <div className="absolute top-40 right-10 w-72 h-72 bg-blue-300 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-pulse" style={{animationDelay: '2s'}}></div>
          <div className="absolute bottom-20 left-1/2 w-72 h-72 bg-indigo-300 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-pulse" style={{animationDelay: '4s'}}></div>
        </div>
      </div>

      {/* Features Section */}
      <div className="py-20 bg-white/50 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              Why Choose Our Platform?
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Advanced technology meets intuitive design to deliver the best shopping experience
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="group bg-white rounded-2xl p-8 shadow-lg hover:shadow-xl transition-all duration-300 border border-gray-100 hover:border-purple-200">
              <div className="w-16 h-16 bg-gradient-to-r from-purple-500 to-purple-600 rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                <Target className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-4">Personalized Recommendations</h3>
              <p className="text-gray-600 leading-relaxed">
                Get product suggestions tailored to your preferences, browsing history, and purchase patterns. 
                Our AI learns from your behavior to deliver increasingly accurate recommendations.
              </p>
            </div>

            <div className="group bg-white rounded-2xl p-8 shadow-lg hover:shadow-xl transition-all duration-300 border border-gray-100 hover:border-blue-200">
              <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-blue-600 rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                <Brain className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-4">AI-Powered Insights</h3>
              <p className="text-gray-600 leading-relaxed">
                Understand why products are recommended with detailed explanations generated by advanced 
                language models. Get insights into product features and compatibility.
              </p>
            </div>

            <div className="group bg-white rounded-2xl p-8 shadow-lg hover:shadow-xl transition-all duration-300 border border-gray-100 hover:border-indigo-200">
              <div className="w-16 h-16 bg-gradient-to-r from-indigo-500 to-indigo-600 rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                <Search className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-4">Smart Discovery</h3>
              <p className="text-gray-600 leading-relaxed">
                Find similar products and discover new categories based on advanced similarity algorithms. 
                Explore products you never knew you needed.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="py-20 bg-gradient-to-r from-purple-600 to-blue-600">
        <div className="max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8">
          <h2 className="text-4xl font-bold text-white mb-6">
            Ready to Discover Your Perfect Products?
          </h2>
          <p className="text-xl text-purple-100 mb-8">
            Join thousands of users who have found their ideal products through our recommendation engine.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              to="/recommendations"
              className="bg-white text-purple-600 px-8 py-4 rounded-xl text-lg font-semibold hover:bg-gray-100 transition-all duration-200 transform hover:scale-105 shadow-lg"
            >
              Start Exploring
            </Link>
            <Link
              to="/products"
              className="bg-transparent border-2 border-white text-white px-8 py-4 rounded-xl text-lg font-semibold hover:bg-white hover:text-purple-600 transition-all duration-200 transform hover:scale-105"
            >
              Browse All Products
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HomePage;

