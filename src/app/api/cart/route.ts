import { NextResponse } from 'next/server';
import { getDb } from '@/lib/db';
import { Listing } from '@/lib/types';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId') || request.headers.get('x-user-id');

    if (!userId) {
      return NextResponse.json({ error: 'Kullanıcı ID gereklidir' }, { status: 400 });
    }

    const db = getDb();
    const rows = db.prepare(`
      SELECT 
        l.id, l.title, l.category, l.price_try, l.price_usd, l.province, l.district,
        l.condition, l.date, l.cover, l.images_json, l.description, l.specs_json,
        l.seller_id, l.seller_name, l.seller_rating, l.seller_deals, l.seller_since,
        c.custom_price_try, c.custom_price_usd, c.added_at
      FROM cart_items c
      JOIN listings l ON c.listing_id = l.id
      WHERE c.user_id = ?
      ORDER BY c.added_at DESC
    `).all(userId) as Array<{
      id: string;
      title: string;
      category: string;
      price_try: number;
      price_usd: number;
      province: string;
      district: string;
      condition: string;
      date: string;
      cover: string;
      images_json: string;
      description: string;
      specs_json: string;
      seller_id: string;
      seller_name: string;
      seller_rating: number;
      seller_deals: number;
      seller_since: string;
      custom_price_try: number | null;
      custom_price_usd: number | null;
      added_at: string;
    }>;

    const items: Listing[] = rows.map((row) => ({
      id: row.id,
      title: row.title,
      category: row.category as Listing['category'],
      price: {
        try: row.custom_price_try != null ? row.custom_price_try : row.price_try,
        usd: row.custom_price_usd != null ? row.custom_price_usd : row.price_usd,
      },
      location: `${row.province} / ${row.district}`,
      condition: row.condition,
      date: row.date,
      cover: row.cover,
      images: (() => {
        try {
          return JSON.parse(row.images_json);
        } catch {
          return [row.cover];
        }
      })(),
      description: row.description,
      specs: (() => {
        try {
          return JSON.parse(row.specs_json);
        } catch {
          return {};
        }
      })(),
      seller: {
        name: row.seller_name,
        rating: row.seller_rating || 5.0,
        dealsCount: row.seller_deals || 0,
        memberSince: row.seller_since || '2024',
        verified: true,
      },
    }));

    return NextResponse.json({ items });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Sepet ürünleri getirilemedi';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { userId, listingId, customPriceTry, customPriceUsd } = body;

    if (!userId || !listingId) {
      return NextResponse.json({ error: 'Kullanıcı ve ilan ID gereklidir' }, { status: 400 });
    }

    const db = getDb();
    const addedAt = new Date().toISOString();

    db.prepare(`
      INSERT INTO cart_items (user_id, listing_id, custom_price_try, custom_price_usd, added_at)
      VALUES (?, ?, ?, ?, ?)
      ON CONFLICT(user_id, listing_id) DO UPDATE SET
        custom_price_try = excluded.custom_price_try,
        custom_price_usd = excluded.custom_price_usd,
        added_at = excluded.added_at
    `).run(userId, listingId, customPriceTry ?? null, customPriceUsd ?? null, addedAt);

    return NextResponse.json({ success: true });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Ürün sepete eklenemedi';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    let userId = searchParams.get('userId');
    let listingId = searchParams.get('listingId');

    if (!userId) {
      try {
        const body = await request.json();
        userId = userId || body.userId;
        listingId = listingId || body.listingId;
      } catch {
        // Body might be empty
      }
    }

    if (!userId) {
      return NextResponse.json({ error: 'Kullanıcı ID gereklidir' }, { status: 400 });
    }

    const db = getDb();

    if (listingId) {
      db.prepare('DELETE FROM cart_items WHERE user_id = ? AND listing_id = ?').run(userId, listingId);
    } else {
      // Clear entire cart for this user
      db.prepare('DELETE FROM cart_items WHERE user_id = ?').run(userId);
    }

    return NextResponse.json({ success: true });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Sepetten kaldırılamadı';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
