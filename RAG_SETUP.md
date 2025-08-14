# İlk Yardım RAG Sistemi Kurulum Rehberi

Bu proje, ilk yardım belgelerini kullanarak akıllı sohbet sistemi oluşturmak için RAG (Retrieval-Augmented Generation) teknolojisini kullanır.

## Gereksinimler

1. **Ollama** kurulu olmalı ve BGE-M3 modeli mevcut olmalı
2. **Node.js** 18 veya üzeri
3. **ChromaDB** (dosya tabanlı, otomatik kurulur)

## Kurulum Adımları

### 1. Ollama'da BGE-M3 Modelini Yükleyin

```bash
ollama pull bge-m3
```

### 2. Ortam Değişkenlerini Ayarlayın

`.env.local` dosyasında:

```env
OPENAI_BASE_URL=http://localhost:11434/v1
```

### 3. Belgeleri İşleyin

İlk yardım PDF belgelerinizi `documents/` klasörüne yerleştirdikten sonra:

```bash
npm run rag:setup
```

Bu komut:
- PDF belgelerini okur
- Metinleri parçalar (chunks)
- BGE-M3 ile embeddings oluşturur
- ChromaDB'ye kaydeder

## Kullanım

Kurulum tamamlandıktan sonra, chat sistemi otomatik olarak:

1. **Kullanıcı sorusu geldiğinde:**
   - Soruyu embed eder
   - İlgili belge parçalarını bulur
   - Bağlamsal bilgiyi chat'e ekler

2. **Cevap oluştururken:**
   - Belgelerden alınan bilgileri kullanır
   - Kaynak referanslarını belirtir
   - Güvenilir ve doğru bilgi verir

## Teknik Detaylar

### Kullanılan Teknolojiler

- **BGE-M3**: Çok dilli embedding modeli (1024 boyut)
- **ChromaDB**: Dosya tabanlı vektör veritabanı
- **Mastra RAG**: Belge işleme ve arama
- **Next.js**: Web arayüzü

### Dosya Yapısı

```
lib/rag/
├── config.ts              # RAG yapılandırması
├── document-processor.ts  # PDF işleme
└── search.ts             # Belge arama

src/mastra/tools/
└── index.ts              # RAG araçları

app/(chat)/api/chat-rag/
└── route.ts              # RAG-enhanced chat API

data/chroma/              # ChromaDB dosyaları (otomatik oluşur)
```

### Yapılandırma

`lib/rag/config.ts` dosyasında aşağıdaki ayarları değiştirebilirsiniz:

- `CHUNK_SIZE`: Metin parça boyutu (varsayılan: 512)
- `CHUNK_OVERLAP`: Parçalar arası örtüşme (varsayılan: 50)
- `TOP_K`: Döndürülecek sonuç sayısı (varsayılan: 5)
- `MIN_SIMILARITY_SCORE`: Minimum benzerlik skoru (varsayılan: 0.7)

## Sorun Giderme

### BGE-M3 modeli bulunamıyor
```bash
ollama list
ollama pull bge-m3
```

### Belgeler işlenememiş
```bash
npm run rag:process
```

### ChromaDB hataları
`data/chroma/` klasörünü silin ve yeniden işleyin:
```bash
rm -rf data/chroma
npm run rag:setup
```

## Test

RAG sistemini test etmek için chat'te şu tür sorular sorabilirsiniz:

- "Kalp masajı nasıl yapılır?"
- "Kanama durumunda ne yapmalıyım?"
- "Bayılma halinde ilk yardım"
- "Yanık tedavisi nasıl yapılır?"

Sistem belgelerinizdeki bilgileri kullanarak kaynak referanslı cevaplar verecektir.
