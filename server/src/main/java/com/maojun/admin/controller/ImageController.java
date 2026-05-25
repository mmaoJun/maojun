package com.maojun.admin.controller;

import com.maojun.admin.dto.ApiResponse;
import com.maojun.admin.dto.ImageResponse;
import com.maojun.admin.dto.UploadResponse;
import com.maojun.admin.service.ImageService;
import java.util.List;
import java.util.Map;
import org.springframework.http.MediaType;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

@RestController
@RequestMapping("/api/images")
public class ImageController {

  private final ImageService imageService;

  public ImageController(ImageService imageService) {
    this.imageService = imageService;
  }

  @PostMapping(value = "/upload", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
  public ApiResponse<UploadResponse> upload(
      @RequestPart("file") MultipartFile file,
      @RequestParam(value = "description", required = false) String description
  ) {
    ImageResponse image = imageService.upload(file, description);
    return ApiResponse.ok(new UploadResponse(image));
  }

  @GetMapping
  public ApiResponse<?> list(
      @RequestParam(value = "page", required = false) Integer page,
      @RequestParam(value = "size", required = false) Integer size
  ) {
    if (page != null && page > 0 && size != null && size > 0) {
      Map<String, Object> result = imageService.listPage(page, size);
      return ApiResponse.ok(result);
    }
    return ApiResponse.ok(imageService.list());
  }

  @GetMapping("/{id}/download")
  public ApiResponse<String> download(@PathVariable Long id) {
    return ApiResponse.ok(imageService.generateDownloadUrl(id));
  }

  @DeleteMapping("/{id}")
  public ApiResponse<Void> delete(@PathVariable Long id) {
    imageService.delete(id);
    return ApiResponse.ok(null);
  }

  @PatchMapping("/{id}/description")
  public ApiResponse<Void> updateDescription(
      @PathVariable Long id,
      @RequestBody Map<String, String> body
  ) {
    String description = body.get("description");
    imageService.updateDescription(id, description != null ? description : "");
    return ApiResponse.ok(null);
  }
}
