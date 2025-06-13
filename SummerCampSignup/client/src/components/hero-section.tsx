import { Link } from "wouter";

export default function HeroSection() {
  return (
    <section className="relative bg-gradient-to-br from-temple-orange via-temple-saffron to-temple-gold text-white overflow-hidden">
      <div className="absolute inset-0 bg-temple-darkblue bg-opacity-80"></div>
      {/* Temple pattern overlay */}
      <div className="absolute inset-0 opacity-10">
        <div className="w-full h-full" style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.4'%3E%3Ccircle cx='30' cy='30' r='4'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
          backgroundSize: '60px 60px'
        }}></div>
      </div>
      
      {/* Decorative elements inspired by temple architecture */}
      <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-temple-orange via-temple-saffron to-temple-gold"></div>
      
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-32">
        <div>
          <div className="mb-6">
            <h1 className="text-4xl md:text-6xl font-bold mb-6 leading-tight">
              Build Our 
              <span className="text-temple-saffron block">Future</span>
              <span className="text-temple-gold block text-3xl md:text-4xl font-semibold">Summer Camp</span>
            </h1>
            
            
          </div>
          
          <div className="flex flex-col sm:flex-row gap-4 mb-8">
            <Link href="/registration">
              <button className="bg-temple-orange hover:bg-opacity-90 text-white font-bold py-4 px-8 rounded-lg text-lg transition-all duration-200 transform hover:scale-105 shadow-lg">
                Register Your Child
              </button>
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
