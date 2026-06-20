"""
Foot Guard AI - Real-time Webcam Prediction (CLI)
"""

import cv2
import numpy as np
import tensorflow as tf
import os
from utils.preprocess import apply_clahe

IMG_SIZE = 224
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
MODEL_PATH = os.path.join(BASE_DIR, "model", "dfu_model.keras")
THRESHOLD_PATH = os.path.join(BASE_DIR, "model", "threshold.txt")

def main():
    if not os.path.exists(MODEL_PATH):
        print("Model not found. Run train_model.py first.")
        return

    model = tf.keras.models.load_model(MODEL_PATH)
    threshold = 0.5
    if os.path.exists(THRESHOLD_PATH):
        with open(THRESHOLD_PATH, 'r') as f:
            threshold = float(f.read().strip())

    cap = cv2.VideoCapture(0)
    if not cap.isOpened():
        print("Could not open webcam")
        return

    print("Press 'q' to quit, 'c' to capture and predict")

    while True:
        ret, frame = cap.read()
        if not ret:
            break

        display = frame.copy()
        cv2.putText(display, "Press 'c' to capture, 'q' to quit",
                     (10, 30), cv2.FONT_HERSHEY_SIMPLEX, 0.7, (0, 255, 0), 2)
        cv2.imshow("Foot Guard AI - Real-time Detection", display)

        key = cv2.waitKey(1) & 0xFF
        if key == ord('q'):
            break
        elif key == ord('c'):
            img = apply_clahe(frame)
            img = cv2.resize(img, (IMG_SIZE, IMG_SIZE))
            img = img.astype(np.float32) / 255.0
            img = np.expand_dims(img, axis=0)

            pred = model.predict(img, verbose=0)[0][0]
            is_ulcer = pred >= threshold
            conf = pred if is_ulcer else (1 - pred)

            label = "ULCER DETECTED" if is_ulcer else "NORMAL FOOT"
            color = (0, 0, 255) if is_ulcer else (0, 255, 0)

            result_frame = frame.copy()
            cv2.putText(result_frame, f"{label} ({conf*100:.1f}%)",
                        (10, 50), cv2.FONT_HERSHEY_SIMPLEX, 1.2, color, 3)
            cv2.imshow("Result", result_frame)
            cv2.waitKey(3000)

    cap.release()
    cv2.destroyAllWindows()

if __name__ == "__main__":
    main()
