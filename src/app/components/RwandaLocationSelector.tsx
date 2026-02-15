import React, { useState, useEffect } from 'react';
import { apiService } from '@/app/services/apiService';
import {
  getProvincesList,
  getDistrictsByProvinceId,
  getSectorsByDistrictId,
  getCellsBySectorId,
  getVillagesByCellId,
} from '@/app/data/rwandaLocations';

interface LocationData {
  id: number;
  name_en: string;
  name_rw?: string;
  code?: string;
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

const toLocationData = (p: { id: number; name_en: string; name_rw?: string }): LocationData => ({
  id: p.id,
  name_en: p.name_en,
  name_rw: p.name_rw ?? p.name_en,
});

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

  const [selectedProvince, setSelectedProvince] = useState<number | null>(initialValues?.province_id ?? null);
  const [selectedDistrict, setSelectedDistrict] = useState<number | null>(initialValues?.district_id ?? null);
  const [selectedSector, setSelectedSector] = useState<number | null>(initialValues?.sector_id ?? null);
  const [selectedCell, setSelectedCell] = useState<number | null>(initialValues?.cell_id ?? null);
  const [selectedVillage, setSelectedVillage] = useState<number | null>(initialValues?.village_id ?? null);

  useEffect(() => {
    apiService.getLocationsProvinces().then((res) => {
      if (res.success && res.provinces?.length) {
        setProvinces(res.provinces.map(toLocationData));
      } else {
        setProvinces(getProvincesList().map(toLocationData));
      }
    });
  }, []);

  useEffect(() => {
    if (!selectedProvince) {
      setDistricts([]);
      return;
    }
    apiService.getLocationsDistricts(selectedProvince).then((res) => {
      if (res.success && res.districts?.length) {
        setDistricts(res.districts.map(toLocationData));
      } else {
        setDistricts(getDistrictsByProvinceId(selectedProvince).map(toLocationData));
      }
    });
  }, [selectedProvince]);

  useEffect(() => {
    if (!selectedDistrict) {
      setSectors([]);
      return;
    }
    apiService.getLocationsSectors(selectedDistrict).then((res) => {
      if (res.success && res.sectors?.length) {
        setSectors(res.sectors.map(toLocationData));
      } else {
        setSectors(getSectorsByDistrictId(selectedDistrict).map(toLocationData));
      }
    });
  }, [selectedDistrict]);

  useEffect(() => {
    if (!selectedSector) {
      setCells([]);
      return;
    }
    apiService.getLocationsCells(selectedSector).then((res) => {
      if (res.success && res.cells?.length) {
        setCells(res.cells.map(toLocationData));
      } else {
        setCells(getCellsBySectorId(selectedSector).map(toLocationData));
      }
    });
  }, [selectedSector]);

  useEffect(() => {
    if (!selectedCell) {
      setVillages([]);
      return;
    }
    apiService.getLocationsVillages(selectedCell).then((res) => {
      if (res.success && res.villages?.length) {
        setVillages(res.villages.map(toLocationData));
      } else {
        setVillages(getVillagesByCellId(selectedCell).map(toLocationData));
      }
    });
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
          value={selectedProvince ?? ''}
          onChange={(e) => {
            const id = e.target.value ? Number(e.target.value) : null;
            setSelectedProvince(id);
            setSelectedDistrict(null);
            setSelectedSector(null);
            setSelectedCell(null);
            setSelectedVillage(null);
          }}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
          required={required}
        >
          <option value="">Hitamo Intara / Select Province</option>
          {provinces.map((p) => (
            <option key={p.id} value={p.id}>{p.name_rw ?? p.name_en} / {p.name_en}</option>
          ))}
        </select>
      </div>

      {selectedProvince && (
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Akarere / District {required && <span className="text-red-500">*</span>}
          </label>
          <select
            value={selectedDistrict ?? ''}
            onChange={(e) => {
              const id = e.target.value ? Number(e.target.value) : null;
              setSelectedDistrict(id);
              setSelectedSector(null);
              setSelectedCell(null);
              setSelectedVillage(null);
            }}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            required={required}
          >
            <option value="">Hitamo Akarere / Select District</option>
            {districts.map((d) => (
              <option key={d.id} value={d.id}>{d.name_rw ?? d.name_en} / {d.name_en}</option>
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
            value={selectedSector ?? ''}
            onChange={(e) => {
              const id = e.target.value ? Number(e.target.value) : null;
              setSelectedSector(id);
              setSelectedCell(null);
              setSelectedVillage(null);
            }}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
          >
            <option value="">Hitamo Umurenge / Select Sector</option>
            {sectors.map((s) => (
              <option key={s.id} value={s.id}>{s.name_rw ?? s.name_en} / {s.name_en}</option>
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
            value={selectedCell ?? ''}
            onChange={(e) => {
              const id = e.target.value ? Number(e.target.value) : null;
              setSelectedCell(id);
              setSelectedVillage(null);
            }}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
          >
            <option value="">Hitamo Akagari / Select Cell</option>
            {cells.map((c) => (
              <option key={c.id} value={c.id}>{c.name_rw ?? c.name_en} / {c.name_en}</option>
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
            value={selectedVillage ?? ''}
            onChange={(e) => setSelectedVillage(e.target.value ? Number(e.target.value) : null)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
          >
            <option value="">Hitamo Umudugudu / Select Village</option>
            {villages.map((v) => (
              <option key={v.id} value={v.id}>{v.name_rw ?? v.name_en} / {v.name_en}</option>
            ))}
          </select>
        </div>
      )}
    </div>
  );
};

export default RwandaLocationSelector;
