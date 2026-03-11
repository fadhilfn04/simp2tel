# Dana Kematian - Quick Start Guide

## 🚀 Quick Setup

### 1. Run Database Migrations

```bash
# Apply the enhanced workflow migration
npx supabase db push

# Or manually run the SQL
psql -U postgres -d your_database -f supabase/migrations/006_enhance_dana_kematian_workflow.sql
```

### 2. Verify Tables Created

```sql
-- Check new tables
SELECT table_name
FROM information_schema.tables
WHERE table_schema = 'public'
  AND table_name LIKE '%dana_kematian%';
```

Expected tables:
- `dana_kematian` (enhanced)
- `dokumen_kematian`
- `riwayat_proses_dakem`
- `perhitungan_dana_kematian`
- `audit_dana_kematian`

---

## 📚 Using the Workflow System

### Basic Workflow Operations

```typescript
import {
  DanaKematianWorkflowService,
  DanaKematianStateMachine
} from '@/lib/workflow/dana-kematian-workflow-service';

// =====================================================
// 1. CREATE NEW CLAIM
// =====================================================

const newClaim = await DanaKematianWorkflowService.createClaim(
  {
    nama_anggota: 'Ahmad Subardjo',
    status_anggota: 'pegawai',
    status_mps: 'mps',
    tanggal_meninggal: '2024-01-15',
    penyebab_meninggal: 'Sakit',
    tanggal_lapor_keluarga: '2024-01-20',
    cabang_asal_melapor: 'P2TEL Jakarta',
    cabang_nama_pelapor: 'Budi Santoso',
    nama_ahli_waris: 'Siti Aminah',
    status_ahli_waris: 'istri',
    file_surat_kematian: '/uploads/sk-kematian.pdf',
    file_sk_pensiun: '/uploads/sk-pensiun.pdf',
    // ... other files
  },
  {
    action: 'create',
    actor_id: 'user-123',
    actor_name: 'Budi Santoso',
    actor_role: 'cabang',
    actor_cabang: 'P2TEL Jakarta'
  }
);

console.log(newClaim.success ? 'Claim created!' : newClaim.error);
// Status: 'dilaporkan' or 'pending_dokumen' based on document completeness

// =====================================================
// 2. TRANSITION CLAIM STATUS
// =====================================================

// Verify documents at branch and send to center
const result = await DanaKematianWorkflowService.transitionClaim(
  'claim-uuid-here',
  'verifikasi_cabang',
  {
    action: 'transition',
    actor_id: 'user-123',
    actor_name: 'Budi Santoso',
    actor_role: 'cabang',
    actor_cabang: 'P2TEL Jakarta',
    catatan: 'Dokumen lengkap dan valid'
  }
);

console.log(result.success ? 'Transition successful!' : result.message);

// =====================================================
// 3. CALCULATE BENEFIT AMOUNT
// =====================================================

const calculation = await DanaKematianWorkflowService.calculateBenefit(
  'claim-uuid-here',
  {
    action: 'calculate',
    actor_id: 'user-456',
    actor_name: 'Admin Pusat',
    actor_role: 'pusat'
  }
);

console.log(`Total Dana: ${calculation.amount}`);
console.log(`Breakdown:`, calculation.breakdown);

// =====================================================
// 4. UPLOAD DOCUMENTS
// =====================================================

const upload = await DanaKematianWorkflowService.uploadDocument(
  'claim-uuid-here',
  {
    jenis_dokumen: 'surat_kematian',
    nama_file: 'sk-kematian-ahmad.pdf',
    url_file: 'https://storage.example.com/files/sk-kematian.pdf',
    ukuran_file: 1024000,
    mime_type: 'application/pdf'
  },
  {
    action: 'document_upload',
    actor_id: 'user-123',
    actor_name: 'Budi Santoso',
    actor_role: 'cabang'
  }
);

console.log(upload.completeness); // { is_complete: true/false, missing: [...] }

// =====================================================
// 5. GET CLAIM SUMMARY (DASHBOARD)
// =====================================================

const summaries = await DanaKematianWorkflowService.getClaimSummary({
  status: 'proses_pusat',
  limit: 10
);

summaries.forEach(summary => {
  console.log(`
    Anggota: ${summary.nama_anggota}
    Status: ${summary.status_proses}
    Processing Days: ${summary.processing_days}
    Overdue: ${summary.is_overdue ? 'YES' : 'NO'}
    Required Actions: ${summary.required_actions.join(', ')}
  `);
});
```

