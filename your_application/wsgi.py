from app import app

# Gunicorn default callable when command is `gunicorn your_application.wsgi`
# is `application`, so we expose both names.
application = app
