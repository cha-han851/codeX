import express from 'express';
import * as dotenv from 'dotenv';
import cors from 'cors';
import { Configuration, OpenAIApi } from 'openai'
import { postToSlack } from "./slack.js";
import mysql from 'mysql2';
import passport from 'passport';
import LocalStrategy from "passport-local";
import { check, validationResult } from 'express-validator';
import bcrypt from 'bcrypt';
import crypto from 'crypto';
import session from 'express-session';
import db from './models/index.cjs'
import { Op }from "sequelize";
import { Sequelize } from 'sequelize';

dotenv.config();

const configuration = new Configuration({
	apiKey: process.env.OPEN_API_KEY,
});

// local
// const con = mysql.createConnection({
//   host: 'localhost',
//   user: 'root',
//   password: 'OTw#}mrq5Br-UR)',
//   database: 'knowledge_tank'
// });

// production
// const con = mysql.createConnection({
// 	host: '0.0.0.0/0',
// 	user: 'rknowledge_tank_user',
// 	password: 'QIaW2EwOIKEfd4f1iXeEqqlErigzPsj9s)',
// 	database: 'knowledge_tank'
//   });

//   const  client = new Client({
//     user: 'knowledge_tank',
//     host: '0.0.0.0/0',
//     database: 'knowledge_tank',
//     password: 'QIaW2EwOIKEfd4f1iXeEqqlErigzPsj9s)',
//     port: 5432
// })

// con.connect(function(err) {
// 	if (err) throw err;
// 	console.log('Connected');
// 	// con.query('CREATE DATABASE knowledge_tank', function (err, result) {
// 	// if (err) throw err;
// 	// 	console.log('database created');
// 	// });
// });

const openai = new OpenAIApi(configuration);
const app = express();
app.use(session({ secret: "HogeFuga" }));
app.use(passport.initialize());
app.use(passport.session());
app.use(cors());
app.use(express.json())


app.post('/', async(req, res)=> {
	try {
		const prompt= req.body.prompt;
		// postToSlack('質問:'+req.body.prompt);
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
		// postToSlack('回答:'+response.data.choices[0].text);
	} catch (error) {
		console.log(error);
		res.status(500).send({ error });
	}
});

app.post('/api/v1/sign_up', async(req, res)=> {
	try {
		const data = req.body.data;
		let hashed_password = bcrypt.hashSync(data.password, 10);
		const sql = `INSERT INTO users(name, email, password, createdAt, updatedAt) VALUES("${data.name}","${data.email}", "${hashed_password}", "${formatDate(new Date())}", "${formatDate(new Date())}")`
		// const result = con.query(sql,function(err, result, fields){
		// 	if (err) throw err;
		// 	res.status(200).send({session: hashed_password})
		// })


	} catch (error) {
		console.log(error);
		res.status(500).send({ error });
	}
});

app.post('/api/v1/confirm', async(req, res)=> {
	try {
		const data = req.body.data;
		const name = data.name;
		const email = data.email;
		const accessToken = data.accessToken
		const id = data.sub;
		const result = await db.User.findOne({ where: { id: data.sub } });
		if(result == null) {
			await db.User.create({id: id, name: name, email: email, accessToken: accessToken})
		} else {
			console.log('to be updated');
		}
		res.status(200).send({id})
	} catch (error) {
		console.log(error);
		res.status(500).send({ error });
	}
});

app.post('/api/v1/isLogined', async(req, res)=> {
	try {
		const data = req.body.data;
		const accessToken = data.accessToken
		const id = data.id;
		const result = await db.User.findOne({ where: { id: data.sub } });
		if(result == null) {
			await db.User.create({id: id, name: name, email: email, accessToken: accessToken})
		} else {
			console.log('to be updated');
		}
		res.status(200).send({'id': id})
	} catch (error) {
		console.log(error);
		res.status(500).send({ error });
	}
});

app.post('/api/v1/storeQuestion', async(req, res)=> {
	try {
		const data = req.body.data;
		const question = data[0];
		const answer = data[1];
		const storedQuestion = await db.Question.create({id: question.uniqueId, userId: question.userId, question: question.value, isSolved: question.isSolved, isFavorite: question.isFavorite})
		const storedQuetionId = storedQuestion.dataValues.id
		await db.Answer.create({id: answer.uniqueId, answer: answer.value, questionId: storedQuetionId})

		res.status(200).send({'id': question.userId})
	} catch (error) {
		console.log(error);
		res.status(500).send({ error });
	}
});

