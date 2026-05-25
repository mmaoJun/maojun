package com.maojun.admin.config;

import org.springframework.boot.context.properties.ConfigurationProperties;

@ConfigurationProperties(prefix = "app.oss")
public record OssProperties(
    String endpoint,
    String accessKeyId,
    String accessKeySecret,
    String bucketName,
    String urlPrefix
) {
}
