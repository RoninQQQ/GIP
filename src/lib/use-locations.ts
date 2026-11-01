'use client';

import { useState, useEffect } from 'react';
import { isPreviewMode } from './config';
import turkeyLocationsFallback from '@/data/turkey-locations.json';

export interface ProvinceItem {
  id: number;
  name: string;
}

export function useLocations(selectedProvinceNameOrId?: string) {
  const [provinces, setProvinces] = useState<ProvinceItem[]>([]);
  const [districts, setDistricts] = useState<string[]>([]);
  const [isLoadingProvinces, setIsLoadingProvinces] = useState(false);
  const [isLoadingDistricts, setIsLoadingDistricts] = useState(false);

  // Fetch all provinces
  useEffect(() => {
    let isMounted = true;

    if (isPreviewMode) {
      setProvinces(turkeyLocationsFallback.map((p) => ({ id: p.id, name: p.name })));
      return;
    }

    async function fetchProvinces() {
      setIsLoadingProvinces(true);
      try {
        const res = await fetch('/api/locations');
        if (res.ok) {
          const data = await res.json();
          if (Array.isArray(data.provinces) && isMounted) {
            setProvinces(data.provinces);
            setIsLoadingProvinces(false);
            return;
          }
        }
      } catch (err) {
        console.warn('Failed to fetch provinces from API, falling back to static data', err);
      }

      if (isMounted) {
        setProvinces(turkeyLocationsFallback.map((p) => ({ id: p.id, name: p.name })));
        setIsLoadingProvinces(false);
      }
    }

    fetchProvinces();
    return () => {
      isMounted = false;
    };
  }, []);

  // Fetch districts when selectedProvince changes
  useEffect(() => {
    let isMounted = true;

    if (!selectedProvinceNameOrId) {
      setDistricts([]);
      return;
    }

    const targetProvince = selectedProvinceNameOrId;

    if (isPreviewMode) {
      const found = turkeyLocationsFallback.find(
        (p) =>
          String(p.id) === targetProvince ||
          p.name.toLowerCase() === targetProvince.toLowerCase()
      );
      setDistricts(found ? found.districts : []);
      return;
    }

    async function fetchDistricts() {
      setIsLoadingDistricts(true);
      try {
        const res = await fetch(`/api/locations?province=${encodeURIComponent(targetProvince)}`);
        if (res.ok) {
          const data = await res.json();
          if (Array.isArray(data.districts) && isMounted) {
            const districtNames = data.districts.map(
              (d: { id: number; name: string } | string) => (typeof d === 'string' ? d : d.name)
            );
            setDistricts(districtNames);
            setIsLoadingDistricts(false);
            return;
          }
        }
      } catch (err) {
        console.warn('Failed to fetch districts from API, using fallback', err);
      }

      if (isMounted) {
        const found = turkeyLocationsFallback.find(
          (p) =>
            String(p.id) === targetProvince ||
            p.name.toLowerCase() === targetProvince.toLowerCase()
        );
        setDistricts(found ? found.districts : []);
        setIsLoadingDistricts(false);
      }
    }

    fetchDistricts();
    return () => {
      isMounted = false;
    };
  }, [selectedProvinceNameOrId]);

  return {
    provinces,
    districts,
    isLoadingProvinces,
    isLoadingDistricts,
  };
}
