import os
from fastapi import APIRouter, Query, HTTPException
from typing import Dict, List, Any, Optional
from supabase import create_client, Client
import math
from datetime import datetime

# ============================================================================
# CONFIGURACIÓN DE SUPABASE
# ============================================================================
SUPABASE_URL = os.getenv("SUPABASE_URL")
SUPABASE_KEY = os.getenv("SUPABASE_KEY")

if not SUPABASE_URL or not SUPABASE_KEY:
    raise RuntimeError("SUPABASE_URL y SUPABASE_KEY deben estar configuradas")

supabase: Client = create_client(SUPABASE_URL, SUPABASE_KEY)

router = APIRouter()

# ============================================================================
# FUNCIONES DE AYUDA
# ============================================================================
def calcular_semaforo_nom035(puntaje: int) -> Dict[str, str]:
    if puntaje is None:
        return {"nivel": "Sin datos", "color": "#CCCCCC", "descripcion": "No hay puntaje"}
    
    if puntaje < 20:
        return {"nivel": "Nulo", "color": "#00E676", "descripcion": "Sin riesgo aparente"}
    elif puntaje < 45:
        return {"nivel": "Bajo", "color": "#AEEA00", "descripcion": "Riesgo bajo, requiere seguimiento"}
    elif puntaje < 70:
        return {"nivel": "Medio", "color": "#FFD600", "descripcion": "Riesgo medio, requiere acciones preventivas"}
    elif puntaje < 90:
        return {"nivel": "Alto", "color": "#FF6D00", "descripcion": "Riesgo alto, requiere intervención inmediata"}
    else:
        return {"nivel": "Muy Alto", "color": "#D50000", "descripcion": "Riesgo muy alto, requiere atención urgente"}

def supabase_to_dict(result):
    if hasattr(result, 'data'):
        return result.data
    return result

# ============================================================================
# ENDPOINT 1: OBTENER CUESTIONARIOS PARA REPORTES
# ============================================================================
@router.get("/api/reportes/cuestionarios")
def obtener_cuestionarios_reportes(
    id_empresa: Optional[int] = Query(None, description="ID de la empresa (opcional)")
):
    try:
        query = supabase.table("cuestionarios").select("*")
        
        if id_empresa:
            query = query.eq("id_empresa", id_empresa)
        
        query = query.eq("activo", True).order("fecha_creacion", desc=True)
        result = query.execute()
        cuestionarios = supabase_to_dict(result)
        
        for c in cuestionarios:
            count = supabase.table("evaluaciones_resultados").select("id_resultado", count="exact")\
                .eq("id_cuestionario", c["id_cuestionario"])\
                .eq("estado", "COMPLETADO")\
                .execute()
            c["total_respuestas"] = count.count if hasattr(count, 'count') else 0
            
            empresa = supabase.table("empresas").select("nom_empresa").eq("id_empresa", c["id_empresa"]).execute()
            c["nom_empresa"] = empresa.data[0]["nom_empresa"] if empresa.data else "Sin empresa"
        
        return cuestionarios
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error al obtener cuestionarios: {str(e)}")

