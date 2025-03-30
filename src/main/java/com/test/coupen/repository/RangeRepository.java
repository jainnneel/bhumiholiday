package com.test.coupen.repository;

import com.test.coupen.entity.RangeEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface RangeRepository extends JpaRepository<RangeEntity, Long> {
}
