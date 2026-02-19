
from typing import Callable, Any, Optional
from enum import Enum
import traceback

class CircuitState(str, Enum):
    CLOSED = "CLOSED" # Normal operation
    OPEN = "OPEN"     # Failed, blocked
    HALF_OPEN = "HALF_OPEN" # Testing recovery

class FailStrategy(str, Enum):
    FAIL_OPEN = "FAIL_OPEN"   # Allow traffic/default to SAFE
    FAIL_CLOSED = "FAIL_CLOSED" # Block traffic

class CircuitBreaker:
    """
    Protects system from cascading failures using defined strategies.
    
    INVARIANTS:
    - Availability > Accuracy.
    """
    
    def __init__(self, name: str, strategy: FailStrategy, failure_threshold: int = 5):
        self.name = name
        self.strategy = strategy
        self.failure_threshold = failure_threshold
        self.failure_count = 0
        self.state = CircuitState.CLOSED
        self.last_failure_error = None

    def execute(self, func: Callable, *args, **kwargs) -> Any:
        """
        Executes func protected by circuit.
        """
        if self.state == CircuitState.OPEN:
            return self._handle_open()

        try:
            result = func(*args, **kwargs)
            # Success - reset
            if self.state == CircuitState.HALF_OPEN:
                self.state = CircuitState.CLOSED
            self.failure_count = 0
            return result
        except Exception as e:
            self.failure_count += 1
            self.last_failure_error = str(e)
            print(f"Circuit {self.name} failure {self.failure_count}/{self.failure_threshold}: {e}")
            if self.failure_count >= self.failure_threshold:
                self.state = CircuitState.OPEN
                print(f"Circuit {self.name} OPENED.")
            return self._handle_open()

    def _handle_open(self) -> Any:
        # Fallback based on strategy
        if self.strategy == FailStrategy.FAIL_OPEN:
            print(f"[{self.name}] FAIL-OPEN: Returning default safe value.")
            # We need to know what the return type/value should be.
            # For this generic CB, we might return None or raise specific Fallback exception.
            # Or assume caller handles None.
            return None 
        else:
            print(f"[{self.name}] FAIL-CLOSED: Raising error.")
            raise RuntimeError(f"Circuit {self.name} is OPEN (Fail-Closed).")
