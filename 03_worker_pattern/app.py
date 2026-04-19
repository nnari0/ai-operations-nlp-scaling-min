from fastapi import FastAPI
from pydantic import BaseModel
from redis import Redis
from rq import Queue

app = FastAPI()
q = Queue("default", connection=Redis(host="redis", port=6379))


class RequestData(BaseModel):
    text: str


@app.post("/predict-async")
async def predict_async(data: RequestData):
    # TODO: Enqueue the prediction task to the worker queue
    pass


@app.get("/status/{job_id}")
async def get_status(job_id: str):
    # TODO: Check the status of the job in the worker queue and return the result if available
    pass
