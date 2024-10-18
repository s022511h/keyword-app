import React, { useState, useEffect } from 'react';

const KeywordSuggestion = () => {
  const [content, setContent] = useState('');
  const [optimizedContent, setOptimizedContent] = useState('');
  const [seoScore, setSeoScore] = useState(0);
  const [targetSeoScore, setTargetSeoScore] = useState(0);
  const [highlightedKeywords, setHighlightedKeywords] = useState([]);
  const [suggestedKeywords, setSuggestedKeywords] = useState([]);

  useEffect(() => {
    calculateSeoScore(optimizedContent);
  }, [optimizedContent, highlightedKeywords]);

  const fetchKeywords = async () => {
    try {
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
      
      setOptimizedContent(data.optimizedText || '');
      setHighlightedKeywords(data.highlightedKeywords || []);
      setSeoScore(Math.round(data.currentSeoScore || 0));
      setTargetSeoScore(Math.round(data.targetSeoScore || 0));
      setSuggestedKeywords(data.highlightedKeywords);

    } catch (error) {
      console.error("Error fetching keywords:", error);
    }
  };

  const calculateSeoScore = (text) => {
    const wordCount = text.split(/\s+/).length;
    const keywordCount = highlightedKeywords.reduce((count, keyword) => {
      const keywordMatches = (text.match(new RegExp(`\\b${keyword}\\b`, 'gi')) || []).length;
      return count + keywordMatches;
    }, 0);

    // Ensure the current SEO score meets or exceeds the target SEO score
    const score = Math.min((keywordCount / wordCount) * 100, targetSeoScore); // Cap at target SEO score
    setSeoScore(Math.round(score));
  };

  const handleRewrite = () => {
    fetchKeywords();
  };

  const highlightKeywords = (text) => {
    let highlightedText = text;
    highlightedKeywords.forEach(keyword => {
      const regex = new RegExp(`(${keyword})`, 'gi');
      highlightedText = highlightedText.replace(regex, '<mark>$1</mark>');
    });
    return { __html: highlightedText };
  };

  const handleContentChange = (e) => {
    setOptimizedContent(e.target.innerText);
    calculateSeoScore(e.target.innerText);
  };

  const addKeywordToContent = (keyword) => {
    setContent(prevContent => prevContent + " " + keyword);
    setOptimizedContent(prevOptimized => prevOptimized + " " + keyword);
    calculateSeoScore(optimizedContent + " " + keyword);
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
      <div 
        style={styles.optimizedContentBox} 
        contentEditable 
        dangerouslySetInnerHTML={highlightKeywords(optimizedContent)} 
        onInput={handleContentChange}
      />

      <h3 style={styles.subtitle}>Target SEO Score: {targetSeoScore}</h3>
      <h3 style={styles.subtitle}>Your Current SEO Score: {seoScore}</h3>

      <h3 style={styles.subtitle}>Suggested Keywords:</h3>
      <div>
        {suggestedKeywords.map((keyword, index) => (
          <button key={index} style={styles.keywordButton} onClick={() => addKeywordToContent(keyword)}>
            {keyword}
          </button>
        ))}
      </div>

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
  optimizedContentBox: {
    width: '80%',
    padding: '10px',
    borderRadius: '5px',
    border: '1px solid #ccc',
    backgroundColor: '#fff',
    fontSize: '16px',
    whiteSpace: 'pre-wrap',
  },
  seoText: {
    fontSize: '16px',
    color: '#333',
    marginTop: '10px',
  },
  keywordButton: {
    margin: '5px',
    padding: '8px 12px',
    backgroundColor: '#2196F3',
    color: 'white',
    border: 'none',
    borderRadius: '5px',
    cursor: 'pointer',
  }
};

export default KeywordSuggestion;
