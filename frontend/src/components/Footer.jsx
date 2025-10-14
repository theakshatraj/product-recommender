const Footer = () => {
  return (
    <footer className="mt-auto bg-white border-t border-gray-200" role="contentinfo">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 text-sm text-neutral-700 flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="text-center sm:text-left">
          <span className="font-heading font-semibold text-neutral-900">ProductAI</span>
          <span className="mx-2">•</span>
          <span>AI-powered product recommender demo</span>
        </div>
        <nav className="flex items-center gap-4" aria-label="Footer">
          <a href="#" className="hover:text-primary-600">Docs</a>
          <a href="#" className="hover:text-primary-600">API</a>
          <a href="#" className="hover:text-primary-600">GitHub</a>
        </nav>
      </div>
    </footer>
  );
};

export default Footer;


