import numpy as np
import tensorflow as tf
import cv2
import base64

def generate_gradcam(model, img_array, original_img, img_size=224):
    """Generate Grad-CAM heatmap for the prediction."""
    try:
        # Find last conv layer
        last_conv_layer = None
        for layer in reversed(model.layers):
            if isinstance(layer, tf.keras.layers.Conv2D):
                last_conv_layer = layer
                break
            if hasattr(layer, 'layers'):
                for sub_layer in reversed(layer.layers):
                    if isinstance(sub_layer, tf.keras.layers.Conv2D):
                        last_conv_layer = sub_layer
                        break
                if last_conv_layer:
                    break

        if last_conv_layer is None:
            # Try to find by name pattern
            for layer in model.layers:
                if 'conv' in layer.name.lower() and hasattr(layer, 'output'):
                    last_conv_layer = layer

        if last_conv_layer is None:
            return None

        # Build grad model
        grad_model = tf.keras.models.Model(
            inputs=model.input,
            outputs=[last_conv_layer.output, model.output]
        )

        with tf.GradientTape() as tape:
            conv_outputs, predictions = grad_model(img_array)
            loss = predictions[:, 0]

        grads = tape.gradient(loss, conv_outputs)

        if grads is None:
            return None

        pooled_grads = tf.reduce_mean(grads, axis=(0, 1, 2))
        conv_outputs = conv_outputs[0]
        heatmap = conv_outputs @ pooled_grads[..., tf.newaxis]
        heatmap = tf.squeeze(heatmap)
        heatmap = tf.maximum(heatmap, 0) / (tf.math.reduce_max(heatmap) + 1e-8)
        heatmap = heatmap.numpy()

        # Resize heatmap to original image size
        heatmap_resized = cv2.resize(heatmap, (img_size, img_size))
        heatmap_colored = cv2.applyColorMap(np.uint8(255 * heatmap_resized), cv2.COLORMAP_JET)

        # Overlay on original image
        original_resized = cv2.resize(original_img, (img_size, img_size))
        superimposed = cv2.addWeighted(original_resized, 0.6, heatmap_colored, 0.4, 0)

        # Encode to base64
        _, buffer = cv2.imencode('.jpg', superimposed)
        gradcam_base64 = base64.b64encode(buffer).decode('utf-8')
        return f"data:image/jpeg;base64,{gradcam_base64}"

    except Exception as e:
        print(f"Grad-CAM error: {e}")
        return None
