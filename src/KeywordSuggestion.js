import React, { useState } from 'react';

const KeywordSuggestion = () => {
  const [content, setContent] = useState('');
  const [optimizedContent, setOptimizedContent] = useState('');
  const [seoScore, setSeoScore] = useState(0);
  const [targetSeoScore, setTargetSeoScore] = useState(0);
  const [suggestedKeywords, setSuggestedKeywords] = useState([]);
  const [highlightedKeywords, setHighlightedKeywords] = useState([]);

  const fetchKeywords = async () => {
    try {
      console.log("Fetching keywords and optimizing content...");
  
      const response = await fetch('http://localhost:5000/optimize', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          text: content
        }),
      });
  
      if (!response.ok) {
        throw new Error(`Error: ${response.status}`);
      }
  
      const data = await response.json();
      console.log("Optimized Content Received: ", data.optimizedText);
  
      setOptimizedContent(data.optimizedText);
  
      if (data.unusedKeywords) {
        setSuggestedKeywords(data.unusedKeywords);
      } else {
        setSuggestedKeywords([]);
      }

      if (data.highlightedKeywords) {
        setHighlightedKeywords(data.highlightedKeywords);
      } else {
        setHighlightedKeywords([]);
      }

      const lengthFactor = Math.min(content.length / 1000, 1) * 50;
      const keywordFactor = (data.unusedKeywords?.length === 0) ? 50 : (50 - data.unusedKeywords.length * 5);
      const calculatedTargetScore = Math.floor(lengthFactor + keywordFactor);
      setTargetSeoScore(calculatedTargetScore);
  
    } catch (error) {
      console.error("Error fetching keywords:", error);
    }
  };

  const calculateSeoScore = () => {
    const score = Math.floor(Math.random() * 100);
    setSeoScore(score);
    console.log("SEO Score Calculated: ", score);
  };

  const handleRewrite = () => {
    console.log("Optimizing content...");
    fetchKeywords();
    calculateSeoScore();
  };

  const handleKeywordClick = (keyword) => {
    setContent(content + " " + keyword);
    setSuggestedKeywords(suggestedKeywords.filter(kw => kw !== keyword)); 
  };

  const highlightKeywords = (text) => {
    let highlightedText = text;
    highlightedKeywords.forEach(keyword => {
      const regex = new RegExp(`(${keyword})`, 'gi');
      highlightedText = highlightedText.replace(regex, '<mark>$1</mark>');
    });
    return { __html: highlightedText };
  };

  return (
    <div style={styles.container}>
      <h2 style={styles.title}>Optimize Your Content</h2>

      <textarea 
        value={content} 
        onChange={e => setContent(e.target.value)} 
        placeholder="Paste your content here" 
        rows="10" 
        cols="50" 
        style={styles.textarea}
      />
      <br/>
      <button onClick={handleRewrite} style={styles.button}>Optimize Content</button>

      <h3 style={styles.subtitle}>Original Content:</h3>
      <textarea 
        value={content} 
        readOnly 
        rows="10" 
        cols="50"
        style={styles.textarea}
      />

      <h3 style={styles.subtitle}>Optimized Content (Editable):</h3>
      <div style={styles.optimizedContentBox} dangerouslySetInnerHTML={highlightKeywords(optimizedContent)} />

      <h3 style={styles.subtitle}>Target SEO Score: {targetSeoScore}</h3>
      <h3 style={styles.subtitle}>Your Current SEO Score: {seoScore}</h3>

      <h3 style={styles.subtitle}>Suggested Keywords (Click to Insert):</h3>
      <ul>
        {suggestedKeywords.map((keyword, index) => (
          <li 
            key={index} 
            onClick={() => handleKeywordClick(keyword)} 
            style={styles.keyword}
          >
            {keyword}
          </li>
        ))}
      </ul>

      <p style={styles.seoText}>The higher the SEO score, the better optimized your content is for search engines.</p>
    </div>
  );
};

const styles = {
  container: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: '100vh',
    backgroundColor: '#f5f5f5',
    padding: '20px',
  },
  title: {
    fontSize: '24px',
    marginBottom: '20px',
  },
  subtitle: {
    fontSize: '18px',
    marginTop: '20px',
  },
  textarea: {
    width: '80%',
    padding: '10px',
    borderRadius: '5px',
    border: '1px solid #ccc',
    fontSize: '16px',
    marginBottom: '20px',
  },
  button: {
    padding: '10px 20px',
    backgroundColor: '#4CAF50',
    color: 'white',
    border: 'none',
    borderRadius: '5px',
    cursor: 'pointer',
  },
  seoText: {
    fontSize: '16px',
    color: '#333',
    marginTop: '10px',
  },
  optimizedContentBox: {
    width: '80%',
    padding: '10px',
    borderRadius: '5px',
    border: '1px solid #ccc',
    backgroundColor: '#fff',
    fontSize: '16px',
    whiteSpace: 'pre-wrap',
  },
  keyword: {
    cursor: 'pointer',
    textDecoration: 'none',
    fontSize: '16px',
    marginBottom: '10px',
    listStyleType: 'none',
  }
};

export default KeywordSuggestion;
