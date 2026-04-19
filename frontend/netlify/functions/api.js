import { Groq } from 'groq-sdk';

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY,
});

const MODEL_NAME = process.env.GROQ_MODEL || 'llama-3.3-70b-versatile';

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
  if (event.httpMethod === 'OPTIONS') {
    return {
      statusCode: 204,
      headers: defaultHeaders,
      body: '',
    };
  }

  if (event.httpMethod === 'GET') {
    return {
      statusCode: 200,
      headers: textHeaders,
      body: 'Welcome to the FreeLLM API',
    };
  }

  if (event.httpMethod === 'POST') {
    try {
      if (!process.env.GROQ_API_KEY) {
        return {
          statusCode: 500,
          headers: defaultHeaders,
          body: JSON.stringify({ error: 'Missing GROQ_API_KEY on server' }),
        };
      }

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
        model: MODEL_NAME,
      });

      return {
        statusCode: 200,
        headers: textHeaders,
        body: chatCompletion.choices[0].message.content ?? '',
      };
    } catch (error) {
      console.error('Groq chat error:', error);

      const statusCode = error?.status || 500;
      const detail = error?.error?.message || error?.message || 'Unknown Groq API error';

      return {
        statusCode,
        headers: defaultHeaders,
        body: JSON.stringify({ error: 'Failed to generate response', detail }),
      };
    }
  }

  return {
    statusCode: 404,
    headers: defaultHeaders,
    body: JSON.stringify({ error: 'Not found' }),
  };
};
