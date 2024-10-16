import React, { useState, useEffect } from 'react';

const KeywordSuggestion = () => {
  const [content, setContent] = useState('');
  const [optimizedContent, setOptimizedContent] = useState('');
  const [seoScore, setSeoScore] = useState(0);
  const [targetSeoScore, setTargetSeoScore] = useState(0);
  const [suggestedKeywords, setSuggestedKeywords] = useState([]);
  const [highlightedKeywords, setHighlightedKeywords] = useState([]);

  useEffect(() => {
    calculateSeoScore(optimizedContent);
  }, [optimizedContent]);

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
      setSuggestedKeywords(data.unusedKeywords || []);  // Default to empty array
      setHighlightedKeywords(data.highlightedKeywords || []);  // Default to empty array
      setSeoScore(Math.round(data.seoScore || 0));
      setTargetSeoScore(Math.round(data.targetSeoScore || 0));
  
    } catch (error) {
      console.error("Error fetching keywords:", error);
    }
  };

  const calculateSeoScore = (text) => {
    const keywordCount = highlightedKeywords.length;
    const wordCount = text.split(/\s+/).length;
    const score = (keywordCount / wordCount) * 100;
    setSeoScore(Math.round(score));
  };

  const handleRewrite = () => {
    fetchKeywords();
  };

  const handleKeywordClick = (keyword) => {
    setContent(content + " " + keyword);
    setSuggestedKeywords(suggestedKeywords.filter(kw => kw !== keyword)); 
    calculateSeoScore(optimizedContent);
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

      <h3 style={styles.subtitle}>Suggested Keywords (Click to Insert):</h3>
      <ul>
        {suggestedKeywords.length > 0 ? suggestedKeywords.map((keyword, index) => (
          <li 
            key={index} 
            onClick={() => handleKeywordClick(keyword)} 
            style={styles.keyword}
          >
            {keyword}
          </li>
        )) : <li>No keywords to suggest.</li>}
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
  keyword: {
    cursor: 'pointer',
    textDecoration: 'none',
    fontSize: '16px',
    marginBottom: '10px',
    listStyleType: 'none',
  }
};

export default KeywordSuggestion;
