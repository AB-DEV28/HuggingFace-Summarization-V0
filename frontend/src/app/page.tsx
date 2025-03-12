'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { motion } from 'framer-motion';
import { useRouter } from 'next/navigation';

export default function Home() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();

  if (authLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      <div className="container mx-auto px-4 py-16">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-4xl mx-auto text-center"
        >
          {/* Hero Section */}
          <motion.div
            initial={{ scale: 0.9 }}
            animate={{ scale: 1 }}
            transition={{ duration: 0.5 }}
            className="mb-16"
          >
            <h1 className="text-5xl font-bold mb-6 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              AI-Powered Text Summarization
            </h1>
            <p className="text-xl mb-8 text-gray-600 leading-relaxed">
              Transform lengthy texts into concise, meaningful summaries with the power of artificial intelligence.
            </p>
          </motion.div>

          {/* Features Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
            {[
              {
                title: "Quick & Efficient",
                description: "Get summaries in seconds, saving you valuable time and effort.",
                icon: "⚡"
              },
              {
                title: "AI-Powered",
                description: "Utilizing advanced HuggingFace models for accurate summarization.",
                icon: "🤖"
              },
              {
                title: "Easy to Use",
                description: "Simple interface to get summaries with just a few clicks.",
                icon: "✨"
              }
            ].map((feature, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.2 }}
                className="p-6 bg-white/80 backdrop-blur-sm rounded-xl shadow-xl hover:shadow-2xl transition-all duration-300 hover:-translate-y-1"
              >
                <div className="text-4xl mb-4">{feature.icon}</div>
                <h3 className="text-xl font-semibold mb-3 text-gray-800">{feature.title}</h3>
                <p className="text-gray-600">{feature.description}</p>
              </motion.div>
            ))}
          </div>

          {/* How It Works Section */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6 }}
            className="bg-white/90 backdrop-blur-sm p-12 rounded-2xl shadow-xl mb-16"
          >
            <h2 className="text-3xl font-bold mb-12 text-gray-800">How It Works</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-12 relative">
              {[
                {
                  step: "1",
                  title: "Sign In",
                  description: "Create an account or log in to access the service."
                },
                {
                  step: "2",
                  title: "Paste Text",
                  description: "Input the text you want to summarize."
                },
                {
                  step: "3",
                  title: "Get Summary",
                  description: "Receive a concise summary within seconds."
                }
              ].map((step, index) => (
                <motion.div
                  key={index}
                  whileHover={{ scale: 1.05 }}
                  className="relative pt-8 px-6 pb-6 bg-white/50 rounded-lg"
                >
                  <div className="absolute -top-6 left-1/2 -translate-x-1/2 w-12 h-12 rounded-full bg-gradient-to-r from-blue-500 to-purple-600 text-white flex items-center justify-center font-bold text-xl shadow-lg">
                    {step.step}
                  </div>
                  {index < 2 && (
                    <div className="hidden md:block absolute top-8 right-0 w-full h-0.5 bg-gradient-to-r from-blue-500/20 to-purple-600/20 translate-x-1/2" />
                  )}
                  <div className="text-center">
                    <div className="font-semibold text-xl mb-3 text-gray-800">{step.title}</div>
                    <p className="text-gray-600 leading-relaxed">{step.description}</p>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>

          {/* CTA Section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.8 }}
            className="mt-12"
          >
            {!user ? (
              <div className="space-y-6">
                <p className="text-xl mb-4 text-gray-700">Ready to get started?</p>
                <button 
                  onClick={() => router.push('/login')}
                  className="px-10 py-4 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-full text-lg font-semibold hover:shadow-lg transform hover:-translate-y-1 transition-all duration-300"
                >
                  Sign In to Continue
                </button>
              </div>
            ) : (
              <div className="space-y-6">
                <p className="text-xl mb-4 text-gray-700">Welcome back! Ready to create summaries?</p>
                <button 
                  onClick={() => router.push('/dashboard')}
                  className="px-10 py-4 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-full text-lg font-semibold hover:shadow-lg transform hover:-translate-y-1 transition-all duration-300"
                >
                  Go to Summarizer
                </button>
              </div>
            )}
          </motion.div>
        </motion.div>
      </div>
    </div>
  );
}
