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
from nltk.corpus import stopwords

app = Flask(__name__)
CORS(app)

# Language mapping between langdetect and NLTK
LANG_MAPPING = {
    'en': 'english',
    'es': 'spanish',
    'fr': 'french',
    'de': 'german',
    'it': 'italian',
    'pt': 'portuguese',
    'nl': 'dutch',
    'da': 'danish',
    'fi': 'finnish',
    'hu': 'hungarian',
    'no': 'norwegian',
    'ru': 'russian',
    'sv': 'swedish',
    'tr': 'turkish'
}

def get_stopwords(lang: str) -> set:
    """
    Get stopwords for a given language from NLTK
    """
    try:
        nltk_lang = LANG_MAPPING.get(lang, 'english')  # Default to English if language not supported
        return set(stopwords.words(nltk_lang))
    except Exception as e:
        print(f"Error loading stopwords for {lang}: {str(e)}")
        # Return English stopwords as fallback
        return set(stopwords.words('english'))

def detect_language(text):
    """
    Detect the language of the text
    """
    try:
        detected_lang = langdetect.detect(text)
        # Only return detected language if we have stopwords for it
        return detected_lang if detected_lang in LANG_MAPPING else 'en'
    except:
        return 'en'

def clean_and_count_words(text, custom_stop_words, num_results):
    """
    Clean text and count word frequencies
    """
    # Detect language
    lang = detect_language(text)
    
    # Get NLTK stopwords and combine with custom ones
    nltk_stop_words = get_stopwords(lang)
    all_stop_words = nltk_stop_words.union(custom_stop_words)
    
    # Basic text cleaning
    text = ' '.join(text.split()).lower()
    text = re.sub(r'http\S+|www\S+', '', text)  # Remove URLs
    text = re.sub(r'\d+', '', text)  # Remove numbers
    
    # Split into words and remove punctuation
    words = [word.strip(string.punctuation) for word in text.split()]
    
    # Filter words: remove stop words, empty strings, and short words
    words = [word for word in words if word 
            and word not in all_stop_words 
            and len(word) > 2]  # Filter out very short words
    
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
        'language': lang,
        'stopwords_used': len(all_stop_words)  # Added for information
    }

def generate_csv(data):
    """
    Generate CSV output of analysis results
    """
    output = StringIO()
    writer = csv.writer(output)
    
    # Write headers and data
    writer.writerow(['Word', 'Frequency'])
    for word, freq in data['word_frequency'].items():
        writer.writerow([word, freq])
    
    # Write statistics
    writer.writerow([])
    writer.writerow(['Statistics', ''])
    writer.writerow(['Total Words', data['statistics']['total_words']])
    writer.writerow(['Unique Words', data['statistics']['unique_words']])
    writer.writerow(['Average Word Length', data['statistics']['avg_word_length']])
    writer.writerow(['Language', data['language'].upper()])
    writer.writerow(['Stopwords Used', data['stopwords_used']])
    
    return output.getvalue()

@app.route('/api/analyze', methods=['POST'])
def analyze_url():
    try:
        # Get request data
        data = request.get_json()
        url = data.get('url')
        num_results = data.get('numResults', 10)
        custom_stop_words = set(data.get('stopWords', []))
        
        # Validate URL
        if not url:
            return jsonify({
                'success': False,
                'error': 'URL is required'
            }), 400
        
        # Fetch webpage with timeout
        response = requests.get(url, timeout=10)
        response.raise_for_status()
        
        # Parse HTML
        soup = BeautifulSoup(response.text, 'html.parser')
        
        # Remove unwanted elements
        for element in soup(['script', 'style', 'meta', 'noscript', 'header', 'footer']):
            element.decompose()
            
        # Get text content
        text = soup.get_text()
        
        # Analyze text
        analysis = clean_and_count_words(text, custom_stop_words, num_results)
        
        # Generate CSV
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

@app.route('/api/supported-languages', methods=['GET'])
def get_supported_languages():
    """
    Return list of supported languages for stopwords
    """
    return jsonify({
        'success': True,
        'data': {
            'languages': list(LANG_MAPPING.keys()),
            'current_default': 'english'
        }
    })

if __name__ == '__main__':
    app.run(debug=True)

