"""
Foot Guard AI - Flask Backend Server
Production-hardened: safe startup, full exception handling, proper logging.
"""

import os
import json
import base64
import io
import time
import logging
import tempfile
import numpy as np
from flask import Flask, request, jsonify
# pyrefly: ignore [missing-import]
from flask_cors import CORS

# ─── Logging Setup ────────────────────────────────────────────────
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s [%(levelname)s] %(message)s',
    datefmt='%Y-%m-%d %H:%M:%S'
)
logger = logging.getLogger(__name__)

app = Flask(__name__)
CORS(app,
    origins=[
        "https://footguard-app.netlify.app",
        "http://localhost:5173",
        "http://localhost:3000",
    ],
    methods=["GET", "POST", "OPTIONS"],
    allow_headers=["Content-Type", "Authorization"],
    supports_credentials=False
)

# ─── Upload Limit (16 MB) ──────────────────────────────────────────
app.config['MAX_CONTENT_LENGTH'] = 16 * 1024 * 1024

# ─── Paths ────────────────────────────────────────────────────────
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
MODEL_PATH = os.path.join(BASE_DIR, "model", "dfu_model.keras")
THRESHOLD_PATH = os.path.join(BASE_DIR, "model", "threshold.txt")
HOSPITALS_PATH = os.path.join(BASE_DIR, "hospital_data", "hospitals.json")
KNOWLEDGE_PATH = os.path.join(BASE_DIR, "hospital_data", "knowledge_base.json")

# ─── Global State ─────────────────────────────────────────────────
model = None
threshold = 0.5
hospitals_cache = []
knowledge_base = {}
SERVER_START_TIME = time.time()

# ─── Safe Data Loaders ────────────────────────────────────────────
def load_knowledge():
    """Load knowledge base JSON safely. Returns empty dict on failure."""
    try:
        if not os.path.exists(KNOWLEDGE_PATH):
            logger.warning(f"Knowledge base not found at: {KNOWLEDGE_PATH}")
            return {}
        with open(KNOWLEDGE_PATH, 'r', encoding='utf-8') as f:
            data = json.load(f)
        logger.info(f"Knowledge base loaded: {KNOWLEDGE_PATH}")
        return data
    except Exception as e:
        logger.error(f"Failed to load knowledge base: {e}")
        return {}


def load_hospitals():
    """Load hospitals JSON safely. Returns empty list on failure."""
    try:
        if not os.path.exists(HOSPITALS_PATH):
            logger.warning(f"Hospitals data not found at: {HOSPITALS_PATH}")
            return []
        with open(HOSPITALS_PATH, 'r', encoding='utf-8') as f:
            data = json.load(f)
        # Handle both formats: plain list OR {"tamil_nadu_hospitals": [...]}
        if isinstance(data, list):
            hospitals = data
        elif isinstance(data, dict):
            # Extract the first list value found in the dict
            hospitals = next((v for v in data.values() if isinstance(v, list)), [])
        else:
            hospitals = []
        logger.info(f"Hospitals data loaded: {HOSPITALS_PATH} ({len(hospitals)} entries)")
        return hospitals
    except Exception as e:
        logger.error(f"Failed to load hospitals data: {e}")
        return []


def load_model():
    """Load TensorFlow model and threshold once at startup."""
    global model, threshold
    try:
        # pyrefly: ignore [missing-import]
        import tensorflow as tf
        if os.path.exists(MODEL_PATH):
            model = tf.keras.models.load_model(MODEL_PATH)
            logger.info(f"Model loaded successfully from: {MODEL_PATH}")
        else:
            logger.warning(f"Model file not found at: {MODEL_PATH}. Run train_model.py first.")

        if os.path.exists(THRESHOLD_PATH):
            with open(THRESHOLD_PATH, 'r') as f:
                threshold = float(f.read().strip())
            logger.info(f"Threshold loaded: {threshold}")
        else:
            logger.warning(f"Threshold file not found at: {THRESHOLD_PATH}. Using default: {threshold}")
    except Exception as e:
        logger.error(f"Error loading model: {e}", exc_info=True)


