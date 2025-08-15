# FirstAId - Yapay Zeka Destekli İlk Yardım Chatbotu

RAG (Retrieval-Augmented Generation) teknolojisini kullanarak ilk yardım rehberliği sağlayan akıllı bir chatbot uygulaması. Uygulama, doğru ve bağlamsal acil durum yardımı sunmak için yapay zeka dil modellerini özel ilk yardım belgeleriyle birleştirir.

## Özellikler

- 🤖 **Yapay Zeka Destekli Sohbet**: İlk yardım rehberliği için etkileşimli chatbot
- 📚 **RAG Teknolojisi**: Doğru yanıtlar için gerçek ilk yardım belgelerini kullanır
- 🔐 **Kullanıcı Kimlik Doğrulama**: Güvenli giriş ve kayıt sistemi
- 🎯 **Çoklu Mod Sohbet**: Hem eğitim hem de ilk yardım modları desteği
- 📱 **Modern Arayüz**: Koyu/açık tema desteğiyle duyarlı tasarım
- 🔍 **Belge Arama**: İlk yardım materyallerinde gelişmiş anlamsal arama
- 💾 **Sohbet Geçmişi**: Kalıcı konuşma geçmişi

## Teknoloji Yığını

- **Frontend**: Next.js 15, React 19, Tailwind CSS
- **Backend**: Next.js API rotaları, Node.js
- **Veritabanı**: Drizzle ORM ile PostgreSQL
- **Yapay Zeka**: Yerel modeller ile Ollama
- **RAG**: Vektör depolama için LibSQL, embedding için BGE-M3
- **Kimlik Doğrulama**: NextAuth.js
- **Dağıtım**: Vercel-hazır

## Gereksinimler

Uygulamayı çalıştırmadan önce şunlara sahip olduğunuzdan emin olun:

1. **Node.js** 18 veya üzeri
2. **PostgreSQL** veritabanı
3. Yerel olarak kurulu **Ollama**
4. **pnpm** (önerilen) veya npm

## Kurulum

### 1. Klonlama ve Bağımlılıkları Kurma

```bash
git clone <your-repo-url>
cd firstAId
pnpm install
```

### 2. Ortam Değişkenlerini Ayarlama

Örnek yapılandırmayı kopyalayın ve düzenleyin:

```bash
# Örnek dosyayı kopyalayın
cp env.example .env.local

# Veya manuel olarak oluşturun
```

`.env.local` dosyasını düzenleyerek kendi değerlerinizi ekleyin:

```env
# Veritabanı
POSTGRES_URL=postgresql://kullanici:sifre@localhost:5432/firstaid_db

# Kimlik Doğrulama (güçlü bir rastgele dize kullanın)
NEXTAUTH_SECRET=super-gizli-jwt-anahtariniz-buraya
NEXTAUTH_URL=http://localhost:3000

# Yapay Zeka Sağlayıcısı (Ollama)
OPENAI_BASE_URL=http://localhost:11434/v1
```

**Güvenli JWT anahtarı oluşturmak için:**
```bash
# Linux/macOS
openssl rand -base64 32

# Node.js
node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"
```

**Ortam Değişkenleri Açıklaması:**
- `POSTGRES_URL`: PostgreSQL bağlantı diziniz
- `NEXTAUTH_SECRET`: JWT tokenları için gizli anahtar (güçlü, rastgele bir dize kullanın)
- `NEXTAUTH_URL`: Uygulama URL'niz (üretim için buna göre güncelleyin)
- `OPENAI_BASE_URL`: Ollama API uç noktası

### 3. Ollama ve Yapay Zeka Modellerini Kurma

Ollama'yı kurun ve çalıştırın:

```bash
# Ollama'yı kurun (kurulum talimatları için https://ollama.ai adresini ziyaret edin)

# Gerekli modelleri çekin
ollama pull Orcik23/orcik:1b        # en hafif ve en hızlı modelimiz (internetsiz ortamlarda herhangi bir cihazda çalışabilir)
ollama pull Orcik23/orcik:4b        # orta boyutta hızlı bir model
ollama pull Orcik23/orcik:12b          # en güçlü ve en güvenilir modelimiz
ollama pull bge-m3             # RAG için embedding modeli

# Modellerin kurulu olduğunu doğrulayın
ollama list
```

