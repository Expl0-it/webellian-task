package com.jobsearch.webelliantask.controller;

import tools.jackson.databind.ObjectMapper;
import com.jobsearch.webelliantask.model.Cover;
import com.jobsearch.webelliantask.model.CoverType;
import com.jobsearch.webelliantask.model.InsuranceProduct;
import com.jobsearch.webelliantask.model.ProductType;
import com.jobsearch.webelliantask.repository.InsuranceProductRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.webmvc.test.autoconfigure.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;

import static org.hamcrest.Matchers.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@SpringBootTest
@AutoConfigureMockMvc
@Transactional
class InsuranceProductControllerIntegrationTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private InsuranceProductRepository productRepository;

    @Autowired
    private ObjectMapper objectMapper;

    @BeforeEach
    void cleanDatabase() {
        productRepository.deleteAll();
    }

    @Test
    void shouldCreateAndRetrieveInsuranceProduct() throws Exception {
        InsuranceProduct newProduct = InsuranceProduct.builder()
                .name("Integration Test Product")
                .type(ProductType.HOME)
                .description("Test home product")
                .basePremium(new BigDecimal("100.00"))
                .active(true)
                .build();

        // Create product
        String productJson = objectMapper.writeValueAsString(newProduct);
        String responseContent = mockMvc.perform(post("/api/products")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(productJson))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.id", notNullValue()))
                .andExpect(jsonPath("$.name", is("Integration Test Product")))
                .andExpect(jsonPath("$.type", is("HOME")))
                .andExpect(jsonPath("$.basePremium", is(100.00)))
                .andExpect(jsonPath("$.active", is(true)))
                .andReturn().getResponse().getContentAsString();

        InsuranceProduct createdProduct = objectMapper.readValue(responseContent, InsuranceProduct.class);
        Long productId = createdProduct.getId();

        // Get single product
        mockMvc.perform(get("/api/products/" + productId))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.name", is("Integration Test Product")));

        // Update product
        createdProduct.setName("Updated Product Name");
        createdProduct.setBasePremium(new BigDecimal("120.00"));
        String updatedJson = objectMapper.writeValueAsString(createdProduct);

        mockMvc.perform(put("/api/products/" + productId)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(updatedJson))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.name", is("Updated Product Name")))
                .andExpect(jsonPath("$.basePremium", is(120.00)));

        // Add a cover
        Cover newCover = Cover.builder()
                .name("Accidental Damage")
                .coverType(CoverType.PROPERTY_DAMAGE)
                .coverageLimit(new BigDecimal("5000.00"))
                .description("Covers accidental property damage")
                .build();

        String coverJson = objectMapper.writeValueAsString(newCover);
        mockMvc.perform(post("/api/products/" + productId + "/covers")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(coverJson))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.id", notNullValue()))
                .andExpect(jsonPath("$.name", is("Accidental Damage")))
                .andExpect(jsonPath("$.coverageLimit", is(5000.00)));

        // Retrieve covers list
        mockMvc.perform(get("/api/products/" + productId + "/covers"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$", hasSize(1)))
                .andExpect(jsonPath("$[0].name", is("Accidental Damage")));

        // Delete product (should cascade delete cover)
        mockMvc.perform(delete("/api/products/" + productId))
                .andExpect(status().isNoContent());

        // Verify product is gone
        mockMvc.perform(get("/api/products/" + productId))
                .andExpect(status().isNotFound());
    }

    @Test
    void shouldReturnBadRequestWhenCreatingInvalidProduct() throws Exception {
        // Base premium <= 0 and empty name
        InsuranceProduct invalidProduct = InsuranceProduct.builder()
                .name("")
                .type(ProductType.LIFE)
                .basePremium(new BigDecimal("-5.00"))
                .active(true)
                .build();

        String invalidJson = objectMapper.writeValueAsString(invalidProduct);
        mockMvc.perform(post("/api/products")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(invalidJson))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.errors.name", notNullValue()))
                .andExpect(jsonPath("$.errors.basePremium", notNullValue()));
    }

    @Test
    void shouldReturnBadRequestWhenCoverDoesNotBelongToProduct() throws Exception {
        // Create Product 1
        InsuranceProduct p1 = InsuranceProduct.builder()
                .name("Product 1")
                .type(ProductType.TRAVEL)
                .basePremium(new BigDecimal("10.00"))
                .active(true)
                .build();
        p1 = productRepository.save(p1);

        // Create Product 2
        InsuranceProduct p2 = InsuranceProduct.builder()
                .name("Product 2")
                .type(ProductType.HOME)
                .basePremium(new BigDecimal("20.00"))
                .active(true)
                .build();
        p2 = productRepository.save(p2);

        // Add a cover to Product 2
        Cover coverOfP2 = Cover.builder()
                .name("Accidental cover of P2")
                .coverType(CoverType.PROPERTY_DAMAGE)
                .coverageLimit(new BigDecimal("1000.00"))
                .product(p2)
                .build();
        p2.getCovers().add(coverOfP2);
        p2 = productRepository.save(p2);
        Cover savedCoverOfP2 = p2.getCovers().get(0);

        // Attempt to update Cover of Product 2 using Product 1's ID
        Cover updatePayload = Cover.builder()
                .name("Mismatched Update")
                .coverType(CoverType.PROPERTY_DAMAGE)
                .coverageLimit(new BigDecimal("2000.00"))
                .build();

        String updateJson = objectMapper.writeValueAsString(updatePayload);
        mockMvc.perform(put("/api/products/" + p1.getId() + "/covers/" + savedCoverOfP2.getId())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(updateJson))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.error", is("Bad Request")))
                .andExpect(jsonPath("$.message", containsString("Cover does not belong to the specified product")));

        // Attempt to delete Cover of Product 2 using Product 1's ID
        mockMvc.perform(delete("/api/products/" + p1.getId() + "/covers/" + savedCoverOfP2.getId()))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.error", is("Bad Request")))
                .andExpect(jsonPath("$.message", containsString("Cover does not belong to the specified product")));
    }
}

