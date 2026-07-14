
package com.example.huabu.mapper;

import com.baomidou.mybatisplus.core.mapper.BaseMapper;
import com.example.huabu.entity.User;
import org.apache.ibatis.annotations.Mapper;

@Mapper
public interface UserMapper extends BaseMapper<User> {
    User findByUsername(String username);
}
