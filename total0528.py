import cv2
import mediapipe as mp
import time
import math
import numpy as np
import threading
from typing import Dict, Any
from PIL import ImageFont, ImageDraw, Image
from eyeblink import BlinkDetector

# ==============================
# 0) 브라우저 활동 수신용 FastAPI 서버
# ==============================
# 실행하면 이 파이썬 파일 안에서 http://127.0.0.1:5000 서버가 같이 켜짐.
# Chrome extension background.js가 /tab-activity로 탭 활동을 POST하면 이 코드가 누적함.
try:
    from fastapi import FastAPI
    from fastapi.middleware.cors import CORSMiddleware
    from pydantic import BaseModel
    import uvicorn
    FASTAPI_AVAILABLE = True
except Exception:
    FASTAPI_AVAILABLE = False

FOCUS_TRACKER_ORIGIN = "http://localhost:5173"
SHORT_SWITCH_INTERVAL_SEC = 5

browser_lock = threading.Lock()

browser_state = {
    "tab_switch_count": 0,              # 탭 전환 횟수
    "tab_left_total_time": 0.0,         # Focus Tracker 기준 탭 이탈 누적 시간
    "short_interval_switch_count": 0,   # 짧은 간격의 반복 전환 횟수
    "blocked_access_count": 0,          # 허용되지 않은 사이트 접속 시도 횟수
    "last_event_time": None,
    "last_switch_time": None,
    "left_start_time": None,
    "current_url": "",
}


def reset_browser_state():
    with browser_lock:
        browser_state.update({
            "tab_switch_count": 0,
            "tab_left_total_time": 0.0,
            "short_interval_switch_count": 0,
            "blocked_access_count": 0,
            "last_event_time": None,
            "last_switch_time": None,
            "left_start_time": None,
            "current_url": "",
        })


def get_browser_values():
    """현재 진행 중인 탭 이탈 시간까지 반영해서 브라우저 지표 반환."""
    now = time.time()
    with browser_lock:
        values = dict(browser_state)
        if values["left_start_time"] is not None:
            values["tab_left_total_time"] += now - values["left_start_time"]
        return values


def update_browser_activity(url: str, blocked: bool, event_type: str = "TAB_CHANGED"):
    now = time.time()
    is_focus_tracker = bool(url and url.startswith(FOCUS_TRACKER_ORIGIN))

    with browser_lock:
        browser_state["current_url"] = url or ""
        browser_state["last_event_time"] = now

        # 탭 변경 이벤트 카운트
        if event_type == "TAB_CHANGED":
            browser_state["tab_switch_count"] += 1

            if browser_state["last_switch_time"] is not None:
                dt = now - browser_state["last_switch_time"]
                if dt <= SHORT_SWITCH_INTERVAL_SEC:
                    browser_state["short_interval_switch_count"] += 1

            browser_state["last_switch_time"] = now

        # 차단 사이트 접속 시도 카운트
        if blocked:
            browser_state["blocked_access_count"] += 1

        # Focus Tracker 기준 탭 이탈 시간 누적
        if is_focus_tracker:
            if browser_state["left_start_time"] is not None:
                browser_state["tab_left_total_time"] += now - browser_state["left_start_time"]
                browser_state["left_start_time"] = None
        else:
            if browser_state["left_start_time"] is None:
                browser_state["left_start_time"] = now


if FASTAPI_AVAILABLE:
    app = FastAPI()
    app.add_middleware(
        CORSMiddleware,
        allow_origins=["*"],
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )

    class TabActivity(BaseModel):
        type: str = "TAB_CHANGED"
        url: str = ""
        blocked: bool = False
        timestamp: float | None = None

    @app.get("/")
    def health_check():
        return {"status": "running", "message": "Focus Tracker Python server is running"}

    @app.get("/browser-state")
    def browser_state_api():
        return get_browser_values()

    @app.post("/tab-activity")
    def tab_activity_api(payload: TabActivity):
        update_browser_activity(payload.url, payload.blocked, payload.type)
        return {"ok": True, "browser_state": get_browser_values()}

    @app.post("/reset-browser")
    def reset_browser_api():
        reset_browser_state()
        return {"ok": True}


