import cloudinary
import cloudinary.uploader

cloudinary.config(
    cloud_name="your_cloud_name",
    api_key="your_api_key",
    api_secret="your_api_secret"
)

def upload_image(file):
    result = cloudinary.uploader.upload(file)
    return result["secure_url"]