from redis import Redis
from rq import Queue, SimpleWorker
# import of jobs.py is implicit in the worker, as RQ will look for the function "analyze" in the "jobs" module when it tries to execute the first job.
# this means the model will be loaded, when the first job is executed, and not when the worker starts. This allows to start the worker without loading the model, which can be useful for testing or if the model is large and takes a long time to load. 
# but can also be explicitly imported here - then the model will be loaded when the worker starts, which can be useful if you want to have the model ready to process jobs immediately after the worker starts.
from jobs import analyze 


redis_connection = Redis(host="redis", port=6379)

if __name__ == "__main__":
    queue = Queue("default", connection=redis_connection)
    worker = SimpleWorker(queues=[queue], connection=redis_connection)
    print("Worker started, waiting for jobs...")
    worker.work()