def start_browser_server():
    if not FASTAPI_AVAILABLE:
        print("[경고] fastapi/uvicorn이 설치되어 있지 않아 브라우저 서버를 실행하지 않습니다.")
        print("      설치: pip install fastapi uvicorn")
        return

    config = uvicorn.Config(app, host="127.0.0.1", port=5000, log_level="warning")
    server = uvicorn.Server(config)
    thread = threading.Thread(target=server.run, daemon=True)
    thread.start()
    print("[브라우저 서버 실행] http://127.0.0.1:5000")


# ==============================
# 1) 웹캠 기반 계산 함수
# ==============================
mp_face_mesh = mp.solutions.face_mesh
mp_drawing = mp.solutions.drawing_utils
mp_drawing_styles = mp.solutions.drawing_styles


def calculate_ear(landmarks, eye_indices):
    left_point = landmarks[eye_indices[0]]
    right_point = landmarks[eye_indices[3]]
    top_mid = ((landmarks[eye_indices[1]].x + landmarks[eye_indices[2]].x) / 2,
               (landmarks[eye_indices[1]].y + landmarks[eye_indices[2]].y) / 2)
    bottom_mid = ((landmarks[eye_indices[4]].x + landmarks[eye_indices[5]].x) / 2,
                  (landmarks[eye_indices[4]].y + landmarks[eye_indices[5]].y) / 2)
    horizontal_length = ((left_point.x - right_point.x) ** 2 + (left_point.y - right_point.y) ** 2) ** 0.5
    vertical_length = ((top_mid[0] - bottom_mid[0]) ** 2 + (top_mid[1] - bottom_mid[1]) ** 2) ** 0.5
    if horizontal_length == 0:
        return 0
    return vertical_length / horizontal_length


def calculate_mar(landmarks, mouth_indices):
    top_mid = ((landmarks[mouth_indices[0]].x + landmarks[mouth_indices[1]].x) / 2,
               (landmarks[mouth_indices[0]].y + landmarks[mouth_indices[1]].y) / 2)
    bottom_mid = ((landmarks[mouth_indices[2]].x + landmarks[mouth_indices[3]].x) / 2,
                  (landmarks[mouth_indices[2]].y + landmarks[mouth_indices[3]].y) / 2)
    left_point = landmarks[mouth_indices[4]]
    right_point = landmarks[mouth_indices[5]]
    horizontal_length = ((left_point.x - right_point.x) ** 2 + (left_point.y - right_point.y) ** 2) ** 0.5
    vertical_length = ((top_mid[0] - bottom_mid[0]) ** 2 + (top_mid[1] - bottom_mid[1]) ** 2) ** 0.5
    if horizontal_length == 0:
        return 0
    return vertical_length / horizontal_length


