import React from 'react';

const CSStyleTest = () => {
  return (
    <div className="min-h-screen bg-neutral-100 p-8">
      <div className="max-w-4xl mx-auto space-y-8">
        {/* Header */}
        <div className="text-center">
          <h1 className="text-4xl font-heading font-bold text-neutral-900 mb-4">
            CSS Styling Test
          </h1>
          <p className="text-lg text-neutral-700">
            Testing if Tailwind CSS and custom styles are working properly
          </p>
        </div>

        {/* Color Test */}
        <div className="bg-white rounded-lg border border-neutral-200 p-6">
          <h2 className="text-2xl font-heading font-semibold text-neutral-900 mb-4">
            Color System Test
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-primary-600 text-white p-4 rounded-lg text-center">
              Primary Blue 600
            </div>
            <div className="bg-accent-500 text-white p-4 rounded-lg text-center">
              Accent Amber 500
            </div>
            <div className="bg-neutral-700 text-white p-4 rounded-lg text-center">
              Neutral 700
            </div>
          </div>
        </div>

        {/* Typography Test */}
        <div className="bg-white rounded-lg border border-neutral-200 p-6">
          <h2 className="text-2xl font-heading font-semibold text-neutral-900 mb-4">
            Typography Test
          </h2>
          <div className="space-y-3">
            <h1 className="text-3xl font-heading font-bold text-neutral-900">
              Heading 1 - DM Sans Bold
            </h1>
            <h2 className="text-2xl font-heading font-semibold text-neutral-900">
              Heading 2 - DM Sans Semibold
            </h2>
            <p className="text-base text-neutral-700 leading-relaxed">
              Body text - Inter Regular with relaxed line height
            </p>
            <p className="text-sm text-neutral-700">
              Small text - Inter Regular 14px minimum
            </p>
          </div>
        </div>

        {/* Button Test */}
        <div className="bg-white rounded-lg border border-neutral-200 p-6">
          <h2 className="text-2xl font-heading font-semibold text-neutral-900 mb-4">
            Button Styles Test
          </h2>
          <div className="flex flex-wrap gap-4">
            <button className="bg-primary-600 text-white px-6 py-2 rounded-lg hover:bg-primary-700 transition-colors">
              Primary Button
            </button>
            <button className="bg-neutral-100 text-neutral-700 px-6 py-2 rounded-lg hover:bg-neutral-200 transition-colors border border-neutral-300">
              Secondary Button
            </button>
            <button className="bg-accent-500 text-white px-6 py-2 rounded-lg hover:bg-accent-600 transition-colors">
              Accent Button
            </button>
          </div>
        </div>

        {/* Layout Test */}
        <div className="bg-white rounded-lg border border-neutral-200 p-6">
          <h2 className="text-2xl font-heading font-semibold text-neutral-900 mb-4">
            Layout & Spacing Test
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div className="bg-neutral-50 p-4 rounded-lg border border-neutral-200">
              <h3 className="font-heading font-semibold text-neutral-900 mb-2">Card 1</h3>
              <p className="text-sm text-neutral-700">Testing grid layout and spacing</p>
            </div>
            <div className="bg-neutral-50 p-4 rounded-lg border border-neutral-200">
              <h3 className="font-heading font-semibold text-neutral-900 mb-2">Card 2</h3>
              <p className="text-sm text-neutral-700">Consistent padding and margins</p>
            </div>
            <div className="bg-neutral-50 p-4 rounded-lg border border-neutral-200">
              <h3 className="font-heading font-semibold text-neutral-900 mb-2">Card 3</h3>
              <p className="text-sm text-neutral-700">Responsive grid system</p>
            </div>
          </div>
        </div>

        {/* Focus States Test */}
        <div className="bg-white rounded-lg border border-neutral-200 p-6">
          <h2 className="text-2xl font-heading font-semibold text-neutral-900 mb-4">
            Focus States Test
          </h2>
          <div className="space-y-4">
            <input 
              type="text" 
              placeholder="Test input with focus ring"
              className="w-full px-3 py-2 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-600 focus:border-transparent"
            />
            <button className="bg-primary-600 text-white px-6 py-2 rounded-lg hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-primary-600 focus:ring-offset-2 transition-colors">
              Focusable Button
            </button>
          </div>
        </div>

        {/* Status */}
        <div className="bg-green-50 border border-green-200 rounded-lg p-6">
          <h3 className="text-lg font-heading font-semibold text-green-800 mb-2">
            ✅ CSS Styling Status
          </h3>
          <p className="text-green-700">
            If you can see this page with proper styling, colors, typography, and layout, 
            then Tailwind CSS and custom styles are working correctly!
          </p>
        </div>
      </div>
    </div>
  );
};

export default CSStyleTest;
