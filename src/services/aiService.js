export async function analyzeUserBehaviour(data) {
  try {
    const response = await fetch(
      'https://ai-engine-cogniwell-1.onrender.com/analyze', //must be local ip
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      }
    );

    return await response.json();
  } catch (error) {
    console.log(error);

    return null;
  }
}