package com.maojun.admin.service.impl;

import com.aliyun.oss.OSS;
import com.aliyun.oss.model.GeneratePresignedUrlRequest;
import com.aliyun.oss.model.PutObjectRequest;
import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.maojun.admin.config.OssProperties;
import com.maojun.admin.dto.ImageResponse;
import com.maojun.admin.entity.ImageFile;
import com.maojun.admin.mapper.ImageFileMapper;
import com.maojun.admin.service.ImageService;
import java.io.IOException;
import java.net.URL;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.ZoneId;
import java.util.Date;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.UUID;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

@Service
public class ImageServiceImpl implements ImageService {

  private final OSS ossClient;
  private final OssProperties ossProperties;
  private final ImageFileMapper imageFileMapper;

  public ImageServiceImpl(OSS ossClient, OssProperties ossProperties, ImageFileMapper imageFileMapper) {
    this.ossClient = ossClient;
    this.ossProperties = ossProperties;
    this.imageFileMapper = imageFileMapper;
  }

  @Override
  public ImageResponse upload(MultipartFile file, String description) {
    validateImage(file);
    String objectKey = buildObjectKey(file.getOriginalFilename());
    try {
      PutObjectRequest putObjectRequest = new PutObjectRequest(
          ossProperties.bucketName(),
          objectKey,
          file.getInputStream()
      );
      ossClient.putObject(putObjectRequest);
    } catch (IOException ex) {
      throw new IllegalStateException("图片上传失败", ex);
    }

    ImageFile imageFile = new ImageFile();
    imageFile.setFileName(file.getOriginalFilename());
    imageFile.setUrl(buildPublicUrl(objectKey));
    imageFile.setOssObjectKey(objectKey);
    imageFile.setContentType(file.getContentType());
    imageFile.setFileSize(file.getSize());
    imageFile.setDescription(description);
    imageFile.setCreatedAt(LocalDateTime.now());
    imageFileMapper.insert(imageFile);
    return toResponse(imageFile);
  }

  @Override
  public List<ImageResponse> list() {
    LambdaQueryWrapper<ImageFile> queryWrapper = new LambdaQueryWrapper<ImageFile>()
        .orderByAsc(ImageFile::getCreatedAt);
    return imageFileMapper.selectList(queryWrapper).stream()
        .map(this::toResponse)
        .toList();
  }

  @Override
  public Map<String, Object> listPage(int page, int size) {
    LambdaQueryWrapper<ImageFile> queryWrapper = new LambdaQueryWrapper<ImageFile>()
        .orderByAsc(ImageFile::getCreatedAt);
    Page<ImageFile> pageParam = new Page<>(page, size);
    Page<ImageFile> result = imageFileMapper.selectPage(pageParam, queryWrapper);
    Map<String, Object> map = new HashMap<>();
    map.put("records", result.getRecords().stream().map(this::toResponse).toList());
    map.put("total", result.getTotal());
    map.put("page", result.getCurrent());
    map.put("size", result.getSize());
    return map;
  }

  @Override
  public String generateDownloadUrl(Long id) {
    ImageFile imageFile = imageFileMapper.selectById(id);
    if (imageFile == null) {
      throw new IllegalArgumentException("图片不存在");
    }

    Date expiration = Date.from(LocalDate.now().plusDays(1)
        .atStartOfDay(ZoneId.systemDefault())
        .toInstant());

    GeneratePresignedUrlRequest request = new GeneratePresignedUrlRequest(
        ossProperties.bucketName(),
        imageFile.getOssObjectKey()
    );
    request.setExpiration(expiration);
    URL url = ossClient.generatePresignedUrl(request);
    return url.toString();
  }

  @Override
  public void updateDescription(Long id, String description) {
    ImageFile imageFile = imageFileMapper.selectById(id);
    if (imageFile == null) {
      throw new IllegalArgumentException("图片不存在");
    }
    imageFile.setDescription(description);
    imageFileMapper.updateById(imageFile);
  }

  @Override
  public void delete(Long id) {
    ImageFile imageFile = imageFileMapper.selectById(id);
    if (imageFile == null) {
      throw new IllegalArgumentException("图片不存在");
    }

    ossClient.deleteObject(ossProperties.bucketName(), imageFile.getOssObjectKey());
    imageFileMapper.deleteById(id);
  }

  private void validateImage(MultipartFile file) {
    if (file == null || file.isEmpty()) {
      throw new IllegalArgumentException("请选择图片文件");
    }
    String contentType = file.getContentType();
    if (contentType == null || !contentType.startsWith("image/")) {
      throw new IllegalArgumentException("仅支持图片文件上传");
    }
  }

  private String buildObjectKey(String originalFilename) {
    LocalDate now = LocalDate.now();
    String safeName = originalFilename == null ? "image" : originalFilename.replaceAll("\\s+", "-");
    return String.format(
        "images/%d/%02d/%02d/%s-%s",
        now.getYear(),
        now.getMonthValue(),
        now.getDayOfMonth(),
        UUID.randomUUID(),
        safeName
    );
  }

  private String buildPublicUrl(String objectKey) {
    return String.format("%s/%s", ossProperties.urlPrefix(), objectKey);
  }

  private ImageResponse toResponse(ImageFile imageFile) {
    return new ImageResponse(
        imageFile.getId(),
        imageFile.getFileName(),
        imageFile.getUrl(),
        imageFile.getOssObjectKey(),
        imageFile.getContentType(),
        imageFile.getFileSize(),
        imageFile.getDescription(),
        imageFile.getCreatedAt()
    );
  }
}
