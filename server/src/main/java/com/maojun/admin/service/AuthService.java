package com.maojun.admin.service;

import com.maojun.admin.dto.LoginRequest;
import com.maojun.admin.dto.LoginResponse;

public interface AuthService {
  LoginResponse login(LoginRequest request);
}
