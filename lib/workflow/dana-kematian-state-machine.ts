/**
 * Dana Kematian State Machine
 *
 * Manages status transitions and validation rules for death benefit claims
 */

// =====================================================
// TYPES & INTERFACES
// =====================================================

export type DanaKematianStatus =
  | 'dilaporkan'
  | 'pending_dokumen'
  | 'verifikasi_cabang'
  | 'proses_pusat'
  | 'penyaluran'
  | 'selesai'
  | 'ditolak';

export type UserRole = 'cabang' | 'pusat' | 'admin' | 'system';

export interface StateTransition {
  from: DanaKematianStatus;
  to: DanaKematianStatus;
  allowed_roles: UserRole[];
  condition?: (claim: any) => boolean;
  action?: (claim: any, actor: any, data?: any) => Promise<void>;
  requires_approval?: boolean;
  description: string;
}

export interface TransitionResult {
  success: boolean;
  new_status?: DanaKematianStatus;
  message: string;
  required_actions?: string[];
  validation_errors?: string[];
}

export interface ClaimValidation {
  is_valid: boolean;
  can_proceed: boolean;
  missing_documents: string[];
  errors: string[];
  warnings: string[];
}

// =====================================================
// STATE TRANSITIONS CONFIGURATION
// =====================================================

export const STATE_TRANSITIONS: StateTransition[] = [
  // 1. DILAPORKAN → PENDING_DOKUMEN
  {
    from: 'dilaporkan',
    to: 'pending_dokumen',
    allowed_roles: ['cabang', 'admin'],
    description: 'Dokumen belum lengkap, menunggu pelengkapan',
    condition: (claim) => {
      return !areDocumentsComplete(claim);
    }
  },

  // 2. DILAPORKAN → VERIFIKASI_CABANG
  {
    from: 'dilaporkan',
    to: 'verifikasi_cabang',
    allowed_roles: ['cabang', 'admin'],
    description: 'Dokumen lengkap, siap diverifikasi cabang',
    condition: (claim) => {
      return areDocumentsComplete(claim) &&
             claim.cabang_tanggal_awal_terima_berkas !== null;
    }
  },

  // 3. DILAPORKAN → DITOLAK
  {
    from: 'dilaporkan',
    to: 'ditolak',
    allowed_roles: ['cabang', 'pusat', 'admin'],
    description: 'Klaim tidak valid atau tidak memenuhi syarat',
    requires_approval: false
  },

  // 4. PENDING_DOKUMEN → VERIFIKASI_CABANG
  {
    from: 'pending_dokumen',
    to: 'verifikasi_cabang',
    allowed_roles: ['cabang', 'admin'],
    description: 'Dokumen pelengkap diterima, siap diverifikasi',
    condition: (claim) => {
      return areDocumentsComplete(claim);
    }
  },

  // 5. PENDING_DOKUMEN → DITOLAK
  {
    from: 'pending_dokumen',
    to: 'ditolak',
    allowed_roles: ['cabang', 'pusat', 'admin'],
    description: 'Batas waktu pelengkapan habis atau klaim tidak valid',
    requires_approval: false
  },

  // 6. VERIFIKASI_CABANG → PROSES_PUSAT
  {
    from: 'verifikasi_cabang',
    to: 'proses_pusat',
    allowed_roles: ['cabang', 'admin'],
    description: 'Berkas diverifikasi cabang dan dikirim ke pusat',
    condition: (claim) => {
      return claim.cabang_tanggal_kirim_ke_pusat !== null &&
             claim.cabang_status_kelengkapan === 'lengkap';
    }
  },

  // 7. VERIFIKASI_CABANG → DILAPORKAN
  {
    from: 'verifikasi_cabang',
    to: 'dilaporkan',
    allowed_roles: ['pusat', 'admin'],
    description: 'Dikembalikan ke cabang untuk perbaikan',
    requires_approval: false
  },

  // 8. VERIFIKASI_CABANG → DITOLAK
  {
    from: 'verifikasi_cabang',
    to: 'ditolak',
    allowed_roles: ['pusat', 'admin'],
    description: 'Verifikasi pusat menemukan ketidaksesuaian',
    requires_approval: true
  },

  // 9. PROSES_PUSAT → PENYALURAN
  {
    from: 'proses_pusat',
    to: 'penyaluran',
    allowed_roles: ['pusat', 'admin'],
    description: 'Dana disetujui dan ditransfer ke cabang, siap disalurkan',
    condition: (claim) => {
      return claim.besaran_dana_kematian > 0 &&
             claim.pusat_tanggal_validasi !== null;
    }
  },

  // 10. PROSES_PUSAT → DITOLAK
  {
    from: 'proses_pusat',
    to: 'ditolak',
    allowed_roles: ['pusat', 'admin'],
    description: 'Verifikasi pusat gagal atau klaim tidak disetujui',
    requires_approval: true
  },

  // 11. PENYALURAN → SELESAI
  {
    from: 'penyaluran',
    to: 'selesai',
    allowed_roles: ['cabang', 'admin'],
    description: 'Dana berhasil diserahkan ke ahli waris',
    condition: (claim) => {
      return claim.cabang_tanggal_serah_ke_ahli_waris !== null &&
             claim.cabang_tanggal_lapor_ke_pusat !== null &&
             claim.cabang_bukti_penyerahan !== null;
    }
  },

  // 12. DITOLAK → DILAPORKAN
  {
    from: 'ditolak',
    to: 'dilaporkan',
    allowed_roles: ['admin'],
    description: 'Klaim diajukan ulang dengan dokumen/perbaikan baru',
    requires_approval: true
  }
];

