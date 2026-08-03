-- CreateEnum
CREATE TYPE "RolUsuario" AS ENUM ('ADMIN', 'COORDINADOR', 'EMPLEADO');

-- CreateTable
CREATE TABLE "empresas" (
    "id_empresa" SERIAL NOT NULL,
    "nom_empresa" VARCHAR(150) NOT NULL,
    "rfc_empresa" VARCHAR(13) NOT NULL,
    "calle_empresa" VARCHAR(100),
    "ext_empresa" VARCHAR(10),
    "int_empresa" VARCHAR(10),
    "col_empresa" VARCHAR(100),
    "cp_empresa" VARCHAR(5),
    "mpio_empresa" VARCHAR(100),
    "estado_empresa" VARCHAR(100),
    "nom_resp_empresa" VARCHAR(100),
    "ap_resp_empresa" VARCHAR(100),
    "tel_resp_empresa" VARCHAR(15),
    "email_resp_empresa" VARCHAR(100),
    "giro_empresa" VARCHAR(100),
    "num_empl_empresa" VARCHAR(50),
    "cod_empresa" VARCHAR(12) NOT NULL,
    "cues_empresa" INTEGER NOT NULL DEFAULT 0,
    "inicio_empresa" TIMESTAMP(3),
    "fin_empresa" TIMESTAMP(3),
    "activo" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "empresas_pkey" PRIMARY KEY ("id_empresa")
);

-- CreateTable
CREATE TABLE "usuarios" (
    "id_usuario" SERIAL NOT NULL,
    "nom_usuario" VARCHAR(100) NOT NULL,
    "ap_usuario" VARCHAR(100) NOT NULL,
    "tel_usuario" VARCHAR(15),
    "email_usuario" VARCHAR(100) NOT NULL,
    "username" VARCHAR(50) NOT NULL,
    "cont_usuario" VARCHAR(255) NOT NULL,
    "rol_usuario" "RolUsuario" NOT NULL,
    "id_empresa" INTEGER,
    "primer_ingreso" BOOLEAN NOT NULL DEFAULT true,
    "activo" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "usuarios_pkey" PRIMARY KEY ("id_usuario")
);

-- CreateIndex
CREATE UNIQUE INDEX "empresas_rfc_empresa_key" ON "empresas"("rfc_empresa");

-- CreateIndex
CREATE UNIQUE INDEX "empresas_cod_empresa_key" ON "empresas"("cod_empresa");

-- CreateIndex
CREATE UNIQUE INDEX "usuarios_email_usuario_key" ON "usuarios"("email_usuario");

-- CreateIndex
CREATE UNIQUE INDEX "usuarios_username_key" ON "usuarios"("username");

-- AddForeignKey
ALTER TABLE "usuarios" ADD CONSTRAINT "usuarios_id_empresa_fkey" FOREIGN KEY ("id_empresa") REFERENCES "empresas"("id_empresa") ON DELETE SET NULL ON UPDATE CASCADE;
