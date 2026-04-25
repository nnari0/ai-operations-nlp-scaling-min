import socket

from fastapi import FastAPI
from pydantic import BaseModel
from redis import Redis
from rq import Queue


app = FastAPI()
q = Queue("default", connection=Redis(host="redis", port=6379))

HOSTNAME = socket.gethostname() # get the hostname of the container, which is the name of the container in docker-compose

class RequestData(BaseModel):
    text: str


@app.post("/predict-async")
async def predict_async(data: RequestData):
    #  Enqueue the prediction task to the worker queue
    job = q.enqueue("jobs.analyze", data.text)
    return {"job_id": job.id, "status": "queued", "served_by": HOSTNAME}


@app.get("/status/{job_id}")
async def get_status(job_id: str):
    # Check the status of the job in the worker queue and return the result if available
    job = q.fetch_job(job_id)

    if job is None:
        return {"error": "Job not found"}
    elif job.is_finished:
        return {"job_id": job.id,
                "status": "finished",
                "result": job.result
                }
    elif job.is_failed:
        return {"job_id": job.id,
                "status": "failed"
                }
    else:
        return {"job_id": job.id,
                "status": "queued/running"
                }

@app.get("/health")
async def health():
    return {"redis": q.connection.ping(), "queue_length": len(q), "served_by": HOSTNAME}