// =====================================================
// VALIDATION FUNCTIONS
// =====================================================

/**
 * Check if all required documents are present
 */
function areDocumentsComplete(claim: any): boolean {
  const requiredDocs = [
    'file_surat_kematian',
    'file_sk_pensiun',
    'file_surat_pernyataan_ahli_waris',
    'file_kartu_keluarga',
    'file_e_ktp'
  ];

  return requiredDocs.every(doc => {
    const value = claim[doc];
    return value !== null && value !== undefined && value !== '';
  });
}

/**
 * Validate claim completeness
 */
export function validateClaim(claim: any): ClaimValidation {
  const validation: ClaimValidation = {
    is_valid: true,
    can_proceed: true,
    missing_documents: [],
    errors: [],
    warnings: []
  };

  // Check required fields
  if (!claim.nama_anggota) {
    validation.errors.push('Nama anggota wajib diisi');
    validation.is_valid = false;
  }

  if (!claim.tanggal_meninggal) {
    validation.errors.push('Tanggal meninggal wajib diisi');
    validation.is_valid = false;
  }

  if (!claim.nama_ahli_waris) {
    validation.errors.push('Nama ahli waris wajib diisi');
    validation.is_valid = false;
  }

  // Check documents
  if (!areDocumentsComplete(claim)) {
    const requiredDocs = [
      { field: 'file_surat_kematian', name: 'Surat Kematian' },
      { field: 'file_sk_pensiun', name: 'SK Pensiun' },
      { field: 'file_surat_pernyataan_ahli_waris', name: 'Surat Pernyataan Ahli Waris' },
      { field: 'file_kartu_keluarga', name: 'Kartu Keluarga' },
      { field: 'file_e_ktp', name: 'KTP Ahli Waris' }
    ];

    requiredDocs.forEach(doc => {
      if (!claim[doc.field]) {
        validation.missing_documents.push(doc.name);
      }
    });

    validation.can_proceed = false;
    validation.warnings.push('Dokumen belum lengkap');
  }

  // Check heir eligibility
  if (!claim.status_ahli_waris) {
    validation.warnings.push('Status hubungan ahli waris belum ditentukan');
  }

  return validation;
}

/**
 * Check if user has permission to perform transition
 */
export function hasPermission(
  transition: StateTransition,
  userRole: UserRole
): boolean {
  return transition.allowed_roles.includes(userRole) || userRole === 'admin';
}

/**
 * Get valid next states for a claim
 */
export function getNextStates(
  currentStatus: DanaKematianStatus,
  userRole: UserRole
): DanaKematianStatus[] {
  return STATE_TRANSITIONS
    .filter(t => t.from === currentStatus)
    .filter(t => hasPermission(t, userRole))
    .map(t => t.to);
}

/**
 * Get transition details between two states
 */
export function getTransition(
  from: DanaKematianStatus,
  to: DanaKematianStatus
): StateTransition | undefined {
  return STATE_TRANSITIONS.find(t => t.from === from && t.to === to);
}

/**
 * Validate if transition is allowed
 */
export function canTransition(
  from: DanaKematianStatus,
  to: DanaKematianStatus,
  userRole: UserRole,
  claim?: any
): TransitionResult {
  const transition = getTransition(from, to);

  if (!transition) {
    return {
      success: false,
      message: `Transisi dari ${from} ke ${to} tidak tersedia`
    };
  }

  if (!hasPermission(transition, userRole)) {
    return {
      success: false,
      message: `User dengan role ${userRole} tidak memiliki izin untuk transisi ini`
    };
  }

  if (transition.condition && claim) {
    try {
      const conditionMet = transition.condition(claim);
      if (!conditionMet) {
        return {
          success: false,
          message: 'Syarat transisi belum terpenuhi',
          validation_errors: getConditionErrors(transition, claim)
        };
      }
    } catch (error) {
      return {
        success: false,
        message: 'Error saat memvalidasi syarat transisi',
        validation_errors: [error instanceof Error ? error.message : 'Unknown error']
      };
    }
  }

  return {
    success: true,
    new_status: to,
    message: transition.description
  };
}

