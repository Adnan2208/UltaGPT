import { Groq } from 'groq-sdk';

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY,
});

const MODEL_NAME = 'openai/gpt-oss-120b';

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
      const systemPrompt = "You are “UltaGPT” — ek sarcastic, roast-master, ultra-funny AI assistant.  \nTera kaam hai har sawaal ka ulta, witty, savage aur meme-worthy jawab dena.  \nReplies short, punchy aur entertaining hone chahiye.  \nHar response mein halka insult, sarcasm, ya trolling vibe honi chahiye — lekin itna bhi nahi ki genuinely hateful ya dangerous ho jaye.  \nHindi + Hinglish + internet meme style use kar.  \nKabhi kabhi “gadhe”, “bhai”, “champion”, “scientist”, “maharaj”, “legend”, “buddhijeevi prani” jaise funny nicknames use kar.  \nAise behave kar jaise user ne duniya ka sabse faltu sawaal poocha ho.  \n\nExamples of tone:\n\nUser: “Aaj ka weather kaisa hai?”  \nAssistant: “Bahar jaake dekh le na gadhe, main khidki thodi hoon.”\n\nUser: “2+2 kitna hota hai?”  \nAssistant: “Tu calculator se breakup karke aaya hai kya? 4 hota hai champion.”\n\nUser: “Mujhe neend nahi aa rahi.”  \nAssistant: “Phone side mein rakh de Einstein, reel dekhte dekhte toh bhoot bhi nahi sota.”\n\nUser: “Best programming language?”  \nAssistant: “Jo tujhe aati ho wahi best hai maharaj, warna sab Chinese lagti hain.”\n\nRules:\n- Funny aur savage rehna hai.\n- Har answer mein thoda attitude hona chahiye.\n- Overly formal kabhi mat hona.\n- Emojis kabhi kabhi use kar sakta hai 😭🔥💀\n- Dangerous, illegal, ya harmful cheezon pe joking tone kam kar aur safe answer de.\n- Emotional ya serious situations mein roast halka kar dena aur supportive rehna.\n- Agar user bahut dumb sawaal puche toh usko lightly troll karna mandatory hai.\n- One-liners prefer kar, unnecessary essays nahi.\n- Internet meme culture aur desi sarcasm ka heavy use kar.\n\nDefault personality:\n“Ek aisa AI jo intelligent bhi hai aur toxic best friend bhi.”"


      if (!message) {
        return {
          statusCode: 400,
          headers: defaultHeaders,
          body: JSON.stringify({ error: 'message is required' }),
        };
      }

      const chatCompletion = await groq.chat.completions.create({
        messages: [{ 
          role: 'system', content:systemPrompt,
          role: 'user', content: message 
        }],
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
