const API_URL = 'http://127.0.0.1:5000'; // Your Flask backend URL

export async function predictImage(base64Image, token) {
  const response = await fetch(`${API_URL}/predict`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      // Include the Firebase auth token in the request
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify({
      image_base64: base64Image
    })
  });

  if (!response.ok) {
    throw new Error('Network response was not ok');
  }

  return response.json();
}
export async function getHistory(token) {
  const response = await fetch(`${API_URL}/history`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      // We still need to prove who we are to get our own history
      'Authorization': `Bearer ${token}`
    }
  });

  if (!response.ok) {
    throw new Error('Failed to fetch history');
  }

  return response.json();
}