# Asuman ATEŞ Okul Takip Sistemi

Öğrenci takibi, not ve Drive kısayolları, TEKNOFEST ve TÜBİTAK proje hazırlama, Gemini ile proje önerisi ve Word indirme uygulaması.

## GitHub'a yüklenecek dosyalar

Bu klasörün **içeriğinin tamamını** deponuzun köküne yükleyin. `public` klasörü dahil olmalıdır. Üst klasördeki `asuman-okul`, kişisel öğrenci kayıtları, test çıktıları, `.git` ve `.openai` klasörleri gerekli değildir. Bu paket bunları içermez.

**API anahtarını GitHub'a koymayın.** `.env.example` örnektir ve yüklenebilir. Kendi oluşturacağınız `.env` dosyası `.gitignore` ile hariç tutulur; GitHub'ın web arayüzünden dosya yüklerken de `.env` seçmeyin. Sohbette paylaştığınız eski anahtarı iptal edip yeni anahtar kullanın.

## Bilgisayarda çalıştırma

1. Node.js 22 veya daha yeni bir sürüm kurun.
2. Bu klasörde terminal açın.
3. `npm start` komutunu çalıştırın. Windows'ta `Baslat.cmd` de kullanılabilir.
4. Tarayıcıda `http://127.0.0.1:4174/` adresini açın.

Harici npm bağımlılığı yoktur; `npm install` gerekmez. Word oluşturma bileşeni `public/vendor` içinde bulunur. İlk kontrol için `npm test` ve `npm run check` komutlarını çalıştırın.

4174 portunda önceki önizleme açıksa onu durdurun veya `.env` dosyasında `PORT=4175` kullanıp yeni adrese gidin. Öğrenci ve proje kayıtları tarayıcıda, her site adresi için ayrı saklanır; port değiştirince önceki kayıtlar otomatik taşınmaz.

## Gemini anahtarını ekleme

Yerel kullanımda proje formundaki **Gemini bağlantı ayarı** düğmesine basıp yeni anahtarınızı girin. Anahtar sunucu belleğinde tutulur; sunucu kapanınca yeniden girilir. Ayarlamak anahtarın geçerliliğini doğrulamaz; ilk proje isteği gerçek bağlantıyı sınar.

Kalıcı sunucu ayarı için `.env.example` dosyasını `.env` olarak kopyalayın ve `GEMINI_API_KEY` değerini yazın. Yeniden başlatın. Ortam değişkenleri `.env` değerlerinden önceliklidir. Model `GEMINI_MODEL` ile değiştirilebilir; örnek varsayılan `gemini-3.8-flash` modelidir. Model erişimi ve kota Google hesabınıza bağlıdır.

Proje adını ve amaç alanına en az 15 karakterlik fikrinizi yazın. **Gemini ile proje hazırla** düğmesi öneri üretir. Öneriyi inceleyip **Öneriyi projeme uygula** seçeneğiyle kullanın. **Önceki metne dön** ile önceki metni geri getirebilirsiniz. Son aşamada Word dosyasını indirin.

Proje açıklamaları Gemini'ye gönderilir; takım üye listesi ve ID alanları gönderilmez. Serbest metin alanlarına kişisel öğrenci bilgisi eklemeyin. Araştırma kaynakları ve gerçekleşen bulgular yapay zekâ tarafından değiştirilmez. Üretilen öneriler öğretmen tarafından doğrulanmalıdır.

## İnternette yayınlama

**GitHub Pages bu uygulamanın Gemini sunucusunu çalıştırmaz.** Node.js veya Docker çalıştırabilen bir hosting hizmetine deponuzu bağlayın. Başlatma komutu `npm start`, sağlık kontrolü `/healthz` olur. Harici paket kurulumu gerekmez. Dockerfile da dahildir.

Hosting panelinde şu ortam değişkenlerini tanımlayın:

| Değişken | Değer |
| --- | --- |
| `NODE_ENV` | `production` |
| `HOST` | `0.0.0.0` |
| `PORT` | Hosting hizmetinin belirlediği port; yoksa `4174` |
| `PUBLIC_URL` | Sitenizin tam HTTPS kök adresi; örneğin `https://okulum.example.com` |
| `APP_USER` | Giriş kullanıcı adı; varsayılan `asuman` |
| `APP_PASSWORD` | Kendinizin belirlediği en az 16 karakterlik parola |
| `GEMINI_API_KEY` | Yeni Gemini API anahtarınız; hosting panelinde gizli değer olarak |
| `GEMINI_MODEL` | Hesabınızın erişebildiği model; örnekte `gemini-3.8-flash` |

`PUBLIC_URL` gerçek adresiniz olmalıdır; tabloda verilen örneği aynen kullanmayın. Hosting HTTPS sağlamalı ve orijinal `Host` başlığını uygulamaya iletmelidir. İnternet yayını HTTPS adresi ve parola olmadan başlamaz. Giriş tarayıcının kullanıcı adı/parola penceresinden yapılır. API anahtarı ayarlama ekranı internet yayınında kapalıdır; anahtarı hosting panelinden değiştirin.

Bu parola tek öğretmen için temel erişim korumasıdır. Çok kullanıcılı hesap sistemi veya merkezi öğrenci veritabanı değildir. Kayıtlar aynı tarayıcıda saklanır; başka cihazlara eşitlenmez. Tarayıcı verilerini silmeden önce Word çıktılarınızı indirin. Hosting'e geçişte eski yerel taslaklar kendiliğinden taşınmaz.

## Şablonlar ve sınırlar

`public/references` klasöründe sağladığınız TEKNOFEST sunum şablonu, başvuru kılavuzu, TÜBİTAK Word şablonu ve ortaokul proje rehberi vardır. TEKNOFEST sunum şablonu 2025, başvuru kılavuzu 2026 ibarelidir. Word çıktısı düzenlenebilir proje metnidir; resmî PDF sunum düzeninin birebir kopyası değildir. Başvuru öncesi ilgili yıl ve kategorinin güncel şartnamesini kontrol edin.

## Doğrulama

`npm test`: gerçek HTTP sunucusu ile statik dosyalar, referans belgeler, JSON uçları, parola, istek kaynağı kontrolleri; sahte sağlayıcı yanıtıyla Gemini istek ve hata senaryoları.

`npm run check`: JavaScript sözdizimi. Geçerli yeni anahtar sağlanmadan Google'a canlı istek testi yapılamaz. Word indirme önceki yerel sürümde tarayıcıdan denenmiştir; otomatik Word sayfa render bileşeni bu ortamda bulunmadığından bütün olası metinlerin sayfa görünümü doğrulanmış değildir.

## Dosya yapısı

```text
sunucu/
  server.cjs             Node.js HTTP sunucusu
  gemini.cjs             Sunucu tarafında Gemini bağlantısı
  package.json          Başlatma ve test komutları
  .env.example          Örnek ayarlar
  .gitignore            Gizli ve gereksiz dosyaları hariç tutar
  Dockerfile            Docker yayını
  Baslat.cmd            Windows başlatıcısı
  public/               Arayüz, Word bileşeni ve kaynak şablonlar
  test/                 Bağımsız testler
```
