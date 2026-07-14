
package com.example.huabu.service.impl;

import com.example.huabu.dto.WorkRequest;
import com.example.huabu.entity.Work;
import com.example.huabu.mapper.WorkMapper;
import com.example.huabu.service.WorkService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;

@Service
public class WorkServiceImpl implements WorkService {
    
    @Autowired
    private WorkMapper workMapper;
    
    @Override
    @Transactional
    public Work createWork(Integer userId, WorkRequest request) {
        Work work = new Work();
        work.setUserId(userId);
        work.setTitle(request.getTitle() != null ? request.getTitle() : "未命名作品");
        work.setCanvasData(request.getCanvasData());
        work.setThumbnail(request.getThumbnail());
        work.setCanvasWidth(request.getCanvasWidth() != null ? request.getCanvasWidth() : 800);
        work.setCanvasHeight(request.getCanvasHeight() != null ? request.getCanvasHeight() : 600);
        work.setDrawingTime(request.getDrawingTime() != null ? request.getDrawingTime() : 0L);
        work.setCreatedAt(LocalDateTime.now());
        work.setUpdatedAt(LocalDateTime.now());
        
        workMapper.insert(work);
        return work;
    }
    
    @Override
    @Transactional
    public Work updateWork(Integer userId, Integer workId, WorkRequest request) {
        Work work = getWork(userId, workId);
        if (work == null) {
            throw new RuntimeException("作品不存在");
        }
        
        if (request.getTitle() != null) {
            work.setTitle(request.getTitle());
        }
        if (request.getCanvasData() != null) {
            work.setCanvasData(request.getCanvasData());
        }
        if (request.getThumbnail() != null) {
            work.setThumbnail(request.getThumbnail());
        }
        if (request.getCanvasWidth() != null) {
            work.setCanvasWidth(request.getCanvasWidth());
        }
        if (request.getCanvasHeight() != null) {
            work.setCanvasHeight(request.getCanvasHeight());
        }
        if (request.getDrawingTime() != null) {
            work.setDrawingTime(request.getDrawingTime());
        }
        work.setUpdatedAt(LocalDateTime.now());
        
        workMapper.updateById(work);
        return work;
    }
    
    @Override
    public Work getWork(Integer userId, Integer workId) {
        Work work = workMapper.selectById(workId);
        if (work == null || !work.getUserId().equals(userId)) {
            return null;
        }
        return work;
    }
    
    @Override
    public List<Work> getUserWorks(Integer userId) {
        return workMapper.findByUserId(userId);
    }
    
    @Override
    @Transactional
    public boolean deleteWork(Integer userId, Integer workId) {
        Work work = getWork(userId, workId);
        if (work == null) {
            throw new RuntimeException("作品不存在");
        }
        
        workMapper.deleteById(workId);
        return true;
    }
}
