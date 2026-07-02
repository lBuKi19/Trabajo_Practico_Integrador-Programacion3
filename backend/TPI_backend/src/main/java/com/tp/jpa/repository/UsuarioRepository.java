package com.tp.jpa.repository;

import jakarta.persistence.EntityManager;
import com.tp.jpa.model.Pedido;
import com.tp.jpa.model.Usuario;

import java.util.List;
import java.util.Optional;

public class UsuarioRepository extends BaseRepository<Usuario>{
    public UsuarioRepository() {
        super(Usuario.class);
    }

    // busca usuario por email y lo devuelve
    public Optional<Usuario> buscarPorMail(String mail) {
        EntityManager em = emf.createEntityManager();
        try {
            List<Usuario> encontrado = em.createQuery(
                            "SELECT u FROM Usuario u WHERE u.mail = :mail AND u.eliminado = false", Usuario.class)
                    .setParameter("mail", mail)
                    .getResultList();
            return encontrado.isEmpty()
                    ? Optional.empty()
                    : Optional.of(encontrado.get(0));
        } finally {
            em.close();
        }
    }

    //busca pedidos por usuario, filtrando por pedidos no eliminados
    public List<Pedido> buscarPedidosPorUsuario(Long idUsuario) {
        EntityManager em = emf.createEntityManager();

        try {

            String jpql = """
                    SELECT p
                    FROM Usuario u
                    JOIN u.pedidos p
                    WHERE u.id = :uid
                    AND p.eliminado = false
                    """;

            return em.createQuery(jpql, Pedido.class)
                    .setParameter("uid", idUsuario)
                    .getResultList();

        } finally {
            em.close();
        }
    }

}
