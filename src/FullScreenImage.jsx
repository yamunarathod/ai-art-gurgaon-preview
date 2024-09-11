import  { useState, useEffect } from 'react';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://mxyippuwkpysdexmxrbm.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im14eWlwcHV3a3B5c2RleG14cmJtIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MDk5NzI1ODcsImV4cCI6MjAyNTU0ODU4N30.ed2YgcvYOoajEOc-NkcTpwW1Bhb79sWoRWKGHZDdxHM';
const supabase = createClient(supabaseUrl, supabaseKey);

const FullScreenImage = () => {
  const [imageUrl, setImageUrl] = useState(null);

  useEffect(() => {
    fetchLatestImage();

    const channel = supabase
      .channel('gurgaon:images')
      .on('postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'images' },
        payload => {
          setImageUrl(payload.new.url);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const fetchLatestImage = async () => {
    try {
      const { data, error } = await supabase
        .from('images')
        .select('url')
        .order('created_at', { ascending: false })
        .limit(1)
        .single();

      if (error) throw error;
      if (data) setImageUrl(data.url);
    } catch (error) {
      console.error('Error fetching image:', error);
    }
  };

  const containerStyle = {
    position: 'fixed',
    top: 0,
    left: 0,
    width: '100vw',
    height: '100vh',
    backgroundColor: 'black',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
    zIndex: 9999,
  };

  const imageStyle = {
    width: '100%',
    height: '100%',
    objectFit: 'fill',
    objectPosition: 'center',
  };

  return (
    <div style={containerStyle}>
      {imageUrl ? (
        <img
          src={imageUrl}
          alt="Latest uploaded image"
          style={imageStyle}
        />
      ) : (
        <p style={{ color: 'white', fontSize: '2rem' }}>Loading image...</p>
      )}
    </div>
  );
};

export default FullScreenImage;