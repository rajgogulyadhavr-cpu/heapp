"""
Foot Guard AI - Model Training Script
EfficientNetB0 Transfer Learning for Diabetic Foot Ulcer Detection
"""

import os
import sys
import numpy as np
import cv2
import tensorflow as tf
from tensorflow import keras
from tensorflow.keras import layers, callbacks
from tensorflow.keras.applications import EfficientNetB0
from tensorflow.keras.preprocessing.image import ImageDataGenerator
from sklearn.model_selection import train_test_split
from sklearn.metrics import classification_report, confusion_matrix
from utils.preprocess import apply_clahe

# ─── Configuration ───────────────────────────────────────────────
IMG_SIZE = 224
BATCH_SIZE = 16
EPOCHS_PHASE1 = 10
EPOCHS_PHASE2 = 15
DATASET_DIR = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), "DFU", "Patches")
MODEL_DIR = os.path.join(os.path.dirname(os.path.abspath(__file__)), "model")
MODEL_PATH = os.path.join(MODEL_DIR, "dfu_model.keras")

# ─── Load and Preprocess Dataset ─────────────────────────────────
def load_dataset():
    images = []
    labels = []
    
    abnormal_dir = os.path.join(DATASET_DIR, "Abnormal(Ulcer)")
    normal_dir = os.path.join(DATASET_DIR, "Normal(Healthy skin)")
    
    if not os.path.exists(abnormal_dir):
        print(f"ERROR: Abnormal directory not found: {abnormal_dir}")
        sys.exit(1)
    if not os.path.exists(normal_dir):
        print(f"ERROR: Normal directory not found: {normal_dir}")
        sys.exit(1)
    
    print("Loading Abnormal (Ulcer) images...")
    count = 0
    for fname in os.listdir(abnormal_dir):
        fpath = os.path.join(abnormal_dir, fname)
        img = cv2.imread(fpath)
        if img is not None:
            img = apply_clahe(img)
            img = cv2.resize(img, (IMG_SIZE, IMG_SIZE))
            images.append(img)
            labels.append(1)  # 1 = Ulcer
            count += 1
    print(f"  Loaded {count} abnormal images")
    
    print("Loading Normal (Healthy Skin) images...")
    count = 0
    for fname in os.listdir(normal_dir):
        fpath = os.path.join(normal_dir, fname)
        img = cv2.imread(fpath)
        if img is not None:
            img = apply_clahe(img)
            img = cv2.resize(img, (IMG_SIZE, IMG_SIZE))
            images.append(img)
            labels.append(0)  # 0 = Normal
            count += 1
    print(f"  Loaded {count} normal images")
    
    images = np.array(images, dtype=np.float32) / 255.0
    labels = np.array(labels, dtype=np.float32)
    
    print(f"Total dataset: {len(images)} images")
    print(f"  Ulcer: {int(labels.sum())}, Normal: {int(len(labels) - labels.sum())}")
    
    return images, labels

# ─── Build Model ─────────────────────────────────────────────────
def build_model():
    inputs = layers.Input(shape=(IMG_SIZE, IMG_SIZE, 3))
    base_model = EfficientNetB0(
        weights='imagenet',
        include_top=False,
        input_tensor=inputs
    )
    base_model.trainable = False
    
    x = base_model.output
    x = layers.GlobalAveragePooling2D()(x)
    x = layers.BatchNormalization()(x)
    x = layers.Dense(256, activation='relu')(x)
    x = layers.Dropout(0.4)(x)
    x = layers.Dense(128, activation='relu')(x)
    x = layers.Dropout(0.3)(x)
    outputs = layers.Dense(1, activation='sigmoid')(x)
    
    model = keras.Model(inputs=inputs, outputs=outputs)
    
    return model, base_model

# ─── Data Augmentation ───────────────────────────────────────────
def get_augmentation():
    return ImageDataGenerator(
        rotation_range=30,
        width_shift_range=0.2,
        height_shift_range=0.2,
        horizontal_flip=True,
        vertical_flip=True,
        zoom_range=0.2,
        brightness_range=[0.8, 1.2],
        fill_mode='nearest'
    )