# ─── AI Response Engine ──────────────────────────────────────────
def get_ai_response(query, language="english"):
    """
    Match query to knowledge base entries using keyword scoring.
    Falls back to word-overlap scoring, then to default response.
    """
    if not knowledge_base:
        return "The knowledge base is currently unavailable. Please consult a doctor for medical advice."

    query_lower = query.lower().strip()
    lang_data = knowledge_base.get(language, knowledge_base.get("english", {}))

    if not lang_data:
        return "Language data not available. Please try in English."

    best_match = None
    best_score = 0

    # Pass 1: substring match (score by keyword length)
    for topic, data in lang_data.items():
        if topic == "default":
            continue
        keywords = data.get("keywords", [])
        for keyword in keywords:
            keyword_lower = keyword.lower()
            if keyword_lower in query_lower or query_lower in keyword_lower:
                score = len(keyword_lower)
                if score > best_score:
                    best_score = score
                    best_match = data["response"]

    # Pass 2: word-overlap fuzzy match
    if best_match is None:
        query_words = set(query_lower.split())
        for topic, data in lang_data.items():
            if topic == "default":
                continue
            keywords = data.get("keywords", [])
            for keyword in keywords:
                keyword_words = set(keyword.lower().split())
                overlap = len(query_words & keyword_words)
                if overlap > best_score:
                    best_score = overlap
                    best_match = data["response"]

    if best_match is None:
        best_match = lang_data.get("default", {}).get(
            "response",
            "I can help with DFU information. Please ask about symptoms, causes, prevention, or treatment."
        )

    return best_match


# ─── API Routes ───────────────────────────────────────────────────

@app.route('/', methods=['GET'])
def index():
    """Root endpoint to check server status."""
    return jsonify({
        "message": "Foot Guard AI Backend API is running successfully.",
        "version": "1.0.0",
        "status": "healthy"
    })


@app.route('/health', methods=['GET'])
@app.route('/api/health', methods=['GET'])
def health():
    """Health check endpoint with detailed status."""
    uptime_seconds = int(time.time() - SERVER_START_TIME)
    uptime_str = f"{uptime_seconds // 3600}h {(uptime_seconds % 3600) // 60}m {uptime_seconds % 60}s"
    return jsonify({
        "status": "healthy",
        "model_loaded": model is not None,
        "threshold": threshold,
        "knowledge_base_loaded": bool(knowledge_base),
        "hospitals_loaded": len(hospitals_cache) > 0,
        "hospitals_count": len(hospitals_cache),
        "uptime": uptime_str
    })


@app.route('/predict', methods=['POST'])
@app.route('/api/predict', methods=['POST'])
def predict():
    """Predict DFU from uploaded image file."""
    if model is None:
        return jsonify({"error": "Model not loaded. Please run train_model.py first."}), 503

    try:
        # pyrefly: ignore [missing-import]
        from utils.preprocess import preprocess_image, preprocess_base64
        # pyrefly: ignore [missing-import]
        from utils.gradcam import generate_gradcam

        # Handle file upload or base64
        if 'image' in request.files:
            file = request.files['image']
            if not file or file.filename == '':
                return jsonify({"error": "Invalid or missing image file. Please provide a valid foot image."}), 400
            image_bytes = file.read()
            if len(image_bytes) == 0:
                return jsonify({"error": "Empty image file uploaded. Please try again."}), 400
            img_array, original_img = preprocess_image(image_bytes)
        elif request.json and 'image' in request.json:
            base64_str = request.json['image']
            if not base64_str:
                return jsonify({"error": "Invalid or missing base64 image data."}), 400
            img_array, original_img = preprocess_base64(base64_str)
        else:
            return jsonify({"error": "No image provided"}), 400

        # Run prediction
        prediction = model.predict(img_array, verbose=0)[0][0]
        is_ulcer = float(prediction) >= threshold
        confidence = float(prediction) if is_ulcer else float(1 - prediction)

        logger.info(f"Prediction: {'Ulcer' if is_ulcer else 'Normal'} | Score={prediction:.4f} | Confidence={confidence:.2%}")

        # Generate Grad-CAM for ulcer detections
        gradcam_image = None
        if is_ulcer:
            gradcam_image = generate_gradcam(model, img_array, original_img)

        result = {
            "prediction": "Ulcer Detected" if is_ulcer else "Normal Foot",
            "is_ulcer": is_ulcer,
            "confidence": round(confidence * 100, 2),
            "raw_score": round(float(prediction), 4),
            "gradcam": gradcam_image,
            "disclaimer": "This prediction is intended only for early screening. Please consult a doctor."
        }

        return jsonify(result)

    except ValueError as e:
        logger.warning(f"Image preprocessing error: {e}")
        return jsonify({"error": f"Image could not be processed: {str(e)}. Please ensure the image is a valid JPG, PNG, or WebP."}), 400
    except Exception as e:
        logger.error(f"Prediction error: {e}", exc_info=True)
        return jsonify({"error": "An internal error occurred during prediction. Please ensure the image is valid and try again."}), 500


