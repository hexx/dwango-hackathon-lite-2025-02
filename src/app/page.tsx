"use client";

import { useState } from 'react';
import { GoogleMap, LoadScript, Marker } from '@react-google-maps/api';

const containerStyle = {
  width: '100%',
  height: '400px'
};

const defaultCenter = { lat: 35.6895, lng: 139.6917 };

type Recommendation = {
  name: string;
  address: string;
  lat: string;
  lng: string;
  reason: string;
  rating?: number;
  price_level?: number;
};

export default function HomePage() {
  const [address, setAddress] = useState('');
  const [workplace, setWorkplace] = useState(defaultCenter);
  const [center, setCenter] = useState(defaultCenter);
  const [recommendations, setRecommendations] = useState<Recommendation[]>([]);
  const [loading, setLoading] = useState(false);
  const [mapInstance, setMapInstance] = useState<google.maps.Map | null>(null);
  const [selectedName, setSelectedName] = useState('');
  const [selectedRating, setSelectedRating] = useState('');
  const [selectedPriceLevel, setSelectedPriceLevel] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const geoRes = await fetch(`/api/geocode?address=${encodeURIComponent(address)}`);
      const geoData = await geoRes.json();

      if (geoData?.lat && geoData?.lng) {
        const workplaceCoords = { lat: parseFloat(geoData.lat), lng: parseFloat(geoData.lng) };
        setWorkplace(workplaceCoords);
        setCenter(workplaceCoords);

        const recRes = await fetch('/api/recommendation', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ address, lat: geoData.lat, lng: geoData.lng })
        });
        const recData = await recRes.json();
        // setRecommendations(recData.recommendations);
        setRecommendations(JSON.parse(recData.recommendation).recommendations);
      } else {
        alert('職場の位置情報が取得できませんでした。');
      }
    } catch (error) {
      console.error(error);
      alert('エラーが発生しました。');
    }
    setLoading(false);
  };

  const onMapLoad = (map: google.maps.Map) => {
    setMapInstance(map);
  };

  // おすすめの場所がクリックされたときに地図を移動し、Nearby Search API を呼び出して評価と物価情報を取得する
  const handleRecommendationClick = async (rec: Recommendation) => {
    const newCenter = { lat: parseFloat(rec.lat), lng: parseFloat(rec.lng) };
    setCenter(newCenter);
    if (mapInstance) {
    setSelectedName(rec.name);
    setSelectedRating(rec.rating ? rec.rating.toString() : '情報なし');
    setSelectedPriceLevel(rec.price_level ? rec.price_level.toString() : '情報なし');
    // Nearby Search API を呼び出して rating と price_level を取得
      mapInstance.setZoom(14);
    }
    // Nearby Search API を呼び出して rating と price_level を取得
    try {
      const res = await fetch(
        `/api/nearbysearch?lat=${rec.lat}&lng=${rec.lng}&name=${encodeURIComponent(rec.name)}`
      );
      const data = await res.json();
      // 取得した情報を該当項目に追加
      setRecommendations(prev =>
        prev.map(item =>
          item.name === rec.name
            ? { ...item, rating: data.rating, price_level: data.price_level }
            : item
        )
      );
      setSelectedRating(data.rating ? data.rating.toString() : '情報なし');
      setSelectedPriceLevel(data.price_level ? data.price_level.toString() : '情報なし');
    } catch (error) {
      console.error("Error fetching nearby data:", error);
    }
  };

  return (
    <div style={{ padding: '1rem' }}>
      <h1>住む場所おすすめサービス</h1>
      <form onSubmit={handleSubmit}>
        <input
          type="text"
          value={address}
          placeholder="職場の住所を入力"
          onChange={(e) => setAddress(e.target.value)}
          style={{ width: '300px', marginRight: '1rem' }}
        />
        <button type="submit" disabled={loading}>
          {loading ? '処理中...' : '送信'}
        </button>
      </form>
      {recommendations.length > 0 && (
        <div style={{ marginTop: '1rem' }}>
          <h2>おすすめの住む場所</h2>
          <ul>
            {recommendations.map((rec, index) => (
              <li
                key={index}
                onClick={() => handleRecommendationClick(rec)}
                className="recommendation-item"
              >
                {rec.name} - {rec.address}{" "} - {rec.reason}
                {(rec.rating || rec.price_level) && (
                  <span>
                    (周辺の評価: {rec.rating || "情報なし"}, 周辺の物価: {rec.price_level || "情報なし"})
                  </span>
                )}
              </li>
            ))}
          </ul>
        </div>
      )}

      <p>
        場所: {selectedName}, 周辺の評価: {selectedRating}, 周辺の物価: {selectedPriceLevel}
      </p>

      <div style={{ marginTop: '1rem' }}>
        <LoadScript googleMapsApiKey={process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || ''}>
          <GoogleMap
            mapContainerStyle={containerStyle}
            center={center}
            zoom={14}
            onLoad={onMapLoad}
          >
            {/* 職場の位置は固定 */}
            <Marker position={workplace} label="職場" />
            {/* おすすめエリアのマーカー */}
            {recommendations.map((rec, index) => (
              <Marker
                key={index}
                position={{ lat: parseFloat(rec.lat), lng: parseFloat(rec.lng) }}
                label={rec.name}
                icon="http://maps.google.com/mapfiles/ms/icons/blue-dot.png"
              />
            ))}
          </GoogleMap>
        </LoadScript>
      </div>
   </div>
  );
}
