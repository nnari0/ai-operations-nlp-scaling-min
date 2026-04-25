import socket

from fastapi import FastAPI
from pydantic import BaseModel
from redis import Redis
from rq import Queue
from transformers import T5ForConditionalGeneration, T5Tokenizer


tokenizer = T5Tokenizer.from_pretrained("google/flan-t5-base")
model = T5ForConditionalGeneration.from_pretrained("google/flan-t5-base")


app = FastAPI()

HOSTNAME = socket.gethostname() # get the hostname of the container, which is the name of the container in docker-compose

class RequestData(BaseModel):
    text: str

@app.post("/predict")
async def predict(data: RequestData):
    input_text = f"translate German to English: {data.text}"
    input_ids = tokenizer(input_text, return_tensors="pt").input_ids
    outputs = model.generate(input_ids)
    translated_text = tokenizer.decode(outputs[0], skip_special_tokens=True)
    return {"translated_text": translated_text}



@app.get("/health")
async def health():
    return {"served_by": HOSTNAME}