# ============================================================================
# ENDPOINT 2: DASHBOARD POR CUESTIONARIO
# ============================================================================
@router.get("/api/reportes/dashboard-cuestionario")
def obtener_dashboard_cuestionario(
    id_cuestionario: int = Query(..., description="ID del cuestionario")
):
    try:
        print(f"📊 Dashboard para cuestionario: {id_cuestionario}")
        
        # 1. Obtener información del cuestionario
        cuestionario_res = supabase.table("cuestionarios").select("*").eq("id_cuestionario", id_cuestionario).execute()
        if not cuestionario_res.data:
            raise HTTPException(status_code=404, detail="Cuestionario no encontrado")
        
        cuestionario = cuestionario_res.data[0]
        
        # 2. Obtener evaluaciones completadas
        evaluaciones_res = supabase.table("evaluaciones_resultados").select("*")\
            .eq("id_cuestionario", id_cuestionario)\
            .eq("estado", "COMPLETADO")\
            .execute()
        
        evaluaciones = evaluaciones_res.data if evaluaciones_res.data else []
        print(f"✅ Evaluaciones: {len(evaluaciones)}")
        
        # 3. Obtener reactivos del cuestionario
        reactivos_asignados = supabase.table("cuestionarios_reactivos").select("id_reactivo")\
            .eq("id_cuestionario", id_cuestionario).execute()
        ids_reactivos = [r["id_reactivo"] for r in reactivos_asignados.data] if reactivos_asignados.data else []
        
        # 4. Obtener todos los reactivos
        if ids_reactivos:
            reactivos_res = supabase.table("reactivos").select("*").in_("id_reactivo", ids_reactivos).execute()
            reactivos_dict = {r["id_reactivo"]: r for r in reactivos_res.data} if reactivos_res.data else {}
        else:
            reactivos_dict = {}
        
        # 5. Obtener dimensiones
        dimensiones_res = supabase.table("dimensiones").select("*").execute()
        dimensiones_dict = {d["id_dimension"]: d for d in dimensiones_res.data} if dimensiones_res.data else {}
        
        # Si no hay evaluaciones
        if not evaluaciones:
            return {
                "cuestionario": cuestionario,
                "total_encuestas": 0,
                "promedio_general": None,
                "puntaje_maximo": None,
                "puntaje_minimo": None,
                "semaforo_global": {"nivel": "Sin datos", "color": "#CCCCCC", "descripcion": "No hay respuestas"},
                "distribucion_riesgo": {},
                "distribucion_riesgo_porcentual": {},
                "resumen_dimensiones": [],
                "frecuencias_preguntas": []
            }
        
        # 6. Calcular métricas generales
        total_encuestas = len(evaluaciones)
        
        # ✅ Filtrar puntajes no nulos
        puntajes = []
        for e in evaluaciones:
            pt = e.get("puntaje_total")
            if pt is not None:
                puntajes.append(pt)
        
        if puntajes:
            suma_puntajes = sum(puntajes)
            promedio_general = round(suma_puntajes / len(puntajes), 2)
            puntaje_maximo = max(puntajes)
            puntaje_minimo = min(puntajes)
        else:
            promedio_general = None
            puntaje_maximo = None
            puntaje_minimo = None
        
        # ✅ Si no hay puntajes, mostrar "Sin datos"
        if promedio_general is None:
            semaforo_global = {"nivel": "Sin datos", "color": "#CCCCCC", "descripcion": "No hay puntajes"}
        else:
            semaforo_global = calcular_semaforo_nom035(int(promedio_general))
        
        # 7. Distribución de riesgos
        distribucion = {}
        for eval in evaluaciones:
            nivel = eval.get("nivel_riesgo")
            if not nivel:
                puntaje = eval.get("puntaje_total")
                if puntaje is not None:
                    nivel = calcular_semaforo_nom035(puntaje)["nivel"]
                else:
                    nivel = "Sin datos"
            distribucion[nivel] = distribucion.get(nivel, 0) + 1
        
        distribucion_porcentual = {}
        for nivel, count in distribucion.items():
            distribucion_porcentual[nivel] = round((count / total_encuestas) * 100, 2)
        
        # 8. Resumen por dimensiones
        resumen_dimensiones = []
        for id_dim, dim in dimensiones_dict.items():
            reactivos_dim = [r_id for r_id, r in reactivos_dict.items() if r.get("id_dimension") == id_dim]
            
            if reactivos_dim:
                ids_resultados = [e["id_resultado"] for e in evaluaciones]
                respuestas_res = supabase.table("respuestas_detalle").select("valor_respondido")\
                    .in_("id_reactivo", reactivos_dim)\
                    .in_("id_resultado", ids_resultados)\
                    .execute()
                
                valores = [r["valor_respondido"] for r in respuestas_res.data if r.get("valor_respondido") is not None]
                if valores:
                    promedio_dim = round(sum(valores) / len(valores), 2)
                    puntaje_escala = int((promedio_dim / 4) * 100)
                    semaforo = calcular_semaforo_nom035(puntaje_escala)
                    resumen_dimensiones.append({
                        "id_dimension": id_dim,
                        "nombre_dimension": dim["nombre_dimension"],
                        "promedio": promedio_dim,
                        "total_respuestas": len(valores),
                        "semaforo": semaforo
                    })
        
        # 9. Frecuencias por pregunta
        frecuencias_preguntas = []
        for id_reactivo, r_data in reactivos_dict.items():
            ids_resultados = [e["id_resultado"] for e in evaluaciones]
            respuestas_res = supabase.table("respuestas_detalle").select("valor_respondido")\
                .eq("id_reactivo", id_reactivo)\
                .in_("id_resultado", ids_resultados)\
                .execute()
            
            valores = [r["valor_respondido"] for r in respuestas_res.data if r.get("valor_respondido") is not None]
            if valores:
                frecuencias = {0: 0, 1: 0, 2: 0, 3: 0, 4: 0}
                for v in valores:
                    if v in frecuencias:
                        frecuencias[v] += 1
                
                porcentajes = {}
                for k, v in frecuencias.items():
                    porcentajes[k] = round((v / len(valores)) * 100, 2)
                
                promedio = round(sum(valores) / len(valores), 2)
                dimension_nombre = dimensiones_dict.get(r_data.get("id_dimension"), {}).get("nombre_dimension", "Sin dimensión")
                
                frecuencias_preguntas.append({
                    "id_reactivo": id_reactivo,
                    "texto": r_data["texto_reactivo"],
                    "dimension": dimension_nombre,
                    "frecuencias": frecuencias,
                    "porcentajes": porcentajes,
                    "total_respuestas": len(valores),
                    "promedio": promedio
                })
        
        return {
            "cuestionario": cuestionario,
            "total_encuestas": total_encuestas,
            "promedio_general": promedio_general,
            "puntaje_maximo": puntaje_maximo,
            "puntaje_minimo": puntaje_minimo,
            "semaforo_global": semaforo_global,
            "distribucion_riesgo": distribucion,
            "distribucion_riesgo_porcentual": distribucion_porcentual,
            "resumen_dimensiones": resumen_dimensiones,
            "frecuencias_preguntas": frecuencias_preguntas
        }
    except Exception as e:
        print(f"❌ Error: {str(e)}")
        import traceback
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=f"Error al generar dashboard: {str(e)}")

