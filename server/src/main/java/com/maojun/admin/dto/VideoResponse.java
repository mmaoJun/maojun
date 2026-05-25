package com.maojun.admin.dto;

import java.time.LocalDateTime;

public record VideoResponse(
    Long id,
    String fileName,
    String url,
    String ossObjectKey,
    String contentType,
    Long fileSize,
    String description,
    LocalDateTime createdAt
) {}
