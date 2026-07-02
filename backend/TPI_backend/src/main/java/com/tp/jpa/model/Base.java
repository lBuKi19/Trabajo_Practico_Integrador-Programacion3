package com.tp.jpa.model;
import jakarta.persistence.*;
import lombok.*;
import lombok.experimental.SuperBuilder;


import java.time.LocalDateTime;
@ToString(onlyExplicitlyIncluded = true)
@EqualsAndHashCode(onlyExplicitlyIncluded = true)
@Getter
@Setter
@SuperBuilder
@AllArgsConstructor

@MappedSuperclass
public abstract class Base {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @EqualsAndHashCode.Include
    private Long id;

    private boolean eliminado;
    @ToString.Include
    private LocalDateTime createdAt;

    public Base() {
        this.createdAt = LocalDateTime.now();
    }

}
