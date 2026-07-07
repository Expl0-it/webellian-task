package com.jobsearch.webelliantask.repository;

import com.jobsearch.webelliantask.model.Cover;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface CoverRepository extends JpaRepository<Cover, Long> {
    List<Cover> findByProductId(Long productId);
}
