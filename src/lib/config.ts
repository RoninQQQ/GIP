export const isPreviewMode =
  process.env.NEXT_PUBLIC_APP_MODE === 'preview' ||
  Boolean(process.env.NEXT_PUBLIC_BASE_PATH);

export const basePath = process.env.NEXT_PUBLIC_BASE_PATH || '';

export const testAccount = {
  email: process.env.NEXT_PUBLIC_TEST_USER_EMAIL || 'test@donanimpazar.com',
  password: process.env.NEXT_PUBLIC_TEST_USER_PASSWORD || 'test1234',
  name: process.env.NEXT_PUBLIC_TEST_USER_NAME || 'Test Kullanıcısı',
  city: process.env.NEXT_PUBLIC_TEST_USER_CITY || 'İstanbul',
};
