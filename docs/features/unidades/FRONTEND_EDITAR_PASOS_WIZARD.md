# Guardar ediciones del docente en el wizard de unidad

## Contexto

Cuando el docente edita un paso ya generado (ej: modifica el texto de la situacion significativa, quita un enfoque, cambia una actividad de los propositos), esos cambios deben persistirse en la BD para que los pasos siguientes los tomen en cuenta.

Actualmente el frontend guarda la edicion solo en el store local. Cuando se genera el siguiente paso, el backend lee de la BD y envia la version vieja a Python. Resultado: el paso generado no refleja lo que el docente edito.

---

## Que debe hacer el frontend

Hay **dos mecanismos** (usarlos juntos):

### 1. Auto-save con debounce

Cada vez que el docente edita contenido de un paso, hacer un `PATCH` con debounce de 1-2 segundos. Mostrar indicador tipo "Guardando..." / "Guardado".

```
PATCH /api/unidades/{unidadId}/contenido
Authorization: Bearer {token}
```

**Body**: enviar solo la clave del paso editado. El backend hace shallow merge: reemplaza solo las claves enviadas, las demas quedan intactas.

```json
{
  "contenido": {
    "<clave_del_paso>": { ...objeto completo del paso... }
  }
}
```

**Respuesta**:
```json
{
  "success": true,
  "message": "Contenido de la unidad actualizado",
  "data": { ...unidad completa... }
}
```

### 2. contenidoEditado al generar el siguiente paso

Todos los endpoints de generacion (pasos 2-7) ahora aceptan un campo opcional `contenidoEditado` en el body. Si viene, el backend **guarda primero en BD** y luego genera usando los datos frescos. Esto elimina race conditions si el PATCH del auto-save aun no termino.

```
POST /api/ia-unidad/{unidadId}/evidencias          (paso 2)
POST /api/ia-unidad/{unidadId}/propositos           (paso 3)
POST /api/ia-unidad/{unidadId}/areas-complementarias (paso 4)
POST /api/ia-unidad/{unidadId}/enfoques             (paso 5)
POST /api/ia-unidad/{unidadId}/secuencia            (paso 6)
POST /api/ia-unidad/{unidadId}/materiales           (paso 7)
```

El campo `contenidoEditado` es **opcional**. Si no viene, el backend usa lo que tenga en BD como siempre.

---

## Claves por paso

| Paso | Clave en `contenido` | Campos editables |
|------|----------------------|------------------|
| 1 | `situacionSignificativa` | `situacionSignificativa` (texto), `situacionBase` (objeto) |
| 2 | `evidencias` | `proposito`, `reto`, `productoIntegrador`, `instrumentoEvaluacion` |
| 3 | `propositos` | `areasPropositos[]`, `competenciasTransversales[]` |
| 4 | `areasComplementarias` | `areasComplementarias[]` |
| 5 | `enfoques` | `enfoques[]` |
| 6 | `secuencia` | `hiloConductor`, `semanas[]`, `actividadesExcluidas[]` |
| 7 | `materiales` | `materiales[]` |
| 8 | `reflexiones` | `reflexiones[]` |

---

## Ejemplos concretos

### Docente edita la situacion significativa (auto-save)

```json
PATCH /api/unidades/{unidadId}/contenido

{
  "contenido": {
    "situacionSignificativa": {
      "situacionSignificativa": "En la I.E. 6029 del distrito de Villa Maria, los estudiantes de segundo grado presentan dificultades para reconocer y expresar sus emociones...",
      "situacionBase": {
        "id": "abc123",
        "contexto": "urbano",
        "descripcion": "Convivencia escolar",
        "region": "LIMA",
        "score": 0.85
      }
    }
  }
}
```

### Docente edita evidencias (auto-save)

```json
{
  "contenido": {
    "evidencias": {
      "proposito": "Los estudiantes identifican situaciones que afectan la convivencia...",
      "reto": "Como podemos expresar nuestras emociones sin lastimar a otros?",
      "productoIntegrador": "Ficha Mi Emocionario con dibujos y estrategias",
      "instrumentoEvaluacion": "Lista de cotejo"
    }
  }
}
```

### Docente quita un enfoque (auto-save)

```json
{
  "contenido": {
    "enfoques": {
      "enfoques": [
        {
          "enfoque": "Enfoque de derechos",
          "valor": "Conciencia de derechos",
          "actitudes": "Disposicion a conocer, reconocer y valorar los derechos..."
        }
      ]
    }
  }
}
```

### Docente edita propositos y luego pide generar secuencia

Aqui se usa `contenidoEditado` en el POST de generacion como respaldo:

```json
POST /api/ia-unidad/{unidadId}/secuencia

{
  "unidadId": "abc-123",
  "horario": { "dias": [...] },
  "contenidoEditado": {
    "propositos": {
      "areasPropositos": [
        {
          "area": "Matematica",
          "competencias": [
            {
              "nombre": "Resuelve problemas de cantidad",
              "capacidades": ["Traduce cantidades a expresiones numericas"],
              "estandar": "...",
              "criterios": ["Criterio editado..."],
              "actividades": ["Actividad editada..."],
              "instrumento": "Lista de cotejo"
            }
          ]
        }
      ],
      "competenciasTransversales": [...]
    },
    "enfoques": {
      "enfoques": [
        {
          "enfoque": "Enfoque de derechos",
          "valor": "Conciencia de derechos",
          "actitudes": "..."
        }
      ]
    }
  }
}
```

### Docente edita areas complementarias y luego genera secuencia

```json
POST /api/ia-unidad/{unidadId}/secuencia

{
  "unidadId": "abc-123",
  "contenidoEditado": {
    "areasComplementarias": {
      "areasComplementarias": [
        {
          "area": "Tutoria",
          "competenciaRelacionada": "Construye su identidad",
          "dimension": "Personal",
          "actividades": ["Actividad editada de tutoria..."]
        }
      ]
    }
  }
}
```

---

## Flujo recomendado

```
Docente edita texto en el UI
        |
        v
Store local se actualiza (inmediato)
        |
        v
Debounce 1.5s --> PATCH /api/unidades/{id}/contenido
        |              |
        |              v
        |         BD actualizada
        |         Mostrar "Guardado"
        |
        v
Docente pulsa "Generar siguiente paso"
        |
        v
POST /api/ia-unidad/{id}/{paso}
  body: { ...campos normales, contenidoEditado: { ...pasos editados } }
        |
        v
Backend guarda contenidoEditado en BD (por si PATCH no llego)
        |
        v
Backend lee contenido fresco y genera con Python
        |
        v
Resultado guardado en BD y devuelto al frontend
```

---

## Reglas importantes

1. **Siempre enviar el objeto completo del paso**, no solo el campo editado. Ej: si el docente edita solo el `reto` de evidencias, enviar todo el objeto `evidencias` con `proposito`, `reto`, `productoIntegrador` e `instrumentoEvaluacion`.

2. **`contenidoEditado` es opcional** en los POST de generacion. Si no hay ediciones pendientes, no enviarlo.

3. **Se pueden enviar multiples pasos** en un solo PATCH o en un solo `contenidoEditado`:
   ```json
   {
     "contenido": {
       "situacionSignificativa": { ... },
       "enfoques": { ... }
     }
   }
   ```

4. **No afecta el flujo normal**. Si el docente no edita nada, todo funciona igual que antes.
