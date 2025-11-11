import { MapPin } from 'lucide-react';

const FakeMap = ({ bikes, onBikeSelect }) => {
  return (
    <div className="relative w-full aspect-[4/3] bg-secondary rounded-lg border border-border overflow-hidden shadow-lg">
      {/* Campus map background */}
      <div 
        className="absolute inset-0 bg-cover bg-center opacity-40"
        style={{ backgroundImage: 'url(/vit-campus-map.jpg)' }}
      />
      
      {/* Overlay gradient for better contrast */}
      <div className="absolute inset-0 bg-gradient-to-b from-background/20 to-background/40" />
      
      {/* Bike markers */}
      {bikes.map((bike) => (
        <button
          key={bike.id}
          onClick={() => onBikeSelect(bike)}
          className="absolute transform -translate-x-1/2 -translate-y-1/2 transition-transform hover:scale-125 focus:scale-125 focus:outline-none"
          style={{ left: `${bike.x}%`, top: `${bike.y}%` }}
          aria-label={`Bike ${bike.id} at ${bike.location}`}
        >
          <div className="relative">
            <div className="absolute inset-0 bg-primary rounded-full animate-ping opacity-30" />
            <MapPin className="relative text-primary fill-primary" size={32} />
          </div>
        </button>
      ))}
      
      {/* Legend */}
      <div className="absolute bottom-3 left-3 bg-card/95 backdrop-blur-md px-4 py-2.5 rounded-lg shadow-xl border border-border">
        <div className="flex items-center gap-2">
          <MapPin className="text-primary fill-primary" size={18} />
          <span className="text-foreground font-medium text-sm">Available Bikes</span>
        </div>
      </div>
      
      {/* Campus Label */}
      <div className="absolute top-3 left-3 bg-card/95 backdrop-blur-md px-4 py-2 rounded-lg shadow-xl border border-border">
        <h3 className="font-display font-semibold text-primary text-sm">VIT Chennai Campus</h3>
      </div>
    </div>
  );
};

export default FakeMap;
