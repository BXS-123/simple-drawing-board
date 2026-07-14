
package com.example.huabu.service;

import com.example.huabu.entity.User;

public interface UserService {
    User register(String username, String password);
    User login(String username, String password);
    boolean changePassword(Integer userId, String oldPassword, String newPassword);
    boolean deleteUser(Integer userId);
    User findByUsername(String username);
    User findById(Integer id);
}
