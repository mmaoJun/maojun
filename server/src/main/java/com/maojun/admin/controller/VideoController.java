package com.maojun.admin.controller;

import com.maojun.admin.dto.ApiResponse;
import com.maojun.admin.dto.VideoResponse;
import com.maojun.admin.service.VideoService;
import java.util.List;
import java.util.Map;
import org.springframework.http.MediaType;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

@RestController
@RequestMapping("/api/videos")
public class VideoController {

  private final VideoService videoService;

  public VideoController(VideoService videoService) {
    this.videoService = videoService;
  }

  @GetMapping
  public ApiResponse<List<VideoResponse>> list() {
    return ApiResponse.ok(videoService.list());
  }

  @PostMapping(value = "/upload", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
  public ApiResponse<VideoResponse> upload(
      @RequestPart("file") MultipartFile file,
      @RequestParam(value = "description", required = false) String description
  ) {
    return ApiResponse.ok(videoService.upload(file, description));
  }

  @GetMapping("/{id}/download")
  public ApiResponse<String> download(@PathVariable Long id) {
    return ApiResponse.ok(videoService.generateDownloadUrl(id));
  }

  @DeleteMapping("/{id}")
  public ApiResponse<Void> delete(@PathVariable Long id) {
    videoService.delete(id);
    return ApiResponse.ok(null);
  }

  @PatchMapping("/{id}/description")
  public ApiResponse<Void> updateDescription(@PathVariable Long id, @RequestBody Map<String, String> body) {
    String desc = body.get("description");
    videoService.updateDescription(id, desc != null ? desc : "");
    return ApiResponse.ok(null);
  }
}
