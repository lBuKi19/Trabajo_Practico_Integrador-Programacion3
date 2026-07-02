package com.tp.jpa.util;

import jakarta.persistence.EntityManagerFactory;
import jakarta.persistence.Persistence;

public class JPAUtil {

    private static EntityManagerFactory emf = Persistence.createEntityManagerFactory("miPersistencia");

    public static EntityManagerFactory getEntityManagerFactory() {
        return emf;
    }

}
