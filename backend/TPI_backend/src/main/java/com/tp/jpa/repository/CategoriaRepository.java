package com.tp.jpa.repository;

import jakarta.persistence.EntityManager;
import com.tp.jpa.model.Categoria;
import com.tp.jpa.model.Producto;
import java.util.List;

public class CategoriaRepository extends BaseRepository<Categoria> {

    public CategoriaRepository() {
        super(Categoria.class);
    }

    //consulta retorna productos activos que pertenecen a la categoria especificada
    public List<Producto> buscarProductosPorCategoria(Long categoriaId) {
        EntityManager em = emf.createEntityManager();

        try {

            String jpql = """
                    SELECT p
                    FROM Categoria c
                    JOIN c.productos p
                    WHERE c.id = :catId
                    AND p.eliminado = false
                    """;

            return em.createQuery(jpql, Producto.class)
                    .setParameter("catId", categoriaId)
                    .getResultList();

        } finally {
            em.close();
        }
    }

    //metodo para poder dar de alta un producto asociandolo a una categoria
    public Producto agregarProductoACategoria(Long categoriaId, Producto producto) {
        EntityManager em = emf.createEntityManager();

        try {
            em.getTransaction().begin();

            Categoria categoria = em.find(Categoria.class, categoriaId);

            if (categoria == null || categoria.isEliminado()) {
                throw new RuntimeException("Categoría inexistente o dada de baja");
            }

            categoria.agregarProducto(producto);

            em.persist(producto);

            em.getTransaction().commit();

            return producto;

        } catch (Exception e) {
            if (em.getTransaction().isActive()) {
                em.getTransaction().rollback();
            }

            throw e;

        } finally {
            em.close();
        }
    }
}
