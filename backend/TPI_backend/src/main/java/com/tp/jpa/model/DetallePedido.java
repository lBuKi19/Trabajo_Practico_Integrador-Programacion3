package com.tp.jpa.model;
import lombok.experimental.SuperBuilder;
import lombok.Getter;
import lombok.Setter;
import lombok.ToString;
import lombok.EqualsAndHashCode;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;
import jakarta.persistence.*;


@Getter
@Setter
@ToString(exclude = "producto")
@SuperBuilder
@NoArgsConstructor
@AllArgsConstructor
@EqualsAndHashCode(callSuper = false, onlyExplicitlyIncluded = true)

@Entity
public class DetallePedido extends Base {
    @Column(nullable = false)
    private int cantidad;
    @Column(nullable = false)
    private Double subtotal;
    @EqualsAndHashCode.Include
    @ManyToOne
    @JoinColumn(name = "producto_id", nullable = false)
    private Producto producto;




    public DetallePedido(int cantidad, Producto producto) {
        this.cantidad = cantidad;
        this.producto = producto;
        this.subtotal = cantidad * producto.getPrecio();
    }

}
