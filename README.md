# Brand-Influencer Matching API
<img width="882" height="798" alt="image" src="https://github.com/user-attachments/assets/ea244c6c-d7fb-4325-aaf3-3ee7adb6b2ba" />

A powerful API service that helps brands find the most suitable influencers for their marketing campaigns using advanced AI and vector similarity search.

## 🚀 Features

- **AI-Powered Analysis**: Analyzes brand and influencer profiles using state-of-the-art language models
- **Vector Similarity Search**: Uses Pinecone for efficient similarity matching
- **Multi-Platform Support**: Works with various social media platforms
- **RESTful API**: Built with FastAPI for high performance and easy integration
- **Asynchronous Processing**: Handles multiple requests efficiently
- **MongoDB Integration**: For flexible data storage and retrieval

## 🛠️ Tech Stack

- **Backend**: Python 3.9+
- **Web Framework**: FastAPI
- **Vector Database**: Pinecone
- **Language Models**: OpenAI & Cohere
- **Database**: MongoDB
- **API Documentation**: Swagger UI & ReDoc

## 📦 Prerequisites

- Python 3.9 or higher
- MongoDB (local or cloud instance)
- Pinecone account and API key
- OpenAI API key
- Cohere API key

## 🚀 Installation

1. **Clone the repository**
   ```bash
   git clone [your-repository-url]
   cd projectA
   ```

2. **Create and activate a virtual environment**
   ```bash
   python -m venv venv
   source venv/bin/activate  # On Windows: venv\Scripts\activate
   ```

3. **Install dependencies**
   ```bash
   pip install -r requirements.txt
   ```
   (Note: Please create a requirements.txt file with all dependencies)

4. **Set up environment variables**
   Create a `.env` file in the project root with the following variables:
   ```env
   # API Keys
   OPENAI_API_KEY=your_openai_api_key
   COHERE_API_KEY=your_cohere_api_key
   PINECONE_API_KEY=your_pinecone_api_key
   
   # Database Configuration
   MONGODB_URI=mongodb://localhost:27017
   DB_NAME=brand_influencer_db
   
   # Pinecone Configuration
   PINECONE_INDEX_NAME=influencer-analysis
   ```

## 🏃‍♂️ Running the Application

1. **Start the FastAPI server**
   ```bash
   cd brand_influencer_matcher_Backend
   uvicorn main:app --reload
   ```

2. **Access the API documentation**
   - Swagger UI: http://localhost:8000/docs
   - ReDoc: http://localhost:8000/redoc

## 📚 API Endpoints

### Brands
- `POST /brands/` - Create a new brand profile
- `GET /brands/{brand_id}` - Get brand details
- `GET /brands/` - List all brands

### Influencers
- `POST /influencers/` - Add a new influencer
- `GET /influencers/{influencer_id}` - Get influencer details
- `GET /influencers/` - List all influencers

### Matches
- `POST /matches/find` - Find matching influencers for a brand
- `GET /matches/{match_id}` - Get match details

## 🤖 How It Works

1. **Data Ingestion**: Brands and influencers are added to the system with their profiles and content details
2. **Embedding Generation**: Text data is converted to vector embeddings using Cohere's multilingual model
3. **Vector Storage**: Embeddings are stored in Pinecone for efficient similarity search
4. **Matching**: The system finds the most similar influencers for a given brand using vector similarity
5. **Ranking**: Results are ranked based on relevance scores

## 📊 Data Models

### Influencer
```python
class InfluencerAnalysis(BaseModel):
    type_of_content: str
    target_audience: str
    positioning: str
    personality: str
    vision: str
```

## 🌐 Environment Variables

| Variable | Description | Required | Default |
|----------|-------------|----------|---------|
| `OPENAI_API_KEY` | API key for OpenAI services | Yes | - |
| `COHERE_API_KEY` | API key for Cohere services | Yes | - |
| `PINECONE_API_KEY` | API key for Pinecone vector database | Yes | - |
| `MONGODB_URI` | MongoDB connection string | No | `mongodb://localhost:27017` |
| `DB_NAME` | Database name | No | `brand_influencer_db` |
| `PINECONE_INDEX_NAME` | Name of the Pinecone index | No | `influencer-analysis` |

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- FastAPI for the awesome web framework
- Pinecone for the vector database
- OpenAI and Cohere for the language models
- MongoDB for the flexible document database
