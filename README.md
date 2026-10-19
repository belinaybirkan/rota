# Rota

Web Geliştirme ve JavaScript eğitimi için hazırlanan bir seyahat planlama uygulaması. Şehir seçip günlük aktiviteler eklemeyi ve seyahat bütçesini takip etmeyi sağlar.

[Siteyi aç](https://luxury-bienenstitch-c266b6.netlify.app/)

## Özellikler

- Dünya genelinde şehir arama ve elle şehir ekleme
- Seyahat ve aktivite oluşturma, listeleme, düzenleme ve silme
- İlgi alanı, tempo ve bütçeye göre başlangıç rotası
- Günlük plan, aktivite arama ve kategori filtresi
- Kişi sayısına göre bütçe hesabı
- Tarayıcıda kayıt, JSON yedekleme ve yazdırma
- Mobil uyumlu arayüz

Hazır aktivite önerileri İstanbul, Roma, Paris ve Vilnius için bulunuyor. Diğer şehirlerde plan boş başlıyor; aktiviteler kullanıcı tarafından ekleniyor. Fiyatlar örnek EUR tutarlarıdır. Uçuş ve konaklama bütçeye dahil değildir.

## Kullanılan teknolojiler

React, JavaScript, Vite, CSS ve LocalStorage. Şehir araması için Open-Meteo Geocoding API kullanılıyor.

## Kurulum

Node.js 22.12 veya üzeri bir sürüm gerekir. Proje klasöründe:

```bash
npm ci
npm run dev
```

Terminalde gösterilen yerel adresi tarayıcıda açın.

## Test ve derleme

```bash
npm test
npm run build
```

Üretim dosyaları `dist` klasörüne oluşturulur. Derlenen sürümü yerelde açmak için:

```bash
npm run preview
```

## Klasörler

| Klasör           | İçerik                             |
| ---------------- | ---------------------------------- |
| `src/components` | Şehir araması ve formlar           |
| `src/pages`      | Seyahat planı ekranı               |
| `src/data`       | Hazır şehir ve aktivite verileri   |
| `src/utils`      | Plan oluşturma, arama ve doğrulama |
| `src/interfaces` | JSDoc veri modelleri               |
| `public`         | Görseller ve site simgesi          |
| `tests`          | Planlama ve şehir araması testleri |
| `docs`           | Proje notları ve görsel kaynakları |

## Netlify

GitHub üzerinden dağıtım için ayarlar:

- Branch: `main`
- Build command: `npm run build`
- Publish directory: `dist`

Bu ayarlar `netlify.toml` dosyasında da bulunur. Elle yükleme yapılacaksa önce `npm run build` çalıştırılıp `dist` klasörü yüklenir.

## Notlar

Planlar yalnızca kullanılan tarayıcıda saklanır; kullanıcı hesabı veya sunucu veritabanı yoktur. Tarayıcı verileri temizlenmeden önce JSON yedeği alınabilir. Şehir araması internet gerektirir; bağlantı olmadığında şehir elle eklenebilir.

Ayrıntılar [proje notlarında](docs/proje-notlari.md), görsellerin kaynakları [görsel kaynakları dosyasında](docs/ASSETS.md) yer alır.
