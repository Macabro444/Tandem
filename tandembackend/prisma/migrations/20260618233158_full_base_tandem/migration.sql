-- CreateTable
CREATE TABLE "contratos" (
    "id_contrato" SERIAL NOT NULL,
    "id_empresa" INTEGER NOT NULL,
    "nombre_contrato" VARCHAR(100) NOT NULL,
    "fecha_inicio" TIMESTAMP(3) NOT NULL,
    "fecha_fin" TIMESTAMP(3) NOT NULL,
    "total_licencias" INTEGER NOT NULL,
    "licencias_usadas" INTEGER NOT NULL DEFAULT 0,
    "total_cuestionarios" INTEGER NOT NULL,
    "cuestionarios_usados" INTEGER NOT NULL DEFAULT 0,
    "activo" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "contratos_pkey" PRIMARY KEY ("id_contrato")
);

-- CreateTable
CREATE TABLE "evaluaciones_resultados" (
    "id_resultado" SERIAL NOT NULL,
    "id_empresa" INTEGER NOT NULL,
    "tipo_estudio" VARCHAR(50) NOT NULL,
    "fecha_aplicacion" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "origen_captura" VARCHAR(20),
    "anonimo" BOOLEAN NOT NULL DEFAULT true,
    "id_usuario" INTEGER,
    "adscripcion" VARCHAR(100),
    "area_trabaja" VARCHAR(100),
    "puesto_ocupa" VARCHAR(100),
    "puesto_reporta" VARCHAR(100),
    "antiguedad" VARCHAR(50),
    "tipo_contrato" VARCHAR(50),
    "escolaridad" VARCHAR(50),
    "tiene_discapacidad" VARCHAR(5),
    "tipo_discapacidad" VARCHAR(100),
    "sector_poblacion" VARCHAR(100),
    "puntaje_total" INTEGER,
    "nivel_riesgo" VARCHAR(30),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "evaluaciones_resultados_pkey" PRIMARY KEY ("id_resultado")
);

-- CreateTable
CREATE TABLE "escalas_calificacion" (
    "id_escala" SERIAL NOT NULL,
    "nombre_escala" VARCHAR(100) NOT NULL,
    "descripcion" VARCHAR(255),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "escalas_calificacion_pkey" PRIMARY KEY ("id_escala")
);

-- CreateTable
CREATE TABLE "opciones_escala" (
    "id_opcion" SERIAL NOT NULL,
    "id_escala" INTEGER NOT NULL,
    "texto_opcion" VARCHAR(100) NOT NULL,
    "valor_numerico" INTEGER NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "opciones_escala_pkey" PRIMARY KEY ("id_opcion")
);

-- CreateTable
CREATE TABLE "dimensiones" (
    "id_dimension" SERIAL NOT NULL,
    "nombre_dimension" VARCHAR(150) NOT NULL,
    "concepto_descrip" TEXT,
    "tipo_cuestionario" VARCHAR(50),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "dimensiones_pkey" PRIMARY KEY ("id_dimension")
);

-- CreateTable
CREATE TABLE "reactivos" (
    "id_reactivo" SERIAL NOT NULL,
    "id_dimension" INTEGER NOT NULL,
    "id_escala" INTEGER NOT NULL,
    "texto_reactivo" TEXT NOT NULL,
    "numero_oficial" INTEGER,
    "seccion" VARCHAR(10),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "reactivos_pkey" PRIMARY KEY ("id_reactivo")
);

-- CreateTable
CREATE TABLE "respuestas_detalle" (
    "id_respuesta_detalle" SERIAL NOT NULL,
    "id_resultado" INTEGER NOT NULL,
    "id_reactivo" INTEGER NOT NULL,
    "valor_respondido" INTEGER NOT NULL,
    "texto_abierto" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "respuestas_detalle_pkey" PRIMARY KEY ("id_respuesta_detalle")
);

-- AddForeignKey
ALTER TABLE "contratos" ADD CONSTRAINT "contratos_id_empresa_fkey" FOREIGN KEY ("id_empresa") REFERENCES "empresas"("id_empresa") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "evaluaciones_resultados" ADD CONSTRAINT "evaluaciones_resultados_id_empresa_fkey" FOREIGN KEY ("id_empresa") REFERENCES "empresas"("id_empresa") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "evaluaciones_resultados" ADD CONSTRAINT "evaluaciones_resultados_id_usuario_fkey" FOREIGN KEY ("id_usuario") REFERENCES "usuarios"("id_usuario") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "opciones_escala" ADD CONSTRAINT "opciones_escala_id_escala_fkey" FOREIGN KEY ("id_escala") REFERENCES "escalas_calificacion"("id_escala") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "reactivos" ADD CONSTRAINT "reactivos_id_dimension_fkey" FOREIGN KEY ("id_dimension") REFERENCES "dimensiones"("id_dimension") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "reactivos" ADD CONSTRAINT "reactivos_id_escala_fkey" FOREIGN KEY ("id_escala") REFERENCES "escalas_calificacion"("id_escala") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "respuestas_detalle" ADD CONSTRAINT "respuestas_detalle_id_resultado_fkey" FOREIGN KEY ("id_resultado") REFERENCES "evaluaciones_resultados"("id_resultado") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "respuestas_detalle" ADD CONSTRAINT "respuestas_detalle_id_reactivo_fkey" FOREIGN KEY ("id_reactivo") REFERENCES "reactivos"("id_reactivo") ON DELETE RESTRICT ON UPDATE CASCADE;
