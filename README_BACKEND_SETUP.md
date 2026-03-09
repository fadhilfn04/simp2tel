# Setup Backend Integration for Anggota Management

## 🚀 Complete Backend Setup

I've created a complete backend integration for the "Tambah Anggota" form using Supabase/PostgreSQL. Here's what was implemented:

## 📁 Files Created

### 1. Database Migration
**File**: `supabase/migrations/001_create_anggota_table.sql`
- Complete PostgreSQL table schema for `anggota` (members)
- UUID primary keys
- All required fields with proper constraints
- Indexes for performance
- Soft delete functionality
- Automatic timestamps

### 2. Supabase Client & Types
**File**: `lib/supabase.ts`
- Supabase client configuration
- TypeScript interfaces for `Anggota`, `CreateAnggotaInput`, `UpdateAnggotaInput`
- Proper type definitions matching database schema

### 3. API Routes
**File**: `app/api/anggota/route.ts`
- `GET /api/anggota` - List members with filtering & pagination
- `POST /api/anggota` - Create new member

**File**: `app/api/anggota/[id]/route.ts`
- `GET /api/anggota/[id]` - Get single member
- `PUT /api/anggota/[id]` - Update member
- `DELETE /api/anggota/[id]` - Soft delete member

### 4. React Hooks
**File**: `lib/hooks/use-anggota-api.ts`
- `useAnggotaList()` - Fetch members with filters
- `useAnggota(id)` - Fetch single member
- `useCreateAnggota()` - Create member mutation
- `useUpdateAnggota(id)` - Update member mutation
- `useDeleteAnggota()` - Delete member mutation

### 5. Updated Page Component
**File**: `app/(protected)/keanggotaan/pengelolaan-data/page.tsx`
- Integrated with real API instead of mock data
- Loading states and error handling
- Form submission with validation
- Real-time data updates

## 🔧 Setup Instructions

### Step 1: Environment Variables

Add these to your `.env` file:

```env
NEXT_PUBLIC_SUPABASE_URL=your-supabase-project-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key
```

### Step 2: Install Dependencies

```bash
npm install @supabase/supabase-js @tanstack/react-query
```

### Step 3: Run Database Migration

**Option A: Using Supabase Dashboard**
1. Go to your Supabase project dashboard
2. Navigate to SQL Editor
3. Copy the content of `supabase/migrations/001_create_anggota_table.sql`
4. Run the SQL script

**Option B: Using Supabase CLI**
```bash
# Install Supabase CLI if not already installed
npm install -g supabase

# Link to your project
supabase link --project-ref your-project-ref

# Run migration
supabase db push
```

### Step 4: Update Form Fields (Complete the Integration)

The form needs controlled inputs. Here's the pattern to follow for all fields:

```typescript
// Example pattern for each field:
<Input
  placeholder="Placeholder text"
  value={formData.field_name}
  onChange={(e) => setFormData({...formData, field_name: e.target.value})}
  required
/>

// For Select fields:
<Select
  value={formData.status_anggota}
  onValueChange={(value) => setFormData({...formData, status_anggota: value})}
  required
>
  <SelectTrigger>
    <SelectValue placeholder="Pilih status" />
  </SelectTrigger>
  <SelectContent>
    <SelectItem value="Aktif">Aktif</SelectItem>
    {/* ... more options */}
  </SelectContent>
</Select>
```

### Step 5: Test the Integration

1. **Start the development server**:
   ```bash
   npm run dev
   ```

2. **Navigate to the page**: `/keanggotaan/pengelolaan-data`

3. **Test the functionality**:
   - ✅ View the table (should be empty initially)
   - ✅ Click "Tambah Anggota" button
   - ✅ Fill out the form
   - ✅ Submit the form
   - ✅ Check Supabase dashboard for new record
   - ✅ View the new member in the table
   - ✅ Test search and filters
   - ✅ Test pagination
   - ✅ Test delete button

## 🎯 Key Features Implemented

