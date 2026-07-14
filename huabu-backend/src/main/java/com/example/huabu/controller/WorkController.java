
package com.example.huabu.controller;

import com.example.huabu.dto.ApiResponse;
import com.example.huabu.dto.WorkRequest;
import com.example.huabu.dto.WorkResponse;
import com.example.huabu.entity.Work;
import com.example.huabu.service.WorkService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/works")
public class WorkController {
    
    @Autowired
    private WorkService workService;
    
    @GetMapping
    public ApiResponse<List<WorkResponse>> getUserWorks(Authentication authentication) {
        Integer userId = (Integer) authentication.getPrincipal();
        List<Work> works = workService.getUserWorks(userId);
        List<WorkResponse> responses = works.stream()
                .map(this::convertToResponse)
                .collect(Collectors.toList());
        return ApiResponse.success(responses);
    }
    
    @GetMapping("/{id}")
    public ApiResponse<WorkResponse> getWork(@PathVariable("id") Integer id,
                                             Authentication authentication) {
        Integer userId = (Integer) authentication.getPrincipal();
        Work work = workService.getWork(userId, id);
        if (work == null) {
            return ApiResponse.error("作品不存在");
        }
        return ApiResponse.success(convertToResponse(work));
    }
    
    @PostMapping
    public ApiResponse<WorkResponse> createWork(@RequestBody WorkRequest request,
                                                Authentication authentication) {
        Integer userId = (Integer) authentication.getPrincipal();
        Work work = workService.createWork(userId, request);
        return ApiResponse.success(convertToResponse(work));
    }
    
    @PutMapping("/{id}")
    public ApiResponse<WorkResponse> updateWork(@PathVariable("id") Integer id,
                                                @RequestBody WorkRequest request,
                                                Authentication authentication) {
        Integer userId = (Integer) authentication.getPrincipal();
        Work work = workService.updateWork(userId, id, request);
        return ApiResponse.success(convertToResponse(work));
    }
    
    @DeleteMapping("/{id}")
    public ApiResponse<String> deleteWork(@PathVariable("id") Integer id,
                                          Authentication authentication) {
        Integer userId = (Integer) authentication.getPrincipal();
        workService.deleteWork(userId, id);
        return ApiResponse.success(null, "删除成功");
    }
    
    private WorkResponse convertToResponse(Work work) {
        WorkResponse response = new WorkResponse();
        response.setId(work.getId());
        response.setTitle(work.getTitle());
        response.setCanvasData(work.getCanvasData());
        response.setThumbnail(work.getThumbnail());
        response.setCanvasWidth(work.getCanvasWidth());
        response.setCanvasHeight(work.getCanvasHeight());
        response.setDrawingTime(work.getDrawingTime());
        response.setCreatedAt(work.getCreatedAt());
        response.setUpdatedAt(work.getUpdatedAt());
        return response;
    }
}
