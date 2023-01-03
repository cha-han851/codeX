import type { NextPage } from 'next';
import Header from '@/layouts/user/header';
import Styles from '../styles/style.module.css';
import { useEffect, useState } from 'react';
import TextField from '@mui/material/TextField';
import Button from '@mui/material/Button';
import SendIcon from '@mui/icons-material/Send';
import DeleteIcon from '@mui/icons-material/Delete';
import IconButton from '@mui/material/IconButton';
import LinearProgress from '@mui/material/LinearProgress';
import { useSession } from "next-auth/react"
import { useRouter } from 'next/router'
import BookmarkIcon from '@mui/icons-material/Bookmark';
import BookmarkAddOutlinedIcon from '@mui/icons-material/BookmarkAddOutlined';
import DoneIcon from '@mui/icons-material/Done';



type Message = {
  userId?: string,
  isAi: boolean,
  value: any,
  uniqueId?: String,
  isFavorite: boolean,
  isSolved: boolean
}

const Home: NextPage = () => {
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


  function loader(element: any) {
    element.textContent = '';

    loadInterval = setInterval(() => {
      element.textContent += '.';

      if (element.textContent === '....') {
        element.textContent = '';
      }
      }, 300)
  }

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
    const response = await fetch('http://localhost:5001', {
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
    const response = await fetch('http://localhost:5001/api/v1/storeSolvedQuestion', {
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
    const response = await fetch('http://localhost:5001/api/v1/storeFavoriteAnswer', {
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
    const response = await fetch('http://localhost:5001/api/v1/storeQuestion', {
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
                {
                  !message.isAi && !message.isSolved ? <Button variant="outlined" sx={{color: 'lime'}} onClick={()=>solve(index)}>解決済みにする</Button>: ''
                }
                {
                  message.isAi && message.isFavorite == false ? <IconButton color="primary" aria-label="upload picture" component="label" onClick={()=> addFavorite(index)}>
                    <BookmarkAddOutlinedIcon  color="action" sx={{color: 'white'}}/>
                  </IconButton>: ''
                }
                {
                  message.isAi && message.isFavorite == true ? <IconButton color="primary" aria-label="upload picture" component="label">
                    <BookmarkIcon  color="action" sx={{color: 'yellow'}}/>
                  </IconButton>: ''
                }


              </div>

              <div className={Styles.message}>
                { message.value}
              </div>

            </div>
            );
          })
        }
        {loading ? <LinearProgress color="inherit" /> : ''}
      </div>

      <form className={Styles.form}>
      <TextField className={Styles.textarea} multiline maxRows={4}  color='info' value={inputData} onChange={(e) => handleChange(e)} label="Ask any questions" variant="standard"           InputProps={{
            className: Styles.textarea
          }} />
      <IconButton className={Styles.button}  aria-label="delete" onClick={(e)=>handleSubmit(e)}>
        <SendIcon sx={{color:'white'}} />
      </IconButton>
      </form>
    </div>
    </>
  )
}

export default Home
