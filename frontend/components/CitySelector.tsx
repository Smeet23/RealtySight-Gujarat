interface CitySelectorProps {
  selectedCity: string;
  onCityChange: (city: string) => void;
}

const cities = [
  "Ahmedabad",
  "Surat",
  "Vadodara",
  "Rajkot",
  "Gandhinagar",
  "Bhavnagar",
  "Jamnagar",
  "Junagadh",
  "Anand",
  "Vapi"
];

export default function CitySelector({ selectedCity, onCityChange }: CitySelectorProps) {
  return (
    <div className="bg-white rounded-lg shadow-md p-6 mb-8">
      <h2 className="text-2xl font-bold mb-4">Select City</h2>
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
        {cities.map((city) => (
          <button
            key={city}
            onClick={() => onCityChange(city)}
            className={`px-4 py-2 rounded-lg font-medium transition ${
              selectedCity === city
                ? "bg-blue-600 text-white"
                : "bg-gray-100 text-gray-700 hover:bg-gray-200"
            }`}
          >
            {city}
          </button>
        ))}
      </div>
    </div>
  );
}