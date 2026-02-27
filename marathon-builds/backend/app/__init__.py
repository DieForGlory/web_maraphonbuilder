from flask import Flask, send_from_directory
from flask_sqlalchemy import SQLAlchemy
from flask_jwt_extended import JWTManager
from flask_cors import CORS
from flask_bcrypt import Bcrypt
import os

# Инициализация объектов расширений вне create_app для доступа из других модулей
db = SQLAlchemy()
bcrypt = Bcrypt()


def create_app():
    app = Flask(__name__)

    # Конфигурация базы данных и безопасности
    app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///' + os.path.join(app.instance_path, 'marathon.db')
    app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
    app.config['JWT_SECRET_KEY'] = 'super-secret-terminal-key'  # Смените в продакшене

    # Настройка путей для медиа-контента
    app.config['UPLOAD_FOLDER'] = os.path.join(app.root_path, 'static/uploads/highlights')
    app.config['THUMBNAIL_FOLDER'] = os.path.join(app.root_path, 'static/uploads/thumbnails')
    app.config['MAX_CONTENT_LENGTH'] = 50 * 1024 * 1024  # Лимит загрузки 50MB

    # Гарантируем наличие папок на диске
    os.makedirs(app.config['UPLOAD_FOLDER'], exist_ok=True)
    os.makedirs(app.config['THUMBNAIL_FOLDER'], exist_ok=True)
    try:
        os.makedirs(app.instance_path)
    except OSError:
        pass

    # Инициализация расширений
    db.init_app(app)
    bcrypt.init_app(app)
    JWTManager(app)

    # Настройка CORS для работы через туннели VS Code
    CORS(app, resources={r"/api/*": {"origins": "*"}})

    # Эндпоинты для раздачи статических файлов (Видео и Превью)
    @app.route('/uploads/highlights/<filename>')
    def uploaded_file(filename):
        return send_from_directory(app.config['UPLOAD_FOLDER'], filename)

    @app.route('/uploads/thumbnails/<filename>')
    def uploaded_thumbnail(filename):
        return send_from_directory(app.config['THUMBNAIL_FOLDER'], filename)

    # Регистрация Blueprints
    from .routes.auth import auth_bp
    from .routes.game_data import game_data_bp
    from .routes.builds import builds_bp
    from .routes.community import community_bp

    app.register_blueprint(auth_bp, url_prefix='/api/auth')
    app.register_blueprint(game_data_bp, url_prefix='/api/data')
    app.register_blueprint(builds_bp, url_prefix='/api/builds')
    app.register_blueprint(community_bp, url_prefix='/api/community')

    return app