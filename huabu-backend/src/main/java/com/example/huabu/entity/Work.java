
package com.example.huabu.entity;

import com.baomidou.mybatisplus.annotation.IdType;
import com.baomidou.mybatisplus.annotation.TableField;
import com.baomidou.mybatisplus.annotation.TableId;
import com.baomidou.mybatisplus.annotation.TableName;
import lombok.Data;

import java.time.LocalDateTime;

@Data
@TableName("works")
public class Work {
    
    @TableId(value = "id", type = IdType.AUTO)
    private Integer id;
    
    @TableField("user_id")
    private Integer userId;
    
    @TableField("title")
    private String title;
    
    @TableField("canvas_data")
    private String canvasData;
    
    @TableField("thumbnail")
    private String thumbnail;
    
    @TableField("canvas_width")
    private Integer canvasWidth;
    
    @TableField("canvas_height")
    private Integer canvasHeight;
    
    @TableField("drawing_time")
    private Long drawingTime;
    
    @TableField("created_at")
    private LocalDateTime createdAt;
    
    @TableField("updated_at")
    private LocalDateTime updatedAt;
}
