// Types untuk API Wilayah Indonesia
// Source: https://emsifa.github.io/api-wilayah-indonesia

export interface Province {
  id: string;
  name: string;
}

export interface Regency {
  id: string;
  province_id: string;
  name: string;
}

export interface District {
  id: string;
  regency_id: string;
  name: string;
}

export interface Village {
  id: string;
  district_id: string;
  name: string;
}

// API Response types
export type ProvincesResponse = Province[];
export type RegenciesResponse = Regency[];
export type DistrictsResponse = District[];
export type VillagesResponse = Village[];
