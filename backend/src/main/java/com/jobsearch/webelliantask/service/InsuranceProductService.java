package com.jobsearch.webelliantask.service;

import com.jobsearch.webelliantask.exception.ResourceNotFoundException;
import com.jobsearch.webelliantask.model.Cover;
import com.jobsearch.webelliantask.model.InsuranceProduct;
import com.jobsearch.webelliantask.repository.CoverRepository;
import com.jobsearch.webelliantask.repository.InsuranceProductRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@Transactional
public class InsuranceProductService {

    private final InsuranceProductRepository productRepository;
    private final CoverRepository coverRepository;

    @Autowired
    public InsuranceProductService(InsuranceProductRepository productRepository, CoverRepository coverRepository) {
        this.productRepository = productRepository;
        this.coverRepository = coverRepository;
    }

    public List<InsuranceProduct> getAllProducts() {
        return productRepository.findAll();
    }

    public InsuranceProduct getProductById(Long id) {
        return productRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Insurance product not found with id: " + id));
    }

    public InsuranceProduct createProduct(InsuranceProduct product) {
        // Ensure covers are linked back to this product if any are provided during creation
        if (product.getCovers() != null) {
            for (Cover cover : product.getCovers()) {
                cover.setProduct(product);
            }
        }
        return productRepository.save(product);
    }

    public InsuranceProduct updateProduct(Long id, InsuranceProduct updatedProduct) {
        InsuranceProduct existing = getProductById(id);
        existing.setName(updatedProduct.getName());
        existing.setType(updatedProduct.getType());
        existing.setDescription(updatedProduct.getDescription());
        existing.setBasePremium(updatedProduct.getBasePremium());
        existing.setActive(updatedProduct.getActive());
        // We do not overwrite the covers list here to prevent accidental deletion via simple product updates.
        // Covers are managed via specific cover endpoints.
        return productRepository.save(existing);
    }

    public void deleteProduct(Long id) {
        InsuranceProduct existing = getProductById(id);
        productRepository.delete(existing);
    }

    public List<Cover> getCoversByProductId(Long productId) {
        // Verify product exists first
        getProductById(productId);
        return coverRepository.findByProductId(productId);
    }

    public Cover addCoverToProduct(Long productId, Cover cover) {
        InsuranceProduct product = getProductById(productId);
        cover.setProduct(product);
        return coverRepository.save(cover);
    }

    public Cover updateCover(Long productId, Long coverId, Cover updatedCover) {
        // Verify product exists
        getProductById(productId);
        Cover existingCover = coverRepository.findById(coverId)
                .orElseThrow(() -> new ResourceNotFoundException("Cover not found with id: " + coverId));
        
        if (!existingCover.getProduct().getId().equals(productId)) {
            throw new IllegalArgumentException("Cover does not belong to the specified product");
        }

        existingCover.setName(updatedCover.getName());
        existingCover.setCoverType(updatedCover.getCoverType());
        existingCover.setCoverageLimit(updatedCover.getCoverageLimit());
        existingCover.setDescription(updatedCover.getDescription());

        return coverRepository.save(existingCover);
    }

    public void deleteCover(Long productId, Long coverId) {
        // Verify product exists
        getProductById(productId);
        Cover existingCover = coverRepository.findById(coverId)
                .orElseThrow(() -> new ResourceNotFoundException("Cover not found with id: " + coverId));

        if (!existingCover.getProduct().getId().equals(productId)) {
            throw new IllegalArgumentException("Cover does not belong to the specified product");
        }

        coverRepository.delete(existingCover);
    }
}
