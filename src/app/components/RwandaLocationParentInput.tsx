import React, { useState } from 'react';
import { MapPin } from 'lucide-react';
import {
  RWANDA_PROVINCES,
  getDistrictsForProvince,
  getSectorsForDistrict,
} from '@/app/data/rwandaLocations';

interface LocationParentInputProps {
  onLocationChange: (location: {
    province?: string;
    district?: string;
    sector?: string;
  }) => void;
  initialValues?: {
    province?: string;
    district?: string;
    sector?: string;
  };
  required?: boolean;
  disabled?: boolean;
}

export const RwandaLocationParentInput: React.FC<LocationParentInputProps> = ({
  onLocationChange,
  initialValues,
  required = false,
  disabled = false,
}) => {
  const [location, setLocation] = useState({
    province: initialValues?.province || '',
    district: initialValues?.district || '',
    sector: initialValues?.sector || '',
  });

  const getDistricts = () => getDistrictsForProvince(location.province);
  const getSectors = () => getSectorsForDistrict(location.district);

  const handleChange = (field: string, value: string) => {
    const newLocation = { ...location, [field]: value };
    if (field === 'province') {
      newLocation.district = '';
      newLocation.sector = '';
    } else if (field === 'district') {
      newLocation.sector = '';
    }
    setLocation(newLocation);
    onLocationChange(newLocation);
  };

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Intara {required && <span className="text-red-500">*</span>}
          </label>
          <input
            type="text"
            value={location.province}
            onChange={(e) => handleChange('province', e.target.value)}
            placeholder="Hitamo intara"
            disabled={disabled}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
            list="provinces-list"
          />
          <datalist id="provinces-list">
            {RWANDA_PROVINCES.map(province => (
              <option key={province} value={province} />
            ))}
          </datalist>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Akarere {required && <span className="text-red-500">*</span>}
          </label>
          <input
            type="text"
            value={location.district}
            onChange={(e) => handleChange('district', e.target.value)}
            placeholder="Hitamo akarere"
            disabled={disabled || !location.province}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
            list={`districts-${location.province}-list`}
          />
          <datalist id={`districts-${location.province}-list`}>
            {getDistricts().map(district => (
              <option key={district} value={district} />
            ))}
          </datalist>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Umurenge {required && <span className="text-red-500">*</span>}
          </label>
          <input
            type="text"
            value={location.sector}
            onChange={(e) => handleChange('sector', e.target.value)}
            placeholder="Hitamo umurenge"
            disabled={disabled || !location.district}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
            list={`sectors-${location.district}-list`}
          />
          <datalist id={`sectors-${location.district}-list`}>
            {getSectors().map(sector => (
              <option key={sector} value={sector} />
            ))}
          </datalist>
        </div>
      </div>

      {location.province && (
        <div className="text-sm text-gray-600 flex items-center gap-2">
          <MapPin className="w-4 h-4 text-green-600" />
          <span>
            {location.province}
            {location.district && ` > ${location.district}`}
            {location.sector && ` > ${location.sector}`}
          </span>
        </div>
      )}
    </div>
  );
};

export default RwandaLocationParentInput;
