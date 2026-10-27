# Asuman ATEŞ Okul Takip Sistemi

`dist/index.html` doğrudan açılabilir. Yerel önizleme: `node preview.cjs`, adres `http://127.0.0.1:4174/`.

Sağdaki Proje hazırla kısayolu TEKNOFEST ve TÜBİTAK seçim ekranını açar. Altı adımlı form, takım üyeleri, iş paketleri, kaynak belgeler, otomatik yerel kayıt, düzenlenebilir özet, önizleme ve gerçek DOCX indirme içerir. Word oluşturucu yerel vendor dosyasından yüklenir; harici CDN gerektirmez.

TEKNOFEST yapısı sağlanan Eğitim Teknolojileri PDF şablonunun bölüm başlıklarına dayanır. Şablon 2025 ibarelidir, başvuru kılavuzu 2026 içindir. Oluşturulan Word dosyası bir proje metnidir; zorunlu resmî PDF sunum düzeninin birebir kopyası değildir. Kategoriye özgü güncel resmî şablon ayrıca doğrulanmalıdır.

Gemini sunucu bağlantısı eklenmiştir. Proje ekranındaki Gemini bağlantı ayarı üzerinden yeni anahtar girilir. Anahtar yalnızca yerel sunucu belleğinde tutulur. Alternatif: GEMINI_API_KEY ortam değişkeni veya Gemini-ile-baslat.ps1. Varsayılan model gemini-3.8-flash; GEMINI_MODEL ile değiştirilebilir. Gemini ile proje hazırla öneriyi incelemeye sunar; uygulamadan önce metinler değiştirilmez. Önceki metne dön düğmesi son üç metin yedeğini korur. Gerçek bulgular ve kaynaklar model tarafından değiştirilmez. Canlı Google isteği yeni anahtar girilene kadar doğrulanmamıştır. Taslaklar yalnızca aynı tarayıcı ve aynı site adresinde saklanır. Farklı portlar ve doğrudan dosya açılışı ayrı kayıt alanlarıdır.

Kontroller: JavaScript sözdizimi; tarayıcıda program seçimi, form adımları, kayıtların yenileme sonrası korunması, gerçek DOCX indirme; python-docx ile Word yapısının açılması. `qa/verify.cjs` temel alan / tarih doğrulaması ve son sürüm Word oluşturmayı denetler. Paketlenmiş LibreOffice bulunmadığından Word sayfalarının görsel render kontrolü yapılamadı.
