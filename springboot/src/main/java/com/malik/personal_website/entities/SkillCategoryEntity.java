package com.malik.personal_website.entities;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Table;
import jakarta.persistence.UniqueConstraint;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Getter
@NoArgsConstructor
@Entity
@Table(
        name = "skill_category",
        uniqueConstraints = @UniqueConstraint(name = "uk_skill_category_name", columnNames = "name")
)
public class SkillCategoryEntity extends BaseEntity {

    @Column(name = "name", nullable = false, length = 120)
    private String name;

    public void setName(String name) {
        this.name = requireText(name, "name", 120);
    }
}
