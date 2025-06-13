export default function ProgramOverview() {
  return (
    <section className="py-16 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-temple-darkblue mb-4">Summer Camp Programs</h2>
          <p className="text-lg text-gray-600 max-w-3xl mx-auto">
            Age-appropriate programs that combine cultural learning, educational activities, and community values.
          </p>
        </div>

        <div className="text-center mb-12">
          <div className="bg-gradient-to-r from-temple-orange to-temple-saffron rounded-2xl p-8 text-white max-w-2xl mx-auto">
            <h3 className="text-2xl font-bold mb-4">Build Our Future Summer Camp 2024</h3>
            <p className="text-lg mb-4">Registration Fee: $450</p>
            <p className="text-temple-cream">For children ages 5-15</p>
          </div>
        </div>



        {/* Program Features */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="text-center p-6 bg-white rounded-xl shadow-lg border border-gray-100">
            <div className="w-12 h-12 bg-temple-orange rounded-full flex items-center justify-center mx-auto mb-4">
              <i className="fas fa-users text-white"></i>
            </div>
            <h4 className="font-semibold text-temple-darkblue mb-2">Small Group Ratio</h4>
            <p className="text-sm text-gray-600">Maximum 15 children per counselor for personalized attention</p>
          </div>
          <div className="text-center p-6 bg-white rounded-xl shadow-lg border border-gray-100">
            <div className="w-12 h-12 bg-temple-saffron rounded-full flex items-center justify-center mx-auto mb-4">
              <i className="fas fa-leaf text-white"></i>
            </div>
            <h4 className="font-semibold text-temple-darkblue mb-2">Nutritious Meals</h4>
            <p className="text-sm text-gray-600">Fresh, healthy vegetarian meals and snacks daily</p>
          </div>
          <div className="text-center p-6 bg-white rounded-xl shadow-lg border border-gray-100">
            <div className="w-12 h-12 bg-temple-gold rounded-full flex items-center justify-center mx-auto mb-4">
              <i className="fas fa-graduation-cap text-white"></i>
            </div>
            <h4 className="font-semibold text-temple-darkblue mb-2">Expert Staff</h4>
            <p className="text-sm text-gray-600">Certified teachers and experienced community volunteers</p>
          </div>
          <div className="text-center p-6 bg-white rounded-xl shadow-lg border border-gray-100">
            <div className="w-12 h-12 bg-temple-blue rounded-full flex items-center justify-center mx-auto mb-4">
              <i className="fas fa-shield-alt text-white"></i>
            </div>
            <h4 className="font-semibold text-temple-darkblue mb-2">Safe Environment</h4>
            <p className="text-sm text-gray-600">Background-checked staff and comprehensive safety protocols</p>
          </div>
        </div>
      </div>
    </section>
  );
}