# ============================================================================
# ENDPOINT 3: EXPORTAR REPORTE A CSV
# ============================================================================
@router.get("/api/reportes/exportar-cuestionario")
def exportar_reporte_cuestionario(
    id_cuestionario: int = Query(..., description="ID del cuestionario")
):
    try:
        evaluaciones = supabase.table("evaluaciones_resultados").select("*")\
            .eq("id_cuestionario", id_cuestionario)\
            .eq("estado", "COMPLETADO")\
            .execute()
        
        if not evaluaciones.data:
            raise HTTPException(status_code=404, detail="No hay respuestas para este cuestionario")
        
        reactivos_asignados = supabase.table("cuestionarios_reactivos").select("id_reactivo")\
            .eq("id_cuestionario", id_cuestionario).execute()
        ids_reactivos = [r["id_reactivo"] for r in reactivos_asignados.data] if reactivos_asignados.data else []
        
        import csv
        import io
        
        output = io.StringIO()
        writer = csv.writer(output)
        
        headers = ["ID_Resultado", "Fecha", "Area", "Puesto", "Antiguedad", "Puntaje_Total", "Nivel_Riesgo"]
        for id_r in ids_reactivos:
            reactivo = supabase.table("reactivos").select("texto_reactivo").eq("id_reactivo", id_r).execute()
            texto = reactivo.data[0]["texto_reactivo"][:50] + "..." if reactivo.data and len(reactivo.data[0]["texto_reactivo"]) > 50 else reactivo.data[0]["texto_reactivo"] if reactivo.data else f"Pregunta_{id_r}"
            headers.append(f"Q{id_r}: {texto}")
        
        writer.writerow(headers)
        
        for eval in evaluaciones.data:
            row = [
                eval["id_resultado"],
                eval["fecha_aplicacion"],
                eval.get("area_trabaja", ""),
                eval.get("puesto_ocupa", ""),
                eval.get("antiguedad", ""),
                eval.get("puntaje_total") or "NULL",
                eval.get("nivel_riesgo") or "Sin datos"
            ]
            
            respuestas = supabase.table("respuestas_detalle").select("id_reactivo, valor_respondido")\
                .eq("id_resultado", eval["id_resultado"])\
                .execute()
            
            respuestas_dict = {r["id_reactivo"]: r.get("valor_respondido") for r in respuestas.data}
            
            for id_r in ids_reactivos:
                row.append(respuestas_dict.get(id_r, ""))
            
            writer.writerow(row)
        
        return {
            "status": "success",
            "csv_data": output.getvalue(),
            "filename": f"reporte_cuestionario_{id_cuestionario}_{datetime.now().strftime('%Y%m%d')}.csv"
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error al exportar: {str(e)}")

# ============================================================================
# ENDPOINT: VERIFICAR CONEXIÓN
# ============================================================================

@router.get("/api/reportes/health")
def health_check():
    return {"status": "OK", "message": "Reportes API está funcionando correctamente"}
