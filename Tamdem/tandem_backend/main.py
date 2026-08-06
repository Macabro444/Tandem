import os
import random
from fastapi import FastAPI, Query, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List, Optional
from supabase import create_client, Client
from datetime import datetime
from reportes import router as reportes_router

# ============================================================================
# CONFIGURACIÓN DE SUPABASE
# ============================================================================
SUPABASE_URL = os.getenv("SUPABASE_URL")
SUPABASE_KEY = os.getenv("SUPABASE_KEY")

if not SUPABASE_URL or not SUPABASE_KEY:
    raise RuntimeError("SUPABASE_URL y SUPABASE_KEY deben estar configuradas")

supabase: Client = create_client(SUPABASE_URL, SUPABASE_KEY)

app = FastAPI(title="Tándem API - Gestión de Cuestionarios")

# ============================================================================
# CORS
# ============================================================================
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        origin.strip()
        for origin in os.getenv(
            "CORS_ORIGINS", "http://localhost:5173,http://localhost:4173"
        ).split(",")
        if origin.strip()
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(reportes_router)

# ============================================================================
# MODELOS Pydantic
# ============================================================================
class CuestionarioCreate(BaseModel):
    nombre: str
    tipo_estudio: str
    id_empresa: int
    activo: bool = True

class CuestionarioUpdate(BaseModel):
    nombre: Optional[str] = None
    tipo_estudio: Optional[str] = None
    activo: Optional[bool] = None

class AsignarReactivos(BaseModel):
    ids_reactivos: List[int]

class ResponderCuestionario(BaseModel):
    id_cuestionario: int
    id_usuario: int
    respuestas: List[dict]

class EscalaCreate(BaseModel):
    nombre_escala: str
    descripcion: Optional[str] = None

class EscalaUpdate(BaseModel):
    nombre_escala: Optional[str] = None
    descripcion: Optional[str] = None

# ============================================================================
# FUNCIONES DE AYUDA
# ============================================================================
def supabase_to_dict(result):
    if hasattr(result, 'data'):
        return result.data
    return result

def obtener_nombre_dimension(id_dimension: int) -> str:
    try:
        result = supabase.table("dimensiones").select("nombre_dimension").eq("id_dimension", id_dimension).execute()
        if result.data:
            return result.data[0]["nombre_dimension"]
    except:
        pass
    return "Sin dimensión"

# ============================================================================
# ENDPOINTS PARA EMPRESAS
# ============================================================================

@app.get("/empresas")
def obtener_empresas():
    try:
        result = supabase.table("empresas").select("*").order("id_empresa").execute()
        return supabase_to_dict(result)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error al obtener empresas: {str(e)}")

@app.get("/empresas/{id_empresa}")
def obtener_empresa(id_empresa: int):
    try:
        result = supabase.table("empresas").select("*").eq("id_empresa", id_empresa).execute()
        if not result.data:
            raise HTTPException(status_code=404, detail="Empresa no encontrada")
        return supabase_to_dict(result)[0]
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error al obtener empresa: {str(e)}")

# ============================================================================
# ENDPOINTS PARA DIMENSIONES
# ============================================================================

@app.get("/api/dimensiones")
def obtener_dimensiones():
    try:
        result = supabase.table("dimensiones").select("*").order("id_dimension").execute()
        return supabase_to_dict(result)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error al obtener dimensiones: {str(e)}")

