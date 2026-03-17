# FORGE Backend — Career Intelligence API

## Setup

### 1. Install dependencies

```bash
cd backend
pip install fastapi uvicorn pdfplumber google-genai python-multipart python-dotenv
```

Or using the requirements file:

```bash
pip install -r requirements.txt
```

### 2. Configure your Gemini API key

Open `backend/.env` and replace `your_key_here` with your actual Google Gemini API key:

```
GEMINI_API_KEY=your_actual_api_key_here
```

You can get a free API key from [Google AI Studio](https://aistudio.google.com/apikey).

### 3. Run the server

```bash
cd backend
chmod +x start.sh
./start.sh
```

Or run directly:

```bash
cd backend
uvicorn main:app --reload --port 8000
```

The server will start at `http://localhost:8000`.

### 4. Verify it's running

```bash
curl http://localhost:8000/api/health
```

Should return:

```json
{"status": "ok"}
```

## API Endpoints

### `GET /api/health`

Returns server status.

### `POST /api/analyse-resume`

Upload a PDF resume for career risk analysis.

- **Content-Type:** `multipart/form-data`
- **Field:** `file` (PDF file)
- **Returns:** JSON object with complete career risk analysis powered by Gemini 2.5 Flash
