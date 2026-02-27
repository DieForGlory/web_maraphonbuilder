from flask import Flask
from flask_cors import CORS
from flask_sqlalchemy import SQLAlchemy
from flask_bcrypt import Bcrypt
from flask_jwt_extended import JWTManager

db = SQLAlchemy()
bcrypt = Bcrypt()
jwt = JWTManager()

def create_app():
    app = Flask(__name__)
    app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///marathon.db'
    app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
    app.config['JWT_SECRET_KEY'] = 'dev-secret-key-change-in-prod'

    CORS(app)
    db.init_app(app)
    bcrypt.init_app(app)
    jwt.init_app(app)

    # Импорт моделей ВНУТРИ контекста функции до создания таблиц
    from . import models

    # Импорт маршрутов ВНУТРИ функции для предотвращения циклического импорта
    from .routes.auth import auth_bp
    from .routes.builds import builds_bp
    from .routes.game_data import game_data_bp

    app.register_blueprint(auth_bp, url_prefix='/api/auth')
    app.register_blueprint(builds_bp, url_prefix='/api/builds')
    app.register_blueprint(game_data_bp, url_prefix='/api/data')

    with app.app_context():
        db.create_all()

    return app