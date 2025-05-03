import React, { useEffect, useState } from "react";
import { io } from "socket.io-client";

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL || "http://localhost:5000";

const socket = io(BACKEND_URL, {
  transports: ["websocket"],
  upgrade: false,
});

const categories = ["general", "technology", "business", "sports", "entertainment"];

function App() {
  const [category, setCategory] = useState("general");
  const [articles, setArticles] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    fetch(`${BACKEND_URL}/news/${category}`)
      .then((res) => res.json())
      .then((data) => {
        setArticles(data);
        setLoading(false);
      })
      .catch((err) => {
        console.error("Error fetching news:", err);
        setLoading(false);
      });
  }, [category]);

  useEffect(() => {
    const handleNewsUpdate = (updatedNews) => {
      if (updatedNews[category]) {
        setArticles(updatedNews[category]);
      }
    };

    socket.on("news_update", handleNewsUpdate);
    return () => socket.off("news_update", handleNewsUpdate);
  }, [category]);

  return (
    <div style={{ padding: 20, fontFamily: "Arial, sans-serif" }}>
      <h1 style={{ color: "#1e90ff" }}>📰 AI Live News Summarizer</h1>

      <div style={{ marginBottom: 20 }}>
        {categories.map((cat) => (
          <button
            key={cat}
            onClick={() => setCategory(cat)}
            style={{
              margin: "5px",
              padding: "10px 20px",
              backgroundColor: cat === category ? "#1e90ff" : "#f0f0f0",
              color: cat === category ? "white" : "black",
              border: "none",
              borderRadius: "20px",
              cursor: "pointer",
              fontWeight: "bold",
              textTransform: "capitalize",
            }}
          >
            {cat}
          </button>
        ))}
      </div>

      <div>
        {loading ? (
          <p>Loading {category} news...</p>
        ) : articles.length === 0 ? (
          <p>No news found for "{category}" yet. Please check back later!</p>
        ) : (
          articles.map((article, index) => (
            <div
              key={index}
              style={{
                border: "1px solid #ddd",
                padding: "20px",
                marginBottom: "20px",
                borderRadius: "10px",
                boxShadow: "0 2px 8px rgba(0, 0, 0, 0.1)",
              }}
            >
              <h2>{article.title}</h2>
              {article.image && (
                <img
                  src={article.image}
                  alt="News"
                  style={{
                    width: "100%",
                    maxHeight: 300,
                    objectFit: "cover",
                    borderRadius: 8,
                    marginTop: 10,
                  }}
                />
              )}
              <p style={{ marginTop: 10 }}>{article.summary}</p>
              <a
                href={article.url}
                target="_blank"
                rel="noopener noreferrer"
                style={{ color: "#1e90ff" }}
              >
                🔗 Read Full Article
              </a>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

export default App;
