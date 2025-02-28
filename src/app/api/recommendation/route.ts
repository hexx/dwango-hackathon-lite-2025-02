import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const { address, lat, lng } = await request.json();

    const prompt = `職場の住所「${address}」に通うのにおすすめのエリアを3つ教えてください。家賃の低さ・治安・利便性などを考慮してください。おすすめの理由として地域の特色のあることを書いてください。参考として緯度${lat}、経度${lng}の情報を利用してください。
返事は以下のようなフォーマットにしてください
{
  "recommendations": [
    { "name": "エリアA", "address": "東京都渋谷区〇〇", "lat": "35.658034", "lng": "139.701636", "reason": "職場に近いから" },
    { "name": "エリアB", "address": "東京都新宿区△△", "lat": "35.689487", "lng": "139.691706", "reason": "家賃が安いから" }
  ]
}`;

    const res = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [{ role: 'user', content: prompt }],
        temperature: 0.7,
        max_tokens: 500 
      })
    });
    const data = await res.json();
    const recommendation = data.choices?.[0]?.message?.content || '情報が取得できませんでした';
    return NextResponse.json({ recommendation });
  } catch (error) {
    return NextResponse.json({ error: 'ChatGPT API との通信でエラーが発生しました' }, { status: 500 });
  }
}