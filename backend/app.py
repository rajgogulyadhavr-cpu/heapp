"""
Foot Guard AI - Flask Backend Server
"""

import os
import json
import base64
import io
import tempfile
import numpy as np
from flask import Flask, request, jsonify, send_file
from flask_cors import CORS

app = Flask(__name__)
CORS(app)

# ─── Paths ────────────────────────────────────────────────────────
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
MODEL_PATH = os.path.join(BASE_DIR, "model", "dfu_model.keras")
THRESHOLD_PATH = os.path.join(BASE_DIR, "model", "threshold.txt")
HOSPITALS_PATH = os.path.join(BASE_DIR, "hospital_data", "hospitals.json")
KNOWLEDGE_PATH = os.path.join(BASE_DIR, "hospital_data", "knowledge_base.json")

# ─── Load Model ───────────────────────────────────────────────────
model = None
threshold = 0.5

def load_model():
    global model, threshold
    try:
        import tensorflow as tf
        if os.path.exists(MODEL_PATH):
            model = tf.keras.models.load_model(MODEL_PATH)
            print(f"Model loaded from {MODEL_PATH}")
        else:
            print(f"WARNING: Model not found at {MODEL_PATH}. Run train_model.py first.")

        if os.path.exists(THRESHOLD_PATH):
            with open(THRESHOLD_PATH, 'r') as f:
                threshold = float(f.read().strip())
            print(f"Threshold loaded: {threshold}")
    except Exception as e:
        print(f"Error loading model: {e}")

# ─── Load Data ────────────────────────────────────────────────────
def load_hospitals():
    with open(HOSPITALS_PATH, 'r', encoding='utf-8') as f:
        return json.load(f)

def load_knowledge():
    with open(KNOWLEDGE_PATH, 'r', encoding='utf-8') as f:
        return json.load(f)

knowledge_base = load_knowledge()

# ─── AI Response Engine ──────────────────────────────────────────
def get_ai_response(query, language="english"):
    query_lower = query.lower().strip()
    lang_data = knowledge_base.get(language, knowledge_base["english"])

    best_match = None
    best_score = 0

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

    if best_match is None:
        # Fuzzy match - check word overlap
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
        best_match = lang_data.get("default", {}).get("response", "I can help with DFU information. Please ask about symptoms, causes, prevention, or treatment.")

    return best_match

# ─── API Routes ───────────────────────────────────────────────────

@app.route('/api/health', methods=['GET'])
def health():
    return jsonify({"status": "ok", "model_loaded": model is not None})

@app.route('/api/predict', methods=['POST'])
def predict():
    if model is None:
        return jsonify({"error": "Model not loaded. Please run train_model.py first."}), 503

    try:
        from utils.preprocess import preprocess_image, preprocess_base64
        from utils.gradcam import generate_gradcam

        # Handle file upload or base64
        if 'image' in request.files:
            file = request.files['image']
            image_bytes = file.read()
            img_array, original_img = preprocess_image(image_bytes)
        elif request.json and 'image' in request.json:
            base64_str = request.json['image']
            img_array, original_img = preprocess_base64(base64_str)
        else:
            return jsonify({"error": "No image provided"}), 400

        # Predict
        prediction = model.predict(img_array, verbose=0)[0][0]
        is_ulcer = float(prediction) >= threshold
        confidence = float(prediction) if is_ulcer else float(1 - prediction)

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

    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route('/api/predict-camera', methods=['POST'])
def predict_camera():
    if model is None:
        return jsonify({"error": "Model not loaded. Please run train_model.py first."}), 503

    try:
        from utils.preprocess import preprocess_base64
        from utils.gradcam import generate_gradcam

        data = request.json
        if not data or 'image' not in data:
            return jsonify({"error": "No image provided"}), 400

        img_array, original_img = preprocess_base64(data['image'])

        prediction = model.predict(img_array, verbose=0)[0][0]
        is_ulcer = float(prediction) >= threshold
        confidence = float(prediction) if is_ulcer else float(1 - prediction)

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

    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route('/api/hospitals', methods=['GET'])
def hospitals():
    data = load_hospitals()
    return jsonify(data)

@app.route('/api/urai/chat', methods=['POST'])
def urai_chat():
    data = request.json
    query = data.get('message', '')
    language = data.get('language', 'english')

    response = get_ai_response(query, language)

    return jsonify({
        "response": response,
        "disclaimer": "Foot Guard AI is only an early detection and prevention tool and is not a substitute for professional medical diagnosis. Please consult a qualified doctor."
    })

