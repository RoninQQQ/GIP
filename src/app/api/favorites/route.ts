import { NextResponse } from 'next/server';
import { getDb } from '@/lib/db';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId') || request.headers.get('x-user-id');

    if (!userId) {
      return NextResponse.json({ error: 'Kullanıcı ID gereklidir' }, { status: 400 });
    }

    const db = getDb();
    const rows = db.prepare('SELECT listing_id FROM favorites WHERE user_id = ?').all(userId) as { listing_id: string }[];
    const favorites = rows.map((r) => r.listing_id);

    return NextResponse.json({ favorites });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Favoriler yüklenemedi';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { userId, listingId } = body;

    if (!userId || !listingId) {
      return NextResponse.json({ error: 'Kullanıcı ve ilan ID gereklidir' }, { status: 400 });
    }

    const db = getDb();
    const createdAt = new Date().toISOString();
    db.prepare(`
      INSERT OR IGNORE INTO favorites (user_id, listing_id, created_at)
      VALUES (?, ?, ?)
    `).run(userId, listingId, createdAt);

    return NextResponse.json({ success: true, favorited: true });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Favori eklenemedi';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    let userId = searchParams.get('userId');
    let listingId = searchParams.get('listingId');

    if (!userId || !listingId) {
      try {
        const body = await request.json();
        userId = userId || body.userId;
        listingId = listingId || body.listingId;
      } catch {
        // Body might be empty if query params used
      }
    }

    if (!userId || !listingId) {
      return NextResponse.json({ error: 'Kullanıcı ve ilan ID gereklidir' }, { status: 400 });
    }

    const db = getDb();
    db.prepare('DELETE FROM favorites WHERE user_id = ? AND listing_id = ?').run(userId, listingId);

    return NextResponse.json({ success: true, favorited: false });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Favori silinemedi';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