---

## 🎯 State Machine Usage

```typescript
import { DanaKematianStateMachine } from '@/lib/workflow/dana-kematian-state-machine';

// Get current claim
const { data: claim } = await supabase
  .from('dana_kematian')
  .select('*')
  .eq('id', 'claim-uuid')
  .single();

// Create state machine instance
const machine = new DanaKematianStateMachine(claim);

// Check current state
console.log(machine.getCurrentState()); // 'dilaporkan'

// Get possible next states for user role
const nextStates = machine.getPossibleNextStates('cabang');
console.log(nextStates); // ['verifikasi_cabang', 'pending_dokumen', 'ditolak']

// Validate claim
const validation = machine.validate();
console.log(validation.can_proceed); // true/false
console.log(validation.missing_documents); // ['SK Pensiun', 'KTP Ahli Waris']

// Get required actions
const actions = machine.getRequiredActions();
console.log(actions);
// ['Upload semua dokumen yang diperlukan', 'Verifikasi kelengkapan dokumen']

// Get complete state info
const stateInfo = machine.getStateInfo();
console.log(stateInfo);
// {
//   current: 'dilaporkan',
//   can_proceed: false,
//   next_states: ['verifikasi_cabang', 'pending_dokumen'],
//   required_actions: [...],
//   validation: {...}
// }
```

---

## 🔌 API Integration Examples

### Frontend Component Usage

```typescript
'use client';

import { useState } from 'react';
import { useDanaKematianList } from '@/lib/hooks/use-dana-kematian-api';
import { DanaKematianStateMachine } from '@/lib/workflow/dana-kematian-state-machine';

export function DanaKematianTable() {
  const { data, isLoading } = useDanaKematianList({
    status: 'proses_pusat',
    limit: 10
  });

  const handleTransition = async (claimId: string, newStatus: string) => {
    const response = await fetch(`/api/dana-kematian/${claimId}/transition`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        to_status: newStatus,
        catatan: 'Status diubah',
        actor_id: 'current-user-id',
        actor_role: 'pusat'
      })
    });

    const result = await response.json();
    if (result.success) {
      // Refresh data
      refetch();
    }
  };

  if (isLoading) return <div>Loading...</div>;

  return (
    <table>
      <thead>
        <tr>
          <th>Nama Anggota</th>
          <th>Status</th>
          <th>Processing Days</th>
          <th>Actions</th>
        </tr>
      </thead>
      <tbody>
        {data?.data?.map(claim => {
          const machine = new DanaKematianStateMachine(claim);
          const nextStates = machine.getPossibleNextStates('pusat');
          const stateInfo = machine.getStateInfo();

          return (
            <tr key={claim.id}>
              <td>{claim.nama_anggota}</td>
              <td>{claim.status_proses}</td>
              <td>{stateInfo.validation.processing_days} days</td>
              <td>
                {nextStates.map(nextState => (
                  <button
                    key={nextState}
                    onClick={() => handleTransition(claim.id, nextState)}
                  >
                    {nextState}
                  </button>
                ))}
              </td>
            </tr>
          );
        })}
      </tbody>
    </table>
  );
}
```

### Custom Hook for Workflow

```typescript
// lib/hooks/use-dana-kematian-workflow.ts
import { useMutation, useQuery } from '@tanstack/react-query';

export function useDanaKematianWorkflow() {
  // Transition claim
  const transitionMutation = useMutation({
    mutationFn: async ({
      claimId,
      toStatus,
      data
    }: {
      claimId: string;
      toStatus: string;
      data: any;
    }) => {
      const response = await fetch(`/api/dana-kematian/${claimId}/transition`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });
      return response.json();
    }
  });

  // Calculate benefit
  const calculateMutation = useMutation({
    mutationFn: async (claimId: string) => {
      const response = await fetch(`/api/dana-kematian/${claimId}/calculate`, {
        method: 'POST'
      });
      return response.json();
    }
  });

  // Upload document
  const uploadDocumentMutation = useMutation({
    mutationFn: async ({
      claimId,
      document
    }: {
      claimId: string;
      document: any;
    }) => {
      const formData = new FormData();
      Object.entries(document).forEach(([key, value]) => {
        formData.append(key, value as any);
      });

      const response = await fetch(`/api/dana-kematian/${claimId}/documents`, {
        method: 'POST',
        body: formData
      });
      return response.json();
    }
  });

  return {
    transitionClaim: transitionMutation.mutateAsync,
    isTransitioning: transitionMutation.isPending,
    calculateBenefit: calculateMutation.mutateAsync,
    isCalculating: calculateMutation.isPending,
    uploadDocument: uploadDocumentMutation.mutateAsync,
    isUploading: uploadDocumentMutation.isPending
  };
}
```

