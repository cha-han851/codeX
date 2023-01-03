import React, { useEffect, useState } from 'react';
import type { NextPage } from 'next';
import Head from 'next/head';
import AppBar from '@mui/material/AppBar';
import Box from '@mui/material/Box';
import Toolbar from '@mui/material/Toolbar';
import { useRouter } from 'next/router'
import Avatar from '@mui/material/Avatar';
import { useSession, signIn, signOut } from "next-auth/react"
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
import Menu from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';
import Link from 'next/link'
import InputBase from '@mui/material/InputBase';
import MenuIcon from '@mui/icons-material/Menu';
import SearchIcon from '@mui/icons-material/Search';
import { styled, alpha } from '@mui/material/styles';
import Modal from '@mui/material/Modal';

const Search = styled('div')(({ theme }) => ({
	position: 'relative',
	borderRadius: theme.shape.borderRadius,
	backgroundColor: alpha(theme.palette.common.white, 0.15),
	'&:hover': {
	  backgroundColor: alpha(theme.palette.common.white, 0.25),
	},
	marginLeft: 0,
	width: '100%',
	[theme.breakpoints.up('sm')]: {
	  marginLeft: theme.spacing(1),
	  width: 'auto',
	},
  }));

  const SearchIconWrapper = styled('div')(({ theme }) => ({
	padding: theme.spacing(0, 2),
	height: '100%',
	position: 'absolute',
	pointerEvents: 'none',
	display: 'flex',
	alignItems: 'center',
	justifyContent: 'center',
  }));

  const StyledInputBase = styled(InputBase)(({ theme }) => ({
	color: 'inherit',
	'& .MuiInputBase-input': {
	  padding: theme.spacing(1, 1, 1, 0),
	  // vertical padding + font size from searchIcon
	  paddingLeft: `calc(1em + ${theme.spacing(4)})`,
	  transition: theme.transitions.create('width'),
	  width: '100%',
	  [theme.breakpoints.up('sm')]: {
		width: '20ch',
		'&:focus': {
		  width: '20ch',
		},
	  },
	},
  }));


const style = {
	position: 'absolute' as 'absolute',
	top: '30%',
	left: '50%',
	transform: 'translate(-50%, -50%)',
	width: 400,
	bgcolor: 'background.paper',
	border: '2px solid #000',
	boxShadow: 24,
	p: 4,
	zIndex: -1,
  };

  type Message = {
	id:string,
	userId?: string,
	isAi: boolean,
	question: string,
	uniqueId?: String,
	isFavorite: boolean,
	isSolved: boolean
  }

const Header: NextPage = () =>  {
	const router = useRouter();
	const { data: session } = useSession();
	const [searchResult, setSearchResult] = useState<Message[]>([])

	const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);
	const [keyword, setKeyword] = useState<string>('')
	const open = Boolean(anchorEl);
	const [isOpenModel, setIsOpenModal] = useState<boolean>(false)
	const handleClick = (event: React.MouseEvent<HTMLElement>) => {
		setAnchorEl(event.currentTarget);
	};
	const handleClose = () => {
		setAnchorEl(null);
	};
	const logOut = () => {
		signOut();
	}

	const handleModalOpen = () => setIsOpenModal(true);
  	const handleModalClose = () => setIsOpenModal(false);
	useEffect(()=>{
		if(!session) {
			router.push('/auth/sign_up')
		}
	})

	const openSearchResult = () => {

	}

	const handleSearch = (e:any) => {
		setKeyword(e.target.value)
		if(e.target.value.length > 0) {
			setIsOpenModal(true)
			search(e.target.value)
		} else {
			setIsOpenModal(false)
		}
	}

	const search = async(keyword: string) => {
		const response = await fetch(process.env.PROD_APP_URL+'/api/v1/searchQuestions', {
			method: 'POST',
			headers: {
			  'Content-Type': 'application/json'
			},
			body: JSON.stringify({
			  keyword: keyword
			})
		  })
		  const data = await response.json()
		  setSearchResult(data.questions)
	}


	return (
		<>
			<Head>
				<meta name='robots' content='noindex' />
				<meta charSet='utf-8' />
				<link rel="icon" type="image/svg+xml" href="/favicon.ico" />
				<meta name="viewport" content="width=device-width, initial-scale=1.0" />
				<title>SmartBot AI</title>
			</Head>
			<header>
				<AppBar
					position='static'
					sx={{ backgroundColor: '#707070', padding: 0 }}
				>
					<Toolbar>

					<Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
					SmartBot AI
					</Typography>
					<Search>
						<SearchIconWrapper>
						<SearchIcon />
						</SearchIconWrapper>
						<StyledInputBase
						placeholder="Search…"
						inputProps={{ 'aria-label': 'search' }}
						onChange={handleSearch}
						/>

					</Search>
						{
							session ?<Avatar onClick={handleClick} sx={{ marginLeft:10}}alt="user_image" src={session!.user!.image ?? ''}/> :''
						}
						<Button onClick={logOut} sx={{color:'white'}}>Sign out</Button>

						<Menu
							id="demo-positioned-menu"
							aria-labelledby="demo-positioned-button"
							anchorEl={anchorEl}
							open={open}
							onClose={handleClose}
							anchorOrigin={{
							vertical: 'top',
							horizontal: 'left',
							}}
							transformOrigin={{
							vertical: 'top',
							horizontal: 'left',
							}}
						>

						<MenuItem onClick={handleClose}><Link href="/questions">みんなの質問</Link></MenuItem>
						<MenuItem onClick={handleClose}><Link href="/solved/questions">解決済み</Link></MenuItem>
						<MenuItem onClick={handleClose}><Link href="/bookmarks">ブックマーク</Link></MenuItem>
						</Menu>
					</Toolbar>
				</AppBar>

				{
					keyword.length > 0 && searchResult.length > 0 ?
					<ul>{searchResult.map((question)=>{return(<li key={question.id}><Link href="/question/[id]"  as={"/question/"+question.id}>{question.question}</Link></li>)})}</ul> :
					''
				}
				{
					keyword.length > 0 && searchResult.length == 0 ?
					<div>検索結果なし</div> :
					''
				}

			</header>
		</>
	);
	}

export default Header;