### ✅ Database Schema
- **UUID primary keys** for security
- **Proper constraints** (NOT NULL, CHECK, UNIQUE)
- **Soft delete** with `deleted_at` field
- **Automatic timestamps** (`created_at`, `updated_at`)
- **Performance indexes** on frequently queried fields

### ✅ API Endpoints
- **CRUD operations** (Create, Read, Update, Delete)
- **Filtering** by status, jenis, iuran
- **Search** by name, NIKAP, cabang
- **Pagination** with configurable page size
- **Error handling** with proper HTTP status codes
- **Duplicate prevention** for NIKAP and NIK KTP

### ✅ Frontend Integration
- **Real-time data fetching** with React Query
- **Optimistic updates** for better UX
- **Loading states** with spinners
- **Error handling** with user feedback
- **Form validation** on both client and server
- **Auto-refresh** after mutations

## 🔒 Security Features

1. **Input Validation**: Server-side validation for required fields
2. **Duplicate Prevention**: Checks for existing NIKAP/NIK KTP
3. **Soft Delete**: Records are never permanently deleted
4. **TypeScript**: Full type safety throughout the stack
5. **SQL Injection Protection**: Parameterized queries via Supabase

## 📊 Database Schema Overview

```sql
anggota table:
├── id (UUID, Primary Key)
├── nikap (Unique, Required)
├── nik_ktp (Unique, Required)
├── nama (Required)
├── status_anggota (Required)
├── jenis_anggota (Required)
├── status_iuran (Required)
├── status_kesehatan (Required)
├── tempat_lahir (Required)
├── tanggal_lahir (Date, Required)
├── jenis_kelamin (Required)
├── agama (Required)
├── golongan_darah (Optional)
├── status_perkawinan (Required)
├── no_kk (Unique, Optional)
├── surat_nikah (Optional)
├── sk_pensiun (Required)
├── nomor_kontak (Required)
├── email (Optional)
├── alamat (Required)
├── rt, rw (Required)
├── kelurahan, kecamatan, kota, kode_pos (Required)
├── cabang_domisili (Required)
├── created_at, updated_at (Automatic)
└── deleted_at (Soft Delete)
```

## 🧪 Testing the API

You can test the API using curl or Postman:

```bash
# Get all members
curl http://localhost:3000/api/anggota

# Create new member
curl -X POST http://localhost:3000/api/anggota \
  -H "Content-Type: application/json" \
  -d '{
    "nikap": "19801234",
    "nik_ktp": "3201123456789012",
    "nama": "Test User",
    "status_anggota": "Aktif",
    "jenis_anggota": "Pensiunan",
    "status_iuran": "Lunas",
    "status_kesehatan": "Sehat",
    "tempat_lahir": "Jakarta",
    "tanggal_lahir": "1960-01-01",
    "jenis_kelamin": "Laki-laki",
    "agama": "Islam",
    "status_perkawinan": "Menikah",
    "sk_pensiun": "SKP-12345",
    "nomor_kontak": "08123456789",
    "alamat": "Jl. Test No. 1",
    "rt": "001",
    "rw": "001",
    "kelurahan": "Test",
    "kecamatan": "Test",
    "kota": "Jakarta",
    "kode_pos": "12345",
    "cabang_domisili": "Cabang Jakarta"
  }'
```

## 🐛 Troubleshooting

### Issue: "Supabase client not configured"
**Solution**: Check your `.env` file and ensure variables are set

### Issue: "Table doesn't exist"
**Solution**: Run the database migration SQL in Supabase dashboard

### Issue: "Form not submitting"
**Solution**: Check browser console for errors, ensure API is running

### Issue: "Data not showing in table"
**Solution**: Check Supabase dashboard to confirm data was created, check browser console for API errors

## 🎉 Next Steps

1. **Complete the form inputs** - Add controlled inputs for all remaining form fields
2. **Add edit functionality** - Connect the pencil button to edit modal
3. **Add validation** - Enhance form validation with real-time feedback
4. **Add file uploads** - Allow uploading documents (SK Pensiun, etc.)
5. **Add export feature** - Export member data to Excel/PDF
6. **Add audit log** - Track who made changes to member data

The backend is now fully functional and ready to use! 🚀