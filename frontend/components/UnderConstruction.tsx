interface UnderConstructionProps {
  feature: string;
  message?: string;
  icon?: string;
}

export default function UnderConstruction({ 
  feature, 
  message = "This feature is coming soon", 
  icon = "🚧" 
}: UnderConstructionProps) {
  return (
    <div className="flex flex-col items-center justify-center p-12 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
      <div className="text-6xl mb-4">{icon}</div>
      <h3 className="text-xl font-semibold text-gray-700 mb-2">{feature}</h3>
      <p className="text-gray-500 text-center max-w-md">{message}</p>
      <div className="mt-6 px-4 py-2 bg-yellow-100 text-yellow-800 rounded-full text-sm font-medium">
        Under Construction
      </div>
    </div>
  );
}