package com.maojun.admin.dto;

import java.time.LocalDateTime;

public class HomeContentResponse {
  private Long id;
  private String sectionKey;
  private String contentJson;
  private LocalDateTime updatedAt;

  public HomeContentResponse(Long id, String sectionKey, String contentJson, LocalDateTime updatedAt) {
    this.id = id;
    this.sectionKey = sectionKey;
    this.contentJson = contentJson;
    this.updatedAt = updatedAt;
  }

  public Long getId() { return id; }
  public String getSectionKey() { return sectionKey; }
  public String getContentJson() { return contentJson; }
  public LocalDateTime getUpdatedAt() { return updatedAt; }
}
