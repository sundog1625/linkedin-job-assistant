# LinkedIn Job Assistant

A comprehensive LinkedIn job application assistant with AI-powered insights, featuring a Chrome extension and web dashboard.

## 🚀 Features

### Chrome Extension
- **Smart Job Analysis**: Automatically analyzes LinkedIn job posts and provides match scores
- **One-Click Save**: Save jobs directly to your dashboard with detailed information
- **Real-time Insights**: Get instant feedback on job compatibility
- **Multi-language Support**: Available in 8+ languages

### Web Dashboard
- **Job Tracker**: Manage all your job applications in one place
- **Resume Manager**: Create multiple resume versions optimized for different roles
- **LinkedIn Profile Optimizer**: Improve your profile with AI-powered suggestions
- **Interview Preparation**: Practice with AI-generated questions and tips
- **Networking Center**: Manage professional contacts and relationships
- **AI Content Generator**: Create emails, pitches, and social media content

## 🛠️ Tech Stack

- **Frontend**: Next.js 14, TypeScript, Tailwind CSS, Shadcn/UI
- **Chrome Extension**: Manifest V3, React, TypeScript
- **Backend**: Supabase (Database, Auth, Storage, Real-time)
- **AI Integration**: OpenAI API
- **Deployment**: Vercel (Dashboard), Chrome Web Store (Extension)

## 📦 Installation

### Prerequisites
- Node.js 18+ 
- npm or pnpm
- Supabase account
- OpenAI API key

### Setup

1. **Clone the repository**
   ```bash
   git clone https://github.com/yourusername/linkedin-job-assistant.git
   cd linkedin-job-assistant
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Environment Setup**
   ```bash
   cp .env.example .env.local
   # Fill in your environment variables
   ```

4. **Database Setup**
   ```bash
   # Run the SQL schema in Supabase
   # File: packages/supabase/schema.sql
   ```

5. **Start Development**
   ```bash
   # Start the dashboard
   npm run dashboard:dev
   
   # Build the extension
   npm run extension:build
   ```

## 🔧 Environment Variables

Create a `.env.local` file with the following variables:

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key

# OpenAI
OPENAI_API_KEY=your_openai_api_key

# Chrome Extension
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

## 🚀 Deployment

### Web Dashboard (Vercel)
```bash
# Deploy to Vercel
vercel --prod

# Set environment variables in Vercel dashboard
```

### Chrome Extension
1. Build the extension:
   ```bash
   npm run extension:build
   ```
2. Load the `apps/extension/dist` folder in Chrome Developer Mode
3. For production: Package and submit to Chrome Web Store

## 📱 Usage

### Chrome Extension
1. Install the extension from Chrome Web Store
2. Navigate to LinkedIn job listings
3. Click on any job to see the analysis panel
4. Save interesting jobs to your dashboard

### Web Dashboard
1. Visit your deployed dashboard URL
2. Sign up/Sign in with your account
3. Import jobs from the extension or add manually
4. Use AI tools to optimize your applications

## 🎯 Key Features

### Job Matching Algorithm
- Skills compatibility analysis
- Experience level matching  
- Education requirements check
- Location preferences
- Overall compatibility score

### AI-Powered Tools
- Resume optimization for specific jobs
- Cover letter generation
- Follow-up email templates
- LinkedIn content creation
- Interview question preparation

### Profile Optimization
- LinkedIn profile scoring
- Improvement suggestions
- Industry benchmarks
- Real-time feedback

## 🌐 Supported Languages

- English
- 中文 (Chinese)
- Español (Spanish)  
- Français (French)
- Deutsch (German)
- 日本語 (Japanese)
- 한국어 (Korean)
- Português (Portuguese)

## 🧪 Testing

```bash
# Run tests
npm run test

# E2E tests with Playwright
npm run test:e2e
```

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📞 Support

- GitHub Issues: [Report a bug](https://github.com/yourusername/linkedin-job-assistant/issues)
- Email: support@linkedinjobassistant.com
- Documentation: [Full docs](https://docs.linkedinjobassistant.com)

## 🎉 Acknowledgments

- Built with modern web technologies
- Powered by AI for intelligent insights
- Designed for European and American user preferences
- Following KISS, YAGNI, and SOLID principles

---

**Happy Job Hunting! 🎯**