    import com.tp.jpa.model.*;
    import com.tp.jpa.model.enums.Estado;
    import com.tp.jpa.model.enums.FormaPago;
    import com.tp.jpa.model.enums.Rol;
    import com.tp.jpa.repository.CategoriaRepository;
    import com.tp.jpa.repository.PedidoRepository;
    import com.tp.jpa.repository.ProductoRepository;
    import com.tp.jpa.repository.UsuarioRepository;
    import com.tp.jpa.util.JPAUtil;
    import jakarta.persistence.EntityManager;
    import jakarta.persistence.EntityTransaction;
    import java.time.LocalDate;
    import java.util.ArrayList;
    import java.time.LocalDateTime;
    import java.util.Scanner;
    import java.util.List;
    import java.util.Optional;
    import java.util.Map;
    import java.util.HashMap;
    import java.util.Locale;


    public static void main(String[] args) {

        CategoriaRepository categoriaRepo = new CategoriaRepository();
        ProductoRepository productoRepo = new ProductoRepository();
        UsuarioRepository usuarioRepo = new UsuarioRepository();
        PedidoRepository pedidoRepo = new PedidoRepository();

        int opcion;
        Scanner sc = new Scanner(System.in);

        do {
            System.out.println("\n--- MENU PRINCIPAL ---");
            System.out.println("1 - Gestion Categorias");
            System.out.println("2 - Gestion Productos");
            System.out.println("3 - Gestion Usuarios");
            System.out.println("4 - Gestion Pedidos");
            System.out.println("5 - Reportes");
            System.out.println("0 - Salir");
            System.out.print("Seleccione una opcion: ");

            opcion = sc.nextInt();
            sc.nextLine();
            switch(opcion) {
                case 1:
                    // ir a menu categorias
                    menuCategorias(sc, categoriaRepo);
                    break;

                case 2:
                    // ir a menu productos
                    menuProductos(sc, productoRepo, categoriaRepo);
                    break;

                case 3:
                    // ir a menu usuarios
                    menuUsuarios(sc, usuarioRepo);
                    break;

                case 4:
                    // ir a menu pedidos
                    menuPedidos(sc, pedidoRepo, usuarioRepo, productoRepo, categoriaRepo);
                    break;

                case 5:
                    // ir a reportes
                    menuReportes(sc, productoRepo, categoriaRepo, pedidoRepo, usuarioRepo);
                    break;

                case 0:
                    JPAUtil.getEntityManagerFactory().close();
                    break;

                default:
                    System.out.println("Opcion invalida");
            }


        } while (opcion != 0);

    }

    //MENU CATEGORIAS
    public static void menuCategorias(Scanner sc, CategoriaRepository categoriaRepo) {
        int opcion;
        do {
            System.out.println("Menu Categorias");
            System.out.println("1 - Alta");
            System.out.println("2 - Baja");
            System.out.println("3 - Modificación");
            System.out.println("4 - Listado");
            System.out.println("0 - Salir");
            System.out.print("Seleccione una opcion: ");

            opcion = sc.nextInt();
            sc.nextLine();

            switch(opcion) {
                case 1:
                    // ir a menu categorias
                    String nombre;
                    String descripcion;

                    do {
                        System.out.print("Nombre: ");
                        nombre = sc.nextLine();
                        if (nombre.isEmpty()) {
                            System.out.println("El nombre no puede estar vacio");
                        }
                    } while (nombre.isEmpty());

                    System.out.print("Descripcion: ");
                    descripcion = sc.nextLine();

                    Categoria categoria = Categoria.builder()
                            .nombre(nombre)
                            .descripcion(descripcion)
                            .createdAt(LocalDateTime.now())
                            .build();
                    categoria = categoriaRepo.guardar(categoria);

                    System.out.println("Categoria creada con ID: " + categoria.getId());
                    break;

                case 2:
                    // baja
                    System.out.print("Ingrese el ID de la categoria: ");
                    Long bajaId = sc.nextLong();
                    sc.nextLine();
                    boolean eliminado = categoriaRepo.eliminarLogico(bajaId);

                    if(!eliminado) {
                        System.out.println("No se encontro una categoria con ese ID");
                    } else {
                        System.out.println("Categoria con ID: "+bajaId + " eliminada correctamente");
                    }

                    break;

                case 3:
                    // modificar categoria
                     List<Categoria> categorias = mostrarCategorias(categoriaRepo);

                    Optional<Categoria> encontrada;
                    do {
                        System.out.println("Ingrese ID de la categoria a modificar: ");
                        Long Id = sc.nextLong();
                        sc.nextLine();
                        encontrada = categoriaRepo.buscarPorId(Id);
                        if(encontrada.isEmpty()) {
                            System.out.println("Ingrese una categoria valida");
                        }
                    } while (encontrada.isEmpty());

                    Categoria cat = encontrada.get();
                    System.out.println("Nombre actual: "+cat.getNombre());
                    System.out.println("Descripcion actual: "+cat.getDescripcion());

                    System.out.print("Nuevo nombre (enter para mantener): ");
                    String nuevoNombre = sc.nextLine();
                    System.out.print("Nueva descripcion (enter para mantener): ");
                    String nuevaDescripcion = sc.nextLine();

                    if (!nuevoNombre.isEmpty()) {
                        cat.setNombre(nuevoNombre);
                    }

                    if (!nuevaDescripcion.isEmpty()) {
                        cat.setDescripcion(nuevaDescripcion);
                    }
                    categoriaRepo.guardar(cat);
                    System.out.println("Categoria actualizada correctamente: " +cat.getNombre());
                    break;

                case 4:
                    // listar categorias
                    mostrarCategorias(categoriaRepo);
                    break;

                case 0:
                    break;

                default:
                    System.out.println("Opcion invalida");
            }
        } while (opcion != 0);
    }


    //MENU PRODUCTOS
    public static void menuProductos(Scanner sc, ProductoRepository productoRepo, CategoriaRepository categoriaRepo) {
        int opcion;
        do {
            System.out.println("Menu Productos");
            System.out.println("1 - Alta");
            System.out.println("2 - Modificacion");
            System.out.println("3 - Baja");
            System.out.println("4 - Listado");
            System.out.println("0 - Salir");
            System.out.print("Seleccione una opcion: ");

            opcion = sc.nextInt();
            sc.nextLine();

            switch(opcion) {
                case 1:
                    // alta
                    List<Categoria> categorias = mostrarCategorias(categoriaRepo);
                    if (categorias.isEmpty()) {
                        break;
                    }

                    Optional<Categoria> categoriaOpt;

                    do {
                        System.out.println("Seleccione la categoria por su ID: ");
                        Long categoriaId = sc.nextLong();
                        sc.nextLine();

                        categoriaOpt = categoriaRepo.buscarPorId(categoriaId);
                        if(categoriaOpt.isEmpty() || categoriaOpt.get().isEliminado()) {
                            System.out.println("Categoria invalida");
                        }
                    }while (categoriaOpt.isEmpty() || categoriaOpt.get().isEliminado());

                    Categoria categoria = categoriaOpt.get();

                    String nombre;
                    String descripcion;
                    double precio;
                    int stock;

                    //validar nombre
                    do {
                        System.out.print("Nombre: ");
                        nombre = sc.nextLine();
                        if (nombre.isEmpty()) {
                            System.out.println("El nombre no puede estar vacio");
                        }
                    } while (nombre.isEmpty());

                    System.out.print("Descripcion: ");
                    descripcion = sc.nextLine();

                    //validar precio
                    do {
                        System.out.print("Precio: ");
                        precio = sc.nextDouble();

                        if (precio <= 0) {
                            System.out.println("El precio debe ser mayor a 0");
                        }

                    } while (precio <= 0);

                    //validar stock
                    do {
                        System.out.print("Stock: ");
                        stock = sc.nextInt();

                        if (stock < 0) {
                            System.out.println("El stock no puede ser negativo");
                        }

                    } while (stock < 0);

                    sc.nextLine();

                    Producto producto = Producto.builder()
                            .nombre(nombre)
                            .descripcion(descripcion)
                            .precio(precio)
                            .stock(stock)
                            .disponible(true)
                            .createdAt(LocalDateTime.now())
                            .build();

                    producto = categoriaRepo.agregarProductoACategoria(categoria.getId(), producto);

                    System.out.println("Producto creado con ID: " + producto.getId() + " en la categoria: "+categoria.getNombre());
                    break;

                case 3:
                    // baja
                    System.out.print("Ingrese el ID del producto: ");
                    Long bajaId = sc.nextLong();
                    sc.nextLine();
                    boolean eliminado = productoRepo.eliminarLogico(bajaId);

                    if(!eliminado) {
                        System.out.println("No se encontro un producto con ese ID");
                    } else {
                        Optional<Producto> productoBaja = productoRepo.buscarPorId(bajaId);
                        System.out.println("Producto: "+productoBaja.get().getNombre() + " eliminado correctamente");
                    }

                    break;

                case 2:
                    // modificar producto
                    List<Producto> listaProductos = mostrarProductos(productoRepo, categoriaRepo);

                    if (listaProductos.isEmpty()) {
                        break;
                    }

                    Optional<Producto> productoOpt;

                    do {
                        System.out.print("Ingrese ID del producto a modificar: ");
                        Long id = sc.nextLong();
                        sc.nextLine();

                        productoOpt = productoRepo.buscarPorId(id);

                        if (productoOpt.isEmpty()) {
                            System.out.println("Producto no encontrado");
                        }

                    } while (productoOpt.isEmpty());

                    Producto productoMod = productoOpt.get();

                    System.out.println("Nombre actual: " + productoMod.getNombre());
                    System.out.println("Precio actual: " + productoMod.getPrecio());
                    System.out.println("Stock actual: " + productoMod.getStock());

                    System.out.print("Nuevo nombre (enter para mantener): ");
                    String nuevoNombre = sc.nextLine();
                    System.out.print("Nuevo precio (0 para mantener): ");
                    double nuevoPrecio = sc.nextDouble();
                    System.out.print("Nuevo stock (-1 para mantener): ");
                    int nuevoStock = sc.nextInt();
                    sc.nextLine();

                    if (!nuevoNombre.isEmpty()) {
                        productoMod.setNombre(nuevoNombre);
                    }

                    if (nuevoPrecio > 0) {
                        productoMod.setPrecio(nuevoPrecio);
                    }

                    if (nuevoStock >= 0) {
                        productoMod.setStock(nuevoStock);
                    }

                    productoRepo.guardar(productoMod);
                    System.out.println("Producto actualizado correctmente");

                    break;

                case 4:
                    // listar productos
                    mostrarProductos(productoRepo, categoriaRepo);
                    break;

                case 0:
                    break;

                default:
                    System.out.println("Opcion invalida");
            }
        } while (opcion != 0);
    }

    //MENU USUARIOS
    public static void menuUsuarios(Scanner sc, UsuarioRepository usuarioRepo) {

        int opcion;
        do {
            System.out.println("Menu Usuarios");
            System.out.println("1 - Alta");
            System.out.println("2 - Modificación");
            System.out.println("3 - Baja");
            System.out.println("4 - Listado");
            System.out.println("5 - Buscar por mail");
            System.out.println("0 - Salir");
            System.out.print("Seleccione una opcion: ");

            opcion = sc.nextInt();
            sc.nextLine();

            switch(opcion) {
                case 1:
                    // ir a menu categorias
                    String nombre;
                    String apellido;
                    String mail;
                    String celular;
                    String contrasena;
                    Rol rol;

                    do {
                        System.out.print("Nombre: ");
                        nombre = sc.nextLine();
                        if (nombre.isEmpty()) {
                            System.out.println("El nombre no puede estar vacio");
                        }
                    } while (nombre.isEmpty());

                    System.out.print("Apellido: ");
                    apellido = sc.nextLine();

                    System.out.print("Email: ");
                    mail = sc.nextLine();

                    System.out.print("Celular: ");
                    celular = sc.nextLine();

                    System.out.print("Contraseña: ");
                    contrasena = sc.nextLine();

                    System.out.print("Inserte el numero segun el rol: 1-ADMIN / 2-USUARIO ");
                    int opcionRol = sc.nextInt();
                    sc.nextLine();

                    if (opcionRol == 1) {
                        rol = Rol.ADMIN;
                    } else {
                        rol = Rol.USUARIO;
                    }

                    if (usuarioRepo.buscarPorMail(mail).isPresent()) {
                        System.out.println("Ya existe un usuario activo con ese mail");
                        break;
                    }

                    Usuario usuario = Usuario.builder()
                            .nombre(nombre)
                            .apellido(apellido)
                            .mail(mail)
                            .celular(celular)
                            .contrasena(contrasena)
                            .rol(rol)
                            .createdAt(LocalDateTime.now())
                            .build();
                    usuario = usuarioRepo.guardar(usuario);

                    System.out.println("Usuario creado con ID: " + usuario.getId());
                    break;

                case 2:
                    // modificar usuario
                    List<Usuario> usuarios = mostrarUsuarios(usuarioRepo);

                    Optional<Usuario> encontrado;
                    do {
                        System.out.println("Ingrese ID del usuario a modificar: ");
                        Long Id = sc.nextLong();
                        sc.nextLine();
                        encontrado = usuarioRepo.buscarPorId(Id);
                        if(encontrado.isEmpty()) {
                            System.out.println("Ingrese un usuario valida");
                        }
                    } while (encontrado.isEmpty());

                    Usuario user = encontrado.get();
                    System.out.println("Nombre actual: "+user.getNombre());
                    System.out.println("Apellido actual: "+user.getApellido());
                    System.out.println("Email actual: "+user.getMail());
                    System.out.println("Celular actual: "+user.getCelular());
                    System.out.println("Contraseña actual: "+user.getContrasena());

                    System.out.print("Nuevo nombre (enter para mantener): ");
                    String nuevoNombre = sc.nextLine();
                    System.out.print("Nueva apellido (enter para mantener): ");
                    String nuevoApellido = sc.nextLine();
                    System.out.print("Nuevo email (enter para mantener): ");
                    String nuevoEmail = sc.nextLine();
                    System.out.print("Nuevo celular (enter para mantener): ");
                    String nuevoCel = sc.nextLine();
                    System.out.print("Nueva contraseña (enter para mantener): ");
                    String nuevaPass = sc.nextLine();

                    if (!nuevoNombre.isEmpty()) {
                        user.setNombre(nuevoNombre);
                    }
                    if (!nuevoApellido.isEmpty()) {
                        user.setApellido(nuevoApellido);
                    }

                    if (!nuevoEmail.isEmpty()) {
                        Optional<Usuario> usuarioConMail = usuarioRepo.buscarPorMail(nuevoEmail);

                        if (usuarioConMail.isPresent() && !usuarioConMail.get().getId().equals(user.getId())) {
                            System.out.println("Ese mail ya esta en uso por otro usuario");
                            break;
                        }

                        user.setMail(nuevoEmail);
                    }

                    if (!nuevoCel.isEmpty()) {
                        user.setCelular(nuevoCel);
                    }
                    if (!nuevaPass.isEmpty()) {
                        user.setContrasena(nuevaPass);
                    }
                    usuarioRepo.guardar(user);
                    System.out.println("Usuario actualizado correctamente");
                    break;

                case 3:
                    // baja
                    System.out.print("Ingrese el ID del usuario: ");
                    Long bajaId = sc.nextLong();
                    sc.nextLine();
                    boolean eliminado = usuarioRepo.eliminarLogico(bajaId);

                    if(!eliminado) {
                        System.out.println("No se encontro un usuario con ese ID");
                    } else {
                        Optional<Usuario> usuarioBaja = usuarioRepo.buscarPorId(bajaId);
                        System.out.println("Usuario dado de baja: " +usuarioBaja.get().getNombre() +" "+usuarioBaja.get().getApellido() );
                    }

                    break;

                case 4:
                    // listar usuarios
                    mostrarUsuarios(usuarioRepo);
                    break;

                case 5:
                    // busqueda por mail
                    String email;
                    System.out.println("Ingrese el mail que desea buscar: ");
                    email = sc.nextLine();

                    Optional<Usuario> usuarioXmail = usuarioRepo.buscarPorMail(email);

                    if (usuarioXmail.isEmpty()) {
                        System.out.println("No se encontro usuario con ese email");
                    } else {
                        System.out.println(usuarioXmail);
                    }
                    break;

                case 0:
                    break;

                default:
                    System.out.println("Opcion invalida");
            }
        } while (opcion != 0);
    }


    //MENU PEDIDOS
    public static void menuPedidos(Scanner sc, PedidoRepository pedidoRepo, UsuarioRepository usuarioRepo, ProductoRepository productoRepo, CategoriaRepository categoriaRepo) {
        int opcion;
        do {
            System.out.println("Menu Pedidos");
            System.out.println("1 - Alta");
            System.out.println("2 - Cambio de estado");
            System.out.println("3 - Baja");
            System.out.println("4 - Listado");
            System.out.println("5 - Pedidos por usuario");
            System.out.println("6 - Pedidos por estado");
            System.out.println("0 - Salir");
            System.out.print("Seleccione una opcion: ");

            opcion = sc.nextInt();
            sc.nextLine();

            switch(opcion) {
                case 1:
                    // alta de pedido
                    altaPedido(sc, usuarioRepo, productoRepo, categoriaRepo);
                    break;



                case 2:
                    // modificar estado
                    List<Pedido> pedidos = mostrarPedidos(pedidoRepo, usuarioRepo);

                    Optional<Pedido> encontrado;
                    do {
                        System.out.println("Ingrese ID del pedido a modificar: ");
                        Long Id = sc.nextLong();
                        sc.nextLine();
                        encontrado = pedidoRepo.buscarPorId(Id);
                        if(encontrado.isEmpty()) {
                            System.out.println("Ingrese un pedido valido");
                        }
                    } while (encontrado.isEmpty());

                    Pedido p = encontrado.get();
                    System.out.println("Estado actual: "+p.getEstado());

                    System.out.print("Ingrese opcion segun estado (enter para mantener): " +
                            "1(PENDIENTE)" +
                            "2(CONFIRMADO)" +
                            "3(TERMINADO)" +
                            "4(CANCELADO)");
                    int opcionEstado = sc.nextInt();
                    sc.nextLine();
                    Estado nuevoEstado = null;

                    switch (opcionEstado) {
                        case 1:
                            nuevoEstado = Estado.PENDIENTE;
                            p.setEstado(nuevoEstado);
                            break;

                        case 2:
                            nuevoEstado = Estado.CONFIRMADO;
                            p.setEstado(nuevoEstado);
                            break;

                        case 3:
                            nuevoEstado = Estado.TERMINADO;
                            p.setEstado(nuevoEstado);
                            break;

                        case 4:
                            nuevoEstado = Estado.CANCELADO;
                            p.setEstado(nuevoEstado);
                            break;
                        default:
                            System.out.println("Opcion invalida");
                    }

                    if (nuevoEstado != null) {
                        pedidoRepo.guardar(p);
                        System.out.println("Pedido con ID: " + p.getId() + " y nuevo estado: " + p.getEstado() + " actualizado correctamente");

                    }

                    break;

                case 3:
                    // baja
                    mostrarPedidos(pedidoRepo, usuarioRepo);
                    System.out.print("Ingrese el ID del pedido: ");
                    Long bajaId = sc.nextLong();
                    sc.nextLine();
                    boolean eliminado = pedidoRepo.eliminarLogico(bajaId);

                    if(!eliminado) {
                        System.out.println("No se encontro un pedido con ese ID");
                    } else {
                        Double total = pedidoRepo.buscarPorId(bajaId).get().getTotal();
                        System.out.println("Pedido con ID: "+bajaId + " y total " + total +  " eliminado correctamente");
                    }

                    break;

                case 4:
                    // listar usuarios
                    mostrarPedidos(pedidoRepo, usuarioRepo);
                    break;

               //pedidos por usuario
                case 5:
                    List<Usuario> users = mostrarUsuarios(usuarioRepo);

                    if (users.isEmpty()) {
                        System.out.println("No hay usuarios activos");
                        break;
                    }

                    Optional<Usuario> userOpt;
                    Long userId;

                    do {
                        System.out.print("Seleccione el ID de usuario para consultar pedidos: ");
                        userId = sc.nextLong();
                        sc.nextLine();

                        userOpt = usuarioRepo.buscarPorId(userId);

                        if (userOpt.isEmpty() || userOpt.get().isEliminado()) {
                            System.out.println("Ingrese un ID válido");
                        }

                    } while (userOpt.isEmpty() || userOpt.get().isEliminado());

                    Usuario user = userOpt.get();

                    List<Pedido> pedidosXusuario = usuarioRepo.buscarPedidosPorUsuario(user.getId());

                    if (pedidosXusuario.isEmpty()) {
                        System.out.println("No se encontraron pedidos asignados al usuario");
                    } else {
                        for (Pedido pd : pedidosXusuario) {
                            System.out.println(
                                    "ID: " + pd.getId()
                                            + " | Fecha: " + pd.getFecha()
                                            + " | Estado: " + pd.getEstado()
                                            + " | Total: " + pd.getTotal()
                            );
                        }
                    }

                    break;

                //pedidos por estado
                case 6:
                    Estado estado = seleccionarEstado(sc);

                    if (estado == null) {
                        System.out.println("Estado invalido");
                        break;
                    }

                    List<Pedido> pedidosXEstado = pedidoRepo.buscarPorEstado(estado);

                    if (pedidosXEstado.isEmpty()) {
                        System.out.println("No se encontraron pedidos en ese estado");
                    } else {
                        for (Pedido pd : pedidosXEstado) {
                            String nombreUsuario = buscarNombreUsuarioPorPedido(usuarioRepo, pd.getId());

                            System.out.println(
                                    "ID: " + pd.getId()
                                            + " | Fecha: " + pd.getFecha()
                                            + " | Usuario: " + nombreUsuario
                                            + " | Total: " + pd.getTotal()
                            );
                        }
                    }

                    break;

                case 0:
                    break;

                default:
                    System.out.println("Opcion invalida");
            }
        } while (opcion != 0);
    }


    //MENU REPORTES
    public static void menuReportes(Scanner sc, ProductoRepository productoRepo, CategoriaRepository categoriaRepo, PedidoRepository pedidoRepo, UsuarioRepository usuarioRepo) {
        int opcion;
        do {
            System.out.println("Menu Reportes");
            System.out.println("1 - Productos por categoria");
            System.out.println("2 - Pedidos por usuario");
            System.out.println("3 - Pedidos por estado");
            System.out.println("4 - Total facturado");
            System.out.println("0 - Salir");
            System.out.print("Seleccione una opcion: ");

            opcion = sc.nextInt();
            sc.nextLine();

            switch(opcion) {
                case 1:
                    // productos por categoria
                    List<Categoria> categorias = mostrarCategorias(categoriaRepo);
                    Optional<Categoria> categoriaOpt;
                    Long categoriaId;
                    if (!categorias.isEmpty()) {
                        do {
                            System.out.println("Ingrese ID de categoria para filtrar productos: ");
                            categoriaId = sc.nextLong();
                            sc.nextLine();

                            categoriaOpt = categoriaRepo.buscarPorId(categoriaId);

                            if(categoriaOpt.isEmpty()) {
                                System.out.println("Categoria invalida");
                            }
                        } while (categoriaOpt.isEmpty());

                        List<Producto> productos = categoriaRepo.buscarProductosPorCategoria(categoriaId);

                        if (productos.isEmpty()) {
                            System.out.println("No hay productos en esta categoria");
                        } else {
                            System.out.println("\n--- PRODUCTOS DE LA CATEGORIA ---");

                            for (Producto p : productos) {
                                System.out.println(
                                        "ID: " + p.getId() +
                                                " | Nombre: " + p.getNombre() +
                                                " | Precio: $" + p.getPrecio() +
                                                " | Stock: " + p.getStock()
                                );
                            }
                        }
                    }
                    break;

                //misma implementacion que en pedidos, deberia ser un metodo reutilizable
                case 2:
                    List<Usuario> usuarios = mostrarUsuarios(usuarioRepo);

                    if (usuarios.isEmpty()) {
                        System.out.println("No hay usuarios activos");
                        break;
                    }

                    Optional<Usuario> usuarioOpt;
                    Long usuarioId;

                    do {
                        System.out.print("Seleccione el ID de usuario: ");
                        usuarioId = sc.nextLong();
                        sc.nextLine();

                        usuarioOpt = usuarioRepo.buscarPorId(usuarioId);

                        if (usuarioOpt.isEmpty() || usuarioOpt.get().isEliminado()) {
                            System.out.println("Ingrese un ID válido");
                        }

                    } while (usuarioOpt.isEmpty() || usuarioOpt.get().isEliminado());

                    List<Pedido> pedidosUsuario = usuarioRepo.buscarPedidosPorUsuario(usuarioId);

                    if (pedidosUsuario.isEmpty()) {
                        System.out.println("El usuario no tiene pedidos activos.");
                    } else {
                        for (Pedido pedido : pedidosUsuario) {
                            System.out.println(
                                    "ID: " + pedido.getId()
                                            + " | Fecha: " + pedido.getFecha()
                                            + " | Estado: " + pedido.getEstado()
                                            + " | FormaPago: " + pedido.getFormaPago()
                                            + " | Total: " + pedido.getTotal()
                            );
                        }
                    }

                    break;

                case 3:
                    Estado estadoReporte = seleccionarEstado(sc);

                    if (estadoReporte == null) {
                        System.out.println("Estado inválido");
                        break;
                    }

                    List<Pedido> pedidosEstado = pedidoRepo.buscarPorEstado(estadoReporte);

                    if (pedidosEstado.isEmpty()) {
                        System.out.println("No hay pedidos con ese estado.");
                    } else {
                        for (Pedido pedido : pedidosEstado) {
                            String nombreUsuario = buscarNombreUsuarioPorPedido(usuarioRepo, pedido.getId());

                            System.out.println(
                                    "ID: " + pedido.getId()
                                            + " | Fecha: " + pedido.getFecha()
                                            + " | Usuario: " + nombreUsuario
                                            + " | Total: " + pedido.getTotal()
                            );
                        }
                    }

                    break;

                case 4:
                    // total facturado
                    Double total = 0.00;
                    List<Pedido> pTerminados = pedidoRepo.buscarPorEstado(Estado.TERMINADO);

                    if(pTerminados.isEmpty()) {
                        System.out.println("No se encontraron pedidos TERMINADOS");
                    } else {
                        total = pTerminados.stream()
                                .mapToDouble(pedido -> pedido.getTotal() != null ? pedido.getTotal() : 0.0)
                                .sum();
                    }
                    System.out.println("Total facturado: " + String.format(Locale.US, "$%.2f", total));

                    break;

                case 0:
                    break;

                default:
                    System.out.println("Opcion invalida");
            }
        } while (opcion != 0);

    }

    // METODOS REUTILIZABLES para mostrar productos y categorias
    public static List<Categoria> mostrarCategorias(CategoriaRepository categoriaRepo) {
        List<Categoria> listaCategorias = categoriaRepo.listarActivos();
        if (listaCategorias.isEmpty()) {
            System.out.println("No hay categorias disponibles");
        } else {
            System.out.println("\n--- LISTADO DE CATEGORIAS ---");
            for (Categoria c : listaCategorias) {
                System.out.println(c.getId() + " - " + c.getNombre() + " - " + c.getDescripcion());
            }
        }
        return listaCategorias;
    }

    public static List<Producto> mostrarProductos(ProductoRepository productoRepo, CategoriaRepository categoriaRepo) {
        List<Producto> listaProductos = productoRepo.listarActivos();

        if (listaProductos.isEmpty()) {
            System.out.println("No hay productos disponibles");
        } else {
            Map<Long, String> categoriasPorProducto = obtenerMapaCategoriasPorProducto(categoriaRepo);

            System.out.println("\n--- LISTADO DE PRODUCTOS ---");

            for (Producto p : listaProductos) {
                String nombreCategoria = categoriasPorProducto.getOrDefault(p.getId(), "Sin categoría");

                System.out.println(
                        "ID: " + p.getId()
                                + " | Nombre: " + p.getNombre()
                                + " | $" + p.getPrecio()
                                + " | Stock: " + p.getStock()
                                + " | Disponible: " + p.isDisponible()
                                + " | Categoría: " + nombreCategoria
                );
            }
        }

        return listaProductos;
    }

    public static List<Usuario> mostrarUsuarios(UsuarioRepository usuarioRepo) {
        List<Usuario> listaUsuarios = usuarioRepo.listarActivos();
        if (listaUsuarios.isEmpty()) {
            System.out.println("No hay usuarios disponibles");
        } else {
            System.out.println("\n--- LISTADO DE USUARIOS ---");
            for (Usuario u : listaUsuarios) {
                System.out.println("ID: " + u.getId() + " | Nombre: " + u.getNombre() +
                        " " + u.getApellido() + " | Email: " + u.getMail() +
                        " | Rol: " + u.getRol());
            }
        }
        return listaUsuarios;
    }

    public static List<Pedido> mostrarPedidos(PedidoRepository pedidoRepo, UsuarioRepository usuarioRepo) {
        List<Pedido> listaPedidos = pedidoRepo.listarActivos();
        if (listaPedidos.isEmpty()) {
            System.out.println("No hay pedidos disponibles");
        } else {
            Map<Long, String> usuariosPorPedido = obtenerMapaUsuariosPorPedido(usuarioRepo);
            System.out.println("\n--- LISTADO DE PEDIDOS ---");
            for (Pedido p : listaPedidos) {

                String nombreUsuario = usuariosPorPedido.getOrDefault(
                        p.getId(),
                        "Sin usuario"
                );

                System.out.println("ID: " + p.getId() + " | Fecha: " + p.getFecha() +
                        " | FormaPago: " + p.getFormaPago() +
                        " | Estado: " + p.getEstado() +
                        " | Usuario: " + nombreUsuario +
                        " | Total: " + p.getTotal());
            }
        }
        return listaPedidos;
    }

    //metodo para mapear productos con sus respectivas categorias al tener que mostrar por consola
    public static Map<Long, String> obtenerMapaCategoriasPorProducto(CategoriaRepository categoriaRepo) {
        Map<Long, String> mapa = new HashMap<>();

        List<Categoria> categorias = categoriaRepo.listarActivos();

        for (Categoria categoria : categorias) {
            List<Producto> productos = categoriaRepo.buscarProductosPorCategoria(categoria.getId());

            for (Producto producto : productos) {
                mapa.put(producto.getId(), categoria.getNombre());
            }
        }

        return mapa;
    }

    //metodo similar pero para mapear pedidos con sus usuarios
    public static Map<Long, String> obtenerMapaUsuariosPorPedido(UsuarioRepository usuarioRepo) {
        Map<Long, String> mapa = new HashMap<>();

        List<Usuario> usuarios = usuarioRepo.listarActivos();

        for (Usuario usuario : usuarios) {
            List<Pedido> pedidos = usuarioRepo.buscarPedidosPorUsuario(usuario.getId());

            for (Pedido pedido : pedidos) {
                mapa.put(
                        pedido.getId(),
                        usuario.getNombre() + " " + usuario.getApellido()
                );
            }
        }

        return mapa;
    }

    //helper para obtener qué usuario realizó un pedido especifico
    public static String buscarNombreUsuarioPorPedido(
            UsuarioRepository usuarioRepo,
            Long pedidoId
    ) {
        List<Usuario> usuarios = usuarioRepo.listarActivos();

        for (Usuario usuario : usuarios) {
            List<Pedido> pedidos = usuarioRepo.buscarPedidosPorUsuario(usuario.getId());

            for (Pedido pedido : pedidos) {
                if (pedido.getId().equals(pedidoId)) {
                    return usuario.getNombre() + " " + usuario.getApellido();
                }
            }
        }

        return "Sin usuario";
    }

    //seleccionar estado
    public static Estado seleccionarEstado(Scanner sc) {
        System.out.println("Seleccione estado:");
        System.out.println("1 - PENDIENTE");
        System.out.println("2 - CONFIRMADO");
        System.out.println("3 - TERMINADO");
        System.out.println("4 - CANCELADO");
        System.out.print("Opción: ");

        int opcion = sc.nextInt();
        sc.nextLine();

        switch (opcion) {
            case 1:
                return Estado.PENDIENTE;
            case 2:
                return Estado.CONFIRMADO;
            case 3:
                return Estado.TERMINADO;
            case 4:
                return Estado.CANCELADO;
            default:
                return null;
        }
    }

    //guardar de manera temporal id de producto y cantidad
    private static class ItemPedidoTemp {
        private Long productoId;
        private int cantidad;

        public ItemPedidoTemp(Long productoId, int cantidad) {
            this.productoId = productoId;
            this.cantidad = cantidad;
        }

        public Long getProductoId() {
            return productoId;
        }

        public int getCantidad() {
            return cantidad;
        }

        public void sumarCantidad(int cantidad) {
            this.cantidad += cantidad;
        }
    }


    //HELPERS DEL METODO ALTA DE PEDIDO
    public static int obtenerCantidadTemporal(
            List<ItemPedidoTemp> itemsTemporales,
            Long productoId
    ) {
        return itemsTemporales.stream()
                .filter(item -> item.getProductoId().equals(productoId))
                .mapToInt(ItemPedidoTemp::getCantidad)
                .sum();
    }

    public static void agregarOActualizarItemTemporal(
            List<ItemPedidoTemp> itemsTemporales,
            Long productoId,
            int cantidad
    ) {
        for (ItemPedidoTemp item : itemsTemporales) {
            if (item.getProductoId().equals(productoId)) {
                item.sumarCantidad(cantidad);
                return;
            }
        }

        itemsTemporales.add(new ItemPedidoTemp(productoId, cantidad));
    }

    public static FormaPago seleccionarFormaPago(Scanner sc) {
        System.out.println("Seleccione forma de pago:");
        System.out.println("1 - TARJETA");
        System.out.println("2 - TRANSFERENCIA");
        System.out.println("3 - EFECTIVO");
        System.out.print("Opción: ");

        int opcion = sc.nextInt();
        sc.nextLine();

        switch (opcion) {
            case 1:
                return FormaPago.TARJETA;
            case 2:
                return FormaPago.TRANSFERENCIA;
            case 3:
                return FormaPago.EFECTIVO;
            default:
                return null;
        }
    }

    //metodo transaccional
    public static void guardarPedidoTransaccional(
            Long usuarioId,
            FormaPago formaPago,
            List<ItemPedidoTemp> itemsTemporales
    ) {
        EntityManager em = JPAUtil.getEntityManagerFactory().createEntityManager();
        EntityTransaction tx = em.getTransaction();

        try {
            tx.begin();

            Usuario usuario = em.find(Usuario.class, usuarioId);

            if (usuario == null || usuario.isEliminado()) {
                throw new RuntimeException("Usuario inexistente o dado de baja.");
            }

            Pedido pedido = Pedido.builder()
                    .fecha(LocalDate.now())
                    .estado(Estado.PENDIENTE)
                    .formaPago(formaPago)
                    .total(0.0)
                    .createdAt(LocalDateTime.now())
                    .build();

            for (ItemPedidoTemp item : itemsTemporales) {
                Producto producto = em.find(Producto.class, item.getProductoId());

                if (producto == null || producto.isEliminado()) {
                    throw new RuntimeException("Producto inexistente o dado de baja. ID: " + item.getProductoId());
                }

                if (!producto.isDisponible()) {
                    throw new RuntimeException("Producto no disponible: " + producto.getNombre());
                }

                if (item.getCantidad() <= 0) {
                    throw new RuntimeException("La cantidad debe ser mayor a 0.");
                }

                if (producto.getStock() < item.getCantidad()) {
                    throw new RuntimeException(
                            "Stock insuficiente para " + producto.getNombre()
                                    + ". Stock disponible: " + producto.getStock()
                    );
                }

                pedido.addDetallePedido(item.getCantidad(), producto);

                producto.setStock(producto.getStock() - item.getCantidad());
            }

            pedido.calcularTotal();

            usuario.agregarPedido(pedido);

            em.persist(pedido);

            tx.commit();

            System.out.println("\nPedido creado correctamente.");
            System.out.println("ID generado: " + pedido.getId());
            System.out.println("Fecha: " + pedido.getFecha());
            System.out.println("Usuario: " + usuario.getNombre() + " " + usuario.getApellido());
            System.out.println("Forma de pago: " + pedido.getFormaPago());
            System.out.println("Total: $" + pedido.getTotal());

            System.out.println("\nDetalles del pedido:");
            for (DetallePedido detalle : pedido.getDetalles()) {
                System.out.println(
                        "- Producto: " + detalle.getProducto().getNombre()
                                + " | Cantidad: " + detalle.getCantidad()
                                + " | Subtotal: $" + detalle.getSubtotal()
                );
            }

        } catch (Exception e) {
            if (tx.isActive()) {
                tx.rollback();
            }

            System.out.println("\nError al crear el pedido. Se realizó rollback.");
            System.out.println("Detalle: " + e.getMessage());

        } finally {
            em.close();
        }
    }

    //metodo principal ALTA DE PEDIDO
    public static void altaPedido(
            Scanner sc,
            UsuarioRepository usuarioRepo,
            ProductoRepository productoRepo,
            CategoriaRepository categoriaRepo
    ) {
        System.out.println("\n--- ALTA DE PEDIDO ---");

        List<Usuario> usuarios = mostrarUsuarios(usuarioRepo);

        if (usuarios.isEmpty()) {
            System.out.println("No hay usuarios activos. Debe crear un usuario antes de generar pedidos.");
            return;
        }

        Optional<Usuario> usuarioOpt;
        Long usuarioId;

        do {
            System.out.print("Seleccione el ID del usuario para el pedido: ");
            usuarioId = sc.nextLong();
            sc.nextLine();

            usuarioOpt = usuarioRepo.buscarPorId(usuarioId);

            if (usuarioOpt.isEmpty() || usuarioOpt.get().isEliminado()) {
                System.out.println("Ingrese un ID de usuario válido.");
            }

        } while (usuarioOpt.isEmpty() || usuarioOpt.get().isEliminado());

        FormaPago formaPago = seleccionarFormaPago(sc);

        if (formaPago == null) {
            System.out.println("Forma de pago inválida. Operación cancelada.");
            return;
        }

        List<ItemPedidoTemp> itemsTemporales = new ArrayList<>();

        String continuar;

        do {
            List<Producto> productos = mostrarProductos(productoRepo, categoriaRepo);

            if (productos.isEmpty()) {
                System.out.println("No hay productos activos disponibles.");
                return;
            }

            System.out.print("Ingrese el ID del producto a agregar: ");
            Long productoId = sc.nextLong();
            sc.nextLine();

            Optional<Producto> productoOpt = productoRepo.buscarPorId(productoId);

            if (productoOpt.isEmpty() || productoOpt.get().isEliminado()) {
                System.out.println("Producto inexistente o dado de baja.");
            } else {
                Producto producto = productoOpt.get();

                if (!producto.isDisponible()) {
                    System.out.println("El producto seleccionado no está disponible.");
                } else if (producto.getStock() <= 0) {
                    System.out.println("El producto no tiene stock disponible.");
                } else {
                    System.out.print("Ingrese cantidad: ");
                    int cantidad = sc.nextInt();
                    sc.nextLine();

                    if (cantidad <= 0) {
                        System.out.println("La cantidad debe ser mayor a 0.");
                    } else {
                        int cantidadYaSeleccionada = obtenerCantidadTemporal(itemsTemporales, productoId);
                        int cantidadTotalSolicitada = cantidadYaSeleccionada + cantidad;

                        if (cantidadTotalSolicitada > producto.getStock()) {
                            System.out.println(
                                    "Stock insuficiente. Stock disponible: " + producto.getStock()
                                            + ". Ya seleccionado en este pedido: " + cantidadYaSeleccionada
                            );
                        } else {
                            agregarOActualizarItemTemporal(itemsTemporales, productoId, cantidad);
                            System.out.println("Producto agregado temporalmente al pedido.");
                        }
                    }
                }
            }

            System.out.print("¿Desea agregar otro producto? (S/N): ");
            continuar = sc.nextLine().trim();

        } while (continuar.equalsIgnoreCase("S"));

        if (itemsTemporales.isEmpty()) {
            System.out.println("El pedido debe tener al menos un producto. Operación cancelada.");
            return;
        }

        guardarPedidoTransaccional(usuarioId, formaPago, itemsTemporales);
    }


