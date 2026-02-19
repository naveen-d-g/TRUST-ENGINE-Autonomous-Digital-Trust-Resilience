import threading
import concurrent.futures
import logging
from typing import Callable, Any

logger = logging.getLogger(__name__)

class AsyncDispatcher:
    """
    Manages background thread pool for orchestration tasks.
    Ensures main request thread returns immediately.
    """
    _executor = concurrent.futures.ThreadPoolExecutor(max_workers=5, thread_name_prefix="Orchestrator")

    @classmethod
    def fire_and_forget(cls, task_name: str, func: Callable, *args, **kwargs):
        """
        Submits a task to the background pool.
        Log errors if they occur (via future callback).
        """
        def wrapper():
            try:
                logger.info(f"Starting async task: {task_name}")
                func(*args, **kwargs)
                logger.info(f"Completed async task: {task_name}")
            except Exception as e:
                logger.error(f"Error in async task {task_name}: {str(e)}", exc_info=True)

        cls._executor.submit(wrapper)

    @classmethod
    def shutdown(cls):
        cls._executor.shutdown(wait=True)
