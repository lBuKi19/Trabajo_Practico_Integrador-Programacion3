package com.tp.jpa.model;
import com.tp.jpa.model.enums.Estado;
import com.tp.jpa.model.enums.FormaPago;
import jakarta.persistence.*;

import lombok.*;
import lombok.experimental.SuperBuilder;
import java.time.LocalDate;
import java.util.HashSet;
import java.util.Set;

@Getter
@Setter
@ToString(onlyExplicitlyIncluded = true)
@SuperBuilder
@NoArgsConstructor
@AllArgsConstructor
@EqualsAndHashCode(callSuper = true, onlyExplicitlyIncluded = true)

@Entity
public class Pedido extends Base implements Calculable {
    private LocalDate fecha;
    @ToString.Include
    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private Estado estado;
    @ToString.Include
    @Column(nullable = false)
    private Double total;
    @ToString.Include
    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private FormaPago formaPago;



    @OneToMany(cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    @JoinColumn(name = "pedido_id")
    @Builder.Default
    private Set<DetallePedido> detalles = new HashSet<>();



    public void addDetallePedido(int cantidad, Producto producto) {
        DetallePedido detalle = new DetallePedido(cantidad, producto);
        detalles.add(detalle);
        calcularTotal();
    }

    public DetallePedido findDetallePedidoByProducto(Producto producto) {
        for (DetallePedido d: detalles) {
            if (d.getProducto().equals(producto)) {
                return d;
            }
        }
        return null;
    }

    public void deleteDetallePedidoByProducto(Producto producto) {
        DetallePedido detalle = findDetallePedidoByProducto(producto);

        if (detalle != null) {
            detalles.remove(detalle);
            calcularTotal();
        }
    }

    @Override
    public void calcularTotal() {
        total = detalles.stream()
                .mapToDouble(d -> d.getSubtotal() != null ? d.getSubtotal() : 0.0)
                .sum();
    }


    public Set<DetallePedido> getDetalles() {
        return detalles;
    }


    public int cantidadTotalItems() {
        return detalles.stream()
                .mapToInt(DetallePedido::getCantidad)
                .sum();
    }

}
