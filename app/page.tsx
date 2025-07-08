'use client'
import React, { useState, useEffect } from 'react';
import { Brain, Code, Users, Zap, CheckCircle, ArrowRight, BookOpen, Target, MessageCircle, Star, Play, ChevronDown } from 'lucide-react';
import Link from 'next/link';

const SparkLanding = () => {
  const [isVisible, setIsVisible] = useState(false);
  const [activeFeature, setActiveFeature] = useState(0);

  useEffect(() => {
    setIsVisible(true);
    const interval = setInterval(() => {
      setActiveFeature(prev => (prev + 1) % 4);
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  const features = [
    {
      icon: <Brain className="w-6 h-6" />,
      title: "AI-Powered Explanations",
      description: "Get instant, personalized explanations for any DSA concept"
    },
    {
      icon: <Code className="w-6 h-6" />,
      title: "Code Walkthrough",
      description: "Step-by-step code analysis with complexity breakdowns"
    },
    {
      icon: <Target className="w-6 h-6" />,
      title: "Adaptive Learning",
      description: "Personalized learning path based on your progress"
    },
    {
      icon: <MessageCircle className="w-6 h-6" />,
      title: "Interactive Chat",
      description: "Ask questions anytime, get answers in your learning style"
    }
  ];

  const testimonials = [
    {
      name: "Sarah Chen",
      role: "CS Student",
      content: "Finally understood dynamic programming! Spark explains it so clearly.",
      rating: 5
    },
    {
      name: "Alex Rodriguez",
      role: "Software Engineer",
      content: "Cracked my FAANG interview thanks to Spark's personalized practice.",
      rating: 5
    },
    {
      name: "Priya Patel",
      role: "Bootcamp Graduate",
      content: "The best DSA tutor I've ever had. Available 24/7 and never judges!",
      rating: 5
    }
  ];

  return (
    <div className="min-h-screen bg-white dark:bg-black text-zinc-800 dark:text-zinc-300 transition-colors overflow-hidden">
      {/* Animated Background Elements */}
      <div className="fixed inset-0 opacity-5 dark:opacity-10">
        <div className="absolute inset-0 bg-gradient-to-br from-blue-50 via-purple-50 to-zinc-50 dark:from-blue-950/20 dark:via-purple-950/20 dark:to-zinc-950"></div>
        <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-blue-100 dark:bg-blue-900/20 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-purple-100 dark:bg-purple-900/10 rounded-full blur-3xl animate-bounce"></div>
      </div>

      {/* Hero Section */}
      <section className="relative z-10 px-4 py-40">
        <div className="max-w-6xl mx-auto text-center">
          <div className={`transition-all duration-1000 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
            <div className="inline-flex items-center space-x-2 bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-800 rounded-full px-4 py-2 mb-6">
              <Zap className="w-4 h-4 text-blue-600 dark:text-blue-400" />
              <span className="text-sm text-blue-800 dark:text-blue-200 font-medium">AI-Powered DSA Learning</span>
            </div>
            
            <h1 className="text-4xl md:text-7xl font-bold mb-6 text-zinc-900 dark:text-zinc-100 leading-tight tracking-tight">
              Master DSA with
              <br />
              <span className="relative">
                Your AI Tutor Spark
                <div className="absolute -bottom-2 left-0 right-0 h-1 bg-gradient-to-r from-blue-600 via-purple-600 to-blue-600 rounded-full"></div>
              </span>
            </h1>
            
            <p className="text-lg md:text-xl text-zinc-600 dark:text-zinc-400 mb-10 max-w-3xl mx-auto leading-relaxed">
              Learn Data Structures & Algorithms with personalized explanations, 
              instant feedback, and adaptive learning paths.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-12">
                <Link href={'/chat'}>
                  <button className="group bg-zinc-900 dark:bg-zinc-100 text-white dark:text-black px-8 py-3 rounded-xl text-lg font-semibold hover:bg-zinc-800 dark:hover:bg-zinc-200 transition-all transform hover:scale-105 shadow-xl flex items-center space-x-3">
                    <MessageCircle className="w-5 h-5" />
                      <span>Start Learning</span>
                    <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition" />
                  </button>
                </Link>
              <Link href={"https://algo-journey-3siz.vercel.app/"} target='_blank' rel="noopener noreferrer">
                <button className="group border-2 border-zinc-300 dark:border-zinc-700 text-zinc-700 dark:text-zinc-300 px-8 py-3 rounded-xl text-lg font-semibold hover:bg-zinc-50 dark:hover:bg-zinc-900 transition-all flex items-center space-x-3">
                  <Play className="w-5 h-5" />
                  <span>AlgoJourney</span>
                </button>
              </Link>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-3xl mx-auto">
              <div className="text-center group">
                <div className="text-3xl font-bold text-zinc-900 dark:text-zinc-100 mb-1 group-hover:scale-110 transition">10K+</div>
                <div className="text-zinc-500 dark:text-zinc-400 font-medium">Students Helped</div>
              </div>
              <div className="text-center group">
                <div className="text-3xl font-bold text-zinc-900 dark:text-zinc-100 mb-1 group-hover:scale-110 transition">500+</div>
                <div className="text-zinc-500 dark:text-zinc-400 font-medium">DSA Problems</div>
              </div>
              <div className="text-center group">
                <div className="text-3xl font-bold text-zinc-900 dark:text-zinc-100 mb-1 group-hover:scale-110 transition">24/7</div>
                <div className="text-zinc-500 dark:text-zinc-400 font-medium">AI Availability</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="relative z-10 px-4 py-16 bg-zinc-50 dark:bg-zinc-900/30 border-y border-zinc-200 dark:border-zinc-800">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4 text-zinc-900 dark:text-zinc-100">
              Everything You Need to Master DSA
            </h2>
            <p className="text-lg text-zinc-600 dark:text-zinc-400 max-w-2xl mx-auto">
              Get personalized tutoring with comprehensive DSA resources
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-16">
            {features.map((feature, index) => (
              <div
                key={index}
                className={`group p-6 rounded-2xl border transition-all duration-500 cursor-pointer ${
                  activeFeature === index
                    ? 'bg-blue-50 dark:bg-blue-950/20 border-blue-200 dark:border-blue-800 scale-105 shadow-lg'
                    : 'bg-white dark:bg-zinc-800/50 border-zinc-200 dark:border-zinc-700 hover:bg-zinc-50 dark:hover:bg-zinc-800'
                }`}
                onMouseEnter={() => setActiveFeature(index)}
              >
                <div className={`mb-4 group-hover:scale-110 transition-transform ${
                  activeFeature === index ? 'text-blue-600 dark:text-blue-400' : 'text-zinc-700 dark:text-zinc-300'
                }`}>
                  {feature.icon}
                </div>
                <h3 className="text-lg font-bold mb-2 text-zinc-900 dark:text-zinc-100">{feature.title}</h3>
                <p className="text-zinc-600 dark:text-zinc-400 text-sm leading-relaxed">{feature.description}</p>
              </div>
            ))}
          </div>

          {/* Interactive Demo */}
          <div className="bg-white dark:bg-zinc-800 rounded-2xl p-8 border border-zinc-200 dark:border-zinc-700 shadow-xl">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
              <div>
                <h3 className="text-2xl font-bold mb-6 text-zinc-900 dark:text-zinc-100">Interactive Learning Experience</h3>
                <div className="space-y-4">
                  <div className="flex items-start space-x-3">
                    <div className="w-5 h-5 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mt-0.5 shrink-0">
                      <CheckCircle className="w-3 h-3 text-green-600 dark:text-green-400" />
                    </div>
                    <div className="text-sm">
                      <span className="font-semibold text-zinc-900 dark:text-zinc-100">Instant Code Reviews</span>
                      <span className="text-zinc-600 dark:text-zinc-400 ml-1">- Get immediate feedback on your solutions</span>
                    </div>
                  </div>
                  <div className="flex items-start space-x-3">
                    <div className="w-5 h-5 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mt-0.5 shrink-0">
                      <CheckCircle className="w-3 h-3 text-green-600 dark:text-green-400" />
                    </div>
                    <div className="text-sm">
                      <span className="font-semibold text-zinc-900 dark:text-zinc-100">Complexity Analysis</span>
                      <span className="text-zinc-600 dark:text-zinc-400 ml-1">- Understand time and space complexity</span>
                    </div>
                  </div>
                  <div className="flex items-start space-x-3">
                    <div className="w-5 h-5 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mt-0.5 shrink-0">
                      <CheckCircle className="w-3 h-3 text-green-600 dark:text-green-400" />
                    </div>
                    <div className="text-sm">
                      <span className="font-semibold text-zinc-900 dark:text-zinc-100">Personalized Hints</span>
                      <span className="text-zinc-600 dark:text-zinc-400 ml-1">- Get just the right amount of help</span>
                    </div>
                  </div>
                </div>
              </div>
              <div className="bg-zinc-900 dark:bg-zinc-950 rounded-xl p-6 border border-zinc-700 font-mono text-sm">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex space-x-2">
                    <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                    <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
                    <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                  </div>
                  <div className="text-zinc-400 text-xs">Chat with Spark</div>
                </div>
                <div className="space-y-3">
                  <div className="flex items-start space-x-3">
                    <div className="w-6 h-6 bg-blue-600 rounded-full flex items-center justify-center shrink-0">
                      <span className="text-white text-xs font-bold">U</span>
                    </div>
                    <div className="text-zinc-300 text-sm">I don't understand binary search...</div>
                  </div>
                  <div className="flex items-start space-x-3">
                    <div className="w-6 h-6 bg-zinc-700 rounded-full flex items-center justify-center shrink-0">
                      <Zap className="w-3 h-3 text-zinc-300" />
                    </div>
                    <div className="text-zinc-300 text-sm">
                      Let's break it down! Think of binary search like finding a word in a dictionary. You don't start from page 1, right? You open to the middle and...
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section id="how-it-works" className="relative z-10 px-4 py-16">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4 text-zinc-900 dark:text-zinc-100">How It Works</h2>
            <p className="text-lg text-zinc-600 dark:text-zinc-400">Simple, effective, personalized learning in 3 steps</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center group">
              <div className="w-16 h-16 bg-zinc-900 dark:bg-zinc-100 rounded-xl flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform shadow-lg">
                <MessageCircle className="w-8 h-8 text-white dark:text-black" />
              </div>
              <div className="bg-zinc-50 dark:bg-zinc-900/50 p-6 rounded-xl border border-zinc-200 dark:border-zinc-800">
                <h3 className="text-xl font-bold mb-3 text-zinc-900 dark:text-zinc-100">1. Ask Anything</h3>
                <p className="text-zinc-600 dark:text-zinc-400 text-sm leading-relaxed">Ask about any DSA concept, problem, or code. No question is too basic or complex.</p>
              </div>
            </div>

            <div className="text-center group">
              <div className="w-16 h-16 bg-zinc-900 dark:bg-zinc-100 rounded-xl flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform shadow-lg">
                <Brain className="w-8 h-8 text-white dark:text-black" />
              </div>
              <div className="bg-zinc-50 dark:bg-zinc-900/50 p-6 rounded-xl border border-zinc-200 dark:border-zinc-800">
                <h3 className="text-xl font-bold mb-3 text-zinc-900 dark:text-zinc-100">2. Get Personalized Help</h3>
                <p className="text-zinc-600 dark:text-zinc-400 text-sm leading-relaxed">Receive explanations tailored to your learning style and current skill level.</p>
              </div>
            </div>

            <div className="text-center group">
              <div className="w-16 h-16 bg-zinc-900 dark:bg-zinc-100 rounded-xl flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform shadow-lg">
                <Target className="w-8 h-8 text-white dark:text-black" />
              </div>
              <div className="bg-zinc-50 dark:bg-zinc-900/50 p-6 rounded-xl border border-zinc-200 dark:border-zinc-800">
                <h3 className="text-xl font-bold mb-3 text-zinc-900 dark:text-zinc-100">3. Master Concepts</h3>
                <p className="text-zinc-600 dark:text-zinc-400 text-sm leading-relaxed">Practice with guided exercises and build confidence through understanding.</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section id="testimonials" className="relative z-10 px-4 py-16 bg-zinc-50 dark:bg-zinc-900/30 border-y border-zinc-200 dark:border-zinc-800">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4 text-zinc-900 dark:text-zinc-100">What Students Say</h2>
            <p className="text-lg text-zinc-600 dark:text-zinc-400">Join thousands of students who've mastered DSA with Spark</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {testimonials.map((testimonial, index) => (
              <div key={index} className="bg-white dark:bg-zinc-800 rounded-xl p-6 border border-zinc-200 dark:border-zinc-700 hover:shadow-lg transition-all transform hover:-translate-y-1">
                <div className="flex items-center mb-4">
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <Star key={i} className="w-4 h-4 text-yellow-500 fill-current" />
                  ))}
                </div>
                <blockquote className="text-zinc-700 dark:text-zinc-300 mb-4 text-sm italic leading-relaxed">
                  &quot;{testimonial.content}&quot;
                </blockquote>
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-zinc-200 dark:bg-zinc-700 rounded-full flex items-center justify-center">
                    <span className="text-zinc-700 dark:text-zinc-300 font-bold text-sm">
                      {testimonial.name.charAt(0)}
                    </span>
                  </div>
                  <div>
                    <div className="font-bold text-zinc-900 dark:text-zinc-100 text-sm">{testimonial.name}</div>
                    <div className="text-zinc-500 dark:text-zinc-400 text-xs">{testimonial.role}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="relative z-10 px-4 py-16">
        <div className="max-w-4xl mx-auto text-center">
          <div className="bg-white dark:bg-zinc-900 rounded-2xl p-12 border border-zinc-200 dark:border-zinc-800 shadow-xl">
            <h2 className="text-3xl md:text-4xl font-bold mb-4 text-zinc-900 dark:text-zinc-100">
              Ready to Master DSA?
            </h2>
            <p className="text-lg text-zinc-600 dark:text-zinc-400 mb-8 leading-relaxed">
              Start your personalized learning journey today. No setup required, just start chatting!
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <button className="group bg-zinc-900 dark:bg-zinc-100 text-white dark:text-black px-10 py-4 rounded-xl text-lg font-semibold hover:bg-zinc-800 dark:hover:bg-zinc-200 transition-all transform hover:scale-105 shadow-lg flex items-center space-x-3">
                <MessageCircle className="w-5 h-5" />
                <span>Start Learning Now</span>
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition" />
              </button>
              <div className="text-zinc-500 dark:text-zinc-400 text-sm">
                ✨ Free to start • No credit card required
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="relative z-10 px-4 py-12 border-t border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900/50">
        <div className="max-w-6xl mx-auto">
          <div className="flex flex-col items-center text-center mb-6">
            <div className="flex items-center space-x-3 mb-3">
              <div className="w-8 h-8 bg-zinc-900 dark:bg-zinc-100 rounded-lg flex items-center justify-center">
                <Zap className="w-5 h-5 text-white dark:text-black" />
              </div>
              <span className="text-xl font-bold text-zinc-900 dark:text-zinc-100">Spark</span>
            </div>
            <p className="text-zinc-600 dark:text-zinc-400 text-sm mb-4">Your AI-powered DSA learning companion</p>
          </div>
          <div className="flex flex-wrap items-center justify-center gap-6 text-sm text-zinc-500 dark:text-zinc-400">
            <a href="#" className="hover:text-zinc-700 dark:hover:text-zinc-300 transition-colors">Privacy Policy</a>
            <a href="#" className="hover:text-zinc-700 dark:hover:text-zinc-300 transition-colors">Terms of Service</a>
            <a href="#" className="hover:text-zinc-700 dark:hover:text-zinc-300 transition-colors">Contact</a>
            <a href="#" className="hover:text-zinc-700 dark:hover:text-zinc-300 transition-colors">Documentation</a>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default SparkLanding;