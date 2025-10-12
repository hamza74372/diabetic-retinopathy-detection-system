const API_URL = 'http://127.0.0.1:5000';

export async function predictImage(base64Image, token) {
  console.log('[API] Sending prediction request');
  console.log('[API] Token present:', !!token);
  console.log('[API] Token length:', token?.length);
  
  try {
    const response = await fetch(`${API_URL}/predict`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({
        image_base64: base64Image
      })
    });

    console.log('[API] Response status:', response.status);
    console.log('[API] Response ok:', response.ok);

    if (!response.ok) {
      const errorData = await response.json();
      console.error('[API] Error response:', errorData);
      throw new Error(`Prediction failed: ${response.status} - ${errorData.error}`);
    }

    const data = await response.json();
    console.log('[API] Prediction successful:', data);
    return data;
  } catch (error) {
    console.error('[API] Prediction error:', error);
    throw error;
  }
}

export async function getHistory(token) {
  console.log('[API] Fetching history');
  console.log('[API] Token present:', !!token);

  try {
    const response = await fetch(`${API_URL}/history`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      }
    });

    console.log('[API] History response status:', response.status);

    if (!response.ok) {
      const errorData = await response.json();
      console.error('[API] History error:', errorData);
      throw new Error(`Failed to fetch history: ${response.status}`);
    }

    const data = await response.json();
    console.log('[API] History fetched:', data);
    return data;
  } catch (error) {
    console.error('[API] History error:', error);
    throw error;
  }
}