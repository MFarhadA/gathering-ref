# Supabase Setup Guide — GatheringRef

Panduan lengkap untuk mengkonfigurasi Supabase agar website GatheringRef berjalan.

## 1. Buat Project Supabase

1. Buka [https://supabase.com](https://supabase.com) dan login/daftar
2. Klik **"New Project"**
3. Isi nama project (misal: `gathering-ref`)
4. Pilih region terdekat
5. Set password database
6. Klik **"Create new project"** dan tunggu hingga selesai

## 2. Ambil API Keys

1. Di dashboard Supabase, buka **Settings > API**
2. Salin **Project URL** dan **anon public key**
3. Paste ke file `.env.local`:

```env
NEXT_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIs...
```

## 3. Jalankan SQL Migrations

Buka **SQL Editor** di Supabase dashboard, lalu jalankan SQL berikut **satu per satu**:

### 3.1 Buat Tabel `galleries`

```sql
CREATE TABLE galleries (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  is_public BOOLEAN DEFAULT false,
  share_slug TEXT UNIQUE,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Index untuk query
CREATE INDEX idx_galleries_user_id ON galleries(user_id);
CREATE INDEX idx_galleries_share_slug ON galleries(share_slug);
```

### 3.2 Buat Tabel `images`

```sql
CREATE TABLE images (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  gallery_id UUID REFERENCES galleries(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  file_name TEXT NOT NULL,
  file_path TEXT NOT NULL,
  file_size BIGINT,
  width INT,
  height INT,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Index
CREATE INDEX idx_images_gallery_id ON images(gallery_id);
```

### 3.3 Enable Row Level Security (RLS)

```sql
-- Enable RLS
ALTER TABLE galleries ENABLE ROW LEVEL SECURITY;
ALTER TABLE images ENABLE ROW LEVEL SECURITY;

-- Galleries: owner can do everything
CREATE POLICY "Users can view own galleries"
  ON galleries FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create own galleries"
  ON galleries FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own galleries"
  ON galleries FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own galleries"
  ON galleries FOR DELETE
  USING (auth.uid() = user_id);

-- Galleries: anyone can view public galleries
CREATE POLICY "Anyone can view public galleries"
  ON galleries FOR SELECT
  USING (is_public = true);

-- Images: owner can do everything
CREATE POLICY "Users can view own images"
  ON images FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can upload own images"
  ON images FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own images"
  ON images FOR DELETE
  USING (auth.uid() = user_id);

-- Images: anyone can view images in public galleries
CREATE POLICY "Anyone can view images in public galleries"
  ON images FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM galleries
      WHERE galleries.id = images.gallery_id
      AND galleries.is_public = true
    )
  );
```

### 3.4 Buat Storage Bucket

```sql
-- Create storage bucket
INSERT INTO storage.buckets (id, name, public)
VALUES ('gallery-images', 'gallery-images', true);

-- Storage policies: owner can upload
CREATE POLICY "Users can upload images"
  ON storage.objects FOR INSERT
  WITH CHECK (
    bucket_id = 'gallery-images'
    AND auth.uid()::text = (storage.foldername(name))[1]
  );

-- Storage policies: owner can delete
CREATE POLICY "Users can delete own images"
  ON storage.objects FOR DELETE
  USING (
    bucket_id = 'gallery-images'
    AND auth.uid()::text = (storage.foldername(name))[1]
  );

-- Storage policies: anyone can view (bucket is public)
CREATE POLICY "Anyone can view images"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'gallery-images');
```

## 4. Konfigurasi Authentication

### 4.1 Email/Password (Sudah aktif by default)

Di **Authentication > Providers**, pastikan **Email** sudah enabled.

> **Tip**: Untuk development, Anda bisa disable "Confirm email" di **Authentication > Settings > Email Auth** agar tidak perlu verifikasi email saat testing.

### 4.2 Google OAuth

1. **Google Cloud Console**:
   - Buka [Google Cloud Console](https://console.cloud.google.com)
   - Buat project baru atau pilih yang ada
   - Buka **APIs & Services > Credentials**
   - Klik **Create Credentials > OAuth Client ID**
   - Pilih **Web application**
   - Tambahkan **Authorized redirect URI**:
     ```
     https://YOUR_SUPABASE_PROJECT_REF.supabase.co/auth/v1/callback
     ```
     (Ganti `YOUR_SUPABASE_PROJECT_REF` dengan project ref Anda — bisa dilihat di URL dashboard Supabase)
   - Salin **Client ID** dan **Client Secret**

2. **Supabase Dashboard**:
   - Buka **Authentication > Providers > Google**
   - Toggle **Enable**
   - Paste **Client ID** dan **Client Secret** dari Google
   - Klik **Save**

## 5. Konfigurasi Site URL

1. Di Supabase, buka **Authentication > URL Configuration**
2. Set **Site URL** ke: `http://localhost:3000` (untuk development)
3. Tambahkan di **Redirect URLs**: `http://localhost:3000/auth/callback`

> **Production**: Ganti URL di atas dengan domain production Anda.

## 6. Jalankan Aplikasi

```bash
npm run dev
```

Buka [http://localhost:3000](http://localhost:3000) dan coba:
1. Register akun baru
2. Login
3. Buat gallery
4. Upload gambar
5. Share gallery public
