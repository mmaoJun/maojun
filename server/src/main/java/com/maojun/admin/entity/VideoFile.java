package com.maojun.admin.entity;

import com.baomidou.mybatisplus.annotation.IdType;
import com.baomidou.mybatisplus.annotation.TableId;
import com.baomidou.mybatisplus.annotation.TableName;
import lombok.Data;
import java.time.LocalDateTime;

@Data
@TableName("video_file")
public class VideoFile {
  @TableId(type = IdType.AUTO)
  private Long id;
  private String fileName;
  private String url;
  private String ossObjectKey;
  private String contentType;
  private Long fileSize;
  private String description;
  private LocalDateTime createdAt;
}
