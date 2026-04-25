from scaling-base

COPY app.py ./

CMD ["uvicorn", "app:app", "--host", "0.0.0.0", "--port", "8000"]
# host 0.0.0.0 defines to listen on all interfaces, not just localhost. This is necessary for the container to be accessible from outside.
