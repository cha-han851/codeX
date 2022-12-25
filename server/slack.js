
import { WebClient } from '@slack/web-api'

export const postToSlack = async (text) => {
	// OAuth トークン

	const token  = process.env.SLACK_API_KEY;
	// #チャンネル名 of @ユーザー名
	const channel = '#知恵袋';
	// メッセージ
	// const text = '*Hello World*';

	const client = new WebClient(token);
	const response = await client.chat.postMessage({ channel, text });

	// 投稿に成功すると `ok` フィールドに `true` が入る。
	console.log(response.ok);
  // => true
}