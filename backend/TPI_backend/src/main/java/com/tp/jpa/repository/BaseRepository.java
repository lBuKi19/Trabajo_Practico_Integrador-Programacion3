package com.tp.jpa.repository;

import com.tp.jpa.model.Base;
import jakarta.persistence.EntityManager;
import jakarta.persistence.EntityManagerFactory;
import com.tp.jpa.util.JPAUtil;

import java.util.List;
import java.util.Optional;

public abstract class BaseRepository<T> {

    protected EntityManagerFactory emf;
    private Class<T> entityClass;

    public BaseRepository(Class<T> entityClass) {
        this.entityClass = entityClass;
        this.emf = JPAUtil.getEntityManagerFactory();
    }

    public T guardar(T entity) {
        EntityManager em = emf.createEntityManager();

        try {
            em.getTransaction().begin();

            Base baseEntity = (Base) entity;

            if (baseEntity.getId() == null) {
                em.persist(entity);
            } else {
                entity = em.merge(entity);
            }

            em.getTransaction().commit();
            return entity;

        } catch (Exception e) {
            if (em.getTransaction().isActive()) {
                em.getTransaction().rollback();
                System.out.println("Transaccion revertida por error");
            }

            throw e;

        } finally {
            em.close();
        }
    }

    public Optional<T> buscarPorId(Long id) {
        EntityManager em = emf.createEntityManager();

        try {
            T entity = em.find(entityClass, id);
            return Optional.ofNullable(entity);

        } finally {
            em.close();
        }
    }

    public List<T> listarActivos() {
        EntityManager em = emf.createEntityManager();

        try {
            String jpql = "SELECT e FROM " + entityClass.getSimpleName() + " e WHERE e.eliminado = false";

            return em.createQuery(jpql, entityClass)
                    .getResultList();

        } finally {
            em.close();
        }
    }

    public boolean eliminarLogico(Long id) {
        EntityManager em = emf.createEntityManager();

        try {
            T entity = em.find(entityClass, id);

            if (entity == null) {
                return false;
            }

            em.getTransaction().begin();

            ((Base) entity).setEliminado(true);

            em.merge(entity);
            em.getTransaction().commit();

            return true;

        } catch (Exception e) {
            if (em.getTransaction().isActive()) {
                em.getTransaction().rollback();
                System.out.println("Transaccion revertida por error");
            }

            throw e;

        } finally {
            em.close();
        }
    }
}
