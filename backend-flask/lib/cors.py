from flask_cors import CORS
import os


def init_cors(app):
    frontend = os.getenv("FRONTEND_URL")
    backend = os.getenv("BACKEND_URL")
    origins = [frontend, backend]
    cors = CORS(
        app,
        resources={r"/api/*": {"origins": origins}},
        headers=[
            "Content-Type",
            "Authorization",
            "traceparent",
            "if-modified-since",
            "x-current-user",
        ],
        expose_headers=["Authorization", "location", "link", "x-current-user"],
        methods="OPTIONS,GET,HEAD,POST",
    )