@app.route('/api/kurai/text', methods=['POST'])
def kurai_text():
    data = request.json
    query = data.get('message', '')
    language = data.get('language', 'english')

    response_text = get_ai_response(query, language)

    # Generate TTS
    audio_base64 = None
    try:
        from gtts import gTTS
        lang_code = 'ta' if language == 'tamil' else 'en'
        tts = gTTS(text=response_text, lang=lang_code, slow=False)
        audio_buffer = io.BytesIO()
        tts.write_to_fp(audio_buffer)
        audio_buffer.seek(0)
        audio_base64 = base64.b64encode(audio_buffer.read()).decode('utf-8')
    except Exception as e:
        print(f"TTS Error: {e}")

    return jsonify({
        "response": response_text,
        "audio": audio_base64,
        "disclaimer": "Please consult a doctor for proper diagnosis."
    })

@app.route('/api/kurai/voice', methods=['POST'])
def kurai_voice():
    try:
        import speech_recognition as sr

        import imageio_ffmpeg
        from pydub import AudioSegment
        AudioSegment.converter = imageio_ffmpeg.get_ffmpeg_exe()

        language = request.form.get('language', 'english')

        if 'audio' not in request.files:
            return jsonify({"error": "No audio file provided"}), 400

        audio_file = request.files['audio']

        # Save to temp files
        tmp_webm_path = None
        tmp_wav_path = None
        
        with tempfile.NamedTemporaryFile(suffix='.webm', delete=False) as tmp_webm:
            audio_file.save(tmp_webm.name)
            tmp_webm_path = tmp_webm.name

        with tempfile.NamedTemporaryFile(suffix='.wav', delete=False) as tmp_wav:
            tmp_wav_path = tmp_wav.name

        try:
            # Convert webm to wav
            audio_segment = AudioSegment.from_file(tmp_webm_path)
            audio_segment.export(tmp_wav_path, format="wav")

            # Recognize speech
            recognizer = sr.Recognizer()
            with sr.AudioFile(tmp_wav_path) as source:
                audio = recognizer.record(source)

            lang_code = 'ta-IN' if language == 'tamil' else 'en-US'
            
            transcript = None
            last_error = None
            
            # Retry logic: Try up to 2 times
            for attempt in range(2):
                try:
                    transcript = recognizer.recognize_google(audio, language=lang_code)
                    break # Success
                except sr.UnknownValueError:
                    # Not an API error, just unintelligible speech. No need to retry.
                    transcript = ""
                    return jsonify({
                        "transcript": "",
                        "response": "Sorry, I could not understand the audio. Please try again." if language == "english" else "மன்னிக்கவும், ஆடியோவை புரிந்து கொள்ள முடியவில்லை. மீண்டும் முயற்சிக்கவும்.",
                        "audio": None,
                        "disclaimer": "Please consult a doctor for proper diagnosis."
                    })
                except sr.RequestError as e:
                    last_error = e
                    print(f"Speech Recognition Request Error (Attempt {attempt + 1}): {e}")
                    # Will loop and retry if it's the first attempt

            if transcript is None:
                # Both attempts failed due to RequestError
                return jsonify({
                    "transcript": "",
                    "response": "Network error while processing voice. Please try text input." if language == "english" else "குரல் செயலாக்கத்தில் நெட்வொர்க் பிழை. உரை உள்ளீட்டை முயற்சிக்கவும்.",
                    "audio": None,
                    "disclaimer": "Please consult a doctor for proper diagnosis."
                })
        finally:
            if tmp_webm_path and os.path.exists(tmp_webm_path):
                os.unlink(tmp_webm_path)
            if tmp_wav_path and os.path.exists(tmp_wav_path):
                os.unlink(tmp_wav_path)

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
        except Exception as e:
            print(f"TTS Error: {e}")

        return jsonify({
            "transcript": transcript,
            "response": response_text,
            "audio": audio_base64,
            "disclaimer": "Please consult a doctor for proper diagnosis."
        })

    except Exception as e:
        return jsonify({"error": str(e)}), 500

# ─── Start Server ─────────────────────────────────────────────────
if __name__ == '__main__':
    load_model()
    print("\n" + "=" * 50)
    print("  FOOT GUARD AI - Backend Server")
    print("  Running on http://localhost:5000")
    print("=" * 50 + "\n")
    app.run(host='0.0.0.0', port=5000, debug=True)
