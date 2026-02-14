import React, { useState, useEffect } from 'react';
import { MapPin, ChevronDown, ChevronUp } from 'lucide-react';

interface LocationTextInputProps {
  onLocationChange: (location: {
    province?: string;
    district?: string;
    sector?: string;
    cell?: string;
    village?: string;
  }) => void;
  initialValues?: {
    province?: string;
    district?: string;
    sector?: string;
    cell?: string;
    village?: string;
  };
  required?: boolean;
  disabled?: boolean;
  className?: string;
}

// Rwanda administrative divisions - common names for reference
const RWANDA_PROVINCES = [
  'Kigali City',
  'Southern Province',
  'Northern Province',
  'Eastern Province',
  'Western Province',
  'Kigali'
];

const RWANDA_DISTRICTS: { [key: string]: string[] } = {
  'Kigali City': ['Gasabo', 'Kicukiro', 'Nyarugenge'],
  'Southern Province': ['Gisagara', 'Huye', 'Muhanga', 'Nyamagabe', 'Nyanza', 'Nyaruguru', 'Ruhango', 'Kamonyi'],
  'Northern Province': ['Burera', 'Gicumbi', 'Musanze', 'Rulindo'],
  'Eastern Province': ['Bugesera', 'Gatsibo', 'Kirehe', 'Ngoma', 'Nyagatare', 'Rwamagana'],
  'Western Province': ['Karongi', 'Ngororero', 'Nyabihu', 'Nyamasheke', 'Rubavu', 'Rutsiro']
};

const RWANDA_SECTORS: { [key: string]: string[] } = {
  // Kigali City - Gasabo
  'Gasabo': ['Bumbogo', 'Gatsata', 'Jabana', 'Kacyiru', 'Kimihurura', 'Kimironko', 'Kinyinya', 'Ndera', 'Paintura', 'Remera', 'Rusororo', 'Gikomero'],
  // Kigali City - Kicukiro
  'Kicukiro': ['Gahanga', 'Gatenga', 'Gikondo', 'Kagarama', 'Kicukiro', 'Kigarama', 'Masaka', 'Niboye', 'Nyarugunga', 'Kanombe'],
  // Kigali City - Nyarugenge
  'Nyarugenge': ['Gitega', 'Kanyinya', 'Kigali', 'Munyina', 'Nyakabanda', 'Nyarugenge', 'Ruhango', 'Gatsibu'],
  // Add more sectors as needed - this is a partial list for reference
  'Gisagara': ['Gikongoro', 'Kibilizi', 'Kigembe', 'Muganza', 'Musanza', 'Nyanza', 'Rwimbogo'],
  'Huye': ['Gishamvu', 'Huye', 'Karama', 'Kinazi', 'Kibirizi', 'Mbazi', 'Ngoma', 'Ruhashya', 'Rusatira', 'Tumba'],
  'Muhanga': ['Cyeshiba', 'Kabacari', 'Kibangu', 'Kimunosoro', 'Mugunga', 'Muhanga', 'Nyabinoni', 'Nyarusange', 'Rongi', 'Shyogwe'],
  // Note: For a complete list, all 416 sectors would be listed here
};

