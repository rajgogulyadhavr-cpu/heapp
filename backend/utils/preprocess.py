import cv2
import numpy as np
from PIL import Image
import io
import base64

IMG_SIZE = 224

def apply_clahe(image):
    """Apply CLAHE preprocessing to enhance contrast."""
    lab = cv2.cvtColor(image, cv2.COLOR_BGR2LAB)
    l, a, b = cv2.split(lab)
    clahe = cv2.createCLAHE(clipLimit=3.0, tileGridSize=(8, 8))
    l = clahe.apply(l)
    lab = cv2.merge([l, a, b])
    return cv2.cvtColor(lab, cv2.COLOR_LAB2BGR)

def preprocess_image(image_bytes):
    """Preprocess uploaded image bytes for prediction."""
    nparr = np.frombuffer(image_bytes, np.uint8)
    img = cv2.imdecode(nparr, cv2.IMREAD_COLOR)
    if img is None:
        raise ValueError("Could not decode image")
    img = apply_clahe(img)
    img = cv2.resize(img, (IMG_SIZE, IMG_SIZE))
    img = img.astype(np.float32) / 255.0
    return np.expand_dims(img, axis=0), cv2.imdecode(nparr, cv2.IMREAD_COLOR)

def preprocess_base64(base64_str):
    """Preprocess base64-encoded image for prediction."""
    if ',' in base64_str:
        base64_str = base64_str.split(',')[1]
    image_bytes = base64.b64decode(base64_str)
    return preprocess_image(image_bytes)

def preprocess_cv_image(img):
    """Preprocess an OpenCV image (numpy array) for prediction."""
    img_clahe = apply_clahe(img)
    img_resized = cv2.resize(img_clahe, (IMG_SIZE, IMG_SIZE))
    img_normalized = img_resized.astype(np.float32) / 255.0
    return np.expand_dims(img_normalized, axis=0)
