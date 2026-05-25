package com.maojun.admin.service;

import com.maojun.admin.dto.HomeContentResponse;
import java.util.List;

public interface HomeContentService {
  List<HomeContentResponse> list();
  HomeContentResponse getByKey(String sectionKey);
  HomeContentResponse save(String sectionKey, String contentJson);
}
