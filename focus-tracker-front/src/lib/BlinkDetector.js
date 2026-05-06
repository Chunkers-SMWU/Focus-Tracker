export class BlinkDetector {
    constructor() {
        this.eyeClosed = false;
        this.blinkTimestamps = []; // 깜빡임 발생 시각 저장
        this.WINDOW = 60; // 최근 60초 기준
    }

    update(ear) {
        const threshold = 0.2;

        if (ear < threshold) {
            if (!this.eyeClosed) {
                this.eyeClosed = true;
            }
        } else {
            if (this.eyeClosed) {
                this.blinkTimestamps.push(Date.now() / 1000); // 초 단위
                this.eyeClosed = false;
            }
        }

        // 60초 이전 데이터 제거
        const now = Date.now() / 1000;
        this.blinkTimestamps = this.blinkTimestamps.filter(
            (t) => now - t <= this.WINDOW,
        );
    }

    getBlinkRate() {
        return this.blinkTimestamps.length; // 최근 60초 안의 깜빡임 횟수
    }

    getState() {
        if (this.blinkTimestamps.length === 0) return "MEASURING";
        const rate = this.getBlinkRate();
        if (rate < 6) return "DROWSY";
        if (rate < 12) return "LOW_FOCUS";
        return "NORMAL";
    }

    getBlinkCount() {
        return this.blinkTimestamps.length;
    }
}
