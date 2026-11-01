import { NextResponse } from 'next/server';
import { getDb, hashPassword, verifyPassword } from '@/lib/db';
import { testAccount } from '@/lib/config';

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

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { action, email, password, name, province, district } = body;

    const db = getDb();

    if (action === 'login') {
      const isTestEmail = email.toLowerCase() === testAccount.email.toLowerCase();

      if (isTestEmail) {
        if (!isLocalhostRequest(request)) {
          return NextResponse.json(
            { error: 'Test hesabı yalnızca yerel geliştirme (127.0.0.1) ortamında kullanılabilir' },
            { status: 403 }
          );
        }

        if (password !== testAccount.password) {
          return NextResponse.json({ error: 'Geçersiz test hesabı şifresi' }, { status: 401 });
        }

        // Fetch or create test user
        let userRow = db.prepare('SELECT * FROM users WHERE email = ?').get(testAccount.email) as Record<string, unknown> | undefined;
        if (!userRow) {
          const hashed = hashPassword(testAccount.password);
          db.prepare(`
            INSERT INTO users (id, name, email, password_hash, province, district, rating, deals_count, member_since, verified, is_test_account)
            VALUES (?, ?, ?, ?, ?, ?, 5.0, 12, '2024', 1, 1)
          `).run('usr_test_local', testAccount.name, testAccount.email, hashed, testAccount.city, 'Kadıköy');
          userRow = db.prepare('SELECT * FROM users WHERE email = ?').get(testAccount.email) as Record<string, unknown>;
        }

        const favRows = db.prepare('SELECT listing_id FROM favorites WHERE user_id = ?').all(userRow.id) as { listing_id: string }[];
        const favorites = favRows.map((f) => f.listing_id);

        return NextResponse.json({
          user: {
            id: userRow.id,
            name: userRow.name,
            email: userRow.email,
            city: `${userRow.province} / ${userRow.district}`,
            province: userRow.province,
            district: userRow.district,
            rating: userRow.rating,
            dealsCount: userRow.deals_count,
            memberSince: userRow.member_since,
            verified: Boolean(userRow.verified),
            isTestAccount: true,
            favorites,
          },
        });
      }

      // Standard user login with password hash check
      const userRow = db.prepare('SELECT * FROM users WHERE email = ?').get(email) as Record<string, unknown> | undefined;
      if (!userRow) {
        return NextResponse.json({ error: 'Hatalı e-posta veya şifre' }, { status: 401 });
      }

      const storedHash = String(userRow.password_hash || '');
      const isPasswordValid = verifyPassword(password, storedHash) || storedHash === password;
      if (!isPasswordValid) {
        return NextResponse.json({ error: 'Hatalı e-posta veya şifre' }, { status: 401 });
      }

      // If user had plain text password, migrate to hash
      if (storedHash === password) {
        db.prepare('UPDATE users SET password_hash = ? WHERE id = ?').run(hashPassword(password), userRow.id);
      }

      const favRows = db.prepare('SELECT listing_id FROM favorites WHERE user_id = ?').all(userRow.id) as { listing_id: string }[];
      const favorites = favRows.map((f) => f.listing_id);

      return NextResponse.json({
        user: {
          id: userRow.id,
          name: userRow.name,
          email: userRow.email,
          city: `${userRow.province} / ${userRow.district}`,
          province: userRow.province,
          district: userRow.district,
          rating: userRow.rating,
          dealsCount: userRow.deals_count,
          memberSince: userRow.member_since,
          verified: Boolean(userRow.verified),
          isTestAccount: Boolean(userRow.is_test_account),
          favorites,
        },
      });
    }

    if (action === 'register') {
      const existing = db.prepare('SELECT id FROM users WHERE email = ?').get(email);
      if (existing) {
        return NextResponse.json({ error: 'Bu e-posta adresi ile zaten bir hesap var' }, { status: 400 });
      }

      const id = 'usr_' + Date.now();
      const currentYear = new Date().getFullYear().toString();
      const selectedProvince = province || 'İstanbul';
      const selectedDistrict = district || 'Kadıköy';
      const hashedPassword = hashPassword(password);

      db.prepare(`
        INSERT INTO users (id, name, email, password_hash, province, district, rating, deals_count, member_since, verified, is_test_account)
        VALUES (?, ?, ?, ?, ?, ?, 5.0, 0, ?, 1, 0)
      `).run(id, name, email, hashedPassword, selectedProvince, selectedDistrict, currentYear);

      return NextResponse.json({
        user: {
          id,
          name,
          email,
          city: `${selectedProvince} / ${selectedDistrict}`,
          province: selectedProvince,
          district: selectedDistrict,
          rating: 5.0,
          dealsCount: 0,
          memberSince: currentYear,
          verified: true,
          isTestAccount: false,
          favorites: [],
        },
      });
    }

    return NextResponse.json({ error: 'Geçersiz işlem' }, { status: 400 });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Kimlik doğrulama hatası';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
