package com.jobsearch.webelliantask.config;

import com.jobsearch.webelliantask.model.Cover;
import com.jobsearch.webelliantask.model.CoverType;
import com.jobsearch.webelliantask.model.InsuranceProduct;
import com.jobsearch.webelliantask.model.ProductType;
import com.jobsearch.webelliantask.repository.InsuranceProductRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.Arrays;

@Component
public class DatabaseSeeder implements CommandLineRunner {

    private final InsuranceProductRepository productRepository;

    @Autowired
    public DatabaseSeeder(InsuranceProductRepository productRepository) {
        this.productRepository = productRepository;
    }

    @Override
    public void run(String... args) throws Exception {
        if (productRepository.count() == 0) {
            // Seed Data

            // 1. Travel Safe Plus
            InsuranceProduct travelSafe = InsuranceProduct.builder()
                    .name("Travel Safe Plus")
                    .type(ProductType.TRAVEL)
                    .description("Comprehensive coverage for domestic and international trips, including medical emergencies and cancellations.")
                    .basePremium(new BigDecimal("25.00"))
                    .active(true)
                    .creationDatetime(LocalDateTime.now().minusDays(10))
                    .covers(new ArrayList<>())
                    .build();

            Cover travelMedical = Cover.builder()
                    .name("Medical Expenses Abroad")
                    .coverType(CoverType.MEDICAL)
                    .coverageLimit(new BigDecimal("100000.00"))
                    .description("Covers doctor visits, hospitalization, and emergency medical transportation outside country of residence.")
                    .product(travelSafe)
                    .build();

            Cover travelBaggage = Cover.builder()
                    .name("Baggage Loss & Delay")
                    .coverType(CoverType.BAGGAGE)
                    .coverageLimit(new BigDecimal("1500.00"))
                    .description("Reimburses for lost, stolen, or damaged baggage and purchases of essential items due to delay.")
                    .product(travelSafe)
                    .build();

            Cover travelCancellation = Cover.builder()
                    .name("Trip Cancellation")
                    .coverType(CoverType.TRIP_CANCELLATION)
                    .coverageLimit(new BigDecimal("5000.00"))
                    .description("Reimbursement of non-refundable trip payments if you cancel due to unexpected sickness or emergency.")
                    .product(travelSafe)
                    .build();

            travelSafe.getCovers().addAll(Arrays.asList(travelMedical, travelBaggage, travelCancellation));

            // 2. Home Protect Basic
            InsuranceProduct homeProtect = InsuranceProduct.builder()
                    .name("Home Protect Basic")
                    .type(ProductType.HOME)
                    .description("Standard home insurance plan covering structural damage and contents against fire, wind, and theft.")
                    .basePremium(new BigDecimal("45.50"))
                    .active(true)
                    .creationDatetime(LocalDateTime.now().minusDays(5))
                    .covers(new ArrayList<>())
                    .build();

            Cover homeStructure = Cover.builder()
                    .name("Building Structure")
                    .coverType(CoverType.PROPERTY_DAMAGE)
                    .coverageLimit(new BigDecimal("250000.00"))
                    .description("Covers cost of repairing or rebuilding your home after damage from fire, lightning, or explosions.")
                    .product(homeProtect)
                    .build();

            Cover homeTheft = Cover.builder()
                    .name("Theft & Vandalism")
                    .coverType(CoverType.THEFT)
                    .coverageLimit(new BigDecimal("15000.00"))
                    .description("Covers personal belongings stolen from your home or damaged during a break-in.")
                    .product(homeProtect)
                    .build();

            homeProtect.getCovers().addAll(Arrays.asList(homeStructure, homeTheft));

            // 3. Auto Secure Max
            InsuranceProduct autoSecure = InsuranceProduct.builder()
                    .name("Auto Secure Max")
                    .type(ProductType.AUTO)
                    .description("Premium auto insurance package providing liability, collision, and comprehensive hazard protection.")
                    .basePremium(new BigDecimal("89.90"))
                    .active(true)
                    .creationDatetime(LocalDateTime.now().minusDays(2))
                    .covers(new ArrayList<>())
                    .build();

            Cover autoLiability = Cover.builder()
                    .name("Third-Party Liability")
                    .coverType(CoverType.LIABILITY)
                    .coverageLimit(new BigDecimal("1000000.00"))
                    .description("Covers bodily injury and property damage to third parties in an accident where you are at fault.")
                    .product(autoSecure)
                    .build();

            Cover autoDisaster = Cover.builder()
                    .name("Natural Disaster Coverage")
                    .coverType(CoverType.NATURAL_DISASTER)
                    .coverageLimit(new BigDecimal("35000.00"))
                    .description("Covers auto repair costs from weather incidents like hail, flooding, windstorms, or falling objects.")
                    .product(autoSecure)
                    .build();

            autoSecure.getCovers().addAll(Arrays.asList(autoLiability, autoDisaster));

            // 4. Life Term Standard
            InsuranceProduct lifeStandard = InsuranceProduct.builder()
                    .name("Life Term Standard")
                    .type(ProductType.LIFE)
                    .description("Provides financial security for your family. A term life policy with fixed premium payments.")
                    .basePremium(new BigDecimal("60.00"))
                    .active(false)
                    .creationDatetime(LocalDateTime.now().minusDays(20))
                    .covers(new ArrayList<>())
                    .build();

            Cover lifeMedical = Cover.builder()
                    .name("Critical Illness Rider")
                    .coverType(CoverType.MEDICAL)
                    .coverageLimit(new BigDecimal("100000.00"))
                    .description("Additional payout upon diagnosis of a covered critical illness.")
                    .product(lifeStandard)
                    .build();

            lifeStandard.getCovers().add(lifeMedical);

            productRepository.saveAll(Arrays.asList(travelSafe, homeProtect, autoSecure, lifeStandard));
            System.out.println("Database seeded with sample insurance products and covers.");
        }
    }
}
