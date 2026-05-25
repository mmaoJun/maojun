package com.maojun.admin.controller;

import com.maojun.admin.dto.ApiResponse;
import com.maojun.admin.dto.HomeContentResponse;
import com.maojun.admin.service.HomeContentService;
import java.util.List;
import java.util.Map;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/home-content")
public class HomeContentController {

  private final HomeContentService homeContentService;

  public HomeContentController(HomeContentService homeContentService) {
    this.homeContentService = homeContentService;
  }

  @GetMapping
  public ApiResponse<List<HomeContentResponse>> list() {
    return ApiResponse.ok(homeContentService.list());
  }

  @GetMapping("/public")
  public ApiResponse<List<HomeContentResponse>> listPublic() {
    return ApiResponse.ok(homeContentService.list());
  }

  @GetMapping("/by-key")
  public ApiResponse<HomeContentResponse> get(@RequestParam String key) {
    HomeContentResponse content = homeContentService.getByKey(key);
    if (content == null) {
      return ApiResponse.fail(404, "内容不存在");
    }
    return ApiResponse.ok(content);
  }

  @PutMapping
  public ApiResponse<HomeContentResponse> save(@RequestBody Map<String, String> body) {
    String key = body.get("sectionKey");
    String contentJson = body.get("contentJson");
    if (key == null || key.isBlank()) {
      return ApiResponse.fail(400, "sectionKey 不能为空");
    }
    if (contentJson == null || contentJson.isBlank()) {
      return ApiResponse.fail(400, "contentJson 不能为空");
    }
    return ApiResponse.ok(homeContentService.save(key, contentJson));
  }
}