@app.post("/api/dimensiones")
def crear_dimension(data: dict):
    try:
        result = supabase.table("dimensiones").insert({
            "nombre_dimension": data.get("nombre_dimension"),
            "concepto_descrip": data.get("concepto_descrip"),
            "tipo_cuestionario": data.get("tipo_cuestionario")
        }).execute()
        return supabase_to_dict(result)[0] if result.data else {"status": "success"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error al crear dimensión: {str(e)}")

@app.put("/api/dimensiones/{id_dimension}")
def actualizar_dimension(id_dimension: int, data: dict):
    try:
        update_data = {}
        if data.get("nombre_dimension") is not None:
            update_data["nombre_dimension"] = data["nombre_dimension"]
        if data.get("concepto_descrip") is not None:
            update_data["concepto_descrip"] = data["concepto_descrip"]
        if data.get("tipo_cuestionario") is not None:
            update_data["tipo_cuestionario"] = data["tipo_cuestionario"]
        
        if not update_data:
            raise HTTPException(status_code=400, detail="No hay datos para actualizar")
        
        result = supabase.table("dimensiones").update(update_data).eq("id_dimension", id_dimension).execute()
        if not result.data:
            raise HTTPException(status_code=404, detail="Dimensión no encontrada")
        return supabase_to_dict(result)[0]
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error al actualizar dimensión: {str(e)}")

@app.delete("/api/dimensiones/{id_dimension}")
def eliminar_dimension(id_dimension: int):
    try:
        result = supabase.table("dimensiones").delete().eq("id_dimension", id_dimension).execute()
        if not result.data:
            raise HTTPException(status_code=404, detail="Dimensión no encontrada")
        return {"status": "success", "message": "Dimensión eliminada correctamente"}
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error al eliminar dimensión: {str(e)}")

# ============================================================================
# ENDPOINTS PARA REACTIVOS
# ============================================================================

@app.get("/api/reactivos")
def obtener_reactivos(id_dimension: Optional[int] = None):
    try:
        query = supabase.table("reactivos").select("*")
        if id_dimension:
            query = query.eq("id_dimension", id_dimension)
        result = query.order("numero_oficial").execute()
        reactivos = supabase_to_dict(result)
        
        for r in reactivos:
            r["nombre_dimension"] = obtener_nombre_dimension(r.get("id_dimension"))
        
        return reactivos
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error al obtener reactivos: {str(e)}")

@app.post("/api/reactivos")
def crear_reactivo(data: dict):
    try:
        dim = supabase.table("dimensiones").select("id_dimension").eq("id_dimension", data.get("id_dimension")).execute()
        if not dim.data:
            raise HTTPException(status_code=404, detail="Dimensión no encontrada")
        
        insert_data = {
            "id_dimension": data["id_dimension"],
            "texto_reactivo": data["texto_reactivo"],
            "numero_oficial": data.get("numero_oficial"),
            "seccion": data.get("num_seccion", "I"),
            "id_escala": data.get("id_escala", 1)
        }
        
        result = supabase.table("reactivos").insert(insert_data).execute()
        return supabase_to_dict(result)[0] if result.data else {"status": "success"}
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error al crear reactivo: {str(e)}")

@app.put("/api/reactivos/{id_reactivo}")
def actualizar_reactivo(id_reactivo: int, data: dict):
    try:
        update_data = {}
        if data.get("id_dimension") is not None:
            update_data["id_dimension"] = data["id_dimension"]
        if data.get("id_escala") is not None:
            update_data["id_escala"] = data["id_escala"]
        if data.get("texto_reactivo") is not None:
            update_data["texto_reactivo"] = data["texto_reactivo"]
        if data.get("numero_oficial") is not None:
            update_data["numero_oficial"] = data["numero_oficial"]
        if data.get("num_seccion") is not None:
            update_data["seccion"] = data["num_seccion"]
        
        if not update_data:
            raise HTTPException(status_code=400, detail="No hay datos para actualizar")
        
        result = supabase.table("reactivos").update(update_data).eq("id_reactivo", id_reactivo).execute()
        if not result.data:
            raise HTTPException(status_code=404, detail="Reactivo no encontrado")
        return supabase_to_dict(result)[0]
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error al actualizar reactivo: {str(e)}")

@app.delete("/api/reactivos/{id_reactivo}")
def eliminar_reactivo(id_reactivo: int):
    try:
        result = supabase.table("reactivos").delete().eq("id_reactivo", id_reactivo).execute()
        if not result.data:
            raise HTTPException(status_code=404, detail="Reactivo no encontrado")
        return {"status": "success", "message": "Reactivo eliminado correctamente"}
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error al eliminar reactivo: {str(e)}")

# ============================================================================
# ENDPOINTS PARA ESCALAS
# ============================================================================

@app.get("/api/escalas")
def obtener_escalas():
    try:
        result = supabase.table("escalas_calificacion").select("*").order("id_escala").execute()
        return supabase_to_dict(result)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error al obtener escalas: {str(e)}")

@app.post("/api/escalas")
def crear_escala(data: EscalaCreate):
    try:
        result = supabase.table("escalas_calificacion").insert({
            "nombre_escala": data.nombre_escala,
            "descripcion": data.descripcion
        }).execute()
        return supabase_to_dict(result)[0] if result.data else {"status": "success"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error al crear escala: {str(e)}")

@app.put("/api/escalas/{id_escala}")
def actualizar_escala(id_escala: int, data: EscalaUpdate):
    try:
        update_data = {}
        if data.nombre_escala is not None:
            update_data["nombre_escala"] = data.nombre_escala
        if data.descripcion is not None:
            update_data["descripcion"] = data.descripcion
        
        if not update_data:
            raise HTTPException(status_code=400, detail="No hay datos para actualizar")
        
        result = supabase.table("escalas_calificacion").update(update_data).eq("id_escala", id_escala).execute()
        if not result.data:
            raise HTTPException(status_code=404, detail="Escala no encontrada")
        return supabase_to_dict(result)[0]
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error al actualizar escala: {str(e)}")

@app.delete("/api/escalas/{id_escala}")
def eliminar_escala(id_escala: int):
    try:
        reactivos = supabase.table("reactivos").select("id_reactivo").eq("id_escala", id_escala).execute()
        if reactivos.data and len(reactivos.data) > 0:
            raise HTTPException(
                status_code=400, 
                detail=f"No se puede eliminar la escala porque tiene {len(reactivos.data)} reactivos asociados"
            )
        
        result = supabase.table("escalas_calificacion").delete().eq("id_escala", id_escala).execute()
        if not result.data:
            raise HTTPException(status_code=404, detail="Escala no encontrada")
        return {"status": "success", "message": "Escala eliminada correctamente"}
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error al eliminar escala: {str(e)}")

# ============================================================================
# ENDPOINTS PARA CUESTIONARIOS
# ============================================================================

@app.post("/api/cuestionarios")
def crear_cuestionario(data: CuestionarioCreate):
    try:
        result = supabase.table("cuestionarios").insert({
            "nombre": data.nombre,
            "tipo_estudio": data.tipo_estudio,
            "id_empresa": data.id_empresa,
            "activo": data.activo,
            "fecha_creacion": datetime.now().isoformat()
        }).execute()
        
        if not result.data:
            raise HTTPException(status_code=500, detail="Error al crear cuestionario")
        
        return supabase_to_dict(result)[0]
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error al crear cuestionario: {str(e)}")

@app.get("/api/cuestionarios")
def obtener_cuestionarios(id_empresa: Optional[int] = None, activo: Optional[bool] = None):
    try:
        query = supabase.table("cuestionarios").select("*")
        
        if id_empresa:
            query = query.eq("id_empresa", id_empresa)
        if activo is not None:
            query = query.eq("activo", activo)
        
        result = query.order("fecha_creacion", desc=True).execute()
        cuestionarios = supabase_to_dict(result)
        
        for c in cuestionarios:
            count = supabase.table("cuestionarios_reactivos").select("id", count="exact").eq("id_cuestionario", c["id_cuestionario"]).execute()
            c["total_reactivos"] = count.count if hasattr(count, 'count') else 0
        
        return cuestionarios
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error al obtener cuestionarios: {str(e)}")

@app.get("/api/cuestionarios/{id_cuestionario}")
def obtener_cuestionario(id_cuestionario: int):
    try:
        cuestionario_res = supabase.table("cuestionarios").select("*").eq("id_cuestionario", id_cuestionario).execute()
        if not cuestionario_res.data:
            raise HTTPException(status_code=404, detail="Cuestionario no encontrado")
        
        cuestionario = supabase_to_dict(cuestionario_res)[0]
        
        reactivos_asignados = supabase.table("cuestionarios_reactivos").select("id_reactivo").eq("id_cuestionario", id_cuestionario).execute()
        ids_reactivos = [r["id_reactivo"] for r in reactivos_asignados.data] if reactivos_asignados.data else []
        
        if ids_reactivos:
            reactivos_res = supabase.table("reactivos").select("*").in_("id_reactivo", ids_reactivos).order("numero_oficial").execute()
            reactivos = supabase_to_dict(reactivos_res)
            for r in reactivos:
                r["nombre_dimension"] = obtener_nombre_dimension(r.get("id_dimension"))
        else:
            reactivos = []
        
        cuestionario["reactivos"] = reactivos
        return cuestionario
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error al obtener cuestionario: {str(e)}")

@app.put("/api/cuestionarios/{id_cuestionario}")
def actualizar_cuestionario(id_cuestionario: int, data: CuestionarioUpdate):
    try:
        update_data = {}
        if data.nombre is not None:
            update_data["nombre"] = data.nombre
        if data.tipo_estudio is not None:
            update_data["tipo_estudio"] = data.tipo_estudio
        if data.activo is not None:
            update_data["activo"] = data.activo
        
        if not update_data:
            raise HTTPException(status_code=400, detail="No hay datos para actualizar")
        
        result = supabase.table("cuestionarios").update(update_data).eq("id_cuestionario", id_cuestionario).execute()
        if not result.data:
            raise HTTPException(status_code=404, detail="Cuestionario no encontrado")
        return supabase_to_dict(result)[0]
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error al actualizar cuestionario: {str(e)}")

@app.delete("/api/cuestionarios/{id_cuestionario}")
def eliminar_cuestionario(id_cuestionario: int):
    try:
        supabase.table("cuestionarios_reactivos").delete().eq("id_cuestionario", id_cuestionario).execute()
        
        result = supabase.table("cuestionarios").delete().eq("id_cuestionario", id_cuestionario).execute()
        if not result.data:
            raise HTTPException(status_code=404, detail="Cuestionario no encontrado")
        return {"status": "success", "message": "Cuestionario eliminado correctamente"}
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error al eliminar cuestionario: {str(e)}")

# ============================================================================
# ENDPOINTS PARA ASIGNAR REACTIVOS A CUESTIONARIOS
# ============================================================================

@app.post("/api/cuestionarios/{id_cuestionario}/reactivos")
def asignar_reactivos_cuestionario(id_cuestionario: int, data: AsignarReactivos):
    try:
        cuestionario = supabase.table("cuestionarios").select("id_cuestionario").eq("id_cuestionario", id_cuestionario).execute()
        if not cuestionario.data:
            raise HTTPException(status_code=404, detail="Cuestionario no encontrado")
        
        supabase.table("cuestionarios_reactivos").delete().eq("id_cuestionario", id_cuestionario).execute()
        
        for id_reactivo in data.ids_reactivos:
            supabase.table("cuestionarios_reactivos").insert({
                "id_cuestionario": id_cuestionario,
                "id_reactivo": id_reactivo
            }).execute()
        
        return {"status": "success", "message": f"Se asignaron {len(data.ids_reactivos)} reactivos al cuestionario"}
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error al asignar reactivos: {str(e)}")

@app.get("/api/cuestionarios/{id_cuestionario}/reactivos")
def obtener_reactivos_cuestionario(id_cuestionario: int):
    try:
        reactivos_asignados = supabase.table("cuestionarios_reactivos").select("id_reactivo").eq("id_cuestionario", id_cuestionario).execute()
        ids_reactivos = [r["id_reactivo"] for r in reactivos_asignados.data] if reactivos_asignados.data else []
        
        if ids_reactivos:
            reactivos_res = supabase.table("reactivos").select("*").in_("id_reactivo", ids_reactivos).order("numero_oficial").execute()
            reactivos = supabase_to_dict(reactivos_res)
            for r in reactivos:
                r["nombre_dimension"] = obtener_nombre_dimension(r.get("id_dimension"))
            return reactivos
        return []
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error al obtener reactivos del cuestionario: {str(e)}")

# ============================================================================
# ENDPOINT: ESTADO DE EVALUACIONES PARA EMPLEADO
# ============================================================================

@app.get("/api/empleado/evaluaciones/{id_usuario}")
def obtener_evaluaciones_empleado(id_usuario: int):
    try:
        usuario = supabase.table("usuarios").select("id_empresa").eq("id_usuario", id_usuario).execute()
        if not usuario.data:
            return {"cuestionarios_disponibles": 0, "cuestionarios_completados": 0, "cuestionarios": []}
        
        id_empresa = usuario.data[0].get("id_empresa")
        
        cuestionarios = supabase.table("cuestionarios").select("*").eq("id_empresa", id_empresa).eq("activo", True).execute()
        cuestionarios_data = cuestionarios.data if cuestionarios.data else []
        
        completados = supabase.table("evaluaciones_resultados").select("id_cuestionario").eq("id_usuario", id_usuario).eq("estado", "COMPLETADO").execute()
        ids_completados = [c["id_cuestionario"] for c in completados.data] if completados.data else []
        
        resultado = []
        for c in cuestionarios_data:
            estado = "COMPLETADO" if c["id_cuestionario"] in ids_completados else "PENDIENTE"
            resultado.append({
                "id_cuestionario": c["id_cuestionario"],
                "nombre": c["nombre"],
                "tipo_estudio": c["tipo_estudio"],
                "estado": estado
            })
        
        return {
            "cuestionarios_disponibles": len([c for c in resultado if c["estado"] == "PENDIENTE"]),
            "cuestionarios_completados": len([c for c in resultado if c["estado"] == "COMPLETADO"]),
            "cuestionarios": resultado
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error al obtener evaluaciones: {str(e)}")

# ============================================================================
# ENDPOINT: OBTENER CUESTIONARIO PARA EMPLEADO
# ============================================================================

@app.get("/api/empleado/cuestionario/{id_cuestionario}")
def obtener_cuestionario_empleado(id_cuestionario: int, id_usuario: int):
    try:
        completado = supabase.table("evaluaciones_resultados").select("id_resultado").eq("id_cuestionario", id_cuestionario).eq("id_usuario", id_usuario).eq("estado", "COMPLETADO").execute()
        if completado.data:
            raise HTTPException(status_code=400, detail="Ya has completado este cuestionario")
        
        return obtener_cuestionario(id_cuestionario)
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error al obtener cuestionario: {str(e)}")

# ============================================================================
# ENDPOINT: RESPONDER CUESTIONARIO
# ============================================================================

@app.post("/api/responder-cuestionario")
def responder_cuestionario(data: ResponderCuestionario):
    try:
        cuestionario = supabase.table("cuestionarios").select("id_empresa, tipo_estudio").eq("id_cuestionario", data.id_cuestionario).execute()
        if not cuestionario.data:
            raise HTTPException(status_code=404, detail="Cuestionario no encontrado")
        
        cuestionario_data = cuestionario.data[0]
        
        result = supabase.table("evaluaciones_resultados").insert({
            "id_empresa": cuestionario_data["id_empresa"],
            "id_cuestionario": data.id_cuestionario,
            "id_usuario": data.id_usuario,
            "tipo_estudio": cuestionario_data["tipo_estudio"],
            "fecha_aplicacion": datetime.now().isoformat(),
            "estado": "COMPLETADO",
            "origen_captura": "DIGITAL_PWA",
            "anonimo": True
        }).execute()
        
        id_resultado = result.data[0]["id_resultado"] if result.data else None
        
        if not id_resultado:
            raise HTTPException(status_code=500, detail="Error al guardar la evaluación")
        
        for resp in data.respuestas:
            supabase.table("respuestas_detalle").insert({
                "id_resultado": id_resultado,
                "id_reactivo": resp["id_reactivo"],
                "valor_respondido": resp.get("valor_respondido"),
                "texto_abierto": resp.get("texto_abierto")
            }).execute()
        
        return {
            "status": "Éxito", 
            "message": "¡Cuestionario procesado y guardado correctamente!", 
            "id_resultado": id_resultado
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error al guardar las respuestas: {str(e)}")

# ============================================================================
# ✅ ENDPOINT: ESTADO DE EVALUACIONES PARA COORDINADOR (CORREGIDO)
# ============================================================================

@app.get("/api/coordinador/evaluaciones/{id_empresa}")
def obtener_evaluaciones_empresa(id_empresa: int):
    """Obtiene el estado de todas las evaluaciones de una empresa"""
    try:
        # 1. Obtener todos los usuarios de la empresa (solo EMPLEADOS)
        usuarios = supabase.table("usuarios").select("id_usuario, activo")\
            .eq("id_empresa", id_empresa)\
            .eq("rol_usuario", "EMPLEADO")\
            .execute()
        ids_usuarios = [u["id_usuario"] for u in usuarios.data] if usuarios.data else []
        total_empleados = len(ids_usuarios)
        
        # 2. Obtener todos los cuestionarios activos de la empresa
        cuestionarios = supabase.table("cuestionarios").select("*")\
            .eq("id_empresa", id_empresa)\
            .eq("activo", True)\
            .execute()
        cuestionarios_data = cuestionarios.data if cuestionarios.data else []
        total_cuestionarios = len(cuestionarios_data)
        
        # 3. Contar evaluaciones completadas por cuestionario
        resultado = []
        total_completados_general = 0
        
        for c in cuestionarios_data:
            completados = supabase.table("evaluaciones_resultados").select("id_usuario", count="exact")\
                .eq("id_cuestionario", c["id_cuestionario"])\
                .eq("estado", "COMPLETADO")\
                .in_("id_usuario", ids_usuarios if ids_usuarios else [0])\
                .execute()
            
            total_completados = completados.count if hasattr(completados, 'count') else 0
            total_completados_general += total_completados
            
            # Empleados que han completado este cuestionario
            empleados_completaron = supabase.table("evaluaciones_resultados").select("id_usuario")\
                .eq("id_cuestionario", c["id_cuestionario"])\
                .eq("estado", "COMPLETADO")\
                .in_("id_usuario", ids_usuarios if ids_usuarios else [0])\
                .execute()
            empleados_completaron_ids = [e["id_usuario"] for e in empleados_completaron.data] if empleados_completaron.data else []
            
            progreso = round((total_completados / total_empleados) * 100, 2) if total_empleados > 0 else 0
            
            resultado.append({
                "id_cuestionario": c["id_cuestionario"],
                "nombre": c["nombre"],
                "tipo_estudio": c["tipo_estudio"],
                "total_empleados": total_empleados,
                "completados": total_completados,
                "pendientes": total_empleados - total_completados,
                "progreso": progreso,
                "empleados_que_completaron": empleados_completaron_ids
            })
        
        # 4. Calcular métricas agregadas
        total_posibles = total_empleados * total_cuestionarios
        tasa_participacion = round((total_completados_general / total_posibles) * 100, 2) if total_posibles > 0 else 0
        
        # 5. Promedio de evaluaciones por empleado
        promedio_por_empleado = round(total_completados_general / total_empleados, 2) if total_empleados > 0 else 0
        
        return {
            "empresa_id": id_empresa,
            "total_empleados": total_empleados,
            "total_cuestionarios": total_cuestionarios,
            "total_completados": total_completados_general,
            "total_posibles": total_posibles,
            "tasa_participacion": tasa_participacion,
            "promedio_por_empleado": promedio_por_empleado,
            "por_cuestionario": resultado
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error al obtener evaluaciones de la empresa: {str(e)}")

# ============================================================================
# ENDPOINT: VERIFICAR CONEXIÓN
# ============================================================================

@app.get("/api/health")
def health_check():
    return {"status": "OK", "message": "Tándem API está funcionando correctamente"}

@app.get("/")
def root():
    return {
        "message": "Tándem API",
        "version": "1.0.0",
        "endpoints": {
            "/empresas": "GET - Obtener empresas",
            "/api/dimensiones": "GET/POST/PUT/DELETE - CRUD Dimensiones",
            "/api/reactivos": "GET/POST/PUT/DELETE - CRUD Reactivos",
            "/api/escalas": "GET/POST/PUT/DELETE - CRUD Escalas",
            "/api/cuestionarios": "GET/POST/PUT/DELETE - CRUD Cuestionarios",
            "/api/cuestionarios/{id}/reactivos": "GET/POST - Asignar reactivos",
            "/api/empleado/evaluaciones/{id_usuario}": "GET - Estado evaluaciones empleado",
            "/api/coordinador/evaluaciones/{id_empresa}": "GET - Estado evaluaciones empresa",
            "/api/empleado/cuestionario/{id_cuestionario}": "GET - Obtener cuestionario",
            "/api/responder-cuestionario": "POST - Responder cuestionario"
        }
    }

# ============================================================================
# EJECUTAR
# ============================================================================

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=int(os.getenv("PORT", "8000")))
