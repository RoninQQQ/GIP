import { NextResponse } from 'next/server';
import { getDb } from '@/lib/db';
import turkeyLocations from '@/data/turkey-locations.json';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const provinceIdParam = searchParams.get('provinceId') || searchParams.get('province');

    // Attempt database query
    try {
      const db = getDb();
      if (provinceIdParam) {
        let provinceId = parseInt(provinceIdParam, 10);
        if (isNaN(provinceId)) {
          const provRow = db.prepare('SELECT id FROM provinces WHERE name = ? COLLATE NOCASE').get(provinceIdParam) as { id: number } | undefined;
          if (provRow) provinceId = provRow.id;
        }

        const districts = db.prepare('SELECT id, name FROM districts WHERE province_id = ? ORDER BY name ASC').all(provinceId);
        return NextResponse.json({ districts });
      }

      const provinces = db.prepare('SELECT id, name FROM provinces ORDER BY id ASC').all();
      return NextResponse.json({ provinces });
    } catch {
      // Fallback to static json data if db query fails or static export
      if (provinceIdParam) {
        let found = turkeyLocations.find((p) => String(p.id) === provinceIdParam);
        if (!found) {
          found = turkeyLocations.find((p) => p.name.toLowerCase() === provinceIdParam.toLowerCase());
        }
        const districts = (found ? found.districts : []).map((name, index) => ({
          id: index + 1,
          name,
        }));
        return NextResponse.json({ districts });
      }

      const provinces = turkeyLocations.map((p) => ({ id: p.id, name: p.name }));
      return NextResponse.json({ provinces });
    }
  } catch {
    return NextResponse.json({ error: 'Konumlar yüklenemedi' }, { status: 500 });
  }
}
