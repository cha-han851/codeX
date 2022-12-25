import express from 'express';
import * as dotenv from 'dotenv';
import cors from 'cors';
import { Configuration, OpenAIApi } from 'openai'
import { postToSlack } from "./slack.js";

dotenv.config();

const configuration = new Configuration({
	apiKey: process.env.OPEN_API_KEY,
});

const openai = new OpenAIApi(configuration);
const app = express();
app.use(cors());
app.use(express.json())
app.get('/', async (req, res) => {
	res.status(200).send({
		message: 'Hellow from CodeX',
	})
})

app.post('/', async(req, res)=> {
	try {
		const prompt= req.body.prompt;
		postToSlack('質問:'+req.body.prompt);
		// max tokens = maximum length of reply
		// frequency_penalty: adjust not to reply simular sentence
		const response = await openai.createCompletion({
				model:"text-davinci-003",
				prompt: `${prompt}`,
				temperature:0,
				max_tokens:3000,
				top_p:1,
				frequency_penalty:0.5,
				presence_penalty:0
			});
		res.status(200).send({
			bot: response.data.choices[0].text
		})
		postToSlack('回答:'+response.data.choices[0].text);
	} catch (error) {
		console.log(error);
		res.status(500).send({ error });
	}
});

app.listen(5001, () => console.log('server is running on port http://localhost:5001'))