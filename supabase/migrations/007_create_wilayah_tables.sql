-- Migration: Create Wilayah Indonesia Tables
-- This migration creates tables for Indonesian administrative regions

-- Table: provinces (Provinsi)
CREATE TABLE IF NOT EXISTS provinces (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Table: regencies (Kota/Kabupaten)
CREATE TABLE IF NOT EXISTS regencies (
  id TEXT PRIMARY KEY,
  province_id TEXT NOT NULL REFERENCES provinces(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Table: districts (Kecamatan)
CREATE TABLE IF NOT EXISTS districts (
  id TEXT PRIMARY KEY,
  regency_id TEXT NOT NULL REFERENCES regencies(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Table: villages (Kelurahan/Desa)
CREATE TABLE IF NOT EXISTS villages (
  id TEXT PRIMARY KEY,
  district_id TEXT NOT NULL REFERENCES districts(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_regencies_province_id ON regencies(province_id);
CREATE INDEX IF NOT EXISTS idx_districts_regency_id ON districts(regency_id);
CREATE INDEX IF NOT EXISTS idx_villages_district_id ON villages(district_id);

-- Enable Row Level Security (RLS)
ALTER TABLE provinces ENABLE ROW LEVEL SECURITY;
ALTER TABLE regencies ENABLE ROW LEVEL SECURITY;
ALTER TABLE districts ENABLE ROW LEVEL SECURITY;
ALTER TABLE villages ENABLE ROW LEVEL SECURITY;

-- Create policies for public read access (wilayah data is public reference data)
CREATE POLICY "Allow public read access on provinces"
  ON provinces FOR SELECT
  TO public
  USING (true);

CREATE POLICY "Allow public read access on regencies"
  ON regencies FOR SELECT
  TO public
  USING (true);

CREATE POLICY "Allow public read access on districts"
  ON districts FOR SELECT
  TO public
  USING (true);

CREATE POLICY "Allow public read access on villages"
  ON villages FOR SELECT
  TO public
  USING (true);

-- Create policies for authenticated users to manage data (optional - only admins should insert/update)
CREATE POLICY "Allow authenticated users to manage provinces"
  ON provinces FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Allow authenticated users to manage regencies"
  ON regencies FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Allow authenticated users to manage districts"
  ON districts FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Allow authenticated users to manage villages"
  ON villages FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = TIMEZONE('utc'::text, NOW());
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers for updated_at
CREATE TRIGGER update_provinces_updated_at
  BEFORE UPDATE ON provinces
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_regencies_updated_at
  BEFORE UPDATE ON regencies
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_districts_updated_at
  BEFORE UPDATE ON districts
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_villages_updated_at
  BEFORE UPDATE ON villages
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Add comments
COMMENT ON TABLE provinces IS 'Tabel Provinsi di Indonesia';
COMMENT ON TABLE regencies IS 'Tabel Kota/Kabupaten di Indonesia';
COMMENT ON TABLE districts IS 'Tabel Kecamatan di Indonesia';
COMMENT ON TABLE villages IS 'Tabel Kelurahan/Desa di Indonesia';
