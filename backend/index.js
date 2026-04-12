import { Groq } from 'groq-sdk';
import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';

dotenv.config();

const groq = new Groq({
    apiKey : process.env.GROQ_API_KEY
});

const app = express();
const port = 3000;

app.use(cors());
app.use(express.json());


app.get('/', (req, res) => {
    res.send('Welcome to the FreeLLM API');
});

app.post('/chat', async (req, res) => {
    const { message } = req.body;

    const chatCompletion = await groq.chat.completions.create({
        "messages": [
        {
            "role": "user",
            "content": message
        }
        ],
    "model": "llama-3.1-8b-instant" // Hardcoded for rn.
    })

    res.send(chatCompletion.choices[0].message.content).status(200);
})


app.listen(port, () => {
    console.log(`Server running on ${port}`);
});