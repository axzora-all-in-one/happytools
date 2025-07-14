# HappyTools - AI Tools Discovery Platform

> Your daily dose of happiness-inducing AI tools, curated from the best sources. Discover amazing AI tools that make you happy!

## 🚀 Features

- **AI Tools Discovery**: Curated collection from Product Hunt, AITools.fyi, and more
- **Advanced AI Agents**: 20+ professional AI agents for various tasks
- **Chatbot Builder**: Create intelligent chatbots with custom knowledge bases
- **Workflow Builder**: Generate automation workflows for n8n and Make.com
- **Real-time Search & Filtering**: Advanced search with category and source filtering
- **Daily Updates**: Automated scraping and updates from multiple sources

## 🛠️ Tech Stack

- **Frontend**: Next.js 14, React 18, Tailwind CSS, shadcn/ui
- **Backend**: Next.js API Routes, Node.js
- **Database**: MongoDB
- **UI Components**: Radix UI, Lucide React
- **Styling**: Tailwind CSS with custom animations
- **Package Manager**: Yarn

## 📋 Prerequisites

Before you begin, ensure you have the following installed on your system:

- **Node.js** (v18.0.0 or higher)
- **Yarn** (v1.22.0 or higher)
- **MongoDB** (v5.0 or higher) or MongoDB Atlas account
- **Git** for version control

### Check your versions:
```bash
node --version
yarn --version
mongo --version  # or mongod --version
```

## 🔧 Installation

### 1. Clone the Repository
```bash
git clone <your-repository-url>
cd happytools
```

### 2. Install Dependencies
```bash
yarn install
```

### 3. Environment Variables Setup

Create a `.env` file in the root directory:

```bash
cp .env.example .env
```

Add the following environment variables to your `.env` file:

```env
# Database Configuration
MONGO_URL=mongodb://localhost:27017/happytools
DB_NAME=happytools

# Next.js Configuration
NEXT_PUBLIC_BASE_URL=http://localhost:3000

# AI Provider API Keys (Optional - for AI features)
OPENAI_API_KEY=your_openai_api_key_here
ANTHROPIC_API_KEY=your_claude_api_key_here
GOOGLE_API_KEY=your_gemini_api_key_here

# External API Keys (Optional)
RAPIDAPI_KEY=your_rapidapi_key_here

# Development
NODE_ENV=development
```

### 4. Database Setup

