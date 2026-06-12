# GatheringRef - Application Flowcharts

This document contains comprehensive flowcharts for all user flows in the GatheringRef application.

---

## Table of Contents
1. [Authentication Flow](#1-authentication-flow)
2. [Password Recovery Flow](#2-password-recovery-flow)
3. [Gallery Management Flow](#3-gallery-management-flow)
4. [Image Management Flow](#4-image-management-flow)
5. [Public Gallery Access Flow](#5-public-gallery-access-flow)
6. [Settings Flow](#6-settings-flow)

---

## 1. Authentication Flow

### 1.1 User Registration

```mermaid
flowchart TD
    A[User visits /register] --> B{Login Method?}
    
    B -->|Email/Password| C[User enters email, password, confirm password]
    C --> D{Validation}
    
    D -->|Passwords don't match| E[Show error: Passwords do not match]
    E --> C
    
    D -->|Password too short| F[Show error: Password must be at least 6 characters]
    F --> C
    
    D -->|Valid| G[Submit registration]
    G --> H{Supabase signUp}
    
    H -->|Success| I[Show success message: Check your email]
    I --> J[User clicks link in email]
    J --> K[Redirect to /auth/callback]
    K --> L[Exchange code for session]
    L --> M{Create profile in DB}
    M -->|Success| N[Redirect to /dashboard]
    M -->|Profile exists| N
    
    H -->|Email already registered| O[Show error: Email already registered]
    O --> C
    
    B -->|Google OAuth| P[User clicks Continue with Google]
    P --> Q[Redirect to Google OAuth]
    Q --> R{User grants permission}
    R -->|Granted| S[Redirect to /auth/callback with code]
    S --> T[Exchange code for session]
    T --> U{Create profile if not exists}
    U -->|Generate nickname from name or random| V[Redirect to /dashboard]
    U -->|Profile exists| V
```

### 1.2 User Login

```mermaid
flowchart TD
    A[User visits /login] --> B{Login Method?}
    
    B -->|Email/Password| C[User enters email and password]
    C --> D{Validation}
    
    D -->|Empty fields| E[Show validation error]
    E --> C
    
    D -->|Valid| F[Submit login]
    F --> G{Supabase signInWithPassword}
    
    G -->|Success| H[Redirect to /dashboard]
    
    G -->|Wrong credentials| I[Show error: Invalid login credentials]
    I --> C
    
    G -->|User not found| J[Show error: Email not registered]
    J --> C
    
    B -->|Google OAuth| K[User clicks Continue with Google]
    K --> L[Redirect to Google OAuth]
    L --> M{User grants permission}
    M -->|Granted| N[Redirect to /auth/callback with code]
    N --> O[Exchange code for session]
    O --> P{Check existing profile}
    P -->|No profile| Q[Create profile with Google name]
    P -->|Profile exists| R[Proceed]
    Q --> S[Redirect to /dashboard]
    R --> S
```

### 1.3 User Logout

```mermaid
flowchart TD
    A[User clicks Logout in navbar dropdown] --> B[Call /api/auth/logout]
    B --> C[Clear server session]
    C --> D[Clear client state]
    D --> E[Set user to null]
    E --> F[Redirect to /]
    F --> G[Refresh page]
```

### 1.4 Auth Callback (OAuth)

```mermaid
flowchart TD
    A[User redirected to /auth/callback] --> B{Authorization code present?}
    
    B -->|No| C[Redirect to /login with error]
    
    B -->|Yes| D[Exchange code for session]
    D --> E{Session created?}
    
    E -->|No| C
    
    E -->|Yes| F{Fetch user profile}
    F --> G{Profile exists?}
    
    G -->|Yes| H[Redirect to /dashboard]
    
    G -->|No| I[Generate nickname]
    I --> J[Create profile in database]
    J --> H
```

---

## 2. Password Recovery Flow

### 2.1 Forgot Password

```mermaid
flowchart TD
    A[User visits /forgot-password] --> B[User enters email address]
    B --> C{Submit form}
    
    C --> D{Valid email format?}
    
    D -->|Invalid| E[Show validation error]
    E --> B
    
    D -->|Valid| F[Call Supabase resetPasswordForEmail]
    
    F --> G{Send reset email?}
    
    G -->|Success| H[Show success: Check your email]
    H --> I[User clicks link in email]
    I --> J[Redirect to /reset-password]
    
    G -->|Error| K[Show error message]
    K --> B
```

### 2.2 Reset Password

```mermaid
flowchart TD
    A[User clicks reset link from email] --> B[Navigate to /reset-password]
    B --> C[Supabase sets PASSWORD_RECOVERY event]
    C --> D[Listen for PASSWORD_RECOVERY event]
    
    D --> E[User enters new password]
    E --> F{Validation}
    
    F -->|Passwords don't match| G[Show error]
    G --> E
    
    F -->|Password too short| H[Show error]
    H --> E
    
    F -->|Valid| I[Submit new password]
    
    I --> J[Call Supabase updateUser]
    J --> K{Password updated?}
    
    K -->|Success| L[Show success message]
    L --> M[Redirect to /dashboard after 2s]
    
    K -->|Error| N[Show error message]
    N --> E
```

---

## 3. Gallery Management Flow

### 3.1 View Dashboard

```mermaid
flowchart TD
    A[User visits /dashboard] --> B{Fetch user galleries}
    B --> C[Call /api/galleries GET]
    
    C --> D{Authenticated?}
    
    D -->|No| E[Redirect to /login]
    
    D -->|Yes| F[Fetch galleries from Supabase]
    F --> G{Fetch profile}
    G --> H[Display gallery grid]
    
    H --> I{Galleries exist?}
    
    I -->|Yes| J[Show gallery cards with images]
    
    I -->|No| K[Show empty state]
    K --> L[User clicks Create First Gallery]
    L --> M[Open CreateGalleryModal]
```

### 3.2 Create Gallery

```mermaid
flowchart TD
    A[User clicks New Gallery button] --> B[Open CreateGalleryModal]
    
    B --> C[User enters gallery name]
    C --> D{Optional: Add description}
    
    D --> E{Set visibility}
    
    E -->|Private| F[Set is_public = false]
    F --> G[No share_slug generated]
    
    E -->|Public| H[Set is_public = true]
    H --> I[Generate share_slug with nanoid]
    
    G --> J{Submit form}
    I --> J
    
    J --> K[Call /api/galleries POST]
    K --> L{Gallery created?}
    
    L -->|Success| M[Close modal]
    M --> N[Refresh gallery list]
    N --> O[Show new gallery in grid]
    
    L -->|Error| P[Show error message]
    P --> C
```

### 3.3 View Gallery Detail

```mermaid
flowchart TD
    A[User clicks gallery card] --> B[Navigate to /dashboard/gallery/:id]
    
    B --> C[Fetch gallery details]
    C --> D[Call /api/galleries/:id GET]
    
    D --> E{Gallery exists?}
    
    E -->|No| F[Redirect to /dashboard]
    
    E -->|Yes| G{User owns gallery?}
    
    G -->|No| F
    
    G -->|Yes| H[Fetch images]
    H --> I[Display gallery header]
    I --> J[Display image uploader]
    J --> K{Images exist?}
    
    K -->|Yes| L[Display ImageGrid]
    
    K -->|No| M[Show empty state]
    M --> N[Message: No images yet]
```

### 3.4 Edit Gallery Settings

```mermaid
flowchart TD
    A[User clicks Settings button] --> B[Open GallerySettingsModal]
    
    B --> C[Display current settings]
    C --> D[User modifies name/description/visibility]
    
    D --> E{Visibility changed?}
    
    E -->|To Public| F[Generate share_slug if not exists]
    F --> G[Save settings]
    
    E -->|To Private| H[Keep existing share_slug]
    H --> G
    
    E -->|No change| G
    
    G --> I[Call /api/galleries/:id PATCH]
    I --> J{Settings updated?}
    
    J -->|Success| K[Close modal]
    K --> L[Update UI with new settings]
    
    J -->|Error| M[Show error message]
    M --> D
```

### 3.5 Delete Gallery

```mermaid
flowchart TD
    A[User clicks Delete button] --> B[Open DeleteModal]
    
    B --> C{User confirms?}
    
    C -->|Cancel| D[Close modal, no action]
    
    C -->|Confirm| E[Call /api/galleries/:id DELETE]
    
    E --> F{Fetch all images for gallery}
    F --> G[Delete images from storage]
    G --> H[Delete image records from DB]
    H --> I[Delete gallery record]
    
    I --> J{Gallery deleted?}
    
    J -->|Success| K[Redirect to /dashboard]
    K --> L[Refresh gallery list]
    
    J -->|Error| M[Show error message]
```

---

## 4. Image Management Flow

### 4.1 Upload Images

```mermaid
flowchart TD
    A[User on gallery detail page] --> B[Drag & drop images or click to browse]
    
    B --> C[File input accepts images]
    C --> D[Add images to preview grid]
    
    D --> E{More images?}
    
    E -->|Yes| F[Add more files]
    F --> D
    
    E -->|No| G[Click Upload button]
    
    G --> H[Loop through each file]
    H --> I[For each file: Create FormData]
    I --> J[POST to /api/galleries/:id/images]
    
    J --> K{File uploaded?}
    
    K -->|Success| L[Store image record in DB]
    L --> M[Update progress bar]
    M --> N{More files?}
    
    N -->|Yes| H
    
    N -->|No| O[Clear preview]
    O --> P[Refresh gallery images]
    
    K -->|Error| Q[Show error message]
    Q --> R[Continue with remaining files]
    R --> N
```

### 4.2 Delete Image

```mermaid
flowchart TD
    A[User hovers over image] --> B[Delete button appears]
    
    B --> C[User clicks Delete]
    C --> D[Open DeleteImageModal]
    
    D --> E{User confirms?}
    
    E -->|Cancel| F[Close modal]
    
    E -->|Confirm| G[Call /api/galleries/:id/images/:imageId DELETE]
    
    G --> H[Delete image from storage]
    H --> I[Delete image record from DB]
    
    I --> J{Image deleted?}
    
    J -->|Success| K[Close modal]
    K --> L[Remove image from UI]
    
    J -->|Error| M[Show error message]
```

---

## 5. Public Gallery Access Flow

### 5.1 View Public Gallery

```mermaid
flowchart TD
    A[User visits /g/:slug] --> B[Fetch gallery by share_slug]
    
    B --> C[Call Supabase galleries table]
    C --> D{is_public = true?}
    
    D -->|No| E[Show 404 notFound]
    
    D -->|Yes| F[Fetch gallery details]
    F --> G[Fetch author profile]
    G --> H[Fetch images]
    
    H --> I[Get public URLs for images]
    I --> J[Display gallery header]
    J --> K[Show author info]
    K --> L[Display ImageGrid]
    
    L --> M{Images exist?}
    
    M -->|Yes| N[Show images in grid]
    
    M -->|No| O[Show empty state]
```

### 5.2 Share Gallery

```mermaid
flowchart TD
    A[User clicks Share button on public gallery] --> B[Open ShareModal]
    
    B --> C[Generate share URL: /g/:share_slug]
    C --> D[Display shareable link]
    
    D --> E{Copy link button}
    
    E --> F[Copy to clipboard]
    F --> G[Show confirmation: Copied!]
    
    E --> H[Open social share options]
    H --> I[Share via external platform]
```

---

## 6. Settings Flow

### 6.1 View & Update Profile

```mermaid
flowchart TD
    A[User visits /settings] --> B{Fetch profile}
    B --> C[Call /api/profile GET]
    
    C --> D{Authenticated?}
    
    D -->|No| E[Redirect to /login]
    
    D -->|Yes| F[Display current profile]
    F --> G[Show avatar and nickname]
    
    G --> H{User updates nickname}
    
    H --> I[Enter new nickname]
    I --> J{Validation}
    
    J -->|Too short| K[Show error: min 2 characters]
    K --> I
    
    J -->|Valid| L[Click Save Changes]
    
    L --> M[Call /api/profile PUT]
    M --> N{Profile updated?}
    
    N -->|Success| O[Show success message]
    O --> P[Update UI with new nickname]
    
    N -->|Error| Q[Show error message]
```

### 6.2 Upload Avatar

```mermaid
flowchart TD
    A[User clicks avatar] --> B[Open file picker]
    
    B --> C[User selects image]
    C --> D{File validation}
    
    D -->|File too large >2MB| E[Show error: max 2MB]
    E --> B
    
    D -->|Valid| F[Show preview]
    F --> G[Upload to /api/profile/avatar]
    
    G --> H[Upload to Supabase storage]
    H --> I[Update profile avatar_url in DB]
    
    I --> J{Avatar updated?}
    
    J -->|Success| K[Hide preview, show new avatar]
    K --> L[Show success message]
    
    J -->|Error| M[Show error message]
```

---

## User Navigation Flow Summary

```mermaid
flowchart LR
    subgraph Public
        A[Home Page] --> B[/register]
        A --> C[/login]
        A --> D[/g/:slug - Public Gallery]
    end
    
    subgraph Auth
        B --> E[Registration Flow]
        C --> F[Login Flow]
        E --> G[/auth/callback]
        F --> G
    end
    
    subgraph Protected
        G --> H[/dashboard]
        H --> I[/dashboard/gallery/:id]
        I --> J[Gallery Detail]
        H --> K[/settings]
    end
    
    subgraph Actions
        J --> L[Upload Image]
        J --> M[Share Gallery]
        J --> N[Edit Gallery]
        J --> O[Delete Gallery]
        K --> P[Update Profile]
    end
```

---

## Error Handling Summary

| Flow | Error State | User Experience |
|------|-------------|-----------------|
| Registration | Email already exists | Show localized error message |
| Login | Wrong credentials | Show "Invalid login credentials" |
| Gallery Create | Name required | Disable submit until valid |
| Image Upload | File too large | Show file size error |
| Gallery Delete | API error | Show error, keep modal open |
| Profile Update | Not authenticated | Redirect to login |

---

*Document generated for GatheringRef application*
