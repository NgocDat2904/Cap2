import cloudinary
import cloudinary.uploader

cloudinary.config(
    cloud_name="dgtorvkrx",
    api_key="292189656377817",
    api_secret="Gbt-bdaTq6zetshhvfUpVBTEcAo"
)

def upload_image(file):
    result = cloudinary.uploader.upload(file)
    return result["secure_url"]