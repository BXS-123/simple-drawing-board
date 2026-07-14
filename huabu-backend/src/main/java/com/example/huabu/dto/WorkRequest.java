
package com.example.huabu.dto;

import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.Data;

@Data
public class WorkRequest {
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
}
