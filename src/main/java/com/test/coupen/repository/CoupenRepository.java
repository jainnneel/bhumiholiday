package com.test.coupen.repository;

import com.test.coupen.entity.CoupenEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface CoupenRepository extends JpaRepository<CoupenEntity, Long> {

    List<CoupenEntity> findByCoupenCode(String coupenName);
}

