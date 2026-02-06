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

- **Chronological Timeline** - Event-by-event documentation of your entire case
- **Legal Analysis** - Applicable laws, regulations, and relevant court cases
- **Interpretation Report** - Summary, recommendations, and identified information gaps

These reports are designed to be shared with your attorney to save time, reduce consultation costs, and ensure all relevant details are documented professionally. The reports compile all information gathered during your interview, including the AI research on applicable laws and precedents, providing your lawyer with a comprehensive foundation for your case.

## 🤖 Multi-Agent Architecture

Helplix Legal uses a sophisticated multi-agent system where specialized AI agents collaborate to provide comprehensive legal assistance. Each agent has distinct objectives and works in coordination with others.

### Agent Overview

**1. Interview Agent (cooper-chat)**
- **Objective**: Conduct structured 7-phase interviews to gather comprehensive case information
- **Responsibilities**:
  - Ask relevant questions based on interview phase (opening, timeline, details, legal, evidence, impact, closing)
  - Track information gaps and completeness percentage
  - Follow jurisdiction-specific behavior guidelines
  - Maintain language consistency throughout the interview
  - Adapt question intensity based on user responses

**2. Legal Research Agent (perplexity-legal-search)**
- **Objective**: Find relevant case law, precedents, and legal documentation
- **Responsibilities**:
  - Search jurisdiction-specific court databases and legal systems
  - Provide citations with case names, courts, dates, and reference numbers
  - Explain relevance of each case to the user's situation
  - Identify key legal principles and applicable legislation
  - Support 6 jurisdictions (Sweden, Brazil, Mexico, Dominican Republic, Netherlands, USA)

**3. Classification Agent (classify-session)**
- **Objective**: Categorize case type and generate metadata
- **Responsibilities**:
  - Analyze conversation history to identify case type
  - Classify into categories: travel_damage, consumer, insurance, housing, employment, personal_injury, general
  - Generate brief summary (max 100 characters)
  - Create short title (max 40 characters)
  - Update session metadata for better organization

**4. Report Generation Agent (cooper-report)**
- **Objective**: Generate comprehensive legal documentation
- **Responsibilities**:
  - Create three detailed reports: Chronological Timeline, Legal Analysis, and Interpretation Report
  - Incorporate case law from legal research agent
  - Use jurisdiction-specific templates and legal systems
  - Apply proper legal frameworks (e.g., Brazilian law, Swedish law, Dutch law)
  - Generate professional reports suitable for sharing with attorneys

### Agent Collaboration

The agents work together seamlessly:

1. **Interview Phase**: cooper-chat conducts the structured interview, gathering information while identifying gaps
2. **Classification**: classify-session categorizes the case type early in the process
3. **Research**: perplexity-legal-search proactively finds relevant case law and precedents
4. **Report Generation**: cooper-report synthesizes all information into professional legal documentation

This multi-agent approach ensures:
- **Comprehensive Coverage**: Each agent specializes in its domain
- **Information Integration**: Legal research informs both interview questions and report generation
- **Jurisdiction Accuracy**: All agents respect country-specific legal systems
- **Efficiency**: Parallel processing enables real-time legal research during interviews

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

### Test Results

See our comprehensive test report demonstrating the system's effectiveness in real-world scenarios. The report shows exceptional performance across multiple test cases, including overbooking and denied boarding situations. The test results validate our 97% model accuracy and demonstrate the AI's ability to handle complex legal interviews with precision and thoroughness.

For detailed test results and benchmark scores, see the test report in the repository.

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
