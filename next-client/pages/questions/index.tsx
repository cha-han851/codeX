import type { NextPage } from 'next';
import Header from '@/layouts/user/header';
import Styles from '../../styles/style.module.css';
import { useEffect, useState } from 'react';
import IconButton from '@mui/material/IconButton';
import LinearProgress from '@mui/material/LinearProgress';
import { useSession, getSession } from "next-auth/react"
import { useRouter } from 'next/router'
import DoneIcon from '@mui/icons-material/Done';
import Link from 'next/link'

export async function getServerSideProps(context:any) {
	const session = await getSession(context);
	const userId = session?.user.id

	const response = await fetch(process.env.NEXT_PUBLIC_APP_URL+'/api/v1/getAllQuestions', {
		method: 'GET',
		headers: {
		  'Content-Type': 'application/json'
		},

	  })
	  const data = await response.json()

	return {
	  props: {
		data: data
	  }, // will be passed to the page component as props
	}
  }

type Message = {
  id:string,
  userId?: string,
  isAi: boolean,
  value: any,
  uniqueId?: String,
  isFavorite: boolean,
  isSolved: boolean
}

const Home: NextPage = ({data}: any) => {
  const [inputData, setInputData] = useState<String>('');
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputFlag, setInputFlag] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(false);
  const bot = '/assets/bot.svg';
  const user = "/assets/user.svg";
  let loadInterval: any;
  const router = useRouter();
  const { data: session } = useSession();
  const [solveFlag, setSolveFlag] = useState<boolean>(false)
const questions = data.questions;
useEffect(()=>{
	let messageArray: Message[] = [];
	console.log(data)
	questions.map((question: any)=> {
		messageArray.push({
			id: question.id,
			isAi: false,
			value: question.question,
			uniqueId: question.id,
			isFavorite: true,
			isSolved: false,
		})
	})
	setMessages(messageArray)
}, [questions])
  function loader(element: any) {
    element.textContent = '';

    loadInterval = setInterval(() => {
      element.textContent += '.';

      if (element.textContent === '....') {
        element.textContent = '';
      }
      }, 300)
  }

  const addFavorite = (index: number) => {
    messages[index].isFavorite = true;
    setSolveFlag(!solveFlag);
    setMessages(messages);
    storeFavoriteAnswer([messages[index - 1], messages[index]])
    return;
  }

  const storeSolvedQuestion = async(data: Message) => {
    const response = await fetch(process.env.NEXT_PUBLIC_APP_URL+'/api/v1/storeSolvedQuestion', {
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
    const response = await fetch(process.env.NEXT_PUBLIC_APP_URL+'/api/v1/storeFavoriteAnswer', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        data: data
      })
    })
  }

  return (
    <>
    <Header></Header>
    <div id={Styles.app}>
      <div id={Styles.chat_container}>
        {
          messages.map((message, index)=>{
            return (
              <div className={`${Styles.wrapper} ${message.isAi ? Styles.ai : Styles.user}` } key={message.value + '1'}>
              <div className={Styles.chat}>
                <div className={Styles.profile}>
                    <img
                      src={message.isAi? bot : user}
                    />
                </div>
                {
                  !message.isAi && message.isSolved == true ?<IconButton color="primary" aria-label="upload picture" component="label">
                  <DoneIcon  color="action" sx={{color: 'lime'}}/>
                </IconButton>: ''
                }



              </div>

              <div className={Styles.message}>
			  <Link href="/question/[id]"  as={"/question/"+message.id}> { message.value}</Link>
              </div>

            </div>
            );
          })
        }
        {loading ? <LinearProgress color="inherit" /> : ''}
      </div>
    </div>
    </>
  )
}

export default Home
