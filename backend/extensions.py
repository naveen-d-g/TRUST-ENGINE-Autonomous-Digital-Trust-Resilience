from flask_sqlalchemy import SQLAlchemy
from flask_cors import CORS
from flask_limiter import Limiter
from flask_limiter.util import get_remote_address

from flask_socketio import SocketIO

db = SQLAlchemy()
cors = CORS()
limiter = Limiter(key_func=get_remote_address)
socketio = SocketIO(cors_allowed_origins="*", async_mode='threading') # Force threading to avoid eventlet blocking issues in dev
