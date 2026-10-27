from pathlib import Path
root=Path(__file__).parent
p=root/'dist/workshop.js'
s=p.read_text(encoding='utf-8').replace('Gemini ile proje hazırla</button>','Gemini ile proje hazırla</button> <button class="secondary" onclick="configureGemini()">Gemini bağlantı ayarı</button>',1)
s=s.replace('Yeni anahtarınızı sohbete yazmadan <b>Gemini-ile-baslat.ps1</b> dosyasının gizli girişine ekleyin.','Yeni anahtarınızı sohbete yazmadan <b>Gemini bağlantı ayarı</b> düğmesindeki gizli alana ekleyin.')
p.write_text(s,encoding='utf-8')
p=root/'dist/index.html'
s=p.read_text(encoding='utf-8').replace('<script src="workshop.js"></script>','<script src="workshop.js"></script><script src="gemini-settings.js"></script>')
p.write_text(s,encoding='utf-8')
p=root/'README.md'
s=p.read_text(encoding='utf-8').replace('Bu sürüm bir üretken yapay zekâ servisine bağlı değildir. Öğretmenin girdiği metinler düzenlenir ve özetlenir; yeni araştırma, kaynak veya deney sonucu üretilmez.','Gemini sunucu bağlantısı eklenmiştir. Proje ekranındaki Gemini bağlantı ayarı üzerinden yeni anahtar girilir. Anahtar yalnızca yerel sunucu belleğinde tutulur. Alternatif: GEMINI_API_KEY ortam değişkeni veya Gemini-ile-baslat.ps1. Varsayılan model gemini-3.8-flash; GEMINI_MODEL ile değiştirilebilir. Gemini ile proje hazırla öneriyi incelemeye sunar; uygulamadan önce metinler değiştirilmez. Önceki metne dön düğmesi son üç metin yedeğini korur. Gerçek bulgular ve kaynaklar model tarafından değiştirilmez. Canlı Google isteği yeni anahtar girilene kadar doğrulanmamıştır.')
p.write_text(s,encoding='utf-8')
