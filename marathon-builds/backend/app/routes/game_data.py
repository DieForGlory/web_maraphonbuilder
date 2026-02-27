import json
import os
from flask import Blueprint, jsonify

game_data_bp = Blueprint('game_data', __name__)

def load_json(filename):
    filepath = os.path.join(os.path.dirname(__file__), '..', 'static_data', filename)
    try:
        with open(filepath, 'r') as f:
            return json.load(f)
    except FileNotFoundError:
        return []

@game_data_bp.route('/mods', methods=['GET'])
def get_mods():
    return jsonify(load_json('mods.json'))

@game_data_bp.route('/shells', methods=['GET'])
def get_shells():
    return jsonify(load_json('shells.json'))

@game_data_bp.route('/weapons', methods=['GET'])
def get_weapons():
    return jsonify(load_json('weapons.json'))

@game_data_bp.route('/implants', methods=['GET'])
def get_implants():
    return jsonify(load_json('implants.json'))