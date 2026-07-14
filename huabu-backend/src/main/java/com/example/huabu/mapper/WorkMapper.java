
package com.example.huabu.mapper;

import com.baomidou.mybatisplus.core.mapper.BaseMapper;
import com.example.huabu.entity.Work;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;

import java.util.List;

@Mapper
public interface WorkMapper extends BaseMapper<Work> {
    List<Work> findByUserId(@Param("userId") Integer userId);
}