#### Option A: Local MongoDB
1. **Install MongoDB** locally following the [official guide](https://docs.mongodb.com/manual/installation/)
2. **Start MongoDB service**:
   ```bash
   # On macOS (using Homebrew)
   brew services start mongodb/brew/mongodb-community
   
   # On Ubuntu/Debian
   sudo systemctl start mongod
   
   # On Windows
   net start MongoDB
   ```
3. **Verify MongoDB is running**:
   ```bash
   mongo --eval "db.adminCommand('ismaster')"
   ```

#### Option B: MongoDB Atlas (Cloud)
1. Create a free account at [MongoDB Atlas](https://cloud.mongodb.com/)
2. Create a new cluster
3. Get your connection string and update `MONGO_URL` in `.env`:
   ```env
   MONGO_URL=mongodb+srv://username:password@cluster.mongodb.net/happytools?retryWrites=true&w=majority
   ```

### 5. API Keys Setup (Optional but Recommended)

#### OpenAI API Key
1. Go to [OpenAI Platform](https://platform.openai.com/api-keys)
2. Create a new API key
3. Add it to your `.env` file

#### Claude API Key (Anthropic)
1. Go to [Anthropic Console](https://console.anthropic.com/)
2. Create a new API key
3. Add it to your `.env` file

#### Google Gemini API Key
1. Go to [Google AI Studio](https://makersuite.google.com/app/apikey)
2. Create a new API key
3. Add it to your `.env` file

## 🚀 Running the Project

### Development Mode
```bash
yarn dev
```

The application will be available at: **http://localhost:3000**

### Production Build
```bash
# Build the application
yarn build

# Start production server
yarn start
```

## 📱 Application Structure

```
happytools/
├── app/                          # Next.js App Router
│   ├── api/                      # API Routes
│   │   └── [[...path]]/         # Catch-all API handler
│   ├── agents/                   # AI Agents page
│   ├── chatbot-builder/         # Chatbot Builder page
│   ├── workflow-builder/        # Workflow Builder page
│   ├── globals.css              # Global styles
│   ├── layout.js                # Root layout
│   └── page.js                  # Home page
├── components/                   # React components
│   ├── ui/                      # shadcn/ui components
│   └── [feature-components]/    # Feature-specific components
├── lib/                         # Utility libraries
│   ├── scrapers/               # Web scraping utilities
│   └── utils/                  # Helper functions
├── public/                      # Static assets
├── .env                        # Environment variables
├── package.json                # Dependencies
└── README.md                   # This file
```

## 🔌 API Endpoints

### AI Tools
- `GET /api/ai-tools` - Get AI tools with filtering and pagination
- `POST /api/ai-tools/sync` - Sync tools from Product Hunt
- `POST /api/ai-tools/sync-aitools` - Sync tools from AITools.fyi
- `POST /api/ai-tools/sync-all` - Sync from all sources
- `GET /api/ai-tools/trending` - Get trending tools
- `GET /api/ai-tools/categories` - Get available categories
- `GET /api/ai-tools/stats` - Get platform statistics

### AI Agents
- `POST /api/agents/run` - Execute AI agents with various capabilities

### Chatbot Builder
- `POST /api/chatbot/create` - Create new chatbot
- `POST /api/chatbot/chat` - Chat with existing chatbot
- `GET /api/chatbot/info/{id}` - Get chatbot information

### Workflow Builder
- `POST /api/workflow-builder/generate` - Generate automation workflows

### System
- `GET /api/status` - Health check endpoint

## 🎯 Key Features Usage

### 1. AI Tools Discovery
- Browse curated AI tools from multiple sources
- Filter by category, source, and search terms
- Sort by votes, name, rating, or featured date

### 2. AI Agents
- 20+ professional AI agents for various tasks
- Business planning, content creation, code generation
- Email writing, social media, data analysis

### 3. Chatbot Builder
- Create custom chatbots with knowledge bases
- Upload documents and add URLs
- Embeddable widget for websites

### 4. Workflow Builder
- Generate automation workflows for n8n and Make.com
- 8 pre-built templates across different categories
- Support for OpenAI, Claude, and Gemini

## 🔧 Configuration

### Package Manager
This project uses **Yarn** exclusively. Do not use npm as it may cause dependency conflicts.

### Environment Variables
All configuration is done through environment variables. Never commit sensitive API keys to version control.

### Database
The application uses UUIDs instead of MongoDB ObjectIDs for better JSON serialization.

## 🐛 Troubleshooting

### Common Issues

#### 1. MongoDB Connection Issues
```bash
# Check if MongoDB is running
mongo --eval "db.runCommand({connectionStatus : 1})"

# Restart MongoDB service
brew services restart mongodb/brew/mongodb-community  # macOS
sudo systemctl restart mongod  # Linux
```

#### 2. Port Already in Use
```bash
# Kill process using port 3000
lsof -ti:3000 | xargs kill -9

# Or use a different port
yarn dev --port 3001
```

#### 3. Dependency Issues
```bash
# Clear yarn cache and reinstall
yarn cache clean
rm -rf node_modules
yarn install
```

#### 4. API Key Issues
- Ensure all API keys are correctly formatted
- Check API key permissions and usage limits
- Verify environment variables are loaded correctly

### Logs and Debugging
```bash
# Check application logs
tail -f /var/log/supervisor/nextjs.*.log

# Debug mode (if available)
DEBUG=* yarn dev
```

## 📚 API Documentation

### Example API Calls

#### Get AI Tools
```bash
curl -X GET "http://localhost:3000/api/ai-tools?page=1&limit=12&category=productivity"
```

#### Run AI Agent
```bash
curl -X POST "http://localhost:3000/api/agents/run" \
  -H "Content-Type: application/json" \
  -d '{
    "agentId": "text-summarizer",
    "inputs": {
      "text": "Your text to summarize here..."
    }
  }'
```

#### Generate Workflow
```bash
curl -X POST "http://localhost:3000/api/workflow-builder/generate" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Email Automation",
    "provider": "openai",
    "apiKey": "your-api-key",
    "automationDescription": "Send email when form is submitted",
    "platform": "n8n"
  }'
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/amazing-feature`
3. Commit your changes: `git commit -m 'Add amazing feature'`
4. Push to the branch: `git push origin feature/amazing-feature`
5. Open a Pull Request

### Development Guidelines
- Use Yarn for package management
- Follow ESLint and Prettier configurations
- Write meaningful commit messages
- Test your changes thoroughly

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- [Next.js](https://nextjs.org/) for the amazing React framework
- [Tailwind CSS](https://tailwindcss.com/) for utility-first CSS
- [shadcn/ui](https://ui.shadcn.com/) for beautiful UI components
- [MongoDB](https://www.mongodb.com/) for the database
- [Product Hunt](https://www.producthunt.com/) for AI tools data
- [AITools.fyi](https://aitools.fyi/) for additional AI tools

## 📞 Support

If you encounter any issues or have questions:

1. Check the [troubleshooting section](#-troubleshooting)
2. Search existing [GitHub issues](https://github.com/your-repo/issues)
3. Create a new issue with detailed information
4. Contact the development team

---

Made with ❤️ for the AI community. Happy coding! 🚀