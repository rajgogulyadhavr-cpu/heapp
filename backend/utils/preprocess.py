import cv2
import numpy as np
import base64

IMG_SIZE = 224

def apply_clahe(image):
    """Apply CLAHE preprocessing to enhance image contrast."""
    lab = cv2.cvtColor(image, cv2.COLOR_BGR2LAB)
    l, a, b = cv2.split(lab)
    clahe = cv2.createCLAHE(clipLimit=3.0, tileGridSize=(8, 8))
    l = clahe.apply(l)
    lab = cv2.merge([l, a, b])
    return cv2.cvtColor(lab, cv2.COLOR_LAB2BGR)


def preprocess_image(image_bytes):
    """
    Preprocess uploaded image bytes for model prediction.
    Returns (img_array, original_img).
    - img_array: normalized numpy array ready for model input.
    - original_img: the raw decoded BGR image for Grad-CAM overlays.
    Raises ValueError if the bytes cannot be decoded as an image.
    """
    nparr = np.frombuffer(image_bytes, np.uint8)

    # Decode once — store result for both model input and Grad-CAM
    original_img = cv2.imdecode(nparr, cv2.IMREAD_COLOR)
    if original_img is None:
        raise ValueError(
            "Could not decode image. Ensure the file is a valid JPG, PNG, or WebP."
        )

    # Apply preprocessing pipeline
    img_clahe = apply_clahe(original_img)
    img_resized = cv2.resize(img_clahe, (IMG_SIZE, IMG_SIZE))
    img_normalized = img_resized.astype(np.float32) / 255.0
    img_array = np.expand_dims(img_normalized, axis=0)

    return img_array, original_img


def preprocess_base64(base64_str):
    """
    Preprocess a base64-encoded image string for model prediction.
    Handles optional data URI prefix (e.g. 'data:image/jpeg;base64,...').
    Returns (img_array, original_img).
    """
    if not base64_str:
        raise ValueError("Base64 image string is empty.")
    if ',' in base64_str:
        base64_str = base64_str.split(',')[1]
    try:
        image_bytes = base64.b64decode(base64_str)
    except Exception:
        raise ValueError("Invalid base64 encoding.")
    return preprocess_image(image_bytes)


def preprocess_cv_image(img):
    """
    Preprocess an OpenCV image (numpy array) for model prediction.
    Used by the real-time CLI tool.
    """
    img_clahe = apply_clahe(img)
    img_resized = cv2.resize(img_clahe, (IMG_SIZE, IMG_SIZE))
    img_normalized = img_resized.astype(np.float32) / 255.0
    return np.expand_dims(img_normalized, axis=0)
