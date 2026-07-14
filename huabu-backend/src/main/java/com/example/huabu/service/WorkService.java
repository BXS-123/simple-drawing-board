
package com.example.huabu.service;

import com.example.huabu.dto.WorkRequest;
import com.example.huabu.entity.Work;

import java.util.List;

public interface WorkService {
    Work createWork(Integer userId, WorkRequest request);
    Work updateWork(Integer userId, Integer workId, WorkRequest request);
    Work getWork(Integer userId, Integer workId);
    List<Work> getUserWorks(Integer userId);
    boolean deleteWork(Integer userId, Integer workId);
}
