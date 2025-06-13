import TempleRegistrationForm from "@/components/temple-registration-form";

export default function Registration() {
  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-8">
          <h1 className="text-3xl md:text-4xl font-bold text-temple-darkblue mb-4">Summer Camp Registration</h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Complete your child's registration for Build Our Future Summer Camp 2025. 
            Please fill out all required fields carefully.
          </p>
        </div>
        
        <TempleRegistrationForm />
      </div>
    </div>
  );
}
