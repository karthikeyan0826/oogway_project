import json
import logging
import sys
from datetime import datetime, timezone
from typing import Any, Dict

class JSONFormatter(logging.Formatter):
    """
    Format logs as structured JSON objects for enterprise observability.
    """
    def format(self, record: logging.LogRecord) -> str:
        log_obj: Dict[str, Any] = {
            "timestamp": datetime.now(timezone.utc).isoformat(),
            "level": record.levelname,
            "message": record.getMessage(),
            "logger": record.name,
            "module": record.module,
            "line": record.lineno,
        }
        
        if record.exc_info:
            log_obj["exception"] = self.formatException(record.exc_info)
            
        # Include custom extra attributes
        for key, value in record.__dict__.items():
            if key not in {
                "name", "msg", "args", "levelname", "levelno", "pathname", "filename",
                "module", "exc_info", "exc_text", "stack_info", "lineno", "funcName",
                "created", "msecs", "relativeCreated", "thread", "threadName",
                "processName", "process", "message"
            }:
                log_obj[key] = value
                
        return json.dumps(log_obj)

def get_logger(name: str = "lenny_growth") -> logging.Logger:
    logger = logging.getLogger(name)
    if not logger.handlers:
        handler = logging.StreamHandler(sys.stdout)
        handler.setFormatter(JSONFormatter())
        logger.addHandler(handler)
        logger.setLevel(logging.INFO)
    return logger

logger = get_logger()