def calculate_head_pose(image, landmarks):
    h, w = image.shape[:2]
    image_points = np.array([
        (landmarks[1].x * w, landmarks[1].y * h),
        (landmarks[152].x * w, landmarks[152].y * h),
        (landmarks[33].x * w, landmarks[33].y * h),
        (landmarks[263].x * w, landmarks[263].y * h),
        (landmarks[61].x * w, landmarks[61].y * h),
        (landmarks[291].x * w, landmarks[291].y * h)
    ], dtype="double")

    model_points = np.array([
        (0.0, 0.0, 0.0),
        (0.0, -63.6, -12.5),
        (-43.3, 32.7, -26.0),
        (43.3, 32.7, -26.0),
        (-28.9, -28.9, -24.1),
        (28.9, -28.9, -24.1)
    ])

    focal_length = w
    center = (w / 2, h / 2)
    camera_matrix = np.array([
        [focal_length, 0, center[0]],
        [0, focal_length, center[1]],
        [0, 0, 1]
    ], dtype="double")

    dist_coeffs = np.zeros((4, 1))
    success, rotation_vector, translation_vector = cv2.solvePnP(
        model_points, image_points, camera_matrix, dist_coeffs, flags=cv2.SOLVEPNP_ITERATIVE
    )
    if not success:
        return 0.0, 0.0, 0.0

    rotation_matrix, _ = cv2.Rodrigues(rotation_vector)
    sy = math.sqrt(rotation_matrix[0, 0] ** 2 + rotation_matrix[1, 0] ** 2)
    pitch = math.degrees(math.atan2(-rotation_matrix[2, 0], sy))
    yaw = math.degrees(math.atan2(rotation_matrix[1, 0], rotation_matrix[0, 0]))
    roll = math.degrees(math.atan2(rotation_matrix[2, 1], rotation_matrix[2, 2]))
    return pitch, yaw, roll


def load_font(size):
    try:
        return ImageFont.truetype("malgun.ttf", size)
    except Exception:
        return ImageFont.load_default()


def ratio_score(value, threshold):
    if threshold <= 0:
        return 0
    return min((float(value) / threshold) * 100, 100)


def low_blink_score(blink_rate, min_blink_rate, blink_valid):
    if not blink_valid:
        return 0
    return max(((min_blink_rate - blink_rate) / min_blink_rate) * 100, 0)


def is_violation(value, threshold, op):
    if op == ">":
        return value > threshold
    if op == ">=":
        return value >= threshold
    if op == "<":
        return value < threshold
    if op == "<=":
        return value <= threshold
    return False


# ==============================
# 2) 모드별 기준/가중치
# ==============================
# 총점 100점 = 웹캠 점수 + 브라우저 점수
# 각 모드별 weights의 합은 1.0이 되도록 설정.
MODE_CONFIGS: Dict[str, Dict[str, Any]] = {
    "강의시청": {
        "criteria": {
            # Browser
            "탭 이탈 누적시간": {"source": "browser", "value_key": "tab_left_total_time", "threshold": 300, "op": ">="},
            "짧은 간격 반복전환": {"source": "browser", "value_key": "short_interval_switch_count", "threshold": 1, "op": ">="},
            "허용되지 않은 창 접속": {"source": "browser", "value_key": "blocked_access_count", "threshold": 1, "op": ">="},
            # Webcam
            "얼굴 부재": {"source": "webcam", "value_key": "face_absence_duration", "threshold": 10, "op": ">"},
            "고개 방향": {"source": "webcam", "value_key": "head_direction_count", "threshold": 3, "op": ">"},
            "눈 감김": {"source": "webcam", "value_key": "closed_duration", "threshold": 0.5, "op": ">="},
            "깜빡임 부족": {"source": "webcam", "value_key": "blink_rate", "threshold": 8, "op": "<"},
        },
        "weights": {
            "탭 이탈 누적시간": 0.15,
            "짧은 간격 반복전환": 0.10,
            "허용되지 않은 창 접속": 0.15,
            "얼굴 부재": 0.15,
            "고개 방향": 0.15,
            "눈 감김": 0.20,
            "깜빡임 부족": 0.10,
        }
    },
    "자료검색": {
        "criteria": {
            # Browser
            "허용되지 않은 창 접속": {"source": "browser", "value_key": "blocked_access_count", "threshold": 1, "op": ">="},
            # Webcam
            "고개 방향": {"source": "webcam", "value_key": "head_direction_count", "threshold": 3, "op": ">"},
            "눈 감김": {"source": "webcam", "value_key": "closed_duration", "threshold": 0.5, "op": ">="},
            "깜빡임 부족": {"source": "webcam", "value_key": "blink_rate", "threshold": 8, "op": "<"},
        },
        "weights": {
            "허용되지 않은 창 접속": 0.25,
            "고개 방향": 0.20,
            "눈 감김": 0.35,
            "깜빡임 부족": 0.20,
        }
    },
    "잠금": {
        "criteria": {
            # Browser
            "탭 전환 횟수": {"source": "browser", "value_key": "tab_switch_count", "threshold": 1, "op": ">="},
            "탭 이탈 누적시간": {"source": "browser", "value_key": "tab_left_total_time", "threshold": 10, "op": ">="},
            "짧은 간격 반복전환": {"source": "browser", "value_key": "short_interval_switch_count", "threshold": 1, "op": ">="},
            "허용되지 않은 창 접속": {"source": "browser", "value_key": "blocked_access_count", "threshold": 1, "op": ">="},
            # Webcam
            "하품": {"source": "webcam", "value_key": "yawn_count", "threshold": 1, "op": ">="},
            "얼굴 부재": {"source": "webcam", "value_key": "face_absence_duration", "threshold": 10, "op": ">="},
            "고개 방향": {"source": "webcam", "value_key": "head_direction_count", "threshold": 2, "op": ">"},
            "눈 감김": {"source": "webcam", "value_key": "closed_duration", "threshold": 0.5, "op": ">="},
            "깜빡임 부족": {"source": "webcam", "value_key": "blink_rate", "threshold": 8, "op": "<"},
        },
        "weights": {
            "탭 전환 횟수": 0.10,
            "탭 이탈 누적시간": 0.10,
            "짧은 간격 반복전환": 0.10,
            "허용되지 않은 창 접속": 0.10,
            "하품": 0.10,
            "얼굴 부재": 0.10,
            "고개 방향": 0.10,
            "눈 감김": 0.20,
            "깜빡임 부족": 0.10,
        }
    }
}

