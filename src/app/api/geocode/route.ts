import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const address = searchParams.get('address');
  if (!address) {
    return NextResponse.json({ error: '住所が必要です' }, { status: 400 });
  }
  try {
    const url = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(address)}`;
    const res = await fetch(url);
    const data = await res.json();
    if (data && data.length > 0) {
      return NextResponse.json({ lat: data[0].lat, lng: data[0].lon });
    } else {
      return NextResponse.json({ error: '該当する住所が見つかりませんでした' }, { status: 404 });
    }
  } catch (error) {
    return NextResponse.json({ error: 'エラーが発生しました' }, { status: 500 });
  }
}
