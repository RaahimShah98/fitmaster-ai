const fetchPredictions = async (base64Image: string) => {
  console.log("Sending base64 image for prediction");
  console.log(base64Image);
  try {
    const response = await fetch("https://f366-202-165-230-70.ngrok-free.app/detect/base64/", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        image: base64Image,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(
        `Failed to fetch predictions: ${response.status} ${errorText}`
      );
    }

    return response.json();
  } catch (error) {
    console.error("Error fetching predictions:", error);
    return null;
  }
};

export default fetchPredictions;