def calculate_integrated_score(mode, webcam_values, browser_values, blink_valid):
    config = MODE_CONFIGS[mode]
    item_scores = {}
    violations = []

    for name, rule in config["criteria"].items():
        source_values = browser_values if rule["source"] == "browser" else webcam_values
        value = source_values.get(rule["value_key"], 0)
        threshold = rule["threshold"]
        op = rule["op"]

        if name == "깜빡임 부족":
            score = low_blink_score(value, threshold, blink_valid)
            violated = blink_valid and is_violation(value, threshold, op)
        else:
            score = ratio_score(value, threshold)
            violated = is_violation(value, threshold, op)

        item_scores[name] = score
        if violated:
            violations.append(name)

    total_score = sum(item_scores.get(name, 0) * weight for name, weight in config["weights"].items())

    if total_score < 30:
        status = "정상"
    elif total_score < 50:
        status = "주의"
    elif total_score < 70:
        status = "경고"
    else:
        status = "위험"

    return total_score, status, item_scores, violations


def reset_webcam_counts():
    return {
        "closed_eyes_frame_count": 0,
        "open_mouth_frame_count": 0,
        "yawn_count": 0,
        "yawn_detected": False,
        "head_direction_count": 0,
        "head_direction_changed": False,
        "face_absence_start_time": None,
        "face_absence_duration": 0,
        "eye_close_start_time": None,
        "closed_duration": 0,
    }


def draw_texts(image, lines, start_x=30, start_y=25, gap=36, font_size=24, color=(0, 0, 255)):
    pil_image = Image.fromarray(image)
    draw = ImageDraw.Draw(pil_image)
    font = load_font(font_size)
    y = start_y
    for line in lines:
        draw.text((start_x, y), line, font=font, fill=color)
        y += gap
    return np.array(pil_image)


# ==============================
# 3) 메인 실행
# ==============================
start_browser_server()

cap = cv2.VideoCapture(0)
detector = BlinkDetector()

EAR_THRESHOLD = 0.2
MAR_THRESHOLD = 0.7
OPEN_MOUTH_FRAMES = 30
HEAD_YAW_THRESHOLD = 45
BLINK_WARMUP_SEC = 30