export const RwandaLocationTextInput: React.FC<LocationTextInputProps> = ({
  onLocationChange,
  initialValues,
  required = false,
  disabled = false,
  className = ''
}) => {
  const [expanded, setExpanded] = useState(true);
  
  const [location, setLocation] = useState({
    province: initialValues?.province || '',
    district: initialValues?.district || '',
    sector: initialValues?.sector || '',
    cell: initialValues?.cell || '',
    village: initialValues?.village || ''
  });

  // Get districts based on selected province
  const getDistricts = () => {
    if (!location.province) return [];
    return RWANDA_DISTRICTS[location.province] || [];
  };

  // Get sectors based on selected district
  const getSectors = () => {
    if (!location.district) return [];
    return RWANDA_SECTORS[location.district] || [];
  };

  const handleChange = (field: string, value: string) => {
    const newLocation = { ...location, [field]: value };
    
    // Clear dependent fields when parent field changes
    if (field === 'province') {
      newLocation.district = '';
      newLocation.sector = '';
      newLocation.cell = '';
      newLocation.village = '';
    } else if (field === 'district') {
      newLocation.sector = '';
      newLocation.cell = '';
      newLocation.village = '';
    } else if (field === 'sector') {
      newLocation.cell = '';
      newLocation.village = '';
    }
    
    setLocation(newLocation);
    onLocationChange(newLocation);
  };

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Header with toggle */}
      <div 
        className="flex items-center justify-between cursor-pointer"
        onClick={() => !disabled && setExpanded(!expanded)}
      >
        <div className="flex items-center gap-2">
          <MapPin className="w-5 h-5 text-blue-600" />
          <h3 className="text-lg font-medium text-gray-800">
            Aho Utuye / Location
            {required && <span className="text-red-500 ml-1">*</span>}
          </h3>
        </div>
        {!disabled && (
          expanded ? (
            <ChevronUp className="w-5 h-5 text-gray-400" />
          ) : (
            <ChevronDown className="w-5 h-5 text-gray-400" />
          )
        )}
      </div>

      {expanded && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 bg-gray-50 rounded-lg border border-gray-200">
          {/* Province */}
          <div className="space-y-1">
            <label className="block text-sm font-medium text-gray-700">
              Intara / Province {required && <span className="text-red-500">*</span>}
            </label>
            <input
              type="text"
              value={location.province}
              onChange={(e) => handleChange('province', e.target.value)}
              placeholder="Andika intara (e.g., Kigali City)"
              disabled={disabled}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-100 disabled:cursor-not-allowed"
              list="provinces-list"
            />
            <datalist id="provinces-list">
              {RWANDA_PROVINCES.map(province => (
                <option key={province} value={province} />
              ))}
            </datalist>
          </div>

          {/* District */}
          <div className="space-y-1">
            <label className="block text-sm font-medium text-gray-700">
              Akarere / District {required && <span className="text-red-500">*</span>}
            </label>
            <input
              type="text"
              value={location.district}
              onChange={(e) => handleChange('district', e.target.value)}
              placeholder="Andika akarere"
              disabled={disabled || !location.province}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-100 disabled:cursor-not-allowed"
              list={`districts-${location.province}-list`}
            />
            <datalist id={`districts-${location.province}-list`}>
              {getDistricts().map(district => (
                <option key={district} value={district} />
              ))}
            </datalist>
          </div>

          {/* Sector */}
          <div className="space-y-1">
            <label className="block text-sm font-medium text-gray-700">
              Umurenge / Sector {required && <span className="text-red-500">*</span>}
            </label>
            <input
              type="text"
              value={location.sector}
              onChange={(e) => handleChange('sector', e.target.value)}
              placeholder="Andika umurenge"
              disabled={disabled || !location.district}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-100 disabled:cursor-not-allowed"
              list={`sectors-${location.district}-list`}
            />
            <datalist id={`sectors-${location.district}-list`}>
              {getSectors().map(sector => (
                <option key={sector} value={sector} />
              ))}
            </datalist>
          </div>

          {/* Cell */}
          <div className="space-y-1">
            <label className="block text-sm font-medium text-gray-700">
              Akagari / Cell
            </label>
            <input
              type="text"
              value={location.cell}
              onChange={(e) => handleChange('cell', e.target.value)}
              placeholder="Andika akagari"
              disabled={disabled || !location.sector}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-100 disabled:cursor-not-allowed"
            />
          </div>

          {/* Village */}
          <div className="space-y-1 md:col-span-2">
            <label className="block text-sm font-medium text-gray-700">
              Umudugudu / Village
            </label>
            <input
              type="text"
              value={location.village}
              onChange={(e) => handleChange('village', e.target.value)}
              placeholder="Andika umudugudu"
              disabled={disabled || !location.cell}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-100 disabled:cursor-not-allowed"
            />
          </div>
        </div>
      )}

      {/* Display selected location summary */}
      {location.province && (
        <div className="text-sm text-gray-600 flex items-center gap-2">
          <MapPin className="w-4 h-4 text-green-600" />
          <span>
            {location.province}
            {location.district && ` > ${location.district}`}
            {location.sector && ` > ${location.sector}`}
            {location.cell && ` > ${location.cell}`}
            {location.village && ` > ${location.village}`}
          </span>
        </div>
      )}
    </div>
  );
};

export default RwandaLocationTextInput;
