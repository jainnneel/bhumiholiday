export default function LoadingScreen() {
  return (
    <div className="min-h-screen bg-hero flex items-center justify-center">
      <div className="text-center text-white">
        <div className="relative w-20 h-20 mx-auto mb-6">
          <div className="absolute inset-0 border-4 border-white/20 rounded-full" />
          <div className="absolute inset-0 border-4 border-white border-t-transparent rounded-full animate-spin" />
          <div className="absolute inset-4 flex items-center justify-center">
            <i className="fas fa-plane text-white text-xl animate-bounce-slow" />
          </div>
        </div>
        <h2 className="text-xl font-semibold tracking-wide">Bhumi Holiday</h2>
        <p className="text-white/60 text-sm mt-1">Loading...</p>
      </div>
    </div>
  )
}
