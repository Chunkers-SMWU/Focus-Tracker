package com.example.back.session.service;

import com.example.back.daily.entity.Daily;
import com.example.back.daily.repository.DailyRepository;
import com.example.back.user.entity.User;
import com.example.back.user.repository.UserRepository;
import com.example.back.session.dto.SessionReqDto;
import com.example.back.session.dto.SessionResDto;
import com.example.back.session.entity.Session;
import com.example.back.session.repository.SessionRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class SessionService {

    private final SessionRepository sessionRepository;
    private final UserRepository userRepository;
    private final DailyRepository dailyRepository;

    @Transactional
    public SessionResDto saveSession(String loginId, SessionReqDto dto) {
        User user = userRepository.findByLoginId(loginId)
                .orElseThrow(() -> new RuntimeException("유저를 찾을 수 없습니다."));

        // 세션 저장
        Session session = Session.builder()
                .user(user)
                .mode(dto.getMode())
                .focusTime(dto.getFocusTime())
                .nonFocusTime(dto.getNonFocusTime())
                .totalTime(dto.getTotalTime())
                .yawnCount(dto.getYawnCount())
                .poseCount(dto.getPoseCount())
                .blinkRate(dto.getBlinkRate())
                .headTurnCount(dto.getHeadTurnCount())
                .eyeCloseTime(dto.getEyeCloseTime())
                .headDownCount(dto.getHeadDownCount())
                .focusScore(dto.getFocusScore())
                .tabSwitchCount(dto.getTabSwitchCount())
                .tabLeaveTime(dto.getTabLeaveTime())
                .shortSwitchCount(dto.getShortSwitchCount())
                .unauthorizedAccessCount(dto.getUnauthorizedAccessCount())
                .build();

        SessionResDto result = SessionResDto.from(sessionRepository.save(session));

        // Daily 업데이트
        updateDaily(user, dto);

        return result;
    }

    private void updateDaily(User user, SessionReqDto dto) {
        Daily daily = dailyRepository.findByUserAndDate(user, LocalDate.now())
                .orElse(Daily.builder()
                        .user(user)
                        .date(LocalDate.now())
                        .avgFocusScore(0.0)
                        .maxFocusTime(0)
                        .totalSessionTime(0)
                        .sessionCount(0)
                        .build());

        int newSessionCount = daily.getSessionCount() + 1;

        // 종합 집중도: 기존 평균에 새 세션 focusScore 반영
        double newAvgFocusScore = (daily.getAvgFocusScore() * daily.getSessionCount() + dto.getFocusScore()) / newSessionCount;
        // 최대 집중 시간: 기존 최댓값 vs 새 세션 focusTime
        int newMaxFocusTime = Math.max(daily.getMaxFocusTime(), dto.getFocusTime());
        // 세션 이용 시간: 누적 합산
        int newTotalSessionTime = daily.getTotalSessionTime() + dto.getTotalTime();

        daily.update(
                Math.round(newAvgFocusScore * 10.0) / 10.0,
                newMaxFocusTime,
                newTotalSessionTime,
                newSessionCount
        );

        dailyRepository.save(daily);
    }

    public List<SessionResDto> getSessionHistory(String loginId) {
        User user = userRepository.findByLoginId(loginId)
                .orElseThrow(() -> new RuntimeException("유저를 찾을 수 없습니다."));

        return sessionRepository.findByUserOrderByCreatedAtDesc(user)
                .stream()
                .map(SessionResDto::from)
                .collect(Collectors.toList());
    }
}