### 4. Veritabanını Kurma

```bash
# Veritabanı migrasyonlarını oluştur
pnpm db:generate

# Veritabanı migrasyonlarını çalıştır
pnpm db:migrate

# İsteğe bağlı: Veritabanı stüdyosunu aç
pnpm db:studio
```

### 5. RAG Sistemini Kurma

Uygulama Türkçe ilk yardım belgelerini içerir. Bunları RAG sistemi için işleyin:

```bash
# Belgeleri işle ve embedding'ler oluştur
pnpm rag:setup
```

Bu komut şunları yapacak:
- `documents/` klasöründen PDF belgelerini okur
- Uygun örtüşme ile metin parçaları oluşturur
- BGE-M3 modelini kullanarak embedding'ler üretir
- Vektörleri LibSQL veritabanında saklar

## Uygulamayı Çalıştırma

### İlk Çalıştırma Kontrol Listesi

Uygulamayı başlatmadan önce şunları kontrol edin:

```bash
# 1. Ollama servisinin çalıştığından emin olun
ollama serve

# 2. Gerekli modellerin yüklendiğini kontrol edin
ollama list

# 3. PostgreSQL veritabanının çalıştığından emin olun
# (PostgreSQL kurulumu ve çalıştırılması)

# 4. Veritabanı migrasyonlarının çalıştığından emin olun
pnpm db:migrate

# 5. RAG belgelerinin işlendiğinden emin olun
pnpm rag:setup
```

### Geliştirme Modu

```bash
pnpm dev
```

Uygulama `http://localhost:3000` adresinde kullanılabilir olacak

### Üretim Derlemesi

```bash
pnpm build
pnpm start
```

### Hızlı Test

Uygulama çalıştığında:
1. `http://localhost:3000/register` adresinden yeni hesap oluşturun
2. Giriş yapın ve sohbet modunu seçin
3. "Kalp masajı nasıl yapılır?" gibi bir soru sorun
4. RAG sisteminin belgelerden bilgi getirip getirmediğini kontrol edin

## Proje Yapısı

```
firstAId/
├── app/                    # Next.js uygulama dizini
│   ├── (auth)/            # Kimlik doğrulama sayfaları
│   ├── (chat)/            # Sohbet arayüzü
│   └── api/               # API rotaları
├── components/            # React bileşenleri
│   ├── ui/               # Yeniden kullanılabilir UI bileşenleri
│   └── ...               # Özellik-spesifik bileşenler
├── lib/                  # Temel kütüphaneler
│   ├── ai/               # Yapay zeka sağlayıcı yapılandırması
│   ├── auth/             # Kimlik doğrulama yardımcıları
│   ├── db/               # Veritabanı şeması ve sorguları
│   └── rag/              # RAG sistem uygulaması
├── documents/            # İlk yardım PDF belgeleri
├── data/                 # Üretilen veriler (ChromaDB, vb.)
└── src/mastra/          # Mastra framework entegrasyonu
```

## Mevcut Komutlar

| Komut | Açıklama |
|-------|----------|
| `pnpm dev` | Geliştirme sunucusunu başlat |
| `pnpm build` | Üretim için derle |
| `pnpm start` | Üretim sunucusunu başlat |
| `pnpm lint` | Linting çalıştır |
| `pnpm format` | Biome ile kodu formatla |
| `pnpm db:generate` | Veritabanı migrasyonları oluştur |
| `pnpm db:migrate` | Veritabanı migrasyonlarını çalıştır |
| `pnpm db:studio` | Veritabanı stüdyosunu aç |
| `pnpm rag:setup` | RAG için belgeleri işle |

## Kullanım

### 1. Kullanıcı Kaydı/Girişi
- Hesap oluşturmak için `http://localhost:3000/register` adresini ziyaret edin
- Veya `http://localhost:3000/login` adresinden giriş yapın

### 2. Sohbet Modları
Uygulama iki sohbet modunu destekler:
- **İlk Yardım**: İlk yardım belgeleriyle geliştirilmiş yapay zeka yanıtları
- **Eğitim**: Genel eğitim konuşmaları

