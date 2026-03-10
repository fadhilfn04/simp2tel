import { NextRequest, NextResponse } from 'next/server';
import { uploadToSupabaseStorage, deleteFromSupabaseStorage, DanaKematianFolder } from '@/lib/supabase-storage';

// POST /api/upload - Upload file to Supabase storage
export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File;
    const folder = formData.get('folder') as DanaKematianFolder;

    if (!file) {
      return NextResponse.json(
        { error: 'No file provided' },
        { status: 400 }
      );
    }

    if (!folder) {
      return NextResponse.json(
        { error: 'No folder specified' },
        { status: 400 }
      );
    }

    // Validate folder
    const validFolders: DanaKematianFolder[] = [
      'sk-pensiun',
      'surat-kematian',
      'surat-pernyataan-ahli-waris',
      'kartu-keluarga',
      'e-ktp',
      'surat-nikah'
    ];

    if (!validFolders.includes(folder)) {
      return NextResponse.json(
        { error: 'Invalid folder specified' },
        { status: 400 }
      );
    }

    // Upload file
    const url = await uploadToSupabaseStorage(file, folder);

    return NextResponse.json({
      success: true,
      url,
    });

  } catch (error) {
    console.error('Error uploading file:', error);
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : 'Failed to upload file',
        success: false
      },
      { status: 500 }
    );
  }
}

// DELETE /api/upload - Delete file from Supabase storage
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const url = searchParams.get('url');

    if (!url) {
      return NextResponse.json(
        { error: 'No file URL provided' },
        { status: 400 }
      );
    }

    // Delete file
    await deleteFromSupabaseStorage(url);

    return NextResponse.json({
      success: true,
      message: 'File deleted successfully',
    });

  } catch (error) {
    console.error('Error deleting file:', error);
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : 'Failed to delete file',
        success: false
      },
      { status: 500 }
    );
  }
}
