package com.maojun.admin.service.impl;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.maojun.admin.dto.HomeContentResponse;
import com.maojun.admin.entity.HomeContent;
import com.maojun.admin.mapper.HomeContentMapper;
import com.maojun.admin.service.HomeContentService;
import java.time.LocalDateTime;
import java.util.List;
import org.springframework.stereotype.Service;

@Service
public class HomeContentServiceImpl implements HomeContentService {

  private final HomeContentMapper homeContentMapper;

  public HomeContentServiceImpl(HomeContentMapper homeContentMapper) {
    this.homeContentMapper = homeContentMapper;
  }

  @Override
  public List<HomeContentResponse> list() {
    return homeContentMapper.selectList(
        new LambdaQueryWrapper<HomeContent>().orderByAsc(HomeContent::getSectionKey)
    ).stream().map(this::toResponse).toList();
  }

  @Override
  public HomeContentResponse getByKey(String sectionKey) {
    HomeContent entity = homeContentMapper.selectOne(
        new LambdaQueryWrapper<HomeContent>().eq(HomeContent::getSectionKey, sectionKey)
    );
    return entity == null ? null : toResponse(entity);
  }

  @Override
  public HomeContentResponse save(String sectionKey, String contentJson) {
    HomeContent existing = homeContentMapper.selectOne(
        new LambdaQueryWrapper<HomeContent>().eq(HomeContent::getSectionKey, sectionKey)
    );
    if (existing != null) {
      existing.setContentJson(contentJson);
      existing.setUpdatedAt(LocalDateTime.now());
      homeContentMapper.updateById(existing);
      return toResponse(existing);
    } else {
      HomeContent entity = new HomeContent();
      entity.setSectionKey(sectionKey);
      entity.setContentJson(contentJson);
      entity.setUpdatedAt(LocalDateTime.now());
      homeContentMapper.insert(entity);
      return toResponse(entity);
    }
  }

  private HomeContentResponse toResponse(HomeContent entity) {
    return new HomeContentResponse(
        entity.getId(),
        entity.getSectionKey(),
        entity.getContentJson(),
        entity.getUpdatedAt()
    );
  }
}
