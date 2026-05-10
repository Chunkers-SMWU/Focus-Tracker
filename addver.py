import cv2
import mediapipe as mp
import time
import math
import numpy as np
from PIL import ImageFont, ImageDraw, Image
from eyeblink import BlinkDetector  # ← 추가

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
    return vertical_length / horizontal_length

def calculate_head_tilt(landmarks):
    left_shoulder = landmarks[234]
    right_shoulder = landmarks[454]
    dx = right_shoulder.x - left_shoulder.x
    dy = right_shoulder.y - left_shoulder.y
    angle = math.degrees(math.atan2(dy, dx))
    return abs(angle)

cap = cv2.VideoCapture(0)
detector = BlinkDetector()  # ← 추가

with mp_face_mesh.FaceMesh(
        max_num_faces=1,
        refine_landmarks=True,
        min_detection_confidence=0.5,
        min_tracking_confidence=0.5) as face_mesh:

    closed_eyes_frame_count = 0
    open_mouth_frame_count = 0
    head_tilt_frame_count = 0

    EAR_THRESHOLD = 0.2
    CLOSED_EYES_FRAMES = 30
    MAR_THRESHOLD = 0.7
    OPEN_MOUTH_FRAMES = 30
    HEAD_TILT_THRESHOLD = 15
    HEAD_TILT_FRAMES = 30

    head_tilt_count = 0
    head_tilted = False
    HEAD_TILT_ALERT_COUNT = 2
    # 눈 감김 지속시간 측정 변수
    eye_close_start_time = None  
    closed_duration = 0
    EYE_CLOSED_TIME_THRESHOLD = 0.5  # 0.5초 이상 감으면 경고

    show_landmarks = True

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

        alert = False

        if results.multi_face_landmarks:
            for face_landmarks in results.multi_face_landmarks:
                landmarks = face_landmarks.landmark

                left_eye_indices = [362, 385, 387, 263, 373, 380]
                right_eye_indices = [33, 160, 158, 133, 153, 144]
                mouth_indices = [13, 14, 17, 18, 78, 308]

                left_ear = calculate_ear(landmarks, left_eye_indices)
                right_ear = calculate_ear(landmarks, right_eye_indices)
                ear = (left_ear + right_ear) / 2.0
                mar = calculate_mar(landmarks, mouth_indices)
                head_tilt_angle = calculate_head_tilt(landmarks)

                # ← 눈 깜빡임 감지
                detector.update(ear)
                blink_rate = detector.get_blink_rate()
                blink_state = detector.get_state()

               
                # 눈 감김 지속시간 계산
                if ear < EAR_THRESHOLD:
                    closed_eyes_frame_count += 1

                    # 눈을 감기 시작한 순간 시간 저장
                    if eye_close_start_time is None:
                        eye_close_start_time = time.time()

                    # 현재까지 눈 감은 시간 계산
                    closed_duration = time.time() - eye_close_start_time

                else:
                    closed_eyes_frame_count = 0

                    # 눈을 뜨면 시간 초기화
                    eye_close_start_time = None
                    closed_duration = 0
                if mar > MAR_THRESHOLD:
                    open_mouth_frame_count += 1
                else:
                    open_mouth_frame_count = 0

                if head_tilt_angle > HEAD_TILT_THRESHOLD:
                    head_tilt_frame_count += 1
                    if head_tilt_frame_count >= HEAD_TILT_FRAMES and not head_tilted:
                        head_tilted = True
                        head_tilt_count += 1
                else:
                    head_tilt_frame_count = 0
                    head_tilted = False

                if closed_eyes_frame_count >= CLOSED_EYES_FRAMES:
                    alert = True
                elif closed_duration >= EYE_CLOSED_TIME_THRESHOLD:
                    alert = True
                elif open_mouth_frame_count >= OPEN_MOUTH_FRAMES:
                    alert = True
                elif head_tilt_count >= HEAD_TILT_ALERT_COUNT:
                    alert = True
                    head_tilt_count = 0
                elif blink_state == "DROWSY":  # ← 깜빡임 상태로도 경고
                    alert = True

                pil_image = Image.fromarray(image)
                draw = ImageDraw.Draw(pil_image)
                font = ImageFont.truetype("malgun.ttf", 32)
                draw.text((50, 50),  f"졸음: {'O' if closed_eyes_frame_count >= CLOSED_EYES_FRAMES else 'X'}", font=font, fill=(0, 0, 255))
                draw.text((50, 100), f"하품: {'O' if open_mouth_frame_count >= OPEN_MOUTH_FRAMES else 'X'}", font=font, fill=(0, 0, 255))
                draw.text((50, 150), f"자세: {'O' if head_tilt_count >= 1 else 'X'} ({head_tilt_count}회)", font=font, fill=(0, 0, 255))
                draw.text((50, 200), f"깜빡임: {blink_rate:.1f}회/분 ({blink_state})", font=font, fill=(0, 0, 255))  # ← 추가
                draw.text((50, 250), f"눈감김 시간: {closed_duration:.2f}초", font=font, fill=(0, 0, 255)) # 추가
                image = np.array(pil_image)

                if show_landmarks:
                    mp_drawing.draw_landmarks(
                        image=image,
                        landmark_list=face_landmarks,
                        connections=mp_face_mesh.FACEMESH_TESSELATION,
                        landmark_drawing_spec=None,
                        connection_drawing_spec=mp_drawing_styles.get_default_face_mesh_tesselation_style())

        if alert:
            mask = np.zeros_like(image, dtype=np.uint8)
            mask[:] = (0, 0, 255)
            image = cv2.addWeighted(image, 0.7, mask, 0.3, 0)

            pil_image = Image.fromarray(image)
            draw = ImageDraw.Draw(pil_image)
            font_big = ImageFont.truetype("malgun.ttf", 80)
            h, w = image.shape[:2]
            draw.text((w//2 - 100, h//2 - 50), "!경고!", font=font_big, fill=(255, 255, 255))
            image = np.array(pil_image)

        cv2.imshow('Drowsiness, Yawn, and Head Tilt Detection', image)

        key = cv2.waitKey(5) & 0xFF
        if key == ord('q'):
            break
        elif key == ord('h'):
            show_landmarks = not show_landmarks

cap.release()
cv2.destroyAllWindows()