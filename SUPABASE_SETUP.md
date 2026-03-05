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

### 3.3 Buat Tabel `profiles`

```sql
CREATE TABLE profiles (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  nickname TEXT NOT NULL,
  avatar_url TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Index
CREATE INDEX idx_profiles_id ON profiles(id);
```

### 3.4 Buat Trigger Otomatis — Profil Saat Registrasi

Trigger ini akan otomatis membuat baris di tabel `profiles` dengan nickname acak setiap kali ada user baru yang mendaftar.

```sql
-- Fungsi untuk generate nickname acak
CREATE OR REPLACE FUNCTION generate_random_nickname()
RETURNS TEXT AS $$
DECLARE
  adjectives TEXT[] := ARRAY[
    'swift','brave','calm','cool','dark','epic','fast','free',
    'gold','gray','keen','kind','lone','mild','neat','nice',
    'pure','rare','rich','safe','slim','soft','sure','true',
    'warm','wild','wise','bold','cozy','cute','fair','firm',
    'glad','good','high','huge','idle','iron','jade','just',
    'lazy','lean','live','lost','loud','love','lucky','mellow'
  ];
  nouns TEXT[] := ARRAY[
    'wolf','hawk','bear','lion','crow','deer','duck','eagle',
    'fish','frog','goat','hare','kite','lark','mole','moth',
    'newt','owl','puma','rook','seal','slug','swan','toad',
    'vole','wasp','wren','bison','camel','crane','finch','gecko',
    'heron','hyena','ibis','jackal','koala','lemur','llama','moose',
    'panda','quail','raven','shark','snail','tiger','viper','zebra'
  ];
  adj TEXT;
  noun TEXT;
  suffix TEXT;
BEGIN
  adj  := adjectives[1 + floor(random() * array_length(adjectives, 1))::int];
  noun := nouns[1 + floor(random() * array_length(nouns, 1))::int];
  suffix := lpad(floor(random() * 9999)::text, 4, '0');
  RETURN adj || '_' || noun || suffix;
END;
$$ LANGUAGE plpgsql;

-- Trigger function
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, nickname)
  VALUES (
    NEW.id,
    COALESCE(
      NEW.raw_user_meta_data->>'full_name',
      generate_random_nickname()
    )
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Pasang trigger
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();
```

> **Catatan**: Jika user daftar via Google OAuth, nickname akan diambil dari `full_name` Google. Jika daftar via email biasa, nickname akan digenerate secara acak.

### 3.5 Enable Row Level Security (RLS)

```sql
-- Enable RLS
ALTER TABLE galleries ENABLE ROW LEVEL SECURITY;
ALTER TABLE images ENABLE ROW LEVEL SECURITY;
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- ===== GALLERIES =====
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

-- Anyone can view public galleries
CREATE POLICY "Anyone can view public galleries"
  ON galleries FOR SELECT
  USING (is_public = true);

-- ===== IMAGES =====
CREATE POLICY "Users can view own images"
  ON images FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can upload own images"
  ON images FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own images"
  ON images FOR DELETE
  USING (auth.uid() = user_id);

-- Anyone can view images in public galleries
CREATE POLICY "Anyone can view images in public galleries"
  ON images FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM galleries
      WHERE galleries.id = images.gallery_id
      AND galleries.is_public = true
    )
  );

-- ===== PROFILES =====
-- Anyone can view profiles (for public gallery author display)
CREATE POLICY "Profiles are viewable by everyone"
  ON profiles FOR SELECT
  USING (true);

-- Users can update their own profile
CREATE POLICY "Users can update own profile"
  ON profiles FOR UPDATE
  USING (auth.uid() = id);

-- Trigger insert is handled by SECURITY DEFINER function (no INSERT policy needed for users)
```

### 3.6 Buat Storage Buckets

```sql
-- Bucket untuk gallery images
INSERT INTO storage.buckets (id, name, public)
VALUES ('gallery-images', 'gallery-images', true);

-- Bucket untuk avatars
INSERT INTO storage.buckets (id, name, public)
VALUES ('avatars', 'avatars', true);

-- ===== GALLERY IMAGES POLICIES =====
CREATE POLICY "Users can upload images"
  ON storage.objects FOR INSERT
  WITH CHECK (
    bucket_id = 'gallery-images'
    AND auth.uid()::text = (storage.foldername(name))[1]
  );

CREATE POLICY "Users can delete own images"
  ON storage.objects FOR DELETE
  USING (
    bucket_id = 'gallery-images'
    AND auth.uid()::text = (storage.foldername(name))[1]
  );

CREATE POLICY "Anyone can view images"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'gallery-images');

-- ===== AVATARS POLICIES =====
CREATE POLICY "Users can upload own avatar"
  ON storage.objects FOR INSERT
  WITH CHECK (
    bucket_id = 'avatars'
    AND auth.uid()::text = (storage.foldername(name))[1]
  );

CREATE POLICY "Users can update own avatar"
  ON storage.objects FOR UPDATE
  USING (
    bucket_id = 'avatars'
    AND auth.uid()::text = (storage.foldername(name))[1]
  );

CREATE POLICY "Users can delete own avatar"
  ON storage.objects FOR DELETE
  USING (
    bucket_id = 'avatars'
    AND auth.uid()::text = (storage.foldername(name))[1]
  );

CREATE POLICY "Anyone can view avatars"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'avatars');
```

## 4. Konfigurasi Authentication

### 4.1 Email/Password (Sudah aktif by default)

Di **Authentication > Providers**, pastikan **Email** sudah enabled.

> **Tip**: Untuk development, Anda bisa disable "Confirm email" di **Authentication > Settings > Email Auth** agar tidak perlu verifikasi email saat testing.

### 4.2 Konfigurasi Reset Password (Lupa Password)

Di **Authentication > URL Configuration**, pastikan **Redirect URLs** sudah mencakup:

```
http://localhost:3000/reset-password
```

> **Production**: Ganti dengan domain production Anda, misal: `https://yourdomain.com/reset-password`

### 4.3 Google OAuth

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
3. Tambahkan di **Redirect URLs**:
   - `http://localhost:3000/auth/callback`
   - `http://localhost:3000/reset-password`

> **Production**: Ganti URL di atas dengan domain production Anda.

## 6. Jalankan Aplikasi

```bash
npm run dev
```

Buka [http://localhost:3000](http://localhost:3000) dan coba:
1. Register akun baru → cek nickname otomatis di tabel `profiles`
2. Login
3. Buat gallery
4. Upload gambar
5. Share gallery public
6. Coba "Forgot Password" di halaman login
7. Buka `/settings` untuk update nickname & foto profil
