# FreeLLM

A Signup-free chat interface to chat with the latest large language models for free.

## Features
- **No Signup Required**: Start chatting instantly without the need for creating an account.
- **Access to Latest Models**: Interact with cutting-edge large language models.
- **User-Friendly Interface**: Simple and intuitive design for seamless communication.

## Getting Started

### Prerequisites
- Node.js (v16 or higher)
- npm or yarn

### Installation
1. Clone the repository:
   ```bash
   git clone <repository-url>
   cd FreeLLM
   ```
2. Install frontend dependencies:
   ```bash
   cd frontend
   npm install
   ```

### Environment Variables
Create `frontend/.env` (or copy from `frontend/.env.example`) with:

```bash
VITE_BACKEND_URL="/api"
GROQ_API_KEY="your_groq_api_key"
```

### Running the Application
1. Start local development through Netlify (frontend + serverless functions):
   ```bash
   cd frontend
   npx netlify dev
   ```
2. Open your browser and navigate to `http://localhost:8888`.

## Deploying to Netlify
1. Push this repo to GitHub/GitLab/Bitbucket.
2. In Netlify, create a new site from the repository.
3. Set `frontend` as the base directory.
4. Build settings are already configured in `frontend/netlify.toml`:
   - Build command: `npm run build`
   - Publish directory: `dist`
   - Functions directory: `netlify/functions`
5. In Site Settings -> Environment Variables, add:
   - `GROQ_API_KEY` = your Groq API key
   - Optional: `VITE_BACKEND_URL` = `/api`
6. Trigger deploy.

After deployment, your frontend calls `/api/chat`, which is routed to Netlify Function `api`.

## Contributing
Contributions are welcome! Feel free to open issues or submit pull requests.