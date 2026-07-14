
package com.example.huabu.dto;

import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.Data;

import java.time.LocalDateTime;

@Data
public class WorkResponse {
    private Integer id;
    private String title;
    
    @JsonProperty("canvas_data")
    private String canvasData;
    
    private String thumbnail;
    
    @JsonProperty("canvas_width")
    private Integer canvasWidth;
    
    @JsonProperty("canvas_height")
    private Integer canvasHeight;
    
    @JsonProperty("drawing_time")
    private Long drawingTime;
    
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
