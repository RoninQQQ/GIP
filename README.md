# DonanımPazar — İkinci El Donanım Pazaryeri

Modern, hızlı ve güvenli 2. el bilgisayar ve donanım alış-satış platformu. Next.js 16 (App Router), Tailwind CSS v4, Framer Motion ve TypeScript ile geliştirilmiştir.

---

## 🚀 Hızlı Başlangıç & Kurulum (Gerçek Çalışma Ortamı)

Projeyi yerel bilgisayarınızda veya gerçek sunucuda çalıştırmak için aşağıdaki adımları izleyin:

### 1. Ortam Değişkenlerini Hazırlama
Depoda bulunan `.env.example` şablonunu yerel ortam değişkeni olarak kopyalayın:

```bash
cp .env.example .env.local
```

### 2. Ortam Değişkenleri ve Test Hesabı

`.env.local` dosyasındaki ayarları dilediğiniz gibi düzenleyebilirsiniz:

```env
# Uygulama Çalışma Modu ('production' | 'preview')
NEXT_PUBLIC_APP_MODE=production
NEXT_PUBLIC_BASE_PATH=

# Gerçek Kurulum Ortamı Varsayılan Test Hesabı Bilgileri
NEXT_PUBLIC_TEST_USER_EMAIL=test@donanimpazar.com
NEXT_PUBLIC_TEST_USER_PASSWORD=test1234
NEXT_PUBLIC_TEST_USER_NAME=Test Kullanıcısı
NEXT_PUBLIC_TEST_USER_CITY=İstanbul
```

> **Not:** Gerçek çalışma ortamında (`NEXT_PUBLIC_APP_MODE=production`) yukarıdaki test hesabı bilgileriyle doğrudan giriş yapabilir veya "Kayıt Ol" sekmesinden yeni hesaplar oluşturabilirsiniz.

### 3. Bağımlılıkları Yükleme ve Başlatma

```bash
# Bağımlılıkları yükleyin
npm install

# Geliştirme sunucusunu başlatın
npm run dev
```

Tarayıcınızda [http://localhost:3000](http://localhost:3000) adresine giderek uygulamayı görüntüleyebilirsiniz.

---

## 🛠️ Üretim Derlemesi (Build)

Statik dışa aktarma (static export) ve üretim derlemesi için:

```bash
npm run build
```

Derlenen statik dosyalar `./out` dizini altına oluşturulur.

---

## 🌟 Temel Özellikler

- **Çift Ortam Mimarisi:** GitHub Pages önizlemesi (`preview`) ve Gerçek Kurulum (`production`) modları arasında otomatik uyum.
- **Güvenli Sepet & Checkout:** Tekil 2. el ürün yapısı, hizmet bedeli hesabı, sipariş geçmişi ve havuz teslimat onayı.
- **Pazarlık / Teklif Ver:** İlan detayından satıcıya hızlı indirimli teklif sunma ve onaylama.
- **İlan Verme & Silme:** Giriş yapmış kullanıcılar için kalıcı ilan oluşturma ve kendi ilanlarını yönetme.
- **Favoriler & Filtreler:** Kategori, durum, şehir, fiyat aralığı, sıralama ve "İlanlarım" filtresi.
- **Koyu / Açık Tema:** Tailwind v4 uyumlu, kalıcı tema değiştirici.
- **Çoklu Dil & Para Birimi:** TR / EN ve TRY / USD anlık kur desteği.
