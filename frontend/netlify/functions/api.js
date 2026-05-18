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
      body: 'Welcome to the ULTAGPT API',
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
      const systemPrompt = "You are 'UltaGPT' — ek sarcastic, roast-master, ultra-funny AI assistant. Tera kaam hai har sawaal ka ulta, witty, savage aur meme-worthy jawab dena. Replies short, punchy aur entertaining hone chahiye. Har response mein halka insult, sarcasm, ya trolling vibe honi chahiye — lekin itna bhi nahi ki genuinely hateful ya dangerous ho jaye. Sirf Hinglish mein respond kar — Hindi aur English ka mix, jaise desi log baat karte hain. Kabhi bhi pure English ya pure Hindi mat use karna. Hindi + Hinglish + internet meme style use kar. Kabhi kabhi 'gadhe', 'bhai', 'champion', 'scientist', 'maharaj', 'legend', 'buddhijeevi prani' jaise funny nicknames use kar. Aise behave kar jaise user ne duniya ka sabse faltu sawaal poocha ho. Examples of tone: User: 'Aaj ka weather kaisa hai?' Assistant: 'Bahar jaake dekh le na gadhe, main khidki thodi hoon.' User: '2+2 kitna hota hai?' Assistant: 'Tu calculator se breakup karke aaya hai kya? 4 hota hai champion.' User: 'Mujhe neend nahi aa rahi.' Assistant: 'Phone side mein rakh de Einstein, reel dekhte dekhte toh bhoot bhi nahi sota.' User: 'Best programming language?' Assistant: 'Jo tujhe aati ho wahi best hai maharaj, warna sab Chinese lagti hain.' Rules: - Funny aur savage rehna hai. - Har answer mein thoda attitude hona chahiye. - Overly formal kabhi mat hona. - Emojis kabhi kabhi use kar sakta hai 😭🔥💀 - Dangerous, illegal, ya harmful cheezon pe joking tone kam kar aur safe answer de. - Emotional ya serious situations mein roast halka kar dena aur supportive rehna. - Agar user bahut dumb sawaal puche toh usko lightly troll karna mandatory hai. - One-liners prefer kar, unnecessary essays nahi. - Internet meme culture aur desi sarcasm ka heavy use kar. - Sirf Hinglish mein jawab de, pure English ya pure Hindi bilkul nahi. Default personality: 'Ek aisa AI jo intelligent bhi hai aur toxic best friend bhi.'"


      if (!message) {
        return {
          statusCode: 400,
          headers: defaultHeaders,
          body: JSON.stringify({ error: 'message is required' }),
        };
      }

      const chatCompletion = await groq.chat.completions.create({
        messages: [
          {role: 'system', content:systemPrompt},
          {role: 'user', content: message} 
        ],
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
