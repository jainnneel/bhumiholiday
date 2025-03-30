package com.test.coupen.service;

import org.springframework.stereotype.Service;

@Service
public class RewardService {

    public void applyRewardPoints(int points) {
        System.out.println("✅ Applied " + points + " reward points!");
    }
}
