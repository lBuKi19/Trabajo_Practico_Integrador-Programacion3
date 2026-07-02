package com.tp.jpa.model;
import jakarta.persistence.*;
import com.tp.jpa.model.enums.Rol;
import lombok.*;
import lombok.experimental.SuperBuilder;
import java.util.HashSet;
import java.util.Set;

@Getter
@Setter
@ToString(onlyExplicitlyIncluded = true)
@SuperBuilder
@AllArgsConstructor
@NoArgsConstructor
@EqualsAndHashCode(callSuper = true, onlyExplicitlyIncluded = true)

@Entity
public class Usuario extends Base {
    @ToString.Include
    @Column(nullable = false)
    private String nombre;
    @ToString.Include
    @Column(nullable = false)
    private String apellido;
    @ToString.Include
    @Column(nullable = false, unique = true)
    private String mail;
    private String celular;
    @Column(nullable = false)
    private String contrasena;
    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    @ToString.Include
    private Rol rol;

    @Builder.Default
    @OneToMany(cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    @JoinColumn(name = "usuario_id")
    private Set<Pedido> pedidos = new HashSet<>();


    public Usuario(String nombre, String apellido, String mail, String celular, String contrasena, Rol rol) {
        this.nombre = nombre;
        this.apellido = apellido;
        this.mail = mail;
        this.celular = celular;
        this.contrasena = contrasena;
        this.rol = rol;
    }

    public void agregarPedido(Pedido pedido) {
        pedidos.add(pedido);
    }


}

