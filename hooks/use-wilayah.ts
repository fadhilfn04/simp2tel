import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';

export function useWilayah() {
  const [provinces, setProvinces] = useState<any[]>([]);
  const [regencies, setRegencies] = useState<any[]>([]);
  const [districts, setDistricts] = useState<any[]>([]);
  const [villages, setVillages] = useState<any[]>([]);

  const [loadingProvinces, setLoadingProvinces] = useState(false);
  const [loadingRegencies, setLoadingRegencies] = useState(false);
  const [loadingDistricts, setLoadingDistricts] = useState(false);
  const [loadingVillages, setLoadingVillages] = useState(false);

  // Fetch all provinces on mount
  useEffect(() => {
    fetchProvinces();
  }, []);

  const fetchProvinces = async () => {
    setLoadingProvinces(true);
    try {
      const { data, error } = await supabase
        .from('provinces')
        .select('id, name')
        .order('name');

      if (error) throw error;
      setProvinces(data || []);
    } catch (error) {
      console.error('Error fetching provinces:', error);
      setProvinces([]);
    } finally {
      setLoadingProvinces(false);
    }
  };

  const fetchRegencies = async (provinceId: string) => {
    if (!provinceId) {
      setRegencies([]);
      return;
    }

    setLoadingRegencies(true);
    try {
      const { data, error } = await supabase
        .from('regencies')
        .select('id, name')
        .eq('province_id', provinceId)
        .order('name');

      if (error) throw error;
      setRegencies(data || []);
    } catch (error) {
      console.error('Error fetching regencies:', error);
      setRegencies([]);
    } finally {
      setLoadingRegencies(false);
    }
  };

  const fetchDistricts = async (regencyId: string) => {
    if (!regencyId) {
      setDistricts([]);
      return;
    }

    setLoadingDistricts(true);
    try {
      const { data, error } = await supabase
        .from('districts')
        .select('id, name')
        .eq('regency_id', regencyId)
        .order('name');

      if (error) throw error;
      setDistricts(data || []);
    } catch (error) {
      console.error('Error fetching districts:', error);
      setDistricts([]);
    } finally {
      setLoadingDistricts(false);
    }
  };

  const fetchVillages = async (districtId: string) => {
    if (!districtId) {
      setVillages([]);
      return;
    }

    setLoadingVillages(true);
    try {
      const { data, error } = await supabase
        .from('villages')
        .select('id, name')
        .eq('district_id', districtId)
        .order('name');

      if (error) throw error;
      setVillages(data || []);
    } catch (error) {
      console.error('Error fetching villages:', error);
      setVillages([]);
    } finally {
      setLoadingVillages(false);
    }
  };

  return {
    // Data
    provinces,
    regencies,
    districts,
    villages,

    // Loading states
    loadingProvinces,
    loadingRegencies,
    loadingDistricts,
    loadingVillages,

    // Fetch functions
    fetchRegencies,
    fetchDistricts,
    fetchVillages,
  };
}
