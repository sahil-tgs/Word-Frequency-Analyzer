from flask import Flask, request, jsonify
from flask_cors import CORS
from bs4 import BeautifulSoup
import requests
from collections import Counter
import re
import string
import langdetect
import csv
from io import StringIO

app = Flask(__name__)
CORS(app)

# Default stop words for different languages
STOP_WORDS = {
    'en': {'the', 'be', 'to', 'of', 'and', 'a', 'in', 'that', 'have', 'for', 'it', 'with', 'is', 'on', 'you', 'this'},
    'es': {'el', 'la', 'de', 'que', 'y', 'en', 'un', 'ser', 'por'},
    'fr': {'le', 'la', 'de', 'et', 'en', 'un', 'une', 'que'}
}

def detect_language(text):
    try:
        return langdetect.detect(text)
    except:
        return 'en'  # Default to English if detection fails

def clean_and_count_words(text, stop_words, num_results):
    # Detect language
    lang = detect_language(text)
    
    # Basic text cleaning
    # Remove extra whitespace and convert to lowercase
    text = ' '.join(text.split()).lower()
    
    # Remove URLs
    text = re.sub(r'http\S+|www\S+', '', text)
    
    # Remove numbers
    text = re.sub(r'\d+', '', text)
    
    # Split into words and remove punctuation
    words = [word.strip(string.punctuation) for word in text.split()]
    
    # Remove stop words and empty strings
    words = [word for word in words if word and word not in stop_words]
    
    # Count words
    word_counts = Counter(words)
    
    # Calculate statistics
    total_words = len(words)
    unique_words = len(set(words))
    avg_word_length = sum(len(word) for word in words) / total_words if total_words > 0 else 0
    
    return {
        'word_frequency': dict(word_counts.most_common(num_results)),
        'statistics': {
            'total_words': total_words,
            'unique_words': unique_words,
            'avg_word_length': round(avg_word_length, 2)
        },
        'language': lang
    }

def generate_csv(data):
    output = StringIO()
    writer = csv.writer(output)
    
    # Write headers
    writer.writerow(['Word', 'Frequency'])
    
    # Write word frequency data
    for word, freq in data['word_frequency'].items():
        writer.writerow([word, freq])
    
    # Write statistics
    writer.writerow([])  # Empty row for separation
    writer.writerow(['Statistics', ''])
    writer.writerow(['Total Words', data['statistics']['total_words']])
    writer.writerow(['Unique Words', data['statistics']['unique_words']])
    writer.writerow(['Average Word Length', data['statistics']['avg_word_length']])
    
    return output.getvalue()

@app.route('/api/analyze', methods=['POST'])
def analyze_url():
    try:
        # Get data from request
        data = request.get_json()
        url = data.get('url')
        num_results = data.get('numResults', 10)  # Default to 10 if not specified
        custom_stop_words = set(data.get('stopWords', []))  # Get custom stop words
        
        # Validate URL
        if not url:
            return jsonify({
                'success': False,
                'error': 'URL is required'
            }), 400
        
        # Fetch webpage
        response = requests.get(url)
        response.raise_for_status()  # Raise exception for bad status codes
        
        # Parse HTML
        soup = BeautifulSoup(response.text, 'html.parser')
        
        # Remove scripts, styles, and other unwanted elements
        for element in soup(['script', 'style', 'meta', 'noscript', 'header', 'footer']):
            element.decompose()
            
        # Get text content
        text = soup.get_text()
        
        # Detect language and get appropriate stop words
        lang = detect_language(text)
        stop_words = STOP_WORDS.get(lang, STOP_WORDS['en']).union(custom_stop_words)
        
        # Analyze text
        analysis = clean_and_count_words(text, stop_words, num_results)
        
        # Generate CSV for export
        csv_data = generate_csv(analysis)
        
        return jsonify({
            'success': True,
            'data': {
                **analysis,
                'csv_export': csv_data
            }
        })
        
    except requests.RequestException as e:
        return jsonify({
            'success': False,
            'error': f'Failed to fetch URL: {str(e)}'
        }), 400
        
    except Exception as e:
        return jsonify({
            'success': False,
            'error': f'Analysis failed: {str(e)}'
        }), 500

# Test endpoint
@app.route('/api/test', methods=['GET'])
def test():
    return jsonify({
        'message': 'Backend is working!'
    })

if __name__ == '__main__':
    app.run(debug=True)