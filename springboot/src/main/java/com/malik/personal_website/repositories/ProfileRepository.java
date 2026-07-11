package com.malik.personal_website.repositories;

import com.malik.personal_website.entities.ProfileEntity;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;

public interface ProfileRepository extends JpaRepository<ProfileEntity, Long> {

    Optional<ProfileEntity> findFirstByOrderByIdAsc();
}
