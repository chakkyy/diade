import Chip, { type VarianteChip } from "@/components/Chip";
import { ETIQUETAS_CATEGORIA } from "@/lib/buscar";
import type { Categoria } from "@/types/celebracion";

export default function CategoriaChip({
  categoria,
  variante = "neutral",
}: {
  categoria: Categoria;
  variante?: VarianteChip;
}) {
  return (
    <Chip variante={variante} titulo={`Categoría: ${ETIQUETAS_CATEGORIA[categoria]}`}>
      {ETIQUETAS_CATEGORIA[categoria]}
    </Chip>
  );
}
