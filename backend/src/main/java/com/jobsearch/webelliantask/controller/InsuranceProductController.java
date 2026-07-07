package com.jobsearch.webelliantask.controller;

import com.jobsearch.webelliantask.model.Cover;
import com.jobsearch.webelliantask.model.InsuranceProduct;
import com.jobsearch.webelliantask.service.InsuranceProductService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/products")
@CrossOrigin(origins = "*")
public class InsuranceProductController {

    private final InsuranceProductService productService;

    @Autowired
    public InsuranceProductController(InsuranceProductService productService) {
        this.productService = productService;
    }

    @GetMapping
    public ResponseEntity<List<InsuranceProduct>> getAllProducts() {
        return ResponseEntity.ok(productService.getAllProducts());
    }

    @GetMapping("/{id}")
    public ResponseEntity<InsuranceProduct> getProductById(@PathVariable Long id) {
        return ResponseEntity.ok(productService.getProductById(id));
    }

    @PostMapping
    public ResponseEntity<InsuranceProduct> createProduct(@Valid @RequestBody InsuranceProduct product) {
        InsuranceProduct created = productService.createProduct(product);
        return new ResponseEntity<>(created, HttpStatus.CREATED);
    }

    @PutMapping("/{id}")
    public ResponseEntity<InsuranceProduct> updateProduct(
            @PathVariable Long id,
            @Valid @RequestBody InsuranceProduct product) {
        return ResponseEntity.ok(productService.updateProduct(id, product));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteProduct(@PathVariable Long id) {
        productService.deleteProduct(id);
        return ResponseEntity.noContent().build();
    }

    // Cover Endpoints related to a product

    @GetMapping("/{id}/covers")
    public ResponseEntity<List<Cover>> getCoversByProductId(@PathVariable Long id) {
        return ResponseEntity.ok(productService.getCoversByProductId(id));
    }

    @PostMapping("/{id}/covers")
    public ResponseEntity<Cover> addCoverToProduct(
            @PathVariable Long id,
            @Valid @RequestBody Cover cover) {
        Cover created = productService.addCoverToProduct(id, cover);
        return new ResponseEntity<>(created, HttpStatus.CREATED);
    }

    @PutMapping("/{id}/covers/{coverId}")
    public ResponseEntity<Cover> updateCover(
            @PathVariable Long id,
            @PathVariable Long coverId,
            @Valid @RequestBody Cover cover) {
        return ResponseEntity.ok(productService.updateCover(id, coverId, cover));
    }

    @DeleteMapping("/{id}/covers/{coverId}")
    public ResponseEntity<Void> deleteCover(@PathVariable Long id, @PathVariable Long coverId) {
        productService.deleteCover(id, coverId);
        return ResponseEntity.noContent().build();
    }
}
