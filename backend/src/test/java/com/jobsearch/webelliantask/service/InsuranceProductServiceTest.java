package com.jobsearch.webelliantask.service;

import com.jobsearch.webelliantask.exception.ResourceNotFoundException;
import com.jobsearch.webelliantask.model.Cover;
import com.jobsearch.webelliantask.model.CoverType;
import com.jobsearch.webelliantask.model.InsuranceProduct;
import com.jobsearch.webelliantask.model.ProductType;
import com.jobsearch.webelliantask.repository.CoverRepository;
import com.jobsearch.webelliantask.repository.InsuranceProductRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class InsuranceProductServiceTest {

    @Mock
    private InsuranceProductRepository productRepository;

    @Mock
    private CoverRepository coverRepository;

    @InjectMocks
    private InsuranceProductService productService;

    private InsuranceProduct sampleProduct;
    private Cover sampleCover;

    @BeforeEach
    void setUp() {
        sampleProduct = InsuranceProduct.builder()
                .id(1L)
                .name("Travel Safe Plus")
                .type(ProductType.TRAVEL)
                .description("Travel insurance description")
                .basePremium(new BigDecimal("25.00"))
                .active(true)
                .covers(new ArrayList<>())
                .build();

        sampleCover = Cover.builder()
                .id(1L)
                .name("Medical Expenses")
                .coverType(CoverType.MEDICAL)
                .coverageLimit(new BigDecimal("10000.00"))
                .description("Medical description")
                .product(sampleProduct)
                .build();

        sampleProduct.getCovers().add(sampleCover);
    }

    @Test
    void getAllProducts_shouldReturnList() {
        when(productRepository.findAll()).thenReturn(Arrays.asList(sampleProduct));

        List<InsuranceProduct> result = productService.getAllProducts();

        assertEquals(1, result.size());
        assertEquals("Travel Safe Plus", result.get(0).getName());
        verify(productRepository, times(1)).findAll();
    }

    @Test
    void getProductById_whenExists_shouldReturnProduct() {
        when(productRepository.findById(1L)).thenReturn(Optional.of(sampleProduct));

        InsuranceProduct result = productService.getProductById(1L);

        assertNotNull(result);
        assertEquals(1L, result.getId());
        verify(productRepository, times(1)).findById(1L);
    }

    @Test
    void getProductById_whenNotExists_shouldThrowException() {
        when(productRepository.findById(99L)).thenReturn(Optional.empty());

        assertThrows(ResourceNotFoundException.class, () -> productService.getProductById(99L));
        verify(productRepository, times(1)).findById(99L);
    }

    @Test
    void createProduct_shouldSaveAndReturn() {
        when(productRepository.save(any(InsuranceProduct.class))).thenReturn(sampleProduct);

        InsuranceProduct result = productService.createProduct(sampleProduct);

        assertNotNull(result);
        assertEquals("Travel Safe Plus", result.getName());
        verify(productRepository, times(1)).save(sampleProduct);
    }

    @Test
    void updateProduct_whenExists_shouldUpdateAndSave() {
        InsuranceProduct updatedDetails = InsuranceProduct.builder()
                .name("Travel Safe Extreme")
                .type(ProductType.TRAVEL)
                .description("New Description")
                .basePremium(new BigDecimal("35.00"))
                .active(false)
                .build();

        when(productRepository.findById(1L)).thenReturn(Optional.of(sampleProduct));
        when(productRepository.save(any(InsuranceProduct.class))).thenReturn(sampleProduct);

        InsuranceProduct result = productService.updateProduct(1L, updatedDetails);

        assertNotNull(result);
        assertEquals("Travel Safe Extreme", result.getName());
        assertEquals(new BigDecimal("35.00"), result.getBasePremium());
        assertFalse(result.getActive());
        verify(productRepository, times(1)).findById(1L);
        verify(productRepository, times(1)).save(sampleProduct);
    }

    @Test
    void deleteProduct_whenExists_shouldDelete() {
        when(productRepository.findById(1L)).thenReturn(Optional.of(sampleProduct));
        doNothing().when(productRepository).delete(sampleProduct);

        productService.deleteProduct(1L);

        verify(productRepository, times(1)).findById(1L);
        verify(productRepository, times(1)).delete(sampleProduct);
    }

    @Test
    void addCoverToProduct_shouldLinkAndSave() {
        Cover newCover = Cover.builder()
                .name("Baggage Loss")
                .coverType(CoverType.BAGGAGE)
                .coverageLimit(new BigDecimal("1000.00"))
                .build();

        when(productRepository.findById(1L)).thenReturn(Optional.of(sampleProduct));
        when(coverRepository.save(any(Cover.class))).thenAnswer(invocation -> invocation.getArgument(0));

        Cover result = productService.addCoverToProduct(1L, newCover);

        assertNotNull(result);
        assertEquals(sampleProduct, result.getProduct());
        verify(productRepository, times(1)).findById(1L);
        verify(coverRepository, times(1)).save(newCover);
    }

    @Test
    void updateCover_whenBelongsToProduct_shouldUpdateAndSave() {
        Cover updatedCover = Cover.builder()
                .name("New Cover Name")
                .coverType(CoverType.LIABILITY)
                .coverageLimit(new BigDecimal("20000.00"))
                .description("New Description")
                .build();

        when(productRepository.findById(1L)).thenReturn(Optional.of(sampleProduct));
        when(coverRepository.findById(1L)).thenReturn(Optional.of(sampleCover));
        when(coverRepository.save(any(Cover.class))).thenAnswer(invocation -> invocation.getArgument(0));

        Cover result = productService.updateCover(1L, 1L, updatedCover);

        assertEquals("New Cover Name", result.getName());
        assertEquals(CoverType.LIABILITY, result.getCoverType());
        assertEquals(new BigDecimal("20000.00"), result.getCoverageLimit());
        verify(coverRepository, times(1)).findById(1L);
        verify(coverRepository, times(1)).save(sampleCover);
    }

    @Test
    void updateCover_whenDoesNotBelongsToProduct_shouldThrowException() {
        Cover anotherCover = Cover.builder()
                .id(2L)
                .name("Health Cover")
                .product(InsuranceProduct.builder().id(2L).build()) // belongs to product 2
                .build();

        when(productRepository.findById(1L)).thenReturn(Optional.of(sampleProduct));
        when(coverRepository.findById(2L)).thenReturn(Optional.of(anotherCover));

        assertThrows(IllegalArgumentException.class, () -> productService.updateCover(1L, 2L, anotherCover));
    }

    @Test
    void deleteCover_whenBelongsToProduct_shouldDelete() {
        when(productRepository.findById(1L)).thenReturn(Optional.of(sampleProduct));
        when(coverRepository.findById(1L)).thenReturn(Optional.of(sampleCover));
        doNothing().when(coverRepository).delete(sampleCover);

        productService.deleteCover(1L, 1L);

        verify(coverRepository, times(1)).delete(sampleCover);
    }
}
