# Helplix Legal

AI-powered legal interview assistant that helps you document your legal case through voice conversations.

![Helplix Legal](https://img.shields.io/badge/Status-Production-green) ![License](https://img.shields.io/badge/License-MIT-blue) ![Platform](https://img.shields.io/badge/Platform-Android-lightgrey)

## 🎯 Overview

Helplix Legal is a mobile-first legal dictation app that guides you through an AI-assisted interview to document your legal situation. Our intelligent agents ask relevant questions while simultaneously researching applicable laws, regulations, and court cases relevant to your case.

### Key Features

- **Voice-First Interface**: Simply speak your answers - no typing required
- **AI-Powered Interviews**: 7-phase structured interview methodology
- **Real-Time Legal Research**: Agents fetch relevant laws, regulations, and court cases during your interview
- **Multi-Jurisdiction Support**: Available for Sweden, Brazil, Mexico, Dominican Republic, Netherlands, and USA
- **97% Model Accuracy**: Our AI agents achieve exceptional performance with 97% test scores
- **Comprehensive Reports**: Generate detailed reports including timelines, legal analysis, and interpretation summaries

## ⚠️ Important Disclaimer

**Helplix Legal is NOT legal advice.** This app provides guidance and helps you compile your situation, but you should always consult with a qualified lawyer for legal matters. Share your generated reports with your attorney to save time and reduce costs.

**Note:** Our AI agents cannot appear in court or provide legal representation (not yet!).

## 🚀 Getting Started

### Prerequisites

- Node.js & npm installed
- A Supabase account (for backend)

### Installation

```bash
# Clone the repository
git clone https://github.com/magnusfroste/helplix-legal.git
cd helplix-legal

# Install dependencies
npm install

# Start development server
npm run dev
```

### Deployment

The easiest way to deploy is via [Lovable](https://lovable.dev):

1. Import your project into Lovable
2. Click Share → Publish

For custom domains, navigate to Project → Settings → Domains.

## 📋 How It Works

### The Interview Process

Helplix Legal guides you through a structured 7-phase interview:

1. **Opening** - Free narrative of your situation
2. **Timeline** - Chronological ordering of events
3. **Details** - Specific details and circumstances
4. **Legal** - Legal aspects and considerations
5. **Evidence** - Documentation and witnesses
6. **Impact** - Consequences and damages
7. **Closing** - Summary and information gaps

### Data Flow

```
You speak → Speech-to-Text → AI Agent → Legal Research → Text-to-Speech → You hear response
```

During your interview, our AI agents:
- Ask relevant follow-up questions
- Research applicable laws and regulations
- Find relevant court cases and precedents
- Identify information gaps
- Compile comprehensive documentation

### Report Generation

After completing your interview, click "Generate Report" to create three comprehensive reports:

- **Chronological Timeline** - Event-by-event documentation
- **Legal Analysis** - Applicable laws and regulations
- **Interpretation Report** - Summary and recommendations

## 🏗️ Architecture

Helplix Legal uses a modern, secure architecture:

### Frontend
- **Framework**: React + Vite + TypeScript
- **UI**: shadcn-ui + Tailwind CSS
- **State Management**: TanStack Query
- **Voice**: ElevenLabs TTS/STT

### Backend
- **Platform**: Supabase (PostgreSQL + Edge Functions)
- **AI Models**: Lovable AI Gateway, OpenAI, Google Gemini, or Local LLM
- **Legal Research**: Perplexity API

### Security
- Row-Level Security (RLS) for data isolation
- API keys stored as Supabase secrets (never in database)
- Rate limiting on platform level
- Admin role verification

For detailed architecture documentation, see [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md)

## 🌍 Supported Jurisdictions

| Country | Language | Code |
|---------|----------|------|
| Sweden | Swedish | SE |
| Brazil | Portuguese | BR |
| Mexico | Spanish | MX |
| Dominican Republic | Spanish | DO |
| Netherlands | Dutch | NL |
| USA | English | US |

Each jurisdiction has customized system prompts, phase instructions, and report templates.

## 🤖 AI Configuration

Helplix Legal supports multiple AI providers:

1. **Lovable AI** (Default) - No configuration required
2. **OpenAI** - Requires API key
3. **Google Gemini** - Requires API key
4. **Local LLM** - For development/testing

Admins can configure AI providers via the Admin Panel. See [docs/AI_PROVIDERS.md](docs/AI_PROVIDERS.md) for details.

## 📊 Performance

Our AI agents demonstrate exceptional performance:

- **Model Accuracy**: 97% test score
- **Interview Effectiveness**: Structured methodology ensures comprehensive coverage
- **Legal Research**: Real-time access to current laws and precedents
- **Multi-Language**: Native support for 6 languages across 6 countries

## 🔧 Configuration

### Environment Variables

Required environment variables (set in Supabase Secrets):

```
LOVABLE_API_KEY          # Auto-configured
OPENAI_API_KEY          # Optional, for OpenAI
GOOGLE_API_KEY          # Optional, for Gemini
LOCAL_LLM_API_KEY       # Optional, for local LLM
ELEVENLABS_API_KEY      # For voice features
PERPLEXITY_API_KEY      # For legal research
```

### Feature Flags

Admin-controlled features:

- `tts_enabled` - Text-to-speech
- `stt_enabled` - Speech-to-text
- `realtime_transcription` - Live transcription
- `streaming_tts` - Streaming voice output
- `voice_cloning` - Advanced voice features

## 📚 Documentation

- [Architecture](docs/ARCHITECTURE.md) - System architecture and data flow
- [AI Providers](docs/AI_PROVIDERS.md) - AI configuration and management
- [Auth System](docs/AUTH_SYSTEM.md) - Authentication and authorization
- [Benchmark Tests](docs/BENCHMARK.md) - Performance metrics and test results

## 🛠️ Development

### Available Scripts

```bash
npm run dev          # Start development server
npm run build        # Build for production
npm run build:dev    # Build for development
npm run lint         # Run ESLint
npm run preview      # Preview production build
```

### Project Structure

```
helplix-legal/
├── src/
│   ├── components/     # React components
│   ├── pages/          # Application pages
│   ├── hooks/          # Custom React hooks
│   ├── lib/            # Utilities
│   └── types/          # TypeScript types
├── supabase/
│   ├── functions/      # Edge functions
│   └── migrations/     # Database migrations
└── docs/               # Documentation
```

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🙏 Acknowledgments

- Built with [Lovable](https://lovable.dev)
- Voice powered by [ElevenLabs](https://elevenlabs.io)
- Legal research via [Perplexity](https://perplexity.ai)
- Backend by [Supabase](https://supabase.com)

## 📞 Support

For support, please open an issue in the GitHub repository or contact the maintainers.

---

**Remember**: This tool is for guidance and documentation only. Always consult with a qualified attorney for legal advice.