---

## 📊 Common Scenarios

### Scenario 1: Complete Claim Flow

```typescript
// 1. Family reports death
const claim = await DanaKematianWorkflowService.createClaim(data, actor);
// Status: 'dilaporkan'

// 2. Branch verifies documents
await DanaKematianWorkflowService.transitionClaim(
  claim.id,
  'verifikasi_cabang',
  { actor: branchActor, catatan: 'Dokumen lengkap' }
);
// Status: 'verifikasi_cabang'

// 3. Branch sends to center
await DanaKematianWorkflowService.transitionClaim(
  claim.id,
  'proses_pusat',
  { actor: branchActor }
);
// Status: 'proses_pusat'

// 4. Center calculates benefit
const calc = await DanaKematianWorkflowService.calculateBenefit(claim.id, centerActor);
// Status: 'proses_pusat', besaran_dana_kematian set

// 5. Center approves
await DanaKematianWorkflowService.transitionClaim(
  claim.id,
  'penyaluran',
  { actor: centerActor, data: { besaran_dana: calc.amount } }
);
// Status: 'penyaluran'

// 6. Branch distributes to heir
await DanaKematianWorkflowService.transitionClaim(
  claim.id,
  'selesai',
  {
    actor: branchActor,
    data: {
      tanggal_penyerahan: '2024-02-05',
      bukti_penyerahan: '/uploads/bukti.jpg'
    }
  }
);
// Status: 'selesai'
```

### Scenario 2: Incomplete Documents

```typescript
// 1. Create claim with missing documents
const claim = await DanaKematianWorkflowService.createClaim(
  { ...data, file_sk_pensiun: undefined }, // Missing
  actor
);
// Status: 'pending_dokumen'

// 2. System requests missing documents
const machine = new DanaKematianStateMachine(claim);
const validation = machine.validate();
console.log(validation.missing_documents); // ['SK Pensiun']

// 3. Family uploads missing document
await DanaKematianWorkflowService.uploadDocument(
  claim.id,
  {
    jenis_dokumen: 'sk_pensiun',
    nama_file: 'sk-pensiun.pdf',
    url_file: '/uploads/sk-pensiun.pdf'
  },
  actor
);

// 4. System auto-updates status if complete
// Status: 'verifikasi_cabang'
```

### Scenario 3: Reject Claim

```typescript
// 1. Create claim
const claim = await DanaKematianWorkflowService.createClaim(data, actor);

// 2. Center rejects (invalid member)
await DanaKematianWorkflowService.transitionClaim(
  claim.id,
  'ditolak',
  {
    actor: centerActor,
    catatan: 'Anggota tidak terdaftar sebagai penerima manfaat',
    data: { alasan: 'Kategori anggota tidak eligible' }
  }
);
// Status: 'ditolak'

// 3. Family can resubmit with new evidence
await DanaKematianWorkflowService.transitionClaim(
  claim.id,
  'dilaporkan',
  {
    actor: adminActor,
    catatan: 'Diajukan ulang dengan bukti tambahan'
  }
);
// Status: 'dilaporkan'
```

---

## 🔍 Query Examples

### Get Claims by Status

```sql
-- Get all claims in progress
SELECT
    dk.*,
    EXTRACT(DAY FROM AGE(COALESCE(dk.cabang_tanggal_lapor_ke_pusat, NOW()), dk.tanggal_lapor_keluarga)) as processing_days
FROM dana_kematian dk
WHERE dk.deleted_at IS NULL
  AND dk.status_proses IN ('dilaporkan', 'pending_dokumen', 'verifikasi_cabang', 'proses_pusat', 'penyaluran')
ORDER BY dk.tanggal_lapor_keluarga DESC;
```

### Get Overdue Claims

