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
- Mobil menü: ana sayfada kenar çubuğu yalnız masaüstünde gizli (`hide: navigation` kullanma, mobil menüyü boşaltır).
  Drawer başlığı `overrides/partials/nav.html`; altında Live demo + pnlcs.com bağlantıları.
- Önbellek: `tools/build.py` CSS/JS adreslerine `?v=<içerik özeti>` ekler; `zensical build` tek başına yetmez, hep build.py.
- Eskime takibi: `sources:` + `tools/upstream.py stale`; günlük otomasyon eskiyen sayfaları issue'da listeler.

## İçerik durumu

2026-10-22: bütün sayfalar PNLCS 1.6.1'e (cf89b175) göre kontrol edildi, ~30 yeni sayfa yazıldı (93 sayfa).
`AUDIT.md`'de açık madde yok; `data/upstream.json` `checked` = cf89b175. Her sayfada `sources:` var (20 sayfa hariç).

## Önizleme

```bash
cd pnlcs-docs
python3 tools/build.py && python3 -m http.server 8094 --directory site
```

## Açık işler

- [x] Repo açıldı (2026-10-20): `ertugrulkeyvan/docs.pnlcs.com`, public.
- [x] Otomasyon (2026-10-20): **Follow PNLCS** her gün 04:17 UTC'de PNLCS `docs/` değişikliklerini üç yönlü birleştirip
  `pnlcs-sync` PR'ı açar, "Pages that may be out of date" issue'sunu tutar. **Publish** her `main` push'unda build alır,
  `DEPLOY_*` secret'ları girilince `site/`'ı sunucuya rsync'ler. Actions'ın PR açma izni repo ayarında açık.
- [x] Sunucuda docs.pnlcs.com yeri + yalnız yazabilen deploy kullanıcısı hazır (2026-10-22).
- [ ] Secret'lar, ilk yükleme ve kontrol, sonra DNS.
- [x] Panelica ekibi geçişi onayladı (2026-10-22). Upstream `docs/` yazılmaya devam ediyor, otomasyon her gün çekiyor.
- [x] AUDIT.md bitti; referanslar (yetkiler, env, artisan, tema token'ları, genel ayarlar) koddan üretildi (2026-10-22).
- [ ] PNLCS'e upstream merge PR'larını (`pnlcs-sync`) kontrolden sonra elle birleştiriliyor.
- [ ] GTM + çerez bandı, og görselleri, Playwright ile otomatik ekran görüntüleri.
- [ ] pnlcs.com'daki Docs bağlantıları (menü, footer) yeni sekme yapısına göre gözden geçir.
