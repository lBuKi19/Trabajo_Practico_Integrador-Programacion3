package com.tp.jpa.model;

import lombok.*;
import lombok.experimental.SuperBuilder;

import java.util.HashSet;
import java.util.Set;
import jakarta.persistence.*;

@Getter
@Setter
@ToString(onlyExplicitlyIncluded = true)
@SuperBuilder
@NoArgsConstructor
@AllArgsConstructor
@EqualsAndHashCode(callSuper = true, onlyExplicitlyIncluded = true)

@Entity
public class Categoria extends Base {
    @ToString.Include
    @Column(nullable = false)
    private String nombre;
    @ToString.Include
    private String descripcion;


    @OneToMany(cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    @JoinColumn(name = "categoria_id")
    @Builder.Default
    private Set<Producto> productos = new HashSet<>();



    public void agregarProducto(Producto producto) {
        productos.add(producto);
    }
}
