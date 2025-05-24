import os
from werkzeug.utils import secure_filename
from flask import current_app

ALLOWED_EXTENSIONS = {'pdf'}

def allowed_file(filename: str) -> bool:
    """Check if file extension is allowed"""
    return '.' in filename and \
           filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS

def save_uploaded_file(file) -> Union[str, None]:
    """Save uploaded file and return its URL"""
    try:
        if file and allowed_file(file.filename):
            filename = secure_filename(file.filename)
            
            # Create upload directory if it doesn't exist
            upload_dir = os.path.join(current_app.root_path, 'uploads')
            if not os.path.exists(upload_dir):
                os.makedirs(upload_dir)
            
            # Save file
            filepath = os.path.join(upload_dir, filename)
            file.save(filepath)
            
            # Return URL
            return f'http://localhost:5000/uploads/{filename}'
            
        return None
        
    except Exception as e:
        print(f"File save error: {str(e)}")
        return None