current_mode = "강의시청"
show_landmarks = True
program_start_time = time.time()
webcam_state = reset_webcam_counts()

blink_rate = 0
blink_state = "NORMAL"
pitch = yaw = roll = 0
mar = 0
ear = 0

with mp_face_mesh.FaceMesh(
        max_num_faces=1,
        refine_landmarks=True,
        min_detection_confidence=0.5,
        min_tracking_confidence=0.5) as face_mesh:

    while cap.isOpened():
        success, image = cap.read()
        if not success:
            print("웹캠에서 영상을 읽을 수 없습니다.")
            break

        image = cv2.cvtColor(image, cv2.COLOR_BGR2RGB)
        image.flags.writeable = False
        results = face_mesh.process(image)
        image.flags.writeable = True
        image = cv2.cvtColor(image, cv2.COLOR_RGB2BGR)

        if results.multi_face_landmarks:
            for face_landmarks in results.multi_face_landmarks:
                landmarks = face_landmarks.landmark
                webcam_state["face_absence_start_time"] = None
                webcam_state["face_absence_duration"] = 0

                left_eye_indices = [362, 385, 387, 263, 373, 380]
                right_eye_indices = [33, 160, 158, 133, 153, 144]
                mouth_indices = [13, 14, 17, 18, 78, 308]

                left_ear = calculate_ear(landmarks, left_eye_indices)
                right_ear = calculate_ear(landmarks, right_eye_indices)
                ear = (left_ear + right_ear) / 2.0
                mar = calculate_mar(landmarks, mouth_indices)
                pitch, yaw, roll = calculate_head_pose(image, landmarks)

                detector.update(ear)
                blink_rate = detector.get_blink_rate()
                blink_state = detector.get_state()

                # 눈 감김 지속시간
                if ear < EAR_THRESHOLD:
                    webcam_state["closed_eyes_frame_count"] += 1
                    if webcam_state["eye_close_start_time"] is None:
                        webcam_state["eye_close_start_time"] = time.time()
                    webcam_state["closed_duration"] = time.time() - webcam_state["eye_close_start_time"]
                else:
                    webcam_state["closed_eyes_frame_count"] = 0
                    webcam_state["eye_close_start_time"] = None
                    webcam_state["closed_duration"] = 0

                # 하품 횟수
                if mar > MAR_THRESHOLD:
                    webcam_state["open_mouth_frame_count"] += 1
                    if webcam_state["open_mouth_frame_count"] >= OPEN_MOUTH_FRAMES and not webcam_state["yawn_detected"]:
                        webcam_state["yawn_count"] += 1
                        webcam_state["yawn_detected"] = True
                else:
                    webcam_state["open_mouth_frame_count"] = 0
                    webcam_state["yawn_detected"] = False

                # 고개 방향 변화량
                if abs(yaw) > HEAD_YAW_THRESHOLD:
                    if not webcam_state["head_direction_changed"]:
                        webcam_state["head_direction_changed"] = True
                        webcam_state["head_direction_count"] += 1
                else:
                    webcam_state["head_direction_changed"] = False


                if show_landmarks:
                    mp_drawing.draw_landmarks(
                        image=image,
                        landmark_list=face_landmarks,
                        connections=mp_face_mesh.FACEMESH_TESSELATION,
                        landmark_drawing_spec=None,
                        connection_drawing_spec=mp_drawing_styles.get_default_face_mesh_tesselation_style()
                    )
        else:
            if webcam_state["face_absence_start_time"] is None:
                webcam_state["face_absence_start_time"] = time.time()
            webcam_state["face_absence_duration"] = time.time() - webcam_state["face_absence_start_time"]
            webcam_state["closed_duration"] = 0

        elapsed = time.time() - program_start_time
        blink_valid = elapsed >= BLINK_WARMUP_SEC

        webcam_values = {
            "yawn_count": webcam_state["yawn_count"],
            "face_absence_duration": webcam_state["face_absence_duration"],
            "head_direction_count": webcam_state["head_direction_count"],
            "closed_duration": webcam_state["closed_duration"],
            "blink_rate": blink_rate,
        }
        browser_values = get_browser_values()

        integrated_score, status, item_scores, violations = calculate_integrated_score(
            current_mode, webcam_values, browser_values, blink_valid
        )

        # 최종 실시간 경고 기준: 웹캠 + 브라우저 적발 항목 총 2개 이상
        alert = len(violations) >= 2

        blink_text = f"{blink_rate:.1f}회/분"
        if not blink_valid:
            blink_text += f" (대기 {max(int(BLINK_WARMUP_SEC - elapsed), 0)}초)"

        browser_connected_text = "수신 전"
        if browser_values.get("last_event_time") is not None:
            browser_connected_text = f"최근수신 {int(time.time() - browser_values['last_event_time'])}초 전"

        lines = [
            f"MODE: {current_mode}  [1 강의시청 / 2 자료검색 / 3 잠금]",
            f"통합 집중/졸음 점수: {integrated_score:.1f}점 / 상태: {status}",
            f"적발 항목 수: {len(violations)}개 / {', '.join(violations) if violations else '없음'}",
            f"[브라우저] {browser_connected_text}",
            f"탭전환 {browser_values['tab_switch_count']}회 / 탭이탈 {browser_values['tab_left_total_time']:.1f}초",
            f"반복전환 {browser_values['short_interval_switch_count']}회 / 차단접속 {browser_values['blocked_access_count']}회",
            f"[웹캠] 하품 {webcam_state['yawn_count']}회 / 얼굴부재 {webcam_state['face_absence_duration']:.1f}초",
            f"고개방향 {webcam_state['head_direction_count']}회 / yaw {yaw:.1f}도",
            f"눈감김 {webcam_state['closed_duration']:.2f}초 EAR {ear:.2f} / 깜빡임 {blink_text} ({blink_state})",
            "r: 전체 초기화 / h: 랜드마크 / q: 종료"
        ]
        image = draw_texts(image, lines)

        if alert:
            mask = np.zeros_like(image, dtype=np.uint8)
            mask[:] = (0, 0, 255)
            image = cv2.addWeighted(image, 0.7, mask, 0.3, 0)

            pil_image = Image.fromarray(image)
            draw = ImageDraw.Draw(pil_image)
            font_big = load_font(74)
            font_mid = load_font(32)
            h, w = image.shape[:2]
            draw.text((w // 2 - 120, h // 2 - 75), "!경고!", font=font_big, fill=(255, 255, 255))
            draw.text((w // 2 - 260, h // 2 + 10), f"2개 이상 적발: {', '.join(violations[:3])}", font=font_mid, fill=(255, 255, 255))
            image = np.array(pil_image)

        cv2.imshow("Integrated Webcam + Browser Score", image)

        key = cv2.waitKey(5) & 0xFF
        if key == ord('q'):
            break
        elif key == ord('h'):
            show_landmarks = not show_landmarks
        elif key == ord('r'):
            webcam_state = reset_webcam_counts()
            reset_browser_state()
            detector = BlinkDetector()
            program_start_time = time.time()
            blink_rate = 0
            blink_state = "NORMAL"
        elif key == ord('1'):
            current_mode = "강의시청"
            webcam_state = reset_webcam_counts()
            reset_browser_state()
            detector = BlinkDetector()
            program_start_time = time.time()
        elif key == ord('2'):
            current_mode = "자료검색"
            webcam_state = reset_webcam_counts()
            reset_browser_state()
            detector = BlinkDetector()
            program_start_time = time.time()
        elif key == ord('3'):
            current_mode = "잠금"
            webcam_state = reset_webcam_counts()
            reset_browser_state()
            detector = BlinkDetector()
            program_start_time = time.time()

cap.release()
cv2.destroyAllWindows()
