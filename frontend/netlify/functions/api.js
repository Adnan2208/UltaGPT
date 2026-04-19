import { Groq } from 'groq-sdk';

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY,
});

const defaultHeaders = {
  'Content-Type': 'application/json',
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'Content-Type',
  'Access-Control-Allow-Methods': 'GET,POST,OPTIONS',
};

const textHeaders = {
  ...defaultHeaders,
  'Content-Type': 'text/plain; charset=utf-8',
};

export const handler = async (event) => {
  const path = event.path.replace(/^\/.netlify\/functions\/api/, '') || '/';

  if (event.httpMethod === 'OPTIONS') {
    return {
      statusCode: 204,
      headers: defaultHeaders,
      body: '',
    };
  }

  if (path === '/' && event.httpMethod === 'GET') {
    return {
      statusCode: 200,
      headers: textHeaders,
      body: 'Welcome to the FreeLLM API',
    };
  }

  if (path === '/chat' && event.httpMethod === 'POST') {
    try {
      const payload = event.body ? JSON.parse(event.body) : {};
      const message = payload.message?.trim();

      if (!message) {
        return {
          statusCode: 400,
          headers: defaultHeaders,
          body: JSON.stringify({ error: 'message is required' }),
        };
      }

      const chatCompletion = await groq.chat.completions.create({
        messages: [{ role: 'user', content: message }],
        model: 'llama-3.1-8b-instant',
      });

      return {
        statusCode: 200,
        headers: textHeaders,
        body: chatCompletion.choices[0].message.content ?? '',
      };
    } catch (error) {
      console.error('Groq chat error:', error);

      return {
        statusCode: 500,
        headers: defaultHeaders,
        body: JSON.stringify({ error: 'Failed to generate response' }),
      };
    }
  }

  return {
    statusCode: 404,
    headers: defaultHeaders,
    body: JSON.stringify({ error: 'Not found' }),
  };
};
