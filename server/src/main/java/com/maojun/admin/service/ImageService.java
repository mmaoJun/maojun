package com.maojun.admin.service;

import com.maojun.admin.dto.ImageResponse;
import java.util.List;
import java.util.Map;
import org.springframework.web.multipart.MultipartFile;

public interface ImageService {
  ImageResponse upload(MultipartFile file, String description);
  List<ImageResponse> list();
  Map<String, Object> listPage(int page, int size);
  String generateDownloadUrl(Long id);
  void delete(Long id);
  void updateDescription(Long id, String description);
}
