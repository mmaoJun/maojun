package com.maojun.admin.service.impl;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.maojun.admin.config.AdminInitProperties;
import com.maojun.admin.dto.LoginRequest;
import com.maojun.admin.dto.LoginResponse;
import com.maojun.admin.entity.AdminUser;
import com.maojun.admin.mapper.AdminUserMapper;
import com.maojun.admin.service.AuthService;
import com.maojun.admin.util.JwtTokenProvider;
import jakarta.annotation.PostConstruct;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

@Service
public class AuthServiceImpl implements AuthService {

  private final AdminUserMapper adminUserMapper;
  private final PasswordEncoder passwordEncoder;
  private final JwtTokenProvider jwtTokenProvider;
  private final AdminInitProperties adminInitProperties;

  public AuthServiceImpl(
      AdminUserMapper adminUserMapper,
      PasswordEncoder passwordEncoder,
      JwtTokenProvider jwtTokenProvider,
      AdminInitProperties adminInitProperties
  ) {
    this.adminUserMapper = adminUserMapper;
    this.passwordEncoder = passwordEncoder;
    this.jwtTokenProvider = jwtTokenProvider;
    this.adminInitProperties = adminInitProperties;
  }

  @PostConstruct
  public void initAdmin() {
    LambdaQueryWrapper<AdminUser> queryWrapper = new LambdaQueryWrapper<AdminUser>()
        .eq(AdminUser::getUsername, adminInitProperties.username());
    Long count = adminUserMapper.selectCount(queryWrapper);
    if (count != null && count > 0) {
      return;
    }

    AdminUser adminUser = new AdminUser();
    adminUser.setUsername(adminInitProperties.username());
    adminUser.setPassword(passwordEncoder.encode(adminInitProperties.password()));
    adminUserMapper.insert(adminUser);
  }

  @Override
  public LoginResponse login(LoginRequest request) {
    LambdaQueryWrapper<AdminUser> queryWrapper = new LambdaQueryWrapper<AdminUser>()
        .eq(AdminUser::getUsername, request.username())
        .last("limit 1");
    AdminUser adminUser = adminUserMapper.selectOne(queryWrapper);
    if (adminUser == null || !passwordEncoder.matches(request.password(), adminUser.getPassword())) {
      throw new IllegalArgumentException("用户名或密码错误");
    }

    String token = jwtTokenProvider.generateToken(adminUser.getUsername());
    return new LoginResponse(token, adminUser.getUsername());
  }
}
