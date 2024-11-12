# Word Frequency Analyzer

A full-stack web application that analyzes word frequencies from any webpage. This project was developed as part of the ExpertRec software engineering internship assignment, featuring a Flask backend for text processing and a modern React frontend for visualization.

![Word Frequency Analyzer Screenshot]

## 🎯 Objective

The main objective of this project is to create a tool that can:
- Fetch and analyze text content from any given URL
- Calculate word frequencies while ignoring common stop words
- Provide insightful text statistics
- Visualize the results in both tabular and graphical formats

## ✨ Features

- **URL Analysis**: Analyze text content from any accessible webpage
- **Customizable Results**: Control the number of top frequent words to display
- **Custom Stop Words**: Add custom words to ignore during analysis
- **Multiple Visualizations**: 
  - Tabular view for precise data
  - Bar chart visualization for trend analysis
- **Statistics Dashboard**:
  - Total word count
  - Unique words count
  - Average word length
  - Language detection
- **Export Functionality**: Export results to CSV format
- **Responsive Design**: Works seamlessly on both desktop and mobile devices

## 🛠️ Tech Stack

### Backend
- Python 3.x
- Flask (Web Framework)
- BeautifulSoup4 (Web Scraping)
- NLTK (Natural Language Processing)
- Langdetect (Language Detection)

### Frontend
- Next.js 14
- TypeScript
- Tailwind CSS
- Recharts (Data Visualization)
- Lucide Icons

## 🚀 Getting Started

### Prerequisites
- Python 3.x
- Node.js (LTS version)
- npm or yarn

### Backend Setup
```bash
# Clone the repository
git clone <repository-url>
cd word-frequency-analyzer

# Create and activate virtual environment
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Run the Flask server
python app.py
```

### Frontend Setup
```bash
# Navigate to frontend directory
cd frontend

# Install dependencies
npm install

# Run the development server
npm run dev
```

The application will be available at:
- Frontend: http://localhost:3000
- Backend API: http://localhost:5000

## 📝 Usage

1. Open the application in your browser
2. Enter a URL in the input field
3. (Optional) Set the number of top results you want to see
4. (Optional) Add custom stop words to ignore
5. Click "Analyze"
6. View results in either list or chart format
7. Export results using the "Export CSV" button if needed

## 🤝 Contributing

Contributions are welcome! Here's how you can help:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📄 API Documentation

### Analyze Endpoint
```
POST /api/analyze
```

**Request Body:**
```json
{
  "url": "https://example.com",
  "numResults": 10,
  "stopWords": ["custom", "words", "to", "ignore"]
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "word_frequency": {
      "example": 5,
      "word": 3
    },
    "statistics": {
      "total_words": 100,
      "unique_words": 50,
      "avg_word_length": 5.2
    },
    "language": "en"
  }
}
```

## ⚙️ Configuration

The application can be configured through environment variables:
- `FLASK_ENV`: Set to `development` or `production`
- `PORT`: Port number for the Flask server
- `ALLOWED_ORIGINS`: CORS allowed origins

## 🔒 Security Considerations

- The application implements CORS protection
- URL validation is performed before processing
- Error handling for malformed URLs and failed requests
- Rate limiting can be implemented for production use

## 🚧 Future Improvements

- Add user authentication
- Save analysis history
- Implement batch URL processing
- Add more text analysis metrics
- Support for PDF and document analysis
- Implement caching for frequently analyzed URLs

## 📜 License

Distributed under the MIT License. See `LICENSE` for more information.

## 👥 Authors

- Your Name - Initial work - [YourGitHub](https://github.com/yourusername)

## 🙏 Acknowledgments

- ExpertRec for the project requirements
- Contributors who have participated in this project

## ✍️ Notes

This project was created as part of an internship assignment for ExpertRec. The goal was to demonstrate full-stack development skills, API integration, and data visualization capabilities.