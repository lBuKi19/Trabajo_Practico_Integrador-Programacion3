package com.tp.jpa.repository;

import jakarta.persistence.EntityManager;
import com.tp.jpa.model.Pedido;
import com.tp.jpa.model.enums.Estado;

import java.util.List;

public class PedidoRepository extends BaseRepository<Pedido>{
    public PedidoRepository() {
        super(Pedido.class);
    }

    // Devuelve la lista de pedidos por estado
    public List<Pedido> buscarPorEstado(Estado estado) {
        EntityManager em = emf.createEntityManager();
        try {
            List<Pedido> pedidoXEstado = em.createQuery(
                            "SELECT p FROM Pedido p WHERE p.estado = :estado AND p.eliminado = false", Pedido.class)
                    .setParameter("estado", estado)
                    .getResultList();
            return pedidoXEstado;
        } finally {
            em.close();
        }
    }
}
