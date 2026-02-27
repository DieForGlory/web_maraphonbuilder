import os
import cv2  # Библиотека OpenCV-python-headless
from flask import Blueprint, jsonify, request, current_app
from flask_jwt_extended import jwt_required, get_jwt_identity
from werkzeug.utils import secure_filename
from ..models import db, Highlight, Lore, User

community_bp = Blueprint('community', __name__)

ALLOWED_EXTENSIONS = {'mp4', 'webm', 'mov'}


def allowed_file(filename):
    return '.' in filename and filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS


def generate_thumbnail_opencv(video_path, thumbnail_path):
    """Генерация скриншота из видео без внешних утилит"""
    try:
        vidcap = cv2.VideoCapture(video_path)
        # Смещаемся на 1000мс (1 секунда), чтобы не захватить черный кадр в начале
        vidcap.set(cv2.CAP_PROP_POS_MSEC, 1000)

        success, image = vidcap.read()
        if success:
            # Записываем изображение на диск в формате JPG
            cv2.imwrite(thumbnail_path, image)
            vidcap.release()
            return True

        vidcap.release()
        return False
    except Exception as e:
        print(f"[SYSTEM ERROR] OpenCV Thumbnail fail: {e}")
        return False


@community_bp.route('/highlights', methods=['POST'])
@jwt_required()
def upload_highlight():
    if 'video' not in request.files:
        return jsonify({"error": "Видеофайл не обнаружен"}), 400

    file = request.files['video']
    title = request.form.get('title')
    description = request.form.get('description', '')

    if not title:
        return jsonify({"error": "Необходимо указать заголовок"}), 400

    if file and allowed_file(file.filename):
        filename = secure_filename(file.filename)
        user_id = get_jwt_identity()

        # Формируем уникальные имена для видео и превью
        video_filename = f"user_{user_id}_{filename}"
        thumb_filename = f"thumb_{video_filename.rsplit('.', 1)[0]}.jpg"

        video_path = os.path.join(current_app.config['UPLOAD_FOLDER'], video_filename)
        thumb_path = os.path.join(current_app.config['THUMBNAIL_FOLDER'], thumb_filename)

        # Сохранение видеофайла
        file.save(video_path)

        # Генерация превью
        thumb_url = None
        if generate_thumbnail_opencv(video_path, thumb_path):
            thumb_url = f"/uploads/thumbnails/{thumb_filename}"

        # Запись в базу данных
        new_h = Highlight(
            user_id=user_id,
            title=title,
            video_url=f"/uploads/highlights/{video_filename}",
            thumbnail_url=thumb_url,
            description=description
        )
        db.session.add(new_h)
        db.session.commit()

        return jsonify({"message": "Передача завершена успешно"}), 201

    return jsonify({"error": "Неподдерживаемый протокол/формат файла"}), 400


@community_bp.route('/highlights', methods=['GET'])
def get_highlights():
    highlights = Highlight.query.order_by(Highlight.created_at.desc()).all()
    result = []
    for h in highlights:
        author = User.query.get(h.user_id)
        result.append({
            "id": h.id,
            "title": h.title,
            "video_url": h.video_url,
            "thumbnail_url": h.thumbnail_url,
            "description": h.description,
            "author": author.username if author else "Unknown User"
        })
    return jsonify(result)


@community_bp.route('/lore', methods=['GET'])
def get_lore():
    all_lore = Lore.query.order_by(Lore.created_at.desc()).all()
    return jsonify([{
        "id": l.id,
        "category": l.category,
        "title": l.title,
        "content": l.content,
        "image": l.image_url
    } for l in all_lore])