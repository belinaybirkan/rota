# Proje notları

## Uygulama akışı

Yeni seyahat oluştururken şehir, başlangıç tarihi, gün sayısı, kişi sayısı, bütçe, tempo ve ilgi alanları seçilir. Hazır verisi bulunan şehirlerde bu tercihlere göre aktiviteler sıralanır. Kullanıcı önerileri değiştirebilir veya kendi aktivitelerini ekleyebilir.

Sakin tempo günde 2, dengeli tempo 3, keşif dolu tempo 4 durak önerir. Aynı durak tekrar önerilmez. Katalogda yeterli durak yoksa kalan günler elle doldurulur. Bütçe sıralamada dikkate alınır; aşılmaması garanti edilmez. Aşım bütçe kartında gösterilir.

## Veri saklama

Seyahatler `rota-trips-v1` anahtarıyla LocalStorage'a kaydedilir. Şehir bilgisi ve aktiviteler aynı seyahat kaydında tutulur. JSON yedeği yüklenirken tarih, tutar, gün sayısı, şehir ve kayıt kimlikleri doğrulanır. Yedeği geri yüklemek mevcut kayıtları değiştirdiği için işlemden önce onay istenir.

## Yönergedeki işlemler

| İşlem      | Uygulamadaki yeri                        |
| ---------- | ---------------------------------------- |
| Ekleme     | Yeni seyahat ve Aktivite ekle            |
| Listeleme  | Seyahatlerim ve günlük plan              |
| Güncelleme | Tercihleri düzenle ve aktivite düzenleme |
| Silme      | Seyahat veya aktivite silme              |

## Sınırlar

- Şehir araması dünya genelinde çalışır; sonuç bulunamazsa şehir ve ülke elle girilebilir.
- Hazır duraklar İstanbul, Roma, Paris ve Vilnius ile sınırlıdır.
- Öneriler kurallı sıralamayla hazırlanır; yapay zekâ veya yol optimizasyonu kullanılmaz.
- Bilet, hava durumu ve döviz bilgileri canlı olarak alınmaz.
- Bütçe, tüm kişiler için aktivite maliyetini gösterir; uçuş ve konaklama içermez.
- Bir seyahat 1–7 gün ve 1–12 kişi için oluşturulabilir.

## Dış kaynaklar

Şehir araması: [Open-Meteo Geocoding API](https://open-meteo.com/en/docs/geocoding-api). Konum verileri [GeoNames](https://www.geonames.org/) kaynaklıdır. Arama metni bu hizmete gönderilir; seyahat kayıtları tarayıcıda kalır. Ücretsiz API uç noktası ticari olmayan kullanım içindir.

## Kontrol

`npm test` komutu 16 testi çalıştırır. Testler kişiselleştirme, bütçe hesabı, tarih doğrulama, şehir sonuçlarının işlenmesi, JSON yedekleri ve eski kayıtlarla uyumluluğu kapsar. `npm run build` üretim çıktısını oluşturur.
