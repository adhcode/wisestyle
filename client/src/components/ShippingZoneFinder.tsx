'use client';

import { useState } from 'react';
import { findShippingZoneByArea, shippingMethods } from '@/data/shippingMethods';
import { Search } from 'lucide-react';

interface ShippingZoneFinderProps {
  onZoneSelect?: (zone: any) => void;
  className?: string;
}

export default function ShippingZoneFinder({ onZoneSelect, className = "" }: ShippingZoneFinderProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [foundZone, setFoundZone] = useState<any>(null);
  const [showAllZones, setShowAllZones] = useState(false);

  const handleSearch = (term: string) => {
    setSearchTerm(term);
    if (term.length > 2) {
      const zone = findShippingZoneByArea(term);
      setFoundZone(zone);
    } else {
      setFoundZone(null);
    }
  };

  const lagosShippingMethods = shippingMethods.filter(method => 
    method.type === 'shipping' && method.name.includes('Lagos Zone')
  );

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Search for your area */}
      <div className="relative">
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          <Search className="h-5 w-5 text-gray-400" />
        </div>
        <input
          type="text"
          placeholder="Search for your area (e.g., Ikeja, Victoria Island, Lekki)"
          value={searchTerm}
          onChange={(e) => handleSearch(e.target.value)}
          className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
        />
      </div>

      {/* Search Result */}
      {foundZone && (
        <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
          <h3 className="font-medium text-green-800 mb-2">Found your zone!</h3>
          <div className="text-sm text-green-700">
            <p><strong>Zone:</strong> {foundZone.name}</p>
            <p><strong>Price:</strong> ₦{foundZone.price.toLocaleString()}</p>
            <p><strong>Delivery Time:</strong> {foundZone.deliveryTime}</p>
          </div>
          {onZoneSelect && (
            <button
              onClick={() => onZoneSelect(foundZone)}
              className="mt-3 px-4 py-2 bg-green-600 text-white text-sm rounded-md hover:bg-green-700 transition-colors"
            >
              Select This Zone
            </button>
          )}
        </div>
      )}

      {/* Show all zones toggle */}
      <div className="text-center">
        <button
          onClick={() => setShowAllZones(!showAllZones)}
          className="text-blue-600 hover:text-blue-800 text-sm font-medium"
        >
          {showAllZones ? 'Hide' : 'Show'} All Lagos Delivery Zones
        </button>
      </div>

      {/* All zones list */}
      {showAllZones && (
        <div className="space-y-3">
          <h3 className="font-medium text-gray-900">Lagos Delivery Zones</h3>
          <div className="grid gap-3">
            {lagosShippingMethods.map((method, index) => (
              <div
                key={index}
                className="p-3 border border-gray-200 rounded-lg hover:border-blue-300 transition-colors cursor-pointer"
                onClick={() => onZoneSelect && onZoneSelect(method)}
              >
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <h4 className="font-medium text-gray-900 text-sm">
                      {method.name.split(' - ')[0]}
                    </h4>
                    <p className="text-xs text-gray-600 mt-1">
                      {method.deliveryTime}
                    </p>
                    <p className="text-xs text-gray-500 mt-1">
                      Areas: {method.name.split(' - ')[1]?.replace(/₦\d+,?\d* \(/, '').replace(/\)$/, '')}
                    </p>
                  </div>
                  <div className="text-right">
                    <span className="font-semibold text-blue-600">
                      ₦{method.price.toLocaleString()}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Pickup options reminder */}
      <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
        <h4 className="font-medium text-blue-800 text-sm mb-1">💡 Save on delivery!</h4>
        <p className="text-xs text-blue-700">
          Choose pickup at any of our 3 locations for FREE delivery. Available in 2-4 hours.
        </p>
      </div>
    </div>
  );
}