package com.maojun.admin.config;

import com.aliyun.oss.OSS;
import com.aliyun.oss.model.SetBucketCORSRequest;
import com.aliyun.oss.model.SetBucketCORSRequest.CORSRule;
import java.util.Collections;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.boot.context.event.ApplicationReadyEvent;
import org.springframework.context.event.EventListener;
import org.springframework.stereotype.Component;

@Component
public class OssCorsInitializer {

  private static final Logger log = LoggerFactory.getLogger(OssCorsInitializer.class);

  private final OssProperties ossProperties;
  private final OSS ossClient;

  public OssCorsInitializer(OssProperties ossProperties, OSS ossClient) {
    this.ossProperties = ossProperties;
    this.ossClient = ossClient;
  }

  @EventListener(ApplicationReadyEvent.class)
  public void configureCors() {
    try {
      CORSRule rule = new CORSRule();
      rule.setAllowedOrigins(Collections.singletonList("*"));
      rule.setAllowedMethods(Collections.singletonList("GET"));
      rule.setAllowedHeaders(Collections.singletonList("*"));
      rule.setExposeHeaders(Collections.singletonList("ETag"));
      rule.setMaxAgeSeconds(3600);

      SetBucketCORSRequest request = new SetBucketCORSRequest(ossProperties.bucketName());
      request.addCorsRule(rule);
      ossClient.setBucketCORS(request);
      log.info("OSS CORS configured for bucket: {}", ossProperties.bucketName());
    } catch (Exception e) {
      log.warn("Failed to configure OSS CORS (may already be set): {}", e.getMessage());
    }
  }
}
