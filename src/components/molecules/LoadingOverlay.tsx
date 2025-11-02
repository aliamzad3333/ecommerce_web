const LoadingOverlay = () => {
  return (
    <div className="fixed inset-0 bg-black/60 z-[100] flex items-center justify-center backdrop-blur-sm">
      <div className="bg-white rounded-2xl p-10 shadow-2xl flex flex-col items-center gap-6 animate-slideUp">
        {/* Spinner */}
        <div className="relative w-24 h-24">
          <div className="absolute inset-0 border-4 border-orange-200 rounded-full"></div>
          <div className="absolute inset-0 border-4 border-orange-600 rounded-full border-t-transparent animate-spin"></div>
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-12 h-12 border-4 border-orange-300 rounded-full border-t-transparent animate-spin" style={{ animationDirection: 'reverse', animationDuration: '0.8s' }}></div>
          </div>
        </div>
        
        {/* Text */}
        <div className="text-center">
          <h3 className="text-2xl font-bold text-gray-900 mb-2">
            Processing Your Order
          </h3>
          <p className="text-gray-600 text-lg">
            Please wait while we confirm your order...
          </p>
          <div className="mt-4 flex items-center justify-center gap-1">
            <div className="w-2 h-2 bg-orange-500 rounded-full animate-bounce" style={{ animationDelay: '0s' }}></div>
            <div className="w-2 h-2 bg-orange-500 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
            <div className="w-2 h-2 bg-orange-500 rounded-full animate-bounce" style={{ animationDelay: '0.4s' }}></div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default LoadingOverlay