app.post('/api/v1/storeFavoriteAnswer', async(req, res)=> {
	try {
		const data = req.body.data;
		const question = data[0];
		const answer = data[1];
		console.log(data);
		await db.Favorite.create({userId: question.userId, questionId: question.uniqueId, answerId: answer.uniqueId})

		res.status(200).send({'id': question.userId})
	} catch (error) {
		console.log(error);
		res.status(500).send({ error });
	}
});

app.post('/api/v1/storeSolvedQuestion', async(req, res)=> {
	try {
		const data = req.body.data;
		const question = await db.Question.findOne({ where: { userId: data.userId,  question: data.value} });
		question.isSolved = true;
		question.save();
		res.status(200).send({'id': question.userId})
	} catch (error) {
		console.log(error);
		res.status(500).send({ error });
	}
});

app.post('/api/v1/getQuestion', async(req, res)=> {
	try {
		const id = req.body.id;
		const question = await db.Question.findOne({ where: { id: id} });
		const answer = await db.Answer.findOne({ where: { questionId: id} });

		res.status(200).json({question, answer})
	} catch (error) {
		console.log(error);
		res.status(500).send({ error });
	}
});

app.post('/api/v1/getBookmarks', async(req, res)=> {
	try {
		const userId = req.body.userId;
		const bookmarks = await db.Favorite.findAll({where: {userId: userId} })
		const answers = [];
		for(var i = 0; i < bookmarks.length; i++) {
			bookmarks[i].answerId
			answers.push(await db.Answer.findOne({where: {id: bookmarks[i].answerId} }));
		}
		res.status(200).json({
			answers,
		  });
	} catch (error) {
		console.log(error);
		res.status(500).send({ error });
	}
});

app.post('/api/v1/getSolvedQuestions', async(req, res)=> {
	try {
		const userId = req.body.userId;
		const questions = await db.Question.findAll({where: {userId: userId, isSolved: true} })
		let data = []
		for(var i = 0; i < questions.length; i++) {
			data.push( JSON.parse(JSON.stringify(questions[i])))
		}
		res.status(200).json({questions});
	} catch (error) {
		console.log(error);
		res.status(500).send({ error });
	}
});

app.post('/api/v1/searchQuestions', async(req, res)=> {
	try {
		const keyword = req.body.keyword;
		const questions = await db.Question.findAll({where: { question : {
			[Op.like]:  keyword+'%'
		  }} ,
		   question : {
			[Op.like]:  '%'+keyword
		  } ,
		  question : {
			[Op.like]:  '%'+keyword+'%'
		  }
		})
		let data = []
		for(var i = 0; i < questions.length; i++) {
			data.push( JSON.parse(JSON.stringify(questions[i])))
		}
		res.status(200).json({questions});
	} catch (error) {
		console.log(error);
		res.status(500).send({ error });
	}
});

app.get('/api/v1/getAllQuestions', async(req, res)=> {
	try {
		const userId = req.body.userId;
		const questions = await db.Question.findAll()
		let data = []
		for(var i = 0; i < questions.length; i++) {
			data.push( JSON.parse(JSON.stringify(questions[i])))
		}
		res.status(200).json({questions});
	} catch (error) {
		console.log(error);
		res.status(500).send({ error });
	}
});



app.listen(5001, () => console.log('server is running'))

function formatDate(dt) {
	var y = dt.getFullYear();
	var m = ('00' + (dt.getMonth()+1)).slice(-2);
	var d = ('00' + dt.getDate()).slice(-2);
	return (y + '-' + m + '-' + d + ' 00:00:00');
}

// バリデーション・ルール
const registrationValidationRules = [
	check('name')
	  .not().isEmpty().withMessage('この項目は必須入力です。'),
	check('email')
	  .not().isEmpty().withMessage('この項目は必須入力です。')
	  .isEmail().withMessage('有効なメールアドレス形式で指定してください。'),
	check('password')
	  .not().isEmpty().withMessage('この項目は必須入力です。')
	  .isLength({ min:8, max:25 }).withMessage('8文字から25文字にしてください。')
	  .custom((value, { req }) => {

		if(req.body.password !== req.body.passwordConfirmation) {

		  throw new Error('パスワード（確認）と一致しません。');

		}

		return true;

	  })
  ];