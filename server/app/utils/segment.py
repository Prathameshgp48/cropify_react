import cv2
import numpy as np

def process_leaf_image(image_path):
    """
    Processes a leaf image by removing the background and highlighting diseased areas.

    Args:
        image_path (str): Path to the leaf image.

    Returns:
        tuple: (background_removed, disease_highlighted)
    """
    # Load the image
    image = cv2.imread(image_path)

    if image is None:
        raise ValueError("Error: Image not found or invalid path")

    # Resize for easier processing
    image = cv2.resize(image, (600, 400))

    # Apply GrabCut for background removal
    mask = np.zeros(image.shape[:2], np.uint8)
    bgd_model = np.zeros((1, 65), np.float64)
    fgd_model = np.zeros((1, 65), np.float64)
    rect = (10, 10, image.shape[1] - 10, image.shape[0] - 10)

    cv2.grabCut(image, mask, rect, bgd_model, fgd_model, 5, cv2.GC_INIT_WITH_RECT)

    # Refine the mask
    mask2 = np.where((mask == 2) | (mask == 0), 0, 1).astype('uint8')
    background_removed = image * mask2[:, :, np.newaxis]

    # Convert to HSV for disease highlighting
    hsv = cv2.cvtColor(background_removed, cv2.COLOR_BGR2HSV)

    # Define color range for disease detection (brown/yellow patches)
    lower_disease = np.array([10, 100, 20])
    upper_disease = np.array([30, 255, 255])
    disease_mask = cv2.inRange(hsv, lower_disease, upper_disease)

    # Apply morphological operations to reduce noise
    kernel = np.ones((5, 5), np.uint8)
    disease_mask = cv2.morphologyEx(disease_mask, cv2.MORPH_CLOSE, kernel)

    # Highlight diseased areas in red
    disease_highlighted = background_removed.copy()
    disease_highlighted[disease_mask > 0] = [0, 0, 255]

    return background_removed, disease_highlighted  # ✅ Returns both processed images

# Example usage
if __name__ == "__main__":
    bg_removed, disease_highlighted = process_leaf_image("leaf2.jpeg")

    cv2.imshow("Background Removed", bg_removed)
    cv2.imshow("Disease Highlighted", disease_highlighted)
    
    cv2.waitKey(0)
    cv2.destroyAllWindows()
