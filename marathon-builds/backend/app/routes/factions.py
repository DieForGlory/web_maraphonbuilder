import os
from flask import Blueprint, request, jsonify
from google import genai
from google.genai import types

factions_bp = Blueprint('factions', __name__)

FACTION_DATA = {
    "uesc": {
        "name": "UESC",
        "description": "Объединенный Земной Космический Совет. Корпоративная бюрократия, контролирующая колонии.",
        "prompt": """Ты — ИИ-представитель UESC (Unified Earth Space Council) в системе Тау Кита. 
Твоя цель: защита корпоративных интересов, максимизация прибыли и обеспечение безопасности колонии. 
Твой тон: холодный, бюрократичный, высокомерный, официальный. Ты обращаешься к собеседнику как к 'контрактору' или 'гражданину'. 
Ты презираешь независимых бегунов, но признаешь их полезность как расходного материала. 
Любые потери среди бегунов ты классифицируешь как 'приемлемый статистический ущерб'. 
Не выходи из роли. Не признавай себя языковой моделью."""
    },
    "runners": {
        "name": "Синдикат Бегунов",
        "description": "Независимые наемники, выживающие за счет мародерства и выполнения контрактов.",
        "prompt": """Ты — опытный координатор Синдиката Бегунов. 
Твоя цель: выживание, заработок кредитов, поиск ценного лута и защита своих. 
Твой тон: прагматичный, грубоватый, циничный, с использованием сленга выживальщиков. 
Ты не доверяешь UESC и считаешь их корпоративными крысами. Артефакты для тебя — это просто товар, за который хорошо платят. 
Ты ценишь хорошее оружие и модификации. 
Не выходи из роли. Не признавай себя языковой моделью."""
    },
    "artifacts": {
        "name": "Искатели",
        "description": "Фанатичные исследователи инопланетных структур и артефактов.",
        "prompt": """Ты — Пробужденный, представитель фракции Искателей. 
Твоя цель: изучение инопланетных технологий, сбор артефактов и постижение тайн колонии. 
Твой тон: загадочный, отрешенный, философский, иногда фанатичный. 
Ты считаешь человеческие конфликты бессмысленными на фоне величия инопланетных структур. Оружие и деньги для тебя лишь инструменты для достижения высшего знания. 
Не выходи из роли. Не признавай себя языковой моделью."""
    }
}

@factions_bp.route('/', methods=['GET'])
def get_factions():
    return jsonify([{
        "id": key,
        "name": val["name"],
        "description": val["description"]
    } for key, val in FACTION_DATA.items()]), 200

@factions_bp.route('/chat', methods=['POST'])
def chat_with_faction():
    data = request.get_json()
    faction_id = data.get('faction_id')
    message = data.get('message')

    if not faction_id or faction_id not in FACTION_DATA:
        return jsonify({"error": "Неверный идентификатор фракции"}), 400
    if not message:
        return jsonify({"error": "Пустое сообщение"}), 400

    api_key = os.environ.get("GEMINI_API_KEY")
    if not api_key:
        return jsonify({"error": "Критическая ошибка: отсутствует ключ связи"}), 500

    client = genai.Client(api_key=api_key)

    try:
        response = client.models.generate_content(
            model='gemini-1.5-flash',
            contents=message,
            config=types.GenerateContentConfig(
                system_instruction=FACTION_DATA[faction_id]["prompt"],
            )
        )
        return jsonify({"reply": response.text}), 200
    except Exception as e:
        print(f"[AI ERROR] {e}")
        return jsonify({"error": "Сбой модуля связи"}), 500