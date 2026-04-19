FROM python:3.11-slim

WORKDIR /app

# Python deps
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Pre-download der Modelle in den Container-Cache.
# So muss nicht bei jedem Container-Start neu gezogen werden.
RUN python -c "from transformers import pipeline; \
    pipeline('sentiment-analysis', \
    model='tabularisai/multilingual-sentiment-analysis')"

RUN python -c "from transformers import T5ForConditionalGeneration, T5Tokenizer; \
    T5Tokenizer.from_pretrained('google/flan-t5-base'); \
    T5ForConditionalGeneration.from_pretrained('google/flan-t5-base')"
