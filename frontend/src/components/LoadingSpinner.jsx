const LoadingSpinner = () => {
  return (
    <div className="flex items-center justify-center py-6" role="status" aria-live="polite">
      <div className="w-6 h-6 border-2 border-neutral-300 border-t-primary-600 rounded-full animate-spin" aria-label="Loading" />
      <span className="sr-only">Loading...</span>
    </div>
  );
};

export default LoadingSpinner;

