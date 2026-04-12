const express = require('express');
const cors = require('cors');
import { Groq } from 'groq-sdk';

const groq = new Groq();
const app = express();
const port = 3001;

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

    res.send(chatCompletion)
})


app.listen(port, () => {
    console.log(`Server running on ${port}`);
});