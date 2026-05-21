export async function analyzeUserBehaviour(data) {
  try {
    const response = await fetch(
      'http://192.168.18.29:5000/analyze', //must be local ip
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