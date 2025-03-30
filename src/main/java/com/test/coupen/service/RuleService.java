package com.test.coupen.service;

import com.test.coupen.entity.RuleEntity;
import com.test.coupen.repository.RuleRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class RuleService {

    @Autowired
    private RuleRepository ruleRepository;

    public List<RuleEntity> getAllRules() {
        return ruleRepository.findAll();
    }
}