@app.route('/predict-camera', methods=['POST'])
@app.route('/api/predict-camera', methods=['POST'])
def predict_camera():
    """Predict DFU from base64-encoded camera capture."""
    if model is None:
        return jsonify({"error": "Model not loaded. Please run train_model.py first."}), 503

    try:
        # pyrefly: ignore [missing-import]
        from utils.preprocess import preprocess_base64
        # pyrefly: ignore [missing-import]
        from utils.gradcam import generate_gradcam

        data = request.json
        if not data or 'image' not in data:
            return jsonify({"error": "No image provided"}), 400

        img_array, original_img = preprocess_base64(data['image'])

        prediction = model.predict(img_array, verbose=0)[0][0]
        is_ulcer = float(prediction) >= threshold
        confidence = float(prediction) if is_ulcer else float(1 - prediction)

        logger.info(f"Camera Prediction: {'Ulcer' if is_ulcer else 'Normal'} | Score={prediction:.4f} | Confidence={confidence:.2%}")

        gradcam_image = None
        if is_ulcer:
            gradcam_image = generate_gradcam(model, img_array, original_img)

        result = {
            "prediction": "Ulcer Detected" if is_ulcer else "Normal Foot",
            "is_ulcer": is_ulcer,
            "confidence": round(confidence * 100, 2),
            "raw_score": round(float(prediction), 4),
            "gradcam": gradcam_image,
            "disclaimer": "This prediction is intended only for early screening. Please consult a doctor."
        }

        return jsonify(result)

    except ValueError as e:
        logger.warning(f"Camera image preprocessing error: {e}")
        return jsonify({"error": f"Camera image could not be processed: {str(e)}."}), 400
    except Exception as e:
        logger.error(f"Camera prediction error: {e}", exc_info=True)
        return jsonify({"error": "An internal error occurred during camera prediction. Please try again."}), 500


@app.route('/api/hospitals', methods=['GET'])
def hospitals():
    """Return cached hospital data."""
    try:
        return jsonify(hospitals_cache)
    except Exception as e:
        logger.error(f"Hospitals endpoint error: {e}", exc_info=True)
        return jsonify({"error": "Could not retrieve hospital data."}), 500


@app.route('/api/urai/chat', methods=['POST'])
def urai_chat():
    """Urai AI text-based DFU chat endpoint."""
    try:
        data = request.json
        if not data:
            return jsonify({"error": "No data provided"}), 400

        query = data.get('message', '').strip()
        language = data.get('language', 'english')

        if not query:
            return jsonify({"error": "Message cannot be empty"}), 400

        logger.info(f"Urai query [{language}]: {query[:80]}")
        response = get_ai_response(query, language)

        return jsonify({
            "response": response,
            "disclaimer": "Foot Guard AI is only an early detection and prevention tool and is not a substitute for professional medical diagnosis. Please consult a qualified doctor."
        })

    except Exception as e:
        logger.error(f"Urai chat error: {e}", exc_info=True)
        return jsonify({
            "response": "I am currently unable to process your request. Please try again shortly.",
            "disclaimer": "Please consult a qualified doctor for medical advice."
        }), 500


