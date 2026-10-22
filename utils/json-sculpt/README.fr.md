# JSON Sculpt

Moteur de transformation de données déclaratif pour mapper les réponses API aux modèles métier.

## Référence rapide

```javascript
import { sculpt } from '../../utils/json-sculpt/sculpt';

const schema = {
  id: '@link.user_id',                    // Extraire un champ
  name: '@link.display_name::string',     // Extraire + convertir
  fullName: (data) => `${data.first} ${data.last}`, // Fonction personnalisée
};

const result = sculpt.data({ data: rawObject, to: schema });
```

## Fiche de syntaxe

| Syntaxe | Exemple | Fonction |
|--------|---------|-------------|
| `@link.path` | `'@link.user.name'` | Extraire une valeur imbriquée |
| `@link.path::type` | `'@link.count::number'` | Extraire + conversion de type |
| `(data) => value` | `(d) => d.a + d.b` | Fonction de transformation personnalisée |
| `[paths...]` | `['@link.a', '@link.b', 'default']` | Résolution de repli |
| `{ $map, $transform }` | Voir guide | Mapper un tableau |
| `{ $map, $spread }` | Voir guide | Aplatir un tableau en objet |
| `{ $recursive }` | Voir guide | Traitement récursif d'arbre |
| `{ $op, $from, $args }` | Voir guide | Opérateur intégré |

## Voir aussi

- [JSON Sculpt Guide](../../docs/07-json-sculpt-guide.md) — documentation complète avec exemples
- [Example Schemas](../mappers/README.md) — exemples de schémas en pratique
