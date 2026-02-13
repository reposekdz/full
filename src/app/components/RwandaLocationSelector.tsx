import React, { useState, useEffect } from 'react';
import axios from 'axios';

interface LocationData {
  id: number;
  name_en: string;
  name_rw: string;
  code: string;
}

interface RwandaLocationSelectorProps {
  onLocationChange: (location: {
    province_id: number | null;
    district_id: number | null;
    sector_id: number | null;
    cell_id: number | null;
    village_id: number | null;
  }) => void;
  initialValues?: {
    province_id?: number;
    district_id?: number;
    sector_id?: number;
    cell_id?: number;
    village_id?: number;
  };
  required?: boolean;
}

const RwandaLocationSelector: React.FC<RwandaLocationSelectorProps> = ({
  onLocationChange,
  initialValues,
  required = false
}) => {
  const [provinces, setProvinces] = useState<LocationData[]>([]);
  const [districts, setDistricts] = useState<LocationData[]>([]);
  const [sectors, setSectors] = useState<LocationData[]>([]);
  const [cells, setCells] = useState<LocationData[]>([]);
  const [villages, setVillages] = useState<LocationData[]>([]);

  const [selectedProvince, setSelectedProvince] = useState<number | null>(initialValues?.province_id || null);
  const [selectedDistrict, setSelectedDistrict] = useState<number | null>(initialValues?.district_id || null);
  const [selectedSector, setSelectedSector] = useState<number | null>(initialValues?.sector_id || null);
  const [selectedCell, setSelectedCell] = useState<number | null>(initialValues?.cell_id || null);
  const [selectedVillage, setSelectedVillage] = useState<number | null>(initialValues?.village_id || null);

  const API_URL = 'http://localhost:5000/api';

  useEffect(() => {
    axios.get(`${API_URL}/locations/provinces`)
      .then(res => setProvinces(res.data.provinces))
      .catch(err => console.error('Error loading provinces:', err));
  }, []);

  useEffect(() => {
    if (selectedProvince) {
      axios.get(`${API_URL}/locations/districts/${selectedProvince}`)
        .then(res => setDistricts(res.data.districts))
        .catch(err => console.error('Error loading districts:', err));
    } else {
      setDistricts([]);
      setSelectedDistrict(null);
    }
  }, [selectedProvince]);

  useEffect(() => {
    if (selectedDistrict) {
      axios.get(`${API_URL}/locations/sectors/${selectedDistrict}`)
        .then(res => setSectors(res.data.sectors))
        .catch(err => console.error('Error loading sectors:', err));
    } else {
      setSectors([]);
      setSelectedSector(null);
    }
  }, [selectedDistrict]);

  useEffect(() => {
    if (selectedSector) {
      axios.get(`${API_URL}/locations/cells/${selectedSector}`)
        .then(res => setCells(res.data.cells))
        .catch(err => console.error('Error loading cells:', err));
    } else {
      setCells([]);
      setSelectedCell(null);
    }
  }, [selectedSector]);

  useEffect(() => {
    if (selectedCell) {
      axios.get(`${API_URL}/locations/villages/${selectedCell}`)
        .then(res => setVillages(res.data.villages))
        .catch(err => console.error('Error loading villages:', err));
    } else {
      setVillages([]);
      setSelectedVillage(null);
    }
  }, [selectedCell]);

  useEffect(() => {
    onLocationChange({
      province_id: selectedProvince,
      district_id: selectedDistrict,
      sector_id: selectedSector,
      cell_id: selectedCell,
      village_id: selectedVillage
    });
  }, [selectedProvince, selectedDistrict, selectedSector, selectedCell, selectedVillage]);

  return (
    <div className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Intara / Province {required && <span className="text-red-500">*</span>}
        </label>
        <select
          value={selectedProvince || ''}
          onChange={(e) => setSelectedProvince(e.target.value ? Number(e.target.value) : null)}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
          required={required}
        >
          <option value="">Hitamo Intara / Select Province</option>
          {provinces.map(p => (
            <option key={p.id} value={p.id}>{p.name_rw} / {p.name_en}</option>
          ))}
        </select>
      </div>

      {selectedProvince && (
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Akarere / District {required && <span className="text-red-500">*</span>}
          </label>
          <select
            value={selectedDistrict || ''}
            onChange={(e) => setSelectedDistrict(e.target.value ? Number(e.target.value) : null)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            required={required}
          >
            <option value="">Hitamo Akarere / Select District</option>
            {districts.map(d => (
              <option key={d.id} value={d.id}>{d.name_rw} / {d.name_en}</option>
            ))}
          </select>
        </div>
      )}

      {selectedDistrict && (
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Umurenge / Sector
          </label>
          <select
            value={selectedSector || ''}
            onChange={(e) => setSelectedSector(e.target.value ? Number(e.target.value) : null)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
          >
            <option value="">Hitamo Umurenge / Select Sector</option>
            {sectors.map(s => (
              <option key={s.id} value={s.id}>{s.name_rw} / {s.name_en}</option>
            ))}
          </select>
        </div>
      )}

      {selectedSector && (
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Akagari / Cell
          </label>
          <select
            value={selectedCell || ''}
            onChange={(e) => setSelectedCell(e.target.value ? Number(e.target.value) : null)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
          >
            <option value="">Hitamo Akagari / Select Cell</option>
            {cells.map(c => (
              <option key={c.id} value={c.id}>{c.name_rw} / {c.name_en}</option>
            ))}
          </select>
        </div>
      )}

      {selectedCell && (
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Umudugudu / Village
          </label>
          <select
            value={selectedVillage || ''}
            onChange={(e) => setSelectedVillage(e.target.value ? Number(e.target.value) : null)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
          >
            <option value="">Hitamo Umudugudu / Select Village</option>
            {villages.map(v => (
              <option key={v.id} value={v.id}>{v.name_rw} / {v.name_en}</option>
            ))}
          </select>
        </div>
      )}
    </div>
  );
};

export default RwandaLocationSelector;
