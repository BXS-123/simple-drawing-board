
package com.example.huabu.config;

import org.mybatis.spring.annotation.MapperScan;
import org.springframework.context.annotation.Configuration;

@Configuration
@MapperScan("com.example.huabu.mapper")
public class MyBatisPlusConfig {
}
