import campPhoto1 from "@assets/Screenshot 2025-06-11 161440_1749672942351.png";

export default function PhotoGallery() {
  return (
    <section className="py-16 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-temple-darkblue mb-4">Our Summer Camp Community</h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            See the joy and learning that happens when children come together in our temple community
          </p>
        </div>
        
        {/* Main featured photo */}
        <div className="mb-12">
          <div className="relative rounded-2xl overflow-hidden shadow-2xl">
            <img 
              src={campPhoto1} 
              alt="Gokuldham Temple Summer Camp - Group photo of children and counselors" 
              className="w-full h-96 object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black from-10% via-transparent to-transparent"></div>
            <div className="absolute bottom-0 left-0 right-0 p-8 text-white">
              <h3 className="text-2xl font-bold mb-2">Build Our Future Summer Camp 2023</h3>
              <p className="text-lg opacity-90">Over 230 children participated in our transformative summer programs</p>
            </div>
          </div>
        </div>
        
        {/* Impact statistics */}
        <div className="grid md:grid-cols-3 gap-8 mb-16">
          <div className="text-center p-8 bg-white rounded-xl shadow-lg">
            <div className="w-16 h-16 bg-temple-orange rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-2xl font-bold text-white">700+</span>
            </div>
            <h3 className="text-xl font-bold text-temple-darkblue mb-2">Potential Participants</h3>
            <p className="text-gray-600">With expanded facilities, we could serve over 700 kids and teens annually</p>
          </div>
          
          <div className="text-center p-8 bg-white rounded-xl shadow-lg">
            <div className="w-16 h-16 bg-temple-saffron rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-2xl font-bold text-white">230</span>
            </div>
            <h3 className="text-xl font-bold text-temple-darkblue mb-2">2023 Campers</h3>
            <p className="text-gray-600">Amazing children joined our summer programs last year</p>
          </div>
          
          <div className="text-center p-8 bg-white rounded-xl shadow-lg">
            <div className="w-16 h-16 bg-temple-gold rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-2xl font-bold text-white">32%</span>
            </div>
            <h3 className="text-xl font-bold text-temple-darkblue mb-2">Current Capacity</h3>
            <p className="text-gray-600">We can only accommodate 32% of demand due to infrastructure limitations</p>
          </div>
        </div>
        
        {/* Call to action */}
        <div className="bg-gradient-to-r from-temple-orange to-temple-saffron rounded-2xl p-8 text-center text-[#0a0a0a]">
          <h3 className="text-2xl font-bold mb-4">Help Us Build Our Future</h3>
          <p className="text-lg mb-6 opacity-90">
            Better facilities would enable us to give kids experiences of a lifetime and serve generations to come. 
            With bigger facilities, we can provide more indoor and outdoor activities that cater to different interests and abilities of the kids.
          </p>
          <button className="bg-temple-darkblue text-white hover:bg-temple-blue font-bold py-4 px-10 rounded-lg transition-colors duration-200 shadow-lg border-2 border-white">
            Support Our Expansion
          </button>
        </div>
      </div>
    </section>
  );
}
