# Gathering Ref

**Gathering Ref** is a modern web application designed to help users gather images and photos for reference and create mood boards. Whether you're collecting visual inspiration for design projects, creative briefs, interior design, fashion, art direction, or any creative endeavor, Gathering Ref provides a comprehensive platform to organize and manage your visual references in one place.

### Core Purpose
- **Image Collection**: Gather and upload images or photos from various sources for reference
- **Mood Board Creation**: Create and organize visual mood boards for projects
- **Reference Organization**: Categorize and tag images for easy searching and retrieval
- **Public Sharing**: Make galleries public so others can view your references and mood boards
- **User Management**: Secure authentication system for personalized user experiences

## 🚀 Features

- 🖼️ **Image Upload & Collection** - Upload and gather images for reference from various sources
- 🎨 **Mood Board Creation** - Create visual mood boards to organize and showcase your references
- 📁 **Reference Organization** - Categorize and tag images for easy searching and retrieval
- 🔐 **Authentication System** - Complete auth flow with Supabase (register, login, forgot password, reset password)
- 📊 **Dashboard** - Personalized user dashboard to manage your references and mood boards
- ⚙️ **Settings** - User profile and application settings
- 🎨 **Modern UI** - Clean, responsive design with Tailwind CSS
- 🔒 **Secure** - Server-side rendering with proper security measures
- 📱 **Responsive** - Mobile-first design approach

## 🛠️ Tech Stack

- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **Database/Auth**: Supabase
- **Icons**: Custom SVG icons
- **Font**: Custom font optimization with next/font

## 📦 Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/MFarhadA/gathering-ref.git
   cd gathering-ref
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Set up Supabase:
   - Create a new project at [Supabase](https://supabase.com)
   - Follow the setup guide in [SUPABASE_SETUP.md](./SUPABASE_SETUP.md)
   - Copy your Supabase URL and anon key
   - Update your environment variables (see below)

4. Set up environment variables:
   Create a `.env.local` file in the root directory with:
   ```env
   NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
   ```

5. Run the development server:
   ```bash
   npm run dev
   ```

6. Open [http://localhost:3000](http://localhost:3000) in your browser.

## 🚀 Deployment

### Vercel (Recommended)

1. Push your code to GitHub
2. Import project to [Vercel](https://vercel.com)
3. Add environment variables:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
4. Deploy!

### Other Platforms

Build the application:
```bash
npm run build
```

Start in production:
```bash
npm start
```

## 📁 Project Structure

```
├── app/                    # Next.js App Router pages
│   ├── api/               # API routes
│   ├── auth/              # Authentication pages
│   ├── components/        # Reusable components
│   ├── dashboard/         # Dashboard page
│   ├── g/                 # Group/gathering pages
│   ├── login/             # Login page
│   ├── register/          # Registration page
│   ├── settings/          # Settings page
│   ├── forgot-password/   # Forgot password page
│   ├── reset-password/    # Reset password page
│   ├── layout.tsx         # Root layout
│   └── page.tsx           # Home page
├── lib/                   # Utility functions and Supabase client
│   ├── utils.ts           # Utility functions
│   └── supabase/         # Supabase configuration
├── public/                # Static assets
├── styles/                # Global styles
└── config files           # TypeScript, ESLint, Tailwind configs
```

## 🔑 Key Features

### Image & Reference Management
- **Image Upload**: Upload and store images for reference
- **Reference Collections**: Organize images into collections
- **Tagging System**: Tag and categorize images for easy retrieval
- **Search**: Find references quickly across your library

### Mood Board Creation
- **Visual Mood Boards**: Create boards to organize visual references
- **Drag & Drop**: Easily arrange images on mood boards
- **Public Galleries**: Make mood boards public so anyone can view them

### Authentication Flow
- **Registration**: Create account with email/password
- **Login**: Secure login with session management
- **Password Reset**: Forgot and reset password functionality
- **Session Management**: Automatic session handling via Supabase

### Dashboard
- Personalized user experience
- Quick access to your references and mood boards
- User-specific content

### Settings
- Profile management
- Account settings
- Preference configuration

## 🔧 Configuration

### Supabase Setup

For detailed Supabase configuration, see [SUPABASE_SETUP.md](./SUPABASE_SETUP.md).

### Environment Variables

| Variable | Description |
|----------|-------------|
| `NEXT_PUBLIC_SUPABASE_URL` | Your Supabase project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Your Supabase anonymous key |

## 🎨 Customization

### Styling
The project uses Tailwind CSS. You can customize the design by editing:
- `tailwind.config.ts` - Tailwind configuration
- `app/globals.css` - Global styles
- Component files - Individual component styles

### Fonts
The project uses custom fonts optimized with `next/font`. Configure fonts in `app/layout.tsx`.

## 📝 License

This project is open source and available under the MIT License.

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 📧 Support

For support, email support@gatheringref.com or open an issue on GitHub.

## 🔗 Links

- [Live Demo](https://gathering-ref.vercel.app)
- [GitHub Repository](https://github.com/MFarhadA/gathering-ref)
- [Supabase Documentation](https://supabase.com/docs)
- [Next.js Documentation](https://nextjs.org/docs)

---

Built with ❤️ using Next.js, Supabase, and Tailwind CSS
