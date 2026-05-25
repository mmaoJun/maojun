package com.maojun.admin.service;

import com.maojun.admin.dto.VideoResponse;
import java.util.List;
import org.springframework.web.multipart.MultipartFile;

public interface VideoService {
  VideoResponse upload(MultipartFile file, String description);
  List<VideoResponse> list();
  String generateDownloadUrl(Long id);
  void delete(Long id);
  void updateDescription(Long id, String description);
}
