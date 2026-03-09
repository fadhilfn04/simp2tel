# Anggota Components

Modular component structure for member management system.

## 📁 Structure

```
components/anggota/
├── MemberFormModal.tsx       # Reusable form modal for create/edit
├── DetailModal.tsx            # Member detail view modal
├── DeleteConfirmDialog.tsx    # Delete confirmation dialog
├── ImportExcelModal.tsx       # Excel import functionality
├── ToastNotification.tsx      # Toast notification component
├── index.ts                   # Export file for easy imports
└── README.md                  # This file
```

## 🔧 Components

### MemberFormModal
Reusable modal component for both creating and editing members.

**Props:**
- `open`: boolean - Modal open state
- `onClose`: () => void - Close handler
- `onSubmit`: (data) => Promise<void> - Form submit handler
- `member?: Anggota | null` - Member data for edit mode
- `mode: 'create' | 'edit'` - Form mode
- `isPending: boolean` - Submit loading state

**Usage:**
```tsx
<MemberFormModal
  open={addModalOpen}
  onClose={() => setAddModalOpen(false)}
  onSubmit={handleCreate}
  mode="create"
  isPending={createMutation.isPending}
/>
```

### DetailModal
Displays complete member information in a modal.

**Props:**
- `open`: boolean - Modal open state
- `onClose`: () => void - Close handler
- `member: Anggota | null` - Member data to display

**Usage:**
```tsx
<DetailModal
  open={detailModalOpen}
  onClose={() => setDetailModalOpen(false)}
  member={selectedMember}
/>
```

### DeleteConfirmDialog
Confirmation dialog for deleting members.

**Props:**
- `open`: boolean - Modal open state
- `onClose`: () => void - Close handler
- `onConfirm`: () => Promise<void> - Confirm handler
- `member: Anggota | null` - Member to delete
- `isPending: boolean` - Delete loading state

**Usage:**
```tsx
<DeleteConfirmDialog
  open={deleteConfirmOpen}
  onClose={() => setDeleteConfirmOpen(false)}
  onConfirm={handleDelete}
  member={memberToDelete}
  isPending={deleteMutation.isPending}
/>
```

### ImportExcelModal
Modal for importing member data from Excel files.

**Props:**
- `open`: boolean - Modal open state
- `onClose`: () => void - Close handler
- `onImport`: (data: any[]) => Promise<{success: number, error: number}>` - Import handler

**Features:**
- Excel file upload (.xlsx, .xls, .csv)
- Template download
- Data preview
- Progress tracking
- Validation (required: nik_ktp, nama, tempat_lahir)

**Usage:**
```tsx
<ImportExcelModal
  open={importModalOpen}
  onClose={() => setImportModalOpen(false)}
  onImport={handleImport}
/>
```

### ToastNotification
Toast notification component for user feedback.

**Props:**
- `show: boolean` - Toast visibility
- `message: string` - Toast message
- `type: 'success' | 'error' | 'info'` - Toast type
- `onClose: () => void` - Close handler

**Usage:**
```tsx
<ToastNotification
  show={toast.show}
  message={toast.message}
  type={toast.type}
  onClose={hideToast}
/>
```

## 📦 Benefits

1. **Modularity**: Each component is self-contained and reusable
2. **Maintainability**: Easy to update individual components
3. **Testability**: Components can be tested independently
4. **Type Safety**: Full TypeScript support
5. **Code Reuse**: MemberFormModal handles both create and edit
6. **Clean Code**: Main page is now much cleaner and easier to understand

## 🚀 Main Page Structure

The main `page.tsx` is now much cleaner:
- Table rendering and pagination
- State management
- API hooks
- Event handlers
- Component composition

**Before:** 1700+ lines in single file
**After:** ~300 lines + modular components

## 💡 Best Practices

1. **Keep components focused**: Each component has a single responsibility
2. **Use TypeScript interfaces**: Type safety for all props
3. **Consistent naming**: Clear, descriptive component names
4. **Reusable logic**: MemberFormModal handles both create/edit
5. **Proper error handling**: All async operations have error handling
6. **User feedback**: Toast notifications for all actions

## 🎯 Future Enhancements

- Add filtering/sorting to ImportExcelModal
- Add batch operations (bulk delete, bulk update)
- Add export functionality (export to Excel/PDF)
- Add advanced search filters
- Add data visualization/dashboard
- Add audit log for tracking changes