# Prompt Builder

A modern React application built with Vite, TypeScript, and Tailwind CSS for creating and managing AI-powered prompts with rich text editing capabilities.

## 🚀 Features

- **Rich Text Editor**: Built with TipTap for advanced text editing
- **AI Integration**: Powered by OpenRouter for AI model access
- **Authentication**: Secure user authentication with Supabase Auth
- **Modern Stack**: React 18, TypeScript, Vite, and Tailwind CSS
- **Testing**: Vitest with React Testing Library for unit tests
- **Drag & Drop**: React DnD for interactive UI components

## 🛠 Tech Stack

- **Frontend**: React 18, TypeScript, Vite
- **Styling**: Tailwind CSS with Typography plugin
- **Rich Text**: TipTap editor with extensions
- **AI Integration**: OpenRouter AI SDK
- **Authentication**: Supabase Auth
- **Testing**: Vitest + React Testing Library
- **State Management**: React hooks and context

## 📦 Installation

### Prerequisites

- Node.js (v18 or higher)
- npm or yarn package manager

### Setup

1. **Clone the repository**

   ```bash
   git clone https://github.com/your-username/prompt-builder-vite.git
   cd prompt-builder-vite
   ```

2. **Install dependencies**

   ```bash
   npm install
   # or
   yarn install
   ```

3. **Environment Configuration**

   Create a `.env` file in the root directory and add the following environment variables:

   ```env
   # OpenRouter API Key
   VITE_OPENROUTER_API_KEY=your_openrouter_api_key_here

   # Supabase Configuration
   VITE_SUPABASE_URL=your_supabase_url_here
   VITE_SUPABASE_ANON_KEY=your_supabase_anon_key_here
   ```

   **Note**: The `.env` file is already included in `.gitignore` to ensure your secrets remain secure.

## 🧪 Testing

### Running Tests

```bash
# Run all tests
npm run test

# Run tests in watch mode
npm run test

# Run tests once
npm run test:run

# Run tests with UI
npm run test:ui
```

The project uses Vitest as the testing framework with React Testing Library for component testing.

## 🚀 Development

### Start Development Server

```bash
npm run dev
# or
yarn dev
```

The application will be available at `http://localhost:3000`

### Build for Production

```bash
npm run build
# or
yarn build
```

### Preview Production Build

```bash
npm run preview
# or
yarn preview
```

## 🌐 Deployment

This application is automatically deployed to **Vercel** when changes are pushed to the `main` branch.

### Automatic Deployment

- **Branch**: `main`
- **Platform**: Vercel
- **Trigger**: Automatic on push to main branch
- **Environment Variables**: Configured in Vercel dashboard

### Manual Deployment

To deploy manually:

```bash
# Build the application
npm run build

# Deploy the dist/ folder to your hosting provider
```

## 🔧 Services Used

### OpenRouter

- **Purpose**: AI model integration for prompt processing
- **SDK**: `@openrouter/ai-sdk-provider`
- **Configuration**: Requires API key in environment variables

### Supabase

- **Purpose**: Authentication and database services
- **SDK**: `@supabase/supabase-js`
- **Features**:
  - User authentication
  - Database management
  - Real-time subscriptions
- **Configuration**: Requires URL and anon key in environment variables

## 📁 Project Structure

```
prompt-builder-vite/
├── src/
│   ├── components/     # React components
│   ├── hooks/         # Custom React hooks
│   ├── services/      # API and external service integrations
│   ├── types/         # TypeScript type definitions
│   └── utils/         # Utility functions
├── public/            # Static assets
├── tests/             # Test files
├── .env               # Environment variables (don't commit)
├── .gitignore         # Git ignore configuration
└── package.json       # Project dependencies and scripts
```

## 🔒 Security

- Environment variables are properly configured in `.gitignore`
- Supabase Row Level Security (RLS) should be configured for data protection
- API keys are managed through environment variables

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License.

---

<p align="center">
<img src="./powered-by-vitawind-bright.png">
</p>
