import time

class BlinkDetector:
    def __init__(self):
        self.blink_count = 0
        self.eye_closed = False
        self.start_time = time.time()

    def update(self, ear):
        threshold = 0.2

        if ear < threshold:
            if not self.eye_closed:
                self.eye_closed = True
        else:
            if self.eye_closed:
                self.blink_count += 1
                self.eye_closed = False

    def get_blink_rate(self):
        elapsed = time.time() - self.start_time
        if elapsed == 0:
            return 0
        return (self.blink_count / elapsed) * 60

    def get_state(self):
        rate = self.get_blink_rate()

        if rate < 8:
            return "DROWSY" ##경고창 띄움 경고 단계
        elif rate < 15:
            return "LOW_FOCUS" ##경고창 띄움 주의단계
        else:
            return "NORMAL"
