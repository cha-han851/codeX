import type { NextPage } from 'next';
import Header from '@/layouts/user/header';
import Styles from '../../styles/style.module.css';
import { useEffect, useState } from 'react';
import TextField from '@mui/material/TextField';
import Button from '@mui/material/Button';
import SendIcon from '@mui/icons-material/Send';
import DeleteIcon from '@mui/icons-material/Delete';
import IconButton from '@mui/material/IconButton';
import LinearProgress from '@mui/material/LinearProgress';
import { useSession, getSession } from "next-auth/react"
import { useRouter } from 'next/router'
import BookmarkIcon from '@mui/icons-material/Bookmark';
import BookmarkAddOutlinedIcon from '@mui/icons-material/BookmarkAddOutlined';
import DoneIcon from '@mui/icons-material/Done';
import { authOptions } from '../../api/auth/[...nextauth]'
import { unstable_getServerSession } from "next-auth/next"

export async function getServerSideProps(context) {
	const session = await getSession(context);
	const userId = session?.user.id
	const id = context.query.id;

	const response = await fetch(process.env.APP_URL+'/api/v1/getQuestion', {
		method: 'POST',
		headers: {
		  'Content-Type': 'application/json'
		},
		body: JSON.stringify({
		  id: id
		})
	  })
	  const data =  await response.json()

	  console.log(data);
	return {
	  props: {
		question: data.question,
		answer: data.answer
	  }, // will be passed to the page component as props
	}
  }

type Message = {
  userId?: string,
  isAi: boolean,
  value: any,
  uniqueId?: String,
  isFavorite: boolean,
  isSolved: boolean
}

const Home: NextPage = ({question, answer}:any) => {
  const [inputData, setInputData] = useState<String>('');
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputFlag, setInputFlag] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(false);
  const bot = '/assets/bot.svg';
  const user = "/assets/user.svg";
  const router = useRouter();
  const { data: session } = useSession();
  const [solveFlag, setSolveFlag] = useState<boolean>(false)
//   const question = data.question;
//   const answer = data.answer;




  function typeText(text: Message) {
    // postToSlack(text);
    let message = '';
    let index = 0;

    const output = () => setMessages([...messages, text])
    setTimeout(output, 1000)
    setInputFlag(false);
    setLoading(false)

    let interval = setInterval(() => {
      if (index < text.value.length) {
        message += text.value.charAt(index);
        console.log(text)
        setMessages([...messages, {userId: session!.user!.id!, isAi:true, value: message, uniqueId: text.uniqueId, isFavorite: false, isSolved: false}])
        index++
      } else {
        clearInterval(interval);
      }
    }, 20)
  }


  function generateUniqueId(): String {
    const timestamp = Date.now();
    const randomNumber = Math.random();
    const hexadecimalString = randomNumber.toString(16);
    return `id-${timestamp}-${hexadecimalString}`
  }

  const handleSubmit = async( e:any ) => {
    e.preventDefault();
    setLoading(true);
    const userId = session!.user!.id!;
    let message: Message = {
      userId: userId,
      isAi: false,
      value: inputData,
      isFavorite: false,
      isSolved: false,
      uniqueId: generateUniqueId()
    }
    messages.push(message)
    // setMessages([...messages, message])
    setInputData('');

    // const response = await fetch('https://codex-chatgpt-0u3q.onrender.com', {
    const response = await fetch(process.env.APP_URL+'', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        prompt: inputData
      })
    })

    if(response.ok) {
      setInputFlag(true);
      const data = await response.json();
      const parsedData = data.bot.trim();
      const reply: Message = {isAi: true, value: parsedData, uniqueId: generateUniqueId(), isFavorite: false, isSolved:false};
      typeText(reply);
      storeQuestion([message, reply])
    }

  }

  const handleChange = (e:any) => {
    setInputData(e.target.value)
  }

  const solve = (index: number) => {
    messages[index].isSolved = true;
    setSolveFlag(!solveFlag);
    setMessages(messages);
    storeSolvedQuestion(messages[index])
    return;
  }

  const addFavorite = (index: number) => {
    messages[index].isFavorite = true;
    setSolveFlag(!solveFlag);
    setMessages(messages);
    storeFavoriteAnswer([messages[index - 1], messages[index]])
    return;
  }

  const storeSolvedQuestion = async(data: Message) => {
    const response = await fetch(process.env.APP_URL+'/api/v1/storeSolvedQuestion', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        data: data
      })
    })
  }

  const storeFavoriteAnswer = async(data: Message[]) => {
    const response = await fetch(process.env.APP_URL+'/api/v1/storeFavoriteAnswer', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        data: data
      })
    })
  }

  const storeQuestion = async(data: Message[]) => {
    const response = await fetch(process.env.APP_URL+'/api/v1/storeQuestion', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        data: data
      })
    })
  }

  const getSolvedQuestions = async() => {

	const response = await fetch(process.env.APP_URL+'/api/v1/getBookmarks', {
		method: 'POST',
		headers: {
		  'Content-Type': 'application/json'
		},
		body: JSON.stringify({
		  userId: session!.user.id
		})
	  })
	  const data = await response.json()
	  console.log(data.bookmarks)
  }
  return (
    <>
    <Header></Header>
    <div id={Styles.app}>
      <div id={Styles.chat_container}>
		{
			question != null ?
			<div className={`${Styles.wrapper} ${ user }` } >
              <div className={Styles.chat}>
                <div className={Styles.profile}>
                    <img
                      src={user}
                    />
                </div>
              </div>

              <div className={Styles.message}>
                { question.question}
              </div>

            </div> : ''
		}
		{
			answer != null ?
			<div className={`${Styles.wrapper} ${ Styles.ai }` } >
              <div className={Styles.chat}>
                <div className={Styles.profile}>
                    <img
                      src={bot}
                    />
                </div>
              </div>

              <div className={Styles.message}>
                { answer.answer}
              </div>

            </div> : ''
		}
      </div>
    </div>
    </>
  )
}

export default Home
