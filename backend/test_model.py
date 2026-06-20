import os
import cv2
import numpy as np
import tensorflow as tf
from sklearn.metrics import classification_report, confusion_matrix
from utils.preprocess import apply_clahe, preprocess_cv_image

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
MODEL_PATH = os.path.join(BASE_DIR, "model", "dfu_model.keras")
THRESHOLD_PATH = os.path.join(BASE_DIR, "model", "threshold.txt")
DATASET_DIR = os.path.join(os.path.dirname(BASE_DIR), "DFU", "Patches")

def test_model():
    print("Loading model...")
    model = tf.keras.models.load_model(MODEL_PATH)
    with open(THRESHOLD_PATH, 'r') as f:
        threshold = float(f.read().strip())
    print(f"Model loaded. Using threshold: {threshold:.2f}")

    abnormal_dir = os.path.join(DATASET_DIR, "Abnormal(Ulcer)")
    normal_dir = os.path.join(DATASET_DIR, "Normal(Healthy skin)")

    # Test 50 random images from each class
    import random
    abnormal_files = random.sample(os.listdir(abnormal_dir), 50)
    normal_files = random.sample(os.listdir(normal_dir), 50)

    y_true = []
    y_pred = []

    print("\nTesting Abnormal (Ulcer) images...")
    for fname in abnormal_files:
        img = cv2.imread(os.path.join(abnormal_dir, fname))
        if img is not None:
            preprocessed = preprocess_cv_image(img)
            pred = model.predict(preprocessed, verbose=0)[0][0]
            y_true.append(1)
            y_pred.append(1 if pred >= threshold else 0)

    print("Testing Normal (Healthy Skin) images...")
    for fname in normal_files:
        img = cv2.imread(os.path.join(normal_dir, fname))
        if img is not None:
            preprocessed = preprocess_cv_image(img)
            pred = model.predict(preprocessed, verbose=0)[0][0]
            y_true.append(0)
            y_pred.append(1 if pred >= threshold else 0)

    print("\n" + "="*50)
    print("TEST RESULTS (100 Sample Images)")
    print("="*50)
    print("Confusion Matrix:")
    print(confusion_matrix(y_true, y_pred))
    print("\nClassification Report:")
    print(classification_report(y_true, y_pred, target_names=['Normal', 'Ulcer']))

    false_negatives = sum([1 for t, p in zip(y_true, y_pred) if t == 1 and p == 0])
    print(f"\nCRITICAL METRIC - False Negatives (Missed Ulcers): {false_negatives}/50")
    if false_negatives > 0:
        print("Model missed some ulcers! Retraining with F2-optimized threshold and 1.5x class weights is recommended.")
    else:
        print("Excellent: Model successfully minimized false negatives on this sample.")

if __name__ == "__main__":
    test_model()
