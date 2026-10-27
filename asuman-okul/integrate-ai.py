from pathlib import Path
p=Path(__file__).parent/'dist/workshop.js'
s=p.read_text(encoding='utf-8')
a=(p.parent.parent/'ai-functions.txt').read_text(encoding='utf-8')
s=s.replace('window.Workshop={start,open,go,download,',a+'\nwindow.Workshop={start,open,go,download,generateAI,restoreAI,')
s=s.replace('<div class="work-grid">','''<div class="hint"><button class="primary" id="generateAI" onclick="Workshop.generateAI()">✧ Gemini ile proje hazırla</button> ${current.aiHistory?.length?'<button class="secondary" onclick="Workshop.restoreAI()">Önceki metne dön</button>':''}<p style="margin-bottom:0;font-size:11px">Proje adı ve fikrinizi yazın; Gemini ayrıntılı bir taslak önersin. Proje açıklamaları Google Gemini hizmetine gönderilir. Takım üye isimleri ve kimlik numaraları gönderilmez. Açıklamalara kişisel bilgi eklemeyin.</p></div><div class="work-grid">''')
s=s.replace('Girdiğiniz bilgiler bölüm sırasına yerleştirilir ve düzenlenebilir bir özet oluşturulur. Yeni bilimsel iddia, kaynak veya deney sonucu üretilmez.','Metni inceleyin ve düzenleyin. Gemini önerileri öğretmen kontrolü gerektirir. Kaynaklar ve deney sonuçları ayrıca doğrulanmalıdır.')
p.write_text(s,encoding='utf-8')
