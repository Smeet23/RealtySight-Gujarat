export default function HeroSection() {
  return (
    <div className="bg-gradient-to-r from-blue-600 to-indigo-700 text-white">
      <div className="container mx-auto px-4 py-20">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-5xl font-bold mb-6">
            Gujarat Real Estate Analytics
          </h1>
          <p className="text-xl mb-8 text-blue-100">
            Data-driven insights powered by RERA data to make informed real estate decisions
          </p>
          <div className="flex gap-4 justify-center">
            <a href="/search" className="bg-white text-blue-600 px-8 py-3 rounded-lg font-semibold hover:bg-blue-50 transition inline-block">
              Search Projects
            </a>
            <a href="/analytics/city" className="bg-transparent border-2 border-white px-8 py-3 rounded-lg font-semibold hover:bg-white hover:text-blue-600 transition inline-block">
              City Analytics
            </a>
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-16 max-w-5xl mx-auto">
          <div className="text-center">
            <div className="text-4xl font-bold mb-2">16,027</div>
            <div className="text-blue-100">Total RERA Projects</div>
          </div>
          <div className="text-center">
            <div className="text-4xl font-bold mb-2">78.5%</div>
            <div className="text-blue-100">Avg Booking Rate</div>
          </div>
          <div className="text-center">
            <div className="text-4xl font-bold mb-2">10+</div>
            <div className="text-blue-100">Cities Covered</div>
          </div>
        </div>
        
        <div className="mt-12">
          <p className="text-center text-blue-100 mb-4 text-sm">Quick Access to Popular Cities</p>
          <div className="flex flex-wrap gap-2 justify-center">
            <a href="/city/ahmedabad" className="px-4 py-2 bg-white/20 backdrop-blur text-white rounded-full hover:bg-white/30 transition text-sm font-medium">
              Ahmedabad (4,200+)
            </a>
            <a href="/city/surat" className="px-4 py-2 bg-white/20 backdrop-blur text-white rounded-full hover:bg-white/30 transition text-sm font-medium">
              Surat (2,800+)
            </a>
            <a href="/city/vadodara" className="px-4 py-2 bg-white/20 backdrop-blur text-white rounded-full hover:bg-white/30 transition text-sm font-medium">
              Vadodara (1,900+)
            </a>
            <a href="/city/rajkot" className="px-4 py-2 bg-white/20 backdrop-blur text-white rounded-full hover:bg-white/30 transition text-sm font-medium">
              Rajkot (1,600+)
            </a>
            <a href="/city/gandhinagar" className="px-4 py-2 bg-white/20 backdrop-blur text-white rounded-full hover:bg-white/30 transition text-sm font-medium">
              Gandhinagar (800+)
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}