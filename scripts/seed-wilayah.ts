/**
 * Script untuk seed data wilayah Indonesia ke Supabase
 * Run: npx tsx scripts/seed-wilayah.ts
 */

import { config } from 'dotenv';
import { createClient } from '@supabase/supabase-js';

// Load environment variables from .env file
config();

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || '';

// Prefer service_role key for admin operations, fallback to anon key
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

if (!SUPABASE_URL || !SUPABASE_SERVICE_KEY) {
  console.error('❌ Error: NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY (or NEXT_PUBLIC_SUPABASE_ANON_KEY) must be set');
  console.error('💡 For seeding, use SUPABASE_SERVICE_ROLE_KEY to bypass RLS policies');
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);

interface Province {
  id: string;
  name: string;
}

interface Regency {
  id: string;
  province_id: string;
  name: string;
}

interface District {
  id: string;
  regency_id: string;
  name: string;
}

interface Village {
  id: string;
  district_id: string;
  name: string;
}

const API_BASE_URL = 'https://emsifa.github.io/api-wilayah-indonesia/api';

async function fetchWithRetry(url: string, maxRetries = 3): Promise<any> {
  for (let i = 0; i < maxRetries; i++) {
    try {
      const response = await fetch(url);
      if (response.ok) {
        return await response.json();
      }
      console.warn(`  ⚠️  Attempt ${i + 1} failed for ${url}`);
    } catch (error) {
      console.warn(`  ⚠️  Attempt ${i + 1} error for ${url}:`, error);
    }

    // Wait before retry (exponential backoff)
    if (i < maxRetries - 1) {
      await new Promise(resolve => setTimeout(resolve, 1000 * (i + 1)));
    }
  }

  throw new Error(`Failed to fetch ${url} after ${maxRetries} attempts`);
}

async function seedProvinces(): Promise<void> {
  console.log('📦 Seeding provinces...');

  try {
    const data: Province[] = await fetchWithRetry(`${API_BASE_URL}/provinces.json`);
    console.log(`  Fetched ${data.length} provinces`);

    // Insert in batches
    const batchSize = 100;
    for (let i = 0; i < data.length; i += batchSize) {
      const batch = data.slice(i, i + batchSize);
      const { error } = await supabase
        .from('provinces')
        .upsert(batch, { onConflict: 'id' });

      if (error) {
        console.error(`  ❌ Error inserting batch ${i / batchSize + 1}:`, error);
      } else {
        console.log(`  ✅ Inserted batch ${i / batchSize + 1} (${batch.length} provinces)`);
      }
    }

    console.log(`✅ Provinces seeding complete!\n`);
  } catch (error) {
    console.error('❌ Error seeding provinces:', error);
    throw error;
  }
}

async function seedRegencies(): Promise<void> {
  console.log('🏙️  Seeding regencies (kota/kabupaten)...');

  try {
    // Get all provinces first
    const { data: provinces, error: provError } = await supabase
      .from('provinces')
      .select('id');

    if (provError || !provinces) {
      throw new Error('Failed to fetch provinces');
    }

    console.log(`  Found ${provinces.length} provinces`);

    let totalInserted = 0;
    let failedCount = 0;

    // Process each province
    for (let i = 0; i < provinces.length; i++) {
      const provinceId = provinces[i].id;

      try {
        const data: Regency[] = await fetchWithRetry(`${API_BASE_URL}/regencies/${provinceId}.json`);

        if (data.length === 0) {
          console.log(`  ⚠️  No regencies found for province ${provinceId}`);
          continue;
        }

        // Insert in batches
        const batchSize = 100;
        for (let j = 0; j < data.length; j += batchSize) {
          const batch = data.slice(j, j + batchSize);
          const { error } = await supabase
            .from('regencies')
            .upsert(batch, { onConflict: 'id' });

          if (error) {
            console.error(`    ❌ Error inserting regencies for province ${provinceId}:`, error);
            failedCount++;
          } else {
            totalInserted += batch.length;
          }
        }

        console.log(`  ✅ Province ${provinceId} (${i + 1}/${provinces.length}): ${data.length} regencies`);
      } catch (error) {
        console.error(`  ❌ Error fetching regencies for province ${provinceId}:`, error);
        failedCount++;
      }

      // Add delay to avoid rate limiting
      await new Promise(resolve => setTimeout(resolve, 200));
    }

    console.log(`✅ Regencies seeding complete! Total: ${totalInserted}, Failed: ${failedCount}\n`);
  } catch (error) {
    console.error('❌ Error seeding regencies:', error);
    throw error;
  }
}

