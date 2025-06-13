import HeroSection from "@/components/hero-section";
import PhotoGallery from "@/components/photo-gallery";

import images from "@assets/images.jpg";

export default function Home() {
  return (
    <div>
      <HeroSection />
      <PhotoGallery />
      {/* Footer */}
      <footer className="bg-temple-darkblue text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center space-x-3 mb-4">
                <img 
                  src={images} 
                  alt="Gokuldham Temple Logo" 
                  className="h-10 w-auto"
                />
                <div>
                  <h3 className="text-xl font-bold">Gokuldham Temple</h3>
                </div>
              </div>
              <p className="text-gray-300 text-sm">Nurturing young minds through cultural heritage and community values.</p>
            </div>
            
            
            <div>
              <h4 className="text-lg font-semibold mb-4">Follow Us</h4>
              <div className="flex space-x-4">
                <a href="#" className="text-gray-300 hover:text-temple-orange"><i className="fab fa-facebook text-xl"></i></a>
                <a href="#" className="text-gray-300 hover:text-temple-orange"><i className="fab fa-instagram text-xl"></i></a>
                <a href="#" className="text-gray-300 hover:text-temple-orange"><i className="fab fa-youtube text-xl"></i></a>
                <a href="#" className="text-gray-300 hover:text-temple-orange"><i className="fab fa-twitter text-xl"></i></a>
              </div>
            </div>
          </div>
          <div className="border-t border-gray-600 mt-8 pt-8 text-center text-sm text-gray-300">
            <p>© 2025 Gokuldham Temple. All rights reserved. Build Our Future Summer Camp.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