@app.route('/api/kurai/text', methods=['POST'])
def kurai_text():
    """Kurai AI text input with TTS response."""
    try:
        data = request.json
        if not data:
            return jsonify({"error": "No data provided"}), 400

        query = data.get('message', '').strip()
        language = data.get('language', 'english')

        if not query:
            return jsonify({"error": "Message cannot be empty"}), 400

        logger.info(f"Kurai text query [{language}]: {query[:80]}")
        response_text = get_ai_response(query, language)

        # Generate TTS audio
        audio_base64 = None
        try:
            from gtts import gTTS
            lang_code = 'ta' if language == 'tamil' else 'en'
            tts = gTTS(text=response_text, lang=lang_code, slow=False)
            audio_buffer = io.BytesIO()
            tts.write_to_fp(audio_buffer)
            audio_buffer.seek(0)
            audio_base64 = base64.b64encode(audio_buffer.read()).decode('utf-8')
            logger.info(f"TTS generated successfully [{lang_code}]")
        except Exception as e:
            logger.warning(f"TTS generation failed (non-critical): {e}")

        return jsonify({
            "response": response_text,
            "audio": audio_base64,
            "disclaimer": "Please consult a doctor for proper diagnosis."
        })

    except Exception as e:
        logger.error(f"Kurai text error: {e}", exc_info=True)
        return jsonify({
            "response": "I am currently unable to process your request. Please try again.",
            "audio": None,
            "disclaimer": "Please consult a doctor for proper diagnosis."
        }), 500


@app.route('/api/kurai/voice', methods=['POST'])
def kurai_voice():
    """Kurai AI voice input: speech recognition + AI response + TTS."""
    try:
        import speech_recognition as sr
        import imageio_ffmpeg
        from pydub import AudioSegment
        AudioSegment.converter = imageio_ffmpeg.get_ffmpeg_exe()

        language = request.form.get('language', 'english')

        if 'audio' not in request.files:
            return jsonify({"error": "No audio file provided"}), 400

        audio_file = request.files['audio']
        logger.info(f"Kurai voice request received [{language}]")

        tmp_webm_path = None
        tmp_wav_path = None

        with tempfile.NamedTemporaryFile(suffix='.webm', delete=False) as tmp_webm:
            audio_file.save(tmp_webm.name)
            tmp_webm_path = tmp_webm.name

        with tempfile.NamedTemporaryFile(suffix='.wav', delete=False) as tmp_wav:
            tmp_wav_path = tmp_wav.name

        try:
            # Convert webm → wav
            audio_segment = AudioSegment.from_file(tmp_webm_path)
            audio_segment.export(tmp_wav_path, format="wav")
            logger.info("Audio converted from webm to wav")

            # Speech recognition with retry
            recognizer = sr.Recognizer()
            with sr.AudioFile(tmp_wav_path) as source:
                audio = recognizer.record(source)

            lang_code = 'ta-IN' if language == 'tamil' else 'en-US'
            transcript = None
            last_error = None

            for attempt in range(2):
                try:
                    transcript = recognizer.recognize_google(audio, language=lang_code)  # pyrefly: ignore
                    logger.info(f"Speech recognized (attempt {attempt + 1}): {transcript[:80]}")
                    break
                except sr.UnknownValueError:
                    logger.warning("Speech not intelligible — returning prompt to retry")
                    return jsonify({
                        "transcript": "",
                        "response": (
                            "Sorry, I could not understand the audio. Please speak clearly and try again."
                            if language == "english"
                            else "மன்னிக்கவும், ஆடியோவை புரிந்து கொள்ள முடியவில்லை. தெளிவாக பேசி மீண்டும் முயற்சிக்கவும்."
                        ),
                        "audio": None,
                        "disclaimer": "Please consult a doctor for proper diagnosis."
                    })
                except sr.RequestError as e:
                    last_error = e
                    logger.warning(f"Speech recognition network error (attempt {attempt + 1}): {e}")

            if transcript is None:
                logger.error(f"Speech recognition failed after 2 attempts: {last_error}")
                return jsonify({
                    "transcript": "",
                    "response": (
                        "Network error while processing voice. Please check your connection or try text input."
                        if language == "english"
                        else "குரல் செயலாக்கத்தில் நெட்வொர்க் பிழை. இணையத்தை சரிபார்க்கவும் அல்லது உரை உள்ளீட்டை முயற்சிக்கவும்."
                    ),
                    "audio": None,
                    "disclaimer": "Please consult a doctor for proper diagnosis."
                })

        finally:
            for path in [tmp_webm_path, tmp_wav_path]:
                if path and os.path.exists(path):
                    try:
                        os.unlink(path)
                    except Exception as cleanup_err:
                        logger.warning(f"Could not remove temp file {path}: {cleanup_err}")

        # Get AI response
        response_text = get_ai_response(transcript, language)

        # Generate TTS
        audio_base64 = None
        try:
            from gtts import gTTS
            lang_tts = 'ta' if language == 'tamil' else 'en'
            tts = gTTS(text=response_text, lang=lang_tts, slow=False)
            audio_buffer = io.BytesIO()
            tts.write_to_fp(audio_buffer)
            audio_buffer.seek(0)
            audio_base64 = base64.b64encode(audio_buffer.read()).decode('utf-8')
            logger.info(f"TTS generated for voice response [{lang_tts}]")
        except Exception as e:
            logger.warning(f"TTS generation failed (non-critical): {e}")

        return jsonify({
            "transcript": transcript,
            "response": response_text,
            "audio": audio_base64,
            "disclaimer": "Please consult a doctor for proper diagnosis."
        })

    except ImportError as e:
        logger.error(f"Missing dependency for voice processing: {e}")
        return jsonify({
            "transcript": "",
            "response": "Voice processing is not available right now. Please type your question instead.",
            "audio": None,
            "disclaimer": "Please consult a doctor for proper diagnosis."
        }), 503
    except Exception as e:
        logger.error(f"Voice processing error: {e}", exc_info=True)
        return jsonify({
            "transcript": "",
            "response": "An internal error occurred while processing your voice. Please try typing instead.",
            "audio": None,
            "disclaimer": "Please consult a doctor for proper diagnosis."
        }), 500


