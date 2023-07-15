# Intersecciones de vías a partir de Líneas

En este tutorial vamos a generar puntos en cada intersección de vía manteniendo los atributos de ambos segementos de vía

**Paso 1**. Identificar el tipo de geometría de nuestra capa de calles.
```sql
SELECT st_geometrytype(geom) 
FROM data.ejes_viales LIMIT 1;
```

**Paso 2**. Si la geometría es Multiparte, es necesario convertirla a sencilla utilizando ST_Dump.

```sql
SELECT ST_GeometryType(
                        (ST_Dump(geom)).geom
                        )
FROM data.ejes_viales LIMIT 1;
```

**Paso 3**. Realizar la intersección de calles

Resultado

```sql
DROP TABLE IF EXISTS data.interseccion_ejes_viales;

CREATE TABLE data.interseccion_ejes_viales AS
WITH st AS (
        SELECT cod_via, tip_via, nom_via, (ST_Dump(geom)).geom
        FROM data.ejes_viales ORDER BY nom_via
       ),
     st_int AS (
        SELECT a.cod_via, a.tip_via, a.nom_via,
               b.cod_via as cod_via_int,
               b.tip_via as tip_via_int,
               b.nom_via as nom_via_int,
               ST_Intersection(a.geom, b.geom) as geom
         FROM st as a, st as b
         WHERE ST_Intersects(a.geom, b.geom) AND
               NOT ST_Equals(a.geom, b.geom)
     ),
    st_int_unique AS (
         SELECT distinct on(geom) geom,
                cod_via, tip_via, nom_via,
                cod_via_int, tip_via_int, nom_via_int
         FROM st_int 
         WHERE ST_GeometryType(geom) = 'ST_Point'
     )
     SELECT * FROM st_int_unique;
```

