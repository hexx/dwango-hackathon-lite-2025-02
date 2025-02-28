// app/api/nearbysearch/route.ts
import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const lat = searchParams.get('lat');
  const lng = searchParams.get('lng');
  const name = searchParams.get('name'); // キーワードとしておすすめ場所の名称を利用する場合
  if (!lat || !lng) {
    return NextResponse.json({ error: 'lat と lng は必須です' }, { status: 400 });
  }
  const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;
  // 500メートル以内で検索。keyword を追加して、名称に近い候補を絞り込みます
  let url = `https://maps.googleapis.com/maps/api/place/nearbysearch/json?location=${lat},${lng}&radius=1000&key=${apiKey}`;
  // if (name) {
  //   url += `&keyword=${encodeURIComponent(name)}`;
  // }
  console.log('url:', url);

  try {
    const res = await fetch(url);
    const data = await res.json();
    console.log(res);
    console.log(data);
    if (data.results && data.results.length > 0) {
      let ratingSum = 0;
      let ratingCount = 0;
      let priceSum = 0;
      let priceCount = 0;

      data.results.forEach((result: any) => {
        if (result.rating !== undefined) {
          ratingSum += result.rating;
          ratingCount++;
        }
        if (result.price_level !== undefined) {
          priceSum += result.price_level;
          priceCount++;
        }
      });

      const averageRating = ratingCount > 0 ? (ratingSum / ratingCount).toFixed(1) : '情報なし';
      const averagePrice = priceCount > 0 ? (priceSum / priceCount).toFixed(1) : '情報なし';

      console.log('averageRating:', averageRating);
      console.log('averagePrice:', averagePrice);

      return NextResponse.json({ rating: averageRating, price_level: averagePrice });
    } else {
      return NextResponse.json({ error: '近傍の場所が見つかりませんでした' }, { status: 404 });
    }
  } catch (error) {
    return NextResponse.json({ error: 'Nearby Search API でエラーが発生しました' }, { status: 500 });
  }
}
