import React, { useEffect, useState } from "react";

function Home() {
  const [outfits, setOutfits] = useState([]);
  const [height, setHeight] = useState("");
  const [weight, setWeight] = useState("");
  const [occasion, setOccasion] = useState("Casual");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Fetch all outfits initially
useEffect(() => {
  fetch("https://outfit-planner-1.onrender.com/api/outfits")
    .then((res) => res.json())
    .then((data) => setOutfits(data))
    .catch(() => setError("Failed to load outfits"));
}, []);

  // Calculate Body Type
  function getBodyType(height, weight) {
    const bmi = weight / ((height / 100) * (height / 100));

    if (bmi < 18.5) return "Slim";
    if (bmi < 25) return "Average";
    if (bmi < 30) return "Athletic";
    return "Plus";
  }

  // Get Recommendations
  async function getRecommendation() {
    try {
      setLoading(true);
      setError("");

      const bodyType = getBodyType(height, weight);

      const res = await fetch(
        `http://localhost:5000/api/outfits/recommend?bodyType=${bodyType}&occasion=${occasion}`
      );

      const data = await res.json();
      setOutfits(data);
    } catch (err) {
      setError("Something went wrong!");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="bg-yellow-100 min-h-screen p-6 flex flex-col items-center">
      
      {/* Title */}
      <h1 className="text-3xl font-bold mb-2 text-gray-800">
        Smart Outfit Planner
      </h1>
      <p className="text-lg mb-6 text-center">
        Personalized outfit recommendations based on body type and occasion
      </p>

      {/* Form */}
      <div className="bg-white p-6 rounded shadow mb-6 w-full max-w-md">
        <div className="mb-4">
          <label className="block text-gray-700 mb-2">Height (cm)</label>
          <input
            type="number"
            value={height}
            onChange={(e) => setHeight(e.target.value)}
            className="w-full p-2 border rounded"
          />
        </div>

        <div className="mb-4">
          <label className="block text-gray-700 mb-2">Weight (kg)</label>
          <input
            type="number"
            value={weight}
            onChange={(e) => setWeight(e.target.value)}
            className="w-full p-2 border rounded"
          />
        </div>

        <div className="mb-4">
          <label className="block text-gray-700 mb-2">Occasion</label>
          <select
            value={occasion}
            onChange={(e) => setOccasion(e.target.value)}
            className="w-full p-2 border rounded"
          >
            <option value="Casual">Casual</option>
            <option value="Formal">Formal</option>
            <option value="Party">Party</option>
          </select>
        </div>

        <button
          onClick={getRecommendation}
          className="bg-blue-500 text-white px-4 py-2 rounded w-full hover:bg-blue-600"
        >
          Get Outfit
        </button>
      </div>

      {/* Section Title */}
      <h2 className="text-2xl font-bold mb-4">Recommended Outfits</h2>

      {/* Loading */}
      {loading && (
        <p className="text-blue-500 mb-4 text-center">Loading...</p>
      )}

      {/* Error */}
      {error && (
        <p className="text-red-500 mb-4 text-center">{error}</p>
      )}

      {/* Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 justify-items-center w-full max-w-6xl">
        
        {outfits.length === 0 && !loading ? (
          <div className="col-span-full flex justify-center items-center h-40">
            <p className="text-gray-600 text-lg">
              No outfits found
            </p>
          </div>
        ) : (
          outfits.map((outfit) => (
            <div
              className="bg-white p-4 rounded shadow w-full max-w-sm"
              key={outfit._id}
            >
              <img
                src={`http://localhost:5000/uploads/${outfit.image}`}
                alt="outfit"
                className="w-full h-48 object-cover mb-4 rounded"
              />

              <h3 className="text-xl font-bold mb-2">
                {outfit.name}
              </h3>

              <p className="text-gray-600 mb-1">
                Top: {outfit.top}
              </p>
              <p className="text-gray-600 mb-1">
                Bottom: {outfit.bottom}
              </p>
              <p className="text-gray-600">
                Footwear: {outfit.footwear}
              </p>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

export default Home;