### 3. Örnek Sorular
Şu tür sorular sormayı deneyin:
- "Kalp masajı nasıl yapılır?"
- "Kanama durumunda ne yapmalıyım?"
- "Bayılma halinde ilk yardım"
- "Yanık tedavisi nasıl yapılır?"

## Yapılandırma

### RAG Sistemi Yapılandırması

Özelleştirmek için `lib/rag/config.ts` dosyasını düzenleyin:

```typescript
export const RAG_CONFIG = {
  CHUNK_SIZE: 512,           // Metin parça boyutu
  CHUNK_OVERLAP: 50,         // Parçalar arası örtüşme
  TOP_K: 5,                  // Döndürülecek sonuç sayısı
  MIN_SIMILARITY_SCORE: 0.7, // Minimum benzerlik eşiği
};
```

### Yapay Zeka Model Yapılandırması

Uygulama `lib/ai/provider.ts` dosyasında yapılandırılmış Ollama modellerini kullanır. Modelleri şu şekilde güncelleyerek değiştirebilirsiniz:

```typescript
export const openai = createOllama({
  baseURL: process.env.OPENAI_BASE_URL,
});
```

## Sorun Giderme

### Yaygın Sorunlar

**1. Ollama Bağlantı Hatası**
```bash
# Ollama'nın çalışıp çalışmadığını kontrol edin
ollama list

# Ollama servisini başlatın
ollama serve
```

**2. BGE-M3 Modeli Bulunamadı**
```bash
ollama pull bge-m3
```

**3. Veritabanı Bağlantı Sorunları**
- PostgreSQL'in çalıştığını doğrulayın
- `.env.local` dosyasındaki `POSTGRES_URL`'nizi kontrol edin
- Veritabanının var olduğundan emin olun

**4. RAG Sistemi Çalışmıyor**
```bash
# Vektör veritabanını temizleyin ve belgeleri yeniden işleyin
rm -f data/vectors.db*
pnpm rag:setup
```

**5. Kimlik Doğrulama Sorunları**
- `.env.local` dosyasında `NEXTAUTH_SECRET`'in ayarlandığından emin olun
- Güçlü, rastgele bir dize olduğunu kontrol edin

### Performans İpuçları

1. **Veritabanı**: Üretim için bağlantı havuzu kullanın
2. **Yapay Zeka Modelleri**: Daha hızlı yanıtlar için daha küçük modeller kullanmayı düşünün
3. **RAG**: Belgelerinize göre parça boyutunu ve örtüşmeyi ayarlayın
4. **Önbellekleme**: Üretim önbelleklemesi için Redis uygulayın

## Dağıtım

### Vercel Dağıtımı

1. Kodunuzu GitHub'a gönderin
2. Repository'yi Vercel'e bağlayın
3. Vercel kontrol panelinde ortam değişkenlerini ayarlayın
4. Dağıtın

**Önemli**: Üretim dağıtımı için şunlara ihtiyacınız olacak:
- PostgreSQL veritabanı (Vercel Postgres veya harici sağlayıcı kullanın)
- Sunucuda barındırılan Ollama (veya OpenAI API'ye geçiş yapın)

### Docker Dağıtımı

Proje konteynerleştirilebilir. Bir `Dockerfile` oluşturun:

```dockerfile
FROM node:18-alpine

WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build

EXPOSE 3000
CMD ["npm", "start"]
```

## Katkıda Bulunma

1. Repository'yi fork edin
2. Bir özellik dalı oluşturun
3. Değişikliklerinizi yapın
4. Testleri ve linting'i çalıştırın
5. Bir pull request gönderin

## Lisans

Bu proje MIT Lisansı altında lisanslanmıştır - detaylar için [LICENSE](LICENSE) dosyasına bakın.

## Destek

Sorunlar ve sorular için:
1. Sorun giderme bölümünü kontrol edin
2. Mevcut GitHub issue'larını inceleyin
3. Detaylı bilgi ile yeni bir issue oluşturun

---

**Not**: Bu uygulama eğitim amaçlı tasarlanmıştır. Gerçek acil durumlarda her zaman profesyonel tıbbi yardım alın.