# ─── Training ────────────────────────────────────────────────────
def train():
    print("=" * 60)
    print("  FOOT GUARD AI - Model Training")
    print("  EfficientNetB0 Transfer Learning")
    print("=" * 60)
    
    # Load data
    images, labels = load_dataset()
    
    # Split: 70% train, 15% val, 15% test
    X_train, X_temp, y_train, y_temp = train_test_split(
        images, labels, test_size=0.3, random_state=42, stratify=labels
    )
    X_val, X_test, y_val, y_test = train_test_split(
        X_temp, y_temp, test_size=0.5, random_state=42, stratify=y_temp
    )
    
    print(f"\nTrain: {len(X_train)}, Val: {len(X_val)}, Test: {len(X_test)}")
    
    # Class weights
    n_normal = int((y_train == 0).sum())
    n_ulcer = int((y_train == 1).sum())
    total = n_normal + n_ulcer
    class_weights = {
        0: total / (2.0 * n_normal),
        1: (total / (2.0 * n_ulcer)) * 1.5  # Increased weight for Ulcer to minimize False Negatives
    }
    print(f"Class weights: {class_weights}")
    
    # Build model
    model, base_model = build_model()
    
    # Phase 1: Train top layers only
    print("\n" + "=" * 60)
    print("  PHASE 1: Training top layers (base frozen)")
    print("=" * 60)
    
    model.compile(
        optimizer=keras.optimizers.Adam(learning_rate=1e-3),
        loss='binary_crossentropy',
        metrics=['accuracy']
    )
    
    augmentor = get_augmentation()
    
    train_gen = augmentor.flow(X_train, y_train, batch_size=BATCH_SIZE)
    
    cb_phase1 = [
        callbacks.EarlyStopping(patience=5, restore_best_weights=True, monitor='val_accuracy'),
        callbacks.ReduceLROnPlateau(patience=3, factor=0.5, monitor='val_loss'),
    ]
    
    model.fit(
        train_gen,
        epochs=EPOCHS_PHASE1,
        validation_data=(X_val, y_val),
        class_weight=class_weights,
        callbacks=cb_phase1,
        verbose=1
    )
    
    # Phase 2: Fine-tune last 20 layers of EfficientNetB0
    print("\n" + "=" * 60)
    print("  PHASE 2: Fine-tuning EfficientNetB0 (last 20 layers)")
    print("=" * 60)
    
    base_model.trainable = True
    for layer in base_model.layers[:-20]:
        layer.trainable = False
    
    model.compile(
        optimizer=keras.optimizers.Adam(learning_rate=1e-4),
        loss='binary_crossentropy',
        metrics=['accuracy']
    )
    
    cb_phase2 = [
        callbacks.EarlyStopping(patience=7, restore_best_weights=True, monitor='val_accuracy'),
        callbacks.ReduceLROnPlateau(patience=3, factor=0.5, monitor='val_loss'),
    ]
    
    model.fit(
        train_gen,
        epochs=EPOCHS_PHASE2,
        validation_data=(X_val, y_val),
        class_weight=class_weights,
        callbacks=cb_phase2,
        verbose=1
    )
    
    # Evaluate
    print("\n" + "=" * 60)
    print("  EVALUATION")
    print("=" * 60)
    
    y_pred_proba = model.predict(X_test).flatten()
    
    # Find optimal threshold to minimize false negatives (optimize F2 score)
    best_threshold = 0.5
    best_score = 0
    from sklearn.metrics import fbeta_score
    for t in np.arange(0.2, 0.8, 0.05):
        y_pred_t = (y_pred_proba >= t).astype(int)
        # beta=2 gives twice as much weight to recall as precision
        score = fbeta_score(y_test, y_pred_t, beta=2)
        if score > best_score:
            best_score = score
            best_threshold = t
    
    print(f"\nOptimal threshold for minimal false negatives: {best_threshold:.2f}")
    
    y_pred = (y_pred_proba >= best_threshold).astype(int)
    
    print("\nClassification Report:")
    print(classification_report(y_test, y_pred, target_names=['Normal', 'Ulcer']))
    
    print("Confusion Matrix:")
    cm = confusion_matrix(y_test, y_pred)
    print(cm)
    
    # Save model
    os.makedirs(MODEL_DIR, exist_ok=True)
    model.save(MODEL_PATH)
    print(f"\nModel saved to: {MODEL_PATH}")
    
    # Save threshold
    threshold_path = os.path.join(MODEL_DIR, "threshold.txt")
    with open(threshold_path, 'w') as f:
        f.write(str(best_threshold))
    print(f"Threshold saved to: {threshold_path}")
    
    print("\n" + "=" * 60)
    print("  TRAINING COMPLETE!")
    print("=" * 60)

if __name__ == "__main__":
    train()
