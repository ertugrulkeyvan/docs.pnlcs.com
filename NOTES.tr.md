# docs.pnlcs.com yenileme notları

pnlcs.com gibi bu da bizim repoda: **içerik bizde** (kullanıcı kararı, 2026-10-06). Panelica ekibi `main`'den çeker;
`main`'e push = yayın, push'tan önce sor. Commit, PR ve dosyalarda yapay zekâ aracı adı ya da imza satırı olmaz.

## Kararlar (2026-10-06)

- **Araç: Zensical** (Material for MkDocs ekibinin yeni aracı). Material 5 Kasım 2025'te bakım moduna girdi,
  güvenlik düzeltmeleri Kasım 2026'da bitiyor. Zensical `mkdocs.yml`'yi okuyor; 65 sayfa değişmeden derlendi.
- **Ayrı repo** (`pnlcs-website` içinde değil): ayrı alan adı, ayrı yayın, ayrı araç.
- **Görünüm pnlcs.com ile aynı aile:** lacivert/turkuaz, Archivo + JetBrains Mono, koyu header, aynı footer.
- **Sekmeler 10 → 7:** Home, Install, Learn (getting started + concepts), Guides (Set up / Sell / People),
  API (+ MCP), Developer, Help (troubleshooting + reference). Deploy on Plesk Install altına taşındı.
- **Açılış sayfası göreve göre:** "Ne yapmak istiyorsun?" 8 yol, Build on PNLCS, tüm konular, yardım.
- **Yalnız İngilizce** (çeviri bakımı güncelliği öldürür).

## Özellikler

- Komut değişkenleri: front matter `vars:` → sayfa başında kutu; kod bloklarındaki varsayılan değer okurunkine dönüşür,
  sayfalar arasında `localStorage` (`pnlcs-docs-vars`) ile hatırlanır. Parola bilerek yok.
- "Updated <tarih>": içe aktarmadaki PNLCS tarihi ile bu repodaki son commit'in yenisi (`tools/build.py`).
- "Did this page help?" → `dataLayer` `docs_feedback`. GTM henüz eklenmedi (pnlcs.com'daki kap + çerez bandı eklenecek).
- Sayfayı Markdown kopyala düğmesi, her sayfanın `.md` sürümü, `llms.txt` / `llms-full.txt` (Zensical yerleşik).
- Arama penceresi boşken "Popular pages" ve örnek aramalar (Zensical aramayı shadow DOM'da çiziyor, `pnlcs.js` içine ekliyor).
- Ücretli kurulum kutusu (`partials/offer.html`): yalnız ana sayfa + `offer: true` olan sayfalar (install, your-first-sale,
  migrate-from-whmcs). Her sayfaya konmaz. Metin pnlcs.com ile aynı: ücretli, ilk görüşme ücretsiz. `data-cta="docs-offer-…"`.
- Ana sayfa hero'sunda katkıcı avatarları (GitHub API canlı, HTML'de yedek), "Improve a page" / "Contribute to PNLCS".
- Eskime takibi: `sources:` + `tools/upstream.py stale`. Şu an yalnız API, MCP tools ve native install'da var.

## İçerik durumu

`AUDIT.md`: üç ajanın kodla karşılaştırması (2d724001). API ve MCP sayfaları üretiliyor ve güncel; geri kalan
sayfalarda ~100 bulgu, ~25 yeni sayfa ihtiyacı. İçerik henüz **düzeltilmedi**; bu ilk hâl tasarım + araçlar.

## Önizleme

```bash
cd ~/Desktop/ikahost/pnlcs/pnlcs-docs
python3 tools/build.py && python3 -m http.server 8094 --directory site
```

## Açık işler

- [ ] Kullanıcı tasarımı onaylasın; GitHub'da `ertugrulkeyvan/docs.pnlcs.com` repo'su (henüz yok; `edit_uri` ona bakıyor).
- [ ] Panelica ekibi: docs.pnlcs.com şu an `Panelica/pnlcs` GitHub Pages'ten yayında; geçiş ve upstream `docs/`'un geleceği.
- [ ] AUDIT.md'yi bölüm bölüm işle.
- [ ] Hooks, yetkiler, env, artisan, modüller referanslarını koddan üret.
- [ ] GTM + çerez bandı, og görselleri, Playwright ile otomatik ekran görüntüleri.
- [ ] pnlcs.com'daki Docs bağlantıları (menü, footer) yeni sekme yapısına göre gözden geçir.
