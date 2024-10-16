from flask import Flask, request, jsonify
from flask_cors import CORS
import spacy
from pymongo import MongoClient

app = Flask(__name__)
CORS(app)

nlp = spacy.load('en_core_web_sm')

client = MongoClient('mongodb://localhost:27017/')
db = client['KeywordDB']
primary_keywords_collection = db['Primary']

def fetch_keywords_from_primary():
    try:
        keywords = primary_keywords_collection.find().sort([
            ('searchVolume', -1),
            ('seoDifficulty', 1)
        ]).limit(10)
        return list(keywords)
    except Exception as e:
        print(f"Error fetching keywords from MongoDB: {e}")
        return []

def rewrite_content(text, keywords):
    doc = nlp(text)
    optimized_text = text
    unused_keywords = []
    highlighted_keywords = []

    try:
        for keyword_obj in keywords:
            keyword = keyword_obj['keyword']
            if keyword not in optimized_text:
                sentences = list(doc.sents)
                inserted = False
                for sentence in sentences:
                    if len(sentence.text.split()) > 3 and keyword not in sentence.text:
                        optimized_text = optimized_text.replace(
                            sentence.text, f"{sentence.text} <mark>{keyword}</mark>")
                        highlighted_keywords.append(keyword)
                        inserted = True
                        break
                if not inserted:
                    unused_keywords.append(keyword)
            else:
                unused_keywords.append(keyword)

        optimized_text = make_content_marketable(optimized_text)
    except Exception as e:
        print(f"Error during keyword insertion: {e}")
    
    return optimized_text, unused_keywords, highlighted_keywords

def make_content_marketable(text):
    call_to_action = "\n\nDiscover more about our programs today and start your journey with us!"
    return text + call_to_action

@app.route('/optimize', methods=['POST'])
def optimize_content():
    try:
        data = request.json
        text = data.get('text', '')

        if not text:
            return jsonify({"error": "No content provided"}), 400

        keywords = fetch_keywords_from_primary()

        if not keywords:
            return jsonify({"error": "No keywords found"}), 500

        optimized_text, unused_keywords, highlighted_keywords = rewrite_content(text, keywords)

        return jsonify({
            'optimizedText': optimized_text,
            'unusedKeywords': unused_keywords,
            'highlightedKeywords': highlighted_keywords
        })
    
    except Exception as e:
        print(f"Error in /optimize route: {e}")
        return jsonify({"error": str(e)}), 500

if __name__ == '__main__':
    app.run(debug=True, port=5000)
