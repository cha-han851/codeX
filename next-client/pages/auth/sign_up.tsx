import type { NextPage } from 'next';
import Head from 'next/head';
import Image from 'next/image';
import Header from '@/layouts/user/header';
import Styles from '../../styles/auth.module.css';
import { useState, useEffect } from 'react';
import TextField from '@mui/material/TextField';
import Button from '@mui/material/Button';
import * as THREE from 'three'
import Spline from '@splinetool/react-spline';
import { parseCookies, setCookie, destroyCookie } from 'nookies'
import { useSession, signIn, signOut } from "next-auth/react"
import { useRouter } from 'next/router'
import { useRive } from '@rive-app/react-canvas';

type userSignUpData = {
	name: string,
	email: string,
	password: string
}
const SignUp: NextPage = () => {
	const [name, setName] = useState<String>('');
	const [email, setEmail] = useState<String>('');
	const [password, setPassword] = useState<String>('');
	const router = useRouter()
	const { data: session } = useSession();

	if (session) {
		router.push('/')
	}

	let canvas: HTMLElement
	useEffect(() => {
		if (canvas) return
	  	// canvasを取得
		canvas = document.getElementById('canvas')!

	  // シーン
	const scene = new THREE.Scene()

	  // サイズ
	const sizes = {
		width: innerWidth,
		height: innerHeight
	}

	  // カメラ
	const camera = new THREE.PerspectiveCamera(
		75,
		sizes.width / sizes.height,
		0.1,
		1000
	)

	  // レンダラー
	const renderer = new THREE.WebGLRenderer({
		canvas: canvas || undefined,
		antialias: true,
		alpha: true
	})
	renderer.setSize(sizes.width, sizes.height)
	renderer.setPixelRatio(window.devicePixelRatio)

	// ボックスジオメトリー
	const boxGeometry = new THREE.BoxGeometry(1, 1, 1)
	const boxMaterial = new THREE.MeshLambertMaterial({
	color: '#2497f0'
	})
	const box = new THREE.Mesh(boxGeometry, boxMaterial)
	box.position.z = -5
	box.rotation.set(10, 10, 10)
	scene.add(box)

	// ライト
	const ambientLight = new THREE.AmbientLight(0xffffff, 0.7)
	scene.add(ambientLight)
	const pointLight = new THREE.PointLight(0xffffff, 0.2)
	pointLight.position.set(1, 2, 3)
	scene.add(pointLight)

	  // アニメーション
	const clock = new THREE.Clock()
	const tick = () => {
		const elapsedTime = clock.getElapsedTime()
		box.rotation.x = elapsedTime
		box.rotation.y = elapsedTime
		window.requestAnimationFrame(tick)
		renderer.render(scene, camera)
	}
	tick()

	  // ブラウザのリサイズ処理
	window.addEventListener('resize', () => {
		sizes.width = window.innerWidth
		sizes.height = window.innerHeight
		camera.aspect = sizes.width / sizes.height
		camera.updateProjectionMatrix()
		renderer.setSize(sizes.width, sizes.height)
		renderer.setPixelRatio(window.devicePixelRatio)
	})
	}, [])


	const handleChange = (e:any) => {
		const name = e.target.name;
		switch(name) {
			case 'name':
				setName(e.target.value);
				break;
			case 'email':
				setEmail(e.target.value);
				break;
			case 'password':
				setPassword(e.target.value);
				break;
			default:
				break;
		}
	}

	const handleSubmit = async () => {
		const data = {
			name: name,
			email: email,
			password: password
		}
		// const response = await fetch('https://codex-chatgpt-0u3q.onrender.com', {
			const response = await fetch(process.env.NEXT_PUBLIC_APP_URL+'/api/v1/sign_up', {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json'
			},
			body: JSON.stringify({
				data: data
			})
		})
	}
	const googlLogin = async () => {

		// const response = await fetch('https://codex-chatgpt-0u3q.onrender.com', {
		const response = await fetch(process.env.NEXT_PUBLIC_APP_URL+'/auth/google', {
			method: 'GET',
			headers: {
				'Content-Type': 'application/json'
			},
		})

	}

	const isRegisterdUser = async () => {

		// const response = await fetch('https://codex-chatgpt-0u3q.onrender.com', {
		const response = await fetch(process.env.NEXT_PUBLIC_APP_URL+'/auth/google', {
			method: 'GET',
			headers: {
				'Content-Type': 'application/json'
			},
		})

	}

	const { rive, RiveComponent } = useRive({
		src:"/hogeta.riv",
		animations: 'Idle',
		autoplay: true,
		onLoop: () => {rive?.play('Idle')}
	  });
  return (
    <>
	<div className={Styles.container}>
		<div className={Styles.model_container}>
			<div className={Styles.model_section}>
			<Spline scene="https://prod.spline.design/a0p0-ym7FIGGY3Rh/scene.splinecode" />			</div>
		</div>
		<div className={Styles.sign_up_container}>
			<div className={Styles.sign_up_form}>
			<RiveComponent
			onMouseEnter={() => rive && rive.play('Jump')}
			onMouseLeave={() => rive}
			className={Styles.rive}
			/>
				{/* <TextField className={Styles.input_form} placeholder="氏名" name="name" onChange={handleChange} /> <br/>
				<TextField className={Styles.input_form} placeholder="メールアドレス" name="email" onChange={handleChange} /><br/>
				<TextField className={Styles.input_form} placeholder="パスワード" name="password" onChange={handleChange} /><br/>
				<Button className={Styles.submit_button}variant="outlined" onClick={handleSubmit}>登録する</Button> */}
				<Button variant='outlined' onClick={() => signIn()}>Google ログイン</Button>
			</div>
		</div>
	</div>

    </>
  )
}

export default SignUp