async function seedDistricts(): Promise<void> {
  console.log('🏘️  Seeding districts (kecamatan)...');

  try {
    // Get all regencies first
    const { data: regencies, error: regError } = await supabase
      .from('regencies')
      .select('id');

    if (regError || !regencies) {
      throw new Error('Failed to fetch regencies');
    }

    console.log(`  Found ${regencies.length} regencies`);
    console.log(`  ⚠️  This will take a while as there are many regencies...\n`);

    let totalInserted = 0;
    let failedCount = 0;

    // Process each regency
    for (let i = 0; i < regencies.length; i++) {
      const regencyId = regencies[i].id;

      try {
        const data: District[] = await fetchWithRetry(`${API_BASE_URL}/districts/${regencyId}.json`);

        if (data.length === 0) {
          continue;
        }

        // Insert in batches
        const batchSize = 100;
        for (let j = 0; j < data.length; j += batchSize) {
          const batch = data.slice(j, j + batchSize);
          const { error } = await supabase
            .from('districts')
            .upsert(batch, { onConflict: 'id' });

          if (error) {
            console.error(`    ❌ Error inserting districts for regency ${regencyId}:`, error);
            failedCount++;
          } else {
            totalInserted += batch.length;
          }
        }

        if ((i + 1) % 50 === 0 || i === regencies.length - 1) {
          console.log(`  Progress: ${i + 1}/${regencies.length} regencies processed (${totalInserted} districts total)`);
        }
      } catch (error) {
        console.error(`  ❌ Error fetching districts for regency ${regencyId}:`, error);
        failedCount++;
      }

      // Add delay to avoid rate limiting
      await new Promise(resolve => setTimeout(resolve, 100));
    }

    console.log(`\n✅ Districts seeding complete! Total: ${totalInserted}, Failed: ${failedCount}\n`);
  } catch (error) {
    console.error('❌ Error seeding districts:', error);
    throw error;
  }
}

async function seedVillages(): Promise<void> {
  console.log('🏠 Seeding villages (kelurahan/desa)...');
  console.log('  ⚠️  This will take a LONG time - there are thousands of villages!');
  console.log('  💡 You can skip this step initially and run it later\n');

  const answer = process.env.SKIP_VILLAGES || 'false';

  if (answer.toLowerCase() === 'true') {
    console.log('⏭️  Skipping villages seeding. Run again without SKIP_VILLAGES=true to seed villages.\n');
    return;
  }

  try {
    // Get all districts first
    const { data: districts, error: distError } = await supabase
      .from('districts')
      .select('id');

    if (distError || !districts) {
      throw new Error('Failed to fetch districts');
    }

    console.log(`  Found ${districts.length} districts\n`);

    let totalInserted = 0;
    let failedCount = 0;

    // Process each district
    for (let i = 0; i < districts.length; i++) {
      const districtId = districts[i].id;

      try {
        const data: Village[] = await fetchWithRetry(`${API_BASE_URL}/villages/${districtId}.json`);

        if (data.length === 0) {
          continue;
        }

        // Insert in batches
        const batchSize = 100;
        for (let j = 0; j < data.length; j += batchSize) {
          const batch = data.slice(j, j + batchSize);
          const { error } = await supabase
            .from('villages')
            .upsert(batch, { onConflict: 'id' });

          if (error) {
            if (failedCount < 10) { // Only log first 10 errors to avoid spam
              console.error(`    ❌ Error inserting villages for district ${districtId}:`, error);
            }
            failedCount++;
          } else {
            totalInserted += batch.length;
          }
        }

        if ((i + 1) % 100 === 0 || i === districts.length - 1) {
          console.log(`  Progress: ${i + 1}/${districts.length} districts processed (${totalInserted} villages total, ${failedCount} failed)`);
        }
      } catch (error) {
        console.error(`  ❌ Error fetching villages for district ${districtId}:`, error);
        failedCount++;
      }

      // Add delay to avoid rate limiting
      await new Promise(resolve => setTimeout(resolve, 50));
    }

    console.log(`\n✅ Villages seeding complete! Total: ${totalInserted}, Failed: ${failedCount}\n`);
  } catch (error) {
    console.error('❌ Error seeding villages:', error);
    throw error;
  }
}

async function main() {
  console.log('🚀 Starting Wilayah Indonesia seed to Supabase...\n');

  try {
    // Step 1: Seed provinces
    await seedProvinces();

    // Step 2: Seed regencies
    await seedRegencies();

    // Step 3: Seed districts (optional - takes time)
    await seedDistricts();

    // Step 4: Seed villages (optional - takes very long time)
    await seedVillages();

    console.log('🎉 All seeding completed successfully!');
  } catch (error) {
    console.error('\n❌ Seeding failed:', error);
    process.exit(1);
  }
}

// Run the script
main();