/**
 * Get specific error messages for failed conditions
 */
function getConditionErrors(transition: StateTransition, claim: any): string[] {
  const errors: string[] = [];

  switch (transition.to) {
    case 'verifikasi_cabang':
      if (!areDocumentsComplete(claim)) {
        errors.push('Dokumen belum lengkap');
      }
      if (!claim.cabang_tanggal_awal_terima_berkas) {
        errors.push('Tanggal penerimaan berkas belum diisi');
      }
      break;

    case 'proses_pusat':
      if (!claim.cabang_tanggal_kirim_ke_pusat) {
        errors.push('Tanggal kirim ke pusat belum diisi');
      }
      if (claim.cabang_status_kelengkapan !== 'lengkap') {
        errors.push('Status kelengkapan harus "lengkap"');
      }
      break;

    case 'penyaluran':
      if (!claim.besaran_dana_kematian || claim.besaran_dana_kematian <= 0) {
        errors.push('Besaran dana kematian belum ditentukan');
      }
      if (!claim.pusat_tanggal_validasi) {
        errors.push('Tanggal validasi pusat belum diisi');
      }
      break;

    case 'selesai':
      if (!claim.cabang_tanggal_serah_ke_ahli_waris) {
        errors.push('Tanggal penyerahan ke ahli waris belum diisi');
      }
      if (!claim.cabang_tanggal_lapor_ke_pusat) {
        errors.push('Tanggal lapor ke pusat belum diisi');
      }
      if (!claim.cabang_bukti_penyerahan) {
        errors.push('Bukti penyerahan belum diupload');
      }
      break;
  }

  return errors;
}

// =====================================================
// STATE MACHINE CLASS
// =====================================================

export class DanaKematianStateMachine {
  private claim: any;
  private currentStatus: DanaKematianStatus;

  constructor(claim: any) {
    this.claim = claim;
    this.currentStatus = claim.status_proses || 'dilaporkan';
  }

  /**
   * Get current state
   */
  getCurrentState(): DanaKematianStatus {
    return this.currentStatus;
  }

  /**
   * Get all possible next states
   */
  getPossibleNextStates(userRole: UserRole): DanaKematianStatus[] {
    return getNextStates(this.currentStatus, userRole);
  }

  /**
   * Check if can transition to specific state
   */
  canTransitionTo(to: DanaKematianStatus, userRole: UserRole): TransitionResult {
    return canTransition(this.currentStatus, to, userRole, this.claim);
  }

  /**
   * Execute transition to new state
   */
  async transitionTo(
    to: DanaKematianStatus,
    actor: any,
    data?: any
  ): Promise<TransitionResult> {
    const userRole = actor.role || 'cabang';

    // Validate transition
    const validation = this.canTransitionTo(to, userRole);
    if (!validation.success) {
      return validation;
    }

    const transition = getTransition(this.currentStatus, to);
    if (!transition) {
      return {
        success: false,
        message: 'Transisi tidak tersedia'
      };
    }

    // Execute transition action if defined
    try {
      if (transition.action) {
        await transition.action(this.claim, actor, data);
      }

      // Update claim status
      this.currentStatus = to;
      this.claim.status_proses = to;

      return {
        success: true,
        new_status: to,
        message: `Status berhasil diubah dari ${this.currentStatus} ke ${to}`
      };
    } catch (error) {
      return {
        success: false,
        message: `Gagal melakukan transisi: ${error instanceof Error ? error.message : 'Unknown error'}`
      };
    }
  }

  /**
   * Validate current claim state
   */
  validate(): ClaimValidation {
    return validateClaim(this.claim);
  }

  /**
   * Get required actions for current state
   */
  getRequiredActions(): string[] {
    const actions: Record<DanaKematianStatus, string[]> = {
      'dilaporkan': [
        'Upload semua dokumen yang diperlukan',
        'Verifikasi kelengkapan dokumen',
        'Lengkapi data ahli waris'
      ],
      'pending_dokumen': [
        'Segera lengkapi dokumen yang kurang',
        'Hubungi ahli waris jika diperlukan'
      ],
      'verifikasi_cabang': [
        'Verifikasi keaslian dokumen',
        'Validasi data ahli waris',
        'Kirim berkas ke pusat jika lengkap'
      ],
      'proses_pusat': [
        'Validasi ulang kelengkapan dokumen',
        'Hitung besaran dana kematian',
        'Proses persetujuan dan transfer dana'
      ],
      'penyaluran': [
        'Terima dana dari pusat',
        'Jadwalkan penyerahan ke ahli waris',
        'Serahkan dana dan dokumentasikan'
      ],
      'selesai': [
        'Arsipkan berkas klaim',
        'Buat laporan penyelesaian'
      ],
      'ditolak': [
        'Informasikan alasan penolakan',
        'Jika dapat diajukan ulang, siapkan dokumen perbaikan'
      ]
    };

    return actions[this.currentStatus] || [];
  }

