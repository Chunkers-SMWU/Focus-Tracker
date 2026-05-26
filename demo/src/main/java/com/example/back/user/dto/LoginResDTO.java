package com.example.back.user.dto;

import lombok.Builder;

@Builder
public record LoginResDTO(
        String token,
        String name
) {}
