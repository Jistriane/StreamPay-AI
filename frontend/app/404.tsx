import React from 'react';
export default function NotFoundPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-900">
      <div className="bg-slate-800 p-8 rounded-lg shadow-lg w-full max-w-md text-center">
        <h1 className="text-4xl font-bold text-cyan-400 mb-6">404 - Page not found</h1>
        <p className="text-white mb-4">The page you are looking for does not exist.</p>
        <a href="/" className="text-cyan-500 hover:underline">Return to home</a>
      </div>
    </div>
  );
}