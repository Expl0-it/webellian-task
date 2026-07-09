package com.jobsearch.webelliantask.model;

import com.fasterxml.jackson.annotation.JsonManagedReference;
import jakarta.persistence.*;
import jakarta.validation.Valid;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "insurance_products")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class InsuranceProduct {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @NotBlank(message = "Product name is required")
    @Column(nullable = false)
    private String name;

    @NotNull(message = "Product type is required")
    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private ProductType type;

    @Column(length = 1000)
    private String description;

    @NotNull(message = "Base premium is required")
    @DecimalMin(value = "0.00", inclusive = false, message = "Base premium must be greater than 0")
    @Column(name = "base_premium", nullable = false, precision = 10, scale = 2)
    private BigDecimal basePremium;

    @NotNull(message = "Active status is required")
    @Column(nullable = false)
    private Boolean active;

    @Column(name = "creation_datetime", nullable = false, updatable = false)
    private LocalDateTime creationDatetime;

    @OneToMany(mappedBy = "product", cascade = CascadeType.ALL, orphanRemoval = true, fetch = FetchType.LAZY)
    @JsonManagedReference
    @Builder.Default
    @Valid
    private List<Cover> covers = new ArrayList<>();

    @PrePersist
    protected void onCreate() {
        if (this.creationDatetime == null) {
            this.creationDatetime = LocalDateTime.now();
        }
        if (this.active == null) {
            this.active = true;
        }
    }
}
