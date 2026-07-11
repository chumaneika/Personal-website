package com.malik.personal_website.entities;

import com.malik.personal_website.enums.SkillCategory;
import com.malik.personal_website.enums.SkillLevel;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.Table;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Getter
@NoArgsConstructor
@Entity
@Table(name = "skills")
public class SkillEntity extends BaseEntity {

    @Column(name = "name", nullable = false, length = 120)
    private String name;

    @Enumerated(EnumType.STRING)
    @Column(name = "category", nullable = false, length = 32)
    private SkillCategory category;

    @Enumerated(EnumType.STRING)
    @Column(name = "level", nullable = false, length = 32)
    private SkillLevel level;

    @Column(name = "sort_order", nullable = false)
    private int sortOrder = 0;

    @Column(name = "visible", nullable = false)
    private boolean visible = true;

    public void setName(String name) {
        this.name = requireText(name, "name", 120);
    }

    public void setCategory(SkillCategory category) {
        this.category = requireValue(category, "category");
    }

    public void setLevel(SkillLevel level) {
        this.level = requireValue(level, "level");
    }

    public void setSortOrder(int sortOrder) {
        if (sortOrder < 0) {
            throw new IllegalArgumentException("sortOrder must not be negative");
        }
        this.sortOrder = sortOrder;
    }

    public void setVisible(boolean visible) {
        this.visible = visible;
    }
}
