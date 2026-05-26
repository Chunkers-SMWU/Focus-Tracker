package com.example.back.study_report.service;

import com.example.back.study_report.dto.ReportResDTO;
import com.example.back.session.entity.Session;
import com.example.back.session.repository.SessionRepository;
import com.example.back.user.entity.User;
import com.example.back.user.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.util.List;

@Service
@RequiredArgsConstructor
public class ReportService {

    private final SessionRepository sessionRepository;
    private final UserRepository userRepository;

    public ReportResDTO getDaily(String loginId) {
        User user = userRepository.findByLoginId(loginId)
                .orElseThrow(() -> new RuntimeException("유저를 찾을 수 없습니다."));

        List<Session> sessions = sessionRepository.findByUserAndDate(user, LocalDate.now());
        return aggregate(sessions);
    }

    public ReportResDTO getWeekly(String loginId) {
        User user = userRepository.findByLoginId(loginId)
                .orElseThrow(() -> new RuntimeException("유저를 찾을 수 없습니다."));

        List<Session> sessions = sessionRepository.findByUserAndDateAfter(user, LocalDate.now().minusDays(7));
        return aggregate(sessions);
    }

    private ReportResDTO aggregate(List<Session> sessions) {
        if (sessions.isEmpty()) {
            return ReportResDTO.builder().build();
        }

        return ReportResDTO.builder()
                .sessionCount(sessions.size())
                .totalTime(sessions.stream().mapToInt(Session::getTotalTime).sum())
                .focusTime(sessions.stream().mapToInt(Session::getFocusTime).sum())
                .nonFocusTime(sessions.stream().mapToInt(Session::getNonFocusTime).sum())
                .avgFocusScore(sessions.stream().mapToInt(Session::getFocusScore).average().orElse(0))
                .maxFocusTime(sessions.stream().mapToInt(Session::getFocusTime).max().orElse(0))
                .build();
    }
}