# ─── Error Handlers ───────────────────────────────────────────────

@app.errorhandler(413)
def request_entity_too_large(e):
    return jsonify({"error": "File too large. Maximum upload size is 16MB."}), 413


@app.errorhandler(404)
def not_found(e):
    return jsonify({"error": "Endpoint not found."}), 404


@app.errorhandler(500)
def internal_error(e):
    logger.error(f"Unhandled server error: {e}")
    return jsonify({"error": "An unexpected server error occurred. Please try again."}), 500


# ─── Load Data at Module Level (required for gunicorn) ────────────
# This runs both when executed directly AND when imported by gunicorn
logger.info("=" * 55)
logger.info("  FOOT GUARD AI — Backend Server Starting")
logger.info("=" * 55)

load_model()
knowledge_base = load_knowledge()
hospitals_cache = load_hospitals()

logger.info("=" * 55)
logger.info(f"  Model loaded    : {'YES' if model is not None else 'NO (run train_model.py)'}")
logger.info(f"  Knowledge base  : {'YES' if knowledge_base else 'NO'}")
logger.info(f"  Hospitals       : {len(hospitals_cache)} entries")
logger.info(f"  Threshold       : {threshold}")
logger.info(f"  Max upload      : 16 MB")
logger.info("=" * 55)

logger.info("  REGISTERED ROUTES:")
for rule in app.url_map.iter_rules():
    logger.info(f"  {rule.rule} -> {','.join(rule.methods)}")
logger.info("=" * 55)

# ─── Start Server (local development only) ────────────────────────
if __name__ == '__main__':
    port = int(os.environ.get('PORT', 5000))
    logger.info(f"  Running on      : http://localhost:{port}")
    app.run(host='0.0.0.0', port=port, debug=False)