```sql
-- Get claims processing for more than 30 days
SELECT
    dk.id,
    dk.nama_anggota,
    dk.status_proses,
    dk.cabang_asal_melapor,
    dk.tanggal_lapor_keluarga,
    EXTRACT(DAY FROM AGE(NOW(), dk.tanggal_lapor_keluarga)) as days_in_process
FROM dana_kematian dk
WHERE dk.deleted_at IS NULL
  AND dk.status_proses != 'selesai'
  AND EXTRACT(DAY FROM AGE(NOW(), dk.tanggal_lapor_keluarga)) > 30
ORDER BY days_in_process DESC;
```

### Get Document Completeness

```sql
-- Get claims with document status
SELECT
    dk.id,
    dk.nama_anggota,
    dk.status_proses,
    dk.cabang_status_kelengkapan,
    COUNT(doc.id) as total_dokumen,
    COUNT(doc.id) FILTER (WHERE doc.status_verifikasi = 'valid') as dokumen_valid,
    ARRAY_AGG(doc.jenis_dokumen) FILTER (WHERE doc.id IS NULL) as missing_docs
FROM dana_kematian dk
LEFT JOIN dokumen_kematian doc ON doc.dana_kematian_id = dk.id AND doc.deleted_at IS NULL
WHERE dk.deleted_at IS NULL
GROUP BY dk.id, dk.nama_anggota, dk.status_proses, dk.cabang_status_kelengkapan
ORDER BY dk.created_at DESC;
```

### Get Processing Statistics

```sql
-- Average processing time by status
SELECT
    status_proses,
    COUNT(*) as jumlah,
    ROUND(AVG(EXTRACT(DAY FROM AGE(
        COALESCE(cabang_tanggal_lapor_ke_pusat, pusat_tanggal_selesai, NOW()),
        tanggal_lapor_keluarga
    ))), 2) as rata_rata_hari
FROM dana_kematian
WHERE deleted_at IS NULL
    AND status_proses = 'selesai'
GROUP BY status_proses;
```

---

## 🐛 Troubleshooting

### Common Issues

**Issue: Transition not allowed**
```typescript
// Check permissions
const machine = new DanaKematianStateMachine(claim);
const nextStates = machine.getPossibleNextStates('cabang');
console.log('Allowed states:', nextStates);

// Check validation
const validation = canTransition(
  claim.status_proses,
  'proses_pusat',
  'cabang', // Wrong role!
  claim
);
console.log(validation.validation_errors);
```

**Issue: Documents not uploading**
```typescript
// Check document completeness
const completeness = await DanaKematianWorkflowService.checkDocumentCompleteness(claimId);
console.log('Missing:', completeness.missing);

// Verify file upload
const { data: doc } = await supabase
  .from('dokumen_kematian')
  .select('*')
  .eq('dana_kematian_id', claimId);
```

**Issue: State stuck**
```sql
-- Check history
SELECT * FROM riwayat_proses_dakem
WHERE dana_kematian_id = 'claim-uuid'
ORDER BY timestamp DESC;

-- Check audit log
SELECT * FROM audit_dana_kematian
WHERE dana_kematian_id = 'claim-uuid'
ORDER BY created_at DESC;
```

---

## 📚 Additional Resources

- [Full Workflow Documentation](./dana-kematian-workflow.md)
- [Database Schema](../../supabase/migrations/006_enhance_dana_kematian_workflow.sql)
- [State Machine Source](../../lib/workflow/dana-kematian-state-machine.ts)
- [Workflow Service Source](../../lib/workflow/dana-kematian-workflow-service.ts)

---

## 🎯 Best Practices

1. **Always validate before transitioning**
   ```typescript
   const validation = validateClaim(claim);
   if (!validation.can_proceed) {
     return { error: validation.errors };
   }
   ```

2. **Log all state changes**
   ```typescript
   await DanaKematianWorkflowService.transitionClaim(
     claimId, newStatus, actor,
     { notify_stakeholders: true }
   );
   ```

3. **Use state machine for checks**
   ```typescript
   const machine = new DanaKematianStateMachine(claim);
   if (!machine.canTransitionTo('proses_pusat', 'cabang').success) {
     return { error: 'Transition not allowed' };
   }
   ```

4. **Calculate benefits before approval**
   ```typescript
   await DanaKematianWorkflowService.calculateBenefit(claimId, actor);
   await DanaKematianWorkflowService.transitionClaim(claimId, 'penyaluran', actor);
   ```

5. **Handle documents properly**
   ```typescript
   const upload = await DanaKematianWorkflowService.uploadDocument(...);
   if (!upload.completeness.is_complete) {
     // Inform user of missing documents
   }
   ```

---

*Last Updated: 2026-03-11*
