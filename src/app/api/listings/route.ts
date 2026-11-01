import { NextResponse } from 'next/server';
import { getDb } from '@/lib/db';
import { Listing } from '@/lib/types';

function isLocalhostRequest(request: Request): boolean {
  const host = request.headers.get('host') || '';
  const xForwardedFor = request.headers.get('x-forwarded-for');
  const hostname = host.split(':')[0].toLowerCase();

  const isLocalHostName = hostname === 'localhost' || hostname === '127.0.0.1' || hostname === '::1';
  const isLocalIp = !xForwardedFor || xForwardedFor.split(',').every((ip) => {
    const trimmed = ip.trim().toLowerCase().replace(/^::ffff:/, '');
    return trimmed === '127.0.0.1' || trimmed === '::1' || trimmed === 'localhost';
  });

  return isLocalHostName && isLocalIp;
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const isTestUser = searchParams.get('isTestUser') === 'true';
    const isLocal = isLocalhostRequest(request);

    const allowTestListing = isTestUser && isLocal;

    const db = getDb();
    let query = 'SELECT * FROM listings';
    if (!allowTestListing) {
      query += " WHERE is_test_listing = 0 AND seller_id != 'usr_test_local' AND seller_id != 'usr-test-1'";
    }
    query += ' ORDER BY rowid DESC';

    const rows = db.prepare(query).all() as Array<{
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
      is_test_listing: number;
    }>;

    const listings: Listing[] = rows.map((row) => ({
      id: row.id,
      title: row.title,
      category: row.category as Listing['category'],
      price: {
        try: row.price_try,
        usd: row.price_usd,
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

    return NextResponse.json({ listings });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'İlanlar getirilemedi';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const {
      title,
      category,
      price,
      province,
      district,
      condition,
      cover,
      images,
      description,
      specs,
      seller,
      sellerId,
      isTestListing,
    } = body;

    const db = getDb();
    const id = body.id || 'dp_item_' + Date.now();
    const date = body.date || 'Bugün';

    const priceTry = typeof price === 'object' ? price.try : Number(price) || 0;
    const priceUsd = typeof price === 'object' ? price.usd : Math.round((Number(price) || 0) / 34);

    const imagesJson = JSON.stringify(Array.isArray(images) && images.length > 0 ? images : [cover || '/images/listings/test-item/cover.svg']);
    const specsJson = JSON.stringify(specs || {});
    const resolvedSellerId = sellerId || seller?.id || 'usr_anon';
    const isTestFlag = isTestListing || resolvedSellerId === 'usr_test_local' || resolvedSellerId === 'usr-test-1' ? 1 : 0;

    db.prepare(`
      INSERT INTO listings (
        id, title, category, price_try, price_usd, province, district, condition, date,
        cover, images_json, description, specs_json, seller_id, seller_name, seller_rating, seller_deals, seller_since, is_test_listing
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(
      id,
      title,
      category,
      priceTry,
      priceUsd,
      province || 'İstanbul',
      district || 'Kadıköy',
      condition || 'İkinci El',
      date,
      cover || (images && images[0]) || '/images/listings/test-item/cover.svg',
      imagesJson,
      description || '',
      specsJson,
      resolvedSellerId,
      seller?.name || 'Kullanıcı',
      seller?.rating || 5.0,
      seller?.dealsCount || 0,
      seller?.memberSince || '2024',
      isTestFlag
    );

    const createdListing: Listing = {
      id,
      title,
      category,
      price: { try: priceTry, usd: priceUsd },
      location: `${province || 'İstanbul'} / ${district || 'Kadıköy'}`,
      condition: condition || 'İkinci El',
      date,
      cover: cover || (images && images[0]) || '/images/listings/test-item/cover.svg',
      images: Array.isArray(images) && images.length > 0 ? images : [cover || '/images/listings/test-item/cover.svg'],
      description: description || '',
      specs: specs || {},
      seller: {
        name: seller?.name || 'Kullanıcı',
        rating: seller?.rating || 5.0,
        dealsCount: seller?.dealsCount || 0,
        memberSince: seller?.memberSince || '2024',
        verified: true,
      },
    };

    return NextResponse.json({ listing: createdListing });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'İlan eklenemedi';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: 'İlan ID gereklidir' }, { status: 400 });
    }

    const db = getDb();
    db.prepare('DELETE FROM listings WHERE id = ?').run(id);

    return NextResponse.json({ success: true });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'İlan silinemedi';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
