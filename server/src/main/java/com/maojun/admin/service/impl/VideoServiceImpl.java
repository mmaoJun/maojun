package com.maojun.admin.service.impl;

import com.aliyun.oss.OSS;
import com.aliyun.oss.model.GeneratePresignedUrlRequest;
import com.aliyun.oss.model.PutObjectRequest;
import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.maojun.admin.config.OssProperties;
import com.maojun.admin.dto.VideoResponse;
import com.maojun.admin.entity.VideoFile;
import com.maojun.admin.mapper.VideoFileMapper;
import com.maojun.admin.service.VideoService;
import java.io.IOException;
import java.net.URL;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.ZoneId;
import java.util.Date;
import java.util.List;
import java.util.UUID;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

@Service
public class VideoServiceImpl implements VideoService {

  private final OSS ossClient;
  private final OssProperties ossProperties;
  private final VideoFileMapper videoFileMapper;

  public VideoServiceImpl(OSS ossClient, OssProperties ossProperties, VideoFileMapper videoFileMapper) {
    this.ossClient = ossClient;
    this.ossProperties = ossProperties;
    this.videoFileMapper = videoFileMapper;
  }

  @Override
  public VideoResponse upload(MultipartFile file, String description) {
    validateVideo(file);
    String objectKey = buildObjectKey(file.getOriginalFilename());
    try {
      ossClient.putObject(new PutObjectRequest(ossProperties.bucketName(), objectKey, file.getInputStream()));
    } catch (IOException ex) {
      throw new IllegalStateException("视频上传失败", ex);
    }

    VideoFile entity = new VideoFile();
    entity.setFileName(file.getOriginalFilename());
    entity.setUrl(buildPublicUrl(objectKey));
    entity.setOssObjectKey(objectKey);
    entity.setContentType(file.getContentType());
    entity.setFileSize(file.getSize());
    entity.setDescription(description);
    entity.setCreatedAt(LocalDateTime.now());
    videoFileMapper.insert(entity);
    return toResponse(entity);
  }

  @Override
  public List<VideoResponse> list() {
    return videoFileMapper.selectList(
        new LambdaQueryWrapper<VideoFile>().orderByDesc(VideoFile::getCreatedAt)
    ).stream().map(this::toResponse).toList();
  }

  @Override
  public String generateDownloadUrl(Long id) {
    VideoFile entity = videoFileMapper.selectById(id);
    if (entity == null) throw new IllegalArgumentException("视频不存在");
    Date expiration = Date.from(LocalDate.now().plusDays(1).atStartOfDay(ZoneId.systemDefault()).toInstant());
    GeneratePresignedUrlRequest req = new GeneratePresignedUrlRequest(ossProperties.bucketName(), entity.getOssObjectKey());
    req.setExpiration(expiration);
    URL url = ossClient.generatePresignedUrl(req);
    return url.toString();
  }

  @Override
  public void delete(Long id) {
    VideoFile entity = videoFileMapper.selectById(id);
    if (entity == null) throw new IllegalArgumentException("视频不存在");
    ossClient.deleteObject(ossProperties.bucketName(), entity.getOssObjectKey());
    videoFileMapper.deleteById(id);
  }

  @Override
  public void updateDescription(Long id, String description) {
    VideoFile entity = videoFileMapper.selectById(id);
    if (entity == null) throw new IllegalArgumentException("视频不存在");
    entity.setDescription(description);
    videoFileMapper.updateById(entity);
  }

  private void validateVideo(MultipartFile file) {
    if (file == null || file.isEmpty()) throw new IllegalArgumentException("请选择视频文件");
    String contentType = file.getContentType();
    if (contentType == null || !contentType.startsWith("video/")) throw new IllegalArgumentException("仅支持视频文件上传");
  }

  private String buildObjectKey(String originalFilename) {
    LocalDate now = LocalDate.now();
    String safeName = originalFilename == null ? "video" : originalFilename.replaceAll("\\s+", "-");
    return String.format("videos/%d/%02d/%02d/%s-%s",
        now.getYear(), now.getMonthValue(), now.getDayOfMonth(), UUID.randomUUID(), safeName);
  }

  private String buildPublicUrl(String objectKey) {
    return String.format("%s/%s", ossProperties.urlPrefix(), objectKey);
  }

  private VideoResponse toResponse(VideoFile entity) {
    return new VideoResponse(entity.getId(), entity.getFileName(), entity.getUrl(),
        entity.getOssObjectKey(), entity.getContentType(), entity.getFileSize(),
        entity.getDescription(), entity.getCreatedAt());
  }
}
