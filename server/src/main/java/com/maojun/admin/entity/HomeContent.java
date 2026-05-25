package com.maojun.admin.entity;

import com.baomidou.mybatisplus.annotation.IdType;
import com.baomidou.mybatisplus.annotation.TableId;
import com.baomidou.mybatisplus.annotation.TableName;
import java.time.LocalDateTime;

@TableName("home_content")
public class HomeContent {

  @TableId(type = IdType.AUTO)
  private Long id;
  private String sectionKey;
  private String contentJson;
  private LocalDateTime updatedAt;

  public Long getId() { return id; }
  public void setId(Long id) { this.id = id; }

  public String getSectionKey() { return sectionKey; }
  public void setSectionKey(String sectionKey) { this.sectionKey = sectionKey; }

  public String getContentJson() { return contentJson; }
  public void setContentJson(String contentJson) { this.contentJson = contentJson; }

  public LocalDateTime getUpdatedAt() { return updatedAt; }
  public void setUpdatedAt(LocalDateTime updatedAt) { this.updatedAt = updatedAt; }
}
