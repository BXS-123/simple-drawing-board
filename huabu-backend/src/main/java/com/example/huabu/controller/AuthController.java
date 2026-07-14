
package com.example.huabu.controller;

import com.example.huabu.dto.ApiResponse;
import com.example.huabu.dto.ChangePasswordRequest;
import com.example.huabu.dto.LoginRequest;
import com.example.huabu.dto.LoginResponse;
import com.example.huabu.dto.RegisterRequest;
import com.example.huabu.entity.User;
import com.example.huabu.service.UserService;
import com.example.huabu.util.JwtUtil;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/auth")
public class AuthController {
    
    @Autowired
    private UserService userService;
    
    @Autowired
    private JwtUtil jwtUtil;
    
    @PostMapping("/login")
    public ApiResponse<LoginResponse> login(@RequestBody LoginRequest request) {
        User user = userService.login(request.getUsername(), request.getPassword());
        String token = jwtUtil.generateToken(user.getId(), user.getUsername());
        
        LoginResponse response = new LoginResponse();
        response.setToken(token);
        response.setUsername(user.getUsername());
        
        return ApiResponse.success(response);
    }
    
    @PostMapping("/register")
    public ApiResponse<String> register(@RequestBody RegisterRequest request) {
        userService.register(request.getUsername(), request.getPassword());
        return ApiResponse.success(null, "注册成功");
    }
    
    @PutMapping("/change-password")
    public ApiResponse<String> changePassword(@RequestBody ChangePasswordRequest request,
                                              Authentication authentication) {
        Integer userId = (Integer) authentication.getPrincipal();
        userService.changePassword(userId, request.getOldPassword(), request.getNewPassword());
        return ApiResponse.success(null, "密码修改成功");
    }
    
    @GetMapping("/user")
    public ApiResponse<User> getUserInfo(Authentication authentication) {
        Integer userId = (Integer) authentication.getPrincipal();
        User user = userService.findById(userId);
        if (user != null) {
            user.setPasswordHash(null);
        }
        return ApiResponse.success(user);
    }
    
    @DeleteMapping("/user")
    public ApiResponse<String> deleteUser(Authentication authentication) {
        Integer userId = (Integer) authentication.getPrincipal();
        userService.deleteUser(userId);
        return ApiResponse.success(null, "账号注销成功");
    }
}