  /**
   * Get state information
   */
  getStateInfo(): {
    current: DanaKematianStatus;
    can_proceed: boolean;
    next_states: DanaKematianStatus[];
    required_actions: string[];
    validation: ClaimValidation;
  } {
    return {
      current: this.currentStatus,
      can_proceed: this.validate().can_proceed,
      next_states: this.getPossibleNextStates('cabang'),
      required_actions: this.getRequiredActions(),
      validation: this.validate()
    };
  }
}

// =====================================================
// HELPER FUNCTIONS
// =====================================================

/**
 * Get state label for display
 */
export function getStateLabel(status: DanaKematianStatus): string {
  const labels: Record<DanaKematianStatus, string> = {
    'dilaporkan': 'Dilaporkan',
    'pending_dokumen': 'Pending Dokumen',
    'verifikasi_cabang': 'Verifikasi Cabang',
    'proses_pusat': 'Proses Pusat',
    'penyaluran': 'Penyaluran',
    'selesai': 'Selesai',
    'ditolak': 'Ditolak'
  };
  return labels[status] || status;
}

/**
 * Get state color for UI
 */
export function getStateColor(status: DanaKematianStatus): string {
  const colors: Record<DanaKematianStatus, string> = {
    'dilaporkan': 'blue',
    'pending_dokumen': 'yellow',
    'verifikasi_cabang': 'cyan',
    'proses_pusat': 'purple',
    'penyaluran': 'orange',
    'selesai': 'green',
    'ditolak': 'red'
  };
  return colors[status] || 'gray';
}

/**
 * Get state badge variant
 */
export function getStateBadgeVariant(status: DanaKematianStatus): 'success' | 'warning' | 'destructive' | 'secondary' {
  const variants: Record<DanaKematianStatus, 'success' | 'warning' | 'destructive' | 'secondary'> = {
    'selesai': 'success',
    'ditolak': 'destructive',
    'pending_dokumen': 'warning',
    'penyaluran': 'warning',
    'dilaporkan': 'secondary',
    'verifikasi_cabang': 'secondary',
    'proses_pusat': 'secondary'
  };
  return variants[status] || 'secondary';
}

/**
 * Calculate processing time in days
 */
export function calculateProcessingTime(claim: any): number {
  if (!claim.tanggal_lapor_keluarga) {
    return 0;
  }

  const startDate = new Date(claim.tanggal_lapor_keluarga);
  const endDate = claim.cabang_tanggal_lapor_ke_pusat
    ? new Date(claim.cabang_tanggal_lapor_ke_pusat)
    : new Date();

  const diffTime = Math.abs(endDate.getTime() - startDate.getTime());
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

  return diffDays;
}

/**
 * Check if claim is overdue
 */
export function isOverdue(claim: any, maxDays: number = 30): boolean {
  const processingDays = calculateProcessingTime(claim);
  return claim.status_proses !== 'selesai' &&
         claim.status_proses !== 'ditolak' &&
         processingDays > maxDays;
}

/**
 * Get stage duration in days
 */
export function getStageDuration(claim: any): {
  dilaporkan: number;
  verifikasi: number;
  proses_pusat: number;
  penyaluran: number;
  total: number;
} {
  const result = {
    dilaporkan: 0,
    verifikasi: 0,
    proses_pusat: 0,
    penyaluran: 0,
    total: 0
  };

  if (claim.tanggal_lapor_keluarga && claim.cabang_tanggal_kirim_ke_pusat) {
    const start = new Date(claim.tanggal_lapor_keluarga);
    const end = new Date(claim.cabang_tanggal_kirim_ke_pusat);
    result.dilaporkan = Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));
  }

  if (claim.cabang_tanggal_kirim_ke_pusat && claim.pusat_tanggal_selesai) {
    const start = new Date(claim.cabang_tanggal_kirim_ke_pusat);
    const end = new Date(claim.pusat_tanggal_selesai);
    result.proses_pusat = Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));
  }

  if (claim.pusat_tanggal_selesai && claim.cabang_tanggal_serah_ke_ahli_waris) {
    const start = new Date(claim.pusat_tanggal_selesai);
    const end = new Date(claim.cabang_tanggal_serah_ke_ahli_waris);
    result.penyaluran = Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));
  }

  if (claim.tanggal_lapor_keluarga && claim.cabang_tanggal_lapor_ke_pusat) {
    const start = new Date(claim.tanggal_lapor_keluarga);
    const end = new Date(claim.cabang_tanggal_lapor_ke_pusat);
    result.total = Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));
  }

  return result;
}
